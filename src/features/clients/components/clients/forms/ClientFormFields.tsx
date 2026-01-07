"use client";

import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import { ClientStatus, ClientStatusLabels } from "../../../types";
import { ClientFormData } from "../../../schemas/clientSchema";

interface ClientFormFieldsProps {
	form: UseFormReturn<ClientFormData>;
}

export function ClientFormFields({ form }: ClientFormFieldsProps) {
	const statusOptions = Object.values(ClientStatus).map((status) => ({
		value: status,
		label: ClientStatusLabels[status],
	}));

	return (
		<Form {...form}>
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
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
					placeholder="Additional notes about the client..."
					rows={3}
				/>

				<FormSelect
					control={form.control}
					name="status"
					label="Status"
					options={statusOptions}
				/>
			</div>
		</Form>
	);
}
