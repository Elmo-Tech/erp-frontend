"use client";

import { EmployeeMoneyPanel, type EmployeeMoneyPanelProps } from "./EmployeeMoneyPanel";

export function EmployeeAdvancesPanel(props: EmployeeMoneyPanelProps) {
	return <EmployeeMoneyPanel {...props} mode="withdrawal" />;
}
