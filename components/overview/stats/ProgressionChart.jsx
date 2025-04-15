//components/overview/stats/ProgressionChart.jsx
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import { TrendingUp } from "lucide-react";

export default function ProgressionChart({ trainingsData, isLoading }) {
	// Préparer les données pour le graphique
	const chartData =
		trainingsData && trainingsData.length > 0
			? trainingsData
					.map((training) => ({
						name:
							training.name.substring(0, 15) +
							(training.name.length > 15 ? "..." : ""),
						progress: training.progress || 0,
					}))
					.sort((a, b) => a.progress - b.progress)
			: [];

	// Fonction pour déterminer la couleur en fonction de la progression
	const getBarColor = (progress) => {
		if (progress >= 80) return "#22c55e"; // Vert pour progression élevée
		if (progress >= 60) return "#84cc16"; // Vert-jaune pour progression bonne
		if (progress >= 40) return "#eab308"; // Jaune pour progression moyenne
		if (progress >= 20) return "#f97316"; // Orange pour progression faible
		return "#ef4444"; // Rouge pour progression très faible
	};

	return (
		<Card className="col-span-2">
			<CardHeader>
				<CardTitle className="text-lg flex items-center">
					<TrendingUp className="w-5 h-5 mr-2 text-wisetwin-blue" />
					Progression des formations
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="h-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
				) : chartData.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={chartData}
							margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								opacity={0.2}
							/>
							<XAxis
								dataKey="name"
								angle={-45}
								textAnchor="end"
								height={80}
								tick={{ fontSize: 12 }}
							/>
							<YAxis domain={[0, 100]} />
							<Tooltip
								formatter={(value) => [
									`${value}%`,
									"Progression",
								]}
								labelFormatter={(label) =>
									`Formation: ${label}`
								}
							/>
							<Bar
								dataKey="progress"
								name="Progression (%)"
								radius={[4, 4, 0, 0]} // Coins arrondis pour les barres
								barSize={30} // Ajuste la largeur des barres
								maxBarSize={40} // Limite la taille maximale des barres
							>
								{chartData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={getBarColor(entry.progress)}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-72 text-gray-500">
						Aucune donnée disponible pour le graphique
					</div>
				)}
			</CardContent>
		</Card>
	);
}
