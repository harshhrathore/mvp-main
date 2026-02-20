import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactElement;
    requireAuth?: boolean;
}

/**
 * ProtectedRoute guards routes by authentication state.
 *
 * requireAuth=true  → only accessible when logged in; redirects to /landing otherwise
 * requireAuth=false → only accessible when logged out (e.g. /login, /landing);
 *                     logged-in users are redirected to their last page or /dashboard
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true
}) => {
    const { isAuthenticated } = useAuth();

    if (requireAuth && !isAuthenticated) {
        // Not logged in — save the attempted URL so we can return after login
        // (only useful if someone deep-links to a protected page)
        return <Navigate to="/landing" replace />;
    }

    if (!requireAuth && isAuthenticated) {
        // Already logged in — send them to where they were, or dashboard
        const lastRoute = localStorage.getItem('last_visited_route');
        const isValidLastRoute =
            lastRoute &&
            !['/', '/landing', '/login', '/register'].includes(lastRoute) &&
            !lastRoute.startsWith('/verify-email') &&
            !lastRoute.startsWith('/medicalquiz') &&
            lastRoute !== '/onboarding-goals';

        return <Navigate to={isValidLastRoute ? lastRoute : '/dashboard'} replace />;
    }

    return children;
};

export default ProtectedRoute;
