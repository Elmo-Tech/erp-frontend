"use client";

import { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { LucideIcon, FolderOpen } from "lucide-react";

interface EmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
	children?: ReactNode;
}

export function EmptyState({ icon: Icon = FolderOpen, title, description, action, className, children }: EmptyStateProps) {
	return (
		<div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
			<Icon className="h-12 w-12 text-muted-foreground mb-4" />
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			{description && <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>}
			{action && (
				<Button
					variant="outline"
					onClick={action.onClick}
				>
					{action.label}
				</Button>
			)}
			{children}
		</div>
	);
}
