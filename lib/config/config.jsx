import {
	Home,
	LayoutDashboard,
	ChartNoAxesCombined,
	Box,
	GraduationCap,
	BookText,
	Users,
	Compass,
	Settings,
} from "lucide-react";

export const STATS_CONFIG = {
	MEDALS: {
		GOLD: {
			icon: "Trophy",
			color: "#FFD700",
			label: "Or",
			minScore: 90,
		},
		SILVER: {
			icon: "Award",
			color: "#C0C0C0",
			label: "Argent",
			minScore: 75,
		},
		BRONZE: {
			icon: "Medal",
			color: "#CD7F32",
			label: "Bronze",
			minScore: 60,
		},
	},
	ACTIVITY_TYPES: {
		TRAINING_STARTED: "training_started",
		TRAINING_COMPLETED: "training_completed",
		MODULE_COMPLETED: "module_completed",
		QUIZ_COMPLETED: "quiz_completed",
		SESSION_STARTED: "session_started",
		SESSION_ENDED: "session_ended",
	},
	PDF_TEMPLATES: {
		CERTIFICATE: "certificate_template",
		FULL_REPORT: "full_report_template",
	},
};

export const HomePageCards = [
	{
		title: "WiseTrainer & WiseTwin",
		description:
			"Accédez à nos modules de formation interactifs en 3D ou simplement explorez les environnements virtuels. Formez-vous aux procédures de sécurité essentielles ou familiarisez-vous avec les espaces industriels avant d'y accéder.",
		icon: GraduationCap,
		route: "/wisetrainer",
		primaryAction: "Commencer l'exploration",
		secondaryInfo: "Formation interactive et exploration 3D",
	},
	{
		title: "Suivez votre progression",
		description:
			"Visualisez vos statistiques et suivez votre progression sur l'ensemble des modules de formation. Consultez vos résultats récents, télécharger vos diplômes et reprenez facilement vos sessions de formation là où vous les avez laissées.",
		icon: ChartNoAxesCombined,
		route: "/overview",
		primaryAction: "Voir mes statistiques",
		secondaryInfo: "Suivi personnalisé en temps réel",
	},
	{
		title: "Gérez vos organisations",
		description:
			"Créez ou rejoignez des organisations pour collaborer avec votre équipe. Assignez des formations spécifiques, suivez la progression des membres et analysez les performances collectives.",
		icon: Users,
		route: "/organization",
		primaryAction: "Gérer les organisations",
		secondaryInfo: "Administration des équipes et formations",
	},
];

export const navigationItems = {
	topItems: [
		{ id: "guide", label: "Guide", icon: Compass },
		{
			id: "overview",
			label: "Statistiques",
			icon: ChartNoAxesCombined,
		},
	],
	coreItems: [
		{
			id: "wisetwin",
			label: "WiseTwin",
			icon: Box,
		},
		{
			id: "wisetrainer",
			label: "WiseTrainer",
			icon: GraduationCap,
		},
	],
	otherItems: [
		{
			id: "organization",
			label: "Organisation",
			icon: Users,
			disabled: false,
		},
		{
			id: "settings",
			label: "Paramètres",
			icon: Settings,
			disabled: false,
		},
	],
};

export default navigationItems;
