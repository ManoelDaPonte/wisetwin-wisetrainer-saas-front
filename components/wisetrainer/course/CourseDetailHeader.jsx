//components/wisetrainer/course/CourseDetailHeader.jsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Book } from "lucide-react";

export default function CourseDetailHeader({ course, userProgress }) {
	return (
		<>
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
						{course.name}
					</h1>
					<div className="flex items-center space-x-4 mb-2">
						<Badge
							variant="outline"
							className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
						>
							{course.difficulty}
						</Badge>
						<span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
							<Clock className="w-4 h-4 mr-1" />
							{course.duration}
						</span>
						<span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
							<Book className="w-4 h-4 mr-1" />
							{course.category}
						</span>
					</div>
				</div>

				{userProgress && (
					<div className="text-right">
						<span className="text-lg font-semibold">
							{userProgress.progress}% complété
						</span>
						<Progress
							value={userProgress.progress}
							className="h-2 w-32 mt-1"
						/>
					</div>
				)}
			</div>

			<p className="text-gray-600 dark:text-gray-300 mt-4">
				{course.description}
			</p>
		</>
	);
}
