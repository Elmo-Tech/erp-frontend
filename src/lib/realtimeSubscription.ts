import { getEcho } from "@/lib/echo";

interface RealtimeSubscriptionOptions {
	channelName: string;
	event: string;
	onEvent: () => void;
	onRefresh: () => void;
	onConnectionChange?: (connected: boolean) => void;
}

/** Subscription acknowledgements, not just an open socket, determine health. */
export function subscribeWithFallback({ channelName, event, onEvent, onRefresh, onConnectionChange }: RealtimeSubscriptionOptions) {
	let disposed = false;
	let subscribed = false;
	const refreshIfVisible = () => {
		if (!disposed && document.visibilityState === "visible" && navigator.onLine) onRefresh();
	};
	const setConnected = (connected: boolean) => {
		subscribed = connected;
		onConnectionChange?.(connected);
	};
	setConnected(false);
	// This timer performs no HTTP requests while the subscription is healthy.
	const interval = window.setInterval(() => { if (!subscribed) refreshIfVisible(); }, 60_000);
	document.addEventListener("visibilitychange", refreshIfVisible);
	window.addEventListener("online", refreshIfVisible);

	const echo = getEcho();
	const connection = echo?.connector.pusher.connection;
	const channel = echo?.private(channelName);
	const handleEvent = () => { if (!disposed) onEvent(); };
	const handleSubscribed = () => {
		if (disposed) return;
		setConnected(true);
		// Recover changes missed before initial subscription or during a disconnect.
		refreshIfVisible();
	};
	const handleError = () => { if (!disposed) setConnected(false); };
	const handleStateChange = ({ current }: { current: string }) => {
		// "connected" is insufficient: wait for this private channel's auth/ack.
		if (!disposed && current !== "connected") setConnected(false);
	};
	connection?.bind("state_change", handleStateChange);
	channel?.listen(event, handleEvent).subscribed(handleSubscribed).error(handleError);
	// Another hook may already have subscribed to this shared user channel.
	if (channel?.subscription.subscribed) handleSubscribed();

	return () => {
		disposed = true;
		window.clearInterval(interval);
		document.removeEventListener("visibilitychange", refreshIfVisible);
		window.removeEventListener("online", refreshIfVisible);
		connection?.unbind("state_change", handleStateChange);
		channel?.stopListening(event, handleEvent);
		channel?.subscription.unbind("pusher:subscription_succeeded", handleSubscribed);
		channel?.subscription.unbind("pusher:subscription_error", handleError);
		echo?.leave(channelName);
		setConnected(false);
	};
}
