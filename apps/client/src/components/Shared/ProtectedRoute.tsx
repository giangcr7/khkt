import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const role = localStorage.getItem('role')?.toUpperCase();
    const token = localStorage.getItem('token');

    if (!token || !role) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

    return <Outlet />;
};
export default ProtectedRoute;