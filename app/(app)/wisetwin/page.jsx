//app/(app)/wisetwin/page.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import WiseTwinViewer from "@/components/wisetwin/WiseTwinViewer";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { Box, Building3D } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WiseTwinPage() {
	const { isLoading } = useAzureContainer();

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.5,
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

	return (
		<motion.div
			className="container mx-auto py-8"
			initial="hidden"
			animate="visible"
			variants={containerVariants}
		>
			<motion.div variants={itemVariants} className="mb-8">
				<div className="flex items-center gap-3 mb-3">
					<div className="bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 p-2 rounded-lg">
						<Box className="h-6 w-6 text-wisetwin-blue" />
					</div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white">
						WiseTwin
					</h1>
				</div>
				<p className="text-gray-600 dark:text-gray-300 ml-11">
					Explorez nos environnements 3D et jumeaux numériques
					industriels pour vous familiariser avec les installations
				</p>
			</motion.div>

			{isLoading ? (
				<div className="space-y-6">
					<Skeleton className="w-full h-12 rounded-lg" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<Skeleton className="w-full h-64 rounded-lg" />
						<Skeleton className="w-full h-64 rounded-lg" />
						<Skeleton className="w-full h-64 rounded-lg" />
						<Skeleton className="w-full h-64 rounded-lg" />
					</div>
				</div>
			) : (
				<WiseTwinViewer />
			)}
		</motion.div>
	);
}
