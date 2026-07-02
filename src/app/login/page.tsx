import { LoginWidget } from "@/widgets/auth/ui/LoginWidget";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_15%_0%,var(--stripe-mesh-cream)_0%,transparent_34%),radial-gradient(circle_at_55%_0%,var(--stripe-mesh-lavender)_0%,transparent_32%),radial-gradient(circle_at_85%_8%,var(--stripe-mesh-ruby)_0%,transparent_28%),linear-gradient(180deg,#ffffff_0%,var(--stripe-canvas-soft)_58%,#ffffff_100%)] p-4 [--accent-foreground:#0d253d] [--accent:#f6f9fc] [--border:#e3e8ee] [--card-foreground:#0d253d] [--card:#ffffff] [--foreground:#0d253d] [--input:#a8c3de] [--muted-foreground:#64748d]">
			<LoginWidget />
		</div>
	);
}
