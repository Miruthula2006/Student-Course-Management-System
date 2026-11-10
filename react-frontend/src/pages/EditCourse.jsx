import { useEffect, useMemo, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import { useCourses } from "../context/useCourses.js";
import api from "../services/api.js";

const EditCourse = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        courses,
        updateCourse
    } = useCourses();

    const selectedCourse = useMemo(
        () => courses.find((item) => String(item.id ?? item._id) === String(id)),
        [courses, id]
    );

    const [course, setCourse] = useState(selectedCourse);

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
        fileReference: "",
        content: ""
    });

    const [message, setMessage] = useState("");
    const [editingResourceId, setEditingResourceId] = useState("");

    useEffect(() => {
        if (!selectedCourse) {
            setCourse(null);
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
            materials: []
        });
        let active = true;
        api.get(`/api/v1/resources/courses/${encodeURIComponent(id)}`)
            .then((response) => {
                if (!active) return;
                setFormData((previous) => ({
                    ...previous,
                    materials: response.data.resources || []
                }));
            })
            .catch((requestError) => {
                if (active) setMessage(requestError.response?.data?.message || "Unable to load course resources.");
            });
        return () => {
            active = false;
        };
    }, [id, selectedCourse]);

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

    const resetResourceForm = () => {
        setResourceForm({ type: "Reading", title: "", duration: "", url: "", fileReference: "", content: "" });
        setEditingResourceId("");
    };

    const editResource = (resource) => {
        setEditingResourceId(String(resource._id || resource.id));
        setResourceForm({
            type: resource.type || "Reading",
            title: resource.title || "",
            duration: resource.duration || "",
            url: resource.url || "",
            fileReference: resource.fileReference || "",
            content: resource.description || resource.content || ""
        });
        setMessage("");
    };

    const addResource = async () => {

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
            type: resourceForm.type,
            title: resourceForm.title.trim(),
            duration: resourceForm.duration.trim(),
            url: resourceForm.url.trim(),
            fileReference: resourceForm.fileReference.trim(),
            description: resourceForm.content.trim(),
            order: editingResourceId
                ? formData.materials.find((item) => String(item._id || item.id) === editingResourceId)?.order || 0
                : formData.materials.length
        };

        try {
            const response = editingResourceId
                ? await api.put(`/api/v1/resources/${encodeURIComponent(editingResourceId)}`, resource)
                : await api.post(`/api/v1/resources/courses/${encodeURIComponent(id)}`, resource);
            const savedResource = response.data.resource;
            setFormData((previous) => ({
                ...previous,
                materials: editingResourceId
                    ? previous.materials.map((item) => String(item._id || item.id) === editingResourceId ? savedResource : item)
                    : [...previous.materials, savedResource]
            }));
            setMessage(editingResourceId ? "Resource updated." : "Resource added.");
            resetResourceForm();
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || "Unable to save the resource.");
        }
    };

    // =========================
    // REMOVE RESOURCE
    // =========================

    const removeResource = async (resourceId) => {
        try {
            await api.delete(`/api/v1/resources/${encodeURIComponent(resourceId)}`);
            setFormData((previous) => ({
                ...previous,
                materials: previous.materials.filter(
                    (item) => String(item._id || item.id) !== String(resourceId)
                )
            }));
            if (editingResourceId === String(resourceId)) resetResourceForm();
            setMessage("Resource removed.");
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || "Unable to remove the resource.");
        }
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
                formData.courseDescription.trim()
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

            console.error("Error updating course", { status: error.response?.status });

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
                                                    key={material._id || material.id}
                                                >

                                                    <div className="resource-number">
                                                        {index + 1}
                                                    </div>

                                                    <div className="resource-icon">

                                                        <i
                                                            className={
                                                                material.icon || getResourceIcon(material.type)
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
                                                            {material.description || material.content}
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
                                                                material._id || material.id
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="secondary-action"
                                                        onClick={() => editResource(material)}
                                                    >
                                                        Edit
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
                                        {editingResourceId ? "Edit Resource" : "Add New Resource"}
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

                                            <option value="Document">
                                                Document
                                            </option>

                                            <option value="Link">
                                                Link
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

                                        <label htmlFor="resourceFileReference">
                                            Stored File Reference (Optional)
                                        </label>

                                        <input
                                            id="resourceFileReference"
                                            name="fileReference"
                                            value={resourceForm.fileReference}
                                            onChange={handleResourceChange}
                                            placeholder="Storage key or relative file path"
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

                                        {editingResourceId ? "Save Resource" : "Add Resource"}

                                    </button>
                                    {editingResourceId && (
                                        <button type="button" className="secondary-action" onClick={resetResourceForm}>
                                            Cancel edit
                                        </button>
                                    )}

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