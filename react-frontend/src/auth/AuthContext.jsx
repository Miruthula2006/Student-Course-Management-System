import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        try {
            const loggedInUser =
                localStorage.getItem("loggedInUser");

            return loggedInUser
                ? JSON.parse(loggedInUser)
                : null;

        } catch (error) {
            console.error(
                "Error reading logged-in user:",
                error
            );

            localStorage.removeItem("loggedInUser");
            return null;
        }
    });


    // Keep React state synchronized with localStorage
    useEffect(() => {

        const handleAuthChange = () => {

            try {
                const loggedInUser =
                    localStorage.getItem("loggedInUser");

                setUser(
                    loggedInUser
                        ? JSON.parse(loggedInUser)
                        : null
                );

            } catch (error) {
                console.error(
                    "Error updating authentication state:",
                    error
                );

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

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(userData)
        );

        setUser(userData);

        window.dispatchEvent(
            new Event("authChanged")
        );

    };


    const logout = () => {

        localStorage.removeItem(
            "loggedInUser"
        );

        setUser(null);

        window.dispatchEvent(
            new Event("authChanged")
        );

    };


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};