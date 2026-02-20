import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import registerBg from "../../assets/register-bg.jpg";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // If already logged in, skip the login form
  useEffect(() => {
    if (isAuthenticated) {
      const lastRoute = localStorage.getItem('last_visited_route');
      const isValid = lastRoute &&
        !['/', '/landing', '/login', '/register'].includes(lastRoute) &&
        !lastRoute.startsWith('/verify-email') &&
        !lastRoute.startsWith('/medicalquiz') &&
        lastRoute !== '/onboarding-goals';
      navigate(isValid ? lastRoute : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", form);

      if (response.data?.success) {
        // Use auth context to handle login
        login(response.data.data.user, response.data.data.token);
        // Navigate explicitly so we don't rely on ProtectedRoute re-render timing
        const lastRoute = localStorage.getItem('last_visited_route');
        const isValid = lastRoute &&
          !['/', '/landing', '/login', '/register'].includes(lastRoute) &&
          !lastRoute.startsWith('/verify-email');
        navigate(isValid ? lastRoute : '/dashboard', { replace: true });
      } else {
        setError(response.data?.message || "Login failed");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F7F4] via-[#FFF5EB] to-[#F0F4EF] p-4 sm:p-6 relative overflow-hidden">
      {/* Background Image */}
      <img
        src={registerBg}
        alt="Wellness Background"
        className="absolute inset-0 w-full h-full object-cover kenburns-soft"
        style={{ objectPosition: "center 70%" }}
      />

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9F7F4]/30 via-[#FFF5EB]/30 to-[#F0F4EF]/10 backdrop-blur-[2px]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#F5BDA6]/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-[#A7CDA9]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#B1C5B2]/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-3xl relative z-10 fade-up scale-in px-3 sm:px-4">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-white/40 hover:shadow-[0_20px_60px_rgba(245,189,166,0.3)] transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8 fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E1E1E] mb-2 tracking-tight">
              Welcome back to{" "}
              <span className="bg-gradient-to-r from-[#F5BDA6] to-[#A7CDA9] bg-clip-text text-transparent">
                SAMA
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#606060]">
              Sign in to continue your wellness journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-center fade-in shadow-sm">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="fade-up" style={{ animationDelay: "0.1s" }}>
                <label className="block text-[#1E1E1E] text-sm font-medium mb-2">
                  Your Email Address
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Enter Your Email"
                    required
                    autoComplete="email"
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/70 backdrop-blur-sm placeholder:text-[#A0A0A0] text-[#1E1E1E] border-2 border-white/50 focus:border-[#A7CDA9] focus:bg-white/90 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A7CDA9]/20 to-[#F5BDA6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-xl" />
                </div>
              </div>

              {/* Password */}
              <div className="fade-up" style={{ animationDelay: "0.2s" }}>
                <label className="block text-[#1E1E1E] text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative group">
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Your Password"
                    required
                    minLength={6}
                    autoComplete="current-password"
                    className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-white/70 backdrop-blur-sm placeholder:text-[#A0A0A0] text-[#1E1E1E] border-2 border-white/50 focus:border-[#F5BDA6] focus:bg-white/90 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#1E1E1E] transition-colors duration-200 z-10"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F5BDA6]/20 to-[#A7CDA9]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-xl" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 fade-up" style={{ animationDelay: "0.3s" }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto mx-auto block px-12 py-4 rounded-2xl bg-gradient-to-r from-[#F5BDA6] to-[#A7CDA9] gradient-shift text-white text-lg font-semibold hover:from-[#F4AD94] hover:to-[#95B69D] transform hover:scale-105 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
