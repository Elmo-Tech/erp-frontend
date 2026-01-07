"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContractContentTabProps {
	content: string;
}

export function ContractContentTab({ content }: ContractContentTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Contract Content</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{content}</div>
			</CardContent>
		</Card>
	);
}
