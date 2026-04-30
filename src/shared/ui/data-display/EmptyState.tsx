"use client";

import { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

/* ─── Root ─── */
interface EmptyProps {
	className?: string;
	children?: ReactNode;
}

export function Empty({ className, children }: EmptyProps) {
	return (
		<div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
			{children}
		</div>
	);
}

/* ─── EmptyState (legacy single-component API) ─── */
import type { LucideIcon } from "lucide-react";
import { FolderOpen } from "lucide-react";

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
		<Empty className={className}>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon />
				</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				{description && <EmptyDescription>{description}</EmptyDescription>}
			</EmptyHeader>
			{(action || children) && (
				<EmptyContent>
					{action && (
						<Button onClick={action.onClick} variant="outline">
							{action.label}
						</Button>
					)}
					{children}
				</EmptyContent>
			)}
		</Empty>
	);
}

/* ─── Header ─── */
interface EmptyHeaderProps {
	className?: string;
	children?: ReactNode;
}

export function EmptyHeader({ className, children }: EmptyHeaderProps) {
	return <div className={cn("flex flex-col items-center gap-2", className)}>{children}</div>;
}

/* ─── Media ─── */
interface EmptyMediaProps {
	variant?: "icon" | "illustration";
	className?: string;
	children?: ReactNode;
}

export function EmptyMedia({ variant = "icon", className, children }: EmptyMediaProps) {
	return (
		<div
			className={cn(
				"mb-2 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground",
				variant === "icon" ? "size-14 [&>svg]:size-6" : "size-24",
				className,
			)}
		>
			{children}
		</div>
	);
}

/* ─── Title ─── */
interface EmptyTitleProps {
	className?: string;
	children?: ReactNode;
}

export function EmptyTitle({ className, children }: EmptyTitleProps) {
	return <h3 className={cn("text-lg font-semibold", className)}>{children}</h3>;
}

/* ─── Description ─── */
interface EmptyDescriptionProps {
	className?: string;
	children?: ReactNode;
}

export function EmptyDescription({ className, children }: EmptyDescriptionProps) {
	return <p className={cn("max-w-sm text-sm text-muted-foreground", className)}>{children}</p>;
}

/* ─── Content (action area) ─── */
interface EmptyContentProps {
	className?: string;
	children?: ReactNode;
}

export function EmptyContent({ className, children }: EmptyContentProps) {
	return <div className={cn("mt-4 flex items-center gap-2", className)}>{children}</div>;
}
