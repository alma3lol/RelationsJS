import _ from "lodash";
import { CategoryIndexesDown, CategoryIndexesUp, MediaIndexesDown, MediaIndexesUp, NationalityIndexesDown, NationalityIndexesUp, PersonIndexesDown, PersonIndexesUp } from "../indexes";
import { Connector } from "../types";

export class DbConnector extends Connector {
	up = async () => {
		const session = this.generateSession();
		const trx = session.beginTransaction();
		await Promise.all(
			_.concat(CategoryIndexesUp, PersonIndexesUp, MediaIndexesUp, NationalityIndexesUp).map(async (item) => {
				await trx.run(item);
			})
		);
		await trx.commit();
		await session.close();
	}
	down = async () => {
		const session = this.generateSession();
		const trx = session.beginTransaction();
		await Promise.all(
			_.concat(CategoryIndexesDown, PersonIndexesDown, MediaIndexesDown, NationalityIndexesDown).map(async (item) => {
				await trx.run(item);
			})
		);
		await trx.commit();
		await session.close();
	}
}
