import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../api";

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const email =
    (location.state as { email?: string })?.email || "email@example.com";
  
  const registrationMessage = (location.state as { message?: string })?.message;

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/api/auth/resend-verification", {
        email: email,
      });
      setMessage(response.data.message || "Verification email resent successfully!");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDifferentEmail = () => {
    navigate("/");
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-[#F9F7F4] px-3 sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="
          w-full max-w-xl rounded-2xl shadow-md p-6 sm:p-8 md:p-10 relative

          /* FULL CARD GRADIENT */
          bg-linear-to-b
          from-[#F5BDA6]
          via-[#F5BDA6]/10
          to-[#A7CDA9]/20
        "
        initial={{ opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 text-2xl text-[#1E1E1E]"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>

        <h2 className="text-center text-xl sm:text-2xl font-semibold text-[#1E1E1E] mt-8 sm:mt-12">
          Check your inbox 📩
        </h2>

        <p className="text-center mt-3 sm:mt-4 text-[#1E1E1E] leading-relaxed text-sm sm:text-base px-2">
          We sent a magic link to <span className="font-semibold">{email}</span>
          <br />
          Click the link to verify and continue your wellness journey
        </p>

        {/* REGISTRATION SUCCESS MESSAGE */}
        {registrationMessage && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center text-sm">
            {registrationMessage}
          </div>
        )}

        {/* RESEND MESSAGE DISPLAY */}
        {message && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-center text-sm">
            {message}
          </div>
        )}

        <div className="mt-6 sm:mt-8 flex justify-center">
          <motion.button
            onClick={handleResendEmail}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
              px-8 sm:px-12 py-2.5 sm:py-3 rounded-full
              bg-[#D68A6A] text-white text-base sm:text-lg
              hover:bg-[#c47a5d]
              transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? "Sending..." : "Resend Email"}
          </motion.button>
        </div>

        <p
          onClick={handleUseDifferentEmail}
          className="text-center text-[#808080] mt-3 sm:mt-4 cursor-pointer hover:underline text-sm sm:text-base"
        >
          Use a different email
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EmailVerification;
