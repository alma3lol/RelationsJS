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
	const [filesTypes, setFilesTypes] = useState<{ [key in FileType]: boolean }>({ passport: false, image: false, id: false, video: false, avatar: false, attachment: false });
	const deleteUsedFiles = async () => {
		if (driver) {
			const session = driver.session({ database });
			const trx = session.beginTransaction();
			let clearedNothing = true;
			if (filesTypes['passport']) {
				const result = await trx.run(`MATCH (m:Media { type: 'passport' }) RETURN m`);
				const count = await window.files.clearUnused('passport', result.records.map(record => record.toObject().m));
				setFilesTypes(prev => ({ ...prev, passport: false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(t('notifications.success.settings.cleared_unused', { cleared_count: count, cleared_type: t('passports') }), { variant: 'success' });
				}
			}
			if (filesTypes['image']) {
				const result = await trx.run(`MATCH (m:Media { type: 'image' }) RETURN m`);
				const count = await window.files.clearUnused('image', result.records.map(record => record.toObject().m));
				setFilesTypes(prev => ({ ...prev, image: false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(t('notifications.success.settings.cleared_unused', { cleared_count: count, cleared_type: t('images') }), { variant: 'success' });
				}
			}
			if (filesTypes['id']) {
				const result = await trx.run(`MATCH (m:Media { type: 'id' }) RETURN m`);
				const count = await window.files.clearUnused('id', result.records.map(record => record.toObject().m));
				setFilesTypes(prev => ({ ...prev, id: false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(t('notifications.success.settings.cleared_unused', { cleared_count: count, cleared_type: t(('ids')) }), { variant: 'success' });
				}
			}
			if (filesTypes['video']) {
				const result = await trx.run(`MATCH (m:Media { type: 'video' }) RETURN m`);
				const count = await window.files.clearUnused('video', result.records.map(record => record.toObject().m));
				setFilesTypes(prev => ({ ...prev, video: false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(t('notifications.success.settings.cleared_unused', { cleared_count: count, cleared_type: t(('videos')) }), { variant: 'success' });
				}
			}
			if (filesTypes['avatar']) {
				const result = await trx.run(`MATCH (m:Media { type: 'avatar' }) RETURN m`);
				const count = await window.files.clearUnused('avatar', result.records.map(record => record.toObject().m));
				setFilesTypes(prev => ({ ...prev, avatar: false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(t('notifications.success.settings.cleared_unused', { cleared_count: count, cleared_type: t(('avatars')) }), { variant: 'success' });
				}
			}
			if (filesTypes['attachment']) {
				const result = await trx.run(`MATCH (m:Media { type: 'attachment' }) RETURN m`);
				const count = await window.files.clearUnused('attachment', result.records.map(record => record.toObject().m));
				setFilesTypes(prev => ({ ...prev, attachment: false }));
				if (count) {
					clearedNothing = false;
					enqueueSnackbar(t('notifications.success.settings.cleared_unused', { cleared_count: count, cleared_type: t(('attachments')) }), { variant: 'success' });
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
				await session.run('MATCH (n) DETACH DELETE n');
				await session.close();
				dropDatabaseIndexesAndConstraints();
				createDatabaseIndexesAndConstraints();
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
				<Grid container sx={{ mb: 2 }}>
					<Grid item flexGrow={1}>
						<LanguageSelector />
					</Grid>
					<Grid item>
						<FormControlLabel
							sx={{ m: 0 }}
							control={<ThemeModeSwitch onClick={toggleDarkMode} checked={darkMode} />}
							label={t('settings.dark_mode') as string}
							labelPlacement='start' />
					</Grid>
				</Grid>
				<Box sx={{ mb: 2 }}>
					{t('settings.clear_unused.title')}:
					<Box sx={{ pl: 4 }}>
						<FormGroup>
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['passport']} onChange={() => setFilesTypes(prev => ({ ...prev, passport: !prev['passport'] }))} />} label={t('passports') as string} />
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['image']} onChange={() => setFilesTypes(prev => ({ ...prev, image: !prev['image'] }))} />} label={t('images') as string} />
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['video']} onChange={() => setFilesTypes(prev => ({ ...prev, video: !prev['video'] }))} />} label={t('videos') as string} />
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['id']} onChange={() => setFilesTypes(prev => ({ ...prev, id: !prev['id'] }))} />} label={t('ids') as string} />
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['avatar']} onChange={() => setFilesTypes(prev => ({ ...prev, avatar: !prev['avatar'] }))} />} label={t('avatars') as string} />
							<FormControlLabel control={<Checkbox size='small' checked={filesTypes['attachment']} onChange={() => setFilesTypes(prev => ({ ...prev, attachment: !prev['attachment'] }))} />} label={t('attachments') as string} />
						</FormGroup>
						<Button onClick={deleteUsedFilesCallback} size='small' variant='contained' disabled={!filesTypes['passport'] && !filesTypes['image'] && !filesTypes['video'] && !filesTypes['id'] && !filesTypes['avatar'] && !filesTypes['attachment']}>{t('settings.clear_unused.action')}</Button>
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
