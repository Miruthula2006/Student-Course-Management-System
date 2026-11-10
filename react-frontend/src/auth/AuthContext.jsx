import { useEffect, useState } from "react";
import api from "../services/api.js";
import { AuthContext } from "./AuthContextStore.js";

const AuthProvider = ({ children }) => {
    const [isReady, setIsReady] = useState(() => !sessionStorage.getItem("token"));

    const [user, setUser] = useState(() => {
        try {
            const loggedInUser =
                localStorage.getItem("loggedInUser");

            return loggedInUser
                ? JSON.parse(loggedInUser)
                : null;

        } catch (error) {
            console.error("Error reading logged-in user", { name: error.name });

            localStorage.removeItem("loggedInUser");
            return null;
        }
    });


    // Keep React state synchronized with localStorage
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (token) {
            api.get("/api/v1/profile")
                .then((response) => {
                    const profile = response.data.student;
                    const verifiedUser = {
                        ...profile,
                        id: String(profile.id || profile._id)
                    };
                    localStorage.setItem("loggedInUser", JSON.stringify(verifiedUser));
                    setUser(verifiedUser);
                })
                .catch(() => {
                    localStorage.removeItem("loggedInUser");
                    sessionStorage.removeItem("token");
                    setUser(null);
                })
                .finally(() => setIsReady(true));
        }

        const handleAuthChange = () => {

            try {
                const loggedInUser =
                    localStorage.getItem("loggedInUser");

                setUser(
                    loggedInUser
                        ? JSON.parse(loggedInUser)
                        : null
                );
                setIsReady(true);

            } catch (error) {
                console.error("Error updating authentication state", { name: error.name });

                setUser(null);
            }
        };


        window.addEventListener(
            "authChanged",
            handleAuthChange
        );

        window.addEventListener(
            "storage",
            handleAuthChange
        );


        return () => {

            window.removeEventListener(
                "authChanged",
                handleAuthChange
            );

            window.removeEventListener(
                "storage",
                handleAuthChange
            );

        };

    }, []);


    
const login = (userData) => {
    const { token, ...user } = userData;

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(user)
    );

    if (token) {
        sessionStorage.setItem("token", token);
    }

    setUser(user);
    setIsReady(true);

    window.dispatchEvent(
        new Event("authChanged")
    );
};
const logout = () => {
    localStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("token");

    setUser(null);
    setIsReady(true);

    window.dispatchEvent(
        new Event("authChanged")
    );
};


    return (
        <AuthContext.Provider
            value={{
                user,
                isReady,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
