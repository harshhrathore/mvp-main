
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, BarChart, TrendingUp, Lightbulb } from "lucide-react";
import { useScrollReveal, staggerContainer } from "./useScrollReveal";

const ProgressSection: React.FC = () => {
    const { ref, isInView, animation } = useScrollReveal();
    const [insightIndex, setInsightIndex] = useState(0);

    const insights = [
        "Your Vata decreased 40% after consistent evening meditation.",
        "Kapha increased slightly - consider more energizing morning routines.",
        "Sleep quality improved by 25% since starting Ashwagandha."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setInsightIndex((i) => (i + 1) % insights.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Graph Data
    const data = [20, 35, 25, 45, 30, 55, 40];
    const width = 300;
    const height = 150;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / 60) * height}`).join(" L ");
    const areaPath = `M 0,${height} L ${points} L ${width},${height} Z`;

    return (
        <section id="progress-tracking" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={animation}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F6B4F] text-sm font-medium mb-4">
                        <TrendingUp size={16} />
                        <span>Visual Progress</span>
                    </div>
                    <h2 className="text-4xl font-serif text-gray-900 mb-4">Watch Your <span className="text-[#0F6B4F]">Balance Improve</span></h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Track your dosha levels, mood, and sleep over time. Visualize the direct impact of your Ayurvedic habits.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Dashboard Mockup */}
                    <div className="bg-[#FAF7F2] p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <LineChart className="text-gray-300" size={120} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ActivityIcon /> Dosha Balance History
                            </h3>

                            {/* Animated Graph */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 h-64 relative flex items-end">
                                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                                    {/* Grid Lines */}
                                    <line x1="0" y1="0" x2={width} y2="0" stroke="#eee" strokeWidth="1" />
                                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#eee" strokeWidth="1" />
                                    <line x1="0" y1={height} x2={width} y2={height} stroke="#eee" strokeWidth="1" />

                                    {/* Area Fill */}
                                    <motion.path
                                        d={areaPath}
                                        fill="url(#gradient)"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 1 }}
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0F6B4F" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#0F6B4F" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Line Path */}
                                    <motion.path
                                        d={`M ${points}`}
                                        fill="none"
                                        stroke="#0F6B4F"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                    />

                                    {/* Data Points */}
                                    {data.map((d, i) => (
                                        <motion.circle
                                            key={i}
                                            cx={(i / (data.length - 1)) * width}
                                            cy={height - (d / 60) * height}
                                            r="4"
                                            fill="white"
                                            stroke="#0F6B4F"
                                            strokeWidth="2"
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            transition={{ delay: 1.5 + i * 0.1 }}
                                        />
                                    ))}
                                </svg>
                            </div>

                            {/* AI Insights Carousel */}
                            <div className="bg-[#E6F4F1] p-4 rounded-xl border border-[#0F6B4F]/10 flex items-start gap-3">
                                <div className="p-2 bg-white rounded-full text-[#0F6B4F] shadow-sm shrink-0">
                                    <Lightbulb size={18} />
                                </div>
                                <div className="h-12 relative overflow-hidden flex-1">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={insightIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-sm text-[#0F6B4F] font-medium leading-tight pt-1"
                                        >
                                            {insights[insightIndex]}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Daily Suggestions */}
                    <div>
                        <h3 className="text-2xl font-serif text-gray-900 mb-6">Today's Personalized Plan</h3>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            className="space-y-4"
                        >
                            {[
                                { time: "Morning", task: "10 min Cooling Pranayama", type: "Yoga", color: "bg-blue-100 text-blue-700" },
                                { time: "Lunch", task: "Favor sweet & bitter tastes", type: "Diet", color: "bg-green-100 text-green-700" },
                                { time: "Evening", task: "Avoid spicy foods", type: "Habit", color: "bg-red-100 text-red-700" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, x: 20 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.color}`}>
                                        {item.type}
                                    </div>
                                    <div className="flex-1 font-medium text-gray-900">{item.task}</div>
                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.time}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Helper for Missing Icon
const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0F6B4F]">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

export default ProgressSection;
