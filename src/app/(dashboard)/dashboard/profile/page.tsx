"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { UserRound } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AvatarUpload, ProfileForm, SecuritySettings } from "@/features/profile";
import { getRoleLabel } from "@/config/simplification";
import { DesktopNotificationSettings } from "@/components/DesktopNotificationSettings";
import { MyEmployeeProfile } from "@/features/hr/components/MyEmployeeProfile";

export default function ProfilePage() {
	const { user, role } = useAuthStore();

	return (
		<div className="space-y-6 max-w-5xl">
			<PageHeader title="Profile" description="Your account details and preferences, all in one place." icon={UserRound} />

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
