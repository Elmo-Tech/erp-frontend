"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, UserPlus, FileText, LayoutGrid, List } from "lucide-react";
import { LeadKanban, LeadFormDialog, QuotationBuilder, QuotationsTable, LeadsTable, ContractsTable } from "@/features/sales/components";
import { Lead, LeadStatus } from "@/features/sales/types/lead";
import { Quotation } from "@/features/sales/types/quotation";
import { Contract } from "@/features/sales/types/contract";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

type LeadViewMode = "kanban" | "table";

export default function SalesPage() {
	const [activeTab, setActiveTab] = useState("leads");
	const [leadViewMode, setLeadViewMode] = useState<LeadViewMode>("kanban");
	const [showQuotationBuilder, setShowQuotationBuilder] = useState(false);
	const [showLeadForm, setShowLeadForm] = useState(false);
	const [showContractForm, setShowContractForm] = useState(false);
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
	const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
	const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
	const [defaultLeadStatus, setDefaultLeadStatus] = useState<LeadStatus | undefined>();

	// Permission checks
	const { canCreateLeads, canEditLeads, canViewLeads, canCreateQuotations, canEditQuotations, canViewQuotations, canCreateContracts, canEditContracts, canViewContracts } = usePermissions();

	const handleLeadClick = (lead: Lead) => {
		setSelectedLead(lead);
		setShowLeadForm(true);
	};

	const handleCreateLead = (status?: LeadStatus) => {
		setSelectedLead(null);
		setDefaultLeadStatus(status);
		setShowLeadForm(true);
	};

	const handleCreateQuotation = () => {
		setSelectedQuotation(null);
		setShowQuotationBuilder(true);
	};

	const handleEditQuotation = (quotation: Quotation) => {
		setSelectedQuotation(quotation);
		setShowQuotationBuilder(true);
	};

	const handleQuotationSuccess = () => {
		setShowQuotationBuilder(false);
		setSelectedQuotation(null);
	};

	const handleLeadFormClose = () => {
		setShowLeadForm(false);
		setSelectedLead(null);
		setDefaultLeadStatus(undefined);
	};

	const handleCreateContract = () => {
		setSelectedContract(null);
		setShowContractForm(true);
	};

	const handleEditContract = (contract: Contract) => {
		setSelectedContract(contract);
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
					<p className="text-muted-foreground">Manage leads, quotations, and contracts</p>
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
					{canCreateQuotations && (
						<Button
							variant="outline"
							onClick={handleCreateQuotation}
						>
							<Plus className="mr-2 h-4 w-4" />
							New Quotation
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
						{canViewQuotations && <TabsTrigger value="quotations">Quotations</TabsTrigger>}
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
						{leadViewMode === "kanban" ? (
							<LeadKanban
								onLeadClick={canEditLeads ? handleLeadClick : undefined}
								onCreateLead={canCreateLeads ? handleCreateLead : undefined}
							/>
						) : (
							<LeadsTable
								onAdd={() => handleCreateLead()}
								onEdit={handleLeadClick}
							/>
						)}
					</TabsContent>
				)}

				{canViewQuotations && (
					<TabsContent
						value="quotations"
						className="mt-6"
					>
						<QuotationsTable
							onAdd={handleCreateQuotation}
							onEdit={handleEditQuotation}
						/>
					</TabsContent>
				)}

				{canViewContracts && (
					<TabsContent
						value="contracts"
						className="mt-6"
					>
						<ContractsTable
							onAdd={handleCreateContract}
							onEdit={handleEditContract}
						/>
					</TabsContent>
				)}
			</Tabs>

			{/* Lead Form Dialog */}
			{(canCreateLeads || canEditLeads) && (
				<LeadFormDialog
					open={showLeadForm}
					onOpenChange={handleLeadFormClose}
					lead={selectedLead}
					defaultStatus={defaultLeadStatus}
				/>
			)}

			{/* Quotation Builder Dialog */}
			{(canCreateQuotations || canEditQuotations) && (
				<Dialog
					open={showQuotationBuilder}
					onOpenChange={setShowQuotationBuilder}
				>
					<DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>{selectedQuotation ? "Edit Quotation" : "Create New Quotation"}</DialogTitle>
						</DialogHeader>
						<QuotationBuilder
							initialData={
								selectedQuotation
									? {
											quotationId: selectedQuotation.quotationId,
											leadId: selectedQuotation.leadId,
											frontendHours: selectedQuotation.estimations?.frontendHours || 0,
											backendHours: selectedQuotation.estimations?.backendHours || 0,
											uiUxHours: selectedQuotation.estimations?.uiUxHours || 0,
											testingHours: selectedQuotation.estimations?.testingHours || 0,
											pmHours: selectedQuotation.estimations?.pmHours || 0,
											hourlyRate: selectedQuotation.hourlyRate,
											discountPercentage: selectedQuotation.discountPercentage,
											currency: selectedQuotation.currency,
											status: selectedQuotation.status,
									  }
									: undefined
							}
							onSuccess={handleQuotationSuccess}
							onCancel={() => setShowQuotationBuilder(false)}
						/>
					</DialogContent>
				</Dialog>
			)}

			{/* Contract Form Dialog */}
			{(canCreateContracts || canEditContracts) && (
				<Dialog
					open={showContractForm}
					onOpenChange={handleContractFormClose}
				>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>{selectedContract ? "Edit Contract" : "Create New Contract"}</DialogTitle>
						</DialogHeader>
						<div className="py-8 text-center text-muted-foreground">Contract form coming soon...</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
