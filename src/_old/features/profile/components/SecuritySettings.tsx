/**
 * SecuritySettings Component
 * Component for managing security settings like password change
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Shield } from "lucide-react";

export const SecuritySettings: React.FC = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="h-5 w-5" />
					Security
				</CardTitle>
				<CardDescription>Manage your password and security settings</CardDescription>
			</CardHeader>
			<CardContent>
				<Alert>
					<AlertDescription>Password change functionality coming soon. Contact your administrator if you need to reset your password.</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
};
