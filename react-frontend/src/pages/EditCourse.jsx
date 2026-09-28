import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import { useCourses } from "../context/CourseContext.jsx";

const EditCourse = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        courses,
        updateCourse,
        fetchCourses
    } = useCourses();

    const [course, setCourse] = useState(null);

    const [formData, setFormData] = useState({
        courseCode: "",
        courseName: "",
        category: "",
        duration: "",
        level: "",
        courseDescription: "",
        instructor: "",
        materials: []
    });

    const [resourceForm, setResourceForm] = useState({
        type: "Video",
        title: "",
        duration: "",
        url: "",
        content: ""
    });

    const [message, setMessage] = useState("");

    // =========================
    // LOAD COURSES FROM API
    // =========================

    useEffect(() => {
        fetchCourses();
    }, []);

    // =========================
    // FIND SELECTED COURSE
    // =========================

    useEffect(() => {
        if (!id || courses.length === 0) {
            return;
        }

        const selectedCourse = courses.find(
            (item) => item.id === id
        );

        if (!selectedCourse) {
            setMessage("Course not found.");
            return;
        }

        setCourse(selectedCourse);

        setFormData({
            courseCode: selectedCourse.courseCode || "",
            courseName: selectedCourse.courseName || "",
            category: selectedCourse.category || "",
            duration: selectedCourse.duration || "",
            level: selectedCourse.level || "",
            courseDescription: selectedCourse.overview || "",
            instructor: selectedCourse.instructor || "",
            materials: Array.isArray(selectedCourse.materials)
                ? selectedCourse.materials
                : []
        });

    }, [id, courses]);

    // =========================
    // HANDLE FORM CHANGES
    // =========================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    // =========================
    // RESOURCE ICON
    // =========================

    const getResourceIcon = (type) => {
        if (type === "Video") {
            return "fa-solid fa-circle-play";
        }

        if (type === "PDF") {
            return "fa-solid fa-file-pdf";
        }

        if (type === "Practice") {
            return "fa-solid fa-list-check";
        }

        return "fa-solid fa-book-open";
    };

    // =========================
    // RESOURCE FORM CHANGES
    // =========================

    const handleResourceChange = (event) => {
        const { name, value } = event.target;

        setResourceForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =========================
    // ADD RESOURCE
    // =========================

    const addResource = () => {

        if (
            !resourceForm.title.trim() ||
            !resourceForm.content.trim()
        ) {
            setMessage(
                "Enter a resource title and content before adding it."
            );

            return;
        }

        const resource = {
            id: `${id}-R${Date.now()}`,
            type: resourceForm.type,
            icon: getResourceIcon(resourceForm.type),
            title: resourceForm.title.trim(),
            duration:
                resourceForm.duration.trim() || "Self-paced",
            url: resourceForm.url.trim(),
            content: resourceForm.content.trim()
        };

        setFormData((previous) => ({
            ...previous,
            materials: [
                ...previous.materials,
                resource
            ]
        }));

        setResourceForm({
            type: "Video",
            title: "",
            duration: "",
            url: "",
            content: ""
        });

        setMessage(
            "Resource added. Save the course to apply the changes."
        );
    };

    // =========================
    // REMOVE RESOURCE
    // =========================

    const removeResource = (resourceId) => {

        setFormData((previous) => ({
            ...previous,
            materials: previous.materials.filter(
                (item) => item.id !== resourceId
            )
        }));

        setMessage(
            "Resource removed. Save the course to apply the changes."
        );
    };

    // =========================
    // UPDATE COURSE
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!course) {
            setMessage("Course not found.");
            return;
        }

        if (
            !formData.courseCode.trim() ||
            !formData.courseName.trim() ||
            !formData.category.trim() ||
            !formData.duration.trim() ||
            !formData.level ||
            !formData.courseDescription.trim()
        ) {
            setMessage("Please fill in all course details.");
            return;
        }

        // Check duplicate course code
        const duplicateCourse = courses.some(
            (item) =>
                item.courseCode?.toLowerCase() ===
                    formData.courseCode.trim().toLowerCase() &&
                item.id !== id
        );

        if (duplicateCourse) {
            setMessage("Course code already exists.");
            return;
        }

        const updatedCourse = {
            ...course,

            id: id,

            courseName: formData.courseName.trim(),

            courseCode: formData.courseCode.trim(),

            instructor:
                formData.instructor.trim() ||
                "Not Assigned",

            duration:
                formData.duration.trim(),

            category:
                formData.category.trim(),

            level:
                formData.level,

            overview:
                formData.courseDescription.trim(),

            materials:
                formData.materials
        };

        try {

            // PUT /courses/:id
            await updateCourse(
                id,
                updatedCourse
            );

            alert(
                "Course updated successfully!"
            );

            navigate("/manage-courses");

        } catch (error) {

            console.error(
                "Error updating course:",
                error
            );

            setMessage(
                "Unable to update course."
            );

            alert(
                "Unable to update course."
            );
        }
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
                            Edit Course
                        </h1>

                        <br />

                        <p id="pageSubtitle">
                            Update the details of the selected course.
                        </p>

                    </header>

                    {/* =========================
                        EDIT COURSE FORM
                    ========================== */}

                    <section className="course-card">

                        <form
                            id="editCourseForm"
                            onSubmit={handleSubmit}
                        >

                            {/* COURSE CODE */}

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

                            {/* COURSE NAME */}

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

                            {/* CATEGORY */}

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

                            {/* DURATION */}

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

                            {/* LEVEL */}

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

                            {/* INSTRUCTOR */}

                            <div className="form-group">

                                <label htmlFor="instructor">
                                    Instructor (Optional)
                                </label>

                                <input
                                    type="text"
                                    id="instructor"
                                    name="instructor"
                                    placeholder="Enter instructor name"
                                    value={formData.instructor}
                                    onChange={handleChange}
                                />

                            </div>

                            {/* DESCRIPTION */}

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

                            {/* =========================
                                LEARNING RESOURCES
                            ========================== */}

                            <div
                                className="course-card resource-editor-card"
                                style={{ marginTop: "24px" }}
                            >

                                <div className="section-heading-row">

                                    <div>

                                        <h2>
                                            Learning Resources
                                        </h2>

                                        <p>
                                            Add, review, or remove resources
                                            for this course.
                                        </p>

                                    </div>

                                    <strong>

                                        {formData.materials.length}

                                        {" "}

                                        resource
                                        {formData.materials.length === 1
                                            ? ""
                                            : "s"}

                                    </strong>

                                </div>

                                <div className="learning-resource-list">

                                    {formData.materials.length === 0 ? (

                                        <p className="muted-note">
                                            No learning resources added yet.
                                        </p>

                                    ) : (

                                        formData.materials.map(
                                            (material, index) => (

                                                <article
                                                    className="learning-resource"
                                                    key={material.id}
                                                >

                                                    <div className="resource-number">
                                                        {index + 1}
                                                    </div>

                                                    <div className="resource-icon">

                                                        <i
                                                            className={
                                                                material.icon ||
                                                                "fa-solid fa-book-open"
                                                            }
                                                        ></i>

                                                    </div>

                                                    <div className="resource-content">

                                                        <div className="resource-type">
                                                            {material.type}
                                                            {" · "}
                                                            {material.duration}
                                                        </div>

                                                        <h3>
                                                            {material.title}
                                                        </h3>

                                                        <p>
                                                            {material.content}
                                                        </p>

                                                        {material.url && (
                                                            <small className="field-help">
                                                                {material.url}
                                                            </small>
                                                        )}

                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="danger-btn resource-remove-btn"
                                                        onClick={() =>
                                                            removeResource(
                                                                material.id
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>

                                                </article>

                                            )
                                        )

                                    )}

                                </div>

                                {/* ADD RESOURCE */}

                                <div
                                    className="resource-add-form"
                                    style={{ marginTop: "20px" }}
                                >

                                    <h3>
                                        Add New Resource
                                    </h3>

                                    <div className="form-group">

                                        <label htmlFor="resourceType">
                                            Resource Type
                                        </label>

                                        <select
                                            id="resourceType"
                                            name="type"
                                            value={resourceForm.type}
                                            onChange={handleResourceChange}
                                        >

                                            <option value="Video">
                                                Video
                                            </option>

                                            <option value="PDF">
                                                PDF
                                            </option>

                                            <option value="Practice">
                                                Practice
                                            </option>

                                            <option value="Reading">
                                                Reading
                                            </option>

                                        </select>

                                    </div>

                                    <div className="form-group">

                                        <label htmlFor="resourceTitle">
                                            Resource Title
                                        </label>

                                        <input
                                            id="resourceTitle"
                                            name="title"
                                            value={resourceForm.title}
                                            onChange={handleResourceChange}
                                            placeholder="e.g. Introduction to Python"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label htmlFor="resourceDuration">
                                            Duration / Size
                                        </label>

                                        <input
                                            id="resourceDuration"
                                            name="duration"
                                            value={resourceForm.duration}
                                            onChange={handleResourceChange}
                                            placeholder="e.g. 15 min or 8 pages"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label htmlFor="resourceUrl">
                                            Resource URL (Optional)
                                        </label>

                                        <input
                                            type="url"
                                            id="resourceUrl"
                                            name="url"
                                            value={resourceForm.url}
                                            onChange={handleResourceChange}
                                            placeholder="https://..."
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label htmlFor="resourceContent">
                                            Resource Description / Content
                                        </label>

                                        <textarea
                                            id="resourceContent"
                                            name="content"
                                            rows="4"
                                            value={resourceForm.content}
                                            onChange={handleResourceChange}
                                            placeholder="What should the student learn or complete?"
                                        />

                                    </div>

                                    <button
                                        type="button"
                                        className="secondary-action"
                                        onClick={addResource}
                                    >

                                        <i className="fa-solid fa-plus"></i>

                                        {" "}

                                        Add Resource

                                    </button>

                                </div>

                            </div>

                            <p id="courseMessage">
                                {message}
                            </p>

                            <button
                                type="submit"
                                className="student-btn"
                                id="updateCourseBtn"
                            >
                                Update Course
                            </button>

                            <Link
                                to="/manage-courses"
                                className="admin-btn"
                                id="cancelBtn"
                            >
                                Cancel
                            </Link>

                        </form>

                    </section>

                </main>

            </div>
        </>
    );
};

export default EditCourse;