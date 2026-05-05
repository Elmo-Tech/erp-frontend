"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useAuthStore } from "@/entities/user/model/auth.store";

export default function UnauthorizedPage() {
	const hasPermission = useAuthStore((state) => state.hasPermission);

	const getRedirectPath = () => {
		if (hasPermission("access_client_portal")) return "/client";
		return "/dashboard";
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
			<div className="text-center space-y-6">
				<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
					<ShieldX className="h-10 w-10 text-destructive" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Unauthorized</h1>
					<p className="text-muted-foreground max-w-md">Sorry, you don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.</p>
				</div>
				<Button asChild>
					<Link href={getRedirectPath()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Link>
				</Button>
			</div>
		</div>
	);
}
