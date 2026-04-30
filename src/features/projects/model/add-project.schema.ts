import { z } from "zod";
import { ProjectStatus } from "@/entities/project/model/types";
import type { CreateDirectProjectPayload } from "@/entities/project/model/types";

export const PaymentStatus = {
	UNPAID: "unpaid",
	PARTIALLY_PAID: "partially_paid",
	PAID: "paid",
	REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
	[PaymentStatus.UNPAID]: "Unpaid",
	[PaymentStatus.PARTIALLY_PAID]: "Partially Paid",
	[PaymentStatus.PAID]: "Paid",
	[PaymentStatus.REFUNDED]: "Refunded",
};

export const addProjectSchema = z
	.object({
		clientId: z.number().min(1, "Client is required"),
		clientName: z.string().trim().min(1, "Client is required"),
		projectName: z.string().trim().min(1, "Project name is required").max(255),
		projectType: z.string().trim().min(1, "Project type is required"),
		assignedSalesRepId: z.string().trim().optional().or(z.literal("")),
		status: z.nativeEnum(ProjectStatus),
		paymentStatus: z.enum([PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID, PaymentStatus.PAID, PaymentStatus.REFUNDED]),
		startDate: z.string().trim().min(1, "Start date is required"),
		deliveryDate: z.string().trim().min(1, "Delivery date is required"),
		details: z.string().trim().optional().or(z.literal("")),
	})
	.refine((data) => !data.startDate || !data.deliveryDate || data.deliveryDate >= data.startDate, {
		message: "Delivery date must be after the start date",
		path: ["deliveryDate"],
	});

export type AddProjectFormData = z.infer<typeof addProjectSchema>;

function cleanOptional(value: string | undefined) {
	const trimmedValue = value?.trim();
	return trimmedValue || undefined;
}

export function toAddProjectPayload(data: AddProjectFormData): CreateDirectProjectPayload {
	const metadata = [
		`Project Type: ${data.projectType}`,
		`Payment Status: ${PaymentStatusLabels[data.paymentStatus]}`,
		`Start Date: ${data.startDate}`,
		data.assignedSalesRepId ? `Assigned Sales Rep ID: ${data.assignedSalesRepId}` : null,
		data.details ? `Details: ${data.details.trim()}` : null,
	].filter(Boolean);

	return {
		clientId: data.clientId,
		title: data.projectName.trim(),
		description: metadata.join("\n"),
		budget: 0,
		deadline: cleanOptional(data.deliveryDate),
		status: data.status,
	};
}
