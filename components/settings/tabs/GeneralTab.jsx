// components/settings/GeneralTab.jsx

import React from "react";
import { useState } from "react";
import axios from "axios";
import { useUserMetadata } from "@/context/UserMetadataContext";
import { Button } from "@/components/ui/button";
import { Trash, RefreshCw } from "lucide-react";

// Modifier le composant
const GeneralTab = () => {
	const { metadata } = useUserMetadata();
	const [isCleaning, setIsCleaning] = useState(false);
	const [cleanupResult, setCleanupResult] = useState(null);

	const handleCleanupProjects = async () => {
		if (!metadata?.azure_container_name) {
			alert("User information not available. Please try again later.");
			return;
		}

		if (!confirm("This will clean up orphaned project files. Continue?")) {
			return;
		}

		setIsCleaning(true);
		setCleanupResult(null);

		try {
			const response = await axios.post(
				`/api/maintenance/cleanup-projects/${metadata.azure_container_name}`
			);

			setCleanupResult({
				success: true,
				deleted: response.data.deleted,
				failed: response.data.failed,
			});

			alert(
				`Cleanup completed. ${response.data.deleted.length} files removed.`
			);
		} catch (error) {
			console.error("Error cleaning up projects:", error);
			setCleanupResult({
				success: false,
				error: error.response?.data?.error || "Error during cleanup",
			});

			alert("Failed to clean up projects. Please try again.");
		} finally {
			setIsCleaning(false);
		}
	};

	return (
		<div>
			<h3 className="text-md font-medium mb-4">General</h3>
			<div className="space-y-4">
				<div className="flex justify-between items-center py-2">
					<span>Theme</span>
					<select className="border rounded p-1">
						<option>System</option>
						<option>Light</option>
						<option>Dark</option>
					</select>
				</div>

				<div className="border-t pt-4">
					<h4 className="font-medium mb-2">Maintenance</h4>
					<Button
						variant="outline"
						size="sm"
						className="flex items-center"
						onClick={handleCleanupProjects}
						disabled={isCleaning}
					>
						{isCleaning ? (
							<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Trash className="h-4 w-4 mr-2" />
						)}
						{isCleaning ? "Cleaning..." : "Clean Up Orphaned Files"}
					</Button>

					{cleanupResult && (
						<div className="mt-2 text-sm">
							{cleanupResult.success ? (
								<p className="text-green-600">
									{cleanupResult.deleted.length} files removed
									successfully.
									{cleanupResult.failed.length > 0 && (
										<span className="text-amber-600 ml-1">
											{cleanupResult.failed.length} files
											failed to remove.
										</span>
									)}
								</p>
							) : (
								<p className="text-red-500">
									{cleanupResult.error}
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default GeneralTab;
