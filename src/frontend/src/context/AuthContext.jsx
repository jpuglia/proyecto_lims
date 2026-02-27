import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    /**
     * Devuelve true si el usuario tiene al menos uno de los roles indicados.
     * @param {...string} roles - nombres de roles a verificar
     */
    const hasRole = (...roles) => {
        if (!user) return false;
        const userRoles = user.roles || [];
        return roles.some(r => userRoles.includes(r));
    };

    /**
     * Roles del usuario actual (array de strings).
     */
    const userRoles = user?.roles || [];

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasRole, userRoles }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
