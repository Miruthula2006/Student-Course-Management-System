import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";

import StudentLogin from "./pages/StudentLogin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

import StudentDashboard from "./pages/StudentDashboard.jsx";
import Courses from "./pages/Courses.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import Progress from "./pages/Progress.jsx";
import Notifications from "./pages/Notifications.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageCourses from "./pages/ManageCourses.jsx";
import AddCourse from "./pages/AddCourse.jsx";
import EditCourse from "./pages/EditCourse.jsx";
import ManageStudents from "./pages/ManageStudents.jsx";
import StudentDetails from "./pages/StudentDetails.jsx";
import ViewEnrollments from "./pages/ViewEnrollments.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import Certificate from "./pages/Certificate.jsx";
import { issueCertificate, normalizeCourses } from "./utils/courseUtils.js";

const App = () => {

    useEffect(() => {
        const demoIds = new Set([
            "ST001","ST002","ST003","ST004",
            "ST005","ST006","ST007","ST008"
        ]);

        try {
            const students = JSON.parse(
                localStorage.getItem("students") || "[]"
            );

            if (Array.isArray(students)) {
                const realStudents = students.filter(
                    student => !demoIds.has(String(student.id))
                );

                const courses = normalizeCourses(JSON.parse(localStorage.getItem("courses") || "[]"));
                localStorage.setItem("courses", JSON.stringify(courses));

                // Keep certificates in sync for courses that were already marked complete in the older Task 1-5 flow.
                realStudents.forEach((student) => {
                    const completed = Array.isArray(student.completedCourses) ? student.completedCourses : [];
                    completed.forEach((courseId) => {
                        const course = courses.find((item) => item.id === courseId);
                        if (course) issueCertificate(student, course);
                    });
                });

                if (realStudents.length !== students.length || realStudents.some((student, index) => JSON.stringify(student) !== JSON.stringify(students[index]))) {
                    localStorage.setItem(
                        "students",
                        JSON.stringify(realStudents)
                    );
                }

                const loggedInUser = JSON.parse(
                    localStorage.getItem("loggedInUser") || "null"
                );

                if (
                    loggedInUser &&
                    demoIds.has(String(loggedInUser.id))
                ) {
                    localStorage.removeItem("loggedInUser");
                    window.dispatchEvent(new Event("authChanged"));
                }
            }
        } catch (error) {
            console.error("Unable to clean demo student data:", error);
        }
    }, []);

    return (
        <Routes>

            {/* =========================
                HOME
            ========================== */}

            <Route path="/" element={<Home />} />
            <Route path="/index.html" element={<Home />} />

            {/* =========================
                AUTHENTICATION
            ========================== */}

            <Route
                path="/student-login"
                element={<StudentLogin />}
            />

            <Route
                path="/student-login.html"
                element={<StudentLogin />}
            />

            <Route
                path="/admin-login"
                element={<AdminLogin />}
            />

            <Route
                path="/admin-login.html"
                element={<AdminLogin />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/register.html"
                element={<Register />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            <Route
                path="/forgot-password.html"
                element={<ForgotPassword />}
            />

            {/* =========================
                STUDENT PAGES
            ========================== */}

            <Route
                path="/student-dashboard"
                element={<StudentDashboard />}
            />

            <Route
                path="/student-dashboard.html"
                element={<StudentDashboard />}
            />

            <Route
                path="/courses"
                element={<Courses />}
            />

            <Route
                path="/courses.html"
                element={<Courses />}
            />

            <Route
                path="/course/:courseId"
                element={<CourseDetails />}
            />

            <Route
                path="/my-courses"
                element={<MyCourses />}
            />

            <Route
                path="/my-courses.html"
                element={<MyCourses />}
            />

            <Route
                path="/progress"
                element={<Progress />}
            />

            <Route
                path="/progress.html"
                element={<Progress />}
            />

            <Route
                path="/notifications"
                element={<Notifications />}
            />

            <Route
                path="/notifications.html"
                element={<Notifications />}
            />

            <Route
                path="/certificate/:certificateId"
                element={<Certificate />}
            />

            {/* =========================
                ADMIN PAGES
            ========================== */}

            <Route
                path="/admin-dashboard"
                element={<AdminDashboard />}
            />

            <Route
                path="/admin-dashboard.html"
                element={<AdminDashboard />}
            />

            <Route
                path="/manage-courses"
                element={<ManageCourses />}
            />

            <Route
                path="/manage-courses.html"
                element={<ManageCourses />}
            />

            <Route
                path="/add-course"
                element={<AddCourse />}
            />

            <Route
                path="/add-course.html"
                element={<AddCourse />}
            />

            <Route
                path="/edit-course/:id"
                element={<EditCourse />}
            />

            <Route
                path="/edit-course.html"
                element={<EditCourse />}
            />

            <Route
                path="/manage-students"
                element={<ManageStudents />}
            />

            <Route
                path="/manage-students.html"
                element={<ManageStudents />}
            />

            <Route
                path="/student-details"
                element={<StudentDetails />}
            />

            <Route
                path="/student-details.html"
                element={<StudentDetails />}
            />

            <Route
                path="/view-enrollments"
                element={<ViewEnrollments />}
            />

            <Route
                path="/view-enrollments.html"
                element={<ViewEnrollments />}
            />

        </Routes>
    );
};

export default App;