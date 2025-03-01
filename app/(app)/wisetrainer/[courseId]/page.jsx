// app/(app)/wisetrainer/[courseId]/page.jsx
"use client";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import CourseDetail from "@/components/wisetrainer/CourseDetail";
import { UserMetadataProvider } from "@/context/UserMetadataContext";

export default function CourseDetailPage() {
	const params = useParams();

	return <CourseDetail params={params} />;
}
