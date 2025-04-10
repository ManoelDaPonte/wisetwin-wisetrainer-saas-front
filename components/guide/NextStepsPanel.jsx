//components/guide/NextStepsPanel.jsx
import React from "react";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, GraduationCap, Users, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NextStepsPanel() {
	const router = useRouter();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.4 }}
		>
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center text-xl">
						<Compass className="mr-2 h-5 w-5 text-wisetwin-blue" />
						Prochaines étapes
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card className="bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
							<CardHeader className="pb-2">
								<div className="w-10 h-10 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-lg flex items-center justify-center mb-3">
									<GraduationCap className="w-5 h-5 text-wisetwin-blue" />
								</div>
								<CardTitle className="text-base">
									Commencer une formation
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-2">
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Explorez le catalogue et découvrez nos
									formations interactives
								</p>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => router.push("/wisetrainer")}
								>
									Voir le catalogue
								</Button>
							</CardFooter>
						</Card>

						<Card className="bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
							<CardHeader className="pb-2">
								<div className="w-10 h-10 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-lg flex items-center justify-center mb-3">
									<Users className="w-5 h-5 text-wisetwin-blue" />
								</div>
								<CardTitle className="text-base">
									Gérer vos organisations
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-2">
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Créez ou rejoignez une organisation pour
									accéder à plus de fonctionnalités
								</p>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => router.push("/organization")}
								>
									Explorer
								</Button>
							</CardFooter>
						</Card>

						<Card className="bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
							<CardHeader className="pb-2">
								<div className="w-10 h-10 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-lg flex items-center justify-center mb-3">
									<BarChart3 className="w-5 h-5 text-wisetwin-blue" />
								</div>
								<CardTitle className="text-base">
									Consulter vos statistiques
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-2">
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Suivez votre progression et vos performances
									sur la plateforme
								</p>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => router.push("/overview")}
								>
									Voir les statistiques
								</Button>
							</CardFooter>
						</Card>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
