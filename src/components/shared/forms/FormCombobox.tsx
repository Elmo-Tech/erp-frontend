"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FormComboboxOption {
	value: string;
	label: string;
}

interface FormComboboxProps {
	id: string;
	label: string;
	value?: string;
	options: FormComboboxOption[];
	onValueChange: (value: string) => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	isLoading?: boolean;
	disabled?: boolean;
}

export function FormCombobox({
	id,
	label,
	value,
	options,
	onValueChange,
	searchValue,
	onSearchChange,
	placeholder = "Select an option",
	searchPlaceholder = "Search...",
	emptyMessage = "No options found",
	isLoading = false,
	disabled = false,
}: FormComboboxProps) {
	const [open, setOpen] = useState(false);
	const selected = options.find((option) => option.value === value);

	const handleSelect = (nextValue: string) => {
		onValueChange(nextValue);
		setOpen(false);
	};

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						id={id}
						type="button"
						variant="outline"
						role="combobox"
						aria-expanded={open}
						disabled={disabled}
						className="w-full justify-between font-normal"
					>
						<span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-[--radix-popover-trigger-width] p-0"
				>
					<Command shouldFilter={false}>
						<CommandInput
							value={searchValue}
							onValueChange={onSearchChange}
							placeholder={searchPlaceholder}
						/>
						<CommandList>
							{isLoading && (
								<div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
									<Loader2 className="h-4 w-4 animate-spin" />
									Loading...
								</div>
							)}
							{!isLoading && <CommandEmpty>{emptyMessage}</CommandEmpty>}
							<CommandGroup>
								{options.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={() => handleSelect(option.value)}
									>
										<Check className={cn("h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
										<span className="truncate">{option.label}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
