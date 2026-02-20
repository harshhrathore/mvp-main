import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';

interface MedicalQuizGuardProps {
    children: React.ReactElement;
}

/**
 * MedicalQuizGuard component to ensure medical quiz only shows for new users
 * If onboarding is already complete, redirect to dashboard
 */
const MedicalQuizGuard: React.FC<MedicalQuizGuardProps> = ({ children }) => {
    const { hasCompletedOnboarding, isLoading } = useOnboardingFlow();

    // Show loading state while checking onboarding status
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F9F7F4] via-[#FFF5EB] to-[#F0F4EF]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#7d9b7f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If user has already completed onboarding, redirect to dashboard
    if (hasCompletedOnboarding) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default MedicalQuizGuard;
