# 🛡️ Error Handling Guide

**Last Updated:** February 19, 2026  
**Status:** ✅ Implemented

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Error Boundary Components](#error-boundary-components)
3. [Next.js Error Pages](#nextjs-error-pages)
4. [Error Handling Utilities](#error-handling-utilities)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Integration with Error Tracking Services](#integration-with-error-tracking-services)

---

## Overview

The application implements a comprehensive error handling strategy with multiple layers:

1. **Global Error Boundary** - Catches all React errors
2. **Feature-Level Error Boundaries** - Isolates errors to specific features
3. **Next.js Error Pages** - Handles routing and server errors
4. **Error Utilities** - Centralized error logging and handling

---

## Error Boundary Components

### 1. Global Error Boundary

**Location:** `src/components/ErrorBoundary.tsx`

**Purpose:** Catches JavaScript errors anywhere in the component tree.

**Features:**

- Full-page error UI
- Error logging to external services
- Development mode error details
- User-friendly error messages
- Reset and navigation actions

**Usage:**

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
	return (
		<ErrorBoundary>
			<YourApp />
		</ErrorBoundary>
	);
}
```

**With Custom Fallback:**

```tsx
<ErrorBoundary
	fallback={<CustomErrorUI />}
	onError={(error, errorInfo) => {
		// Custom error handling
		console.log("Error caught:", error);
	}}
>
	<YourComponent />
</ErrorBoundary>
```

**Hook Usage:**

```tsx
import { useErrorBoundary } from "@/components/ErrorBoundary";

function MyComponent() {
	const { showBoundary } = useErrorBoundary();

	const handleRiskyOperation = async () => {
		try {
			await riskyOperation();
		} catch (error) {
			showBoundary(error);
		}
	};

	return <button onClick={handleRiskyOperation}>Do Something</button>;
}
```

---

### 2. Feature-Level Error Boundary

**Location:** `src/components/FeatureErrorBoundary.tsx`

**Purpose:** Isolates errors to specific features without breaking the entire page.

**Features:**

- Less intrusive error UI (Alert component)
- Feature-specific error logging
- Quick retry functionality
- Doesn't break the entire page

**Usage:**

```tsx
import { FeatureErrorBoundary } from "@/components/FeatureErrorBoundary";

function ProjectsPage() {
	return (
		<div>
			<h1>Projects</h1>
			<FeatureErrorBoundary featureName="Projects">
				<ProjectList />
			</FeatureErrorBoundary>
		</div>
	);
}
```

**With HOC:**

```tsx
import { withFeatureErrorBoundary } from "@/components/FeatureErrorBoundary";

function ProjectList() {
	// Component code
}

export default withFeatureErrorBoundary(ProjectList, "Projects");
```

---

## Next.js Error Pages

### 1. Error Page (error.tsx)

**Location:** `src/app/error.tsx`

**Purpose:** Catches errors in the app directory (client-side).

**Features:**

- Automatic error boundary for Next.js routes
- Error digest for tracking
- Reset functionality
- Development mode stack traces

**Automatically Used By:**

- All pages in the app directory
- Client-side navigation errors
- Component rendering errors

---

### 2. Global Error Page (global-error.tsx)

**Location:** `src/app/global-error.tsx`

**Purpose:** Catches errors in the root layout.

**Features:**

- Catches errors that escape the root layout
- Must define its own `<html>` and `<body>` tags
- Last line of defense for errors

**Note:** This is rarely triggered but critical for production stability.

---

### 3. Not Found Page (not-found.tsx)

**Location:** `src/app/not-found.tsx`

**Purpose:** Handles 404 errors (page not found).

**Features:**

- User-friendly 404 message
- Navigation options
- Helpful suggestions

---

## Error Handling Utilities

**Location:** `src/lib/errorHandling.ts`

### Functions

#### 1. `logError(error, context?)`

Logs errors to external services (Sentry, Bugsnag, etc.)

```tsx
import { logError } from "@/lib/errorHandling";

try {
	await riskyOperation();
} catch (error) {
	logError(error, { userId: user.id, action: "create_project" });
}
```

#### 2. `handleApiError(error)`

Converts API errors to user-friendly messages

```tsx
import { handleApiError } from "@/lib/errorHandling";

try {
	await api.createProject(data);
} catch (error) {
	const message = handleApiError(error);
	toast.error(message); // "Session expired. Please login again."
}
```

#### 3. `retryWithBackoff(fn, maxRetries?, baseDelay?)`

Retries failed operations with exponential backoff

```tsx
import { retryWithBackoff } from "@/lib/errorHandling";

const data = await retryWithBackoff(
	() => api.fetchProjects(),
	3, // max retries
	1000, // base delay (ms)
);
```

#### 4. `safeJsonParse(json, fallback)`

Safely parses JSON with fallback

```tsx
import { safeJsonParse } from "@/lib/errorHandling";

const data = safeJsonParse(jsonString, { default: "value" });
```

#### 5. `withErrorHandling(fn, context?)`

Wraps async functions with error handling

```tsx
import { withErrorHandling } from "@/lib/errorHandling";

const safeCreateProject = withErrorHandling(
	async (data) => {
		return await api.createProject(data);
	},
	{ feature: "projects" },
);
```

#### 6. Error Type Checkers

- `isNetworkError(error)` - Check if error is network-related
- `isAuthError(error)` - Check if error is 401/403
- `isValidationError(error)` - Check if error is 422

```tsx
import { isAuthError, isNetworkError } from "@/lib/errorHandling";

try {
	await api.fetchData();
} catch (error) {
	if (isAuthError(error)) {
		router.push("/login");
	} else if (isNetworkError(error)) {
		toast.error("Network error. Please check your connection.");
	}
}
```

---

## Usage Examples

### Example 1: Protecting a Feature Module

```tsx
// src/features/projects/components/ProjectList.tsx
import { FeatureErrorBoundary } from "@/components/FeatureErrorBoundary";

export function ProjectsPage() {
	return (
		<div className="space-y-4">
			<h1>Projects</h1>

			{/* Wrap each feature section */}
			<FeatureErrorBoundary featureName="Project List">
				<ProjectList />
			</FeatureErrorBoundary>

			<FeatureErrorBoundary featureName="Project Stats">
				<ProjectStats />
			</FeatureErrorBoundary>
		</div>
	);
}
```

### Example 2: API Error Handling with TanStack Query

```tsx
import { useMutation } from "@tanstack/react-query";
import { handleApiError } from "@/lib/errorHandling";
import { toast } from "sonner";

export function useCreateProject() {
	return useMutation({
		mutationFn: (data) => api.createProject(data),
		onError: (error) => {
			const message = handleApiError(error);
			toast.error(message);
		},
		onSuccess: () => {
			toast.success("Project created successfully");
		},
	});
}
```

### Example 3: Retry Failed Requests

```tsx
import { retryWithBackoff, isNetworkError } from "@/lib/errorHandling";

export async function fetchCriticalData() {
	try {
		return await retryWithBackoff(
			() => api.fetchCriticalData(),
			3, // retry 3 times
			1000, // start with 1 second delay
		);
	} catch (error) {
		if (isNetworkError(error)) {
			toast.error("Network error. Please check your connection.");
		} else {
			toast.error("Failed to load data. Please try again.");
		}
		throw error;
	}
}
```

### Example 4: Wrapping Root Layout

```tsx
// src/app/layout.tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<ErrorBoundary>
					<Providers>{children}</Providers>
				</ErrorBoundary>
			</body>
		</html>
	);
}
```

---

## Best Practices

### 1. Error Boundary Placement

✅ **DO:**

- Wrap the entire app in a global error boundary
- Add feature-level boundaries for critical features
- Place boundaries at route boundaries
- Wrap third-party components

❌ **DON'T:**

- Over-nest error boundaries (causes performance issues)
- Place boundaries inside loops
- Wrap every single component

### 2. Error Messages

✅ **DO:**

- Use user-friendly language
- Provide actionable steps
- Hide technical details in production
- Show error IDs for support

❌ **DON'T:**

- Expose sensitive information
- Show stack traces in production
- Use technical jargon
- Blame the user

### 3. Error Logging

✅ **DO:**

- Log all errors to external service
- Include context (user ID, action, etc.)
- Log error severity levels
- Track error frequency

❌ **DON'T:**

- Log sensitive data (passwords, tokens)
- Log PII without consent
- Ignore errors silently
- Over-log (causes noise)

### 4. Error Recovery

✅ **DO:**

- Provide retry functionality
- Offer navigation options
- Save user data before crash
- Use optimistic updates

❌ **DON'T:**

- Force page reload
- Lose user data
- Block the entire UI
- Retry indefinitely

---

## Integration with Error Tracking Services

### Sentry Integration (Recommended)

1. **Install Sentry:**

```bash
npm install @sentry/nextjs
```

2. **Initialize Sentry:**

```tsx
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.NODE_ENV,
	tracesSampleRate: 1.0,
});
```

3. **Update Error Boundary:**

```tsx
// src/components/ErrorBoundary.tsx
import * as Sentry from "@sentry/nextjs";

logErrorToService(error: Error, errorInfo: ErrorInfo): void {
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```

4. **Update Error Utilities:**

```tsx
// src/lib/errorHandling.ts
import * as Sentry from "@sentry/nextjs";

export function logError(error: Error, context?: Record<string, unknown>): void {
	Sentry.captureException(error, {
		contexts: {
			custom: context,
		},
	});
}
```

### Alternative Services

- **Bugsnag:** Similar to Sentry, good for mobile apps
- **LogRocket:** Session replay + error tracking
- **Rollbar:** Real-time error monitoring
- **Custom API:** Send errors to your own backend

---

## Error Handling Checklist

### Development

- [ ] Error boundaries wrap critical features
- [ ] Development mode shows detailed errors
- [ ] Console logs all errors
- [ ] Error messages are clear and helpful

### Production

- [ ] Stack traces are hidden
- [ ] Errors are logged to external service
- [ ] User-friendly error messages
- [ ] Error IDs for support tracking
- [ ] Retry functionality works
- [ ] Navigation options available

### Testing

- [ ] Test error boundaries with intentional errors
- [ ] Test API error handling
- [ ] Test network error scenarios
- [ ] Test 404 pages
- [ ] Test global error page
- [ ] Test error recovery

---

## Troubleshooting

### Error Boundary Not Catching Errors

**Problem:** Error boundary doesn't catch the error.

**Solutions:**

1. Error boundaries only catch errors in:
    - Rendering
    - Lifecycle methods
    - Constructors

2. They DON'T catch:
    - Event handlers (use try-catch)
    - Async code (use try-catch)
    - Server-side rendering errors
    - Errors in the error boundary itself

**Example:**

```tsx
// ❌ Won't be caught by error boundary
<button onClick={() => {
  throw new Error("Error in event handler");
}}>
  Click
</button>

// ✅ Will be caught
<button onClick={() => {
  try {
    throw new Error("Error in event handler");
  } catch (error) {
    showBoundary(error);
  }
}}>
  Click
</button>
```

### Error Boundary Causes Infinite Loop

**Problem:** Error boundary keeps re-rendering.

**Solutions:**

1. Check if error is thrown in `componentDidCatch`
2. Ensure `getDerivedStateFromError` doesn't throw
3. Check if fallback UI throws errors

---

## Future Improvements

- [ ] Add error analytics dashboard
- [ ] Implement error rate limiting
- [ ] Add user feedback on errors
- [ ] Implement offline error queue
- [ ] Add error categorization
- [ ] Implement smart error recovery
- [ ] Add A/B testing for error messages

---

**Status:** ✅ Fully Implemented  
**Coverage:** Global + Feature-Level + Next.js Pages  
**Integration:** Ready for Sentry/Bugsnag  
**Documentation:** Complete
