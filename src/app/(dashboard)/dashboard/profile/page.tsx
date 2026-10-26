"use client";

import { useAuthStore } from "@/store/authStore";
import { AvatarUpload, ProfileForm, SecuritySettings } from "@/features/profile";
import { getRoleLabel } from "@/config/simplification";
import { DesktopNotificationSettings } from "@/components/DesktopNotificationSettings";
import { MyEmployeeProfile } from "@/features/hr/components/MyEmployeeProfile";

export default function ProfilePage() {
	const { user, role } = useAuthStore();

	return (
		<div className="space-y-6 max-w-5xl">
			<div>
				<h1 className="text-2xl font-bold">Profile</h1>
				<p className="text-muted-foreground">Manage your account information</p>
			</div>

			{/* Avatar Section */}
			<AvatarUpload
				currentAvatar={user?.avatar}
				userName={user?.name || ""}
				userEmail={user?.email || ""}
				userRole={getRoleLabel(role)}
			/>

			{/* Profile Info Section */}
			<ProfileForm
				initialName={user?.name || ""}
				email={user?.email || ""}
			/>

			{/* Security Section */}
			<DesktopNotificationSettings />
			<MyEmployeeProfile />
			<SecuritySettings />
		</div>
	);
}
