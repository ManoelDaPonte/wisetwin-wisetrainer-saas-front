// app/page.jsx
"use client";
import { useRouter } from "next/navigation";
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react"; // Importe seulement l'icône utilisée ici
import { motion } from "framer-motion";
import { HomePageCards } from "@/lib/config/config"; // Importe les données des cartes

export default function HomePage() {
	const router = useRouter();

	// Animation variants for cards
	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: (i) => ({
			opacity: 1,
			y: 0,
			transition: {
				delay: i * 0.1,
				duration: 0.5,
				ease: "easeOut",
			},
		}),
		hover: {
			scale: 1.05,
			boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
			transition: {
				duration: 0.2,
				ease: "easeInOut",
			},
		},
	};

	return (
		<div className="flex flex-col items-center justify-center h-full">
			{/* Welcome Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="text-center mb-12 max-w-3xl"
			>
				<h1 className="text-3xl md:text-4xl font-bold mb-4 text-wisetwin-darkblue dark:text-white">
					Welcome to{" "}
					<span className="text-wisetwin-blue">WiseTwin</span>
				</h1>
				<p className="text-gray-600 dark:text-gray-300 text-lg">
					Your comprehensive platform for digital twin management and
					industrial training
				</p>
			</motion.div>

			{/* Card grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full px-4">
				{HomePageCards.map((card, index) => {
					const CardIcon = card.icon;
					return (
						<motion.div
							key={index}
							custom={index}
							initial="hidden"
							animate="visible"
							whileHover="hover"
							variants={cardVariants}
						>
							<Card
								className="h-full shadow-soft cursor-pointer border-2 hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light transition-all duration-300"
								onClick={() => router.push(card.route)}
							>
								<CardHeader className="pb-2">
									<div className="w-12 h-12 bg-wisetwin-darkblue/10 rounded-lg flex items-center justify-center mb-4">
										<CardIcon
											size={24}
											className="text-wisetwin-darkblue"
										/>
									</div>
									<CardTitle className="text-xl text-wisetwin-darkblue dark:text-white">
										{card.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-sm text-gray-600 dark:text-gray-300">
										{card.description}
									</CardDescription>
								</CardContent>
								<CardFooter className="pt-0 flex justify-end">
									<div className="flex items-center text-wisetwin-darkblue dark:text-wisetwin-blue text-sm font-medium">
										<span>Get started</span>
										<ArrowRight className="ml-2 h-4 w-4" />
									</div>
								</CardFooter>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* Bottom feature highlight */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.8, duration: 0.8 }}
				className="mt-16 text-center"
			>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Explore our latest features and maximize your experience
				</p>
			</motion.div>
		</div>
	);
}
