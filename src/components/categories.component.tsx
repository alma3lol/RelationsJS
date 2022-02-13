import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Paper, TextField, Tooltip } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Category } from "../models";
import { Neo4jSigmaGraph } from "../neo4j-sigma-graph";
import {
	Edit as EditIcon,
	Done as DoneIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import { appContext } from "../App";

export type CategoriesProps = {
	open: boolean;
	onClose: () => void;
	onDone: () => void;
}

export const CategoryRow = observer(({ category, onUpdate }: { category: Category, onUpdate: () => void }) => {
	const { t } = useTranslation();
	const [edit, setEdit] = useState(false);
	const handleOnEditingSwitch = async () => {
		setEdit(!edit);
		if (!edit || category.name === '') return;
		try {
			const repo = Neo4jSigmaGraph.getInstance().getRepository('CATEGORY');
			if (repo) {
				await repo.update(category.id, category);
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
		<Grid item xs={12} key={category.id}>
			<TextField
				variant={edit ? 'outlined' : 'filled' }
				value={category.name}
				onChange={e => category.setName(e.target.value)}
				onKeyDown={handleOnEnter} label={t('forms.inputs.category.name')}
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

export const Categories = observer<CategoriesProps>(({ open, onClose, onDone }) => {
	const { language } = useContext(appContext);
	const { t } = useTranslation();
	const [categories, setCategories] = useState<Category[]>([]);
	const { enqueueSnackbar } = useSnackbar();
	useEffect(() => {
		const fetchData = async () => {
			try {
				const repo = Neo4jSigmaGraph.getInstance().getRepository('CATEGORY');
				if (repo) {
					const categories = await repo.read();
					setCategories(categories);
				}
			} catch (err) {
				console.error(err);
				enqueueSnackbar(err.message, { variant: 'error' });
			}
		}
		fetchData();
	}, []);
	const [newCategory, setNewCategory] = useState('');
	const handleAddNewCategory = async () => {
		if (newCategory === '') return;
		const category = new Category();
		category.setName(newCategory);
		try {
			const repo = Neo4jSigmaGraph.getInstance().getRepository('CATEGORY');
			if (repo) {
				await repo.create(category);
				setCategories([...categories, category]);
				setNewCategory('');
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
						{categories.map(category => <CategoryRow key={category.id} category={category} onUpdate={onDone} />)}
						<Grid item xs={12}>
							<TextField
								value={newCategory}
								onChange={e => setNewCategory(e.target.value)}
								onKeyDown={handleOnEnter}
								label={t('forms.inputs.category.name')}
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
