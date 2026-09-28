import {
    getElement,
    saveData,
    loadData,
    isEmpty,
    isValidEmail,
    isValidPassword,
    showError,
    showSuccess,
    clearMessage,
    clearForm,
    redirectTo,
    getLoggedInUser,
    generateId
} from "./main.js";

/* =====================================================
   DOM CONTENT LOADED
===================================================== */

document.addEventListener("DOMContentLoaded", initializeAuth);

/* =====================================================
   DEFAULT USERS
===================================================== */

function initializeDefaultUsers() {

    /* =====================================================
       STUDENTS
    ===================================================== */

    let students = loadData("students");

    if (!Array.isArray(students)) {
        students = [];
    }

    /*
       Add the default student only if the account
       does not already exist.

       This is important because existing student
       records should NOT be deleted.
    */

    const defaultStudentExists = students.some(student =>
        student.email &&
        student.email.toLowerCase() === "student@scms.com"
    );

    if (!defaultStudentExists) {

        students.push({

            id: registerNumber,

            name: "Miruthula",

            email: "student@scms.com",

            password: "student123",

            role: "student",

            enrolledCourses: [],

            completedCourses: [],

            notifications: [],

            createdAt: new Date().toISOString()

        });

    }


    /* =====================================================
       ADMINS
    ===================================================== */

    let admins = loadData("admins");

    if (!Array.isArray(admins)) {
        admins = [];
    }

    /*
       Add the default admin only if the account
       does not already exist.
    */

    const defaultAdminExists = admins.some(admin =>
        admin.email &&
        admin.email.toLowerCase() === "admin@scms.com"
    );

    if (!defaultAdminExists) {

        admins.push({

            id: generateId("AD"),

            name: "Administrator",

            email: "admin@scms.com",

            password: "admin123",

            role: "admin"

        });

    }


    /* =====================================================
       SAVE USERS
    ===================================================== */

    saveData("students", students);

    saveData("admins", admins);

}

/* =====================================================
   FIX EXISTING STUDENT DATA
===================================================== */

function fixExistingStudentData() {

    const students = loadData("students");

    if (!Array.isArray(students)) {
        return;
    }

    students.forEach(student => {

        if (!Array.isArray(student.enrolledCourses)) {

            student.enrolledCourses = [];

        }

        if (!Array.isArray(student.completedCourses)) {

            student.completedCourses = [];

        }

        if (!Array.isArray(student.notifications)) {

            student.notifications = [];

        }

        if (!Array.isArray(student.enrollments)) {

            student.enrollments = [];

        }

    });

    saveData(
        "students",
        students
    );

}

/* =====================================================
   STUDENT LOGIN INITIALIZATION
===================================================== */

function initializeStudentLogin() {

    const studentLoginForm =
        getElement("studentLoginForm");

    if (studentLoginForm) {

        studentLoginForm.addEventListener(
            "submit",
            handleStudentLogin
        );

    }

}

/* =====================================================
   ADMIN LOGIN INITIALIZATION
===================================================== */

function initializeAdminLogin() {

    const adminLoginForm =
        getElement("adminLoginForm");

    if (adminLoginForm) {

        adminLoginForm.addEventListener(
            "submit",
            handleAdminLogin
        );

    }

}

/* =====================================================
   STUDENT LOGIN
===================================================== */

function handleStudentLogin(event) {

    event.preventDefault();

    const email =
        getElement("studentEmail").value.trim();

    const password =
        getElement("studentPassword").value.trim();

    clearMessage("studentLoginMessage");

    if (
        isEmpty(email) ||
        isEmpty(password)
    ) {

        showError(
            "studentLoginMessage",
            "Please fill in all fields."
        );

        return;

    }

    if (!isValidEmail(email)) {

        showError(
            "studentLoginMessage",
            "Please enter a valid email address."
        );

        return;

    }

    const students =
        loadData("students");

    const student =
        students.find(user =>
            user.email &&
            user.email.toLowerCase() ===
                email.toLowerCase() &&
            user.password === password
        );

    if (!student) {

        showError(
            "studentLoginMessage",
            "Invalid email or password."
        );

        return;

    }

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(student)
    );

    window.dispatchEvent(new Event("authChanged"));

    showSuccess(
        "studentLoginMessage",
        "Login successful!"
    );

    setTimeout(function () {

        redirectTo("student-dashboard.html");

    }, 1000);

}

/* =====================================================
   ADMIN LOGIN
===================================================== */

function handleAdminLogin(event) {

    event.preventDefault();

    const email =
        getElement("adminEmail").value.trim();

    const password =
        getElement("adminPassword").value.trim();

    clearMessage("adminLoginMessage");

    if (
        isEmpty(email) ||
        isEmpty(password)
    ) {

        showError(
            "adminLoginMessage",
            "Please fill in all fields."
        );

        return;

    }

    if (!isValidEmail(email)) {

        showError(
            "adminLoginMessage",
            "Please enter a valid email address."
        );

        return;

    }

    const admins =
        loadData("admins");

    const admin =
        admins.find(user =>
            user.email &&
            user.email.toLowerCase() ===
                email.toLowerCase() &&
            user.password === password
        );

    if (!admin) {

        showError(
            "adminLoginMessage",
            "Invalid email or password."
        );

        return;

    }

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(admin)
    );

    window.dispatchEvent(new Event("authChanged"));

    showSuccess(
        "adminLoginMessage",
        "Login successful!"
    );

    setTimeout(function () {

        redirectTo("admin-dashboard.html");

    }, 1000);

}

/* =====================================================
   REGISTER INITIALIZATION
===================================================== */

function initializeRegister() {

    const registerForm =
        getElement("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegister
        );

    }

}

/* =====================================================
   REGISTER STUDENT
===================================================== */

function handleRegister(event) {

    event.preventDefault();

    const name =
        getElement("fullName").value.trim();

    const registerNumber =
        getElement("registerNumber").value.trim();

    const email =
        getElement("registerEmail").value.trim();

    const phone =
        getElement("phone").value.trim();

    const department =
        getElement("department").value;

    const year =
        getElement("year").value;

    const password =
        getElement("registerPassword").value.trim();

    const confirmPassword =
        getElement("confirmPassword").value.trim();

    clearMessage("registerMessage");

    /* ------------------------------
       VALIDATIONS
    ------------------------------ */

    if (
        isEmpty(name) ||
        isEmpty(registerNumber) ||
        isEmpty(email) ||
        isEmpty(phone) ||
        isEmpty(department) ||
        isEmpty(year) ||
        isEmpty(password) ||
        isEmpty(confirmPassword)
    ) {

        showError(
            "registerMessage",
            "Please fill in all fields."
        );

        return;

    }

    if (!isValidEmail(email)) {

        showError(
            "registerMessage",
            "Please enter a valid email address."
        );

        return;

    }

    if (!isValidPassword(password)) {

        showError(
            "registerMessage",
            "Password must contain at least 6 characters."
        );

        return;

    }

    if (password !== confirmPassword) {

        showError(
            "registerMessage",
            "Passwords do not match."
        );

        return;

    }

    /* ------------------------------
       LOAD STUDENTS
    ------------------------------ */

    const students =
        loadData("students");

    /* ------------------------------
       DUPLICATE EMAIL CHECK
    ------------------------------ */

    const emailExists =
        students.some(student =>
            student.email &&
            student.email.toLowerCase() ===
                email.toLowerCase()
        );

    /* ------------------------------
       DUPLICATE REGISTER NUMBER
    ------------------------------ */

    const registerNumberExists =
        students.some(student =>
            student.registerNumber ===
            registerNumber
        );

    if (emailExists) {

        showError(
            "registerMessage",
            "Email already registered."
        );

        return;

    }

    if (registerNumberExists) {

        showError(
            "registerMessage",
            "Register Number already exists."
        );

        return;

    }

    /* ------------------------------
       CREATE STUDENT
    ------------------------------ */

    const newStudent = {

        id: registerNumber,

        name: name,

        registerNumber: registerNumber,

        email: email,

        phone: phone,

        department: department,

        year: year,

        password: password,

        role: "student",

        enrolledCourses: [],

        completedCourses: [],

        notifications: [],

        enrollments: [],

        createdAt: new Date().toISOString()

    };

    students.push(newStudent);

    saveData(
        "students",
        students
    );

    showSuccess(
        "registerMessage",
        "Registration successful! Redirecting..."
    );

    clearForm("registerForm");

    setTimeout(function () {

        redirectTo("student-login.html");

    }, 1500);

}

/* =====================================================
   FORGOT PASSWORD INITIALIZATION
===================================================== */

function initializeForgotPassword() {

    const forgotPasswordForm =
        getElement("forgotPasswordForm");

    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            "submit",
            handleForgotPassword
        );

    }

}

/* =====================================================
   FORGOT PASSWORD
===================================================== */

function handleForgotPassword(event) {

    event.preventDefault();

    const email =
        getElement("forgotEmail").value.trim();

    const newPassword =
        getElement("newPassword").value.trim();

    const confirmPassword =
        getElement("confirmNewPassword").value.trim();

    clearMessage("forgotMessage");

    if (
        isEmpty(email) ||
        isEmpty(newPassword) ||
        isEmpty(confirmPassword)
    ) {

        showError(
            "forgotMessage",
            "Please fill in all fields."
        );

        return;

    }

    if (!isValidEmail(email)) {

        showError(
            "forgotMessage",
            "Please enter a valid email."
        );

        return;

    }

    if (!isValidPassword(newPassword)) {

        showError(
            "forgotMessage",
            "Password must contain at least 6 characters."
        );

        return;

    }

    if (newPassword !== confirmPassword) {

        showError(
            "forgotMessage",
            "Passwords do not match."
        );

        return;

    }

    const students =
        loadData("students");

    const admins =
        loadData("admins");

    /* ------------------------------
       FIND STUDENT
    ------------------------------ */

    const studentIndex =
        students.findIndex(student =>
            student.email &&
            student.email.toLowerCase() ===
                email.toLowerCase()
        );

    /* ------------------------------
       FIND ADMIN
    ------------------------------ */

    const adminIndex =
        admins.findIndex(admin =>
            admin.email &&
            admin.email.toLowerCase() ===
                email.toLowerCase()
        );

    /* ------------------------------
       UPDATE STUDENT PASSWORD
    ------------------------------ */

    if (studentIndex !== -1) {

        if (
            students[studentIndex].password ===
            newPassword
        ) {
            showError(
                "forgotMessage",
                "New password must be different from your current password."
            );
            return;
        }

        students[studentIndex].password =
            newPassword;

        saveData(
            "students",
            students
        );

    }

    /* ------------------------------
       UPDATE ADMIN PASSWORD
    ------------------------------ */

    else if (adminIndex !== -1) {

        if (
            admins[adminIndex].password ===
            newPassword
        ) {
            showError(
                "forgotMessage",
                "New password must be different from your current password."
            );
            return;
        }

        admins[adminIndex].password =
            newPassword;

        saveData(
            "admins",
            admins
        );

    }

    /* ------------------------------
       ACCOUNT NOT FOUND
    ------------------------------ */

    else {

        showError(
            "forgotMessage",
            "No account found with this email."
        );

        return;

    }

    /* ------------------------------
       SUCCESS
    ------------------------------ */

    showSuccess(
        "forgotMessage",
        "Password updated successfully."
    );

    clearForm(
        "forgotPasswordForm"
    );

    setTimeout(function () {

        if (studentIndex !== -1) {

            redirectTo("student-login.html");

        } else {

            redirectTo("admin-login.html");

        }

    }, 1500);

}

/* =====================================================
   REMEMBER ME
===================================================== */

function rememberUser(email, remember) {

    if (remember) {

        localStorage.setItem(
            "rememberedEmail",
            email
        );

    } else {

        localStorage.removeItem(
            "rememberedEmail"
        );

    }

}

/* =====================================================
   LOAD REMEMBERED USER
===================================================== */

function loadRememberedUser() {

    const rememberedEmail =
        localStorage.getItem(
            "rememberedEmail"
        );

    const emailField =
        getElement("studentEmail");

    const rememberCheck =
        getElement("rememberMe");

    if (
        rememberedEmail &&
        emailField &&
        rememberCheck
    ) {

        emailField.value =
            rememberedEmail;

        rememberCheck.checked =
            true;

    }

}

/* =====================================================
   PASSWORD VISIBILITY
===================================================== */

function togglePasswordVisibility(inputId) {

    const input =
        document.getElementById(inputId);

    if (!input) return;

    input.type =
        input.type === "password"
            ? "text"
            : "password";

}

/* =====================================================
   PASSWORD TOGGLE INITIALIZATION
===================================================== */

function initializePasswordToggle() {

    const toggleButtons =
        document.querySelectorAll(
            ".toggle-password"
        );

    toggleButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const inputId =
                    this.dataset.target;

                const input =
                    document.getElementById(
                        inputId
                    );

                if (!input) return;

                if (input.type === "password") {

                    input.type = "text";

                    this.classList.remove(
                        "fa-eye"
                    );

                    this.classList.add(
                        "fa-eye-slash"
                    );

                } else {

                    input.type = "password";

                    this.classList.remove(
                        "fa-eye-slash"
                    );

                    this.classList.add(
                        "fa-eye"
                    );

                }

            }
        );

    });

}

/* =====================================================
   AUTHENTICATION CHECK
===================================================== */

function redirectLoggedInUser() {

    const user =
        getLoggedInUser();

    if (!user) {

        return;

    }

    const page =
        window.location.pathname
            .split("/")
            .pop();

    const authPages = [

        "",

        "index.html",

        "student-login.html",

        "admin-login.html",

        "register.html",

        "forgot-password.html"

    ];

    if (authPages.includes(page)) {

        if (user.role === "admin") {

            redirectTo(
                "admin-dashboard.html"
            );

        } else {

            redirectTo(
                "student-dashboard.html"
            );

        }

    }

}

/* =====================================================
   INITIALIZE AUTH
===================================================== */

function initializeAuth() {

    initializeDefaultUsers();

    fixExistingStudentData();

    initializeStudentLogin();

    initializeAdminLogin();

    initializeRegister();

    initializeForgotPassword();

    initializePasswordToggle();

    loadRememberedUser();

    redirectLoggedInUser();

}