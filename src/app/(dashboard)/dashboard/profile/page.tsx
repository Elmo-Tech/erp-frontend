"use client";

import { useAuthStore } from "@/_old/store/authStore";
import { AvatarUpload, ProfileForm, SecuritySettings } from "@/_old/features/profile";

export default function ProfilePage() {
	const { user, role } = useAuthStore();

	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<h1 className="text-2xl font-bold">Profile</h1>
				<p className="text-muted-foreground">Manage your account information</p>
			</div>

			{/* Avatar Section */}
			<AvatarUpload
				currentAvatar={user?.avatar}
				userName={user?.name || ""}
				userEmail={user?.email || ""}
				userRole={role || "guest"}
			/>

			{/* Profile Info Section */}
			<ProfileForm
				initialName={user?.name || ""}
				email={user?.email || ""}
			/>

			{/* Security Section */}
			<SecuritySettings />
		</div>
	);
}
