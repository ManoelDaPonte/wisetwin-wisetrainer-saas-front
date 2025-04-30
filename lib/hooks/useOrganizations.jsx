// lib/hooks/useOrganizations.js
export function useOrganizations() {
	const [organizations, setOrganizations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOrganizations = async () => {
			try {
				const response = await axios.get("/api/organization");
				setOrganizations(response.data.organizations);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrganizations();
	}, []);

	return { organizations, isLoading, error };
}
