import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface BackButtonProps {
  to?: string;
  className?: string;
  iconSize?: number;
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  className = "",
  iconSize = 24,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      onClick={handleBack}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/60 border border-black/10 press ${className}`}
      aria-label="Go back"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft size={iconSize} />
    </motion.button>
  );
};

export default BackButton;
