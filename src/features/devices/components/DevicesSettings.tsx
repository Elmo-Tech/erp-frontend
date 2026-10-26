"use client";

import { useState } from "react";
import {
	CircleAlert,
	Fingerprint,
	Plus,
	RefreshCw,
	ScanLine,
	Wifi,
	WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DeviceFormDialog } from "./DeviceFormDialog";
import { DeviceDetailPanel } from "./DeviceDetailPanel";
import { useDevices } from "../hooks/useDevices";
import { Device } from "../types/device";

export function DevicesSettings() {
	const { data: devices, isLoading, isFetching, refetch } = useDevices();
	const [formOpen, setFormOpen] = useState(false);
	const [editingDevice, setEditingDevice] = useState<Device | null>(null);
	const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

	const handleEdit = (device: Device) => {
		setEditingDevice(device);
		setFormOpen(true);
	};

	const handleCreate = () => {
		setEditingDevice(null);
		setFormOpen(true);
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-4">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Fingerprint className="size-5" aria-hidden="true" />
							Access Control Devices
						</CardTitle>
						<CardDescription>
							Fingerprint and card terminals that feed attendance into the ERP. Each device is polled
							over ISAPI, and its punches are matched to employees by the employee number stored on
							the terminal.
						</CardDescription>
					</div>
					<div className="flex shrink-0 gap-2">
						<Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
							<RefreshCw className={isFetching ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
							Refresh
						</Button>
						<Button type="button" onClick={handleCreate}>
							<Plus className="mr-2 size-4" />
							Add device
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3" role="status">
							<span className="sr-only">Loading access control devices</span>
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					) : !devices || devices.length === 0 ? (
						<div className="rounded-lg border border-dashed p-8 text-center">
							<Fingerprint className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" />
							<p className="font-medium">No device registered yet</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Register the terminal with its IP address and admin credentials to start collecting
								punches.
							</p>
							<Button type="button" className="mt-4" onClick={handleCreate}>
								<Plus className="mr-2 size-4" />
								Add the first device
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Device</TableHead>
									<TableHead>Address</TableHead>
									<TableHead>Employees</TableHead>
									<TableHead>Last sync</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{devices.map((device) => (
									<TableRow key={device.deviceId}>
										<TableCell>
											<div className="font-medium">{device.name}</div>
											<div className="text-xs text-muted-foreground">
												{device.model ?? device.vendor}
												{device.location ? ` · ${device.location}` : ""}
											</div>
										</TableCell>
										<TableCell className="font-mono text-xs">
											{device.ipAddress}:{device.port}
										</TableCell>
										<TableCell>{device.linkedUsersCount}</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{device.lastSyncedAt ? formatDateTime(device.lastSyncedAt) : "Never"}
										</TableCell>
										<TableCell>
											<DeviceStatusBadge device={device} />
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => setSelectedDeviceId(device.deviceId)}
												>
													<ScanLine className="mr-2 size-4" />
													Details
												</Button>
												<Button type="button" variant="ghost" size="sm" onClick={() => handleEdit(device)}>
													Edit
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{selectedDeviceId !== null && (
				<DeviceDetailPanel deviceId={selectedDeviceId} onClose={() => setSelectedDeviceId(null)} />
			)}

			<DeviceFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				device={editingDevice}
				onSaved={() => {
					setFormOpen(false);
				}}
			/>
		</div>
	);
}

function DeviceStatusBadge({ device }: { device: Device }) {
	if (!device.isActive) {
		return <Badge variant="secondary">Inactive</Badge>;
	}

	if (device.lastStatus === "error") {
		return (
			<Badge className="border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
				Error
			</Badge>
		);
	}

	if (device.isOnline) {
		return (
			<Badge className="border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
				<Wifi className="mr-1 size-3" aria-hidden="true" />
				Online
			</Badge>
		);
	}

	return (
		<Badge className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
			<WifiOff className="mr-1 size-3" aria-hidden="true" />
			Offline
		</Badge>
	);
}

export function formatDateTime(value: string): string {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function DeviceSyncHint({ device }: { device: Device }) {
	if (device.lastError) {
		return (
			<p className="flex items-start gap-2 text-sm text-destructive">
				<CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				{device.lastError}
			</p>
		);
	}

	return null;
}
