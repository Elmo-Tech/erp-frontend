import { LoginWidget } from "@/widgets/auth/ui/LoginWidget";
import { ThemeToggle } from "@/widgets/layout/ui/ThemeToggle";

export default function LoginPage() {
	return (
		<div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
			<span aria-hidden="true" className="brand-arc -top-40 -right-40 -z-10 size-[34rem] text-primary/10" />
			<ThemeToggle className="absolute top-5 right-5 glass border" />
			<LoginWidget />
		</div>
	);
}
