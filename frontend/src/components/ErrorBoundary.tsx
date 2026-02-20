import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
          <motion.div
            className="max-w-md w-full bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-2xl font-serif font-semibold mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-sm text-black/70 mb-6">
                We encountered an unexpected error. Don't worry, your data is
                safe.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm font-semibold mb-2">
                    Error Details (Dev Only)
                  </summary>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs overflow-auto max-h-40">
                    <p className="font-semibold text-red-800 mb-1">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-red-600 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#7d9b7f] text-white press"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={this.handleGoHome}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/70 border border-black/10 press"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Go to Dashboard
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
