import * as React from "react";

import { cn } from "@/shared/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"h-9 w-full min-w-0 rounded-lg border border-input bg-surface px-3 py-1 text-base text-foreground shadow-xs transition-[border-color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
				"focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
				"aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
				className
			)}
			{...props}
		/>
	);
}

export { Input };
