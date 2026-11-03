import { useContext } from "react";
import { AuthContext } from "./AuthContextStore.js";

export const useAuth = () => useContext(AuthContext);