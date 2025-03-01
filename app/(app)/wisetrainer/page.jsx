// app/(app)/wisetrainer/page.jsx
"use client";
import React from "react";
import WiseTrainerProjects from "@/components/wisetrainer/WiseTrainerProjects";

export default function WiseTrainerPage() {
	return (
		<div className="container mx-auto py-8">
			<WiseTrainerProjects />
		</div>
	);
}
