"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContract, useSignContract, useActivateContract, useMarkMilestonePaid, useUpdateContractStatus, useCreateMilestoneInvoice } from "../hooks/useContracts";
import { useConvertQuotationToProject } from "@/features/projects/hooks/useProjects";
import { UpdateContractForm, SignContractDialog, CreateInvoiceDialog } from "./contracts";
import { ContractStatus, MilestoneStatus } from "@/lib/statusHelpers";
import { ArrowLeft, Pencil, FileSignature, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { ContractDetailsTab, ContractPartiesTab, ContractMilestonesTab, ContractContentTab } from "./contracts/tabs";

const CONTRACT_STATUS_OPTIONS = [
	{ value: ContractStatus.DRAFT, label: "Draft" },
	{ value: ContractStatus.PENDING_SIGNATURE, label: "Pending Signature" },
	{ value: ContractStatus.SIGNED, label: "Signed" },
	{ value: ContractStatus.ACTIVE, label: "Active" },
	{ value: ContractStatus.COMPLETED, label: "Completed" },
	{ value: ContractStatus.TERMINATED, label: "Terminated" },
];

interface ContractDetailsTabsProps {
	contractId: number;
}

export function ContractDetailsTabs({ contractId }: ContractDetailsTabsProps) {
	const router = useRouter();
	const { data: contract, isLoading } = useContract(contractId);
	const signContract = useSignContract();
	const activateContract = useActivateContract();
	const markMilestonePaid = useMarkMilestonePaid();
	const createMilestoneInvoice = useCreateMilestoneInvoice();
	const convertToProject = useConvertQuotationToProject();
	const updateStatus = useUpdateContractStatus();

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [signDialogOpen, setSignDialogOpen] = useState(false);
	const [createInvoiceDialogOpen, setCreateInvoiceDialogOpen] = useState(false);
	const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
	const [selectedMilestoneDueDate, setSelectedMilestoneDueDate] = useState<string | undefined>();

	const { canCreateMilestoneInvoice, canMarkMilestonePaid, canEditContracts, canSignContracts } = usePermissions();

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!contract) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Contract not found</p>
				<Button
					variant="link"
					onClick={() => router.push("/dashboard/sales")}
				>
					Back to Sales
				</Button>
			</div>
		);
	}

	const milestones = contract.milestones || [];
	const paidMilestones = milestones.filter((m) => m.status === MilestoneStatus.PAID);
	const totalPaid = paidMilestones.reduce((sum, m) => sum + m.amount, 0);
	const progressPercentage = contract.totalAmount > 0 ? (totalPaid / contract.totalAmount) * 100 : 0;

	const canSign = contract.status === ContractStatus.PENDING_SIGNATURE && canSignContracts;
	const canActivate = contract.status === ContractStatus.SIGNED;
	const canEdit = (contract.status === ContractStatus.DRAFT || contract.status === ContractStatus.PENDING_SIGNATURE) && canEditContracts;

	const handleSign = async (signedByClient: string) => {
		if (!signedByClient.trim()) {
			toast.error("Please enter the client representative name");
			return;
		}
		try {
			await signContract.mutateAsync({ id: contractId, payload: { signedByClient } });
			toast.success("Contract signed successfully");
			setSignDialogOpen(false);
		} catch {
			toast.error("Failed to sign contract");
		}
	};

	const handleActivate = async () => {
		try {
			await activateContract.mutateAsync(contractId);
			toast.success("Contract activated successfully");
			if (contract.quotationId && !contract.projectId) {
				try {
					const project = await convertToProject.mutateAsync({ quotationId: contract.quotationId, title: contract.title });
					toast.success(`Project "${project.title}" created successfully`);
					router.push(`/dashboard/projects/${project.projectId}`);
				} catch {
					toast.error("Contract activated but failed to create project.");
				}
			}
		} catch {
			toast.error("Failed to activate contract");
		}
	};

	const handleStatusChange = async (newStatus: string) => {
		try {
			await updateStatus.mutateAsync({ id: contractId, status: newStatus });
			toast.success("Contract status updated");
			if (newStatus === ContractStatus.ACTIVE && contract.quotationId && !contract.projectId) {
				try {
					const project = await convertToProject.mutateAsync({ quotationId: contract.quotationId, title: contract.title });
					toast.success(`Project "${project.title}" created successfully`);
					router.push(`/dashboard/projects/${project.projectId}`);
				} catch {
					toast.error("Status updated but failed to create project.");
				}
			}
		} catch {
			toast.error("Failed to update status");
		}
	};

	const handleOpenCreateInvoiceDialog = (milestoneId: number, dueDate?: string) => {
		setSelectedMilestoneId(milestoneId);
		setSelectedMilestoneDueDate(dueDate);
		setCreateInvoiceDialogOpen(true);
	};

	const handleCreateInvoice = async (data: { dueDate?: string; notes?: string; sendImmediately: boolean }) => {
		if (!selectedMilestoneId) return;
		try {
			await createMilestoneInvoice.mutateAsync({ milestoneId: selectedMilestoneId, payload: data });
			toast.success("Invoice created successfully");
			setCreateInvoiceDialogOpen(false);
			setSelectedMilestoneId(null);
		} catch {
			toast.error("Failed to create invoice");
		}
	};

	const handleMarkMilestonePaid = async (milestoneId: number) => {
		try {
			await markMilestonePaid.mutateAsync({ milestoneId });
			toast.success("Milestone marked as paid");
		} catch {
			toast.error("Failed to update milestone");
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<ContractHeader
				contract={contract}
				canSign={canSign}
				canActivate={canActivate}
				canEdit={canEdit}
				onBack={() => router.push("/dashboard/sales")}
				onSign={() => setSignDialogOpen(true)}
				onActivate={handleActivate}
				onEdit={() => setEditDialogOpen(true)}
				onStatusChange={handleStatusChange}
				isActivating={activateContract.isPending}
				isUpdatingStatus={updateStatus.isPending}
			/>

			{/* Summary Cards */}
			<ContractSummaryCards
				contract={contract}
				totalPaid={totalPaid}
				progressPercentage={progressPercentage}
			/>

			{/* Tabs */}
			<Tabs
				defaultValue="details"
				className="space-y-4"
			>
				<TabsList>
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="parties">Parties</TabsTrigger>
					<TabsTrigger value="milestones">Milestones ({milestones.length})</TabsTrigger>
					<TabsTrigger value="content">Contract Content</TabsTrigger>
				</TabsList>

				<TabsContent value="details">
					<ContractDetailsTab contract={contract} />
				</TabsContent>
				<TabsContent value="parties">
					<ContractPartiesTab contract={contract} />
				</TabsContent>
				<TabsContent value="milestones">
					<ContractMilestonesTab
						contract={contract}
						milestones={milestones}
						onCreateInvoice={handleOpenCreateInvoiceDialog}
						onMarkPaid={handleMarkMilestonePaid}
						canCreateInvoice={canCreateMilestoneInvoice}
						canMarkPaid={canMarkMilestonePaid}
						isCreatingInvoice={createMilestoneInvoice.isPending}
						isMarkingPaid={markMilestonePaid.isPending}
					/>
				</TabsContent>
				<TabsContent value="content">
					<ContractContentTab content={contract.content} />
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			<UpdateContractForm
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				contract={contract}
			/>
			<SignContractDialog
				open={signDialogOpen}
				onOpenChange={setSignDialogOpen}
				onSign={handleSign}
				isLoading={signContract.isPending}
			/>
			<CreateInvoiceDialog
				open={createInvoiceDialogOpen}
				onOpenChange={setCreateInvoiceDialogOpen}
				onCreateInvoice={handleCreateInvoice}
				isLoading={createMilestoneInvoice.isPending}
				defaultDueDate={selectedMilestoneDueDate}
			/>
		</div>
	);
}

// Sub-components
interface ContractHeaderProps {
	contract: { contractNumber: string; title: string; status: ContractStatus };
	canSign: boolean;
	canActivate: boolean;
	canEdit: boolean;
	onBack: () => void;
	onSign: () => void;
	onActivate: () => void;
	onEdit: () => void;
	onStatusChange: (status: string) => void;
	isActivating: boolean;
	isUpdatingStatus: boolean;
}

function ContractHeader({ contract, canSign, canActivate, canEdit, onBack, onSign, onActivate, onEdit, onStatusChange, isActivating, isUpdatingStatus }: ContractHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={onBack}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold">{contract.contractNumber}</h1>
					<p className="text-muted-foreground">{contract.title}</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<Select
					value={contract.status}
					onValueChange={onStatusChange}
					disabled={isUpdatingStatus}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{CONTRACT_STATUS_OPTIONS.map((opt) => (
							<SelectItem
								key={opt.value}
								value={opt.value}
							>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{canSign && (
					<Button
						variant="outline"
						onClick={onSign}
					>
						<FileSignature className="h-4 w-4 mr-2" />
						Sign
					</Button>
				)}
				{canActivate && (
					<Button
						variant="outline"
						onClick={onActivate}
						disabled={isActivating}
					>
						<Play className="h-4 w-4 mr-2" />
						Activate
					</Button>
				)}
				{canEdit && (
					<Button onClick={onEdit}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</Button>
				)}
			</div>
		</div>
	);
}

interface ContractSummaryCardsProps {
	contract: { currency: string; totalAmount: number };
	totalPaid: number;
	progressPercentage: number;
}

function ContractSummaryCards({ contract, totalPaid, progressPercentage }: ContractSummaryCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold">
						{contract.currency} {contract.totalAmount.toLocaleString()}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold text-green-600">
						{contract.currency} {totalPaid.toLocaleString()}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold text-orange-600">
						{contract.currency} {(contract.totalAmount - totalPaid).toLocaleString()}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</p>
					<Progress
						value={progressPercentage}
						className="mt-2 h-2"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
