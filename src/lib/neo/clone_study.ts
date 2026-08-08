import { clone_move } from './clone_move';
import { NeoStudy } from './NeoStudy';

export function clone_study(study: NeoStudy) {
	const root = study.root ? clone_move(study.root) : null;
	return new NeoStudy(
		study.comment,
		study.shapes,
		study.headers,
		root,
		study.rootFEN,
	);
}
