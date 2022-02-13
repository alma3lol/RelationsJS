import { Button, Grid, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { TranscriptForm } from "../../components";
import { Transcript } from "../../models";
import { Neo4jSigmaGraph } from "../../neo4j-sigma-graph";
import { Repository } from "../../types";

export const TranscriptEdit = observer(() => {
	const [transcript, setTranscript] = useState<Transcript | null>(null)
	const [loading, setLoading] = useState(true);
	const { enqueueSnackbar } = useSnackbar();
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (transcript) {
			const repo: Repository<Transcript, string> = Neo4jSigmaGraph.getInstance().getRepository('TRANSCRIPT');
			if (repo) {
				try {
					await repo.update(id, transcript);
					enqueueSnackbar(t('forms.success.transcript.edit'), { variant: 'success' });
					navigate('/list');
				} catch (e) {
					console.log(e)
					enqueueSnackbar(t('forms.error.transcript.edit'), { variant: 'error' });
				}
			}
		}
	}
	const handleInvalid = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		enqueueSnackbar(t('forms.invalid.form'), { variant: 'warning' });
	}
	const fetchPerson = async () => {
		const repo: Repository<Transcript, string> = Neo4jSigmaGraph.getInstance().getRepository('TRANSCRIPT');
		if (repo) {
			try {
				repo.readById(id).then(setTranscript);
			} catch (error) {
				console.error(error);
			}
		}
		setLoading(false)
	}
	useEffect(() => {
		fetchPerson();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	if (loading) return <div>Loading...</div>
	if (!transcript) return null;
	return (
		<form onSubmit={handleSubmit} onInvalid={handleInvalid}>
			<Grid container spacing={2} p={3} sx={{ overflow: 'auto', height: '100vh' }} justifyContent='space-between'>
				<Grid item xs={12}>
					<Typography>{t('forms.edit.transcript', { title: transcript.title })}</Typography>
				</Grid>
				<Grid item container xs={12}>
					<TranscriptForm transcript={transcript} />
				</Grid>
				<Grid item>
					<Stack spacing={2} direction='row'>
						<Button color='inherit' onClick={() => navigate('/list')}>{t('cancel')}</Button>
						<Button variant='contained' color='primary' type='submit'>{t('edit')}</Button>
					</Stack>
				</Grid>
			</Grid>
		</form>
	)
});
