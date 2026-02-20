
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Star } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";

const ComparisonSection: React.FC = () => {
    const { ref, isInView, animation } = useScrollReveal();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const testimonials = [
        { text: "The AI noticed patterns I didn't see myself.", author: "Rohan, 32", role: "Software Engineer" },
        { text: "It's like having an Ayurvedic doctor in my pocket.", author: "Sunita, 45", role: "Yoga Teacher" },
        { text: "Startlingly accurate. It knew I was Pitta before I took the quiz.", author: "James, 29", role: "Athlete" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const ComparisonRow = ({ feature, traditional, ai }: { feature: string, traditional: string, ai: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
            <div className="font-semibold text-gray-700 flex items-center">{feature}</div>
            <div className="text-gray-500 flex items-center gap-2">
                <X size={16} className="text-red-400 shrink-0" /> {traditional}
            </div>
            <div className="text-[#0F6B4F] font-medium flex items-center gap-2 group-hover:bg-[#E6F4F1] p-2 rounded-lg -ml-2 transition-colors">
                <Check size={16} className="text-[#0F6B4F] shrink-0" /> {ai}
            </div>
        </div>
    );

    return (
        <section id="comparison" className="py-24 bg-[#E6F4F1]/30 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={animation}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-serif text-gray-900 mb-4">Why AI Makes Ayurveda <span className="text-[#0F6B4F]">Accessible</span></h2>
                </motion.div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900 uppercase text-xs tracking-wider">
                        <div>Feature</div>
                        <div>Traditional Approach</div>
                        <div className="text-[#0F6B4F]">Sama Wellness Approach</div>
                    </div>
                    {/* Rows */}
                    <ComparisonRow feature="Availability" traditional="Appointment only" ai="24/7 Instant Analysis" />
                    <ComparisonRow feature="Cost" traditional="$150+ per consultation" ai="Free / Affordable Subscription" />
                    <ComparisonRow feature="Personalization" traditional="Static advice" ai="Adapts daily to your state" />
                    <ComparisonRow feature="Tracking" traditional="Manual journals" ai="Automatic pattern recognition" />
                    <ComparisonRow feature="Privacy" traditional="Shared records" ai="Local-first & Anonymous" />
                </div>

                {/* Testimonials */}
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="absolute top-0 left-0 text-6xl text-[#E6F4F1] font-serif transform -translate-x-8 -translate-y-8">"</div>

                    <div className="h-48 relative flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTestimonial}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="px-8"
                            >
                                <div className="flex justify-center gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <Star size={20} className="text-yellow-400 fill-current" />
                                        </motion.div>
                                    ))}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-serif text-gray-900 italic mb-6 leading-relaxed">
                                    "{testimonials[currentTestimonial].text}"
                                </h3>
                                <div className="flex flex-col items-center">
                                    <div className="font-bold text-gray-900">{testimonials[currentTestimonial].author}</div>
                                    <div className="text-sm text-gray-500">{testimonials[currentTestimonial].role}</div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentTestimonial(i)}
                                className={`w-3 h-3 rounded-full transition-colors ${i === currentTestimonial ? "bg-[#0F6B4F]" : "bg-gray-200"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ComparisonSection;
