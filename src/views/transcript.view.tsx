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
import { Transcript } from "../models"
import { TranscriptDetails } from "./details";

export type TranscriptViewProps = {
	show: boolean;
	transcript: Transcript;
	onClose: () => void;
	onMentionedClick: (id: string) => void;
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

export const TranscriptView: React.FC<TranscriptViewProps> = ({ show, transcript, onClose, onMentionedClick }) => {
	const { t } = useTranslation();
	const { theme, language } = useContext(appContext);
	const navigate = useNavigate();
	const classes = useStyles(theme);
	return (
		<Dialog open={show} fullWidth maxWidth='lg' className={classes.dialog}>
			<DialogTitle>
				<Typography>{t('forms.views.transcript', { title: transcript.title })}</Typography>
			</DialogTitle>
			<DialogContent>
				<TranscriptDetails transcript={transcript} onMentionedClick={onMentionedClick} />
			</DialogContent>
			<DialogActions sx={{ direction: language === 'ar' ? 'rtl' : 'ltr', displayPrint: 'none' }}>
				<Stack direction='row' spacing={1}>
					<Button classes={{ startIcon: classes.buttonIcon }} variant='contained' startIcon={<PrintIcon />} onClick={() => navigate(`/print/transcript/${transcript.id}`)} sx={{ ml: 1 }}>{t('print')}</Button>
					<Button classes={{ startIcon: classes.buttonIcon }} variant='contained' startIcon={<EditIcon />} onClick={() => navigate(`/edit/transcript/${transcript.id}`)} sx={{ ml: 1 }} color='warning'>{t('edit')}</Button>
					<Button classes={{ startIcon: classes.buttonIcon }} variant='outlined' startIcon={<CloseIcon />} onClick={() => onClose()} color='inherit'>{t('close')}</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	)
}
