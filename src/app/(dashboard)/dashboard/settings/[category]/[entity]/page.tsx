import SettingsDictionaryPageView from "@/views/settings/SettingsDictionaryPage";

interface SettingsDictionaryPageProps {
	params: Promise<{
		category: string;
		entity: string;
	}>;
}

export default async function SettingsDictionaryPage({ params }: SettingsDictionaryPageProps) {
	const { category, entity } = await params;

	return (
		<SettingsDictionaryPageView
			category={category}
			entity={entity}
		/>
	);
}
