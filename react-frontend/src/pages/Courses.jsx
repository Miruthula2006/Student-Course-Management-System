import { useCourses } from "../context/CourseContext";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";

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
    const handleEnroll = (course) => {

        const loggedInUser =
            JSON.parse(
                localStorage.getItem("loggedInUser")
            );


        if (!loggedInUser) {

            alert("Please login first.");

            return;
        }


        const students =
            JSON.parse(
                localStorage.getItem("students")
            ) || [];


        const studentIndex =
            students.findIndex(
                student =>
                    student.id === loggedInUser.id
            );


        if (studentIndex === -1) {

            alert("Student not found.");

            return;
        }


        const student =
            students[studentIndex];


        if (!Array.isArray(student.enrolledCourses)) {

            student.enrolledCourses = [];

        }


        if (!Array.isArray(student.completedCourses)) {

            student.completedCourses = [];

        }


        if (!Array.isArray(student.notifications)) {

            student.notifications = [];

        }


        if (!Array.isArray(student.enrollments)) {

            student.enrollments = [];

        }


        if (
            student.enrolledCourses.includes(course.id)
        ) {

            alert(
                "Already enrolled in this course."
            );

            return;
        }


        // Add course to student's enrolled courses
        student.enrolledCourses.push(course.id);


        // Add enrollment record
        student.enrollments.push({

            courseId: course.id,

            enrollmentDate:
                new Date().toLocaleDateString(),

            status: "Active"

        });


        // Add notification
        student.notifications.unshift({

            id: "NT_" + Date.now(),

            message:
                `Successfully enrolled in ${course.title}`,

            date:
                new Date().toLocaleDateString(),

            time:
                new Date().toLocaleTimeString()

        });


        students[studentIndex] = student;


        // Save updated student information
        localStorage.setItem(
            "students",
            JSON.stringify(students)
        );


        // Update logged-in user
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(student)
        );


        alert(
            "Course enrolled successfully."
        );

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