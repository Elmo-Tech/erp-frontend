"use client";

import { create } from "zustand";
import type { ProjectTimeEntry } from "@/features/projects/api/execution.api";

interface ActiveTimeEntryState {
	activeTimeEntry: ProjectTimeEntry | null;
	setActiveTimeEntry: (entry: ProjectTimeEntry | null) => void;
}

export const useActiveTimeEntryStore = create<ActiveTimeEntryState>((set) => ({
	activeTimeEntry: null,
	setActiveTimeEntry: (entry) => set({ activeTimeEntry: entry }),
}));
