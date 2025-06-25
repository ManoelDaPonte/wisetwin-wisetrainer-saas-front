# Contrôles de Visibilité WiseTwin

Cette fonctionnalité permet de contrôler la visibilité des objets dans l'environnement 3D Unity via des dropdowns React.

## Fichiers ajoutés

### Configuration

- `lib/config/wisetwin/visibility-config.js` - Configuration des objets et catégories
- `lib/config/wisetwin/wisetwin.jsx` - Mise à jour avec les nouvelles features

### Composants

- `components/wisetwin/VisibilityControls.jsx` - Composant principal des contrôles
- `components/wisetwin/BuildViewer.jsx` - Intégration dans le viewer Unity

## Fonctionnalités

### 3 Catégories de contrôles

1. **OSM** - Éléments cartographiques OpenStreetMap

   - Aires piétonnes, zones piétonnes, bâtiments, côtes, forêts
   - Routes (autoroutes, primaires, résidentielles, etc.)
   - Chemins et pistes cyclables
   - Végétation et plans d'eau

2. **Zones industrielles** - Aménagement et développement

   - Nouveaux terminaux portuaires
   - Sites clés en main, zones d'aménagement futur
   - Zones décarbonation, friches en reconversion
   - Réserve foncière, projets électriques RTE

3. **Canalisations** - Réseaux techniques
   - Réseau électrique
   - Canalisation de H2, CO2
   - Canalisation de chaleur fatale

### Interface utilisateur

- **Bouton Toggle** : Affiche/masque le panneau de contrôles (icône œil, coin supérieur droit)
- **Dropdowns** : Un par catégorie avec compteur (visibles/total)
- **Actions par catégorie** :
  - "Tout" : Affiche tous les objets de la catégorie
  - "Rien" : Masque tous les objets de la catégorie
- **Réinitialiser** : Remet tous les objets en état visible

## Communication Unity

### GameObjects Unity

La communication se fait avec 3 GameObjects différents selon la catégorie :

- **OSMVisibilityManager** : Gère les éléments OSM
- **FamilyVisibilityManager** : Gère les zones industrielles
- **CanalisationsVisibilityManager** : Gère les canalisations

### Format des messages

```javascript
// OSM
sendMessage("OSMVisibilityManager", "SetVisibility", "${family}|${newValue}");

// Zones industrielles
sendMessage(
  "FamilyVisibilityManager",
  "SetVisibility",
  "${family}|${newValue}"
);

// Canalisations
sendMessage(
  "CanalisationsVisibilityManager",
  "SetVisibility",
  "${family}|${newValue}"
);
```

### Exemples

```javascript
// Masquer les bâtiments (OSM)
sendMessage("OSMVisibilityManager", "SetVisibility", "buildings|false");

// Afficher les routes primaires (OSM)
sendMessage("OSMVisibilityManager", "SetVisibility", "roads primary|true");

// Masquer les nouveaux terminaux portuaires (Zones industrielles)
sendMessage(
  "FamilyVisibilityManager",
  "SetVisibility",
  "Nouveaux terminaux portuaires|false"
);

// Afficher le réseau électrique (Canalisations)
sendMessage(
  "CanalisationsVisibilityManager",
  "SetVisibility",
  "Réseau électrique|true"
);
```

### État par défaut

- Tous les objets sont initialisés comme **visibles** (`true`) au chargement d'Unity
- L'initialisation se fait automatiquement une fois Unity chargé
- Chaque catégorie utilise son propre manager Unity

## Configuration technique

### Structure de données

```javascript
VISIBILITY_CONFIG = {
  categories: {
    osm: {
      displayName,
      description,
      unityManager: "OSMVisibilityManager",
      objects: [{ name, displayName }]
    },
    zones: {
      unityManager: "FamilyVisibilityManager",
      ...
    },
    canalisation: {
      unityManager: "CanalisationsVisibilityManager",
      ...
    }
  },
  getDefaultState: () => { ... },
  unityConfig: {
    methodName: "SetVisibility",
    formatMessage,
    getManagerForCategory
  }
}
```

### Intégration

Le composant `VisibilityControls` est intégré dans `BuildViewer` et reçoit :

- `sendMessage` : Fonction pour communiquer avec Unity
- `isUnityLoaded` : État de chargement d'Unity

Le bon manager Unity est automatiquement sélectionné selon la catégorie d'objet.

## Testing

### Test manuel depuis la console

```javascript
// Dans la console du navigateur
window.testCarousel(); // Test existant du carousel

// Test direct de visibilité par catégorie
sendMessage("OSMVisibilityManager", "SetVisibility", "buildings|false");
sendMessage(
  "FamilyVisibilityManager",
  "SetVisibility",
  "Sites clés en main|false"
);
sendMessage(
  "CanalisationsVisibilityManager",
  "SetVisibility",
  "Réseau électrique|false"
);
```

## Personnalisation

Pour ajouter de nouveaux objets, modifier `lib/config/wisetwin/visibility-config.js` :

```javascript
// Ajouter dans une catégorie existante
objects: [
  // ... objets existants
  { name: "nouvel-objet", displayName: "Nouvel Objet" }
]

// Ou créer une nouvelle catégorie
categories: {
  // ... catégories existantes
  nouvelle_categorie: {
    displayName: "Nouvelle Catégorie",
    description: "Description de la catégorie",
    unityManager: "NouveauManager", // Nouveau GameObject Unity
    objects: [...]
  }
}
```

## Architecture Unity requise

Côté Unity, vous devez avoir 3 GameObjects avec le script approprié :

```csharp
// Exemple pour OSMVisibilityManager
public class OSMVisibilityManager : MonoBehaviour {
    public void SetVisibility(string message) {
        string[] parts = message.Split('|');
        string familyName = parts[0];
        bool isVisible = bool.Parse(parts[1]);
        // Logique pour afficher/masquer la famille d'objets OSM
    }
}
```

## Notes techniques

- Les contrôles sont positionnés en overlay sur l'environnement Unity
- Responsive avec max-height pour éviter le débordement
- État de visibilité synchronisé entre React et Unity
- Logs détaillés pour le debugging incluant le nom du manager
- Compatible mode sombre/clair
- Architecture modulaire permettant d'ajouter facilement de nouveaux managers Unity
