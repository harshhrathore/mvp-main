import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import LeftDrawerNav from "../components/LeftDrawerNav";
import BackButton from "../components/BackButton";
import pattern from "../assets/wellness-pattern.png";
import heroBg from "../assets/wellness-bg.png";
import yogaAbout from "../assets/yoga-1.jpg";
import yogaBenefit from "../assets/yoga-2.png";
import yogaMountain from "../assets/yoga-3.jpg";
import yogaTree from "../assets/yoga-4.jpg";
import yogaDog from "../assets/yoga-5.png";
import yogaChild from "../assets/yoga-6.png";
import yogaCobra from "../assets/yoga-7.jpg";
import { Check } from "lucide-react";

type BlogPost = {
  title: string;
  excerpt: string;
  takeaways?: string[];
  imageAlt?: string;
  tag: string;
  date: string;
  readTime: string;
  featured?: boolean;
};

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterFocused, setNewsletterFocused] = useState(false);

  const imagePool = useMemo(
    () => [
      { src: yogaAbout, alt: "Wellness practice" },
      { src: yogaBenefit, alt: "Healthy routine illustration" },
      { src: yogaMountain, alt: "Calm breathing practice" },
      { src: yogaTree, alt: "Relaxation and mindfulness" },
      { src: yogaDog, alt: "Movement and flexibility" },
      { src: yogaChild, alt: "Energy and vitality" },
      { src: yogaCobra, alt: "Yoga and mobility" },
    ],
    [],
  );

  const pickImage = (title: string) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
    }
    return imagePool[hash % imagePool.length];
  };

  const togglePreview = (title: string) => {
    setExpandedTitle((prev) => (prev === title ? null : title));
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSubmitted(true);
    setTimeout(() => {
      setNewsletterSubmitted(false);
      setNewsletterEmail("");
    }, 3000);
  };

  const posts = useMemo<BlogPost[]>(
    () => [
      {
        title: "A calmer day, one routine at a time",
        excerpt:
          "Small, consistent habits beat intensity. Here's a simple routine you can complete in under 10 minutes—built for real life.",
        takeaways: [
          "Pick one anchor habit and keep it small",
          "Use a 2‑minute reset between tasks",
          "End the day with a short wind‑down",
        ],
        tag: "Routines",
        imageAlt: "Healthy daily routine",
        date: "Feb 2026",
        readTime: "4 min",
        featured: true,
      },
      {
        title: "Breathing for focus: a practical reset",
        excerpt:
          "When your mind feels scattered, your breath is a reliable anchor. Try these short resets between tasks.",
        takeaways: [
          "Try a slow exhale to reduce mental noise",
          "Use 3 breaths as a quick attention reset",
          "Stay gentle—no forceful breathing",
        ],
        tag: "Breathwork",
        imageAlt: "Breathing exercise",
        date: "Feb 2026",
        readTime: "3 min",
      },
      {
        title: "Sleep support: what to do in the last hour",
        excerpt:
          "A gentle wind‑down can improve sleep quality. Use this checklist to reduce stimulation and settle your nervous system.",
        takeaways: [
          "Dim lights and reduce stimulation",
          "Do a short stretch + slow breathing",
          "Keep tomorrow planning outside bed",
        ],
        tag: "Sleep",
        imageAlt: "Sleep preparation",
        date: "Jan 2026",
        readTime: "5 min",
      },
      {
        title: "Stress signals you can notice early",
        excerpt:
          "Stress rarely arrives all at once. Learn common early signals—and what to do before they snowball.",
        takeaways: [
          "Watch for subtle body tension",
          "Name the signal, then pick one action",
          "Prefer consistency over intensity",
        ],
        tag: "Mindset",
        imageAlt: "Mindfulness and stress management",
        date: "Jan 2026",
        readTime: "6 min",
      },
    ],
    [],
  );

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const latest = posts.filter((p) => p !== featured);

  return (
    <motion.div
      className="relative min-h-screen bg-[#FAF7F2] font-serif text-black overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(250,247,242,0.85), rgba(250,247,242,0.65))",
          }}
        />
        <img
          src={pattern}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
      </div>

      {/* HEADER */}
      <motion.div
        className="bg-[#7f957e] text-black rounded-b-3xl px-4 sm:px-6 md:px-10 py-3 md:py-4 relative z-10"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <BackButton to="/dashboard" />

          <div className="mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl">Blogs</h2>
            <div className="text-xs sm:text-sm text-black/70">
              Practical wellness notes—clear, calm, and actionable
            </div>
          </div>
          <div className="w-10" aria-hidden="true" />
        </div>
      </motion.div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6 md:space-y-10">
        {/* HERO */}
        <motion.section
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8 border border-black/10"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl">Sama Journal</h3>
              <p className="mt-2 text-sm sm:text-base text-black/70 leading-relaxed">
                Short reads built for busy days—breath, routines, sleep, and
                gentle mindset practices you can actually stick to.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Breathwork", "Sleep", "Routines", "Mindset"].map((t) => (
                  <motion.span
                    key={t}
                    className="px-3 py-1 rounded-full bg-white/70 border border-black/10 text-xs cursor-pointer"
                    whileHover={{
                      backgroundColor: "rgba(220,234,215,0.8)",
                      y: -2,
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </div>

            <motion.div
              className="bg-white/60 rounded-2xl border border-black/10 p-4 sm:p-5"
              layout
            >
              <motion.div
                className="rounded-xl overflow-hidden border border-black/10 bg-white/60 relative"
                whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.img
                  src={pickImage(featured.title).src}
                  alt={featured.imageAlt ?? pickImage(featured.title).alt}
                  className="w-full h-[140px] object-cover"
                  style={{ objectPosition: "center" }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              </motion.div>
              <div className="text-xs text-black/60 mt-4">Featured</div>
              <div className="mt-1 text-xl sm:text-2xl font-semibold">
                {featured.title}
              </div>
              <div
                className="mt-2 text-sm text-black/70"
                style={{ lineHeight: 1.7 }}
              >
                {featured.excerpt}
              </div>

              <AnimatePresence initial={false}>
                {expandedTitle === featured.title && featured.takeaways && (
                  <motion.div
                    key="featured-preview"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 bg-white/55 rounded-xl border border-black/10 p-3">
                      <div className="text-xs font-semibold text-black/60">
                        Quick takeaways
                      </div>
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-black/75">
                        {featured.takeaways.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3 flex items-center justify-between text-xs text-black/60">
                <span>
                  {featured.tag} • {featured.readTime}
                </span>
                <span>{featured.date}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-white/70 border press"
                  style={{
                    borderColor:
                      expandedTitle === featured.title
                        ? "rgba(0,0,0,0.25)"
                        : "rgba(0,0,0,0.1)",
                  }}
                  onClick={() => togglePreview(featured.title)}
                  whileHover={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderColor: "rgba(0,0,0,0.2)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {expandedTitle === featured.title ? "Hide" : "Preview"}
                </motion.button>
                <motion.button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-[#7d9b7f] text-white press"
                  onClick={() => alert("Article pages coming soon.")}
                  whileHover={{
                    backgroundColor: "#6d8a6f",
                    boxShadow: "0 6px 16px rgba(125,155,127,0.3)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Read
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* LATEST */}
        <div className="flex items-end justify-between gap-4">
          <motion.h4
            className="text-xl sm:text-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.08 }}
          >
            Latest posts
          </motion.h4>
          <motion.div
            className="text-xs sm:text-sm text-black/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.1 }}
          >
            New articles will appear here.
          </motion.div>
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6"
          layout
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.07, delayChildren: 0.1 },
            },
          }}
        >
          {latest.map((p) => (
            <motion.article
              key={p.title}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-black/10 p-5 sm:p-6"
              layout
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.div
                className="rounded-xl overflow-hidden border border-black/10 bg-white/60"
                whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.img
                  src={pickImage(p.title).src}
                  alt={p.imageAlt ?? pickImage(p.title).alt}
                  className="w-full h-[150px] object-cover"
                  style={{ objectPosition: "center" }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              </motion.div>
              <div className="flex items-center justify-between text-xs text-black/60 mt-4">
                <motion.span
                  className="px-2.5 py-1 rounded-full bg-white/70 border border-black/10 cursor-pointer"
                  whileHover={{
                    backgroundColor: "rgba(220,234,215,0.8)",
                    y: -2,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {p.tag}
                </motion.span>
                <span>{p.date}</span>
              </div>
              <h5 className="mt-3 text-lg sm:text-xl font-semibold">
                {p.title}
              </h5>
              <p
                className="mt-2 text-sm text-black/70"
                style={{ lineHeight: 1.7 }}
              >
                {p.excerpt}
              </p>

              <AnimatePresence initial={false}>
                {expandedTitle === p.title && p.takeaways && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 bg-white/55 rounded-xl border border-black/10 p-3">
                      <div className="text-xs font-semibold text-black/60">
                        Quick takeaways
                      </div>
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-black/75">
                        {p.takeaways.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-black/60">
                          {p.readTime}
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-[#7d9b7f] text-white press"
                          onClick={() => navigate("/ai-wellness-guide")}
                        >
                          Try in Assistant
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-black/60">{p.readTime}</div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white/70 border press"
                    style={{
                      borderColor:
                        expandedTitle === p.title
                          ? "rgba(0,0,0,0.25)"
                          : "rgba(0,0,0,0.1)",
                    }}
                    onClick={() => togglePreview(p.title)}
                    whileHover={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      borderColor: "rgba(0,0,0,0.2)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {expandedTitle === p.title ? "Hide" : "Preview"}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white/70 border border-black/10 press"
                    onClick={() => alert("Article pages coming soon.")}
                    whileHover={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      borderColor: "rgba(0,0,0,0.2)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    Read
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* NEWSLETTER */}
        <motion.section
          className="bg-[#DCEAD7]/80 backdrop-blur-sm rounded-2xl border border-black/10 p-5 sm:p-6 md:p-8"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-center">
            <div>
              <h4 className="text-xl sm:text-2xl">Get calm updates</h4>
              <p className="mt-2 text-sm text-black/70 leading-relaxed">
                A short email with one practical idea. No spam—unsubscribe
                anytime.
              </p>
            </div>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={handleNewsletterSubmit}
            >
              <motion.input
                type="email"
                required
                placeholder="Your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onFocus={() => setNewsletterFocused(true)}
                onBlur={() => setNewsletterFocused(false)}
                className="flex-1 bg-white/70 border rounded-xl px-4 py-2 outline-none"
                animate={{
                  scale: newsletterFocused ? 1.01 : 1,
                  borderColor: newsletterFocused
                    ? "#8FA98F"
                    : "rgba(0,0,0,0.1)",
                  boxShadow: newsletterFocused
                    ? "0 0 0 3px rgba(143,169,143,0.1)"
                    : "none",
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#7d9b7f] text-white press relative overflow-hidden"
                whileHover={{
                  backgroundColor: "#6d8a6f",
                  boxShadow: "0 6px 16px rgba(125,155,127,0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                disabled={newsletterSubmitted}
              >
                <AnimatePresence mode="wait">
                  {newsletterSubmitted ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <motion.span
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <Check size={16} />
                      </motion.span>
                      Subscribed!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="subscribe"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Subscribe
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Blog;
