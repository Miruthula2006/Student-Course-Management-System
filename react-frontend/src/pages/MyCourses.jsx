import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import LogoutButton from "../components/LogoutButton.jsx";
import api from "../services/api.js";

const MyCourses = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [progressByCourse, setProgressByCourse] = useState({});
    const [certificateByCourse, setCertificateByCourse] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([
            api.get("/api/v1/enrollments/mine"),
            api.get("/api/v1/progress/mine"),
            api.get("/api/v1/certificates/mine")
        ]).then(([enrollmentResponse, progressResponse, certificateResponse]) => {
            if (!active) return;
            setEnrolledCourses(enrollmentResponse.data.enrollments
                .map((item) => item.course)
                .filter(Boolean)
                .map((course) => ({
                    ...course,
                    title: course.title || course.courseName,
                    description: course.description || course.overview || "No description available."
                })));
            setProgressByCourse(Object.fromEntries(
                progressResponse.data.progress.map((item) => [String(item.course?._id || item.course), item])
            ));
            setCertificateByCourse(Object.fromEntries(
                certificateResponse.data.certificates.map((item) => [String(item.course?._id || item.course), item])
            ));
            setError("");
        }).catch((requestError) => {
            if (active) setError(requestError.response?.data?.message || "Unable to load your courses.");
        });
        return () => { active = false; };
    }, [user]);

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />
            <div className="container">
                <aside className="sidebar">
                    <h2><i className="fa-solid fa-graduation-cap"></i> SCMS</h2>
                    <p>Student Course Management</p>
                    <ul>
                        <li><Link to="/student-dashboard"><i className="fa-solid fa-house"></i>Dashboard</Link></li>
                        <li><Link to="/courses"><i className="fa-solid fa-book"></i>Courses</Link></li>
                        <li className="active"><Link to="/my-courses"><i className="fa-solid fa-graduation-cap"></i>My Courses</Link></li>
                        <li><Link to="/progress"><i className="fa-solid fa-chart-line"></i>Progress</Link></li>
                        <li><Link to="/notifications"><i className="fa-solid fa-bell"></i>Notifications</Link></li>
                        <li><LogoutButton /></li>
                    </ul>
                </aside>
                <main className="main-content">
                    <header className="topbar">
                        <h1>My Learning</h1>
                        <p>Continue your courses, finish the learning resources, and earn certificates.</p>
                    </header>
                    <section className="course-grid">
                        {error && <p role="alert">{error}</p>}
                        {enrolledCourses.length === 0 ? (
                            <div className="course-card">
                                <h2>No courses enrolled yet</h2>
                                <p>Browse the course catalog and enroll in a course to begin learning.</p>
                                <Link to="/courses" className="student-btn">Browse Courses</Link>
                            </div>
                        ) : enrolledCourses.map((course) => {
                            const courseProgress = progressByCourse[String(course._id || course.id)];
                            const total = courseProgress?.totalLessons || course.materials?.length || 0;
                            const completed = courseProgress?.completedLessons || 0;
                            const progress = {
                                percent: courseProgress?.progressPercent || 0,
                                completedCount: completed,
                                total,
                                complete: total > 0 && completed === total
                            };
                            const certificate = certificateByCourse[String(course._id || course.id)];
                            return (
                                <article className="course-card scms-course-card" key={course._id || course.id}>
                                    <div className="course-card-badge">{course.category}</div>
                                    <h3>{course.title}</h3>
                                    <p>{course.description}</p>
                                    <p><strong>Instructor:</strong> {course.instructor || "Not Assigned"}</p>
                                    <div className="learning-progress">
                                        <div className="learning-progress-label"><span>Learning progress</span><strong>{progress.percent}%</strong></div>
                                        <div className="learning-progress-track"><span style={{ width: `${progress.percent}%` }} /></div>
                                        <small>{progress.completedCount} of {progress.total} resources completed</small>
                                    </div>
                                    <div className="course-card-actions">
                                        <Link to={`/course/${encodeURIComponent(course._id || course.id)}`} className="student-btn">{progress.complete ? "Review Course" : "Continue Learning"}</Link>
                                        {certificate && <Link to={`/certificate/${encodeURIComponent(certificate._id)}`} className="secondary-action">View Certificate</Link>}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                </main>
            </div>
        </>
    );
};

export default MyCourses;
