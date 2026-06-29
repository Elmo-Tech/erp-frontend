import { LoginWidget } from "@/widgets/auth/ui/LoginWidget";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-[linear-gradient(135deg,var(--discord-canvas)_0%,#1e2353_55%,#5865f2_100%)] p-4">
			<LoginWidget />
		</div>
	);
}
