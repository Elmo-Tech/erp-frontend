"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FieldPath, useForm } from "react-hook-form";
import { Edit3, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/shared/api/base";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { Spinner } from "@/shared/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { cn } from "@/shared/lib/utils";
import { buildDictionaryPayload, normalizeDictionaryEndpoint, normalizeDictionaryItems, type DictionaryColumn, type DictionaryItem } from "../model/dictionary-manager";

interface DictionaryManagerProps {
	entityName: string;
	apiEndpoint: string;
	columns?: DictionaryColumn[];
}

type DictionaryFormValues = Record<string, string | number | undefined>;

const defaultColumns: DictionaryColumn[] = [{ key: "name", label: "Name", required: true }];

function createEmptyValues(columns: DictionaryColumn[]): DictionaryFormValues {
	return columns.reduce<DictionaryFormValues>((values, column) => {
		values[column.key] = column.type === "number" ? undefined : "";
		return values;
	}, {});
}

function createValuesFromItem(item: DictionaryItem, columns: DictionaryColumn[]): DictionaryFormValues {
	return columns.reduce<DictionaryFormValues>((values, column) => {
		const value = item[column.key];
		values[column.key] = typeof value === "number" || typeof value === "string" ? value : column.type === "number" ? undefined : "";
		return values;
	}, {});
}

function getItemLabel(item: DictionaryItem) {
	return String(item.name ?? item.label ?? item.title ?? item.id);
}

export function DictionaryManager({ entityName, apiEndpoint, columns = defaultColumns }: DictionaryManagerProps) {
	const endpoint = useMemo(() => normalizeDictionaryEndpoint(apiEndpoint), [apiEndpoint]);
	const queryKey = useMemo(() => ["settings-dictionary", endpoint] as const, [endpoint]);
	const queryClient = useQueryClient();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null);
	const [deletingItem, setDeletingItem] = useState<DictionaryItem | null>(null);
	const emptyValues = useMemo(() => createEmptyValues(columns), [columns]);

	const form = useForm<DictionaryFormValues>({
		defaultValues: emptyValues,
	});

	const dictionaryQuery = useQuery({
		queryKey,
		queryFn: async () => {
			const response = await api.get(endpoint);
			return normalizeDictionaryItems(response.data);
		},
	});

	const createMutation = useMutation({
		mutationFn: async (payload: Record<string, unknown>) => {
			const response = await api.post(endpoint, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success(`${entityName} created`);
			closeForm();
		},
		onError: () => toast.error(`Failed to create ${entityName.toLowerCase()}`),
	});

	const updateMutation = useMutation({
		mutationFn: async ({ id, payload }: { id: DictionaryItem["id"]; payload: Record<string, unknown> }) => {
			const response = await api.put(`${endpoint}/${id}`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success(`${entityName} updated`);
			closeForm();
		},
		onError: () => toast.error(`Failed to update ${entityName.toLowerCase()}`),
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: DictionaryItem["id"]) => {
			await api.delete(`${endpoint}/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success(`${entityName} deleted`);
			setDeletingItem(null);
		},
		onError: () => toast.error(`Failed to delete ${entityName.toLowerCase()}`),
	});

	const items = dictionaryQuery.data ?? [];
	const isSaving = createMutation.isPending || updateMutation.isPending;

	const openCreateForm = () => {
		setEditingItem(null);
		form.reset(emptyValues);
		setIsFormOpen(true);
	};

	const openEditForm = (item: DictionaryItem) => {
		setEditingItem(item);
		form.reset(createValuesFromItem(item, columns));
		setIsFormOpen(true);
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingItem(null);
		form.reset(emptyValues);
	};

	const handleSubmit = form.handleSubmit((values) => {
		form.clearErrors();

		const missingColumn = columns.find((column) => {
			if (!column.required) {
				return false;
			}

			const value = values[column.key];
			return value === undefined || value === "" || (typeof value === "string" && value.trim().length === 0);
		});

		if (missingColumn) {
			form.setError(missingColumn.key as FieldPath<DictionaryFormValues>, {
				type: "required",
				message: `${missingColumn.label} is required`,
			});
			return;
		}

		const payload = buildDictionaryPayload(values as DictionaryItem, columns);

		if (editingItem) {
			updateMutation.mutate({ id: editingItem.id, payload });
			return;
		}

		createMutation.mutate(payload);
	});

	return (
		<div className="space-y-5">
			<header className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">{entityName}s</h1>
					<p className="text-sm text-muted-foreground">Manage reusable {entityName.toLowerCase()} values used across the workspace.</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => dictionaryQuery.refetch()}
						disabled={dictionaryQuery.isFetching}
						aria-label={`Refresh ${entityName}s`}
					>
						<RefreshCw className={cn("size-4", dictionaryQuery.isFetching && "animate-spin")} />
					</Button>
					<Button onClick={openCreateForm}>
						<Plus className="size-4" />
						Add New {entityName}
					</Button>
				</div>
			</header>

			<div className="overflow-hidden rounded-lg border bg-background shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40">
							{columns.map((column) => (
								<TableHead
									key={column.key}
									className="h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
								>
									{column.label}
								</TableHead>
							))}
							<TableHead className="h-11 w-24 px-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dictionaryQuery.isLoading ? (
							<TableRow>
								<TableCell
									colSpan={columns.length + 1}
									className="h-40 text-center"
								>
									<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
										<Spinner />
										Loading {entityName.toLowerCase()}s
									</div>
								</TableCell>
							</TableRow>
						) : null}

						{dictionaryQuery.isError ? (
							<TableRow>
								<TableCell
									colSpan={columns.length + 1}
									className="h-40 text-center"
								>
									<div className="space-y-3">
										<p className="text-sm text-muted-foreground">Unable to load {entityName.toLowerCase()}s.</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => dictionaryQuery.refetch()}
										>
											Retry
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : null}

						{!dictionaryQuery.isLoading && !dictionaryQuery.isError && items.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length + 1}
									className="h-40 text-center"
								>
									<div className="space-y-3">
										<p className="text-sm text-muted-foreground">No {entityName.toLowerCase()}s have been created yet.</p>
										<Button
											variant="outline"
											size="sm"
											onClick={openCreateForm}
										>
											<Plus className="size-4" />
											Add {entityName}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : null}

						{items.map((item) => (
							<TableRow
								key={item.id}
								className="group"
							>
								{columns.map((column) => (
									<TableCell
										key={column.key}
										className="px-4"
									>
										{column.render ? column.render(item) : <span className="font-medium text-foreground">{String(item[column.key] ?? "-")}</span>}
									</TableCell>
								))}
								<TableCell className="px-4 text-right">
									<div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => openEditForm(item)}
											aria-label={`Edit ${getItemLabel(item)}`}
											className="text-muted-foreground hover:text-foreground"
										>
											<Edit3 className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setDeletingItem(item)}
											aria-label={`Delete ${getItemLabel(item)}`}
											className="text-muted-foreground hover:text-destructive"
										>
											<Trash2 className="size-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Dialog
				open={isFormOpen}
				onOpenChange={(open) => (open ? setIsFormOpen(true) : closeForm())}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editingItem ? `Edit ${entityName}` : `Add New ${entityName}`}</DialogTitle>
						<DialogDescription>{editingItem ? `Update this ${entityName.toLowerCase()}.` : `Create a new ${entityName.toLowerCase()} value.`}</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form
							id="dictionary-manager-form"
							onSubmit={handleSubmit}
							className="space-y-4"
						>
							{columns.map((column) => (
								<FormInput
									key={column.key}
									control={form.control}
									name={column.key as FieldPath<DictionaryFormValues>}
									label={column.label}
									type={column.type ?? "text"}
									placeholder={column.placeholder ?? column.label}
									disabled={isSaving}
								/>
							))}
						</form>
					</Form>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={closeForm}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="dictionary-manager-form"
							disabled={isSaving}
						>
							{isSaving ? <Spinner /> : null}
							{editingItem ? `Save ${entityName}` : `Create ${entityName}`}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={!!deletingItem}
				onOpenChange={(open) => !open && setDeletingItem(null)}
				title={`Delete ${entityName}`}
				description={
					deletingItem ? (
						<span>
							Delete <span className="font-medium text-foreground">{getItemLabel(deletingItem)}</span>? This action cannot be undone.
						</span>
					) : (
						`Delete this ${entityName.toLowerCase()}?`
					)
				}
				confirmLabel="Delete"
				variant="destructive"
				isLoading={deleteMutation.isPending}
				onConfirm={() => {
					if (deletingItem) {
						deleteMutation.mutate(deletingItem.id);
					}
				}}
			/>
		</div>
	);
}
