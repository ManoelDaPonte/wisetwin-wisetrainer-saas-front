import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useActiveContext,
	useContextCourses,
	usePermissions,
} from "@/lib/hooks";
import { useToast } from "@/lib/hooks/useToast";

// Import des composants d'onglets
import PersonalCoursesTab from "@/components/wisetrainer/courses/PersonalCoursesTab";
import CatalogOrganizationTab from "@/components/wisetrainer/courses/CatalogOrganizationTab";
import UnenrollModal from "@/components/wisetrainer/UnenrollModal";

/**
 * Composant principal pour afficher les formations WiseTrainer
 * Utilise les nouveaux hooks contextuels pour s'adapter automatiquement
 */
export default function WiseTrainerCourses() {
	const router = useRouter();
	const { toast } = useToast();

	// État local pour l'UI
	const [activeTab, setActiveTab] = useState("personal");
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [showUnenrollModal, setShowUnenrollModal] = useState(false);
	const [courseToUnenroll, setCourseToUnenroll] = useState(null);

	// Contexte actif et permissions
	const {
		activeContext,
		isPersonalMode,
		isOrganizationMode,
		user,
		currentOrganization,
		switchToPersonal,
		switchToOrganization,
	} = useActiveContext();

	const { can } = usePermissions();

	// Formations selon le contexte
	const {
		courses,
		isLoading,
		error,
		enrollCourse,
		unenrollCourse,
		refreshCourses,
		stats,
	} = useContextCourses({ autoLoad: true });

	// Séparer les formations par statut
	const personalCourses = isPersonalMode
		? courses.filter((c) => c.enrollmentDate) // Formations où l'utilisateur est inscrit
		: [];

	const catalogCourses = isPersonalMode
		? courses.filter((c) => !c.enrollmentDate) // Formations disponibles mais pas encore suivies
		: courses; // En mode organisation, toutes les formations sont dans le catalogue

	// Configuration pour les animations
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.5 },
		},
	};

	/**
	 * Gère l'inscription à une formation
	 */
	const handleEnroll = async (course) => {
		try {
			const result = await enrollCourse(course.id);

			if (result.success) {
				toast({
					title: "Inscription réussie",
					description: `Vous êtes maintenant inscrit à la formation "${course.title}"`,
				});

				// Rediriger vers la formation
				const compositeId =
					course.compositeId ||
					`${course.id}__${activeContext.type}__${
						isPersonalMode ? user?.id : currentOrganization?.id
					}`;
				router.push(`/wisetrainer/${compositeId}`);
			}
		} catch (error) {
			toast({
				title: "Erreur",
				description:
					error.message || "Impossible de s'inscrire à la formation",
				variant: "destructive",
			});
		}
	};

	/**
	 * Gère la désinscription avec modale
	 */
	const handleUnenroll = (course) => {
		setCourseToUnenroll(course);
		setShowUnenrollModal(true);
	};

	/**
	 * Confirme la désinscription
	 */
	const confirmUnenroll = async () => {
		if (!courseToUnenroll) return;

		try {
			const result = await unenrollCourse(courseToUnenroll.id);

			if (result.success) {
				toast({
					title: "Désinscription réussie",
					description: `Vous êtes désinscrit de la formation "${courseToUnenroll.title}"`,
				});

				setShowUnenrollModal(false);
				setCourseToUnenroll(null);

				// Rafraîchir les formations
				refreshCourses();
			}
		} catch (error) {
			toast({
				title: "Erreur",
				description:
					error.message ||
					"Impossible de se désinscrire de la formation",
				variant: "destructive",
			});
		}
	};

	/**
	 * Navigue vers une formation
	 */
	const handleNavigateToCourse = (course) => {
		const compositeId =
			course.compositeId ||
			`${course.id}__${activeContext.type}__${
				isPersonalMode ? user?.id : currentOrganization?.id
			}`;
		router.push(`/wisetrainer/${compositeId}`);
	};

	/**
	 * Message d'erreur contextuel
	 */
	const getErrorMessage = () => {
		if (error) return error;

		if (!user) {
			return "Veuillez vous connecter pour accéder aux formations";
		}

		if (isOrganizationMode && !currentOrganization) {
			return "Organisation non trouvée";
		}

		return null;
	};

	const errorMessage = getErrorMessage();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
					Formations WiseTrainer
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					{isPersonalMode
						? "Gérez vos formations personnelles et découvrez de nouvelles opportunités d'apprentissage"
						: `Formations disponibles dans ${currentOrganization?.name}`}
				</p>
			</div>

			{errorMessage ? (
				<div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
					{errorMessage}
				</div>
			) : (
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="personal">
							Mes formations ({personalCourses.length})
						</TabsTrigger>
						<TabsTrigger value="organization">
							{isPersonalMode
								? "Catalogue"
								: "Formations disponibles"}{" "}
							({catalogCourses.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="personal" className="mt-6">
						<PersonalCoursesTab
							courses={personalCourses}
							onUnenroll={handleUnenroll}
							onNavigate={handleNavigateToCourse}
							flippedCardId={flippedCardId}
							setFlippedCardId={setFlippedCardId}
							isLoading={isLoading}
							containerVariants={containerVariants}
							itemVariants={itemVariants}
						/>
					</TabsContent>

					<TabsContent value="organization" className="mt-6">
						<CatalogOrganizationTab
							trainings={catalogCourses}
							isLoading={isLoading}
							onEnroll={handleEnroll}
							selectedOrganization={
								isOrganizationMode ? currentOrganization : null
							}
							selectedOrganizationId={
								isOrganizationMode
									? currentOrganization?.id
									: null
							}
							flippedCardId={flippedCardId}
							setFlippedCardId={setFlippedCardId}
							containerVariants={containerVariants}
							itemVariants={itemVariants}
							contextType={activeContext.type}
						/>
					</TabsContent>
				</Tabs>
			)}

			{/* Modale de désinscription */}
			<UnenrollModal
				isOpen={showUnenrollModal}
				onClose={() => {
					setShowUnenrollModal(false);
					setCourseToUnenroll(null);
				}}
				onConfirm={confirmUnenroll}
				courseTitle={courseToUnenroll?.title}
			/>
		</div>
	);
}
