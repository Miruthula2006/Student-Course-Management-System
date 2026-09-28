import { useNavigate } from "react-router-dom";

const LogoutButton = ({ admin = false }) => {
    const navigate = useNavigate();

    const handleLogout = (event) => {
        event.preventDefault();

        if (!window.confirm("Are you sure you want to logout?")) {
            return;
        }

        localStorage.removeItem("loggedInUser");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/", { replace: true });
    };

    return (
        <a href="/" onClick={handleLogout} id={admin ? "adminLogoutBtn" : "studentLogoutBtn"} data-react-logout="true">
            <i className="fa-solid fa-right-from-bracket"></i>
            Logout
        </a>
    );
};

export default LogoutButton;
