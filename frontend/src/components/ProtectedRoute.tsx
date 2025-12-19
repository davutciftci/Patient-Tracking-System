import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('patient' | 'doctor' | 'secretary')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const dashboardMap = {
            patient: '/dashboard/patient',
            doctor: '/dashboard/doctor',
            secretary: '/dashboard/secretary',
        };
        return <Navigate to={dashboardMap[user.role]} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
