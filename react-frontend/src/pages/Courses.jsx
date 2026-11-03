import { useCourses } from "../context/CourseContext";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import api from "../services/api.js";

import PageCss from "../components/PageCss.jsx";
import CourseCard from "../components/CourseCard.jsx";

const Courses = () => {

    // Get course data from Mock API through CourseContext
    const {
        courses: apiCourses,
        loading,
        error
    } = useCourses();


    // Convert Mock API course fields
    // into the format already used by CourseCard
    const courses = (apiCourses || []).map(course => ({
        ...course,

        id: course.id || course.courseCode,

        title:
            course.title ||
            course.courseName ||
            "Untitled Course",

        category:
            course.category ||
            "General",

        duration:
            course.duration ||
            "N/A",

        level:
            course.level ||
            "Beginner",

        description:
            course.description ||
            course.overview ||
            "No description available.",

        instructor:
            course.instructor ||
            "Not Assigned"
    }));


    // Student enrollment logic
    const handleEnroll = async (course) => {
        if (!sessionStorage.getItem("token")) {
            window.location.assign("/student-login");
            return;
        }

        try {
            await api.post("/api/v1/enrollments", { courseId: course.id });
            window.alert("Course enrolled successfully.");
        } catch (requestError) {
            window.alert(requestError.response?.data?.message || "Unable to enroll in this course.");
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

                        <i className="fa-solid fa-graduation-cap"></i>

                        SCMS

                    </h2>


                    <p>
                        Student Course Management
                    </p>


                    <ul>


                        <li>

                            <Link to="/student-dashboard">

                                <i className="fa-solid fa-house"></i>

                                Dashboard

                            </Link>

                        </li>


                        <li className="active">

                            <Link to="/courses">

                                <i className="fa-solid fa-book"></i>

                                Courses

                            </Link>

                        </li>


                        <li>

                            <Link to="/my-courses">

                                <i className="fa-solid fa-graduation-cap"></i>

                                My Courses

                            </Link>

                        </li>


                        <li>

                            <Link to="/progress">

                                <i className="fa-solid fa-chart-line"></i>

                                Progress

                            </Link>

                        </li>


                        <li>

                            <Link to="/notifications">

                                <i className="fa-solid fa-bell"></i>

                                Notifications

                            </Link>

                        </li>


                        <li>

                            <LogoutButton />

                        </li>


                    </ul>

                </aside>


                {/* =========================
                    MAIN CONTENT
                ========================== */}

                <main className="main-content">


                    <header className="topbar">

                        <h1>
                            Courses
                        </h1>

                        <p>
                            Explore available courses and start learning.
                        </p>

                    </header>


                    {/* =========================
                        COURSE COUNT
                    ========================== */}

                    <div className="course-count">

                        <h3>

                            Available Courses:

                            {" "}

                            <span>
                                {courses.length}
                            </span>

                        </h3>

                    </div>


                    {/* =========================
                        LOADING MESSAGE
                    ========================== */}

                    {loading && (

                        <p style={{
                            textAlign: "center",
                            margin: "30px",
                            fontSize: "18px"
                        }}>

                            Loading courses...

                        </p>

                    )}


                    {/* =========================
                        ERROR MESSAGE
                    ========================== */}

                    {error && (

                        <p style={{
                            textAlign: "center",
                            margin: "30px",
                            color: "red",
                            fontSize: "18px"
                        }}>

                            {error}

                        </p>

                    )}


                    {/* =========================
                        COURSE CARDS
                    ========================== */}

                    {!loading &&
                        !error &&

                        <section className="course-grid">

                            {courses.length === 0 ? (

                                <p style={{
                                    textAlign: "center",
                                    width: "100%",
                                    fontSize: "18px"
                                }}>

                                    No courses available.

                                </p>

                            ) : (

                                courses.map(course => (

                                    <CourseCard

                                        key={course.id}

                                        course={course}

                                        onEnroll={handleEnroll}

                                    />

                                ))

                            )}

                        </section>

                    }


                </main>

            </div>

        </>
    );
};


export default Courses;