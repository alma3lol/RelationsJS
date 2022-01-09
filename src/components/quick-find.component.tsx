import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSigma } from "react-sigma-v2";
import { appContext } from "../App";
import { Neo4jSigmaGraph } from "../neo4j-sigma-graph";

export type QuickFindProps = {
	show: boolean;
	onClose: () => void;
}

export const QuickFind: React.FC<QuickFindProps> = ({ show, onClose }) => {
	const { t } = useTranslation();
	const { enqueueSnackbar } = useSnackbar();
	const { driver, database } = useContext(appContext);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const sigma = useSigma();
	const searchItems = async () => {
		setLoading(true);
		if (driver) {
			const neo4jSigmaGraph = new Neo4jSigmaGraph(sigma.getGraph(), driver, { database });
			const nodes = await neo4jSigmaGraph.searchNodes(search);
			if (nodes.length === 0) {
				enqueueSnackbar(t("quick_find.no_results"), { variant: "warning" });
			} else {
				sigma.getGraph().clear();
				for (const node of nodes) {
					neo4jSigmaGraph.addNodeToGraph(node);
				}
				// refresh graph
				sigma.refresh();
			}
			onCloseWithReset();
		}
	}
	// combine `onClose` with reset results & search, errors, loading
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

