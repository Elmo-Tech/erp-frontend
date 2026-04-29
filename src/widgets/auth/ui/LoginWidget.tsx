"use client";

import { useState } from "react";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { LoginForm } from "@/features/auth/ui/LoginForm";
import { SavedAccountsList } from "@/features/auth/ui/SavedAccountsList";
import { useAuthStore } from "@/entities/user/model/auth.store";

export function LoginWidget() {
	const savedAccounts = useAuthStore((s) => s.savedAccounts);
	const removeSavedAccount = useAuthStore((s) => s.removeSavedAccount);
	const [selectedEmail, setSelectedEmail] = useState<string | undefined>(undefined);
	const [showForm, setShowForm] = useState(savedAccounts.length === 0);

	const handleSelectAccount = (email: string) => {
		setSelectedEmail(email);
		setShowForm(true);
	};

	const handleUseAnotherAccount = () => {
		setSelectedEmail(undefined);
		setShowForm(true);
	};

	return (
		<div className="w-full max-w-md">
			<div className="mb-8 flex flex-col items-center text-center">
				<Image
					src="/logo.webp"
					alt="Elmo ERP"
					width={80}
					height={80}
					className="mb-4 rounded-xl"
					priority
				/>
				<h1 className="text-3xl font-bold text-primary">Elmo ERP</h1>
				<p className="mt-2 text-muted-foreground">Enterprise Resource Planning System</p>
			</div>

			{!showForm && savedAccounts.length > 0 ? (
				<Card className="w-full shadow-lg">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
						<CardDescription>Choose an account to continue</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<SavedAccountsList
							accounts={savedAccounts}
							onSelectAccount={handleSelectAccount}
							onRemoveAccount={removeSavedAccount}
						/>
						<Button
							variant="ghost"
							className="w-full text-muted-foreground"
							onClick={handleUseAnotherAccount}
						>
							<UserPlus className="mr-2 size-4" />
							Use another account
						</Button>
					</CardContent>
				</Card>
			) : (
				<LoginForm initialEmail={selectedEmail} />
			)}
		</div>
	);
}