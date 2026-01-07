"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User } from "lucide-react";
import { Contract } from "../../../types/contract";

interface ContractPartiesTabProps {
	contract: Contract;
}

export function ContractPartiesTab({ contract }: ContractPartiesTabProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Building2 className="h-4 w-4" />
						Party One (Provider)
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<p className="font-medium text-lg">{contract.partyOne.company}</p>
						<p className="text-muted-foreground">{contract.partyOne.representative}</p>
						{contract.partyOne.title && <p className="text-sm text-muted-foreground">{contract.partyOne.title}</p>}
					</div>
					{contract.partyOne.address && <p className="text-sm text-muted-foreground">{contract.partyOne.address}</p>}
					{contract.partyOne.idNumber && <p className="text-sm">ID: {contract.partyOne.idNumber}</p>}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<User className="h-4 w-4" />
						Party Two (Client)
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<p className="font-medium text-lg">{contract.partyTwo.company}</p>
						<p className="text-muted-foreground">{contract.partyTwo.representative}</p>
						{contract.partyTwo.title && <p className="text-sm text-muted-foreground">{contract.partyTwo.title}</p>}
					</div>
					{contract.partyTwo.address && <p className="text-sm text-muted-foreground">{contract.partyTwo.address}</p>}
					{contract.partyTwo.idNumber && <p className="text-sm">ID: {contract.partyTwo.idNumber}</p>}
				</CardContent>
			</Card>
		</div>
	);
}
