
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss.jsx";
import api from "../services/api";
import { useAuth } from "../auth/AuthContext.jsx";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password
      });

      const student = response.data.data;
        const token = response.data.token;

        login({
        id: student.id,
        name: student.name,
        email: student.email,
        department: student.department,
        role: "student",
        token
        });

      setMessage("Login successful!");
      navigate("/student-dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to log in. Please try again."
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
          <h1>Student Login</h1>

          <p>
            Login to access your Student Course Management System.
          </p>

          <form id="studentLoginForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="studentEmail">Email</label>
              <input
                type="email"
                id="studentEmail"
                name="studentEmail"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentPassword">Password</label>
              <input
                type="password"
                id="studentPassword"
                name="studentPassword"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <p id="studentLoginMessage" role="status">
              {message}
            </p>

            <button
              type="submit"
              id="studentLoginBtn"
              className="student-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>

          <Link to="/">Back to Home</Link>
        </section>
      </main>
    </>
  );
};

export default StudentLogin;
