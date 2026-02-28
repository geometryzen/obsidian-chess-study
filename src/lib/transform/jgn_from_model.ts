import { JgnStudy } from '../jgn/JgnStudy';
import { NeoStudy } from '../tree/NeoStudy';
import { moves_from_node } from './moves_from_node';

export function jgn_from_model(model: NeoStudy): JgnStudy {
	const fileContents: JgnStudy = {
		comment: model.comment,
		headers: model.headers,
		rootFEN: model.rootFEN,
		moves: moves_from_node(model.root), // We must compute the moves from the model.root.
	};
	return fileContents;
}
