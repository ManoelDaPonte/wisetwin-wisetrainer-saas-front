// components/wisetrainer/formation/FormationHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, ArrowLeft, Clock4 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const FormationHeader = ({ formation, onBack, onEnroll, onUnenroll }) => {
	if (!formation) return null;

	const enrollmentDate = formation.enrollment?.startedAt
		? formatDate(formation.enrollment.startedAt)
		: null;

	return (
		<div className="mb-8">
			<Button
				variant="outline"
				onClick={onBack}
				size="sm"
				className="mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Retour aux formations
			</Button>

			<div className="flex flex-col md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white">
						{formation.name}
					</h1>

					<div className="flex flex-wrap gap-2 mt-2">
						{formation.category && (
							<Badge variant="outline">
								{formation.category}
							</Badge>
						)}
						{formation.level && (
							<Badge variant="outline">{formation.level}</Badge>
						)}
						<Badge
							className={
								formation.source.type === "organization"
									? "bg-wisetwin-blue/70"
									: "bg-wisetwin-blue"
							}
						>
							{formation.source.name}
						</Badge>
						{formation.version && (
							<Badge variant="outline" className="text-xs">
								v{formation.version}
							</Badge>
						)}
					</div>

					<div className="flex items-center mt-4 text-sm text-gray-600 dark:text-gray-300">
						<Clock className="h-4 w-4 mr-1" />
						<span className="mr-4">{formation.duration}</span>

						{formation.certification && (
							<div className="flex items-center ml-2">
								<Award className="h-4 w-4 mr-1 text-yellow-500" />
								<span>Certification</span>
							</div>
						)}

						{enrollmentDate && (
							<div className="flex items-center ml-4">
								<Clock4 className="h-4 w-4 mr-1 text-gray-500" />
								<span>Inscrit le {enrollmentDate}</span>
							</div>
						)}
					</div>
				</div>

				<div className="mt-4 md:mt-0">
					{formation.isEnrolled ? (
						<Button
							variant="outline"
							className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 hover:text-red-700"
							onClick={onUnenroll}
						>
							Se désinscrire
						</Button>
					) : (
						<Button
							className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
							onClick={onEnroll}
						>
							S'inscrire à cette formation
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default FormationHeader;
