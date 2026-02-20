import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useBackToDashboard } from '../hooks/useOnboardingFlow';

interface BackToDashboardButtonProps {
    className?: string;
    variant?: 'icon' | 'button';
}

/**
 * BackToDashboardButton - A reusable component that navigates to dashboard
 * Use this instead of browser back button for consistent navigation experience
 */
const BackToDashboardButton: React.FC<BackToDashboardButtonProps> = ({
    className = '',
    variant = 'icon'
}) => {
    const goToDashboard = useBackToDashboard();

    if (variant === 'button') {
        return (
            <button
                onClick={goToDashboard}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 hover:bg-white transition-colors ${className}`}
            >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
            </button>
        );
    }

    return (
        <button
            onClick={goToDashboard}
            className={`p-2 rounded-lg hover:bg-white/20 transition-colors ${className}`}
            aria-label="Back to Dashboard"
        >
            <ArrowLeft size={24} />
        </button>
    );
};

export default BackToDashboardButton;
