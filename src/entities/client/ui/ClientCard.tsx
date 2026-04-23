"use client";

import { MoreHorizontal } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { ClientStatusBadge } from "@/shared/ui/StatusBadge";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";
import type { Client } from "../model/types";

interface ClientCardProps {
	client: Client;
	onView?: (client: Client) => void;
	onEdit?: (client: Client) => void;
	onDelete?: (client: Client) => void;
	className?: string;
}

function fallback(value: string | null | undefined) {
	return value?.trim() || "Not set";
}

export function ClientCard({ client, onView, onEdit, onDelete, className }: ClientCardProps) {
	const projectCount = client.projectsCount ?? 0;
	const totalRevenue = client.totalRevenue ?? 0;

	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (!onView) {
			return;
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onView(client);
		}
	};

	return (
		<article
			role={onView ? "button" : undefined}
			tabIndex={onView ? 0 : undefined}
			onClick={() => onView?.(client)}
			onKeyDown={handleKeyDown}
			className={cn(
				"grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0 md:grid-cols-[minmax(180px,1.5fr)_minmax(160px,1fr)_minmax(120px,0.75fr)_90px_110px_40px] md:items-center md:gap-3",
				onView && "cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className
			)}
		>
			<div className="min-w-0">
				<div className="truncate font-medium leading-5">{client.name}</div>
				<div className="truncate text-xs text-muted-foreground">{client.email}</div>
			</div>

			<div className="min-w-0">
				<div className="truncate leading-5">{fallback(client.company)}</div>
				<div className="truncate text-xs text-muted-foreground">{fallback(client.position)}</div>
			</div>

			<div className="flex min-w-0 items-center gap-2">
				<ClientStatusBadge
					status={client.status}
					size="sm"
					className="shrink-0"
				/>
				<span className="truncate text-xs text-muted-foreground md:hidden">{fallback(client.phone)}</span>
			</div>

			<div className="hidden md:block">
				<Badge
					variant="outline"
					className="font-mono text-xs"
				>
					{projectCount}
				</Badge>
			</div>

			<div className="hidden text-xs tabular-nums text-muted-foreground md:block">{formatCurrency(totalRevenue)}</div>

			<div className="flex justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={`Open actions for ${client.name}`}
							onClick={(event) => event.stopPropagation()}
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						onClick={(event) => event.stopPropagation()}
					>
						{onView && <DropdownMenuItem onClick={() => onView(client)}>View</DropdownMenuItem>}
						{onEdit && <DropdownMenuItem onClick={() => onEdit(client)}>Edit</DropdownMenuItem>}
						{onDelete && (
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => onDelete(client)}
							>
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</article>
	);
}
