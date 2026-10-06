"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandling";
import {
	useCreateDeductionType,
	useDeductionTypes,
	useDeleteDeductionType,
	useUpdateDeductionType,
} from "@/features/hr/hooks/useDeductionsRewards";

const schema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	code: z.string().trim().min(1, "Code is required"),
	description: z.string().max(500).optional().or(z.literal("")),
	category: z.enum(["attendance", "performance", "behavior", "financial", "other"]),
	isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function DeductionTypesSettings() {
	const listQuery = useDeductionTypes();
	const createType = useCreateDeductionType();
	const updateType = useUpdateDeductionType();
	const deleteType = useDeleteDeductionType();
	const [editingId, setEditingId] = useState<number | null>(null);
	const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", code: "", description: "", category: "other", isActive: true } });

	const onSubmit = async (values: FormValues) => {
		try {
			if (editingId) {
				await updateType.mutateAsync({ id: editingId, data: { name: values.name, code: values.code, description: values.description || undefined, category: values.category, is_active: values.isActive } });
				toast.success("Deduction type updated");
			} else {
				await createType.mutateAsync({ name: values.name, code: values.code, description: values.description || undefined, category: values.category, is_active: values.isActive });
				toast.success("Deduction type created");
			}
			setEditingId(null);
			form.reset({ name: "", code: "", description: "", category: "other", isActive: true });
		} catch (e) {
			toast.error(handleApiError(e));
		}
	};

	const items = listQuery.data?.data ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Deduction types</CardTitle>
				<CardDescription>Manage direct deduction reasons. Inactive types stay on history but cannot be used for new deductions.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
					<div className="space-y-1">
						<Label>Name</Label>
						<Input {...form.register("name")} placeholder="e.g. Task delay" />
					</div>
					<div className="space-y-1">
						<Label>Code</Label>
						<Input {...form.register("code")} placeholder="e.g. task-delay" />
					</div>
					<div className="space-y-1">
						<Label>Category</Label>
						<select {...form.register("category")} className="w-full rounded border px-2 py-2 text-sm">
							<option value="attendance">Attendance</option>
							<option value="performance">Performance</option>
							<option value="behavior">Behavior</option>
							<option value="financial">Financial</option>
							<option value="other">Other</option>
						</select>
					</div>
					<div className="flex items-end gap-2">
						<Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} />
						<Label>Active</Label>
					</div>
					<Button type="submit" className="md:col-span-4">{editingId ? "Update" : "Add"}</Button>
				</form>
				<div className="space-y-2">
					{items.map((t) => (
						<div key={t.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
							<span>{t.name} ({t.code}) {!t.is_active && "(inactive)"}</span>
							<span className="flex gap-2">
								<Button size="sm" variant="outline" onClick={() => { setEditingId(t.id); form.reset({ name: t.name, code: t.code, description: t.description ?? "", category: t.category, isActive: t.is_active }); }}>Edit</Button>
								<Button size="sm" variant="ghost" onClick={async () => { try { await deleteType.mutateAsync(t.id); toast.success("Deduction type removed"); } catch (e) { toast.error(handleApiError(e)); } }}>Remove</Button>
							</span>
						</div>
					))}
					{items.length === 0 && <p className="text-sm text-muted-foreground">No deduction types yet.</p>}
				</div>
			</CardContent>
		</Card>
	);
}
