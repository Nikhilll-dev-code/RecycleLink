import { createContext, useContext, useState } from "react";
import api, { authAPI } from "../services/api";
import { wsService } from "../services/websocket";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
    // Determine which role context this tab belongs to
    const initialRole = sessionStorage.getItem("rl_active_role") || null;
    const [activeRole, setActiveRole] = useState(initialRole);

    const [user, setUser] = useState(() => {
        if (!initialRole) return null;
        try { return JSON.parse(localStorage.getItem(`rl_user_${initialRole}`)); } catch { return null; }
    });
    
    const [token, setToken] = useState(() => {
        if (!initialRole) return null;
        return localStorage.getItem(`rl_token_${initialRole}`) || null;
    });

    const login = (u, t) => {
        const role = u.role;
        setUser(u);
        setToken(t);
        setActiveRole(role);
        
        sessionStorage.setItem("rl_active_role", role);
        localStorage.setItem(`rl_user_${role}`, JSON.stringify(u));
        localStorage.setItem(`rl_token_${role}`, t);

        // Connect WebSocket if driver or admin (real time tracking)
        if (role === 'Driver' || role === 'Admin') {
            wsService.connect(t);
        }
    };

    const logout = () => {
        if (activeRole) {
            localStorage.removeItem(`rl_user_${activeRole}`);
            localStorage.removeItem(`rl_token_${activeRole}`);
        }
        sessionStorage.removeItem("rl_active_role");
        setUser(null);
        setToken(null);
        setActiveRole(null);
        wsService.disconnect();
    };

    // Keep apiFetch for backwards compatibility during refactoring
    const apiFetch = async (path, opts = {}) => {
        try {
            const isPost = opts.method === "POST" || opts.method === "PUT";
            const res = await api({
                url: path,
                method: opts.method || 'GET',
                data: isPost && opts.body ? JSON.parse(opts.body) : undefined,
            });
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.error || err.message || "Request failed");
        }
    };

    return <AuthCtx.Provider value={{ user, token, login, logout, apiFetch }}>{children}</AuthCtx.Provider>;
}
