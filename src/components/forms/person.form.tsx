import {
	Grid,
	TextField,
	Button,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Card,
	CardMedia,
	CardContent,
	Typography,
	CardActions,
	List,
	ListItem,
	IconButton,
	ListSubheader,
	CardActionArea,
	Autocomplete,
    createFilterOptions,
} from "@mui/material";
import {
	ExpandMore as ExpandMoreIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { createRef, useCallback, useContext, useEffect, useState } from "react";
import _ from "lodash";
import AddIconDarkSvg from '../../images/add-dark.svg';
import AddIconLightSvg from '../../images/add-light.svg';
import { appContext } from "../../App";
import { Neo4jSigmaGraph } from "../../neo4j-sigma-graph";
import { Person } from "../../models";
import { observer } from "mobx-react-lite";
import moment from "moment";

export type PersonFormProps = {
	person: Person;
	onSubmit: (e: React.FormEvent) => void;
}

export const PersonForm = observer<PersonFormProps>(({ person }) => {
	const { t } = useTranslation();
	const { theme, language } = useContext(appContext);
	const [expanded, setExpanded] = useState<'BASIC' | 'IDENTIFICATION' | 'IMPORTANT'>('BASIC');
	const [newRestriction, setNewRestriction] = useState('');
	const handleAddNewRestriction = useCallback(() => {
		if (newRestriction) {
			person.setRestrictions(_.uniq(_.concat(person.restrictions, [newRestriction])));
			setNewRestriction('')
		}
	}, [newRestriction, person, setNewRestriction])
	const handleChangeRestriction = useCallback((idx: number, newValue: string) => {
		if (!newValue) {
			handleDeleteRestriction(idx);
			return;
		}
		person.setRestrictions(person.restrictions.map((restriction, i) => idx === i ? newValue : restriction));
	}, [person]);
	const handleDeleteRestriction = useCallback((idx: number) => {
		person.setRestrictions(person.restrictions.filter((__, i) => idx !== i));
	}, [person]);
	const [newExtra, setNewExtra] = useState('');
	const handleAddNewExtra = useCallback(() => {
		if (newExtra) {
			person.setExtra(_.uniq(_.concat(person.extra, [newExtra])));
			setNewExtra('')
		}
	}, [newExtra, person, setNewExtra]);
	const handleChangeExtra = useCallback((idx: number, newValue: string) => {
		if (!newValue) {
			handleDeleteExtra(idx);
			return;
		}
		person.setExtra(person.extra.map((extra, i) => idx === i ? newValue : extra));
	}, [person]);
	const handleDeleteExtra = useCallback((idx: number) => {
		person.setExtra(person.extra.filter((__, i) => idx !== i));
	}, [person]);
	const handleAddAttachments = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			const newFiles: File[] = []
			for (let i = 0; i < e.currentTarget.files.length; i++) {
				newFiles.push(e.currentTarget.files[i]);
			}
			e.currentTarget.files = null;
			person.setAttachments(_.uniq(_.concat(person.attachments, newFiles)));
		}
	}, [person]);
	const handleDeleteAttachment = useCallback((idx: number) => {
		person.setAttachments(person.attachments.filter((__, i) => i !== idx));
	}, [person])
	const addAttachmentsInputRef = createRef<HTMLInputElement>();
	const [categories, setCategories] = useState<{ id: string, label: string }[]>([]);
	const [nationalities, setNationalities] = useState<{ id: string, label: string }[]>([]);
	useEffect(() => {
		const neo4jSigmaGraph = Neo4jSigmaGraph.getInstance();
		neo4jSigmaGraph.getNodesByLabel('CATEGORY').then((nodes: any[]) => {
			setCategories(nodes.map((node: any) => ({ id: node.properties.id, label: node.properties.name })));
		});
		neo4jSigmaGraph.getNodesByLabel('NATIONALITY').then((nodes: any[]) => {
			setNationalities(nodes.map((node: any) => ({ id: node.properties.id, label: node.properties.name })));
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const handleDateChange = (property: 'birthDate' | 'passportIssueDate') => (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.value === '') return;
		if (property === 'birthDate') {
			person.setBirthDate(moment(e.target.value).toDate());
		} else {
			person.setPassportIssueDate(moment(e.target.value).toDate());
		}
	}
	return (
		<Grid item container spacing={1}>
			<Grid item xs={12}>
				<Accordion expanded={expanded === 'BASIC'} onChange={() => setExpanded(expanded === 'BASIC' ? 'IDENTIFICATION' : 'BASIC')}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>{t("forms.sections.person.basic")}</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2}>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.file_number")}
									value={person.fileNumber}
									onChange={e => person.setFileNumber(e.target.value)}
									fullWidth
									required
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.arabic_name")}
									value={person.arabicName}
									onChange={e => person.setArabicName(e.target.value)}
									fullWidth
									dir='rtl'
									required
								/>
							</Grid>
							<Grid item xs={4}>
								<Autocomplete
									options={nationalities}
									onChange={(__, value) => person.setNationality(value?.id ?? '')}
									filterOptions={(options, params) => {
										const filter = createFilterOptions<{ id: string, label: string }>();
										const filtered = filter(options, params);
										if (params.inputValue !== '' && !_.find(options, { id: params.inputValue })) {
											filtered.push({ id: params.inputValue, label: t('forms.inputs.person.create_new_nationality', { name: params.inputValue }) });
										}
										return filtered;
									}}
									value={nationalities.find(nat => nat.id === person.nationality)}
									noOptionsText={t('forms.inputs.person.no_nationalities')}
									openOnFocus
									renderInput={params => (
										<TextField
											{...params}
											label={t("forms.inputs.person.nationality")}
											fullWidth
											required
										/>)
									} />
							</Grid>
							<Grid item xs={4}>
								<Autocomplete
									options={categories}
									onChange={(__, value) => person.setCategory(value?.id ?? '')}
									filterOptions={(options, params) => {
										const filter = createFilterOptions<{ id: string, label: string }>();
										const filtered = filter(options, params);
										if (params.inputValue !== '' && !_.find(options, { id: params.inputValue })) {
											filtered.push({ id: params.inputValue, label: t('forms.inputs.person.create_new_category', { name: params.inputValue }) });
										}
										return filtered;
									}}
									value={categories.find(cat => cat.id === person.category)}
									noOptionsText={t('forms.inputs.person.no_categories')}
									openOnFocus
									renderInput={params => (
										<TextField
											{...params}
											label={t("forms.inputs.person.category")}
											fullWidth
											required
										/>)
									} />
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.english_name")}
									value={person.englishName}
									onChange={e => person.setEnglishName(e.target.value)}
									fullWidth
									dir='ltr'
									InputLabelProps={{
										dir: (language === 'ar') ? 'rtl' : 'ltr',
									}}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.mother_name")}
									value={person.motherName}
									onChange={e => person.setMotherName(e.target.value)}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.nickname")}
									value={person.nickname}
									onChange={e => person.setNickname(e.target.value)}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.birthdate")}
									value={moment(person.birthDate).format('YYYY-MM-DD')}
									onChange={handleDateChange('birthDate')}
									fullWidth
									type='date'
									InputLabelProps={{
										shrink: true,
									}}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.birth_place")}
									value={person.birthPlace}
									onChange={e => person.setBirthPlace((e.target.value))}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.job")}
									value={person.job}
									onChange={e => person.setJob((e.target.value))}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.phone")}
									value={person.phone}
									onChange={e => person.setPhone((e.target.value))}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.email")}
									value={person.email}
									onChange={e => person.setEmail((e.target.value))}
									fullWidth
									inputMode='email'
									dir='ltr'
									InputLabelProps={{
										dir: (language === 'ar') ? 'rtl' : 'ltr',
									}}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.workplace")}
									value={person.workplace}
									onChange={e => person.setWorkplace((e.target.value))}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.address")}
									value={person.address}
									onChange={e => person.setAddress((e.target.value))}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.gps_location")}
									value={person.gpsLocation}
									onChange={e => person.setGpsLocation((e.target.value))}
									fullWidth
									inputProps={{
										pattern: '\\d+\\.\\d+,\\s?\\d+\\.\\d+'
									}}
								/>
							</Grid>
						</Grid>
					</AccordionDetails>
				</Accordion>
			</Grid>
			<Grid item xs={12}>
				<Accordion expanded={expanded === 'IDENTIFICATION'} onChange={() => setExpanded(expanded === 'IDENTIFICATION' ? 'IMPORTANT' : 'IDENTIFICATION')}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>{t("forms.sections.person.identification")}</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2}>
							<Grid item xs={4}>
								<Card>
									<CardMedia height='400' component='img' image={person.image ? URL.createObjectURL(person.image) : ''} />
									<CardContent>
										<Typography variant='h5' gutterBottom component='div'>{t("forms.inputs.person.image")}</Typography>
									</CardContent>
									<CardActions>
										<Button component='label' variant='contained'>{t('forms.inputs.choose_file')}<input accept='image/*' hidden type='file' onChange={e => person.setImage(e.target.files ? e.target.files[0] : null)} /></Button>
									</CardActions>
								</Card>
							</Grid>
							<Grid item xs={4}>
								<Card>
									<CardMedia height='400' component='img' image={person.idImage ? URL.createObjectURL(person.idImage) : ''} />
									<CardContent>
										<Typography variant='h5' gutterBottom component='div'>{t("forms.inputs.person.id_image")}</Typography>
									</CardContent>
									<CardActions>
										<Button component='label' variant='contained'>{t('forms.inputs.choose_file')}<input accept='image/*' hidden type='file' onChange={e => person.setIdImage(e.target.files ? e.target.files[0] : null)} /></Button>
									</CardActions>
								</Card>
							</Grid>
							<Grid item xs={4}>
								<Card>
									<CardMedia height='400' component='img' image={person.passportImage ? URL.createObjectURL(person.passportImage) : ''} />
									<CardContent>
										<Typography variant='h5' gutterBottom component='div'>{t("forms.inputs.person.passport_image")}</Typography>
									</CardContent>
									<CardActions>
<Button component='label' variant='contained'>{t('forms.inputs.choose_file')}<input accept='image/*' hidden type='file' onChange={e => person.setPassportImage(e.target.files ? e.target.files[0] : null)} /></Button>
									</CardActions>
								</Card>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.passport_number")}
									value={person.passportNumber}
									onChange={e => person.setPassportNumber((e.target.value))}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.passport_issue_place")}
									value={person.passportIssuePlace}
									onChange={e => person.setPassportIssuePlace((e.target.value))}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.passport_issue_date")}
									value={moment(person.passportIssueDate).format('YYYY-MM-DD')}
									onChange={handleDateChange('passportIssueDate')}
									fullWidth
									type='date'
									InputLabelProps={{ shrink: true }}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.id_number")}
									value={person.idNumber}
									onChange={e => person.setIdNumber((e.target.value))}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.national_number")}
									value={person.nationalNumber}
									onChange={e => person.setNationalNumber((e.target.value))}
									fullWidth
									inputProps={{
										pattern: '[12](19|20)[0-9]{2}\\d{7}',
									}}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("forms.inputs.person.registeration_number")}
									value={person.registerationNumber}
									onChange={e => person.setRegisterationNumber((e.target.value))}
									fullWidth
								/>
							</Grid>
						</Grid>
					</AccordionDetails>
				</Accordion>
			</Grid>
			<Grid item xs={12}>
				<Accordion expanded={expanded === 'IMPORTANT'} onChange={() => setExpanded(expanded === 'IMPORTANT' ? 'BASIC' : 'IMPORTANT')}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>{t("forms.sections.person.important")}</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<List sx={{ bgcolor: 'background.paper' }} dense subheader={<ListSubheader>{t("forms.inputs.person.restrictions")}</ListSubheader>}>
									{person.restrictions.map((restriction, idx) => (
										<ListItem key={idx}
											secondaryAction={<IconButton edge='end' onClick={() => handleDeleteRestriction(idx)}><DeleteIcon /></IconButton>}>
											<TextField fullWidth value={restriction} onChange={e => handleChangeRestriction(idx, e.currentTarget.value)} />
										</ListItem>
									))}
									<ListItem
										secondaryAction={<IconButton edge='end' onClick={() => handleAddNewRestriction()}><AddIcon /></IconButton>}>
										<TextField fullWidth value={newRestriction} onChange={e => setNewRestriction(e.currentTarget.value)} onKeyPress={e => { if (e.key === 'Enter') { handleAddNewRestriction(); e.preventDefault(); } }} />
									</ListItem>
								</List>
							</Grid>
							<Grid item xs={12} container spacing={2}>
								{person.attachments.map((attachment, idx) => (
									<Grid item xs={4} key={idx}>
										<Card>
											<CardMedia height='400' component='img' image={URL.createObjectURL(attachment)} />
											<CardActions>
												<Button component='label' fullWidth color='error' variant='contained' onClick={() => handleDeleteAttachment(idx)}>{t('forms.inputs.delete_file')}</Button>
											</CardActions>
										</Card>
									</Grid>
								))}
								<Grid item xs={4}>
									<Card>
										<CardActionArea onClick={() => addAttachmentsInputRef.current?.click()}>
											<input ref={addAttachmentsInputRef} multiple accept='*' hidden type='file' onChange={handleAddAttachments} />
											<CardMedia height='420' component='img' image={theme.palette.mode === 'light' ? AddIconDarkSvg: AddIconLightSvg} />
											<Typography variant='h6' textAlign='center'>{t('forms.inputs.person.choose_attachments')}</Typography>
										</CardActionArea>
									</Card>
								</Grid>
							</Grid>
							<Grid item xs={12}>
								<TextField
									label={t("forms.inputs.person.notes")}
									value={person.notes}
									onChange={e => person.setNotes((e.target.value))}
									fullWidth
									multiline
									rows={5}
								/>
							</Grid>
							<Grid item xs={12}>
								<List sx={{ bgcolor: 'background.paper' }} dense subheader={<ListSubheader>{t("forms.inputs.person.extra")}</ListSubheader>}>
									{person.extra.map((extr, idx) => (
										<ListItem key={idx}
											secondaryAction={<IconButton edge='end' onClick={() => handleDeleteExtra(idx)}><DeleteIcon /></IconButton>}>
											<TextField fullWidth value={extr} onChange={e => handleChangeExtra(idx, e.currentTarget.value)} />
										</ListItem>
									))}
									<ListItem
										secondaryAction={<IconButton edge='end' onClick={() => handleAddNewExtra()}><AddIcon /></IconButton>}>
										<TextField
											fullWidth
											value={newExtra}
											onChange={e => setNewExtra(e.currentTarget.value)}
											onKeyPress={e => { if (e.key === 'Enter') { handleAddNewExtra(); e.preventDefault(); } }} />
									</ListItem>
								</List>
							</Grid>
						</Grid>
					</AccordionDetails>
				</Accordion>
			</Grid>
		</Grid>
	)
});
