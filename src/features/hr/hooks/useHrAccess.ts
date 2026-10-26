import { useAuthStore } from "@/store/authStore";
import { resourcePermissions } from "@/config/access";

export function useHrAccess() {
	const { hasPermission: has } = useAuthStore((state) => state);
	const master = has("manage_employees");
	const view = (resource: string) => master || resourcePermissions(resource).some(has);
	const action = (resource: string, action: string) => master || has(`manage_${resource}`) || has(`${action}_${resource}`);
	return {
		view, action,
		can: (permission: string) => master || has(permission),
		overview: master || has("view_hr_overview") || has("view_employee_salary") || has("manage_employee_salary"),
		leaves: view("leaves"), permissions: view("permissions"),
		attendance: master || has("view_all_attendance") || has("manage_attendance"),
		advances: view("employee_advances"), deductions: view("deductions"), overtime: view("overtime"),
	};
}
