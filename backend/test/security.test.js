const { randomBytes } = require("node:crypto");
const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const suppliedTestUri = process.env.MONGO_TEST_URI;
if (!suppliedTestUri) {
  throw new Error("Set MONGO_TEST_URI to a MongoDB test-server URI before running backend tests.");
}

const testUrl = new URL(suppliedTestUri);
const testDatabase = `scms_phase9_test_${process.pid}_${randomBytes(5).toString("hex")}`;
testUrl.pathname = `/${testDatabase}`;
process.env.MONGO_URI = testUrl.toString();
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = randomBytes(48).toString("hex");
process.env.JWT_EXPIRES_IN = "1h";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.ADMIN_EMAIL = "phase9-admin@example.test";

const mongoose = require("mongoose");
const Student = require("../models/Student");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const LearningResource = require("../models/LearningResource");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");
const { app, server } = require("../server");

let admin;
let otherAdmin;
let student;
let otherStudent;
let serverUrl;
let requestNumber = 0;
const studentPassword = "Phase9StudentPassword1";

function tokenFor(user, options = {}) {
  return jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
    ...options
  });
}

async function api(path, { token, method = "GET", body, headers = {} } = {}) {
  return fetch(`${serverUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-Forwarded-For": `198.51.100.${(requestNumber++ % 240) + 1}`,
      ...headers
    },
    ...(body === undefined ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) })
  });
}

function registration(overrides = {}) {
  return {
    name: "Test Student",
    registerNumber: "PHASE9-001",
    email: "phase9-student@example.test",
    phone: "+14155550123",
    department: "Computer Science",
    year: "II",
    password: studentPassword,
    ...overrides
  };
}

function uniqueMessageId(index) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    Student.init(),
    Course.init(),
    Enrollment.init(),
    Message.init(),
    Notification.init(),
    LearningResource.init(),
    LearningProgress.init(),
    Certificate.init()
  ]);
  const passwordHash = await bcrypt.hash("Phase9AdminPassword1", 12);
  [admin, otherAdmin, student, otherStudent] = await Student.create([
    {
      name: "Phase Nine Admin",
      email: process.env.ADMIN_EMAIL,
      passwordHash,
      role: "admin"
    },
    {
      name: "Other Admin",
      email: "phase9-other-admin@example.test",
      passwordHash,
      role: "admin"
    },
    {
      ...registration({
        name: "Existing Student",
        registerNumber: "PHASE9-EXISTING",
        email: "phase9-existing@example.test",
        password: undefined
      }),
      passwordHash: await bcrypt.hash(studentPassword, 12),
      role: "student"
    },
    {
      ...registration({
        name: "Other Student",
        registerNumber: "PHASE9-OTHER",
        email: "phase9-other@example.test",
        password: undefined
      }),
      passwordHash: await bcrypt.hash(studentPassword, 12),
      role: "student"
    }
  ]);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  serverUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState) {
    if (mongoose.connection.name !== testDatabase || !testDatabase.startsWith("scms_phase9_test_")) {
      throw new Error("Refusing to clean up a database outside the isolated Phase 9 test database.");
    }
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

test("Phase 9 validation, authentication, authorization, and data-isolation integration", async (t) => {
  const adminToken = tokenFor(admin);
  const otherAdminToken = tokenFor(otherAdmin);
  const studentToken = tokenFor(student);
  const otherStudentToken = tokenFor(otherStudent);
  app.set("trust proxy", 1);

  await t.test("rejects malformed, empty, and oversized registration payloads", async () => {
    for (const body of [undefined, null, {}, [], "null"]) {
      const response = await api("/api/v1/auth/register", { method: "POST", body });
      assert.equal(response.status, 400);
    }
    const oversized = await api("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ padding: "x".repeat(1_100_000) }),
      headers: { "Content-Type": "application/json" }
    });
    assert.equal(oversized.status, 413);
  });

  await t.test("enforces registration field formats and role allowlisting", async () => {
    const invalidPayloads = [
      registration({ email: "not-an-email" }),
      registration({ phone: "call-me" }),
      registration({ password: "short" }),
      registration({ name: 7 }),
      registration({ registerNumber: "invalid register number" }),
      registration({ year: "IV" }),
      registration({ role: "admin" })
    ];
    for (const body of invalidPayloads) {
      const response = await api("/api/v1/auth/register", { method: "POST", body });
      assert.equal(response.status, 400);
    }

    const validResponse = await api("/api/v1/auth/register", {
      method: "POST",
      body: registration()
    });
    assert.equal(validResponse.status, 201);
    const responseBody = await validResponse.json();
    assert.equal(responseBody.data.role, "student");
    assert.equal(Object.hasOwn(responseBody.data, "passwordHash"), false);
    const savedStudent = await Student.findOne({ email: registration().email }).select("+passwordHash");
    assert.notEqual(savedStudent.passwordHash, studentPassword);
    assert.equal(await bcrypt.compare(studentPassword, savedStudent.passwordHash), true);

    const duplicateEmail = await api("/api/v1/auth/register", {
      method: "POST",
      body: registration({ registerNumber: "PHASE9-DUP-EMAIL" })
    });
    assert.equal(duplicateEmail.status, 409);
    assert.match((await duplicateEmail.json()).message, /email/i);

    const duplicateRegisterNumber = await api("/api/v1/auth/register", {
      method: "POST",
      body: registration({ email: "phase9-duplicate-number@example.test" })
    });
    assert.equal(duplicateRegisterNumber.status, 409);
    assert.match((await duplicateRegisterNumber.json()).message, /register number/i);
  });

  await t.test("compares login passwords, returns safe profiles, and rejects invalid credentials", async () => {
    const invalid = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email: "phase9-missing@example.test", password: studentPassword }
    });
    assert.equal(invalid.status, 401);
    assert.equal((await invalid.json()).message, "Invalid email or password");

    const loggedIn = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email: student.email, password: studentPassword }
    });
    assert.equal(loggedIn.status, 200);
    const loginBody = await loggedIn.json();
    assert.ok(loginBody.token);
    assert.equal(Object.hasOwn(loginBody.data, "passwordHash"), false);
    assert.ok(jwt.decode(loginBody.token).exp > Math.floor(Date.now() / 1000));
  });

  await t.test("rejects missing, invalid, expired, and tampered JWTs", async () => {
    assert.equal((await api("/api/v1/profile")).status, 401);
    assert.equal((await api("/api/v1/profile", { token: "not-a-token" })).status, 401);
    assert.equal((await api("/api/v1/profile", {
      token: tokenFor(student, { expiresIn: -1 })
    })).status, 401);
    const tampered = `${studentToken.slice(0, -1)}${studentToken.endsWith("a") ? "b" : "a"}`;
    assert.equal((await api("/api/v1/profile", { token: tampered })).status, 401);
    assert.equal((await api("/api/v1/students", { token: studentToken })).status, 403);
    assert.equal((await api("/api/v1/enrollments/mine", { token: adminToken })).status, 403);
    assert.equal((await api("/api/v1/students", { token: adminToken })).status, 200);
  });

  await t.test("prevents profile mass assignment and cross-account profile changes", async () => {
    const profileBefore = await Student.findById(student._id).lean();
    const forbiddenUpdate = await api("/api/v1/profile", {
      token: studentToken,
      method: "PUT",
      body: { name: "Hijacked Name", role: "admin", email: "attacker@example.test" }
    });
    assert.equal(forbiddenUpdate.status, 400);
    const profileAfter = await Student.findById(student._id).lean();
    assert.equal(profileAfter.name, profileBefore.name);
    assert.equal(profileAfter.role, "student");
    assert.equal(profileAfter.email, profileBefore.email);
  });

  await t.test("validates course writes and denies student course modification", async () => {
    assert.equal((await api("/api/v1/courses/not-an-object-id")).status, 400);
    const createdResponse = await api("/api/v1/courses", {
      token: adminToken,
      method: "POST",
      body: {
        courseName: "Phase Nine Course",
        courseCode: "PHASE9-COURSE",
        duration: "4 weeks",
        category: "Security",
        overview: "Isolated test course",
        videoUrl: "javascript:alert(1)"
      }
    });
    assert.equal(createdResponse.status, 400);

    const createValid = await api("/api/v1/courses", {
      token: adminToken,
      method: "POST",
      body: {
        courseName: "Phase Nine Course",
        courseCode: "PHASE9-COURSE",
        duration: "4 weeks",
        category: "Security",
        overview: "Isolated test course",
        materials: []
      }
    });
    assert.equal(createValid.status, 201);
    const course = (await createValid.json()).data;
    const studentWrite = await api(`/api/v1/courses/${course._id || course.id}`, {
      token: studentToken,
      method: "PUT",
      body: { courseName: "Unauthorized Change" }
    });
    assert.equal(studentWrite.status, 403);
    const massAssignment = await api(`/api/v1/courses/${course._id || course.id}`, {
      token: adminToken,
      method: "PUT",
      body: { status: "Active", role: "admin" }
    });
    assert.equal(massAssignment.status, 400);
    return course;
  });

  await t.test("scopes enrollments and resources to the JWT student", async () => {
    const course = await Course.findOne({ courseCode: "PHASE9-COURSE" });
    const invalidId = await api("/api/v1/students/invalid", { token: adminToken });
    assert.equal(invalidId.status, 400);

    const firstEnrollment = await api("/api/v1/enrollments", {
      token: studentToken,
      method: "POST",
      body: { courseId: String(course._id), student: String(otherStudent._id) }
    });
    assert.equal(firstEnrollment.status, 400);
    const enrolled = await api("/api/v1/enrollments", {
      token: studentToken,
      method: "POST",
      body: { courseId: String(course._id) }
    });
    assert.equal(enrolled.status, 201);
    const duplicate = await api("/api/v1/enrollments", {
      token: studentToken,
      method: "POST",
      body: { courseId: String(course._id) }
    });
    assert.equal(duplicate.status, 409);

    const unsafeResource = await api(`/api/v1/resources/courses/${course._id}`, {
      token: adminToken,
      method: "POST",
      body: {
        title: "Bad path",
        description: "Test",
        type: "Document",
        fileReference: "..\\private\\secret"
      }
    });
    assert.equal(unsafeResource.status, 400);
    const createdResource = await api(`/api/v1/resources/courses/${course._id}`, {
      token: adminToken,
      method: "POST",
      body: {
        title: "Phase Nine Resource",
        description: "Test resource",
        type: "Link",
        url: "https://example.test/lesson"
      }
    });
    assert.equal(createdResource.status, 201);

    const deniedResources = await api(`/api/v1/resources/courses/${course._id}`, {
      token: otherStudentToken
    });
    assert.equal(deniedResources.status, 403);
    const studentCannotCreateResource = await api(`/api/v1/resources/courses/${course._id}`, {
      token: studentToken,
      method: "POST",
      body: { title: "Forbidden", description: "Forbidden", type: "Reading" }
    });
    assert.equal(studentCannotCreateResource.status, 403);

    await LearningProgress.create({
      student: otherStudent._id,
      course: course._id,
      completedResources: [(await createdResource.json()).resource._id]
    });
    assert.equal(
      (await api("/api/v1/progress/mine", { token: studentToken }).then((response) => response.json())).progress.length,
      0
    );
    assert.equal((await api("/api/v1/progress/mine", { token: adminToken })).status, 403);
  });

  await t.test("isolates chat, validates messages, and rejects unauthorized admin operations", async () => {
    const invalidMessage = await api("/api/v1/messages/conversation", {
      token: studentToken,
      method: "POST",
      body: { text: " ", clientMessageId: uniqueMessageId(1), sender: String(otherStudent._id) }
    });
    assert.equal(invalidMessage.status, 400);

    const send = await api("/api/v1/messages/conversation", {
      token: studentToken,
      method: "POST",
      body: {
        text: "Phase 9 isolated message",
        clientMessageId: uniqueMessageId(2),
        sender: String(otherStudent._id),
        recipient: String(otherStudent._id)
      }
    });
    assert.equal(send.status, 201);
    const savedMessage = await Message.findOne({ text: "Phase 9 isolated message" }).lean();
    assert.equal(String(savedMessage.sender), String(student._id));
    assert.equal(String(savedMessage.recipient), String(admin._id));

    const ownHistory = await api("/api/v1/messages/conversation", { token: studentToken });
    assert.equal((await ownHistory.json()).messages.length, 1);
    const otherHistory = await api("/api/v1/messages/conversation", { token: otherStudentToken });
    assert.equal((await otherHistory.json()).messages.length, 0);
    assert.equal((await api("/api/v1/messages/conversations", { token: otherAdminToken })).status, 403);
    assert.equal((await api("/api/v1/messages/conversations", { token: studentToken })).status, 403);
    assert.equal((await api(`/api/v1/messages/conversations/${student._id}`, {
      token: studentToken
    })).status, 403);
    assert.equal((await api(`/api/v1/messages/conversations/${student._id}`, {
      token: otherAdminToken
    })).status, 403);

    const course = await Course.findOne({ courseCode: "PHASE9-COURSE" });
    const otherCertificate = await Certificate.create({
      student: otherStudent._id,
      course: course._id,
      certificateCode: "SCMS-PHASE9-OTHER"
    });
    assert.equal((await api(`/api/v1/certificates/${otherCertificate._id}`, {
      token: studentToken
    })).status, 404);
    assert.equal((await api(`/api/v1/certificates/${otherCertificate._id}`, {
      token: adminToken
    })).status, 200);

    const otherNotification = await Notification.create({
      recipient: otherStudent._id,
      message: "Private test notification"
    });
    const studentNotifications = await api("/api/v1/notifications", { token: studentToken });
    assert.deepEqual((await studentNotifications.json()).notifications, []);
    assert.equal((await api(`/api/v1/notifications/${otherNotification._id}/read`, {
      token: studentToken,
      method: "PATCH"
    })).status, 404);
  });

  await t.test("rate limits authenticated sends and returns safe parser/CORS errors", async () => {
    const attempts = await Promise.all(Array.from({ length: 12 }, (_, index) =>
      api("/api/v1/messages/conversation", {
        token: studentToken,
        method: "POST",
        body: { text: `Rate test ${index}`, clientMessageId: uniqueMessageId(index + 20) }
      })
    ));
    assert.ok(attempts.some((response) => response.status === 429));

    const registrationAttempts = await Promise.all(Array.from({ length: 12 }, () =>
      api("/api/v1/auth/register", {
        method: "POST",
        body: {},
        headers: { "X-Forwarded-For": "198.51.100.250" }
      })
    ));
    assert.ok(registrationAttempts.some((response) => response.status === 429));

    const malformedJson = await api("/api/v1/auth/register", {
      method: "POST",
      body: '{"email":',
      headers: { "Content-Type": "application/json" }
    });
    assert.equal(malformedJson.status, 400);
    assert.equal((await malformedJson.json()).message, "Malformed JSON request body");

    const deniedOrigin = await api("/api/health", {
      headers: { Origin: "https://not-allowed.example" }
    });
    assert.equal(deniedOrigin.status, 403);
  });
});
