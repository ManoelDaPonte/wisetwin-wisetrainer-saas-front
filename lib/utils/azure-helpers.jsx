// lib/utils/azure-helpers.js
export function generateContainerNameFromUserId(userId) {
	// Format: user-{auth0_id_without_provider}
	// Si userId est "auth0|1234567890", le résultat sera "user-1234567890"
	return `user-${userId.split("|")[1]}`;
}
