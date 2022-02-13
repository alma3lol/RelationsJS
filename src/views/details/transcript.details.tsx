import {
    Box,
	Chip,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Theme,
	Stack,
    Card,
    CardMedia,
    CardContent,
	Typography,
    CardActions,
    Tooltip,
    IconButton,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Transcript } from "../../models";
import { appContext } from "../../App";
import { useContext } from "react";
import {
	Download as DownloadIcon,
} from "@mui/icons-material";

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
	},
}));

export type TranscriptDetailsProps = {
	transcript: Transcript;
	onMentionedClick: (id: string) => void;
	print?: true
};

export const TranscriptDetails: React.FC<TranscriptDetailsProps> = ({ transcript, onMentionedClick, print }) => {
	const { t } = useTranslation();
	const { theme } = useContext(appContext);
	const classes = useStyles();
	const handleDownloadAttachment = async (attachment: File) => {
		window.files.saveFile((await attachment.arrayBuffer()), t('forms.inputs.transcripts.save_attachment'), attachment.name);
	}
	return (
		<Grid item container spacing={2} px={2} pb={2} className={classes.container}>
			<Grid item flexGrow={1}>
				<Table className={classes.table}>
					<TableBody>
						<TableRow>
							<TableCell>{t('forms.inputs.transcript.date')}</TableCell>
							<TableCell>{moment(transcript.date).format('YYYY-MM-DD')}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell><Box height={theme.spacing(15)}>{t('forms.inputs.transcript.content')}</Box></TableCell>
							<TableCell><Box height={theme.spacing(15)}>{transcript.content}</Box></TableCell>
						</TableRow>
						<TableRow>
							<TableCell>{t('forms.inputs.transcript.mentioned')}</TableCell>
							<TableCell>
								<Stack spacing={1} direction={print ? 'column' : 'row' }>
									{transcript.mentioned.map(mentioned => 
										!print ? <Chip key={mentioned.id} label={mentioned.label} onClick={() => onMentionedClick(mentioned.id)} />
										: <Typography key={mentioned.id}>{mentioned.label}</Typography>
									)}
								</Stack>
							</TableCell>
						</TableRow>
						{!print &&
							<TableRow>
								<TableCell>{t('forms.inputs.transcript.attachments')}</TableCell>
								<TableCell>
									<Grid container spacing={2}>
										{transcript.attachments.map(attachment => (
											<Grid item xs={4} key={attachment.name}>
												<Card>
													<CardMedia sx={{ height: 250 }} component='img' src={URL.createObjectURL(attachment)} />
													<CardContent>
														<Typography noWrap variant='caption'>{attachment.name}</Typography>
													</CardContent>
													<CardActions>
														<Tooltip title={t('download')}>
															<IconButton size='small' onClick={() => handleDownloadAttachment(attachment)}>
																<DownloadIcon />
															</IconButton>
														</Tooltip>
													</CardActions>
												</Card>
											</Grid>
										))}
									</Grid>
								</TableCell>
							</TableRow>
						}
					</TableBody>
				</Table>
			</Grid>
		</Grid>
	)
}
