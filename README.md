# WiseTwin - Plateforme d'apprentissage et de simulation

WiseTwin est une application Next.js qui offre des solutions innovantes pour la formation en réalité augmentée et les jumeaux numériques en environnement industriel.

## Fonctionnalités

-   **WiseTrainer**: Modules de formation interactifs en 3D
-   **Organisations**: Gestion des équipes et attribution de formations spécifiques
-   **Statistiques**: Suivi personnalisé de la progression des utilisateurs
-   **Système de tags**: Organisation intelligente des contenus et utilisateurs

## Technologie

-   **Frontend**: Next.js avec App Router
-   **CSS**: Tailwind CSS avec thème personnalisé
-   **Authentification**: Auth0
-   **Base de données**: PostgreSQL avec Prisma
-   **Stockage**: Azure Blob Storage
-   **Animations**: Framer Motion

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/wisetwin-platform.git

# Installer les dépendances
cd wisetwin-platform
npm install

# Générer le client Prisma
npx prisma generate

# Lancer le serveur de développement
npm run dev
```

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes:

```
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/wisetwin?schema=public"

# Auth0
AUTH0_SECRET=your_secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.eu.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string

# Email (optionnel)
EMAIL_PASSWORD=your_email_password
```

## Structure du projet

-   `/app`: Routes et pages de l'application
-   `/components`: Composants réutilisables
-   `/lib`: Utilitaires, hooks et configuration
-   `/prisma`: Schéma de base de données
-   `/public`: Fichiers statiques

## Contribution

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request
