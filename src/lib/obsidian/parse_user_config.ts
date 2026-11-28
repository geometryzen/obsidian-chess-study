import { parseYaml } from 'obsidian';
import { ChessStudyPluginSettings } from '../../settings';

export type ChessStudyAppConfig = ChessStudyPluginSettings & {
	chessStudyId: string;
};

export const parse_user_config = (
	settings: ChessStudyPluginSettings,
	content: string,
): ChessStudyAppConfig => {
	const chessStudyConfig: ChessStudyAppConfig = {
		...settings,
		chessStudyId: '',
	};

	try {
		return {
			...chessStudyConfig,
			...(parseYaml(content) as ChessStudyAppConfig),
		};
	} catch (e) {
		throw new Error('Something went wrong during parsing. :(', { cause: e });
	}
};
