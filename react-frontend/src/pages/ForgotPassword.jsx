import LegacyScript from "../components/LegacyScript.jsx";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    return (
        <>
            <PageCss href="/css/style.css" />

            <main className="login-container">

                <section className="login-card">

                    <h1>
                        Forgot Password
                    </h1>

                    <p>
                        Reset your password using your registered email.
                    </p>

                    <form id="forgotPasswordForm">

                        <div className="form-group">

                            <label htmlFor="forgotEmail">
                                Email
                            </label>

                            <input
                                type="email"
                                id="forgotEmail"
                                name="forgotEmail"
                                placeholder="Enter your registered email"
                                autoComplete="email"
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                placeholder="Enter new password"
                                autoComplete="new-password"
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="confirmNewPassword">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                            />

                        </div>

                        <p id="forgotMessage"></p>

                        <button
                            type="submit"
                            id="resetPasswordBtn"
                            className="student-btn"
                        >
                            Reset Password
                        </button>

                    </form>

                    <p>
                        <Link to="/student-login">
                            Back to Student Login
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

export default ForgotPassword;