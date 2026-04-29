"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import { ArrowRight, BadgeDollarSign, BriefcaseBusiness, FolderKanban, Globe2, Handshake } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getSettingsDictionaryHref, settingsDictionaryGroups } from "@/shared/config/settings-dictionaries";

interface SettingsNavGroup {
	key: string;
	icon: ElementType;
}

const groupIcons: SettingsNavGroup[] = [
	{ key: "crm", icon: Handshake },
	{ key: "sales", icon: BriefcaseBusiness },
	{ key: "billing", icon: BadgeDollarSign },
	{ key: "projects", icon: FolderKanban },
	{ key: "general", icon: Globe2 },
];

function getGroupIcon(groupKey: string) {
	return groupIcons.find((group) => group.key === groupKey)?.icon ?? Globe2;
}

function isActivePath(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsSidebar() {
	const pathname = usePathname();

	return (
		<aside className="lg:sticky lg:top-20 lg:self-start">
			<div className="rounded-lg border bg-background/80 p-2 shadow-sm">
				<div className="border-b px-3 py-3">
					<p className="text-sm font-semibold text-foreground">Settings</p>
					<p className="mt-1 text-xs text-muted-foreground">System dictionaries and operational parameters</p>
				</div>

				<nav
					aria-label="Settings navigation"
					className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto px-2 py-4"
				>
					{settingsDictionaryGroups.map((group) => {
						const GroupIcon = getGroupIcon(group.key);

						return (
							<section
								key={group.title}
								className="space-y-1"
							>
								<div className="flex items-center gap-2 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									<GroupIcon className="size-3.5" />
									<span>{group.title}</span>
								</div>

								<div className="space-y-0.5">
									{group.items.map((item) => {
										const href = getSettingsDictionaryHref(item);
										const isActive = isActivePath(pathname, href);

										return (
											<Link
												key={href}
												href={href}
												aria-current={isActive ? "page" : undefined}
												className={cn(
													"group flex h-8 items-center justify-between rounded-md px-2.5 text-sm transition-colors",
													isActive ? "bg-muted text-primary shadow-xs" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
												)}
											>
												<span className="truncate">{item.title}</span>
												<ArrowRight className={cn("size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60", isActive && "opacity-70")} />
											</Link>
										);
									})}
								</div>
							</section>
						);
					})}
				</nav>
			</div>
		</aside>
	);
}
