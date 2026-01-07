"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Sign Contract</DialogTitle>
					<DialogDescription>Enter the client representative name to sign</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="signedBy">Client Representative Name</Label>
						<Input
							id="signedBy"
							value={signedByClient}
							onChange={(e) => setSignedByClient(e.target.value)}
							placeholder="Enter full name"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSign}
						disabled={isLoading || !signedByClient.trim()}
					>
						{isLoading ? "Signing..." : "Sign Contract"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
