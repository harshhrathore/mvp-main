import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Leaf } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";

const PrivacySection: React.FC = () => {
    const { ref, isInView, animation } = useScrollReveal();

    const features = [
        { icon: Lock, title: "Encrypted Conversations", desc: "End-to-end encryption ensures only you can access your chats." },
        { icon: Shield, title: "Local-First Processing", desc: "Sensitive analysis happens on your device whenever possible." },
        { icon: Leaf, title: "Ethical AI Design", desc: "Built to empower, not addict. No ads, no selling data." },
    ];

    return (
        <section id="privacy" className="py-24 bg-[#0F6B4F] text-white overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={animation}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-serif mb-6">Ethical AI for <br className="hidden sm:block" /> Personal Wellness</h2>
                    <p className="text-white/80 max-w-2xl mx-auto text-lg">
                        Your mental health data is sacred. We treat it with the highest level of privacy and security standards.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors"
                        >
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-6 text-white">
                                <f.icon size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-white/70 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Data Flow Visualization */}
                <div className="mt-20 flex flex-col items-center">
                    <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-white/60 uppercase tracking-widest mb-4">
                        Data Flow Check
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 md:gap-8 bg-black/20 p-3 sm:p-4 rounded-full border border-white/10 max-w-full">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-xs sm:text-sm whitespace-nowrap">Your Device</span>
                        </div>
                        <motion.div
                            className="h-0.5 w-8 sm:w-12 md:w-24 bg-white/20 overflow-hidden relative shrink-0"
                        >
                            <motion.div
                                className="absolute inset-0 bg-green-400 w-1/2"
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                        </motion.div>
                        <div className="flex items-center gap-1.5 sm:gap-2 opacity-50">
                            <Lock size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" />
                            <span className="text-xs sm:text-sm whitespace-nowrap">SAMA Cloud</span>
                        </div>
                        <motion.div
                            className="h-0.5 w-8 sm:w-12 md:w-24 bg-white/20 overflow-hidden relative shrink-0"
                        >
                            <motion.div
                                className="absolute inset-0 bg-red-400 w-1/2"
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }}
                            />
                        </motion.div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-white/40 line-through">
                            <span className="text-xs sm:text-sm whitespace-nowrap">Advertisers</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrivacySection;
