import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Leaf, Menu, X, ArrowRight } from "lucide-react";
import samaLogo from "../assets/sama_logo.png";

// Components
import HeroSection from "../components/landing/HeroSection";
import AIPowerSection from "../components/landing/AIPowerSection";
import TechStackSection from "../components/landing/TechStackSection";
import AIYogaSection from "../components/landing/AIYogaSection";
import DoshaDetectionSection from "../components/landing/DoshaDetectionSection";
import ProgressSection from "../components/landing/ProgressSection";
import ComparisonSection from "../components/landing/ComparisonSection";
import JourneySection from "../components/landing/JourneySection";
import PrivacySection from "../components/landing/PrivacySection";
import {
  GetStartedSection,
  LandingFooter,
} from "../components/landing/GetStartedSection";

const LandingPage: React.FC = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Header Animation
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"],
  );
  const headerBackdrop = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"],
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 50],
    ["none", "0 4px 20px rgba(0,0,0,0.05)"],
  );

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <div className="min-h-screen font-sans selection:bg-[#0F6B4F] selection:text-white">
      {/* Fixed Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent"
        style={{
          backgroundColor: headerBg,
          backdropFilter: headerBackdrop,
          boxShadow: headerShadow,
          borderColor: isScrolled ? "rgba(0,0,0,0.05)" : "transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src={samaLogo}
              alt="Sama Wellness Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a
              href="#ai-power"
              className="hover:text-[#0F6B4F] transition-colors"
            >
              AI Demo
            </a>
            <a
              href="#tech-stack"
              className="hover:text-[#0F6B4F] transition-colors"
            >
              Technology
            </a>
            <a
              href="#ai-yoga"
              className="hover:text-[#0F6B4F] transition-colors"
            >
              Yoga
            </a>
            <a
              href="#privacy"
              className="hover:text-[#0F6B4F] transition-colors"
            >
              Privacy
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="text-gray-900 font-medium hover:text-[#0F6B4F] text-sm sm:text-base"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-3 py-2 sm:px-5 sm:py-2.5 bg-[#0F6B4F] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              Try Free
              <ArrowRight size={16} />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="p-4 space-y-4 flex flex-col items-center">
                <a href="#ai-power" onClick={() => setMobileMenuOpen(false)}>
                  AI Demo
                </a>
                <a href="#tech-stack" onClick={() => setMobileMenuOpen(false)}>
                  Technology
                </a>
                <a href="#ai-yoga" onClick={() => setMobileMenuOpen(false)}>
                  Yoga
                </a>
                <a href="#privacy" onClick={() => setMobileMenuOpen(false)}>
                  Privacy
                </a>
                <hr className="w-full border-gray-100" />
                <button
                  onClick={() => navigate("/register")}
                  className="w-full py-3 bg-[#0F6B4F] text-white rounded-xl font-bold"
                >
                  Try AI Free
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="pt-0">
        <HeroSection />
        <AIPowerSection />
        <TechStackSection />
        <AIYogaSection />
        <DoshaDetectionSection />
        <ProgressSection />
        <div className="bg-[#FAF7F2]">
          <ComparisonSection />
        </div>
        <JourneySection />
        <PrivacySection />
        <GetStartedSection />
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
