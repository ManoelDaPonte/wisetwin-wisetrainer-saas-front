// components/common/NavButton.jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NavButton = ({
	children,
	icon,
	onClick,
	className,
	badge,
	disabled = false,
	...props
}) => {
	// Render the icon component if it's a function
	const IconComponent = typeof icon === "function" ? icon : null;

	return (
		<motion.button
			whileHover={disabled ? {} : { scale: 1.02 }}
			whileTap={disabled ? {} : { scale: 0.98 }}
			onClick={disabled ? undefined : onClick}
			className={cn(
				"flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
				disabled
					? "opacity-50 cursor-not-allowed"
					: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
				className
			)}
			disabled={disabled}
			{...props}
		>
			{/* Render icon */}
			{icon && (
				<span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
					{typeof icon === "string" ? (
						// String URL
						<img src={icon} alt="" className="w-full h-full" />
					) : IconComponent ? (
						// Function component (Lucide icon)
						<IconComponent size={18} />
					) : React.isValidElement(icon) ? (
						// React element
						icon
					) : null}
				</span>
			)}

			{/* Button text */}
			<span className="flex-grow">{children}</span>

			{/* Optional badge */}
			{badge && (
				<span
					className={cn(
						"px-1.5 py-0.5 text-xs font-semibold rounded-full",
						badge.color === "purple"
							? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
							: badge.color === "blue"
							? "bg-wisetwin-blue-light/20 text-wisetwin-blue dark:bg-wisetwin-blue/30"
							: badge.color === "green"
							? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
							: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
					)}
				>
					{badge.label}
				</span>
			)}
		</motion.button>
	);
};

export default NavButton;
