import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Flag as FlagIcon,
	PinDrop as PinDropIcon,
} from '@mui/icons-material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTitle } from 'react-use';
import Captor from 'sigma/core/captors/captor';
import { Settings as SigmaSettings } from 'sigma/settings';
import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";
import { MouseCoords, NodeDisplayData } from 'sigma/types';
import { appContext } from '../App';
import { Attributes } from 'graphology-types';
import { useSigma, useSetSettings, useRegisterEvents } from 'react-sigma-v2';
import circlepack from 'graphology-layout/circlepack';
// import forceAtlas2 from 'graphology-layout-forceatlas2';
import { useSnackbar } from "notistack"
import _ from 'lodash';
import { Neo4jError, Node } from 'neo4j-driver';
import { SpringSupervisor } from '../layout-spring';
import { Neo4jSigmaGraph, NodeType } from '../neo4j-sigma-graph';
import {
	ContextMenu,
	FloatingActions,
	ConfirmAction,
    Settings,
    AddNode,
} from '../components';
import { useTranslation } from 'react-i18next';

export type ClickNode = {
	node: string
	captor: Captor
	event: MouseCoords
}

export const DashboardView = () => {
     const { t } = useTranslation();
	useTitle(t('dashboard.title'));
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
	} = useContext(appContext);
	const { enqueueSnackbar } = useSnackbar();
	const sigma = useSigma();
	const [neo4jSigmaGraph, setNeo4jSigmaGraph] = useState(new Neo4jSigmaGraph(sigma.getGraph(), driver, { database }));
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const setSigmaSettings = useSetSettings();
	const createGraph = async () => {
		const graph = sigma.getGraph();
		graph.clear();
		neo4jSigmaGraph.setGraph(graph);
		const addNodeAndRelationsPaths = async (node: Node) => {
			neo4jSigmaGraph.addNodeToGraph(node);
			const paths = await neo4jSigmaGraph.getNodeRelations(node.properties.id);
			paths.forEach(neo4jSigmaGraph.addRelationPathToGraph);
		}
		(await neo4jSigmaGraph.getNodesByLabel('PERSON')).forEach(node => addNodeAndRelationsPaths(node));
		circlepack.assign(neo4jSigmaGraph.getGraph(), { hierarchyAttributes: ['node_type'] });
		new SpringSupervisor(neo4jSigmaGraph.getGraph(), { isNodeFixed: (n) => neo4jSigmaGraph.getGraph().getNodeAttribute(n, "highlighted") }).start();
		sigma.refresh();
	}
	const createGraphCallback = useCallback(createGraph, [neo4jSigmaGraph, sigma]);
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
		// const nodeType: NodeType = graph.getNodeAttribute(e.node, 'node_type');
		const items: [JSX.Element, string, (id: string) => void][] = [];
		items.push([<FlagIcon />, 'Set as a start node', id => {
			setIsFindPath(true);
			setStartNode(id);
			setStartNodeSearch(graph.getNodeAttribute(id, 'label'));
		}]);
		items.push([<PinDropIcon />, 'Set as an end node', id => {
			setIsFindPath(true);
			setEndNode(id);
			setEndNodeSearch(graph.getNodeAttribute(id, 'label'));
		}]);
		setMenu({
			show: true,
			node: e.node,
			x: e.event.x,
			y: e.event.y,
			items,
		});
	}
	const handleNodeRightClickCallback = useCallback(handleNodeRightClick, [setMenu, driver, sigma, enqueueSnackbar, createGraphCallback, database, foundPath, setEndNode, setEndNodeSearch, setIsFindPath, setStartNode, setStartNodeSearch]);
	useEffect(() => {
		sigma.addListener('rightClickNode', handleNodeRightClickCallback);
		return () => {
			sigma.removeAllListeners('rightClickNode');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [foundPath]);
	const registerEvents = useRegisterEvents();
	useEffect(() => {
		const nodeReducer = (__: string, data: Attributes): Partial<NodeDisplayData> => ({
			...data,
			size: 15,
		});
		const settings: Partial<SigmaSettings> = {
			defaultNodeType: 'image',
			defaultEdgeColor: theme.palette.primary.main,
			renderLabels: true,
			renderEdgeLabels: true,
			defaultNodeColor: theme.palette.secondary.main,
			labelSize: 10,
			labelWeight: 'bold',
			labelGridCellSize: 0,
			edgeLabelSize: 10,
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
	useEffect(() => {
		if (driver) {
			setNeo4jSigmaGraph(new Neo4jSigmaGraph(sigma.getGraph(), driver, { database }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [driver]);
	useEffect(() => {
		setSigmaSettings({
			defaultNodeType: 'image',
			defaultEdgeColor: theme.palette.primary.main,
			renderLabels: true,
			renderEdgeLabels: true,
			defaultNodeColor: theme.palette.secondary.main,
			labelSize: 10,
			labelWeight: 'bold',
			labelGridCellSize: 0,
			edgeLabelSize: 10,
			nodeProgramClasses: {
				image: getNodeProgramImage(),
			},
			nodeReducer: (node, data) => {
				const newData: Attributes = { ...data, highlighted: data.highlighted || false, size: 15 };
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
				circlepack.assign(neo4jSigmaGraph.getGraph(), { hierarchyAttributes: ['node_type'] });
				new SpringSupervisor(neo4jSigmaGraph.getGraph(), { isNodeFixed: (n) => neo4jSigmaGraph.getGraph().getNodeAttribute(n, "highlighted") }).start();
				sigma.refresh();
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
	return (
		<>
			<AddNode show={showAddNode} onDone={createGraphCallback} close={() => setShowAddNode(false)} />
			<Settings onDone={createGraphCallback} show={showSettings} close={() => setShowSettings(false)}/>
			<FloatingActions showAddNode={() => setShowAddNode(true)} showSettings={() => setShowSettings(true)} onDoneImporting={createGraphCallback} />
			<ConfirmAction close={() => { setShowConfirmAction(false); setConfirmAction(() => {}); }} actionName={confirmActionName} actionTitle={confirmActionTitle} actionQuestion={confirmActionQuestion} onConfirm={confirmAction} show={showConfirmAction} />
			<ContextMenu open={menu.show} closeMenu={() => setMenu({ ...menu, show: false })} node={menu.node} x={menu.x} y={menu.y} items={menu.items} />
		</>
	)
}
