import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bgImage from "../assets/quizintro-bg.png";

const QuizIntro: React.FC = () => {
  const navigate = useNavigate();

  const easeOut = [0.22, 1, 0.36, 1] as const;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: easeOut },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 18, scale: 0.985 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 120, damping: 18 },
    },
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-3 sm:px-4 relative overflow-hidden">
      {/* Background Image */}
      <motion.img
        src={bgImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-20"
        style={{ objectPosition: "center 80%" }}
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: easeOut }}
      />

      {/* Soft overlay (lighter now) */}
      <motion.div
        className="absolute inset-0 bg-[#f8f3e8]/60 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.05 }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full flex flex-col items-center px-3 sm:px-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={item}
          className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-2"
        >
          Discover Your Manas Prakriti
        </motion.h1>

        <motion.p
          variants={item}
          className="text-sm sm:text-base md:text-lg text-gray-800 max-w-3xl mb-4 sm:mb-5"
        >
          Let's understand your unique mind-body constitution through a brief
          Ayurvedic assessment
        </motion.p>

        {/* Center card */}
        <motion.div
          variants={card}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="w-full max-w-3xl md:max-w-4xl bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-black/10 mb-5 sm:mb-6 px-5 sm:px-6 md:px-8 py-5 sm:py-6 md:py-7"
        >
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-gray-900">
              Ayurvedic Constitution
            </h2>

            <p className="mt-2.5 text-sm sm:text-base md:text-lg text-gray-800 leading-relaxed">
              This 15-question assessment helps identify your unique mind-body type based on 5,000-year-old wisdom.
            </p>

            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm sm:text-base text-gray-800 text-left max-w-2xl mx-auto">
              <li>• Personalizes all recommendations</li>
              <li>• Explains your natural tendencies</li>
              <li>• Takes 5-7 minutes</li>
              <li>• Based on CCRAS research</li>
            </ul>

            <div className="mt-5 flex justify-center">
              <motion.button
                type="button"
                onClick={() => navigate("/quiz")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className="bg-[#7d9b7f] hover:bg-[#6e8b70] text-white text-sm sm:text-base px-6 py-2.5 rounded-2xl shadow-md transition"
              >
                Let&apos;s Go →
              </motion.button>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={item}
          className="text-xs sm:text-sm text-gray-700/80 max-w-3xl"
        >
          Your responses help tailor recommendations across the app.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuizIntro;
