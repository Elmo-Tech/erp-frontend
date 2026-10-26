import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Ensure environment variables are available
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
	async headers() {
		return [{ source: "/push-sw.js", headers: [
			{ key: "Content-Type", value: "application/javascript; charset=utf-8" },
			{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
			{ key: "Service-Worker-Allowed", value: "/" },
			{ key: "X-Content-Type-Options", value: "nosniff" },
		] }];
	},
	// Handle API rewrites for production if needed
	async rewrites() {
		return [];
	},
};

export default nextConfig;
