"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateDevice, useUpdateDevice } from "../hooks/useDevices";
import { Device, DeviceFormData } from "../types/device";

interface DeviceFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	device?: Device | null;
	onSaved?: () => void;
}

const EMPTY_FORM: DeviceFormData = {
	name: "",
	ipAddress: "",
	port: 80,
	username: "admin",
	password: "",
	model: "DS-K1T8003MF",
	location: "",
	verifyTls: false,
	isActive: true,
	autoSync: true,
	syncIntervalMinutes: 5,
};

function initialForm(device?: Device | null): DeviceFormData {
	if (!device) {
		return EMPTY_FORM;
	}

	return {
		name: device.name,
		ipAddress: device.ipAddress,
		port: device.port,
		username: device.username ?? "admin",
		password: "",
		model: device.model ?? "",
		location: device.location ?? "",
		verifyTls: device.verifyTls,
		isActive: device.isActive,
		autoSync: device.autoSync,
		syncIntervalMinutes: device.syncIntervalMinutes,
	};
}

export function DeviceFormDialog({ open, onOpenChange, device, onSaved }: DeviceFormDialogProps) {
	const [form, setForm] = useState<DeviceFormData>(() => initialForm(device));
	const [error, setError] = useState<string | null>(null);

	const createDevice = useCreateDevice();
	const updateDevice = useUpdateDevice();
	const isSaving = createDevice.isPending || updateDevice.isPending;

	const update = <K extends keyof DeviceFormData>(key: K, value: DeviceFormData[K]) => {
		setForm((previous) => ({ ...previous, [key]: value }));
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setForm(initialForm(device));
			setError(null);
		}

		onOpenChange(nextOpen);
	};

	const handleSubmit = async () => {
		setError(null);

		if (!form.name.trim()) {
			setError("Give the device a name.");
			return;
		}

		if (!form.ipAddress.trim()) {
			setError("Enter the IP address of the device.");
			return;
		}

		const payload: DeviceFormData = {
			...form,
			name: form.name.trim(),
			ipAddress: form.ipAddress.trim(),
			model: form.model?.trim() || null,
			location: form.location?.trim() || null,
		};

		// Never send an empty password on update - it would clear the stored one.
		if (device && !payload.password) {
			delete payload.password;
		}

		try {
			if (device) {
				await updateDevice.mutateAsync({ deviceId: device.deviceId, data: payload });
			} else {
				await createDevice.mutateAsync(payload);
			}

			onSaved?.();
		} catch (caught) {
			const message =
				(caught as { response?: { data?: { message?: string } } })?.response?.data?.message ??
				"The device could not be saved.";

			setError(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{device ? "Edit device" : "Register a device"}</DialogTitle>
					<DialogDescription>
						Use the credentials of the terminal web page. They are stored encrypted and are only used to
						talk to the device over ISAPI.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="device-name">Name</Label>
						<Input
							id="device-name"
							value={form.name}
							onChange={(event) => update("name", event.target.value)}
							placeholder="Main Entrance"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="device-ip">IP address</Label>
							<Input
								id="device-ip"
								value={form.ipAddress}
								onChange={(event) => update("ipAddress", event.target.value)}
								placeholder="192.168.1.64"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="device-port">Port</Label>
							<Input
								id="device-port"
								type="number"
								value={form.port ?? 80}
								onChange={(event) => update("port", Number(event.target.value) || 80)}
							/>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="device-username">Username</Label>
							<Input
								id="device-username"
								value={form.username ?? ""}
								onChange={(event) => update("username", event.target.value)}
								placeholder="admin"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="device-password">Password</Label>
							<Input
								id="device-password"
								type="password"
								value={form.password ?? ""}
								onChange={(event) => update("password", event.target.value)}
								placeholder={device ? "Leave empty to keep the current password" : "admin"}
							/>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="device-model">Model</Label>
							<Input
								id="device-model"
								value={form.model ?? ""}
								onChange={(event) => update("model", event.target.value)}
								placeholder="DS-K1T8003MF"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="device-location">Location</Label>
							<Input
								id="device-location"
								value={form.location ?? ""}
								onChange={(event) => update("location", event.target.value)}
								placeholder="HQ - Main Entrance"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="device-interval">Polling interval (minutes)</Label>
						<Input
							id="device-interval"
							type="number"
							min={1}
							max={1440}
							value={form.syncIntervalMinutes ?? 5}
							onChange={(event) => update("syncIntervalMinutes", Number(event.target.value) || 5)}
						/>
					</div>

					<div className="space-y-3 rounded-lg border p-4">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-medium">Active</p>
								<p className="text-xs text-muted-foreground">
									An inactive device is never polled and never accepts pushed events.
								</p>
							</div>
							<Switch
								checked={form.isActive ?? true}
								onCheckedChange={(checked) => update("isActive", checked)}
							/>
						</div>
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-medium">Automatic polling</p>
								<p className="text-xs text-muted-foreground">
									Read the event log of the device on a schedule.
								</p>
							</div>
							<Switch
								checked={form.autoSync ?? true}
								onCheckedChange={(checked) => update("autoSync", checked)}
							/>
						</div>
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-medium">Verify TLS certificate</p>
								<p className="text-xs text-muted-foreground">
									Turn off for terminals with a self-signed certificate.
								</p>
							</div>
							<Switch
								checked={form.verifyTls ?? false}
								onCheckedChange={(checked) => update("verifyTls", checked)}
							/>
						</div>
					</div>

					{error && (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					)}
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
						Cancel
					</Button>
					<Button type="button" onClick={handleSubmit} disabled={isSaving}>
						{isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
						{device ? "Save changes" : "Register device"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
