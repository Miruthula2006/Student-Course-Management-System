import { useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import { useCourses } from "../context/CourseContext.jsx";

const AddCourse = () => {
    const navigate = useNavigate();

    const { courses, addCourse } = useCourses();

    const [formData, setFormData] = useState({
        courseCode: "",
        courseName: "",
        category: "",
        duration: "",
        level: "",
        courseDescription: "",
        instructor: "",
        videoUrl: "",
        pdfUrl: "",
        practiceUrl: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const {
            courseCode,
            courseName,
            category,
            duration,
            level,
            courseDescription,
            instructor,
            videoUrl,
            pdfUrl,
            practiceUrl
        } = formData;

        // Validate required fields
        if (
            !courseCode.trim() ||
            !courseName.trim() ||
            !category.trim() ||
            !duration.trim() ||
            !level ||
            !courseDescription.trim()
        ) {
            setMessage("Please fill in all course details.");
            return;
        }

        // Check duplicate course code
        const existingCourse = courses.some(
            (course) =>
                course.courseCode?.toLowerCase() ===
                courseCode.trim().toLowerCase()
        );

        if (existingCourse) {
            setMessage("Course code already exists.");
            return;
        }

        // Create course object matching db.json structure
        const newCourse = {
            id: courseCode.trim(),
            courseName: courseName.trim(),
            courseCode: courseCode.trim(),
            instructor: instructor.trim() || "Not Assigned",
            duration: duration.trim(),
            level: level,
            category: category.trim(),
            status: "Active",
            overview: courseDescription.trim(),
            videoUrl: videoUrl.trim(),
            pdfUrl: pdfUrl.trim(),
            practiceUrl: practiceUrl.trim(),
            materials: []
        };

        try {
            // POST /courses
            await addCourse(newCourse);

            setMessage("Course added successfully.");

            alert("Course added successfully!");

            navigate("/manage-courses");

        } catch (error) {
            console.error("Error adding course:", error);

            setMessage("Unable to add course.");

            alert("Unable to add course.");
        }
    };

    const handleReset = () => {
        setFormData({
            courseCode: "",
            courseName: "",
            category: "",
            duration: "",
            level: "",
            courseDescription: "",
            instructor: "",
            videoUrl: "",
            pdfUrl: "",
            practiceUrl: ""
        });

        setMessage("");
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

                        <li className="active">
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
                            Add New Course
                        </h1>

                        <br />

                        <p id="pageSubtitle">
                            Create a course with learning resources.
                            Instructor assignment is optional.
                        </p>

                    </header>

                    {/* =========================
                        ADD COURSE FORM
                    ========================== */}

                    <section className="course-card">

                        <form
                            id="addCourseForm"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-group">

                                <label htmlFor="courseCode">
                                    Course Code
                                </label>

                                <input
                                    type="text"
                                    id="courseCode"
                                    name="courseCode"
                                    placeholder="Enter course code"
                                    value={formData.courseCode}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="courseName">
                                    Course Name
                                </label>

                                <input
                                    type="text"
                                    id="courseName"
                                    name="courseName"
                                    placeholder="Enter course name"
                                    value={formData.courseName}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="category">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    id="category"
                                    name="category"
                                    placeholder="Enter course category"
                                    value={formData.category}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="duration">
                                    Duration
                                </label>

                                <input
                                    type="text"
                                    id="duration"
                                    name="duration"
                                    placeholder="Enter course duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="level">
                                    Level
                                </label>

                                <select
                                    id="level"
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select Level
                                    </option>

                                    <option value="Beginner">
                                        Beginner
                                    </option>

                                    <option value="Intermediate">
                                        Intermediate
                                    </option>

                                    <option value="Advanced">
                                        Advanced
                                    </option>

                                </select>

                            </div>

                            <div className="form-group">

                                <label htmlFor="instructor">
                                    Instructor (Optional)
                                </label>

                                <input
                                    type="text"
                                    id="instructor"
                                    name="instructor"
                                    placeholder="Enter instructor name (optional)"
                                    value={formData.instructor}
                                    onChange={handleChange}
                                />

                                <small className="field-help">
                                    You can leave this blank and assign an
                                    instructor later.
                                </small>

                            </div>

                            <div className="form-group">

                                <label htmlFor="videoUrl">
                                    Video Lesson URL (Optional)
                                </label>

                                <input
                                    type="url"
                                    id="videoUrl"
                                    name="videoUrl"
                                    placeholder="https://..."
                                    value={formData.videoUrl}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="pdfUrl">
                                    PDF Notes URL (Optional)
                                </label>

                                <input
                                    type="url"
                                    id="pdfUrl"
                                    name="pdfUrl"
                                    placeholder="https://..."
                                    value={formData.pdfUrl}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="practiceUrl">
                                    Practice Resource URL (Optional)
                                </label>

                                <input
                                    type="url"
                                    id="practiceUrl"
                                    name="practiceUrl"
                                    placeholder="https://..."
                                    value={formData.practiceUrl}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="courseDescription">
                                    Course Description
                                </label>

                                <textarea
                                    id="courseDescription"
                                    name="courseDescription"
                                    rows="5"
                                    placeholder="Enter course description"
                                    value={formData.courseDescription}
                                    onChange={handleChange}
                                ></textarea>

                            </div>

                            <p id="courseMessage">
                                {message}
                            </p>

                            <button
                                type="submit"
                                className="student-btn"
                                id="saveCourseBtn"
                            >
                                Save Course
                            </button>

                            <button
                                type="button"
                                className="admin-btn"
                                id="clearCourseBtn"
                                onClick={handleReset}
                            >
                                Clear
                            </button>

                        </form>

                    </section>

                </main>

            </div>
        </>
    );
};

export default AddCourse;