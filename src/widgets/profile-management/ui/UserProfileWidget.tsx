"use client";

import { useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { ChangePasswordForm } from "@/features/profile/ui/ChangePasswordForm";
import { UpdateProfileForm } from "@/features/profile/ui/UpdateProfileForm";
import { useProfile, useUpdateAvatar } from "@/features/profile/model/use-profile-actions";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function UserProfileWidget() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const authUser = useAuthStore((state) => state.user);
	const role = useAuthStore((state) => state.role);
	const profileQuery = useProfile();
	const updateAvatar = useUpdateAvatar();
	const profile = profileQuery.data?.data.profile;
	const name = profile?.name ?? authUser?.name ?? "";
	const email = profile?.email ?? authUser?.email ?? "";
	const avatar = profile?.avatar ?? authUser?.avatar;

	const initials = name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			toast.error("Image size must be less than 2MB");
			return;
		}

		updateAvatar.mutate(file);
		event.target.value = "";
	};

	return (
		<div className="max-w-3xl space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
				<p className="text-sm text-muted-foreground">Manage account identity and security.</p>
			</div>

			<Card>
				<CardContent className="flex items-center gap-4 p-4">
					<button type="button" className="group relative rounded-full" onClick={() => fileInputRef.current?.click()} disabled={updateAvatar.isPending}>
						<Avatar className="size-16">
							<AvatarImage src={avatar ?? undefined} alt={name} />
							<AvatarFallback>{initials || <User className="size-6" />}</AvatarFallback>
						</Avatar>
						<span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
							{updateAvatar.isPending ? <Loader2 className="size-5 animate-spin text-white" /> : <Camera className="size-5 text-white" />}
						</span>
					</button>
					<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
					<div className="min-w-0">
						<div className="truncate font-medium">{name || "User"}</div>
						<div className="truncate text-sm text-muted-foreground">{email}</div>
						<div className="text-xs capitalize text-muted-foreground">{role || "guest"}</div>
					</div>
				</CardContent>
			</Card>

			{profileQuery.isLoading && !authUser ? (
				<div className="space-y-3">
					<Skeleton className="h-44 w-full" />
					<Skeleton className="h-56 w-full" />
				</div>
			) : (
				<div className="grid gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Personal information</CardTitle>
							<CardDescription>Update your display name.</CardDescription>
						</CardHeader>
						<CardContent>
							<UpdateProfileForm name={name} email={email} />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Security</CardTitle>
							<CardDescription>Change your account password.</CardDescription>
						</CardHeader>
						<CardContent>
							<ChangePasswordForm />
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
