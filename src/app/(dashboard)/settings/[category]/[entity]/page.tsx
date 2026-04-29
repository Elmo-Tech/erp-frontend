import { notFound } from "next/navigation";
import { DictionaryManager } from "@/widgets/settings-management/ui/DictionaryManager";
import { getSettingsDictionary, getSettingsDictionaryEndpoint } from "@/shared/config/settings-dictionaries";

interface SettingsDictionaryPageProps {
	params: Promise<{
		category: string;
		entity: string;
	}>;
}

export default async function SettingsDictionaryPage({ params }: SettingsDictionaryPageProps) {
	const { category, entity } = await params;
	const dictionary = getSettingsDictionary(category, entity);

	if (!dictionary) {
		notFound();
	}

	return (
		<DictionaryManager
			entityName={dictionary.entityName}
			apiEndpoint={getSettingsDictionaryEndpoint(dictionary)}
		/>
	);
}
