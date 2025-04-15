//components/wisetwin/catalog/BuildCard.jsx
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Info,
	Building,
	Sparkles,
	Eye,
	Box,
	Check,
	Loader2,
} from "lucide-react";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

const BuildCard = ({
	build,
	onViewBuild,
	onToggleInfo,
	flippedCardId,
	isImporting,
	itemVariants,
}) => {
	// Vérifier que le build existe pour éviter l'erreur
	if (!build) {
		return null;
	}

	// État pour gérer les erreurs d'image
	const [imgError, setImgError] = useState(false);
	const [imgLoaded, setImgLoaded] = useState(false);

	const isFlipped = flippedCardId === build.id;

	// Déterminer la source de l'environnement (WiseTwin par défaut ou organisation)
	const source = build.source || { type: "wisetwin", name: "WiseTwin" };
	const isOrganizationBuild = source.type === "organization";

	// Préparer les caractéristiques pour l'affichage
	const features = build.features || [
		"Visite interactive",
		"Mesures de sécurité",
		"Exploration détaillée",
	];
	const hasFeatures = features.length > 0;

	// Déterminer l'URL de l'image à utiliser
	const imageUrl = imgError
		? WISETWIN_CONFIG.DEFAULT_IMAGE
		: build.imageUrl || WISETWIN_CONFIG.DEFAULT_IMAGE;

	return (
		<motion.div variants={itemVariants}>
			<Card
				className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
				noPaddingTop
			>
				{/* Image du build couvrant toute la largeur */}
				{!isFlipped && (
					<div className="relative w-full h-52 overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
						{/* Image avec gestion de chargement et d'erreur */}
						{!imgLoaded && !imgError && (
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-8 h-8 border-4 border-wisetwin-blue border-t-transparent rounded-full animate-spin"></div>
							</div>
						)}

						<Image
							src={imageUrl}
							alt={build.name || "Environnement 3D"}
							fill
							className={`object-cover transition-opacity duration-300 ${
								imgLoaded ? "opacity-100" : "opacity-0"
							}`}
							onLoad={() => setImgLoaded(true)}
							onError={(e) => {
								setImgError(true);
								setImgLoaded(true);
								e.target.src = WISETWIN_CONFIG.DEFAULT_IMAGE;
							}}
							priority={true}
						/>

						{/* Badge de catégorie sur l'image */}
						<div className="absolute top-3 right-3">
							<Badge
								variant="outline"
								className="bg-white/90 dark:bg-black/70 text-blue-700 dark:text-blue-200 font-medium"
							>
								{build.category || "Environnement industriel"}
							</Badge>
						</div>

						{/* Badge de provenance sur l'image */}
						<div className="absolute top-3 left-3">
							<Badge
								className={
									isOrganizationBuild
										? "bg-gray-700 text-white"
										: "bg-wisetwin-blue text-white"
								}
							>
								{isOrganizationBuild ? (
									<>
										<Building className="w-3 h-3 mr-1" />
										{source.name}
									</>
								) : (
									<>
										<Sparkles className="w-3 h-3 mr-1" />
										WiseTwin
									</>
								)}
							</Badge>
						</div>
					</div>
				)}

				{isFlipped ? (
					<div className="flex-grow pt-6">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-xl">
									{build.name}
								</CardTitle>
								<Badge
									variant="outline"
									className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
								>
									{build.category}
								</Badge>
							</div>
							<CardDescription className="flex items-center gap-1">
								{isOrganizationBuild ? (
									<Building className="h-4 w-4" />
								) : (
									<Sparkles className="h-4 w-4" />
								)}
								{source.name}
							</CardDescription>
						</CardHeader>

						<CardContent className="flex-grow">
							<div className="space-y-4">
								<div>
									<h4 className="font-semibold text-md mb-2 flex items-center gap-1">
										<Box className="h-4 w-4" />
										Caractéristiques de l'environnement:
									</h4>
									<ul className="space-y-2">
										{hasFeatures ? (
											features.map((feature, index) => (
												<li
													key={index}
													className="flex items-start gap-2"
												>
													<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
													<div className="text-gray-700 dark:text-gray-300">
														{feature}
													</div>
												</li>
											))
										) : (
											<>
												<li className="flex items-start gap-2">
													<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
													<div className="text-gray-700 dark:text-gray-300">
														Visite interactive
													</div>
												</li>
												<li className="flex items-start gap-2">
													<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
													<div className="text-gray-700 dark:text-gray-300">
														Navigation intuitive
													</div>
												</li>
												<li className="flex items-start gap-2">
													<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
													<div className="text-gray-700 dark:text-gray-300">
														Familiarisation avec les
														équipements
													</div>
												</li>
											</>
										)}
									</ul>
								</div>

								<div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
									<h4 className="font-semibold text-md mb-2">
										À propos de cet environnement:
									</h4>
									<p className="text-sm text-gray-600 dark:text-gray-300">
										{build.description}
									</p>
								</div>
							</div>
						</CardContent>
					</div>
				) : (
					<>
						<CardHeader>
							<CardTitle className="text-xl">
								{build.name}
							</CardTitle>
							<CardDescription className="flex items-center gap-1">
								{isOrganizationBuild ? (
									<Building className="h-4 w-4" />
								) : (
									<Sparkles className="h-4 w-4" />
								)}
								{source.name}
							</CardDescription>
						</CardHeader>

						<CardContent className="flex-grow">
							<p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
								{build.description}
							</p>

							<div className="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
								<Box className="h-4 w-4" />
								<span>
									{features.length || 3} caractéristiques
								</span>
							</div>
						</CardContent>
					</>
				)}

				<CardFooter className="flex gap-2 mt-auto pt-2">
					<Button
						className={`flex-1 bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white`}
						onClick={() => onViewBuild(build)}
						disabled={isImporting}
					>
						{isImporting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Chargement...
							</>
						) : (
							<>
								<Eye className="mr-2 h-4 w-4" />
								Explorer
							</>
						)}
					</Button>
					<Button
						className="flex-1"
						variant="outline"
						onClick={(e) => {
							e.preventDefault();
							onToggleInfo(build.id);
						}}
					>
						<Info className="h-4 w-4 mr-1" />
						{isFlipped ? "Moins d'infos" : "Plus d'infos"}
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
};

export default BuildCard;
