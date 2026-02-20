import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';

/**
 * Custom hook to manage onboarding flow state.
 * Checks localStorage first for speed; if not found, asks the server
 * whether the user has already completed their profile/onboarding.
 * This prevents existing users from being stuck in the new-user flow.
 */
export const useOnboardingFlow = () => {
    const { user, isAuthenticated } = useAuth();
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setHasCompletedOnboarding(false);
            setIsLoading(false);
            return;
        }

        const localKey = `onboarding_completed_${user.id}`;
        const localFlag = localStorage.getItem(localKey);

        if (localFlag === 'true') {
            // Fast path: already confirmed locally
            setHasCompletedOnboarding(true);
            setIsLoading(false);
            return;
        }

        // Slow path: ask the server — handles returning users who
        // registered before the localStorage flag was introduced,
        // or users who cleared their browser storage.
        const checkWithServer = async () => {
            try {
                const res = await api.get('/api/auth/me');
                // If the server says the user exists and has a profile,
                // treat them as having completed onboarding.
                const serverUser = res.data?.data?.user ?? res.data?.user ?? res.data;
                const completed = !!(
                    serverUser &&
                    (serverUser.onboarding_completed ||
                        serverUser.onboardingCompleted ||
                        // Fallback: any user with a confirmed email is "done"
                        serverUser.email_verified ||
                        serverUser.emailVerified ||
                        // Any user returned by /me has already been through registration
                        serverUser.id)
                );

                if (completed) {
                    localStorage.setItem(localKey, 'true');
                }
                setHasCompletedOnboarding(completed);
            } catch {
                // Network error — assume completed to avoid blocking the user
                setHasCompletedOnboarding(true);
            } finally {
                setIsLoading(false);
            }
        };

        checkWithServer();
    }, [user, isAuthenticated]);

    const markOnboardingComplete = () => {
        if (user) {
            localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
            setHasCompletedOnboarding(true);
        }
    };

    const resetOnboarding = () => {
        if (user) {
            localStorage.removeItem(`onboarding_completed_${user.id}`);
            setHasCompletedOnboarding(false);
        }
    };

    return {
        hasCompletedOnboarding,
        isLoading,
        markOnboardingComplete,
        resetOnboarding,
    };
};

/**
 * Hook for back-button navigation — always goes to dashboard.
 */
export const useBackToDashboard = () => {
    const navigate = useNavigate();
    return () => navigate('/dashboard', { replace: true });
};
