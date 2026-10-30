"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/lib/hooks/useDebounce";

interface SearchInputProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	debounceMs?: number;
	showClear?: boolean;
	autoSearch?: boolean;
}

export function SearchInput({ value: controlledValue, onChange, placeholder = "Search...", className, debounceMs = 300, showClear = true, autoSearch = true }: SearchInputProps) {
	const normalizedValue = controlledValue ?? "";
	const [inputState, setInputState] = useState({
		controlledValue: normalizedValue,
		internalValue: normalizedValue,
	});

	if (inputState.controlledValue !== normalizedValue) {
		setInputState({
			controlledValue: normalizedValue,
			internalValue: normalizedValue,
		});
	}

	const internalValue = inputState.controlledValue === normalizedValue ? inputState.internalValue : normalizedValue;

	const debouncedOnChange = useDebouncedCallback(onChange, debounceMs);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setInputState({
				controlledValue: normalizedValue,
				internalValue: newValue,
			});

			if (autoSearch) {
				debouncedOnChange(newValue);
			}
		},
		[autoSearch, debouncedOnChange, normalizedValue]
	);

	const handleClear = useCallback(() => {
		setInputState({
			controlledValue: normalizedValue,
			internalValue: "",
		});
		onChange("");
	}, [normalizedValue, onChange]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" && !autoSearch) {
				onChange(internalValue);
			}
		},
		[autoSearch, internalValue, onChange]
	);

	return (
		<div className={cn("relative flex items-center gap-2", className)}>
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					value={internalValue}
					aria-label={placeholder}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="pl-9 pr-8"
				/>
				{showClear && internalValue && (
					<button
						type="button"
						aria-label="Clear search"
						onClick={handleClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
			{!autoSearch && (
				<Button
					variant="outline"
					onClick={() => onChange(internalValue)}
				>
					Search
				</Button>
			)}
		</div>
	);
}
