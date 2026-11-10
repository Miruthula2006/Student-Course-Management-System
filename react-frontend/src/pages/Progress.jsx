import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar.jsx";
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
    const overall = enrolledCourses.length ? Math.round(enrolledCourses.reduce((sum, course) => {
        const courseProgress = progress.find((item) => String(item.course?._id || item.course) === String(course._id || course.id));
        return sum + (courseProgress?.progressPercent || 0);
    }, 0) / enrolledCourses.length) : 0;

    return (
        <>
            <PageCss href="/css/style.css" /><PageCss href="/css/dashboard.css" />
            <div className="container">
                <StudentSidebar />
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
                                const total = courseProgress?.totalLessons ?? course.resourceCount ?? 0;
                                const completed = courseProgress?.completedLessons || 0;
                                const percent = total ? Math.round((completed / total) * 100) : 0;
                                return <article className="progress-course" key={course._id || course.id}>
                                    <div><span className="course-card-badge">{course.courseCode}</span><h3>{course.courseName}</h3><small>{total ? `${completed} of ${total} resources completed` : "No learning resources have been added to this course yet."}</small></div>
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
