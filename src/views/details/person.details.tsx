import { Box, Grid, Table, TableBody, TableCell, TableRow, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Person } from "../../models";
import PersonLightSvgIcon from "../../images/person-light.svg"
import PersonDarkSvgIcon from "../../images/person.svg"
import { appContext } from "../../App";
import { useContext } from "react";

const useStyles = makeStyles<Theme>(theme => ({
	table: {
		width: "100%",
		'& td': {
			padding: '0.5rem',
			border: '2px solid #ccc',
			'&:first-of-type': {
				width: '25%',
				[theme.breakpoints.down('sm')]: {
					width: '40%',
				},
			},
		}
	},
	avatar: {
		width: '350px',
		height: '350px',
		[theme.breakpoints.down('sm')]: {
			width: '250px',
			height: '250px',
		},
	}
}));

export type PersonDetailsProps = {
	person: Person;
};

export const PersonDetails: React.FC<PersonDetailsProps> = ({ person }) => {
	const { t } = useTranslation();
	const { darkMode } = useContext(appContext);
	const classes = useStyles();
	return (
		<Grid item container spacing={2} px={2} pb={2} className={classes.container}>
			<Grid item flexGrow={1}>
				<Table className={classes.table}>
					<TableBody>
						<TableRow>
							<TableCell>{t('forms.inputs.person.arabic_name')}</TableCell>
							<TableCell>{person.arabicName}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>{t('forms.inputs.person.english_name')}</TableCell>
							<TableCell>{person.englishName}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>{t('forms.inputs.person.mother_name')}</TableCell>
							<TableCell>{person.motherName}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>{t('forms.inputs.person.category')}</TableCell>
							<TableCell>{person.category.label}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>{t('forms.inputs.person.nickname')}</TableCell>
							<TableCell>{person.nickname}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>{t('forms.inputs.person.nationality')}</TableCell>
							<TableCell>{person.nationality.label}</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Grid>
			<Grid item xs='auto'>
				<Box component='img' className={classes.avatar} src={person.image ? URL.createObjectURL(person.image) : darkMode ? PersonDarkSvgIcon :  PersonLightSvgIcon} />
			</Grid>
			<Grid item xs={12}>
				<Table className={classes.table}>
					<TableBody>
						<TableRow>
							<TableCell sx={{ width: '20% !important' }}>{t('forms.inputs.person.birthdate')}</TableCell>
							<TableCell sx={{ width: '30%' }}>{person.birthDate && moment(person.birthDate).format('YYYY-MM-DD')}</TableCell>
							<TableCell sx={{ width: '20%' }}>{t('forms.inputs.person.birth_place')}</TableCell>
							<TableCell sx={{ width: '30%' }}>{person.birthPlace}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell sx={{ width: '20% !important' }}>{t('forms.inputs.person.passport_number')}</TableCell>
							<TableCell sx={{ width: '30%' }}>{person.passportNumber}</TableCell>
							<TableCell sx={{ width: '20%' }}>{t('forms.inputs.person.passport_issue_date')}</TableCell>
							<TableCell sx={{ width: '30%' }}>{person.passportIssueDate && moment(person.passportIssueDate).format('YYYY-MM-DD')}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell sx={{ width: '20% !important' }}>{t('forms.inputs.person.passport_issue_place')}</TableCell>
							<TableCell sx={{ width: '30%' }}>{person.passportIssuePlace}</TableCell>
							<TableCell sx={{ width: '20%' }}>{t('forms.inputs.person.national_number')}</TableCell>
							<TableCell sx={{ width: '30%' }}>{person.nationalNumber}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell sx={{ width: '20% !important' }}>{t('forms.inputs.person.address')}</TableCell>
							<TableCell sx={{ width: '30%' }}>{person.address}</TableCell>
							<TableCell sx={{ width: '20%' }}>{t('forms.inputs.person.gps_location')}</TableCell>
							<TableCell sx={{ width: '30%' }}>{person.gpsLocation}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell sx={{ width: '20% !important' }}>{t('forms.inputs.person.phone')}</TableCell>
							<TableCell sx={{ width: '80%' }} colSpan={3}>{person.phone}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell sx={{ width: '20% !important' }}>{t('forms.inputs.person.email')}</TableCell>
							<TableCell sx={{ width: '80%' }} colSpan={3}>{person.email}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell sx={{ width: '20% !important' }}>{t('forms.inputs.person.notes')}</TableCell>
							<TableCell sx={{ width: '80%' }} colSpan={3}>{person.notes}</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Grid>
		</Grid>
	)
}
