import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import api from "../services/api.js";

const ManageStudents = () => {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/api/v1/students")
            .then((response) => setStudents(response.data.students || []))
            .catch((requestError) => setError(
                requestError.response?.data?.message || "Unable to load students."
            ));
    }, []);

    const handleDelete = async (student) => {
        const studentId = student.id || student._id || student.studentId;
        const studentName = student.name || student.fullName || "this student";

        if (!window.confirm(`Delete ${studentName}?`)) {
            return;
        }

        try {
            await api.delete(`/api/v1/students/${encodeURIComponent(studentId)}`);
            setStudents((current) => current.filter(
                (item) => String(item.id || item._id || item.studentId) !== String(studentId)
            ));
            setError("");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to delete student.");
        }
    };

    const filteredStudents = students.filter((student) => {
        const search = searchTerm.toLowerCase();

        const studentId =
            student.id ||
            student._id ||
            student.studentId ||
            "";

        const name =
            student.name ||
            student.fullName ||
            "";

        return (
            String(studentId).toLowerCase().includes(search) ||
            String(name).toLowerCase().includes(search)
        );
    });

    const handleView = (student) => {
        const studentId =
            student._id ||
            student.id ||
            student.studentId;

        if (!studentId) {
            setError("This student record does not include a valid database ID.");
            return;
        }

        navigate(`/student-details/${encodeURIComponent(studentId)}`);
    };

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
                            <Link to="/admin-chat">
                                <i className="fa-solid fa-comments"></i>
                                Chat
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
                            Manage Students
                        </h1>

                        <br />

                        <p id="pageSubtitle">
                            View, search, and manage all registered students.
                        </p>

                    </header>

                    {/* =========================
                        STUDENT ACTIONS
                    ========================== */}

                    <section className="course-actions">

                        <input
                            type="search"
                            id="studentSearch"
                            name="studentSearch"
                            placeholder="Search by Student ID or Name..."
                            autoComplete="off"
                            aria-label="Search students"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />

                        <div
                            className="box"
                            id="studentSummary"
                            style={{
                                width: "220px",
                                padding: "15px"
                            }}
                        >

                            <h3>
                                Total Students
                            </h3>

                            <h2 id="totalStudents">
                                {students.length}
                            </h2>

                        </div>

                    </section>

                    {/* =========================
                        STUDENT TABLE
                    ========================== */}

                    <section className="course-card">

                        {error && <p role="alert">{error}</p>}

                        <table
                            className="course-table"
                            id="studentTable"
                        >

                            <thead>

                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody id="studentTableBody">

                                {filteredStudents.length === 0 ? (

                                    <tr>
                                        <td colSpan="7">
                                            No students found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredStudents.map((student) => {

                                        const studentId =
                                            student.id ||
                                            student._id ||
                                            student.studentId ||
                                            "N/A";

                                        const studentName =
                                            student.name ||
                                            student.fullName ||
                                            "N/A";

                                        const department =
                                            student.department ||
                                            student.course ||
                                            "N/A";

                                        const year =
                                            student.year ||
                                            "N/A";

                                        const email =
                                            student.email ||
                                            "N/A";

                                        const status =
                                            student.status ||
                                            "Active";

                                        return (
                                            <tr
                                                key={studentId}
                                                id={`student-${studentId}`}
                                            >

                                                <td>
                                                    {studentId}
                                                </td>

                                                <td>
                                                    {studentName}
                                                </td>

                                                <td>
                                                    {department}
                                                </td>

                                                <td>
                                                    {year}
                                                </td>

                                                <td>
                                                    {email}
                                                </td>

                                                <td>
                                                    {status}
                                                </td>

                                                <td>

                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="student-btn"
                                                            onClick={() => handleView(student)}
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() => handleDelete(student)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    })

                                )}

                            </tbody>

                        </table>

                    </section>

                </main>

            </div>
        </>
    );
};

export default ManageStudents;