"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_COVER_SIZE_BYTES = 25 * 1024 * 1024;
const COVER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface PipelineTaskCoverFieldProps {
	currentCoverImageUrl?: string | null;
	disabled?: boolean;
	onChange: (coverImage: File | null, removeExistingCover: boolean) => void;
}

export function PipelineTaskCoverField({ currentCoverImageUrl, disabled, onChange }: PipelineTaskCoverFieldProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const objectUrlRef = useRef<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState(currentCoverImageUrl ?? null);

	useEffect(() => {
		return () => {
			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current);
			}
		};
	}, []);

	const selectCoverImage = (file: File) => {
		if (!COVER_IMAGE_TYPES.has(file.type)) {
			toast.error("Choose a JPG, PNG, or WebP image");
			return;
		}

		if (file.size > MAX_COVER_SIZE_BYTES) {
			toast.error("Cover image must be 25 MB or smaller");
			return;
		}

		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
		}

		objectUrlRef.current = URL.createObjectURL(file);
		setPreviewUrl(objectUrlRef.current);
		onChange(file, false);
	};

	const removeCoverImage = () => {
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		}

		setPreviewUrl(null);
		onChange(null, Boolean(currentCoverImageUrl));
	};

	return (
		<div className="space-y-2">
			<Label>Cover image</Label>
			<div className="overflow-hidden rounded-lg border bg-muted/30">
				{previewUrl ? (
					<div
						aria-hidden="true"
						className="aspect-[16/7] w-full bg-cover bg-center"
						style={{ backgroundImage: `url(${JSON.stringify(previewUrl)})` }}
					/>
				) : (
					<div className="flex aspect-[16/5] flex-col items-center justify-center gap-2 border-b border-dashed text-muted-foreground">
						<ImagePlus className="h-6 w-6" />
						<p className="text-xs">Add a visual cover to make this task easier to spot on the board.</p>
					</div>
				)}

				<div className="flex flex-wrap items-center justify-between gap-3 bg-background px-3 py-2.5">
					<p className="text-xs text-muted-foreground">JPG, PNG, or WebP · max 25 MB</p>
					<div className="flex items-center gap-2">
						{previewUrl && (
							<Button type="button" variant="ghost" size="sm" onClick={removeCoverImage} disabled={disabled}>
								<Trash2 className="mr-1.5 h-3.5 w-3.5" />
								Remove
							</Button>
						)}
						<Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
							<Upload className="mr-1.5 h-3.5 w-3.5" />
							{previewUrl ? "Change" : "Choose image"}
						</Button>
					</div>
				</div>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept=".jpg,.jpeg,.png,.webp"
				className="hidden"
				onChange={(event) => {
					const file = event.target.files?.[0];
					if (file) selectCoverImage(file);
					event.target.value = "";
				}}
				disabled={disabled}
			/>
		</div>
	);
}
