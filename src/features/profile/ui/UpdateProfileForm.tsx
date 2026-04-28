"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { updateProfileSchema, type UpdateProfileFormData } from "../model/profile.schema";
import { useUpdateProfile } from "../model/use-profile-actions";

interface UpdateProfileFormProps {
	name: string;
	email: string;
}

export function UpdateProfileForm({ name, email }: UpdateProfileFormProps) {
	const updateProfile = useUpdateProfile();
	const form = useForm<UpdateProfileFormData>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: { name },
	});

	useEffect(() => {
		form.reset({ name });
	}, [form, name]);

	const onSubmit = async (data: UpdateProfileFormData) => {
		try {
			await updateProfile.mutateAsync(data);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update profile");
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-1.5">
				<Label htmlFor="profile-name">Name</Label>
				<Input id="profile-name" {...form.register("name")} autoComplete="name" />
				{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="profile-email">Email</Label>
				<Input id="profile-email" value={email} disabled className="bg-muted" />
				<p className="text-xs text-muted-foreground">Email changes are handled by administrators.</p>
			</div>
			<Button type="submit" disabled={updateProfile.isPending || !form.formState.isDirty}>
				{updateProfile.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
				Save profile
			</Button>
		</form>
	);
}
