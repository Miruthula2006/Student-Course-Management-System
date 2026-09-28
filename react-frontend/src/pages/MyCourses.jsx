import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import LogoutButton from "../components/LogoutButton.jsx";
import { getCourseProgress, normalizeCourses } from "../utils/courseUtils.js";

const MyCourses = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [student, setStudent] = useState(null);

    const load = () => {
        const courses = normalizeCourses(JSON.parse(localStorage.getItem("courses") || "[]"));
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const current = user ? students.find((item) => item.email === user.email) : null;
        setStudent(current || null);
        setEnrolledCourses(current?.enrolledCourses?.length
            ? courses.filter((course) => current.enrolledCourses.includes(course.id))
            : []);
    };

    useEffect(() => {
        load();
        window.addEventListener("studentDataChanged", load);
        window.addEventListener("storage", load);
        return () => {
            window.removeEventListener("studentDataChanged", load);
            window.removeEventListener("storage", load);
        };
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
                        {enrolledCourses.length === 0 ? (
                            <div className="course-card">
                                <h2>No courses enrolled yet</h2>
                                <p>Browse the course catalog and enroll in a course to begin learning.</p>
                                <Link to="/courses" className="student-btn">Browse Courses</Link>
                            </div>
                        ) : enrolledCourses.map((course) => {
                            const progress = getCourseProgress(student, course);
                            const certificate = student?.certificates?.find((item) => item.courseId === course.id);
                            return (
                                <article className="course-card scms-course-card" key={course.id}>
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
                                        <Link to={`/course/${encodeURIComponent(course.id)}`} className="student-btn">{progress.complete ? "Review Course" : "Continue Learning"}</Link>
                                        {certificate && <Link to={`/certificate/${encodeURIComponent(certificate.id)}`} className="secondary-action">View Certificate</Link>}
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
