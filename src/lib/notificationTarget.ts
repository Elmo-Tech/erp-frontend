import type { Notification } from "@/store/notificationStore";

export function notificationTarget(notification: Notification): string | null {
	const data = notification.data;
	const employeeId = Number(data.employee_id);
	if (/^(leave_submitted|permission_pending)$/.test(notification.type) && Number.isInteger(employeeId) && employeeId > 0) {
		const params = new URLSearchParams({ review: notification.type.startsWith("leave_") ? "leave" : "permission" });
		const month = typeof data.body === "string" ? data.body.slice(0, 7) : "";
		if (/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) params.set("month", month);
		return `/dashboard/employees/${employeeId}?${params}`;
	}
	if (/^(leave|permission)_(approved|rejected)$/.test(notification.type)) return "/dashboard/my-requests";
	if (data.task_id) return `/dashboard/my-tasks?highlight=${data.task_id}`;
	if (data.project_id) return `/dashboard/projects/${data.project_id}`;
	return typeof data.url === "string" && data.url.startsWith("/") && !data.url.startsWith("//") ? data.url : null;
}
