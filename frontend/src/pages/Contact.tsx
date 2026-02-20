import React, { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Twitter, Instagram, Linkedin, Check, X } from "lucide-react";

import LeftDrawerNav from "../components/LeftDrawerNav";
import BackButton from "../components/BackButton";
import illustration from "../assets/contact-illustration.png";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
    subscribe: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const illustrationY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const easeOut = [0.22, 1, 0.36, 1] as const;
  const sectionIn = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.35, ease: easeOut },
  } as const;

  return (
    <motion.div
      ref={containerRef}
      className="min-h-screen bg-[#F0F2EE] font-sans text-gray-800"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: easeOut }}
    >
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#5C6E58] text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 backdrop-blur-md bg-opacity-95 border border-[#4A5D46]"
            initial={{ y: -50, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: -50, opacity: 0, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="bg-white/20 p-1 rounded-full">
              <Check size={16} />
            </div>
            <span className="font-medium text-sm">
              Message sent successfully!
            </span>
            <button
              onClick={() => setIsSubmitted(false)}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Title Section */}
      <motion.div
        className="bg-[#7f957e] text-black rounded-b-3xl px-4 sm:px-6 md:px-10 py-3 md:py-4 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <BackButton to="/dashboard" />

          <div className="mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-serif">Contact</h2>
          </div>

          <div className="w-10" aria-hidden="true" />
        </div>
      </motion.div>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 -mt-2">
        {/* Main Form Section */}
        <motion.section
          className="bg-[#E4EDE1] rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-black/5"
          {...sectionIn}
        >
          <h2 className="text-xl sm:text-2xl font-serif text-[#3A4D39] mb-3 md:mb-4">
            Send us a message
          </h2>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
            {/* Form Side */}
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                We’d love to hear from you. Share your question, feedback, or
                support request and we’ll get back to you as soon as we can.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Name</label>
                  <motion.input
                    whileFocus={{
                      scale: 1.01,
                      borderColor: "#5C6E58",
                      boxShadow: "0 0 0 2px rgba(92, 110, 88, 0.2)",
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    type="text"
                    placeholder="Enter Your Name"
                    className="w-full p-3 rounded-xl bg-white/80 border border-black/10 shadow-sm focus:outline-none placeholder-gray-500"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Email</label>
                  <motion.input
                    whileFocus={{
                      scale: 1.01,
                      borderColor: "#5C6E58",
                      boxShadow: "0 0 0 2px rgba(92, 110, 88, 0.2)",
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    type="email"
                    placeholder="Enter Your Email"
                    className="w-full p-3 rounded-xl bg-white/80 border border-black/10 shadow-sm focus:outline-none placeholder-gray-500"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Phone (Option)
                  </label>
                  <motion.input
                    whileFocus={{
                      scale: 1.01,
                      borderColor: "#5C6E58",
                      boxShadow: "0 0 0 2px rgba(92, 110, 88, 0.2)",
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    type="text"
                    placeholder="Enter Your Number"
                    className="w-full p-3 rounded-xl bg-white/80 border border-black/10 shadow-sm focus:outline-none placeholder-gray-500"
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Reason for Contact
                  </label>
                  <motion.select
                    whileFocus={{
                      scale: 1.01,
                      borderColor: "#5C6E58",
                      boxShadow: "0 0 0 2px rgba(92, 110, 88, 0.2)",
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="w-full p-3 rounded-xl bg-white/80 border border-black/10 shadow-sm appearance-none focus:outline-none placeholder-gray-500 text-gray-700"
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                  >
                    <option>Choose Your Option</option>
                    <option value="support">Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="business">Business Inquiry</option>
                  </motion.select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Message
                  </label>
                  <motion.textarea
                    whileFocus={{
                      scale: 1.01,
                      borderColor: "#5C6E58",
                      boxShadow: "0 0 0 2px rgba(92, 110, 88, 0.2)",
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    rows={4}
                    placeholder="Message..."
                    className="w-full p-3 rounded-xl bg-white/80 border border-black/10 shadow-sm focus:outline-none placeholder-gray-500"
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  ></motion.textarea>
                </div>

                <div className="flex items-center gap-2 relative">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      id="subscribe"
                      className="peer appearance-none w-5 h-5 border-2 border-[#DE8E72] rounded bg-white checked:bg-[#DE8E72] checked:border-[#DE8E72] transition-colors cursor-pointer"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subscribe: e.target.checked,
                        })
                      }
                    />
                    <motion.svg
                      className="absolute text-white pointer-events-none"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={false}
                      animate={formData.subscribe ? "checked" : "unchecked"}
                    >
                      <motion.path
                        d="M20 6L9 17l-5-5"
                        variants={{
                          checked: { pathLength: 1, opacity: 1 },
                          unchecked: { pathLength: 0, opacity: 0 },
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />
                    </motion.svg>
                  </div>
                  <label
                    htmlFor="subscribe"
                    className="text-[11px] text-gray-600 font-medium cursor-pointer"
                  >
                    I'd like to subscribe to SAMA Wellness updates
                  </label>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{
                    scale: 1.0,
                    backgroundColor: "#c97b5f",
                    boxShadow: "0 4px 12px rgba(222, 142, 114, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#DE8E72] text-white px-10 py-2.5 rounded-full font-medium transition-colors press shadow-md"
                >
                  Submit
                </motion.button>
              </form>
            </div>

            {/* Illustration Side */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              <motion.img
                style={{ y: illustrationY }}
                src={illustration}
                alt="Communication illustration"
                className="w-full max-w-sm h-auto object-contain drop-shadow-sm"
              />
            </div>
          </div>
        </motion.section>

        {/* What happens next */}
        <motion.section
          className="bg-white/70 backdrop-blur-sm border border-black/10 rounded-2xl p-4 sm:p-6"
          {...sectionIn}
        >
          <h2 className="text-lg sm:text-xl font-serif text-[#3A4D39]">
            What happens next
          </h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: "1",
                title: "We review",
                desc: "A team member reads your message and tags it to the right area.",
              },
              {
                id: "2",
                title: "We respond",
                desc: "Typical response time is within 24–48 hours on business days.",
              },
              {
                id: "3",
                title: "We follow up",
                desc: "If needed, we’ll ask 1–2 clarifying questions to help you faster.",
              },
            ].map((step) => (
              <motion.div
                key={step.id}
                className="bg-white/70 border border-black/10 rounded-2xl p-4 h-full flex flex-col"
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-xs uppercase tracking-wide text-black/50">
                  {step.id}
                </div>
                <div className="mt-1 text-sm font-semibold text-[#3A4D39]">
                  {step.title}
                </div>
                <div className="mt-1 text-sm text-black/70 flex-1">
                  {step.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Info Section */}
        <motion.section
          className="bg-[#FFF4E0] rounded-2xl p-4 sm:p-6 shadow-sm"
          {...sectionIn}
        >
          <h2 className="text-lg sm:text-xl font-serif text-[#3A4D39] mb-2 md:mb-3">
            Contact Information
          </h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-bold">Email Address:</span>
            </p>
            <p className="text-blue-600 underline cursor-pointer mb-2">
              info@samawellness.live
            </p>

            <p>
              <span className="font-bold">Business Hours:</span> Mon-Fri, 10 AM
              - 6 PM IST
            </p>

            <p>
              <span className="font-bold">Response Time:</span> "We typically
              respond within 24-48 hours"
            </p>
          </div>
        </motion.section>

        {/* Footer Section */}
        <footer className="pt-6 md:pt-8 pb-8 md:pb-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-4">
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Ancient wisdom meets proactive AI wellness. Discover your path
                to balanced living with personalized Ayurvedic guidance.
              </p>
              <div className="flex gap-4 text-gray-500">
                <Twitter size={18} className="cursor-pointer" />
                <Instagram size={18} className="cursor-pointer" />
                <Linkedin size={18} className="cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-gray-500 text-sm mb-2">
                  Company
                </h4>
                <ul className="text-gray-500 text-sm space-y-1">
                  <li className="cursor-pointer hover:text-gray-800">
                    • About
                  </li>
                  <li className="cursor-pointer hover:text-gray-800">
                    • Our Story
                  </li>
                  <li className="cursor-pointer hover:text-gray-800">
                    • Our Approach
                  </li>
                  <li className="cursor-pointer hover:text-gray-800">• Blog</li>
                  <li className="cursor-pointer hover:text-gray-800">
                    • Therapist
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-500 text-sm mb-2">Legal</h4>
                <ul className="text-gray-500 text-sm space-y-1">
                  <li className="cursor-pointer hover:text-gray-800">
                    • Privacy Policy
                  </li>
                  <li className="cursor-pointer hover:text-gray-800">
                    • Terms of Service
                  </li>
                  <li className="cursor-pointer hover:text-gray-800">
                    • Support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </motion.div>
  );
};

export default Contact;
