"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		// Update state so the next render will show the fallback UI
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Log error to console in development
		if (process.env.NODE_ENV === "development") {
			console.error("ErrorBoundary caught an error:", error, errorInfo);
		}

		// Log error to external service (e.g., Sentry, LogRocket)
		this.logErrorToService(error, errorInfo);

		// Call custom error handler if provided
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}

		// Update state with error info
		this.setState({
			errorInfo,
		});
	}

	logErrorToService(error: Error, errorInfo: ErrorInfo): void {
		// TODO: Integrate with error tracking service (Sentry, Bugsnag, etc.)
		// Example:
		// Sentry.captureException(error, {
		//   contexts: {
		//     react: {
		//       componentStack: errorInfo.componentStack,
		//     },
		//   },
		// });

		// For now, just log to console
		console.error("Error logged:", {
			message: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
			timestamp: new Date().toISOString(),
		});
	}

	handleReset = (): void => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	handleGoHome = (): void => {
		window.location.href = "/dashboard";
	};

	render(): ReactNode {
		if (this.state.hasError) {
			// Custom fallback UI provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default fallback UI
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
							{this.state.error && (
								<div className="rounded-lg bg-destructive/10 p-4">
									<p className="text-sm font-medium text-destructive">{this.state.error.message}</p>
								</div>
							)}

							{/* Error Details (Development Only) */}
							{process.env.NODE_ENV === "development" && this.state.error && (
								<details className="rounded-lg bg-muted p-4">
									<summary className="cursor-pointer text-sm font-medium">Error Details (Development Only)</summary>
									<div className="mt-2 space-y-2">
										<div>
											<p className="text-xs font-medium text-muted-foreground">Stack Trace:</p>
											<pre className="mt-1 overflow-auto text-xs">{this.state.error.stack}</pre>
										</div>
										{this.state.errorInfo && (
											<div>
												<p className="text-xs font-medium text-muted-foreground">Component Stack:</p>
												<pre className="mt-1 overflow-auto text-xs">{this.state.errorInfo.componentStack}</pre>
											</div>
										)}
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
								onClick={this.handleReset}
								variant="default"
								className="flex-1"
							>
								<RefreshCw className="mr-2 h-4 w-4" />
								Try Again
							</Button>
							<Button
								onClick={this.handleGoHome}
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

		return this.props.children;
	}
}

/**
 * Hook to use error boundary programmatically
 *
 * Usage:
 * ```tsx
 * const { showBoundary } = useErrorBoundary();
 *
 * try {
 *   // risky operation
 * } catch (error) {
 *   showBoundary(error);
 * }
 * ```
 */
export function useErrorBoundary() {
	const [error, setError] = React.useState<Error | null>(null);

	React.useEffect(() => {
		if (error) {
			throw error;
		}
	}, [error]);

	const showBoundary = React.useCallback((error: Error) => {
		setError(error);
	}, []);

	const resetBoundary = React.useCallback(() => {
		setError(null);
	}, []);

	return {
		showBoundary,
		resetBoundary,
	};
}
