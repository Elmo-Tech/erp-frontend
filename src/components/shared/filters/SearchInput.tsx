"use client";

import { useState, useCallback, useEffect } from "react";
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
	const [internalValue, setInternalValue] = useState(controlledValue ?? "");

	useEffect(() => {
		setInternalValue(controlledValue ?? "");
	}, [controlledValue]);

	const debouncedOnChange = useDebouncedCallback(onChange, debounceMs);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setInternalValue(newValue);

			if (autoSearch) {
				debouncedOnChange(newValue);
			}
		},
		[autoSearch, debouncedOnChange]
	);

	const handleClear = useCallback(() => {
		setInternalValue("");
		onChange("");
	}, [onChange]);

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
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="pl-9 pr-8"
				/>
				{showClear && internalValue && (
					<button
						type="button"
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
