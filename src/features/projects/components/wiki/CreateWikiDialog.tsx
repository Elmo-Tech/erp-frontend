/**
 * Create Wiki Dialog Component
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormTextarea, FormSwitch } from "@/components/shared";
import { Plus } from "lucide-react";
import { createWikiSchema, CreateWikiFormData } from "./schemas";

interface CreateWikiDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateWikiFormData) => Promise<void>;
	isPending: boolean;
}

export function CreateWikiDialog({ open, onOpenChange, onSubmit, isPending }: CreateWikiDialogProps) {
	const form = useForm<CreateWikiFormData>({
		resolver: zodResolver(createWikiSchema),
		defaultValues: {
			title: "",
			content: "",
			isEncrypted: false,
		},
	});

	const handleSubmit = async (data: CreateWikiFormData) => {
		await onSubmit(data);
		form.reset();
	};

	return (
		<>
			<Button onClick={() => onOpenChange(true)}>
				<Plus className="h-4 w-4 mr-2" />
				New Wiki Entry
			</Button>

			<FormDialog
				open={open}
				onOpenChange={onOpenChange}
				title="Create Wiki Entry"
				submitLabel="Create Wiki"
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
		</>
	);
}
