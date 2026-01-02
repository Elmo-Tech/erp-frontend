/**
 * ProfileForm Component
 * Form for updating user profile information
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useUpdateProfile } from "../hooks";
import { updateProfileSchema, UpdateProfileFormData } from "../schemas";

interface ProfileFormProps {
	initialName: string;
	email: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialName, email }) => {
	const updateProfileMutation = useUpdateProfile();

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm<UpdateProfileFormData>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: initialName,
		},
	});

	const onSubmit = (data: UpdateProfileFormData) => {
		updateProfileMutation.mutate(data);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Personal Information</CardTitle>
				<CardDescription>Update your personal details</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							{...register("name")}
							placeholder="Enter your name"
						/>
						{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							value={email}
							disabled
							className="bg-muted"
						/>
						<p className="text-xs text-muted-foreground">Email cannot be changed</p>
					</div>
					<Button
						type="submit"
						disabled={updateProfileMutation.isPending || !isDirty}
					>
						{updateProfileMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Save Changes
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
