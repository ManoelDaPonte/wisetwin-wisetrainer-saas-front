import { handleAuth, handleLogin, handleLogout } from "@auth0/nextjs-auth0";

export const GET = async (request, props) => {
    const params = await props.params;
    const resolvedParams = await params;
    return handleAuth({
		signup: handleLogin({
			authorizationParams: {
				screen_hint: "signup",
			},
		}),
		logout: handleLogout({
			returnTo: "/login", // Redirect to login page after logout
		}),
	})(request, { params: resolvedParams });
};
