"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";

interface Props {
	children: ReactNode;
	featureName: string;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * Feature-Level Error Boundary Component
 *
 * A lightweight error boundary for specific features/modules.
 * Shows a less intrusive error message that doesn't break the entire page.
 *
 * Usage:
 * ```tsx
 * <FeatureErrorBoundary featureName="Projects">
 *   <ProjectList />
 * </FeatureErrorBoundary>
 * ```
 */
export class FeatureErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Log error to console in development
		if (process.env.NODE_ENV === "development") {
			console.error(`FeatureErrorBoundary (${this.props.featureName}) caught an error:`, error, errorInfo);
		}

		// Log error to external service
		this.logErrorToService(error, errorInfo);

		// Call custom error handler if provided
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	logErrorToService(error: Error, errorInfo: ErrorInfo): void {
		// TODO: Integrate with error tracking service
		console.error("Feature error logged:", {
			feature: this.props.featureName,
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
		});
	};

	render(): ReactNode {
		if (this.state.hasError) {
			// Custom fallback UI provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default fallback UI (less intrusive)
			return (
				<div className="p-4">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error in {this.props.featureName}</AlertTitle>
						<AlertDescription className="mt-2 space-y-2">
							<p>Something went wrong while loading this feature. Please try again.</p>
							{process.env.NODE_ENV === "development" && this.state.error && (
								<details className="mt-2">
									<summary className="cursor-pointer text-xs font-medium">Error Details (Development Only)</summary>
									<pre className="mt-1 overflow-auto text-xs">{this.state.error.message}</pre>
								</details>
							)}
							<Button
								onClick={this.handleReset}
								variant="outline"
								size="sm"
								className="mt-2"
							>
								<RefreshCw className="mr-2 h-3 w-3" />
								Try Again
							</Button>
						</AlertDescription>
					</Alert>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * Higher-Order Component to wrap features with error boundary
 *
 * Usage:
 * ```tsx
 * export default withFeatureErrorBoundary(ProjectList, "Projects");
 * ```
 */
export function withFeatureErrorBoundary<P extends object>(Component: React.ComponentType<P>, featureName: string) {
	return function WrappedComponent(props: P) {
		return (
			<FeatureErrorBoundary featureName={featureName}>
				<Component {...props} />
			</FeatureErrorBoundary>
		);
	};
}
