import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
	title: ReactNode;
	/** One line of context under the title. */
	description?: ReactNode;
	/** Primary and secondary actions, right-aligned on wide screens. */
	actions?: ReactNode;
	/** Optional content rendered before the title (e.g. an icon tile or avatar). */
	leading?: ReactNode;
	className?: string;
	children?: ReactNode;
}

/**
 * Consistent page header: title, context and primary actions.
 * Breadcrumbs live in the top bar, so this stays focused on the page itself.
 */
export function PageHeader({ title, description, actions, leading, className, children }: PageHeaderProps) {
	return (
		<header data-slot="page-header" className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
			<div className="flex min-w-0 items-start gap-3.5">
				{leading}
				<div className="min-w-0">
					<h1 className="truncate text-[1.375rem] leading-8 font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">{title}</h1>
					{description && <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">{description}</p>}
					{children}
				</div>
			</div>
			{actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
		</header>
	);
}
