import { LoginWidget } from "@/widgets/auth/ui/LoginWidget";
import { ThemeToggle } from "@/widgets/layout/ui/ThemeToggle";

export default function LoginPage() {
	return (
		<div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
			<div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-32 -z-10 size-96 rounded-full bg-cyan/20 blur-[110px] dark:bg-cyan/15" />
			<div aria-hidden="true" className="pointer-events-none absolute -right-32 -bottom-40 -z-10 size-[30rem] rounded-full bg-primary/20 blur-[120px] dark:bg-primary/25" />
			<ThemeToggle className="absolute top-5 right-5 border border-border bg-surface-glass-strong shadow-sm backdrop-blur-md" />
			<LoginWidget />
		</div>
	);
}
