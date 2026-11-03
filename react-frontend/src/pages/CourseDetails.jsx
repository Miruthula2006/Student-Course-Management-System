import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageCss from "../components/PageCss.jsx";
import LogoutButton from "../components/LogoutButton.jsx";
import { useCourses } from "../context/CourseContext.jsx";
import api from "../services/api.js";

const CourseDetails = () => {
    const { courseId } = useParams();
    const { courses } = useCourses();
    const [enrollmentStatus, setEnrollmentStatus] = useState("");
    const [progressData, setProgressData] = useState(null);
    const [certificateId, setCertificateId] = useState("");
    const [message, setMessage] = useState("");
    const [activeMaterial, setActiveMaterial] = useState(null);
    const sourceCourse = courses.find((item) => String(item._id || item.id) === String(courseId));
    const course = useMemo(() => sourceCourse ? {
        ...sourceCourse,
        title: sourceCourse.title || sourceCourse.courseName,
        description: sourceCourse.description || sourceCourse.overview || "No description available.",
        materials: Array.isArray(sourceCourse.materials) ? sourceCourse.materials : []
    } : null, [sourceCourse]);

    useEffect(() => {
        if (!sourceCourse) return;

        let active = true;
        Promise.all([
            api.get("/api/v1/enrollments/mine"),
            api.get("/api/v1/progress/mine"),
            api.get("/api/v1/certificates/mine")
        ]).then(([enrollmentResponse, progressResponse, certificateResponse]) => {
                if (!active) return;
                const enrollment = enrollmentResponse.data.enrollments.find(
                    (item) => String(item.course?._id || item.course) === String(sourceCourse._id || sourceCourse.id)
                );
                const savedProgress = progressResponse.data.progress.find(
                    (item) => String(item.course?._id || item.course) === String(sourceCourse._id || sourceCourse.id)
                );
                setEnrollmentStatus(enrollment?.status || "");
                setProgressData(savedProgress || null);
                const certificate = certificateResponse.data.certificates.find(
                    (item) => String(item.course?._id || item.course) === String(sourceCourse._id || sourceCourse.id)
                );
                setCertificateId(certificate?._id || "");
            })
            .catch((requestError) => {
                if (active) setMessage(requestError.response?.data?.message || "Unable to load course activity.");
            });
        return () => { active = false; };
    }, [courseId, sourceCourse]);

    const progress = useMemo(() => {
        const materials = course?.materials || [];
        const total = materials.length;
        const completedCount = Math.min(progressData?.completedLessons || 0, total);
        return {
            completedIds: materials.slice(0, completedCount).map((item) => item.id),
            completedCount,
            total,
            percent: total ? Math.round(completedCount / total * 100) : 0,
            complete: total > 0 && completedCount === total
        };
    }, [course, progressData]);

    if (!course) {
        return <div className="scms-centered-state"><h2>Course not found</h2><Link to="/courses" className="student-btn">Back to Courses</Link></div>;
    }

    const isEnrolled = enrollmentStatus === "active" || enrollmentStatus === "completed";

    const enroll = async () => {
        try {
            await api.post("/api/v1/enrollments", { courseId: course._id || course.id });
            setEnrollmentStatus("active");
            setMessage("You are now enrolled. Start the learning resources below.");
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || "Unable to enroll in this course.");
        }
    };

    const toggleMaterial = async (materialId) => {
        if (!isEnrolled) {
            setMessage("Please enroll in the course first.");
            return;
        }
        const checked = progress.completedIds.includes(materialId);
        const completedLessons = Math.max(0, Math.min(progress.total, progress.completedCount + (checked ? -1 : 1)));
        try {
            const response = await api.put(`/api/v1/progress/${encodeURIComponent(course._id || course.id)}`, {
                completedLessons,
                totalLessons: Math.max(progress.total, 1)
            });
            setProgressData(response.data.progress);
            setMessage("Learning progress saved.");
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || "Unable to save learning progress.");
        }
    };

    const completeCourse = async () => {
        if (!progress.complete) {
            setMessage("Complete every learning resource before completing the course.");
            return;
        }
        try {
            const response = await api.patch(`/api/v1/enrollments/${encodeURIComponent(course._id || course.id)}/complete`);
            setEnrollmentStatus("completed");
            setCertificateId(response.data.certificate?._id || "");
            setMessage("Course completed.");
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || "Unable to complete this course.");
        }
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
                                                <label className="completion-check"><input type="checkbox" checked={done} disabled={done ? index < progress.completedCount - 1 : index > progress.completedCount} onChange={() => toggleMaterial(material.id)} /> Mark complete</label>
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
                        <button className="student-btn" disabled={!progress.complete || enrollmentStatus === "completed"} onClick={completeCourse}>
                            {enrollmentStatus === "completed" ? "Course Completed" : "Complete Course"}
                        </button>
                        {certificateId && <Link to={`/certificate/${encodeURIComponent(certificateId)}`} className="secondary-action">View Certificate</Link>}
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
