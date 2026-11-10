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
import Profile from "./pages/Profile.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageCourses from "./pages/ManageCourses.jsx";
import AddCourse from "./pages/AddCourse.jsx";
import EditCourse from "./pages/EditCourse.jsx";
import ManageStudents from "./pages/ManageStudents.jsx";
import StudentDetails from "./pages/StudentDetails.jsx";
import ViewEnrollments from "./pages/ViewEnrollments.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import Certificate from "./pages/Certificate.jsx";
import Chat from "./components/Chat.jsx";
import AdminChat from "./pages/AdminChat.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { issueCertificate, normalizeCourses } from "./utils/courseUtils.js";

const studentRoute = (element) => <ProtectedRoute role="student">{element}</ProtectedRoute>;
const adminRoute = (element) => <ProtectedRoute role="admin">{element}</ProtectedRoute>;

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
                element={studentRoute(<StudentDashboard />)}
            />

            <Route
                path="/student-dashboard.html"
                element={studentRoute(<StudentDashboard />)}
            />

            <Route
                path="/profile"
                element={studentRoute(<Profile />)}
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
                element={studentRoute(<CourseDetails />)}
            />

            <Route
                path="/my-courses"
                element={studentRoute(<MyCourses />)}
            />

            <Route
                path="/my-courses.html"
                element={studentRoute(<MyCourses />)}
            />

            <Route
                path="/progress"
                element={studentRoute(<Progress />)}
            />

            <Route
                path="/progress.html"
                element={studentRoute(<Progress />)}
            />

            <Route
                path="/notifications"
                element={studentRoute(<Notifications />)}
            />

            <Route
                path="/notifications.html"
                element={studentRoute(<Notifications />)}
            />

            <Route path="/chat" element={studentRoute(<Chat />)} />

            <Route
                path="/certificate/:certificateId"
                element={<ProtectedRoute roles={["student", "admin"]}><Certificate /></ProtectedRoute>}
            />

            {/* =========================
                ADMIN PAGES
            ========================== */}

            <Route
                path="/admin-dashboard"
                element={adminRoute(<AdminDashboard />)}
            />

            <Route
                path="/admin-dashboard.html"
                element={adminRoute(<AdminDashboard />)}
            />

            <Route
                path="/admin-chat"
                element={adminRoute(<AdminChat />)}
            />

            <Route
                path="/manage-courses"
                element={adminRoute(<ManageCourses />)}
            />

            <Route
                path="/manage-courses.html"
                element={adminRoute(<ManageCourses />)}
            />

            <Route
                path="/add-course"
                element={adminRoute(<AddCourse />)}
            />

            <Route
                path="/add-course.html"
                element={adminRoute(<AddCourse />)}
            />

            <Route
                path="/edit-course/:id"
                element={adminRoute(<EditCourse />)}
            />

            <Route
                path="/edit-course.html"
                element={adminRoute(<EditCourse />)}
            />

            <Route
                path="/manage-students"
                element={adminRoute(<ManageStudents />)}
            />

            <Route
                path="/manage-students.html"
                element={adminRoute(<ManageStudents />)}
            />

            <Route
                path="/student-details/:studentId"
                element={adminRoute(<StudentDetails />)}
            />

            <Route
                path="/student-details"
                element={adminRoute(<StudentDetails />)}
            />

            <Route
                path="/student-details.html"
                element={adminRoute(<StudentDetails />)}
            />

            <Route
                path="/view-enrollments"
                element={adminRoute(<ViewEnrollments />)}
            />

            <Route
                path="/view-enrollments.html"
                element={adminRoute(<ViewEnrollments />)}
            />

        </Routes>
    );
};

export default App;