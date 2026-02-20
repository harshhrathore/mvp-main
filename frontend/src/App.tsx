import React, { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Lazy load pages for better performance
const Register = lazy(() => import("./pages/auth/Register"));
const Login = lazy(() => import("./pages/auth/Login"));
const EmailVerification = lazy(() => import("./pages/auth/EmailVerification"));
const VerifyEmailCallback = lazy(
  () => import("./pages/auth/VerifyEmailCallback"),
);

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const BreathingBox = lazy(() => import("./pages/BreathingBox"));
const TodaysWellness = lazy(() => import("./pages/TodaysWellness"));
const AIWellnessGuide = lazy(() => import("./pages/AIWellnessGuide"));
const Yoga = lazy(() => import("./pages/Yoga"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const Ayurveda = lazy(() => import("./pages/Ayurveda"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const TestLanding = lazy(() => import("./pages/TestLanding"));
const Result = lazy(() => import("./pages/Result"));

const QuizIntro = lazy(() => import("./pages/QuizIntro"));
const QuizQuestions = lazy(() => import("./pages/QuizQuestions"));
const MedquizIntro = lazy(() => import("./pages/MedquizIntro"));
const MedicalQuiz = lazy(() => import("./pages/MedicalQuiz"));

const OnboardingGoals = lazy(() => import("./pages/OnboardingGoals"));

// Components
import RouteTracker from "./components/RouteTracker";
import NotificationManager from "./components/NotificationManager";
import ErrorBoundary from "./components/ErrorBoundary";
import { ErrorProvider } from "./contexts/ErrorContext";

// Styles
import "./styles/animations.css";

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const MotionRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location}>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/landing" replace />} />

            {/* Public / Landing */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/test" element={<TestLanding />} />

            {/* Auth pages */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route
              path="/verify-email/:token"
              element={<VerifyEmailCallback />}
            />

            {/* Onboarding / Medical Quiz Flow */}
            <Route path="/medicalquiz-intro" element={<MedquizIntro />} />
            <Route path="/medicalquiz" element={<MedicalQuiz />} />
            <Route path="/onboarding-goals" element={<OnboardingGoals />} />

            {/* App pages — all open, no guards */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quiz-intro" element={<QuizIntro />} />
            <Route path="/quiz" element={<QuizQuestions />} />
            <Route path="/result" element={<Result />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/breathing" element={<BreathingBox />} />
            <Route path="/todays-wellness" element={<TodaysWellness />} />
            <Route path="/ai-wellness-guide" element={<AIWellnessGuide />} />
            <Route path="/yoga" element={<Yoga />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/ayurveda" element={<Ayurveda />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <BrowserRouter>
          <RouteTracker />
          <NotificationManager />
          <MotionRoutes />
        </BrowserRouter>
      </ErrorProvider>
    </ErrorBoundary>
  );
};

export default App;
