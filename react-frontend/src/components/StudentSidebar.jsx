import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton.jsx";

const navigationItems = [
    { to: "/student-dashboard", label: "Dashboard", icon: "fa-house" },
    { to: "/profile", label: "Profile", icon: "fa-user" },
    { to: "/courses", label: "Courses", icon: "fa-book" },
    { to: "/my-courses", label: "My Courses", icon: "fa-graduation-cap" },
    { to: "/progress", label: "Progress", icon: "fa-chart-line" },
    { to: "/chat", label: "Chat", icon: "fa-comments" },
    { to: "/notifications", label: "Notifications", icon: "fa-bell" }
];

const StudentSidebar = () => {
    const { pathname } = useLocation();
    const activePath = pathname.startsWith("/course/") ? "/courses" : pathname;

    return (
        <aside className="sidebar">
            <h2>
                <i className="fa-solid fa-graduation-cap"></i>
                SCMS
            </h2>
            <p>Student Course Management</p>
            <ul>
                {navigationItems.map((item) => (
                    <li
                        key={item.to}
                        className={activePath === item.to ? "active" : undefined}
                    >
                        <Link to={item.to}>
                            <i className={`fa-solid ${item.icon}`}></i>
                            {item.label}
                        </Link>
                    </li>
                ))}
                <li>
                    <LogoutButton />
                </li>
            </ul>
        </aside>
    );
};

export default StudentSidebar;
