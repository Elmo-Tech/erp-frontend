import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Ensure environment variables are available
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
	// Handle API rewrites for production if needed
	async rewrites() {
		return [];
	},
};

export default nextConfig;
