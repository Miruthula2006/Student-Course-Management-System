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

document.addEventListener(
    "DOMContentLoaded",
    initializeStudentModule
);

/* =====================================================
   INITIALIZE STUDENT MODULE
===================================================== */

function initializeStudentModule(){

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
   LOAD STUDENT PROFILE
===================================================== */

function loadStudentProfile(){

    const student =
        getLoggedInUser();

    if(!student){

        return;

    }

    const studentName =
        getElement("studentName");

    const studentEmail =
        getElement("studentEmail");

    if(studentName){

        studentName.textContent =
            student.name;

    }

    if(studentEmail){

        studentEmail.textContent =
            student.email;

    }

}

/* =====================================================
   DISPLAY AVAILABLE COURSES
===================================================== */

function displayAvailableCourses(){

    const courseContainer =
        getElement("courseContainer");

    const courseCount =
        getElement("courseCount");

    const courses =
        loadData("courses");

    if(courseCount){

        courseCount.textContent =
            courses.length;

    }

    if(!courseContainer){

        return;

    }

    courseContainer.innerHTML = "";

    if(courses.length === 0){

        courseContainer.innerHTML = `
            <p>No courses available.</p>
        `;

        return;

    }

    courses.forEach(course =>{

        courseContainer.innerHTML += `

        <div class="course-card">

            <h3>${course.title}</h3>

            <p>${course.description}</p>

            <p>
                <strong>Instructor:</strong>
                ${course.instructor}
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

function initializeCourseSearch(){

    const searchInput =
        getElement("courseSearch");

    if(!searchInput){

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

function searchCourses(){

    const keyword =
        getElement("courseSearch")
        .value
        .toLowerCase();

    const cards =
        document.querySelectorAll(
            ".course-card"
        );

    cards.forEach(card =>{

        const text =
            card.textContent.toLowerCase();

        if(text.includes(keyword)){

            card.style.display =
                "block";

        }
        else{

            card.style.display =
                "none";

        }

    });

}

/* =====================================================
   ENROLL COURSE
===================================================== */

function enrollCourse(courseId){

    const student =
        getLoggedInUser();

    if(!student){

        showNotification(
            "Please login first."
        );

        return;

    }

    const students =
        loadData("students");

    const courses =
        loadData("courses");

    const studentIndex =
        students.findIndex(user =>
            user.id === student.id
        );

    if(studentIndex === -1){

        showNotification(
            "Student not found."
        );

        return;

    }

    const selectedCourse =
        courses.find(course =>
            course.id === courseId
        );

    if(!selectedCourse){

        showNotification(
            "Course not found."
        );

        return;

    }

    const currentStudent =
        students[studentIndex];

    if(!currentStudent.enrolledCourses){

        currentStudent.enrolledCourses = [];

    }

    if(!currentStudent.completedCourses){

        currentStudent.completedCourses = [];

    }

    if(!currentStudent.enrollments){

        currentStudent.enrollments = [];

    }

    const alreadyEnrolled =
        currentStudent.enrolledCourses.includes(courseId);

    if(alreadyEnrolled){

        showNotification(
            "Already enrolled in this course."
        );

        return;

    }

    currentStudent.enrolledCourses.push(
        courseId
    );

    currentStudent.enrollments.push({

        courseId: courseId,

        enrollmentDate:
            getCurrentDate(),

        status: "Active"

    });

    saveData(
        "students",
        students
    );

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(
            currentStudent
        )
    );

    showNotification(
        "Course enrolled successfully."
    );

    displayAvailableCourses();

    updateDashboardStatistics();

}

/* =====================================================
   DASHBOARD STATISTICS
===================================================== */

function updateDashboardStatistics(){

    const student =
        getLoggedInUser();

    if(!student){

        return;

    }

   const enrolledCourses =
    getElement("enrolledCourses");

const completedCourses =
    getElement("completedCourses");

    const inProgressCourses =
    getElement("inProgressCourses");

    if(enrolledCourses){

        enrolledCourses.textContent =
            student.enrolledCourses.length;

    }

    if(completedCourses){

        completedCourses.textContent =
            student.completedCourses.length;

    }
    if(inProgressCourses){

    inProgressCourses.textContent =
        student.enrolledCourses.length -
        student.completedCourses.length;

}

}
/* =====================================================
   DISPLAY MY COURSES
===================================================== */

function displayMyCourses(){

    const courseContainer =
        getElement("myCourseContainer");

    if(!courseContainer){

        return;

    }

    const student =
    getLoggedInUser();

if(!student){

    return;
}

const courses =
    loadData("courses");

    courseContainer.innerHTML = "";

    const enrolledCourses =
        courses.filter(course =>
            student.enrolledCourses.includes(course.id)
        );

    if(enrolledCourses.length === 0){

        courseContainer.innerHTML = `
            <p>You have not enrolled in any courses.</p>
        `;

        return;

    }

    enrolledCourses.forEach(course =>{

        courseContainer.innerHTML += `

        <div class="course-card">

            <h3>${course.title}</h3>

            <p>${course.description}</p>

            <button
                class="student-btn"
                onclick="completeCourse('${course.id}')">

                Mark as Completed

            </button>

        </div>

        `;

    });

}

/* =====================================================
   COMPLETE COURSE
===================================================== */

function completeCourse(courseId){

    const students =
        loadData("students");

    const student =
        getLoggedInUser();

    const studentIndex =
        students.findIndex(user =>
            user.id === student.id
        );

    if(studentIndex === -1){

        return;

    }

    const currentStudent =
        students[studentIndex];

    if(
        !currentStudent.enrolledCourses.includes(courseId)
    ){

        showNotification(
            "Please enroll in the course first."
        );

        return;

    }

    if(
        currentStudent.completedCourses.includes(courseId)
    ){

        showNotification(
            "Course already completed."
        );

        return;

    }

    currentStudent.completedCourses.push(courseId);

    saveData(
        "students",
        students
    );

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(currentStudent)
    );

    addNotification(
        "Course completed successfully."
    );

    showNotification(
        "Congratulations! Course completed."
    );

    updateDashboardStatistics();

    displayMyCourses();

    displayProgress();

}

/* =====================================================
   DISPLAY PROGRESS
===================================================== */

function displayProgress(){

    const progressBar =
        getElement("progressBar");

    const progressText =
        getElement("progressText");

    if(
        !progressBar ||
        !progressText
    ){

        return;

    }

    const student =
    getLoggedInUser();

    if(!student){

        return;
    }

    const enrolled =
    student.enrolledCourses.length;

    const completed =
        student.completedCourses.length;

    let percentage = 0;

    if(enrolled > 0){

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

function addNotification(message){

    const students =
        loadData("students");

    const student =
        getLoggedInUser();

    const studentIndex =
        students.findIndex(user =>
            user.id === student.id
        );

    if(studentIndex === -1){

        return;

    }

    students[studentIndex]
        .notifications.unshift({

        id: generateId("NT"),

        message: message,

        date: getCurrentDate(),

        time: getCurrentTime()

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

}

/* =====================================================
   DISPLAY NOTIFICATIONS
===================================================== */

function displayNotifications(){

    const notificationContainer =
        getElement("notificationContainer");

    if(!notificationContainer){

        return;

    }

    const student =
    getLoggedInUser();

    if(!student){

        return;
    }

    notificationContainer.innerHTML = "";

    if(student.notifications.length === 0){

        notificationContainer.innerHTML = `
            <p>No notifications available.</p>
        `;

        return;

    }

    student.notifications.forEach(notification =>{

        notificationContainer.innerHTML += `

        <div class="notification-card">

            <h4>${notification.message}</h4>

            <small>

                ${notification.date}
                ${notification.time}

            </small>

        </div>

        `;

    });

}
/* =====================================================
   DISPLAY STUDENT SUMMARY
===================================================== */

function displayStudentSummary(){

    const student = getLoggedInUser();

    if(!student){

        return;

    }

    const totalCourses =
        student.enrolledCourses.length;

    const completedCourses =
        student.completedCourses.length;

    const pendingCourses =
        totalCourses - completedCourses;

    const totalElement =
        getElement("summaryTotalCourses");

    const completedElement =
        getElement("summaryCompletedCourses");

    const pendingElement =
        getElement("summaryPendingCourses");

    if(totalElement){

        totalElement.textContent =
            totalCourses;

    }

    if(completedElement){

        completedElement.textContent =
            completedCourses;

    }

    if(pendingElement){

        pendingElement.textContent =
            pendingCourses;

    }

}

/* =====================================================
   UPDATE STUDENT PROFILE
===================================================== */

function initializeProfileForm(){

    const profileForm =
        getElement("studentProfileForm");

    if(profileForm){

        profileForm.addEventListener(
            "submit",
            updateStudentProfile
        );

    }

}

function updateStudentProfile(event){

    event.preventDefault();

    const name =
        getElement("profileName").value.trim();

    const email =
        getElement("profileEmail").value.trim();

    clearMessage("profileMessage");

    if(isEmpty(name) || isEmpty(email)){

        showError(
            "profileMessage",
            "Please complete all fields."
        );

        return;

    }

    if(!isValidEmail(email)){

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

    const studentIndex =
        students.findIndex(student =>
            student.id === currentUser.id
        );

    if(studentIndex === -1){

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

    updateDashboardStatistics();}

/* =====================================================
   RECENT ACTIVITY
===================================================== */

function displayRecentActivity(){

    const activityContainer =
        getElement("recentActivityList");

    if(!activityContainer){

        return;

    }

    const student =
    getLoggedInUser();

    if(!student){

        return;
    }

    activityContainer.innerHTML = "";

    if(student.notifications.length === 0){

        activityContainer.innerHTML =
            "<p>No recent activity available.</p>";

        return;

    }

    const latestActivities =
        student.notifications.slice(0,5);

    latestActivities.forEach(activity =>{

        activityContainer.innerHTML += `

        <div class="activity-card">

            <p>${activity.message}</p>

            <small>

                ${activity.date}
                ${activity.time}

            </small>

        </div>

        `;

    });

}

/* =====================================================
   FILTER MY COURSES
===================================================== */

function filterMyCourses(status){

    const student =
        getLoggedInUser();

    const courses =
        loadData("courses");

    let filteredCourses = [];

    if(status === "completed"){

        filteredCourses =
            courses.filter(course =>
                student.completedCourses.includes(
                    course.id
                )
            );

    }
    else if(status === "pending"){

        filteredCourses =
            courses.filter(course =>
                student.enrolledCourses.includes(
                    course.id
                ) &&
                !student.completedCourses.includes(
                    course.id
                )
            );

    }
    else{

        displayMyCourses();

        return;

    }

    const container =
        getElement("myCourseContainer");

    if(!container){

        return;

    }

    container.innerHTML = "";

    if(filteredCourses.length === 0){

        container.innerHTML =
            "<p>No courses found.</p>";

        return;

    }

    filteredCourses.forEach(course =>{

        container.innerHTML += `

        <div class="course-card">

            <h3>${course.title}</h3>

            <p>${course.description}</p>

        </div>

        `;

    });

}

/* =====================================================
   REFRESH STUDENT DASHBOARD
===================================================== */

function refreshDashboard(){

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

window.enrollCourse = enrollCourse;
window.completeCourse = completeCourse;
window.filterMyCourses = filterMyCourses;
window.refreshDashboard = refreshDashboard;