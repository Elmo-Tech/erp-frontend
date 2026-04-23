"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { X } from "lucide-react";

interface TagInputProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
	maxTags?: number;
}

export function TagInput<T extends FieldValues>({ control, name, label, placeholder = "Type and press Enter", description, disabled = false, className, maxTags }: TagInputProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const tags: string[] = field.value || [];

				const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
					if (e.key === "Enter") {
						e.preventDefault();
						const input = e.currentTarget;
						const value = input.value.trim();

						if (value && !tags.includes(value)) {
							if (maxTags && tags.length >= maxTags) return;
							field.onChange([...tags, value]);
						}
						input.value = "";
					}
				};

				const handleRemove = (tagToRemove: string) => {
					field.onChange(tags.filter((t) => t !== tagToRemove));
				};

				return (
					<FormItem className={className}>
						{label && <FormLabel>{label}</FormLabel>}
						<FormControl>
							<div className="space-y-2">
								<Input
									placeholder={placeholder}
									onKeyDown={handleKeyDown}
									disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
								/>
								{tags.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{tags.map((tag) => (
											<Badge
												key={tag}
												variant="secondary"
												className="gap-1"
											>
												{tag}
												<button
													type="button"
													onClick={() => handleRemove(tag)}
													className="hover:text-destructive"
													disabled={disabled}
												>
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
								)}
							</div>
						</FormControl>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}
