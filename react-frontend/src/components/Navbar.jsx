import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav>
            <div>
                <NavLink to="/">
                    SCMS
                </NavLink>
            </div>

            <div>
                <NavLink to="/">
                    Home
                </NavLink>

                {user && (
                    <>
                        <NavLink to="/student-dashboard">
                            Dashboard
                        </NavLink>

                        <NavLink to="/courses">
                            Courses
                        </NavLink>

                        <button onClick={logout}>
                            Logout
                        </button>
                    </>
                )}

                {!user && (
                    <>
                        <NavLink to="/student-login">
                            Login
                        </NavLink>

                        <NavLink to="/register">
                            Register
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;