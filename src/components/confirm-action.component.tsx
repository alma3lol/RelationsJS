import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material"
import { FC } from "react"
import { useTranslation } from "react-i18next";

export type ConfirmActionProps = {
	actionName: string
	actionTitle: string
	actionQuestion: string
	show: boolean
	close: () => void
	onConfirm: () => void
}

export const ConfirmAction: FC<ConfirmActionProps> = ({ actionName, actionTitle, actionQuestion, show, close, onConfirm }) => {
	const { t } = useTranslation();
	const handleOnConfirm = () => {
		onConfirm();
		close();
	}
	if (!show) return null;
	return (
		<Dialog open={show} fullWidth maxWidth='sm'>
			<DialogTitle>{actionTitle}</DialogTitle>
			<DialogContent>{actionQuestion}</DialogContent>
			<DialogActions>
				<Button color='inherit' onClick={close}>{t('cancel')}</Button>
				<Button variant='contained' color='error' onClick={handleOnConfirm}>{actionName}</Button>
			</DialogActions>
		</Dialog>
	)
}
