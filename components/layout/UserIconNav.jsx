// components/layout/UserIconNav.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import NavButton from "@/components/common/NavButton";
import Image from "next/image";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const UserIconNav = () => {
	const { user, error, isLoading } = useUser();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const router = useRouter();

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const closeMenuAndExecute = (action) => {
		setIsOpen(false);
		action();
	};

	const handleClickOutside = (event) => {
		if (
			dropdownRef.current &&
			!dropdownRef.current.contains(event.target)
		) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	if (error) {
		return <div className="text-destructive">Error: {error.message}</div>;
	}

	return (
		<div className="relative flex">
			{isLoading ? (
				<div className="w-8 h-8 rounded-3xl bg-muted animate-pulse"></div>
			) : (
				user && (
					<div ref={dropdownRef}>
						<Image
							src={user.picture}
							alt="User profile"
							className="w-8 h-8 rounded-3xl cursor-pointer ring-2 ring-border hover:ring-primary transition-all"
							onClick={toggleDropdown}
							width={32}
							height={32}
						/>
						{isOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50 py-2 p-2">
								<NavButton
									className="w-full text-left"
									icon={<Settings size={18} />}
									onClick={() =>
										closeMenuAndExecute(() =>
											router.push("/settings")
										)
									}
								>
									Paramètres
								</NavButton>

								<NavButton
									className="w-full text-left text-destructive hover:text-destructive/90"
									icon={<LogOut size={18} />}
									onClick={() =>
										closeMenuAndExecute(
											() =>
												(window.location.href =
													"/auth/logout")
										)
									}
								>
									Déconnexion
								</NavButton>
							</div>
						)}
					</div>
				)
			)}
		</div>
	);
};

export default UserIconNav;
