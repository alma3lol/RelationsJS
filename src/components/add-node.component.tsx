import { Dialog, Grid, CardContent, Card, CardActionArea, Divider, Typography, Button, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
	Groups as GroupsIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { appContext } from "../App";
import { Neo4jSigmaGraph, NodeType } from "../neo4j-sigma-graph";
import { useTranslation } from "react-i18next";
import { AddCategory, AddPerson } from "./add-node";
import { v4 } from "uuid";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { PersonSchema, CreatePersonCypher, MediaSchema, CreateMediaCypher, Category } from "../models";
import { ValidationError } from "yup";
import { useSnackbar } from "notistack";

export type AddNodeProps = {
	show: boolean
	close: () => void
	onDone: () => void
}

export type WithHintComponent = {
	setHint: (hint: string) => void
	defaultHint: string
}

export const AddNode: FC<AddNodeProps> = ({ show, close, onDone: onDoneParent }) => {
	const { t } = useTranslation();
	const { theme } = useContext(appContext);
	const { enqueueSnackbar } = useSnackbar();
	const useStyles = makeStyles({
		cardActionArea: {
			'&:disabled > .MuiCardActionArea-focusHighlight': {
				opacity: 0.3
			}
		},
		divider: {
			width: `calc(100% - ${theme.spacing(2)})`,
			height: '10px',
			left: theme.spacing(1),
		},
	});
	const classes = useStyles();
	const [nodeType, setNodeType] = useState<null | NodeType>(null);
	const nodeTypes: [JSX.Element, string, NodeType, string][] = [
		[<GroupsIcon />, t('add_node.type.category'), 'CATEGORY', t('add_node.hint.category')],
		[<PersonIcon />, t('add_node.type.person'), 'PERSON', t('add_node.hint.person')],
	];
	const defaultHint = t('add_node.hint.default');
	const [hint, setHint] = useState(defaultHint);
	const handleClose = () => {
		setNodeType(null);
		close();
	}
	const onDone = () => {
		onDoneParent();
		handleClose();
	}
	const [fileNumber, setFileNumber] = useState('');
	const [arabicName, setArabicName] = useState('');
	const [englishName, setEnglishName] = useState('');
	const [motherName, setMotherName] = useState('');
	const [nickname, setNickname] = useState('');
	const [image, setImage] = useState<File | null>(null);
	const [idImage, setIdImage] = useState<File | null>(null);
	const [passportImage, setPassportImage] = useState<File | null>(null);
	const [birthDate, setBirthDate] = useState<Date | null>(null);
	const [birthPlace, setBirthPlace] = useState('');
	const [passportNumber, setPassportNumber] = useState('');
	const [passportIssueDate, setPassportIssueDate] = useState<Date | null>(null);
	const [passportIssuePlace, setPassportIssuePlace] = useState('');
	const [job, setJob] = useState('');
	const [idNumber, setIdNumber] = useState('');
	const [nationalNumber, setNationalNumber] = useState('');
	const [registerationNumber, setRegisterationNumber] = useState('');
	const [nationality, setNationality] = useState('');
	const [address, setAddress] = useState('');
	const [gpsLocation, setGpsLocation] = useState('');
	const [workplace, setWorkplace] = useState('');
	const [attachments, setAttachments] = useState<File[]>([]);
	const [phone, setPhone] = useState('');
	const [restrictions, setRestrictions] = useState<string[]>([]);
	const [category, setCategory] = useState('');
	const [notes, setNotes] = useState('');
	const [extra, setExtra] = useState<string[]>([]);
	const [email, setEmail] = useState('');
	const categoryModel = new Category();
	const handleOnSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (nodeType === null) return;
		const session = Neo4jSigmaGraph.getInstance().generateSession();
		const id = v4();
		const repository = Neo4jSigmaGraph.getInstance().getRepository(nodeType);
		if (!repository) return;
		switch(nodeType) {
			case 'CATEGORY':
				try {
					await repository.create(categoryModel);
					onDone();
					enqueueSnackbar(t('add_node.success.category'), { variant: 'success' });
				} catch (e) {
					enqueueSnackbar((e as any).message, { variant: 'error' });
				}
				break;
			case 'PERSON':
				try {
					const person = await PersonSchema.validate({
						id,
						arabicName,
						englishName,
						motherName,
						nickname,
						birthDate,
						birthPlace,
						job,
						nationality,
						phone,
						email,
						workplace,
						address,
						gpsLocation,
						passportNumber,
						passportIssueDate,
						passportIssuePlace,
						idNumber,
						nationalNumber,
						registerationNumber,
						restrictions,
						notes,
						extra,
					});
					await session.run(CreatePersonCypher, person);
					await session.close();
					await Neo4jSigmaGraph.getInstance().createRelationship(id, category, 'CATEGORIZED_AS');
					if (image) {
						const session = Neo4jSigmaGraph.getInstance().generateSession();
						const imageId = v4();
						const imagePath = window.files.upload(id, 'avatar', image.name, (await image.arrayBuffer()));
						const imageMedia = await MediaSchema.validate({
							id: imageId,
							path: imagePath,
							name: image.name,
							type: 'avatar',
						});
						await session.run(CreateMediaCypher, imageMedia);
						await Neo4jSigmaGraph.getInstance().createRelationship(id, imageId, 'HAS');
					}
					if (idImage) {
						const session = Neo4jSigmaGraph.getInstance().generateSession();
						const idImageId = v4();
						const idImagePath = window.files.upload(id, 'id', idImage.name, (await idImage.arrayBuffer()));
						const idImageMedia = await MediaSchema.validate({
							id: idImageId,
							path: idImagePath,
							name: idImage.name,
							type: 'id',
						});
						await session.run(CreateMediaCypher, idImageMedia);
						await Neo4jSigmaGraph.getInstance().createRelationship(id, idImageId, 'HAS');
					}
					if (passportImage) {
						const session = Neo4jSigmaGraph.getInstance().generateSession();
						const passportImageId = v4();
						const passportImagePath = window.files.upload(id, 'passport', passportImage.name, (await passportImage.arrayBuffer()));
						const passportImageMedia = await MediaSchema.validate({
							id: passportImageId,
							path: passportImagePath,
							name: passportImage.name,
							type: 'passport',
						});
						await session.run(CreateMediaCypher, passportImageMedia);
						await Neo4jSigmaGraph.getInstance().createRelationship(id, passportImageId, 'HAS');
					}
					if (attachments.length > 0) {
						for (const attachment of attachments) {
							const session = Neo4jSigmaGraph.getInstance().generateSession();
							const attachmentId = v4();
							const attachmentPath = window.files.upload(id, 'attachment', attachment.name, (await attachment.arrayBuffer()));
							const attachmentMedia = await MediaSchema.validate({
								id: attachmentId,
								path: attachmentPath,
								name: attachment.name,
								type: 'attachment',
							});
							await session.run(CreateMediaCypher, attachmentMedia);
							await Neo4jSigmaGraph.getInstance().createRelationship(id, attachmentId, 'HAS');
						}
					}
					onDone();
					enqueueSnackbar(t('add_node.success.person'), { variant: 'success' });
				} catch (e) {
					if (e instanceof ValidationError) {
						if (e.errors) {
							enqueueSnackbar(e.errors.join('\n'), { variant: 'error' });
						}
					} else if (Object.hasOwnProperty.call(e, 'message')) {
						enqueueSnackbar((e as any).message, { variant: 'error' });
					}
				}
				break;
			default:
				break;
		}
	}
	useEffect(() => {
		setNodeType(null);
		setHint(defaultHint);
		setFileNumber('');
		setArabicName('');
		setEnglishName('');
		setMotherName('');
		setNickname('');
		setImage(null);
		setIdImage(null);
		setPassportImage(null);
		setBirthDate(null);
		setBirthPlace('');
		setPassportNumber('');
		setPassportIssueDate(null);
		setPassportIssuePlace('');
		setJob('');
		setIdNumber('');
		setNationalNumber('');
		setRegisterationNumber('');
		setNationality('');
		setAddress('');
		setGpsLocation('');
		setWorkplace('');
		setAttachments([]);
		setPhone('');
		setRestrictions([]);
		setCategory('');
		setNotes('');
		setExtra([]);
		setEmail('');
	}, [show]);
	useHotkeys(nodeTypes.map((__, i) => (i + 1).toString()), e => {
		if (nodeType === null) {
			nodeTypes.forEach((nodeType, i) => {
				if (e.key === (i + 1).toString()) {
					setNodeType(nodeType[2]);
					return;
				}
			});
		}
	});
	return (
		<Dialog open={show} fullWidth maxWidth='lg'>
			<form onSubmit={handleOnSubmit}>
				<DialogTitle>{t('add_node.title')}</DialogTitle>
				<DialogContent>
					<Grid container spacing={2}>
						<Grid item container spacing={1}>
							<Grid item xs={12}>
								<Typography variant='caption'>{t('add_node.caption')}</Typography>
							</Grid>
							<Grid item container xs={12} spacing={1}>
								{nodeTypes.map((node, idx) => (
									<Grid key={idx} item onMouseOver={() => setHint(node[3])} onMouseOut={() => setHint(defaultHint)}>
										<Card variant='outlined' sx={{ width: 100, height: 100 }}>
											<CardActionArea className={classes.cardActionArea} disabled={node[2] === nodeType} onClick={() => setNodeType(node[2])}>
												<CardContent sx={{ height: 100 }}>
													<Grid container justifyContent='center' alignItems='center' direction='row' height='100%'>
														<Grid item><Typography>{node[0]}</Typography></Grid>
														<Grid item><Typography>{node[1]}</Typography></Grid>
													</Grid>
												</CardContent>
											</CardActionArea>
										</Card>
									</Grid>
								))}
							</Grid>
						</Grid>
						{nodeType !== null && <Divider variant='middle' className={classes.divider} />}
						<Grid item container spacing={0}>
							{nodeType === 'CATEGORY' && <AddCategory category={categoryModel} onSubmit={handleOnSubmit} />}
							{nodeType === 'PERSON' && <AddPerson
								fileNumber={fileNumber}
								onFileNumberChange={e => setFileNumber(e.currentTarget.value ?? '')}
								arabicName={arabicName}
								onArabicNameChange={e => setArabicName(e.currentTarget.value ?? '')}
								englishName={englishName}
								onEnglishNameChange={e => setEnglishName(e.currentTarget.value ?? '')}
								motherName={motherName}
								onMotherNameChange={e => setMotherName(e.currentTarget.value ?? '')}
								nickname={nickname}
								onNicknameChange={e => setNickname(e.currentTarget.value ?? '')}
								image={image}
								onImageChange={e => setImage(e.currentTarget.files && e.currentTarget.files[0] ? e.currentTarget.files[0] : null)}
								idImage={idImage}
								onIdImageChange={e => setIdImage(e.currentTarget.files && e.currentTarget.files[0] ? e.currentTarget.files[0] : null)}
								passportImage={passportImage}
								onPassportImageChange={e => setPassportImage(e.currentTarget.files && e.currentTarget.files[0] ? e.currentTarget.files[0] : null)}
								birthDate={birthDate}
								onBirthDateChange={setBirthDate}
								birthPlace={birthPlace}
								onBirthPlaceChange={e => setBirthPlace(e.currentTarget.value ?? '')}
								passportNumber={passportNumber}
								onPassportNumberChange={e => setPassportNumber(e.currentTarget.value ?? '')}
								passportIssueDate={passportIssueDate}
								onPassportIssueDateChange={setPassportIssueDate}
								passportIssuePlace={passportIssuePlace}
								onPassportIssuePlaceChange={e => setPassportIssuePlace(e.currentTarget.value ?? '')}
								job={job}
								onJobChange={e => setJob(e.currentTarget.value ?? '')}
								idNumber={idNumber}
								onIdNumberChange={e => setIdNumber(e.currentTarget.value ?? '')}
								nationalNumber={nationalNumber}
								onNationalNumberChange={e => setNationalNumber(e.currentTarget.value ?? '')}
								registerationNumber={registerationNumber}
								onRegisterationNumberChange={e => setRegisterationNumber(e.currentTarget.value ?? '')}
								nationality={nationality}
								onNationalityChange={e => setNationality(e.currentTarget.value ?? '')}
								address={address}
								onAddressChange={e => setAddress(e.currentTarget.value ?? '')}
								gpsLocation={gpsLocation}
								onGpsLocationChange={e => setGpsLocation(e.currentTarget.value ?? '')}
								workplace={workplace}
								onWorkplaceChange={e => setWorkplace(e.currentTarget.value ?? '')}
								attachments={attachments}
								onAttachmentsChange={setAttachments}
								phone={phone}
								onPhoneChange={e => setPhone(e.currentTarget.value ?? '')}
								restrictions={restrictions}
								onRestrictionsChange={setRestrictions}
								category={category}
								onCategoryChange={setCategory}
								notes={notes}
								onNotesChange={e => setNotes(e.currentTarget.value ?? '')}
								extra={extra}
								onExtraChange={setExtra}
								email={email}
								onEmailChange={e => setEmail(e.currentTarget.value ?? '')}
							/>}
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions style={{ padding: theme.spacing(3), paddingTop: 0 }}>
					<Grid style={{ flexGrow: 1, fontSize: 11, fontStyle: 'italic' }}>{hint}</Grid>
					<Button color='inherit' onClick={handleClose}>{t('cancel')}</Button>
					<Button variant='contained' color='primary' disabled={nodeType === null} type='submit'>{t('add_node.action')}</Button>
				</DialogActions>
			</form>
		</Dialog>
	)
}
