import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: {
		variant: {
			default: "border-transparent bg-primary-soft text-accent-foreground",
			secondary: "border-transparent bg-secondary text-secondary-foreground",
			destructive: "border-transparent bg-destructive-soft text-destructive",
			outline: "border-border-strong bg-surface text-foreground",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
