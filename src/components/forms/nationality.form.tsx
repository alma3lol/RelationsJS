import { TextField } from "@mui/material"
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Nationality } from "../../models";

export type NationalityFormProps = {
	nationality: Nationality;
	onSubmit: (e: React.FormEvent) => void;
}

export const NationalityForm: React.FC<NationalityFormProps> = observer(({ nationality, onSubmit }) => {
	const { t } = useTranslation();
	return (
		<TextField
			required
			label={t("forms.inputs.nationality.name")}
			onChange={e => nationality.setName(e.target.value)}
			value={nationality.name}
			onKeyPress={(e) => {
				if (e.key === "Enter") {
					onSubmit(e);
				}
			}}
		/>
	)
});
