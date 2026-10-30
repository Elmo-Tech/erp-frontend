import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	description?: string;
	icon?: LucideIcon;
	actions?: ReactNode;
	className?: string;
}

export function PageHeader({ title, description, icon: Icon, actions, className }: PageHeaderProps) {
	return (
		<header className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
			<div className="flex min-w-0 items-start gap-3">
				{Icon && <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" /></span>}
				<div className="min-w-0 space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
					{description && <p className="text-sm text-muted-foreground">{description}</p>}
				</div>
			</div>
			{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
		</header>
	);
}
