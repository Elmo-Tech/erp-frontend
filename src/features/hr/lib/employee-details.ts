import { z } from "zod";
import type { EmployeePersonalDetails } from "../types/employee";

export const employeeDetailsSchema = {
	jobTitle: z.string().max(255).optional(),
	workArrangement: z.enum(["", "on_site", "freelance", "remote"]).optional(),
	birthDate: z.string().optional(), appointmentDate: z.string().optional(),
	residence: z.string().max(500).optional(),
	nationalId: z.string().regex(/^([0-9]{14})?$/, "National ID must contain 14 digits").optional(),
	mobile: z.string().max(50).optional(), otherPhone: z.string().max(50).optional(),
	education: z.string().max(500).optional(),
};

export function employeeDetailsDefaults(employee?: EmployeePersonalDetails) {
	return { jobTitle: employee?.jobTitle ?? "", workArrangement: employee?.workArrangement ?? "", birthDate: employee?.birthDate ?? "", appointmentDate: employee?.appointmentDate ?? "", residence: employee?.residence ?? "", nationalId: employee?.nationalId ?? "", mobile: employee?.mobile ?? "", otherPhone: employee?.otherPhone ?? "", education: employee?.education ?? "" };
}
