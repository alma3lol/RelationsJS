import {
	Box,
	Button,
	ButtonGroup,
	Fab,
	Autocomplete,
	TextField,
	IconButton,
	Grid,
	Tooltip,
	Paper,
	Collapse,
	List,
	ListItem,
	InputAdornment,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FC, useContext, useState, useEffect, FormEvent } from 'react';
import {
	ZoomIn as ZoomInIcon,
	ZoomOut as ZoomOutIcon,
	Search as SearchIcon,
	Add as AddIcon,
	Settings as SettingsIcon,
	Timeline as TimelineIcon,
	ExpandLess as ExpandLessIcon,
	ExpandMore as ExpandMoreIcon,
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon,
	Refresh as RefreshIcon,
	UploadFile as UploadFileIcon,
	Download as DownloadIcon,
} from '@mui/icons-material';
import { appContext } from '../App';
import { useSigma } from 'react-sigma-v2';
import Graph from 'graphology';
import { NodeType, RelationType } from '../neo4j-sigma-graph';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { Neo4jError } from 'neo4j-driver';
import { useTranslation } from 'react-i18next';
import useHotkeys from '@reecelucas/react-use-hotkeys';

export type FloatingActionsProps = {
	showAddNode: () => void
	showSettings: () => void
	onDoneImporting: () => void
}

export type WifiteCrackedWPA = {
	type: "WPA"
	date: number
	essid: string
	bssid: string
	key: string
	handshake_file: string
}

export type WifiteCrackedWPS = {
	type: "WPS"
	date: number
	essid: string
	bssid: string
	pin: string
	psk: string
}

export const FloatingActions: FC<FloatingActionsProps> = ({ showAddNode, showSettings, onDoneImporting }) => {
	const { t } = useTranslation();
	const { enqueueSnackbar } = useSnackbar();
	const {
		theme,
		search,
		setSearch,
		foundNode,
		setFoundNode,
		isFindPath,
		setIsFindPath,
		startNode,
		setStartNode,
		startNodeSearch,
		setStartNodeSearch,
		endNode,
		setEndNode,
		endNodeSearch,
		setEndNodeSearch,
		hoveredNode,
		hoveredNodeLabel,
		selectedNode,
		selectedNodeLabel,
		driver,
		database,
		language,
	} = useContext(appContext);
	const sigma = useSigma();
	const graph = sigma.getGraph();
	const useStyles = makeStyles({
		floatingActionsBottom: {
			position: 'absolute',
			zIndex: theme.zIndex.appBar,
			bottom: theme.spacing(2),
			right: theme.spacing(2),
		},
		floatingActionsBottomLeft: {
			position: 'absolute',
			zIndex: theme.zIndex.appBar,
			bottom: theme.spacing(2),
			left: theme.spacing(2),
		},
		floatingSearchAndFind: {
			position: 'absolute',
			zIndex: theme.zIndex.appBar,
			top: theme.spacing(2),
			left: theme.spacing(2),
			display: 'flex',
		},
		floatingActionsTop: {
			position: 'absolute',
			zIndex: theme.zIndex.appBar,
			top: theme.spacing(2),
			right: theme.spacing(2),
		},
	});
	const classes = useStyles();
	const [values, setValues] = useState<{ id: string, label: string }[]>([]);
	const [startValues, setStartValues] = useState<{ id: string, label: string }[]>([]);
	const [endValues, setEndValues] = useState<{ id: string, label: string }[]>([]);
	const findMatchingNodes = (searchString: string, graph: Graph) => {
		const foundMatchingNodes: { id: string, label: string }[] = []
		graph.forEachNode((id, attributes) => {
			if (attributes.label && attributes.label.toLowerCase().includes(searchString.toLowerCase())) {
				foundMatchingNodes.push({ id, label: attributes.label });
			}
		});
		return foundMatchingNodes;
	}
	useEffect(() => {
		const newValues: { id: string, label: string }[] = [];
		if (!foundNode && search.length > 0) {
			newValues.push(...findMatchingNodes(search, graph));
		}
		setValues(newValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search]);
	useEffect(() => {
		const newValues: { id: string, label: string }[] = [];
		if (!startNode && startNodeSearch.length > 0) {
			newValues.push(...findMatchingNodes(startNodeSearch, graph));
		}
		if (endNode) setStartValues(newValues.filter(node => node.id !== endNode));
		else setStartValues(newValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startNodeSearch]);
	useEffect(() => {
		const newValues: { id: string, label: string }[] = [];
		if (!endNode && endNodeSearch.length > 0) {
			newValues.push(...findMatchingNodes(endNodeSearch, graph));
		}
		if (startNode) setEndValues(newValues.filter(node => node.id !== startNode));
		else setEndValues(newValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [endNodeSearch]);
	useEffect(() => {
		if (!foundNode) return;
		sigma.getGraph().setNodeAttribute(foundNode, 'highlighted', true);
		const nodeDisplayData = sigma.getNodeDisplayData(foundNode);
		if (nodeDisplayData) {
			sigma.getCamera().animate(nodeDisplayData, {
				easing: "linear",
				duration: 500,
			});
		}
		return () => {
			sigma.getGraph().setNodeAttribute(foundNode, 'highlighted', false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [foundNode]);
	const handleSearchChange = (searchString: string) => {
		const valueItem = values.find(value => value.label === searchString);
		if (valueItem) {
			setSearch(valueItem.label);
			setValues([]);
			setFoundNode(valueItem.id);
		} else {
			setFoundNode(null);
			setSearch(searchString);
		}
	}
	const handleStartNodeSearchChange = (searchString: string) => {
		const valueItem = startValues.find(value => value.label === searchString);
		if (valueItem) {
			setStartNodeSearch(valueItem.label);
			setStartValues([]);
			setStartNode(valueItem.id);
		} else {
			setStartNode(null);
			setStartNodeSearch(searchString);
		}
	}
	const handleEndNodeSearchChange = (searchString: string) => {
		const valueItem = endValues.find(value => value.label === searchString);
		if (valueItem) {
			setEndNodeSearch(valueItem.label);
			setEndValues([]);
			setEndNode(valueItem.id);
		} else {
			setEndNode(null);
			setEndNodeSearch(searchString);
		}
	}
	const handleZoomOut = () => {
		sigma.getCamera().animatedUnzoom(2);
	}
	const handleZoomIn = () => {
		sigma.getCamera().animatedZoom(2);
	}
	const handleZoomReset = () => {
		sigma.getCamera().animatedReset();
	}
	const [expandNodeInfo, setExpandNodeInfo] = useState(true);
	type NodePropertyInfoType = { nodeId: string,  label: string, value: string, secondaryAction?: JSX.Element, pin?: boolean, password?: boolean, toggleShowPassword?: () => void };
	const [nodePropertiesInfo, setNodePropertiesInfo] = useState<NodePropertyInfoType[]>([]);
	const [showPasswordFields, setShowPasswordFields] = useState<string[]>([]);
	const [showPinFields, setShowPinFields] = useState<string[]>([]);
	useEffect(() => {
		const asyncCallback = async () => {
			if (!hoveredNode && !selectedNode) {
				setNodePropertiesInfo([]);
				return;
			}
			const graph = sigma.getGraph();
			const generateNodePropertiesInfoFromNode = async (node: string) => {
				const newNodePropertiesInfo: NodePropertyInfoType[] = [];
				if (driver) {
					const session = driver.session({ database });
					const properties = graph.getNodeAttributes(node);
					const node_type: NodeType = properties.node_type;
					const nodeId = properties.id;
					switch(node_type) {
						case 'PERSON':
							newNodePropertiesInfo.push({ nodeId, label: t('essid'), value: properties.essid });
							newNodePropertiesInfo.push({ nodeId, label: t('bssid'), value: properties.bssid });
							if (properties.password) newNodePropertiesInfo.push({ nodeId, label: t('password'), value: properties.password, password: true, toggleShowPassword: () => setShowPasswordFields(prev => {
								if (_.includes(prev, properties.id)) return prev.filter(i => i !== properties.id);
								return [ ...prev, properties.id ];
							}), });
							if (properties.pin) newNodePropertiesInfo.push({ nodeId, label: 'Pin', value: properties.pin, pin: true, toggleShowPassword: () => setShowPinFields(prev => {
								if (_.includes(prev, properties.id)) return prev.filter(i => i !== properties.id);
								return [ ...prev, properties.id ];
							}), });
							const wifiClientsCount = await session.run('MATCH (:Wifi { id: $nodeId })<-[]-(c:Client) RETURN DISTINCT c', { nodeId });
							newNodePropertiesInfo.push({ nodeId, label: 'Clients', value: wifiClientsCount.records.length.toString() });
							break;
					}
					await session.close();
				}
				return newNodePropertiesInfo;
			}
			if (hoveredNode && selectedNode !== hoveredNode) {
				setNodePropertiesInfo(await generateNodePropertiesInfoFromNode(hoveredNode));
			} else if (selectedNode) {
				setNodePropertiesInfo(await generateNodePropertiesInfoFromNode(selectedNode));
			}
		}
		asyncCallback();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedNode, hoveredNode]);
	const [showImportDialog, setShowImportDialog] = useState(false);
	const [importFromExportedGraphFile, setImportFromExportedGraphFile] = useState<File | null>(null);
	const [showExportDialog, setShowExportDialog] = useState(false);
	const handleCancel = () => {
		setShowImportDialog(false);
		setShowExportDialog(false);
		setImportFromExportedGraphFile(null);
	}
	type NodeTypeString =
		'Person' |
		'Group' |
		'Party' |
		'Workplace' |
		'Location' |
		'Organization' |
		'Event' |
		'Workshop' |
		'Conference' |
		'Seminar' |
		'Course' |
		'Program' |
		'Project' |
		'Nationality' |
		'Other';
	const generateNodeQueryStringFromParams = (type: NodeTypeString, params: any) => {
		let paramsString = _.join(_.keys(params).map(key => `${key}: $${key}`), ', ');
		return `MERGE (:${type} { ${paramsString} })`;
	}
	const generateEdgeQueryStringFromRelationType = (relationType: RelationType) => {
		return `MATCH (s { id: $source }), (t { id: $target }) MERGE (s)-[:${relationType}]->(t)`;
	}
	const handleImportSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (driver) {
			const graph = sigma.getGraph();
			const session = driver.session({ database });
			const trx = session.beginTransaction();
			const reader = new FileReader();
			if (importFromExportedGraphFile) {
				reader.onload = async () => {
					if (reader.result && typeof reader.result === 'string') {
						try {
							const parsedGraph = JSON.parse(reader.result);
							if (!parsedGraph.nodes && !parsedGraph.edges) throw new Neo4jError(t('import.empty_graph'), '1');
							const importedGraph: { nodes: any[], edges: any[] } = parsedGraph;
							importedGraph.nodes.forEach(async node => {
								if (graph.hasNode(node.id)) return;
								const node_type: NodeType = node.node_type;
								let nodeType: NodeTypeString = 'Person';
								const nodeData: any = { id: node.id };
								switch(node_type) {
									case 'PERSON':
										nodeData.essid = node.essid;
										nodeData.bssid = node.bssid;
										if (node.password) {
											nodeData.password = node.password;
										}
										break;
								}
								try {
									await trx.run(generateNodeQueryStringFromParams(nodeType, nodeData), nodeData);
								} catch (__) {}
							});
							importedGraph.edges.forEach(async edge => {
								const edge_type: RelationType = edge.label;
								try {
									await trx.run(generateEdgeQueryStringFromRelationType(edge_type), { source: edge.source, target: edge.target });
								} catch (__) {}
							});
							await trx.commit();
							await session.close();
							enqueueSnackbar(t('import.success'), { variant: 'success' });
							handleCancel();
							onDoneImporting();
						} catch (e) {
							enqueueSnackbar((e as Neo4jError).message, { variant: 'error' });
						}
					}
				}
				reader.readAsText(importFromExportedGraphFile, 'utf8');
			}
		}
	}
	const handleExportSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const serializedGraph = sigma.getGraph().export();
		const dataToBeExported = {
			nodes: JSON.parse(JSON.stringify(serializedGraph.nodes.map(node => _.assign({}, node.attributes, { type: undefined, label: undefined, x: undefined, y: undefined, image: undefined })))),
			edges: JSON.parse(JSON.stringify(serializedGraph.edges.map(edge => _.assign({}, edge.attributes, { source: edge.source, target: edge.target })))),
		}
		const saved = await window.files.saveFile(JSON.stringify(dataToBeExported), t('files.save_dialog_title'));
		if (saved) {
			enqueueSnackbar(t('export.success'), { variant: 'success' });
		} else {
			enqueueSnackbar(t('export.failed'), { variant: 'warning' });
		}
		handleCancel();
	}
	useHotkeys('Escape', () => {
		setShowImportDialog(false);
		setShowExportDialog(false);
		setImportFromExportedGraphFile(null);
	}, true);
	return (
		<>
			<Box className={classes.floatingActionsTop} display='grid' rowGap={2}>
				<Tooltip placement='left' title={t('settings.title') as string}><Fab color='secondary' onClick={showSettings}><SettingsIcon /></Fab></Tooltip>
				<Tooltip placement='left' title={t('add_node.title') as string}><Fab color='secondary' onClick={showAddNode}><AddIcon /></Fab></Tooltip>
				<Tooltip placement='left' title={t('refresh') as string}><Fab color='secondary' onClick={() => sigma.refresh()}><RefreshIcon /></Fab></Tooltip>
				<Tooltip placement='left' title={t('import.title') as string}><Fab color='secondary' onClick={() => setShowImportDialog(true)}><UploadFileIcon /></Fab></Tooltip>
				<Tooltip placement='left' title={t('export.title') as string}><Fab color='secondary' onClick={() => setShowExportDialog(true)}><DownloadIcon /></Fab></Tooltip>
			</Box>
			<Box className={classes.floatingActionsBottom}>
				<ButtonGroup orientation='vertical' color='secondary' variant='contained'>
					<Tooltip placement='left' title={t('zoom.in') as string}><Button onClick={handleZoomIn}><ZoomInIcon /></Button></Tooltip>
					<Tooltip placement='left' title={t('zoom.reset') as string}><Button onClick={handleZoomReset}><SearchIcon /></Button></Tooltip>
					<Tooltip placement='left' title={t('zoom.out') as string}><Button onClick={handleZoomOut}><ZoomOutIcon /></Button></Tooltip>
				</ButtonGroup>
			</Box>
			<Box className={classes.floatingSearchAndFind}>
				<Grid container spacing={2} sx={{ width: 350 }}>
					<Grid item xs={9} flexGrow={1} sx={{ '& .MuiTextField-root': { my: .5 }, px: .5 }}>
						{!isFindPath && <Autocomplete
							disablePortal
							options={values}
							inputValue={search}
							onInputChange={(__, v) => handleSearchChange(v)}
							noOptionsText={search ===  '' ? t('search.hint.empty') : foundNode ? t('search.hint.found') : t('search.hint.no_match')}
							fullWidth
							renderInput={(params) => <TextField {...params} onChange={e => handleSearchChange(e.target.value)} label={t('search.find')} />} />}
						{isFindPath && <>
							<Autocomplete
								disablePortal
								options={startValues}
								inputValue={startNodeSearch}
								onInputChange={(e, v) => { if (e && e.type === 'onChange') handleStartNodeSearchChange(v); }}
								noOptionsText={startNodeSearch ===  '' ? t('search.hint.empty') : startNode ? startNode === endNode ? t('search.hint.same_node') : t('search.hint.found') : t('search.hint.no_match')}
								fullWidth
								renderInput={(params) => <TextField {...params} onChange={e => handleStartNodeSearchChange(e.target.value)} label={t('search.path.start')} />} />
							<Autocomplete
								disablePortal
								options={endValues}
								inputValue={endNodeSearch}
								onInputChange={(e, v) => { if (e && e.type === 'onChange') handleEndNodeSearchChange(v); }}
								noOptionsText={endNodeSearch ===  '' ? t('search.hint.empty') : endNode ? startNode === endNode ? t('search.hint.same_node') : t('search.hint.found') : t('search.hint.no_match')}
								fullWidth
								renderInput={(params) => <TextField {...params} onChange={e => handleEndNodeSearchChange(e.target.value)} label={t('search.path.end')} />} />
						</>}
					</Grid>
					<Grid item container spacing={0} direction='column' justifyContent='start' alignItems='start' xs={3}>
						<Tooltip title={isFindPath ? t('search.path.disable') as string : t('search.path.enable') as string} sx={{ my: 1 }}>
							<IconButton size='large' color={isFindPath ? 'primary' : 'inherit'} onClick={() => setIsFindPath(!isFindPath)}>
								<TimelineIcon />
							</IconButton>
						</Tooltip>
					</Grid>
				</Grid>
			</Box>
			<Box className={classes.floatingActionsBottomLeft}>
				<Paper elevation={3} sx={{ width: 450, p: 2 }}>
					<Collapse in={expandNodeInfo && nodePropertiesInfo.length > 0} collapsedSize={theme.spacing(4)}>
						<Grid container>
							<Grid item xs={11}>{t('node_info.title')}{(hoveredNodeLabel || selectedNodeLabel) && ` (${hoveredNodeLabel || selectedNodeLabel})`}</Grid>
							<Grid item xs={1}>
								<Tooltip title={expandNodeInfo ? t('node_info.minimize') as string : t('node_info.expand') as string}>
									<IconButton size='small' onClick={() => setExpandNodeInfo(!expandNodeInfo)}>
										{!expandNodeInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
									</IconButton>
								</Tooltip>
							</Grid>
							<Grid item xs={12}>
								{expandNodeInfo && <>
									<List>
										{nodePropertiesInfo.map(propertyInfo => <ListItem key={propertyInfo.label} secondaryAction={propertyInfo.secondaryAction}>
											<Grid container>
												<Grid item xs={3} sx={{ py: 2 }}>{propertyInfo.label}</Grid>
												<Grid item xs={8}>
													<TextField InputProps={{
														endAdornment: propertyInfo.password || propertyInfo.pin ?
															<InputAdornment position='end'>
																<IconButton onClick={() => { if (propertyInfo.toggleShowPassword) propertyInfo.toggleShowPassword(); }} edge='end'>
																	{(propertyInfo.password && _.includes(showPasswordFields, propertyInfo.nodeId)) || (propertyInfo.pin && _.includes(showPinFields, propertyInfo.nodeId)) ? <VisibilityOffIcon /> : <VisibilityIcon />}
																</IconButton>
															</InputAdornment> : ''
													}} fullWidth value={propertyInfo.value} type={(propertyInfo.password && !_.includes(showPasswordFields, propertyInfo.nodeId)) || (propertyInfo.pin && !_.includes(showPinFields, propertyInfo.nodeId)) ? 'password' : 'text'} />
												</Grid>
											</Grid>
										</ListItem>)}
									</List>
								</>}
							</Grid>
						</Grid>
					</Collapse>
				</Paper>
			</Box>
			<Dialog open={showImportDialog} fullWidth maxWidth='md'>
				<form onSubmit={handleImportSubmit}>
					<DialogTitle>
						{t('import.title')}
					</DialogTitle>
					<DialogContent>
						<Grid container spacing={2}>
							<Grid item>
								<Button variant='contained' component='label'>{t('import.choose_file')}<input accept='.json' onChange={e => setImportFromExportedGraphFile(e.target.files?.item(0) ?? null)} type='file' hidden /></Button>
							</Grid>
							<Grid item sx={{ flexGrow: 1 }}>
								{importFromExportedGraphFile && <TextField fullWidth size='small' InputProps={{ readOnly: true }} value={importFromExportedGraphFile.name} />}
							</Grid>
						</Grid>
					</DialogContent>
					<DialogActions>
						<Button color='inherit' onClick={handleCancel}>{t('cancel')}</Button>
						<Button type='submit' variant='contained' color='primary'>{t('import.action')}</Button>
					</DialogActions>
				</form>
			</Dialog>
			<Dialog open={showExportDialog} fullWidth maxWidth='md'>
				<form onSubmit={handleExportSubmit}>
					<DialogTitle>{t('export.title')}</DialogTitle>
					<DialogContent>
						{t('export.description').replace('{{nodes}}', sigma.getGraph().nodes().length.toString()).replace('{{edges}}', sigma.getGraph().edges().length.toString())}
					</DialogContent>
					<DialogActions>
						<Button color='inherit' onClick={handleCancel}>{t('cancel')}</Button>
						<Button type='submit' variant='contained' color='primary'>{t('export.action')}</Button>
					</DialogActions>
				</form>
			</Dialog>
		</>
	);
}
