
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, Check, Sparkles, Scale } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import { AnimatedText } from "./AnimatedText";

const DoshaDetectionSection: React.FC = () => {
    const { ref, isInView, animation } = useScrollReveal();
    const [analysisStage, setAnalysisStage] = useState<"input" | "processing" | "result">("input");
    const [highlightedWords, setHighlightedWords] = useState<string[]>([]);

    const text = "I can't focus and my mind is racing.";

    useEffect(() => {
        if (isInView && analysisStage === "input") {
            // Simulate typing detection
            const timer = setTimeout(() => {
                setAnalysisStage("processing");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isInView, analysisStage]);

    useEffect(() => {
        if (analysisStage === "processing") {
            const h1 = setTimeout(() => setHighlightedWords(["focus"]), 500);
            const h2 = setTimeout(() => setHighlightedWords(["focus", "mind"]), 1000);
            const h3 = setTimeout(() => setHighlightedWords(["focus", "mind", "racing"]), 1500);
            const done = setTimeout(() => setAnalysisStage("result"), 2500);
            return () => {
                clearTimeout(h1); clearTimeout(h2); clearTimeout(h3); clearTimeout(done);
            };
        }
    }, [analysisStage]);

    return (
        <section id="dosha-detection" className="py-24 bg-[#E6F4F1]/30 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={animation}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F6B4F] text-sm font-medium mb-4">
                        <Scale size={16} />
                        <span>No Quiz Needed</span>
                    </div>
                    <h2 className="text-4xl font-serif text-gray-900 mb-4">Just Natural <span className="text-[#0F6B4F]">Conversation</span></h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Forget 50-question forms. SAMA's AI detects your dosha imbalance from your natural language, just like a real Ayurvedic doctor.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left: Input Simulation */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                        <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-[#0F6B4F] rounded-full flex items-center justify-center text-white z-10 shadow-lg">
                            <span className="font-bold text-sm sm:text-base">1</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">You say:</h3>
                        <div className="text-lg sm:text-xl text-gray-800 font-serif leading-relaxed">
                            "I can't <span className={`transition-all duration-500 ${highlightedWords.includes("focus") ? "bg-yellow-200 px-1 rounded" : ""}`}>focus</span> and my <span className={`transition-all duration-500 ${highlightedWords.includes("mind") ? "bg-yellow-200 px-1 rounded" : ""}`}>mind</span> is <span className={`transition-all duration-500 ${highlightedWords.includes("racing") ? "bg-yellow-200 px-1 rounded" : ""}`}>racing</span>."
                        </div>

                        {/* Labels appearing - NOW WITH FLEX WRAP for mobile */}
                        <div className="min-h-[2rem] sm:min-h-[2.5rem] mt-3 sm:mt-4">
                            <AnimatePresence>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {highlightedWords.includes("focus") && (
                                        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 whitespace-nowrap">Lack of Stability</motion.span>
                                    )}
                                    {highlightedWords.includes("mind") && (
                                        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 whitespace-nowrap">Mental Agitation</motion.span>
                                    )}
                                    {highlightedWords.includes("racing") && (
                                        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 whitespace-nowrap">Excess Movement</motion.span>
                                    )}
                                </div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: AI Analysis Panel */}
                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 -left-6 w-12 h-0.5 bg-gray-200" />

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#0F6B4F]/20 overflow-hidden relative">
                            {/* Scanning Line */}
                            {analysisStage === "processing" && (
                                <motion.div
                                    className="absolute top-0 bottom-0 w-1 bg-[#0F6B4F]/50 z-20"
                                    initial={{ left: 0 }}
                                    animate={{ left: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            )}

                            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-[#8FB339] rounded-full flex items-center justify-center text-white z-10 shadow-lg">
                                <span className="font-bold text-sm sm:text-base">2</span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Brain className="text-[#0F6B4F]" size={20} />
                                AI Diagnosis
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Pattern Recognition</span>
                                    {analysisStage !== "input" ? (
                                        <span className="text-[#0F6B4F] font-bold flex items-center gap-1">
                                            <Check size={14} /> Complete
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Winning...</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Dosha Imbalance</span>
                                    {analysisStage === "result" ? (
                                        <span className="text-[#8FB339] font-bold">Vata (High)</span>
                                    ) : (
                                        <span className="text-gray-400">Analyzing...</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Confidence Score</span>
                                    {analysisStage === "result" ? (
                                        <span className="text-gray-900 font-bold">94%</span>
                                    ) : (
                                        <span className="text-gray-400">...</span>
                                    )}
                                </div>
                            </div>

                            {/* Result Reveal */}
                            <AnimatePresence>
                                {analysisStage === "result" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-6 p-4 bg-[#8FB339]/10 rounded-xl border border-[#8FB339]/20"
                                    >
                                        <div className="font-bold text-[#8FB339] mb-1 flex items-center gap-2">
                                            <Sparkles size={16} /> Result: Vata Aggravation
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            Keywords indicate lightness and mobility (Air/Ether elements). Suggesting grounding practices.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DoshaDetectionSection;
