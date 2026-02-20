import React, { createContext, useContext, type ReactNode } from "react";
import ErrorToast from "../components/ErrorToast";
import type { ToastError } from "../components/ErrorToast";
import { useErrorToast } from "../hooks/useErrorToast";

interface ErrorContextType {
  showError: (error: unknown, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showNetworkError: (duration?: number) => void;
  dismissError: (id: string) => void;
  clearAll: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const {
    errors,
    showError,
    showWarning,
    showNetworkError,
    dismissError,
    clearAll,
  } = useErrorToast();

  return (
    <ErrorContext.Provider
      value={{
        showError,
        showWarning,
        showNetworkError,
        dismissError,
        clearAll,
      }}
    >
      {children}
      <ErrorToast errors={errors} onDismiss={dismissError} />
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
