import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';

interface OnboardingGuardProps {
    children: React.ReactElement;
}

/**
 * OnboardingGuard — wraps all "real app" pages.
 * Users who haven't completed onboarding are redirected to start it.
 * Already-completed users (checked via localStorage + server) pass through.
 */
const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
    const { hasCompletedOnboarding, isLoading } = useOnboardingFlow();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #F9F7F4 0%, #FFF5EB 50%, #F0F4EF 100%)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        border: '4px solid #d1e5d3',
                        borderTopColor: '#7d9b7f',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px',
                    }} />
                    <p style={{ color: '#606060', fontSize: 15 }}>Loading your session…</p>
                </div>
            </div>
        );
    }

    if (!hasCompletedOnboarding) {
        return <Navigate to="/medicalquiz-intro" replace />;
    }

    return children;
};

export default OnboardingGuard;
