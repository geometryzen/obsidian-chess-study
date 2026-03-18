import { JgnStudy } from '../jgn/JgnStudy';
import { NeoStudy } from '../neo/NeoStudy';
import { moves_from_node } from './moves_from_node';

export function jgn_from_neo(neoStudy: NeoStudy): JgnStudy {
	const jgnStudy: JgnStudy = {
		comment: neoStudy.comment,
		shapes: neoStudy.shapes,
		headers: neoStudy.headers,
		rootFEN: neoStudy.rootFEN,
		moves: moves_from_node(neoStudy.root),
	};
	return jgnStudy;
}
