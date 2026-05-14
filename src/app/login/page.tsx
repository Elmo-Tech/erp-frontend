import { LoginWidget } from "@/widgets/auth/ui/LoginWidget";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center w-full bg-linear-to-br from-background to-muted p-4">
			<LoginWidget />
		</div>
	);
}
