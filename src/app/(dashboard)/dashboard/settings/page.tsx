"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground">System and account settings</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Account Settings</CardTitle>
					<CardDescription>Manage your account preferences</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Account settings will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
