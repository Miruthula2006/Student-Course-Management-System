import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { useAuth } from "../auth/useAuth.js";
import { io } from "socket.io-client";
import api from "../services/api.js";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        api.get("/api/v1/notifications")
            .then((response) => {
                if (active) setNotifications(response.data.notifications || []);
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || "Unable to load notifications.");
            });

        const socket = io(socketUrl, {
            auth: { token: sessionStorage.getItem("token") }
        });
        socket.on("new_notification", (notification) => {
            setNotifications((current) => [notification, ...current]);
        });

        return () => {
            active = false;
            socket.disconnect();
        };
    }, [user]);

    async function markAsRead(id) {
        try {
            const response = await api.patch(`/api/v1/notifications/${encodeURIComponent(id)}/read`);
            setNotifications((current) => current.map((item) => item._id === id ? response.data.notification : item));
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to update notification.");
        }
    }

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />

            <div className="container">

                {/* =========================
                    SIDEBAR
                ========================== */}

                <StudentSidebar />

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

                        {error && <p role="alert">{error}</p>}

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
                                    key={notification._id || notification.id}
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

                                    <p><strong>Date:</strong> {new Date(notification.createdAt || notification.date).toLocaleString()}</p>
                                    {!notification.isRead && (
                                        <button type="button" className="student-btn" onClick={() => markAsRead(notification._id)}>
                                            Mark as read
                                        </button>
                                    )}

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