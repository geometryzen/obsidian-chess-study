import { neo_clone_move } from './neo_clone_move';
import { NeoStudy } from './NeoStudy';

export function neo_clone_study(study: NeoStudy) {
	const root = study.root ? neo_clone_move(study.root) : null;
	return new NeoStudy(
		study.comment,
		study.shapes,
		study.headers,
		root,
		study.rootFEN,
	);
}
