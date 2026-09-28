import LegacyScript from "../components/LegacyScript.jsx";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";

const StudentLogin = () => {
    return (
        <>
            <PageCss href="/css/style.css" />

            <main className="login-container">

                <section className="login-card">

                    <h1>
                        Student Login
                    </h1>

                    <p>
                        Login to access your Student Course Management System.
                    </p>

                    <form id="studentLoginForm">

                        <div className="form-group">

                            <label htmlFor="studentEmail">
                                Email
                            </label>

                            <input
                                type="email"
                                id="studentEmail"
                                name="studentEmail"
                                placeholder="Enter your email"
                                autoComplete="email"
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="studentPassword">
                                Password
                            </label>

                            <input
                                type="password"
                                id="studentPassword"
                                name="studentPassword"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                        </div>

                        <p id="studentLoginMessage"></p>

                        <button
                            type="submit"
                            id="studentLoginBtn"
                            className="student-btn"
                        >
                            Login
                        </button>

                    </form>

                    <p>
                        <Link to="/forgot-password">
                            Forgot Password?
                        </Link>
                    </p>

                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">
                            Register
                        </Link>
                    </p>

                    <Link to="/">
                        Back to Home
                    </Link>

                </section>

            </main>
            <LegacyScript src="/legacy/js/main.js" module />
<LegacyScript src="/legacy/js/auth.js" module />
        </>
    );
};

export default StudentLogin;