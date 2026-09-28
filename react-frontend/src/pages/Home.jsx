import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <>
            <PageCss href="/css/style.css" />

            <main>
                <section className="hero" id="hero">

                    <div className="left">

                        <h1>
                            Student Course
                            <br />
                            Management System
                        </h1>

                        <h3>
                            Learn Smart.
                            Track Progress.
                            Achieve Success.
                        </h3>

                        <p>
                            A modern learning platform that helps students
                            enroll in courses, monitor academic progress,
                            access study materials, and achieve their
                            learning goals through one centralized system.
                        </p>

                        <div className="buttons">

                            {/* Student Login */}

                            <Link
                                to="/student-login"
                                id="studentLoginBtn"
                                className="student-btn"
                                aria-label="Student Login"
                            >
                                <i className="fa-solid fa-user-graduate"></i>
                                <span>Student Login</span>
                            </Link>

                            {/* Admin Login */}

                            <Link
                                to="/admin-login"
                                id="adminLoginBtn"
                                className="admin-btn"
                                aria-label="Administrator Login"
                            >
                                <i className="fa-solid fa-user-shield"></i>
                                <span>Admin Login</span>
                            </Link>

                            {/* Register */}

                            <Link
                                to="/register"
                                id="registerBtn"
                                className="register-btn"
                                aria-label="Student Registration"
                            >
                                <i className="fa-solid fa-user-plus"></i>
                                <span>Register</span>
                            </Link>

                        </div>

                    </div>

                    <div className="right">

                        <img
                            src="/images/student-learning.jpg"
                            alt="Student Learning Platform"
                            loading="lazy"
                        />

                    </div>

                </section>

                {/* =========================
                    FEATURES
                ========================== */}

                <section
                    className="features"
                    id="features"
                >

                    <h2>
                        Why Choose Our Platform?
                    </h2>

                    <div className="feature-container">

                        <article className="card">

                            <i className="fa-solid fa-book-open"></i>

                            <h3>
                                Course Management
                            </h3>

                            <p>
                                Browse available courses and enroll effortlessly
                                through a simple and user-friendly interface.
                            </p>

                        </article>

                        <article className="card">

                            <i className="fa-solid fa-chart-line"></i>

                            <h3>
                                Progress Tracking
                            </h3>

                            <p>
                                Monitor completed modules, learning achievements,
                                and academic progress in real time.
                            </p>

                        </article>

                        <article className="card">

                            <i className="fa-solid fa-lock"></i>

                            <h3>
                                Secure Login
                            </h3>

                            <p>
                                Separate authentication portals for students
                                and administrators ensure secure access.
                            </p>

                        </article>

                    </div>

                </section>

                {/* =========================
                    STATISTICS
                ========================== */}

                <section
                    className="statistics"
                    id="statistics"
                >

                    <h2>
                        Platform Statistics
                    </h2>

                    <div className="stats">

                        <div className="stat-card">

                            <i className="fa-solid fa-user-graduate"></i>

                            <h1 id="studentCount">
                                250+
                            </h1>

                            <p>
                                Students
                            </p>

                        </div>

                        <div className="stat-card">

                            <i className="fa-solid fa-book"></i>

                            <h1 id="courseCount">
                                15+
                            </h1>

                            <p>
                                Courses
                            </p>

                        </div>

                        <div className="stat-card">

                            <i className="fa-solid fa-chalkboard-user"></i>

                            <h1 id="facultyCount">
                                50+
                            </h1>

                            <p>
                                Faculty
                            </p>

                        </div>

                        <div className="stat-card">

                            <i className="fa-solid fa-award"></i>

                            <h1 id="successRate">
                                98%
                            </h1>

                            <p>
                                Success Rate
                            </p>

                        </div>

                    </div>

                </section>

            </main>

            {/* Footer */}

            <footer>

                <h3>
                    "Learning Today, Leading Tomorrow."
                </h3>

                <p>
                    &copy; 2026 Student Course Management System.
                    All Rights Reserved.
                </p>

            </footer>
        </>
    );
};

export default Home;