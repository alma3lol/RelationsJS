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
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { Category, Media, Person } from "../models";
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
	const category = new Category();
	const person = new Person();
	const handleOnSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (nodeType === null) return;
		const repository = Neo4jSigmaGraph.getInstance().getRepository(nodeType);
		if (!repository) return;
		switch(nodeType) {
			case 'CATEGORY':
				try {
					await repository.create(category);
					onDone();
					enqueueSnackbar(t('add_node.success.category'), { variant: 'success' });
				} catch (e) {
					enqueueSnackbar((e as any).message, { variant: 'error' });
				}
				break;
			case 'PERSON':
				try {
					await repository.create(person);
					await Neo4jSigmaGraph.getInstance().createRelationship(person.id, person.category, 'CATEGORIZED_AS');
					const mediaRepository = Neo4jSigmaGraph.getInstance().getRepository('MEDIA');
					if (!mediaRepository) return;
					if (person.image) {
						const imagePath = window.files.upload(person.id, 'avatar', person.image.name, (await person.image.arrayBuffer()));
						const media = new Media();
						media.setName(person.image.name);
						media.setPath(imagePath);
						media.setType('avatar');
						await mediaRepository.create(media);
						await Neo4jSigmaGraph.getInstance().createRelationship(person.id, media.id, 'HAS');
					}
					if (person.idImage) {
						const idImagePath = window.files.upload(person.id, 'id', person.idImage.name, (await person.idImage.arrayBuffer()));
						const media = new Media();
						media.setName(person.idImage.name);
						media.setPath(idImagePath);
						media.setType('id');
						await mediaRepository.create(media);
						await Neo4jSigmaGraph.getInstance().createRelationship(person.id, media.id, 'HAS');
					}
					if (person.passportImage) {
						const passportImagePath = window.files.upload(person.id, 'passport', person.passportImage.name, (await person.passportImage.arrayBuffer()));
						const media = new Media();
						media.setName(person.passportImage.name);
						media.setPath(passportImagePath);
						media.setType('passport');
						await mediaRepository.create(media);
						await Neo4jSigmaGraph.getInstance().createRelationship(person.id, media.id, 'HAS');
					}
					if (person.attachments.length > 0) {
						for (const attachment of person.attachments) {
							const attachmentPath = window.files.upload(person.id, 'attachment', attachment.name, (await attachment.arrayBuffer()));
							const media = new Media();
							media.setName(attachment.name);
							media.setPath(attachmentPath);
							media.setType('attachment');
							await mediaRepository.create(media);
							await Neo4jSigmaGraph.getInstance().createRelationship(person.id, media.id, 'HAS');
						}
					}
					onDone();
					enqueueSnackbar(t('add_node.success.person'), { variant: 'success' });
				} catch (e) {
					if (Object.hasOwnProperty.call(e, 'message')) {
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
							{nodeType === 'CATEGORY' && <AddCategory category={category} onSubmit={handleOnSubmit} />}
							{nodeType === 'PERSON' && <AddPerson person={person} onSubmit={handleOnSubmit} />}
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
