import { SidebarConfig } from "@/shared/config/sidebar";

export interface BreadcrumbEntry {
	label: string;
	href?: string;
}

/** Routes that exist outside the sidebar configuration. */
const EXTRA_ROUTES: Record<string, string> = {
	"/dashboard/profile": "Profile",
	"/dashboard/agent": "Agent Actions",
};

const SEGMENT_LABELS: Record<string, string> = {
	activity: "Activity",
	ledger: "Ledger",
	meetings: "Meetings",
	notes: "Notes",
	overview: "Overview",
	projects: "Projects",
	reports: "Reports",
};

function humanize(segment: string) {
	const decoded = decodeURIComponent(segment);
	if (SEGMENT_LABELS[decoded]) return SEGMENT_LABELS[decoded];
	return decoded
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

function isIdentifier(segment: string) {
	return /^\d+$/.test(segment) || /^[0-9a-f-]{16,}$/i.test(segment);
}

/**
 * Derives breadcrumbs from the current path using the sidebar's information
 * architecture: Group › Section › (Details) › Sub-page.
 */
export function getBreadcrumbs(pathname: string): BreadcrumbEntry[] {
	const path = pathname.replace(/\/+$/, "") || "/";

	if (path === "/dashboard") {
		return [{ label: "Overview" }, { label: "My Workspace" }];
	}

	let match: { group: string; title: string; href: string } | null = null;
	for (const group of SidebarConfig) {
		for (const item of group.items) {
			if ((path === item.href || path.startsWith(`${item.href}/`)) && (!match || item.href.length > match.href.length)) {
				match = { group: group.title, title: item.title, href: item.href };
			}
		}
	}

	if (!match) {
		for (const [href, title] of Object.entries(EXTRA_ROUTES)) {
			if (path === href || path.startsWith(`${href}/`)) {
				match = { group: "", title, href };
			}
		}
	}

	if (!match) {
		const segments = path.split("/").filter(Boolean).slice(1);
		return segments.length ? [{ label: humanize(segments[segments.length - 1]) }] : [{ label: "Dashboard" }];
	}

	const crumbs: BreadcrumbEntry[] = [];
	if (match.group) crumbs.push({ label: match.group });

	const rest = path.slice(match.href.length).split("/").filter(Boolean);
	crumbs.push({ label: match.title, href: rest.length ? match.href : undefined });

	let href = match.href;
	rest.forEach((segment, index) => {
		href = `${href}/${segment}`;
		const isLast = index === rest.length - 1;
		const isDetail = isIdentifier(segment);
		// Only record detail pages are linkable; intermediate path segments may not be routes.
		crumbs.push({ label: isDetail ? "Details" : humanize(segment), href: !isLast && isDetail ? href : undefined });
	});

	return crumbs;
}
