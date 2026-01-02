/**
 * AvatarUpload Component
 * Component for uploading and displaying user avatar
 */

"use client";

import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, User } from "lucide-react";
import { useUpdateAvatar } from "../hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
	currentAvatar?: string;
	userName: string;
	userEmail: string;
	userRole: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatar, userName, userEmail, userRole }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const updateAvatarMutation = useUpdateAvatar();

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const handleAvatarClick = () => {
		if (!updateAvatarMutation.isPending) {
			fileInputRef.current?.click();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			toast.error("Image size must be less than 2MB");
			return;
		}

		updateAvatarMutation.mutate(file);

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Picture</CardTitle>
				<CardDescription>Click on the avatar to upload a new picture</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-6">
					<div
						className={cn("relative group cursor-pointer", updateAvatarMutation.isPending && "cursor-wait")}
						onClick={handleAvatarClick}
					>
						<Avatar className="h-24 w-24">
							<AvatarImage
								src={currentAvatar}
								alt={userName}
							/>
							<AvatarFallback className="bg-primary/10 text-primary text-2xl">{userName ? getInitials(userName) : <User className="h-10 w-10" />}</AvatarFallback>
						</Avatar>
						<div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
							{updateAvatarMutation.isPending ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleFileChange}
							disabled={updateAvatarMutation.isPending}
						/>
					</div>
					<div className="space-y-1">
						<p className="font-medium">{userName}</p>
						<p className="text-sm text-muted-foreground">{userEmail}</p>
						<p className="text-xs text-muted-foreground capitalize">Role: {userRole}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
