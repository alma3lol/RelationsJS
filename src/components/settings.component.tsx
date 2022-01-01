import {
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	FormControlLabel,
	Divider,
	Checkbox,
	FormGroup,
	Box,
    Paper,
    TextField,
	Tooltip,
	InputAdornment,
	IconButton,
} from "@mui/material"
import { FC, useContext, useState, useCallback, FormEvent } from "react"
import { appContext } from "../App"
import {
	Logout as LogoutIcon,
	ArrowCircleRight as ArrowCircleRightIcon,
} from '@mui/icons-material';
import { FileType } from "../global.d";
import { useSnackbar } from "notistack";
import { red } from "@mui/material/colors";
import { Neo4jError } from "neo4j-driver";
import { ThemeModeSwitch } from "./theme-mode-switch.component";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./language-selector.component";

export type SettingsProps = {
	show: boolean
	close: () => void
	onDone: () => void
}
export const Settings: FC<SettingsProps> = ({ show, close, onDone }) => {
	const { t } = useTranslation();
	const { enqueueSnackbar } = useSnackbar();
	const { darkMode, toggleDarkMode, setDriver, setDatabase, setConnected, driver, theme, database, dropDatabaseIndexesAndConstraints, createDatabaseIndexesAndConstraints } = useContext(appContext);
	const disconnect = async () => {
		await driver?.close();
		setDriver(null);
		setDatabase('');
		setConnected(false);
	}
	const [filesTypes, setFilesTypes] = useState<{ [key in FileType]: boolean }>({ 'passports': false, 'pictures': false, 'documents': false, 'videos': false });
	const deleteUsedFiles = async () => {
		if (driver) {
			const session = driver.session({ database });
			const trx = session.beginTransaction();
			let clearedNothing = true;
			if (filesTypes['passports']) {
				const result = await trx.run('MATCH (h:Passport) RETURN h');
				const count = await window.files.clearUnused('passports', result.records.map(record => record.toObject().h));
				setFilesTypes(prev => ({ ...prev, 'passports': false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(`Cleared ${count} unused passports`, { variant: 'success' });
				}
			}
			if (filesTypes['pictures']) {
				const result = await trx.run('MATCH (p:Picture) RETURN p');
				const count = await window.files.clearUnused('pictures', result.records.map(record => record.toObject().p));
				setFilesTypes(prev => ({ ...prev, 'pictures': false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(`Cleared ${count} unused pictures`, { variant: 'success' });
				}
			}
			if (filesTypes['documents']) {
				const result = await trx.run('MATCH (d:Document) RETURN d');
				const count = await window.files.clearUnused('documents', result.records.map(record => record.toObject().d));
				setFilesTypes(prev => ({ ...prev, 'documents': false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(`Cleared ${count} unused documents`, { variant: 'success' });
				}
			}
			if (filesTypes['videos']) {
				const result = await trx.run('MATCH (v:Video) RETURN v');
				const count = await window.files.clearUnused('videos', result.records.map(record => record.toObject().v));
				setFilesTypes(prev => ({ ...prev, 'videos': false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(`Cleared ${count} unused videos`, { variant: 'success' });
				}
			}
			if (clearedNothing) enqueueSnackbar('Nothing to be cleared', { variant: 'info' });
			await session.close();
		}
	}
	const deleteUsedFilesCallback = useCallback(deleteUsedFiles, [driver, filesTypes, setFilesTypes, database, enqueueSnackbar]);
	const [waitingResetDatabaseConfirmation, setWaitingResetDatabaseConfirmation] = useState(false);
	const [confirmDatabaseReset, setConfirmDatabaseReset] = useState('');
	const handleDatabaseReset = async (e: FormEvent) => {
		e.preventDefault();
		if (confirmDatabaseReset !== 'CONFIRM') return;
		if (driver) {
			try {
				const session = driver.session({ database });
				await session.run('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE r, n');
				await session.close();
				dropDatabaseIndexesAndConstraints(driver.session({ database }));
				createDatabaseIndexesAndConstraints(driver.session({ database }));
				enqueueSnackbar('Database has been reset', { variant: 'info' });
				setConfirmDatabaseReset('');
				setWaitingResetDatabaseConfirmation(false);
				onDone();
			} catch (e) {
				enqueueSnackbar((e as Neo4jError).message, { variant: 'error' });
			}
		}
	}
	if (!show) return null;
	return (
		<Dialog open={show} fullWidth maxWidth='sm'>
			<DialogTitle>
				{t('settings.title')}
			</DialogTitle>
			<Divider variant='middle' />
			<DialogContent>
				<Box sx={{ mb: 2 }}>
					<LanguageSelector />
				</Box>
				<FormControlLabel
					sx={{ m: 0 }}
					control={<ThemeModeSwitch onClick={toggleDarkMode} checked={darkMode} />}
					label={t('settings.dark_mode') as string}
					labelPlacement='start' />
				<Box sx={{ mt: 2 }}>
					{t('settings.clear_unused.title')}:
					<Box sx={{ pl: 4 }}>
						<FormGroup>
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['passports']} onChange={() => setFilesTypes(prev => ({ ...prev, 'passports': !prev['passports'] }))} />} label={t('passports') as string} />
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['pictures']} onChange={() => setFilesTypes(prev => ({ ...prev, 'pictures': !prev['pictures'] }))} />} label={t('pictures') as string} />
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['videos']} onChange={() => setFilesTypes(prev => ({ ...prev, 'videos': !prev['videos'] }))} />} label={t('videos') as string} />
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['documents']} onChange={() => setFilesTypes(prev => ({ ...prev, 'documents': !prev['documents'] }))} />} label={t('documents') as string} />
						</FormGroup>
						<Button onClick={deleteUsedFilesCallback} size='small' variant='contained' disabled={!filesTypes['passports'] && !filesTypes['pictures'] && !filesTypes['videos'] && !filesTypes['documents']}>{t('settings.clear_unused.action')}</Button>
					</Box>
				</Box>
				<Paper sx={{ border: 2, borderColor: red[500], p: 2, mt: 2 }}>
					<Box sx={{ color: red[500] }}>{t('settings.dangerzone.title')}</Box>
					<Box sx={{ mt: 2 }}>
						<form onSubmit={handleDatabaseReset}>
							<Grid container spacing={2}>
								<Grid item xs={4}>
									<Button disabled={waitingResetDatabaseConfirmation} size='medium' color='error' variant='contained' onClick={() => setWaitingResetDatabaseConfirmation(true)}>{t('settings.dangerzone.action')}</Button>
								</Grid>
								<Grid item xs={6}>
									{waitingResetDatabaseConfirmation && <Tooltip title={t('settings.dangerzone.confirmation.message') as string}>
										<TextField
											InputProps={{
												endAdornment: <InputAdornment position='end'>
													<IconButton color='error' disabled={confirmDatabaseReset !== 'CONFIRM'} type='submit'><ArrowCircleRightIcon /></IconButton>
												</InputAdornment>,
												sx: {
													pr: 0
												}
											}}
											fullWidth
											color='error'
											label={t('settings.dangerzone.confirmation.label')}
											size='small'
											value={confirmDatabaseReset}
											onChange={e => setConfirmDatabaseReset(e.target.value)} />
									</Tooltip>}
								</Grid>
								<Grid item xs={2}>
									{waitingResetDatabaseConfirmation && <Button size='medium' onClick={() => { setConfirmDatabaseReset(''); setWaitingResetDatabaseConfirmation(false); }}>{t('cancel')}</Button>}
								</Grid>
							</Grid>
						</form>
					</Box>
				</Paper>
			</DialogContent>
			<Divider variant='middle' />
			<DialogActions style={{ padding: theme.spacing(3) }}>
				<Grid container>
					<Grid item flexGrow={1}>
						<Button color='inherit' onClick={close}>{t('settings.action')}</Button>
					</Grid>
					<Grid item>
						<Button variant='contained' color='error' onClick={disconnect}><LogoutIcon sx={{ px: 0.5 }} />{t('settings.disconnect')}</Button>
					</Grid>
				</Grid>
			</DialogActions>
		</Dialog>
	);
}
