// app/(app)/wisetrainer/[orgId]/[courseId]/page.jsx
"use client";
import React from "react";
import { useParams } from "next/navigation";
import CourseDetail from "@/components/wisetrainer/CourseDetail";

export default function OrganizationCourseDetailPage() {
	const params = useParams();

	return <CourseDetail params={params} />;
}
