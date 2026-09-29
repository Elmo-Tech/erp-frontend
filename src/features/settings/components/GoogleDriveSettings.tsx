"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { projectDriveApi } from "@/features/projects/api/projectDrive";
import { useGoogleDriveStatus } from "@/features/projects/hooks/useProjectDrive";

export function GoogleDriveSettings() {
	const { data: status, error, isFetching, isLoading, refetch } = useGoogleDriveStatus();
	const [isStartingOAuth, setIsStartingOAuth] = useState(false);
	const [oauthError, setOauthError] = useState<string | null>(null);

	const handleOAuth = async () => {
		try {
			setOauthError(null);
			setIsStartingOAuth(true);
			const { url } = await projectDriveApi.getOAuthUrl("/dashboard/settings");
			window.location.href = url;
		} catch {
			setOauthError("Unable to start the Google Drive connection. Please try again.");
			setIsStartingOAuth(false);
		}
	};

	return (
		<Card aria-busy={isLoading || isFetching}>
			<CardHeader>
				<CardTitle>Google Drive</CardTitle>
				<CardDescription>Manage the Google account used to select project folders and upload project files.</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-3" role="status">
						<span className="sr-only">Loading Google Drive connection status</span>
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-9 w-36" />
					</div>
				) : error || !status ? (
					<div className="space-y-3" role="alert">
						<p className="text-sm text-muted-foreground">Google Drive connection status could not be loaded.</p>
						<Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
							<RefreshCw className={isFetching ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
							Retry
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex min-w-0 items-start gap-3">
								{status.connected ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" /> : <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />}
								<div className="min-w-0 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium">{status.connected ? "Google Drive is connected" : "Google Drive is not connected"}</p>
										<Badge className={status.connected ? "border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300" : "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"}>
											{status.connected ? "Connected" : "Disconnected"}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">{status.connected ? "Project Drive folders are available to use." : "Connect an account to use Google Drive with projects."}</p>
								</div>
							</div>
							<Button type="button" onClick={handleOAuth} disabled={isStartingOAuth} className="w-full sm:w-auto">
								{isStartingOAuth ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ExternalLink className="mr-2 size-4" />}
								{isStartingOAuth ? "Opening Google..." : status.connected ? "Reconnect Google Drive" : "Connect Google Drive"}
							</Button>
						</div>

						{(status.accountEmail || status.expiresAt || status.reason) && (
							<dl className="grid gap-3 text-sm sm:grid-cols-2">
								{status.accountEmail && (
									<div className="min-w-0">
										<dt className="text-muted-foreground">Connected account</dt>
										<dd className="truncate font-medium" title={status.accountEmail}>{status.accountEmail}</dd>
									</div>
								)}
								{status.expiresAt && (
									<div>
										<dt className="text-muted-foreground">Connection expires</dt>
										<dd className="font-medium">{formatGoogleDriveExpiry(status.expiresAt)}</dd>
									</div>
								)}
								{status.reason && (
									<div className="sm:col-span-2">
										<dt className="text-muted-foreground">Connection details</dt>
										<dd className="font-medium">{status.reason}</dd>
									</div>
								)}
							</dl>
						)}

						{oauthError && <p className="text-sm text-destructive" role="alert">{oauthError}</p>}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function formatGoogleDriveExpiry(expiresAt: string): string {
	const date = new Date(expiresAt);

	if (Number.isNaN(date.getTime())) {
		return expiresAt;
	}

	return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
