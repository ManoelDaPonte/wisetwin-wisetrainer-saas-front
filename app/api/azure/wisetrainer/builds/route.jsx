// app/api/azure/wisetrainer/builds/route.js
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import scenarios from "@/lib/config/wisetrainer/scenarios.json";

export async function GET() {
	try {
		// Récupérer les formations disponibles depuis la configuration
		const availableBuilds = scenarios.courses.map((course) => ({
			id: course.id,
			name: course.name,
			description: course.description,
			imageUrl:
				course.imageUrl || "/images/wisetrainer/training-default.jpg",
			category: course.category,
			difficulty: course.difficulty,
			duration: course.duration,
			modules: course.modules,
		}));

		return NextResponse.json({ builds: availableBuilds });
	} catch (error) {
		console.error("Error fetching available builds:", error);
		return NextResponse.json(
			{ error: "Failed to fetch available builds" },
			{ status: 500 }
		);
	}
}
