import {
	Delete as DeleteIcon,
	Flag as FlagIcon,
	PinDrop as PinDropIcon,
} from '@mui/icons-material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTitle } from 'react-use';
import Captor from 'sigma/core/captors/captor';
import { Settings as SigmaSettings } from 'sigma/settings';
import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";
import { MouseCoords, NodeDisplayData, PlainObject } from 'sigma/types';
import { appContext } from '../App';
import { Attributes } from 'graphology-types';
import { useSigma, useSetSettings, useRegisterEvents } from 'react-sigma-v2';
import { circular } from 'graphology-layout';
import { useSnackbar } from "notistack"
import _ from 'lodash';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import { Node } from 'neo4j-driver';
import { SpringSupervisor } from '../layout-spring';
import { ContextMenuItem, Neo4jSigmaGraph, NodeType } from '../neo4j-sigma-graph';
import {
	ContextMenu,
	FloatingActions,
	ConfirmAction,
	Settings,
	AddNode,
    QuickFind,
    Help,
} from '../components';
import { useTranslation } from 'react-i18next';
import FA2Layout from "graphology-layout-forceatlas2/worker";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { animateNodes } from 'sigma/utils/animate';

export type ClickNode = {
	node: string
	captor: Captor
	event: MouseCoords
}

export const DashboardView = () => {
	const { t } = useTranslation();
	useTitle(t('titles.dashboard'));
	const {
		driver,
		setSigma,
		theme,
		database,
		createDatabaseIndexesAndConstraints,
		startNode,
		setStartNode,
		startNodeSearch,
		setStartNodeSearch,
		endNode,
		setEndNode,
		endNodeSearch,
		setEndNodeSearch,
		isFindPath,
		setIsFindPath,
		hoveredNode,
		setHoveredNode,
		setHoveredNodeLabel,
		selectedNode,
		setSelectedNode,
		setSelectedNodeLabel,
		layoutMode,
		setLayoutMode,
	} = useContext(appContext);
	const { enqueueSnackbar } = useSnackbar();
	const sigma = useSigma();
	const neo4jSigmaGraph = Neo4jSigmaGraph.getInstance();
	const [mouseMove, setMouseMove] = useState(false);
	useEffect(() => {
		setSigma(sigma);
		let isDragging = false;
		let draggedNode = '';
		sigma.on('downNode', ({ node }) => {
			setMouseMove(true);
			isDragging = true;
			draggedNode = node;
			sigma.getGraph().setNodeAttribute(node, 'highlighted', true);
			sigma.getCamera().disable();
		});
		sigma.getMouseCaptor().on("mousemove", (e) => {
			if (!isDragging || !draggedNode) return;
			const pos = sigma.viewportToGraph(e);
			sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
			sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);
		});
		sigma.getMouseCaptor().on("mouseup", () => {
			setMouseMove(false);
			if (draggedNode) {
				sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
			}
			isDragging = false;
			draggedNode = '';
			sigma.getCamera().enable();
		});
		sigma.getMouseCaptor().on("mousedown", () => {
			if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
		});
		const nodeReducer = (__: string, data: Attributes): Partial<NodeDisplayData> => ({
			...data,
			size: 15,
			x: data.x || 0,
			y: data.y || 0,
		});
		const settings: Partial<SigmaSettings> = {
			defaultNodeType: 'image',
			defaultEdgeColor: theme.palette.primary.main,
			renderLabels: true,
			renderEdgeLabels: true,
			defaultNodeColor: theme.palette.secondary.main,
			labelSize: 25,
			labelWeight: 'bold',
			labelGridCellSize: 0,
			edgeLabelSize: 25,
			nodeReducer,
			nodeProgramClasses: {
				image: getNodeProgramImage(),
			},
		}
		setSigmaSettings(settings);
		createGraphCallback();
		registerEvents({
			enterNode: e => {
				setHoveredNode(e.node);
				setHoveredNodeLabel(sigma.getGraph().getNodeAttribute(e.node, 'label'));
			},
			leaveNode: () => {
				setHoveredNode(null);
				setHoveredNodeLabel('');
			},
			clickNode: e => {
				if (selectedNode && selectedNode !== e.node) {
					sigma.getGraph().removeNodeAttribute(selectedNode, 'highlighted');
				}
				setSelectedNode(selectedNode === e.node ? null : e.node);
				setSelectedNodeLabel(selectedNode === e.node ? '' : sigma.getGraph().getNodeAttribute(e.node, 'label'));
				sigma.getGraph().setNodeAttribute(e.node, 'highlighted', selectedNode !== e.node);
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useHotkeys('Control+l', () => {
		if (layoutMode === 'CIRCULAR') {
			setLayoutMode('RANDOM');
		} else {
			setLayoutMode('CIRCULAR');
		}
	});
	const setSigmaSettings = useSetSettings();
	const fa2Layout = useRef<FA2Layout>();
	const springSupervisor = useRef<SpringSupervisor>();
	const cancelCurrentAnimation = useRef<() => void>();
	const refreshGraph = useCallback(() => {
		const graph = sigma.getGraph();
		if (springSupervisor.current) springSupervisor.current.stop();
		if (cancelCurrentAnimation.current) {
			cancelCurrentAnimation.current();
			cancelCurrentAnimation.current = undefined;
		}
		if (layoutMode === 'CIRCULAR') {
			circular.assign(graph);
			forceAtlas2.assign(graph, {
				settings: forceAtlas2.inferSettings(graph),
				iterations: 500,
			});
		} else {
			const xExtents = { min: 0, max: 0 };
			const yExtents = { min: 0, max: 0 };
			graph.forEachNode((__, attributes) => {
				xExtents.min = Math.min(attributes.x, xExtents.min);
				xExtents.max = Math.max(attributes.x, xExtents.max);
				yExtents.min = Math.min(attributes.y, yExtents.min);
				yExtents.max = Math.max(attributes.y, yExtents.max);
			});
			const randomPositions: PlainObject<PlainObject<number>> = {};
			graph.forEachNode((node) => {
				randomPositions[node] = {
					x: Math.random() * (xExtents.max - xExtents.min),
					y: Math.random() * (yExtents.max - yExtents.min),
				};
			});
			cancelCurrentAnimation.current = animateNodes(graph, randomPositions, { duration: 2000 });
		}
		if (springSupervisor.current) springSupervisor.current.start();
		else {
			springSupervisor.current = new SpringSupervisor(graph, { isNodeFixed: (n) => graph.getNodeAttribute(n, "highlighted") });
			springSupervisor.current.start();
		}
	}, [neo4jSigmaGraph, layoutMode, fa2Layout]);
	useHotkeys('Control+r', e => {
		e.preventDefault();
		refreshGraph();
	});
	const createGraph = async () => {
		const graph = sigma.getGraph();
		graph.clear();
		neo4jSigmaGraph.setGraph(graph);
		const addNodeAndRelationsPaths = async (node: Node) => {
			neo4jSigmaGraph.addNodeToGraph(node);
			const paths = await neo4jSigmaGraph.getNodeRelations(node.properties.id);
			paths.forEach(neo4jSigmaGraph.addRelationPathToGraph);
		}
		await Promise.all(
			(await neo4jSigmaGraph.getNodesByLabel('CATEGORY')).map(node => addNodeAndRelationsPaths(node))
		);
		// loadGraph(graph);
		refreshGraph();
	}
	const createGraphCallback = useCallback(createGraph, [neo4jSigmaGraph, sigma]);
	useEffect(() => {
		refreshGraph();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layoutMode]);
	const [menu, setMenu] = useState<{
		show: boolean,
		node: string,
		x: number,
		y: number,
		items: [JSX.Element, string, (id: string) => void][]
	}>({
		show: false,
		node: '',
		x: 0,
		y: 0,
		items: [],
	});
	const [foundPath, setFoundPath] = useState(false);
	const handleNodeRightClick = (e: ClickNode) => {
		const graph = sigma.getGraph();
		const nodeType: NodeType = graph.getNodeAttribute(e.node, 'node_type');
		const items: ContextMenuItem[] = [];
		items.push([<FlagIcon />, t('context_menu.set_start_node'), id => {
			setIsFindPath(true);
			setStartNode(id);
			setStartNodeSearch(graph.getNodeAttribute(id, 'label'));
		}]);
		items.push([<PinDropIcon />, t('context_menu.set_end_node'), id => {
			setIsFindPath(true);
			setEndNode(id);
			setEndNodeSearch(graph.getNodeAttribute(id, 'label'));
		}]);
		const nodeMenu = Neo4jSigmaGraph.getInstance().getContextMenu(nodeType);
		if (nodeMenu) {
			items.push(...nodeMenu.map(item => ([item[0], t(item[1]), item[2]] as ContextMenuItem)));
		}
		items.push([<DeleteIcon />, t('context_menu.delete_node'), id => {
			setConfirmActionName(t('actions.names.delete_node', { node: graph.getNodeAttribute(id, 'label') }));
			setConfirmActionTitle(t('actions.titles.delete_node'));
			setConfirmActionQuestion(t('actions.questions.delete_node'));
			setConfirmAction(() => async () => {
				try {
					const session = Neo4jSigmaGraph.getInstance().generateSession();
					await session.run('MATCH (n { id: $id }) OPTIONAL MATCH (n)-[r]-() DELETE r, n', { id });
					await session.close();
					enqueueSnackbar(t('actions.success.delete_node'), { variant: 'success' });
					createGraphCallback();
				} catch (e) {
					enqueueSnackbar(t('actions.errors.delete_node', { message: (e as any).message }), { variant: 'error' });
				}
			});
			setShowConfirmAction(true);
		}]);
		setMenu({
			show: true,
			node: e.node,
			x: e.event.x,
			y: e.event.y,
			items,
		});
	}
	const handleNodeRightClickCallback = useCallback(handleNodeRightClick, [setMenu, driver, sigma, enqueueSnackbar, createGraphCallback, database, foundPath, setEndNode, setEndNodeSearch, setIsFindPath, setStartNode, setStartNodeSearch, Neo4jSigmaGraph]);
	useEffect(() => {
		sigma.addListener('rightClickNode', handleNodeRightClickCallback);
		return () => {
			sigma.removeAllListeners('rightClickNode');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [foundPath]);
	const registerEvents = useRegisterEvents();
	useEffect(() => {
		setSigmaSettings({
			defaultNodeType: 'image',
			defaultEdgeColor: theme.palette.primary.main,
			renderLabels: true,
			renderEdgeLabels: true,
			defaultNodeColor: theme.palette.secondary.main,
			labelSize: 25,
			labelWeight: 'bold',
			labelGridCellSize: 0,
			edgeLabelSize: 25,
			nodeProgramClasses: {
				image: getNodeProgramImage(),
			},
			nodeReducer: (node, data) => {
				const newData: Attributes = { ...data, highlighted: data.highlighted || false, size: 15, x: data.x || 0, y: data.y || 0 };
				try {
					const graph = sigma.getGraph();
					if (hoveredNode && !mouseMove) {
						if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
							newData.highlighted = true;
						} else {
							newData.color = `#121212`;
							newData.highlighted = false;
						}
					}
				} catch(__) {}
				return newData;
			},
			edgeReducer: (edge, data) => {
				const graph = sigma.getGraph();
				const newData = { ...data, hidden: false };
				if (hoveredNode && !graph.extremities(edge).includes(hoveredNode) && !mouseMove) {
					newData.hidden = true;
				}
				return newData;
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hoveredNode, setSigmaSettings, sigma, theme, mouseMove]);
	useEffect(() => {
		if (driver) {
			createDatabaseIndexesAndConstraints(driver.session({ database }));
		}
		return () => {
			sigma.getGraph().clear();
			sigma.removeAllListeners('rightClickNode');
			sigma.getMouseCaptor().removeAllListeners('mousemove');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const findPathBetweenNodes = async (startNode: string, endNode: string) => {
		if (driver) {
			try {
				const graph = sigma.getGraph();
				neo4jSigmaGraph.setGraph(graph);
				const paths = await neo4jSigmaGraph.getNodesShortestPath(startNode, endNode);
				if (paths.length === 0) {
					enqueueSnackbar(`There's no path between (${startNodeSearch}) and (${endNodeSearch})`, { variant: 'warning' });
					return;
				}
				graph.clear();
				paths.forEach(neo4jSigmaGraph.addRelationPathToGraph);
				refreshGraph();
				setFoundPath(true);
			} catch (__) {}
		}
	}
	useEffect(() => {
		if (startNode && endNode && isFindPath) {
			findPathBetweenNodes(startNode, endNode);
		} else {
			if (foundPath || !isFindPath) {
				setFoundPath(false);
				createGraphCallback();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startNode, endNode, isFindPath]);
	const [showAddNode, setShowAddNode] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [showConfirmAction, setShowConfirmAction] = useState(false);
	const [confirmActionName, setConfirmActionName] = useState('');
	const [confirmActionTitle, setConfirmActionTitle] = useState('');
	const [confirmActionQuestion, setConfirmActionQuestion] = useState('');
	const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
	const [quickFind, setQuickFind] = useState(false);
	useHotkeys('Control+f', () => setQuickFind(true));
	useHotkeys('Escape', () => {
		setShowAddNode(false);
		setShowSettings(false);
		setShowConfirmAction(false);
		setQuickFind(false);
		setShowHelp(false);
	}, true);
	useHotkeys('Control+n', e => {
		e.preventDefault();
		setShowAddNode(true);
		setShowSettings(false);
		setShowConfirmAction(false);
		setQuickFind(false);
		setShowHelp(false);
	});
	useHotkeys('Control+s', () => {
		setShowAddNode(false);
		setShowSettings(true);
		setShowConfirmAction(false);
		setQuickFind(false);
		setShowHelp(false);
	});
	useHotkeys('Control+0', () => {
		sigma.getCamera().animatedReset();
	});
	useHotkeys(['Control+=', 'Control+*'], e => {
		e.preventDefault();
		sigma.getCamera().animatedZoom(2);
	}, true);
	useHotkeys('Control+-', e => {
		e.preventDefault();
		sigma.getCamera().animatedUnzoom(2);
	});
	const [showHelp, setShowHelp] = useState(false);
	useHotkeys('Control+Shift+?', () => {
		setShowAddNode(false);
		setShowSettings(false);
		setShowConfirmAction(false);
		setQuickFind(false);
		setShowHelp(true);
	});
	return (
		<>
			<Help show={showHelp} onClose={() => setShowHelp(false)} />
			<QuickFind show={quickFind} onClose={() => setQuickFind(false)} />
			<AddNode show={showAddNode} onDone={createGraphCallback} close={() => setShowAddNode(false)} />
			<Settings onDone={createGraphCallback} show={showSettings} close={() => setShowSettings(false)}/>
			<FloatingActions showAddNode={() => setShowAddNode(true)} showSettings={() => setShowSettings(true)} onDoneImporting={createGraphCallback} refreshGraph={refreshGraph} />
			<ConfirmAction close={() => { setShowConfirmAction(false); setConfirmAction(() => {}); }} actionName={confirmActionName} actionTitle={confirmActionTitle} actionQuestion={confirmActionQuestion} onConfirm={confirmAction} show={showConfirmAction} />
			<ContextMenu open={menu.show} closeMenu={() => setMenu({ ...menu, show: false })} node={menu.node} x={menu.x} y={menu.y} items={menu.items} />
		</>
	)
}
