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
	function logErrorToService(currentError: Error & { digest?: string }) {
		// TODO: Integrate with error tracking service
		console.error("Global error logged:", {
			message: currentError.message,
			stack: currentError.stack,
			digest: currentError.digest,
			timestamp: new Date().toISOString(),
		});
	}

	useEffect(() => {
		// Log error to console
		console.error("Global Error:", error);

		// Log error to external service
		logErrorToService(error);
	}, [error]);

	return (
		<html style={{ colorScheme: "light dark" }}>
			<body style={{ margin: 0, fontFamily: "Arial, system-ui, sans-serif" }}>
				<div
					style={{
						display: "flex",
						minHeight: "100vh",
						alignItems: "center",
						justifyContent: "center",
						background: "radial-gradient(circle at 15% 0%, rgba(71, 214, 255, .18), transparent 35%), radial-gradient(circle at 90% 5%, rgba(0, 82, 255, .18), transparent 38%), light-dark(#f4f8ff, #020b1a)",
						color: "light-dark(#071426, #ffffff)",
						padding: "1rem",
					}}
				>
					<div
						style={{
							width: "100%",
							maxWidth: "42rem",
							backgroundColor: "light-dark(rgba(255, 255, 255, .88), rgba(4, 14, 29, .78))",
							border: "1px solid light-dark(rgba(15, 47, 89, .15), rgba(216, 227, 249, .15))",
							borderRadius: "1.5rem",
							boxShadow: "0 20px 50px -20px rgba(0, 31, 78, .35)",
							backdropFilter: "blur(18px)",
							padding: "2rem",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
							<AlertTriangle style={{ width: "1.5rem", height: "1.5rem", color: "light-dark(#b42318, #f87171)" }} />
							<h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Critical Error</h1>
						</div>

						<p style={{ marginTop: "0.5rem", color: "light-dark(#52657d, #c3c5d9)" }}>A critical error occurred. Please refresh the page or contact support.</p>

						<div
							style={{
								marginTop: "1rem",
								padding: "1rem",
								backgroundColor: "light-dark(rgba(180, 35, 24, .1), rgba(248, 113, 113, .1))",
								border: "1px solid light-dark(rgba(180, 35, 24, .2), rgba(248, 113, 113, .2))",
								borderRadius: "0.75rem",
							}}
						>
							<p style={{ fontSize: "0.875rem", fontWeight: "600", color: "light-dark(#b42318, #f87171)" }}>{error.message || "An unexpected error occurred"}</p>
							{error.digest && <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "light-dark(#52657d, #94a3b8)" }}>Error ID: {error.digest}</p>}
						</div>

						{process.env.NODE_ENV === "development" && (
							<details
								style={{
									marginTop: "1rem",
									padding: "1rem",
									backgroundColor: "light-dark(#e7f0ff, #0a192f)",
									borderRadius: "0.75rem",
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
								background: "linear-gradient(90deg, #0052ff 0%, #2b418f 100%)",
								color: "white",
								border: "none",
								borderRadius: "999px",
								fontSize: "0.875rem",
								fontWeight: "700",
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
