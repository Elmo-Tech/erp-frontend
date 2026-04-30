'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/shared/api/base';
import { useAuthStore } from '@/entities/user/model/auth.store';
import { useSidebarStore } from '@/widgets/layout/model/sidebar.store';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { SystemNotificationsDropdown } from '@/widgets/system-notifications/ui/SystemNotificationsDropdown';

export function DashboardNavbar() {
	const router = useRouter();
	const { resolvedTheme, setTheme } = useTheme();
	const { user, role, logout } = useAuthStore();
	const { toggleMobileOpen } = useSidebarStore();
	const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U";

	const logoutMutation = useMutation({
		mutationFn: () => api.post('/auth/logout'),
		onSettled: () => {
			logout();
			router.push('/login');
		},
	});

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-background/70 px-4 backdrop-blur-lg lg:px-6">
			<div className="flex items-center gap-3">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={toggleMobileOpen}
					className="lg:hidden"
					aria-label="Toggle menu"
				>
					<Menu />
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="hidden w-64 justify-start text-muted-foreground md:flex"
					disabled
				>
					<Search data-icon="inline-start" />
					Search
				</Button>
			</div>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
					aria-label="Toggle theme"
				>
					{resolvedTheme === 'dark' ? <Sun /> : <Moon />}
				</Button>

				<SystemNotificationsDropdown />

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							className="gap-2 px-2"
						>
							<Avatar className="size-8">
								<AvatarImage
									src={user?.avatar}
									alt={user?.name}
								/>
								<AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback>
							</Avatar>
							<div className="hidden flex-col items-start text-left md:flex">
								<span className="text-sm font-medium">{user?.name || 'User'}</span>
								<span className="text-xs text-muted-foreground">{role || 'guest'}</span>
							</div>
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
						<DropdownMenuItem asChild>
							<Link href="/dashboard/profile">
								<User data-icon="inline-start" />
								Profile
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/dashboard/settings">
								<Settings data-icon="inline-start" />
								Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => logoutMutation.mutate()}
							disabled={logoutMutation.isPending}
						>
							<LogOut data-icon="inline-start" />
							{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
