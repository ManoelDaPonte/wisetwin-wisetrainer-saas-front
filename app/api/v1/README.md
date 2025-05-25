# API v1 Documentation

## 🏗️ Architecture

Cette API suit les principes RESTful et est organisée par ressources. Chaque ressource représente une entité métier de l'application.

### Structure des dossiers

```
app/api/v1/
├── auth/                    # Authentification et initialisation
├── users/                   # Gestion des utilisateurs
├── organizations/           # Gestion des organisations
├── courses/                 # Gestion des formations
├── storage/                 # Accès au stockage Azure
└── sessions/               # Tracking des sessions utilisateur
```

### Principes de conception

1. **RESTful** : Utilisation correcte des verbes HTTP (GET, POST, PATCH, DELETE)
2. **Authentification** : Toutes les routes sont protégées par Auth0 (sauf indication contraire)
3. **Permissions** : Vérification des droits selon le contexte (personnel/organisation)
4. **Réponses uniformes** : Format JSON standardisé pour toutes les réponses

### Format des réponses

#### Succès
```json
{
  "data": { ... },
  "meta": { ... },
  "message": "Success message"
}
```

#### Erreur
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## 🔐 Authentification (`/auth`)

### `POST /api/v1/auth/initialize`
Initialise un nouvel utilisateur après sa première connexion Auth0.

**Body:** Aucun (utilise la session Auth0)

**Response:**
```json
{
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "azureContainer": "user-john-doe-abc123",
    "organizations": []
  }
}
```

**Logique:**
- Vérifie si l'utilisateur existe en DB
- Crée un container Azure personnel
- Initialise le profil utilisateur

---

## 👤 Utilisateurs (`/users`)

### `GET /api/v1/users/me`
Récupère le profil de l'utilisateur connecté.

**Response:**
```json
{
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "azureContainer": "user-container-name",
    "createdAt": "2024-01-01T00:00:00Z",
    "organizations": [
      {
        "id": "org-uuid",
        "name": "ACME Corp",
        "role": "ADMIN"
      }
    ]
  }
}
```

### `PATCH /api/v1/users/me`
Met à jour le profil de l'utilisateur connecté.

**Body:**
```json
{
  "name": "Jane Doe"
}
```

**Champs modifiables:** `name`

### `DELETE /api/v1/users/me`
Supprime complètement le compte utilisateur.

**Actions effectuées:**
- Suppression du container Azure
- Suppression de toutes les données DB
- Suppression du compte Auth0

### `GET /api/v1/users/me/stats`
Récupère les statistiques de formation de l'utilisateur.

**Response:**
```json
{
  "data": {
    "totalCourses": 12,
    "completedCourses": 8,
    "completionRate": 66,
    "totalTimeSpent": 3600,
    "averageScore": 85,
    "questionsAnswered": 150,
    "correctAnswers": 127,
    "successRate": 85
  }
}
```

### `GET /api/v1/users/me/courses`
Liste toutes les formations de l'utilisateur.

**Query params:**
- `status`: `in_progress`, `completed`, `failed`
- `organizationId`: Filtrer par organisation
- `limit`: Nombre de résultats (défaut: 20)
- `offset`: Pagination

**Response:**
```json
{
  "data": [
    {
      "id": "safety-training",
      "name": "Formation Sécurité",
      "progress": 75,
      "status": "in_progress",
      "lastAccessed": "2024-01-15T10:00:00Z",
      "source": {
        "type": "organization",
        "organizationId": "org-uuid",
        "name": "ACME Corp"
      }
    }
  ],
  "meta": {
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

### `GET /api/v1/users/me/organizations`
Liste les organisations de l'utilisateur.

**Response:**
```json
{
  "data": [
    {
      "id": "org-uuid",
      "name": "ACME Corp",
      "role": "ADMIN",
      "joinedAt": "2024-01-01T00:00:00Z",
      "membersCount": 45
    }
  ]
}
```

### `GET /api/v1/users/[userId]/*`
Mêmes endpoints que `/me` mais pour un utilisateur spécifique.
**Permissions:** Admin organisation ou propriétaire du compte

---

## 🏢 Organisations (`/organizations`)

### `GET /api/v1/organizations`
Liste toutes les organisations de l'utilisateur connecté.

### `POST /api/v1/organizations`
Crée une nouvelle organisation.

**Body:**
```json
{
  "name": "Ma Société",
  "description": "Description de l'organisation",
  "logoUrl": "https://..."
}
```

**Actions:**
- Crée l'organisation
- Crée un container Azure dédié
- Ajoute le créateur comme OWNER

### `GET /api/v1/organizations/[orgId]`
Récupère les détails d'une organisation.

**Response:**
```json
{
  "data": {
    "id": "org-uuid",
    "name": "ACME Corp",
    "description": "...",
    "azureContainer": "org-acme-corp-xyz",
    "userRole": "ADMIN",
    "membersCount": 45,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### `PATCH /api/v1/organizations/[orgId]`
Met à jour les informations de l'organisation.

**Permissions:** OWNER ou ADMIN

**Body:**
```json
{
  "name": "Nouveau nom",
  "description": "Nouvelle description",
  "logoUrl": "https://..."
}
```

### `DELETE /api/v1/organizations/[orgId]`
Supprime l'organisation et toutes ses données.

**Permissions:** OWNER uniquement

### Membres (`/organizations/[orgId]/members`)

#### `GET /api/v1/organizations/[orgId]/members`
Liste tous les membres de l'organisation.

**Response:**
```json
{
  "data": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MEMBER",
      "joinedAt": "2024-01-01T00:00:00Z",
      "tags": ["Manager", "Sécurité"]
    }
  ]
}
```

#### `POST /api/v1/organizations/[orgId]/members`
Ajoute un membre à l'organisation (par invitation).

**Permissions:** OWNER ou ADMIN

**Body:**
```json
{
  "email": "newuser@example.com",
  "role": "MEMBER"
}
```

**Rôles disponibles:** `MEMBER`, `ADMIN`

#### `PATCH /api/v1/organizations/[orgId]/members/[memberId]`
Modifie le rôle d'un membre.

**Permissions:** 
- OWNER peut modifier tous les rôles
- ADMIN peut modifier MEMBER uniquement

#### `DELETE /api/v1/organizations/[orgId]/members/[memberId]`
Retire un membre de l'organisation.

### Invitations (`/organizations/[orgId]/invitations`)

#### `GET /api/v1/organizations/[orgId]/invitations`
Liste toutes les invitations en attente.

**Permissions:** OWNER ou ADMIN

#### `POST /api/v1/organizations/[orgId]/invitations`
Crée une nouvelle invitation.

**Body:**
```json
{
  "email": "invite@example.com",
  "role": "MEMBER",
  "message": "Bienvenue dans notre équipe!"
}
```

#### `DELETE /api/v1/organizations/[orgId]/invitations/[invitationId]`
Annule une invitation.

#### `POST /api/v1/organizations/[orgId]/invitations/[invitationId]/resend`
Renvoie l'email d'invitation.

### Tags (`/organizations/[orgId]/tags`)

#### `GET /api/v1/organizations/[orgId]/tags`
Liste tous les tags de l'organisation.

**Response:**
```json
{
  "data": [
    {
      "id": "tag-uuid",
      "name": "Sécurité",
      "color": "#FF5733",
      "description": "Personnel de sécurité",
      "userCount": 12,
      "trainingCount": 5
    }
  ]
}
```

#### `POST /api/v1/organizations/[orgId]/tags`
Crée un nouveau tag.

**Permissions:** OWNER ou ADMIN

**Body:**
```json
{
  "name": "Manager",
  "color": "#3B82F6",
  "description": "Managers d'équipe"
}
```

#### `PATCH /api/v1/organizations/[orgId]/tags/[tagId]`
Modifie un tag existant.

#### `DELETE /api/v1/organizations/[orgId]/tags/[tagId]`
Supprime un tag et toutes ses associations.

### Formations organisation (`/organizations/[orgId]/courses`)

#### `GET /api/v1/organizations/[orgId]/courses`
Liste toutes les formations disponibles dans l'organisation.

**Query params:**
- `type`: `wisetrainer`, `wisetwin`
- `tagId`: Filtrer par tag

**Response:**
```json
{
  "data": [
    {
      "id": "safety-training",
      "name": "Formation Sécurité",
      "type": "wisetrainer",
      "description": "...",
      "tags": ["Obligatoire", "Sécurité"],
      "enrolledCount": 35
    }
  ]
}
```

---

## 📚 Formations (`/courses`)

### `GET /api/v1/courses`
Liste toutes les formations disponibles.

**Query params:**
- `organizationId`: Formations d'une organisation
- `type`: `personal`, `organization`, `all`
- `search`: Recherche par nom

### `GET /api/v1/courses/[courseId]`
Récupère les détails d'un cours.

**Query params:**
- `organizationId`: Contexte organisation (si applicable)

**Response:**
```json
{
  "data": {
    "id": "safety-training",
    "name": "Formation Sécurité",
    "description": "...",
    "modules": [
      {
        "id": "module-1",
        "title": "Introduction",
        "description": "...",
        "order": 1
      }
    ],
    "duration": "2h",
    "difficulty": "Débutant"
  }
}
```

### `POST /api/v1/courses/[courseId]/enroll`
S'inscrit à un cours.

**Body:**
```json
{
  "organizationId": "org-uuid"  // Optionnel
}
```

### `DELETE /api/v1/courses/[courseId]/enroll`
Se désinscrit d'un cours.

### `GET /api/v1/courses/[courseId]/progress`
Récupère la progression dans un cours.

**Response:**
```json
{
  "data": {
    "courseId": "safety-training",
    "progress": 75,
    "completedModules": ["module-1", "module-2"],
    "currentModule": "module-3",
    "lastAccessed": "2024-01-15T10:00:00Z"
  }
}
```

### `PATCH /api/v1/courses/[courseId]/progress`
Met à jour la progression.

**Body:**
```json
{
  "moduleId": "module-3",
  "completed": true,
  "score": 85
}
```

### Scénarios (`/courses/[courseId]/scenarios`)

#### `GET /api/v1/courses/[courseId]/scenarios/[scenarioId]`
Récupère un scénario de formation.

**Response:**
```json
{
  "data": {
    "id": "scenario-1",
    "title": "Évaluation sécurité",
    "type": "questionnaire",
    "questions": [
      {
        "id": "q1",
        "text": "Quelle est la procédure en cas d'incendie?",
        "type": "SINGLE",
        "options": [
          { "id": "opt1", "text": "Appeler les pompiers" },
          { "id": "opt2", "text": "Évacuer immédiatement" }
        ]
      }
    ]
  }
}
```

#### `POST /api/v1/courses/[courseId]/scenarios/[scenarioId]/submit`
Soumet les réponses d'un scénario.

**Body:**
```json
{
  "responses": [
    {
      "questionId": "q1",
      "selectedAnswers": ["opt2"]
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "score": 85,
    "passed": true,
    "correctAnswers": 17,
    "totalQuestions": 20,
    "feedback": [
      {
        "questionId": "q1",
        "isCorrect": true,
        "explanation": "..."
      }
    ]
  }
}
```

---

## 💾 Stockage (`/storage`)

### Containers (`/storage/containers`)

#### `GET /api/v1/storage/containers/[containerName]`
Liste les blobs d'un container.

**Query params:**
- `prefix`: Préfixe pour filtrer
- `maxResults`: Limite de résultats

**Permissions:** Propriétaire du container ou membre de l'organisation

#### `POST /api/v1/storage/containers/[containerName]`
Crée un nouveau container.

**Permissions:** Admin système uniquement

### Blobs (`/storage/containers/[containerName]/blobs`)

#### `GET /api/v1/storage/containers/[containerName]/blobs/[...path]`
Télécharge un blob.

**Headers de réponse:**
- `Content-Type`: Type MIME du fichier
- `Content-Length`: Taille du fichier
- `Content-Encoding`: `gzip` si compressé

#### `POST /api/v1/storage/containers/[containerName]/blobs/[...path]`
Upload un nouveau blob.

**Headers requis:**
- `Content-Type`: Type MIME du fichier

**Permissions:** Propriétaire du container ou admin organisation

#### `DELETE /api/v1/storage/containers/[containerName]/blobs/[...path]`
Supprime un blob.

**Permissions:** Propriétaire du container ou admin organisation

### Builds Unity (`/storage/builds`)

#### `GET /api/v1/storage/builds`
Recherche des builds Unity dans les containers.

**Query params:**
- `container`: Container à scanner
- `type`: `wisetrainer`, `wisetwin`
- `organizationId`: Builds d'une organisation

**Response:**
```json
{
  "data": [
    {
      "id": "safety-training",
      "type": "wisetrainer",
      "container": "org-acme-corp",
      "files": {
        "loader": "wisetrainer/safety-training.loader.js",
        "data": "wisetrainer/safety-training.data.gz",
        "framework": "wisetrainer/safety-training.framework.js.gz",
        "wasm": "wisetrainer/safety-training.wasm.gz"
      }
    }
  ]
}
```

---

## 📊 Sessions (`/sessions`)

### `POST /api/v1/sessions`
Démarre une nouvelle session de formation.

**Body:**
```json
{
  "courseId": "safety-training",
  "organizationId": "org-uuid"  // Optionnel
}
```

**Response:**
```json
{
  "data": {
    "sessionId": "session-uuid",
    "startTime": "2024-01-15T10:00:00Z"
  }
}
```

### `PATCH /api/v1/sessions/[sessionId]`
Met à jour une session (fin, pause, etc.).

**Body:**
```json
{
  "action": "end",
  "modulesViewed": ["module-1", "module-2"],
  "timeSpent": 3600
}
```

### `POST /api/v1/sessions/end`
Endpoint spécial pour terminer une session via `sendBeacon`.

**Body:**
```json
{
  "sessionId": "session-uuid",
  "modulesViewed": ["module-1", "module-2"]
}
```

---

## 🔧 Codes d'erreur

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentification requise |
| `AUTH_FAILED` | Échec d'authentification |
| `USER_NOT_FOUND` | Utilisateur non trouvé |
| `FORBIDDEN` | Accès refusé (permissions) |
| `NOT_FOUND` | Ressource non trouvée |
| `VALIDATION_ERROR` | Données invalides |
| `CONFLICT` | Conflit (ex: email déjà utilisé) |
| `RATE_LIMIT` | Limite de requêtes atteinte |
| `SERVER_ERROR` | Erreur serveur interne |

---

## 🚀 Exemples d'utilisation

### Inscription et démarrage d'une formation

```javascript
// 1. S'inscrire à un cours
const enrollment = await fetch('/api/v1/courses/safety-training/enroll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ organizationId: 'org-123' })
});

// 2. Démarrer une session
const session = await fetch('/api/v1/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    courseId: 'safety-training',
    organizationId: 'org-123'
  })
});

// 3. Récupérer un scénario
const scenario = await fetch('/api/v1/courses/safety-training/scenarios/module-1');

// 4. Soumettre les réponses
const result = await fetch('/api/v1/courses/safety-training/scenarios/module-1/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    responses: [
      { questionId: 'q1', selectedAnswers: ['opt2'] }
    ]
  })
});

// 5. Terminer la session
navigator.sendBeacon('/api/v1/sessions/end', JSON.stringify({
  sessionId: 'session-123',
  modulesViewed: ['module-1']
}));
```

### Gestion d'une organisation

```javascript
// 1. Créer une organisation
const org = await fetch('/api/v1/organizations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Ma Société',
    description: 'Formation professionnelle'
  })
});

// 2. Inviter un membre
await fetch(`/api/v1/organizations/${orgId}/invitations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'colleague@company.com',
    role: 'MEMBER'
  })
});

// 3. Créer un tag
await fetch(`/api/v1/organizations/${orgId}/tags`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Équipe Sécurité',
    color: '#FF5733'
  })
});

// 4. Associer le tag à des formations
await fetch(`/api/v1/organizations/${orgId}/tags/${tagId}/courses`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courseIds: ['safety-training', 'first-aid']
  })
});
```

---

## 📝 Notes importantes

1. **Authentification** : Toutes les routes nécessitent une session Auth0 valide (sauf `/auth/initialize`)
2. **Permissions** : Les actions sur les organisations respectent la hiérarchie OWNER > ADMIN > MEMBER
3. **Contexte** : Beaucoup d'endpoints s'adaptent au contexte (personnel vs organisation)
4. **Cache** : Les réponses incluent des headers de cache appropriés
5. **Pagination** : Les listes supportent `limit` et `offset` pour la pagination
6. **Recherche** : La plupart des listes supportent un paramètre `search`

---

## 🔗 Liens utiles

- [Documentation Auth0](https://auth0.com/docs)
- [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)