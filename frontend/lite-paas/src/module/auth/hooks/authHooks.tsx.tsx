import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export function useHookAuth() {
    return useContext(AuthContext);
}