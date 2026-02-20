import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    const iconSizes = {
        sm: 12,
        md: 20,
        lg: 32,
    };

    const Container = fullScreen ? 'div' : React.Fragment;
    const containerProps = fullScreen ? {
        className: 'fixed inset-0 bg-[#FAF7F2]/80 backdrop-blur-sm flex items-center justify-center z-50'
    } : {};

    return (
        <Container {...containerProps}>
            <div className="flex flex-col items-center justify-center gap-4">
                {/* Animated Leaf Icon */}
                <motion.div
                    className={`${sizeClasses[size]} rounded-2xl bg-white/70 border border-black/10 flex items-center justify-center`}
                    animate={{
                        rotate: [0, -10, 0, 10, 0],
                        scale: [1, 1.1, 1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Leaf
                        size={iconSizes[size]}
                        className="text-[#0F6B4F]"
                    />
                </motion.div>

                {/* Pulsing Dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[#0F6B4F]"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>

                {/* Message */}
                {message && (
                    <motion.p
                        className="text-sm text-black/60 font-serif"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {message}
                    </motion.p>
                )}
            </div>
        </Container>
    );
};

// Simple inline loader for buttons
export const ButtonLoader: React.FC = () => (
    <svg
        className="animate-spin h-5 w-5"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
);

// Skeleton loader for content
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse ${className}`}>
        <div className="bg-black/10 rounded-2xl h-full w-full" />
    </div>
);

export default LoadingSpinner;
