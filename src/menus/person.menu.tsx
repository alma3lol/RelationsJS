import { ContextMenuItem } from '../neo4j-sigma-graph';
import {
	Edit as EditIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const usePersonContextMenu = (): ContextMenuItem[] => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('context_menu.person.edit'), id => { console.log('edit', id); }]);
	return menu;
}
