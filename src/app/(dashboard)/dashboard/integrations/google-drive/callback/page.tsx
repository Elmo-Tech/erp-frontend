"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { projectDriveApi } from "@/features/projects/api/projectDrive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoogleDriveCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const state = searchParams.get("state") || "/dashboard/projects";
	const [message, setMessage] = useState("Connecting Google Drive...");

	useEffect(() => {
		if (!code) {
			return;
		}

		projectDriveApi
			.completeOAuth(code)
			.then(() => {
				setMessage("Google Drive connected. Redirecting...");
				router.replace(state);
			})
			.catch(() => {
				setMessage("Google Drive connection failed.");
			});
	}, [code, router, state]);

	const visibleMessage = code ? message : "Google Drive connection failed: missing authorization code.";

	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Google Drive</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">{visibleMessage}</p>
				</CardContent>
			</Card>
		</div>
	);
}
