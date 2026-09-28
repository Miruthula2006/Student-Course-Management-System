import LegacyScript from "../components/LegacyScript.jsx";
import PageCss from "../components/PageCss.jsx";
import { Link } from "react-router-dom";

const Register = () => {
    return (
        <>
            <PageCss href="/css/style.css" />

            <main className="login-container">

                <section className="login-card">

                    <h1>
                        Student Registration
                    </h1>

                    <p>
                        Create your Student Course Management System account.
                    </p>

                    <form id="registerForm">

                        <div className="form-group">

                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />

                            <small id="fullNameError"></small>

                        </div>

                        <div className="form-group">

                            <label htmlFor="registerNumber">
                                Register Number
                            </label>

                            <input
                                type="text"
                                id="registerNumber"
                                name="registerNumber"
                                placeholder="Enter your register number"
                            />

                            <small id="registerNumberError"></small>

                        </div>

                        <div className="form-group">

                            <label htmlFor="registerEmail">
                                Email
                            </label>

                            <input
                                type="email"
                                id="registerEmail"
                                name="registerEmail"
                                placeholder="Enter your email"
                                autoComplete="email"
                            />

                            <small id="registerEmailError"></small>

                        </div>

                        <div className="form-group">

                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="Enter your phone number"
                                autoComplete="tel"
                            />

                            <small id="phoneError"></small>

                        </div>

                        <div className="form-group">

                            <label htmlFor="department">
                                Department
                            </label>

                            <select
                                id="department"
                                name="department"
                            >
                                <option value="">
                                    Select Department
                                </option>
                                <option value="B.Sc Computer Science with AI">
                                    B.Sc Computer Science with AI
                                </option>
                                <option value="B.Sc Computer Science">
                                    B.Sc Computer Science
                                </option>
                                <option value="B.Sc Information Technology">
                                    B.Sc Information Technology
                                </option>
                                <option value="BCA">
                                    BCA
                                </option>
                                <option value="BBA">
                                    BBA
                                </option>
                                <option value="B.Com">
                                    B.Com
                                </option>
                            </select>

                            <small id="departmentError"></small>

                        </div>

                        <div className="form-group">

                            <label htmlFor="year">
                                Year
                            </label>

                            <select
                                id="year"
                                name="year"
                            >
                                <option value="">
                                    Select Year
                                </option>
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                            </select>

                            <small id="yearError"></small>

                        </div>

                        <div className="form-group">

                            <label htmlFor="registerPassword">
                                Password
                            </label>

                            <input
                                type="password"
                                id="registerPassword"
                                name="registerPassword"
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />

                            <small id="registerPasswordError"></small>

                        </div>

                        <div className="form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />

                            <small id="confirmPasswordError"></small>

                        </div>

                        <p id="registerMessage"></p>

                        <button
                            type="submit"
                            id="registerBtn"
                            className="student-btn"
                        >
                            Register
                        </button>

                    </form>

                    <p>
                        Already have an account?{" "}
                        <Link to="/student-login">
                            Student Login
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

export default Register;