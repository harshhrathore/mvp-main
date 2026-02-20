
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Leaf, Flame, Waves, ArrowRight, Play } from "lucide-react";
import { AnimatedText } from "./AnimatedText";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [networkComplete, setNetworkComplete] = useState(false);
    const { scrollY } = useScroll();
    const navigate = useNavigate();
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Particle Animation Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: { x: number; y: number; vx: number; vy: number }[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const count = window.innerWidth < 768 ? 40 : 80;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 0.5, // Top half primarily
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(15, 107, 79, 0.4)"; // SAMA Greenish
            ctx.strokeStyle = "rgba(15, 107, 79, 0.15)";

            // Update and draw particles
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();

                // Connect nearby
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.lineWidth = 1 - dist / 120;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        draw();

        // Trigger next phase after 3s
        const timer = setTimeout(() => {
            setNetworkComplete(true);
        }, 3500);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(timer);
        };
    }, []);

    return (
        <section id="hero" className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden bg-[#FAF7F2]">
            {/* Background Neural Network */}
            <motion.canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ y, opacity }}
            />

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-4 sm:mt-[-5vh]">
                {/* Morphing Symbols Container */}
                <div className="h-32 flex justify-center items-center mb-6 gap-4 sm:gap-12 flex-wrap">
                    <AnimatePresence>
                        {networkComplete && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0 }}
                                    className="text-[#8FB339]" // Air/Vata Color
                                >
                                    <Leaf size={48} />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="text-[#E63946]" // Fire/Pitta Color
                                >
                                    <Flame size={48} />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="text-[#457B9D]" // Water/Kapha Color
                                >
                                    <Waves size={48} />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Headlines */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium text-gray-900 tracking-tight mb-6">
                        Your AI Ayurvedic <br className="hidden sm:block" />
                        <span className="text-[#0F6B4F]">Companion</span>
                    </h1>
                </motion.div>

                <div className="h-8 mb-8">
                    {networkComplete && (
                        <AnimatedText
                            text="The world's first emotional intelligence platform that understands your dosha through conversation."
                            className="text-lg sm:text-xl text-black/60 max-w-2xl mx-auto"
                            delay={0.02}
                        />
                    )}
                </div>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5, duration: 0.8 }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/register")}
                        className="w-full sm:w-auto px-8 py-4 bg-[#0F6B4F] text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                        <span className="relative z-10">Start AI Conversation</span>
                        <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />

                        {/* Pulse Effect */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-white/20"
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.getElementById("ai-power")?.scrollIntoView({ behavior: "smooth" })}
                        className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <Play size={20} fill="currentColor" className="opacity-80" />
                        <span>Watch Demo</span>
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
