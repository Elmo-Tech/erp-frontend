/**
 * Stats Card Component
 * Displays a single stat with icon and value
 */

import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

interface StatsCardProps {
	label: string;
	value: number;
	icon: React.ReactNode;
	color?: string;
}

export function StatsCard({ label, value, icon, color }: StatsCardProps) {
	return (
		<Card className="overflow-hidden">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className={cn("p-2 rounded-lg bg-muted", color)}>{icon}</div>
					<span className="text-2xl font-bold">{value}</span>
				</div>
				<p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
			</CardContent>
		</Card>
	);
}
