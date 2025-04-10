//components/guide/WelcomeHeader.jsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WelcomeHeader({
	user,
	hasOrganizations,
	organizationsCount,
	trainingsInProgressCount,
}) {
	const router = useRouter();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center text-xl">
						<Compass className="mr-2 h-5 w-5 text-wisetwin-blue" />
						Bienvenue, {user?.name || "Utilisateur"}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
							<p className="text-sm text-gray-700 dark:text-gray-300">
								{hasOrganizations
									? `Vous faites partie de ${organizationsCount} organisation${
											organizationsCount > 1 ? "s" : ""
									  }.`
									: "Vous n'avez pas encore rejoint d'organisation."}
								{trainingsInProgressCount > 0
									? ` Vous avez ${trainingsInProgressCount} formation${
											trainingsInProgressCount > 1
												? "s"
												: ""
									  } en cours.`
									: " Vous n'avez pas encore commencé de formation."}
							</p>
							{!hasOrganizations && (
								<Button
									className="mt-4 bg-wisetwin-blue hover:bg-wisetwin-blue-light"
									onClick={() => router.push("/organization")}
								>
									Découvrir les organisations
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							)}
						</div>

						{/* Progrès général */}
						{trainingsInProgressCount > 0 && (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
								<div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
									<div className="text-xs text-gray-500 mb-1">
										Formations en cours
									</div>
									<div className="text-xl font-bold">
										{trainingsInProgressCount}
									</div>
								</div>

								{/* Ajoutez d'autres statistiques pertinentes ici */}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
