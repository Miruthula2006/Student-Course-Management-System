import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";

const ViewEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const students =
            JSON.parse(localStorage.getItem("students")) || [];

        const courses =
            JSON.parse(localStorage.getItem("courses")) || [];

        const allEnrollments = [];

        students.forEach((student) => {
            if (Array.isArray(student.enrollments)) {
                student.enrollments.forEach((enrollment) => {

                    const course = courses.find(
                        (item) => item.id === enrollment.courseId
                    );

                    allEnrollments.push({
                        studentId:
                            student.id ||
                            student.studentId ||
                            "N/A",

                        studentName:
                            student.name ||
                            student.fullName ||
                            "N/A",

                        course:
                            course?.title ||
                            enrollment.courseId ||
                            "N/A",

                        courseId:
                            enrollment.courseId ||
                            "N/A",

                        enrollmentDate:
                            enrollment.enrollmentDate ||
                            "N/A",

                        status:
                            enrollment.status ||
                            "Active"
                    });
                });
            }
        });

        setEnrollments(allEnrollments);
    }, []);

    const filteredEnrollments = enrollments.filter(
        (enrollment) => {
            const search = searchTerm.toLowerCase();

            return (
                enrollment.studentId
                    .toLowerCase()
                    .includes(search) ||

                enrollment.studentName
                    .toLowerCase()
                    .includes(search) ||

                enrollment.course
                    .toLowerCase()
                    .includes(search)
            );
        }
    );

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

                        <li>
                            <Link to="/manage-students">
                                <i className="fa-solid fa-users"></i>
                                Manage Students
                            </Link>
                        </li>

                        <li className="active">
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
                            View Enrollments
                        </h1>

                        <br />

                        <p id="pageSubtitle">
                            Monitor and manage all student course enrollments.
                        </p>

                    </header>

                    {/* =========================
                        ENROLLMENT ACTIONS
                    ========================== */}

                    <section className="course-actions">

                        <input
                            type="search"
                            id="enrollmentSearch"
                            name="enrollmentSearch"
                            placeholder="Search by Student ID, Student Name, or Course..."
                            autoComplete="off"
                            aria-label="Search enrollments"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />

                        <div
                            className="box"
                            id="enrollmentSummary"
                            style={{
                                width: "220px",
                                padding: "15px"
                            }}
                        >

                            <h3>
                                Total Enrollments
                            </h3>

                            <h2 id="totalEnrollments">
                                {enrollments.length}
                            </h2>

                        </div>

                    </section>

                    {/* =========================
                        ENROLLMENT TABLE
                    ========================== */}

                    <section className="course-card">

                        <table
                            className="course-table"
                            id="enrollmentTable"
                        >

                            <thead>

                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Course</th>
                                    <th>Enrollment Date</th>
                                    <th>Status</th>
                                </tr>

                            </thead>

                            <tbody id="enrollmentTableBody">

                                {filteredEnrollments.length === 0 ? (

                                    <tr>
                                        <td colSpan="5">
                                            No enrollments found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredEnrollments.map(
                                        (enrollment, index) => (

                                            <tr
                                                key={`${enrollment.studentId}-${enrollment.courseId}-${index}`}
                                            >

                                                <td>
                                                    {enrollment.studentId}
                                                </td>

                                                <td>
                                                    {enrollment.studentName}
                                                </td>

                                                <td>
                                                    {enrollment.course}
                                                </td>

                                                <td>
                                                    {enrollment.enrollmentDate}
                                                </td>

                                                <td>
                                                    {enrollment.status}
                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </section>

                </main>

            </div>
        </>
    );
};

export default ViewEnrollments;