import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { appContext } from "../App";

export type HelpProps = {
	show: boolean;
	onClose: () => void;
}

export const KeyShortcut = ({ shortcut, description }: { shortcut: string, description: string }) => {
	const { theme } = useContext(appContext);
	const useStyles = makeStyles({
		shortcut: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontWeight: "bold",
			direction: "ltr",
			textAlign: "center",
			border: `1px solid ${theme.palette.primary.main}`,
			borderRadius: "5px",
			lineHeight: "1.5",
			padding: "5px",
			backgroundColor: theme.palette.primary.dark,
		},
		description: {
			alignSelf: 'center',
			fontWeight: "bold",
			border: '1px solid transparent',
			borderRadius: "5px",
			paddding: "5px",
		},
	});
	const classes = useStyles();
	return (
		<Grid item xs={12} container spacing={2}>
			<Grid item xs={2}>
				<Typography className={classes.shortcut} variant="body2">{shortcut}</Typography>
			</Grid>
			<Grid item xs={10} sx={{ display: 'flex' }}>
				<Typography className={classes.description} variant="body2">{description}</Typography>
			</Grid>
		</Grid>
	);
}

export const Help: React.FC<HelpProps> = ({ show, onClose }) => {
	const { t } = useTranslation();
	const shortcuts = [
		{ shortcut: "Ctrl + ?", description: t("help.shortcuts.show_help") },
		{ shortcut: "Ctrl + n", description: t("help.shortcuts.show_add_node") },
		{ shortcut: "Ctrl + =", description: t("help.shortcuts.zoom_in") },
		{ shortcut: "Ctrl + -", description: t("help.shortcuts.zoom_out") },
		{ shortcut: "Ctrl + 0", description: t("help.shortcuts.reset_zoom") },
		{ shortcut: "Ctrl + s", description: t("help.shortcuts.show_settings") },
		{ shortcut: "Ctrl + r", description: t("help.shortcuts.refresh_graph") },
		{ shortcut: "Ctrl + l", description: t("help.shortcuts.change_layout") },
		{ shortcut: "Ctrl + f", description: t("help.shortcuts.show_quick_find") },
		{ shortcut: "f", description: t("help.shortcuts.focus_search") },
		{ shortcut: "p", description: t("help.shortcuts.toggle_find_path") },
		{ shortcut: "Ctrl + e", description: t("help.shortcuts.show_export") },
		{ shortcut: "Ctrl + i", description: t("help.shortcuts.show_import") },
		{ shortcut: "Esc", description: t("help.shortcuts.escape") },
	];
	return (
		<Dialog
			fullWidth
			onClose={onClose}
			open={show}>
			<DialogTitle>{t('help.title')}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{t('help.description')}
				</DialogContentText>
				<Grid container spacing={1} mt={1}>
					{shortcuts.map((shortcut, index) => (
						<KeyShortcut key={index} shortcut={shortcut.shortcut} description={shortcut.description} />
					))}
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button color='inherit' onClick={onClose}>{t('close')}</Button>
			</DialogActions>
		</Dialog>
	);
}
