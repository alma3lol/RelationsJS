import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

export type AddCategoryProps = {
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent) => void;
	value: string;
}

export const AddCategory: React.FC<AddCategoryProps> = ({
	onChange,
	onSubmit,
	value,
}) => {
	const { t } = useTranslation();
	return (
		<TextField
			required
			label={t("add_node.inputs.category.name")}
			onChange={onChange}
			value={value}
			onKeyPress={(e) => {
				if (e.key === "Enter") {
					onSubmit(e);
				}
			}}
		/>
	);
}
