"use strict";

import {
    getElement,
    loadData,
    saveData,
    isEmpty,
    showError,
    showSuccess,
    clearMessage,
    generateId,
    showNotification,
    redirectTo
} from "./main.js";

/* =====================================================
   DOM CONTENT LOADED
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeAdminModule
);

/* =====================================================
   INITIALIZE ADMIN MODULE
===================================================== */
function initializeAdminModule(){

    initializeAddCourse();

    displayCourses();

    initializeCourseSearch();

    displayStudents();

    initializeStudentSearch();

    loadStudentDetails();

    displayStudentEnrolledCourses();

    updateAdminDashboard();

    displayDashboardSummary();

    initializeEditCourse();
    displayEnrollments();
    initializeEnrollmentSearch();

}

/* =====================================================
   ADD COURSE INITIALIZATION
===================================================== */

function initializeAddCourse(){

    const addCourseForm =
        getElement("addCourseForm");

    if(addCourseForm){

        addCourseForm.addEventListener(
            "submit",
            addCourse
        );

    }

}
/* =====================================================
   EDIT COURSE INITIALIZATION
===================================================== */

function initializeEditCourse(){

    const editCourseForm =
        getElement("editCourseForm");

    if(editCourseForm){

        editCourseForm.addEventListener(
            "submit",
            updateCourse
        );

        loadCourseDetails();

    }

}

/* =====================================================
   ADD COURSE
===================================================== */

function addCourse(event){

    event.preventDefault();

    const courseCode =
        getElement("courseCode").value.trim();

    const courseName =
        getElement("courseName").value.trim();

    const category =
        getElement("category").value;

    const duration =
        getElement("duration").value.trim();

    const level =
        getElement("level").value;

    const description =
        getElement("courseDescription").value.trim();

    clearMessage("courseMessage");

    if(
        isEmpty(courseCode) ||
        isEmpty(courseName) ||
        isEmpty(category) ||
        isEmpty(duration) ||
        isEmpty(level) ||
        isEmpty(description)
    ){

        showError(
            "courseMessage",
            "Please fill in all fields."
        );

        return;

    }

    const courses =
        loadData("courses");

    const duplicateCourseCode =
        courses.some(course =>
            course.id.toLowerCase() ===
            courseCode.toLowerCase()
        );

    if(duplicateCourseCode){

        showError(
            "courseMessage",
            "Course code already exists."
        );

        return;

    }

    const duplicateCourseName =
        courses.some(course =>
            course.title.toLowerCase() ===
            courseName.toLowerCase()
        );

    if(duplicateCourseName){

        showError(
            "courseMessage",
            "Course name already exists."
        );

        return;

    }

    const newCourse = {

        id: courseCode,

        title: courseName,

        category: category,

        duration: duration,

        level: level,

        description: description,

        instructor: "Not Assigned"

    };

    courses.push(newCourse);

    saveData(
        "courses",
        courses
    );

    showSuccess(
        "courseMessage",
        "Course added successfully."
    );

    const addCourseForm =
        getElement("addCourseForm");

    if(addCourseForm){

        addCourseForm.reset();

    }
    displayCourses();

    updateAdminDashboard();

}
/* =====================================================
   DISPLAY COURSES
===================================================== */

function displayCourses(){

    const container =
        getElement("courseTableBody");

    if(!container){

        return;

    }

    const courses =
        loadData("courses");

    container.innerHTML = "";

    if(courses.length === 0){

        container.innerHTML = `
            <tr>
                <td colspan="6">
                    No courses available.
                </td>
            </tr>
        `;

        return;

    }

    courses.forEach(course => {

    container.innerHTML += `

    <tr>

        <td>${course.id}</td>

        <td>${course.title}</td>

        <td>${course.category}</td>

        <td>${course.duration}</td>

        <td>${course.level}</td>

        <td>

            <button
                class="edit-btn"
                onclick="editCourse('${course.id}')">

                Edit

            </button>

            <button
                class="delete-btn"
                onclick="deleteCourse('${course.id}')">

                Delete

            </button>

        </td>

    </tr>

    `;

});
}

/* =====================================================
   COURSE SEARCH
===================================================== */

function initializeCourseSearch(){

    const searchInput =
        getElement("courseSearch");

    if(searchInput){

        searchInput.addEventListener(
            "input",
            searchCourses
        );

    }

}

function searchCourses(){

    const keyword =
        getElement("courseSearch")
        .value
        .toLowerCase();

    const rows =
        document.querySelectorAll(
            "#courseTableBody tr"
        );

    rows.forEach(row =>{

        if(
            row.textContent
            .toLowerCase()
            .includes(keyword)
        ){

            row.style.display = "";

        }
        else{

            row.style.display = "none";

        }

    });

}

/* =====================================================
   DELETE COURSE
===================================================== */

function deleteCourse(courseId){

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this course?"
        );

    if(!confirmDelete){

        return;

    }

    let courses =
        loadData("courses");

    courses =
        courses.filter(course =>
            course.id !== courseId
        );

    saveData("courses", courses);

    showNotification(
        "Course deleted successfully."
    );

    displayCourses();

    updateAdminDashboard();

}

/* =====================================================
   ADMIN DASHBOARD STATISTICS
===================================================== */

function updateAdminDashboard(){

    const courses =
        loadData("courses");

    const students =
        loadData("students");

    const totalCourses =
        getElement("totalCourses");

    const totalStudents =
        getElement("totalStudents");

    const activeCourses =
        getElement("activeCourses");

    if(totalCourses){

        totalCourses.textContent =
            courses.length;

    }

    if(totalStudents){

        totalStudents.textContent =
            students.length;

    }
    if(activeCourses){

    const activeCourseIds = new Set();

    students.forEach(student =>{

        student.enrolledCourses.forEach(courseId =>{

            activeCourseIds.add(courseId);

        });

    });

    activeCourses.textContent =
        activeCourseIds.size;

}

}
/* =====================================================
   EDIT COURSE
===================================================== */

function editCourse(courseId){

    const courses =
        loadData("courses");

    const course =
        courses.find(course =>
            course.id === courseId
        );

    if(!course){

        showNotification(
            "Course not found."
        );

        return;

    }

    localStorage.setItem(
        "selectedCourse",
        JSON.stringify(course)
    );

    redirectTo(
        "edit-course.html"
    );

}

/* =====================================================
   LOAD COURSE DETAILS
===================================================== */

function loadCourseDetails(){

    const course =
        JSON.parse(
            localStorage.getItem(
                "selectedCourse"
            )
        );

    if(!course){

        return;

    }

    getElement("courseId").value =
        course.id;

    getElement("courseCode").value =
        course.id;

    getElement("courseName").value =
        course.title;

    getElement("category").value =
        course.category || "";

    getElement("duration").value =
        course.duration;

    getElement("level").value =
        course.level || "";

    getElement("courseDescription").value =
        course.description;

}

/* =====================================================
   UPDATE COURSE
===================================================== */

function updateCourse(event){

    event.preventDefault();

    const selectedCourse =
        JSON.parse(
            localStorage.getItem(
                "selectedCourse"
            )
        );

    const courses =
        loadData("courses");

    const courseIndex =
        courses.findIndex(course =>
            course.id === selectedCourse.id
        );

    if(courseIndex === -1){

        return;

    }
    courses[courseIndex].title =
        getElement("courseName").value.trim();

    courses[courseIndex].category =
        getElement("category").value;

    courses[courseIndex].duration =
        getElement("duration").value.trim();

    courses[courseIndex].level =
        getElement("level").value;

    courses[courseIndex].description =
        getElement("courseDescription").value.trim();
    
    saveData(
        "courses",
        courses
    );

    localStorage.removeItem(
        "selectedCourse"
    );

    showNotification(
        "Course updated successfully."
    );

    redirectTo(
        "manage-courses.html"
    );

}

/* =====================================================
   DISPLAY STUDENTS
===================================================== */

function displayStudents(){

    const tableBody =
        getElement("studentTableBody");

    if(!tableBody){

        return;

    }

    const students =
        loadData("students");

    tableBody.innerHTML = "";

    if(students.length === 0){

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No students found.
                </td>
            </tr>
        `;

        return;

    }

    students.forEach(student =>{

        tableBody.innerHTML += `

        <tr>

            <td>${student.id}</td>

            <td>${student.name}</td>

            <td>${student.department || "Not Available"}</td>

            <td>${student.year || "Not Available"}</td>

            <td>${student.email}</td>

            <td>${student.status || "Active"}</td>

            <td>

                <button
                    class="edit-btn"
                    onclick="viewStudentDetails('${student.id}')">

                    View

                </button>

            </td>

        </tr>

        `;

    });

}

/* =====================================================
   STUDENT SEARCH INITIALIZATION
===================================================== */

function initializeStudentSearch(){

    const searchInput =
        getElement("studentSearch");

    if(searchInput){

        searchInput.addEventListener(
            "input",
            searchStudents
        );

    }

}
/* =====================================================
   SEARCH STUDENTS
===================================================== */

function searchStudents(){

    const keyword =
        getElement("studentSearch")
        .value
        .toLowerCase();

    const rows =
        document.querySelectorAll(
            "#studentTableBody tr"
        );

    rows.forEach(row =>{

        if(
            row.textContent
            .toLowerCase()
            .includes(keyword)
        ){

            row.style.display = "";

        }else{

            row.style.display = "none";

        }

    });

}

/* =====================================================
   VIEW STUDENT DETAILS
===================================================== */

function viewStudentDetails(studentId){

    const students =
        loadData("students");

    const student =
        students.find(user =>
            user.id === studentId
        );

    if(!student){

        showNotification(
            "Student not found."
        );

        return;

    }

    localStorage.setItem(
        "selectedStudent",
        JSON.stringify(student)
    );

    redirectTo(
        "student-details.html"
    );

}

/* =====================================================
   LOAD STUDENT DETAILS
===================================================== */

function loadStudentDetails(){

    const student =
        JSON.parse(
            localStorage.getItem(
                "selectedStudent"
            )
        );

    if(!student){

        return;

    }

    const enrolledCourses =
        student.enrolledCourses || [];

    const completedCourses =
        student.completedCourses || [];

    const inProgressCourses =
        enrolledCourses.filter(courseId =>
            !completedCourses.includes(courseId)
        );

    const studentCode =
        getElement("studentCode");

    const studentId =
        getElement("studentId");

    const studentName =
        getElement("studentName");

    const studentEmail =
        getElement("studentEmail");

    const studentDepartment =
        getElement("studentDepartment");

    const studentYear =
        getElement("studentYear");

    const studentStatus =
        getElement("studentStatus");

    const enrolledCount =
        getElement("enrolledCourseCount");

    const completedCount =
        getElement("completedCourseCount");

    const inProgressCount =
        getElement("inProgressCourseCount");

    const certificateCount =
        getElement("certificateCount");


    if(studentCode){

        studentCode.textContent =
            student.id;

    }

    if(studentId){

        studentId.value =
            student.id;

    }

    if(studentName){

        studentName.textContent =
            student.name;

    }

    if(studentEmail){

        studentEmail.textContent =
            student.email;

    }

    if(studentDepartment){

        studentDepartment.textContent =
            student.department ||
            "Not Available";

    }

    if(studentYear){

        studentYear.textContent =
            student.year ||
            "Not Available";

    }

    if(studentStatus){

        studentStatus.textContent =
            student.status ||
            "Active";

    }

    if(enrolledCount){

        enrolledCount.textContent =
            enrolledCourses.length;

    }

    if(completedCount){

        completedCount.textContent =
            completedCourses.length;

    }

    if(inProgressCount){

        inProgressCount.textContent =
            inProgressCourses.length;

    }

    if(certificateCount){

        certificateCount.textContent =
            student.certificates
            ? student.certificates.length
            : 0;

    }

}
/* =====================================================
   DISPLAY STUDENT ENROLLED COURSES
===================================================== */

function displayStudentEnrolledCourses(){

    const tableBody =
        getElement("enrolledCoursesBody");

    if(!tableBody){

        return;

    }

    const student =
        JSON.parse(
            localStorage.getItem(
                "selectedStudent"
            )
        );

    if(!student){

        return;

    }

    const courses =
        loadData("courses");

    const enrolledCourses =
        student.enrolledCourses || [];

    const completedCourses =
        student.completedCourses || [];

    tableBody.innerHTML = "";

    if(enrolledCourses.length === 0){

        tableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    No courses enrolled.
                </td>
            </tr>
        `;

        return;

    }

    enrolledCourses.forEach(courseId =>{

        const course =
            courses.find(item =>
                item.id === courseId
            );

        if(course){

            const isCompleted =
                completedCourses.includes(courseId);

            const progress =
                isCompleted
                ? "100%"
                : "In Progress";

            tableBody.innerHTML += `

                <tr>

                    <td>${course.id}</td>

                    <td>${course.title}</td>

                    <td>${progress}</td>

                </tr>

            `;

        }

    });

}
/* =====================================================
   VIEW ENROLLMENTS
===================================================== */

function displayEnrollments(){

    const tableBody =
        getElement("enrollmentTableBody");

    if(!tableBody){

        return;

    }

    const students =
        loadData("students");

    const courses =
        loadData("courses");

    tableBody.innerHTML = "";

    let totalEnrollments = 0;

    students.forEach(student =>{

        const enrollments =
            student.enrollments || [];

        enrollments.forEach(enrollment =>{

            const course =
                courses.find(item =>
                    item.id === enrollment.courseId
                );

            if(!course){

                return;

            }

            totalEnrollments++;

            tableBody.innerHTML += `

                <tr>

                    <td>${student.id}</td>

                    <td>${student.name}</td>

                    <td>${course.title}</td>

                    <td>${enrollment.enrollmentDate}</td>

                    <td>${enrollment.status}</td>

                </tr>

            `;

        });

    });

    const totalElement =
        getElement("totalEnrollments");

    if(totalElement){

        totalElement.textContent =
            totalEnrollments;

    }

    if(totalEnrollments === 0){

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No enrollments found.
                </td>
            </tr>
        `;

    }

}
/* =====================================================
   ENROLLMENT SEARCH INITIALIZATION
===================================================== */

function initializeEnrollmentSearch(){

    const searchInput =
        getElement("enrollmentSearch");

    if(searchInput){

        searchInput.addEventListener(
            "input",
            searchEnrollments
        );

    }

}
/* =====================================================
   SEARCH ENROLLMENTS
===================================================== */

function searchEnrollments(){

    const searchInput =
        getElement("enrollmentSearch");

    if(!searchInput){

        return;

    }

    const keyword =
        searchInput.value
        .toLowerCase()
        .trim();

    const rows =
        document.querySelectorAll(
            "#enrollmentTableBody tr"
        );

    rows.forEach(row =>{

        if(
            row.textContent
            .toLowerCase()
            .includes(keyword)
        ){

            row.style.display = "";

        }
        else{

            row.style.display = "none";

        }

    });

}
/* =====================================================
   DASHBOARD SUMMARY
===================================================== */

function displayDashboardSummary(){

    const courses =
        loadData("courses");

    const students =
        loadData("students");

    const totalEnrollments =
        students.reduce((total,student) =>{

            return total +
                student.enrolledCourses.length;

        },0);

    const totalCompleted =
        students.reduce((total,student) =>{

            return total +
                student.completedCourses.length;

        },0);

    const enrollmentElement =
        getElement("totalEnrollments");

    const completionElement =
        getElement("totalCompleted");

    if(enrollmentElement){

        enrollmentElement.textContent =
            totalEnrollments;

    }

    if(completionElement){

        completionElement.textContent =
            totalCompleted;

    }

}

/* =====================================================
   COURSE ANALYTICS
===================================================== */

function displayCourseAnalytics(){

    const analyticsTable =
        getElement("analyticsTableBody");

    if(!analyticsTable){

        return;

    }

    const courses =
        loadData("courses");

    const students =
        loadData("students");

    analyticsTable.innerHTML = "";

    courses.forEach(course =>{

        let enrolled = 0;

        let completed = 0;

        students.forEach(student =>{

            if(student.enrolledCourses.includes(course.id)){

                enrolled++;

            }

            if(student.completedCourses.includes(course.id)){

                completed++;

            }

        });

        analyticsTable.innerHTML += `

        <tr>

            <td>${course.title}</td>

            <td>${enrolled}</td>

            <td>${completed}</td>

        </tr>

        `;

    });

}

/* =====================================================
   STUDENT ANALYTICS
===================================================== */

function displayStudentAnalytics(){

    const analyticsBody =
        getElement("studentAnalyticsBody");

    if(!analyticsBody){

        return;

    }

    const students =
        loadData("students");

    analyticsBody.innerHTML = "";

    students.forEach(student =>{

        const enrolled =
            student.enrolledCourses.length;

        const completed =
            student.completedCourses.length;

        const percentage =
            enrolled === 0
            ? 0
            : Math.round(
                (completed / enrolled) * 100
            );

        analyticsBody.innerHTML += `

        <tr>

            <td>${student.name}</td>

            <td>${enrolled}</td>

            <td>${completed}</td>

            <td>${percentage}%</td>

        </tr>

        `;

    });

}

/* =====================================================
   ADMIN NOTIFICATION
===================================================== */

function adminNotification(message){

    showNotification(message);

}

/* =====================================================
   REFRESH ADMIN DASHBOARD
===================================================== */

function refreshAdminDashboard(){

    displayCourses();

    displayStudents();

    displayEnrollments();

    displayDashboardSummary();

    displayCourseAnalytics();

    displayStudentAnalytics();

    updateAdminDashboard();

}

/* =====================================================
   EXPORT SUMMARY
===================================================== */

function exportSummary(){

    const courses =
        loadData("courses");

    const students =
        loadData("students");

    const report = {

        generatedOn:
            new Date().toLocaleString(),

        totalCourses:
            courses.length,

        totalStudents:
            students.length,

        totalEnrollments:
            students.reduce((count,student)=>{

                return count +
                    student.enrolledCourses.length;

            },0),

        totalCompleted:
            students.reduce((count,student)=>{

                return count +
                    student.completedCourses.length;

            },0)

    };

    console.table(report);

    showNotification(
        "Summary exported to browser console."
    );

}
/* =====================================================
   EXPOSE ADMIN FUNCTIONS FOR HTML BUTTONS
===================================================== */

window.editCourse = editCourse;
window.deleteCourse = deleteCourse;
window.viewStudentDetails = viewStudentDetails;
window.refreshAdminDashboard = refreshAdminDashboard;
window.exportSummary = exportSummary;
