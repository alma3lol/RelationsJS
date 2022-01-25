import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { ContextMenuItem } from '../neo4j-sigma-graph';
import {
	Edit as EditIcon,
} from '@mui/icons-material';

export const MediaSchema = yup.object().shape({
	id: yup.string().required(),
	name: yup.string().required(),
	path: yup.string().required(),
	type: yup.mixed().oneOf(['image', 'video', 'id', 'avatar', 'passport', 'attachment']).required(),
});

export const CreateMediaCypher = `
CREATE (m:Media {
	id: $id,
	name: $name,
	path: $path,
	type: $type
})
`;

export const DeleteMediaCypher = `
MATCH (m:Media { id: $id })
DETACH DELETE m
`;

export const useMediaContextMenu = () => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('Edit'), id => { console.log('Edit', id); }]);
	return menu;
}
