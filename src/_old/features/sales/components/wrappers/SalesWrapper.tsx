"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { UserPlus, FileText, LayoutGrid, List, Download } from "lucide-react";
import { LeadKanban } from "../LeadKanban";
import { LeadsTable, CreateLeadForm } from "../leads";
import { ContractsTable, CreateContractForm } from "../contracts";
import { ExportDialog } from "../ExportDialog";
import { LeadStatus } from "../../types/lead";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";

type LeadViewMode = "kanban" | "table";

export function SalesWrapper() {
	const [activeTab, setActiveTab] = useState("leads");
	const [leadViewMode, setLeadViewMode] = useState<LeadViewMode>("kanban");
	const [showLeadForm, setShowLeadForm] = useState(false);
	const [showContractForm, setShowContractForm] = useState(false);
	const [showExportDialog, setShowExportDialog] = useState(false);
	const [defaultLeadStatus, setDefaultLeadStatus] = useState<LeadStatus | undefined>();

	const { canCreateLeads, canViewLeads, canCreateContracts, canViewContracts } = usePermissions();

	const handleCreateLead = (status?: LeadStatus) => {
		setDefaultLeadStatus(status);
		setShowLeadForm(true);
	};

	const handleLeadFormClose = () => {
		setShowLeadForm(false);
		setDefaultLeadStatus(undefined);
	};

	const handleCreateContract = () => {
		setShowContractForm(true);
	};

	const handleContractFormClose = () => {
		setShowContractForm(false);
	};

	return (
		<>
			<div className="flex items-center justify-between">
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
				<Button
					variant="outline"
					onClick={() => setShowExportDialog(true)}
				>
					<Download className="mr-2 h-4 w-4" />
					Export
				</Button>
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
				<CreateLeadForm
					open={showLeadForm}
					onOpenChange={handleLeadFormClose}
					defaultStatus={defaultLeadStatus}
				/>
			)}

			{/* Contract Form Dialog */}
			{canCreateContracts && (
				<CreateContractForm
					open={showContractForm}
					onOpenChange={handleContractFormClose}
				/>
			)}

			{/* Export Dialog */}
			<ExportDialog
				open={showExportDialog}
				onOpenChange={setShowExportDialog}
				defaultType="leads"
			/>
		</>
	);
}
