# Résolution des problèmes courants

## Erreur: "The result of getSnapshot should be cached to avoid an infinite loop"

Si vous rencontrez cette erreur avec Zustand, c'est généralement à cause de la façon dont les sélecteurs sont utilisés.

### Problème

```jsx
// Problématique - crée une référence différente à chaque rendu
const { user, isLoading } = useUserStore((state) => ({
	user: state.user,
	isLoading: state.isLoading,
}));
```

### Solution

Utilisez des sélecteurs individuels pour chaque propriété :

```jsx
// Solution correcte
const user = useUserStore((state) => state.user);
const isLoading = useUserStore((state) => state.isLoading);
```

## Appels API dupliqués

Si vous constatez des appels API dupliqués, comme plusieurs appels à `/api/user/initialize`, cela peut être dû à plusieurs facteurs :

### Problèmes possibles

1. **Montage multiple des hooks** - Plusieurs hooks qui s'initialisent en parallèle et effectuent le même appel
2. **Autorisation automatique** - Des routes qui vérifient automatiquement l'authentification
3. **Mode strict de React** - En développement, React monte deux fois les composants

### Solutions

1. **Désactiver l'autoLoad dans les hooks imbriqués** :

    ```jsx
    // Hook parent avec autoLoad
    const { user } = useUser({ autoLoad: true });

    // Hook enfant avec autoLoad désactivé
    const { courses } = useCourses({ autoLoad: false });
    ```

2. **Utiliser le cache** - Assurez-vous que le mécanisme de cache fonctionne correctement pour éviter les requêtes répétées

3. **Ajouter des drapeaux pour éviter les requêtes multiples** :

    ```jsx
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
    	if (!hasFetched) {
    		fetchData();
    		setHasFetched(true);
    	}
    }, [hasFetched, fetchData]);
    ```

## Provider global vs Utilisation directe des hooks

L'architecture supporte deux façons d'accéder aux données :

### Via le provider global (recommandé pour les applications complètes)

```jsx
// Dans app/layout.jsx
import { AppProvider } from "@/lib/contexts/AppProvider";

export default function RootLayout({ children }) {
	return (
		<html>
			<body>
				<AppProvider>{children}</AppProvider>
			</body>
		</html>
	);
}
```

### Utilisation directe des hooks (pour les migrations progressives)

```jsx
import { useUser, useOrganization } from "@/lib/hooks";

function MyComponent() {
	const { user } = useUser();
	const { organizations } = useOrganization();

	// Utiliser ces données...
}
```

## Conseils d'optimisation

1. **Évitez les chargements redondants** - Utilisez `autoLoad: false` dans les hooks qui sont utilisés comme dépendances d'autres hooks

2. **Partagez les données via le store** - Toutes les données sont centralisées dans les stores Zustand, donc elles sont partagées entre tous les composants qui les utilisent

3. **Utilisez correctement les selectors** - Sélectionnez uniquement les propriétés dont vous avez besoin pour éviter les re-rendus inutiles

4. **Invalidez le cache de manière ciblée** - Lorsque vous mettez à jour des données, invalidez uniquement les parties du cache qui sont affectées
