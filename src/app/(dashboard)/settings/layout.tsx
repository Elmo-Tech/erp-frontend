import type { ReactNode } from "react";
import { SettingsSidebar } from "@/widgets/layout/ui/SettingsSidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
			<SettingsSidebar />
			<section className="min-w-0">{children}</section>
		</div>
	);
}
