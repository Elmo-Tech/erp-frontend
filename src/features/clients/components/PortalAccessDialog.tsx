"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormCheckbox } from "@/components/shared/forms/FormCheckbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Key, Copy, Check, Mail, Eye, EyeOff } from "lucide-react";
import { Client } from "../types";
import { useCreatePortalAccess, useRevokePortalAccess, useResetPortalPassword } from "../hooks/usePortalAccess";
import { notifyApiError } from "@/lib/errorHandling";

const createAccessSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
	sendWelcomeEmail: z.boolean(),
});

type CreateAccessFormData = z.infer<typeof createAccessSchema>;

interface PortalAccessDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client;
}

export function PortalAccessDialog({ open, onOpenChange, client }: PortalAccessDialogProps) {
	const createAccess = useCreatePortalAccess();
	const revokeAccess = useRevokePortalAccess();
	const resetPassword = useResetPortalPassword();

	const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
	const [copied, setCopied] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [mode] = useState<"create" | "manage">(client.hasPortalAccess ? "manage" : "create");

	const form = useForm<CreateAccessFormData>({
		resolver: zodResolver(createAccessSchema),
		defaultValues: {
			password: "",
			sendWelcomeEmail: true,
		},
	});

	const handleCreate = async (data: CreateAccessFormData) => {
		try {
			const result = await createAccess.mutateAsync({
				clientId: client.clientId,
				payload: {
					password: data.password || undefined,
					sendWelcomeEmail: data.sendWelcomeEmail,
				},
			});
			setCredentials(result.credentials);
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleRevoke = async () => {
		try {
			await revokeAccess.mutateAsync(client.clientId);
			onOpenChange(false);
		} catch (error) {
			notifyApiError(error);
		}
	};

	const handleResetPassword = async () => {
		try {
			const result = await resetPassword.mutateAsync({
				clientId: client.clientId,
				payload: { sendEmail: true },
			});
			setCredentials(result.credentials);
		} catch (error) {
			notifyApiError(error);
		}
	};

	const copyCredentials = () => {
		if (credentials) {
			navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const isLoading = createAccess.isPending || revokeAccess.isPending || resetPassword.isPending;

	const getTitle = () => {
		if (credentials) return "Portal Access Created";
		return mode === "create" ? "Create Portal Access" : "Manage Portal Access";
	};

	const getDescription = () => {
		if (credentials) return undefined;
		return mode === "create" ? `Give ${client.name} access to the client portal to view projects and invoices.` : `Manage portal access for ${client.name}.`;
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={
				<span className="flex items-center gap-2">
					<Key className="h-5 w-5" />
					{getTitle()}
				</span>
			}
			description={getDescription()}
			showFooter={false}
			size="md"
		>
			{credentials ? (
				<div className="space-y-4">
					<Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
						<Check className="h-4 w-4 text-green-600" />
						<AlertTitle className="text-green-800 dark:text-green-200">Access Created!</AlertTitle>
						<AlertDescription className="text-green-700 dark:text-green-300">
							{form.getValues("sendWelcomeEmail") ? "Credentials have been sent to the client's email." : "Share these credentials with the client securely."}
						</AlertDescription>
					</Alert>

					<div className="p-4 bg-muted rounded-lg space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Email:</span>
							<span className="font-mono text-sm">{credentials.email}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Password:</span>
							<div className="flex items-center gap-2">
								<span className="font-mono text-sm">{showPassword ? credentials.password : "••••••••"}</span>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
								</Button>
							</div>
						</div>
					</div>

					<Button
						variant="outline"
						className="w-full"
						onClick={copyCredentials}
					>
						{copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
						{copied ? "Copied!" : "Copy Credentials"}
					</Button>

					<div className="flex justify-end">
						<Button onClick={() => onOpenChange(false)}>Done</Button>
					</div>
				</div>
			) : mode === "create" ? (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleCreate)}
						className="space-y-4"
					>
						<FormInput
							control={form.control}
							name="password"
							label="Password (optional)"
							type="password"
							placeholder="Leave empty to auto-generate"
						/>
						<FormCheckbox
							control={form.control}
							name="sendWelcomeEmail"
							label="Send welcome email with credentials"
						/>

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
							>
								{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Create Access
							</Button>
						</div>
					</form>
				</Form>
			) : (
				<div className="space-y-4">
					<Alert>
						<Mail className="h-4 w-4" />
						<AlertDescription>
							This client has portal access with email: <strong>{client.email}</strong>
						</AlertDescription>
					</Alert>

					<div className="flex flex-col gap-2">
						<Button
							variant="outline"
							onClick={handleResetPassword}
							disabled={isLoading}
						>
							{resetPassword.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Reset Password
						</Button>
						<Button
							variant="destructive"
							onClick={handleRevoke}
							disabled={isLoading}
						>
							{revokeAccess.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Revoke Access
						</Button>
					</div>

					<div className="flex justify-end">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Close
						</Button>
					</div>
				</div>
			)}
		</FormDialog>
	);
}
