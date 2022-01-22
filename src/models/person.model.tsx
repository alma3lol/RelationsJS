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
	nickname: yup.string().required(),
	birthDate: yup.date().required().transform(value => new Date(value).toISOString()),
	birthPlace: yup.string().required(),
	job: yup.string().required(),
	nationality: yup.string().required(),
	phone: yup.string().required(),
	email: yup.string().email().required(),
	workplace: yup.string().required(),
	address: yup.string().required(),
	gpsLocation: yup.string().matches(/\d+\.\d+,\s?\d+\.\d+/, () => ({ key: 'schema.invalid.gps_location', values: { label: 'gpsLocation' } })).required(),
	passportNumber: yup.string().required(),
	passportIssueDate: yup.date().required().transform(value => new Date(value).toISOString()),
	passportIssuePlace: yup.string().required(),
	idNumber: yup.string().required(),
	nationalNumber: yup.string().matches(/[12](19|20)[0-9]{2}\d{7}/).optional(),
	registerationNumber: yup.string().required(),
	restrictions: yup.array().of(yup.string().min(1)).required().transform(value => JSON.stringify(value)),
	notes: yup.string().optional(),
	extra: yup.array().of(yup.string().min(1)).required().transform(value => JSON.stringify(value)),
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

export const usePersonContextMenu = (): ContextMenuItem[] => {
	const { t } = useTranslation();
	const menu: ContextMenuItem[] = [];
	menu.push([<EditIcon />, t('context_menu.person.edit'), id => { console.log('edit', id); }]);
	return menu;
}
