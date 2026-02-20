
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Activity, Moon, Battery, ArrowRight, PlayCircle } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";

const AIYogaSection: React.FC = () => {
    const { ref, isInView, animation } = useScrollReveal();
    const [selectedEmotion, setSelectedEmotion] = useState<"anxious" | "irritable" | "lethargic">("anxious");

    const sequences = {
        anxious: {
            title: "Grounding Earth Flow",
            focus: "Stability & Calm",
            poses: ["Child's Pose", "Tree Pose", "Legs Up Wall"],
            color: "bg-[#8FB339]", // Vata
        },
        irritable: {
            title: "Cooling Moon Flow",
            focus: "Release Heat",
            poses: ["Forward Fold", "Cobra Pose", "Moon Salutation"],
            color: "bg-[#E63946]", // Pitta
        },
        lethargic: {
            title: "Energizing Sun Flow",
            focus: "Awaken Fire",
            poses: ["Sun Salutation A", "Warrior II", "Chair Pose"],
            color: "bg-[#457B9D]", // Kapha
        },
    };

    const currentSequence = sequences[selectedEmotion];

    return (
        <section id="ai-yoga" className="py-24 bg-white overflow-hidden relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={animation}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-serif text-gray-900 mb-4">Your Personal <span className="text-[#0F6B4F]">AI Yoga Guru</span></h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Stop following generic "morning yoga" videos. SAMA adapts every sequence to your current emotional and physical state.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Comparison */}
                    <div className="space-y-8">
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl relative opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="absolute top-4 right-4 bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded">Generic App</div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">Standard Morning Yoga</div>
                                    <div className="text-sm text-gray-500">Same sequence for everyone</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center text-[#0F6B4F]">
                            <ArrowRight size={32} className="animate-bounce" />
                        </div>

                        <div className="bg-white border-2 border-[#0F6B4F] p-6 rounded-2xl relative shadow-xl transform scale-105">
                            <div className="absolute top-4 right-4 bg-[#0F6B4F] text-white text-xs font-bold px-2 py-1 rounded animate-pulse">Sama Wellness</div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-[#0F6B4F] rounded-full flex items-center justify-center text-white shadow-lg">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Vata-Balancing Flow</div>
                                    <div className="text-sm text-[#0F6B4F] font-medium">Personalized for anxiety</div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Adjusted intensity based on your checked-in energy level: 4/10. Added extra warm-up for joint stiffness.
                            </p>
                        </div>
                    </div>

                    {/* Right: Interactive Demo */}
                    <div className="bg-[#FAF7F2] p-8 rounded-3xl border border-[#0F6B4F]/10">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Try it now: How do you feel?</h3>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <button
                                onClick={() => setSelectedEmotion("anxious")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedEmotion === "anxious" ? "bg-[#8FB339] text-white shadow-lg scale-105" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                            >
                                😰 Anxious
                            </button>
                            <button
                                onClick={() => setSelectedEmotion("irritable")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedEmotion === "irritable" ? "bg-[#E63946] text-white shadow-lg scale-105" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                            >
                                😠 Irritable
                            </button>
                            <button
                                onClick={() => setSelectedEmotion("lethargic")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedEmotion === "lethargic" ? "bg-[#457B9D] text-white shadow-lg scale-105" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                            >
                                😴 Lethargic
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedEmotion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Recommended Sequence</div>
                                        <div className="text-lg font-bold text-gray-900">{currentSequence.title}</div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${currentSequence.color}`}></div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {currentSequence.poses.map((pose, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                                                {i + 1}
                                            </div>
                                            <div className="text-gray-700">{pose}</div>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors group">
                                    <PlayCircle size={20} />
                                    Start Experience
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIYogaSection;
