import { makeAutoObservable } from "mobx";
import { v4 } from "uuid";

export class Record {
	id = '';
	title = '';
	text = '';
	date: Date | null = null;
	attachments: File[] = [];
	constructor(id: string = v4()) {
		makeAutoObservable(this, { id: false });
		this.id = id;
	}
	setTitle = (title: string) => this.title = title;
	setText = (text: string) => this.text = text;
	setDate = (date: Date | null) => this.date = date;
	setAttachments = (attachments: File[]) => this.attachments = attachments;
}
