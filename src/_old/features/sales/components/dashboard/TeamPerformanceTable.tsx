"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Progress } from "@/shared/ui/progress";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { useTeamPerformance } from "../../hooks/useSalesDashboard";
import { Users, Code, CalendarIcon, Loader2, Trophy, Target } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { SalesRepPerformance, TechLeadPerformance } from "../../types/dashboard";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function getWinRateColor(rate: number): string {
	if (rate >= 50) return "text-green-600";
	if (rate >= 30) return "text-yellow-600";
	return "text-red-600";
}

interface SalesTableProps {
	data: SalesRepPerformance[];
}

function SalesTable({ data }: SalesTableProps) {
	if (data.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
				<p>No sales data available</p>
			</div>
		);
	}

	// Sort by win rate descending
	const sorted = [...data].sort((a, b) => b.winRate - a.winRate);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Sales Rep</TableHead>
					<TableHead className="text-center">Leads Created</TableHead>
					<TableHead className="text-center">Won</TableHead>
					<TableHead className="text-center">Lost</TableHead>
					<TableHead className="text-center">Win Rate</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sorted.map((rep, index) => (
					<TableRow key={rep.userId}>
						<TableCell>
							<div className="flex items-center gap-3">
								{index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
								<Avatar className="h-8 w-8">
									<AvatarFallback className="text-xs">{getInitials(rep.name)}</AvatarFallback>
								</Avatar>
								<span className="font-medium">{rep.name}</span>
							</div>
						</TableCell>
						<TableCell className="text-center">{rep.leadsCreated}</TableCell>
						<TableCell className="text-center text-green-600 font-medium">{rep.leadsWon}</TableCell>
						<TableCell className="text-center text-red-600">{rep.leadsLost}</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								<Progress
									value={rep.winRate}
									className="h-2 flex-1"
								/>
								<span className={`text-sm font-medium ${getWinRateColor(rep.winRate)}`}>{rep.winRate}%</span>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

interface TechLeadTableProps {
	data: TechLeadPerformance[];
}

function TechLeadTable({ data }: TechLeadTableProps) {
	if (data.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
				<p>No tech lead data available</p>
			</div>
		);
	}

	const sorted = [...data].sort((a, b) => b.successRate - a.successRate);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Tech Lead</TableHead>
					<TableHead className="text-center">Leads Evaluated</TableHead>
					<TableHead className="text-center">Successful Proposals</TableHead>
					<TableHead className="text-center">Success Rate</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sorted.map((lead, index) => (
					<TableRow key={lead.userId}>
						<TableCell>
							<div className="flex items-center gap-3">
								{index === 0 && <Target className="h-4 w-4 text-blue-500" />}
								<Avatar className="h-8 w-8">
									<AvatarFallback className="text-xs">{getInitials(lead.name)}</AvatarFallback>
								</Avatar>
								<span className="font-medium">{lead.name}</span>
							</div>
						</TableCell>
						<TableCell className="text-center">{lead.leadsEvaluated}</TableCell>
						<TableCell className="text-center text-green-600 font-medium">{lead.successfulProposals}</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								<Progress
									value={lead.successRate}
									className="h-2 flex-1"
								/>
								<span className={`text-sm font-medium ${getWinRateColor(lead.successRate)}`}>{lead.successRate}%</span>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export function TeamPerformanceTable() {
	const [dateRange, setDateRange] = useState<DateRange | undefined>();

	const params = dateRange?.from && dateRange?.to ? { startDate: format(dateRange.from, "yyyy-MM-dd"), endDate: format(dateRange.to, "yyyy-MM-dd") } : undefined;

	const { data, isLoading, error } = useTeamPerformance(params);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Team Performance
				</CardTitle>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="gap-2"
						>
							<CalendarIcon className="h-4 w-4" />
							{dateRange?.from ? (
								dateRange.to ? (
									<>
										{format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
									</>
								) : (
									format(dateRange.from, "MMM d, yyyy")
								)
							) : (
								"This Month"
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto p-0"
						align="end"
					>
						<Calendar
							mode="range"
							selected={dateRange}
							onSelect={setDateRange}
							numberOfMonths={2}
						/>
					</PopoverContent>
				</Popover>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex items-center justify-center h-48">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : error || !data?.data ? (
					<div className="text-center py-8 text-muted-foreground">Failed to load team performance</div>
				) : (
					<Tabs defaultValue="sales">
						<TabsList className="mb-4">
							<TabsTrigger
								value="sales"
								className="gap-2"
							>
								<Users className="h-4 w-4" />
								Sales Reps
							</TabsTrigger>
							<TabsTrigger
								value="tech"
								className="gap-2"
							>
								<Code className="h-4 w-4" />
								Tech Leads
							</TabsTrigger>
						</TabsList>
						<TabsContent value="sales">
							<SalesTable data={data.data.salesReps} />
						</TabsContent>
						<TabsContent value="tech">
							<TechLeadTable data={data.data.techLeads} />
						</TabsContent>
					</Tabs>
				)}
			</CardContent>
		</Card>
	);
}
