"use client";

import { useState } from "react";
import { FormDialog } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignContractDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSign: (signedByClient: string) => Promise<void>;
	isLoading: boolean;
}

export function SignContractDialog({ open, onOpenChange, onSign, isLoading }: SignContractDialogProps) {
	const [signedByClient, setSignedByClient] = useState("");

	const handleSign = async () => {
		await onSign(signedByClient);
		setSignedByClient("");
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) setSignedByClient("");
		onOpenChange(isOpen);
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Sign Contract"
			description="Enter the client representative name to sign"
			submitLabel="Sign Contract"
			isLoading={isLoading}
			isSubmitDisabled={!signedByClient.trim()}
			onSubmit={handleSign}
		>
			<div className="space-y-2">
				<Label htmlFor="signedBy">Client Representative Name</Label>
				<Input
					id="signedBy"
					value={signedByClient}
					onChange={(e) => setSignedByClient(e.target.value)}
					placeholder="Enter full name"
				/>
			</div>
		</FormDialog>
	);
}
