import { useTranslation } from 'react-i18next';
import { ContextMenuItem } from '../neo4j-sigma-graph';
import {
	Edit as EditIcon,
} from '@mui/icons-material';
import { makeAutoObservable } from 'mobx';
import { v4 } from 'uuid';

export class Category {
	id = '';
	name = '';
	constructor(_id: string = v4()) {
		makeAutoObservable(this, { id: false });
		this.id = _id;
	}
	setName = (value: string) => this.name = value;
}

export const useCategoryContextMenu = (): ContextMenuItem[] => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('context_menu.category.edit'), id => { console.log('edit', id); }]);
	return menu;
}
