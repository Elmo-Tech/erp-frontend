import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "Elmo ERP",
		template: "%s | Elmo ERP",
	},
	description: "Enterprise Resource Planning System - Manage projects, sales, tasks, and team productivity in one place.",
	keywords: ["ERP", "CRM", "Project Management", "Task Management", "Time Tracking", "Business Software"],
	authors: [{ name: "Elmo ERP Team" }],
	creator: "Elmo ERP",
	publisher: "Elmo ERP",
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://elmo-erp.elmotechsoft.online"),
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		siteName: "Elmo ERP",
		title: "Elmo ERP - Enterprise Resource Planning System",
		description: "Manage projects, sales, tasks, and team productivity in one place.",
		images: [
			{
				url: "/logo.webp",
				width: 512,
				height: 512,
				alt: "Elmo ERP Logo",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Elmo ERP - Enterprise Resource Planning System",
		description: "Manage projects, sales, tasks, and team productivity in one place.",
		images: ["/logo.webp"],
	},
	icons: {
		icon: "/logo.webp",
		shortcut: "/logo.webp",
		apple: "/logo.webp",
	},
	manifest: "/manifest.json",
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
	],
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body className="antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
