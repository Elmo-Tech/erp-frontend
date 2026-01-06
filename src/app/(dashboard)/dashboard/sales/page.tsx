"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserPlus, FileText, LayoutGrid, List } from "lucide-react";
import { LeadKanban, LeadFormDialog, LeadsTable, ContractsTable, ContractFormDialog } from "@/features/sales/components";
import { LeadStatus } from "@/features/sales/types/lead";
import { Contract } from "@/features/sales/types/contract";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

type LeadViewMode = "kanban" | "table";

export default function SalesPage() {
	const [activeTab, setActiveTab] = useState("leads");
	const [leadViewMode, setLeadViewMode] = useState<LeadViewMode>("kanban");
	const [showLeadForm, setShowLeadForm] = useState(false);
	const [showContractForm, setShowContractForm] = useState(false);
	const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
	const [defaultLeadStatus, setDefaultLeadStatus] = useState<LeadStatus | undefined>();

	// Permission checks
	const { canCreateLeads, canViewLeads, canCreateContracts, canEditContracts, canViewContracts } = usePermissions();

	const handleCreateLead = (status?: LeadStatus) => {
		setDefaultLeadStatus(status);
		setShowLeadForm(true);
	};

	const handleLeadFormClose = () => {
		setShowLeadForm(false);
		setDefaultLeadStatus(undefined);
	};

	const handleCreateContract = () => {
		setSelectedContract(null);
		setShowContractForm(true);
	};

	const handleContractFormClose = () => {
		setShowContractForm(false);
		setSelectedContract(null);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Sales</h1>
					<p className="text-muted-foreground">Manage leads and contracts</p>
				</div>
				<div className="flex gap-2">
					{canCreateLeads && (
						<Button
							variant="outline"
							onClick={() => handleCreateLead()}
						>
							<UserPlus className="mr-2 h-4 w-4" />
							New Lead
						</Button>
					)}
					{canCreateContracts && (
						<Button onClick={handleCreateContract}>
							<FileText className="mr-2 h-4 w-4" />
							New Contract
						</Button>
					)}
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
			>
				<div className="flex items-center justify-between">
					<TabsList>
						{canViewLeads && <TabsTrigger value="leads">Leads Pipeline</TabsTrigger>}
						{canViewContracts && <TabsTrigger value="contracts">Contracts</TabsTrigger>}
					</TabsList>

					{activeTab === "leads" && canViewLeads && (
						<div className="flex gap-1 border rounded-md p-1">
							<Button
								variant={leadViewMode === "kanban" ? "secondary" : "ghost"}
								size="sm"
								onClick={() => setLeadViewMode("kanban")}
								aria-label="Kanban view"
							>
								<LayoutGrid className="h-4 w-4" />
							</Button>
							<Button
								variant={leadViewMode === "table" ? "secondary" : "ghost"}
								size="sm"
								onClick={() => setLeadViewMode("table")}
								aria-label="Table view"
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{canViewLeads && (
					<TabsContent
						value="leads"
						className="mt-6"
					>
						{leadViewMode === "kanban" ? <LeadKanban onCreateLead={canCreateLeads ? handleCreateLead : undefined} /> : <LeadsTable onAdd={() => handleCreateLead()} />}
					</TabsContent>
				)}

				{canViewContracts && (
					<TabsContent
						value="contracts"
						className="mt-6"
					>
						<ContractsTable onAdd={handleCreateContract} />
					</TabsContent>
				)}
			</Tabs>

			{/* Lead Form Dialog */}
			{canCreateLeads && (
				<LeadFormDialog
					open={showLeadForm}
					onOpenChange={handleLeadFormClose}
					defaultStatus={defaultLeadStatus}
				/>
			)}

			{/* Contract Form Dialog */}
			{(canCreateContracts || canEditContracts) && (
				<ContractFormDialog
					open={showContractForm}
					onOpenChange={handleContractFormClose}
					contract={selectedContract}
					onSuccess={() => {
						setShowContractForm(false);
						setSelectedContract(null);
					}}
				/>
			)}
		</div>
	);
}
