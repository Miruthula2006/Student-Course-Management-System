import LegacyScript from "../components/LegacyScript.jsx";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";

const AdminLogin = () => {
    return (
        <>
            <PageCss href="/css/style.css" />

            <main className="login-container">

                <section className="login-card">

                    <h1>
                        Administrator Login
                    </h1>

                    <p>
                        Login to access the Student Course Management System
                        Administrator Panel.
                    </p>

                    <form id="adminLoginForm">

                        <div className="form-group">

                            <label htmlFor="adminEmail">
                                Email
                            </label>

                            <input
                                type="email"
                                id="adminEmail"
                                name="adminEmail"
                                placeholder="Enter administrator email"
                                autoComplete="email"
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="adminPassword">
                                Password
                            </label>

                            <input
                                type="password"
                                id="adminPassword"
                                name="adminPassword"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                        </div>

                        <p id="adminLoginMessage"></p>

                        <button
                            type="submit"
                            id="adminLoginBtn"
                            className="admin-btn"
                        >
                            Login
                        </button>

                    </form>

                    <p>
                        <Link to="/forgot-password">
                            Forgot Password?
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

export default AdminLogin;