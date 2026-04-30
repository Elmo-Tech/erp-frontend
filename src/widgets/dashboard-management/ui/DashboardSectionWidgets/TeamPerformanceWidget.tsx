import { CheckCircle2, GitPullRequest, Timer, Users, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

export interface TeamMemberPerformance {
	id?: number | string;
	name: string;
	role?: string | null;
	avatar_url?: string | null;
	avatar?: string | null;
	points?: number;
	gamification_points?: number;
	current_points?: number;
}

export interface TeamPerformanceSnapshot {
	members?: number | TeamMemberPerformance[];
	active_members?: number;
	hours_this_month?: number;
	total_hours?: number;
	velocity?: number;
	open_prs?: number;
	team_members?: TeamMemberPerformance[];
	items?: TeamMemberPerformance[];
	tasks?: {
		total?: number;
		todo?: number;
		in_progress?: number;
		review?: number;
		testing?: number;
		completed?: number;
	};
}

interface TeamPerformanceWidgetProps {
	team?: TeamPerformanceSnapshot;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 0,
});

export function TeamPerformanceWidget({ team }: TeamPerformanceWidgetProps) {
	const members = getTeamMembers(team);
	const taskStats = team?.tasks;
	const openWork = team?.open_prs ?? (taskStats?.todo ?? 0) + (taskStats?.in_progress ?? 0) + (taskStats?.review ?? 0) + (taskStats?.testing ?? 0);
	const activeMembers = team?.active_members ?? (typeof team?.members === "number" ? team.members : members.length);
	const totalHours = team?.total_hours ?? team?.hours_this_month ?? 0;
	const velocity = team?.velocity ?? taskStats?.completed ?? 0;

	const stats = [
		{ label: "Team Velocity", value: velocity, icon: CheckCircle2 },
		{ label: "Open PRs / Tasks", value: openWork, icon: GitPullRequest },
		{ label: "Active Members", value: activeMembers, icon: Users },
		{ label: "Hours This Month", value: totalHours, icon: Timer },
	] as const;

	return (
		<section className="overflow-hidden rounded-md border border-border bg-card">
			<div className="border-b border-border px-4 py-3">
				<h2 className="text-sm font-medium text-foreground">Team performance</h2>
				<p className="mt-0.5 text-xs text-muted-foreground">{taskStats?.total ?? openWork} tracked work items</p>
			</div>

			<div className="grid gap-px bg-border md:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;

					return (
						<div
							key={stat.label}
							className="flex items-center justify-between gap-3 bg-card px-4 py-3"
						>
							<div className="min-w-0">
								<p className="truncate text-xs text-muted-foreground">{stat.label}</p>
								<p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{numberFormatter.format(stat.value)}</p>
							</div>
							<Icon className="size-4 shrink-0 text-muted-foreground" />
						</div>
					);
				})}
			</div>

			<div className="px-2 py-2">
				{members.length ? (
					<div className="grid gap-1 md:grid-cols-2 xl:grid-cols-3">
						{members.map((member) => (
							<MemberRow
								key={member.id ?? member.name}
								member={member}
							/>
						))}
					</div>
				) : (
					<div className="flex min-h-24 items-center justify-center px-4 text-center text-sm text-muted-foreground">Team member scores are not available yet.</div>
				)}
			</div>
		</section>
	);
}

function MemberRow({ member }: { member: TeamMemberPerformance }) {
	const points = member.gamification_points ?? member.current_points ?? member.points ?? 0;
	const avatarSrc = member.avatar_url ?? member.avatar ?? undefined;

	return (
		<div className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/35">
			<div className="flex min-w-0 items-center gap-3">
				<Avatar className="size-8 border border-border">
					<AvatarImage
						src={avatarSrc}
						alt={member.name}
					/>
					<AvatarFallback className="text-[11px] font-medium text-muted-foreground">{getInitials(member.name)}</AvatarFallback>
				</Avatar>

				<div className="min-w-0">
					<p className="truncate text-sm font-medium leading-5 text-foreground">{member.name}</p>
					<p className="truncate text-xs text-muted-foreground">{member.role || "Team member"}</p>
				</div>
			</div>

			<div className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium tabular-nums text-muted-foreground">
				<Zap className="size-3 text-primary" />
				<span>{numberFormatter.format(points)} pts</span>
			</div>
		</div>
	);
}

function getTeamMembers(team?: TeamPerformanceSnapshot) {
	if (Array.isArray(team?.members)) {
		return team.members;
	}

	return team?.team_members ?? team?.items ?? [];
}

function getInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();
}
