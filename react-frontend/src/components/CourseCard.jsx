import { Link } from "react-router-dom";

const CourseCard = ({ course, onEnroll }) => {
    return (
        <div className="course-card scms-course-card">
            <div className="course-card-badge">{course.category}</div>
            <h3>{course.title}</h3>
            <p><strong>Course Code:</strong> {course.id}</p>
            <p><strong>Duration:</strong> {course.duration}</p>
            <p><strong>Level:</strong> {course.level}</p>
            <p>{course.description}</p>
            <p><strong>Instructor:</strong> {course.instructor || "Not Assigned"}</p>
            <p className="material-summary"><i className="fa-solid fa-layer-group"></i> {course.materials?.length || 0} learning resources</p>
            <div className="course-card-actions">
                <Link className="secondary-action" to={`/course/${encodeURIComponent(course.id)}`}>View Course</Link>
                <button className="student-btn" onClick={() => onEnroll(course)}>Enroll</button>
            </div>
        </div>
    );
};

export default CourseCard;
