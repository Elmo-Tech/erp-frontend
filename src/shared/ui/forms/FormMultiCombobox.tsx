"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MultiComboboxOption {
	value: string;
	label: string;
	group?: string;
	description?: string;
	disabled?: boolean;
}

interface FormMultiComboboxProps<TFieldValues extends FieldValues, TTransformedValues = TFieldValues> {
	control: Control<TFieldValues, unknown, TTransformedValues>;
	name: FieldPath<TFieldValues>;
	label?: string;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	description?: string;
	options: MultiComboboxOption[];
	disabled?: boolean;
	className?: string;
	/** Max badge tags shown before "+N more" summary. Default: 3 */
	maxBadges?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FormMultiCombobox — multi-select searchable dropdown with badge tags
//
// The field value is string[]. Selecting an already-selected item deselects it.
//
// Usage:
//   <FormMultiCombobox
//     control={form.control}
//     name="permissions"
//     label="Permissions"
//     placeholder="Select permissions…"
//     searchPlaceholder="Search permissions…"
//     options={permissionOptions}
//   />
// ─────────────────────────────────────────────────────────────────────────────

export function FormMultiCombobox<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>({
	control,
	name,
	label,
	placeholder = "Select options…",
	searchPlaceholder = "Search…",
	emptyText = "No results found.",
	description,
	options,
	disabled = false,
	className,
	maxBadges = 3,
}: FormMultiComboboxProps<TFieldValues, TTransformedValues>) {
	const [open, setOpen] = useState(false);

	// Group options if any have a group property
	const grouped = options.reduce<Record<string, MultiComboboxOption[]>>((acc, opt) => {
		const g = opt.group ?? "";
		(acc[g] ??= []).push(opt);
		return acc;
	}, {});
	const hasGroups = Object.keys(grouped).some((g) => g !== "");

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const selected: string[] = Array.isArray(field.value) ? field.value : [];

				const toggle = (value: string) => {
					const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
					field.onChange(next);
				};

				const remove = (value: string, e: React.MouseEvent) => {
					e.stopPropagation();
					field.onChange(selected.filter((v) => v !== value));
				};

				const visibleBadges = selected.slice(0, maxBadges);
				const overflow = selected.length - maxBadges;

				return (
					<FormItem className={className}>
						{label && <FormLabel>{label}</FormLabel>}

						<Popover
							open={open}
							onOpenChange={setOpen}
						>
							<PopoverTrigger asChild>
								<FormControl>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={open}
										disabled={disabled}
										className={cn("h-auto min-h-9 w-full justify-between font-normal", selected.length === 0 && "text-muted-foreground")}
									>
										{selected.length === 0 ? (
											<span className="truncate">{placeholder}</span>
										) : (
											<div className="flex flex-wrap gap-1 py-0.5">
												{visibleBadges.map((val) => {
													const opt = options.find((o) => o.value === val);
													return (
														<Badge
															key={val}
															variant="secondary"
															className="gap-1 rounded-sm px-1.5 py-0 text-xs font-normal"
														>
															{opt?.label ?? val}
															<button
																type="button"
																onClick={(e) => remove(val, e)}
																className="ml-0.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
																aria-label={`Remove ${opt?.label ?? val}`}
															>
																<X className="size-3 text-muted-foreground hover:text-foreground" />
															</button>
														</Badge>
													);
												})}
												{overflow > 0 && (
													<Badge
														variant="outline"
														className="rounded-sm px-1.5 py-0 text-xs font-normal text-muted-foreground"
													>
														+{overflow} more
													</Badge>
												)}
											</div>
										)}
										<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
									</Button>
								</FormControl>
							</PopoverTrigger>

							<PopoverContent
								className="w-[--radix-popover-trigger-width] p-0"
								align="start"
							>
								<Command>
									<CommandInput placeholder={searchPlaceholder} />
									<CommandList className="max-h-64">
										<CommandEmpty>{emptyText}</CommandEmpty>

										{hasGroups ? (
											Object.entries(grouped).map(([group, items]) => (
												<CommandGroup
													key={group}
													heading={group || undefined}
												>
													{items.map((opt) => (
														<MultiItem
															key={opt.value}
															option={opt}
															selected={selected}
															onToggle={toggle}
														/>
													))}
												</CommandGroup>
											))
										) : (
											<CommandGroup>
												{options.map((opt) => (
													<MultiItem
														key={opt.value}
														option={opt}
														selected={selected}
														onToggle={toggle}
													/>
												))}
											</CommandGroup>
										)}
									</CommandList>

									{selected.length > 0 && (
										<div className="border-t p-1">
											<button
												type="button"
												onClick={() => field.onChange([])}
												className="w-full rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
											>
												Clear all ({selected.length})
											</button>
										</div>
									)}
								</Command>
							</PopoverContent>
						</Popover>

						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// MultiItem — individual row inside the dropdown
// ─────────────────────────────────────────────────────────────────────────────

function MultiItem({ option, selected, onToggle }: { option: MultiComboboxOption; selected: string[]; onToggle: (value: string) => void }) {
	const isSelected = selected.includes(option.value);

	return (
		<CommandItem
			value={option.label} // search against label
			disabled={option.disabled}
			onSelect={() => onToggle(option.value)}
			className="gap-2"
		>
			<div className={cn("flex size-4 shrink-0 items-center justify-center rounded-sm border", isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")}>{isSelected && <Check className="size-3" />}</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm">{option.label}</p>
				{option.description && <p className="truncate text-xs text-muted-foreground">{option.description}</p>}
			</div>
		</CommandItem>
	);
}
