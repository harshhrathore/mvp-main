import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteTracker - persists the last visited app page to localStorage.
 * Used to restore the correct page on reload and after login.
 *
 * Rules:
 * - Auth pages are excluded (would cause redirect loops)
 * - One-time onboarding pages are excluded (shouldn't be the "saved" page)
 * - Everything else is saved so the user returns to the same page on reload
 */
const RouteTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Pages that must NOT be saved as the last-visited destination
        const excludedPrefixes = [
            '/',
            '/landing',
            '/login',
            '/register',
            '/verify-email',
            '/medicalquiz-intro',
            '/medicalquiz',
            '/onboarding-goals',
        ];

        const path = location.pathname;

        const isExcluded =
            excludedPrefixes.includes(path) ||
            path.startsWith('/verify-email/');

        if (!isExcluded) {
            localStorage.setItem('last_visited_route', path + location.search);
        }
    }, [location]);

    return null;
};

export default RouteTracker;
