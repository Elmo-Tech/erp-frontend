"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { useCanConvertLead, useConvertLead } from "../model/use-lead-actions";

interface ConvertLeadToClientButtonProps {
	leadId: number;
	leadName: string;
	onSuccess?: () => void;
	className?: string;
}

export function ConvertLeadToClientButton({ leadId, leadName, onSuccess, className }: ConvertLeadToClientButtonProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const { data: canConvertData, isLoading: checkingConversion } = useCanConvertLead(leadId);
	const convertLead = useConvertLead();

	const canConvert = canConvertData?.canConvert ?? false;
	const reason = canConvertData?.reason;

	const handleConvert = async () => {
		try {
			await convertLead.mutateAsync({ leadId });
			toast.success(`"${leadName}" converted to client`);
			setConfirmOpen(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to convert lead");
		}
	};

	if (canConvertData && !canConvert) {
		return (
			<Button variant="outline" size="sm" disabled className={className}>
				<ArrowRightLeft />
				Convert — {reason || "Not eligible"}
			</Button>
		);
	}

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setConfirmOpen(true)}
				disabled={checkingConversion}
				className={className}
			>
				<ArrowRightLeft />
				Convert to client
			</Button>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Convert lead to client"
				description={
					<span>
						Convert <span className="font-medium text-foreground">{leadName}</span> into a client? This action creates a new client record and cannot be undone.
					</span>
				}
				confirmLabel="Convert"
				onConfirm={handleConvert}
				isLoading={convertLead.isPending}
			/>
		</>
	);
}
