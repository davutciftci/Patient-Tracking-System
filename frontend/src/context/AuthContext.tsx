import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    token: string;
    role: 'patient' | 'doctor' | 'secretary';
    firstName: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, role: User['role'], firstName: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role') as User['role'];
        const firstName = localStorage.getItem('firstName') || '';
        if (token && role) {
            setUser({ token, role, firstName });
        }
    }, []);

    const login = (token: string, role: User['role'], firstName: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('firstName', firstName);
        setUser({ token, role, firstName });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('firstName');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
