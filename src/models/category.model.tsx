import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ContextMenuItem } from '../neo4j-sigma-graph';
import {
	Edit as EditIcon,
} from '@mui/icons-material';

export const CategorySchema = yup.object().shape({
	id: yup.string().uuid().required(),
	name: yup.string().required(),
});

export const CreateCategoryCypher = `
CREATE (c:Category {
	id: $id,
	name: $name
})
`;

export const DeleteCategoryCypher = `
MATCH (c:Category { id: $id })
DETACH DELETE c
`;

export const useCategoryContextMenu = (): ContextMenuItem[] => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('context_menu.category.edit'), id => { console.log('edit', id); }]);
	return menu;
}
