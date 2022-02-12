import { Autocomplete, Button, Card, CardActionArea, CardActions, CardMedia, Grid, TextField, Typography } from "@mui/material";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import { createRef, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { appContext } from "../../App";
import { Transcript } from "../../models";
import { Neo4jSigmaGraph } from "../../neo4j-sigma-graph";
import AddIconDarkSvg from '../../images/add-dark.svg';
import AddIconLightSvg from '../../images/add-light.svg';
import { toJS } from "mobx";
import moment from "moment";

export type TranscriptFormProps = {
	transcript: Transcript;
};

export const TranscriptForm = observer<TranscriptFormProps>(({ transcript }) => {
	const { t } = useTranslation();
	const { theme } = useContext(appContext);
	const [persons, setPersons] = useState<{ id: string, label: string }[]>([]);
	useEffect(() => {
		const personRepo = Neo4jSigmaGraph.getInstance().getRepository('PERSON');
		if (personRepo) {
			personRepo.read().then(records => {
				setPersons(records.map(person => ({ id: person.id, label: person.arabicName })));
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const addAttachmentsInputRef = createRef<HTMLInputElement>();
	const handleAddAttachments = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			const newFiles: File[] = []
			for (let i = 0; i < e.currentTarget.files.length; i++) {
				newFiles.push(e.currentTarget.files[i]);
			}
			e.currentTarget.files = null;
			transcript.setAttachments(_.uniq(_.concat(transcript.attachments, newFiles)));
		}
	}, [transcript]);
	const handleDeleteAttachment = useCallback((idx: number) => {
		transcript.setAttachments(transcript.attachments.filter((__, i) => i !== idx));
	}, [transcript])
	return (
		<Grid item container spacing={2}>
			<Grid item xs={6}>
				<TextField
					label={t('forms.inputs.transcript.title')}
					required
					fullWidth
					value={transcript.title}
					onChange={e => transcript.setTitle(e.target.value)}
					/>
			</Grid>
			<Grid item xs={6}>
				<TextField
					label={t('forms.inputs.transcript.date')}
					required
					fullWidth
					value={moment(transcript.date).format('YYYY-MM-DD')}
					onChange={e => {
						if (e.target.value) transcript.setDate(moment(e.target.value).toDate())
					}}
					type='date'
					InputLabelProps={{
						shrink: true,
					}} />
			</Grid>
			<Grid item xs={12}>
				<TextField
					label={t('forms.inputs.transcript.content')}
					required
					fullWidth
					multiline
					rows={6}
					value={transcript.content}
					onChange={e => transcript.setContent(e.target.value)}
					/>
			</Grid>
			<Grid item xs={12}>
				<Autocomplete
					options={persons}
					onChange={(__, value) => transcript.setMentioned(value.map(v => typeof v === 'string' ? { id: v, label: '' } : v))}
					value={toJS(transcript.mentioned)}
					noOptionsText={t('forms.inputs.transcript.no_persons')}
					openOnFocus
					multiple
					filterSelectedOptions
					isOptionEqualToValue={(option, value) => option.id === value.id}
					renderInput={params => (
						<TextField
							{...params}
							label={t("forms.inputs.transcript.mentioned")}
							fullWidth
						/>)
					} />
			</Grid>
			{transcript.attachments.map((attachment, idx) => (
				<Grid item xs={4} key={idx}>
					<Card>
						<CardMedia height='400' component='img' image={URL.createObjectURL(attachment)} />
						<CardActions>
							<Button component='label' fullWidth color='error' variant='contained' onClick={() => handleDeleteAttachment(idx)}>{t('forms.inputs.delete_file')}</Button>
						</CardActions>
					</Card>
				</Grid>
			))}
			<Grid item xs={4}>
				<Card>
					<CardActionArea onClick={() => addAttachmentsInputRef.current?.click()}>
						<input ref={addAttachmentsInputRef} multiple accept='*' hidden type='file' onChange={handleAddAttachments} />
						<CardMedia height='420' component='img' image={theme.palette.mode === 'light' ? AddIconDarkSvg: AddIconLightSvg} />
						<Typography variant='h6' textAlign='center'>{t('forms.inputs.transcript.choose_attachments')}</Typography>
					</CardActionArea>
				</Card>
			</Grid>
		</Grid>
	);
});
