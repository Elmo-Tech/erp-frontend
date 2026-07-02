"use client";

import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, ReactNode } from "react";
import { useLocaleStore } from "@/store/localeStore";

interface ProvidersProps {
	children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	const locale = useLocaleStore((state) => state.locale);
	const setLocale = useLocaleStore((state) => state.setLocale);
	const dir = useLocaleStore((state) => state.dir);
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
						retry: 1,
						refetchOnWindowFocus: false,
					},
				},
			})
	);

	useEffect(() => {
		setLocale(locale);
	}, [locale, setLocale]);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				{children}
				<Toaster
					richColors
					position={dir === "rtl" ? "top-left" : "top-right"}
					closeButton
					duration={4000}
				/>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
