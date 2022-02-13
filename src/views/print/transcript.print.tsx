import {
    Box,
    Button,
	Divider,
	Grid,
    Skeleton,
    TextField,
    Theme,
} from "@mui/material"
import { makeStyles } from "@mui/styles";
import { useState, useEffect, useContext, createRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { appContext } from "../../App";
import { Transcript } from "../../models"
import { Neo4jSigmaGraph } from "../../neo4j-sigma-graph";
import { Repository } from "../../types";
import {
	Print as PrintIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import { TranscriptDetails } from "../details";

const useStyles = makeStyles<Theme>(theme => ({
	box: {
		backgroundColor: "#fff",
		color: "#000",
		overflow: "auto",
		height: "100%",
	},
	container: {
		border: "5px double black",
	},
	buttonIcon: {
		margin: "0 !important",
		marginRight: theme.direction === 'ltr' ? "0" : `${theme.spacing(1)} !important`,
	},
	dividerRoot: {
		'&::before, &::after': {
			borderTop: "3px solid #000 !important",
		}
	},
	skeleton: {
		width: '150px',
		height: '150px',
		[theme.breakpoints.down('sm')]: {
			width: '50px',
			height: '50px',
		},
	},
	noBorderOnPrint: {
		'@media print': {
			'& fieldset': {
				border: 'none',
			},
		},
	},
}));

export const TranscriptPrint = () => {
	const { t } = useTranslation();
	const [headerImage, setHeaderImage] = useState<File | null>(null);
	const [darkModeWasDefault, setDarkModeWasDefault] = useState(false);
	useEffect(() => {
		if (darkMode) {
			setDarkModeWasDefault(true);
			toggleDarkMode();
		}
	}, []);
	const { theme, language, darkMode, toggleDarkMode } = useContext(appContext);
	const [transcript, setTranscript] = useState<Transcript | null>(null)
	const [loading, setLoading] = useState(true);
	const { id } = useParams();
	const navigate = useNavigate();
	const classes = useStyles();
	const fetchPerson = async () => {
		const repo: Repository<Transcript, string> = Neo4jSigmaGraph.getInstance().getRepository('TRANSCRIPT');
		if (repo) {
			try {
				repo.readById(id).then(setTranscript);
			} catch (error) {
				console.error(error);
			}
		}
		setLoading(false)
	}
	const handlePrint = async () => {
		await window.electron.print(`${t('forms.print.transcript')} - ${transcript.title}`);
		handleClose();
	}
	const handleClose = () => {
		navigate("/list");
		if (darkModeWasDefault) toggleDarkMode();
	}
	const inputRef = createRef<HTMLInputElement>();
	const [leftSideText, setLeftSideText] = useState('');
	const [rightSideText, setRightSideText] = useState('');
	useEffect(() => {
		setLeftSideText(localStorage.getItem('leftSideText') || '');
		setRightSideText(localStorage.getItem('rightSideText') || '');
	}, []);
	useEffect(() => {
		localStorage.setItem('leftSideText', leftSideText);
		localStorage.setItem('rightSideText', rightSideText);
	}, [leftSideText, rightSideText]);
	useEffect(() => {
		if (headerImage) {
			const openRequest = indexedDB.open('headerImage', 1);
			openRequest.onupgradeneeded = () => {
				const db = openRequest.result;
				!db.objectStoreNames.contains('headerImage') && db.createObjectStore('headerImage');
			}
			openRequest.onsuccess = () => {
				const db = openRequest.result;
				const transaction = db.transaction(['headerImage'], 'readwrite');
				const store = transaction.objectStore('headerImage');
				store.put(headerImage, 'headerImage');
			}
			openRequest.onerror = () => {
				console.error(openRequest.error);
			}
		}
	}, [headerImage]);
	useEffect(() => {
		const openRequest = indexedDB.open('headerImage', 1);
		openRequest.onsuccess = () => {
			const db = openRequest.result;
			const transaction = db.transaction(['headerImage'], 'readwrite');
			const store = transaction.objectStore('headerImage');
			const getRequest = store.get('headerImage');
			getRequest.onsuccess = () => {
				if (getRequest.result) {
					setHeaderImage(getRequest.result);
				}
			}
		}
	}, []);
	useEffect(() => {
		fetchPerson();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	if (loading) return <div>Loading...</div>
	if (!transcript) return null;
	return (
		<Box className={classes.box}>
			<Grid container px={2} className={classes.container}>
				<Grid item xs={12} mb={2}>
					<Box sx={{ height: { xs: '175px', [theme.breakpoints.down('sm')]: '50px' } }}>
						<Grid container spacing={2} sx={{ height: { xs: '175px', [theme.breakpoints.down('sm')]: '50px' } }} justifyContent='space-between' alignItems='center'>
							<Grid item xs={4}>
								<TextField
									className={classes.noBorderOnPrint}
									dir={language === 'ar' ? 'rtl' : 'ltr' }
									rows={3}
									fullWidth
									multiline
									value={leftSideText}
									onChange={(e) => setLeftSideText(e.target.value)}
									/>
							</Grid>
							<Grid item xs='auto' container justifyContent='center' sx={{ cursor: 'pointer', height: { xs: '150px', [theme.breakpoints.down('sm')]: '50px' } }}>
								{headerImage && <Box sx={{ height: { xs: '150px', [theme.breakpoints.down('sm')]: '50px' }, width: { xs: '150px', [theme.breakpoints.down('sm')]: '50px' } }} component='img' src={URL.createObjectURL(headerImage)} onClick={() => inputRef.current.click()} />}
								{!headerImage && <Skeleton sx={{ height: { xs: '150px', [theme.breakpoints.down('sm')]: '50px' }, width: { xs: '150px', [theme.breakpoints.down('sm')]: '50px' } }} variant='rectangular' onClick={() => inputRef.current.click()} />}
								<input ref={inputRef} type='file' hidden accept="image/*" onChange={e => setHeaderImage(e.target.files ? e.target.files[0] : null)} />
							</Grid>
							<Grid item xs={4}>
								<TextField
									className={classes.noBorderOnPrint}
									dir={language === 'en' ? 'rtl' : 'ltr' }
									rows={3}
									fullWidth
									multiline
									value={rightSideText}
									onChange={(e) => setRightSideText(e.target.value)}
									/>
							</Grid>
						</Grid>
					</Box>
					<Divider classes={{ root: classes.dividerRoot }}>{t('forms.print.transcript')}</Divider>
				</Grid>
				<TranscriptDetails transcript={transcript} onMentionedClick={() => {}} print />
				<Grid item xs={12} sx={{ direction: language === 'ar' ? 'ltr' : 'ltr', displayPrint: 'none', my: 1 }} justifyContent='flex-end'>
					<Button classes={{ endIcon: classes.buttonIcon }} endIcon={<CloseIcon />} color='inherit' variant='outlined' sx={{ mx: 1 }} onClick={handleClose}>{t('cancel')}</Button>
					<Button classes={{ endIcon: classes.buttonIcon }} variant='contained' endIcon={<PrintIcon />} onClick={handlePrint}>{t('print')}</Button>
				</Grid>
			</Grid>
		</Box>
	)
}
