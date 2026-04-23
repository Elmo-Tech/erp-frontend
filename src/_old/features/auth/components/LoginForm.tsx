"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { loginSchema, LoginFormData } from "../schemas";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const { mutate: login, isPending, error } = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: LoginFormData) => {
		login(data);
	};

	return (
		<Card className="w-full max-w-md shadow-lg">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
				<CardDescription>Sign in to access your dashboard</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4"
				>
					{error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{(error as { response?: { data?: { message?: string } } })?.response?.data?.message || "An error occurred during login"}</div>}

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="example@company.com"
							autoComplete="email"
							{...register("email")}
							className={errors.email ? "border-destructive" : ""}
						/>
						{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								autoComplete="current-password"
								{...register("password")}
								className={errors.password ? "border-destructive pr-10" : "pr-10"}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
					</div>

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
			</CardContent>
		</Card>
	);
}
