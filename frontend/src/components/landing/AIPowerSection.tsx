
import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Brain, User, Sparkles, MoveRight, ThermometerSun, ArrowRight, Waves } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";

const AIPowerSection: React.FC = () => {
    const { ref, isInView, animation } = useScrollReveal();
    const [chatState, setChatState] = useState<"idle" | "typing" | "analyzing" | "responding" | "complete">("idle");
    const [typedText, setTypedText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const userMessage = "I've been feeling irritable and hot-tempered lately.";

    useEffect(() => {
        if (isInView && chatState === "idle") {
            const timer = setTimeout(() => {
                setChatState("typing");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isInView, chatState]);

    // Typing Effect
    useEffect(() => {
        if (chatState === "typing") {
            let index = 0;
            const interval = setInterval(() => {
                setTypedText(userMessage.slice(0, index + 1));
                index++;
                if (index >= userMessage.length) {
                    clearInterval(interval);
                    setTimeout(() => setChatState("analyzing"), 500);
                }
            }, 50); // Speed of typing
            return () => clearInterval(interval);
        }
    }, [chatState]);

    // Analyzing to Responding
    useEffect(() => {
        if (chatState === "analyzing") {
            const timer = setTimeout(() => {
                setChatState("responding");
            }, 2000); // Analysis time
            return () => clearTimeout(timer);
        }
    }, [chatState]);

    // Complete
    useEffect(() => {
        if (chatState === "responding") {
            const timer = setTimeout(() => {
                setChatState("complete");
            }, 3000); // Response reading time
            return () => clearTimeout(timer);
        }
    }, [chatState]);


    return (
        <section id="ai-power" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={animation}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F6B4F] text-sm font-medium mb-4">
                        <Sparkles size={16} />
                        <span>Live AI Demo</span>
                    </div>
                    <h2 className="text-4xl font-serif text-gray-900 mb-4">See Sama <span className="text-[#0F6B4F]">Wellness in Action</span></h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Experience how our AI instantly decodes your emotional state into Ayurvedic insights.
                    </p>
                </motion.div>

                {/* Chat Interface */}
                <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
                    {/* Chat Header */}
                    <div className="bg-[#FAF7F2] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0F6B4F] flex items-center justify-center text-white">
                                <Brain size={20} />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Sama Wellness Assistant</div>
                                <div className="text-xs text-[#0F6B4F] flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Online
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400">v2.4-alpha</div>
                    </div>

                    {/* Chat Area */}
                    <div className="p-6 h-[400px] bg-white relative flex flex-col gap-6 overflow-y-auto">
                        {/* User Message */}
                        <AnimatePresence>
                            {(chatState !== "idle") && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-end"
                                >
                                    <div className="bg-[#0F6B4F] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                                        {typedText}
                                        {chatState === "typing" && <span className="animate-pulse">|</span>}
                                    </div>
                                    <div className="ml-3 mt-auto mb-1">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* AI Analysis Phase */}
                        <AnimatePresence>
                            {chatState === "analyzing" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#0F6B4F]/10 flex items-center justify-center border border-[#0F6B4F]/20 relative">
                                        <Brain size={20} className="text-[#0F6B4F]" />
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-[#0F6B4F] border-t-transparent"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-sm text-gray-500 text-sm flex items-center gap-2">
                                        Analyzing emotional patterns...
                                        <span className="flex gap-1">
                                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* AI Response */}
                        <AnimatePresence>
                            {(chatState === "responding" || chatState === "complete") && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="flex items-start gap-3 w-full"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#0F6B4F] flex items-center justify-center text-white shrink-0 shadow-lg">
                                        <Brain size={20} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="bg-white border border-[#E63946]/20 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm relative overflow-hidden">
                                            {/* Background Pulse for Pitta */}
                                            <motion.div
                                                className="absolute inset-0 bg-[#E63946]/5 z-0"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />

                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold text-[#E63946] px-2 py-0.5 rounded-full bg-[#E63946]/10 border border-[#E63946]/20">
                                                        Pitta Imbalance Detected
                                                    </span>
                                                    <ThermometerSun size={14} className="text-[#E63946]" />
                                                </div>
                                                <p className="text-gray-800 text-sm leading-relaxed">
                                                    I sense heat and frustration in your tone. Your <span className="font-semibold text-[#E63946]">Pitta dosha</span> is elevated right now.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Recommendations Stagger */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 }}
                                            className="flex flex-col gap-2"
                                        >
                                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition-colors group">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 group-hover:bg-white flex items-center justify-center text-blue-600 transition-colors">
                                                    <Waves size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Cooling Breathwork</div>
                                                    <div className="text-xs text-gray-500">3 mins • Sheetali Pranayama</div>
                                                </div>
                                                <MoveRight size={16} className="ml-auto text-blue-400 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Simulated Input Area */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-inner">
                            <div className="flex-1 text-gray-400 text-sm italic">
                                {chatState === "idle" ? "Type how you feel..." : chatState === "typing" ? "" : "Reply to SAMA..."}
                            </div>
                            <button className="w-8 h-8 rounded-lg bg-[#0F6B4F] flex items-center justify-center text-white opacity-50 cursor-not-allowed">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dosha Mapping Visual (Below Chat) */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {["Anxious", "Irritable", "Lethargic"].map((emotion, i) => (
                        <motion.div
                            key={emotion}
                            className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 * i }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="text-2xl mb-2">{i === 0 ? "😰" : i === 1 ? "😠" : "😴"}</div>
                            <div className="text-sm font-medium text-gray-900">{emotion}</div>
                            <div className="my-2 text-gray-300 transform rotate-90 md:rotate-0">↓</div>
                            <div className={`text-sm font-bold ${i === 0 ? "text-[#8FB339]" : i === 1 ? "text-[#E63946]" : "text-[#457B9D]"
                                }`}>
                                {i === 0 ? "Vata" : i === 1 ? "Pitta" : "Kapha"}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AIPowerSection;
