import { deserializePreOrder } from './deserializePreOrder';
import { NeoStudy } from './NeoStudy';
import { serializePreOrder } from './serializePreOrder';

export function neo_clone(study: NeoStudy) {
	const root = deserializePreOrder(serializePreOrder(study.root));
	return new NeoStudy(study.comment, study.headers, root, study.rootFEN);
}
