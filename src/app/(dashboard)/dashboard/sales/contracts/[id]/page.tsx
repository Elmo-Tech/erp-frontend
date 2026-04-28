"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, DollarSign, FileSignature, Pencil } from "lucide-react";
import { toast } from "sonner";
import { contractApi } from "@/entities/contract/api/contract.api";
import { contractKeys } from "@/entities/contract/model/query-keys";
import type { Contract } from "@/entities/contract/model/types";
import { ContractStatusBadge } from "@/entities/contract/ui/ContractStatusBadge";
import { useSalesPermissions } from "@/entities/user/model/permissions";
import { useActivateContract, useSignContract } from "@/features/contracts/model/use-contract-actions";
import { SignContractDialog } from "@/features/contracts/ui/SignContractDialog";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

interface ContractDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default function ContractDetailsPage({ params }: ContractDetailsPageProps) {
	const { id } = use(params);
	const contractId = parseInt(id, 10);

	return <ContractDetailsComposite contractId={contractId} />;
}

interface ContractDetailsCompositeProps {
	contractId: number;
	className?: string;
}

function ContractDetailsComposite({ contractId, className }: ContractDetailsCompositeProps) {
	const router = useRouter();
	const [signDialogOpen, setSignDialogOpen] = useState(false);
	const { canEditContracts, canSignContracts } = useSalesPermissions();
	const activateContract = useActivateContract();

	const contractQuery = useQuery({
		queryKey: contractKeys.detail(contractId),
		queryFn: () => contractApi.getContractById(contractId),
		enabled: Number.isFinite(contractId) && contractId > 0,
		staleTime: 5 * 60 * 1000,
	});

	if (contractQuery.isLoading) {
		return <ContractDetailsSkeleton />;
	}

	if (contractQuery.error || !contractQuery.data) {
		return (
			<section className={cn("flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border px-4 text-center", className)}>
				<div className="text-sm font-medium">Contract not found</div>
				<div className="text-sm text-muted-foreground">{contractQuery.error?.message || "This contract record is unavailable."}</div>
				<Button variant="outline" size="sm" onClick={() => router.push("/dashboard/sales")}>
					<ArrowLeft data-icon="inline-start" />
					Back to pipeline
				</Button>
			</section>
		);
	}

	const contract = contractQuery.data;
	const canSign = canSignContracts && (contract.status === "draft" || contract.status === "pending_signature");
	const canActivate = canEditContracts && contract.status === "signed";

	const handleActivate = async () => {
		try {
			await activateContract.mutateAsync(contractId);
			toast.success("Contract activated");
		} catch {
			toast.error("Failed to activate contract");
		}
	};

	return (
		<section className={cn("flex flex-col gap-6", className)}>
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<Button type="button" variant="ghost" size="icon-sm" onClick={() => router.push("/dashboard/sales")} aria-label="Back to pipeline">
						<ArrowLeft />
					</Button>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="truncate text-2xl font-semibold tracking-tight">{contract.title}</h1>
							<ContractStatusBadge status={contract.status} />
						</div>
						<p className="truncate text-sm text-muted-foreground">{contract.contractNumber} / {contract.partyOne.company}</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{canSign && (
						<Button size="sm" onClick={() => setSignDialogOpen(true)}>
							<FileSignature data-icon="inline-start" />
							Sign contract
						</Button>
					)}
					{canActivate && (
						<Button size="sm" variant="outline" onClick={handleActivate} disabled={activateContract.isPending}>
							Activate
						</Button>
					)}
				</div>
			</div>

			<ContractStats contract={contract} />

			<Tabs defaultValue="details" className="flex flex-col gap-4">
				<TabsList className="w-fit">
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="parties">Parties</TabsTrigger>
					{(contract.milestones?.length ?? 0) > 0 && (
						<TabsTrigger value="milestones">Milestones ({contract.milestones!.length})</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value="details">
					<ContractDetailsPanel contract={contract} />
				</TabsContent>

				<TabsContent value="parties">
					<ContractPartiesPanel contract={contract} />
				</TabsContent>

				{(contract.milestones?.length ?? 0) > 0 && (
					<TabsContent value="milestones">
						<ContractMilestonesPanel contract={contract} />
					</TabsContent>
				)}
			</Tabs>

			{canSign && (
				<SignContractDialog
					open={signDialogOpen}
					onOpenChange={setSignDialogOpen}
					contractId={contractId}
					contractTitle={contract.title}
				/>
			)}
		</section>
	);
}

function ContractStats({ contract }: { contract: Contract }) {
	const stats = [
		{ label: "Amount", value: formatCurrency(contract.totalAmount, contract.currency), icon: DollarSign },
		{ label: "Start date", value: formatDateDisplay(contract.startDate), icon: Calendar },
		{ label: "End date", value: formatDateDisplay(contract.endDate), icon: Calendar },
		{ label: "Signed", value: contract.signedAt ? formatDateDisplay(contract.signedAt) : "Unsigned", icon: FileSignature },
	];

	return (
		<div className="grid gap-3 border-y py-3 md:grid-cols-4">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div key={stat.label} className="min-w-0">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Icon />
							{stat.label}
						</div>
						<div className="truncate text-lg font-semibold tracking-tight tabular-nums">{stat.value}</div>
					</div>
				);
			})}
		</div>
	);
}

function ContractDetailsPanel({ contract }: { contract: Contract }) {
	const details = [
		{ label: "Contract number", value: contract.contractNumber },
		{ label: "Project", value: contract.project?.title || "No project" },
		{ label: "Currency", value: contract.currency },
		{ label: "Payment terms", value: contract.paymentTerms || "Not set" },
	];

	return (
		<div className="overflow-hidden rounded-md border bg-background">
			<div className="border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">Contract details</div>
			<div className="grid grid-cols-1 md:grid-cols-2">
				{details.map((detail) => (
					<div key={detail.label} className="min-h-14 border-b px-3 py-2.5 md:border-r md:even:border-r-0">
						<div className="text-xs text-muted-foreground">{detail.label}</div>
						<div className="text-sm font-medium">{detail.value}</div>
					</div>
				))}
				{contract.content && (
					<div className="min-h-14 border-b px-3 py-2.5 md:col-span-2">
						<div className="text-xs text-muted-foreground">Content</div>
						<div className="max-h-48 overflow-y-auto whitespace-pre-wrap text-sm font-medium">{contract.content}</div>
					</div>
				)}
			</div>
		</div>
	);
}

function ContractPartiesPanel({ contract }: { contract: Contract }) {
	const renderParty = (label: string, party: Contract["partyOne"]) => (
		<div className="overflow-hidden rounded-md border bg-background">
			<div className="border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">{label}</div>
			<div className="grid grid-cols-1 md:grid-cols-2">
				{[
					{ label: "Company", value: party.company },
					{ label: "Representative", value: party.representative },
					{ label: "Title", value: party.title || "Not set" },
					{ label: "Email", value: party.email || "Not set" },
				].map((detail) => (
					<div key={detail.label} className="min-h-14 border-b px-3 py-2.5 md:border-r md:even:border-r-0">
						<div className="text-xs text-muted-foreground">{detail.label}</div>
						<div className="text-sm font-medium">{detail.value}</div>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{renderParty("Party One", contract.partyOne)}
			{renderParty("Party Two", contract.partyTwo)}
		</div>
	);
}

function ContractMilestonesPanel({ contract }: { contract: Contract }) {
	const milestones = contract.milestones ?? [];

	return (
		<div className="overflow-hidden rounded-md border bg-background">
			<div className="hidden border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[1fr_80px_80px_100px_90px] md:items-center md:gap-3">
				<span>Title</span>
				<span>Percentage</span>
				<span>Amount</span>
				<span>Due date</span>
				<span>Status</span>
			</div>
			{milestones.map((milestone) => (
				<div key={milestone.milestoneId} className="grid min-h-12 grid-cols-1 gap-1 border-b px-3 py-2.5 text-sm last:border-b-0 md:grid-cols-[1fr_80px_80px_100px_90px] md:items-center md:gap-3">
					<div className="truncate font-medium">{milestone.title}</div>
					<div className="tabular-nums text-muted-foreground">{milestone.percentage}%</div>
					<div className="tabular-nums text-muted-foreground">{formatCurrency(milestone.amount, contract.currency)}</div>
					<div className="text-muted-foreground">{milestone.dueDate ? formatDateDisplay(milestone.dueDate) : "—"}</div>
					<div><ContractStatusBadge status={milestone.status} /></div>
				</div>
			))}
		</div>
	);
}

function ContractDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<Skeleton className="size-8" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-7 w-64" />
					<Skeleton className="h-4 w-48" />
				</div>
			</div>
			<div className="grid gap-3 md:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-20" />
				))}
			</div>
			<Skeleton className="h-10 w-80" />
			<Skeleton className="h-72 w-full" />
		</div>
	);
}
