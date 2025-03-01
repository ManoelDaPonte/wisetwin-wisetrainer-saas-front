// lib/config/config.jsx
import {
	Home,
	LayoutDashboard,
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
		title: "Choose a Demo",
		description:
			"Select a demo from our curated collection and experience the exceptional capabilities of our platform. Perfect for first-time users or those looking to explore new features.",
		icon: LayoutDashboard,
		route: "/overview?showDemo=true",
	},
	{
		title: "Explore 3D",
		description:
			"Learn to navigate through immersive 3D environments. Connect your devices and alerts for seamless interaction and discover a new dimension of management and visualization.",
		icon: Box,
		route: "/digital-twin",
	},
	{
		title: "Device and Alert",
		description:
			"Create and configure your own devices and alerts. Send your data via HTTP and watch them come to life in the 3D environment. Customize your experience and expand your dashboard's capabilities.",
		icon: ServerCog,
		route: "/iot-dashboard",
	},
];

export const navigationItems = {
	topItems: [
		{ id: "", label: "Get Started", icon: Home },
		{
			id: "overview",
			label: "Overview",
			icon: LayoutDashboard,
		},
	],
	coreItems: [
		{
			id: "digital-twin",
			label: "Digital Twin",
			icon: Box,
		},
		{
			id: "wisetrainer",
			label: "WiseTrainer™",
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
		{
			id: "documentation",
			label: "Docs",
			icon: BookText,
			external: true,
		},
		{
			id: "collaborate",
			label: "Collaborate",
			icon: Users,
			disabled: true,
		},
	],
};

export default navigationItems;
