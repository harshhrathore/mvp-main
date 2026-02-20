import React, { useState, useEffect } from "react";
import LeftDrawerNav from "../components/LeftDrawerNav";
import BackButton from "../components/BackButton";

import bgPattern from "../assets/yoga-0-bg.png";
import child from "../assets/yoga-6.png";
import mountain from "../assets/yoga-3.jpg";
import tree from "../assets/yoga-4.jpg";
import dog from "../assets/yoga-5.png";
import cobra from "../assets/yoga-7.jpg";

type DoshaType = "Vata" | "Pitta" | "Kapha" | "All";

interface YogaPose {
  name: string;
  sanskritName: string;
  duration: number;
  dosha: DoshaType;
  description: string;
  img?: any;
  benefits: string[];
}

const Yoga: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<DoshaType>("All");
  const [progressWidth, setProgressWidth] = useState(0);
  const [hoveredPose, setHoveredPose] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => setProgressWidth(40), 300);
    return () => clearTimeout(timer);
  }, []);

  // Yoga poses data - reusing existing images and leaving placeholders
  const yogaPoses: YogaPose[] = [
    {
      name: "Child's Pose",
      sanskritName: "Balasana",
      duration: 2,
      dosha: "Vata",
      description: "A grounding pose to release tension and calm the mind.",
      img: child,
      benefits: [
        "Calms the nervous system",
        "Releases lower back tension",
        "Promotes introspection",
      ],
    },
    {
      name: "Forward Fold",
      sanskritName: "Uttanasana",
      duration: 2,
      dosha: "Vata",
      description:
        "A calming forward bend that soothes the mind and stretches the spine.",
      img: mountain,
      benefits: [
        "Calms anxiety",
        "Stretches hamstrings",
        "Improves circulation",
      ],
    },
    {
      name: "Sun Salutation",
      sanskritName: "Surya Namaskar",
      duration: 3,
      dosha: "Kapha",
      description: "A dynamic sequence to energize the body and build warmth.",
      img: tree,
      benefits: [
        "Energizes the body",
        "Builds strength",
        "Improves flexibility",
      ],
    },
    {
      name: "Corpse Pose",
      sanskritName: "Savasana",
      duration: 5,
      dosha: "Pitta",
      description: "A deeply relaxing pose for complete rest and integration.",
      img: dog,
      benefits: [
        "Reduces stress",
        "Promotes deep relaxation",
        "Lowers blood pressure",
      ],
    },
    {
      name: "Cobra Pose",
      sanskritName: "Bhujangasana",
      duration: 2,
      dosha: "Kapha",
      description:
        "A gentle backbend that opens the chest and strengthens the spine.",
      img: cobra,
      benefits: ["Opens chest", "Strengthens spine", "Improves posture"],
    },
    // Placeholder poses for future images
    {
      name: "Mountain Pose",
      sanskritName: "Tadasana",
      duration: 2,
      dosha: "Vata",
      description:
        "A foundational standing pose that promotes grounding and alignment.",
      benefits: ["Improves posture", "Builds focus", "Grounds energy"],
    },
    {
      name: "Warrior II",
      sanskritName: "Virabhadrasana II",
      duration: 3,
      dosha: "Pitta",
      description:
        "A powerful standing pose that builds strength and confidence.",
      benefits: ["Builds leg strength", "Opens hips", "Improves stamina"],
    },
    {
      name: "Tree Pose",
      sanskritName: "Vrksasana",
      duration: 2,
      dosha: "Vata",
      description: "A balancing pose that cultivates focus and stability.",
      benefits: [
        "Improves balance",
        "Strengthens legs",
        "Enhances concentration",
      ],
    },
  ];

  const filteredPoses =
    selectedFilter === "All"
      ? yogaPoses
      : yogaPoses.filter((pose) => pose.dosha === selectedFilter);

  // Get recommended pose for user's dosha (defaulting to Vata)
  const recommendedPose = yogaPoses[0]; // Child's Pose for Vata

  const handleButtonClick = (buttonId: string) => {
    setClickedButton(buttonId);
    setTimeout(() => setClickedButton(null), 300);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] font-serif yoga-page overflow-hidden">
      {/* BACKGROUND PATTERN with animated opacity */}
      <img
        src={bgPattern}
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover opacity-30 -z-10 animate-pulse"
        style={{ animationDuration: "4s" }}
      />

      {/* NAVBAR */}
      <div className="bg-[#7f957e] text-black rounded-b-3xl px-4 sm:px-6 md:px-10 py-3 md:py-4 relative z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <BackButton to="/dashboard" />
          <div className="mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl">Yoga</h2>
            <div className="text-xs sm:text-sm text-black/70">
              Poses and practices for balance and calm
            </div>
          </div>
          <div className="w-10" aria-hidden="true" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 relative z-0">
        {/* RECOMMENDED FOR YOUR VATA TODAY with gradient animation */}
        <div
          className="bg-gradient-to-br from-[#DCEAD7] via-[#d5e6d0] to-[#c8dcc0] rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-fadeInUp"
          style={{
            animationDelay: "100ms",
            backgroundSize: "200% 200%",
            animation:
              "fadeInUp 0.5s ease-out 100ms both, gradientShift 10s ease infinite",
          }}
        >
          <div className="flex items-center gap-2 mb-4 animate-slideInLeft">
            <span className="text-2xl">🌿</span>
            <h3 className="text-lg sm:text-xl font-semibold text-[#2d5016]">
              RECOMMENDED FOR YOUR VATA TODAY
            </h3>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-5 grid md:grid-cols-[1fr,auto] gap-4 items-center hover:bg-white/95 transition-all duration-300">
            <div>
              {recommendedPose.img ? (
                <div className="overflow-hidden rounded-lg mb-3 group">
                  <img
                    src={recommendedPose.img}
                    alt={recommendedPose.name}
                    className="w-full h-48 object-cover transform transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500 animate-pulse">
                  [Photo will be uploaded]
                </div>
              )}
              <h4 className="text-xl font-semibold mb-1 transform transition-all duration-300 hover:text-[#7f957e]">
                {recommendedPose.name} · {recommendedPose.sanskritName}
              </h4>
              <div className="flex items-center gap-3 text-sm text-black/70 mb-2">
                <span>⏱️ {recommendedPose.duration} min</span>
                <span>|</span>
                <span>🧘 {recommendedPose.dosha} calming</span>
              </div>
              <p className="text-sm sm:text-base text-black/75 mb-4 leading-relaxed">
                {recommendedPose.description}
              </p>
              <button
                onClick={() => handleButtonClick("start-recommended")}
                className={`bg-[#7f957e] hover:bg-[#6d8169] text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 ${
                  clickedButton === "start-recommended" ? "scale-95" : ""
                }`}
              >
                START
              </button>
            </div>
          </div>
        </div>

        {/* ALL POSES with enhanced animations */}
        <div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay: "200ms" }}
        >
          <h3 className="text-xl sm:text-2xl font-semibold mb-3 flex items-center gap-2 animate-slideInLeft">
            <span>📋</span>
            ALL POSES
          </h3>

          {/* Filter Chips with smooth transitions */}
          <div className="flex flex-wrap gap-2 mb-5">
            {(["Vata", "Pitta", "Kapha", "All"] as DoshaType[]).map(
              (dosha, index) => (
                <button
                  key={dosha}
                  onClick={() => setSelectedFilter(dosha)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 animate-fadeIn ${
                    selectedFilter === dosha
                      ? "bg-[#7f957e] text-white shadow-md scale-[1.02] ring-2 ring-[#7f957e] ring-offset-2"
                      : "bg-gray-200 text-black/70 hover:bg-gray-300"
                  }`}
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  {dosha}
                </button>
              ),
            )}
          </div>

          {/* Poses Grid with staggered animations */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPoses.map((pose, index) => (
              <div
                key={pose.name}
                onMouseEnter={() => setHoveredPose(pose.name)}
                onMouseLeave={() => setHoveredPose(null)}
                onClick={() => handleButtonClick(`pose-${pose.name}`)}
                className={`bg-gradient-to-br from-[#DCEAD7] to-[#c8dcc0] rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] animate-fadeInUp ${
                  clickedButton === `pose-${pose.name}` ? "scale-95" : ""
                }`}
                style={{
                  animationDelay: `${400 + index * 60}ms`,
                  transformStyle: "preserve-3d",
                }}
              >
                {pose.img ? (
                  <div className="overflow-hidden rounded-lg mb-2 relative group">
                    <img
                      src={pose.img}
                      alt={pose.name}
                      className={`w-full h-32 object-cover transform transition-all duration-300 ${
                        hoveredPose === pose.name ? "scale-110" : "scale-100"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 bg-[#7f957e]/0 group-hover:bg-[#7f957e]/10 transition-all duration-300`}
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-xs text-gray-500 text-center p-2 animate-pulse">
                    [Photo will be uploaded]
                  </div>
                )}
                <h4
                  className={`font-semibold text-sm mb-1 transition-all duration-200 ${
                    hoveredPose === pose.name ? "text-[#7f957e]" : ""
                  }`}
                >
                  {pose.name}
                </h4>
                <p className="text-xs text-black/60 transition-all duration-300">
                  {pose.duration} min
                </p>
                <p className="text-xs text-black/60 transition-all duration-300">
                  {pose.dosha}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* YOUR PROGRESS with animated bar */}
        <div
          className="bg-gradient-to-br from-[#FDE9DD] via-[#fde0cc] to-[#fdd5bb] rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
          style={{
            animationDelay: "300ms",
            backgroundSize: "200% 200%",
            animation:
              "fadeInUp 0.5s ease-out 300ms both, gradientShift 10s ease infinite 1s",
          }}
        >
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 animate-slideInLeft">
            <span>🔥</span>
            YOUR PROGRESS
          </h3>
          <p className="text-base text-black/80 mb-3 animate-fadeIn">
            This week:{" "}
            <span className="font-semibold text-[#7f957e]">12 min</span> ·{" "}
            <span className="font-semibold text-[#7f957e]">3 sessions</span>
          </p>
          {/* Progress Bar with smooth animation */}
          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#7f957e] to-[#6d8169] h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progressWidth}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <p
            className="text-xs text-black/60 mt-2 animate-fadeIn"
            style={{ animationDelay: "1s" }}
          >
            40% towards weekly goal
          </p>
        </div>

        {/* RECENTLY COMPLETED with star animations */}
        <div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay: "400ms" }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 animate-slideInLeft">
            <span>⭐</span>
            RECENTLY COMPLETED
          </h3>

          <div className="bg-gradient-to-br from-[#DCEAD7] to-[#c8dcc0] rounded-xl p-4 hover:shadow-lg transition-all duration-200">
            <h4 className="font-semibold text-lg mb-2 transform transition-all duration-300 hover:text-[#7f957e]">
              Sun Salutation – 3 min
            </h4>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1 text-yellow-500">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="transform transition-all duration-200 hover:scale-110 inline-block cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${500 + i * 80}ms` }}
                  >
                    ⭐
                  </span>
                ))}
                <span
                  className="text-gray-300 transform transition-all duration-200 hover:scale-110 inline-block cursor-pointer animate-fadeIn"
                  style={{ animationDelay: "820ms" }}
                >
                  ☆
                </span>
              </div>
              <span
                className="text-sm text-black/60 animate-fadeIn"
                style={{ animationDelay: "1s" }}
              >
                Completed 2h ago
              </span>
            </div>
            <button
              onClick={() => handleButtonClick("do-again")}
              className={`bg-[#7f957e] hover:bg-[#6d8169] text-white px-5 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 ${
                clickedButton === "do-again" ? "scale-95" : ""
              }`}
            >
              Do Again
            </button>
          </div>
        </div>

        {/* FAVORITES with heart animations */}
        <div
          className="bg-gradient-to-br from-pink-50 via-pink-75 to-pink-100 rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
          style={{
            animationDelay: "500ms",
            backgroundSize: "200% 200%",
            animation:
              "fadeInUp 0.5s ease-out 500ms both, gradientShift 10s ease infinite 2s",
          }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 animate-slideInLeft">
            <span className="text-red-500">❤️</span>
            FAVORITES
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[yogaPoses[0], yogaPoses[1]].map((pose, index) => (
              <div
                key={pose.name}
                onClick={() => handleButtonClick(`fav-${pose.name}`)}
                className={`bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] animate-fadeInUp ${
                  clickedButton === `fav-${pose.name}` ? "scale-95" : ""
                }`}
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                {pose.img ? (
                  <div className="overflow-hidden rounded-lg mb-2 group">
                    <img
                      src={pose.img}
                      alt={pose.name}
                      className="w-full h-32 object-cover transform transition-all duration-300 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-xs text-gray-500 animate-pulse">
                    [Photo]
                  </div>
                )}
                <h4 className="font-semibold text-sm mb-1 group-hover:text-[#7f957e] transition-colors duration-300">
                  {pose.name}
                </h4>
                <p className="text-xs text-black/60">{pose.duration} min</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out both;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out both;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out both;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out both;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Yoga;
