import { useTranslation } from 'react-i18next';
import { ContextMenuItem } from '../neo4j-sigma-graph';
import {
	Edit as EditIcon,
} from '@mui/icons-material';

export const useMediaContextMenu = () => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('Edit'), id => { console.log('Edit', id); }]);
	return menu;
}
