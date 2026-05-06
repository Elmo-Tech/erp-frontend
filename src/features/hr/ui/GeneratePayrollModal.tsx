"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormCombobox, type ComboboxOption } from "@/shared/ui/forms/FormCombobox";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import { useGeneratePayroll } from "@/features/hr/model/use-hr-actions";
import { generatePayrollSchema, GENERATE_PAYROLL_DEFAULT_VALUES, type GeneratePayrollFormData } from "@/features/hr/model/hr.schema";

// ─────────────────────────────────────────────────────────────────────────────
// Static options
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_OPTIONS = [
	{ value: "1", label: "January" },
	{ value: "2", label: "February" },
	{ value: "3", label: "March" },
	{ value: "4", label: "April" },
	{ value: "5", label: "May" },
	{ value: "6", label: "June" },
	{ value: "7", label: "July" },
	{ value: "8", label: "August" },
	{ value: "9", label: "September" },
	{ value: "10", label: "October" },
	{ value: "11", label: "November" },
	{ value: "12", label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
	const y = CURRENT_YEAR - 2 + i;
	return { value: String(y), label: String(y) };
});

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface GeneratePayrollModalProps {
	open: boolean;
	onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function GeneratePayrollModal({ open, onClose }: GeneratePayrollModalProps) {
	const generatePayroll = useGeneratePayroll();
	const usersQuery = useGetInternalUsers(open);

	const form = useForm<GeneratePayrollFormData>({
		resolver: zodResolver(generatePayrollSchema),
		defaultValues: GENERATE_PAYROLL_DEFAULT_VALUES,
	});

	// Reset to current month/year each time the modal opens
	useEffect(() => {
		if (open) form.reset(GENERATE_PAYROLL_DEFAULT_VALUES);
	}, [open, form]);

	const userOptions = useMemo<ComboboxOption[]>(
		() =>
			(usersQuery.data?.users ?? []).map((u) => ({
				value: String(u.id),
				label: u.name,
				description: u.email,
			})),
		[usersQuery.data?.users],
	);

	const handleSubmit = async (data: GeneratePayrollFormData) => {
		try {
			await generatePayroll.mutateAsync(data);
			toast.success("Payslip generated successfully");
			onClose();
		} catch {
			toast.error("Failed to generate payslip");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			title="Generate Payslip"
			description="Calculate and generate a payslip for a specific employee and period."
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Generate"
			isLoading={generatePayroll.isPending}
			size="md"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					{/* FormCombobox for relational entity (User) — PBAC Rule */}
					<FormCombobox
						control={form.control}
						name="user_id"
						label="Employee"
						placeholder="Select an employee…"
						searchPlaceholder="Search by name or email…"
						emptyText="No employees found."
						options={userOptions}
						disabled={generatePayroll.isPending || usersQuery.isLoading}
					/>

					{/* FormSelect for static enums (Month, Year) — PBAC Rule */}
					<div className="grid grid-cols-2 gap-4">
						<FormSelect
							control={form.control}
							name="month"
							label="Month"
							placeholder="Select month"
							options={MONTH_OPTIONS}
							disabled={generatePayroll.isPending}
						/>
						<FormSelect
							control={form.control}
							name="year"
							label="Year"
							placeholder="Select year"
							options={YEAR_OPTIONS}
							disabled={generatePayroll.isPending}
						/>
					</div>
				</div>
			</Form>
		</FormDialog>
	);
}
