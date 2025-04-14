//components/wisetwin/catalog/BuildsLoading.jsx

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const BuildsLoading = ({ count = 2 }) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i} className="h-full" noPaddingTop>
					<div className="animate-pulse">
						<div className="h-52 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
						<CardHeader>
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 mt-6"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
						</CardHeader>
						<CardContent>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 mt-4"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
							<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mt-6"></div>
						</CardContent>
					</div>
				</Card>
			))}
		</div>
	);
};

export default BuildsLoading;
