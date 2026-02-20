import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';
import type { User } from '../api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Initialize synchronously from localStorage to avoid authentication flicker
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Error parsing stored user:', error);
            return null;
        }
    });

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('last_visited_route');
        // Redirect to landing page
        window.location.href = '/landing';
    };

    const checkAuthStatus = async () => {
        if (!token) return;
        try {
            await api.get('/api/auth/me');
        } catch (error: any) {
            console.error('Session validation failed:', error);
            // Only logout if 401 (Unauthorized) or 403 (Forbidden)
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logout();
            }
        }
    };

    // Validate session on mount
    useEffect(() => {
        if (token) {
            checkAuthStatus();
        }
    }, []);

    const login = (userData: User, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        checkAuthStatus
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
