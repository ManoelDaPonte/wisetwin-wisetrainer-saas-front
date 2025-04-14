import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function StatCard({ title, icon, children, className = "" }) {
	return (
		<Card className={`hover:shadow-md transition-shadow ${className}`}>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
