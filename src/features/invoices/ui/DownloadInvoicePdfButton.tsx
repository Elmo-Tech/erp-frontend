"use client";

import { useState, type ComponentProps } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { invoiceApi } from "@/entities/invoice/api/invoice.api";
import { Button } from "@/shared/ui/button";

interface DownloadInvoicePdfButtonProps extends Pick<ComponentProps<typeof Button>, "variant" | "size" | "className"> {
	invoiceId: number;
	invoiceNumber?: string;
}

export function DownloadInvoicePdfButton({ invoiceId, invoiceNumber, variant = "ghost", size = "icon-sm", className }: DownloadInvoicePdfButtonProps) {
	const [isDownloading, setIsDownloading] = useState(false);

	const handleDownload = async () => {
		if (isDownloading) {
			return;
		}

		try {
			setIsDownloading(true);
			const blob = await invoiceApi.downloadInvoicePdf(invoiceId);
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `${invoiceNumber || `invoice-${invoiceId}`}.pdf`;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			URL.revokeObjectURL(url);
		} catch {
			toast.error("Failed to download invoice");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<Button
			type="button"
			variant={variant}
			size={size}
			className={className}
			onClick={handleDownload}
			disabled={isDownloading}
			aria-label={`Download ${invoiceNumber || `invoice #${invoiceId}`}`}
		>
			<Download />
		</Button>
	);
}
