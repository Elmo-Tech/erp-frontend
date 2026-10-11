import { Suspense } from "react";
import { GoogleDriveOAuthCallback } from "@/features/settings/components/GoogleDriveOAuthCallback";

export default function GoogleDriveCallbackPage() {
	return <Suspense fallback={<p>Connecting Google Drive...</p>}><GoogleDriveOAuthCallback /></Suspense>;
}
