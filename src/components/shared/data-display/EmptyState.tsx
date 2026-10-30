"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
			<div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-7 w-7" /></div>
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
