import { Sparkles } from "lucide-react";

interface DashboardWelcomeProps {
	name?: string;
	role?: string;
}

const roleDescriptions: Record<string, string> = {
	admin: "A clear view of your projects, people, and progress.",
	manager: "Keep the team moving and see what needs your attention.",
	developer: "Your work, deadlines, and progress in one place.",
};

export function DashboardWelcome({ name, role }: DashboardWelcomeProps) {
	return (
		<section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
			<div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full border-[32px] border-primary/5" />
			<div className="relative max-w-2xl space-y-3">
				<div className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
					<Sparkles className="h-3.5 w-3.5" /> Your workspace
				</div>
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {name || "User"} 👋</h1>
				<p className="text-sm text-muted-foreground sm:text-base">{(role && roleDescriptions[role]) || "Everything you need to get started, in one place."}</p>
			</div>
		</section>
	);
}
