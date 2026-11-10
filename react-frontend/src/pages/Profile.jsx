import { useEffect, useState } from "react";
import PageCss from "../components/PageCss.jsx";
import StudentSidebar from "../components/StudentSidebar.jsx";
import api from "../services/api.js";

const emptyProfile = {
    name: "",
    registerNumber: "",
    email: "",
    phone: "",
    department: "",
    year: ""
};

const Profile = () => {
    const [profile, setProfile] = useState(emptyProfile);
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        api.get("/api/v1/profile")
            .then((response) => {
                if (!active) return;
                const student = response.data.student;
                if (!student || student.role !== "student") {
                    throw new Error("Student profile is unavailable.");
                }
                const nextProfile = {
                    name: student.name || "",
                    registerNumber: student.registerNumber || "",
                    email: student.email || "",
                    phone: student.phone || "",
                    department: student.department || "",
                    year: student.year || ""
                };
                setProfile(nextProfile);
                setFormData({ name: nextProfile.name, phone: nextProfile.phone });
                setError("");
            })
            .catch((requestError) => {
                if (active) {
                    setError(requestError.response?.data?.message || requestError.message || "Unable to load your profile.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        setSuccess("");
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const phone = formData.phone.trim();
        if (!name) {
            setError("Full name is required.");
            return;
        }
        if (!/^\+?[0-9]{10,15}$/.test(phone)) {
            setError("Enter a phone number containing 10 to 15 digits, with an optional leading +.");
            return;
        }

        setSaving(true);
        try {
            const response = await api.put("/api/v1/profile", { name, phone });
            const updatedStudent = response.data.student;
            const nextProfile = {
                ...profile,
                name: updatedStudent.name,
                phone: updatedStudent.phone
            };
            setProfile(nextProfile);
            setFormData({ name: nextProfile.name, phone: nextProfile.phone });
            setSuccess("Profile updated successfully.");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to save your profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <PageCss href="/css/style.css" />
            <PageCss href="/css/dashboard.css" />
            <div className="container">
                <StudentSidebar />
                <main className="main-content">
                    <header className="topbar">
                        <h1>My Profile</h1>
                        <p>View and update your student contact information.</p>
                    </header>
                    <section className="course-card">
                        {loading ? (
                            <p role="status">Loading your profile...</p>
                        ) : error && !profile.email ? (
                            <p role="alert">{error}</p>
                        ) : (
                            <>
                                {error && <p role="alert">{error}</p>}
                                {success && <p role="status">{success}</p>}
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="profileName">Full name</label>
                                        <input
                                            id="profileName"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            maxLength={120}
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="profileRegisterNumber">Register number</label>
                                        <input id="profileRegisterNumber" value={profile.registerNumber} readOnly />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="profileEmail">Email</label>
                                        <input id="profileEmail" type="email" value={profile.email} readOnly />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="profilePhone">Phone number</label>
                                        <input
                                            id="profilePhone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            inputMode="tel"
                                            pattern="\+?[0-9]{10,15}"
                                            title="Use 10 to 15 digits, with an optional leading +."
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="profileDepartment">Department</label>
                                        <input id="profileDepartment" value={profile.department} readOnly />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="profileYear">Year</label>
                                        <input id="profileYear" value={profile.year} readOnly />
                                    </div>
                                    <button className="student-btn" type="submit" disabled={saving}>
                                        {saving ? "Saving..." : "Save changes"}
                                    </button>
                                </form>
                            </>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
};

export default Profile;
