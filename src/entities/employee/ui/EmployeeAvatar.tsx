import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/utils";

interface EmployeeAvatarProps {
	name: string;
	src?: string | null;
	className?: string;
}

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);

	if (parts.length === 0) {
		return "U";
	}

	return parts
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export function EmployeeAvatar({ name, src, className }: EmployeeAvatarProps) {
	return (
		<Avatar className={cn("size-8", className)}>
			<AvatarImage
				src={src || undefined}
				alt={name}
			/>
			<AvatarFallback className="font-mono text-[11px] font-medium">{getInitials(name)}</AvatarFallback>
		</Avatar>
	);
}
