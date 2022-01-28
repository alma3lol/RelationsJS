import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { Category } from "../../models";

export type CategoryFormProps = {
	category: Category
	onSubmit: (e: React.FormEvent) => void;
}

export const CategoryForm = observer<CategoryFormProps>(({ category, onSubmit }) => {
	const { t } = useTranslation();
	return (
		<TextField
			required
			label={t("forms.inputs.category.name")}
			onChange={e => category.setName(e.target.value)}
			value={category.name}
			onKeyPress={(e) => {
				if (e.key === "Enter") {
					onSubmit(e);
				}
			}}
		/>
	)
})
