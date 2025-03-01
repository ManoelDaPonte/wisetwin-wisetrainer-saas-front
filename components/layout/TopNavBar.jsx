"use client";
import { usePathname } from "next/navigation";
import UserIconNav from "@/components/UserIconNav";

const TopNavBar = () => {
	const pathname = usePathname();

	// Ne pas afficher l'icône sur la page de connexion
	if (pathname === "/login") return null;

	return (
		<div className="fixed top-4 right-6 z-50">
			<UserIconNav />
		</div>
	);
};

export default TopNavBar;
