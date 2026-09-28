import LegacyScript from "../components/LegacyScript.jsx";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";

const StudentDashboard = () => {
    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />

            <div className="container">

                {/* Sidebar */}

                <aside className="sidebar">

                    <h2>
                        <i className="fa-solid fa-graduation-cap"></i>
                        SCMS
                    </h2>

                    <p>
                        Student Course Management
                    </p>

                    <ul>

                        <li className="active">
                            <Link to="/student-dashboard">
                                <i className="fa-solid fa-house"></i>
                                Dashboard
                            </Link>
                        </li>

                        <li>
                            <Link to="/courses">
                                <i className="fa-solid fa-book"></i>
                                Courses
                            </Link>
                        </li>

                        <li>
                            <Link to="/my-courses">
                                <i className="fa-solid fa-graduation-cap"></i>
                                My Courses
                            </Link>
                        </li>

                        <li>
                            <Link to="/progress">
                                <i className="fa-solid fa-chart-line"></i>
                                Progress
                            </Link>
                        </li>

                        <li>
                            <Link to="/notifications">
                                <i className="fa-solid fa-bell"></i>
                                Notifications
                            </Link>
                        </li>

                        <li>
                            <LogoutButton />
                        </li>

                    </ul>

                </aside>

                {/* Main Content */}

                <main className="main-content">

                    <header className="topbar">

                        <h1>
                            Dashboard
                        </h1>

                    </header>

                    {/* Welcome Card */}

                    <section className="welcome-card">

                        <h2>
                            Welcome Back,{" "}
                            <span id="studentName">
                                Student
                            </span>{" "}
                            👋
                        </h2>

                        <br />

                        <p>
                            Access your courses, monitor your learning progress,
                            and manage your academic journey through the
                            Student Course Management System.
                        </p>

                    </section>

                    {/* =========================
                        DASHBOARD STATISTICS
                    ========================== */}

                    <section className="cards">

                        <div className="box">

                            <i className="fa-solid fa-book-open"></i>

                            <h2 id="enrolledCourses">
                                0
                            </h2>

                            <p>
                                Enrolled Courses
                            </p>

                        </div>

                        <div className="box">

                            <i className="fa-solid fa-circle-check"></i>

                            <h2 id="completedCourses">
                                0
                            </h2>

                            <p>
                                Completed Courses
                            </p>

                        </div>

                        <div className="box">

                            <i className="fa-solid fa-chart-line"></i>

                            <h2 id="inProgressCourses">
                                0
                            </h2>

                            <p>
                                In Progress
                            </p>

                        </div>

                    </section>

                    {/* =========================
                        RECENT ACTIVITY
                    ========================== */}

                    <section className="recent">

                        <h2>
                            Recent Activity
                        </h2>

                        <div id="recentActivityList">

                            <p>
                                No recent activity available.
                            </p>

                        </div>

                    </section>

                </main>

            </div>
            <LegacyScript src="/legacy/js/main.js" module />
<LegacyScript src="/legacy/js/student.js" module />
        </>
    );
};

export default StudentDashboard;