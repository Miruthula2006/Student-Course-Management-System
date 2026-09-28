import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import LogoutButton from "../components/LogoutButton.jsx";
import { getCourseProgress, normalizeCourses } from "../utils/courseUtils.js";

const Progress = () => {
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);

    const load = () => {
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const current = user ? students.find((item) => item.email === user.email) : null;
        setStudent(current || null);
        setCourses(normalizeCourses(JSON.parse(localStorage.getItem("courses") || "[]")));
    };

    useEffect(() => {
        load();
        window.addEventListener("studentDataChanged", load);
        return () => window.removeEventListener("studentDataChanged", load);
    }, [user]);

    const enrolled = student?.enrolledCourses || [];
    const enrolledCourses = courses.filter((course) => enrolled.includes(course.id));
    const completedCount = enrolledCourses.filter((course) => student?.completedCourses?.includes(course.id)).length;
    const overall = enrolledCourses.length ? Math.round(enrolledCourses.reduce((sum, course) => sum + getCourseProgress(student, course).percent, 0) / enrolledCourses.length) : 0;

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
                        <article className="box"><i className="fa-solid fa-award"></i><h2>{student?.certificates?.length || 0}</h2><p>Certificates</p></article>
                    </section>
                    <section className="course-card">
                        <div className="section-heading-row"><div><h2>Course-by-Course Progress</h2><p>Every course now requires its learning resources to be completed.</p></div></div>
                        {enrolledCourses.length === 0 ? <p>No enrolled courses yet. <Link to="/courses">Browse courses</Link></p> : <div className="progress-course-list">
                            {enrolledCourses.map((course) => {
                                const p = getCourseProgress(student, course);
                                return <article className="progress-course" key={course.id}>
                                    <div><span className="course-card-badge">{course.id}</span><h3>{course.title}</h3><small>{p.completedCount} of {p.total} resources completed</small></div>
                                    <div className="progress-course-bar"><div className="learning-progress-track"><span style={{ width: `${p.percent}%` }} /></div><strong>{p.percent}%</strong></div>
                                    <Link to={`/course/${encodeURIComponent(course.id)}`} className="secondary-action">Open</Link>
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
