// app/login/page.jsx
import React from "react";
import LoginContent from "@/components/login/LoginContent";
import { Suspense } from "react";

export default function Page() {
	return (
		<Suspense>
			<LoginContent />
		</Suspense>
	);
}
