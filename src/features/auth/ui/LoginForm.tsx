"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { loginSchema, type LoginFormData } from "../model/auth.schema";
import { useLogin } from "../model/use-login";

interface LoginFormProps {
	initialEmail?: string;
}

export function LoginForm({ initialEmail }: LoginFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const { mutate: login, isPending, error } = useLogin();

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: initialEmail ?? "",
			password: "",
		},
	});

	useEffect(() => {
		if (initialEmail) {
			form.setFocus("password");
		}
	}, [form, initialEmail]);

	const onSubmit = (data: LoginFormData) => {
		login(data);
	};

	return (
		<Card className="w-full max-w-md border-border shadow-2xl shadow-[#003770]/10">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
				<CardDescription>Sign in to access your dashboard</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						{error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{(error as { response?: { data?: { message?: string } } })?.response?.data?.message || "An error occurred during login"}</div>}

						<FormInput
							control={form.control}
							name="email"
							label="Email"
							type="email"
							placeholder="example@company.com"
							autoComplete="email"
						/>

						<FormInput
							control={form.control}
							name="password"
							label="Password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							autoComplete="current-password"
							endAdornment={
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									onClick={() => setShowPassword((current) => !current)}
									className="text-muted-foreground hover:text-foreground"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
								</Button>
							}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={isPending}
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
