"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Clock, Receipt, Plus, Link2 } from "lucide-react";
import { format } from "date-fns";
import { MilestoneStatusBadge } from "@/components/shared/StatusBadge";
import { ContractStatus, MilestoneStatus } from "@/lib/statusHelpers";
import { Contract, ContractMilestone } from "../../../types/contract";

interface ContractMilestonesTabProps {
	contract: Contract;
	milestones: ContractMilestone[];
	onCreateInvoice: (milestoneId: number, dueDate?: string) => void;
	onMarkPaid: (milestoneId: number) => void;
	canCreateInvoice: boolean;
	canMarkPaid: boolean;
	isCreatingInvoice: boolean;
	isMarkingPaid: boolean;
}

export function ContractMilestonesTab({ contract, milestones, onCreateInvoice, onMarkPaid, canCreateInvoice, canMarkPaid, isCreatingInvoice, isMarkingPaid }: ContractMilestonesTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Payment Milestones</CardTitle>
				<CardDescription>Track payment progress and manage invoices</CardDescription>
			</CardHeader>
			<CardContent>
				{milestones.length > 0 ? (
					<div className="space-y-3">
						{milestones.map((milestone) => (
							<div
								key={milestone.milestoneId}
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-center gap-4">
									<MilestoneIcon status={milestone.status} />
									<div>
										<p className="font-medium">{milestone.title}</p>
										<p className="text-sm text-muted-foreground">
											{milestone.percentage}% • {milestone.dueDate && `Due: ${format(new Date(milestone.dueDate), "MMM d, yyyy")}`}
										</p>
										{milestone.invoiceId && (
											<div className="flex items-center gap-2 mt-1">
												<Link2 className="h-3 w-3 text-muted-foreground" />
												<span className="text-xs text-muted-foreground">Invoice linked</span>
											</div>
										)}
									</div>
								</div>
								<div className="flex items-center gap-3">
									<span className="font-medium">
										{contract.currency} {milestone.amount.toLocaleString()}
									</span>
									<MilestoneStatusBadge status={milestone.status} />
									<MilestoneActions
										milestone={milestone}
										contractStatus={contract.status}
										onCreateInvoice={onCreateInvoice}
										onMarkPaid={onMarkPaid}
										canCreateInvoice={canCreateInvoice}
										canMarkPaid={canMarkPaid}
										isCreatingInvoice={isCreatingInvoice}
										isMarkingPaid={isMarkingPaid}
									/>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-center py-8 text-muted-foreground">No milestones defined</p>
				)}
			</CardContent>
		</Card>
	);
}

function MilestoneIcon({ status }: { status: MilestoneStatus }) {
	const isPaid = status === MilestoneStatus.PAID;
	const isInvoiced = status === MilestoneStatus.INVOICED;

	return (
		<div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? "bg-green-100 dark:bg-green-900/30" : isInvoiced ? "bg-blue-100 dark:bg-blue-900/30" : "bg-muted"}`}>
			{isPaid ? <CheckCircle className="h-5 w-5 text-green-600" /> : isInvoiced ? <Receipt className="h-5 w-5 text-blue-600" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
		</div>
	);
}

interface MilestoneActionsProps {
	milestone: ContractMilestone;
	contractStatus: ContractStatus;
	onCreateInvoice: (milestoneId: number, dueDate?: string) => void;
	onMarkPaid: (milestoneId: number) => void;
	canCreateInvoice: boolean;
	canMarkPaid: boolean;
	isCreatingInvoice: boolean;
	isMarkingPaid: boolean;
}

function MilestoneActions({ milestone, contractStatus, onCreateInvoice, onMarkPaid, canCreateInvoice, canMarkPaid, isCreatingInvoice, isMarkingPaid }: MilestoneActionsProps) {
	const showCreateInvoice = (milestone.status === MilestoneStatus.DUE || milestone.status === MilestoneStatus.PENDING) && !milestone.invoiceId && contractStatus === ContractStatus.ACTIVE && canCreateInvoice;

	const showMarkPaid = milestone.status !== MilestoneStatus.PAID && contractStatus === ContractStatus.ACTIVE && canMarkPaid;

	if (!showCreateInvoice && !showMarkPaid) return null;

	return (
		<TooltipProvider>
			<div className="flex items-center gap-2">
				{showCreateInvoice && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onCreateInvoice(milestone.milestoneId, milestone.dueDate)}
								disabled={isCreatingInvoice}
							>
								<Plus className="h-4 w-4 mr-1" />
								Create Invoice
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Create an invoice for this milestone</p>
						</TooltipContent>
					</Tooltip>
				)}

				{showMarkPaid && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={milestone.invoiceId ? "default" : "outline"}
								size="sm"
								onClick={() => onMarkPaid(milestone.milestoneId)}
								disabled={isMarkingPaid}
							>
								<CheckCircle className="h-4 w-4 mr-1" />
								Mark Paid
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{milestone.invoiceId ? "Mark milestone and linked invoice as paid" : "Mark milestone as paid without invoice"}</p>
						</TooltipContent>
					</Tooltip>
				)}
			</div>
		</TooltipProvider>
	);
}
