import { makeAutoObservable } from "mobx";
import { v4 } from "uuid";

export class Nationality {
	id = '';
	name = '';
	constructor(_id: string = v4()) {
		makeAutoObservable(this, { id: false });
		this.id = _id;
	}
	setName = (value: string) => this.name = value;
}
