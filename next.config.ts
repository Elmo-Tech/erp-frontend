import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Ensure environment variables are available
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
};

export default nextConfig;
