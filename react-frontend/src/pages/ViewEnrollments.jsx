import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import api from "../services/api.js";

const ViewEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/api/v1/enrollments")
            .then((response) => setEnrollments(response.data.enrollments || []))
            .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load enrollments."));
    }, []);

    const filteredEnrollments = enrollments.filter(
        (enrollment) => {
            const search = searchTerm.toLowerCase();
            const studentId = enrollment.student?.registerNumber || String(enrollment.student?._id || "");
            const studentName = enrollment.student?.name || "";
            const courseName = enrollment.course?.courseName || "";

            return (
                studentId
                    .toLowerCase()
                    .includes(search) ||

                studentName
                    .toLowerCase()
                    .includes(search) ||

                courseName
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

                        {error && <p role="alert">{error}</p>}

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
                                                key={enrollment._id || index}
                                            >

                                                <td>
                                                    {enrollment.student?.registerNumber || enrollment.student?._id || "N/A"}
                                                </td>

                                                <td>
                                                    {enrollment.student?.name || "N/A"}
                                                </td>

                                                <td>
                                                    {enrollment.course?.courseName || "N/A"}
                                                </td>

                                                <td>
                                                    {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "N/A"}
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