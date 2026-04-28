"use client";

import Image from "next/image";
import { LoginForm } from "@/features/auth/ui/LoginForm";

export function LoginWidget() {
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
			<LoginForm />
		</div>
	);
}