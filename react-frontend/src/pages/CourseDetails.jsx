import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageCss from "../components/PageCss.jsx";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { useCourses } from "../context/useCourses.js";
import api from "../services/api.js";

const CourseDetails = () => {
    const { courseId } = useParams();
    const { courses, loading: coursesLoading } = useCourses();
    const [enrollmentStatus, setEnrollmentStatus] = useState("");
    const [progressData, setProgressData] = useState(null);
    const [resources, setResources] = useState([]);
    const [certificateId, setCertificateId] = useState("");
    const [message, setMessage] = useState("");
    const [activeMaterial, setActiveMaterial] = useState(null);
    const [activityLoadedFor, setActivityLoadedFor] = useState("");
    const [savingResourceId, setSavingResourceId] = useState("");
    const [completingCourse, setCompletingCourse] = useState(false);
    const sourceCourse = courses.find((item) => String(item._id || item.id) === String(courseId));
    const course = useMemo(() => sourceCourse ? {
        ...sourceCourse,
        title: sourceCourse.title || sourceCourse.courseName,
        description: sourceCourse.description || sourceCourse.overview || "No description available.",
        materials: resources
    } : null, [sourceCourse, resources]);

    useEffect(() => {
        if (!sourceCourse) return;

        let active = true;
        const loadActivity = async () => {
            const [enrollmentResponse, progressResponse, certificateResponse] = await Promise.all([
                api.get("/api/v1/enrollments/mine"),
                api.get("/api/v1/progress/mine"),
                api.get("/api/v1/certificates/mine")
            ]);
            if (!active) return;
            const courseKey = String(sourceCourse._id || sourceCourse.id);
            const enrollment = enrollmentResponse.data.enrollments.find(
                (item) => String(item.course?._id || item.course) === courseKey
            );
            const savedProgress = progressResponse.data.progress.find(
                (item) => String(item.course?._id || item.course) === courseKey
            );
            const certificate = certificateResponse.data.certificates.find(
                (item) => String(item.course?._id || item.course) === courseKey
            );
            setEnrollmentStatus(enrollment?.status || "");
            setProgressData(savedProgress || null);
            setCertificateId(certificate?._id || "");
            if (enrollment && enrollment.status !== "withdrawn") {
                const resourceResponse = await api.get(`/api/v1/resources/courses/${encodeURIComponent(courseKey)}`);
                if (active) setResources(resourceResponse.data.resources || []);
            } else {
                setResources([]);
            }
        };
        loadActivity()
            .catch((requestError) => {
                if (active) setMessage(requestError.response?.data?.message || "Unable to load course activity.");
            })
            .finally(() => {
                if (active) setActivityLoadedFor(String(courseId));
            });
        return () => { active = false; };
    }, [courseId, sourceCourse]);

    const loadingActivity = activityLoadedFor !== String(courseId);

    const progress = useMemo(() => {
        const materials = course?.materials || [];
        const total = materials.length;
        const completedIds = new Set(progressData?.completedResourceIds || []);
        const completedResourceIds = materials
            .map((item) => String(item._id || item.id))
            .filter((id) => completedIds.has(id));
        const completedCount = completedResourceIds.length;
        return {
            completedIds: completedResourceIds,
            completedCount,
            total,
            percent: total ? Math.round(completedCount / total * 100) : 0,
            complete: total > 0 && completedCount === total
        };
    }, [course, progressData]);

    if (coursesLoading || (sourceCourse && loadingActivity)) {
        return <div className="scms-centered-state" role="status">Loading course...</div>;
    }
    if (!course) {
        return <div className="scms-centered-state"><h2>Course not found</h2><Link to="/courses" className="student-btn">Back to Courses</Link></div>;
    }

    const isEnrolled = enrollmentStatus === "active" || enrollmentStatus === "completed";

    const enroll = async () => {
        try {
            await api.post("/api/v1/enrollments", { courseId: course._id || course.id });
            setEnrollmentStatus("active");
            const response = await api.get(`/api/v1/resources/courses/${encodeURIComponent(course._id || course.id)}`);
            setResources(response.data.resources || []);
            setMessage("You are now enrolled. Start the learning resources below.");
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || "Unable to enroll in this course.");
        }
    };

    const completeResource = async (materialId) => {
        if (!isEnrolled) {
            setMessage("Please enroll in the course first.");
            return;
        }
        setSavingResourceId(String(materialId));
        setMessage("");
        try {
            const response = await api.post(`/api/v1/progress/${encodeURIComponent(course._id || course.id)}/resources/${encodeURIComponent(materialId)}/complete`);
            setProgressData(response.data.progress);
            setMessage("Resource marked as completed.");
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || "Unable to complete this resource.");
        } finally {
            setSavingResourceId("");
        }
    };

    const completeCourse = async () => {
        setCompletingCourse(true);
        setMessage("");
        try {
            const response = await api.patch(`/api/v1/enrollments/${encodeURIComponent(course._id || course.id)}/complete`);
            setEnrollmentStatus("completed");
            setCertificateId(response.data.certificate?._id || "");
            setProgressData((previous) => ({
                ...previous,
                completedResourceIds: resources.map((item) => String(item._id || item.id)),
                completedLessons: resources.length,
                totalLessons: resources.length,
                progressPercent: 100
            }));
            setMessage("Course completed.");
            window.dispatchEvent(new Event("dashboardDataChanged"));
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || "Unable to complete this course.");
        } finally {
            setCompletingCourse(false);
        }
    };

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />
            <div className="container">
                <StudentSidebar />
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
                    {message && <div className="scms-message" role="status">{message}</div>}

                    <section className="course-card">
                        <div className="section-heading-row"><div><h2>Learning Resources</h2><p>Complete every resource before you can finish the course.</p></div><strong>{progress.completedCount}/{progress.total}</strong></div>
                        {!isEnrolled ? (
                            <p>Enroll in this course to access its learning resources.</p>
                        ) : resources.length === 0 ? (
                            <p>No learning resources have been added to this course yet.</p>
                        ) : (
                        <div className="learning-resource-list">
                            {course.materials.map((material, index) => {
                                const materialId = String(material._id || material.id);
                                const done = progress.completedIds.includes(materialId);
                                return (
                                    <article className={`learning-resource ${done ? "done" : ""}`} key={materialId}>
                                        <div className="resource-number">{index + 1}</div>
                                        <div className="resource-icon"><i className={material.icon || "fa-solid fa-book-open"}></i></div>
                                        <div className="resource-content">
                                            <div className="resource-type">{material.type}{material.duration ? ` · ${material.duration}` : ""}</div>
                                            <h3>{material.title}</h3>
                                            <p>{material.description || material.content}</p>
                                            <div className="resource-actions">
                                                {material.url ? <a className="secondary-action" href={material.url} target="_blank" rel="noreferrer"><i className="fa-solid fa-arrow-up-right-from-square"></i> Open Resource</a> : <button className="secondary-action" onClick={() => setActiveMaterial(material)}><i className="fa-solid fa-eye"></i> View Resource</button>}
                                                <button className="secondary-action" type="button" disabled={done || savingResourceId === materialId} onClick={() => completeResource(materialId)}>
                                                    {done ? "Completed" : savingResourceId === materialId ? "Saving..." : "Mark as Completed"}
                                                </button>
                                            </div>
                                        </div>
                                        {done && <span className="done-badge"><i className="fa-solid fa-check"></i> Done</span>}
                                    </article>
                                );
                            })}
                        </div>
                        )}
                    </section>

                    <section className="course-card completion-panel">
                        <h2>Course Completion</h2>
                        <p>{enrollmentStatus === "completed" ? "This course is complete." : progress.total === 0 ? "A course needs at least one learning resource before it can be completed." : `Complete ${progress.total - progress.completedCount} more resource${progress.total - progress.completedCount === 1 ? "" : "s"} to finish this course.`}</p>
                        <button className="student-btn" disabled={completingCourse || enrollmentStatus === "completed"} onClick={completeCourse}>
                            {completingCourse ? "Checking completion..." : enrollmentStatus === "completed" ? "Course Completed" : "Complete Course"}
                        </button>
                        {certificateId && <Link to={`/certificate/${encodeURIComponent(certificateId)}`} className="secondary-action">View Certificate</Link>}
                    </section>
                </main>
            </div>

            {activeMaterial && (
                <div className="resource-modal-backdrop" onClick={() => setActiveMaterial(null)}>
                    <div className="resource-modal" onClick={(event) => event.stopPropagation()}>
                        <button className="modal-close" onClick={() => setActiveMaterial(null)} aria-label="Close">×</button>
                        <div className="resource-type">{activeMaterial.type}{activeMaterial.duration ? ` · ${activeMaterial.duration}` : ""}</div>
                        <h2>{activeMaterial.title}</h2>
                        <div className="resource-reader"><i className={activeMaterial.icon || "fa-solid fa-book-open"}></i><p>{activeMaterial.description || activeMaterial.content}</p></div>
                        <button className="student-btn" disabled={progress.completedIds.includes(String(activeMaterial._id || activeMaterial.id))} onClick={async () => { await completeResource(activeMaterial._id || activeMaterial.id); setActiveMaterial(null); }}>Mark Resource Complete</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CourseDetails;
