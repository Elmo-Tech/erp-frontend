"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { ClientInvoice } from "../types/clientInvoice";
import { cn } from "@/shared/lib/utils";

interface ClientInvoiceCardProps {
	/** Invoice data */
	invoice: ClientInvoice;
	/** Callback when Pay Now button is clicked */
	onPayClick?: (invoice: ClientInvoice) => void;
	/** Whether payment is in progress */
	isPaymentLoading?: boolean;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Get status badge color based on invoice status
 */
const getStatusBadgeColor = (status: string, isOverdue: boolean): string => {
	if (isOverdue) return "bg-red-100 text-red-800 border-red-200";

	const colors: Record<string, string> = {
		draft: "bg-gray-100 text-gray-800 border-gray-200",
		sent: "bg-blue-100 text-blue-800 border-blue-200",
		paid: "bg-green-100 text-green-800 border-green-200",
		overdue: "bg-red-100 text-red-800 border-red-200",
		cancelled: "bg-gray-100 text-gray-500 border-gray-200",
	};
	return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

/**
 * Format date string to readable format
 */
const formatDate = (dateString: string): string => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

/**
 * Format currency amount
 */
const formatCurrency = (amount: number, currency: string): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency || "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

/**
 * ClientInvoiceCard component for displaying invoice summary in client portal.
 * Shows invoice number, amount, status, due date with overdue highlighting and Pay Now button.
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4 - Display invoice with status, highlight overdue, show Pay Now
 */
export const ClientInvoiceCard: React.FC<ClientInvoiceCardProps> = ({ invoice, onPayClick, isPaymentLoading = false, className = "" }) => {
	const handlePayClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onPayClick?.(invoice);
	};

	return (
		<Card className={cn("transition-shadow", invoice.isOverdue && "border-red-200 bg-red-50/30", className)}>
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2">
						<CardTitle className="text-base font-semibold">{invoice.invoiceNumber}</CardTitle>
						{invoice.isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
					</div>
					<Badge className={cn("shrink-0 border", getStatusBadgeColor(invoice.status, invoice.isOverdue))}>{invoice.isOverdue ? "Overdue" : invoice.statusLabel}</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Amount */}
				<div className="text-2xl font-bold text-foreground">{formatCurrency(invoice.amount, invoice.currency)}</div>

				{/* Due Date */}
				<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<Calendar className="h-4 w-4" />
					<span className={cn(invoice.isOverdue && "text-red-600 font-medium")}>Due: {formatDate(invoice.dueDate)}</span>
				</div>

				{/* Paid Date (if paid) */}
				{invoice.paidAt && (
					<div className="flex items-center gap-1.5 text-sm text-green-600">
						<CreditCard className="h-4 w-4" />
						<span>Paid: {formatDate(invoice.paidAt)}</span>
					</div>
				)}

				{/* Pay Now Button */}
				{invoice.isPayable && (
					<Button
						onClick={handlePayClick}
						disabled={isPaymentLoading}
						className="w-full mt-2"
						size="sm"
					>
						<CreditCard className="h-4 w-4 mr-2" />
						{isPaymentLoading ? "Processing..." : "Pay Now"}
					</Button>
				)}
			</CardContent>
		</Card>
	);
};

export default ClientInvoiceCard;
