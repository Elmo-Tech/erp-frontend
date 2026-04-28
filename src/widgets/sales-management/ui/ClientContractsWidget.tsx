"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { SearchInput } from "@/shared/ui/filters/SearchInput";
import { Pagination } from "@/shared/ui/data-display/Pagination";
import { contractApi } from "@/entities/contract/api/contract.api";
import { contractKeys } from "@/entities/contract/model/query-keys";
import type { Contract, ContractFilters } from "@/entities/contract/model/types";
import { ContractCard } from "@/entities/contract/ui/ContractCard";
import { useDeleteContract } from "@/features/contracts/model/use-contract-actions";
import { CreateContractForm } from "@/features/contracts/ui/CreateContractForm";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { cn } from "@/shared/lib/utils";

const DEFAULT_PER_PAGE = 10;

interface ClientContractsWidgetProps {
	clientId: number;
	clientName?: string;
	className?: string;
}

export function ClientContractsWidget({ clientId, clientName, className }: ClientContractsWidgetProps) {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
	const deleteContract = useDeleteContract();

	const filters = useMemo<ContractFilters>(() => ({
		search: search || undefined,
		page,
		perPage: DEFAULT_PER_PAGE,
		leadId: clientId,
	}), [search, page, clientId]);

	const contractsQuery = useQuery({
		queryKey: contractKeys.list(filters),
		queryFn: () => contractApi.getContracts(filters),
		staleTime: 5 * 60 * 1000,
	});

	const contracts = contractsQuery.data?.contracts ?? [];
	const pagination = contractsQuery.data?.pagination;

	const handleView = (contract: Contract) => {
		router.push(`/dashboard/sales/contracts/${contract.contractId}`);
	};

	const handleConfirmDelete = async () => {
		if (!contractToDelete) return;
		try {
			await deleteContract.mutateAsync(contractToDelete.contractId);
			toast.success("Contract deleted");
			setContractToDelete(null);
		} catch {
			toast.error("Failed to delete contract");
		}
	};

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h2 className="text-lg font-semibold tracking-tight">Contracts</h2>
					<p className="text-sm text-muted-foreground">
						{pagination ? `${pagination.total} contracts` : "Loading contracts"}
						{clientName ? ` for ${clientName}` : ""}
					</p>
				</div>
				<Button size="sm" onClick={() => setCreateDialogOpen(true)}>
					<Plus data-icon="inline-start" />
					New contract
				</Button>
			</div>

			<div className="flex items-center gap-2 border-y py-3">
				<SearchInput
					value={search}
					onChange={setSearch}
					placeholder="Search contracts"
					className="w-full md:max-w-sm"
					autoSearch={false}
				/>
			</div>

			<div className="overflow-hidden rounded-md border bg-background">
				<div className="hidden border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_90px_100px_90px_40px] md:items-center md:gap-3">
					<span>Contract</span>
					<span>Project</span>
					<span>Status</span>
					<span>Amount</span>
					<span>Signed</span>
					<span className="sr-only">Actions</span>
				</div>

				{contractsQuery.isLoading ? (
					<ContractRowsSkeleton />
				) : contractsQuery.error ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 text-center">
						<div className="text-sm font-medium">Unable to load contracts</div>
						<div className="text-sm text-muted-foreground">{contractsQuery.error.message}</div>
					</div>
				) : contracts.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
						<FileText className="size-6 text-muted-foreground" />
						<div className="flex flex-col gap-1">
							<div className="text-sm font-medium">No contracts yet</div>
							<div className="text-sm text-muted-foreground">Create the first contract for this client.</div>
						</div>
						<Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
							<Plus data-icon="inline-start" />
							New contract
						</Button>
					</div>
				) : (
					contracts.map((contract) => (
						<ContractCard
							key={contract.contractId}
							contract={contract}
							onView={handleView}
							onDelete={() => setContractToDelete(contract)}
						/>
					))
				)}
			</div>

			{pagination && pagination.totalPages > 1 && (
				<Pagination pagination={pagination} onPageChange={setPage} />
			)}

			<CreateContractForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

			<ConfirmDialog
				open={Boolean(contractToDelete)}
				onOpenChange={(open) => { if (!open) setContractToDelete(null); }}
				title="Delete contract"
				description={
					<span>
						Delete <span className="font-medium text-foreground">{contractToDelete?.title}</span>? This action cannot be undone.
					</span>
				}
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleConfirmDelete}
				isLoading={deleteContract.isPending}
			/>
		</section>
	);
}

function ContractRowsSkeleton() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 5 }).map((_, index) => (
				<div key={index} className="grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 last:border-b-0 md:grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_90px_100px_90px_40px] md:items-center md:gap-3">
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-40" />
					</div>
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-16" />
					<Skeleton className="size-8" />
				</div>
			))}
		</div>
	);
}
