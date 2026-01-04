"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormTextarea, FormSwitch } from "@/components/shared";
import { useCreateProjectWiki, useUpdateProjectWiki } from "../../hooks/useProjectWikis";
import { ProjectWiki } from "../../types/projectWiki";
import { toast } from "sonner";

const wikiSchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	isEncrypted: z.boolean(),
});

type WikiFormData = z.infer<typeof wikiSchema>;

interface WikiFormDialogProps {
	projectId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	wiki?: ProjectWiki | null;
}

export function WikiFormDialog({ projectId, open, onOpenChange, wiki }: WikiFormDialogProps) {
	const isEditing = !!wiki;
	const createWiki = useCreateProjectWiki();
	const updateWiki = useUpdateProjectWiki();

	const form = useForm<WikiFormData>({
		resolver: zodResolver(wikiSchema),
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
		} else {
			form.reset({
				title: "",
				content: "",
				isEncrypted: false,
			});
		}
	}, [wiki, form]);

	const handleSubmit = async (data: WikiFormData) => {
		try {
			if (isEditing && wiki) {
				await updateWiki.mutateAsync({
					projectId,
					wikiId: wiki.wikiId,
					payload: data,
				});
				toast.success("Wiki entry updated successfully");
			} else {
				await createWiki.mutateAsync({
					projectId,
					payload: data,
				});
				toast.success("Wiki entry created successfully");
			}
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error(isEditing ? "Failed to update wiki entry" : "Failed to create wiki entry");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={isEditing ? "Edit Wiki Entry" : "Create Wiki Entry"}
			description={isEditing ? "Update documentation" : "Add documentation or credentials"}
			submitLabel={isEditing ? "Update" : "Create"}
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createWiki.isPending || updateWiki.isPending}
			isSubmitDisabled={!form.formState.isValid}
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormInput
						control={form.control}
						name="title"
						label="Title"
						placeholder="e.g., Server Credentials, API Keys..."
					/>
					<FormTextarea
						control={form.control}
						name="content"
						label="Content"
						placeholder="Enter documentation content (Markdown supported)..."
						rows={10}
					/>
					<FormSwitch
						control={form.control}
						name="isEncrypted"
						label="Encrypt Content"
						description="Enable encryption for sensitive data like passwords and API keys"
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
