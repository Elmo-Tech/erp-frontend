import { DashboardLayout } from "@/widgets/layout/ui/DashboardLayout";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
	return <DashboardLayout>{children}</DashboardLayout>;
}
