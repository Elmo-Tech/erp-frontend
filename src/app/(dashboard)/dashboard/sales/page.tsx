"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, UserPlus } from "lucide-react";
import { LeadKanban, LeadFormDialog, QuotationBuilder, QuotationsTable } from "@/features/sales/components";
import { Lead, LeadStatus } from "@/features/sales/types/lead";
import { Quotation } from "@/features/sales/types/quotation";

export default function SalesPage() {
	const [activeTab, setActiveTab] = useState("leads");
	const [showQuotationBuilder, setShowQuotationBuilder] = useState(false);
	const [showLeadForm, setShowLeadForm] = useState(false);
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
	const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
	const [defaultLeadStatus, setDefaultLeadStatus] = useState<LeadStatus | undefined>();

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

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Sales</h1>
					<p className="text-muted-foreground">Manage leads and quotations</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => handleCreateLead()}
					>
						<UserPlus className="mr-2 h-4 w-4" />
						New Lead
					</Button>
					<Button onClick={handleCreateQuotation}>
						<Plus className="mr-2 h-4 w-4" />
						New Quotation
					</Button>
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
			>
				<TabsList>
					<TabsTrigger value="leads">Leads Pipeline</TabsTrigger>
					<TabsTrigger value="quotations">Quotations</TabsTrigger>
				</TabsList>

				<TabsContent
					value="leads"
					className="mt-6"
				>
					<LeadKanban
						onLeadClick={handleLeadClick}
						onCreateLead={handleCreateLead}
					/>
				</TabsContent>

				<TabsContent
					value="quotations"
					className="mt-6"
				>
					<QuotationsTable
						onAdd={handleCreateQuotation}
						onEdit={handleEditQuotation}
					/>
				</TabsContent>
			</Tabs>

			{/* Lead Form Dialog */}
			<LeadFormDialog
				open={showLeadForm}
				onOpenChange={handleLeadFormClose}
				lead={selectedLead}
				defaultStatus={defaultLeadStatus}
			/>

			{/* Quotation Builder Dialog */}
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
										frontendHours: selectedQuotation.estimations.frontendHours,
										backendHours: selectedQuotation.estimations.backendHours,
										uiUxHours: selectedQuotation.estimations.uiUxHours,
										testingHours: selectedQuotation.estimations.testingHours,
										pmHours: selectedQuotation.estimations.pmHours,
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
		</div>
	);
}
