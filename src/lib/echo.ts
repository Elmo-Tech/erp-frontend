import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally for Laravel Echo
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

	// Polling and local timer reminders remain usable before realtime is configured.
	if (!process.env.NEXT_PUBLIC_REVERB_APP_KEY || !process.env.NEXT_PUBLIC_REVERB_HOST) {
		return null;
	}

	// Get auth token from localStorage
	const token = localStorage.getItem("auth_token");

	// Get base URL without /api/v1
	const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

	echoInstance = new Echo({
		broadcaster: "reverb",
		key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
		wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
		wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
		wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
		forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
		enabledTransports: ["ws", "wss"],
		authEndpoint: `${baseUrl}/api/broadcasting/auth`,
		auth: {
			headers: {
				Authorization: token ? `Bearer ${token}` : "",
			},
		},
	});

	return echoInstance;
}

export function disconnectEcho(): void {
	if (echoInstance) {
		echoInstance.disconnect();
		echoInstance = null;
	}
}

// Update auth token when it changes (e.g., after login)
export function updateEchoAuth(): void {
	if (echoInstance) {
		const token = localStorage.getItem("auth_token");
		echoInstance.connector.options.auth = {
			headers: {
				Authorization: token ? `Bearer ${token}` : "",
			},
		};
	}
}
