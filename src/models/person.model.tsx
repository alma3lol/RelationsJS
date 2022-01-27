import { ContextMenuItem } from '../neo4j-sigma-graph';
import {
	Edit as EditIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { v4 } from 'uuid';
import { makeAutoObservable } from 'mobx';

export class Person {
	id = '';
	fileNumber = '';
	arabicName = '';
	englishName = '';
	motherName = '';
	nickname = '';
	birthDate = new Date();
	birthPlace = '';
	job = '';
	nationality = '';
	category = '';
	phone = '';
	email = '';
	workplace = '';
	address = '';
	gpsLocation = '';
	passportNumber = '';
	passportIssueDate = new Date();
	passportIssuePlace = '';
	idNumber = '';
	nationalNumber = '';
	registerationNumber = '';
	restrictions: string[] = [];
	notes = '';
	extra: string[] = [];
	attachments: File[] = [];
	image: File | null = null;
	idImage: File | null = null;
	passportImage: File | null = null;
	constructor(_id: string = v4()) {
		makeAutoObservable(this, { id: false });
		this.id = _id;
	}
	setFileNumber = (value: string) => this.fileNumber = value;
	setArabicName = (value: string) => this.arabicName = value;
	setEnglishName = (value: string) => this.englishName = value;
	setMotherName = (value: string) => this.motherName = value;
	setNickname = (value: string) => this.nickname = value;
	setBirthDate = (value: Date) => this.birthDate = value;
	setBirthPlace = (value: string) => this.birthPlace = value;
	setJob = (value: string) => this.job = value;
	setNationality = (value: string) => this.nationality = value;
	setCategory = (value: string) => this.category = value;
	setPhone = (value: string) => this.phone = value;
	setEmail = (value: string) => this.email = value;
	setWorkplace = (value: string) => this.workplace = value;
	setAddress = (value: string) => this.address = value;
	setGpsLocation = (value: string) => this.gpsLocation = value;
	setPassportNumber = (value: string) => this.passportNumber = value;
	setPassportIssueDate = (value: Date) => this.passportIssueDate = value;
	setPassportIssuePlace = (value: string) => this.passportIssuePlace = value;
	setIdNumber = (value: string) => this.idNumber = value;
	setNationalNumber = (value: string) => this.nationalNumber = value;
	setRegisterationNumber = (value: string) => this.registerationNumber = value;
	setRestrictions = (value: string[]) => this.restrictions = value;
	setNotes = (value: string) => this.notes = value;
	setExtra = (value: string[]) => this.extra = value;
	setAttachments = (value: File[]) => this.attachments = value;
	setImage = (value: File | null) => this.image = value;
	setIdImage = (value: File | null) => this.idImage = value;
	setPassportImage = (value: File | null) => this.passportImage = value;
}

export const usePersonContextMenu = (): ContextMenuItem[] => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('context_menu.person.edit'), id => { console.log('edit', id); }]);
	return menu;
}
