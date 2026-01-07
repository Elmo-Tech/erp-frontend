"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Contract } from "../../../types/contract";

interface ContractDetailsTabProps {
	contract: Contract;
}

export function ContractDetailsTab({ contract }: ContractDetailsTabProps) {
	const router = useRouter();

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						Timeline
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Start Date</span>
						<span className="font-medium">{format(new Date(contract.startDate), "MMM d, yyyy")}</span>
					</div>
					{contract.endDate && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">End Date</span>
							<span className="font-medium">{format(new Date(contract.endDate), "MMM d, yyyy")}</span>
						</div>
					)}
					{contract.signedAt && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Signed At</span>
							<span className="font-medium">{format(new Date(contract.signedAt), "MMM d, yyyy")}</span>
						</div>
					)}
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Created</span>
						<span className="font-medium">{format(new Date(contract.createdAt), "MMM d, yyyy")}</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<FileText className="h-4 w-4" />
						Related Documents
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{contract.quotation && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Quotation</span>
							<span className="font-medium">{contract.quotation.quotationNumber}</span>
						</div>
					)}
					{contract.project && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Project</span>
							<Button
								variant="link"
								className="p-0 h-auto"
								onClick={() => router.push(`/dashboard/projects/${contract.project?.projectId}`)}
							>
								{contract.project.title}
							</Button>
						</div>
					)}
					{contract.signedByClient && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Signed By</span>
							<span className="font-medium">{contract.signedByClient}</span>
						</div>
					)}
				</CardContent>
			</Card>

			{contract.paymentTerms && (
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<DollarSign className="h-4 w-4" />
							Payment Terms
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap">{contract.paymentTerms}</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
