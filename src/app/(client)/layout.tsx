"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/_old/components/ProtectedRoute";
import { ThemeToggle } from "@/_old/components/ThemeToggle";
import { useAuthStore } from "@/_old/store/authStore";
import { useLogout } from "@/_old/features/auth/hooks/useLogout";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { LayoutDashboard, FileText, CreditCard, LogOut, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ClientLayoutProps {
	children: ReactNode;
}

const clientNavItems = [
	{ title: "Dashboard", href: "/client", icon: LayoutDashboard },
	{ title: "Projects", href: "/client/projects", icon: FileText },
	{ title: "Invoices", href: "/client/invoices", icon: CreditCard },
];

export default function ClientLayout({ children }: ClientLayoutProps) {
	const pathname = usePathname();
	const { user } = useAuthStore();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<ProtectedRoute allowedRoles={["client"]}>
			<div className="min-h-screen bg-background">
				{/* Header */}
				<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
					<div className="container mx-auto flex h-16 items-center justify-between px-4">
						{/* Logo */}
						<Link
							href="/client"
							className="flex items-center gap-2"
						>
							<Image
								src="/logo.webp"
								alt="Elmo ERP"
								width={32}
								height={32}
								className="rounded-lg"
							/>
							<span className="text-lg font-semibold">Elmo ERP</span>
						</Link>

						{/* Navigation */}
						<nav className="hidden md:flex items-center gap-1">
							{clientNavItems.map((item) => {
								const isActive = pathname === item.href;
								const Icon = item.icon;
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
									>
										<Icon className="h-4 w-4" />
										{item.title}
									</Link>
								);
							})}
						</nav>

						{/* Right side */}
						<div className="flex items-center gap-3">
							<ThemeToggle />

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="flex items-center gap-2 px-2"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={user?.avatar}
												alt={user?.name}
											/>
											<AvatarFallback className="bg-primary/10 text-primary text-xs">{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
										</Avatar>
										<span className="hidden md:inline text-sm font-medium">{user?.name}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56"
								>
									<DropdownMenuLabel>
										<div className="flex flex-col">
											<span>{user?.name}</span>
											<span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<User className="mr-2 h-4 w-4" />
										Profile
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => logout()}
										disabled={isLoggingOut}
										className="text-destructive focus:text-destructive"
									>
										<LogOut className="mr-2 h-4 w-4" />
										{isLoggingOut ? "Signing out..." : "Sign Out"}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Mobile Navigation */}
					<nav className="md:hidden border-t">
						<div className="container mx-auto flex items-center justify-around px-4 py-2">
							{clientNavItems.map((item) => {
								const isActive = pathname === item.href;
								const Icon = item.icon;
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn("flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground")}
									>
										<Icon className="h-5 w-5" />
										{item.title}
									</Link>
								);
							})}
						</div>
					</nav>
				</header>

				{/* Main Content */}
				<main className="container mx-auto p-4 md:p-6">{children}</main>
			</div>
		</ProtectedRoute>
	);
}
