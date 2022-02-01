import { Driver } from "neo4j-driver";
import { SessionOptions } from "../neo4j-sigma-graph";

export abstract class Connector {
	constructor(protected readonly driver: Driver, protected readonly sessionOptions: SessionOptions) {}
	generateSession = () => {
		return this.driver.session(this.sessionOptions);
	}
	abstract up: () => Promise<void>;
	abstract down: () => Promise<void>;
}
