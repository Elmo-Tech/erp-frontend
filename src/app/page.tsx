"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { Loader2 } from "lucide-react";

// TODO: Add splash screen

export default function Home() {
	const router = useRouter();
	const { isAuthenticated, hasPermission } = useAuthStore();

	useEffect(() => {
		if (isAuthenticated) {
			if (hasPermission("access_client_portal")) {
				router.push("/client");
			} else {
				router.push("/dashboard");
			}
		} else {
			router.push("/login");
		}
	}, [isAuthenticated, hasPermission, router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
		</div>
	);
}
