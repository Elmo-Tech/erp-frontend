"use client";

import { create } from "zustand";

interface SidebarState {
	isCollapsed: boolean;
	isMobileOpen: boolean;
	setCollapsed: (collapsed: boolean) => void;
	toggleCollapsed: () => void;
	setMobileOpen: (open: boolean) => void;
	toggleMobileOpen: () => void;
	closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
	isCollapsed: false,
	isMobileOpen: false,
	setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
	toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
	setMobileOpen: (open) => set({ isMobileOpen: open }),
	toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
	closeMobile: () => set({ isMobileOpen: false }),
}));