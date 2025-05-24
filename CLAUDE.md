# Documentation Claude - WiseTwin/WiseTrainer SaaS

## Vue d'ensemble

Cette application est une plateforme SaaS de formation en réalité virtuelle qui combine deux modules principaux :
- **WiseTrainer** : Module de formation avec scénarios interactifs
- **WiseTwin** : Environnements 3D pour exploration et simulation

## Architecture du projet

### Structure des dossiers

```
/
├── app/                    # Next.js App Router
│   ├── (app)/             # Routes protégées
│   ├── (auth)/            # Routes d'authentification
│   └── api/               # API Routes
├── components/            # Composants React
├── lib/                   # Ancienne architecture (en cours de migration)
│   ├── hooks/            # Hooks React (Context API)
│   ├── contexts/         # React Contexts
│   └── services/         # Services API
├── newlib/               # Nouvelle architecture (Zustand)
│   ├── hooks/           # Hooks composables
│   ├── store/           # Stores Zustand
│   ├── services/        # Services API
│   └── utils/           # Utilitaires (cache)
└── prisma/              # Schéma de base de données
```

## Flux de données

### 1. Architecture générale

```
Composant React
    ↓
Hook personnalisé (newlib/hooks/)
    ↓
Store Zustand (newlib/store/)
    ↓
Service API (newlib/services/api/)
    ↓
Route API Next.js (app/api/)
    ↓
Base de données (Prisma) + Azure Storage
```

### 2. Gestion d'état

#### Stores Zustand (Nouvelle architecture)

**userStore.js**
- État : `user`, `isLoading`, `error`, `stats`
- Actions : `fetchUser()`, `updateProfile()`, `fetchStats()`
- Cache : 5 minutes pour les données utilisateur

**courseStore.js**
- État : `courses`, `currentCourse`, `scenarios`
- Actions : `fetchCourses()`, `enrollCourse()`, `updateProgress()`
- Cache : 10 minutes pour la liste des cours

**organizationStore.js**
- État : `organizations`, `currentOrganization`, `members`, `invitations`
- Actions : `fetchOrganizations()`, `inviteMembers()`, `manageTags()`
- Cache : 5 minutes pour les données d'organisation

### 3. Système de hooks

#### Hooks principaux (newlib/hooks/)

**useUser()**
```javascript
// Utilisation
const { user, isLoading, updateProfile } = useUser();

// Fonctionnalités
- Authentification via Auth0
- Gestion du profil utilisateur
- Statistiques de formation
```

**useCourses()**
```javascript
// Utilisation
const { courses, enrollCourse, currentCourse } = useCourses();

// Fonctionnalités
- Liste des formations disponibles
- Inscription aux cours
- Suivi de progression
```

**useOrganization()**
```javascript
// Utilisation
const { organization, members, inviteUser } = useOrganization();

// Fonctionnalités
- Gestion des organisations
- Invitations et membres
- Permissions (OWNER, ADMIN, MEMBER)
```

### 4. Flux d'authentification

1. **Connexion** : Auth0 → `/api/user/initialize` → Création utilisateur + container Azure
2. **Session** : Middleware vérifie Auth0 session sur toutes les routes
3. **Contexte** : Personal vs Organization (stocké dans localStorage)

### 5. Modules principaux

#### WiseTrainer (Formations)

**Flux d'inscription à un cours :**
1. Utilisateur sélectionne un cours
2. `enrollCourse()` → `/api/db/wisetrainer/enroll-course`
3. Création des enregistrements DB (Course, UserCourse, Modules)
4. Redirection vers `/wisetrainer/[courseId]`
5. Chargement du build Unity depuis Azure

**Structure des données :**
```
Course
  ├── Modules[]
  │     ├── Scenarios[]
  │     └── Progress
  └── UserCourse
        ├── enrollmentDate
        ├── completionDate
        └── progress
```

#### WiseTwin (Environnements 3D)

**Flux d'accès :**
1. Sélection d'un environnement
2. Chargement direct du build Unity
3. Pas d'inscription requise
4. Tracking de session pour analytics

### 6. Gestion des organisations

**Hiérarchie :**
```
Organization
  ├── Members[] (roles: OWNER, ADMIN, MEMBER)
  ├── Tags[]
  │     ├── Users[]
  │     └── Trainings[]
  └── Builds[] (WiseTrainer + WiseTwin)
```

**Système de tags :**
- Permettent de grouper utilisateurs et formations
- Association automatique lors de l'ajout d'un membre
- Filtrage des formations par tags

### 7. Intégration Unity WebGL

**Chargement des builds :**
1. Builds stockés dans Azure Blob Storage
2. Fichiers : `.loader.js`, `.framework.js`, `.data.gz`, `.wasm.gz`
3. API `/api/azure/direct-download/[container]/[...path]`
4. Component `UnityBuild.jsx` gère l'intégration

**Communication Unity ↔ React :**
- `useUnityEvents()` : Écoute les événements Unity
- Messages : progression, scores, completion
- Mise à jour automatique de la progression

### 8. Migration en cours

**Ancienne architecture (lib/) → Nouvelle (newlib/)**

| Ancien | Nouveau | Changements |
|--------|---------|-------------|
| React Context | Zustand | Performance améliorée |
| Cache manuel | Cache centralisé | Gestion simplifiée |
| Hooks séparés | Hooks composables | Réutilisabilité |
| API directe | Services layer | Séparation des responsabilités |

**État actuel :**
- ~60% des composants utilisent newlib/
- Guide et certains composants encore sur lib/
- Migration progressive en cours

### 9. Bonnes pratiques

**Pour les nouveaux développements :**
1. Utiliser exclusivement `newlib/hooks/`
2. Suivre le pattern : Component → Hook → Store → Service → API
3. Utiliser le cache manager pour optimiser les performances
4. Gérer les états de chargement et erreurs dans les stores

**Conventions de code :**
- Hooks : `use[Feature]` (ex: `useOrganization`)
- Stores : `[feature]Store` (ex: `organizationStore`)
- Services : `[feature]Api` (ex: `organizationApi`)
- Actions Zustand : verbes d'action (ex: `fetchData`, `updateItem`)

### 10. Points d'attention

1. **Double contexte** : Toujours vérifier si on est en mode Personal ou Organization
2. **Cache** : Le cache est partagé entre les contextes, attention aux conflits
3. **Permissions** : Vérifier les rôles pour les actions d'organisation
4. **Unity** : Les builds Unity peuvent être lourds, optimiser le chargement

### 11. Commandes utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Linting
npm run lint

# Prisma
npx prisma generate  # Générer le client
npx prisma db push   # Sync avec la DB
```

### 12. Variables d'environnement importantes

- `AUTH0_*` : Configuration Auth0
- `DATABASE_URL` : Connexion base de données
- `AZURE_STORAGE_*` : Configuration stockage Azure
- `NEXT_PUBLIC_*` : Variables accessibles côté client

Cette documentation sera mise à jour au fur et à mesure de l'évolution du projet et de la migration vers la nouvelle architecture.

## 13. Complexités identifiées et plan de refactoring

### Complexités à résoudre

#### 1. **Double système de hooks (lib/ vs newlib/)** ⚠️ PRIORITÉ HAUTE
**Problème :** Deux systèmes en parallèle créent confusion et double maintenance
- Risque d'incohérences de données
- Performance dégradée (double fetching)
- Code dupliqué

**Action :** 
- [ ] Finaliser la migration vers newlib/
- [ ] Supprimer complètement le dossier lib/
- [ ] Mettre à jour tous les imports

#### 2. **Gestion du contexte Personal/Organization** ⚠️ PRIORITÉ HAUTE
**Problème :** Le switch force un reload complet de la page
- Expérience utilisateur dégradée
- Perte d'état local
- Cache vidé inutilement

**Action :**
- [ ] Implémenter la gestion du contexte dans Zustand
- [ ] Utiliser des namespaces séparés (personal/org)
- [ ] Supprimer le page reload

#### 3. **Structure des routes API trop granulaire** ⚠️ PRIORITÉ MOYENNE
**Problème :** Trop d'endpoints séparés (ex: 10+ fichiers dans `/api/db/wisetrainer/`)
- Maintenance difficile
- Logique dispersée

**Action :**
- [ ] Regrouper par ressource : `/api/courses/[action]`
- [ ] Créer des contrôleurs unifiés
- [ ] Suivre les conventions REST

#### 4. **Gestion du cache redondante** ⚠️ PRIORITÉ MOYENNE
**Problème :** Multiple systèmes de cache
- Cache dans les hooks (lib/)
- Cache dans Zustand
- Cache centralisé (newlib/utils/cache.js)

**Action :**
- [ ] Adopter React Query pour tout le cache/fetching
- [ ] Ou utiliser Zustand persist avec une stratégie unique
- [ ] Supprimer les autres systèmes de cache

#### 5. **Séparation WiseTrainer/WiseTwin artificielle** ⚠️ PRIORITÉ BASSE
**Problème :** Duplication de logique entre les deux modules
- Code similaire pour Unity
- Structure identique

**Action :**
- [ ] Créer un module générique "Training"
- [ ] Utiliser un type (trainer/twin) pour différencier
- [ ] Partager la logique commune

#### 6. **Complexité du système de permissions** ⚠️ PRIORITÉ MOYENNE
**Problème :** Tags + Roles + Organization = matrice trop complexe
- Difficile de comprendre les accès
- Logique dupliquée front/back

**Action :**
- [ ] Simplifier avec un système unifié
- [ ] Créer un hook `usePermissions()`
- [ ] Centraliser la logique côté API

#### 7. **Azure API routes comme proxy** ⚠️ PRIORITÉ BASSE
**Problème :** Overhead inutile pour servir les builds Unity
- Latence ajoutée
- Complexité de streaming

**Action :**
- [ ] Implémenter SAS tokens côté client
- [ ] Accès direct à Azure pour les builds
- [ ] Garder l'API seulement pour les opérations sensibles

### Plan d'action recommandé

1. **Phase 1 - Migration (1-2 semaines)**
   - Compléter migration newlib/
   - Supprimer lib/
   - Tester tous les composants

2. **Phase 2 - Contexte (1 semaine)**
   - Refactorer la gestion du contexte
   - Éliminer les page reloads
   - Améliorer l'UX

3. **Phase 3 - Architecture (2-3 semaines)**
   - Restructurer les API routes
   - Implémenter React Query ou finaliser Zustand persist
   - Simplifier les permissions

4. **Phase 4 - Optimisations (1-2 semaines)**
   - Unifier WiseTrainer/WiseTwin
   - Optimiser l'accès Azure
   - Performance tuning

Cette liste servira de référence pour les futures sessions de refactoring.