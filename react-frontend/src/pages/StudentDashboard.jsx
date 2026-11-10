import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { useAuth } from "../auth/useAuth.js";
import api from "../services/api.js";

const StudentDashboard = () => {
    const { user } = useAuth();
    const userId = String(user?.id || user?._id || "");
    const [snapshot, setSnapshot] = useState(null);
    const [loadedForUserId, setLoadedForUserId] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            if (!userId) return;
            try {
                const [enrollmentResponse, progressResponse, certificateResponse, notificationResponse] = await Promise.all([
                    api.get("/api/v1/enrollments/mine"),
                    api.get("/api/v1/progress/mine"),
                    api.get("/api/v1/certificates/mine"),
                    api.get("/api/v1/notifications")
                ]);
                if (!active) return;
                setSnapshot({
                    userId,
                    enrollments: enrollmentResponse.data.enrollments || [],
                    progress: progressResponse.data.progress || [],
                    certificates: certificateResponse.data.certificates || [],
                    notifications: notificationResponse.data.notifications || []
                });
                setError("");
            } catch (requestError) {
                if (!active) return;
                setSnapshot({ userId, enrollments: [], progress: [], certificates: [], notifications: [] });
                setError(requestError.response?.data?.message || "Unable to load your dashboard data.");
            } finally {
                if (active) {
                    setLoadedForUserId(userId);
                    setRefreshing(false);
                }
            }
        };

        const refreshDashboard = () => {
            setRefreshing(true);
            setRefreshVersion((version) => version + 1);
        };

        window.addEventListener("dashboardDataChanged", refreshDashboard);
        void loadDashboard();

        return () => {
            active = false;
            window.removeEventListener("dashboardDataChanged", refreshDashboard);
        };
    }, [userId, refreshVersion]);

    const currentSnapshot = snapshot?.userId === userId ? snapshot : null;
    const enrollments = (currentSnapshot?.enrollments || []).filter((item) => item.status !== "withdrawn");
    const completedCourses = enrollments.filter((item) => item.status === "completed").length;
    const inProgressCourses = enrollments.filter((item) => item.status === "active").length;
    const loading = Boolean(userId) && (loadedForUserId !== userId || refreshing);
    const courseName = (course) => course?.courseName || course?.courseCode || "a course";
    const recentActivity = [
        ...enrollments.map((enrollment) => ({
            id: `enrollment-${enrollment._id}`,
            text: enrollment.status === "completed"
                ? `Completed ${courseName(enrollment.course)}`
                : `Enrolled in ${courseName(enrollment.course)}`,
            date: enrollment.status === "completed"
                ? enrollment.updatedAt || enrollment.createdAt
                : enrollment.enrolledAt || enrollment.createdAt
        })),
        ...(currentSnapshot?.progress || []).map((item) => ({
            id: `progress-${item._id}`,
            text: `Completed ${item.completedLessons} of ${item.totalLessons} resources in ${courseName(item.course)}`,
            date: item.updatedAt || item.createdAt
        })),
        ...(currentSnapshot?.certificates || []).map((certificate) => ({
            id: `certificate-${certificate._id}`,
            text: `Certificate issued for ${courseName(certificate.course)}`,
            date: certificate.issuedAt || certificate.createdAt
        })),
        ...(currentSnapshot?.notifications || []).map((notification) => ({
            id: `notification-${notification._id}`,
            text: notification.message,
            date: notification.createdAt
        }))
    ].filter((item) => item.date && !Number.isNaN(new Date(item.date).getTime()))
        .sort((left, right) => new Date(right.date) - new Date(left.date))
        .slice(0, 6);

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />

            <div className="container">

                {/* Sidebar */}

                <StudentSidebar />

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
                                {user?.name || "Student"}
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
                                {loading ? "..." : enrollments.length}
                            </h2>

                            <p>
                                Enrolled Courses
                            </p>

                        </div>

                        <div className="box">

                            <i className="fa-solid fa-circle-check"></i>

                            <h2 id="completedCourses">
                                {loading ? "..." : completedCourses}
                            </h2>

                            <p>
                                Completed Courses
                            </p>

                        </div>

                        <div className="box">

                            <i className="fa-solid fa-chart-line"></i>

                            <h2 id="inProgressCourses">
                                {loading ? "..." : inProgressCourses}
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

                        {error && <p role="alert">{error}</p>}
                        <div id="recentActivityList" aria-live="polite">
                            {loading ? (
                                <p role="status">Loading recent activity...</p>
                            ) : recentActivity.length === 0 ? (
                                <p>No recent activity available.</p>
                            ) : (
                                <ul>
                                    {recentActivity.map((activity) => (
                                        <li key={activity.id}>
                                            <span>{activity.text}</span>{" "}
                                            <time dateTime={new Date(activity.date).toISOString()}>
                                                {new Date(activity.date).toLocaleString()}
                                            </time>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </section>

                </main>

            </div>
        </>
    );
};

export default StudentDashboard;