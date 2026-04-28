import { FileText } from "lucide-react";
import type { Template, TemplateKind } from "../model/types";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

interface TemplateListItemProps {
	template: Template;
	kind: TemplateKind;
	className?: string;
}

export function TemplateListItem({ template, kind, className }: TemplateListItemProps) {
	return (
		<div className={cn("flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0", className)}>
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
					<FileText className="size-4 text-muted-foreground" />
				</div>
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{template.name}</p>
					<p className="text-xs text-muted-foreground">{kind} / {template.type}</p>
				</div>
			</div>
			<Badge variant={template.isActive ? "secondary" : "outline"}>{template.isActive ? "Active" : "Inactive"}</Badge>
		</div>
	);
}

