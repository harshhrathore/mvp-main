import React from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  interval?: number; // Time between each char
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = "",
  delay = 0,
  interval = 0.03,
}) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: interval, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 5,
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {text.split("").map((char, index) => (
        <motion.span variants={child} key={index}>
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};
