const phonePattern = /^\+?[0-9]{10,15}$/;
const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
const registerNumberPattern = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const supportedYears = new Set(["I", "II", "III"]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidEmail(value) {
  if (typeof value !== "string" || value.trim().length > 254) return false;
  const parts = value.trim().split("@");
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  if (
    localPart.length < 1 ||
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(localPart)
  ) return false;
  const labels = domain.split(".");
  return labels.length >= 2 &&
    labels[labels.length - 1].length >= 2 &&
    labels.every((label) =>
      label.length <= 63 &&
      /^[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/i.test(label)
    );
}

function validateStudentRegistration(body) {
  if (!isRecord(body)) return { error: "Registration details are required." };
  const allowedFields = new Set([
    "name",
    "registerNumber",
    "email",
    "phone",
    "department",
    "year",
    "password"
  ]);
  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    return { error: "Registration contains unsupported fields." };
  }

  const {
    name,
    registerNumber,
    email,
    phone,
    department,
    year,
    password
  } = body;

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100 ||
    !namePattern.test(name.trim())
  ) return { error: "Enter a valid name between 2 and 100 characters." };
  if (
    typeof registerNumber !== "string" ||
    !registerNumber.trim() ||
    registerNumber.trim().length > 30 ||
    !registerNumberPattern.test(registerNumber.trim())
  ) return { error: "Enter a valid register number." };
  if (!isValidEmail(email)) return { error: "Please provide a valid email address." };
  if (
    typeof phone !== "string" ||
    !phonePattern.test(phone.trim())
  ) return { error: "Please provide a valid phone number." };
  if (
    typeof department !== "string" ||
    !department.trim() ||
    department.trim().length > 120
  ) return { error: "Enter a valid department." };
  if (!supportedYears.has(year)) return { error: "Year must be I, II, or III." };
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 72 ||
    Buffer.byteLength(password, "utf8") > 72
  ) return { error: "Password must be 12 to 72 characters and no more than 72 bytes." };

  return {
    value: {
      name: name.trim(),
      registerNumber: registerNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department: department.trim(),
      year,
      password
    }
  };
}

module.exports = {
  isRecord,
  isValidEmail,
  namePattern,
  phonePattern,
  registerNumberPattern,
  supportedYears,
  validateStudentRegistration
};
