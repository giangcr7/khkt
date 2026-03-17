import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const location = useLocation();
    const rawRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');
        const role = rawRole ? rawRole.replace(/"/g, '').toUpperCase() : null;

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!role || !allowedRoles.includes(role)) {
        if (role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (role === 'LECTURER') return <Navigate to="/lecturer" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;