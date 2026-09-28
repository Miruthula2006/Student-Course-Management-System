import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import LogoutButton from "../components/LogoutButton.jsx";
import { useCourses } from "../context/CourseContext.jsx";

const ManageCourses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const {
        courses,
        loading,
        error,
        fetchCourses,
        deleteCourse
    } = useCourses();

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCourses();
    }, [user]);

    const filteredCourses = courses.filter((course) => {
        const search = searchTerm.toLowerCase();

        return (
            course.courseCode?.toLowerCase().includes(search) ||
            course.courseName?.toLowerCase().includes(search)
        );
    });

    const handleDelete = async (courseId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteCourse(courseId);
            alert("Course deleted successfully.");
        } catch (error) {
            alert("Failed to delete course.");
        }
    };

    const handleEdit = (courseId) => {
        navigate(`/edit-course/${encodeURIComponent(courseId)}`);
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

                        <li className="active">
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
                            Manage Courses
                        </h1>

                        <br />

                        <p id="pageSubtitle">
                            View, search, edit, and manage all available courses.
                        </p>

                    </header>

                    {/* =========================
                        COURSE ACTIONS
                    ========================== */}

                    <section className="course-actions">

                        <input
                            type="search"
                            id="courseSearch"
                            name="courseSearch"
                            placeholder="Search by Course Code or Course Name..."
                            autoComplete="off"
                            aria-label="Search courses"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />

                        <Link
                            to="/add-course"
                            className="student-btn"
                            id="addCourseBtn"
                        >
                            <i className="fa-solid fa-circle-plus"></i>
                            Add Course
                        </Link>

                    </section>

                    {/* =========================
                        COURSE TABLE
                    ========================== */}

                    <section className="course-card">

                        {loading ? (
                            <p style={{ padding: "20px" }}>
                                Loading courses...
                            </p>
                        ) : error ? (
                            <p style={{ padding: "20px" }}>
                                {error}
                            </p>
                        ) : (

                            <table
                                className="course-table"
                                id="courseTable"
                            >

                                <thead>

                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Category</th>
                                        <th>Duration</th>
                                        <th>Level</th>
                                        <th>Instructor</th>
                                        <th>Resources</th>
                                        <th>Action</th>
                                    </tr>

                                </thead>

                                <tbody id="courseTableBody">

                                    {filteredCourses.length === 0 ? (

                                        <tr>
                                            <td colSpan="8">
                                                No courses found.
                                            </td>
                                        </tr>

                                    ) : (

                                        filteredCourses.map((course) => (

                                            <tr key={course.id}>

                                                <td>
                                                    {course.courseCode}
                                                </td>

                                                <td>
                                                    {course.courseName}
                                                </td>

                                                <td>
                                                    {course.category}
                                                </td>

                                                <td>
                                                    {course.duration}
                                                </td>

                                                <td>
                                                    {course.level}
                                                </td>

                                                <td>
                                                    {course.instructor || "Not Assigned"}
                                                </td>

                                                <td>
                                                    {course.materials?.length || 0} learning resources
                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            type="button"
                                                            className="student-btn"
                                                            onClick={() =>
                                                                handleEdit(course.id)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(course.id)
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        )}

                    </section>

                </main>

            </div>
        </>
    );
};

export default ManageCourses;