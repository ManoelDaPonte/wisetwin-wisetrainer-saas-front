//components/overview/achievements/AchievementsPromotionBanner.jsx
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AchievementsPromotionBanner() {
	const router = useRouter();

	return (
		<div className="mt-8 text-center bg-wisetwin-blue/5 dark:bg-wisetwin-blue/10 rounded-lg p-6">
			<h3 className="text-lg font-medium mb-2">
				Progressez, apprenez et débloquez davantage
			</h3>
			<p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
				Complétez des formations et relevez de nouveaux défis pour
				débloquer toutes les réalisations.
			</p>
			<Button
				onClick={() => router.push("/wisetrainer")}
				className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
			>
				Explorer de nouvelles formations
			</Button>
		</div>
	);
}
