"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContract, useSignContract, useActivateContract, useMarkMilestonePaid, useUpdateContractStatus } from "../hooks/useContracts";
import { useConvertQuotationToProject } from "@/features/projects/hooks/useProjects";
import { ContractFormDialog } from "./ContractFormDialog";
import { ContractStatusBadge, MilestoneStatusBadge } from "@/components/shared/StatusBadge";
import { ContractStatus, MilestoneStatus } from "@/lib/statusHelpers";
import { Building2, User, FileText, Pencil, ArrowLeft, Calendar, DollarSign, CheckCircle, Clock, FileSignature, Play, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
	const convertToProject = useConvertQuotationToProject();
	const updateStatus = useUpdateContractStatus();

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [signDialogOpen, setSignDialogOpen] = useState(false);
	const [signedByClient, setSignedByClient] = useState("");

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

	const handleSign = async () => {
		if (!signedByClient.trim()) {
			toast.error("Please enter the client representative name");
			return;
		}
		try {
			await signContract.mutateAsync({ id: contractId, payload: { signedByClient } });
			toast.success("Contract signed successfully");
			setSignDialogOpen(false);
			setSignedByClient("");
		} catch {
			toast.error("Failed to sign contract");
		}
	};

	const handleActivate = async () => {
		try {
			await activateContract.mutateAsync(contractId);
			toast.success("Contract activated successfully");

			// Auto-convert quotation to project when contract is activated
			if (contract.quotationId && !contract.projectId) {
				try {
					const project = await convertToProject.mutateAsync({
						quotationId: contract.quotationId,
						title: contract.title,
					});
					toast.success(`Project "${project.title}" created successfully`);
					router.push(`/dashboard/projects/${project.projectId}`);
				} catch {
					toast.error("Contract activated but failed to create project. You can create it manually.");
				}
			}
		} catch {
			toast.error("Failed to activate contract");
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

	const canSign = contract.status === ContractStatus.PENDING_SIGNATURE;
	const canActivate = contract.status === ContractStatus.SIGNED;
	const canEdit = contract.status === ContractStatus.DRAFT || contract.status === ContractStatus.PENDING_SIGNATURE;

	const handleStatusChange = async (newStatus: string) => {
		try {
			await updateStatus.mutateAsync({ id: contractId, status: newStatus });
			toast.success("Contract status updated");

			// Auto-convert quotation to project when contract becomes active
			if (newStatus === ContractStatus.ACTIVE && contract.quotationId && !contract.projectId) {
				try {
					const project = await convertToProject.mutateAsync({
						quotationId: contract.quotationId,
						title: contract.title,
					});
					toast.success(`Project "${project.title}" created successfully`);
					router.push(`/dashboard/projects/${project.projectId}`);
				} catch {
					toast.error("Status updated but failed to create project. You can create it manually.");
				}
			}
		} catch {
			toast.error("Failed to update status");
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/dashboard/sales")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">{contract.contractNumber}</h1>
						<p className="text-muted-foreground">{contract.title}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Select
						value={contract.status}
						onValueChange={handleStatusChange}
						disabled={updateStatus.isPending}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CONTRACT_STATUS_OPTIONS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{canSign && (
						<Button
							variant="outline"
							onClick={() => setSignDialogOpen(true)}
						>
							<FileSignature className="h-4 w-4 mr-2" />
							Sign Contract
						</Button>
					)}
					{canActivate && (
						<Button
							variant="outline"
							onClick={handleActivate}
							disabled={activateContract.isPending}
						>
							<Play className="h-4 w-4 mr-2" />
							Activate
						</Button>
					)}
					{canEdit && (
						<Button onClick={() => setEditDialogOpen(true)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit Contract
						</Button>
					)}
				</div>
			</div>

			{/* Summary Cards */}
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
						<div className="space-y-2">
							<p className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</p>
							<Progress
								value={progressPercentage}
								className="h-2"
							/>
						</div>
					</CardContent>
				</Card>
			</div>

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

				{/* Details Tab */}
				<TabsContent
					value="details"
					className="space-y-4"
				>
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									Timeline
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Start Date</span>
									<span className="font-medium">{format(new Date(contract.startDate), "MMM d, yyyy")}</span>
								</div>
								{contract.endDate && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">End Date</span>
										<span className="font-medium">{format(new Date(contract.endDate), "MMM d, yyyy")}</span>
									</div>
								)}
								{contract.signedAt && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Signed At</span>
										<span className="font-medium">{format(new Date(contract.signedAt), "MMM d, yyyy")}</span>
									</div>
								)}
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Created</span>
									<span className="font-medium">{format(new Date(contract.createdAt), "MMM d, yyyy")}</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<FileText className="h-4 w-4" />
									Related Documents
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{contract.quotation && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Quotation</span>
										<Badge variant="outline">{contract.quotation.quotationNumber}</Badge>
									</div>
								)}
								{contract.project && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Project</span>
										<Button
											variant="link"
											className="p-0 h-auto"
											onClick={() => router.push(`/dashboard/projects/${contract.project?.projectId}`)}
										>
											{contract.project.title}
										</Button>
									</div>
								)}
								{contract.signedByClient && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Signed By</span>
										<span className="font-medium">{contract.signedByClient}</span>
									</div>
								)}
							</CardContent>
						</Card>

						{contract.paymentTerms && (
							<Card className="md:col-span-2">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<DollarSign className="h-4 w-4" />
										Payment Terms
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="whitespace-pre-wrap">{contract.paymentTerms}</p>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>

				{/* Parties Tab */}
				<TabsContent value="parties">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Building2 className="h-4 w-4" />
									Party One (Provider)
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<p className="font-medium text-lg">{contract.partyOne.company}</p>
									<p className="text-muted-foreground">{contract.partyOne.representative}</p>
									{contract.partyOne.title && <p className="text-sm text-muted-foreground">{contract.partyOne.title}</p>}
								</div>
								{contract.partyOne.address && <p className="text-sm text-muted-foreground">{contract.partyOne.address}</p>}
								{contract.partyOne.idNumber && <p className="text-sm">ID: {contract.partyOne.idNumber}</p>}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<User className="h-4 w-4" />
									Party Two (Client)
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<p className="font-medium text-lg">{contract.partyTwo.company}</p>
									<p className="text-muted-foreground">{contract.partyTwo.representative}</p>
									{contract.partyTwo.title && <p className="text-sm text-muted-foreground">{contract.partyTwo.title}</p>}
								</div>
								{contract.partyTwo.address && <p className="text-sm text-muted-foreground">{contract.partyTwo.address}</p>}
								{contract.partyTwo.idNumber && <p className="text-sm">ID: {contract.partyTwo.idNumber}</p>}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Milestones Tab */}
				<TabsContent value="milestones">
					<Card>
						<CardHeader>
							<CardTitle>Payment Milestones</CardTitle>
							<CardDescription>Track payment progress for this contract</CardDescription>
						</CardHeader>
						<CardContent>
							{milestones.length > 0 ? (
								<div className="space-y-3">
									{milestones.map((milestone) => (
										<div
											key={milestone.milestoneId}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex items-center gap-4">
												<div className={`w-10 h-10 rounded-full flex items-center justify-center ${milestone.status === MilestoneStatus.PAID ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
													{milestone.status === MilestoneStatus.PAID ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
												</div>
												<div>
													<p className="font-medium">{milestone.title}</p>
													<p className="text-sm text-muted-foreground">
														{milestone.percentage}% • {milestone.dueDate && `Due: ${format(new Date(milestone.dueDate), "MMM d, yyyy")}`}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<span className="font-medium">
													{contract.currency} {milestone.amount.toLocaleString()}
												</span>
												<MilestoneStatusBadge status={milestone.status} />
												{milestone.status !== MilestoneStatus.PAID && contract.status === ContractStatus.ACTIVE && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleMarkMilestonePaid(milestone.milestoneId)}
														disabled={markMilestonePaid.isPending}
													>
														<Receipt className="h-4 w-4 mr-1" />
														Mark Paid
													</Button>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-center py-8 text-muted-foreground">No milestones defined</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Content Tab */}
				<TabsContent value="content">
					<Card>
						<CardHeader>
							<CardTitle>Contract Content</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{contract.content}</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Edit Dialog */}
			<ContractFormDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				contract={contract}
				onSuccess={() => setEditDialogOpen(false)}
			/>

			{/* Sign Dialog */}
			<Dialog
				open={signDialogOpen}
				onOpenChange={setSignDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Sign Contract</DialogTitle>
						<DialogDescription>Enter the client representative name to sign this contract</DialogDescription>
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
							onClick={() => setSignDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSign}
							disabled={signContract.isPending}
						>
							{signContract.isPending ? "Signing..." : "Sign Contract"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
