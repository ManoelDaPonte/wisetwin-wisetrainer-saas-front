// lib/config/wisetwin/visibility-config.js

export const VISIBILITY_CONFIG = {
  // Catégories d'objets avec leurs noms pour Unity
  categories: {
    // osm: {
    //   displayName: "OSM",
    //   description: "Éléments cartographiques OpenStreetMap",
    //   unityManager: "OSMVisibilityManager",
    //   objects: [
    //     { name: "areas footway", displayName: "Aires piétonnes" },
    //     { name: "areas pedestrian", displayName: "Zones piétonnes" },
    //     { name: "areas service", displayName: "Aires de service" },
    //     { name: "areas steps", displayName: "Escaliers (aires)" },
    //     { name: "buildings", displayName: "Bâtiments" },
    //     { name: "coastlines", displayName: "Côtes" },
    //     { name: "forest", displayName: "Forêts" },
    //     { name: "paths bridleway", displayName: "Chemins cavaliers" },
    //     { name: "paths cycleway", displayName: "Pistes cyclables" },
    //     { name: "paths footway", displayName: "Chemins piétons" },
    //     { name: "paths steps", displayName: "Escaliers (chemins)" },
    //     { name: "roads motorway", displayName: "Autoroutes" },
    //     { name: "roads other", displayName: "Autres routes" },
    //     { name: "roads pedestrian", displayName: "Routes piétonnes" },
    //     { name: "roads primary", displayName: "Routes primaires" },
    //     { name: "roads residential", displayName: "Routes résidentielles" },
    //     { name: "roads secondary", displayName: "Routes secondaires" },
    //     { name: "roads service", displayName: "Voies de service" },
    //     { name: "roads tertiary", displayName: "Routes tertiaires" },
    //     { name: "roads track", displayName: "Pistes" },
    //     { name: "roads trunk", displayName: "Routes nationales" },
    //     { name: "roads unclassified", displayName: "Routes non classées" },
    //     { name: "vegetation", displayName: "Végétation" },
    //     { name: "water", displayName: "Plans d'eau" },
    //   ],
    // },

    zones: {
      displayName: "Zones industrielles",
      description: "Zones d'aménagement et développement industriel",
      unityManager: "FamilyVisibilityManager",
      objects: [
        {
          name: "Nouveaux terminaux portuaires",
          displayName: "Nouveaux terminaux portuaires",
        },
        { name: "Sites clés en main", displayName: "Sites clés en main" },
        {
          name: "Zones d'aménagement futur",
          displayName: "Zones d'aménagement futur",
        },
        {
          name: "Zones décarbonation de l'industrie",
          displayName: "Zones décarbonation de l'industrie",
        },
        {
          name: "Friches en reconversión",
          displayName: "Friches en reconversion",
        },
        {
          name: "Solutions de report mundial",
          displayName: "Solutions de report modal",
        },
        {
          name: "Schéma Directeur du Patrimoine Naturel (SDPN)",
          displayName: "Schéma Directeur du Patrimoine Naturel (SDPN)",
        },
        {
          name: "Zones énergie bas carbone",
          displayName: "Zones énergie bas carbone",
        },
        {
          name: "Réserve foncière industrialo-portuaire",
          displayName: "Réserve foncière industrialo-portuaire",
        },
        {
          name: "Projets postes électriques RTE",
          displayName: "Projets postes électriques RTE",
        },
        { name: "Aménagement paysager", displayName: "Aménagement paysager" },
      ],
    },

    canalisation: {
      displayName: "Canalisations",
      description: "Réseaux et canalisations techniques",
      unityManager: "CanalisationsVisibilityManager",
      objects: [
        { name: "Réseau électrique", displayName: "Réseau électrique" },
        { name: "Canalisation de H2", displayName: "Canalisation de H2" },
        { name: "Canalisation de CO2", displayName: "Canalisation de CO2" },
        {
          name: "Canalisation de chaleur fatale",
          displayName: "Canalisation de chaleur fatale",
        },
      ],
    },
  },

  // État par défaut - tous les objets sont désactivés
  getDefaultState: () => {
    const state = {};

    Object.keys(VISIBILITY_CONFIG.categories).forEach((categoryKey) => {
      state[categoryKey] = {};
      VISIBILITY_CONFIG.categories[categoryKey].objects.forEach((obj) => {
        state[categoryKey][obj.name] = false; // Désactivé par défaut
      });
    });

    return state;
  },

  // Configuration Unity mise à jour
  unityConfig: {
    methodName: "SetVisibility",
    // Format: ${family}|${newValue} (true/false) - le manager est maintenant spécifique à chaque catégorie
    formatMessage: (family, visible) => `${family}|${visible}`,
    // Fonction pour obtenir le bon manager selon la catégorie
    getManagerForCategory: (categoryKey) => {
      return (
        VISIBILITY_CONFIG.categories[categoryKey]?.unityManager ||
        "FamilyVisibilityManager"
      );
    },
  },
};

export default VISIBILITY_CONFIG;
