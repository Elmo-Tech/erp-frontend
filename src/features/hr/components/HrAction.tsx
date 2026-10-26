"use client";

import type { ReactNode } from "react";
import { useHrAccess } from "../hooks/useHrAccess";

export function HrAction({ resource, action, children, allow = false }: { resource: string; action: string; children: ReactNode; allow?: boolean }) {
	const access = useHrAccess();
	return allow || access.action(resource, action) ? <>{children}</> : null;
}
