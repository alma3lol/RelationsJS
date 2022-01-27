import { useTranslation } from 'react-i18next';
import { ContextMenuItem } from '../neo4j-sigma-graph';
import {
	Edit as EditIcon,
} from '@mui/icons-material';
import { FileType } from '../global';
import { v4 } from 'uuid';
import { makeAutoObservable } from 'mobx';

export class Media {
	id = '';
	name = '';
	path = '';
	type: FileType = 'image';
	constructor(_id: string = v4()) {
		makeAutoObservable(this, { id: false });
		this.id = _id;
	}
	setName = (value: string) => this.name = value;
	setPath = (value: string) => this.path = value;
	setType = (value: FileType) => this.type = value;
}

export const useMediaContextMenu = () => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('Edit'), id => { console.log('Edit', id); }]);
	return menu;
}
