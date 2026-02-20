
import { useInView } from "framer-motion";
import { useRef } from "react";

export function useScrollReveal(options = { once: true, amount: 0.1 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, options);

    return {
        ref,
        isInView,
        animation: {
            hidden: { opacity: 0, y: 30 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.6,
                    ease: [0.2, 0.9, 0.3, 1] as any,
                },
            },
        },
    };
}

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};
