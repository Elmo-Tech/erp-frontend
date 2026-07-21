"use client";

import Image from "next/image";
import { LoginForm } from "@/features/auth/ui/LoginForm";

export function LoginWidget() {
	return (
		<div className="w-full max-w-md">
			<div className="mb-8 flex flex-col items-center text-center">
				<div className="elmo-brand-mark mb-5 rounded-2xl p-2.5">
					<Image
						src="/logo.webp"
						alt="Elmo ERP"
						width={64}
						height={64}
						className="size-16 rounded-xl"
						priority
					/>
				</div>
				<h1 className="text-4xl font-extrabold tracking-[-0.035em] text-foreground">Elmo ERP</h1>
				<p className="mt-3 max-w-sm text-sm font-medium leading-6 text-muted-foreground">A focused command center for projects, clients, finance, and team operations.</p>
			</div>

			<LoginForm />
		</div>
	);
}
