import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import LogoutButton from "../components/LogoutButton.jsx";
import { useCourses } from "../context/CourseContext.jsx";

const AdminDashboard = () => {
    const { user } = useAuth();

    const {
        courses,
        loading,
        error,
        fetchCourses
    } = useCourses();

    const [totalStudents, setTotalStudents] = useState(0);
    const [totalEnrollments, setTotalEnrollments] = useState(0);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, [user]);

    useEffect(() => {
        const students =
            JSON.parse(localStorage.getItem("students")) || [];

        setTotalStudents(students.length);

        const enrollments = students.reduce((total, student) => {
            if (Array.isArray(student.enrollments)) {
                return total + student.enrollments.length;
            }

            if (Array.isArray(student.enrolledCourses)) {
                return total + student.enrolledCourses.length;
            }

            return total;
        }, 0);

        setTotalEnrollments(enrollments);

        const activities = [];

        students.forEach((student) => {
            if (Array.isArray(student.enrollments)) {
                student.enrollments.forEach((enrollment) => {
                    activities.push({
                        type: "Enrollment",
                        student: student.name || student.email,
                        course: enrollment.courseId,
                        date: enrollment.enrollmentDate || ""
                    });
                });
            }
        });

        setRecentActivity(
            activities.slice(-5).reverse()
        );
    }, [user]);

    const totalCourses = courses.length;

    const activeCourses = courses.filter(
        (course) =>
            !course.status ||
            course.status.toLowerCase() === "active"
    ).length;

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />

            <div className="container">

                {/* =========================
                    SIDEBAR
                ========================== */}

                <aside className="sidebar">

                    <h2>
                        <i className="fa-solid fa-user-shield"></i>
                        SCMS
                    </h2>

                    <p>
                        Administrator Panel
                    </p>

                    <ul>

                        <li className="active">
                            <Link to="/admin-dashboard">
                                <i className="fa-solid fa-house"></i>
                                Dashboard
                            </Link>
                        </li>

                        <li>
                            <Link to="/manage-courses">
                                <i className="fa-solid fa-book"></i>
                                Manage Courses
                            </Link>
                        </li>

                        <li>
                            <Link to="/add-course">
                                <i className="fa-solid fa-circle-plus"></i>
                                Add Course
                            </Link>
                        </li>

                        <li>
                            <Link to="/manage-students">
                                <i className="fa-solid fa-users"></i>
                                Manage Students
                            </Link>
                        </li>

                        <li>
                            <Link to="/view-enrollments">
                                <i className="fa-solid fa-user-check"></i>
                                Enrollments
                            </Link>
                        </li>

                        <li>
                            <LogoutButton admin />
                        </li>

                    </ul>

                </aside>

                {/* =========================
                    MAIN CONTENT
                ========================== */}

                <main className="main-content">

                    <header className="topbar">

                        <h1 id="pageTitle">
                            Dashboard
                        </h1>

                        <br />

                        <p id="pageSubtitle">
                            Welcome to the Administrator Dashboard.
                        </p>

                    </header>

                    {/* =========================
                        DASHBOARD STATISTICS
                    ========================== */}

                    <section className="cards">

                        <div className="box">

                            <i className="fa-solid fa-user-graduate"></i>

                            <h2 id="totalStudents">
                                {totalStudents}
                            </h2>

                            <p>
                                Total Students
                            </p>

                        </div>

                        <div className="box">

                            <i className="fa-solid fa-book"></i>

                            <h2 id="totalCourses">

                                {loading
                                    ? "..."
                                    : error
                                    ? "!"
                                    : totalCourses}

                            </h2>

                            <p>
                                Total Courses
                            </p>

                        </div>

                        <div className="box">

                            <i className="fa-solid fa-user-check"></i>

                            <h2 id="totalEnrollments">
                                {totalEnrollments}
                            </h2>

                            <p>
                                Total Enrollments
                            </p>

                        </div>

                        <div className="box">

                            <i className="fa-solid fa-circle-check"></i>

                            <h2 id="activeCourses">

                                {loading
                                    ? "..."
                                    : error
                                    ? "!"
                                    : activeCourses}

                            </h2>

                            <p>
                                Active Courses
                            </p>

                        </div>

                    </section>

                    {/* =========================
                        COURSE API ERROR
                    ========================== */}

                    {error && (
                        <p style={{ padding: "10px" }}>
                            {error}
                        </p>
                    )}

                    {/* =========================
                        RECENT ACTIVITY
                    ========================== */}

                    <section className="recent">

                        <h2>
                            Recent Activity
                        </h2>

                        <div id="recentActivityList">

                            {recentActivity.length === 0 ? (

                                <p>
                                    No recent activity available.
                                </p>

                            ) : (

                                recentActivity.map((activity, index) => (

                                    <div
                                        key={index}
                                        className="activity-item"
                                    >

                                        <p>

                                            <strong>
                                                {activity.type}:
                                            </strong>{" "}

                                            {activity.student} enrolled in{" "}

                                            <strong>
                                                {activity.course}
                                            </strong>

                                        </p>

                                        {activity.date && (
                                            <small>
                                                {activity.date}
                                            </small>
                                        )}

                                    </div>

                                ))

                            )}

                        </div>

                    </section>

                </main>

            </div>
        </>
    );
};

export default AdminDashboard;