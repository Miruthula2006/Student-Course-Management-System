
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss.jsx";
import api from "../services/api";
import { useAuth } from "../auth/useAuth.js";

const AdminLogin = () => {
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

      const admin = response.data.data;
      const token = response.data.token;

      // Allow only administrator accounts
      if (admin.role !== "admin") {
        setMessage(
          "This is a student account. Please use Student Login."
        );
        return;
      }

      login({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token
      });

      setMessage("Admin login successful!");

      navigate("/admin-dashboard");

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to log in. Please check your credentials."
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

          <h1>Administrator Login</h1>

          <p>
            Login to access the Student Course Management System
            Administrator Panel.
          </p>

          <form id="adminLoginForm" onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="adminEmail">Email</label>

              <input
                type="email"
                id="adminEmail"
                name="adminEmail"
                placeholder="Enter administrator email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">Password</label>

              <input
                type="password"
                id="adminPassword"
                name="adminPassword"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <p id="adminLoginMessage" role="status">
              {message}
            </p>

            <button
              type="submit"
              id="adminLoginBtn"
              className="admin-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p>
            <Link to="/forgot-password">
              Forgot Password?
            </Link>
          </p>

          <Link to="/">Back to Home</Link>

        </section>
      </main>
    </>
  );
};

export default AdminLogin;
