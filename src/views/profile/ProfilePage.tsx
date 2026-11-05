"use client";

import { type ChangeEvent } from "react";
import { Camera, KeyRound, Loader2, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user.api";
import { userKeys } from "@/entities/user/model/query-keys";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { ChangePasswordForm, type ChangePasswordFormValues } from "@/features/profile/ui/ChangePasswordForm";
import { UpdateProfileForm, type UpdateProfileFormValues } from "@/features/profile/ui/UpdateProfileForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { TimeReminderSettingsCard } from "@/features/time-reminder";

function initials(name: string | undefined) {
	return (name || "User")
		.split(" ")
		.map((part) => part[0])
		.join("")
		.substring(0, 2)
		.toUpperCase();
}

export default function ProfilePage() {
	const queryClient = useQueryClient();
	const storeUser = useAuthStore((s) => s.user);
	const updateUser = useAuthStore((s) => s.updateUser);

	const profileQuery = useQuery({
		queryKey: userKeys.profile(storeUser?.userId),
		queryFn: userApi.getProfile,
		enabled: storeUser !== null,
	});

	const profile = profileQuery.data?.data.profile;

	const updateProfile = useMutation({
		mutationFn: userApi.updateProfile,
		onSuccess: (response) => {
			updateUser({ name: response.data.profile.name });
			queryClient.invalidateQueries({ queryKey: userKeys.profiles() });
			toast.success("Profile updated.");
		},
		onError: () => toast.error("Failed to update profile."),
	});

	const updateAvatar = useMutation({
		mutationFn: userApi.updateAvatar,
		onSuccess: (response) => {
			updateUser({ avatar: response.data.avatar });
			queryClient.invalidateQueries({ queryKey: userKeys.profiles() });
			toast.success("Avatar updated.");
		},
		onError: () => toast.error("Failed to update avatar."),
	});

	const changePassword = useMutation({
		mutationFn: userApi.changePassword,
		onSuccess: () => toast.success("Password changed."),
		onError: () => toast.error("Failed to change password."),
	});

	const handleProfileSubmit = (values: UpdateProfileFormValues) => {
		if (!values.name.trim()) return;
		updateProfile.mutate({ name: values.name.trim() });
	};

	const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			updateAvatar.mutate(file);
		}
		event.target.value = "";
	};

	const handlePasswordSubmit = (values: ChangePasswordFormValues, reset: () => void) => {
		changePassword.mutate(values, { onSuccess: reset });
	};

	const displayName = profile?.name ?? storeUser?.name ?? "User";
	const avatar = profile?.avatar ?? storeUser?.avatar;
	const email = profile?.email ?? storeUser?.email;
	const profileDefaults = {
		name: displayName,
		email: email ?? "",
	};

	return (
		<section className="space-y-6">
			<PageHeader title="Profile" description="Manage your account identity, password, and personal preferences." />

			<div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<UserRound className="size-4 text-muted-foreground" />
							Account
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col items-center gap-4 text-center">
						<Avatar className="size-24">
							<AvatarImage src={avatar || undefined} alt={displayName} />
							<AvatarFallback className="text-xl">{initials(displayName)}</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="truncate text-lg font-medium">{displayName}</p>
							<p className="truncate text-sm text-muted-foreground">{email}</p>
						</div>
						<Button type="button" variant="outline" className="relative gap-2" disabled={updateAvatar.isPending}>
							{updateAvatar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
							Upload Avatar
							<input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={handleAvatarChange} aria-label="Upload avatar" />
						</Button>
					</CardContent>
				</Card>

				<div className="grid gap-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<Save className="size-4 text-muted-foreground" />
								Profile Details
							</CardTitle>
						</CardHeader>
						<CardContent>
							<UpdateProfileForm defaultValues={profileDefaults} isLoading={profileQuery.isLoading || updateProfile.isPending} onSubmit={handleProfileSubmit} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<KeyRound className="size-4 text-muted-foreground" />
								Password
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ChangePasswordForm isLoading={changePassword.isPending} onSubmit={handlePasswordSubmit} />
						</CardContent>
					</Card>

					<TimeReminderSettingsCard />
				</div>
			</div>
		</section>
	);
}
