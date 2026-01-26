# Admin Deliverable Management - Frontend

## Overview

Frontend implementation for admin deliverable management with full control over deliverables in any status.

## Features

### Admin Actions Menu

- **Update Deliverable**: Edit any field regardless of status
- **Change Status**: Direct status change with reason
- **Reset to Pending**: Quick reset action
- **Force Approve**: Direct approval with points
- **Force Reject**: Direct rejection with notes
- **Delete**: Remove deliverable in any status

## File Structure

```
src/features/admin/
├── api/
│   └── adminDeliverables.ts          # API functions
├── hooks/
│   └── useAdminDeliverables.ts       # TanStack Query hooks
├── schemas/
│   └── adminDeliverableSchemas.ts    # Zod validation schemas
├── components/
│   ├── AdminDeliverableActions.tsx   # Dropdown menu
│   └── AdminDeliverableDialogs.tsx   # All dialogs
└── index.ts                          # Barrel export
```

## Usage

### 1. Import Admin Actions Component

```tsx
import { AdminDeliverableActions } from "@/features/admin";
import { TaskDeliverable } from "@/features/projects/types/taskDeliverable";

// In your deliverable list/card component
<AdminDeliverableActions deliverable={deliverable} />;
```

### 2. Check Admin Permission

```tsx
import { useAuthStore } from "@/store/authStore";

const { hasPermission } = useAuthStore();
const canManageDeliverables = hasPermission("manage_deliverables");

{
	canManageDeliverables && <AdminDeliverableActions deliverable={deliverable} />;
}
```

### 3. Use Individual Hooks (Optional)

```tsx
import { useAdminUpdateDeliverable, useAdminDeleteDeliverable, useAdminChangeDeliverableStatus, useAdminResetDeliverable, useAdminForceApprove, useAdminForceReject } from "@/features/admin";

// Example: Force approve
const forceApproveMutation = useAdminForceApprove();

const handleForceApprove = () => {
	forceApproveMutation.mutate({
		deliverableId: 123,
		data: {
			reviewNotes: "Emergency approval",
			pointsAwarded: 20,
			isBonus: false,
		},
	});
};
```

## API Endpoints

All endpoints use `/api/v1/admin/deliverables/` prefix:

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| PUT    | `/{id}`               | Update any field       |
| DELETE | `/{id}`               | Delete in any status   |
| PATCH  | `/{id}/status`        | Change status directly |
| PATCH  | `/{id}/reset`         | Reset to pending       |
| POST   | `/{id}/force-approve` | Force approve          |
| POST   | `/{id}/force-reject`  | Force reject           |

## Validation Schemas

### Admin Update Deliverable

```typescript
{
  title?: string;              // max 255 chars
  description?: string;         // max 1000 chars
  acceptanceCriteria?: string;  // max 1000 chars
  submissionNotes?: string;     // max 1000 chars
  reviewNotes?: string;         // max 1000 chars
  pointsAwarded?: number;       // 0-100
  isBonus?: boolean;
  order?: number;               // positive integer
}
```

### Admin Change Status

```typescript
{
	status: "pending" | "submitted" | "under_review" | "approved" | "rejected";
	reason: string; // min 3 chars, max 500 chars
}
```

### Admin Force Approve

```typescript
{
  reviewNotes: string;    // min 3 chars, max 1000 chars
  pointsAwarded: number;  // 0-100
  isBonus?: boolean;      // default false
}
```

### Admin Force Reject

```typescript
{
  reviewNotes: string;    // min 3 chars, max 1000 chars
  pointsAwarded?: number; // 0-100, default 0
}
```

## Components

### AdminDeliverableActions

Dropdown menu with all admin actions.

**Props:**

```typescript
interface AdminDeliverableActionsProps {
	deliverable: TaskDeliverable;
}
```

**Features:**

- Dropdown menu with all admin actions
- Opens appropriate dialog for each action
- Handles reset action directly (no dialog)
- Shows loading states

### AdminUpdateDeliverableDialog

Full form to update any deliverable field.

**Props:**

```typescript
interface AdminUpdateDeliverableDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}
```

**Fields:**

- Title
- Description
- Acceptance Criteria
- Submission Notes
- Review Notes
- Points Awarded
- Is Bonus
- Order

### AdminChangeStatusDialog

Change status with reason.

**Props:**

```typescript
interface AdminChangeStatusDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}
```

**Fields:**

- Status (dropdown)
- Reason (required)

### AdminForceApproveDialog

Force approve with points.

**Props:**

```typescript
interface AdminForceApproveDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}
```

**Fields:**

- Review Notes (required)
- Points Awarded (required)
- Is Bonus

### AdminForceRejectDialog

Force reject with notes.

**Props:**

```typescript
interface AdminForceRejectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}
```

**Fields:**

- Review Notes (required)
- Points Awarded (optional)

### AdminDeleteDeliverableDialog

Confirmation dialog for deletion.

**Props:**

```typescript
interface AdminDeleteDeliverableDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deliverable: TaskDeliverable;
}
```

## Hooks

All hooks use TanStack Query and automatically:

- Invalidate related queries on success
- Show toast notifications
- Handle loading/error states

### useAdminUpdateDeliverable()

```typescript
const updateMutation = useAdminUpdateDeliverable();

updateMutation.mutate({
	deliverableId: 123,
	data: { title: "Updated Title", pointsAwarded: 25 },
});
```

### useAdminDeleteDeliverable()

```typescript
const deleteMutation = useAdminDeleteDeliverable();

deleteMutation.mutate({
	deliverableId: 123,
	taskId: 456,
});
```

### useAdminChangeDeliverableStatus()

```typescript
const changeStatusMutation = useAdminChangeDeliverableStatus();

changeStatusMutation.mutate({
	deliverableId: 123,
	data: {
		status: "approved",
		reason: "Client confirmed via email",
	},
});
```

### useAdminResetDeliverable()

```typescript
const resetMutation = useAdminResetDeliverable();

resetMutation.mutate(123); // deliverableId
```

### useAdminForceApprove()

```typescript
const forceApproveMutation = useAdminForceApprove();

forceApproveMutation.mutate({
	deliverableId: 123,
	data: {
		reviewNotes: "Emergency approval",
		pointsAwarded: 20,
		isBonus: false,
	},
});
```

### useAdminForceReject()

```typescript
const forceRejectMutation = useAdminForceReject();

forceRejectMutation.mutate({
	deliverableId: 123,
	data: {
		reviewNotes: "Does not meet requirements",
		pointsAwarded: 0,
	},
});
```

## Integration Example

### In Task Details Page

```tsx
import { TaskDeliverable } from "@/features/projects/types/taskDeliverable";
import { AdminDeliverableActions } from "@/features/admin";
import { useAuthStore } from "@/store/authStore";

function TaskDeliverablesSection({ taskId }: { taskId: number }) {
	const { hasPermission } = useAuthStore();
	const canManageDeliverables = hasPermission("manage_deliverables");

	const { data: deliverables } = useTaskDeliverables(taskId);

	return (
		<div className="space-y-4">
			{deliverables?.map((deliverable) => (
				<div
					key={deliverable.deliverableId}
					className="flex items-center justify-between p-4 border rounded"
				>
					<div>
						<h4>{deliverable.title}</h4>
						<p className="text-sm text-muted-foreground">{deliverable.status}</p>
					</div>

					<div className="flex items-center gap-2">
						{/* Normal user actions */}
						<DeliverableActions deliverable={deliverable} />

						{/* Admin actions (only for admins) */}
						{canManageDeliverables && <AdminDeliverableActions deliverable={deliverable} />}
					</div>
				</div>
			))}
		</div>
	);
}
```

## Toast Notifications

All mutations show appropriate toast messages:

**Success:**

- "Deliverable updated successfully by admin"
- "Deliverable deleted successfully by admin"
- "Deliverable status changed successfully"
- "Deliverable reset to pending successfully"
- "Deliverable force approved successfully"
- "Deliverable force rejected successfully"

**Error:**

- "Failed to update deliverable"
- "Failed to delete deliverable"
- "Failed to change status"
- "Failed to reset deliverable"
- "Failed to force approve"
- "Failed to force reject"

## Query Invalidation

All mutations automatically invalidate:

- `taskDeliverablesKeys.byTask(taskId)` - Refresh deliverables list
- `taskDeliverablesKeys.detail(taskId, deliverableId)` - Refresh single deliverable
- `["tasks", taskId]` - Refresh parent task

## Best Practices

1. **Permission Check**: Always check `manage_deliverables` permission before showing admin actions
2. **Confirmation**: Delete action shows confirmation dialog
3. **Reason Required**: Status changes require a reason for audit trail
4. **Toast Feedback**: All actions show success/error toasts
5. **Auto Refresh**: Queries auto-refresh after mutations
6. **Loading States**: Buttons show loading state during mutations
7. **Form Validation**: All forms use Zod schemas for validation

## Security

- All endpoints require `manage_deliverables` permission
- Permission checked on backend (don't rely on frontend only)
- Admin actions are logged for audit trail
- Sensitive operations require reason/notes

---

**Last Updated**: January 26, 2026  
**Version**: 1.0.0
