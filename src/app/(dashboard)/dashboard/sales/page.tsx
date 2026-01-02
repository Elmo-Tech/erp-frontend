"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LeadKanban } from "@/features/sales/components/LeadKanban";
import { QuotationBuilder } from "@/features/sales/components/QuotationBuilder";
import { Lead } from "@/features/sales/types/lead";

export default function SalesPage() {
	const [activeTab, setActiveTab] = useState("leads");
	const [showQuotationBuilder, setShowQuotationBuilder] = useState(false);
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

	const handleLeadClick = (lead: Lead) => {
		setSelectedLead(lead);
	};

	const handleCreateQuotation = () => {
		setShowQuotationBuilder(true);
	};

	const handleQuotationSuccess = () => {
		setShowQuotationBuilder(false);
		setActiveTab("quotations");
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Sales</h1>
					<p className="text-muted-foreground">Manage leads and quotations</p>
				</div>
				<Button onClick={handleCreateQuotation}>
					<Plus className="mr-2 h-4 w-4" />
					New Quotation
				</Button>
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
						onCreateLead={() => {}}
					/>
				</TabsContent>

				<TabsContent
					value="quotations"
					className="mt-6"
				>
					<QuotationBuilder
						initialData={selectedLead ? { leadId: selectedLead.leadId } : undefined}
						onSuccess={handleQuotationSuccess}
					/>
				</TabsContent>
			</Tabs>

			{/* Quotation Builder Dialog */}
			<Dialog
				open={showQuotationBuilder}
				onOpenChange={setShowQuotationBuilder}
			>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create New Quotation</DialogTitle>
					</DialogHeader>
					<QuotationBuilder
						onSuccess={handleQuotationSuccess}
						onCancel={() => setShowQuotationBuilder(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
