import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  Activity,
  Bell,
  Brain,
  ChartNoAxesCombined,
  Home,
  Leaf,
  Moon,
  Scale,
  Search,
  Sunrise,
  User,
  TrendingUp,
  Share2,
  Flame,
  Award,
  Info,
  Cloud,
  CloudRain,
  Sun,
} from "lucide-react";

import leavesTop from "../assets/leaves-top.png";
import leavesBottom from "../assets/leaves-bottom.png";
import wellnessHero from "../assets/wellness-bg.png";

type QuickAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  description: string;
};

type Recommendation = {
  title: string;
  meta: string;
  tagLine: string;
  onStart: () => void;
  preview: string;
};

type EmotionalState = {
  state: string;
  confidence: number;
  dosha: string;
  color: string;
  timestamp: Date;
};

const card = "bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    state: "Anxious",
    confidence: 87,
    dosha: "Vata imbalance",
    color: "#ef4444",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });
  const [emotionalHistory] = useState([72, 65, 75, 82, 87]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sliderValue, setSliderValue] = useState(3);
  const [showSlider, setShowSlider] = useState(false);
  const [insightExpanded, setInsightExpanded] = useState(false);
  const [streak, setStreak] = useState(7);
  const [weeklyMinutes] = useState(120);
  const weeklyGoal = 150;
  const [weatherCondition] = useState<"sunny" | "rainy" | "cloudy">("sunny");
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    const weatherIcons = {
      sunny: <Sun size={20} className="text-yellow-500" />,
      rainy: <CloudRain size={20} className="text-blue-500" />,
      cloudy: <Cloud size={20} className="text-gray-500" />,
    };

    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17) timeGreeting = "Good evening";

    const weatherText =
      weatherCondition === "sunny"
        ? "sunny day"
        : weatherCondition === "rainy"
          ? "rainy day"
          : "cloudy day";

    return {
      greeting: `${timeGreeting}, ${user?.full_name || "there"}`,
      subtext: (
        <span className="flex items-center gap-2">
          {weatherIcons[weatherCondition]}
          <span>It's a {weatherText}</span>
        </span>
      ),
    };
  };

  const { greeting, subtext } = getGreeting();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Countdown for recommendation preview
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      if (selectedRecommendation) {
        selectedRecommendation.onStart();
      }
      setShowCountdown(false);
      setCountdown(5);
      setSelectedRecommendation(null);
    }
  }, [showCountdown, countdown, selectedRecommendation]);

  // Handle emotional state refresh
  const handleRefresh = () => {
    setShowSlider(true);
  };

  const handleSliderSubmit = () => {
    const states = [
      {
        state: "Very Anxious",
        confidence: 92,
        dosha: "Vata imbalance",
        color: "#dc2626",
      },
      {
        state: "Anxious",
        confidence: 87,
        dosha: "Vata imbalance",
        color: "#ef4444",
      },
      { state: "Neutral", confidence: 75, dosha: "Balanced", color: "#f59e0b" },
      { state: "Calm", confidence: 85, dosha: "Balanced", color: "#10b981" },
      {
        state: "Very Calm",
        confidence: 95,
        dosha: "Kapha balance",
        color: "#059669",
      },
    ];

    setIsRefreshing(true);
    setTimeout(() => {
      setEmotionalState({ ...states[sliderValue - 1], timestamp: new Date() });
      setShowSlider(false);
      setIsRefreshing(false);
    }, 800);
  };

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        label: "Yoga",
        icon: <Activity size={18} className="text-black/80" />,
        onClick: () => navigate("/yoga"),
        description: "Poses for your current dosha",
      },
      {
        label: "Meditate",
        icon: <Brain size={18} className="text-black/80" />,
        onClick: () => alert("Meditate tool coming soon."),
        description: "Guided meditation sessions",
      },
      {
        label: "Dosha",
        icon: <Scale size={18} className="text-black/80" />,
        onClick: () => navigate("/quiz-intro"),
        description: "Discover your dosha type",
      },
      {
        label: "Emotions",
        icon: <ChartNoAxesCombined size={18} className="text-black/80" />,
        onClick: () => alert("Emotions tool coming soon."),
        description: "Track emotional patterns",
      },
      {
        label: "Sama AI",
        icon: <Sunrise size={18} className="text-black/80" />,
        onClick: () => navigate("/ai-wellness-guide"),
        description: "Your personalized schedule",
      },
      {
        label: "Breathing",
        icon: <Moon size={18} className="text-black/80" />,
        onClick: () => navigate("/breathing"),
        description: "Breathing exercises",
      },
    ],
    [navigate],
  );

  const recommendations = useMemo<Recommendation[]>(
    () => [
      {
        title: "Grounding Yoga Flow",
        meta: "10 min",
        tagLine: "Anxiety, Vata",
        onStart: () => navigate("/yoga"),
        preview: "Gentle poses to ground your energy",
      },
      {
        title: "Nadi Shodhana (Alternate Nostril)",
        meta: "5 min",
        tagLine: "Calm, Balance",
        onStart: () => navigate("/breathing"),
        preview: "Balance your nervous system",
      },
      {
        title: "Morning Energizing Flow",
        meta: "15 min",
        tagLine: "Energy, Focus",
        onStart: () => navigate("/yoga"),
        preview: "Start your day with vitality",
      },
    ],
    [navigate],
  );

  const tabItems = useMemo(
    () => [
      { label: "Home", to: "/dashboard", icon: <Home size={18} /> },
      { label: "Explore", to: "/blog", icon: <Search size={18} /> },
      {
        label: "Progress",
        to: "/ayurveda",
        icon: <ChartNoAxesCombined size={18} />,
      },
      { label: "Profile", to: "/profile", icon: <User size={18} /> },
    ],
    [],
  );

  // Progress ring calculation
  const progressPercentage = (weeklyMinutes / weeklyGoal) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <motion.div
      className="relative min-h-screen bg-[#FAF7F2] font-serif text-black"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={wellnessHero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[#FAF7F2]/80" />
        <motion.img
          src={leavesTop}
          alt=""
          className="absolute top-0 right-0 w-[360px] sm:w-[420px] opacity-35"
          animate={{ y: [0, 10, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={leavesBottom}
          alt=""
          className="absolute bottom-0 right-0 w-[420px] sm:w-[520px] opacity-35"
          animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Countdown Preview */}
      <AnimatePresence>
        {showCountdown && selectedRecommendation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold mb-2">
                {selectedRecommendation.title}
              </h3>
              <p className="text-sm text-black/70 mb-6">
                {selectedRecommendation.preview}
              </p>
              <motion.div
                className="text-6xl font-bold text-[#7d9b7f] mb-4"
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {countdown}
              </motion.div>
              <button
                onClick={() => {
                  setShowCountdown(false);
                  setCountdown(5);
                  setSelectedRecommendation(null);
                }}
                className="text-sm text-black/60 underline"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 pb-24">
        {/* APP BAR */}
        <motion.header
          className="px-4 sm:px-6 pt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-base sm:text-lg tracking-wide font-semibold">
                SAMA
              </div>
              <motion.div
                className="w-8 h-8 rounded-xl bg-white/60 border border-black/10 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert("🍃 You're making great progress!")}
              >
                <Leaf size={16} className="text-black/70" />
              </motion.div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                className="w-10 h-10 rounded-xl bg-white/60 border border-black/10 backdrop-blur-sm flex items-center justify-center relative"
                aria-label="Notifications"
                onClick={() => alert("Notifications coming soon.")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={18} className="text-black/80" />
                <motion.div
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.button>
              <motion.button
                type="button"
                className="w-10 h-10 rounded-xl bg-white/60 border border-black/10 backdrop-blur-sm flex items-center justify-center"
                aria-label="Profile"
                onClick={() => navigate("/profile")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={18} className="text-black/80" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* CONTENT */}
        <div className="px-4 sm:px-6 pb-24">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pt-4">
            {/* GREETING */}
            <motion.section
              className="space-y-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.04 }}
            >
              <motion.div
                className="text-xl sm:text-2xl font-semibold"
                key={greeting}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {greeting}
              </motion.div>
              <div className="text-sm sm:text-base text-black/70">
                {subtext}
              </div>
            </motion.section>

            {/* CTA BUTTONS */}
            <motion.section
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
            >
              <motion.button
                type="button"
                onClick={() => navigate("/todays-wellness")}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 16px rgba(125,155,127,0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-3 rounded-2xl bg-[#7d9b7f] text-white shadow-md"
              >
                Daily Check-In
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate("/quiz-intro")}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-3 rounded-2xl bg-white/70 border border-black/10"
              >
                Dosha Quiz
              </motion.button>
            </motion.section>

            {/* CURRENT STATE with Progress Ring */}
            <motion.section
              className={`${card} p-4 sm:p-5`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-3">
                    Current Emotional State
                  </div>
                  <div className="flex items-start gap-4">
                    {/* Progress Ring */}
                    <div className="relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#e5e7eb"
                          strokeWidth="6"
                          fill="none"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke={emotionalState.color}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{
                            strokeDashoffset:
                              circumference -
                              (emotionalState.confidence / 100) * circumference,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {emotionalState.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <motion.span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: emotionalState.color }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.span
                          className="text-base font-semibold"
                          key={emotionalState.state}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          {emotionalState.state}
                        </motion.span>
                      </div>
                      <div className="text-sm text-black/70 mt-1">
                        {emotionalState.dosha}
                      </div>

                      {/* Trend Sparkline */}
                      <div className="mt-3 flex items-end gap-1 h-8">
                        {emotionalHistory.map((value, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-[#7d9b7f] to-[#a5c4a7] rounded-sm"
                            initial={{ height: 0 }}
                            animate={{ height: `${(value / 100) * 100}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-black/60 mt-1 flex items-center gap-1">
                        <TrendingUp size={12} />
                        Last 5 check-ins
                      </div>

                      <div className="text-xs text-black/60 mt-2">
                        Updated{" "}
                        {Math.round(
                          (Date.now() - emotionalState.timestamp.getTime()) /
                            (1000 * 60 * 60),
                        )}{" "}
                        hours ago
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleRefresh}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(125,155,127,0.15)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl bg-white/70 border border-black/10"
                >
                  Check now
                </motion.button>
              </div>

              {/* Emotion Slider */}
              <AnimatePresence>
                {showSlider && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-black/10 overflow-hidden"
                  >
                    <div className="text-sm mb-3">
                      How are you feeling right now?
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">😢</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={sliderValue}
                        onChange={(e) =>
                          setSliderValue(parseInt(e.target.value))
                        }
                        className="flex-1 h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full appearance-none cursor-pointer"
                      />
                      <span className="text-2xl">😊</span>
                    </div>
                    <div className="flex justify-end mt-3">
                      <motion.button
                        onClick={handleSliderSubmit}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl bg-[#7d9b7f] text-white text-sm"
                      >
                        {isRefreshing ? "Updating..." : "Submit"}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* QUICK ACTIONS */}
            <motion.section
              className="space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.16 }}
            >
              <div className="text-sm font-semibold">Quick Actions</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {quickActions.map((a, index) => (
                  <motion.button
                    key={a.label}
                    type="button"
                    onClick={a.onClick}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/70 border border-black/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 relative group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <motion.div
                      className={`w-10 h-10 rounded-2xl border border-black/10 flex items-center justify-center ${
                        index < 3 ? "bg-[#DCEAD7]/80" : "bg-[#FDE9DD]/80"
                      }`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {a.icon}
                    </motion.div>
                    <div className="text-xs text-black/80">{a.label}</div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {a.description}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.section>

            {/* RECOMMENDED - Carousel */}
            <motion.section
              className="space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Recommended for you</div>
                <motion.div
                  className="text-xs text-black/60 flex items-center gap-1 cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  onClick={() =>
                    alert(`Based on your ${emotionalState.dosha.toLowerCase()}`)
                  }
                >
                  <Info size={12} />
                  <span className="group-hover:underline">Why this?</span>
                </motion.div>
              </div>

              <div
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {recommendations.map((r, index) => (
                  <motion.div
                    key={r.title}
                    className={`${card} p-4 sm:p-5 min-w-[280px] sm:min-w-[320px] snap-start`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="text-base font-semibold">{r.title}</div>
                        <div className="text-xs text-black/60 mt-1">
                          {r.meta} • {r.tagLine}
                        </div>
                        <div className="text-sm text-black/70 mt-2">
                          {r.preview}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          type="button"
                          onClick={() => {
                            setSelectedRecommendation(r);
                            setShowCountdown(true);
                            setCountdown(5);
                          }}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "#6d8a6f",
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-4 py-2 rounded-xl bg-[#7d9b7f] text-white"
                        >
                          Start
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 rounded-xl bg-white/70 border border-black/10"
                          onClick={() => alert("Bookmarked!")}
                        >
                          <Share2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* DAILY INSIGHT */}
            <motion.section
              className={`${card} p-4 sm:p-5 cursor-pointer`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.24 }}
              onClick={() => setInsightExpanded(!insightExpanded)}
              whileHover={{ boxShadow: "0 8px 16px rgba(0,0,0,0.08)" }}
              layout
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                    Daily Ayurvedic Insight
                    <motion.div
                      animate={{ rotate: insightExpanded ? 180 : 0 }}
                      className="text-black/40"
                    >
                      ▼
                    </motion.div>
                  </div>
                  <motion.div
                    layout
                    className="text-sm text-black/75 leading-relaxed"
                  >
                    For Vata imbalance, try drinking warm water with a slice of
                    ginger and a pinch of salt in the morning.
                  </motion.div>

                  <AnimatePresence>
                    {insightExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-black/10"
                      >
                        <div className="text-sm text-black/75 leading-relaxed">
                          <strong>Why this works:</strong> Ginger stimulates
                          digestive fire and warms the body, while the salt
                          helps ground Vata's airy qualities.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.section>

            {/* PROGRESS */}
            <motion.section
              className={`${card} p-4 sm:p-5`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.28 }}
            >
              <div className="text-sm font-semibold mb-3">Your Progress</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Streak */}
                <motion.div
                  className="bg-white/60 border border-black/10 rounded-2xl p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xs text-black/60">Streak</div>
                  <div className="mt-1 flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    >
                      <Flame size={20} className="text-orange-500" />
                    </motion.div>
                    <motion.span
                      className="text-base font-semibold"
                      key={streak}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      {streak}-day streak
                    </motion.span>
                  </div>
                </motion.div>

                {/* Weekly Progress */}
                <motion.div
                  className="bg-white/60 border border-black/10 rounded-2xl p-4 flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#e5e7eb"
                        strokeWidth="5"
                        fill="none"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#7d9b7f"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 28}
                        initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-black/60">This week</div>
                    <div className="text-base font-semibold">
                      {weeklyMinutes} / {weeklyGoal} min
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-4">
                <motion.button
                  type="button"
                  onClick={() => navigate("/profile")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-xl bg-white/70 border border-black/10"
                >
                  View full report
                </motion.button>
              </div>
            </motion.section>
          </div>
        </div>
      </div>

      {/* BOTTOM TABS - Outside of scrollable content */}
      <div className="!fixed !bottom-0 !left-0 !right-0 !z-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-4">
          <div className="bg-white/90 backdrop-blur-md border border-black/10 rounded-2xl px-2 py-2 shadow-lg">
            <div className="grid grid-cols-4 gap-1">
              {tabItems.map((t, index) => {
                const active = location.pathname === t.to;
                return (
                  <motion.button
                    key={t.label}
                    type="button"
                    onClick={() => navigate(t.to)}
                    className={
                      "rounded-xl px-2 py-2 flex flex-col items-center justify-center gap-1 transition-colors " +
                      (active
                        ? "bg-white/80 border border-black/10"
                        : "hover:bg-white/70")
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      scale: active ? 1.05 : 1,
                    }}
                    transition={{
                      delay: index * 0.05,
                      scale: { duration: 0.2 },
                    }}
                  >
                    <motion.span
                      className={active ? "text-black" : "text-black/70"}
                      animate={{ y: active ? -2 : 0 }}
                    >
                      {t.icon}
                    </motion.span>
                    <span
                      className={
                        "text-[11px] sm:text-xs " +
                        (active ? "text-black font-semibold" : "text-black/70")
                      }
                    >
                      {t.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
