
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Calendar, ChevronRight } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";

const JourneySection: React.FC = () => {
    const { ref, isInView, animation } = useScrollReveal();

    const milestones = [
        { title: "Day 1", desc: "Basic Dosha Assessment", progress: 20 },
        { title: "Week 1", desc: "Knows Your Patterns", progress: 45 },
        { title: "Month 1", desc: "Predicts Your Moods", progress: 75 },
        { title: "Year 1", desc: "Anticipates Your Needs", progress: 100 },
    ];

    return (
        <section id="journey" className="py-24 bg-white relative overflow-hidden">
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
                        <span>Always Learning</span>
                    </div>
                    <h2 className="text-4xl font-serif text-gray-900 mb-4">Sama Wellness Gets <span className="text-[#0F6B4F]">Smarter With You</span></h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Unlike static apps, SAMA evolves. The more you interact, the more personalized its insights become.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative py-12">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 hidden md:block">
                        <motion.div
                            className="h-full bg-[#0F6B4F]"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "linear" }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 relative z-10">
                        {milestones.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.4 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-[#0F6B4F] transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#E6F4F1] mb-4 flex items-center justify-center text-[#0F6B4F] border-4 border-white shadow-sm z-10 group-hover:scale-110 transition-transform">
                                    {i === 3 ? <Award size={24} /> : <Calendar size={24} />}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{m.title}</h3>
                                <p className="text-sm text-gray-500">{m.desc}</p>

                                {/* Mobile Connector */}
                                {i < 3 && (
                                    <div className="md:hidden mt-4 text-gray-300">
                                        <ChevronRight className="transform rotate-90" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Personalization Meter */}
                <div className="mt-16 max-w-2xl mx-auto text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Personalization LeveL</h3>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#8FB339] via-[#0F6B4F] to-[#457B9D]"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 3, ease: "easeInOut" }}
                        />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-400 font-medium uppercase tracking-wide">
                        <span>Generic</span>
                        <span>Tailored</span>
                        <span>Hyper-Personalized</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default JourneySection;
