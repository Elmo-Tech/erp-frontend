"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { ClientStatus, ClientStatusLabels } from "@/entities/client/model/types";
import type { ClientFormData } from "../model/client.schema";

interface ClientFormFieldsProps {
	form: UseFormReturn<ClientFormData>;
}

const STATUS_OPTIONS = Object.values(ClientStatus).map((status) => ({
	value: status,
	label: ClientStatusLabels[status],
}));

export function ClientFormFields({ form }: ClientFormFieldsProps) {
	return (
		<Form {...form}>
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormInput
						control={form.control}
						name="name"
						label="Name"
						placeholder="John Doe"
					/>

					<FormInput
						control={form.control}
						name="email"
						label="Email"
						type="email"
						placeholder="john@example.com"
					/>

					<FormInput
						control={form.control}
						name="phone"
						label="Phone"
						type="tel"
						placeholder="+1 234 567 890"
					/>

					<FormInput
						control={form.control}
						name="company"
						label="Company"
						placeholder="Acme Inc."
					/>

					<FormInput
						control={form.control}
						name="position"
						label="Position"
						placeholder="CEO"
					/>

					<FormInput
						control={form.control}
						name="website"
						label="Website"
						type="url"
						placeholder="https://example.com"
					/>

					<FormInput
						control={form.control}
						name="city"
						label="City"
						placeholder="New York"
					/>

					<FormInput
						control={form.control}
						name="country"
						label="Country"
						placeholder="USA"
					/>
				</div>

				<FormInput
					control={form.control}
					name="address"
					label="Address"
					placeholder="123 Main St"
				/>

				<FormTextarea
					control={form.control}
					name="notes"
					label="Notes"
					placeholder="Additional notes about the client"
					rows={3}
				/>

				<FormSelect
					control={form.control}
					name="status"
					label="Status"
					options={STATUS_OPTIONS}
				/>
			</div>
		</Form>
	);
}
