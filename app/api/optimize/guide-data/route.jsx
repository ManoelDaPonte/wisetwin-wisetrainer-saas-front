//app/api/optimize/guide-data/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";
import { BlobServiceClient } from "@azure/storage-blob";

const prisma = new PrismaClient();

/**
 * API optimisée qui combine tous les appels nécessaires à la page guide
 * Remplace plusieurs appels par un seul appel API
 */
export async function GET() {
	try {
		// Vérifier l'authentification
		const session = await auth0.getSession();
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const { sub, email } = session.user;

		// Récupérer l'utilisateur
		const user = await prisma.user.findUnique({
			where: {
				auth0Id: sub,
			},
			select: {
				id: true,
				name: true,
				email: true,
				azureContainer: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// 1. Récupérer les organisations de l'utilisateur
		const userOrganizations = await prisma.organizationMember.findMany({
			where: {
				userId: user.id,
			},
			include: {
				organization: true,
			},
		});

		// Transformer les données des organisations
		const organizations = userOrganizations.map((membership) => ({
			id: membership.organization.id,
			name: membership.organization.name,
			description: membership.organization.description,
			logoUrl: membership.organization.logoUrl,
			azureContainer: membership.organization.azureContainer,
			createdAt: membership.organization.createdAt,
			role: membership.role,
		}));

		// Résultat final
		const result = {
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				containerName: user.azureContainer,
			},
			organizations: [],
		};

		// 2. Pour chaque organisation, récupérer les données
		for (const org of organizations) {
			try {
				// 2.1 Récupérer les membres de l'organisation
				const members = await prisma.organizationMember.findMany({
					where: {
						organizationId: org.id,
					},
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								azureContainer: true,
							},
						},
					},
				});

				// 2.2 Récupérer tous les tags de l'organisation
				const allTags = await prisma.organizationTag.findMany({
					where: {
						organizationId: org.id,
					},
				});

				// 2.3 Récupérer les tags de l'utilisateur courant pour cette organisation
				const userTags = await prisma.userTag.findMany({
					where: {
						userId: user.id,
						tag: {
							organizationId: org.id,
						},
					},
					include: {
						tag: true,
					},
				});

				// 2.4 Récupérer les builds de l'organisation
				let builds = [];
				try {
					// Récupérer les builds depuis Azure si le container existe
					if (org.azureContainer) {
						const blobServiceClient =
							BlobServiceClient.fromConnectionString(
								process.env.AZURE_STORAGE_CONNECTION_STRING
							);
						const containerClient =
							blobServiceClient.getContainerClient(
								org.azureContainer
							);

						// Vérifier si le container existe
						const containerExists = await containerClient.exists();

						if (containerExists) {
							// Récupérer tous les blobs avec le préfixe wisetrainer/
							console.log(
								`${builds.length} blobs trouvés dans ${org.azureContainer}`
							);
							const blobsIterator =
								containerClient.listBlobsByHierarchy("/", {
									prefix: "wisetrainer/",
								});

							for await (const blob of blobsIterator) {
								if (blob.kind === "prefix") {
									// C'est un dossier, récupérer le nom du build
									const buildFolder = blob.name;
									const buildId = buildFolder
										.replace("wisetrainer/", "")
										.replace("/", "");

									// Vérifier si le blob de configuration existe
									const configBlobClient =
										containerClient.getBlobClient(
											`${buildFolder}config.json`
										);
									const configExists =
										await configBlobClient.exists();

									if (configExists) {
										// Récupérer les détails de la formation
										try {
											const courseDetails =
												await prisma.course.findFirst({
													where: {
														courseId: buildId,
														sourceType:
															"organization",
														sourceOrganizationId:
															org.id,
													},
												});

											builds.push({
												id: buildId,
												name:
													courseDetails?.name ||
													buildId,
												description:
													courseDetails?.description ||
													"",
												imageUrl:
													courseDetails?.imageUrl ||
													"",
												category:
													courseDetails?.category ||
													"Formation",
												lastModified:
													new Date().toISOString(),
											});
										} catch (error) {
											console.warn(
												`Erreur lors de la récupération des détails pour ${buildId}:`,
												error
											);

											// Ajouter quand même le build avec des infos minimales
											builds.push({
												id: buildId,
												name: buildId.replace(
													/-/g,
													" "
												),
												description: "",
												imageUrl: "",
												category: "Formation",
												lastModified:
													new Date().toISOString(),
											});
										}
									}
								}
							}
						}
					}

					// Si les builds ont été récupérés depuis Azure, récupérer les tags associés
					if (builds.length > 0) {
						// Récupérer toutes les associations tag-training pour cette organisation
						for (const build of builds) {
							// Vérifier si ce cours existe dans la base de données
							const course = await prisma.course.findFirst({
								where: {
									courseId: build.id,
									sourceType: "organization",
									sourceOrganizationId: org.id,
								},
							});

							if (course) {
								// Récupérer les tags associés à ce cours
								const tagTrainings =
									await prisma.tagTraining.findMany({
										where: {
											courseId: course.id,
											tag: {
												organizationId: org.id,
											},
										},
										include: {
											tag: true,
										},
									});

								// Ajouter les tags au build
								build.tags = tagTrainings.map((tt) => ({
									id: tt.tag.id,
									name: tt.tag.name,
									color: tt.tag.color || "#3B82F6",
								}));
							} else {
								build.tags = [];
							}
						}
					}
				} catch (error) {
					console.error(
						`Erreur lors de la récupération des builds pour l'organisation ${org.id}:`,
						error
					);
					builds = [];
				}

				// 2.5 Ajouter les données enrichies à l'organisation
				result.organizations.push({
					...org,
					members: members.map((member) => ({
						id: member.user.id,
						name: member.user.name,
						email: member.user.email,
						containerName: member.user.azureContainer,
						role: member.role,
					})),
					tags: allTags.map((tag) => ({
						id: tag.id,
						name: tag.name,
						color: tag.color || "#3B82F6",
					})),
					userTags: userTags.map((ut) => ({
						id: ut.tag.id,
						name: ut.tag.name,
						color: ut.tag.color || "#3B82F6",
						organizationName: org.name,
						organizationId: org.id,
					})),
					builds: builds,
				});
			} catch (error) {
				console.error(
					`Erreur lors du traitement de l'organisation ${org.id}:`,
					error
				);
				// Ajouter l'organisation avec des données minimales
				result.organizations.push({
					...org,
					members: [],
					tags: [],
					userTags: [],
					builds: [],
				});
			}
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des données du guide:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des données du guide",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
