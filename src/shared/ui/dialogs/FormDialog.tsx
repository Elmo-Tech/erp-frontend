"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface FormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	children: ReactNode;
	onSubmit?: () => void;
	submitLabel?: string;
	cancelLabel?: string;
	isLoading?: boolean;
	isSubmitDisabled?: boolean;
	className?: string;
	showFooter?: boolean;
	size?: "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl" | "4xl" | "5xl" | "6xl" | "full";
}

const sizeClasses = {
	sm: "max-w-sm!",
	md: "max-w-md!",
	lg: "max-w-lg!",
	xl: "max-w-xl!",
	xxl: "max-w-2xl!",
	xxxl: "max-w-3xl!",
	"4xl": "max-w-4xl!",
	"5xl": "max-w-5xl!",
	"6xl": "max-w-6xl!",
	full: "max-w-4xl!",
};

export function FormDialog({ open, onOpenChange, title, description, children, onSubmit, submitLabel = "Save", cancelLabel = "Cancel", isLoading = false, isSubmitDisabled = false, className, showFooter = true, size = "lg" }: FormDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className={cn("max-h-[90vh] overflow-y-auto", sizeClasses[size], className)}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				{children}

				{showFooter && (
					<DialogFooter className="gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							{cancelLabel}
						</Button>
						{onSubmit && (
							<Button
								type="submit"
								onClick={onSubmit}
								disabled={isLoading || isSubmitDisabled}
							>
								{isLoading ? "Saving..." : submitLabel}
							</Button>
						)}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
