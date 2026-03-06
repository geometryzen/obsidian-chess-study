import { JgnMove } from './JgnMove';
import { JgnStudy } from './JgnStudy';

export function get_jgn_main_line(study: JgnStudy): JgnMove[] {
	return study.moves;
}
