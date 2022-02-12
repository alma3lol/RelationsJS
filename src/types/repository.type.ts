import { Connector } from "./connector.type";

export type KeyOf<T> = Extract<keyof T, string>;

export type RepositorySearch<M> = {
	[K in KeyOf<M>]?: {
		eq?: any;
		neq?: any;
		like?: any;
		nlike?: any;
		inarr?: any;
		ninarr?: any;
	}
}

export abstract class Repository<M, I>{
	constructor(protected connector: Connector) {}
	abstract create: (model: M) => Promise<M>;
	abstract read: (search?: RepositorySearch<M>) => Promise<M[]>;
	abstract readById: (id: I) => Promise<M>;
	abstract update: (id: I, model: M) => Promise<M>;
	abstract delete: (id: I) => Promise<void>;
	protected _renderSearchObject = (search: RepositorySearch<M>) => {
		let searchCypher = "";
		if (search) {
			Object.keys(search).forEach((key: string) => {
				if (search[key]) {
					if (searchCypher.length > 0) {
						searchCypher += " OR ";
					}
					if (!!search[key].eq) {
						searchCypher += `n.${key} = '${search[key].eq}'`;
					}
					if (!!search[key].neq) {
						searchCypher += `n.${key} <> '${search[key].neq}'`;
					}
					if (!!search[key].like) {
						searchCypher += `n.${key} CONTAINS '${search[key].like}'`;
					}
					if (!!search[key].nlike) {
						searchCypher += `n.${key} NOT CONTAINS '${search[key].nlike}'`;
					}
					if (!!search[key].inarr) {
						searchCypher += `ANY(item IN n.${key} WHERE item CONTAINS '${search[key].inarr}')`;
					}
					if (!!search[key].ninarr) {
						searchCypher += `ANY(item IN n.${key} WHERE item NOT CONTAINS '${search[key].inarr}')`;
					}
				}
			});
		}
		return searchCypher;
	};
}
