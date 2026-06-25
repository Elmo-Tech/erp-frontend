import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { TABLES_APP_NAME } from "@/config/simplification";

const appDescription = "Operational ERP for projects, tasks, clients, attendance, and team coordination.";

export const metadata: Metadata = {
	title: {
		default: TABLES_APP_NAME,
		template: `%s | ${TABLES_APP_NAME}`,
	},
	description: appDescription,
	keywords: ["ERP", "CRM", "Project Management", "Task Management", "Time Tracking", "Business Software"],
	authors: [{ name: TABLES_APP_NAME }],
	creator: TABLES_APP_NAME,
	publisher: TABLES_APP_NAME,
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://the-tables-erp.local"),
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		siteName: TABLES_APP_NAME,
		title: `${TABLES_APP_NAME} - Enterprise Resource Planning System`,
		description: appDescription,
		images: [
			{
				url: "/the-tables-logo.png",
				width: 512,
				height: 512,
				alt: `${TABLES_APP_NAME} Logo`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: `${TABLES_APP_NAME} - Enterprise Resource Planning System`,
		description: appDescription,
		images: ["/the-tables-logo.png"],
	},
	icons: {
		icon: "/the-tables-logo.svg",
		shortcut: "/the-tables-logo.svg",
		apple: "/the-tables-logo.png",
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
