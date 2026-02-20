
import React, { useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Database, Zap, BookOpen, BrainCircuit, Users, CheckCircle, Activity, Clock } from "lucide-react";

const Counter = ({ from, to, suffix = "" }: { from: number; to: number; suffix?: string }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const isInView = useInView(nodeRef, { once: true });

    React.useEffect(() => {
        if (!isInView) return;
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(from, to, {
            duration: 2.5,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = Math.round(value).toLocaleString() + suffix;
            },
        });
        return () => controls.stop();
    }, [isInView, from, to, suffix]);

    return <span ref={nodeRef} className="tabular-nums" />;
};

const TechLayer = ({ icon: Icon, title, desc, index }: { icon: any, title: string, desc: string, index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative z-10 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 group"
        >
            <div className="w-12 h-12 rounded-xl bg-[#0F6B4F]/10 flex items-center justify-center text-[#0F6B4F] group-hover:bg-[#0F6B4F] group-hover:text-white transition-colors">
                <Icon size={24} />
            </div>
            <div>
                <h3 className="font-serif font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
            </div>

            {/* Connection Line (Downwards) */}
            {index < 3 && (
                <motion.div
                    className="absolute left-[3rem] top-[100%] w-0.5 h-8 bg-gray-200 -z-10"
                    initial={{ height: 0 }}
                    whileInView={{ height: "2rem" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
                />
            )}
        </motion.div>
    );
};

const TechStackSection: React.FC = () => {
    const layers = [
        { icon: Zap, title: "Personalized Recommendations", desc: "Adaptive yoga, diet, routines based on real-time state" },
        { icon: BrainCircuit, title: "Emotion & Dosha Mapping AI", desc: "Converting 28+ distinct emotions into 3 physiological doshas" },
        { icon: BookOpen, title: "Ayurvedic Knowledge Graph", desc: "Digitized Charaka Samhita + modern clinical research" },
        { icon: Database, title: "Real-time Processing Engine", desc: "Instant analysis with <50ms latency" },
    ];

    const stats = [
        { icon: Users, val: 10000, label: "Active Users", suffix: "+" },
        { icon: CheckCircle, val: 92, label: "Accuracy Rate", suffix: "%" },
        { icon: Activity, val: 28, label: "Emotions Tracked", suffix: "" },
        { icon: Clock, val: 24, label: "AI Availability", suffix: "/7" },
    ];

    return (
        <section id="tech-stack" className="py-24 bg-[#FAF7F2] relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Stack Visualization */}
                    <div className="space-y-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F6B4F]/5 to-transparent blur-3xl -z-10" />
                        {layers.map((layer, i) => (
                            <TechLayer key={i} {...layer} index={i} />
                        ))}
                    </div>

                    {/* Right: Text & Stats */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-12"
                        >
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                Advanced AI, <br />
                                <span className="text-[#0F6B4F]">Ancient Wisdom.</span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                We've digitized thousands of years of Vedic knowledge and combined it with cutting-edge Large Language Models (LLMs) to create an AI that understands the subtle nuances of human health.
                            </p>
                            <p className="text-gray-500">
                                Unlike generic chatbots, SAMA uses a structured knowledge graph to ensure every recommendation is medically safe and Ayurvedically sound.
                            </p>
                        </motion.div>

                        {/* Grid Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    <stat.icon className="text-[#0F6B4F] mb-3" size={24} />
                                    <div className="text-3xl font-bold text-gray-900 mb-1">
                                        <Counter from={0} to={stat.val} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TechStackSection;
