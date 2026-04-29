export interface SettingsDictionaryItem {
	title: string;
	entityName: string;
	category: string;
	entity: string;
	apiEntity?: string;
}

export interface SettingsDictionaryGroup {
	title: string;
	key: string;
	items: SettingsDictionaryItem[];
}

export const settingsDictionaryGroups: SettingsDictionaryGroup[] = [
	{
		title: "CRM",
		key: "crm",
		items: [
			{ title: "Lead Sources", entityName: "Lead Source", category: "crm", entity: "lead-sources" },
			{ title: "Interests", entityName: "Lead Interest", category: "crm", entity: "interests", apiEntity: "lead-interests" },
			{ title: "Meeting Types", entityName: "Meeting Type", category: "crm", entity: "meeting-types" },
			{ title: "Meeting Statuses", entityName: "Meeting Status", category: "crm", entity: "meeting-statuses" },
		],
	},
	{
		title: "Sales",
		key: "sales",
		items: [
			{ title: "Proposal Statuses", entityName: "Proposal Status", category: "sales", entity: "proposal-statuses" },
			{ title: "Quotation Types", entityName: "Quotation Type", category: "sales", entity: "quotation-types" },
			{ title: "Quotation Rejections", entityName: "Quotation Rejection", category: "sales", entity: "quotation-rejections", apiEntity: "rejection-reasons" },
			{ title: "Skip Reasons", entityName: "Skip Reason", category: "sales", entity: "skip-reasons" },
		],
	},
	{
		title: "Billing",
		key: "billing",
		items: [
			{ title: "Contract Models", entityName: "Contract Model", category: "billing", entity: "contract-models" },
			{ title: "Billing Cycles", entityName: "Billing Cycle", category: "billing", entity: "billing-cycles" },
			{ title: "Currencies", entityName: "Currency", category: "billing", entity: "currencies" },
			{ title: "Discount Types", entityName: "Discount Type", category: "billing", entity: "discount-types" },
			{ title: "Payment Statuses", entityName: "Payment Status", category: "billing", entity: "payment-statuses" },
		],
	},
	{
		title: "Projects",
		key: "projects",
		items: [
			{ title: "Project Types", entityName: "Project Type", category: "projects", entity: "project-types" },
			{ title: "Project Statuses", entityName: "Project Status", category: "projects", entity: "project-statuses" },
		],
	},
	{
		title: "General",
		key: "general",
		items: [
			{ title: "Countries", entityName: "Country", category: "general", entity: "countries" },
			{ title: "Client Statuses", entityName: "Client Status", category: "general", entity: "client-statuses" },
			{ title: "Contact Roles", entityName: "Contact Role", category: "general", entity: "contact-roles" },
		],
	},
];

export function getSettingsDictionary(category: string, entity: string) {
	return settingsDictionaryGroups.flatMap((group) => group.items).find((item) => item.category === category && item.entity === entity);
}

export function getSettingsDictionaryHref(item: SettingsDictionaryItem) {
	return `/settings/${item.category}/${item.entity}`;
}

export function getSettingsDictionaryEndpoint(item: SettingsDictionaryItem) {
	return `/settings/${item.apiEntity ?? item.entity}`;
}
