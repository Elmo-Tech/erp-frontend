"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { Skeleton } from "@/shared/ui/skeleton";
import { Can } from "@/shared/ui/Can";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { useSystemSetting, useUpdateSystemSetting } from "@/features/hr/model/use-hr-actions";
import { hrSettingsSchema, type HrSettingsFormData } from "@/features/hr/model/hr.schema";

const POINT_VALUE_KEY = "gamification_point_value";

export function HrSettingsWidget() {
	const { data: setting, isLoading } = useSystemSetting(POINT_VALUE_KEY);
	const updateSetting = useUpdateSystemSetting();

	const form = useForm<HrSettingsFormData>({
		resolver: zodResolver(hrSettingsSchema),
		// `values` keeps the form in sync when the query resolves
		values: {
			gamification_point_value: setting ? parseFloat(setting.value) : 0,
		},
	});

	const handleSubmit = async (data: HrSettingsFormData) => {
		try {
			await updateSetting.mutateAsync({
				key: POINT_VALUE_KEY,
				payload: { value: String(data.gamification_point_value) },
			});
			toast.success("Settings saved");
		} catch {
			toast.error("Failed to save settings");
		}
	};

	return (
		<section className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">HR Settings</h1>
				<p className="text-sm text-muted-foreground">Configure gamification and payroll calculation parameters.</p>
			</div>

			<Can permission="manage_payroll">
				<Card className="max-w-lg">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<Settings2 className="h-4 w-4" />
							Gamification Point Value
						</CardTitle>
						<CardDescription>The monetary value (USD) of each gamification point. Used to calculate the points bonus in monthly payroll.</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex flex-col gap-3">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-24" />
							</div>
						) : (
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(handleSubmit)}
									className="flex flex-col gap-4"
								>
									<FormInput
										control={form.control}
										name="gamification_point_value"
										label="Point Value (USD)"
										type="number"
										step="0.01"
										min={0}
										max={1000}
										placeholder="10.00"
										description="Example: a value of 10 means 50 points = $500 bonus."
										disabled={updateSetting.isPending}
									/>
									<div>
										<Button
											type="submit"
											disabled={updateSetting.isPending}
										>
											{updateSetting.isPending ? "Saving…" : "Save Changes"}
										</Button>
									</div>
								</form>
							</Form>
						)}
					</CardContent>
				</Card>
			</Can>
		</section>
	);
}
