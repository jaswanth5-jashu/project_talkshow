import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("talkshow_user");
        const accessToken = localStorage.getItem("talkshow_access");

        if (storedUser && accessToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        const { access, refresh, username, email, full_name, profile } = userData;
        const userInfo = { username, email, full_name, profile };
        
        localStorage.setItem("talkshow_user", JSON.stringify(userInfo));
        localStorage.setItem("talkshow_access", access);
        localStorage.setItem("talkshow_refresh", refresh);
        
        setUser(userInfo);
    };

    const logout = () => {
        localStorage.removeItem("talkshow_user");
        localStorage.removeItem("talkshow_access");
        localStorage.removeItem("talkshow_refresh");
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
