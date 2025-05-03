// components/wisetrainer/formation/content/OverviewContent.jsx (version finale)
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Award,
	Calendar,
	CheckCircle2,
	Clock,
	Box,
	Book,
	ArrowRight,
	Lock,
	Play,
	ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useFormationModules } from "@/lib/hooks/formations/currentFormation/useFormationModules";

const OverviewContent = ({ formation }) => {
	const router = useRouter();

	// Utiliser le hook pour récupérer les modules et les leçons
	const { modules3D, lessons, isEnrolled, isLoading, error } =
		useFormationModules(formation?.id, formation?.source);

	if (!formation) return null;

	// Calculer le progrès global
	const totalModules = modules3D.length + lessons.length;
	const completedModules =
		modules3D.filter((m) => m.completed).length +
		lessons.filter((l) => l.completed).length;
	const globalProgress =
		totalModules > 0
			? Math.round((completedModules / totalModules) * 100)
			: 0;

	// Navigation vers un module 3D
	const handleNavigateToModule = (moduleId, buildId) => {
		// Vérifier si le module est verrouillé
		const module = modules3D.find((m) => m.id === moduleId);
		if (module && module.locked) return;

		if (formation.source && formation.source.type === "organization") {
			router.push(
				`/wisetrainer/organization/${formation.source.organizationId}/${formation.id}/build3d/${buildId}/module/${moduleId}`
			);
		} else {
			router.push(
				`/wisetrainer/${formation.id}/build3d/${buildId}/module/${moduleId}`
			);
		}
	};

	// Navigation vers une leçon
	const handleNavigateToLesson = (lessonId, courseId) => {
		// Vérifier si la leçon est verrouillée
		const lesson = lessons.find((l) => l.id === lessonId);
		if (lesson && lesson.locked) return;

		if (formation.source && formation.source.type === "organization") {
			router.push(
				`/wisetrainer/organization/${formation.source.organizationId}/${formation.id}/course/${courseId}/lesson/${lessonId}`
			);
		} else {
			router.push(
				`/wisetrainer/${formation.id}/course/${courseId}/lesson/${lessonId}`
			);
		}
	};

	return (
		<div className="space-y-8">
			{/* Description de la formation */}
			<Card>
				<CardContent className="pt-6">
					<h2 className="text-2xl font-semibold mb-4 text-wisetwin-darkblue dark:text-white">
						À propos de cette formation
					</h2>
					<p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
						{formation.description}
					</p>
				</CardContent>
			</Card>

			{/* Statut d'inscription et progression globale */}
			{formation.isEnrolled && (
				<Card>
					<CardContent className="pt-6">
						<h2 className="text-2xl font-semibold mb-4 text-wisetwin-darkblue dark:text-white">
							Votre progression
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center">
								<div className="bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 p-3 rounded-full mr-4">
									<Calendar className="h-5 w-5 text-wisetwin-blue" />
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Inscrit le
									</p>
									<p className="font-medium">
										{formatDate(
											formation.enrollment.startedAt
										)}
									</p>
								</div>
							</div>

							<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center">
								<div className="bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 p-3 rounded-full mr-4">
									<Clock className="h-5 w-5 text-wisetwin-blue" />
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Dernière activité
									</p>
									<p className="font-medium">
										{formatDate(
											formation.enrollment.lastAccessedAt
										)}
									</p>
								</div>
							</div>

							<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center">
								<div
									className={`${
										formation.enrollment.completedAt
											? "bg-green-100 dark:bg-green-900/20"
											: "bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20"
									} p-3 rounded-full mr-4`}
								>
									<CheckCircle2
										className={`h-5 w-5 ${
											formation.enrollment.completedAt
												? "text-green-600 dark:text-green-400"
												: "text-wisetwin-blue"
										}`}
									/>
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Statut
									</p>
									<p className="font-medium">
										{formation.enrollment.completedAt
											? "Terminé"
											: formation.enrollment.status ===
											  "in_progress"
											? "En cours"
											: "Non commencé"}
									</p>
								</div>
							</div>
						</div>

						{/* Barre de progression */}
						<div className="mt-6">
							<div className="flex justify-between mb-2">
								<span className="text-sm">
									Progression globale
								</span>
								<span className="text-sm font-medium">
									{globalProgress}%
								</span>
							</div>
							<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
								<div
									className="bg-wisetwin-blue h-2.5 rounded-full"
									style={{ width: `${globalProgress}%` }}
								></div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Progression dans les modules 3D */}
			{formation.isEnrolled && modules3D.length > 0 && (
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center mb-4">
							<Box className="h-5 w-5 text-wisetwin-blue mr-2" />
							<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
								Formation pratique - Environnement 3D
							</h2>
						</div>

						<div className="space-y-4 mt-4">
							{isLoading ? (
								<div className="animate-pulse space-y-3">
									<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
									<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
									<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
								</div>
							) : (
								modules3D.map((module) => (
									<div
										key={module.id}
										className={`border rounded-lg p-4 transition-all ${
											module.locked
												? "border-gray-200 dark:border-gray-700 opacity-70"
												: "border-gray-300 dark:border-gray-600 hover:border-wisetwin-blue dark:hover:border-wisetwin-blue cursor-pointer"
										}`}
										onClick={() =>
											handleNavigateToModule(
												module.id,
												module.buildId
											)
										}
									>
										<div className="flex justify-between items-center">
											<div className="flex items-center">
												{module.locked ? (
													<Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
												) : module.completed ? (
													<CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
												) : (
													<Play className="h-4 w-4 text-wisetwin-blue mr-2" />
												)}
												<h3 className="font-medium">
													{module.title}
												</h3>
											</div>

											{!module.locked && (
												<Badge
													variant={
														module.completed
															? "outline"
															: "secondary"
													}
												>
													{module.completed
														? "Terminé"
														: "À compléter"}
												</Badge>
											)}
										</div>
									</div>
								))
							)}

							<Button
								variant="outline"
								className="w-full mt-4"
								onClick={() =>
									router.push(
										formation.source &&
											formation.source.type ===
												"organization"
											? `/wisetrainer/organization/${formation.source.organizationId}/${formation.id}?tab=builds3d`
											: `/wisetrainer/${formation.id}?tab=builds3d`
									)
								}
							>
								Voir tous les modules 3D
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Progression dans les leçons */}
			{formation.isEnrolled && lessons.length > 0 && (
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center mb-4">
							<Book className="h-5 w-5 text-wisetwin-blue mr-2" />
							<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
								Formation théorique - Cours
							</h2>
						</div>

						<div className="space-y-3 mt-4">
							{isLoading ? (
								<div className="animate-pulse space-y-3">
									<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
									<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
									<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
								</div>
							) : (
								lessons.map((lesson) => (
									<div
										key={lesson.id}
										className={`border rounded-lg p-4 transition-all ${
											lesson.locked
												? "border-gray-200 dark:border-gray-700 opacity-70"
												: "border-gray-300 dark:border-gray-600 hover:border-wisetwin-blue dark:hover:border-wisetwin-blue cursor-pointer"
										}`}
										onClick={() =>
											handleNavigateToLesson(
												lesson.id,
												lesson.courseId
											)
										}
									>
										<div className="flex justify-between items-center">
											<div className="flex items-center">
												{lesson.locked ? (
													<Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
												) : lesson.completed ? (
													<CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
												) : (
													<ChevronRight className="h-4 w-4 text-wisetwin-blue mr-2" />
												)}
												<h3 className="font-medium">
													{lesson.title}
												</h3>
											</div>

											<div className="flex items-center">
												<Clock className="h-3 w-3 text-gray-400 mr-1" />
												<span className="text-xs text-gray-500 mr-3">
													{lesson.duration}
												</span>

												{!lesson.locked && (
													<Badge
														variant={
															lesson.completed
																? "outline"
																: "secondary"
														}
													>
														{lesson.completed
															? "Terminé"
															: "À compléter"}
													</Badge>
												)}
											</div>
										</div>
									</div>
								))
							)}

							<Button
								variant="outline"
								className="w-full mt-4"
								onClick={() =>
									router.push(
										formation.source &&
											formation.source.type ===
												"organization"
											? `/wisetrainer/organization/${formation.source.organizationId}/${formation.id}?tab=courses`
											: `/wisetrainer/${formation.id}?tab=courses`
									)
								}
							>
								Voir tous les cours
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Contenu de la formation pour les non-inscrits */}
			{!formation.isEnrolled && (
				<Card>
					<CardContent className="pt-6">
						<h2 className="text-2xl font-semibold mb-4 text-wisetwin-darkblue dark:text-white">
							Contenu de la formation
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="border rounded-lg p-6">
								<div className="flex items-center mb-4">
									<Box className="h-6 w-6 text-wisetwin-blue mr-2" />
									<h3 className="text-lg font-medium">
										Modules 3D interactifs
									</h3>
								</div>
								<p className="text-gray-600 dark:text-gray-400 mb-4">
									Explorez des environnements industriels en
									3D et pratiquez dans des conditions
									réalistes.
								</p>
								<ul className="space-y-2 text-gray-600 dark:text-gray-400">
									<li className="flex items-center">
										<div className="w-1.5 h-1.5 rounded-full bg-wisetwin-blue mr-2"></div>
										<span>
											Immersion dans des scénarios réels
										</span>
									</li>
									<li className="flex items-center">
										<div className="w-1.5 h-1.5 rounded-full bg-wisetwin-blue mr-2"></div>
										<span>
											Pratique sécurisée des procédures
										</span>
									</li>
									<li className="flex items-center">
										<div className="w-1.5 h-1.5 rounded-full bg-wisetwin-blue mr-2"></div>
										<span>
											Évaluation des compétences pratiques
										</span>
									</li>
								</ul>
							</div>

							<div className="border rounded-lg p-6">
								<div className="flex items-center mb-4">
									<Book className="h-6 w-6 text-wisetwin-blue mr-2" />
									<h3 className="text-lg font-medium">
										Cours théoriques
									</h3>
								</div>
								<p className="text-gray-600 dark:text-gray-400 mb-4">
									Apprenez les concepts fondamentaux et la
									théorie nécessaire à votre formation.
								</p>
								<ul className="space-y-2 text-gray-600 dark:text-gray-400">
									<li className="flex items-center">
										<div className="w-1.5 h-1.5 rounded-full bg-wisetwin-blue mr-2"></div>
										<span>
											Contenu pédagogique multimédia
										</span>
									</li>
									<li className="flex items-center">
										<div className="w-1.5 h-1.5 rounded-full bg-wisetwin-blue mr-2"></div>
										<span>
											Documentation technique complète
										</span>
									</li>
									<li className="flex items-center">
										<div className="w-1.5 h-1.5 rounded-full bg-wisetwin-blue mr-2"></div>
										<span>
											Quiz et évaluations de connaissances
										</span>
									</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Certification (si disponible) */}
			{formation.certification && (
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center mb-4">
							<Award className="h-6 w-6 text-yellow-500 mr-2" />
							<h2 className="text-2xl font-semibold text-wisetwin-darkblue dark:text-white">
								Certification
							</h2>
						</div>
						<p className="text-gray-700 dark:text-gray-300">
							Cette formation offre une certification officielle.
							Complétez tous les modules pour obtenir votre
							certificat.
						</p>

						{formation.isEnrolled && (
							<div className="mt-4">
								<div className="flex justify-between mb-2">
									<span className="text-sm">
										Progression vers la certification
									</span>
									<span className="text-sm font-medium">
										{globalProgress}%
									</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
									<div
										className="bg-yellow-500 h-2.5 rounded-full"
										style={{ width: `${globalProgress}%` }}
									></div>
								</div>

								<div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
									<p className="text-sm text-yellow-800 dark:text-yellow-200">
										Complétez tous les modules 3D et cours
										théoriques pour débloquer votre
										certification.
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default OverviewContent;
