"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms";

export interface UpdateProfileFormValues {
	name: string;
	email: string;
}

interface UpdateProfileFormProps {
	defaultValues: UpdateProfileFormValues;
	isLoading?: boolean;
	onSubmit: (values: UpdateProfileFormValues) => void;
}

export function UpdateProfileForm({ defaultValues, isLoading = false, onSubmit }: UpdateProfileFormProps) {
	const form = useForm<UpdateProfileFormValues>({ defaultValues });
	const watchedName = useWatch({ control: form.control, name: "name" });

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	return (
		<Form {...form}>
			<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormInput control={form.control} name="name" label="Name" disabled={isLoading} />
				<FormInput control={form.control} name="email" label="Email" type="email" disabled readOnly />
				<Button type="submit" className="w-fit gap-2" disabled={isLoading || !watchedName?.trim()}>
					{isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
					Save Profile
				</Button>
			</form>
		</Form>
	);
}
