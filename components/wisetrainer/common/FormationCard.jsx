// components/wisetrainer/common/FormationCard.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, BookOpen, Plus, Check, ArrowRight } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

const FormationCard = ({
	formation,
	isEnrolled,
	onEnroll,
	onView,
	showProgress = false,
}) => {
	// Déterminer la source de la formation (WiseTwin ou organisation)
	const isWiseTwin =
		!formation.source ||
		formation.source.type === "wisetwin" ||
		!formation.source.organizationId;

	// Source à afficher
	const sourceName = isWiseTwin
		? "WiseTwin"
		: formation.source.name || "Organisation";

	return (
		<Card className="h-full flex flex-col hover:shadow-md transition-shadow">
			<div className="relative h-40">
				{formation.imageUrl ? (
					<Image
						src={formation.imageUrl}
						alt={formation.name}
						fill
						className="object-cover rounded-t-lg"
					/>
				) : (
					<div className="bg-gradient-to-r from-wisetwin-blue/30 to-wisetwin-darkblue/30 h-full w-full rounded-t-lg flex items-center justify-center">
						<BookOpen className="h-12 w-12 text-wisetwin-darkblue/50 dark:text-white/50" />
					</div>
				)}

				{/* Badge de source */}
				<Badge
					className={`absolute top-2 right-2 ${
						isWiseTwin ? "bg-wisetwin-blue" : "bg-wisetwin-blue/70"
					}`}
				>
					{sourceName}
				</Badge>

				{/* Afficher la progression si disponible et demandée */}
				{showProgress &&
					isEnrolled &&
					formation.progress !== undefined && (
						<div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700">
							<div
								className="h-full bg-green-500"
								style={{ width: `${formation.progress}%` }}
							></div>
						</div>
					)}
			</div>

			<CardHeader className="pb-1">
				<div className="flex justify-between items-start">
					<CardTitle className="text-lg font-semibold text-wisetwin-darkblue dark:text-white">
						{formation.name}
					</CardTitle>
				</div>

				<div className="flex gap-2 mt-1">
					{formation.category && (
						<Badge variant="outline" className="text-xs">
							{formation.category}
						</Badge>
					)}
					{formation.level && (
						<Badge variant="outline" className="text-xs">
							{formation.level}
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="flex-grow">
				<p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
					{formation.description}
				</p>

				<div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
					<Clock className="h-4 w-4 mr-1" />
					<span>{formation.duration || "Non spécifié"}</span>

					{formation.certification && (
						<div className="flex items-center ml-4">
							<Award className="h-4 w-4 mr-1 text-yellow-500" />
							<span>Certification</span>
						</div>
					)}
				</div>

				{showProgress && isEnrolled && formation.enrolledAt && (
					<div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
						Inscription: {formatDate(formation.enrolledAt)}
					</div>
				)}
			</CardContent>

			<CardFooter className="pt-0">
				{isEnrolled ? (
					<Button
						className="w-full bg-wisetwin-blue hover:bg-wisetwin-blue-light"
						onClick={() => onView(formation)}
					>
						<ArrowRight className="mr-2 h-4 w-4" />
						Accéder
					</Button>
				) : (
					<Button
						className="w-full"
						variant="outline"
						onClick={() => onEnroll(formation)}
					>
						<Plus className="mr-2 h-4 w-4" />
						S'inscrire
					</Button>
				)}
			</CardFooter>
		</Card>
	);
};

export default FormationCard;
