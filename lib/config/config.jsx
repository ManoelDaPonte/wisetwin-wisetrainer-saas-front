// lib/config/config.jsx
import {
	Home,
	LayoutDashboard,
	ChartNoAxesCombined,
	Box,
	GraduationCap,
	FolderKanban,
	AlertTriangle,
	TrendingUp,
	BookText,
	Users,
	ServerCog,
} from "lucide-react";

export const HomePageCards = [
	{
		title: "Formation en Réalité Virtuelle",
		description:
			"Accédez à nos modules de formation interactifs pour maîtriser les procédures de sécurité essentielles. Pratiquez dans un environnement virtuel avant d'appliquer vos compétences sur le terrain.",
		icon: GraduationCap,
		route: "/wisetrainer",
		primaryAction: "Commencer la formation",
		secondaryInfo: "Plusieurs scénarios disponibles",
	},
	{
		title: "Tableau de Bord",
		description:
			"Visualisez vos statistiques et suivez votre progression sur l'ensemble des modules de formation. Consultez vos résultats récents et reprenez facilement vos sessions de formation.",
		icon: LayoutDashboard,
		route: "/overview",
		primaryAction: "Voir mes statistiques",
		secondaryInfo: "Suivi de progression en temps réel",
	},
	{
		title: "Jumeau Numérique",
		description:
			"Explorez des environnements virtuels interactifs représentant fidèlement vos installations et équipements. Cette fonctionnalité sera bientôt disponible pour enrichir votre expérience de formation.",
		icon: Box,
		route: "/digital-twin",
		disabled: true,
		primaryAction: "Explorer",
		secondaryInfo: "Bientôt disponible",
	},
];

export const navigationItems = {
	topItems: [
		{ id: "", label: "Premier Pas", icon: Home },
		{
			id: "overview",
			label: "Statistiques",
			icon: ChartNoAxesCombined,
		},
	],
	coreItems: [
		{
			id: "digital-twin",
			label: "WiseTwin",
			icon: Box,
			disabled: true,
		},
		{
			id: "wisetrainer",
			label: "WiseTrainer",
			icon: GraduationCap,
		},
	],
	settingsItems: [
		{
			id: "iot-dashboard",
			label: "Device",
			icon: FolderKanban,
		},
		{
			id: "alerts",
			label: "Alerts",
			icon: AlertTriangle,
		},
		{
			id: "predictive",
			label: "Predictive",
			icon: TrendingUp,
			disabled: true,
		},
	],
	otherItems: [
		// {
		// 	id: "documentation",
		// 	label: "Docs",
		// 	icon: BookText,
		// 	external: true,
		// },
		{
			id: "organization",
			label: "Organisation",
			icon: Users,
			disabled: false,
		},
	],
};

export default navigationItems;
