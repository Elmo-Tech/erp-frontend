import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const nextConfig: NextConfig = {
	// Ensure environment variables are available
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
	// Proxy all /api/proxy/* requests to the Laravel backend
	// هذا يحل مشكلة CORS ويخفي الـ backend URL عن الـ client
	async rewrites() {
		return [
			{
				source: "/api/proxy/:path*",
				destination: `${BACKEND_URL}/:path*`,
			},
		];
	},
};

export default nextConfig;
