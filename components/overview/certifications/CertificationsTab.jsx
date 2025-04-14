//components/overview/CertificationsTab.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/contexts/DashboardContext";
import {
	Award,
	Download,
	Calendar,
	CheckCircle,
	FileText,
	User,
} from "lucide-react";
import Image from "next/image";

export default function CertificationsTab() {
	const { stats, trainings, isLoading } = useDashboard();
	const [selectedCertification, setSelectedCertification] = useState(null);

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.4 },
		},
	};

	// Obtenir uniquement les formations terminées
	const completedTrainings = trainings.filter(
		(training) => training.progress === 100
	);

	// Formater la date
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	// Fonction pour générer le PDF de certification (simulée)
	const handleDownloadCertificate = (training) => {
		// Cette fonction serait remplacée par la véritable génération de PDF
		console.log("Téléchargement du certificat pour:", training.name);
		// Notification ou indication de téléchargement ici
	};

	// Fonction pour générer le rapport complet de toutes les formations (simulée)
	const handleDownloadFullReport = () => {
		// Cette fonction serait remplacée par la véritable génération de PDF
		console.log("Téléchargement du rapport complet");
		// Notification ou indication de téléchargement ici
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="space-y-6"
		>
			{/* En-tête avec bouton de téléchargement du rapport complet */}
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-wisetwin-darkblue dark:text-white">
					Vos certifications et diplômes
				</h2>
				<Button
					variant="outline"
					className="flex items-center gap-2"
					onClick={handleDownloadFullReport}
					disabled={isLoading || completedTrainings.length === 0}
				>
					<FileText className="w-4 h-4" />
					<span>Télécharger le rapport complet</span>
				</Button>
			</div>

			{/* Message si aucune certification */}
			{!isLoading && completedTrainings.length === 0 ? (
				<Card className="bg-gray-50 dark:bg-gray-800 border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Award className="w-12 h-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium mb-2">
							Aucune certification disponible
						</h3>
						<p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
							Terminez des formations pour obtenir vos
							certifications et diplômes. Vous pourrez ensuite les
							télécharger et les partager.
						</p>
						<Button
							onClick={() =>
								(window.location.href = "/wisetrainer")
							}
							className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
						>
							Explorer les formations
						</Button>
					</CardContent>
				</Card>
			) : (
				<>
					{/* Liste des certifications */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{isLoading
							? // État de chargement
							  Array(3)
									.fill(0)
									.map((_, index) => (
										<Card
											key={index}
											className="animate-pulse"
										>
											<div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
											<CardContent className="p-4">
												<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
												<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
											</CardContent>
										</Card>
									))
							: // Certifications réelles
							  completedTrainings.map((training) => (
									<motion.div
										key={training.id}
										variants={itemVariants}
									>
										<Card
											className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
											onClick={() =>
												setSelectedCertification(
													training
												)
											}
										>
											<div className="relative h-40 bg-gradient-to-r from-wisetwin-darkblue to-wisetwin-blue">
												<div className="absolute inset-0 flex items-center justify-center">
													<div className="bg-white/10 backdrop-blur-sm p-6 rounded-full">
														<Award className="h-12 w-12 text-white" />
													</div>
												</div>
												<div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm p-2 text-white text-center">
													<Badge className="bg-green-600 hover:bg-green-700">
														Complété
													</Badge>
												</div>
											</div>
											<CardContent className="p-4">
												<h3 className="font-bold mb-1 line-clamp-1">
													{training.name}
												</h3>
												<div className="flex items-center text-sm text-muted-foreground mb-3">
													<Calendar className="w-3 h-3 mr-1" />
													<span>
														Terminé le{" "}
														{formatDate(
															training.completedAt ||
																new Date()
														)}
													</span>
												</div>
												<Button
													className="w-full bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
													onClick={(e) => {
														e.stopPropagation();
														handleDownloadCertificate(
															training
														);
													}}
												>
													<Download className="w-4 h-4 mr-2" />
													Télécharger
												</Button>
											</CardContent>
										</Card>
									</motion.div>
							  ))}
					</div>
				</>
			)}

			{/* Prévisualisation de certificat (à implémenter) */}
			{selectedCertification && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-xl font-bold">
									Certification: {selectedCertification.name}
								</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										setSelectedCertification(null)
									}
								>
									✕
								</Button>
							</div>

							<div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg mb-6 flex flex-col items-center text-center">
								<div className="mb-6">
									<Image
										src="/logos/logo_parrot_dark.svg"
										alt="WiseTwin Logo"
										width={100}
										height={100}
									/>
								</div>
								<h2 className="text-2xl font-bold mb-2">
									Certificat d'achèvement
								</h2>
								<p className="text-lg mb-6">
									Cette certification est décernée à
								</p>
								<p className="text-xl font-bold mb-6">
									John Doe
								</p>
								<p className="mb-4">
									Pour avoir complété avec succès la formation
								</p>
								<p className="text-xl font-bold text-wisetwin-blue mb-6">
									{selectedCertification.name}
								</p>
								<p className="mb-2">Avec un score de</p>
								<div className="w-16 h-16 rounded-full bg-green-100 text-green-800 font-bold text-xl flex items-center justify-center mb-6">
									{selectedCertification.score || 90}
								</div>
								<p className="text-sm text-muted-foreground">
									Terminé le{" "}
									{formatDate(
										selectedCertification.completedAt ||
											new Date()
									)}
								</p>
							</div>

							<div className="flex justify-end gap-4">
								<Button
									variant="outline"
									onClick={() =>
										setSelectedCertification(null)
									}
								>
									Fermer
								</Button>
								<Button
									className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
									onClick={() =>
										handleDownloadCertificate(
											selectedCertification
										)
									}
								>
									<Download className="w-4 h-4 mr-2" />
									Télécharger le certificat
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</motion.div>
	);
}
