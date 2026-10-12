"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateHrPolicy, useCurrentHrPolicy } from "../hooks/useHrPolicies";
import { buildCreateHrPolicyPayload, toHrPolicyFormValues } from "../lib/policy";
import type { HrPolicy, HrPolicyFormValues } from "../types";

const workingDayOptions = [
	{ value: "monday", label: "Mon" },
	{ value: "tuesday", label: "Tue" },
	{ value: "wednesday", label: "Wed" },
	{ value: "thursday", label: "Thu" },
	{ value: "friday", label: "Fri" },
	{ value: "saturday", label: "Sat" },
	{ value: "sunday", label: "Sun" },
] as const;

const tierIndexes = [0, 1, 2, 3] as const;
const percentageIndexes = [0, 1, 2, 3] as const;

export function HrPoliciesSettings() {
	const { data: policy, error, isLoading, refetch } = useCurrentHrPolicy();

	if (isLoading) {
		return (
			<div className="grid gap-4 xl:grid-cols-2">
				{[0, 1, 2, 3].map((index) => (
					<Card key={index}>
						<CardHeader>
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-4 w-72" />
						</CardHeader>
						<CardContent className="space-y-3">
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (error || !policy) {
		return (
			<Card role="alert">
				<CardHeader>
					<CardTitle>Unable to load HR policy</CardTitle>
					<CardDescription>
						The current HR policy could not be loaded. Try again before making changes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button type="button" variant="outline" onClick={() => refetch()}>
						<RefreshCw className="mr-2 size-4" />
						Retry
					</Button>
				</CardContent>
			</Card>
		);
	}

	return <HrPolicyForm policy={policy} />;
}

function HrPolicyForm({ policy }: { policy: HrPolicy }) {
	const form = useForm<HrPolicyFormValues>({
		defaultValues: toHrPolicyFormValues(policy),
	});
	const createPolicy = useCreateHrPolicy();
	const workingDays = useWatch({ control: form.control, name: "settings.workingDays" }) ?? [];
	const lateTiers = useWatch({ control: form.control, name: "settings.lateDeductionTiers" });
	const dailyDivisor = useWatch({ control: form.control, name: "settings.dailyRateDivisor" });
	const advanceLimit = useWatch({ control: form.control, name: "settings.advanceLimitSalaryPercentage" });

	useEffect(() => {
		form.reset(toHrPolicyFormValues(policy));
	}, [form, policy]);

	const handleSubmit = async (values: HrPolicyFormValues) => {
		try {
			const savedPolicy = await createPolicy.mutateAsync(buildCreateHrPolicyPayload(values));
			form.reset(toHrPolicyFormValues(savedPolicy));
			// Success toast comes from the backend message via the axios interceptor.
		} catch {
			// The shared API client displays a request error toast.
		}
	};

	const toggleWorkingDay = (day: string, checked: boolean) => {
		const nextWorkingDays = checked
			? Array.from(new Set([...workingDays, day]))
			: workingDays.filter((workingDay) => workingDay !== day);

		form.setValue("settings.workingDays", nextWorkingDays, { shouldDirty: true });
	};

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle>Policy version {policy.policyId}</CardTitle>
						<CardDescription>
							Current version created {policy.createdAt.slice(0, 10)}. It is effective from {policy.effectiveFrom?.slice(0, 10) ?? "the date recorded by HR"}.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Saving creates a new version that applies to future records. No historical record is changed.
						</p>
					</CardContent>
				</Card>

				<div className="grid gap-4 xl:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Work schedule</CardTitle>
							<CardDescription>Set the working week and standard daily hours.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="space-y-2">
								<Label>Working days</Label>
								<div className="flex flex-wrap gap-x-4 gap-y-3" role="group" aria-label="Working days">
									{workingDayOptions.map((day) => (
										<div className="flex items-center gap-2" key={day.value}>
											<Checkbox
												id={`working-day-${day.value}`}
												checked={workingDays.includes(day.value)}
												onCheckedChange={(checked) => toggleWorkingDay(day.value, checked === true)}
												disabled={createPolicy.isPending}
											/>
											<Label htmlFor={`working-day-${day.value}`} className="font-normal">
												{day.label}
											</Label>
										</div>
									))}
								</div>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor="work-start-time">Work start time</Label>
									<Input id="work-start-time" type="time" disabled={createPolicy.isPending} {...form.register("settings.workStartTime", { required: true })} />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="work-end-time">Work end time</Label>
									<Input id="work-end-time" type="time" disabled={createPolicy.isPending} {...form.register("settings.workEndTime", { required: true })} />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Leave &amp; permissions</CardTitle>
							<CardDescription>Configure leave allowances and permission treatment.</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="annual-leave-days">Annual leave days</Label>
								<Input id="annual-leave-days" type="number" disabled={createPolicy.isPending} {...form.register("settings.annualLeaveDays", { required: true, valueAsNumber: true })} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="sick-leave-days">Sick leave days</Label>
								<Input id="sick-leave-days" type="number" disabled={createPolicy.isPending} {...form.register("settings.sickLeaveDays", { required: true, valueAsNumber: true })} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="emergency-leave-days">Emergency leave days</Label>
								<Input id="emergency-leave-days" type="number" disabled={createPolicy.isPending} {...form.register("settings.emergencyLeaveDays", { required: true, valueAsNumber: true })} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="monthly-paid-permission-hours">Monthly paid permission hours</Label>
								<Input id="monthly-paid-permission-hours" type="number" step="any" disabled={createPolicy.isPending} {...form.register("settings.monthlyPaidPermissionHours", { required: true, valueAsNumber: true })} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="leave-workflow">Leave workflow</Label>
								<Input id="leave-workflow" disabled={createPolicy.isPending} {...form.register("settings.leaveWorkflow", { required: true })} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="permission-overage-behavior">Permission overage behavior</Label>
								<Input id="permission-overage-behavior" disabled={createPolicy.isPending} {...form.register("settings.permissionOverageBehavior", { required: true })} />
							</div>
						</CardContent>
					</Card>

					<Card className="xl:col-span-2">
						<CardHeader>
							<CardTitle>Late deductions</CardTitle>
							<CardDescription>Choose a late-minute range, then the deduction percentage for the first, second, third, and fourth or later occurrence. Percentages apply to one day’s salary.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="rounded-lg bg-muted/50 p-3 text-sm">Occurrences restart automatically each month. A manual reset is available in the employee’s Late deductions section. 0% means a warning without a deduction.</p>
							<div className="grid gap-4 lg:grid-cols-2">
								{tierIndexes.map((tierIndex) => <fieldset key={tierIndex} className="space-y-4 rounded-lg border p-4">
									<legend className="px-2 text-sm font-semibold">{lateTiers[tierIndex].minimumMinutes} – {lateTiers[tierIndex].maximumMinutes ?? "∞"} minutes late</legend>
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2"><Label htmlFor={`late-min-${tierIndex}`}>From (minutes)</Label><Input id={`late-min-${tierIndex}`} type="number" min={0} max={1440} step={1} disabled={createPolicy.isPending} {...form.register(`settings.lateDeductionTiers.${tierIndex}.minimumMinutes`, { required: true, valueAsNumber: true })} /></div>
										<div className="space-y-2"><Label htmlFor={`late-max-${tierIndex}`}>Through (minutes)</Label><Input id={`late-max-${tierIndex}`} type="number" min={0} max={1440} step={1} placeholder="No upper limit" disabled={createPolicy.isPending} {...form.register(`settings.lateDeductionTiers.${tierIndex}.maximumMinutes`, { setValueAs: (value) => value === "" || value === null ? null : Number(value) })} /></div>
									</div>
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{percentageIndexes.map((occurrence) => <div key={occurrence} className="space-y-2"><Label htmlFor={`late-percent-${tierIndex}-${occurrence}`}>{["First", "Second", "Third", "Fourth+"][occurrence]} (%)</Label><Input id={`late-percent-${tierIndex}-${occurrence}`} type="number" min={0} max={100} step={1} disabled={createPolicy.isPending} {...form.register(`settings.lateDeductionTiers.${tierIndex}.percentages.${occurrence}`, { required: true, valueAsNumber: true })} /></div>)}</div>
									<p className="text-xs text-muted-foreground">Fourth+ applies to every later occurrence in the same month. Leave the last range’s upper limit blank for any longer delay.</p>
								</fieldset>)}
							</div>
							<p className="text-sm text-muted-foreground">Example: with a salary of 6,000 and divisor {dailyDivisor}, one day is {(6000 / dailyDivisor).toFixed(2)}. A 20% deduction is {(6000 / dailyDivisor * 0.2).toFixed(2)}.</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Overtime</CardTitle>
							<CardDescription>Define overtime approval and pay treatment.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="grid gap-2">
								<Label htmlFor="overtime-multiplier">Overtime multiplier</Label>
								<Input id="overtime-multiplier" type="number" step="any" disabled={createPolicy.isPending} {...form.register("settings.overtimeMultiplier", { required: true, valueAsNumber: true })} />
							</div>
							<div className="flex items-center justify-between gap-4 rounded-lg border p-3">
								<div className="space-y-1">
									<Label htmlFor="overtime-requires-preapproval">Require preapproval</Label>
									<p className="text-sm text-muted-foreground">Overtime must be approved before it is accepted.</p>
								</div>
								<Controller
									control={form.control}
									name="settings.overtimeRequiresPreapproval"
									render={({ field }) => <Switch id="overtime-requires-preapproval" checked={field.value} onCheckedChange={field.onChange} disabled={createPolicy.isPending} />}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Salary calculation &amp; payment date</CardTitle>
							<CardDescription>Base salary comes from each employee’s contract. These rules calculate daily rates and determine when the previous month is paid.</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="daily-rate-divisor">Daily rate divisor</Label>
								<Input id="daily-rate-divisor" type="number" step="any" disabled={createPolicy.isPending} {...form.register("settings.dailyRateDivisor", { required: true, valueAsNumber: true })} />
								<p className="text-xs text-muted-foreground">Daily salary = contract base salary ÷ {dailyDivisor}. Default: 30.</p>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="unpaid-leave-multiplier">Unpaid leave daily rate multiplier</Label>
								<Input id="unpaid-leave-multiplier" type="number" step="any" disabled={createPolicy.isPending} {...form.register("settings.unpaidLeaveDailyRateMultiplier", { required: true, valueAsNumber: true })} />
								<p className="text-xs text-muted-foreground">1 deducts one daily salary for each unpaid working day.</p>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="payroll-payment-day">Payroll payment day</Label>
								<Input id="payroll-payment-day" type="number" disabled={createPolicy.isPending} {...form.register("settings.payrollPaymentDay", { required: true, valueAsNumber: true })} />
								<p className="text-xs text-muted-foreground">Day of the following month. 1 means September’s salary is paid on October 1.</p>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="mid-month-hire-paid-days">Mid-month hire paid days</Label>
								<Input id="mid-month-hire-paid-days" type="number" step="any" disabled={createPolicy.isPending} {...form.register("settings.midMonthHirePaidDays", { required: true, valueAsNumber: true })} />
								<p className="text-xs text-muted-foreground">Automatic first-month calculation for a hire on day 15; subsequent months use normal salary.</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader><CardTitle>Employee advances</CardTitle><CardDescription>An advance is money paid before salary. Recovery deducts it from a later payroll payment.</CardDescription></CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="advance-limit-salary-percentage">Maximum open advances (% of salary)</Label>
								<Input id="advance-limit-salary-percentage" type="number" step="any" disabled={createPolicy.isPending} {...form.register("settings.advanceLimitSalaryPercentage", { required: true, valueAsNumber: true })} />
								<p className="text-xs text-muted-foreground">At {advanceLimit}%, a salary of 6,000 allows up to {(6000 * advanceLimit / 100).toFixed(2)} in total unsettled advances.</p>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="advance-settlement">Advance settlement</Label>
								<select id="advance-settlement" className="h-9 rounded-md border bg-background px-3 text-sm" disabled={createPolicy.isPending} {...form.register("settings.advanceSettlement", { required: true })}><option value="next_payroll">Recover in the next payroll</option></select>
								<p className="text-xs text-muted-foreground">By default, recover the full amount next payroll. Enable installments below to split recovery over several months.</p>
							</div>
							<div className="flex items-center justify-between gap-4 rounded-lg border p-3 sm:col-span-2">
								<div className="space-y-1">
									<Label htmlFor="allow-advance-installments">Allow advance installments</Label>
									<p className="text-sm text-muted-foreground">Allow advances to be settled over multiple payments.</p>
								</div>
								<Controller
									control={form.control}
									name="settings.allowAdvanceInstallments"
									render={({ field }) => <Switch id="allow-advance-installments" checked={field.value} onCheckedChange={field.onChange} disabled={createPolicy.isPending} />}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Supervision</CardTitle>
							<CardDescription>Each task has one assigned supervisor.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="max-w-sm grid gap-2">
								<Label htmlFor="task-supervisor-limit">Task supervisor limit</Label>
								<Input id="task-supervisor-limit" type="number" min={1} max={1} value={1} disabled aria-describedby="task-supervisor-limit-description" />
								<p id="task-supervisor-limit-description" className="text-sm text-muted-foreground">Fixed at 1 because tasks support a single supervisor.</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>New version details</CardTitle>
						<CardDescription>Both fields are optional. Leave the effective date empty to use the backend policy date.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="effective-from">Effective from</Label>
							<Input id="effective-from" type="date" disabled={createPolicy.isPending} {...form.register("effectiveFrom")} />
						</div>
						<div className="grid gap-2 md:row-span-2">
							<Label htmlFor="policy-notes">Notes</Label>
							<Textarea id="policy-notes" placeholder="Reason for this policy version" disabled={createPolicy.isPending} {...form.register("notes")} />
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end">
					<Button type="submit" disabled={createPolicy.isPending}>
						{createPolicy.isPending ? <Loader2 className="animate-spin" /> : <Save />}
						{createPolicy.isPending ? "Saving policy..." : "Save new policy version"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
