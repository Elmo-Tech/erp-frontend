"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Next.js 13+ Error Page
 *
 * This error boundary catches errors in the app directory.
 * It's automatically used by Next.js when an error occurs.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	function logErrorToService(currentError: Error & { digest?: string }) {
		// TODO: Integrate with error tracking service (Sentry, Bugsnag, etc.)
		console.error("Error logged:", {
			message: currentError.message,
			stack: currentError.stack,
			digest: currentError.digest,
			timestamp: new Date().toISOString(),
		});
	}

	useEffect(() => {
		// Log error to console in development
		if (process.env.NODE_ENV === "development") {
			console.error("Next.js Error Page:", error);
		}

		// Log error to external service
		logErrorToService(error);
	}, [error]);

	function handleGoHome() {
		window.location.assign("/dashboard");
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-6 w-6 text-destructive" />
						<CardTitle>Something went wrong</CardTitle>
					</div>
					<CardDescription>An unexpected error occurred. Our team has been notified.</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Error Message */}
					<div className="rounded-lg bg-destructive/10 p-4">
						<p className="text-sm font-medium text-destructive">{error.message || "An unexpected error occurred"}</p>
						{error.digest && <p className="mt-1 text-xs text-muted-foreground">Error ID: {error.digest}</p>}
					</div>

					{/* Error Details (Development Only) */}
					{process.env.NODE_ENV === "development" && (
						<details className="rounded-lg bg-muted p-4">
							<summary className="cursor-pointer text-sm font-medium">Error Details (Development Only)</summary>
							<div className="mt-2">
								<p className="text-xs font-medium text-muted-foreground">Stack Trace:</p>
								<pre className="mt-1 overflow-auto text-xs whitespace-pre-wrap">{error.stack}</pre>
							</div>
						</details>
					)}

					{/* User Actions */}
					<div className="rounded-lg bg-muted p-4">
						<p className="text-sm text-muted-foreground">You can try the following actions:</p>
						<ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
							<li>Refresh the page to try again</li>
							<li>Go back to the dashboard</li>
							<li>Clear your browser cache</li>
							<li>Contact support if the problem persists</li>
						</ul>
					</div>
				</CardContent>

				<CardFooter className="flex gap-2">
					<Button
						onClick={reset}
						variant="default"
						className="flex-1"
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Try Again
					</Button>
					<Button
						onClick={handleGoHome}
						variant="outline"
						className="flex-1"
					>
						<Home className="mr-2 h-4 w-4" />
						Go to Dashboard
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
