"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { projectDriveApi } from "@/features/projects/api/projectDrive";

const SETTINGS = "/dashboard/settings?tab=google_drive";

export function GoogleDriveOAuthCallback() {
	const router = useRouter();
	const params = useSearchParams();
	const code = params.get("code");
	const error = params.get("error");
	const state = params.get("state");
	const started = useRef(false);

	useEffect(() => {
		if (started.current) return;
		started.current = true;
		if (!code || error) {
			router.replace(`${SETTINGS}&googleDrive=error`);
			return;
		}
		const destination = state?.startsWith("/dashboard/") ? state : SETTINGS;
		void projectDriveApi.completeOAuth(code).then(() => {
			router.replace(destination);
		}).catch(() => {
			router.replace(`${SETTINGS}&googleDrive=error`);
		});
	}, [code, error, state, router]);

	return <div role="status" className="flex min-h-[50vh] items-center justify-center">Connecting Google Drive...</div>;
}
