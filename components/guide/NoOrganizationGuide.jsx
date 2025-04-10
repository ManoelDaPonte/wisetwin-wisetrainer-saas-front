//components/guide/NoOrganizationGuide.jsx
import React from "react";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Building, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NoOrganizationGuide() {
	const router = useRouter();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center text-xl">
						<Users className="mr-2 h-5 w-5 text-wisetwin-blue" />
						Rejoindre une organisation
					</CardTitle>
					<CardDescription>
						Pour accéder à des formations spécifiques
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
						<div className="flex-grow">
							<p className="text-gray-700 dark:text-gray-300 mb-4">
								Rejoindre une organisation vous permettra
								d'accéder à des formations spécifiques et de
								suivre votre progression dans un cadre
								professionnel. Vous pourrez également collaborer
								avec d'autres membres et suivre les formations
								recommandées par votre organisation.
							</p>
							<div className="space-y-3">
								<div className="flex items-start">
									<div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded mr-3 mt-0.5">
										<Building className="h-4 w-4 text-wisetwin-blue" />
									</div>
									<div>
										<p className="font-medium">
											Créez votre propre organisation
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Pour gérer votre équipe et assigner
											des formations
										</p>
									</div>
								</div>
								<div className="flex items-start">
									<div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded mr-3 mt-0.5">
										<Mail className="h-4 w-4 text-wisetwin-blue" />
									</div>
									<div>
										<p className="font-medium">
											Utilisez un code d'invitation
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Si vous avez reçu une invitation par
											email
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="md:w-1/3 flex justify-center">
							<Button
								className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
								onClick={() => router.push("/organization")}
							>
								Gérer les organisations
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
