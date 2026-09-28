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

function initializeDefaultUsers(){

    if(!localStorage.getItem("students")){

        const students = [

    {
        id: generateId("ST"),
        name: "Miruthula",
        email: "student@scms.com",
        password: "student123",
        role: "student",
        enrolledCourses: [],
        completedCourses: [],
        notifications: [],
        createdAt: new Date().toISOString()
    }

];

        saveData("students", students);

    }

        if(!localStorage.getItem("admins")){

        const admins = [

            {
                id: generateId("AD"),
                name: "Administrator",
                email: "admin@scms.com",
                password: "admin123",
                role: "admin"
            }

        ];

        saveData("admins", admins);

    }
    const existingStudents =
        loadData("students");

    existingStudents.forEach(student => {

        if(!Array.isArray(student.enrolledCourses)){

            student.enrolledCourses = [];

        }

        if(!Array.isArray(student.completedCourses)){

            student.completedCourses = [];

        }

        if(!Array.isArray(student.notifications)){

            student.notifications = [];

        }

    });

    saveData(
        "students",
        existingStudents
    );

}
/* =====================================================
   FIX EXISTING STUDENT DATA
===================================================== */

function fixExistingStudentData(){

    const students =
        loadData("students");

    students.forEach(student => {

        if(!Array.isArray(student.enrolledCourses)){

            student.enrolledCourses = [];

        }

        if(!Array.isArray(student.completedCourses)){

            student.completedCourses = [];

        }

        if(!Array.isArray(student.notifications)){

            student.notifications = [];

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

function initializeStudentLogin(){

    const studentLoginForm =
        getElement("studentLoginForm");

    if(studentLoginForm){

        studentLoginForm.addEventListener(
            "submit",
            handleStudentLogin
        );

    }

}

/* =====================================================
   ADMIN LOGIN INITIALIZATION
===================================================== */

function initializeAdminLogin(){

    const adminLoginForm =
        getElement("adminLoginForm");

    if(adminLoginForm){

        adminLoginForm.addEventListener(
            "submit",
            handleAdminLogin
        );

    }

}

/* =====================================================
   STUDENT LOGIN
===================================================== */

function handleStudentLogin(event){

    event.preventDefault();

    const email =
        getElement("studentEmail").value.trim();

    const password =
        getElement("studentPassword").value.trim();

    clearMessage("studentLoginMessage");

    if(isEmpty(email) || isEmpty(password)){

        showError(
            "studentLoginMessage",
            "Please fill in all fields."
        );

        return;

    }

    if(!isValidEmail(email)){

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
            user.email === email &&
            user.password === password
        );

    if(!student){

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

    showSuccess(
        "studentLoginMessage",
        "Login successful!"
    );

    setTimeout(function(){

        redirectTo("student-dashboard.html");

    },1000);

}

/* =====================================================
   ADMIN LOGIN
===================================================== */

function handleAdminLogin(event){

    event.preventDefault();

    const email =
        getElement("adminEmail").value.trim();

    const password =
        getElement("adminPassword").value.trim();

    clearMessage("adminLoginMessage");

    if(isEmpty(email) || isEmpty(password)){

        showError(
            "adminLoginMessage",
            "Please fill in all fields."
        );

        return;

    }

    if(!isValidEmail(email)){

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
            user.email === email &&
            user.password === password
        );

    if(!admin){

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

    showSuccess(
        "adminLoginMessage",
        "Login successful!"
    );

    setTimeout(function(){

        redirectTo("admin-dashboard.html");

    },1000);

}
/* =====================================================
   REGISTER INITIALIZATION
===================================================== */

function initializeRegister(){

    const registerForm =
        getElement("registerForm");

    if(registerForm){

        registerForm.addEventListener(
            "submit",
            handleRegister
        );

    }

}

/* =====================================================
   REGISTER STUDENT
===================================================== */

function handleRegister(event){

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

    if(
    isEmpty(name) ||
    isEmpty(registerNumber) ||
    isEmpty(email) ||
    isEmpty(phone) ||
    isEmpty(department) ||
    isEmpty(year) ||
    isEmpty(password) ||
    isEmpty(confirmPassword)
){

        showError(
            "registerMessage",
            "Please fill in all fields."
        );

        return;

    }

    if(!isValidEmail(email)){

        showError(
            "registerMessage",
            "Please enter a valid email address."
        );

        return;

    }

    if(!isValidPassword(password)){

        showError(
            "registerMessage",
            "Password must contain at least 6 characters."
        );

        return;

    }

    if(password !== confirmPassword){

        showError(
            "registerMessage",
            "Passwords do not match."
        );

        return;

    }

    /* ------------------------------
       DUPLICATE EMAIL CHECK
    ------------------------------ */

    const students =
        loadData("students");

    const emailExists =
        students.some(student =>
            student.email.toLowerCase() ===
            email.toLowerCase()
        );
    const registerNumberExists =
    students.some(student =>
        student.registerNumber === registerNumber
    );

    if(emailExists){

        showError(
            "registerMessage",
            "Email already registered."
        );

        return;
    }
    if(registerNumberExists){

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
    id: generateId("ST"),
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
    createdAt: new Date().toISOString()
};

    students.push(newStudent);

    saveData("students", students);

    showSuccess(
        "registerMessage",
        "Registration successful! Redirecting..."
    );

    clearForm("registerForm");

    setTimeout(function(){

        redirectTo("student-login.html");

    },1500);

}
/* =====================================================
   FORGOT PASSWORD INITIALIZATION
===================================================== */

function initializeForgotPassword(){

    const forgotPasswordForm =
        getElement("forgotPasswordForm");

    if(forgotPasswordForm){

        forgotPasswordForm.addEventListener(
            "submit",
            handleForgotPassword
        );

    }

}

/* =====================================================
   FORGOT PASSWORD
===================================================== */

function handleForgotPassword(event){

    event.preventDefault();

    const email =
        getElement("forgotEmail").value.trim();

    const newPassword =
        getElement("newPassword").value.trim();

    const confirmPassword =
        getElement("confirmNewPassword").value.trim();

    clearMessage("forgotMessage");

    if(
        isEmpty(email) ||
        isEmpty(newPassword) ||
        isEmpty(confirmPassword)
    ){

        showError(
            "forgotMessage",
            "Please fill in all fields."
        );

        return;

    }

    if(!isValidEmail(email)){

        showError(
            "forgotMessage",
            "Please enter a valid email."
        );

        return;

    }

    if(newPassword !== confirmPassword){

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

const studentIndex =
    students.findIndex(student =>
        student.email.toLowerCase() ===
        email.toLowerCase()
    );

const adminIndex =
    admins.findIndex(admin =>
        admin.email.toLowerCase() ===
        email.toLowerCase()
    );

    if(studentIndex !== -1){

    students[studentIndex].password =
        newPassword;

    saveData("students", students);

}else if(adminIndex !== -1){

    admins[adminIndex].password =
        newPassword;

    saveData("admins", admins);

}else{

    showError(
        "forgotMessage",
        "No account found with this email."
    );

    return;

}

showSuccess(
    "forgotMessage",
    "Password updated successfully."
);

clearForm("forgotPasswordForm");

setTimeout(function(){

    if(studentIndex !== -1){

        redirectTo("student-login.html");

    }else{

        redirectTo("admin-login.html");

    }

},1500);

}

/* =====================================================
   REMEMBER ME
===================================================== */

function rememberUser(email,remember){

    if(remember){

        localStorage.setItem(
            "rememberedEmail",
            email
        );

    }else{

        localStorage.removeItem(
            "rememberedEmail"
        );

    }

}

/* =====================================================
   LOAD REMEMBERED USER
===================================================== */

function loadRememberedUser(){

    const rememberedEmail =
        localStorage.getItem(
            "rememberedEmail"
        );

    const emailField =
        getElement("studentEmail");

    const rememberCheck =
        getElement("rememberMe");

    if(
        rememberedEmail &&
        emailField &&
        rememberCheck
    ){

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

    const input = document.getElementById(inputId);

    if (!input) return;

    input.type =
        input.type === "password" ? "text" : "password";
}
/* =====================================================
   PASSWORD TOGGLE INITIALIZATION
===================================================== */

function initializePasswordToggle() {

    const toggleButtons = document.querySelectorAll(".toggle-password");

    toggleButtons.forEach(button => {

        button.addEventListener("click", function () {

            const inputId = this.dataset.target;

            const input = document.getElementById(inputId);

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                this.classList.remove("fa-eye");
                this.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                this.classList.remove("fa-eye-slash");
                this.classList.add("fa-eye");
            }

        });

    });

}
/* =====================================================
   AUTHENTICATION CHECK
===================================================== */

function redirectLoggedInUser(){

    const user =
        getLoggedInUser();

    if(!user){

        return;

    }

    const page =
        window.location.pathname
        .split("/")
        .pop();

    const authPages = [

        "index.html",
        "student-login.html",
        "admin-login.html",
        "register.html",
        "forgot-password.html"

    ];

    if(authPages.includes(page)){

        if(user.role === "admin"){

            redirectTo(
                "admin-dashboard.html"
            );

        }else{

            redirectTo(
                "student-dashboard.html"
            );

        }

    }

}
function initializeAuth(){
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