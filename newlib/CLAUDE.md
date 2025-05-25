# Documentation newlib - Architecture moderne avec Zustand et hooks contextuels

## Vue d'ensemble

Le dossier `newlib/` contient la nouvelle architecture de l'application basée sur :
- **Zustand** pour la gestion d'état
- **Hooks contextuels** qui s'adaptent automatiquement au mode (Personnel/Organisation)
- **Services API** centralisés
- **Système de cache** intelligent

## Architecture

```
newlib/
├── hooks/              # Hooks React composables
│   ├── core/          # Hooks fondamentaux
│   ├── context/       # Hooks contextuels (nouveau système)
│   └── domain/        # Hooks métier
├── store/             # Stores Zustand
├── services/          # Services API
│   └── api/          # Clients API
└── utils/            # Utilitaires
    └── cache.js      # Gestionnaire de cache
```

## Flux de données

```
Composant React
    ↓
Hook contextuel (ex: useContextCourses)
    ↓
Store Zustand (ex: courseStore)
    ↓
Service API (ex: courseApi)
    ↓
Backend API
```

## Hooks contextuels - Le nouveau système

### Principe fondamental : "Le contexte détermine les données"

Tous les hooks contextuels s'adaptent automatiquement au mode actif (Personnel ou Organisation).

### 1. useActiveContext - Le hook principal

```javascript
import { useActiveContext } from '@/newlib/hooks';

function MyComponent() {
  const {
    // État du contexte
    activeContext,      // { type: 'personal' | 'organization', name, id }
    isPersonalMode,     // boolean
    isOrganizationMode, // boolean
    
    // Données
    user,               // Utilisateur connecté
    currentOrganization,// Organisation active (si mode org)
    organizations,      // Liste des organisations
    
    // Actions
    switchToPersonal,   // Basculer en mode personnel
    switchToOrganization, // Basculer vers une organisation
    
    // État
    isLoading,
    canAccess          // Vérifie l'accès aux données
  } = useActiveContext();
  
  // Utilisation
  if (isPersonalMode) {
    return <PersonalView user={user} />;
  } else {
    return <OrganizationView org={currentOrganization} />;
  }
}
```

### 2. useContextCourses - Formations contextuelles

```javascript
import { useContextCourses } from '@/newlib/hooks';

function CoursesPage() {
  const {
    // Données
    courses,        // Formations filtrées selon le contexte
    stats,          // Statistiques (total, complétées, en cours)
    
    // Actions
    enrollCourse,   // S'inscrire à un cours
    unenrollCourse, // Se désinscrire
    refreshCourses, // Rafraîchir les données
    
    // Utilitaires
    getCourseById,  // Trouver un cours par ID
    hasCourses,     // boolean
    canEnroll       // Peut s'inscrire
  } = useContextCourses();
  
  // En mode personnel : affiche les cours personnels
  // En mode organisation : affiche les cours de l'organisation filtrés par tags
  
  const handleEnroll = async (courseId) => {
    try {
      await enrollCourse(courseId);
      // Le hook gère automatiquement le contexte (personnel ou organisation)
    } catch (error) {
      console.error(error);
    }
  };
}
```

### 3. useContextStats - Statistiques adaptatives

```javascript
import { useContextStats } from '@/newlib/hooks';

function StatsWidget() {
  const {
    stats,          // Statistiques globales
    courseStats,    // Stats basées sur les cours
    insights,       // Insights contextuels
    refreshStats    // Rafraîchir
  } = useContextStats();
  
  // Les stats changent selon le contexte :
  // - Personnel : stats globales de l'utilisateur
  // - Organisation : stats dans l'organisation + comparaison
  
  return (
    <div>
      <h3>Formations complétées : {stats.completedCourses}</h3>
      {insights.map(insight => (
        <StatCard key={insight.label} {...insight} />
      ))}
    </div>
  );
}
```

### 4. useContextMembers - Gestion des membres

```javascript
import { useContextMembers } from '@/newlib/hooks';

function MembersManager() {
  const {
    // Données
    members,          // Membres selon le contexte
    currentMember,    // Membre actuel (vous)
    availableTags,    // Tags disponibles (org only)
    
    // Actions (null en mode personnel)
    inviteMember,     // Inviter un membre
    removeMember,     // Retirer un membre
    updateMemberRole, // Changer le rôle
    assignMemberTags, // Assigner des tags
    
    // Utilitaires
    searchMembers,    // Rechercher
    getMembersByTag,  // Filtrer par tag
    stats            // Statistiques des membres
  } = useContextMembers();
  
  // En mode personnel : retourne [utilisateur actuel]
  // En mode organisation : retourne les membres de l'org
}
```

### 5. usePermissions - Gestion des droits

```javascript
import { usePermissions } from '@/newlib/hooks';

function AdminPanel() {
  const {
    // Rôle
    userRole,         // OWNER | ADMIN | MEMBER | null
    isAdmin,          // boolean helper
    
    // Vérifications
    can,              // Vérifier une permission
    canAll,           // Toutes les permissions requises
    canAny,           // Au moins une permission
    
    // Utilitaires
    permissions,      // Objet avec toutes les permissions
    withPermission,   // Wrapper pour actions
    getPermissionError // Message d'erreur
  } = usePermissions();
  
  // Utilisation simple
  if (!can('canInviteMembers')) {
    return <div>Accès refusé</div>;
  }
  
  // Wrapper d'action
  const handleDelete = () => {
    withPermission('canDeleteOrganization', 
      async () => {
        // Action autorisée
        await deleteOrg();
      },
      (error) => {
        // Gestion d'erreur
        toast.error(error.message);
      }
    );
  };
}
```

## Stores Zustand

### Structure d'un store

```javascript
// store/exampleStore.js
import { create } from 'zustand';
import { cacheManager } from '../utils/cache';

export const useExampleStore = create((set, get) => ({
  // État
  data: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchData: async (userId, force = false) => {
    // Clé de cache avec userId pour isolation
    const cacheKey = `user_${userId}_data`;
    
    // Vérifier le cache
    if (!force && cacheManager.has(cacheKey)) {
      const cached = cacheManager.get(cacheKey);
      set({ data: cached });
      return cached;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const result = await exampleApi.getData();
      set({ data: result, isLoading: false });
      cacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
```

### Stores disponibles

1. **userStore** : Gestion de l'utilisateur connecté
2. **courseStore** : Gestion des formations
3. **organizationStore** : Gestion des organisations
4. **contextStore** : Gestion du contexte actif (Personnel/Organisation)

## Services API

### Structure d'un service

```javascript
// services/api/exampleApi.js
import axios from 'axios';

export const exampleApi = {
  getData: async () => {
    const response = await axios.get('/api/data');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error);
  },
  
  createItem: async (data) => {
    const response = await axios.post('/api/items', data);
    if (response.data.success) {
      return response.data.item;
    }
    throw new Error(response.data.error);
  }
};
```

### Services disponibles

1. **userApi** : Opérations utilisateur
2. **courseApi** : Opérations formations
3. **organizationApi** : Opérations organisations

## Système de cache

### Utilisation du cache manager

```javascript
import { cacheManager } from '@/newlib/utils/cache';

// Définir une donnée en cache (5 minutes par défaut)
cacheManager.set('key', data);

// Avec durée personnalisée (en ms)
cacheManager.set('key', data, 600000); // 10 minutes

// Vérifier si une clé existe et est valide
if (cacheManager.has('key')) {
  const data = cacheManager.get('key');
}

// Invalider par préfixe (utile pour vider un type de données)
cacheManager.invalidateByPrefix('user_123_'); // Invalide tout le cache de l'utilisateur

// Vider tout le cache
cacheManager.clear();
```

### Conventions de clés de cache

```javascript
// Format : {userPrefix}_{contextType}_{resource}_{id}
`user_${userId}_courses_${containerName}`
`user_${userId}_org_${orgId}_members`
`user_${userId}_stats_personal`
```

## Patterns et bonnes pratiques

### 1. Toujours utiliser les hooks contextuels

```javascript
// ❌ Mauvais - accès direct au store
import { useCourseStore } from '@/newlib/store/courseStore';
const courses = useCourseStore(state => state.userCourses);

// ✅ Bon - utiliser le hook contextuel
import { useContextCourses } from '@/newlib/hooks';
const { courses } = useContextCourses();
```

### 2. Gestion des erreurs

```javascript
function MyComponent() {
  const { courses, error, isLoading } = useContextCourses();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!courses.length) return <EmptyState />;
  
  return <CoursesList courses={courses} />;
}
```

### 3. Actions avec permissions

```javascript
function AdminAction() {
  const { can, withPermission } = usePermissions();
  const { inviteMember } = useContextMembers();
  
  const handleInvite = async (email) => {
    // Méthode 1 : Vérification manuelle
    if (!can('canInviteMembers')) {
      toast.error("Vous n'avez pas la permission");
      return;
    }
    
    // Méthode 2 : Avec wrapper
    await withPermission('canInviteMembers', 
      () => inviteMember(email),
      (error) => toast.error(error.message)
    );
  };
}
```

### 4. Changement de contexte

```javascript
import { useActiveContext } from '@/newlib/hooks';
import { ContextSwitcher } from '@/components/common/ContextSwitcher';

function Header() {
  // Option 1 : Utiliser le composant ContextSwitcher
  return <ContextSwitcher />;
  
  // Option 2 : Implémenter manuellement
  const { switchToOrganization, organizations } = useActiveContext();
  
  const handleOrgSelect = (org) => {
    switchToOrganization(org);
    // Le contexte change, tous les hooks se mettent à jour automatiquement
  };
}
```

### 5. Optimisation avec le cache

```javascript
function DataIntensiveComponent() {
  // autoLoad: false pour contrôler manuellement le chargement
  const { courses, refreshCourses } = useContextCourses({ autoLoad: false });
  
  useEffect(() => {
    // Charger seulement si nécessaire
    if (shouldLoadData) {
      refreshCourses();
    }
  }, [shouldLoadData]);
}
```

## Migration depuis l'ancienne architecture

### Étapes de migration

1. **Remplacer les imports**
```javascript
// Ancien
import { useUser } from '@/lib/hooks/useUser';
import { useTraining } from '@/lib/hooks/useTraining';

// Nouveau
import { useActiveContext, useContextCourses } from '@/newlib/hooks';
```

2. **Adapter la logique**
```javascript
// Ancien - gestion manuelle du contexte
const context = localStorage.getItem('wisetwin-active-context');
const courses = context.type === 'personal' ? personalCourses : orgCourses;

// Nouveau - automatique
const { courses } = useContextCourses(); // S'adapte automatiquement
```

3. **Simplifier les composants**
```javascript
// Ancien - logique complexe dans le composant
function CourseList() {
  const [context, setContext] = useState(null);
  const [courses, setCourses] = useState([]);
  // ... beaucoup de logique
}

// Nouveau - logique dans les hooks
function CourseList() {
  const { courses, enrollCourse } = useContextCourses();
  // Composant simple et focalisé sur l'UI
}
```

## Dépannage

### Le contexte ne se met pas à jour
- Vérifier que `useActiveContext` est initialisé
- S'assurer que le `contextStore` est correctement persisté
- Vérifier les événements `context-changed`

### Les données ne se rafraîchissent pas
- Vérifier le cache avec les bonnes clés (incluant userId)
- Utiliser `force: true` pour forcer le rechargement
- Vérifier les permissions en mode organisation

### Erreurs de permissions
- Utiliser `usePermissions` pour debugger
- Vérifier le rôle de l'utilisateur dans l'organisation
- S'assurer que le contexte est correctement défini

## Résumé

La nouvelle architecture `newlib/` apporte :
1. **Simplicité** : Les hooks s'adaptent automatiquement au contexte
2. **Sécurité** : Cache isolé par utilisateur, permissions centralisées
3. **Performance** : Cache intelligent, moins de requêtes
4. **Maintenabilité** : Code organisé et réutilisable

Toujours privilégier les hooks contextuels (`useContext*`) qui gèrent automatiquement la complexité du double mode Personnel/Organisation.