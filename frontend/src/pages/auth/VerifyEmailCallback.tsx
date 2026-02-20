import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const VerifyEmailCallback: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false); // Prevent multiple verification attempts
  
  // Safe setStatus that won't overwrite success
  const setStatusSafe = (newStatus: "loading" | "success" | "error") => {
    setStatus((prev) => {
      // Once success, don't allow overwriting with error
      if (prev === "success" && newStatus === "error") {
        return prev;
      }
      return newStatus;
    });
  };

  useEffect(() => {
    // If already verified, don't run again
    if (hasVerified.current) {
      return;
    }

    const verifyEmail = async () => {
      // Mark as attempting verification
      hasVerified.current = true;
      try {
        console.log("Starting email verification with token:", token?.substring(0, 10) + "...");
        const response = await api.get(`/api/auth/verify-email/${token}`);
        console.log("Verification response:", response);
        console.log("Response data:", response.data);
        console.log("Response status:", response.status);
        
        const responseData = response.data || {};
        
        // Check multiple possible success indicators
        const hasSuccessFlag = responseData.success === true;
        const hasUserData = responseData.data?.user || responseData.user;
        const hasToken = responseData.data?.token || responseData.token;
        const statusCode = response.status;
        
        // Consider it successful if:
        // 1. Success flag is true, OR
        // 2. Status is 200/201/204 (HTTP success), OR
        // 3. We have both user and token data
        const isSuccess = hasSuccessFlag || 
                         (statusCode >= 200 && statusCode < 300) ||
                         (hasUserData && hasToken);
        
        console.log("Success check:", {
          hasSuccessFlag,
          hasUserData,
          hasToken,
          statusCode,
          isSuccess
        });
        
        if (isSuccess) {
          console.log("✅ Verification successful, logging in user");
          setStatusSafe("success");
          setMessage(responseData.message || "Email verified successfully! You're all set.");

          // Extract user and token from different possible locations
          const user = responseData.data?.user || responseData.user;
          const authToken = responseData.data?.token || responseData.token;
          
          // Store userId before setTimeout to ensure it's captured
          const userId = user?.id;
          
          if (user && authToken) {
            console.log("Logging in user:", user);
            login(user, authToken);
          } else {
            console.warn("User or token missing in response:", { user, authToken });
          }

          // Redirect after 2 seconds:
          // For NEW users (just verified), ALWAYS go to medical quiz intro first
          // Only go to dashboard if they've completed BOTH medical quiz AND onboarding goals
          setTimeout(() => {
            try {
              const hasCompletedMedicalQuiz =
                localStorage.getItem("sama_medical_quiz_completed") === "true";
              
              // Check if onboarding goals are also completed
              const hasCompletedOnboarding = userId 
                ? localStorage.getItem(`onboarding_completed_${userId}`) === "true"
                : false;

              console.log("Navigating after verification:", {
                hasCompletedMedicalQuiz,
                hasCompletedOnboarding,
                userId
              });
              
              // Only go to dashboard if BOTH are completed
              if (hasCompletedMedicalQuiz && hasCompletedOnboarding) {
                console.log("Both quiz and onboarding completed - navigating to dashboard");
                navigate("/dashboard", { replace: true });
              } else {
                console.log("New user flow - navigating to medical quiz intro");
                navigate("/medicalquiz-intro", { replace: true });
              }
            } catch (err) {
              console.error("Error checking onboarding status:", err);
              // If storage fails, always show medical quiz intro for new users
              navigate("/medicalquiz-intro", { replace: true });
            }
          }, 2000);
        } else {
          // Handle case where response is not successful
          console.log("❌ Verification response indicates failure");
          console.log("Response data:", responseData);
          setStatusSafe("error");
          setMessage(responseData.message || "Verification failed. Please try again.");
        }
      } catch (err: any) {
        console.error("❌ Verification error:", err);
        console.error("Error response:", err.response);
        console.error("Error data:", err.response?.data);
        console.error("Error status:", err.response?.status);
        
        const errorData = err.response?.data || {};
        const errorStatus = err.response?.status;
        
        // Check if error response actually contains success data (some APIs return errors with data)
        const hasUserInError = errorData.data?.user || errorData.user;
        const hasTokenInError = errorData.data?.token || errorData.token;
        
        // Handle 400 Bad Request - might mean token already used (already verified)
        // If we're already authenticated or get a 400, treat as success
        if (errorStatus === 400 && (isAuthenticated || errorData.message?.toLowerCase().includes("already") || errorData.message?.toLowerCase().includes("verified"))) {
          console.log("✅ Token already used (already verified), treating as success");
          setStatusSafe("success");
          setMessage("Email already verified! You're all set.");
          
          // If we have user/token in error, use it; otherwise rely on existing auth
          if (hasUserInError && hasTokenInError) {
            const user = errorData.data?.user || errorData.user;
            const authToken = errorData.data?.token || errorData.token;
            login(user, authToken);
          }
          
          setTimeout(() => {
            try {
              const hasCompletedMedicalQuiz =
                localStorage.getItem("sama_medical_quiz_completed") === "true";
              const userId = hasUserInError ? (errorData.data?.user?.id || errorData.user?.id) : null;
              const hasCompletedOnboarding = userId 
                ? localStorage.getItem(`onboarding_completed_${userId}`) === "true"
                : false;
              
              console.log("Navigating after 400 error:", {
                hasCompletedMedicalQuiz,
                hasCompletedOnboarding
              });
              
              if (hasCompletedMedicalQuiz && hasCompletedOnboarding) {
                navigate("/dashboard", { replace: true });
              } else {
                navigate("/medicalquiz-intro", { replace: true });
              }
            } catch (err) {
              console.error("Error navigating:", err);
              navigate("/medicalquiz-intro", { replace: true });
            }
          }, 2000);
        } else if (hasUserInError && hasTokenInError) {
          console.log("✅ Verification successful despite error status, logging in user");
          setStatusSafe("success");
          setMessage("Email verified successfully! You're all set.");
          
          const user = errorData.data?.user || errorData.user;
          const authToken = errorData.data?.token || errorData.token;
          login(user, authToken);
          
          setTimeout(() => {
            try {
              const hasCompletedMedicalQuiz =
                localStorage.getItem("sama_medical_quiz_completed") === "true";
              const userId = user?.id;
              const hasCompletedOnboarding = userId 
                ? localStorage.getItem(`onboarding_completed_${userId}`) === "true"
                : false;
              
              console.log("Navigating after error with user data:", {
                hasCompletedMedicalQuiz,
                hasCompletedOnboarding
              });
              
              if (hasCompletedMedicalQuiz && hasCompletedOnboarding) {
                navigate("/dashboard", { replace: true });
              } else {
                navigate("/medicalquiz-intro", { replace: true });
              }
            } catch (err) {
              console.error("Error navigating:", err);
              navigate("/medicalquiz-intro", { replace: true });
            }
          }, 2000);
        } else {
          setStatusSafe("error");
          setMessage(
            errorData.message ||
            "Verification failed. The link may be invalid or expired.",
          );
        }
      }
    };

    if (token && !hasVerified.current) {
      verifyEmail();
    }
  }, [token, navigate, login]);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-[#F9F7F4] px-3 sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="
          w-full max-w-xl rounded-2xl shadow-md p-6 sm:p-8 md:p-10

          bg-linear-to-b
          from-[#F5BDA6]
          via-[#F5BDA6]/10
          to-[#A7CDA9]/20
        "
        initial={{ opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-[#D68A6A]"></div>
              </div>
              <h2 className="text-center text-xl sm:text-2xl font-semibold text-[#1E1E1E] px-2">
                Verifying your email...
              </h2>
              <p className="text-center mt-2 text-[#808080] text-sm sm:text-base">
                Please wait a moment.
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/60 border border-[#A7CDA9]/60 flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#4F915A]"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-center text-xl sm:text-2xl font-semibold text-[#1E1E1E] px-2">
                Verification Complete! ✅
              </h2>
              <p className="text-center mt-3 sm:mt-4 text-[#1E1E1E] text-sm sm:text-base px-2">
                {message}
              </p>
              <p className="text-center mt-2 text-[#808080] text-sm sm:text-base">
                Redirecting you to your wellness journey…
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/60 border border-[#D68A6A]/50 flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#D68A6A]"
                  >
                    <path
                      d="M12 9v4m0 4h.01"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.29 3.86l-7.4 12.82A2 2 0 0 0 4.62 20h14.76a2 2 0 0 0 1.73-3.32l-7.4-12.82a2 2 0 0 0-3.46 0Z"
                      stroke="currentColor"
                      strokeWidth="2.0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-center text-xl sm:text-2xl font-semibold text-[#1E1E1E] px-2">
                Verification failed
              </h2>
              <p className="text-center mt-3 sm:mt-4 text-[#1E1E1E] text-sm sm:text-base px-2">
                {message}
              </p>
              <div className="mt-6 sm:mt-8 flex justify-center">
                <motion.button
                  onClick={() => navigate("/")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    px-8 sm:px-10 py-2.5 sm:py-3 rounded-full
                    bg-[#D68A6A] text-white text-base sm:text-lg
                    hover:bg-[#c47a5d]
                    transition
                  "
                  type="button"
                >
                  Back to Home
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default VerifyEmailCallback;
