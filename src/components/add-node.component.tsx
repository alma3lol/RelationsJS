import { Dialog, Grid, CardContent, Card, CardActionArea, Divider, Typography, Button, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
	Person as PersonIcon,
	Article as ArticleIcon,
} from "@mui/icons-material";
import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { appContext } from "../App";
import { Neo4jSigmaGraph, NodeType } from "../neo4j-sigma-graph";
import { useTranslation } from "react-i18next";
import { PersonForm, TranscriptForm } from "./forms";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { Person, Transcript } from "../models";
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
	const [nodeOnProgress, setNodeOnProgress] = useState<any>(null);
	const [person, setPerson] = useState(new Person());
	const [transcript, setTranscript] = useState(new Transcript());
	const nodeTypes: [JSX.Element, string, NodeType, string, any][] = [
		[<PersonIcon />, t('forms.type.person'), 'PERSON', t('forms.hint.person'), person],
		[<ArticleIcon />, t('forms.type.transcript'), 'TRANSCRIPT', t('forms.hint.transcript'), transcript],
	];
	const defaultHint = t('forms.hint.default');
	const [hint, setHint] = useState(defaultHint);
	const handleClose = () => {
		setNodeType(null);
		close();
	}
	const onDone = () => {
		onDoneParent();
		handleClose();
	}
	const handleOnSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (nodeType === null) return;
		if (nodeOnProgress === null) return;
		const repository = Neo4jSigmaGraph.getInstance().getRepository(nodeType);
		if (!repository) return;
		try {
			await repository.create(nodeOnProgress);
			onDone();
			enqueueSnackbar(t(`forms.success.${nodeType.toLowerCase()}.add`), { variant: 'success' });
		} catch (e) {
			if (Object.hasOwnProperty.call(e, 'message')) {
				enqueueSnackbar((e as any).message, { variant: 'error' });
			}
		}
	}
	useEffect(() => {
		setNodeType(null);
		setHint(defaultHint);
		setPerson(new Person());
		setTranscript(new Transcript());
	}, [show, defaultHint]);
	useHotkeys(nodeTypes.map((__, i) => (i + 1).toString()), e => {
		if (nodeType === null) {
			nodeTypes.forEach((nodeType, i) => {
				if (e.key === (i + 1).toString()) {
					setNodeType(nodeType[2]);
					setNodeOnProgress(nodeType[4]);
					return;
				}
			});
		}
	});
	const handleOnInvalid = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (nodeType === null) return;
		if (nodeOnProgress === null) return;
		enqueueSnackbar(t('forms.invalid.form'), { variant: 'warning' });
	}
	return (
		<Dialog open={show} fullWidth maxWidth='lg'>
			<form onSubmit={handleOnSubmit} onInvalid={handleOnInvalid}>
				<DialogTitle>{t('forms.add_node.title')}</DialogTitle>
				<DialogContent>
					<Grid container spacing={2}>
						<Grid item container spacing={1}>
							<Grid item xs={12}>
								<Typography variant='caption'>{t('forms.add_node.caption')}</Typography>
							</Grid>
							<Grid item container xs={12} spacing={1}>
								{nodeTypes.map((node, idx) => (
									<Grid key={idx} item onMouseOver={() => setHint(node[3])} onMouseOut={() => setHint(defaultHint)}>
										<Card variant='outlined' sx={{ width: 100, height: 100 }}>
											<CardActionArea className={classes.cardActionArea} disabled={node[2] === nodeType} onClick={() => { setNodeType(node[2]); setNodeOnProgress(node[4]); }}>
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
							{nodeType === 'PERSON' && <PersonForm person={person} />}
							{nodeType === 'TRANSCRIPT' && <TranscriptForm transcript={transcript} />}
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions style={{ padding: theme.spacing(3), paddingTop: 0 }}>
					<Grid style={{ flexGrow: 1, fontSize: 16, fontStyle: 'italic' }}>{hint}</Grid>
					<Button color='inherit' onClick={handleClose}>{t('cancel')}</Button>
					<Button variant='contained' color='primary' disabled={nodeType === null} type='submit'>{t('forms.add_node.action')}</Button>
				</DialogActions>
			</form>
		</Dialog>
	)
}
