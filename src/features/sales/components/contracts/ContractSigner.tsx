"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDropzone } from "react-dropzone";
import { Download, Upload, FileText, CheckCircle, AlertCircle, Clock, User } from "lucide-react";
import { Contract } from "../../types/contract";
import { ContractStatus } from "../../types/contract";
import { useSignContract } from "../../hooks/useContracts";
import { toast } from "sonner";
import { format } from "date-fns";

interface ContractSignerProps {
	contract: Contract;
	onSigned?: (contract: Contract) => void;
	className?: string;
}

/**
 * ContractSigner component for handling contract signing workflow
 * Features:
 * - Download generated PDF
 * - Upload signed PDF (drag & drop)
 * - Mark as signed action
 * Requirements: FE-Pack 2 Step 1
 */
export const ContractSigner: React.FC<ContractSignerProps> = ({ contract, onSigned, className = "" }) => {
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [signedByClient, setSignedByClient] = useState("");
	const [showSignForm, setShowSignForm] = useState(false);

	const signContractMutation = useSignContract();

	// Handle file drop
	const onDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file) {
			// Validate file type
			if (file.type !== "application/pdf") {
				toast.error("Please upload a PDF file");
				return;
			}

			// Validate file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				toast.error("File size must be less than 10MB");
				return;
			}

			setUploadedFile(file);
			toast.success("File uploaded successfully");
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
		},
		multiple: false,
		disabled: contract.status === ContractStatus.SIGNED || contract.status === ContractStatus.ACTIVE,
	});

	// Handle download PDF
	const handleDownloadPDF = () => {
		// This would typically call an API endpoint to generate/download the PDF
		const downloadUrl = `/api/v1/contracts/${contract.contractId}/download`;
		const link = document.createElement("a");
		link.href = downloadUrl;
		link.download = `contract-${contract.contractNumber}.pdf`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success("Contract PDF downloaded");
	};

	// Handle mark as signed
	const handleMarkAsSigned = async () => {
		if (!signedByClient.trim()) {
			toast.error("Please enter the client representative name");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("signedByClient", signedByClient);

			if (uploadedFile) {
				formData.append("signedDocument", uploadedFile);
			}

			const updatedContract = await signContractMutation.mutateAsync({
				id: contract.contractId,
				payload: { signedByClient },
			});

			toast.success("Contract marked as signed successfully");
			setShowSignForm(false);
			setSignedByClient("");
			setUploadedFile(null);

			if (onSigned) {
				onSigned(updatedContract);
			}
		} catch (error) {
			toast.error("Failed to sign contract");
		}
	};

	// Remove uploaded file
	const handleRemoveFile = () => {
		setUploadedFile(null);
		toast.info("File removed");
	};

	// Get status info
	const getStatusInfo = () => {
		switch (contract.status) {
			case ContractStatus.DRAFT:
				return {
					icon: <FileText className="h-4 w-4" />,
					label: "Draft",
					color: "secondary" as const,
					description: "Contract is being prepared",
				};
			case ContractStatus.PENDING_SIGNATURE:
				return {
					icon: <Clock className="h-4 w-4" />,
					label: "Pending Signature",
					color: "secondary" as const,
					description: "Waiting for client signature",
				};
			case ContractStatus.SIGNED:
				return {
					icon: <CheckCircle className="h-4 w-4" />,
					label: "Signed",
					color: "default" as const,
					description: "Contract has been signed",
				};
			case ContractStatus.ACTIVE:
				return {
					icon: <CheckCircle className="h-4 w-4" />,
					label: "Active",
					color: "default" as const,
					description: "Contract is active and project started",
				};
			default:
				return {
					icon: <AlertCircle className="h-4 w-4" />,
					label: contract.status,
					color: "secondary" as const,
					description: "Unknown status",
				};
		}
	};

	const statusInfo = getStatusInfo();
	const canSign = contract.status === ContractStatus.PENDING_SIGNATURE;
	const isCompleted = contract.status === ContractStatus.SIGNED || contract.status === ContractStatus.ACTIVE;

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="space-y-2">
							<CardTitle className="flex items-center gap-2">
								Contract Signing
								<Badge
									variant={statusInfo.color}
									className="gap-1"
								>
									{statusInfo.icon}
									{statusInfo.label}
								</Badge>
							</CardTitle>
							<p className="text-sm text-muted-foreground">{statusInfo.description}</p>
						</div>

						{contract.signedAt && (
							<div className="text-right text-sm text-muted-foreground">
								<p>Signed on {format(new Date(contract.signedAt), "MMM d, yyyy")}</p>
								{contract.signedByClient && (
									<p className="flex items-center gap-1 mt-1">
										<User className="h-3 w-3" />
										{contract.signedByClient}
									</p>
								)}
							</div>
						)}
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Contract Details */}
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<p className="text-sm text-muted-foreground">Contract Number</p>
							<p className="font-medium">{contract.contractNumber}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total Amount</p>
							<p className="font-medium">
								{new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: contract.currency || "USD",
								}).format(contract.totalAmount)}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Start Date</p>
							<p className="font-medium">{format(new Date(contract.startDate), "MMM d, yyyy")}</p>
						</div>
						{contract.endDate && (
							<div>
								<p className="text-sm text-muted-foreground">End Date</p>
								<p className="font-medium">{format(new Date(contract.endDate), "MMM d, yyyy")}</p>
							</div>
						)}
					</div>

					<Separator />

					{/* Actions */}
					<div className="space-y-4">
						{/* Download PDF */}
						<div className="flex items-center justify-between p-4 border rounded-lg">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
									<Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<p className="font-medium">Download Contract PDF</p>
									<p className="text-sm text-muted-foreground">Get the generated contract document</p>
								</div>
							</div>
							<Button
								variant="outline"
								onClick={handleDownloadPDF}
								className="gap-2"
							>
								<Download className="h-4 w-4" />
								Download
							</Button>
						</div>

						{/* Upload Signed PDF */}
						{canSign && (
							<div className="space-y-3">
								<div
									{...getRootProps()}
									className={`
										border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
										${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
									`}
								>
									<input {...getInputProps()} />
									<div className="space-y-2">
										<div className="p-3 bg-muted rounded-lg inline-block">
											<Upload className="h-6 w-6 text-muted-foreground" />
										</div>
										<div>
											<p className="font-medium">{isDragActive ? "Drop the signed PDF here" : "Upload Signed Contract"}</p>
											<p className="text-sm text-muted-foreground">Drag & drop or click to select PDF file (max 10MB)</p>
										</div>
									</div>
								</div>

								{/* Uploaded File */}
								{uploadedFile && (
									<Alert>
										<FileText className="h-4 w-4" />
										<AlertDescription className="flex items-center justify-between">
											<span>
												<strong>{uploadedFile.name}</strong> ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
											</span>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleRemoveFile}
											>
												Remove
											</Button>
										</AlertDescription>
									</Alert>
								)}
							</div>
						)}

						{/* Sign Contract */}
						{canSign && (
							<div className="space-y-3">
								{!showSignForm ? (
									<Button
										onClick={() => setShowSignForm(true)}
										className="w-full gap-2"
										size="lg"
									>
										<CheckCircle className="h-4 w-4" />
										Mark as Signed
									</Button>
								) : (
									<Card>
										<CardContent className="pt-6 space-y-4">
											<div>
												<label className="text-sm font-medium">Client Representative Name *</label>
												<input
													type="text"
													value={signedByClient}
													onChange={(e) => setSignedByClient(e.target.value)}
													placeholder="Enter full name of person who signed"
													className="w-full mt-1 px-3 py-2 border rounded-md"
												/>
											</div>

											<div className="flex gap-2">
												<Button
													onClick={handleMarkAsSigned}
													disabled={!signedByClient.trim() || signContractMutation.isPending}
													className="flex-1 gap-2"
												>
													<CheckCircle className="h-4 w-4" />
													{signContractMutation.isPending ? "Signing..." : "Confirm Signature"}
												</Button>
												<Button
													variant="outline"
													onClick={() => setShowSignForm(false)}
													disabled={signContractMutation.isPending}
												>
													Cancel
												</Button>
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						)}

						{/* Completed State */}
						{isCompleted && (
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>
									<strong>Contract Signed!</strong> The contract has been successfully signed and
									{contract.status === "active" ? " the project is now active." : " is ready for activation."}
								</AlertDescription>
							</Alert>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
