
import { useState } from "react";
import PageCss from "../components/PageCss.jsx";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    registerNumber: "",
    registerEmail: "",
    phone: "",
    department: "",
    year: "",
    registerPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (form.registerPassword !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (
      form.registerPassword.length < 8 ||
      form.registerPassword.length > 72
    ) {
      setMessage("Password must be between 8 and 72 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/v1/auth/register", {
        name: form.fullName,
        email: form.registerEmail,
        password: form.registerPassword,
        department: form.department
      });

      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/student-login");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageCss href="/css/style.css" />

      <main className="login-container">
        <section className="login-card">
          <h1>Student Registration</h1>

          <p>
            Create your Student Course Management System account.
          </p>

          <form id="registerForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerNumber">Register Number</label>
              <input
                type="text"
                id="registerNumber"
                name="registerNumber"
                placeholder="Enter your register number"
                value={form.registerNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerEmail">Email</label>
              <input
                type="email"
                id="registerEmail"
                name="registerEmail"
                placeholder="Enter your email"
                autoComplete="email"
                value={form.registerEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="B.Sc Computer Science with AI">
                  B.Sc Computer Science with AI
                </option>
                <option value="B.Sc Computer Science">
                  B.Sc Computer Science
                </option>
                <option value="B.Sc Information Technology">
                  B.Sc Information Technology
                </option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="B.Com">B.Com</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year</label>
              <select
                id="year"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input
                type="password"
                id="registerPassword"
                name="registerPassword"
                placeholder="Create a password"
                autoComplete="new-password"
                value={form.registerPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <p id="registerMessage" role="status">
              {message}
            </p>

            <button
              type="submit"
              id="registerBtn"
              className="student-btn"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <Link to="/student-login">Student Login</Link>
          </p>

          <Link to="/">Back to Home</Link>
        </section>
      </main>
    </>
  );
};

export default Register;
