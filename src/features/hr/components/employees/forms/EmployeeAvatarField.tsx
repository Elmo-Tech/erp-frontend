"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const AVATAR_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface EmployeeAvatarFieldProps {
	currentAvatarUrl?: string | null;
	employeeName?: string;
	selectedFile: File | null;
	disabled?: boolean;
	onChange: (file: File | null) => void;
}

function getInitials(name?: string) {
	return name
		?.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2) || "?";
}

export function EmployeeAvatarField({ currentAvatarUrl, employeeName, selectedFile, disabled, onChange }: EmployeeAvatarFieldProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();
	const helpTextId = `${inputId}-help`;
	const errorTextId = `${inputId}-error`;
	const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl ?? null);
	const [validationError, setValidationError] = useState<string | null>(null);

	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl(currentAvatarUrl ?? null);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreviewUrl(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [currentAvatarUrl, selectedFile]);

	const selectAvatar = (file: File) => {
		if (!AVATAR_IMAGE_TYPES.has(file.type)) {
			setValidationError("Choose a JPEG, PNG, or WebP image.");
			return;
		}

		if (file.size > MAX_AVATAR_SIZE_BYTES) {
			setValidationError("Photo must be 5 MB or smaller.");
			return;
		}

		setValidationError(null);
		onChange(file);
	};

	return (
		<div className="space-y-2">
			<Label htmlFor={inputId}>Photo (optional)</Label>
			<div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center">
				<Avatar className="h-20 w-20 border bg-background">
					<AvatarImage src={previewUrl ?? undefined} alt="Employee photo preview" />
					<AvatarFallback className="bg-primary/10 text-primary text-lg">{getInitials(employeeName)}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1 space-y-2">
					<p id={helpTextId} className="text-sm text-muted-foreground">
						JPEG, PNG, or WebP. Maximum file size: 5 MB.
					</p>
					<div className="flex flex-wrap gap-2">
						<Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
							<Upload />
							{previewUrl ? "Change photo" : "Choose photo"}
						</Button>
						{selectedFile && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => {
									setValidationError(null);
									onChange(null);
								}}
								disabled={disabled}
							>
								<X />
								Remove selection
							</Button>
						)}
					</div>
				</div>
			</div>
			<input
				ref={fileInputRef}
				id={inputId}
				type="file"
				accept=".jpg,.jpeg,.png,.webp"
				className="sr-only"
				aria-describedby={validationError ? `${helpTextId} ${errorTextId}` : helpTextId}
				aria-invalid={Boolean(validationError)}
				disabled={disabled}
				onChange={(event) => {
					const file = event.target.files?.[0];
					if (file) selectAvatar(file);
					event.target.value = "";
				}}
			/>
			{validationError && (
				<p id={errorTextId} className="text-sm text-destructive" role="alert">
					{validationError}
				</p>
			)}
		</div>
	);
}
