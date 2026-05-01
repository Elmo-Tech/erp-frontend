import { notFound } from "next/navigation";
import { DictionaryManager } from "@/widgets/settings-management/ui/DictionaryManager";
import { getSettingsDictionary, getSettingsDictionaryEndpoint } from "@/shared/config/settings-dictionaries";

interface SettingsDictionaryPageProps {
	category: string;
	entity: string;
}

export default function SettingsDictionaryPage({ category, entity }: SettingsDictionaryPageProps) {
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
