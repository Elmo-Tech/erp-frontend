"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ComboboxOption {
	value: string;
	label: string;
	description?: string;
	disabled?: boolean;
}

interface FormComboboxProps<TFieldValues extends FieldValues, TTransformedValues = TFieldValues> {
	control: Control<TFieldValues, unknown, TTransformedValues>;
	name: FieldPath<TFieldValues>;
	label?: string;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	description?: string;
	options: ComboboxOption[];
	disabled?: boolean;
	className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FormCombobox — single-select searchable dropdown
//
// Usage:
//   <FormCombobox
//     control={form.control}
//     name="userId"
//     label="User"
//     placeholder="Select a user…"
//     searchPlaceholder="Search users…"
//     options={userOptions}
//   />
// ─────────────────────────────────────────────────────────────────────────────

export function FormCombobox<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>({
	control,
	name,
	label,
	placeholder = "Select an option…",
	searchPlaceholder = "Search…",
	emptyText = "No results found.",
	description,
	options,
	disabled = false,
	className,
}: FormComboboxProps<TFieldValues, TTransformedValues>) {
	const [open, setOpen] = useState(false);

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const selected = options.find((o) => o.value === field.value);

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
										className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground")}
									>
										<span className="truncate">{selected ? selected.label : placeholder}</span>
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
									<CommandList>
										<CommandEmpty>{emptyText}</CommandEmpty>
										<CommandGroup>
											{options.map((option) => (
												<CommandItem
													key={option.value}
													value={option.label} // search against label, not value
													disabled={option.disabled}
													onSelect={() => {
														field.onChange(option.value);
														setOpen(false);
													}}
												>
													<Check className={cn("mr-2 size-4 shrink-0", field.value === option.value ? "opacity-100" : "opacity-0")} />
													<div className="min-w-0">
														<p className="truncate text-sm">{option.label}</p>
														{option.description && <p className="truncate text-xs text-muted-foreground">{option.description}</p>}
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
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
