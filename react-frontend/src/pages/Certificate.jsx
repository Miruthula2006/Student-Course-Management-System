import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageCss from "../components/PageCss.jsx";

const Certificate = () => {
    const { certificateId } = useParams();
    const [certificate, setCertificate] = useState(null);

    useEffect(() => {
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const found = students.flatMap((student) => Array.isArray(student.certificates) ? student.certificates : [])
            .find((item) => item.id === certificateId);
        setCertificate(found || null);
    }, [certificateId]);

    if (!certificate) return <div className="scms-centered-state"><h2>Certificate not found</h2><Link to="/my-courses" className="student-btn">Back to My Courses</Link></div>;

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />
            <div className="certificate-page">
                <div className="certificate-toolbar">
                    <Link to="/my-courses" className="secondary-action">← Back to My Courses</Link>
                    <button className="student-btn" onClick={() => window.print()}><i className="fa-solid fa-print"></i> Print / Save as PDF</button>
                </div>
                <section className="certificate-card">
                    <div className="certificate-border">
                        <div className="certificate-seal" aria-label="SCMS certificate logo">
                            <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
                                <path d="M18 34 50 20l32 14-32 14-32-14Z" fill="currentColor"/>
                                <path d="M30 43v16c0 7 9 13 20 13s20-6 20-13V43l-20 9-20-9Z" fill="currentColor" opacity=".82"/>
                                <path d="M82 35v22" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                                <circle cx="82" cy="61" r="4" fill="currentColor"/>
                                <path d="M38 78h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                            </svg>
                            <span>SCMS</span>
                        </div>
                        <p className="certificate-kicker">STUDENT COURSE MANAGEMENT SYSTEM</p>
                        <h1>Certificate of Completion</h1>
                        <p className="certificate-intro">This certificate is proudly presented to</p>
                        <h2>{certificate.studentName}</h2>
                        <p className="certificate-intro">for successfully completing the course</p>
                        <h3>{certificate.courseTitle}</h3>
                        <p className="certificate-text">The learner completed all required learning resources and successfully completed the course requirements.</p>
                        <div className="certificate-details">
                            <span><strong>Student ID</strong>{certificate.studentId}</span>
                            <span><strong>Instructor</strong>{certificate.instructor}</span>
                            <span><strong>Issue Date</strong>{certificate.issueDate}</span>
                        </div>
                        <div className="certificate-footer"><span>Certificate ID: {certificate.id}</span><span>SCMS</span></div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Certificate;
