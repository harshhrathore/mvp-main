import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

import LeftDrawerNav from "../components/LeftDrawerNav";
import BackButton from "../components/BackButton";

type DoshaKey = "Vata" | "Pitta" | "Kapha";

const Ayurveda: React.FC = () => {
  const easeOut = [0.22, 1, 0.36, 1] as const;
  const container = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.02 },
    },
  } as const;

  const itemIn = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
  } as const;

  const currentState = useMemo(
    () => [
      {
        key: "Vata" as const,
        value: 65,
        status: "High",
        dot: "🔴",
        icon: "🍃",
      },
      {
        key: "Pitta" as const,
        value: 25,
        status: "Normal",
        dot: "🟢",
        icon: "🔥",
      },
      {
        key: "Kapha" as const,
        value: 10,
        status: "Low",
        dot: "🟡",
        icon: "🌊",
      },
    ],
    [],
  );

  const constitution = useMemo(
    () => ({
      label: "Vata-Pitta (Natural Balance)",
      values: {
        Vata: 40,
        Pitta: 35,
        Kapha: 25,
      } satisfies Record<DoshaKey, number>,
      title: "The Creative Leader",
      traits: [
        "Quick-thinking + determined",
        "Prone to anxiety + perfectionism",
        "Needs routine + warmth",
      ],
    }),
    [],
  );

  const priorityActions = useMemo(
    () => [
      "Warm sesame oil massage",
      "Regular meal times",
      "Digital detox by 8 PM",
    ],
    [],
  );

  const morningRoutine = useMemo(
    () => [
      { label: "Wake before 6 AM", status: "done" as const, action: null },
      {
        label: "Drink warm water",
        status: "scheduled" as const,
        action: "⏰ 7 AM",
      },
      {
        label: "10-min meditation",
        status: "start" as const,
        action: "▶ Start",
      },
    ],
    [],
  );

  return (
    <motion.div
      className="min-h-screen bg-[#FAF7F2] font-sans text-black"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: easeOut }}
    >
      {/* HEADER (fixed) */}
      <div className="sticky top-0 z-20">
        <motion.div
          className="bg-[#7f957e] text-black rounded-b-3xl px-4 sm:px-6 md:px-10 py-3 md:py-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <BackButton to="/dashboard" />

            <div className="mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-serif">Ayurveda</h2>
              <div className="text-xs sm:text-sm text-black/70">
                Your Personal Constitution
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/60 border border-black/10 press"
                aria-label="Profile"
              >
                <User size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.main
        className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6 md:space-y-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* 1. QUICK PRACTICES */}
        <motion.section
          className="bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl p-5 sm:p-6 shadow-sm"
          variants={itemIn}
        >
          <div className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">
            QUICK PRACTICES
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: "🧘", label: "Yoga", sub: "5 min" },
              { icon: "💤", label: "Sleep", sub: "Tips" },
              { icon: "🌿", label: "Herbs", sub: "Guide" },
            ].map((c) => (
              <button
                key={c.label}
                type="button"
                className="rounded-2xl bg-white/70 border border-black/10 p-4 text-center press"
              >
                <div className="text-xl">{c.icon}</div>
                <div className="mt-2 text-sm font-semibold">{c.label}</div>
                <div className="text-xs text-black/60">{c.sub}</div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* 2. CURRENT STATE */}
        <motion.section
          className="bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl p-5 sm:p-6 shadow-sm"
          variants={itemIn}
        >
          <div className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">
            CURRENT STATE
          </div>
          <div className="mt-2 text-sm sm:text-base text-black/70 font-semibold">
            Today’s Balance
          </div>
          <div className="mt-4 space-y-2">
            {currentState.map((d) => (
              <div
                key={d.key}
                className="rounded-xl bg-white/60 border border-black/10 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm sm:text-base">
                    <span className="mr-2">{d.icon}</span>
                    <span className="font-semibold">{d.key}</span>: {d.value}%
                  </div>
                  <div className="text-sm text-black/70">
                    {d.dot} {d.status}
                  </div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-[#7d9b7f]"
                    style={{ width: `${d.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-white/60 border border-black/10 px-4 py-3">
            <div className="text-sm">
              <span className="font-semibold">Imbalance Level:</span> Moderate
            </div>
            <div className="text-sm text-black/70 mt-1">⚠️ Needs attention</div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-[#7d9b7f] text-white press"
            >
              🌡️ Check current emotions
            </button>
          </div>
        </motion.section>

        {/* 3. TODAY'S RECOMMENDATIONS */}
        <motion.section
          className="bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl p-5 sm:p-6 shadow-sm"
          variants={itemIn}
        >
          <div className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">
            TODAY'S RECOMMENDATIONS
          </div>
          <div className="mt-2 text-sm sm:text-base text-black/70 font-semibold">
            🎯 Priority Actions
          </div>
          <ul className="mt-2 space-y-1 text-sm text-black/70">
            {priorityActions.map((a) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>

          <div className="mt-5 rounded-2xl bg-white/60 border border-black/10 p-4">
            <div className="text-sm font-semibold">
              🕒 Based on time of day:
            </div>
            <div className="mt-2 text-sm text-black/70">Morning (6–10 AM):</div>
            <div className="mt-3 space-y-2">
              {morningRoutine.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl bg-white/70 border border-black/10 px-4 py-3"
                >
                  <div className="text-sm">
                    • {item.label} {item.status === "done" ? "✅" : null}
                  </div>
                  {item.action ? (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-white/70 border border-black/10 text-xs press"
                    >
                      {item.action}
                    </button>
                  ) : (
                    <div className="w-10" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-white/70 border border-black/10 press"
            >
              📋 View full daily routine
            </button>
          </div>
        </motion.section>

        {/* 4. FOOD & NUTRITION */}
        <motion.section
          className="bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl p-5 sm:p-6 shadow-sm"
          variants={itemIn}
        >
          <div className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">
            FOOD & NUTRITION
          </div>
          <div className="mt-2 text-sm sm:text-base text-black/70 font-semibold">
            🍽️ For Vata Balance
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/60 border border-black/10 p-4">
              <div className="text-sm font-semibold">Favor:</div>
              <ul className="mt-2 space-y-1 text-sm text-black/70">
                <li>• Warm, cooked foods</li>
                <li>• Healthy oils (sesame, ghee)</li>
                <li>• Sweet fruits</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white/60 border border-black/10 p-4">
              <div className="text-sm font-semibold">Avoid:</div>
              <ul className="mt-2 space-y-1 text-sm text-black/70">
                <li>• Cold, raw foods</li>
                <li>• Dry snacks</li>
                <li>• Caffeine</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/60 border border-black/10 p-4">
            <div className="text-sm font-semibold">Today’s Meal Plan:</div>
            <ul className="mt-2 space-y-1 text-sm text-black/70">
              <li>• Breakfast: Cooked oats ✅</li>
              <li>
                • Lunch: Kitchari{" "}
                <span className="text-black/60">[🍽️ Log]</span>
              </li>
              <li>• Dinner: Vegetable soup</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white/70 border border-black/10 press"
              >
                📋 Shopping list
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white/70 border border-black/10 press"
              >
                🍳 Recipes
              </button>
            </div>
          </div>
        </motion.section>

        {/* 5. AYURVEDIC WISDOM */}
        <motion.section
          className="bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl p-5 sm:p-6 shadow-sm"
          variants={itemIn}
        >
          <div className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">
            AYURVEDIC WISDOM
          </div>
          <div className="mt-4 rounded-2xl bg-white/60 border border-black/10 p-4">
            <div className="text-sm font-semibold">Daily Insight</div>
            <div className="mt-2 text-sm text-black/70 leading-relaxed">
              “For Vata mind, create roots. Regular routine is the anchor in
              turbulent emotional waters.”
            </div>
            <div className="mt-2 text-sm text-black/60">- Charaka Samhita</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white/70 border border-black/10 press"
              >
                💾 Save
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white/70 border border-black/10 press"
              >
                📖 Read more
              </button>
            </div>
          </div>
        </motion.section>

        {/* 6. PROGRESS & INSIGHTS */}
        <motion.section
          className="bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl p-5 sm:p-6 shadow-sm"
          variants={itemIn}
        >
          <div className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">
            PROGRESS & INSIGHTS
          </div>
          <div className="mt-4 rounded-2xl bg-white/60 border border-black/10 p-4">
            <div className="text-sm font-semibold">This Week:</div>
            <div className="mt-2 text-sm text-black/70">
              Balance Score: <span className="font-semibold">6.5/10</span> ↗
              (+1.2 from last week)
            </div>
            <div className="mt-3 text-sm font-semibold">Key Improvement:</div>
            <ul className="mt-2 space-y-1 text-sm text-black/70">
              <li>• Morning routine consistency</li>
              <li>• Reduced anxiety by 25%</li>
              <li>• Better sleep quality</li>
            </ul>
            <div className="mt-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white/70 border border-black/10 press"
              >
                📊 View detailed analytics
              </button>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.div
          className="bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl px-5 py-4 text-center shadow-sm"
          variants={itemIn}
        >
          <div className="text-lg">SAMA 🌿</div>
          <div className="text-sm text-black/70">
            Balance your day, naturally.
          </div>
        </motion.div>
      </motion.main>
    </motion.div>
  );
};

export default Ayurveda;
