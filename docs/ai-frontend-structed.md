# 🏗️ Frontend Architecture Guide - Business OS (ERP/CRM)

> **Version:** 1.0.0  
> **Last Updated:** January 2026  
> **Framework:** Next.js 16.1.1 + React 19

---

## 📚 Table of Contents

1. [Tech Stack & Justification](#-tech-stack--justification)
2. [Project Structure](#-project-structure)
3. [Architecture Patterns](#-architecture-patterns)
4. [AI Instructions](#-ai-instructions-for-kiro--cursor)
5. [Improvements Roadmap](#-improvements-roadmap)
6. [Code Examples](#-code-examples)

---

## 🛠️ Tech Stack & Justification

### Core Framework

| Technology     | Version | Why We Use It                                                 |
| -------------- | ------- | ------------------------------------------------------------- |
| **Next.js**    | 16.1.1  | App Router, RSC, built-in optimizations, excellent DX         |
| **React**      | 19.2.3  | Latest features: Actions, useOptimistic, improved Suspense    |
| **TypeScript** | 5.x     | Type safety, better IDE support, catch errors at compile time |

### Styling & UI

| Technology         | Version | Why We Use It                                          |
| ------------------ | ------- | ------------------------------------------------------ |
| **Tailwind CSS**   | 4.x     | Utility-first, fast development, small bundle size     |
| **Shadcn/UI**      | Latest  | Accessible, customizable, copy-paste components        |
| **Radix UI**       | Various | Headless, accessible primitives for complex components |
| **Lucide React**   | 0.562.0 | Consistent, lightweight icon library                   |
| **tw-animate-css** | 1.4.0   | Pre-built animations for Tailwind                      |

### State Management

| Technology          | Version | Why We Use It                                           |
| ------------------- | ------- | ------------------------------------------------------- |
| **Zustand**         | 5.0.9   | Lightweight global state, simple API, no boilerplate    |
| **TanStack Query**  | 5.90.12 | Server state, caching, background refetching, mutations |
| **React Hook Form** | 7.69.0  | Performant forms, minimal re-renders                    |
| **Zod**             | 4.2.1   | Schema validation, TypeScript inference                 |

### Data & API

| Technology         | Version | Why We Use It                                              |
| ------------------ | ------- | ---------------------------------------------------------- |
| **Axios**          | 1.13.2  | HTTP client with interceptors, request/response transforms |
| **TanStack Table** | 8.21.3  | Headless table with sorting, filtering, pagination         |
| **date-fns**       | 4.1.0   | Lightweight date manipulation, tree-shakeable              |

### Real-time & Communication

| Technology       | Version | Why We Use It                             |
| ---------------- | ------- | ----------------------------------------- |
| **Laravel Echo** | 2.2.7   | WebSocket client for Laravel Broadcasting |
| **Pusher JS**    | 8.4.0   | Real-time notifications, timer sync       |

### Drag & Drop

| Technology            | Version | Why We Use It                      |
| --------------------- | ------- | ---------------------------------- |
| **@dnd-kit/core**     | 6.3.1   | Modern DnD, accessible, performant |
| **@dnd-kit/sortable** | 10.0.0  | Sortable lists (Kanban boards)     |

### Charts & Visualization

| Technology   | Version | Why We Use It                              |
| ------------ | ------- | ------------------------------------------ |
| **Recharts** | 2.15.4  | React-based charts, composable, responsive |

### Testing

| Technology          | Version | Why We Use It                             |
| ------------------- | ------- | ----------------------------------------- |
| **Vitest**          | 4.0.16  | Fast, Vite-native, Jest-compatible        |
| **Testing Library** | 16.3.1  | User-centric testing, accessibility focus |
| **fast-check**      | 4.5.2   | Property-based testing                    |

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router (Routing Only)
│   ├── (client)/                 # Client Portal Layout Group
│   │   ├── client/               # Client pages
│   │   └── layout.tsx            # Simplified client layout
│   ├── (dashboard)/              # Dashboard Layout Group
│   │   ├── dashboard/            # Dashboard pages
│   │   └── layout.tsx            # Full dashboard layout
│   ├── login/                    # Auth pages
│   ├── unauthorized/             # Error pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home redirect
│   └── providers.tsx             # App providers (Query, Theme)
│
├── components/                   # Shared UI Components
│   ├── ui/                       # Shadcn/UI primitives
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── shared/                   # Reusable business components
│   │   ├── data-display/         # DataTable, Pagination, EmptyState
│   │   ├── dialogs/              # ConfirmDialog, FormDialog
│   │   ├── filters/              # FilterBar, SearchInput
│   │   ├── forms/                # FormInput, FormSelect, DatePicker
│   │   └── index.ts              # Barrel export
│   ├── dashboard/                # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   ├── NavbarTimer.tsx           # Global timer widget
│   ├── NotificationDropdown.tsx  # Notifications
│   ├── ProtectedRoute.tsx        # Auth guard
│   └── ThemeToggle.tsx           # Dark/Light mode
│
├── features/                     # Feature-Based Modules
│   ├── admin/                    # System administration
│   ├── auth/                     # Authentication
│   ├── client-portal/            # Client-facing features
│   ├── clients/                  # Client management
│   ├── dashboard/                # Main dashboard
│   ├── hr/                       # Human resources
│   ├── invoices/                 # Invoice management
│   ├── monitoring/               # Reports & analytics
│   ├── performance/              # Performance tracking
│   ├── profile/                  # User profile
│   ├── projects/                 # Project management
│   └── sales/                    # Sales & quotations
│
├── hooks/                        # Global custom hooks
│   ├── useNotificationSocket.ts  # Real-time notifications
│   └── useTimerSocket.ts         # Timer sync
│
├── lib/                          # Utilities & Configuration
│   ├── axios.ts                  # HTTP client setup
│   ├── echo.ts                   # WebSocket setup
│   ├── utils.ts                  # cn() and helpers
│   ├── formatters.ts             # Number/date formatters
│   ├── dateUtils.ts              # Date helpers
│   └── statusHelpers.ts          # Status utilities
│
├── store/                        # Zustand Global Stores
│   ├── authStore.ts              # User, token, permissions
│   ├── timerStore.ts             # Active timer state
│   ├── notificationStore.ts      # Notifications
│   └── sidebarStore.ts           # Sidebar state
│
└── test/                         # Test configuration
    └── setup.ts                  # Vitest setup
```

### Feature Module Structure

Each feature follows this consistent structure:

```
src/features/[feature-name]/
├── api/                    # API calls (TanStack Query)
│   ├── index.ts            # Barrel export
│   ├── [entity]Api.ts      # API functions
│   └── endpoints.ts        # API endpoint constants
│
├── components/             # Feature-specific UI
│   ├── index.ts            # Barrel export
│   ├── [Entity]List.tsx    # List view
│   ├── [Entity]Form.tsx    # Create/Edit form
│   ├── [Entity]Card.tsx    # Card component
│   └── columns/            # Table column definitions
│
├── hooks/                  # Feature-specific hooks
│   ├── index.ts            # Barrel export
│   ├── use[Entity].ts      # Single entity hook
│   ├── use[Entities].ts    # List hook
│   └── useCreate[Entity].ts # Mutation hook
│
├── types/                  # TypeScript types
│   ├── index.ts            # Barrel export
│   └── [entity].ts         # Entity types
│
├── schemas/                # Zod validation schemas
│   ├── index.ts            # Barrel export
│   └── [entity]Schema.ts   # Form schemas
│
├── helpers/                # Feature utilities
│   ├── index.ts            # Barrel export
│   └── [entity]Helpers.ts  # Helper functions
│
├── constants/              # Static data (NEW)
│   ├── index.ts            # Barrel export
│   └── [entity]Constants.ts # Enums, options
│
└── index.ts                # Feature barrel export
```

---

## 🏛️ Architecture Patterns

### 1. Feature-Based Architecture

**Why:** Colocation of related code improves maintainability and reduces cognitive load.

```typescript
// ✅ Good - Import from feature
import { LeadKanban, useLeads, Lead } from "@/features/sales";

// ❌ Bad - Deep imports
import { LeadKanban } from "@/features/sales/components/LeadKanban";
import { useLeads } from "@/features/sales/hooks/useLeads";
import { Lead } from "@/features/sales/types/lead";
```

### 2. Server State with TanStack Query

**Why:** Automatic caching, background refetching, optimistic updates.

```typescript
// Hook pattern
export function useProjects(filters?: ProjectFilters) {
	return useQuery({
		queryKey: ["projects", filters],
		queryFn: () => projectsApi.getAll(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Mutation pattern
export function useCreateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: projectsApi.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			toast.success("Project created");
		},
	});
}
```

### 3. Global State with Zustand

**Why:** Simple API, no boilerplate, TypeScript-friendly.

```typescript
// Store pattern
interface AuthState {
	user: User | null;
	token: string | null;
	setAuth: (data: AuthData) => void;
	logout: () => void;
	hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			// state and actions
		}),
		{ name: "auth-storage" }
	)
);
```

### 4. Form Handling with React Hook Form + Zod

**Why:** Performant, type-safe, excellent validation.

```typescript
// Schema
const projectSchema = z.object({
	name: z.string().min(1, "Required"),
	clientId: z.number().positive(),
	deadline: z.date().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Component
function ProjectForm() {
	const form = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
	});

	return <Form {...form}>...</Form>;
}
```

### 5. API Response Convention

**Backend returns:**

```json
{
  "success": true,
  "message": "Projects retrieved",
  "data": {
    "projects": [...],
    "pagination": {
      "total": 100,
      "perPage": 10,
      "currentPage": 1,
      "totalPages": 10
    }
  }
}
```

**Frontend types:**

```typescript
interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

interface PaginatedData<T> {
	items: T[];
	pagination: PaginationMeta;
}
```

---

## 🤖 AI Instructions (for Kiro / Cursor)

### General Rules

```yaml
# When working on this frontend codebase:

1. ALWAYS use TypeScript with strict types
2. ALWAYS use camelCase for variables, functions, and API responses
3. ALWAYS use PascalCase for components and types
4. NEVER use `any` type - use `unknown` and narrow types
5. ALWAYS handle loading, error, and empty states
6. ALWAYS use barrel exports (index.ts) for imports
7. PREFER server components unless client interactivity needed
8. USE "use client" directive only when necessary
```

### Component Creation Rules

````yaml
# When creating a new component:

1. Place in correct location:
   - Shared UI → src/components/shared/
   - Feature-specific → src/features/[feature]/components/
   - Shadcn primitives → src/components/ui/

2. File naming:
   - Components: PascalCase.tsx (e.g., ProjectCard.tsx)
   - Hooks: camelCase.ts (e.g., useProjects.ts)
   - Types: camelCase.ts (e.g., project.ts)
   - Utils: camelCase.ts (e.g., formatters.ts)

3. Component structure:
   ```tsx
   "use client"; // Only if needed

   import { ... } from "react";
   import { ... } from "@/components/ui";
   import { ... } from "@/features/[feature]";

   interface ComponentProps {
     // Props with JSDoc comments
   }

   export function Component({ prop }: ComponentProps) {
     // Hooks first
     // Handlers second
     // Return JSX
   }
````

4. Export from index.ts:
    ```typescript
    export { Component } from "./Component";
    ```

````

### Feature Creation Rules

```yaml
# When creating a new feature:

1. Create folder structure:
   src/features/[feature-name]/
   ├── api/
   ├── components/
   ├── hooks/
   ├── types/
   ├── schemas/
   ├── helpers/
   ├── constants/
   └── index.ts

2. Create index.ts with all exports:
   ```typescript
   // Components
   export { EntityList } from "./components/EntityList";

   // Hooks
   export { useEntities } from "./hooks/useEntities";

   // Types
   export type { Entity } from "./types";

   // Schemas
   export { entitySchema } from "./schemas";

   // API
   export { entityApi } from "./api";
````

3. Create types first, then API, then hooks, then components

````

### API & Data Fetching Rules

```yaml
# When working with API:

1. API functions go in features/[feature]/api/:
   ```typescript
   export const projectsApi = {
     getAll: (filters?: Filters) =>
       api.get<ApiResponse<ProjectsData>>("/projects", { params: filters }),

     getById: (id: number) =>
       api.get<ApiResponse<Project>>(`/projects/${id}`),

     create: (data: CreateProjectData) =>
       api.post<ApiResponse<Project>>("/projects", data),
   };
````

2. Hooks wrap API with TanStack Query:

    ```typescript
    export function useProjects(filters?: Filters) {
    	return useQuery({
    		queryKey: ["projects", filters],
    		queryFn: () => projectsApi.getAll(filters).then((r) => r.data.data),
    	});
    }
    ```

3. Mutations invalidate related queries:
    ```typescript
    export function useCreateProject() {
    	const queryClient = useQueryClient();
    	return useMutation({
    		mutationFn: projectsApi.create,
    		onSuccess: () => {
    			queryClient.invalidateQueries({ queryKey: ["projects"] });
    		},
    	});
    }
    ```

````

### Form Rules

```yaml
# When creating forms:

1. Define Zod schema in schemas/:
   ```typescript
   export const projectSchema = z.object({
     name: z.string().min(1, "Name is required"),
     clientId: z.number({ required_error: "Client is required" }),
     deadline: z.date().optional(),
   });

   export type ProjectFormData = z.infer<typeof projectSchema>;
````

2. Use React Hook Form with zodResolver:

    ```typescript
    const form = useForm<ProjectFormData>({
    	resolver: zodResolver(projectSchema),
    	defaultValues: { name: "", clientId: undefined },
    });
    ```

3. Use Shadcn Form components:
    ```tsx
    <Form {...form}>
    	<FormField
    		control={form.control}
    		name="name"
    		render={({ field }) => (
    			<FormItem>
    				<FormLabel>Name</FormLabel>
    				<FormControl>
    					<Input {...field} />
    				</FormControl>
    				<FormMessage />
    			</FormItem>
    		)}
    	/>
    </Form>
    ```

````

### State Management Rules

```yaml
# When managing state:

1. Server state → TanStack Query (useQuery, useMutation)
2. Global client state → Zustand (auth, timer, sidebar)
3. Local component state → useState
4. Form state → React Hook Form
5. URL state → useSearchParams

# Zustand store pattern:
```typescript
interface StoreState {
  // State
  items: Item[];
  isLoading: boolean;

  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
}

export const useStore = create<StoreState>((set) => ({
  items: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
}));
````

````

### Styling Rules

```yaml
# When styling components:

1. Use Tailwind CSS utility classes
2. Use cn() for conditional classes:
   ```typescript
   import { cn } from "@/lib/utils";

   <div className={cn(
     "base-classes",
     isActive && "active-classes",
     variant === "primary" && "primary-classes"
   )} />
````

3. Use Shadcn variants with cva():

    ```typescript
    const buttonVariants = cva("base-classes", {
    	variants: {
    		variant: {
    			default: "...",
    			destructive: "...",
    		},
    		size: {
    			default: "...",
    			sm: "...",
    		},
    	},
    	defaultVariants: {
    		variant: "default",
    		size: "default",
    	},
    });
    ```

4. Dark mode: Use Tailwind dark: prefix
    ```tsx
    <div className="bg-white dark:bg-gray-900" />
    ```

```

---

```

## 📈 Improvements Roadmap

### ✅ Current Strengths

| Area                       | Status       | Notes                  |
| -------------------------- | ------------ | ---------------------- |
| Feature-based architecture | ✅ Excellent | Well-organized modules |
| Shadcn/UI integration      | ✅ Excellent | Full component library |
| TanStack Query setup       | ✅ Good      | Proper caching         |
| Zustand stores             | ✅ Good      | Clean state management |
| TypeScript usage           | ✅ Good      | Strict typing          |
| Real-time (WebSocket)      | ✅ Good      | Timer & notifications  |

### 🔧 Required Improvements

#### Priority 1: Critical (Do First)

| Task                          | Location     | Impact             |
| ----------------------------- | ------------ | ------------------ |
| Add barrel exports (index.ts) | All features | Cleaner imports    |
| Create shared types           | `src/types/` | Reduce duplication |
| Consolidate hooks             | `src/hooks/` | Single location    |

**Features needing index.ts:**

-   [ ] `admin`
-   [ ] `client-portal`
-   [ ] `clients`
-   [ ] `hr`
-   [ ] `invoices`
-   [ ] `monitoring`
-   [ ] `projects`
-   [ ] `sales`

#### Priority 2: Important (Do Soon)

| Task                  | Location               | Impact                |
| --------------------- | ---------------------- | --------------------- |
| Add constants folders | Each feature           | Organized static data |
| Create route config   | `src/config/routes.ts` | Centralized routing   |
| Add Error Boundary    | `src/components/`      | Better error handling |

#### Priority 3: Nice to Have

| Task                    | Location                           | Impact                  |
| ----------------------- | ---------------------------------- | ----------------------- |
| Add skeleton components | `src/components/shared/skeletons/` | Better loading UX       |
| Add e2e tests           | `e2e/`                             | Confidence in releases  |
| Add Storybook           | `stories/`                         | Component documentation |

---

## 📝 Code Examples

### Example: Feature Index File

```typescript
// src/features/projects/index.ts

// ============================================
// Components
// ============================================
export { ProjectList } from "./components/projects/ProjectList";
export { ProjectCard } from "./components/projects/ProjectCard";
export { ProjectForm } from "./components/projects/ProjectForm";
export { ProjectDetails } from "./components/ProjectDetails";
export { ProjectDetailsTabs } from "./components/ProjectDetailsTabs";
export { ProjectStatusBadge } from "./components/ProjectStatusBadge";

// Tasks
export { TaskTree } from "./components/tasks/TaskTree";
export { TaskCard } from "./components/tasks/TaskCard";
export { TaskForm } from "./components/tasks/TaskForm";

// Wiki
export { WikiList } from "./components/WikiList";
export { WikiViewer } from "./components/WikiViewer";

// History
export { HistoryLog } from "./components/HistoryLog";

// ============================================
// Hooks
// ============================================
export { useProjects } from "./hooks/useProjects";
export { useProject } from "./hooks/useProject";
export { useCreateProject } from "./hooks/useCreateProject";
export { useUpdateProject } from "./hooks/useUpdateProject";
export { useDeleteProject } from "./hooks/useDeleteProject";

// Tasks
export { useTasks } from "./hooks/useTasks";
export { useTask } from "./hooks/useTask";

// Wiki
export { useWikis } from "./hooks/useWikis";

// ============================================
// Types
// ============================================
export type { Project, ProjectStatus, ProjectFilters, CreateProjectData, UpdateProjectData } from "./types/project";

export type { Task, TaskStatus, TaskPriority } from "./types/task";

export type { Wiki, WikiFormData } from "./types/wiki";

// ============================================
// Schemas
// ============================================
export { projectSchema, taskSchema, wikiSchema } from "./schemas";

// ============================================
// API
// ============================================
export { projectsApi } from "./api/projectsApi";
export { tasksApi } from "./api/tasksApi";
export { wikisApi } from "./api/wikisApi";

// ============================================
// Helpers
// ============================================
export { calculateProjectProgress, getProjectStatusColor } from "./helpers/projectHelpers";

// ============================================
// Constants
// ============================================
export { PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from "./constants";
```

### Example: Shared Types

```typescript
// src/types/api.ts

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

/**
 * API error response
 */
export interface ApiError {
	success: false;
	message: string;
	errors?: Record<string, string[]>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
	items: T[];
	pagination: PaginationMeta;
}

/**
 * Common filter parameters
 */
export interface BaseFilters {
	search?: string;
	page?: number;
	perPage?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}
```

```typescript
// src/types/common.ts

/**
 * Entity with audit fields
 */
export interface AuditableEntity {
	createdAt: string;
	updatedAt: string;
	createdBy?: number;
	updatedBy?: number;
}

/**
 * Select option for dropdowns
 */
export interface SelectOption<T = string> {
	label: string;
	value: T;
}

/**
 * Status with color
 */
export interface StatusConfig {
	label: string;
	value: string;
	color: "default" | "success" | "warning" | "destructive";
}
```

### Example: Route Configuration

```typescript
// src/config/routes.ts

export const ROUTES = {
	// Auth
	LOGIN: "/login",
	UNAUTHORIZED: "/unauthorized",

	// Dashboard
	DASHBOARD: "/dashboard",

	// Projects
	PROJECTS: "/dashboard/projects",
	PROJECT_DETAILS: (id: number) => `/dashboard/projects/${id}`,
	PROJECT_TASKS: (id: number) => `/dashboard/projects/${id}/tasks`,
	PROJECT_WIKI: (id: number) => `/dashboard/projects/${id}/wiki`,

	// Sales
	LEADS: "/dashboard/sales/leads",
	LEAD_DETAILS: (id: number) => `/dashboard/sales/leads/${id}`,
	QUOTATIONS: "/dashboard/sales/quotations",
	QUOTATION_DETAILS: (id: number) => `/dashboard/sales/quotations/${id}`,
	CONTRACTS: "/dashboard/sales/contracts",

	// Clients
	CLIENTS: "/dashboard/clients",
	CLIENT_DETAILS: (id: number) => `/dashboard/clients/${id}`,

	// HR
	EMPLOYEES: "/dashboard/hr/employees",
	ATTENDANCE: "/dashboard/hr/attendance",

	// Admin
	USERS: "/dashboard/admin/users",
	ROLES: "/dashboard/admin/roles",
	SETTINGS: "/dashboard/admin/settings",

	// Client Portal
	CLIENT_PORTAL: "/client",
	CLIENT_PROJECTS: "/client/projects",
	CLIENT_INVOICES: "/client/invoices",
} as const;

export type RouteKey = keyof typeof ROUTES;
```

### Example: Constants File

```typescript
// src/features/projects/constants/index.ts

import { StatusConfig } from "@/types/common";

export const PROJECT_STATUSES: StatusConfig[] = [
	{ label: "Draft", value: "draft", color: "default" },
	{ label: "In Progress", value: "in_progress", color: "warning" },
	{ label: "UI/UX Phase", value: "ui_ux", color: "warning" },
	{ label: "Development", value: "development", color: "warning" },
	{ label: "Testing", value: "testing", color: "warning" },
	{ label: "Completed", value: "completed", color: "success" },
	{ label: "On Hold", value: "on_hold", color: "destructive" },
];

export const TASK_PRIORITIES: StatusConfig[] = [
	{ label: "Low", value: "low", color: "default" },
	{ label: "Medium", value: "medium", color: "warning" },
	{ label: "High", value: "high", color: "destructive" },
	{ label: "Urgent", value: "urgent", color: "destructive" },
];

export const TASK_STATUSES: StatusConfig[] = [
	{ label: "To Do", value: "todo", color: "default" },
	{ label: "In Progress", value: "in_progress", color: "warning" },
	{ label: "In Review", value: "in_review", color: "warning" },
	{ label: "Testing", value: "testing", color: "warning" },
	{ label: "Done", value: "done", color: "success" },
];

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
```

---

## 🔐 Security Considerations

1. **Token Storage:** Stored in localStorage with Zustand persist
2. **API Interceptors:** Auto-attach Bearer token, handle 401
3. **Protected Routes:** `ProtectedRoute` component checks auth
4. **Permission Checks:** `hasPermission()` in authStore
5. **Client Portal Isolation:** Separate layout group `(client)/`

---

## 📚 Related Documentation

-   [Backend API Documentation](/erp-backend/docs/)
-   [Project Rules](/PROJECT_RULES.md)
-   [Execution Plan](/EXECUTION_PLAN.md)
-   [Tech Stack Overview](/tech.md)

---

> **Note for AI Assistants:** Always follow the patterns established in this document. When in doubt, check existing implementations in the codebase for reference.
