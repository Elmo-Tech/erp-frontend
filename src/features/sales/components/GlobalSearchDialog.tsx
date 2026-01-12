"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { StatusBadge, getStatusVariant } from "@/components/shared";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import { Users, FileText, Receipt, Building2, FolderKanban, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SearchResult, SearchEntityType } from "../types/search";

const entityIcons: Record<SearchEntityType, React.ReactNode> = {
	lead: <Users className="h-4 w-4 text-blue-500" />,
	proposal: <FileText className="h-4 w-4 text-purple-500" />,
	quotation: <Receipt className="h-4 w-4 text-green-500" />,
	client: <Building2 className="h-4 w-4 text-orange-500" />,
	project: <FolderKanban className="h-4 w-4 text-cyan-500" />,
};

const entityLabels: Record<SearchEntityType, string> = {
	lead: "Leads",
	proposal: "Proposals",
	quotation: "Quotations",
	client: "Clients",
	project: "Projects",
};

interface GlobalSearchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
	const router = useRouter();
	const { query, setQuery, data, isLoading } = useGlobalSearch();

	// Reset query when dialog closes
	useEffect(() => {
		if (!open) {
			setQuery("");
		}
	}, [open, setQuery]);

	const handleSelect = useCallback(
		(result: SearchResult) => {
			onOpenChange(false);
			router.push(result.url);
		},
		[onOpenChange, router]
	);

	const results = data?.data?.results || {};
	const hasResults = Object.values(results).some((arr) => arr && arr.length > 0);

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="p-0 max-w-2xl">
				<Command className="rounded-lg border-0">
					<div className="flex items-center border-b px-3">
						<Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
						<CommandInput
							placeholder="Search leads, proposals, quotations, clients, projects..."
							value={query}
							onValueChange={setQuery}
							className="border-0 focus:ring-0"
						/>
						{isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
					</div>
					<CommandList className="max-h-[400px]">
						{query.length < 2 ? (
							<div className="py-6 text-center text-sm text-muted-foreground">Type at least 2 characters to search...</div>
						) : !hasResults && !isLoading ? (
							<CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
						) : (
							<>
								{(Object.entries(results) as [SearchEntityType, SearchResult[]][]).map(([type, items], index) => {
									if (!items || items.length === 0) return null;

									return (
										<div key={type}>
											{index > 0 && <CommandSeparator />}
											<CommandGroup heading={entityLabels[type]}>
												{items.map((result) => (
													<CommandItem
														key={`${result.type}-${result.id}`}
														value={`${result.type}-${result.id}-${result.title}`}
														onSelect={() => handleSelect(result)}
														className="cursor-pointer"
													>
														<div className="flex items-center gap-3 w-full">
															{entityIcons[result.type]}
															<div className="flex-1 min-w-0">
																<p className="font-medium truncate">{result.title}</p>
																{result.subtitle && <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>}
															</div>
															{result.status && (
																<StatusBadge
																	label={result.status.replace(/_/g, " ")}
																	variant={getStatusVariant(result.status)}
																/>
															)}
														</div>
													</CommandItem>
												))}
											</CommandGroup>
										</div>
									);
								})}
							</>
						)}
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Hook to handle keyboard shortcut for opening search
 */
export function useGlobalSearchShortcut() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd+K or Ctrl+K
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen(true);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return { open, setOpen };
}
