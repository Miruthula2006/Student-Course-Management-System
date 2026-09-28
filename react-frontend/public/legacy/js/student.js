import {
    getElement,
    loadData,
    saveData,
    isEmpty,
    isValidEmail,
    showError,
    showSuccess,
    clearMessage,
    getLoggedInUser,
    showNotification,
    generateId,
    getCurrentDate,
    getCurrentTime
} from "./main.js";


/* =====================================================
   DOM CONTENT LOADED
===================================================== */

window.addEventListener(
    "legacyScriptLoaded",
    initializeStudentModule
);


/* =====================================================
   INITIALIZE STUDENT MODULE
===================================================== */

function initializeStudentModule() {

    loadStudentProfile();

    displayAvailableCourses();

    initializeCourseSearch();

    updateDashboardStatistics();

    displayMyCourses();

    displayProgress();

    displayNotifications();

    displayRecentActivity();

    displayStudentSummary();

    initializeProfileForm();

}


/* =====================================================
   DISPATCH DATA CHANGE EVENT
===================================================== */

function notifyStudentDataChanged() {

    window.dispatchEvent(
        new CustomEvent("studentDataChanged")
    );

}


/* =====================================================
   LOAD STUDENT PROFILE
===================================================== */

function loadStudentProfile() {

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }

    const studentName =
        getElement("studentName");

    const studentEmail =
        getElement("studentEmail");

    if (studentName) {

        studentName.textContent =
            student.name;

    }

    if (studentEmail) {

        studentEmail.textContent =
            student.email;

    }

}


/* =====================================================
   DISPLAY AVAILABLE COURSES
===================================================== */

function displayAvailableCourses() {

    const courseContainer =
        getElement("courseContainer");

    const courseCount =
        getElement("courseCount");

    const courses =
        loadData("courses");

    if (!Array.isArray(courses)) {
        return;
    }

    if (courseCount) {

        courseCount.textContent =
            courses.length;

    }

    if (!courseContainer) {
        return;
    }

    courseContainer.innerHTML = "";

    if (courses.length === 0) {

        courseContainer.innerHTML = `
            <p>No courses available.</p>
        `;

        return;

    }

    courses.forEach(course => {

        courseContainer.innerHTML += `

        <div class="course-card">

            <h3>${course.title}</h3>

            <p>${course.description}</p>

            <p>
                <strong>Instructor:</strong>
                ${course.instructor || "Not Assigned"}
            </p>

            <button
                class="student-btn"
                onclick="enrollCourse('${course.id}')">

                Enroll

            </button>

        </div>

        `;

    });

}


/* =====================================================
   SEARCH COURSE
===================================================== */

function initializeCourseSearch() {

    const searchInput =
        getElement("courseSearch");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        searchCourses
    );

}


/* =====================================================
   SEARCH COURSES
===================================================== */

function searchCourses() {

    const searchInput =
        getElement("courseSearch");

    if (!searchInput) {
        return;
    }

    const keyword =
        searchInput.value
            .toLowerCase()
            .trim();

    const cards =
        document.querySelectorAll(
            ".course-card"
        );

    cards.forEach(card => {

        const text =
            card.textContent.toLowerCase();

        if (text.includes(keyword)) {

            card.style.display =
                "block";

        } else {

            card.style.display =
                "none";

        }

    });

}


/* =====================================================
   ENROLL COURSE
===================================================== */

function enrollCourse(courseId) {

    const loggedInStudent =
        getLoggedInUser();

    if (!loggedInStudent) {

        showNotification(
            "Please login first."
        );

        return;

    }

    let students =
        loadData("students");

    const courses =
        loadData("courses");

    if (!Array.isArray(students)) {
        students = [];
    }

    if (!Array.isArray(courses)) {
        showNotification(
            "Courses are not available."
        );
        return;
    }

    const studentIndex =
        students.findIndex(user =>
            user.id === loggedInStudent.id
        );

    if (studentIndex === -1) {

        showNotification(
            "Student not found."
        );

        return;

    }

    const selectedCourse =
        courses.find(course =>
            course.id === courseId
        );

    if (!selectedCourse) {

        showNotification(
            "Course not found."
        );

        return;

    }

    const currentStudent =
        students[studentIndex];


    /* ---------------------------------------------
       MAKE SURE REQUIRED ARRAYS EXIST
    --------------------------------------------- */

    if (!Array.isArray(
        currentStudent.enrolledCourses
    )) {

        currentStudent.enrolledCourses = [];

    }

    if (!Array.isArray(
        currentStudent.completedCourses
    )) {

        currentStudent.completedCourses = [];

    }

    if (!Array.isArray(
        currentStudent.enrollments
    )) {

        currentStudent.enrollments = [];

    }

    if (!Array.isArray(
        currentStudent.notifications
    )) {

        currentStudent.notifications = [];

    }


    /* ---------------------------------------------
       CHECK ALREADY ENROLLED
    --------------------------------------------- */

    const alreadyEnrolled =
        currentStudent.enrolledCourses.includes(
            courseId
        );

    if (alreadyEnrolled) {

        showNotification(
            "Already enrolled in this course."
        );

        return;

    }


    /* ---------------------------------------------
       ADD COURSE TO ENROLLED COURSES
    --------------------------------------------- */

    currentStudent.enrolledCourses.push(
        courseId
    );


    /* ---------------------------------------------
       ADD ENROLLMENT RECORD
    --------------------------------------------- */

    currentStudent.enrollments.push({

        id: generateId("EN"),

        courseId: courseId,

        courseTitle:
            selectedCourse.title,

        enrollmentDate:
            getCurrentDate(),

        enrollmentTime:
            getCurrentTime(),

        status: "Active"

    });


    /* ---------------------------------------------
       ADD NOTIFICATION
    --------------------------------------------- */

    currentStudent.notifications.unshift({

        id: generateId("NT"),

        message:
            `You enrolled in ${selectedCourse.title}.`,

        date:
            getCurrentDate(),

        time:
            getCurrentTime()

    });


    /* ---------------------------------------------
       SAVE STUDENT DATA
    --------------------------------------------- */

    students[studentIndex] =
        currentStudent;

    saveData(
        "students",
        students
    );


    /* ---------------------------------------------
       UPDATE LOGGED-IN USER
    --------------------------------------------- */

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(
            currentStudent
        )
    );


    /* ---------------------------------------------
       NOTIFY REACT COMPONENTS
    --------------------------------------------- */

    notifyStudentDataChanged();


    /* ---------------------------------------------
       SHOW SUCCESS MESSAGE
    --------------------------------------------- */

    showNotification(
        "Course enrolled successfully."
    );


    /* ---------------------------------------------
       REFRESH LEGACY UI
    --------------------------------------------- */

    displayAvailableCourses();

    updateDashboardStatistics();

    displayMyCourses();

    displayProgress();

    displayNotifications();

    displayRecentActivity();

    displayStudentSummary();

}


/* =====================================================
   DASHBOARD STATISTICS
===================================================== */

function updateDashboardStatistics() {

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }

    const enrolled =
        Array.isArray(student.enrolledCourses)
            ? student.enrolledCourses
            : [];

    const completed =
        Array.isArray(student.completedCourses)
            ? student.completedCourses
            : [];

    const enrolledCourses =
        getElement("enrolledCourses");

    const completedCourses =
        getElement("completedCourses");

    const inProgressCourses =
        getElement("inProgressCourses");


    if (enrolledCourses) {

        enrolledCourses.textContent =
            enrolled.length;

    }


    if (completedCourses) {

        completedCourses.textContent =
            completed.length;

    }


    if (inProgressCourses) {

        inProgressCourses.textContent =
            Math.max(
                enrolled.length -
                completed.length,
                0
            );

    }

}


/* =====================================================
   DISPLAY MY COURSES
===================================================== */

function displayMyCourses() {

    const courseContainer =
        getElement("myCourseContainer");

    if (!courseContainer) {
        return;
    }

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }

    const courses =
        loadData("courses");

    if (!Array.isArray(courses)) {
        return;
    }

    const enrolledCourses =
        Array.isArray(student.enrolledCourses)
            ? student.enrolledCourses
            : [];

    courseContainer.innerHTML = "";


    const myCourses =
        courses.filter(course =>
            enrolledCourses.includes(
                course.id
            )
        );


    if (myCourses.length === 0) {

        courseContainer.innerHTML = `
            <p>You have not enrolled in any courses.</p>
        `;

        return;

    }


    const completedCourses =
        Array.isArray(student.completedCourses)
            ? student.completedCourses
            : [];


    myCourses.forEach(course => {

        const isCompleted =
            completedCourses.includes(
                course.id
            );


        courseContainer.innerHTML += `

        <div class="course-card">

            <h3>${course.title}</h3>

            <p>${course.description}</p>

            <p>
                <strong>Course Code:</strong>
                ${course.id}
            </p>

            <p>
                <strong>Instructor:</strong>
                ${course.instructor || "Not Assigned"}
            </p>

            ${
                isCompleted
                    ? `
                        <p>
                            <strong>Status:</strong>
                            Completed
                        </p>
                    `
                    : `
                        <button
                            class="student-btn"
                            onclick="completeCourse('${course.id}')">

                            Mark as Completed

                        </button>
                    `
            }

        </div>

        `;

    });

}


/* =====================================================
   COMPLETE COURSE
===================================================== */

function completeCourse(courseId) {

    let students =
        loadData("students");

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }

    if (!Array.isArray(students)) {
        return;
    }

    const studentIndex =
        students.findIndex(user =>
            user.id === student.id
        );

    if (studentIndex === -1) {
        return;
    }

    const currentStudent =
        students[studentIndex];


    if (!Array.isArray(
        currentStudent.enrolledCourses
    )) {

        currentStudent.enrolledCourses = [];

    }

    if (!Array.isArray(
        currentStudent.completedCourses
    )) {

        currentStudent.completedCourses = [];

    }

    if (!Array.isArray(
        currentStudent.enrollments
    )) {

        currentStudent.enrollments = [];

    }

    if (!Array.isArray(
        currentStudent.notifications
    )) {

        currentStudent.notifications = [];

    }


    if (
        !currentStudent.enrolledCourses.includes(
            courseId
        )
    ) {

        showNotification(
            "Please enroll in the course first."
        );

        return;

    }


    if (
        currentStudent.completedCourses.includes(
            courseId
        )
    ) {

        showNotification(
            "Course already completed."
        );

        return;

    }


    /* ---------------------------------------------
       ADD TO COMPLETED COURSES
    --------------------------------------------- */

    currentStudent.completedCourses.push(
        courseId
    );


    /* ---------------------------------------------
       UPDATE ENROLLMENT STATUS
    --------------------------------------------- */

    const enrollment =
        currentStudent.enrollments.find(
            item =>
                item.courseId === courseId
        );

    if (enrollment) {

        enrollment.status =
            "Completed";

        enrollment.completionDate =
            getCurrentDate();

        enrollment.completionTime =
            getCurrentTime();

    }


    /* ---------------------------------------------
       ADD NOTIFICATION
    --------------------------------------------- */

    currentStudent.notifications.unshift({

        id: generateId("NT"),

        message:
            "Course completed successfully.",

        date:
            getCurrentDate(),

        time:
            getCurrentTime()

    });


    /* ---------------------------------------------
       SAVE DATA
    --------------------------------------------- */

    students[studentIndex] =
        currentStudent;

    saveData(
        "students",
        students
    );


    /* ---------------------------------------------
       UPDATE LOGGED-IN USER
    --------------------------------------------- */

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(
            currentStudent
        )
    );


    /* ---------------------------------------------
       NOTIFY REACT
    --------------------------------------------- */

    notifyStudentDataChanged();


    /* ---------------------------------------------
       SHOW MESSAGE
    --------------------------------------------- */

    showNotification(
        "Congratulations! Course completed."
    );


    /* ---------------------------------------------
       REFRESH UI
    --------------------------------------------- */

    updateDashboardStatistics();

    displayMyCourses();

    displayProgress();

    displayNotifications();

    displayRecentActivity();

    displayStudentSummary();

}


/* =====================================================
   DISPLAY PROGRESS
===================================================== */

function displayProgress() {

    const progressBar =
        getElement("progressBar");

    const progressText =
        getElement("progressText");

    if (
        !progressBar ||
        !progressText
    ) {

        return;

    }

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }

    const enrolled =
        Array.isArray(student.enrolledCourses)
            ? student.enrolledCourses.length
            : 0;

    const completed =
        Array.isArray(student.completedCourses)
            ? student.completedCourses.length
            : 0;


    let percentage = 0;

    if (enrolled > 0) {

        percentage =
            Math.round(
                (completed / enrolled) * 100
            );

    }


    progressBar.style.width =
        percentage + "%";


    progressText.textContent =
        percentage + "% Completed";

}


/* =====================================================
   ADD NOTIFICATION
===================================================== */

function addNotification(message) {

    let students =
        loadData("students");

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }

    if (!Array.isArray(students)) {
        return;
    }

    const studentIndex =
        students.findIndex(user =>
            user.id === student.id
        );

    if (studentIndex === -1) {
        return;
    }


    if (!Array.isArray(
        students[studentIndex].notifications
    )) {

        students[studentIndex].notifications = [];

    }


    students[studentIndex]
        .notifications
        .unshift({

            id:
                generateId("NT"),

            message:
                message,

            date:
                getCurrentDate(),

            time:
                getCurrentTime()

        });


    saveData(
        "students",
        students
    );


    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(
            students[studentIndex]
        )
    );


    notifyStudentDataChanged();

}


/* =====================================================
   DISPLAY NOTIFICATIONS
===================================================== */

function displayNotifications() {

    const notificationContainer =
        getElement("notificationContainer");

    if (!notificationContainer) {
        return;
    }

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }


    const notifications =
        Array.isArray(student.notifications)
            ? student.notifications
            : [];


    notificationContainer.innerHTML = "";


    if (notifications.length === 0) {

        notificationContainer.innerHTML = `
            <p>No notifications available.</p>
        `;

        return;

    }


    notifications.forEach(notification => {

        notificationContainer.innerHTML += `

        <div class="notification-card">

            <h4>
                ${notification.message}
            </h4>

            <small>

                ${notification.date}
                ${notification.time || ""}

            </small>

        </div>

        `;

    });

}


/* =====================================================
   DISPLAY STUDENT SUMMARY
===================================================== */

function displayStudentSummary() {

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }


    const enrolled =
        Array.isArray(student.enrolledCourses)
            ? student.enrolledCourses
            : [];


    const completed =
        Array.isArray(student.completedCourses)
            ? student.completedCourses
            : [];


    const totalCourses =
        enrolled.length;


    const completedCourses =
        completed.length;


    const pendingCourses =
        Math.max(
            totalCourses -
            completedCourses,
            0
        );


    const totalElement =
        getElement(
            "summaryTotalCourses"
        );

    const completedElement =
        getElement(
            "summaryCompletedCourses"
        );

    const pendingElement =
        getElement(
            "summaryPendingCourses"
        );


    if (totalElement) {

        totalElement.textContent =
            totalCourses;

    }


    if (completedElement) {

        completedElement.textContent =
            completedCourses;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pendingCourses;

    }

}


/* =====================================================
   UPDATE STUDENT PROFILE
===================================================== */

function initializeProfileForm() {

    const profileForm =
        getElement("studentProfileForm");

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            updateStudentProfile
        );

    }

}


function updateStudentProfile(event) {

    event.preventDefault();

    const name =
        getElement("profileName")
            ?.value
            .trim();

    const email =
        getElement("profileEmail")
            ?.value
            .trim();


    clearMessage(
        "profileMessage"
    );


    if (
        isEmpty(name) ||
        isEmpty(email)
    ) {

        showError(
            "profileMessage",
            "Please complete all fields."
        );

        return;

    }


    if (!isValidEmail(email)) {

        showError(
            "profileMessage",
            "Please enter a valid email."
        );

        return;

    }


    const students =
        loadData("students");

    const currentUser =
        getLoggedInUser();

    if (!currentUser) {
        return;
    }


    const studentIndex =
        students.findIndex(student =>
            student.id === currentUser.id
        );


    if (studentIndex === -1) {
        return;
    }


    students[studentIndex].name =
        name;

    students[studentIndex].email =
        email;


    saveData(
        "students",
        students
    );


    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(
            students[studentIndex]
        )
    );


    showSuccess(
        "profileMessage",
        "Profile updated successfully."
    );


    loadStudentProfile();

    displayStudentSummary();

    updateDashboardStatistics();

    notifyStudentDataChanged();

}


/* =====================================================
   RECENT ACTIVITY
===================================================== */

function displayRecentActivity() {

    const activityContainer =
        getElement(
            "recentActivityList"
        );

    if (!activityContainer) {
        return;
    }


    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }


    const notifications =
        Array.isArray(student.notifications)
            ? student.notifications
            : [];


    activityContainer.innerHTML = "";


    if (notifications.length === 0) {

        activityContainer.innerHTML =
            "<p>No recent activity available.</p>";

        return;

    }


    const latestActivities =
        notifications.slice(0, 5);


    latestActivities.forEach(activity => {

        activityContainer.innerHTML += `

        <div class="activity-card">

            <p>
                ${activity.message}
            </p>

            <small>

                ${activity.date}
                ${activity.time || ""}

            </small>

        </div>

        `;

    });

}


/* =====================================================
   FILTER MY COURSES
===================================================== */

function filterMyCourses(status) {

    const student =
        getLoggedInUser();

    if (!student) {
        return;
    }

    const courses =
        loadData("courses");

    if (!Array.isArray(courses)) {
        return;
    }


    const enrolledCourses =
        Array.isArray(student.enrolledCourses)
            ? student.enrolledCourses
            : [];


    const completedCourses =
        Array.isArray(student.completedCourses)
            ? student.completedCourses
            : [];


    let filteredCourses = [];


    if (status === "completed") {

        filteredCourses =
            courses.filter(course =>
                completedCourses.includes(
                    course.id
                )
            );

    }


    else if (status === "pending") {

        filteredCourses =
            courses.filter(course =>
                enrolledCourses.includes(
                    course.id
                ) &&
                !completedCourses.includes(
                    course.id
                )
            );

    }


    else {

        displayMyCourses();

        return;

    }


    const container =
        getElement(
            "myCourseContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (filteredCourses.length === 0) {

        container.innerHTML =
            "<p>No courses found.</p>";

        return;

    }


    filteredCourses.forEach(course => {

        const isCompleted =
            completedCourses.includes(
                course.id
            );


        container.innerHTML += `

        <div class="course-card">

            <h3>
                ${course.title}
            </h3>

            <p>
                ${course.description}
            </p>

            <p>
                <strong>Course Code:</strong>
                ${course.id}
            </p>

            <p>
                <strong>Status:</strong>
                ${
                    isCompleted
                        ? "Completed"
                        : "In Progress"
                }
            </p>

        </div>

        `;

    });

}


/* =====================================================
   REFRESH STUDENT DASHBOARD
===================================================== */

function refreshDashboard() {

    loadStudentProfile();

    displayStudentSummary();

    displayMyCourses();

    displayProgress();

    displayNotifications();

    displayRecentActivity();

    updateDashboardStatistics();

}


/* =====================================================
   EXPOSE FUNCTIONS FOR HTML BUTTONS
===================================================== */

window.enrollCourse =
    enrollCourse;

window.completeCourse =
    completeCourse;

window.filterMyCourses =
    filterMyCourses;

window.refreshDashboard =
    refreshDashboard;