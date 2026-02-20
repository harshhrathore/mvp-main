import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bgImage from "../assets/wellness-bg.png";

const MedquizIntro: React.FC = () => {
	const navigate = useNavigate();

	return (
		<motion.div 
			className="min-h-screen w-full flex flex-col items-center justify-center text-center px-3 sm:px-4 relative overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
		>
			{/* Background Image */}
			<img
				src={bgImage}
				alt="Background"
				className="absolute inset-0 w-full h-full object-cover -z-20"
				style={{ objectPosition: "center 70%" }}
			/>

			{/* Soft overlay */}
			<div className="absolute inset-0 bg-[#f8f3e8]/65 -z-10" />

			{/* Content */}
			<motion.div 
				className="relative z-10 max-w-4xl w-full flex flex-col items-center px-3 sm:px-4"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.4 }}
			>
				<h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-3 md:mb-4">
					Medical History Check
				</h1>

				<p className="text-base sm:text-lg md:text-xl text-gray-800 max-w-2xl mb-8 md:mb-10">
					A few quick questions to understand your health and personalize your yoga
					recommendations.
				</p>

				{/* Center card */}
				<div className="w-full max-w-xl bg-[#dbe7d7] rounded-3xl shadow-lg mb-8 md:mb-10 px-6 py-6 sm:px-8 sm:py-7">
					<div className="text-left text-gray-900">
						<div className="text-lg sm:text-xl font-serif mb-3">We’ll ask about</div>
						<ul className="text-sm sm:text-base text-gray-800 space-y-2 list-disc pl-5">
							<li>Any medical conditions (e.g., diabetes, thyroid, BP)</li>
							<li>Injuries / pain areas (back, knee, shoulder)</li>
							<li>Comfort level with movement and breathing practices</li>
						</ul>
					</div>
				</div>

				{/* Button */}
				<motion.button
					onClick={() => navigate("/medicalquiz")}
					className="bg-[#7d9b7f] hover:bg-[#6e8b70] text-white text-lg sm:text-xl px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-md transition press"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					type="button"
				>
					Start Medical Quiz
				</motion.button>
			</motion.div>
		</motion.div>
	);
};

export default MedquizIntro;
