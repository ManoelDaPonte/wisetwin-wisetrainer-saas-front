// app/(app)/wisetrainer/page.jsx
"use client";
import React from "react";
import WiseTrainerCourses from "@/components/wisetrainer/WiseTrainerCourses";

export default function WiseTrainerPage() {
	return (
		<div className="container mx-auto py-8">
			<WiseTrainerCourses />
		</div>
	);
}
