import { MenuItem, Select } from "@mui/material";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { appContext } from "../App";

export const LanguageSelector = () => {
	const { language, setLanguage } = useContext(appContext);
	const { i18n } = useTranslation();
	useEffect(() => {
		i18n.changeLanguage(language);
	}, [language, i18n]);
	return (
		<Select
			value={language}
			onChange={(e) => setLanguage(e.target.value)}
			inputProps={{
				name: "language",
				id: "language-selector",
			}}>
			<MenuItem value="en">English</MenuItem>
			<MenuItem value="ar">العربية</MenuItem>
		</Select>
	);
}
