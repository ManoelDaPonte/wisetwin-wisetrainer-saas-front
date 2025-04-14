import React from "react";
import OrganizationTrainingPanel from "./OrganizationTrainingPanel";

export default function OrganizationsSection({ organizationsData = [] }) {
	if (!organizationsData || organizationsData.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6">
			{organizationsData.map((orgData) => (
				<OrganizationTrainingPanel
					key={orgData.organization.id}
					organization={orgData.organization}
					taggedTrainings={orgData.taggedTrainings}
					organizationTrainings={orgData.orgTrainings}
					hasCompletedTaggedTrainings={
						orgData.hasCompletedTaggedTrainings
					}
				/>
			))}
		</div>
	);
}
