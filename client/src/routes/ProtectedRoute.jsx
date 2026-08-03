import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * - If not authenticated → redirect to /login
 * - If authenticated but wrong role → redirect to their dashboard
 * - If blocked user slips through → redirect to /login
 *
 * @param {string[]} allowedRoles - roles permitted to view the nested routes
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    const dashMap = { student: '/student', teacher: '/teacher', admin: '/admin' };
    return <Navigate to={dashMap[user.role] || '/login'} replace />;
  }

  return <Outlet />;
}
