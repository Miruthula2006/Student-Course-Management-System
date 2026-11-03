import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import api from "../services/api.js";

const Progress = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [progress, setProgress] = useState([]);
    const [certificateCount, setCertificateCount] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([api.get("/api/v1/enrollments/mine"), api.get("/api/v1/progress/mine"), api.get("/api/v1/certificates/mine")])
            .then(([enrollmentResponse, progressResponse, certificateResponse]) => {
                if (!active) return;
                setEnrollments(enrollmentResponse.data.enrollments || []);
                setProgress(progressResponse.data.progress || []);
                setCertificateCount(certificateResponse.data.certificates?.length || 0);
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || "Unable to load learning progress.");
            });
        return () => { active = false; };
    }, []);

    const enrolledCourses = enrollments.map((item) => item.course).filter(Boolean);
    const completedCount = enrollments.filter((item) => item.status === "completed").length;
    const overall = progress.length ? Math.round(progress.reduce((sum, item) => sum + item.progressPercent, 0) / progress.length) : 0;

    return (
        <>
            <PageCss href="/css/style.css" /><PageCss href="/css/dashboard.css" />
            <div className="container">
                <aside className="sidebar">
                    <h2><i className="fa-solid fa-graduation-cap"></i> SCMS</h2><p>Student Course Management</p>
                    <ul>
                        <li><Link to="/student-dashboard"><i className="fa-solid fa-house"></i>Dashboard</Link></li>
                        <li><Link to="/courses"><i className="fa-solid fa-book"></i>Courses</Link></li>
                        <li><Link to="/my-courses"><i className="fa-solid fa-graduation-cap"></i>My Courses</Link></li>
                        <li className="active"><Link to="/progress"><i className="fa-solid fa-chart-line"></i>Progress</Link></li>
                        <li><Link to="/notifications"><i className="fa-solid fa-bell"></i>Notifications</Link></li>
                        <li><LogoutButton /></li>
                    </ul>
                </aside>
                <main className="main-content">
                    <header className="topbar"><h1>Learning Progress</h1><p>Track lessons, course completion, and certificates.</p></header>
                    <section className="cards">
                        <article className="box"><i className="fa-solid fa-chart-pie"></i><h2>{overall}%</h2><p>Overall Progress</p></article>
                        <article className="box"><i className="fa-solid fa-book-open"></i><h2>{enrolledCourses.length}</h2><p>Enrolled Courses</p></article>
                        <article className="box"><i className="fa-solid fa-circle-check"></i><h2>{completedCount}</h2><p>Completed Courses</p></article>
                        <article className="box"><i className="fa-solid fa-award"></i><h2>{certificateCount}</h2><p>Certificates</p></article>
                    </section>
                    <section className="course-card">
                        {error && <p role="alert">{error}</p>}
                        <div className="section-heading-row"><div><h2>Course-by-Course Progress</h2><p>Every course now requires its learning resources to be completed.</p></div></div>
                        {enrolledCourses.length === 0 ? <p>No enrolled courses yet. <Link to="/courses">Browse courses</Link></p> : <div className="progress-course-list">
                            {enrolledCourses.map((course) => {
                                const courseProgress = progress.find((item) => String(item.course?._id || item.course) === String(course._id || course.id));
                                const percent = courseProgress?.progressPercent || 0;
                                const completed = courseProgress?.completedLessons || 0;
                                const total = courseProgress?.totalLessons || course.materials?.length || 0;
                                return <article className="progress-course" key={course._id || course.id}>
                                    <div><span className="course-card-badge">{course.courseCode}</span><h3>{course.courseName}</h3><small>{completed} of {total} lessons completed</small></div>
                                    <div className="progress-course-bar"><div className="learning-progress-track"><span style={{ width: `${percent}%` }} /></div><strong>{percent}%</strong></div>
                                    <Link to={`/course/${encodeURIComponent(course._id || course.id)}`} className="secondary-action">Open</Link>
                                </article>;
                            })}
                        </div>}
                    </section>
                </main>
            </div>
        </>
    );
};

export default Progress;
