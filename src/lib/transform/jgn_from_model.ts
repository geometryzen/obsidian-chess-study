import { JgnContent } from '../store/JgnContent';
import { ChessStudyModel } from '../tree/ChessStudyModel';
import { jgn_moves_from_node } from './jgn_moves_from_node';

export function jgn_from_model(
	model: ChessStudyModel,
	version: string,
): JgnContent {
	const fileContents: JgnContent = {
		version: version,
		comment: model.comment,
		headers: model.headers,
		rootFEN: model.rootFEN,
		moves: jgn_moves_from_node(model.root), // We must compute the moves from the model.root.
	};
	return fileContents;
}
