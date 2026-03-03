"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Next.js 13+ Global Error Page
 *
 * This catches errors in the root layout.
 * It must define its own <html> and <body> tags.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Log error to console
		console.error("Global Error:", error);

		// Log error to external service
		logErrorToService(error);
	}, [error]);

	function logErrorToService(error: Error & { digest?: string }) {
		// TODO: Integrate with error tracking service
		console.error("Global error logged:", {
			message: error.message,
			stack: error.stack,
			digest: error.digest,
			timestamp: new Date().toISOString(),
		});
	}

	return (
		<html>
			<body>
				<div
					style={{
						display: "flex",
						minHeight: "100vh",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#f9fafb",
						padding: "1rem",
					}}
				>
					<div
						style={{
							width: "100%",
							maxWidth: "42rem",
							backgroundColor: "white",
							borderRadius: "0.5rem",
							boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
							padding: "2rem",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
							<AlertTriangle style={{ width: "1.5rem", height: "1.5rem", color: "#ef4444" }} />
							<h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Critical Error</h1>
						</div>

						<p style={{ marginTop: "0.5rem", color: "#6b7280" }}>A critical error occurred. Please refresh the page or contact support.</p>

						<div
							style={{
								marginTop: "1rem",
								padding: "1rem",
								backgroundColor: "#fee2e2",
								borderRadius: "0.5rem",
							}}
						>
							<p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#dc2626" }}>{error.message || "An unexpected error occurred"}</p>
							{error.digest && <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#9ca3af" }}>Error ID: {error.digest}</p>}
						</div>

						{process.env.NODE_ENV === "development" && (
							<details
								style={{
									marginTop: "1rem",
									padding: "1rem",
									backgroundColor: "#f3f4f6",
									borderRadius: "0.5rem",
								}}
							>
								<summary style={{ cursor: "pointer", fontSize: "0.875rem", fontWeight: "500" }}>Error Details (Development Only)</summary>
								<pre
									style={{
										marginTop: "0.5rem",
										fontSize: "0.75rem",
										overflow: "auto",
										whiteSpace: "pre-wrap",
									}}
								>
									{error.stack}
								</pre>
							</details>
						)}

						<button
							onClick={reset}
							style={{
								marginTop: "1.5rem",
								width: "100%",
								padding: "0.5rem 1rem",
								backgroundColor: "#3b82f6",
								color: "white",
								border: "none",
								borderRadius: "0.375rem",
								fontSize: "0.875rem",
								fontWeight: "500",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "0.5rem",
							}}
						>
							<RefreshCw style={{ width: "1rem", height: "1rem" }} />
							Try Again
						</button>
					</div>
				</div>
			</body>
		</html>
	);
}
