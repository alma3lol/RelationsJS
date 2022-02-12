import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Category, Nationality, Person, Transcript } from "../models";
import { Neo4jSigmaGraph, NodeType } from "../neo4j-sigma-graph";
import { RepositorySearch } from "../types";

export type QuickFindProps = {
	show: boolean;
	onClose: () => void;
	onDone: (nodes: (Person | Category | Nationality | Transcript)[]) => void;
}

export const QuickFind: React.FC<QuickFindProps> = ({ show, onClose, onDone }) => {
	const { t } = useTranslation();
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const searchItems = async () => {
		setLoading(true);
		const personSearch: RepositorySearch<Person> = {
			arabicName: { like: search },
			englishName: { like: search },
			motherName: { like: search },
			nickname: { like: search },
			job: { like: search },
			idNumber: { like: search },
			email: { like: search },
			phone: { like: search },
			notes: { like: search },
			fileNumber: { like: search },
			workplace: { like: search },
			birthPlace: { like: search },
			gpsLocation: { like: search },
			restrictions: { inarr: search },
			nationalNumber: { like: search },
			passportNumber: { like: search },
			passportIssuePlace: { like: search },
			registerationNumber: { like: search },
			extra: { inarr: search },
		}
		const transcriptSearch: RepositorySearch<Transcript> = {
			title: { like: search },
			content: { like: search },
		}
		const searchNodeTypes: [NodeType, RepositorySearch<Person | Category | Transcript | Nationality> ][] = [
			['PERSON', personSearch],
			['TRANSCRIPT', transcriptSearch],
		];
		const foundNodes: (Person | Category | Nationality | Transcript)[] = [];
		await Promise.all(searchNodeTypes.map(async nodeType => {
			const repo = Neo4jSigmaGraph.getInstance().getRepository(nodeType[0]);
			if (repo) {
				foundNodes.push(...(await repo.read(nodeType[1])));
			}
		}));
		setLoading(false);
		onDone(foundNodes);
		onCloseWithReset();
	}
	const onCloseWithReset = () => {
		setSearch("");
		setLoading(false);
		onClose();
	}
	return (
		<Dialog
			fullWidth
			open={show}
			onClose={onCloseWithReset}
			aria-labelledby="form-dialog-title">
			<DialogTitle id="form-dialog-title">{t('quick_find.title')}</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label={t('quick_find.search_label')}
					type="text"
					fullWidth
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === "Enter") {
							searchItems();
						}
					}} />
			</DialogContent>
			<DialogActions>
				<Button onClick={() => onCloseWithReset()}>{t('cancel')}</Button>
				<Button disabled={loading} variant='contained' onClick={() => searchItems()} color="primary">{loading ? <CircularProgress /> : t('quick_find.action')}</Button>
			</DialogActions>
		</Dialog>
	);
}

