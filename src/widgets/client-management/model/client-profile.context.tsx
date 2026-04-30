"use client";

import { createContext, useContext } from "react";
import type { Client } from "@/entities/client/model/types";

const ClientProfileContext = createContext<Client | null>(null);

export function ClientProfileProvider({ client, children }: { client: Client; children: React.ReactNode }) {
	return <ClientProfileContext.Provider value={client}>{children}</ClientProfileContext.Provider>;
}

export function useClientProfile() {
	const client = useContext(ClientProfileContext);

	if (!client) {
		throw new Error("useClientProfile must be used within ClientProfileProvider");
	}

	return client;
}
