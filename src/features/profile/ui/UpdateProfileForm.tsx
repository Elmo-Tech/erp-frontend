"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms";
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
		defaultValues: { name, email },
	});

	useEffect(() => {
		form.reset({ name, email });
	}, [email, form, name]);

	const onSubmit = async (data: UpdateProfileFormData) => {
		try {
			await updateProfile.mutateAsync({ name: data.name });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update profile");
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4"
			>
				<FormInput
					control={form.control}
					name="name"
					label="Name"
					autoComplete="name"
				/>
				<FormInput
					control={form.control}
					name="email"
					label="Email"
					disabled
					readOnly
					description="Email changes are handled by administrators."
					inputClassName="bg-muted"
				/>
				<Button
					type="submit"
					disabled={updateProfile.isPending || !form.formState.isDirty}
				>
					{updateProfile.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
					Save profile
				</Button>
			</form>
		</Form>
	);
}
