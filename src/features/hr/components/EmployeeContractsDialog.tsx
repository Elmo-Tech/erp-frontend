"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CalendarDays, FilePenLine, FileText, Info, Loader2, Paperclip, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCheckboxGroup, FormInput, FormSelect, FormTextarea } from "@/components/shared";
import { handleApiError } from "@/lib/errorHandling";
import { employmentContractsApi } from "../api/employment-contracts";
import { useCreateEmploymentContract, useDeleteContractFile, useDeleteEmploymentContract, useEmploymentContracts, useUpdateEmploymentContract, useUploadContractFile } from "../hooks/useEmploymentContracts";
import { buildEmploymentContractPayload, deriveContractEndDate, employmentContractSchema, getDefaultEmploymentContractFormValues, isValidContractDate, toEmploymentContractFormValues } from "../lib/employment-contract";
import { employmentContractWorkDays, type EmploymentContract, type EmploymentContractFormValues, type EmploymentContractStatus } from "../types/employment-contract";

interface EmployeeContractsPanelProps {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
}

type DialogMode = "overview" | "create" | "edit";

const dayLabels = {
	sunday: "Sunday",
	monday: "Monday",
	tuesday: "Tuesday",
	wednesday: "Wednesday",
	thursday: "Thursday",
	friday: "Friday",
	saturday: "Saturday",
};

const statusLabels: Record<EmploymentContractStatus, string> = {
	draft: "Draft",
	active: "Active",
	expired: "Expired",
	terminated: "Terminated",
	superseded: "Superseded",
};

const statusVariants: Record<EmploymentContractStatus, BadgeProps["variant"]> = {
	draft: "secondary",
	active: "default",
	expired: "outline",
	terminated: "destructive",
	superseded: "secondary",
};

function formatDate(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

	return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatTime(value: string) {
	const [hourValue, minute = "00"] = value.split(":");
	const hour = Number(hourValue);

	if (!Number.isInteger(hour) || hour < 0 || hour > 23) return value;
	return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatSalary(value: number) {
	return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function ContractSummary({ contract, employeeId, canManage, onEdit, onDelete }: { contract: EmploymentContract; employeeId: number; canManage: boolean; onEdit: (contract: EmploymentContract) => void; onDelete: (contract: EmploymentContract) => void }) {
	return (
		<div className="rounded-lg border bg-muted/30 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						{contract.isCurrent && <Badge>Current</Badge>}
						<Badge variant={statusVariants[contract.status]}>{statusLabels[contract.status]}</Badge>
						<Badge variant="outline">{contract.employmentType === "full_time" ? "Full-time" : "Part-time"}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">Contract term (derived): {formatDate(contract.startDate)} to {formatDate(contract.endDate)}</p>
					{contract.terminatedOn && <p className="text-sm text-destructive">Terminated on: {formatDate(contract.terminatedOn)}</p>}
				</div>
				{canManage && (
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onEdit(contract)}
						>
							<FilePenLine />
							Edit
						</Button>
						{contract.status === "draft" && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-destructive"
								onClick={() => onDelete(contract)}
							>
								<Trash2 />
								Delete
							</Button>
						)}
					</div>
				)}
			</div>

			<dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
				{canManage && (
					<div>
						<dt className="text-muted-foreground">Base salary</dt>
						<dd className="font-medium">{formatSalary(contract.baseSalary)}</dd>
					</div>
				)}
				<div>
					<dt className="text-muted-foreground">Schedule</dt>
					<dd className="font-medium">{contract.workDays.map((day) => dayLabels[day]).join(", ")}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Working time</dt>
					<dd className="font-medium">{formatTime(contract.workStartTime)} · {contract.workHoursPerDay} h/day</dd>
				</div>
			</dl>

			{contract.notes && <p className="mt-4 border-t pt-3 text-sm text-muted-foreground">{contract.notes}</p>}

			<ContractFileSection contract={contract} employeeId={employeeId} canManage={canManage} />
		</div>
	);
}

function ContractFileSection({ contract, employeeId, canManage }: { contract: EmploymentContract; employeeId: number; canManage: boolean }) {
	const uploadFile = useUploadContractFile();
	const deleteFile = useDeleteContractFile();
	const [fileKey, setFileKey] = useState(0);

	const handleFile = async (selected: File | null) => {
		if (!selected) return;
		try {
			await uploadFile.mutateAsync({ id: contract.id, employeeId, file: selected });
			// Success toast comes from the backend message via the axios interceptor.
		} catch (error) {
			toast.error(handleApiError(error));
		} finally {
			setFileKey((key) => key + 1);
		}
	};

	const handleRemove = async () => {
		try {
			await deleteFile.mutateAsync({ id: contract.id, employeeId });
			// Success toast comes from the backend message via the axios interceptor.
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	return (
		<div className="mt-4 space-y-2 border-t pt-3 text-sm">
			<div className="flex items-center gap-2 font-medium">
				<Paperclip className="h-4 w-4 text-muted-foreground" />
				Contract file
			</div>
			{contract.hasFile ? (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-muted-foreground">{contract.fileName}</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							void employmentContractsApi
								.downloadFile(contract.id, contract.fileName ?? "contract")
								.catch((error: unknown) => toast.error(handleApiError(error)));
						}}
					>
						Download
					</Button>
					{canManage && (
						<Button type="button" variant="ghost" size="sm" onClick={() => void handleRemove()} disabled={deleteFile.isPending}>
							<Trash2 className="h-3.5 w-3.5" />
							Remove file
						</Button>
					)}
				</div>
			) : canManage ? (
				<div className="flex flex-wrap items-center gap-2">
					<Label htmlFor={`contract-file-${contract.id}`} className="sr-only">Upload contract file</Label>
					<Input key={fileKey} id={`contract-file-${contract.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv" onChange={(event) => void handleFile(event.target.files?.[0] ?? null)} disabled={uploadFile.isPending} className="max-w-xs" />
					{uploadFile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
					<span className="text-xs text-muted-foreground">PDF, images, Office, or CSV up to 10 MB.</span>
				</div>
			) : (
				<p className="text-muted-foreground">No file attached.</p>
			)}
		</div>
	);
}

export function EmployeeContractsPanel({ employeeId, employeeName, canManage, isActive }: EmployeeContractsPanelProps) {
	const [mode, setMode] = useState<DialogMode>("overview");
	const [editingContract, setEditingContract] = useState<EmploymentContract | null>(null);
	const contractsQuery = useEmploymentContracts(employeeId, isActive && canManage);
	const createContract = useCreateEmploymentContract();
	const updateContract = useUpdateEmploymentContract();
	const deleteContract = useDeleteEmploymentContract();
	const form = useForm<EmploymentContractFormValues>({
		resolver: zodResolver(employmentContractSchema),
		mode: "onChange",
		defaultValues: getDefaultEmploymentContractFormValues(),
	});
	const startDate = useWatch({ control: form.control, name: "startDate" });
	const durationMonths = useWatch({ control: form.control, name: "durationMonths" });
	const selectedStatus = useWatch({ control: form.control, name: "status" });
	const isSaving = createContract.isPending || updateContract.isPending;
	const contracts = [...(contractsQuery.data ?? [])].sort((left, right) => right.startDate.localeCompare(left.startDate));
	const currentContract = contracts.find((contract) => contract.isCurrent) ?? contracts.find((contract) => contract.status === "active");
	const activeContract = contracts.find((contract) => contract.isCurrent && contract.status === "active") ?? contracts.find((contract) => contract.status === "active");
	const previewEndDate = deriveContractEndDate(startDate, durationMonths);
	const minimumTerminationDate = isValidContractDate(startDate) ? new Date(`${startDate}T00:00:00`) : undefined;
	const supersedesActiveContract = selectedStatus === "active" && activeContract && activeContract.id !== editingContract?.id;

	const openCreateForm = () => {
		setEditingContract(null);
		form.reset(getDefaultEmploymentContractFormValues());
		setMode("create");
	};

	const openEditForm = (contract: EmploymentContract) => {
		setEditingContract(contract);
		form.reset(toEmploymentContractFormValues(contract));
		setMode("edit");
	};

	const returnToOverview = () => {
		setEditingContract(null);
		setMode("overview");
	};

	const handleSubmit = async (values: EmploymentContractFormValues) => {
		const payload = buildEmploymentContractPayload(values);

		try {
			if (mode === "edit" && editingContract) {
				await updateContract.mutateAsync({ id: editingContract.id, employeeId, payload });
				// Success toast comes from the backend message via the axios interceptor.
			} else {
				await createContract.mutateAsync({ employeeId, payload });
				// Success toast comes from the backend message via the axios interceptor.
			}
			returnToOverview();
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	const handleDelete = async (contract: EmploymentContract) => {
		const confirmed = window.confirm(`Delete the draft contract starting ${contract.startDate}? This cannot be undone. Only draft contracts can be deleted.`);
		if (!confirmed) return;

		try {
			await deleteContract.mutateAsync({ id: contract.id, employeeId });
			// Success toast comes from the backend message via the axios interceptor.
		} catch (error) {
			toast.error(handleApiError(error));
		}
	};

	if (!canManage) return null;

	const isFormVisible = mode !== "overview";

	return (
		<div className="space-y-5">
			<div>
				<h2 className="text-lg font-semibold">{isFormVisible ? (mode === "edit" ? "Edit employment contract" : "New employment contract") : `Employment contracts for ${employeeName}`}</h2>
				<p className="text-sm text-muted-foreground">
					{isFormVisible
						? "Set the terms and schedule for this employment agreement."
						: "Review the current agreement and its renewal history. End dates displayed here are confirmed by the server."}
				</p>
			</div>
				{isFormVisible ? (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-5"
						>
							{Boolean(supersedesActiveContract) && (
								<Alert>
									<Info />
									<AlertTitle>This active contract will supersede the current active contract.</AlertTitle>
									<AlertDescription>The server will retain the prior agreement in history and mark the new one as current.</AlertDescription>
								</Alert>
							)}

							<div className="grid gap-4 sm:grid-cols-2">
								<FormSelect
									control={form.control}
									name="employmentType"
									label="Employment type"
									options={[
										{ value: "full_time", label: "Full-time" },
										{ value: "part_time", label: "Part-time" },
									]}
									disabled={isSaving}
								/>
								<FormInput
									control={form.control}
									name="baseSalary"
									label="Base salary"
									type="number"
									min={0}
									step="0.01"
									disabled={isSaving}
								/>
								<FormInput
									control={form.control}
									name="hourlyRate"
									label="Hourly rate (optional)"
									type="number"
									min={0}
									step="0.01"
									description="Leave empty to calculate from base salary and daily working hours."
									disabled={isSaving}
								/>
								<FormInput
									control={form.control}
									name="startDate"
									label="Start date"
									type="date"
									disabled={isSaving}
								/>
								<FormInput
									control={form.control}
									name="durationMonths"
									label="Duration (months)"
									type="number"
									min={1}
									max={120}
									step={1}
									disabled={isSaving}
								/>
							</div>

							<Alert>
								<CalendarDays />
								<AlertTitle>Estimated end date: {previewEndDate ? formatDate(previewEndDate) : "Enter a valid start date and duration"}</AlertTitle>
								<AlertDescription>This is a local preview. The saved end date is calculated and returned by the backend.</AlertDescription>
							</Alert>

							<div className="grid gap-4 sm:grid-cols-2">
								<FormInput
									control={form.control}
									name="workHoursPerDay"
									label="Working hours per day"
									type="number"
									min={0.25}
									max={24}
									step={0.25}
									disabled={isSaving}
								/>
								<FormInput
									control={form.control}
									name="workStartTime"
									label="Work start time"
									type="time"
									disabled={isSaving}
								/>
							</div>

							<div className="space-y-2">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<p className="text-sm font-medium">Working days</p>
									<Button
										type="button"
										variant="link"
										size="sm"
										disabled={isSaving}
										onClick={() => form.setValue("workDays", [...employmentContractWorkDays], { shouldDirty: true, shouldValidate: true })}
									>
										Select all days
									</Button>
								</div>
								<FormCheckboxGroup
									control={form.control}
									name="workDays"
									options={employmentContractWorkDays.map((day) => ({ value: day, label: dayLabels[day] }))}
									columns={4}
									disabled={isSaving}
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<FormSelect
									control={form.control}
									name="status"
									label="Contract status"
									options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
									disabled={isSaving}
								/>
								{selectedStatus === "terminated" && (
									<FormInput
										control={form.control}
										name="terminatedOn"
										label="Termination date"
										type="date"
										minDate={minimumTerminationDate}
										description="This is the actual termination date, separate from the contract term end date above."
										disabled={isSaving}
									/>
								)}
								<FormTextarea
									control={form.control}
									name="notes"
									label="Notes"
									placeholder="Optional context for this agreement"
									rows={3}
									disabled={isSaving}
								/>
							</div>

							<DialogFooter className="gap-2 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={returnToOverview}
									disabled={isSaving}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSaving || !form.formState.isValid}
								>
									{isSaving && <Loader2 className="animate-spin" />}
									{mode === "edit" ? "Save changes" : "Create contract"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				) : (
					<div className="space-y-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h3 className="font-semibold">Current contract</h3>
								<p className="text-sm text-muted-foreground">Active agreements are current until renewed, ended, or superseded.</p>
							</div>
							<Button
								type="button"
								onClick={openCreateForm}
							>
								{currentContract ? <RotateCcw /> : <Plus />}
								{currentContract ? "Renew contract" : "Add contract"}
							</Button>
						</div>

						{contractsQuery.isLoading ? (
							<div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
								<Loader2 className="animate-spin" />
								Loading employment contracts...
							</div>
						) : contractsQuery.isError ? (
							<Alert variant="destructive">
								<AlertCircle />
								<AlertTitle>Unable to load employment contracts</AlertTitle>
								<AlertDescription className="items-start">
									<span>{handleApiError(contractsQuery.error)}</span>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => contractsQuery.refetch()}
									>
										Try again
									</Button>
								</AlertDescription>
							</Alert>
						) : currentContract ? (
							<ContractSummary
								contract={currentContract}
								employeeId={employeeId}
								canManage={canManage}
								onEdit={openEditForm}
								onDelete={(contract) => void handleDelete(contract)}
							/>
						) : (
							<div className="rounded-lg border border-dashed px-4 py-10 text-center">
								<FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
								<p className="font-medium">No current contract</p>
								<p className="mt-1 text-sm text-muted-foreground">Add an agreement to establish this employee’s terms and schedule.</p>
							</div>
						)}

						<div className="space-y-3 border-t pt-5">
							<div>
								<h3 className="font-semibold">Contract history</h3>
								<p className="text-sm text-muted-foreground">Previous, expired, terminated, and superseded agreements remain available for reference.</p>
							</div>
							{contracts.filter((contract) => contract.id !== currentContract?.id).length > 0 ? (
								<div className="space-y-3">
									{contracts
										.filter((contract) => contract.id !== currentContract?.id)
										.map((contract) => (
											<ContractSummary
												key={contract.id}
												contract={contract}
												employeeId={employeeId}
												canManage={canManage}
												onEdit={openEditForm}
												onDelete={(item) => void handleDelete(item)}
											/>
										))}
								</div>
							) : (
								<p className="py-4 text-sm text-muted-foreground">No previous employment contracts.</p>
							)}
						</div>
					</div>
				)}
		</div>
	);
}
