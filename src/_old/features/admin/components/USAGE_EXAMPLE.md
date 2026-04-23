# Admin Deliverable Management - Usage Example

## Overview

This document shows how to integrate the Admin Deliverable Actions component with your task deliverables list.

## Prerequisites

1. User must have `manage_deliverables` permission
2. Import the component from the admin feature barrel export

## Basic Integration

### 1. Import the Component

```typescript
import { AdminDeliverableActions } from "@/features/admin";
import { useAuthStore } from "@/store/authStore";
```

### 2. Check Permission

```typescript
const { hasPermission } = useAuthStore();
const canManageDeliverables = hasPermission("manage_deliverables");
```

### 3. Add to Deliverable List

```tsx
// In your TaskDeliverablesList component
import { AdminDeliverableActions } from "@/features/admin";
import { useAuthStore } from "@/store/authStore";

export function TaskDeliverablesList({ taskId }: { taskId: number }) {
	const { data: deliverables, isLoading } = useTaskDeliverables(taskId);
	const { hasPermission } = useAuthStore();
	const canManageDeliverables = hasPermission("manage_deliverables");

	if (isLoading) return <div>Loading...</div>;

	return (
		<div className="space-y-4">
			{deliverables?.map((deliverable) => (
				<div
					key={deliverable.deliverableId}
					className="flex items-center justify-between p-4 border rounded-lg"
				>
					<div className="flex-1">
						<h3 className="font-semibold">{deliverable.title}</h3>
						<p className="text-sm text-muted-foreground">{deliverable.description}</p>
						<div className="mt-2">
							<span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{deliverable.status.replace("_", " ").toUpperCase()}</span>
						</div>
					</div>

					{/* Admin Actions - Only visible to users with permission */}
					{canManageDeliverables && <AdminDeliverableActions deliverable={deliverable} />}
				</div>
			))}
		</div>
	);
}
```

## Advanced Integration with Table

```tsx
import { AdminDeliverableActions } from "@/features/admin";
import { useAuthStore } from "@/store/authStore";
import { ColumnDef } from "@tanstack/react-table";
import { TaskDeliverable } from "@/features/projects/types/taskDeliverable";

export function useDeliverableColumns() {
	const { hasPermission } = useAuthStore();
	const canManageDeliverables = hasPermission("manage_deliverables");

	const columns: ColumnDef<TaskDeliverable>[] = [
		{
			accessorKey: "title",
			header: "Title",
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => <span className="capitalize">{row.original.status.replace("_", " ")}</span>,
		},
		{
			accessorKey: "pointsAwarded",
			header: "Points",
		},
		// Admin Actions Column - Only added if user has permission
		...(canManageDeliverables
			? [
					{
						id: "admin-actions",
						header: "Admin",
						cell: ({ row }: { row: { original: TaskDeliverable } }) => <AdminDeliverableActions deliverable={row.original} />,
					},
				]
			: []),
	];

	return columns;
}
```

## Features Available

### 1. Update Deliverable

- Edit title, description, acceptance criteria
- Change bonus status and order
- Works in any state

### 2. Change Status

- Move to any status (pending, submitted, under_review, approved, rejected)
- Add optional admin notes
- Bypasses workflow restrictions

### 3. Reset to Pending

- Quick action to reset deliverable to pending state
- Clears submission and review data
- One-click operation (no dialog)

### 4. Force Approve

- Approve deliverable regardless of current state
- Award points (optional)
- Add approval notes

### 5. Force Reject

- Reject deliverable regardless of current state
- Add rejection notes
- No points awarded

### 6. Delete Deliverable

- Permanently delete deliverable
- Shows warning alert
- Cannot be undone

## Permission Check

The component automatically handles permission checks internally, but you should still check permissions before rendering to avoid showing empty dropdown menus:

```typescript
const { hasPermission } = useAuthStore();

// Only render if user has permission
{
	hasPermission("manage_deliverables") && <AdminDeliverableActions deliverable={deliverable} />;
}
```

## Query Invalidation

All mutations automatically invalidate the following queries:

- Task deliverables list
- Individual deliverable details
- Task details (to update task progress)

This ensures the UI stays in sync after any admin action.

## Toast Notifications

All actions show appropriate toast notifications:

- Success: Green toast with success message
- Error: Red toast with error message
- Loading: Button shows loading state

## Styling

The component uses:

- Shadcn/UI components (Button, Dialog, Form, etc.)
- Tailwind CSS for styling
- Lucide React icons
- Dark mode support

## Error Handling

All mutations include error handling:

- Network errors are caught and displayed
- Validation errors show in form fields
- Server errors show in toast notifications

## Best Practices

1. **Always check permissions** before rendering the component
2. **Use in lists or tables** for easy access to admin actions
3. **Test with different roles** to ensure permission checks work
4. **Monitor query invalidation** to ensure data stays fresh
5. **Provide user feedback** through toast notifications

## Example: Complete Task Details Page

```tsx
import { useParams } from "next/navigation";
import { useTask } from "@/features/projects/hooks/useTasks";
import { useTaskDeliverables } from "@/features/projects/hooks/useTaskDeliverables";
import { AdminDeliverableActions } from "@/features/admin";
import { useAuthStore } from "@/store/authStore";

export default function TaskDetailsPage() {
	const params = useParams();
	const taskId = Number(params.taskId);

	const { data: task } = useTask(taskId);
	const { data: deliverables } = useTaskDeliverables(taskId);
	const { hasPermission } = useAuthStore();

	const canManageDeliverables = hasPermission("manage_deliverables");

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">{task?.title}</h1>

			<div className="space-y-6">
				<section>
					<h2 className="text-xl font-semibold mb-4">Deliverables</h2>
					<div className="space-y-4">
						{deliverables?.map((deliverable) => (
							<div
								key={deliverable.deliverableId}
								className="border rounded-lg p-4"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<h3 className="font-semibold">{deliverable.title}</h3>
										<p className="text-sm text-muted-foreground mt-1">{deliverable.description}</p>

										<div className="flex items-center gap-4 mt-3">
											<span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 capitalize">{deliverable.status.replace("_", " ")}</span>
											{deliverable.isBonus && <span className="text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">Bonus</span>}
											<span className="text-xs text-muted-foreground">{deliverable.pointsAwarded} points</span>
										</div>
									</div>

									{canManageDeliverables && <AdminDeliverableActions deliverable={deliverable} />}
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
```

## Notes

- All dialogs are lazy-loaded (only rendered when opened)
- Forms use React Hook Form with Zod validation
- All shared form components are used (FormInput, FormTextarea, FormSelect, FormCheckbox)
- Maximum file size is 150 lines per component
- All components follow the feature-based architecture
