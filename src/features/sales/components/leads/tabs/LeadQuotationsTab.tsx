"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { QuotationStatusBadge } from "@/components/shared/StatusBadge";
import { Quotation } from "../../../types/quotation";

interface LeadQuotationsTabProps {
	quotations: Quotation[];
	onCreateQuotation: () => void;
}

export function LeadQuotationsTab({ quotations, onCreateQuotation }: LeadQuotationsTabProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Quotations</CardTitle>
					<CardDescription>Price quotes sent to this lead</CardDescription>
				</div>
				<Button onClick={onCreateQuotation}>
					<Plus className="h-4 w-4 mr-2" />
					Create Quotation
				</Button>
			</CardHeader>
			<CardContent>
				{quotations.length > 0 ? (
					<div className="space-y-3">
						{quotations.map((quotation) => (
							<div
								key={quotation.quotationId}
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
							>
								<div>
									<p className="font-medium">{quotation.quotationNumber}</p>
									<p className="text-sm text-muted-foreground">Created {formatDistanceToNow(new Date(quotation.createdAt), { addSuffix: true })}</p>
								</div>
								<div className="flex items-center gap-3">
									<span className="font-medium">
										{quotation.currency} {quotation.finalPrice.toLocaleString()}
									</span>
									<QuotationStatusBadge status={quotation.status} />
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-center py-8 text-muted-foreground">No quotations yet</p>
				)}
			</CardContent>
		</Card>
	);
}
