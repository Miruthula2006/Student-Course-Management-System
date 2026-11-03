import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import api from "../services/api.js";

const StudentDetails = () => {
    const location = useLocation();

    const [student, setStudent] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loadedStudentId, setLoadedStudentId] = useState(null);
    const selectedStudentId = new URLSearchParams(location.search).get("studentId");
    const loading = Boolean(selectedStudentId) && loadedStudentId !== selectedStudentId;

    useEffect(() => {
        if (!selectedStudentId) return;
        let active = true;
        Promise.all([
            api.get(`/api/v1/students/${encodeURIComponent(selectedStudentId)}`),
            api.get("/api/v1/enrollments"),
            api.get(`/api/v1/certificates?studentId=${encodeURIComponent(selectedStudentId)}`)
        ]).then(([studentResponse, enrollmentResponse, certificateResponse]) => {
            if (!active) return;
            const record = studentResponse.data.student;
            setStudent({ ...record, id: String(record._id || record.id) });
            setEnrollments((enrollmentResponse.data.enrollments || []).filter(
                (item) => String(item.student?._id || item.student) === String(selectedStudentId)
            ));
            setCertificates(certificateResponse.data.certificates || []);
            setLoadedStudentId(selectedStudentId);
        }).catch(() => {
            if (active) {
                setStudent(null);
                setLoadedStudentId(selectedStudentId);
            }
        });
        return () => { active = false; };
    }, [selectedStudentId]);

    if (loading || !student) {
        return (
            <>
                <PageCss href="/css/style.css" />
                <PageCss href="/css/dashboard.css" />

                <div className="container">

                    <aside className="sidebar">

                        <h2>
                            <i className="fa-solid fa-user-shield"></i>
                            SCMS
                        </h2>

                        <p>
                            Administrator Panel
                        </p>

                        <ul>

                            <li>
                                <Link to="/admin-dashboard">
                                    <i className="fa-solid fa-house"></i>
                                    Dashboard
                                </Link>
                            </li>

                            <li>
                                <Link to="/manage-courses">
                                    <i className="fa-solid fa-book"></i>
                                    Manage Courses
                                </Link>
                            </li>

                            <li>
                                <Link to="/add-course">
                                    <i className="fa-solid fa-circle-plus"></i>
                                    Add Course
                                </Link>
                            </li>

                            <li className="active">
                                <Link to="/manage-students">
                                    <i className="fa-solid fa-users"></i>
                                    Manage Students
                                </Link>
                            </li>

                            <li>
                                <Link to="/view-enrollments">
                                    <i className="fa-solid fa-user-check"></i>
                                    Enrollments
                                </Link>
                            </li>

                            <li>
                                <LogoutButton admin />
                            </li>

                        </ul>

                    </aside>

                    <main className="main-content">

                        <header className="topbar">

                            <h1>
                                Student Details
                            </h1>

                            <p>{loading ? "Loading student information..." : "Student information could not be found."}</p>

                        </header>

                        <section className="course-card">

                            <h2>
                                {loading ? "Loading Student" : "Student Not Found"}
                            </h2>

                            <br />

                            <p>
                                Please return to Manage Students and select
                                a student.
                            </p>

                            <br />

                            <Link
                                to="/manage-students"
                                className="student-btn"
                            >
                                Back to Students
                            </Link>

                        </section>

                    </main>

                </div>
            </>
        );
    }

    const studentId =
        student.id ||
        student.studentId ||
        "N/A";

    const studentName =
        student.name ||
        student.fullName ||
        "N/A";

    const studentEmail =
        student.email ||
        "N/A";

    const department =
        student.department ||
        student.course ||
        "N/A";

    const studentYear =
        student.year ||
        "N/A";

    const studentStatus = "Active";
    const enrolledCourses = enrollments.map((item) => ({
        ...item.course,
        enrollmentStatus: item.status
    })).filter((course) => course._id);
    const completedCount = enrollments.filter((item) => item.status === "completed").length;

    const inProgressCount =
        Math.max(
            enrolledCourses.length - completedCount,
            0
        );

    const certificateCount = certificates.length;

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />

            <div className="container">

                {/* =========================
                    SIDEBAR
                ========================== */}

                <aside className="sidebar">

                    <h2>
                        <i className="fa-solid fa-user-shield"></i>
                        SCMS
                    </h2>

                    <p>
                        Administrator Panel
                    </p>

                    <ul>

                        <li>
                            <Link to="/admin-dashboard">
                                <i className="fa-solid fa-house"></i>
                                Dashboard
                            </Link>
                        </li>

                        <li>
                            <Link to="/manage-courses">
                                <i className="fa-solid fa-book"></i>
                                Manage Courses
                            </Link>
                        </li>

                        <li>
                            <Link to="/add-course">
                                <i className="fa-solid fa-circle-plus"></i>
                                Add Course
                            </Link>
                        </li>

                        <li className="active">
                            <Link to="/manage-students">
                                <i className="fa-solid fa-users"></i>
                                Manage Students
                            </Link>
                        </li>

                        <li>
                            <Link to="/view-enrollments">
                                <i className="fa-solid fa-user-check"></i>
                                Enrollments
                            </Link>
                        </li>

                        <li>
                            <LogoutButton admin />
                        </li>

                    </ul>

                </aside>

                {/* =========================
                    MAIN CONTENT
                ========================== */}

                <main className="main-content">

                    <header className="topbar">

                        <h1 id="pageTitle">
                            Student Details
                        </h1>

                        <br />

                        <p id="pageSubtitle">
                            Complete information about the selected student.
                        </p>

                    </header>

                    {/* =========================
                        STUDENT STATISTICS
                    ========================== */}

                    <section className="cards">

                        <article className="box">

                            <i className="fa-solid fa-book-open"></i>

                            <h2 id="enrolledCourseCount">
                                {enrolledCourses.length}
                            </h2>

                            <p>
                                Enrolled Courses
                            </p>

                        </article>

                        <article className="box">

                            <i className="fa-solid fa-circle-check"></i>

                            <h2 id="completedCourseCount">
                                {completedCount}
                            </h2>

                            <p>
                                Completed
                            </p>

                        </article>

                        <article className="box">

                            <i className="fa-solid fa-chart-line"></i>

                            <h2 id="inProgressCourseCount">
                                {inProgressCount}
                            </h2>

                            <p>
                                In Progress
                            </p>

                        </article>

                        <article className="box">

                            <i className="fa-solid fa-award"></i>

                            <h2 id="certificateCount">
                                {certificateCount}
                            </h2>

                            <p>
                                Certificates
                            </p>

                        </article>

                    </section>

                    {/* =========================
                        STUDENT PROFILE
                    ========================== */}

                    <section className="course-card">

                        <h2>
                            Student Profile
                        </h2>

                        <br />

                        <input
                            type="hidden"
                            id="studentId"
                            name="studentId"
                            value={studentId}
                            readOnly
                        />

                        <p>
                            <strong>Student ID :</strong>{" "}
                            <span id="studentCode">
                                {studentId}
                            </span>
                        </p>

                        <p>
                            <strong>Name :</strong>{" "}
                            <span id="studentName">
                                {studentName}
                            </span>
                        </p>

                        <p>
                            <strong>Email :</strong>{" "}
                            <span id="studentEmail">
                                {studentEmail}
                            </span>
                        </p>

                        <p>
                            <strong>Department :</strong>{" "}
                            <span id="studentDepartment">
                                {department}
                            </span>
                        </p>

                        <p>
                            <strong>Year :</strong>{" "}
                            <span id="studentYear">
                                {studentYear}
                            </span>
                        </p>

                        <p>
                            <strong>Status :</strong>{" "}
                            <span id="studentStatus">
                                {studentStatus}
                            </span>
                        </p>

                    </section>

                    {/* =========================
                        ENROLLED COURSES
                    ========================== */}

                    <section className="course-card">

                        <h2>
                            Enrolled Courses
                        </h2>

                        <br />

                        <table
                            className="course-table"
                            id="enrolledCoursesTable"
                        >

                            <thead>

                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Progress</th>
                                </tr>

                            </thead>

                            <tbody id="enrolledCoursesBody">

                                {enrolledCourses.length === 0 ? (

                                    <tr>
                                        <td colSpan="3">
                                            No enrolled courses.
                                        </td>
                                    </tr>

                                ) : (

                                    enrolledCourses.map((course) => {

                                        return (
                                            <tr key={course.id}>

                                                <td>
                                                    {course.courseCode}
                                                </td>

                                                <td>
                                                    {course.courseName}
                                                </td>

                                                <td>
                                                    {course.enrollmentStatus === "completed" ? "Completed" : course.enrollmentStatus}
                                                </td>

                                            </tr>
                                        );
                                    })

                                )}

                            </tbody>

                        </table>

                    </section>

                    <br />

                    {/* =========================
                        CERTIFICATES
                    ========================== */}

                    <section className="course-card">

                        <h2>
                            Certificates
                        </h2>

                        <br />

                        <div id="certificateSection">

                            {certificateCount === 0 ? (
                                <div>
                                    <p id="certificateMessage">No certificates earned yet.</p>
                                    <p className="muted-note">Certificates appear here after course completion.</p>
                                </div>
                            ) : (
                                <div>
                                    <p id="certificateMessage">{certificateCount} certificate{certificateCount !== 1 ? "s" : ""} earned.</p>
                                    <div className="certificate-list">
                                        {certificates.map((certificate) => (
                                            <div className="certificate-list-item" key={certificate._id}>
                                                <div><strong>{certificate.course?.courseName}</strong><small>Issued {new Date(certificate.issuedAt).toLocaleDateString()} · {certificate.certificateCode}</small></div>
                                                <Link className="secondary-action" to={`/certificate/${encodeURIComponent(certificate._id)}`}>View Certificate</Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                    </section>

                    <br />

                    {/* =========================
                        BACK BUTTON
                    ========================== */}

                    <Link
                        to="/manage-students"
                        aria-label="Back to Manage Students"
                    >

                        <button
                            type="button"
                            className="student-btn"
                            id="backToStudentsBtn"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            Back to Students
                        </button>

                    </Link>

                </main>

            </div>
        </>
    );
};

export default StudentDetails;