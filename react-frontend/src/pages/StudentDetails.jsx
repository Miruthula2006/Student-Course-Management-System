import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import { issueCertificate, normalizeCourses } from "../utils/courseUtils.js";

const StudentDetails = () => {
    const location = useLocation();

    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const selectedStudentId = params.get("studentId");

        const students =
            JSON.parse(localStorage.getItem("students")) || [];

        const storedCourses = normalizeCourses(
            JSON.parse(localStorage.getItem("courses")) || []
        );

        const selectedStudentIndex = students.findIndex(
            (item) =>
                String(item.id || item.studentId) === String(selectedStudentId)
        );

        if (selectedStudentIndex === -1) {
            setStudent(null);
            setCourses(storedCourses);
            return;
        }

        // Migrate older completed courses: if a course was already marked
        // completed before certificate generation was introduced, issue its
        // certificate now so Admin can see it too.
        const selectedStudent = { ...students[selectedStudentIndex] };
        const completedIds = Array.isArray(selectedStudent.completedCourses)
            ? selectedStudent.completedCourses
            : [];
        let changed = false;

        completedIds.forEach((courseId) => {
            const course = storedCourses.find(
                (item) => String(item.id) === String(courseId)
            );
            if (!course) return;

            const alreadyIssued = Array.isArray(selectedStudent.certificates) &&
                selectedStudent.certificates.some(
                    (certificate) => String(certificate.courseId) === String(course.id)
                );

            if (!alreadyIssued) {
                issueCertificate(selectedStudent, course);
                changed = true;
            }
        });

        if (changed) {
            const updatedStudents = [...students];
            updatedStudents[selectedStudentIndex] = selectedStudent;
            localStorage.setItem("students", JSON.stringify(updatedStudents));
        }

        setStudent(selectedStudent);
        setCourses(storedCourses);
    }, [location.search]);

    if (!student) {
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

                            <p>
                                Student information could not be found.
                            </p>

                        </header>

                        <section className="course-card">

                            <h2>
                                Student Not Found
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

    const studentStatus =
        student.status ||
        "Active";

    const enrolledCourseIds =
        Array.isArray(student.enrolledCourses)
            ? student.enrolledCourses
            : [];

    const completedCourseIds =
        Array.isArray(student.completedCourses)
            ? student.completedCourses
            : [];

    const enrolledCourses = courses.filter((course) =>
        enrolledCourseIds.includes(course.id)
    );

    const completedCount = completedCourseIds.filter((courseId) =>
        enrolledCourseIds.includes(courseId)
    ).length;

    const inProgressCount =
        Math.max(
            enrolledCourses.length - completedCount,
            0
        );

    const certificateCount =
        Array.isArray(student.certificates)
            ? student.certificates.length
            : 0;

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

                                        const isCompleted =
                                            completedCourseIds.includes(
                                                course.id
                                            );

                                        return (
                                            <tr key={course.id}>

                                                <td>
                                                    {course.id}
                                                </td>

                                                <td>
                                                    {course.title}
                                                </td>

                                                <td>
                                                    {isCompleted
                                                        ? "Completed"
                                                        : "In Progress"}
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
                                    <p className="muted-note">Certificates are generated automatically when a student completes all required learning resources for a course.</p>
                                </div>
                            ) : (
                                <div>
                                    <p id="certificateMessage">{certificateCount} certificate{certificateCount !== 1 ? "s" : ""} earned.</p>
                                    <div className="certificate-list">
                                        {student.certificates.map((certificate) => (
                                            <div className="certificate-list-item" key={certificate.id}>
                                                <div><strong>{certificate.courseTitle}</strong><small>Issued {certificate.issueDate} · {certificate.id}</small></div>
                                                <Link className="secondary-action" to={`/certificate/${encodeURIComponent(certificate.id)}`}>View Certificate</Link>
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