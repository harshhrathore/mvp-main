import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Wifi, WifiOff } from "lucide-react";

export interface ToastError {
  id: string;
  message: string;
  type: "error" | "warning" | "network";
  duration?: number;
}

interface ErrorToastProps {
  errors: ToastError[];
  onDismiss: (id: string) => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ errors, onDismiss }) => {
  useEffect(() => {
    errors.forEach((error) => {
      if (error.duration) {
        const timer = setTimeout(() => {
          onDismiss(error.id);
        }, error.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [errors, onDismiss]);

  const getIcon = (type: ToastError["type"]) => {
    switch (type) {
      case "network":
        return <WifiOff size={20} />;
      case "warning":
        return <AlertCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getStyles = (type: ToastError["type"]) => {
    switch (type) {
      case "network":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "text-blue-600",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "text-yellow-600",
        };
      default:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-600",
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {errors.map((error) => {
          const styles = getStyles(error.type);
          return (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`${styles.bg} ${styles.border} border rounded-xl p-4 shadow-lg backdrop-blur-sm`}
            >
              <div className="flex items-start gap-3">
                <div className={styles.icon}>{getIcon(error.type)}</div>
                <div className="flex-1">
                  <p className={`text-sm ${styles.text} leading-relaxed`}>
                    {error.message}
                  </p>
                </div>
                <button
                  onClick={() => onDismiss(error.id)}
                  className={`${styles.icon} hover:opacity-70 transition-opacity`}
                  aria-label="Dismiss"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ErrorToast;
export type { ToastError };
