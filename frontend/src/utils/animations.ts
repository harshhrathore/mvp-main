// Animation variants for Framer Motion
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
};

export const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export const slideDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export const slideLeft = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export const slideRight = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export const scaleUp = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }, // Spring effect
};

export const rotateIn = {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 10 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

// Stagger children animations
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerItem = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
};

// Floating animation
export const float = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Pulse animation
export const pulse = {
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Shake animation (for errors)
export const shake = {
    animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.5,
            ease: 'easeInOut',
        },
    },
};

// Glow animation
export const glow = {
    animate: {
        boxShadow: [
            '0 0 0 0 rgba(34, 197, 94, 0)',
            '0 0 0 10px rgba(34, 197, 94, 0.1)',
            '0 0 0 0 rgba(34, 197, 94, 0)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Card hover animation
export const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    tap: {
        scale: 0.98,
    },
};

// Button variants
export const buttonHover = {
    rest: { scale: 1 },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    tap: {
        scale: 0.95,
    },
};

// Shimmer effect (for loading states)
export const shimmer = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

// Page transition variants
export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

// Modal variants
export const modalBackdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
};

export const modalContent = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

// Drawer variants
export const drawerSlideIn = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export const drawerSlideInLeft = {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

// List item animations
export const listItemSlide = {
    initial: { opacity: 0, x: -20 },
    animate: (index: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: index * 0.05,
            duration: 0.3,
            ease: 'easeOut',
        },
    }),
};

// Ripple effect (for buttons)
export const ripple = {
    initial: { scale: 0, opacity: 0.5 },
    animate: { scale: 2, opacity: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
};

// Breathing animation (for meditation/wellness features)
export const breathe = {
    animate: {
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Success checkmark animation
export const checkmark = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
        pathLength: 1,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: 'easeInOut',
        },
    },
};
