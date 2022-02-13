import {
	AppBar,
	Card,
	CardContent,
	CardMedia,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Theme,
	Toolbar,
	Typography,
	Select,
	TextField,
	InputLabel,
	FormControl,
	OutlinedInput,
	CardActionArea,
	Tooltip,
	CardActions,
    Collapse,
    FormGroup,
	FormControlLabel,
	Checkbox,
} from "@mui/material";
import { DefaultTheme, makeStyles } from "@mui/styles";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Person, Transcript } from "../models";
import { Neo4jSigmaGraph } from "../neo4j-sigma-graph";
import {
	Settings as SettingsIcon,
	Add as AddIcon,
	Print as PrintIcon,
	Edit as EditIcon,
	ExpandMore as ExpandMoreIcon,
	LocalOffer as LocalOfferIcon,
	Flag as FlagIcon,
} from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { appContext } from "../App";
import { AddNode, Categories, Nationalities, Settings } from "../components";
import { PersonView } from "./person.view";
import PersonSvgIcon from '../images/person.svg';
import PersonLightSvgIcon from '../images/person-light.svg';
import { ArticleDark, ArticleLight } from "../images";
import { TranscriptView } from "./transcript.view";

const useStyles = makeStyles<DefaultTheme, Theme, string>({
	appBar: {
		direction: "ltr",
	},
	paper: {
		transition: theme => `${theme.transitions.create(["height"], {
			duration: theme.transitions.duration.standard,
			easing: theme.transitions.easing.easeInOut,
		})} !important`,
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
	const [transcripts, setTranscripts] = useState<Transcript[]>([]);
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
	}
	const fetchTranscripts = async () => {
		try {
			const repo = Neo4jSigmaGraph.getInstance().getRepository('TRANSCRIPT');
			if (repo) {
				const transcripts = await repo.read();
				setTranscripts(transcripts);
			}
		} catch (error) {
			console.error(error);
		}
	}
	useEffect(() => {
		fetchPeople();
		fetchTranscripts();
	}, []);
	const navigate = useNavigate();
	useHotkeys('Control+Tab', () => {
		navigate('/');
	});
	const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
	const [filteredTranscripts, setFilteredTranscripts] = useState<Transcript[]>([]);
	const [search, setSearch] = useState<string>('');
	useEffect(() => {
		setFilteredPeople(people.filter(person => {
			let result = false;
			if (
				person.arabicName.toLowerCase().includes(search.toLowerCase()) ||
				person.englishName.toLowerCase().includes(search.toLowerCase()) ||
				person.motherName.toLowerCase().includes(search.toLowerCase()) ||
				person.nickname.toLowerCase().includes(search.toLowerCase()) ||
				person.category.label.toLowerCase().includes(search.toLowerCase()) ||
				person.nationality.label.toLowerCase().includes(search.toLowerCase()) ||
				person.job.toLowerCase().includes(search.toLowerCase()) ||
				person.email.toLowerCase().includes(search.toLowerCase()) ||
				person.phone.toLowerCase().includes(search.toLowerCase()) ||
				person.notes.toLowerCase().includes(search.toLowerCase()) ||
				person.address.toLowerCase().includes(search.toLowerCase()) ||
				person.gpsLocation.toLowerCase().includes(search.toLowerCase()) ||
				person.fileNumber.toLowerCase().includes(search.toLowerCase()) ||
				person.workplace.toLowerCase().includes(search.toLowerCase()) ||
				person.idNumber.toLowerCase().includes(search.toLowerCase()) ||
				person.passportNumber.toLowerCase().includes(search.toLowerCase()) ||
				person.passportIssuePlace.toLowerCase().includes(search.toLowerCase()) ||
				person.birthPlace.toLowerCase().includes(search.toLowerCase()) ||
				person.nationalNumber.toLowerCase().includes(search.toLowerCase())
			) result = true;
			person.extra.forEach(extra => {
				if (extra.toLowerCase().includes(search.toLowerCase())) result = true;
			});
			person.restrictions.forEach(restriction => {
				if (restriction.toLowerCase().includes(search.toLowerCase())) result = true;
			});
			return result;
		}));
		setFilteredTranscripts(transcripts.filter(transcript => {
			let result = false;
			if (
				transcript.title.toLowerCase().includes(search.toLowerCase()) ||
				transcript.content.toLowerCase().includes(search.toLowerCase())
			) result = true;
			transcript.mentioned.forEach(mentioned => {
				if (mentioned.label.toLowerCase().includes(search.toLowerCase())) result = true;
			});
			return result;
		}));
	}, [search, people, transcripts]);
	const [showSettings, setShowSettings] = useState(false);
	const [showAddNode, setShowAddNode] = useState(false);
	useHotkeys('Escape', () => {
		setShowAddNode(false);
		setShowSettings(false);
		setViewedPerson(null);
		setViewedTranscript(null);
	}, true);
	useHotkeys(['Control+n', 'Control+ى'], e => {
		e.preventDefault();
		setShowAddNode(true);
		setShowSettings(false);
	});
	useHotkeys(['Control+s', 'Control+س'], () => {
		setShowAddNode(false);
		setShowSettings(true);
	});
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
	const [viewedTranscript, setViewedTranscript] = useState<Transcript | null>(null);
	const handleOnMentionedClick = (id: string) => {
		const person = people.find(p => p.id === id);
		if (person) {
			setViewedPerson(person);
		}
	}
	const [showAdvacedFiltering, setShowAdvacedFiltering] = useState(false);
	const [showPeople, setShowPeople] = useState(true);
	const [showTranscripts, setShowTranscripts] = useState(true);
	const [showNationalities, setShowNationalities] = useState(false);
	const [showCategories, setShowCategories] = useState(false);
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
							<Tooltip title={t('forms.titles.nationalities')}>
								<IconButton color="inherit" aria-label="menu" onClick={() => setShowNationalities(true)}>
									<FlagIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title={t('forms.titles.categories')}>
								<IconButton color="inherit" aria-label="menu" onClick={() => setShowCategories(true)}>
									<LocalOfferIcon />
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
					<Grid item xs={3} container spacing={2}>
						<Grid item xs={10}>
							<FormControl fullWidth>
								<InputLabel id="orderBy" shrink>{t('forms.orderBy')}</InputLabel>
								<Select value={orderBy} onChange={e => setOrderBy((e.target.value) as OrderBy)} input={<OutlinedInput label={t('forms.orderBy')} id='orderBy' />}>
									<MenuItem value={'ASC'}>{t('forms.ascendingOrder')}</MenuItem>
									<MenuItem value={'DESC'}>{t('forms.descendingOrder')}</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs='auto' mt={1}>
							<Tooltip title={t('forms.advanced')}>
								<IconButton onClick={() => setShowAdvacedFiltering(!showAdvacedFiltering)}>
									<ExpandMoreIcon sx={{ transform: showAdvacedFiltering ? 'rotate(180deg)' : 'rotate(0deg)', transition: theme.transitions.create('transform', { duration: theme.transitions.duration.shortest }) }} />
								</IconButton>
							</Tooltip>
						</Grid>
					</Grid>
<Grid item xs={12} sx={{ pt: '0px !important' }}>
						<Collapse in={showAdvacedFiltering}>
<FormGroup row sx={{ mt: 2 }}>
								<FormControlLabel control={<Checkbox checked={showPeople} onChange={e => setShowPeople(e.target.checked)} />} label={t('forms.showPeople') as string} />
								<FormControlLabel control={<Checkbox checked={showTranscripts} onChange={e => setShowTranscripts(e.target.checked)} />} label={t('forms.showTranscripts') as string} />
							</FormGroup>
						</Collapse>
					</Grid>
				</Grid>
			</Paper>
			<Paper sx={{ p: 2, m: 2, height: `calc(100% - ${theme.spacing(20 + (showAdvacedFiltering ? 8 : 0))} - ${theme.mixins.toolbar.minHeight}px) !important`, }} elevation={3} className={classes.paper}>
				<Grid container spacing={2}>
					{showPeople && filteredPeople.map(person => (
						<Grid item xs={3} sm={3} md={3} key={person.id}>
							<Card>
								<CardActionArea onClick={() => setViewedPerson(person)}>
									<CardMedia height='400' component='img' sx={{ mb: 1 }} image={person.image ? URL.createObjectURL(person.image) : darkMode ? PersonSvgIcon : PersonLightSvgIcon} />
									<CardContent>
										<Typography noWrap variant='h5'>{person.arabicName}</Typography>
										<Typography variant='caption' component='i'>{person.category.label}</Typography>
									</CardContent>
								</CardActionArea>
								<CardActions>
									<Tooltip title={t('edit')}><IconButton onClick={() => navigate(`/edit/person/${person.id}`)}><EditIcon /></IconButton></Tooltip>
									<Tooltip title={t('print')}><IconButton onClick={() => navigate(`/print/person/${person.id}`)}><PrintIcon /></IconButton></Tooltip>
								</CardActions>
							</Card>
						</Grid>
					))}
					{showTranscripts && filteredTranscripts.map(transcript => (
						<Grid item xs={3} sm={3} md={3} key={transcript.id}>
							<Card>
								<CardActionArea onClick={() => setViewedTranscript(transcript)}>
									<CardMedia height='400' component='img' sx={{ mb: 1 }} image={darkMode ? ArticleLight : ArticleDark} />
									<CardContent>
										<Typography noWrap variant='h5'>{transcript.title}</Typography>
										<Typography noWrap variant='caption' component='i'>{transcript.content}</Typography>
									</CardContent>
								</CardActionArea>
								<CardActions>
									<Tooltip title={t('edit')}><IconButton onClick={() => navigate(`/edit/transcript/${transcript.id}`)}><EditIcon /></IconButton></Tooltip>
									<Tooltip title={t('print')}><IconButton onClick={() => navigate(`/print/transcript/${transcript.id}`)}><PrintIcon /></IconButton></Tooltip>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			</Paper>
			<Settings show={showSettings} close={() => setShowSettings(false)} onDone={() => setShowSettings(false)} />
			<AddNode show={showAddNode} onDone={fetchPeople} close={() => setShowAddNode(false)} />
			<Categories onDone={fetchPeople} open={showCategories} onClose={() => setShowCategories(false)} />
			<Nationalities onDone={fetchPeople} open={showNationalities} onClose={() => setShowNationalities(false)} />
			{viewedPerson && <PersonView show={viewedPerson !== null} person={viewedPerson} onClose={() => setViewedPerson(null)} />}
			{viewedTranscript && <TranscriptView show={viewedTranscript !== null} transcript={viewedTranscript} onClose={() => setViewedTranscript(null)} onMentionedClick={handleOnMentionedClick} />}
		</>
	);
};
