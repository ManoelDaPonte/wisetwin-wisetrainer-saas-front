// components/wisetrainer/formation/FormationTabs.jsx
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Book, FileText, Box, Info } from "lucide-react";
import OverviewContent from "@/components/wisetrainer/formation/content/OverviewContent";

const FormationTabs = ({ formation }) => {
	const [activeTab, setActiveTab] = useState("overview");

	if (!formation) return null;

	return (
		<Tabs
			defaultValue="overview"
			value={activeTab}
			onValueChange={setActiveTab}
			className="w-full"
		>
			<TabsList className="mb-8">
				<TabsTrigger value="overview" className="flex items-center">
					<Info className="mr-2 h-4 w-4" />
					Vue d'ensemble
				</TabsTrigger>

				{formation.components.hasDocumentation && (
					<TabsTrigger
						value="documentation"
						className="flex items-center"
					>
						<FileText className="mr-2 h-4 w-4" />
						Documentation
					</TabsTrigger>
				)}

				{formation.components.hasCourses && (
					<TabsTrigger value="courses" className="flex items-center">
						<Book className="mr-2 h-4 w-4" />
						Cours théoriques
					</TabsTrigger>
				)}

				{formation.components.hasBuilds3D && (
					<TabsTrigger value="builds3d" className="flex items-center">
						<Box className="mr-2 h-4 w-4" />
						Environnements 3D
					</TabsTrigger>
				)}
			</TabsList>

			<TabsContent value="overview">
				<OverviewContent formation={formation} />
			</TabsContent>

			<TabsContent value="documentation">
				<div className="text-center py-12 text-gray-500">
					Contenu de documentation en cours de développement...
				</div>
			</TabsContent>

			<TabsContent value="courses">
				<div className="text-center py-12 text-gray-500">
					Contenu des cours en cours de développement...
				</div>
			</TabsContent>

			<TabsContent value="builds3d">
				<div className="text-center py-12 text-gray-500">
					Contenu des environnements 3D en cours de développement...
				</div>
			</TabsContent>
		</Tabs>
	);
};

export default FormationTabs;
