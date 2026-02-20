import { useState, useCallback } from "react";
import type { ToastError } from "../components/ErrorToast";
import { parseError, isNetworkError } from "../utils/errorHandler";

let errorIdCounter = 0;

export const useErrorToast = () => {
  const [errors, setErrors] = useState<ToastError[]>([]);

  const showError = useCallback((error: unknown, duration: number = 5000) => {
    const parsedError = parseError(error);
    const id = `error-${++errorIdCounter}`;

    const toastError: ToastError = {
      id,
      message: parsedError.message,
      type: isNetworkError(error) ? "network" : "error",
      duration,
    };

    setErrors((prev) => [...prev, toastError]);
  }, []);

  const showWarning = useCallback(
    (message: string, duration: number = 5000) => {
      const id = `warning-${++errorIdCounter}`;

      const toastError: ToastError = {
        id,
        message,
        type: "warning",
        duration,
      };

      setErrors((prev) => [...prev, toastError]);
    },
    [],
  );

  const showNetworkError = useCallback((duration: number = 5000) => {
    const id = `network-${++errorIdCounter}`;

    const toastError: ToastError = {
      id,
      message: "No internet connection. Please check your network.",
      type: "network",
      duration,
    };

    setErrors((prev) => [...prev, toastError]);
  }, []);

  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    showError,
    showWarning,
    showNetworkError,
    dismissError,
    clearAll,
  };
};
