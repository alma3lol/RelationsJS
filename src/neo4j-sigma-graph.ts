import Graph from "graphology";
import _ from "lodash";
import { Driver, Node, Path, Session, SessionMode } from "neo4j-driver";

export type NodeType =
  'PERSON' |
  'GROUP' |
  'PARTY' |
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
  'OTHER';

export type RelationType =
  'KNOWS' |
  'WORKS_AT' |
  'LIVES_IN' |
  'OWNS' |
  'FROM' |
  'ORGANIZED' |
  'HAS' |
  'RUNS' |
  'MEMBER_OF';

export type SessionOptions = {
  defaultAccessMode?: SessionMode;
  bookmarks?: string | string[];
  database?: string;
  fetchSize?: number;
}

export class Neo4jSigmaGraph {
  constructor(
    private graph: Graph,
    private driver: Driver | null,
    private sessionOptions?: SessionOptions,
  ) {}

  generateSession = () => this.driver ? this.driver.session(this.sessionOptions) : null;

  getGraph = () => this.graph;
  setGraph = (graph: Graph) => this.graph = graph;

  addNodeToGraph = (node: Node) => {
    const node_type = node.labels[0].toUpperCase() as NodeType;
    const data: any = { node_type, type: 'image', id: node.properties.id };
    switch (node_type) {
      case 'PERSON':
        // data.image = WifiSvgIcon;
        data.label = `${node.properties.essid} - ${node.properties.bssid}`;
        data.essid = node.properties.essid;
        data.bssid = node.properties.bssid;
        data.password = node.properties.password;
        data.pin = node.properties.pin;
        data.handshakes = node.properties.handshakes;
        break;
    }
    if (!this.graph.hasNode(node.properties.id)) {
      this.graph.addNode(node.properties.id, data);
    }
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
        this.graph.addEdge(relationshipActualStartNodeId, relationshipActualEndNodeId, { label: relationshipType, ...data });
      }
    });
  }

  getNodesByLabel = async (label: NodeType, _session?: Session): Promise<Node[]> => {
    const session = _session ?? this.generateSession();
    if (!session) return [];
    const result = await session.run(`MATCH (n:${_.capitalize(label.toLowerCase())}) RETURN n`);
    await session.close();
    return result.records.map(record => record.toObject().n);
  }

  getNodeById = async (nodeId: string, _session?: Session): Promise<Node | undefined> => {
    const session = _session ?? this.generateSession();
    if (!session) return undefined;
    const result = await session.run('MATCH (n { id: $nodeId }) RETURN n', { nodeId });
    await session.close();
    return result.records.length ? result.records[0].toObject().n : undefined;
  }

  getNodeRelations = async (nodeId: string, _session?: Session): Promise<Path[]> => {
    const session = _session ?? this.generateSession();
    if (!session) return [];
    const result = await session.run('MATCH p = ({ id: $nodeId })-[r]-() WHERE NOT r:HAS_HANDSHAKE RETURN p', { nodeId });
    const relations: Path[] = result.records.map(record => record.toObject().p);
    await session.close();
    return relations;
  }

  getNodesShortestPath = async (startNodeId: string, endNodeId: string, _session?: Session): Promise<Path[]> => {
    const session = _session ?? this.generateSession();
    if (!session) return [];
    const paths = await session.run('MATCH p = shortestPath((n1 { id: $startNodeId })-[*]-(n2 { id: $endNodeId })) RETURN p', { startNodeId, endNodeId });
    return paths.records.map(record => record.toObject().p);
  }
}
