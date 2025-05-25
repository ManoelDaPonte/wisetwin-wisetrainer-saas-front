// lib/data/dashboardData.js
// Données fictives pour le tableau de bord administrateur

// Fonction pour générer des dates aléatoires dans une plage
const randomDate = (start, end) => {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	);
};

// Fonction pour générer des données temporelles réalistes avec tendance
const generateTrendData = (length, options = {}) => {
	const {
		startValue = 50, // Valeur de départ
		minChange = -5, // Changement minimum par intervalle
		maxChange = 10, // Changement maximum par intervalle
		minValue = 0, // Valeur minimum absolue
		maxValue = 100, // Valeur maximum absolue
		volatility = 0.7, // Probabilité de suivre la tendance (0-1)
		trend = 0.2, // Tendance à la hausse (+) ou à la baisse (-)
	} = options;

	const data = [];
	let currentValue = startValue;

	for (let i = 0; i < length; i++) {
		// Ajouter la valeur actuelle au tableau
		data.push(Math.round(currentValue));

		// Calculer le changement pour la prochaine valeur
		const isTrending = Math.random() < volatility;
		let change;

		if (isTrending) {
			// Suivre la tendance
			const trendDirection = trend > 0 ? 1 : -1;
			const trendMagnitude = Math.abs(trend);

			// Plus de probabilité de changement dans le sens de la tendance
			const changeMin = trendDirection > 0 ? 0 : minChange;
			const changeMax = trendDirection > 0 ? maxChange : 0;

			change = changeMin + Math.random() * (changeMax - changeMin);
			change *= 1 + trendMagnitude;
		} else {
			// Mouvement aléatoire contre la tendance
			change = minChange + Math.random() * (maxChange - minChange);
		}

		// Appliquer le changement
		currentValue += change;

		// Assurer que la valeur reste dans les limites
		currentValue = Math.max(minValue, Math.min(maxValue, currentValue));
	}

	return data;
};

// Noms fictifs pour les utilisateurs
const FIRST_NAMES = [
	"Jean",
	"Marie",
	"Pierre",
	"Sophie",
	"Thomas",
	"Émilie",
	"Luc",
	"Céline",
	"Antoine",
	"Julie",
	"Matthieu",
	"Camille",
	"Alexandre",
	"Léa",
];
const LAST_NAMES = [
	"Martin",
	"Bernard",
	"Dubois",
	"Thomas",
	"Robert",
	"Richard",
	"Petit",
	"Durand",
	"Leroy",
	"Moreau",
	"Simon",
	"Laurent",
	"Lefebvre",
	"Michel",
];

// Noms de formations fictifs
const TRAINING_NAMES = [
	"Sécurité industrielle niveau 1",
	"Manipulation d'équipements dangereux",
	"Prévention des risques chimiques",
	"Gestes et postures en milieu industriel",
	"Conduite d'engins de manutention",
	"Travail en hauteur",
	"Évacuation et secourisme",
	"Contrôle qualité en production",
	"Maintenance préventive",
];

// Noms de modules fictifs
const MODULE_NAMES = [
	"Introduction aux principes de sécurité",
	"Equipements de protection individuelle",
	"Identification des risques",
	"Procédures d'urgence",
	"Gestion des produits dangereux",
	"Techniques d'intervention",
	"Simulation d'incidents",
	"Évaluation et certification",
	"Bonnes pratiques sur site",
	"Ergonomie du poste de travail",
	"Prévention des TMS",
	"Maintenance des équipements",
];

// Types d'activités pour la timeline
const ACTIVITY_TYPES = [
	"training_started",
	"training_completed",
	"module_completed",
	"quiz_completed",
	"user_joined",
	"user_active",
];

// Générer les utilisateurs fictifs (10 utilisateurs)
const generateUsers = (count) => {
	const users = [];

	// Générer des dates cohérentes
	const today = new Date();
	const lastMonth = new Date();
	lastMonth.setMonth(lastMonth.getMonth() - 1);
	const lastYear = new Date();
	lastYear.setFullYear(lastYear.getFullYear() - 1);

	for (let i = 0; i < count; i++) {
		const firstName =
			FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
		const lastName =
			LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
		const name = `${firstName} ${lastName}`;

		// Générer une date d'inscription cohérente (entre il y a un an et il y a un mois)
		const joinedAt = randomDate(lastYear, lastMonth);

		// La dernière activité doit être après l'inscription et pas plus ancienne qu'un mois
		const lastActive = randomDate(
			new Date(Math.max(lastMonth.getTime(), joinedAt.getTime())),
			today
		);

		// Nombre de formations plus réaliste (1-3)
		const trainingCount = Math.floor(Math.random() * 3) + 1;
		const completedTrainingsCount = Math.floor(
			Math.random() * trainingCount
		);

		// Temps de formation plus réaliste (5-25h, mais corrélé au nombre de formations)
		const baseTime = 5 + trainingCount * 3;
		const trainingTime = baseTime + Math.floor(Math.random() * 10);

		const trainings = [];

		for (let j = 0; j < trainingCount; j++) {
			// Progression plus réaliste - plus de chance d'avoir des valeurs élevées pour les formations anciennes
			const daysSinceStart = Math.max(
				1,
				Math.floor((today - joinedAt) / (1000 * 60 * 60 * 24))
			);
			const progressBase = j < completedTrainingsCount ? 80 : 30;
			const progress = Math.min(
				100,
				Math.floor(progressBase + Math.random() * 20)
			);

			// Nombre de modules complétés proportionnel à la progression
			const moduleCount = Math.floor(Math.random() * 3) + 3; // 3-5 modules
			const completedModules = Math.floor((progress / 100) * moduleCount);

			// Score plus réaliste (70-100)
			const score =
				progress > 80
					? Math.floor(Math.random() * 15) + 85
					: Math.floor(Math.random() * 15) + 70;

			// Date de début cohérente (après inscription, avant dernière activité)
			const startDate = randomDate(
				joinedAt,
				new Date(lastActive.getTime() - 1000 * 60 * 60 * 24)
			);

			// Deadline future réaliste
			const deadline = new Date(startDate);
			deadline.setDate(
				deadline.getDate() + 30 + Math.floor(Math.random() * 60)
			); // 1-3 mois après le début

			trainings.push({
				id: `training-${j + 1}`,
				progress,
				completedModules,
				score,
				startDate,
				deadline,
			});
		}

		users.push({
			id: `user-${i + 1}`,
			name,
			email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
			role: "MEMBER",
			lastActive,
			joinedAt,
			trainingTime,
			completedTrainings: completedTrainingsCount,
			totalTrainings: trainingCount,
			averageScore: Math.floor(
				trainings.reduce((acc, t) => acc + (t.score || 0), 0) /
					(trainings.length || 1)
			),
			trainings,
		});
	}

	return users;
};

// Formations fictives avec des données plus réalistes
const generateTrainings = (count) => {
	const trainings = [];

	for (let i = 0; i < count; i++) {
		const name = TRAINING_NAMES[i % TRAINING_NAMES.length];

		// Entre 3 et 7 modules par formation
		const moduleCount = Math.floor(Math.random() * 5) + 3;
		const modules = [];

		// Taux de complétion global de la formation (pour cohérence avec les modules)
		const overallCompletionRate = Math.floor(Math.random() * 70) + 30; // 30% à 100%

		// Nombre d'utilisateurs inscrits à cette formation (5-10)
		const enrolledUsers = Math.floor(Math.random() * 6) + 5;

		// Score moyen plus réaliste (75-95)
		const averageScore = Math.floor(Math.random() * 20) + 75;

		for (let j = 0; j < moduleCount; j++) {
			const moduleName = MODULE_NAMES[j % MODULE_NAMES.length];

			// Pour plus de réalisme, les premiers modules ont tendance à avoir des taux de complétion plus élevés
			const moduleOrder = j + 1;
			const moduleFactor = 1 - ((moduleOrder - 1) / moduleCount) * 0.3; // Facteur qui diminue avec l'ordre

			// Taux de complétion du module (baisse progressivement pour les modules plus avancés)
			const completionRate = Math.min(
				100,
				Math.floor(overallCompletionRate * moduleFactor)
			);

			// Nombre d'utilisateurs ayant complété le module
			const completedCount = Math.floor(
				(completionRate / 100) * enrolledUsers
			);

			modules.push({
				id: `module-${i}-${j}`,
				name: moduleName,
				order: moduleOrder,
				completionRate,
				completedCount,
				totalUsers: enrolledUsers,
			});
		}

		// Problèmes potentiels plus pertinents
		const problemAreas = [];

		// Module avec le taux de complétion le plus bas
		const lowestCompletionModule = [...modules].sort(
			(a, b) => a.completionRate - b.completionRate
		)[0];
		if (
			lowestCompletionModule &&
			lowestCompletionModule.completionRate < 50
		) {
			problemAreas.push(
				`Taux de complétion faible (${lowestCompletionModule.completionRate}%) pour le module '${lowestCompletionModule.name}'`
			);
		}

		// Problème de temps si la formation est longue
		const averageTimeSpent = Math.floor(Math.random() * 10) + 3; // 3 à 12 heures
		if (averageTimeSpent > 8 && Math.random() > 0.5) {
			problemAreas.push(
				`Temps de formation supérieur à la moyenne (${averageTimeSpent}h contre 6h attendues)`
			);
		}

		// Problème de score si pertinent
		if (averageScore < 80 && Math.random() > 0.7) {
			problemAreas.push(
				`Scores moyens inférieurs à 80% (${averageScore}%), potentiellement dû à la difficulté des évaluations`
			);
		}

		trainings.push({
			id: `training-${i + 1}`,
			name,
			description: `Formation complète sur ${name.toLowerCase()} en environnement industriel.`,
			isActive: Math.random() > 0.2, // 80% de chances d'être actif
			enrolledUsers,
			completionRate: overallCompletionRate,
			averageScore,
			averageTimeSpent,
			modules,
			problemAreas,
			updatedAt: randomDate(new Date(2023, 6, 1), new Date()),
		});
	}

	return trainings;
};

// Activités fictives pour la timeline avec données plus réalistes
const generateActivities = (users, trainings, count) => {
	const activities = [];

	const today = new Date();
	const twoMonthsAgo = new Date();
	twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

	// Map pour suivre quand un utilisateur a commencé une formation
	const userTrainingStartDates = {};

	// D'abord, générer des événements de début de formation pour chaque utilisateur
	users.forEach((user) => {
		user.trainings.forEach((training) => {
			const trainingInfo = trainings.find((t) => t.id === training.id);
			if (!trainingInfo) return;

			// Date de début de la formation
			const timestamp = new Date(training.startDate);

			// Clé unique pour cette combinaison utilisateur-formation
			const key = `${user.id}-${training.id}`;
			userTrainingStartDates[key] = timestamp;

			// Créer l'événement de début de formation
			activities.push({
				id: `activity-start-${key}`,
				type: "training_started",
				title: `Formation démarrée`,
				description: `${user.name} a commencé la formation "${trainingInfo.name}"`,
				entityType: "training",
				userId: user.id,
				entityId: training.id,
				timestamp,
			});
		});
	});

	// Ensuite, générer des événements de complétion de module
	users.forEach((user) => {
		user.trainings.forEach((training) => {
			const trainingInfo = trainings.find((t) => t.id === training.id);
			if (!trainingInfo) return;

			const key = `${user.id}-${training.id}`;
			const startDate = userTrainingStartDates[key];

			if (!startDate) return;

			// Nombre de modules complétés
			const completedModulesCount = training.completedModules || 0;

			// Pour chaque module complété
			for (let i = 0; i < completedModulesCount; i++) {
				// S'assurer que nous avons le module correspondant
				if (!trainingInfo.modules[i]) continue;

				// Date de complétion du module (après la date de début, avant aujourd'hui)
				const moduleCompletionDate = new Date(startDate);
				// Ajouter un délai proportionnel à l'ordre du module
				moduleCompletionDate.setDate(
					moduleCompletionDate.getDate() +
						i * 3 +
						Math.floor(Math.random() * 5)
				);

				// Ne pas dépasser aujourd'hui
				if (moduleCompletionDate > today) continue;

				activities.push({
					id: `activity-module-${key}-${i}`,
					type: "module_completed",
					title: `Module terminé`,
					description: `${user.name} a terminé le module "${trainingInfo.modules[i].name}" de la formation "${trainingInfo.name}"`,
					entityType: "module",
					userId: user.id,
					entityId: `${training.id}-module-${i}`,
					timestamp: moduleCompletionDate,
				});

				// Si dernier module et formation complétée à 100%
				if (
					i === completedModulesCount - 1 &&
					training.progress === 100
				) {
					// Date de fin de formation (juste après le dernier module)
					const completionDate = new Date(moduleCompletionDate);
					completionDate.setDate(
						completionDate.getDate() +
							1 +
							Math.floor(Math.random() * 3)
					);

					if (completionDate <= today) {
						activities.push({
							id: `activity-complete-${key}`,
							type: "training_completed",
							title: `Formation terminée`,
							description: `${user.name} a terminé la formation "${trainingInfo.name}" avec un score de ${training.score}%`,
							entityType: "training",
							userId: user.id,
							entityId: training.id,
							timestamp: completionDate,
						});
					}
				}
			}
		});
	});

	// Ajouter quelques quiz complétés
	let quizCounter = 0;
	users.forEach((user) => {
		if (quizCounter >= count / 5) return; // Limiter le nombre de quiz

		user.trainings.forEach((training) => {
			if (Math.random() > 0.4 || quizCounter >= count / 5) return; // 40% de chance par formation

			const trainingInfo = trainings.find((t) => t.id === training.id);
			if (!trainingInfo) return;

			const key = `${user.id}-${training.id}`;
			const startDate = userTrainingStartDates[key];

			if (!startDate) return;

			// Date du quiz (après la date de début, avant aujourd'hui)
			const quizDate = new Date(startDate);
			quizDate.setDate(
				quizDate.getDate() + 2 + Math.floor(Math.random() * 14)
			);

			// Ne pas dépasser aujourd'hui
			if (quizDate > today) return;

			// Choisir un module au hasard
			const moduleIndex = Math.floor(
				Math.random() * trainingInfo.modules.length
			);
			const module = trainingInfo.modules[moduleIndex];

			activities.push({
				id: `activity-quiz-${key}-${quizCounter}`,
				type: "quiz_completed",
				title: `Quiz terminé`,
				description: `${user.name} a obtenu un score de ${
					70 + Math.floor(Math.random() * 31)
				}% au quiz du module "${module.name}"`,
				entityType: "quiz",
				userId: user.id,
				entityId: `${training.id}-quiz-${quizCounter}`,
				timestamp: quizDate,
			});

			quizCounter++;
		});
	});

	// Ajouter des activités "utilisateur actif" pour montrer des connexions récentes
	users.forEach((user) => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);

		// Entre 1 et 5 activités de connexion par utilisateur
		const connectionCount = 1 + Math.floor(Math.random() * 5);

		for (let i = 0; i < connectionCount; i++) {
			// Date aléatoire du dernier mois
			const activityDate = randomDate(lastMonth, today);

			activities.push({
				id: `activity-active-${user.id}-${i}`,
				type: "user_active",
				title: `Activité utilisateur`,
				description: `${user.name} s'est connecté et a passé ${
					Math.floor(Math.random() * 3) + 1
				}h en formation`,
				entityType: "user",
				userId: user.id,
				entityId: user.id,
				timestamp: activityDate,
			});
		}
	});

	// Ajouter quelques adhésions d'utilisateurs
	users.forEach((user) => {
		activities.push({
			id: `activity-join-${user.id}`,
			type: "user_joined",
			title: `Nouvel utilisateur`,
			description: `${user.name} a rejoint l'organisation`,
			entityType: "user",
			userId: user.id,
			entityId: user.id,
			timestamp: user.joinedAt,
		});
	});

	// Trier par date décroissante et limiter au nombre demandé
	return activities
		.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
		.slice(0, count);
};
export const getDashboardData = (organizationId, timeRange = "month") => {
	// Générer les utilisateurs et formations
	const users = generateUsers(10);
	const trainings = generateTrainings(6);

	// Filtrer les activités selon la période sélectionnée
	const now = new Date();
	let startDate;

	if (timeRange === "week") {
		startDate = new Date(now);
		startDate.setDate(startDate.getDate() - 7);
	} else if (timeRange === "month") {
		startDate = new Date(now);
		startDate.setMonth(startDate.getMonth() - 1);
	} else if (timeRange === "quarter") {
		startDate = new Date(now);
		startDate.setMonth(startDate.getMonth() - 3);
	} else {
		// year
		startDate = new Date(now);
		startDate.setFullYear(startDate.getFullYear() - 1);
	}
	// Calculer les statistiques globales
	const activeUsers = users.filter((u) => {
		const lastActiveDate = new Date(u.lastActive);
		const now = new Date();
		const diff = Math.floor((now - lastActiveDate) / (1000 * 60 * 60 * 24));

		if (timeRange === "week") return diff <= 7;
		if (timeRange === "month") return diff <= 30;
		if (timeRange === "quarter") return diff <= 90;
		return diff <= 365;
	}).length;

	let totalTrainingTime = 0;
	users.forEach((user) => {
		// Ignorer les utilisateurs sans formation
		if (user.trainings.length === 0) return;

		// Pour chaque utilisateur, calculer le temps de formation proportionnel à la période
		// En supposant une répartition uniforme du temps sur l'année
		const userJoinDate = new Date(user.joinedAt);
		const userActiveTime = Math.max(
			0,
			(now - userJoinDate) / (1000 * 60 * 60 * 24)
		); // jours actifs
		const totalDaysInPeriod = (now - startDate) / (1000 * 60 * 60 * 24); // jours dans la période

		// Proportion du temps de l'utilisateur qui tombe dans cette période
		const periodRatio = Math.min(1, totalDaysInPeriod / userActiveTime);

		// Temps proportionnel à la période
		totalTrainingTime += Math.round(user.trainingTime * periodRatio);
	});

	// Générer les activités filtrées par période
	const activities = generateActivities(users, trainings, 50).filter(
		(activity) => new Date(activity.timestamp) >= startDate
	);

	// Calculer le taux de complétion moyen
	const completionRates = trainings.map((t) => t.completionRate);
	const completionRate = Math.round(
		completionRates.reduce((sum, rate) => sum + rate, 0) /
			completionRates.length
	);

	// Calculer le score moyen
	const scores = trainings.map((t) => t.averageScore);
	const averageScore = Math.round(
		scores.reduce((sum, score) => sum + score, 0) / scores.length
	);

	// Utilisateurs les plus actifs (triés par temps de formation)
	// Filtrer d'abord les utilisateurs actifs pendant la période sélectionnée
	const periodActiveUsers = users.filter((user) => {
		const lastActiveDate = new Date(user.lastActive);
		return lastActiveDate >= startDate;
	});

	// Trier par temps de formation et prendre les 5 premiers
	const topUsers = [...periodActiveUsers]
		.sort((a, b) => b.trainingTime - a.trainingTime)
		.slice(0, 5);

	// Formations les plus populaires (triées par nombre d'inscrits)
	const topTrainings = [...trainings].sort(
		(a, b) => b.enrolledUsers - a.enrolledUsers
	);

	// Tendances (positif ou négatif)
	// Générer des tendances plus réalistes en fonction de la période
	const usersTrend =
		timeRange === "week"
			? Math.floor(Math.random() * 15) - 3 // Variation plus faible sur une semaine
			: Math.floor(Math.random() * 30) - 5; // Plus forte sur les autres périodes

	const trainingTimeTrend =
		timeRange === "week"
			? Math.floor(Math.random() * 20) - 5
			: Math.floor(Math.random() * 40) - 10;

	const completionRateTrend =
		timeRange === "week"
			? Math.floor(Math.random() * 10) - 2
			: Math.floor(Math.random() * 20) - 5;

	const averageScoreTrend =
		timeRange === "week"
			? Math.floor(Math.random() * 8) - 2
			: Math.floor(Math.random() * 15) - 5;

	// Historique pour les mini-graphiques
	const usersHistory = generateTrendData(14, {
		startValue: activeUsers - 2,
		minChange: -1,
		maxChange: 2,
		minValue: Math.max(1, activeUsers - 3),
		maxValue: activeUsers + 3,
		volatility: 0.8,
		trend: 0.3, // Tendance légèrement à la hausse pour les utilisateurs
	});

	const trainingTimeHistory = generateTrendData(14, {
		startValue: totalTrainingTime - 5,
		minChange: -2,
		maxChange: 4,
		minValue: Math.max(5, totalTrainingTime - 10),
		maxValue: totalTrainingTime + 15,
		volatility: 0.7,
		trend: 0.4, // Tendance à la hausse pour le temps de formation
	});

	const completionRateHistory = generateTrendData(14, {
		startValue: completionRate - 5,
		minChange: -3,
		maxChange: 4,
		minValue: Math.max(30, completionRate - 15),
		maxValue: Math.min(100, completionRate + 10),
		volatility: 0.6,
		trend: 0.25, // Tendance légère à la hausse pour le taux de complétion
	});

	const averageScoreHistory = generateTrendData(14, {
		startValue: averageScore - 3,
		minChange: -2,
		maxChange: 3,
		minValue: Math.max(60, averageScore - 10),
		maxValue: Math.min(100, averageScore + 5),
		volatility: 0.7,
		trend: 0.15, // Tendance très légère à la hausse pour les scores
	});

	return {
		organizationId,
		timeRange,
		users,
		trainings,
		activities,
		topUsers,
		topTrainings,

		// Statistiques principales
		activeUsers,
		totalTrainingTime,
		completionRate,
		averageScore,

		// Tendances
		usersTrend,
		trainingTimeTrend,
		completionRateTrend,
		averageScoreTrend,

		// Historique pour graphiques
		usersHistory,
		trainingTimeHistory,
		completionRateHistory,
		averageScoreHistory,
	};
};
