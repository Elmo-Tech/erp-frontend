"use client";

import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import type { SavedAccount } from "@/entities/user/model/auth.store";

interface SavedAccountsListProps {
	accounts: SavedAccount[];
	onSelectAccount: (email: string) => void;
	onRemoveAccount: (email: string) => void;
}

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "U";
	return parts
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export function SavedAccountsList({ accounts, onSelectAccount, onRemoveAccount }: SavedAccountsListProps) {
	return (
		<div className="w-full space-y-1">
			{accounts.map((account) => (
				<button
					key={account.email}
					type="button"
					onClick={() => onSelectAccount(account.email)}
					className="group relative flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
				>
					<Avatar className="size-9 shrink-0">
						<AvatarImage src={account.avatar || undefined} alt={account.name} />
						<AvatarFallback className="font-mono text-xs font-medium">
							{getInitials(account.name)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium">{account.name}</p>
						<p className="truncate text-xs text-muted-foreground">{account.email}</p>
					</div>
					<span
						role="button"
						tabIndex={0}
						onClick={(e) => {
							e.stopPropagation();
							onRemoveAccount(account.email);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.stopPropagation();
								onRemoveAccount(account.email);
							}
						}}
						className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
					>
						<X className="size-3.5" />
					</span>
				</button>
			))}
		</div>
	);
}
