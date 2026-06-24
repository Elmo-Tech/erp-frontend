"use client";

import React from "react";

interface ApproveUIButtonProps {
	projectId: number;
	canApproveUI: boolean;
	projectTitle?: string;
	onApprovalSuccess?: () => void;
	className?: string;
	size?: "default" | "sm" | "lg";
}

export const ApproveUIButton: React.FC<ApproveUIButtonProps> = () => null;

export default ApproveUIButton;
