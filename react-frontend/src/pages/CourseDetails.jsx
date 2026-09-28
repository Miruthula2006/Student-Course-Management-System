import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageCss from "../components/PageCss.jsx";
import LogoutButton from "../components/LogoutButton.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { getCourseProgress, issueCertificate, normalizeCourses, saveStudent } from "../utils/courseUtils.js";

const CourseDetails = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [student, setStudent] = useState(null);
    const [message, setMessage] = useState("");
    const [activeMaterial, setActiveMaterial] = useState(null);

    useEffect(() => {
        const courses = normalizeCourses(JSON.parse(localStorage.getItem("courses") || "[]"));
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const foundCourse = courses.find((item) => item.id === courseId);
        const currentStudent = user ? students.find((item) => item.email === user.email) : null;
        setCourse(foundCourse || null);
        setStudent(currentStudent || null);
        if (foundCourse) {
            localStorage.setItem("courses", JSON.stringify(courses));
        }
    }, [courseId, user]);

    const progress = useMemo(() => {
        return course && student ? getCourseProgress(student, course) : { completedIds: [], completedCount: 0, total: 0, percent: 0, complete: false };
    }, [course, student]);

    if (!course) {
        return <div className="scms-centered-state"><h2>Course not found</h2><Link to="/courses" className="student-btn">Back to Courses</Link></div>;
    }

    const isEnrolled = Boolean(student?.enrolledCourses?.includes(course.id));

    const enroll = () => {
        if (!student) {
            navigate("/student-login");
            return;
        }
        if (isEnrolled) return;
        const updated = { ...student };
        updated.enrolledCourses = Array.isArray(updated.enrolledCourses) ? [...updated.enrolledCourses, course.id] : [course.id];
        updated.completedCourses = Array.isArray(updated.completedCourses) ? [...updated.completedCourses] : [];
        updated.enrollments = Array.isArray(updated.enrollments) ? [...updated.enrollments, {
            courseId: course.id,
            courseTitle: course.title,
            enrollmentDate: new Date().toLocaleDateString(),
            status: "Active"
        }] : [{ courseId: course.id, courseTitle: course.title, enrollmentDate: new Date().toLocaleDateString(), status: "Active" }];
        updated.notifications = Array.isArray(updated.notifications) ? [...updated.notifications, {
            id: `NT_${Date.now()}`,
            message: `Successfully enrolled in ${course.title}`,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        }] : [];
        saveStudent(updated);
        setStudent(updated);
        setMessage("You are now enrolled. Start the learning resources below.");
    };

    const toggleMaterial = (materialId) => {
        if (!student) {
            navigate("/student-login");
            return;
        }
        if (!isEnrolled) {
            setMessage("Please enroll in the course first.");
            return;
        }
        const updated = { ...student };
        updated.courseProgress = { ...(updated.courseProgress || {}) };
        const current = Array.isArray(updated.courseProgress[course.id]) ? [...updated.courseProgress[course.id]] : [];
        updated.courseProgress[course.id] = current.includes(materialId)
            ? current.filter((id) => id !== materialId)
            : [...current, materialId];
        setStudent(updated);
        saveStudent(updated);
        setMessage("Learning progress saved.");
    };

    const completeCourse = () => {
        const latestProgress = getCourseProgress(student, course);
        if (!latestProgress.complete) {
            setMessage("Complete every learning resource before completing the course.");
            return;
        }
        const updated = { ...student };
        updated.completedCourses = Array.isArray(updated.completedCourses) ? [...updated.completedCourses] : [];
        if (!updated.completedCourses.includes(course.id)) updated.completedCourses.push(course.id);
        updated.enrollments = Array.isArray(updated.enrollments) ? updated.enrollments.map((item) => item.courseId === course.id ? { ...item, status: "Completed", completionDate: new Date().toLocaleDateString() } : item) : [];
        const result = issueCertificate(updated, course);
        result.student.notifications = Array.isArray(result.student.notifications) ? [...result.student.notifications, {
            id: `NT_${Date.now()}`,
            message: `Course completed and certificate generated for ${course.title}.`,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        }] : [];
        saveStudent(result.student);
        setStudent({ ...result.student });
        setMessage("Course completed! Your certificate has been generated.");
    };

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
                        <li className="active"><Link to="/courses"><i className="fa-solid fa-book"></i>Courses</Link></li>
                        <li><Link to="/my-courses"><i className="fa-solid fa-graduation-cap"></i>My Courses</Link></li>
                        <li><Link to="/progress"><i className="fa-solid fa-chart-line"></i>Progress</Link></li>
                        <li><Link to="/notifications"><i className="fa-solid fa-bell"></i>Notifications</Link></li>
                        <li><LogoutButton /></li>
                    </ul>
                </aside>
                <main className="main-content">
                    <header className="topbar">
                        <Link to="/courses" className="back-link"><i className="fa-solid fa-arrow-left"></i> Back to Courses</Link>
                        <h1>{course.title}</h1>
                        <p>{course.description}</p>
                    </header>

                    <section className="course-hero-panel">
                        <div>
                            <span className="course-card-badge">{course.category}</span>
                            <h2>{course.title}</h2>
                            <p>{course.description}</p>
                            <div className="course-meta-row">
                                <span><i className="fa-solid fa-user-tie"></i> {course.instructor || "Not Assigned"}</span>
                                <span><i className="fa-regular fa-clock"></i> {course.duration}</span>
                                <span><i className="fa-solid fa-signal"></i> {course.level}</span>
                            </div>
                        </div>
                        <div className="course-progress-ring">
                            <strong>{progress.percent}%</strong><span>complete</span>
                        </div>
                    </section>

                    {!isEnrolled && <section className="course-card callout-card"><h3>Ready to learn?</h3><p>Enroll to unlock the learning resources and track your progress.</p><button className="student-btn" onClick={enroll}>Enroll in Course</button></section>}
                    {message && <div className="scms-message">{message}</div>}

                    <section className="course-card">
                        <div className="section-heading-row"><div><h2>Learning Resources</h2><p>Complete every resource before you can finish the course.</p></div><strong>{progress.completedCount}/{progress.total}</strong></div>
                        <div className="learning-resource-list">
                            {course.materials.map((material, index) => {
                                const done = progress.completedIds.includes(material.id);
                                return (
                                    <article className={`learning-resource ${done ? "done" : ""}`} key={material.id}>
                                        <div className="resource-number">{index + 1}</div>
                                        <div className="resource-icon"><i className={material.icon || "fa-solid fa-book-open"}></i></div>
                                        <div className="resource-content">
                                            <div className="resource-type">{material.type} · {material.duration}</div>
                                            <h3>{material.title}</h3>
                                            <p>{material.content}</p>
                                            <div className="resource-actions">
                                                {material.url ? <a className="secondary-action" href={material.url} target="_blank" rel="noreferrer"><i className="fa-solid fa-arrow-up-right-from-square"></i> Open Resource</a> : <button className="secondary-action" onClick={() => setActiveMaterial(material)}><i className="fa-solid fa-eye"></i> View Resource</button>}
                                                <label className="completion-check"><input type="checkbox" checked={done} onChange={() => toggleMaterial(material.id)} /> Mark complete</label>
                                            </div>
                                        </div>
                                        {done && <span className="done-badge"><i className="fa-solid fa-check"></i> Done</span>}
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className="course-card completion-panel">
                        <h2>Course Completion</h2>
                        <p>{progress.complete ? "All learning resources are complete. You can now finish the course and receive your certificate." : `Complete ${progress.total - progress.completedCount} more resource${progress.total - progress.completedCount === 1 ? "" : "s"} to unlock course completion.`}</p>
                        <button className="student-btn" disabled={!progress.complete || student?.completedCourses?.includes(course.id)} onClick={completeCourse}>
                            {student?.completedCourses?.includes(course.id) ? "Course Completed" : "Complete Course & Generate Certificate"}
                        </button>
                        {student?.certificates?.some((item) => item.courseId === course.id) && <Link to={`/certificate/${encodeURIComponent(student.certificates.find((item) => item.courseId === course.id).id)}`} className="secondary-action">View Certificate</Link>}
                    </section>
                </main>
            </div>

            {activeMaterial && (
                <div className="resource-modal-backdrop" onClick={() => setActiveMaterial(null)}>
                    <div className="resource-modal" onClick={(event) => event.stopPropagation()}>
                        <button className="modal-close" onClick={() => setActiveMaterial(null)} aria-label="Close">×</button>
                        <div className="resource-type">{activeMaterial.type} · {activeMaterial.duration}</div>
                        <h2>{activeMaterial.title}</h2>
                        <div className="resource-reader"><i className={activeMaterial.icon}></i><p>{activeMaterial.content}</p><p>This is the in-app learning resource for the Task 6 demo. In a production system, this area can load an actual video player or PDF viewer from an uploaded resource URL.</p></div>
                        <button className="student-btn" onClick={() => { toggleMaterial(activeMaterial.id); setActiveMaterial(null); }}>Mark Resource Complete</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CourseDetails;
