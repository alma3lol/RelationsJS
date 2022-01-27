import { Driver } from "neo4j-driver";
import { SessionOptions } from "../neo4j-sigma-graph";

export abstract class Repository<M, I>{
	constructor(
		protected driver: Driver,
		protected sessionOptions: SessionOptions,
	) {}
	generateSession = () => this.driver.session(this.sessionOptions);
	abstract create: (model: M) => Promise<M>;
	abstract read: () => Promise<M[]>;
	abstract readById: (id: I) => Promise<M>;
	abstract update: (id: I, model: M) => Promise<M>;
	abstract delete: (id: I) => Promise<void>;
}
