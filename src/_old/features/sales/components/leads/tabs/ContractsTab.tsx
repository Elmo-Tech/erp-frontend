"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";
import { Plus, Search, FileText, Calendar, DollarSign, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ContractStatus, ContractStatusLabels } from "@/shared/lib/statusHelpers";
import { Contract } from "../../../types";
import { format } from "date-fns";
import CreateContractDialog from "../../contracts/dialogs/CreateContractDialog";
import SignContractDialog from "../../contracts/dialogs/SignContractDialog";
import { useContracts, useSignContract } from "../../../hooks/useContracts";

interface ContractsTabProps {
	leadId: number;
	leadName?: string;
	onContractSigned?: () => void;
}

/**
 * ContractsTab Component
 *
 * Displays contracts associated with a lead and provides functionality to create new contracts.
 */
export const ContractsTab: React.FC<ContractsTabProps> = ({ leadId, leadName, onContractSigned }) => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [signDialogOpen, setSignDialogOpen] = useState(false);
	const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

	// Fetch contracts for this lead
	const { data: contractsData, isLoading } = useContracts({ leadId });

	// Filter contracts for this lead
	const contracts = useMemo(() => {
		if (!contractsData?.contracts) return [];
		return contractsData.contracts;
	}, [contractsData]);

	// Sign contract mutation
	const signContractMutation = useSignContract();

	// Filter contracts by search query
	const filteredContracts = useMemo(() => {
		if (!searchQuery) return contracts;
		return contracts.filter((contract) => contract.title.toLowerCase().includes(searchQuery.toLowerCase()) || contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()));
	}, [contracts, searchQuery]);

	// Get status badge variant
	const getStatusBadgeVariant = (status: ContractStatus) => {
		switch (status) {
			case ContractStatus.DRAFT:
				return "secondary";
			case ContractStatus.PENDING_SIGNATURE:
				return "outline";
			case ContractStatus.SIGNED:
				return "default";
			case ContractStatus.ACTIVE:
				return "default";
			case ContractStatus.COMPLETED:
				return "default";
			case ContractStatus.TERMINATED:
				return "destructive";
			default:
				return "secondary";
		}
	};

	// Check if contract can be signed
	const canSignContract = (contract: Contract) => {
		return contract.status === ContractStatus.DRAFT || contract.status === ContractStatus.PENDING_SIGNATURE;
	};

	// Handle sign contract
	const handleSignContract = async (signedByClient: string, signedPdf?: File) => {
		if (!selectedContract) return;

		try {
			await signContractMutation.mutateAsync({
				id: selectedContract.contractId,
				payload: { signedByClient, signedPdf },
			});

			// Show celebration toast
			toast.success("🎉 تم توقيع العقد وتحويل الـ Lead إلى Client بنجاح!", {
				description: `تم توقيع العقد "${selectedContract.title}" بواسطة ${signedByClient}`,
				duration: 5000,
			});

			setSignDialogOpen(false);
			setSelectedContract(null);

			// Trigger callback to refresh lead data (will show converted status)
			if (onContractSigned) {
				onContractSigned();
			}
		} catch (error) {
			console.error("Failed to sign contract:", error);
			toast.error("فشل في توقيع العقد. يرجى المحاولة مرة أخرى.");
		}
	};

	// Handle contract creation success
	const handleContractCreated = (contractId: number) => {
		router.push(`/dashboard/sales/contracts/${contractId}`);
	};

	// Open sign dialog for a contract
	const openSignDialog = (contract: Contract) => {
		setSelectedContract(contract);
		setSignDialogOpen(true);
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search contracts..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 w-64"
						/>
					</div>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Create Contract
				</Button>
			</div>

			{/* Contracts List */}
			{filteredContracts.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No contracts found</h3>
						<p className="text-muted-foreground text-center mb-4">{searchQuery ? "No contracts match your search criteria." : "Create your first contract for this lead to get started."}</p>
						<Button onClick={() => setCreateDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create Contract
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{filteredContracts.map((contract) => (
						<Card
							key={contract.contractId}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => router.push(`/dashboard/sales/contracts/${contract.contractId}`)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<CardTitle className="text-lg flex items-center gap-2">
											{contract.title}
											<Badge variant={getStatusBadgeVariant(contract.status)}>{ContractStatusLabels[contract.status]}</Badge>
										</CardTitle>
										<CardDescription className="flex items-center gap-2">
											<FileText className="h-3 w-3" />
											{contract.contractNumber}
										</CardDescription>
									</div>
									<ArrowRight className="h-5 w-5 text-muted-foreground" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-6 text-sm text-muted-foreground">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											<span>
												{format(new Date(contract.startDate), "MMM dd, yyyy")}
												{" - "}
												{contract.endDate ? format(new Date(contract.endDate), "MMM dd, yyyy") : "Ongoing"}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<DollarSign className="h-4 w-4" />
											<span>
												{contract.currency} {contract.totalAmount.toLocaleString()}
											</span>
										</div>
									</div>

									{/* Mark as Signed Button */}
									{canSignContract(contract) && (
										<Button
											variant="default"
											size="sm"
											className="bg-green-600 hover:bg-green-700"
											onClick={(e) => {
												e.stopPropagation();
												openSignDialog(contract);
											}}
										>
											<CheckCircle2 className="h-4 w-4 mr-2" />
											Mark as Signed
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Create Contract Dialog */}
			<CreateContractDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				leadId={leadId}
				leadName={leadName}
				onSuccess={handleContractCreated}
			/>

			{/* Sign Contract Dialog */}
			<SignContractDialog
				open={signDialogOpen}
				onOpenChange={setSignDialogOpen}
				onSign={handleSignContract}
				isLoading={signContractMutation.isPending}
				prefilledName={leadName || ""}
			/>
		</div>
	);
};

export default ContractsTab;
