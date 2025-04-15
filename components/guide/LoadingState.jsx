import React from "react";

export default function LoadingState() {
	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4"></div>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-6">
				<div className="animate-pulse">
					<div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
				</div>
				<div className="animate-pulse">
					<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
				</div>
			</div>
		</div>
	);
}
