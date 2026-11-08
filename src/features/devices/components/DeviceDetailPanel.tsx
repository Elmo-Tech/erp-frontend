"use client";

import { useState } from "react";
import {
	Link2,
	Loader2,
	Plug,
	PlugZap,
	RefreshCw,
	Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	useDevice,
	useDeviceEvents,
	useDisableDeviceWebhook,
	useEnableDeviceWebhook,
	useLinkDeviceUser,
	useMapExistingDeviceUser,
	usePollDevice,
	usePushDeviceUsers,
	useTestDeviceConnection,
	useUnlinkDeviceUser,
} from "../hooks/useDevices";
import { formatDateTime } from "./DevicesSettings";

interface DeviceDetailPanelProps {
	deviceId: number;
	onClose: () => void;
}

export function DeviceDetailPanel({ deviceId, onClose }: DeviceDetailPanelProps) {
	const { data: device, isLoading } = useDevice(deviceId);
	const { data: eventPage, isLoading: eventsLoading } = useDeviceEvents(deviceId);

	const testConnection = useTestDeviceConnection();
	const poll = usePollDevice();
	const pushUsers = usePushDeviceUsers();
	const enableWebhook = useEnableDeviceWebhook();
	const disableWebhook = useDisableDeviceWebhook();
	const linkUser = useLinkDeviceUser();
	const mapExisting = useMapExistingDeviceUser();
	const unlinkUser = useUnlinkDeviceUser();

	const [employeeNumber, setEmployeeNumber] = useState("");
	const [existingUserId, setExistingUserId] = useState("");
	const [terminalNumber, setTerminalNumber] = useState("");
	const handleMapExisting = async () => {
		const userId = Number(existingUserId);
		if (!Number.isInteger(userId) || userId < 1 || !terminalNumber.trim()) { toast.error("Enter the ERP user ID and the existing terminal employee number"); return; }
		try { await mapExisting.mutateAsync({ deviceId, userId, deviceEmployeeNo: terminalNumber.trim() }); setExistingUserId(""); setTerminalNumber(""); toast.success("Employee linked without changing the device"); } catch { /* API error is shown by the client. */ }
	};

	const handleLink = async () => {
		const value = employeeNumber.trim();

		if (!value) {
			toast.error("Enter the employee number used on the terminal");
			return;
		}

		const userId = Number(value);

		if (!Number.isFinite(userId)) {
			toast.error("The employee number must match the ERP user id");
			return;
		}

		try {
			await linkUser.mutateAsync({ deviceId, userId });
			setEmployeeNumber("");
		} catch {
			// The interceptor already surfaced the error.
		}
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-4">
					<div>
						<CardTitle>{device?.name ?? "Device"}</CardTitle>
						<CardDescription>
							{device ? `${device.ipAddress}:${device.port} · ${device.model ?? device.vendor}` : "—"}
						</CardDescription>
					</div>
					<Button type="button" variant="outline" onClick={onClose}>
						Close
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					{isLoading ? (
						<Skeleton className="h-20 w-full" />
					) : device ? (
						<>
							<dl className="grid gap-3 text-sm sm:grid-cols-3">
								<div>
									<dt className="text-muted-foreground">Last seen</dt>
									<dd className="font-medium">
										{device.lastSeenAt ? formatDateTime(device.lastSeenAt) : "Never"}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Last event</dt>
									<dd className="font-medium">
										{device.lastEventAt ? formatDateTime(device.lastEventAt) : "None"}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Polling</dt>
									<dd className="font-medium">
										{device.autoSync ? `Every ${device.syncIntervalMinutes} min` : "Disabled"}
									</dd>
								</div>
							</dl>

							{device.lastError && (
								<p className="text-sm text-destructive" role="alert">
									{device.lastError}
								</p>
							)}

							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => testConnection.mutate(deviceId)}
									disabled={testConnection.isPending}
								>
									{testConnection.isPending ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										<Plug className="mr-2 size-4" />
									)}
									Test connection
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => poll.mutate(deviceId)}
									disabled={poll.isPending}
								>
									{ poll.isPending ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										<RefreshCw className="mr-2 size-4" />
									)}
									Read events now
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => pushUsers.mutate(deviceId)}
									disabled={pushUsers.isPending}
								>
									{pushUsers.isPending ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										<Link2 className="mr-2 size-4" />
									)}
									Send all employees
								</Button>
								{device.webhookUrl ? (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => disableWebhook.mutate(deviceId)}
										disabled={disableWebhook.isPending}
									>
										<PlugZap className="mr-2 size-4" />
										Disable push
									</Button>
								) : (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => enableWebhook.mutate(deviceId)}
										disabled={enableWebhook.isPending}
									>
										{enableWebhook.isPending ? (
											<Loader2 className="mr-2 size-4 animate-spin" />
										) : (
											<PlugZap className="mr-2 size-4" />
										)}
										Enable push
									</Button>
								)}
							</div>

							{device.webhookUrl && (
								<p className="break-all text-xs text-muted-foreground">
									Push endpoint: <span className="font-mono">{device.webhookUrl}</span>
								</p>
							)}
						</>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Employees on this device</CardTitle>
					<CardDescription>
						The employee number written on the terminal is how a punch is matched back to the ERP.
						Sending an employee writes the number, the name and the access rights to the terminal; the
						fingerprint itself is enrolled on the terminal.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2 rounded-md border p-3">
						<p className="text-sm font-medium">Link an existing terminal employee</p>
						<p className="text-xs text-muted-foreground">Only records a match in ERP; it does not change the terminal, fingerprints or access rights.</p>
						<div className="flex flex-col gap-2 sm:flex-row"><Input value={existingUserId} onChange={(event) => setExistingUserId(event.target.value)} inputMode="numeric" aria-label="Existing ERP user id" placeholder="ERP user ID" /><Input value={terminalNumber} onChange={(event) => setTerminalNumber(event.target.value)} aria-label="Existing terminal employee number" placeholder="Terminal employee number" /><Button type="button" variant="outline" onClick={() => void handleMapExisting()} disabled={mapExisting.isPending}>Link existing</Button></div>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Input
							value={employeeNumber}
							onChange={(event) => setEmployeeNumber(event.target.value)}
							placeholder="ERP user id"
							aria-label="ERP user id"
						/>
						<Button type="button" onClick={handleLink} disabled={linkUser.isPending}>
							{linkUser.isPending ? (
								<Loader2 className="mr-2 size-4 animate-spin" />
							) : (
								<Link2 className="mr-2 size-4" />
							)}
							Send to device
						</Button>
					</div>

					{device?.deviceUsers && device.deviceUsers.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employee</TableHead>
									<TableHead>Employee no.</TableHead>
									<TableHead>Fingerprint</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{device.deviceUsers.map((mapping) => (
									<TableRow key={mapping.deviceUserId}>
										<TableCell>
											<div className="font-medium">{mapping.user?.name ?? "Unknown"}</div>
											<div className="text-xs text-muted-foreground">{mapping.user?.email}</div>
										</TableCell>
										<TableCell className="font-mono text-xs">
											{mapping.deviceEmployeeNo}
										</TableCell>
										<TableCell>
											{mapping.fingerprintEnrolled ? (
												<Badge className="border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
													Enrolled
												</Badge>
											) : (
												<Badge variant="secondary">Not confirmed</Badge>
											)}
										</TableCell>
										<TableCell className="text-right">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => unlinkUser.mutate({ deviceId, deviceUserId: mapping.deviceUserId })}
												disabled={unlinkUser.isPending}
											>
												<Unlink className="mr-2 size-4" />
												Unlink
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-sm text-muted-foreground">
							No employee has been sent to this terminal yet.
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Recent events</CardTitle>
					<CardDescription>
						Every authentication attempt reported by the terminal, including rejected ones.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{eventsLoading ? (
						<Skeleton className="h-32 w-full" />
					) : !eventPage || eventPage.events.length === 0 ? (
						<p className="text-sm text-muted-foreground">No event recorded yet.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Time</TableHead>
									<TableHead>Employee</TableHead>
									<TableHead>Verification</TableHead>
									<TableHead>Result</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{eventPage.events.map((event) => (
									<TableRow key={event.eventId}>
										<TableCell className="text-xs">
											{event.occurredAt ? formatDateTime(event.occurredAt) : "—"}
										</TableCell>
										<TableCell>
											<div className="font-medium">{event.user?.name ?? "Unmapped"}</div>
											<div className="font-mono text-xs text-muted-foreground">
												{event.deviceEmployeeNo ?? "—"}
											</div>
										</TableCell>
										<TableCell className="text-xs capitalize">
											{event.verifyMode ?? "—"}
										</TableCell>
										<TableCell>
											{event.isAuthorized ? (
												<Badge className="border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
													Granted
												</Badge>
											) : (
												<Badge className="border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
													Rejected
												</Badge>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
