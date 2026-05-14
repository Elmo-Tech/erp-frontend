import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function broadcastingAuthEndpoint() {
	return new URL("/api/broadcasting/auth", new URL(API_BASE_URL).origin).toString();
}

function authHeaders(): Record<string, string> {
	const token = Cookies.get("auth_token");
	if (!token) {
		return {};
	}

	return { Authorization: `Bearer ${token}` };
}

if (typeof window !== "undefined") {
	(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> | null {
	if (typeof window === "undefined") {
		return null;
	}

	if (echoInstance) {
		return echoInstance;
	}

	echoInstance = new Echo({
		broadcaster: "reverb",
		key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
		wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
		wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
		wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
		forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
		enabledTransports: ["ws", "wss"],
		authEndpoint: broadcastingAuthEndpoint(),
		auth: {
			headers: authHeaders(),
		},
	});

	return echoInstance;
}

export function disconnectEcho() {
	echoInstance?.disconnect();
	echoInstance = null;
}

export function updateEchoAuth() {
	if (!echoInstance || typeof window === "undefined") {
		return;
	}

	echoInstance.connector.options.authEndpoint = broadcastingAuthEndpoint();
	echoInstance.connector.options.auth = {
		headers: authHeaders(),
	};
}
