import { JgnContent } from '../jgn/JgnContent';
import { ChessStudyModel } from '../tree/ChessStudyModel';
import { moves_from_node } from './moves_from_node';

export function jgn_from_model(model: ChessStudyModel): JgnContent {
	const fileContents: JgnContent = {
		comment: model.comment,
		headers: model.headers,
		rootFEN: model.rootFEN,
		moves: moves_from_node(model.root), // We must compute the moves from the model.root.
	};
	return fileContents;
}
