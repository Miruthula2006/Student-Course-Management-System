import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const students =
            JSON.parse(localStorage.getItem("students")) || [];

        if (!user) {
            setNotifications([]);
            return;
        }

        const student = students.find(
            (item) => item.email === user.email
        );

        if (
            !student ||
            !Array.isArray(student.notifications)
        ) {
            setNotifications([]);
            return;
        }

        setNotifications(student.notifications);
    }, [user]);

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
                        <i className="fa-solid fa-graduation-cap"></i>
                        SCMS
                    </h2>

                    <p>
                        Student Course Management
                    </p>

                    <ul>

                        <li>
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

                        <li className="active">
                            <Link to="/notifications">
                                <i className="fa-solid fa-bell"></i>
                                Notifications
                            </Link>
                        </li>

                        <li>
                            <a href="#" id="logoutBtn">
                                <i className="fa-solid fa-right-from-bracket"></i>
                                Logout
                            </a>
                        </li>

                    </ul>

                </aside>

                {/* =========================
                    MAIN CONTENT
                ========================== */}

                <main className="main-content">

                    <header className="topbar">

                        <h1 id="pageTitle">
                            Notifications
                        </h1>

                        <p id="pageSubtitle">
                            Stay updated with announcements, assignments,
                            quizzes, and important course activities.
                        </p>

                    </header>

                    {/* =========================
                        NOTIFICATIONS SECTION
                    ========================== */}

                    <section id="notificationContainer">

                        {notifications.length === 0 ? (

                            <article
                                className="course-card"
                                id="emptyNotificationCard"
                            >

                                <h2 id="emptyNotificationTitle">
                                    No Notifications
                                </h2>

                                <br />

                                <p id="emptyNotificationMessage">
                                    You don't have any notifications at the moment.
                                </p>

                                <br />

                                <p>
                                    New course announcements, assignment reminders,
                                    quiz schedules, examination updates, certificates,
                                    and other important notices will appear here
                                    automatically.
                                </p>

                                <br />

                                <Link
                                    to="/student-dashboard"
                                    className="dashboard-link"
                                    aria-label="Return to Student Dashboard"
                                >
                                    <button
                                        type="button"
                                        className="student-btn"
                                        id="dashboardBtn"
                                    >
                                        Back to Dashboard
                                    </button>
                                </Link>

                            </article>

                        ) : (

                            notifications.map((notification) => (

                                <article
                                    className="course-card"
                                    key={notification.id}
                                >

                                    <h2>
                                        <i className="fa-solid fa-bell"></i>{" "}
                                        Notification
                                    </h2>

                                    <br />

                                    <p>
                                        {notification.message}
                                    </p>

                                    <br />

                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {notification.date}
                                    </p>

                                    <p>
                                        <strong>Time:</strong>{" "}
                                        {notification.time}
                                    </p>

                                </article>

                            ))

                        )}

                    </section>

                </main>

            </div>
        </>
    );
};

export default Notifications;