"use client";

import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Employee } from "@/features/hr/types";

interface PipelineEmployeePickerProps {
	employees: Employee[];
	selectedUserIds: number[];
	onSelectionChange: (userIds: number[]) => void;
	isLoading?: boolean;
}

function employeeInitials(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();
}

export function PipelineEmployeePicker({
	employees,
	selectedUserIds,
	onSelectionChange,
	isLoading = false,
}: PipelineEmployeePickerProps) {
	const selectedEmployees = employees.filter((employee) => selectedUserIds.includes(employee.userId));

	const toggleEmployee = (userId: number) => {
		onSelectionChange(
			selectedUserIds.includes(userId)
				? selectedUserIds.filter((id) => id !== userId)
				: [...selectedUserIds, userId]
		);
	};

	return (
		<div className="space-y-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						role="combobox"
						className="h-10 w-full justify-between font-normal"
						aria-label="Choose employees for this task"
					>
						<span className="truncate">
							{selectedEmployees.length > 0
								? `${selectedEmployees.length} employee${selectedEmployees.length === 1 ? "" : "s"} selected`
								: "Choose employees"}
						</span>
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
					<Command>
						<CommandInput placeholder="Search employees..." />
						<CommandList>
							{isLoading ? (
								<div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
									<Loader2 className="h-4 w-4 animate-spin" />
									Loading employees
								</div>
							) : (
								<>
									<CommandEmpty>No active employees found.</CommandEmpty>
									<CommandGroup>
										{employees.map((employee) => {
											const isSelected = selectedUserIds.includes(employee.userId);

											return (
												<CommandItem
													key={employee.userId}
													value={`${employee.name} ${employee.email}`}
													onSelect={() => toggleEmployee(employee.userId)}
													className="py-2"
												>
													<div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border", isSelected && "border-primary bg-primary text-primary-foreground")}>
														{isSelected && <Check className="h-3 w-3" />}
													</div>
													<Avatar className="h-7 w-7">
														<AvatarImage src={employee.avatar} alt="" />
														<AvatarFallback className="text-[10px]">{employeeInitials(employee.name)}</AvatarFallback>
													</Avatar>
													<div className="min-w-0 flex-1">
														<p className="truncate font-medium">{employee.name}</p>
														<p className="truncate text-xs text-muted-foreground">{employee.email}</p>
													</div>
												</CommandItem>
											);
										})}
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{selectedEmployees.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{selectedEmployees.map((employee) => (
						<div key={employee.userId} className="flex items-center gap-2 rounded-full border bg-muted/40 py-1 pr-1 pl-1.5 text-xs">
							<Avatar className="h-5 w-5">
								<AvatarImage src={employee.avatar} alt="" />
								<AvatarFallback className="text-[8px]">{employeeInitials(employee.name)}</AvatarFallback>
							</Avatar>
							<span className="max-w-36 truncate">{employee.name}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-5 w-5 rounded-full"
								onClick={() => toggleEmployee(employee.userId)}
								aria-label={`Remove ${employee.name}`}
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
