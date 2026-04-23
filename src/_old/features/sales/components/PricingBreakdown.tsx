"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Calculator, Clock, DollarSign, Percent, TrendingUp } from "lucide-react";
import { PricingBreakdown as PricingBreakdownType } from "../types/quotation";

interface PricingBreakdownProps {
	breakdown: PricingBreakdownType;
	currency?: string;
	className?: string;
	showIcons?: boolean;
	compact?: boolean;
}

/**
 * PricingBreakdown component for displaying quotation pricing details
 * Requirements: 9.5 - Display totalHours, grossPrice, discountAmount, finalPrice with currency formatting
 */
export const PricingBreakdown: React.FC<PricingBreakdownProps> = ({ breakdown, currency = "USD", className = "", showIcons = true, compact = false }) => {
	// Format currency values
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	// Format hours with proper pluralization
	const formatHours = (hours: number): string => {
		const formatted = hours.toFixed(1);
		return `${formatted} ${hours === 1 ? "hour" : "hours"}`;
	};

	// Calculate discount percentage for display
	const discountPercentage = breakdown.grossPrice > 0 ? ((breakdown.discountAmount / breakdown.grossPrice) * 100).toFixed(1) : "0.0";

	if (compact) {
		return (
			<div className={`space-y-2 ${className}`}>
				<div className="flex justify-between items-center text-sm">
					<span className="text-muted-foreground">Total Hours:</span>
					<span className="font-medium">{formatHours(breakdown.totalHours)}</span>
				</div>
				<div className="flex justify-between items-center text-sm">
					<span className="text-muted-foreground">Gross Price:</span>
					<span className="font-medium">{formatCurrency(breakdown.grossPrice)}</span>
				</div>
				{breakdown.discountAmount > 0 && (
					<div className="flex justify-between items-center text-sm">
						<span className="text-muted-foreground">Discount ({discountPercentage}%):</span>
						<span className="font-medium text-green-600">-{formatCurrency(breakdown.discountAmount)}</span>
					</div>
				)}
				<Separator />
				<div className="flex justify-between items-center">
					<span className="font-semibold">Final Price:</span>
					<span className="font-bold text-lg text-primary">{formatCurrency(breakdown.finalPrice)}</span>
				</div>
			</div>
		);
	}

	return (
		<Card className={className}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					{showIcons && <Calculator className="h-5 w-5" />}
					Pricing Breakdown
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Total Hours */}
				<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
					<div className="flex items-center gap-2">
						{showIcons && <Clock className="h-4 w-4 text-muted-foreground" />}
						<span className="font-medium">Total Hours</span>
					</div>
					<span className="text-lg font-semibold">{formatHours(breakdown.totalHours)}</span>
				</div>

				{/* Gross Price */}
				<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
					<div className="flex items-center gap-2">
						{showIcons && <DollarSign className="h-4 w-4 text-muted-foreground" />}
						<span className="font-medium">Gross Price</span>
					</div>
					<span className="text-lg font-semibold">{formatCurrency(breakdown.grossPrice)}</span>
				</div>

				{/* Discount (only show if there's a discount) */}
				{breakdown.discountAmount > 0 && (
					<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
						<div className="flex items-center gap-2">
							{showIcons && <Percent className="h-4 w-4 text-green-600" />}
							<span className="font-medium text-green-700 dark:text-green-300">Discount ({discountPercentage}%)</span>
						</div>
						<span className="text-lg font-semibold text-green-600">-{formatCurrency(breakdown.discountAmount)}</span>
					</div>
				)}

				<Separator />

				{/* Final Price */}
				<div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
					<div className="flex items-center gap-2">
						{showIcons && <TrendingUp className="h-5 w-5 text-primary" />}
						<span className="text-lg font-bold text-primary">Final Price</span>
					</div>
					<span className="text-2xl font-bold text-primary">{formatCurrency(breakdown.finalPrice)}</span>
				</div>

				{/* Additional Information */}
				<div className="text-xs text-muted-foreground space-y-1 pt-2">
					<p>• Prices are calculated in {currency}</p>
					<p>• All amounts are rounded to 2 decimal places</p>
					{breakdown.discountAmount > 0 && <p>• Discount is applied to the gross price</p>}
				</div>
			</CardContent>
		</Card>
	);
};

// Export a simplified version for inline use
export const InlinePricingBreakdown: React.FC<Omit<PricingBreakdownProps, "compact">> = (props) => {
	return (
		<PricingBreakdown
			{...props}
			compact={true}
		/>
	);
};
