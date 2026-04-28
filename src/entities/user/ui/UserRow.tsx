import type { User } from "../model/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { RoleBadge } from "./RoleBadge";

interface UserRowProps {
	user: User;
	className?: string;
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function UserRow({ user, className }: UserRowProps) {
	return (
		<div className={cn("flex min-w-0 items-center gap-3", className)}>
			<Avatar className="size-8">
				<AvatarImage src={user.avatar ?? undefined} alt={user.name} />
				<AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="truncate text-sm font-medium">{user.name}</span>
					<Badge
						variant={user.isActive ? "secondary" : "outline"}
						className="h-5 rounded-sm px-1.5 text-[11px]"
					>
						{user.isActive ? "Active" : "Inactive"}
					</Badge>
				</div>
				<div className="truncate text-xs text-muted-foreground">{user.email}</div>
			</div>
			<div className="hidden max-w-72 flex-wrap justify-end gap-1 md:flex">
				{user.roles.map((role) => (
					<RoleBadge key={role} role={role} />
				))}
			</div>
		</div>
	);
}
