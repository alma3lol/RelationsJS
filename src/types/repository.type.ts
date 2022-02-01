import { Connector } from "./connector.type";

export abstract class Repository<M, I>{
	constructor(protected connector: Connector) {}
	abstract create: (model: M) => Promise<M>;
	abstract read: () => Promise<M[]>;
	abstract readById: (id: I) => Promise<M>;
	abstract update: (id: I, model: M) => Promise<M>;
	abstract delete: (id: I) => Promise<void>;
}
