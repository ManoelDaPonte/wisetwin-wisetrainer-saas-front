"use client";
import React from "react";
import { useParams } from "next/navigation";
import CourseDetail from "@/components/wisetrainer/CourseDetail";

export default function CourseDetailPage() {
	const params = useParams();

	return <CourseDetail params={params} />;
}
