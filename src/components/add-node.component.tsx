import { Dialog, Grid, CardContent, Card, CardActionArea, Divider, Typography, Button, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
	Groups as GroupsIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { appContext } from "../App";
import { NodeType } from "../neo4j-sigma-graph";
import { useTranslation } from "react-i18next";
import { AddCategory } from "./add-node";
import { v4 } from "uuid";

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
	const { theme, driver, database } = useContext(appContext);
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
	const [categoryName, setCategoryName] = useState('');
	const handleOnSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!driver) {
			return;
		}
		const session = driver.session({ database });
		const id = v4();
		switch(nodeType) {
			case 'CATEGORY':
				await session.run(`
					CREATE (c:Category {id: $id, name: $name})
				`, { id, name: categoryName });
				await session.close();
				onDone();
				break;
			case 'PERSON':
				// TODO
				break;
			default:
				break;
		}
	}
	useEffect(() => {
		setNodeType(null);
		setHint(defaultHint);
		setCategoryName('');
	}, [show]);
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
										<Card variant='outlined' sx={{ width: 75, height: 75 }}>
											<CardActionArea className={classes.cardActionArea} disabled={node[2] === nodeType} onClick={() => setNodeType(node[2])}>
												<CardContent sx={{ height: 75 }}>
													<Grid container justifyContent='center' alignItems='center' direction='column' height='100%'>
														<Grid item>{node[0]}</Grid>
														<Grid item>{node[1]}</Grid>
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
							{nodeType === 'CATEGORY' && <AddCategory value={categoryName} onChange={e => setCategoryName(e.currentTarget.value ?? '')} onSubmit={handleOnSubmit} />}
							{nodeType === 'PERSON' && "Hi"}
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
