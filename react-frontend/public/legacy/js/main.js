"use strict";
/* =====================================================
   LEGACY SCRIPT LOADED
===================================================== */

window.addEventListener(
    "legacyScriptLoaded",
    initializeApplication
);

/* =====================================================
   LOGOUT INITIALIZATION
===================================================== */

function initializeLogout(){
    const adminLogoutButton =
    document.getElementById("adminLogoutBtn");
    const studentLogoutButton =
    document.getElementById("studentLogoutBtn");

    if(adminLogoutButton && adminLogoutButton.dataset.reactLogout !== "true"){

        adminLogoutButton.addEventListener(
            "click",
            logoutUser
        );

    }

    if(studentLogoutButton && studentLogoutButton.dataset.reactLogout !== "true"){

        studentLogoutButton.addEventListener(
            "click",
            logoutUser
        );

    }

}

/* =====================================================
   LOGOUT USER
===================================================== */

function logoutUser(event){

    event.preventDefault();

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if(!confirmLogout){

        return;

    }

    localStorage.removeItem("loggedInUser");
    window.dispatchEvent(new Event("authChanged"));

    window.history.pushState(
        {},
        "",
        "/"
    );

    window.dispatchEvent(
        new PopStateEvent("popstate")
    );

}

/* =====================================================
   GET ELEMENT
===================================================== */

function getElement(elementId){

    return document.getElementById(elementId);

}

/* =====================================================
   SHOW ALERT
===================================================== */

function showAlert(message){

    alert(message);

}

/* =====================================================
   SAVE DATA
===================================================== */

function saveData(key,data){

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}

/* =====================================================
   LOAD DATA
===================================================== */

function loadData(key){

    const storedData =
        localStorage.getItem(key);

    return storedData
        ? JSON.parse(storedData)
        : [];

}

/* =====================================================
   REMOVE DATA
===================================================== */

function removeData(key){

    localStorage.removeItem(key);

}
/* =====================================================
   CHECK EMPTY FIELD
===================================================== */

function isEmpty(value){

    return value.trim() === "";

}

/* =====================================================
   EMAIL VALIDATION
===================================================== */

function isValidEmail(email){

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

}

/* =====================================================
   PASSWORD LENGTH VALIDATION
===================================================== */

function isValidPassword(password){

    return password.length >= 6;

}

/* =====================================================
   SHOW ERROR MESSAGE
===================================================== */

function showError(elementId,message){

    const element = getElement(elementId);

    if(element){

        element.textContent = message;
        element.style.color = "#DC2626";

    }

}

/* =====================================================
   SHOW SUCCESS MESSAGE
===================================================== */

function showSuccess(elementId,message){

    const element = getElement(elementId);

    if(element){

        element.textContent = message;
        element.style.color = "#16A34A";

    }

}

/* =====================================================
   CLEAR MESSAGE
===================================================== */

function clearMessage(elementId){

    const element = getElement(elementId);

    if(element){

        element.textContent = "";

    }

}

/* =====================================================
   TOGGLE PASSWORD VISIBILITY
===================================================== */

function togglePasswordVisibility(inputId){

    const passwordField = getElement(inputId);

    if(!passwordField){

        return;

    }

    if(passwordField.type === "password"){

        passwordField.type = "text";

    }
    else{

        passwordField.type = "password";

    }

}

/* =====================================================
   PAGE REDIRECTION
===================================================== */
function redirectTo(page){

    const routeMap = {

        "index.html": "/",

        "student-login.html":
            "/student-login",

        "admin-login.html":
            "/admin-login",

        "register.html":
            "/register",

        "forgot-password.html":
            "/forgot-password",

        "student-dashboard.html":
            "/student-dashboard",

        "courses.html":
            "/courses",

        "my-courses.html":
            "/my-courses",

        "progress.html":
            "/progress",

        "notifications.html":
            "/notifications",

        "admin-dashboard.html":
            "/admin-dashboard",

        "manage-courses.html":
            "/manage-courses",

        "add-course.html":
            "/add-course",

        "edit-course.html":
            "/edit-course",

        "manage-students.html":
            "/manage-students",

        "student-details.html":
            "/student-details",

        "view-enrollments.html":
            "/view-enrollments"

    };

    const route =
        routeMap[page] || page;

    window.history.pushState(
        {},
        "",
        route
    );

    window.dispatchEvent(
        new PopStateEvent("popstate")
    );

}

/* =====================================================
   CURRENT DATE
===================================================== */

function getCurrentDate(){

    return new Date().toLocaleDateString();

}

/* =====================================================
   CURRENT TIME
===================================================== */

function getCurrentTime(){

    return new Date().toLocaleTimeString();

}
/* =====================================================
   USER SESSION
===================================================== */

function getLoggedInUser(){

    return JSON.parse(
        localStorage.getItem("loggedInUser")
    );

}

/* =====================================================
   CHECK LOGIN STATUS
===================================================== */

function isUserLoggedIn(){

    return getLoggedInUser() !== null;

}

/* =====================================================
   PROTECT DASHBOARD PAGES
===================================================== */

function protectPage(){

    const currentPage =
        window.location.pathname;

    const publicPages = [
        "/",
        "/student-login",
        "/admin-login",
        "/register",
        "/forgot-password"
    ];

    if(
        !publicPages.includes(currentPage) &&
        !isUserLoggedIn()
    ){

        alert("Please login first.");

        window.history.pushState(
            {},
            "",
            "/student-login"
        );

        window.dispatchEvent(
            new PopStateEvent("popstate")
        );

    }

}

/* =====================================================
   DISPLAY USER NAME
===================================================== */

function displayLoggedInUser(){

    const user = getLoggedInUser();

    const userElement =
        getElement("loggedInUser");

    if(user && userElement){

        userElement.textContent =
            `Welcome, ${user.name}`;

    }

}

/* =====================================================
   SHOW NOTIFICATION
===================================================== */

function showNotification(message){

    alert(message);

}

/* =====================================================
   GENERATE UNIQUE ID
===================================================== */

function generateId(prefix){

    return (
        prefix +
        "_" +
        Date.now()
    );

}

/* =====================================================
   CLEAR FORM
===================================================== */

function clearForm(formId){

    const form =
        getElement(formId);

    if(form){

        form.reset();

    }

}
/* =====================================================
   INITIALIZE DEFAULT COURSES
===================================================== */

function initializeDefaultCourses(){

    if(localStorage.getItem("courses")){

        return;

    }

    const courses = [

        {
            id: "AI101",
            title: "Artificial Intelligence",
            category: "Artificial Intelligence",
            duration: "12 Weeks",
            level: "Beginner",
            description: "Learn AI fundamentals, intelligent agents, and problem-solving techniques.",
            instructor: "Dr. Arun"
        },

        {
            id: "ML102",
            title: "Machine Learning",
            category: "Artificial Intelligence",
            duration: "10 Weeks",
            level: "Intermediate",
            description: "Build predictive models using supervised and unsupervised learning.",
            instructor: "Dr. Priya"
        },

        {
            id: "PY103",
            title: "Python Programming",
            category: "Programming",
            duration: "8 Weeks",
            level: "Beginner",
            description: "Master Python programming from basics to advanced concepts.",
            instructor: "Prof. Karthik"
        },

        {
            id: "WD104",
            title: "Web Development",
            category: "Programming",
            duration: "10 Weeks",
            level: "Beginner",
            description: "Learn HTML, CSS, JavaScript and responsive web development.",
            instructor: "Prof. Meena"
        },

        {
            id: "JV105",
            title: "Java Programming",
            category: "Programming",
            duration: "10 Weeks",
            level: "Intermediate",
            description: "Develop object-oriented applications using Java programming.",
            instructor: "Dr. Ravi"
        },

        {
            id: "CP106",
            title: "C Programming",
            category: "Programming",
            duration: "8 Weeks",
            level: "Beginner",
            description: "Understand programming concepts using the C language.",
            instructor: "Prof. Kumar"
        },

        {
            id: "CPP107",
            title: "C++ Programming",
            category: "Programming",
            duration: "8 Weeks",
            level: "Intermediate",
            description: "Build object-oriented applications using C++.",
            instructor: "Dr. Suresh"
        },

        {
            id: "DS108",
            title: "Data Structures",
            category: "Computer Science",
            duration: "10 Weeks",
            level: "Intermediate",
            description: "Learn arrays, stacks, queues, linked lists and trees.",
            instructor: "Dr. Anand"
        },

        {
            id: "DB109",
            title: "Database Management",
            category: "Database",
            duration: "8 Weeks",
            level: "Beginner",
            description: "Understand relational databases, SQL and normalization.",
            instructor: "Prof. Lakshmi"
        },

        {
            id: "SQL110",
            title: "SQL",
            category: "Database",
            duration: "6 Weeks",
            level: "Beginner",
            description: "Learn SQL queries, joins and database operations.",
            instructor: "Prof. Divya"
        },

        {
            id: "CC111",
            title: "Cloud Computing",
            category: "Cloud Computing",
            duration: "8 Weeks",
            level: "Intermediate",
            description: "Learn cloud services, virtualization, deployment models and cloud platforms.",
            instructor: "Dr. Naveen"
        },

        {
            id: "CS112",
            title: "Cyber Security",
            category: "Cyber Security",
            duration: "10 Weeks",
            level: "Advanced",
            description: "Understand cyber threats, network security, ethical hacking and data protection.",
            instructor: "Dr. Vishal"
        },

        {
            id: "DA113",
            title: "Data Analytics",
            category: "Data Science",
            duration: "8 Weeks",
            level: "Intermediate",
            description: "Analyze datasets, create reports and gain business insights using analytical tools.",
            instructor: "Dr. Sneha"
        },

        {
            id: "DL114",
            title: "Deep Learning",
            category: "Artificial Intelligence",
            duration: "12 Weeks",
            level: "Advanced",
            description: "Explore neural networks, computer vision and deep learning applications.",
            instructor: "Dr. Rahul"
        },

        {
            id: "UX115",
            title: "UI / UX Design",
            category: "Design",
            duration: "6 Weeks",
            level: "Beginner",
            description: "Design attractive, user-friendly interfaces and improve user experience principles.",
            instructor: "Prof. Asha"
        }

    ];

    saveData(
        "courses",
        courses
    );

}

/* =====================================================
   INITIALIZE DEFAULT STUDENTS
===================================================== */

function initializeDefaultStudents(){

    if(localStorage.getItem("students")){

        return;

    }

    const students = [

        {
            id: "ST001",
            name: "Miruthula",
            department: "B.Sc CS AI",
            year: "III",
            email: "miruthula@gmail.com",
            status: "Active",
            enrolledCourses: ["AI101", "PY103"],
            completedCourses: ["AI101"]
        },

        {
            id: "ST002",
            name: "Priya",
            department: "BCA",
            year: "II",
            email: "priya@gmail.com",
            status: "Active",
            enrolledCourses: ["ML102"],
            completedCourses: []
        },

        {
            id: "ST003",
            name: "Kavya",
            department: "B.Sc IT",
            year: "III",
            email: "kavya@gmail.com",
            status: "Active",
            enrolledCourses: ["WD104", "DB109"],
            completedCourses: ["WD104"]
        },

        {
            id: "ST004",
            name: "Rahul",
            department: "B.Com",
            year: "I",
            email: "rahul@gmail.com",
            status: "Inactive",
            enrolledCourses: ["SQL110"],
            completedCourses: []
        },

        {
            id: "ST005",
            name: "Arun",
            department: "BBA",
            year: "II",
            email: "arun@gmail.com",
            status: "Active",
            enrolledCourses: ["DA113"],
            completedCourses: ["DA113"]
        },

        {
            id: "ST006",
            name: "Ananya",
            department: "B.Sc CS AI",
            year: "II",
            email: "ananya@gmail.com",
            status: "Active",
            enrolledCourses: ["DL114", "AI101"],
            completedCourses: []
        },

        {
            id: "ST007",
            name: "Vignesh",
            department: "BCA",
            year: "III",
            email: "vignesh@gmail.com",
            status: "Active",
            enrolledCourses: ["PY103", "JV105"],
            completedCourses: ["PY103"]
        },

        {
            id: "ST008",
            name: "Harini",
            department: "B.Sc IT",
            year: "I",
            email: "harini@gmail.com",
            status: "Inactive",
            enrolledCourses: ["CP106"],
            completedCourses: []
        }

    ];

    saveData(
        "students",
        students
    );

}


/* =====================================================
   REMOVE DEMO STUDENTS FROM TASK 1-5 SEED DATA
   Keep students created through the registration form.
===================================================== */

function removeDemoStudents(){

    const demoIds = [
        "ST001","ST002","ST003","ST004",
        "ST005","ST006","ST007","ST008"
    ];

    const students = loadData("students");

    if (!Array.isArray(students)) {
        return;
    }

    const cleanedStudents = students.filter(student =>
        !demoIds.includes(String(student.id))
    );

    if (cleanedStudents.length !== students.length) {
        saveData("students", cleanedStudents);

        const loggedInUser = getLoggedInUser();

        if (
            loggedInUser &&
            demoIds.includes(String(loggedInUser.id))
        ) {
            localStorage.removeItem("loggedInUser");
            window.dispatchEvent(new Event("authChanged"));
        }
    }
}

/* =====================================================
   INITIALIZE APPLICATION
===================================================== */

let applicationInitialized = false;

function initializeApplication(){

    if (applicationInitialized) {
        return;
    }

    applicationInitialized = true;

    initializeLogout();
    removeDemoStudents();
    protectPage();
    initializeDefaultCourses();
    displayLoggedInUser();

}
/* =====================================================
   ES6 MODULE EXPORTS
===================================================== */

export {
    getElement,
    saveData,
    loadData,
    removeData,
    isEmpty,
    isValidEmail,
    isValidPassword,
    showError,
    showSuccess,
    clearMessage,
    togglePasswordVisibility,
    redirectTo,
    getCurrentDate,
    getCurrentTime,
    getLoggedInUser,
    isUserLoggedIn,
    protectPage,
    displayLoggedInUser,
    showNotification,
    generateId,
    clearForm
};