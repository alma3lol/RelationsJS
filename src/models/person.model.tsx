import * as yup from 'yup';
import { ContextMenuItem } from '../neo4j-sigma-graph';
import {
	Edit as EditIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const PersonSchema = yup.object().shape({
	id: yup.string().uuid().required(),
	arabicName: yup.string().required(),
	englishName: yup.string().required(),
	motherName: yup.string().required(),
	nickname: yup.string().nullable(),
	birthDate: yup.date().nullable(),
	birthPlace: yup.string().nullable(),
	job: yup.string().nullable(),
	nationality: yup.string().required(),
	phone: yup.string().nullable(),
	email: yup.string().email().nullable(),
	workplace: yup.string().nullable(),
	address: yup.string().nullable(),
	gpsLocation: yup.string().matches(/\d+\.\d+,\s?\d+\.\d+/, { message: () => ({ key: 'schema.invalid.gps_location', values: { label: 'gpsLocation' } }), excludeEmptyString: true }).nullable(),
	passportNumber: yup.string().nullable(),
	passportIssueDate: yup.date().nullable(),
	passportIssuePlace: yup.string().nullable(),
	idNumber: yup.string().nullable(),
	nationalNumber: yup.string().matches(/[12](19|20)[0-9]{9}/, { excludeEmptyString: true }).nullable(),
	registerationNumber: yup.string().nullable(),
	restrictions: yup.array().of(yup.string().min(1)).nullable(),
	notes: yup.string().nullable(),
	extra: yup.array().of(yup.string().min(1)).nullable(),
});

export const CreatePersonCypher = `
CREATE (p:Person {
	id: $id,
	arabicName: $arabicName,
	englishName: $englishName,
	motherName: $motherName,
	nickname: $nickname,
	birthDate: $birthDate,
	birthPlace: $birthPlace,
	job: $job,
	nationality: $nationality,
	phone: $phone,
	email: $email,
	workplace: $workplace,
	address: $address,
	gpsLocation: $gpsLocation,
	passportNumber: $passportNumber,
	passportIssueDate: $passportIssueDate,
	passportIssuePlace: $passportIssuePlace,
	idNumber: $idNumber,
	nationalNumber: $nationalNumber,
	registerationNumber: $registerationNumber,
	restrictions: $restrictions,
	notes: $notes,
	extra: $extra
})
`;

export const DeletePersonCypher = `
MATCH (p:Person { id: $id })
OPTIONAL MATCH (p)-[r]->(o)
WHERE NOT (r:CATEGORIZED_AS)
DETACH DELETE r, o, p
`;

export const usePersonContextMenu = (): ContextMenuItem[] => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('context_menu.person.edit'), id => { console.log('edit', id); }]);
	return menu;
}
