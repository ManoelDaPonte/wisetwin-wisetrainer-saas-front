# Nouvelle Architecture pour WiseTwin/WiseTrainer

Cette documentation présente la nouvelle architecture centralisée pour les hooks, les services et la gestion d'état de l'application WiseTwin/WiseTrainer.

## Objectifs

- Centraliser la gestion des données et réduire les requêtes redondantes
- Mettre en place un système de cache cohérent et efficace
- Partager facilement les données entre les composants
- Faciliter la maintenance et l'extension de l'application

## Structure des dossiers

```
newlib/
  ├── services/          # Couche de services (API, etc.)
  │   └── api/           # Services API centralisés
  │       ├── userApi.js           # API pour les utilisateurs
  │       ├── organizationApi.js   # API pour les organisations
  │       ├── courseApi.js         # API pour les cours et formations
  │       └── index.js             # Point d'entrée unifié
  │
  ├── utils/             # Utilitaires partagés
  │   └── cache.js       # Système de cache unifié
  │
  ├── store/             # Gestion d'état centralisée (Zustand)
  │   ├── userStore.js           # Store pour les utilisateurs
  │   ├── organizationStore.js   # Store pour les organisations
  │   └── courseStore.js         # Store pour les cours et formations
  │
  ├── hooks/             # Hooks composables réutilisables
  │   ├── useUser.js               # Hook pour l'utilisateur
  │   ├── useUserStats.js          # Hook pour les statistiques
  │   ├── useAuth.js               # Hook pour l'authentification
  │   ├── useOrganization.js       # Hook pour les organisations
  │   ├── useOrganizationMembers.js # Hook pour les membres
  │   ├── useOrganizationTags.js   # Hook pour les tags
  │   ├── useOrganizationBuilds.js # Hook pour les builds/formations
  │   ├── useCourses.js            # Hook pour les formations utilisateur
  │   ├── useCourse.js             # Hook pour un cours spécifique
  │   ├── useScenario.js           # Hook pour un scénario de cours
  │   └── useGuideData.js          # Hook pour la page guide
  │
  └── components/        # Composants utilitaires pour l'architecture
      └── ZustandInitializer.jsx   # Initialisation des stores Zustand
```

## Couches de l'architecture

### 1. Services API

Les services API constituent le point d'entrée unique vers les API backend. Ils sont responsables de :
- Effectuer les requêtes HTTP
- Gérer les erreurs de manière cohérente
- Normaliser les réponses

Exemple d'utilisation :
```javascript
import { api } from '@/newlib/services/api';

// Appeler une API utilisateur
const userData = await api.user.getProfile();

// Appeler une API organisation
const organizations = await api.organization.getUserOrganizations();

// Appeler une API cours
const courses = await api.course.getUserCourses(containerName);
```

### 2. Gestion d'état (Zustand)

La gestion d'état est centralisée avec Zustand, offrant :
- Un état global accessible partout
- Des actions pour modifier l'état
- Une intégration facile avec React

Exemple d'utilisation directe :
```javascript
import { useUserStore } from '@/newlib/store/userStore';
import { useOrganizationStore } from '@/newlib/store/organizationStore';
import { useCourseStore } from '@/newlib/store/courseStore';

function MyComponent() {
  const { user } = useUserStore();
  const { organizations } = useOrganizationStore();
  const { userCourses } = useCourseStore();
  
  // ...
}
```

### 3. Système de cache

Un service de cache unifié pour toute l'application :
- TTL (Time-To-Live) configurable par type de données
- Invalidation ciblée
- Optimisation des performances

```javascript
import cacheManager from '@/newlib/utils/cache';

// Mettre en cache des données
cacheManager.set('myKey', myData);

// Récupérer des données du cache (avec TTL de 5 minutes)
const data = cacheManager.get('myKey', 5 * 60 * 1000);

// Invalider une entrée du cache
cacheManager.invalidate('myKey');

// Invalider plusieurs entrées par préfixe
cacheManager.invalidateByPrefix('user_');
```

### 4. Hooks composables

Des hooks React qui encapsulent la logique d'état :
- Interface simple pour les composants
- Logique réutilisable
- Séparation des préoccupations

Exemple d'utilisation :
```javascript
import { useUser, useOrganization, useCourses } from '@/newlib/hooks';

function OrganizationPage() {
  // Hook pour les données utilisateur
  const { user } = useUser();
  
  // Hook pour les données organisation
  const { currentOrganization, orgName, isAdmin } = useOrganization({ 
    organizationId: 'my-org-id' 
  });
  
  // Hook pour les formations
  const { courses, refreshCourses } = useCourses();
  
  // ...
}
```

### 5. Initialiseur Zustand

Un composant léger qui initialise les stores Zustand au démarrage de l'application, sans ajouter de contextes supplémentaires :
- Pas de hiérarchie de contextes à gérer
- Pas de re-rendus inutiles des composants parents
- Initialisation automatique des données

```jsx
// Dans le layout racine
import { ZustandInitializer } from '@/newlib/components';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <ZustandInitializer>
            {children}
          </ZustandInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Hooks disponibles

### Utilisateur

- **useUser** - Gestion des données utilisateur
  ```javascript
  const { user, updateProfile, isAuthenticated } = useUser();
  ```

- **useUserStats** - Statistiques de l'utilisateur
  ```javascript
  const { stats, averageScore, formattedTimeSpent } = useUserStats();
  ```

- **useAuth** - Authentification et protection de routes
  ```javascript
  const { isAuthenticated, logout } = useAuth({ requireAuth: true });
  ```

### Organisation

- **useOrganization** - Gestion des organisations
  ```javascript
  const { 
    organizations, 
    currentOrganization,
    orgName,
    isAdmin,
    createOrganization
  } = useOrganization();
  ```

- **useOrganizationMembers** - Gestion des membres
  ```javascript
  const { 
    members, 
    totalMembers,
    inviteMember,
    deleteMember
  } = useOrganizationMembers();
  ```

- **useOrganizationTags** - Gestion des tags
  ```javascript
  const { 
    tags, 
    addTag,
    searchTags
  } = useOrganizationTags();
  ```

- **useOrganizationInvitations** - Gestion des invitations
  ```javascript
  const { 
    invitations, 
    pendingInvitations,
    invite,
    cancelInvite,
    resendInvite
  } = useOrganizationInvitations();
  ```

- **useOrganizationBuilds** - Gestion des builds/formations
  ```javascript
  const { 
    builds, 
    wiseTwinBuilds,
    wiseTrainerBuilds,
    searchBuilds
  } = useOrganizationBuilds({ type: 'all' });
  ```

### Cours et Formations

- **useCourses** - Gestion des formations de l'utilisateur
  ```javascript
  const {
    courses,
    isLoading,
    hasAnyCourse,
    refreshCourses,
    ensureCourses
  } = useCourses({ autoLoad: true });
  ```

- **useCourse** - Gestion d'un cours spécifique
  ```javascript
  const {
    course,
    isEnrolled,
    progress,
    completedModules,
    totalModules,
    enroll,
    unenroll,
    updateProgress
  } = useCourse({ courseId: 'course-123', organizationId: 'org-456' });
  ```

- **useScenario** - Gestion d'un scénario de cours
  ```javascript
  const {
    scenario,
    questions,
    submitAnswers,
    formatQuestion
  } = useScenario({ courseId: 'course-123', scenarioId: 'scenario-456' });
  ```

### Hooks de page

- **useGuideData** - Données pour la page guide
  ```javascript
  const {
    organizationsData,
    trainings,
    hasOrganizations,
    hasAnyTraining,
    refreshData
  } = useGuideData();
  ```

## Exemples d'utilisation

### Page Guide refactorisée

Exemple d'utilisation du hook `useGuideData` pour la page guide :

```jsx
function GuidePage() {
  const {
    organizationsData,
    trainings: currentTrainings,
    isLoading,
    error,
    refreshData,
    hasOrganizations,
    hasAnyTraining
  } = useGuideData();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div>
      <h1>Guide de démarrage</h1>
      
      {/* Afficher les formations actuelles */}
      <CurrentTrainingsPanel trainings={currentTrainings} />
      
      {/* Afficher les organisations et leurs formations */}
      <OrganizationsSection organizationsData={organizationsData} />
      
      {/* Gestion des cas particuliers */}
      {!hasOrganizations && <NoOrganizationGuide />}
      {!hasAnyTraining && <NoTrainingsMessage />}
    </div>
  );
}
```

### Page détail d'un cours

Exemple d'utilisation du hook `useCourse` :

```jsx
function CourseDetailPage({ courseId, organizationId }) {
  const {
    course,
    isEnrolled,
    progress,
    completedModules,
    totalModules,
    enroll,
    unenroll
  } = useCourse({ courseId, organizationId });

  if (!course) {
    return <div>Chargement du cours...</div>;
  }

  return (
    <div>
      <h1>{course.name}</h1>
      <p>{course.description}</p>
      
      {isEnrolled ? (
        <>
          <div>Progression: {progress}%</div>
          <div>Modules complétés: {completedModules}/{totalModules}</div>
          <button onClick={() => unenroll()}>Se désinscrire</button>
        </>
      ) : (
        <button onClick={() => enroll()}>S'inscrire</button>
      )}
    </div>
  );
}
```

## Comment utiliser cette nouvelle architecture

Pour utiliser cette nouvelle architecture dans vos composants :

1. Importez les hooks depuis `@/newlib/hooks` :
```javascript
import { useUser, useOrganization, useCourses } from '@/newlib/hooks';
```

2. Utilisez les hooks dans vos composants :
```javascript
function MyPage() {
  const { user } = useUser();
  const { organizations } = useOrganization();
  const { courses } = useCourses();
  
  // ...
}
```

3. Pour protéger une route, utilisez `useAuth` :
```javascript
function ProtectedPage() {
  const { isAuthenticated } = useAuth({ requireAuth: true });
  
  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }
  
  return <YourComponent />;
}
```

4. Pour intégrer l'initialisation Zustand dans votre application :
```javascript
// Dans app/layout.jsx ou équivalent
import { ZustandInitializer } from '@/newlib/components';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ZustandInitializer>
          {children}
        </ZustandInitializer>
      </body>
    </html>
  );
}
```

## Migration et prochaines étapes

1. Commencez par intégrer le `ZustandInitializer` dans votre layout principal
2. Remplacez progressivement les hooks existants par les nouveaux hooks centralisés
3. Pour les pages complexes comme Guide, utilisez les hooks spécifiques comme `useGuideData`
4. Ajoutez des tests unitaires pour chaque couche (API, stores, hooks)

## Avantages par rapport à Context API

Cette architecture basée sur Zustand offre plusieurs avantages par rapport à l'utilisation traditionnelle de Context API :

1. **Performance** - Zustand ne provoque pas de re-rendus inutiles contrairement à Context API
2. **Simplicité** - Pas besoin de wrapper les composants dans des Providers
3. **Composabilité** - Les hooks peuvent être combinés facilement sans créer de "provider hell"
4. **Débogage** - État plus facile à inspecter et à comprendre
5. **Mise à jour sélective** - Seuls les composants qui utilisent les données spécifiques sont mis à jour

## Conseils pour éviter les boucles infinies

Lors de l'utilisation des hooks Zustand, il est important de suivre ces bonnes pratiques pour éviter les boucles infinies :

1. Toujours utiliser des sélecteurs individuels pour chaque propriété de state :
   ```javascript
   // CORRECT ✅
   const user = useUserStore(state => state.user);
   const isLoading = useUserStore(state => state.isLoading);
   
   // INCORRECT ❌ (crée un nouvel objet à chaque rendu)
   const { user, isLoading } = useUserStore(state => ({
     user: state.user,
     isLoading: state.isLoading
   }));
   ```

2. Utiliser useRef pour suivre les états précédents sans provoquer de re-rendus
3. Limiter les dépendances dans les useEffect qui modifient l'état