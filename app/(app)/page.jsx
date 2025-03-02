// app/(app)/page.jsx
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
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { HomePageCards } from "@/lib/config/config"; // Importe les données des cartes
import { Button } from "@/components/ui/button";

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
					Bienvenue sur{" "}
					<span className="text-wisetwin-blue">WiseTwin</span>
				</h1>
				<p className="text-gray-600 dark:text-gray-300 text-lg">
					Plateforme innovante de formation industrielle en réalité
					virtuelle
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
							whileHover={card.disabled ? {} : "hover"}
							variants={cardVariants}
							className="h-full"
						>
							<Card
								className={`h-full flex flex-col shadow-soft border-2 transition-all duration-300 ${
									card.disabled
										? "opacity-75 cursor-not-allowed border-gray-200 dark:border-gray-700"
										: "cursor-pointer hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light"
								}`}
								onClick={() =>
									!card.disabled && router.push(card.route)
								}
							>
								<div className="relative">
									{card.disabled && (
										<span className="absolute top-3 right-3 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
											Bientôt
										</span>
									)}
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
								</div>

								<CardContent className="flex-grow">
									<CardDescription className="text-sm text-gray-600 dark:text-gray-300">
										{card.description}
									</CardDescription>
								</CardContent>

								<CardFooter className="pt-0  mt-auto">
									<div className="flex w-full items-center justify-end text-wisetwin-darkblue dark:text-wisetwin-blue text-sm font-medium">
										<span>{card.primaryAction}</span>
										<ArrowRight className="ml-2 h-4 w-4" />
									</div>
								</CardFooter>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* Cta button */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8, duration: 0.5 }}
				className="mt-12"
			>
				<Button
					className="bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light"
					size="lg"
					onClick={() => router.push("/wisetrainer")}
				>
					Commencer à explorer
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</motion.div>

			{/* Bottom feature highlight */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1, duration: 0.8 }}
				className="mt-16 text-center"
			>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Sécurité • Formation • Immersion • Excellence
				</p>
			</motion.div>
		</div>
	);
}
