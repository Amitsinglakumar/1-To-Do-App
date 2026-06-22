import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, googleLogin, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const persistSession = (session) => {
        localStorage.setItem('taskflow_token', session.token);
        setUser(session.user);
        return session.user;
    };

    useEffect(() => {
        const token = localStorage.getItem('taskflow_token');
        if (!token) {
            setIsAuthLoading(false);
            return;
        }

        getMe()
            .then(persistSession)
            .catch(() => localStorage.removeItem('taskflow_token'))
            .finally(() => setIsAuthLoading(false));
    }, []);

    const value = useMemo(() => ({
        user,
        isAuthLoading,
        login: (credentials) => loginUser(credentials).then(persistSession),
        register: (details) => registerUser(details).then(persistSession),
        signInWithGoogle: (credential) => googleLogin(credential).then(persistSession),
        logout: () => {
            localStorage.removeItem('taskflow_token');
            setUser(null);
        }
    }), [user, isAuthLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
