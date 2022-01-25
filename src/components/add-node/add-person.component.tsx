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

export type AddPersonProps = {
	onFileNumberChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	fileNumber: string;
	onArabicNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	arabicName: string;
	onEnglishNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	englishName: string;
	onMotherNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	motherName: string;
	onNicknameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	nickname: string;
	onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	image: File | null;
	onIdImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	idImage: File | null;
	onPassportImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	passportImage: File | null;
	onBirthDateChange: (birthdate: Date | null) => void;
	birthDate: Date | null;
	onBirthPlaceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	birthPlace: string;
	onPassportNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	passportNumber: string;
	onPassportIssuePlaceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	passportIssuePlace: string;
	onPassportIssueDateChange: (passportIssueDate: Date | null) => void;
	passportIssueDate: Date | null;
	onJobChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	job: string;
	onIdNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	idNumber: string;
	onNationalNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	nationalNumber: string;
	onRegisterationNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	registerationNumber: string;
	onNationalityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	nationality: string;
	onAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	address: string;
	onGpsLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	gpsLocation: string;
	onWorkplaceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	workplace: string;
	onAttachmentsChange: (attachments: File[]) => void;
	attachments: File[];
	onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	phone: string;
	onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	email: string;
	onRestrictionsChange: (restrictions: string[]) => void;
	restrictions: string[];
	onCategoryChange: (category: string) => void;
	category: string;
	onNotesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	notes: string;
	onExtraChange: (extra: string[]) => void;
	extra: string[];
}

export const AddPerson: React.FC<AddPersonProps> = ({
	onFileNumberChange,
	fileNumber,
	onArabicNameChange,
	arabicName,
	onEnglishNameChange,
	englishName,
	onMotherNameChange,
	motherName,
	onNicknameChange,
	nickname,
	onImageChange,
	image,
	onIdImageChange,
	idImage,
	onPassportImageChange,
	passportImage,
	onBirthDateChange,
	birthDate,
	onBirthPlaceChange,
	birthPlace,
	onPassportNumberChange,
	passportNumber,
	onPassportIssuePlaceChange,
	passportIssuePlace,
	onPassportIssueDateChange,
	passportIssueDate,
	onJobChange,
	job,
	onIdNumberChange,
	idNumber,
	onNationalNumberChange,
	nationalNumber,
	onRegisterationNumberChange,
	registerationNumber,
	onNationalityChange,
	nationality,
	onAddressChange,
	address,
	onGpsLocationChange,
	gpsLocation,
	onWorkplaceChange,
	workplace,
	onAttachmentsChange,
	attachments,
	onPhoneChange,
	phone,
	onEmailChange,
	email,
	onRestrictionsChange,
	restrictions,
	onCategoryChange,
	category,
	onNotesChange,
	notes,
	onExtraChange,
	extra,
}) => {
	const { t } = useTranslation();
	const { theme, language } = useContext(appContext);
	const [expanded, setExpanded] = useState<'BASIC' | 'IDENTIFICATION' | 'IMPORTANT'>('BASIC');
	const [newRestriction, setNewRestriction] = useState('');
	const handleAddNewRestriction = useCallback(() => {
		if (newRestriction) {
			onRestrictionsChange(_.uniq(_.concat(restrictions, [newRestriction])));
			setNewRestriction('')
		}
	}, [newRestriction, onRestrictionsChange, restrictions, setNewRestriction])
	const handleChangeRestriction = useCallback((idx: number, newValue: string) => {
		if (!newValue) {
			handleDeleteRestriction(idx);
			return;
		}
		onRestrictionsChange(restrictions.map((restriction, i) => idx === i ? newValue : restriction));
	}, [restrictions, onRestrictionsChange]);
	const handleDeleteRestriction = useCallback((idx: number) => {
		onRestrictionsChange(restrictions.filter((__, i) => idx !== i));
	}, [restrictions, onRestrictionsChange]);
	const [newExtra, setNewExtra] = useState('');
	const handleAddNewExtra = useCallback(() => {
		if (newExtra) {
			onExtraChange(_.uniq(_.concat(extra, [newExtra])));
			setNewExtra('')
		}
	}, [newExtra, onExtraChange, extra, setNewExtra]);
	const handleChangeExtra = useCallback((idx: number, newValue: string) => {
		if (!newValue) {
			handleDeleteExtra(idx);
			return;
		}
		onExtraChange(extra.map((extra, i) => idx === i ? newValue : extra));
	}, [extra, onExtraChange]);
	const handleDeleteExtra = useCallback((idx: number) => {
		onExtraChange(extra.filter((__, i) => idx !== i));
	}, [extra, onExtraChange]);
	const handleAddAttachments = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			const newFiles: File[] = []
			for (let i = 0; i < e.currentTarget.files.length; i++) {
				newFiles.push(e.currentTarget.files[i]);
			}
			e.currentTarget.files = null;
			onAttachmentsChange(_.uniq(_.concat(attachments, newFiles)));
		}
	}, [attachments, onAttachmentsChange]);
	const handleDeleteAttachment = useCallback((idx: number) => {
		onAttachmentsChange(attachments.filter((__, i) => i !== idx));
	}, [attachments, onAttachmentsChange])
	const addAttachmentsInputRef = createRef<HTMLInputElement>();
	const [categories, setCategories] = useState<{ id: string, label: string }[]>([]);
	useEffect(() => {
		const neo4jSigmaGraph = Neo4jSigmaGraph.getInstance();
		neo4jSigmaGraph.getNodesByLabel('CATEGORY').then((nodes: any[]) => {
			setCategories(nodes.map((node: any) => ({ id: node.properties.id, label: node.properties.name })));
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Grid item container spacing={1}>
			<Grid item xs={12}>
				<Accordion expanded={expanded === 'BASIC'} onChange={() => setExpanded(expanded === 'BASIC' ? 'IDENTIFICATION' : 'BASIC')}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>{t("add_node.sections.person.basic")}</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2}>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.file_number")}
									value={fileNumber}
									onChange={onFileNumberChange}
									fullWidth
									required
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.arabic_name")}
									value={arabicName}
									onChange={onArabicNameChange}
									fullWidth
									dir='rtl'
									required
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.english_name")}
									value={englishName}
									onChange={onEnglishNameChange}
									fullWidth
									dir='ltr'
									required
									InputLabelProps={{
										dir: (language === 'ar') ? 'rtl' : 'ltr',
									}}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.mother_name")}
									value={motherName}
									onChange={onMotherNameChange}
									fullWidth
									required
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.nationality")}
									value={nationality}
									onChange={onNationalityChange}
									fullWidth
									required
								/>
							</Grid>
							<Grid item xs={4}>
								<Autocomplete
									options={categories}
									onChange={(__, value) => onCategoryChange(value?.id ?? '')}
									value={categories.find(cat => cat.id === category)}
									noOptionsText={t('add_node.inputs.person.no_categories')}
									renderInput={params => (
										<TextField
											{...params}
											label={t("add_node.inputs.person.category")}
											fullWidth
											required
										/>)
									} />
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.nickname")}
									value={nickname}
									onChange={onNicknameChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.birthdate")}
									value={birthDate}
									onChange={e => onBirthDateChange(e.target.value ? new Date(e.target.value) : null)}
									fullWidth
									type='date'
									InputLabelProps={{
										shrink: true,
									}}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.birth_place")}
									value={birthPlace}
									onChange={onBirthPlaceChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.job")}
									value={job}
									onChange={onJobChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.phone")}
									value={phone}
									onChange={onPhoneChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.email")}
									value={email}
									onChange={onEmailChange}
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
									label={t("add_node.inputs.person.workplace")}
									value={workplace}
									onChange={onWorkplaceChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.address")}
									value={address}
									onChange={onAddressChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.gps_location")}
									value={gpsLocation}
									onChange={onGpsLocationChange}
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
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>{t("add_node.sections.person.identification")}</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2}>
							<Grid item xs={4}>
								<Card>
									<CardMedia height='400' component='img' image={image ? URL.createObjectURL(image) : ''} />
									<CardContent>
										<Typography variant='h5' gutterBottom component='div'>{t("add_node.inputs.person.image")}</Typography>
									</CardContent>
									<CardActions>
										<Button component='label' variant='contained'>{t('add_node.inputs.choose_file')}<input accept='image/*' hidden type='file' onChange={onImageChange} /></Button>
									</CardActions>
								</Card>
							</Grid>
							<Grid item xs={4}>
								<Card>
									<CardMedia height='400' component='img' image={idImage ? URL.createObjectURL(idImage) : ''} />
									<CardContent>
										<Typography variant='h5' gutterBottom component='div'>{t("add_node.inputs.person.id_image")}</Typography>
									</CardContent>
									<CardActions>
										<Button component='label' variant='contained'>{t('add_node.inputs.choose_file')}<input accept='image/*' hidden type='file' onChange={onIdImageChange} /></Button>
									</CardActions>
								</Card>
							</Grid>
							<Grid item xs={4}>
								<Card>
									<CardMedia height='400' component='img' image={passportImage ? URL.createObjectURL(passportImage) : ''} />
									<CardContent>
										<Typography variant='h5' gutterBottom component='div'>{t("add_node.inputs.person.passport_image")}</Typography>
									</CardContent>
									<CardActions>
										<Button component='label' variant='contained'>{t('add_node.inputs.choose_file')}<input accept='image/*' hidden type='file' onChange={onPassportImageChange} /></Button>
									</CardActions>
								</Card>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.passport_number")}
									value={passportNumber}
									onChange={onPassportNumberChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.passport_issue_place")}
									value={passportIssuePlace}
									onChange={onPassportIssuePlaceChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.passport_issue_date")}
									value={passportIssueDate}
									onChange={e => onPassportIssueDateChange(e.target.value ? new Date(e.target.value) : null)}
									fullWidth
									type='date'
									InputLabelProps={{ shrink: true }}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.id_number")}
									value={idNumber}
									onChange={onIdNumberChange}
									fullWidth
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.national_number")}
									value={nationalNumber}
									onChange={onNationalNumberChange}
									fullWidth
									inputProps={{
										pattern: '[12](19|20)[0-9]{2}\\d{7}',
									}}
								/>
							</Grid>
							<Grid item xs={4}>
								<TextField
									label={t("add_node.inputs.person.registeration_number")}
									value={registerationNumber}
									onChange={onRegisterationNumberChange}
									fullWidth
								/>
							</Grid>
						</Grid>
					</AccordionDetails>
				</Accordion>
			</Grid>
			<Grid item xs={12}>
				<Accordion expanded={expanded === 'IMPORTANT'} onChange={() => setExpanded(expanded === 'IMPORTANT' ? 'BASIC' : 'IMPORTANT')}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>{t("add_node.sections.person.important")}</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<List sx={{ bgcolor: 'background.paper' }} dense subheader={<ListSubheader>{t("add_node.inputs.person.restrictions")}</ListSubheader>}>
									{restrictions.map((restriction, idx) => (
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
								{attachments.map((attachment, idx) => (
									<Grid item xs={4} key={idx}>
										<Card>
											<CardMedia height='400' component='img' image={URL.createObjectURL(attachment)} />
											<CardActions>
												<Button component='label' fullWidth color='error' variant='contained' onClick={() => handleDeleteAttachment(idx)}>{t('add_node.inputs.delete_file')}</Button>
											</CardActions>
										</Card>
									</Grid>
								))}
								<Grid item xs={4}>
									<Card>
										<CardActionArea onClick={() => addAttachmentsInputRef.current?.click()}>
											<input ref={addAttachmentsInputRef} multiple accept='*' hidden type='file' onChange={handleAddAttachments} />
											<CardMedia height='420' component='img' image={theme.palette.mode === 'light' ? AddIconDarkSvg: AddIconLightSvg} />
											<Typography variant='h6' textAlign='center'>{t('add_node.inputs.person.choose_attachments')}</Typography>
										</CardActionArea>
									</Card>
								</Grid>
							</Grid>
							<Grid item xs={12}>
								<TextField
									label={t("add_node.inputs.person.notes")}
									value={notes}
									onChange={onNotesChange}
									fullWidth
									multiline
									rows={5}
								/>
							</Grid>
							<Grid item xs={12}>
								<List sx={{ bgcolor: 'background.paper' }} dense subheader={<ListSubheader>{t("add_node.inputs.person.extra")}</ListSubheader>}>
									{extra.map((extr, idx) => (
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
}
