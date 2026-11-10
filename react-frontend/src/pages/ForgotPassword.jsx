import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";

const ForgotPassword = () => (
    <>
        <PageCss href="/css/style.css" />
        <main className="login-container">
            <section className="login-card">
                <h1>Password recovery</h1>
                <p>
                    Secure password recovery is not available yet. For help with
                    your account, contact your SCMS administrator. Your password
                    cannot be changed by entering an email address alone.
                </p>
                <p>
                    <Link to="/student-login">Back to Student Login</Link>
                </p>
                <p>
                    <Link to="/admin-login">Back to Admin Login</Link>
                </p>
                <Link to="/">Back to Home</Link>
            </section>
        </main>
    </>
);

export default ForgotPassword;
