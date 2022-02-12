import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	Theme,
	Typography,
} from "@mui/material"
import {
	Close as CloseIcon,
	Print as PrintIcon,
	Edit as EditIcon,
} from "@mui/icons-material";
import { DefaultTheme, makeStyles } from "@mui/styles"
import { useContext } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { appContext } from "../App"
import { Person } from "../models"
import { PersonDetails } from "./details";

export type PersonViewProps = {
	show: boolean;
	person: Person;
	onClose: () => void;
}

const useStyles = makeStyles<DefaultTheme, Theme>({
	dialog: {
		padding: "0px",
	},
	table: {
		width: "100%",
		'& td': {
			padding: '0.5rem',
			border: '2px solid #ccc',
			'&:first-of-type': {
				width: '25%',
			},
		}
	},
	buttonIcon: {
		margin: "0 !important",
		marginRight: (theme) => theme.direction === 'ltr' ? "0" : `${theme.spacing(1)} !important`,
	},
})

export const PersonView: React.FC<PersonViewProps> = ({ show, person, onClose }) => {
	const { t } = useTranslation();
	const { theme, language } = useContext(appContext);
	const navigate = useNavigate();
	const classes = useStyles(theme);
	return (
		<Dialog open={show} fullWidth maxWidth='lg' className={classes.dialog}>
			<DialogTitle>
				<Typography>{t('forms.views.person', { fileNumber: person.fileNumber })}</Typography>
			</DialogTitle>
			<DialogContent>
				<PersonDetails person={person} />
			</DialogContent>
			<DialogActions sx={{ direction: language === 'ar' ? 'rtl' : 'ltr', displayPrint: 'none' }}>
				<Stack direction='row' spacing={1}>
					<Button classes={{ startIcon: classes.buttonIcon }} variant='contained' startIcon={<PrintIcon />} onClick={() => navigate(`/print/person/${person.id}`)} sx={{ ml: 1 }}>{t('print')}</Button>
					<Button classes={{ startIcon: classes.buttonIcon }} variant='contained' startIcon={<EditIcon />} onClick={() => navigate(`/edit/person/${person.id}`)} sx={{ ml: 1 }} color='warning'>{t('edit')}</Button>
					<Button classes={{ startIcon: classes.buttonIcon }} variant='outlined' startIcon={<CloseIcon />} onClick={() => onClose()} color='inherit'>{t('close')}</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	)
}
