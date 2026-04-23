"use client";

import React from "react";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/utils";

interface ProgressBarProps {
	/** Progress percentage (0-100) */
	percentage: number;
	/** Whether to show the percentage text */
	showText?: boolean;
	/** Size variant */
	size?: "sm" | "md" | "lg";
	/** Additional CSS classes */
	className?: string;
	/** Label to display before the progress bar */
	label?: string;
}

/**
 * ProgressBar component for displaying visual progress with percentage text.
 * Used in client portal to show project completion status.
 *
 * Requirements: 14.2 - Display visual progress bar based on progressPercentage
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, showText = true, size = "md", className = "", label }) => {
	// Ensure percentage is within valid range
	const normalizedPercentage = Math.min(100, Math.max(0, percentage));

	// Size-based styling
	const sizeClasses = {
		sm: "h-1.5",
		md: "h-2",
		lg: "h-3",
	};

	const textSizeClasses = {
		sm: "text-xs",
		md: "text-sm",
		lg: "text-base",
	};

	// Color based on progress
	const getProgressColor = () => {
		if (normalizedPercentage >= 100) return "bg-green-500";
		if (normalizedPercentage >= 75) return "bg-blue-500";
		if (normalizedPercentage >= 50) return "bg-yellow-500";
		if (normalizedPercentage >= 25) return "bg-orange-500";
		return "bg-red-500";
	};

	return (
		<div className={cn("w-full", className)}>
			{(label || showText) && (
				<div className="flex items-center justify-between mb-1">
					{label && <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>{label}</span>}
					{showText && <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>{normalizedPercentage}%</span>}
				</div>
			)}
			<div className={cn("relative w-full overflow-hidden rounded-full bg-secondary", sizeClasses[size])}>
				<div
					className={cn("h-full transition-all duration-300 ease-in-out rounded-full", getProgressColor())}
					style={{ width: `${normalizedPercentage}%` }}
				/>
			</div>
		</div>
	);
};

export default ProgressBar;
