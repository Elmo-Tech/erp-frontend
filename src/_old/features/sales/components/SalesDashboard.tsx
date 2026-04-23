"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Users, TrendingUp, DollarSign, Target, UserPlus, FileText, LayoutGrid, List, Eye, Phone, Mail } from "lucide-react";
import { LeadKanban } from "./LeadKanban";
import { LeadsTable, CreateLeadForm } from "./leads";
import { ContractsTable, CreateContractForm } from "./contracts";
import { useLeads } from "../hooks/useLeads";
import { useContracts } from "../hooks/useContracts";
import { LeadStatus } from "../types/lead";
import { formatCurrency, formatNumber } from "@/shared/lib/formatters";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";

type ViewMode = "kanban" | "table";

export function SalesDashboard() {
	const [activeTab, setActiveTab] = useState("overview");
	const [leadViewMode, setLeadViewMode] = useState<ViewMode>("kanban");
	const [showLeadForm, setShowLeadForm] = useState(false);
	const [showContractForm, setShowContractForm] = useState(false);
	const [defaultLeadStatus, setDefaultLeadStatus] = useState<LeadStatus | undefined>();

	const { data: leadsData } = useLeads();
	const { data: contractsData } = useContracts();
	const { canCreateLeads, canViewLeads, canCreateContracts, canViewContracts } = usePermissions();

	// Calculate statistics
	const leads = leadsData?.leads || [];
	const contracts = contractsData?.contracts || [];

	const totalLeads = leads.length;
	const newLeads = leads.filter((l) => l.status === LeadStatus.NEW).length;
	const qualifiedLeads = leads.filter((l) => l.status === LeadStatus.QUALIFIED).length;
	const wonLeads = leads.filter((l) => l.status === LeadStatus.WON).length;
	const lostLeads = leads.filter((l) => l.status === LeadStatus.LOST).length;

	const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
	const totalContractValue = contracts.reduce((sum, contract) => sum + (contract.totalAmount || 0), 0);
	const activeContracts = contracts.filter((c) => c.status === "active").length;

	const handleCreateLead = (status?: LeadStatus) => {
		setDefaultLeadStatus(status);
		setShowLeadForm(true);
	};

	const handleLeadFormClose = () => {
		setShowLeadForm(false);
		setDefaultLeadStatus(undefined);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Sales Dashboard</h1>
					<p className="text-muted-foreground">Manage your sales pipeline and track performance</p>
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
						<Button onClick={() => setShowContractForm(true)}>
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
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					{canViewLeads && <TabsTrigger value="leads">Leads Pipeline</TabsTrigger>}
					{canViewContracts && <TabsTrigger value="contracts">Contracts</TabsTrigger>}
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent
					value="overview"
					className="space-y-6"
				>
					{/* Key Metrics */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Leads</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatNumber(totalLeads)}</div>
								<p className="text-xs text-muted-foreground">
									<span className="text-green-600">{newLeads} new</span> this period
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
								<Target className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
								<p className="text-xs text-muted-foreground">
									{wonLeads} won / {totalLeads} total
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Contract Value</CardTitle>
								<DollarSign className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(totalContractValue)}</div>
								<p className="text-xs text-muted-foreground">{activeContracts} active contracts</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Pipeline Health</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{qualifiedLeads > 0 ? (
										<Badge
											variant="default"
											className="bg-green-100 text-green-800"
										>
											Healthy
										</Badge>
									) : (
										<Badge variant="secondary">Needs Attention</Badge>
									)}
								</div>
								<p className="text-xs text-muted-foreground">{qualifiedLeads} qualified leads</p>
							</CardContent>
						</Card>
					</div>

					{/* Pipeline Status */}
					<Card>
						<CardHeader>
							<CardTitle>Pipeline Status</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
								{[
									{ status: "New", count: newLeads, color: "bg-blue-100 text-blue-800" },
									{ status: "Contacted", count: leads.filter((l) => l.status === LeadStatus.CONTACTED).length, color: "bg-yellow-100 text-yellow-800" },
									{ status: "Qualified", count: qualifiedLeads, color: "bg-purple-100 text-purple-800" },
									{ status: "Proposal", count: leads.filter((l) => l.status === LeadStatus.PROPOSAL).length, color: "bg-orange-100 text-orange-800" },
									{ status: "Negotiation", count: leads.filter((l) => l.status === LeadStatus.NEGOTIATION).length, color: "bg-indigo-100 text-indigo-800" },
									{ status: "Won", count: wonLeads, color: "bg-green-100 text-green-800" },
									{ status: "Lost", count: lostLeads, color: "bg-red-100 text-red-800" },
								].map((item) => (
									<div
										key={item.status}
										className="text-center"
									>
										<div className="text-2xl font-bold">{item.count}</div>
										<Badge className={item.color}>{item.status}</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Recent Activity */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{leads.slice(0, 5).map((lead) => (
									<div
										key={lead.leadId}
										className="flex items-center gap-4 p-3 border rounded-lg"
									>
										<div className="flex-1">
											<div className="font-medium">{lead.name}</div>
											<div className="text-sm text-muted-foreground">{lead.company}</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="outline">{lead.status}</Badge>
											<div className="flex gap-1">
												<Button
													size="sm"
													variant="ghost"
												>
													<Eye className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="ghost"
												>
													<Phone className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="ghost"
												>
													<Mail className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Leads Tab */}
				{canViewLeads && (
					<TabsContent
						value="leads"
						className="space-y-6"
					>
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold">Leads Pipeline</h2>
								<p className="text-muted-foreground">Manage and track your sales leads</p>
							</div>
							<div className="flex gap-1 border rounded-md p-1">
								<Button
									variant={leadViewMode === "kanban" ? "secondary" : "ghost"}
									size="sm"
									onClick={() => setLeadViewMode("kanban")}
								>
									<LayoutGrid className="h-4 w-4" />
								</Button>
								<Button
									variant={leadViewMode === "table" ? "secondary" : "ghost"}
									size="sm"
									onClick={() => setLeadViewMode("table")}
								>
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{leadViewMode === "kanban" ? <LeadKanban onCreateLead={canCreateLeads ? handleCreateLead : undefined} /> : <LeadsTable onAdd={() => handleCreateLead()} />}
					</TabsContent>
				)}

				{/* Contracts Tab */}
				{canViewContracts && (
					<TabsContent
						value="contracts"
						className="space-y-6"
					>
						<div>
							<h2 className="text-2xl font-bold">Contracts</h2>
							<p className="text-muted-foreground">Manage your contracts and agreements</p>
						</div>
						<ContractsTable onAdd={() => setShowContractForm(true)} />
					</TabsContent>
				)}

				{/* Analytics Tab */}
				<TabsContent
					value="analytics"
					className="space-y-6"
				>
					<div>
						<h2 className="text-2xl font-bold">Sales Analytics</h2>
						<p className="text-muted-foreground">Detailed insights and performance metrics</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Lead Sources</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{["Website", "Referral", "Social Media", "Cold Call", "Email"].map((source) => {
										const count = leads.filter((l) => l.source === source.toLowerCase().replace(" ", "_")).length;
										const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
										return (
											<div
												key={source}
												className="flex items-center justify-between"
											>
												<span className="text-sm">{source}</span>
												<div className="flex items-center gap-2">
													<div className="w-20 bg-gray-200 rounded-full h-2">
														<div
															className="bg-blue-600 h-2 rounded-full"
															style={{ width: `${percentage}%` }}
														/>
													</div>
													<span className="text-sm font-medium">{count}</span>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Performance Metrics</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex justify-between">
										<span>Average Deal Size</span>
										<span className="font-medium">{formatCurrency(totalContractValue / Math.max(contracts.length, 1))}</span>
									</div>
									<div className="flex justify-between">
										<span>Win Rate</span>
										<span className="font-medium">{conversionRate.toFixed(1)}%</span>
									</div>
									<div className="flex justify-between">
										<span>Active Leads</span>
										<span className="font-medium">{totalLeads - wonLeads - lostLeads}</span>
									</div>
									<div className="flex justify-between">
										<span>Total Pipeline Value</span>
										<span className="font-medium">{formatCurrency(totalContractValue)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			{canCreateLeads && (
				<CreateLeadForm
					open={showLeadForm}
					onOpenChange={handleLeadFormClose}
					defaultStatus={defaultLeadStatus}
				/>
			)}

			{canCreateContracts && (
				<CreateContractForm
					open={showContractForm}
					onOpenChange={setShowContractForm}
				/>
			)}
		</div>
	);
}
