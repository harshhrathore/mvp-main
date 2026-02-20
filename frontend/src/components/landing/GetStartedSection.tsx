
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, UserPlus, Sparkles } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import { useNavigate } from "react-router-dom";
import samaLogo from "../../assets/sama_logo.png";

export const GetStartedSection: React.FC = () => {
    const { ref, isInView, animation } = useScrollReveal();
    const [count, setCount] = useState(42);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => prev + Math.floor(Math.random() * 3));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="get-started" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={animation}
                >
                    <div className="w-16 h-16 bg-[#E6F4F1] rounded-2xl flex items-center justify-center mx-auto mb-8 text-[#0F6B4F]">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6 tracking-tight">
                        Begin Your <span className="text-[#0F6B4F]">AI Wellness Journey</span>
                    </h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                        Join thousands who have already discovered their balance. No credit card required.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/login")}
                        className="px-8 py-4 bg-[#0F6B4F] text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 mx-auto"
                    >
                        Try AI for Free
                        <ArrowRight size={20} />
                    </motion.button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>{count} people started their journey in the last hour</span>
                    </div>

                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                        {["Unlimited AI Chat", "Personalized Yoga", "Dosha Tracking", "Nutritional Guide"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-600 font-medium p-3 bg-gray-50 rounded-lg">
                                <Sparkles size={16} className="text-[#8FB339]" />
                                {item}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export const LandingFooter: React.FC = () => {
    return (
        <footer className="bg-[#FAF7F2] border-t border-gray-100 py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4 text-[#0F6B4F] font-serif text-2xl font-bold">
                            <img src={samaLogo} alt="Sama Wellness Logo" className="h-8 w-auto object-contain" />
                            Sama Wellness
                        </div>
                        <p className="text-gray-500 max-w-sm mb-6">
                            Intelligent wellness, personalized for you. We combine ancient Ayurvedic wisdom with modern AI to help you find balance in a chaotic world.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            All Systems Operational
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-500">
                            <li><a href="#" className="hover:text-[#0F6B4F]">Emotion AI</a></li>
                            <li><a href="#" className="hover:text-[#0F6B4F]">Dosha Quiz</a></li>
                            <li><a href="#" className="hover:text-[#0F6B4F]">Yoga Plans</a></li>
                            <li><a href="#" className="hover:text-[#0F6B4F]">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-gray-500">
                            <li><a href="#" className="hover:text-[#0F6B4F]">About Us</a></li>
                            <li><a href="#" className="hover:text-[#0F6B4F]">Ethics & Privacy</a></li>
                            <li><a href="#" className="hover:text-[#0F6B4F]">Research</a></li>
                            <li><a href="#" className="hover:text-[#0F6B4F]">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <div>&copy; 2026 Sama Wellness. All rights reserved.</div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};


