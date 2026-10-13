"use client";

import { EmployeeMoneyPanel, type EmployeeMoneyPanelProps } from "./EmployeeMoneyPanel";

export function EmployeeDirectDeductionsPanel(props: EmployeeMoneyPanelProps) {
	return <EmployeeMoneyPanel {...props} mode="deduction" />;
}
