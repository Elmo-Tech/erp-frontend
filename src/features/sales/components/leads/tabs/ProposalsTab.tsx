"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, Check, X, Eye, Send } from "lucide-react";
import { format } from "date-fns";
import { Proposal, ProposalStatus, ProposalStatusLabels, ProposalStatusColors } from "../../../types/proposal";
import { CreateProposalDialog } from "../dialogs/CreateProposalDialog";

interface ProposalsTabProps {
	leadId: number;
	proposals?: Proposal[];
	isLoading?: boolean;
	onRefresh?: () => void;
}

export function ProposalsTab({ leadId, proposals = [], isLoading, onRefresh }: ProposalsTabProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const getStatusBadge = (status: ProposalStatus) => {
		const color = ProposalStatusColors[status] || "gray";
		const label = ProposalStatusLabels[status] || status;

		const colorClasses: Record<string, string> = {
			gray: "bg-gray-100 text-gray-800",
			blue: "bg-blue-100 text-blue-800",
			cyan: "bg-cyan-100 text-cyan-800",
			green: "bg-green-100 text-green-800",
			red: "bg-red-100 text-red-800",
			orange: "bg-orange-100 text-orange-800",
		};

		return <Badge className={colorClasses[color] || colorClasses.gray}>{label}</Badge>;
	};

	const getStatusIcon = (status: ProposalStatus) => {
		switch (status) {
			case ProposalStatus.DRAFT:
				return <FileText className="h-4 w-4" />;
			case ProposalStatus.SENT:
				return <Send className="h-4 w-4" />;
			case ProposalStatus.VIEWED:
				return <Eye className="h-4 w-4" />;
			case ProposalStatus.APPROVED:
				return <Check className="h-4 w-4" />;
			case ProposalStatus.REJECTED:
				return <X className="h-4 w-4" />;
			case ProposalStatus.EXPIRED:
				return <Clock className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Technical Proposals</h3>
					<p className="text-sm text-muted-foreground">Manage proposals for this lead (PV format)</p>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Create New Proposal
				</Button>
			</div>

			{/* Proposals List */}
			{isLoading ? (
				<div className="text-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="text-muted-foreground mt-2">Loading proposals...</p>
				</div>
			) : proposals.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
						<p className="text-muted-foreground text-center mb-4">Create a technical proposal to move this lead forward in the sales process.</p>
						<Button onClick={() => setCreateDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create First Proposal
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{proposals.map((proposal) => (
						<Card
							key={proposal.proposalId}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<CardTitle className="text-base flex items-center gap-2">
											<FileText className="h-4 w-4 text-muted-foreground" />
											{proposal.proposalNumber}
										</CardTitle>
										<p className="font-medium">{proposal.title}</p>
									</div>
									{getStatusBadge(proposal.status)}
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									{getStatusIcon(proposal.status)}
									<span>{proposal.submissionDate ? `Submitted: ${format(new Date(proposal.submissionDate), "MMM d, yyyy")}` : `Created: ${format(new Date(proposal.createdAt), "MMM d, yyyy")}`}</span>
									{proposal.expiryDate && (
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											Expires: {format(new Date(proposal.expiryDate), "MMM d, yyyy")}
										</span>
									)}
								</div>
								{proposal.fileName && (
									<div className="mt-3 text-sm">
										<span className="text-muted-foreground">File: </span>
										<span className="font-medium">{proposal.fileName}</span>
									</div>
								)}
								{proposal.isFastTrack && (
									<div className="mt-2">
										<Badge
											variant="outline"
											className="text-xs"
										>
											Fast Track
										</Badge>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Create Proposal Dialog */}
			<CreateProposalDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				leadId={leadId}
				onSuccess={onRefresh}
			/>
		</div>
	);
}
