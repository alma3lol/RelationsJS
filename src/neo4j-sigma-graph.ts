import Graph from "graphology";
import _ from "lodash";
import { Node, Path, Session, SessionMode } from "neo4j-driver";
import { TFunction } from "react-i18next";
import GroupsSvgIcon from './images/groups.svg';
import PersonSvgIcon from './images/person.svg';
import { Connector, Repository } from "./types";

export type NodeType =
  'CATEGORY' |
  'PERSON' |
  'GROUP' |
  'PARTY' |
  'HOST' |
  'WORKPLACE' |
  'LOCATION' |
  'ORGANIZATION' |
  'EVENT' |
  'WORKSHOP' |
  'CONFERENCE' |
  'SEMINAR' |
  'COURSE' |
  'PROGRAM' |
  'PROJECT' |
  'NATIONALITY' |
  'PHONE' |
  'EMAIL' |
  'ENTRANCE' |
  'MEDIA' |
  'TRANSCRIPT';

export type RelationType =
  'CATEGORIZED_AS' |
  'KNOWS' |
  'WORKS_AT' |
  'LIVES_IN' |
  'BEEN_TO' |
  'COMING_TO' |
  'OWNS' |
  'FROM' |
  'ORGANIZED' |
  'HAS' |
  'RUNS' |
  'MEMBER_OF' |
  'GRANTED_BY' |
  'MENTIONED_IN';

export type SessionOptions = {
  defaultAccessMode?: SessionMode;
  bookmarks?: string | string[];
  database?: string;
  fetchSize?: number;
}

export type ContextMenuItem = [JSX.Element, string, (id: string) => void];

export class Neo4jSigmaGraph {
  private static _instance: Neo4jSigmaGraph;
  private constructor(
    private graph: Graph,
    public readonly connector: Connector,
    private t: TFunction,
  ) {}

  private _repositories: Map<NodeType, Repository<any, string>> = new Map();
  private _contextMenus: Map<NodeType, ContextMenuItem[]> = new Map();

  static init = (graph: Graph, connector: Connector, t: TFunction) => {
    if (this._instance) return;
    this._instance = new Neo4jSigmaGraph(graph, connector, t);
  }

  static getInstance = () => {
    if (!this._instance) throw new Error('Must call init() first');
    return this._instance;
  }

  getGraph = () => this.graph;
  setGraph = (graph: Graph) => this.graph = graph;

  getRepository = (node: NodeType) => this._repositories.get(node);
  setRepository = (node: NodeType, repository: Repository<any, string>) => this._repositories.set(node, repository);

  getContextMenu = (node: NodeType) => this._contextMenus.get(node);
  setContextMenu = (node: NodeType, contextMenu: ContextMenuItem[]) => this._contextMenus.set(node, contextMenu);

  addNodeToGraph = (node: Node) => {
    const node_type = node.labels[0].toUpperCase() as NodeType;
    const data: any = { node_type, type: 'image', id: node.properties.id };
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    data.x = x;
    data.y = y;
    switch (node_type) {
      case 'CATEGORY':
        data.image = GroupsSvgIcon;
        data.label = node.properties.name;
        data.name = node.properties.name;
        break;
      case 'PERSON':
        data.image = PersonSvgIcon;
        data.label = `${node.properties.arabicName}`;
        data.arabicName = node.properties.arabicName;
        data.englishName = node.properties.englishName;
        data.motherName = node.properties.motherName;
        data.nickname = node.properties.nickname;
        data.birthDate = node.properties.birthDate;
        data.birthPlace = node.properties.birthPlace;
        data.job = node.properties.job;
        data.nationality = node.properties.nationality;
        data.phone = node.properties.phone;
        data.email = node.properties.email;
        data.workplace = node.properties.workplace;
        data.address = node.properties.address;
        data.gpsLocation = node.properties.gpsLocation;
        data.passportNumber = node.properties.passportNumber;
        data.passportIssueDate = node.properties.passportIssueDate;
        data.passportIssuePlace = node.properties.passportIssuePlace;
        data.idNumber = node.properties.idNumber;
        data.nationalNumber = node.properties.nationalNumber;
        data.registerationNumber = node.properties.registerationNumber;
        data.restrictions = node.properties.restrictions;
        data.notes = node.properties.notes;
        data.extra = node.properties.extra
        break;
    }
    if (!this.graph.hasNode(node.properties.id)) {
      this.graph.addNode(node.properties.id, data);
    }
  }

  searchNodes = (query: string) => {
    const session = this.connector.generateSession();
    if (!session) {
      return [];
    }
    return session.run(`
      MATCH (n)
      WHERE n.name =~ '.*${query}.*'
      RETURN n
    `).then((result) => {
      const nodes: Node[] = result.records.map((record: any) => record.get('n'));
      return nodes;
    }).catch((error: any) => {
      console.error(error);
      return [];
    });
  }

  addRelationPathToGraph = (path: Path, data: any = {}) => {
    path.segments.forEach(({ relationship, start, end }) => {
      const startNode = start.properties;
      const endNode = end.properties;
      const relationshipType = relationship.type as RelationType;
      const relationshipActualStartNodeId = start.identity.low === relationship.start.low ? startNode.id : endNode.id;
      const relationshipActualEndNodeId = start.identity.low === relationship.end.low ? startNode.id : endNode.id;
      this.addNodeToGraph(start);
      this.addNodeToGraph(end);
      if (!this.graph.hasEdge(relationshipActualStartNodeId, relationshipActualEndNodeId)) {
        this.graph.addEdge(relationshipActualStartNodeId, relationshipActualEndNodeId, { label: this.t(`relations.${relationshipType}`), size: 5, ...data });
      }
    });
  }

  getNodesByLabel = async (label: NodeType, _session?: Session): Promise<Node[]> => {
    const session = _session ?? this.connector.generateSession();
    if (!session) return [];
    const result = await session.run(`MATCH (n:${_.capitalize(label.toLowerCase())}) RETURN n`);
    await session.close();
    return result.records.map(record => record.toObject().n);
  }

  getNodeById = async (nodeId: string, _session?: Session): Promise<Node | undefined> => {
    const session = _session ?? this.connector.generateSession();
    if (!session) return undefined;
    const result = await session.run('MATCH (n { id: $nodeId }) RETURN n', { nodeId });
    await session.close();
    return result.records.length ? result.records[0].toObject().n : undefined;
  }

  getNodeRelations = async (nodeId: string, _session?: Session): Promise<Path[]> => {
    const session = _session ?? this.connector.generateSession();
    if (!session) return [];
    const result = await session.run('MATCH p = ({ id: $nodeId })-[r]-() WHERE NOT r:HAS_HANDSHAKE RETURN p', { nodeId });
    const relations: Path[] = result.records.map(record => record.toObject().p);
    await session.close();
    return relations;
  }

  getNodesShortestPath = async (startNodeId: string, endNodeId: string, _session?: Session): Promise<Path[]> => {
    const session = _session ?? this.connector.generateSession();
    if (!session) return [];
    const paths = await session.run('MATCH p = shortestPath((n1 { id: $startNodeId })-[*]-(n2 { id: $endNodeId })) RETURN p', { startNodeId, endNodeId });
    return paths.records.map(record => record.toObject().p);
  }
}
