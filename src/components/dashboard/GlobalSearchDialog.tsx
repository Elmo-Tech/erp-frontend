"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useGlobalSearch } from "@/features/sales/hooks/useGlobalSearch";
import type { SearchResult, SearchResults } from "@/features/sales/types/search";

const resultGroups: Array<{ key: keyof SearchResults; label: string }> = [
	{ key: "clients", label: "Clients" },
	{ key: "projects", label: "Projects" },
	{ key: "leads", label: "Leads" },
	{ key: "quotations", label: "Quotations" },
	{ key: "proposals", label: "Proposals" },
];

export function GlobalSearchDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const { query, setQuery, data, isLoading } = useGlobalSearch();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setOpen((current) => !current);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	const groupedResults = useMemo(() => data?.data.results ?? {}, [data]);

	const openResult = (result: SearchResult) => {
		setOpen(false);
		setQuery("");
		router.push(result.url);
	};

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				className="hidden min-w-56 justify-between gap-3 text-muted-foreground md:flex"
			>
				<span className="flex items-center gap-2">
					<Search className="h-4 w-4" />
					Search
				</span>
				<kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => setOpen(true)}
				className="h-9 w-9 md:hidden"
				aria-label="Search"
			>
				<Search className="h-4 w-4" />
			</Button>

			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				title="Global search"
				description="Search clients, projects, leads, quotations, and proposals"
			>
				<CommandInput
					value={query}
					onValueChange={setQuery}
					placeholder="Search clients, projects, leads..."
				/>
				<CommandList>
					<CommandEmpty>{query.length < 2 ? "Type at least 2 characters" : isLoading ? "Searching..." : "No results found"}</CommandEmpty>
					{resultGroups.map(({ key, label }) => {
						const results = groupedResults[key] ?? [];
						if (results.length === 0) return null;

						return (
							<CommandGroup
								key={key}
								heading={label}
							>
								{results.map((result) => (
									<CommandItem
										key={`${result.type}-${result.id}`}
										value={`${result.type}-${result.id}-${result.title}`}
										onSelect={() => openResult(result)}
									>
										<div className="min-w-0">
											<p className="truncate font-medium">{result.title}</p>
											{result.subtitle && <p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>}
										</div>
										<span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{result.type}</span>
									</CommandItem>
								))}
							</CommandGroup>
						);
					})}
				</CommandList>
			</CommandDialog>
		</>
	);
}
