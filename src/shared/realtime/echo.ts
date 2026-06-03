import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const CSRF_COOKIE = "csrf_token";

interface BroadcastAuthorizationData {
	auth: string;
	channel_data?: string;
	shared_secret?: string;
}

function broadcastingAuthEndpoint() {
	return new URL("/api/broadcasting/auth", new URL(API_BASE_URL).origin).toString();
}

function csrfHeaders(): Record<string, string> {
	const token = Cookies.get(CSRF_COOKIE);

	return token ? { "X-CSRF-TOKEN": token } : {};
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
			headers: csrfHeaders(),
		},
		authorizer: (channel: { name: string }) => ({
			authorize: (socketId: string, callback: (error: Error | null, data: BroadcastAuthorizationData | null) => void) => {
				fetch(broadcastingAuthEndpoint(), {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						...csrfHeaders(),
					},
					body: JSON.stringify({
						socket_id: socketId,
						channel_name: channel.name,
					}),
				})
					.then(async (response) => {
						const data = (await response.json()) as BroadcastAuthorizationData;
						callback(response.ok ? null : new Error("Broadcast authentication failed"), data);
					})
					.catch((error) => callback(error instanceof Error ? error : new Error("Broadcast authentication failed"), null));
			},
		}),
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
		headers: csrfHeaders(),
	};
}
