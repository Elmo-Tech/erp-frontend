"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_MILESTONE_TEMPLATES, PaymentMilestone, validateMilestonePercentages } from "../../schemas/quotationSchema";

/**
 * PaymentMilestonesBuilder Component
 *
 * A component for building payment milestones with real-time validation.
 *
 * Key Features:
 * 1. Progress Bar indicating total percentage:
 *    - Yellow: Less than 100%
 *    - Red: Exceeds 100%
 *    - Green: Exactly 100%
 *
 * 2. Auto-calculation of amounts from percentages
 *    - Amount = (percentage / 100) * totalAmount
 *    - Display only, not manually editable
 *
 * 3. Add/Remove milestone rows
 * 4. Template presets for common milestone structures
 *
 * @param totalAmount - The final price after discount and commission
 * @param milestones - Array of milestones (name, percentage)
 * @param onMilestonesChange - Callback when milestones change
 * @param readOnly - Optional flag to make the component read-only
 */
interface PaymentMilestonesBuilderProps {
	totalAmount: number;
	milestones: PaymentMilestone[];
	onMilestonesChange: (milestones: PaymentMilestone[]) => void;
	readOnly?: boolean;
	currency?: string;
	className?: string;
}

/**
 * Progress bar colors based on percentage status
 */
function getProgressColor(percentage: number): "yellow" | "red" | "green" {
	if (percentage < 100) return "yellow";
	if (percentage > 100) return "red";
	return "green";
}

/**
 * Get the CSS class for progress bar based on status
 */
function getProgressBarClass(status: "yellow" | "red" | "green"): string {
	switch (status) {
		case "yellow":
			return "bg-yellow-500";
		case "red":
			return "bg-red-500";
		case "green":
			return "bg-green-500";
	}
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string = "USD"): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

export const PaymentMilestonesBuilder: React.FC<PaymentMilestonesBuilderProps> = ({ totalAmount, milestones, onMilestonesChange, readOnly = false, currency = "USD", className = "" }) => {
	const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");

	// Calculate total percentage and validation status
	const validation = useMemo(() => {
		return validateMilestonePercentages(milestones);
	}, [milestones]);

	const totalPercentage = validation.total;
	const isValid = validation.isValid;
	const difference = validation.difference;

	// Calculate milestone amounts
	const milestonesWithAmounts = useMemo(() => {
		return milestones.map((milestone) => ({
			...milestone,
			amount: (milestone.percentage / 100) * totalAmount,
		}));
	}, [milestones, totalAmount]);

	// Progress bar status
	const progressStatus = useMemo(() => {
		return getProgressColor(totalPercentage);
	}, [totalPercentage]);

	// Handle milestone field change
	const handleMilestoneChange = (index: number, field: keyof PaymentMilestone, value: string | number) => {
		const updatedMilestones = [...milestones];

		if (field === "name") {
			updatedMilestones[index] = { ...updatedMilestones[index], name: value as string };
		} else if (field === "percentage") {
			const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
			updatedMilestones[index] = { ...updatedMilestones[index], percentage: Math.min(100, Math.max(0, numValue)) };
		}

		onMilestonesChange(updatedMilestones);
		setSelectedTemplate("custom");
	};

	// Add new milestone
	const addMilestone = () => {
		const newMilestone: PaymentMilestone = {
			id: `milestone-${Date.now()}`,
			name: `Milestone ${milestones.length + 1}`,
			percentage: 0,
			amount: 0,
		};
		onMilestonesChange([...milestones, newMilestone]);
		setSelectedTemplate("custom");
	};

	// Remove milestone
	const removeMilestone = (index: number) => {
		if (milestones.length > 1) {
			const updatedMilestones = milestones.filter((_, i) => i !== index);
			onMilestonesChange(updatedMilestones);
		}
	};

	// Apply template
	const applyTemplate = (template: keyof typeof DEFAULT_MILESTONE_TEMPLATES) => {
		const templateMilestones = DEFAULT_MILESTONE_TEMPLATES[template].map((m, index) => ({
			id: `milestone-${Date.now()}-${index}`,
			name: m.name,
			percentage: m.percentage,
		}));
		onMilestonesChange(templateMilestones);
		setSelectedTemplate(template);
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calculator className="h-5 w-5" />
					Payment Milestones
				</CardTitle>
				<CardDescription>Define payment milestones. Percentages must sum to exactly 100%.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Template Selection */}
				{!readOnly && (
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
						<div className="flex-1">
							<Label htmlFor="template">Quick Templates</Label>
							<Select
								value={selectedTemplate}
								onValueChange={(value) => {
									if (value !== "custom") {
										applyTemplate(value as keyof typeof DEFAULT_MILESTONE_TEMPLATES);
									}
								}}
							>
								<SelectTrigger
									id="template"
									className="w-full sm:w-[240px]"
								>
									<SelectValue placeholder="Select a template" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="standard">Standard (4 Steps)</SelectItem>
									<SelectItem value="three_step">Three Step</SelectItem>
									<SelectItem value="half_half">Half & Half</SelectItem>
									<SelectItem value="four_equal">Four Equal</SelectItem>
									<SelectItem value="custom">Custom</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="text-sm text-muted-foreground">
							Total Amount: <span className="font-semibold text-foreground">{formatCurrency(totalAmount, currency)}</span>
						</div>
					</div>
				)}

				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">Total Allocation</span>
						<span className={cn("flex items-center gap-1 font-semibold", isValid ? "text-green-600" : totalPercentage > 100 ? "text-red-600" : "text-yellow-600")}>
							{isValid ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
							{totalPercentage.toFixed(2)}%
						</span>
					</div>
					<div className={cn("h-3 rounded-full overflow-hidden", getProgressBarClass(progressStatus))}>
						<Progress
							value={Math.min(100, totalPercentage)}
							className="h-full bg-transparent"
						/>
					</div>
					{!isValid && (
						<p className={cn("text-sm", totalPercentage > 100 ? "text-red-600" : "text-yellow-600")}>{totalPercentage > 100 ? `Over by ${difference.toFixed(2)}% - remove excess` : `Under by ${difference.toFixed(2)}% - add more`}</p>
					)}
				</div>

				{/* Milestones Table */}
				<div className="border rounded-lg overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[40%]">Milestone Name</TableHead>
								<TableHead className="w-[25%]">Percentage</TableHead>
								<TableHead className="w-[25%]">Amount</TableHead>
								{!readOnly && <TableHead className="w-[10%]"></TableHead>}
							</TableRow>
						</TableHeader>
						<TableBody>
							{milestonesWithAmounts.map((milestone, index) => (
								<TableRow key={milestone.id || index}>
									<TableCell>
										{readOnly ? (
											<span className="font-medium">{milestone.name}</span>
										) : (
											<Input
												value={milestone.name}
												onChange={(e) => handleMilestoneChange(index, "name", e.target.value)}
												placeholder="Enter milestone name"
												disabled={readOnly}
											/>
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{readOnly ? (
												<span className="font-medium">{milestone.percentage.toFixed(2)}%</span>
											) : (
												<Input
													type="number"
													min={0}
													max={100}
													step={0.01}
													value={milestone.percentage}
													onChange={(e) => handleMilestoneChange(index, "percentage", e.target.value)}
													placeholder="0"
													disabled={readOnly}
													className="w-24"
												/>
											)}
											<span className="text-muted-foreground">%</span>
										</div>
									</TableCell>
									<TableCell>
										<span className="font-medium">{formatCurrency(milestone.amount || 0, currency)}</span>
									</TableCell>
									{!readOnly && (
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeMilestone(index)}
												disabled={milestones.length <= 1}
												className="text-destructive hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Add Milestone Button */}
				{!readOnly && (
					<Button
						variant="outline"
						onClick={addMilestone}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Milestone
					</Button>
				)}

				{/* Summary */}
				<div className="bg-muted/50 p-4 rounded-lg space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Total Amount:</span>
						<span className="font-semibold">{formatCurrency(totalAmount, currency)}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Allocated:</span>
						<span className={cn("font-semibold", isValid ? "text-green-600" : "text-yellow-600")}>
							{formatCurrency((totalPercentage / 100) * totalAmount, currency)} ({totalPercentage.toFixed(2)}%)
						</span>
					</div>
					{!isValid && (
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Remaining:</span>
							<span className={cn("font-semibold", totalPercentage > 100 ? "text-red-600" : "text-yellow-600")}>{totalPercentage > 100 ? "Over allocated" : formatCurrency(((100 - totalPercentage) / 100) * totalAmount, currency)}</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default PaymentMilestonesBuilder;
