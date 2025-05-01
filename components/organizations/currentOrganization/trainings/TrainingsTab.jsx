//components/organizations/currentOrganization/trainings/TrainingsTab.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import TrainingsTable from "./TrainingsTable";
import { useCurrentOrganizationTrainings } from "@/lib/hooks/organizations/currentOrganization/useCurrentOrganizationTrainings";

export default function TrainingsTab({ organization }) {
	const { trainings, isLoading, fetchTrainings } =
		useCurrentOrganizationTrainings(organization.id);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Formations disponibles</CardTitle>
					<CardDescription>
						Liste des formations disponibles pour votre organisation
					</CardDescription>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={fetchTrainings}
						disabled={isLoading}
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${
								isLoading ? "animate-spin" : ""
							}`}
						/>
						Actualiser
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<TrainingsTable
					trainings={trainings}
					isLoading={isLoading}
					currentUserRole={organization.userRole}
				/>
			</CardContent>
		</Card>
	);
}
