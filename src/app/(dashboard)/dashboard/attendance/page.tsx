"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AttendancePage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Attendance</h1>
				<p className="text-muted-foreground">Daily attendance records</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Attendance Log</CardTitle>
					<CardDescription>Your attendance records</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Attendance log will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
