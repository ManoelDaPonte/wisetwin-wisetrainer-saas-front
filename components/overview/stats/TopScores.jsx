import React from "react";
import { Award } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function TopScores({ topScores, isLoading }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center">
					<Award className="w-5 h-5 mr-2 text-wisetwin-blue" />
					Meilleurs scores
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
									<div className="flex-1">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
									</div>
									<div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
								</div>
							</div>
						))}
					</div>
				) : topScores.length > 0 ? (
					<div className="space-y-4">
						{topScores.map((score, index) => (
							<div
								key={index}
								className="flex items-center justify-between"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-wisetwin-blue/10 flex items-center justify-center">
										<span className="font-bold text-wisetwin-blue">
											{index + 1}
										</span>
									</div>
									<div>
										<div className="font-medium">
											{score.moduleName}
										</div>
										<div className="text-sm text-muted-foreground">
											{score.trainingName}
										</div>
									</div>
								</div>
								<div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 font-bold dark:bg-green-900/30 dark:text-green-300">
									{score.score}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-6 text-muted-foreground">
						Aucun score disponible
					</div>
				)}
			</CardContent>
		</Card>
	);
}
