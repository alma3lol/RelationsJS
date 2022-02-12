import { AppBar, Card, CardContent, CardMedia, Grid, IconButton, MenuItem, Paper, Theme, Toolbar, Typography, Select, TextField, InputLabel, FormControl, OutlinedInput, CardActionArea, Tooltip } from "@mui/material";
import { DefaultTheme, makeStyles } from "@mui/styles";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Category, Nationality, Person, Transcript } from "../models";
import { Neo4jSigmaGraph } from "../neo4j-sigma-graph";
import {
	Settings as SettingsIcon,
	Add as AddIcon,
	SavedSearch as SavedSearchIcon,
} from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { appContext } from "../App";
import { AddNode, QuickFind, Settings } from "../components";
import { PersonView } from "./person.view";
import PersonSvgIcon from '../images/person.svg';
import PersonLightSvgIcon from '../images/person-light.svg';

const useStyles = makeStyles<DefaultTheme, Theme, string>({
	appBar: {
		direction: "ltr",
	},
	paper: {
		height: (theme) => `calc(100% - ${theme.spacing(20)} - ${theme.mixins.toolbar.minHeight}px) !important`,
		overflow: "auto",
		"&::-webkit-scrollbar": {
			width: "0 !important",
		},
	},
});

export const ListView = () => {
	const { t } = useTranslation();
	const { language, theme, darkMode } = useContext(appContext);
	const classes = useStyles(theme);
	const [people, setPeople] = useState<Person[]>([]);
	const fetchPeople = async () => {
		try {
			const repo = Neo4jSigmaGraph.getInstance().getRepository('PERSON');
			if (repo) {
				const persons = await repo.read();
				setPeople(persons);
			}
		} catch (error) {
			console.error(error);
		}
	};
	useEffect(() => {
		fetchPeople();
	}, []);
	const navigate = useNavigate();
	useHotkeys('Control+Tab', () => {
		navigate('/');
	});
	const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
	const [search, setSearch] = useState<string>('');
	useEffect(() => {
		setFilteredPeople(people.filter(person => person.arabicName.toLowerCase().includes(search.toLowerCase())));
	}, [search, people]);
	const [showSettings, setShowSettings] = useState(false);
	const [showAddNode, setShowAddNode] = useState(false);
	const [quickFind, setQuickFind] = useState(false);
	useHotkeys('Control+f', () => setQuickFind(true));
	useHotkeys('Escape', () => {
		setShowAddNode(false);
		setShowSettings(false);
		setQuickFind(false);
		setViewedPerson(null);
	}, true);
	useHotkeys('Control+n', e => {
		e.preventDefault();
		setShowAddNode(true);
		setShowSettings(false);
		setQuickFind(false);
	});
	useHotkeys('Control+s', () => {
		setShowAddNode(false);
		setShowSettings(true);
		setQuickFind(false);
	});
	const handleQuickFindResult = (nodes: (Person | Category | Transcript | Nationality)[]) => {
		setPeople(nodes.filter(node => node instanceof Person) as Person[]);
	}
	type PersonSortKeys = 'arabicName' | 'englishName' | 'motherName' | 'nickname' | 'job' | 'address' | 'birthDate' | 'birthPlace' | 'workplace' | 'phone' | 'email' | 'gpsLocation' | 'passportNumber' | 'nationalNumber' | 'idNumber' | 'registerationNumber' | 'category' | 'nationality';
	type SortKeys = PersonSortKeys;
	const [sortBy, setSortBy] = useState<SortKeys>('arabicName');
	const sortKeysFunctions: { [k in SortKeys]: (node1: Person, node2: Person) => number } = {
		arabicName: (node1, node2) => node1.arabicName.localeCompare(node2.arabicName),
		englishName: (node1, node2) => {
			if (node1.englishName && node2.englishName) {
				return node1.englishName.localeCompare(node2.englishName);
			}
			return 0;
		},
		motherName: (node1, node2) => {
			if (node1.motherName && node2.motherName) {
				return node1.motherName.localeCompare(node2.motherName);
			}
			return 0;
		},
		nickname: (node1, node2) => {
			if (node1.nickname && node2.nickname) {
				return node1.nickname.localeCompare(node2.nickname);
			}
			return 0;
		},
		job: (node1, node2) => {
			if (node1.job && node2.job) {
				return node1.job.localeCompare(node2.job);
			}
			return 0;
		},
		address: (node1, node2) => {
			if (node1.address && node2.address) {
				return node1.address.localeCompare(node2.address);
			}
			return 0;
		},
		birthDate: (node1, node2) => {
			if (node1.birthDate && node2.birthDate) {
				return node1.birthDate.getTime() - node2.birthDate.getTime();
			}
			return 0;
		},
		birthPlace: (node1, node2) => {
			if (node1.birthPlace && node2.birthPlace) {
				return node1.birthPlace.localeCompare(node2.birthPlace);
			}
			return 0;
		},
		workplace: (node1, node2) => {
			if (node1.workplace && node2.workplace) {
				return node1.workplace.localeCompare(node2.workplace);
			}
			return 0;
		},
		phone: (node1, node2) => {
			if (node1.phone && node2.phone) {
				return node1.phone.localeCompare(node2.phone);
			}
			return 0;
		},
		email: (node1, node2) => {
			if (node1.email && node2.email) {
				return node1.email.localeCompare(node2.email);
			}
			return 0;
		},
		gpsLocation: (node1, node2) => {
			if (node1.gpsLocation && node2.gpsLocation) {
				return node1.gpsLocation.localeCompare(node2.gpsLocation);
			}
			return 0;
		},
		passportNumber: (node1, node2) => {
			if (node1.passportNumber && node2.passportNumber) {
				return node1.passportNumber.localeCompare(node2.passportNumber);
			}
			return 0;
		},
		nationalNumber: (node1, node2) => {
			if (node1.nationalNumber && node2.nationalNumber) {
				return node1.nationalNumber.localeCompare(node2.nationalNumber);
			}
			return 0;
		},
		idNumber: (node1, node2) => {
			if (node1.idNumber && node2.idNumber) {
				return node1.idNumber.localeCompare(node2.idNumber);
			}
			return 0;
		},
		registerationNumber: (node1, node2) => {
			if (node1.registerationNumber && node2.registerationNumber) {
				return node1.registerationNumber.localeCompare(node2.registerationNumber);
			}
			return 0;
		},
		category: (node1, node2) => node1.category.label.localeCompare(node2.category.label),
		nationality: (node1, node2) => {
			if (node1.nationality && node2.nationality) {
				return node1.nationality.label.localeCompare(node2.nationality.label);
			}
			return 0;
		},
	}
	type OrderBy = 'ASC' | 'DESC';
	const [orderBy, setOrderBy] = useState<OrderBy>('ASC');
	filteredPeople.sort(sortKeysFunctions[sortBy]);
	if (orderBy === 'DESC') filteredPeople.reverse();
	const sortKeysWithLabels: { [k in SortKeys]: string } = {
		arabicName: t('forms.inputs.person.arabic_name'),
		englishName: t('forms.inputs.person.english_name'),
		motherName: t('forms.inputs.person.mother_name'),
		nickname: t('forms.inputs.person.nickname'),
		job: t('forms.inputs.person.job'),
		address: t('forms.inputs.person.address'),
		birthDate: t('forms.inputs.person.birthdate'),
		birthPlace: t('forms.inputs.person.birth_place'),
		workplace: t('forms.inputs.person.workplace'),
		phone: t('forms.inputs.person.phone'),
		email: t('forms.inputs.person.email'),
		gpsLocation: t('forms.inputs.person.gps_location'),
		passportNumber: t('forms.inputs.person.passport_number'),
		nationalNumber: t('forms.inputs.person.national_number'),
		idNumber: t('forms.inputs.person.id_number'),
		registerationNumber: t('forms.inputs.person.registeration_number'),
		category: t('forms.inputs.person.category'),
		nationality: t('forms.inputs.person.nationality'),
	}
	const [viewedPerson, setViewedPerson] = useState<Person | null>(null);
	return (
		<>
			<AppBar position="static" enableColorOnDark className={classes.appBar} color='primary'>
				<Toolbar>
					<Grid container justifyContent='space-between'>
						<Grid item>
							<Tooltip title={t('settings.title')}>
								<IconButton edge={language === 'ar' ? 'end' : 'start'} color="inherit" aria-label="settings" onClick={() => setShowSettings(true)}>
									<SettingsIcon />
								</IconButton>
							</Tooltip>
						</Grid>
						<Grid item>
							<Tooltip title={t('quick_find.title')}>
								<IconButton color="inherit" aria-label="menu" onClick={() => setQuickFind(true)}>
									<SavedSearchIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title={t('forms.add_node.title')}>
								<IconButton color="inherit" aria-label="menu" onClick={() => setShowAddNode(true)}>
									<AddIcon />
								</IconButton>
							</Tooltip>
						</Grid>
					</Grid>
				</Toolbar>
			</AppBar>
			<Paper sx={{ p: 2, m: 2 }} elevation={3}>
				<Grid container spacing={2}>
					<Grid item xs={6}>
						<TextField
							placeholder={t('search.find')}
							fullWidth
							inputProps={{ 'aria-label': 'search' }}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</Grid>
					<Grid item xs={3}>
						<FormControl fullWidth>
							<InputLabel id="sortBy" shrink>{t('forms.sortBy')}</InputLabel>
							<Select value={sortBy} onChange={e => setSortBy((e.target.value) as SortKeys)} input={<OutlinedInput label={t('forms.sortBy')} id='sortBy' />}>
								{Object.keys(sortKeysWithLabels).map(key => (
									<MenuItem key={key} value={key as SortKeys}>{sortKeysWithLabels[key]}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={3}>
						<FormControl fullWidth>
							<InputLabel id="orderBy" shrink>{t('forms.orderBy')}</InputLabel>
							<Select value={orderBy} onChange={e => setOrderBy((e.target.value) as OrderBy)} input={<OutlinedInput label={t('forms.orderBy')} id='orderBy' />}>
								<MenuItem value={'ASC'}>{t('forms.ascendingOrder')}</MenuItem>
								<MenuItem value={'DESC'}>{t('forms.descendingOrder')}</MenuItem>
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</Paper>
			<Paper sx={{ p: 2, m: 2 }} elevation={3} className={classes.paper}>
				<Grid container spacing={2}>
					{filteredPeople.map(person => (
						<Grid item xs={3} sm={3} md={3} key={person.id}>
							<Card>
								<CardActionArea onClick={() => setViewedPerson(person)}>
									<CardContent>
										<CardMedia height='400' component='img' sx={{ mb: 1 }} image={person.image ? URL.createObjectURL(person.image) : darkMode ? PersonSvgIcon : PersonLightSvgIcon} />
										<Typography color="textSecondary">{person.arabicName}</Typography>
									</CardContent>
								</CardActionArea>
							</Card>
						</Grid>
					))}
				</Grid>
			</Paper>
			<Settings show={showSettings} close={() => setShowSettings(false)} onDone={() => setShowSettings(false)} />
			<AddNode show={showAddNode} onDone={fetchPeople} close={() => setShowAddNode(false)} />
			<QuickFind show={quickFind} onClose={() => setQuickFind(false)} onDone={handleQuickFindResult} />
			{viewedPerson && <PersonView show={viewedPerson !== null} person={viewedPerson} onClose={() => setViewedPerson(null)} />}
		</>
	);
};
