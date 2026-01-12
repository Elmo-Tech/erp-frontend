/**
 * Edit Wiki Dialog Component
 */

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormTextarea, FormSwitch } from "@/components/shared";
import { ProjectWiki } from "../../types/projectWiki";
import { updateWikiSchema, UpdateWikiFormData } from "./schemas";

interface EditWikiDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	wiki: ProjectWiki | null;
	onSubmit: (data: UpdateWikiFormData) => Promise<void>;
	isPending: boolean;
}

export function EditWikiDialog({ open, onOpenChange, wiki, onSubmit, isPending }: EditWikiDialogProps) {
	const form = useForm<UpdateWikiFormData>({
		resolver: zodResolver(updateWikiSchema),
		defaultValues: {
			title: "",
			content: "",
			isEncrypted: false,
		},
	});

	useEffect(() => {
		if (wiki) {
			form.reset({
				title: wiki.title,
				content: wiki.content,
				isEncrypted: wiki.isEncrypted,
			});
		}
	}, [wiki, form]);

	const handleSubmit = async (data: UpdateWikiFormData) => {
		await onSubmit(data);
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Edit Wiki Entry"
			submitLabel="Update Wiki"
			isLoading={isPending}
			onSubmit={form.handleSubmit(handleSubmit)}
			size="xxl"
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormInput
						control={form.control}
						name="title"
						label="Title"
						placeholder="Enter wiki title..."
					/>

					<FormTextarea
						control={form.control}
						name="content"
						label="Content"
						placeholder="Enter wiki content in Markdown format..."
						rows={10}
					/>

					<FormSwitch
						control={form.control}
						name="isEncrypted"
						label="Encrypt Content"
						description="Enable encryption for sensitive information like passwords or API keys"
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
