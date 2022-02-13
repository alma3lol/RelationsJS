import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Paper, TextField, Tooltip } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Nationality } from "../models";
import { Neo4jSigmaGraph } from "../neo4j-sigma-graph";
import {
	Edit as EditIcon,
	Done as DoneIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import { appContext } from "../App";

export type NationalitiesProps = {
	open: boolean;
	onClose: () => void;
	onDone: () => void;
}

export const NationalityRow = observer(({ nationality, onUpdate }: { nationality: Nationality, onUpdate: () => void }) => {
	const { t } = useTranslation();
	const [edit, setEdit] = useState(false);
	const handleOnEditingSwitch = async () => {
		setEdit(!edit);
		if (!edit || nationality.name === '') return;
		try {
			const repo = Neo4jSigmaGraph.getInstance().getRepository('NATIONALITY');
			if (repo) {
				await repo.update(nationality.id, nationality);
				onUpdate();
			}
		} catch (e) {
			console.error(e);
		}
	}
	const handleOnEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			await handleOnEditingSwitch();
		}
	}
	return (
		<Grid item xs={12} key={nationality.id}>
			<TextField
				variant={edit ? 'outlined' : 'filled' }
				value={nationality.name}
				onChange={e => nationality.setName(e.target.value)}
				onKeyDown={handleOnEnter} label={t('forms.inputs.nationality.name')}
				fullWidth
				InputProps={{ readOnly: !edit, endAdornment: <InputAdornment position='end'>
						<Tooltip title={t('edit')}>
							<IconButton size='small' onClick={handleOnEditingSwitch}>
								{!edit && <EditIcon />}
								{edit && <DoneIcon />}
							</IconButton>
						</Tooltip>
					</InputAdornment>
				}} />
		</Grid>
	)
})

export const Nationalities = observer<NationalitiesProps>(({ open, onClose, onDone }) => {
	const { language } = useContext(appContext);
	const { t } = useTranslation();
	const [nationalities, setNationalities] = useState<Nationality[]>([]);
	const { enqueueSnackbar } = useSnackbar();
	useEffect(() => {
		const fetchData = async () => {
			try {
				const repo = Neo4jSigmaGraph.getInstance().getRepository('NATIONALITY');
				if (repo) {
					const categories = await repo.read();
					setNationalities(categories);
				}
			} catch (err) {
				console.error(err);
				enqueueSnackbar(err.message, { variant: 'error' });
			}
		}
		fetchData();
	}, []);
	const [newNationality, setNewNationality] = useState('');
	const handleAddNewCategory = async () => {
		if (newNationality === '') return;
		const nationality = new Nationality();
		nationality.setName(newNationality);
		try {
			const repo = Neo4jSigmaGraph.getInstance().getRepository('NATIONALITY');
			if (repo) {
				await repo.create(nationality);
				setNationalities([...nationalities, nationality]);
				setNewNationality('');
				onDone();
			}
		} catch (err) {
			console.error(err);
			enqueueSnackbar(err.message, { variant: 'error' });
		}
	}
	const handleOnEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			await handleAddNewCategory();
		}
	}
	return (
		<Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
			<DialogTitle>{t('forms.titles.categories')}</DialogTitle>
			<DialogContent>
				<Paper elevation={3} sx={{ p: 2 }}>
					<Grid container spacing={2}>
						{nationalities.map(nationality => <NationalityRow key={nationality.id} nationality={nationality} onUpdate={onDone} />)}
						<Grid item xs={12}>
							<TextField
								value={newNationality}
								onChange={e => setNewNationality(e.target.value)}
								onKeyDown={handleOnEnter}
								label={t('forms.inputs.nationality.name')}
								InputProps={{
									endAdornment: <InputAdornment position='end'>
										<Tooltip title={t('add')}>
											<IconButton size='small' onClick={handleAddNewCategory}>
												<AddIcon />
											</IconButton>
										</Tooltip>
									</InputAdornment>
								}}
								fullWidth />
						</Grid>
					</Grid>
				</Paper>
			</DialogContent>
			<DialogActions sx={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
				<Button onClick={onClose} color='inherit'>{t('close')}</Button>
			</DialogActions>
		</Dialog>
	);
});
