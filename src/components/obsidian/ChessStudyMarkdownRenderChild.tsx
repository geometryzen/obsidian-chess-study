import { App, MarkdownRenderChild } from 'obsidian';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
	ChessStudyAppConfig,
	parse_user_config,
} from '../../lib/obsidian/parse_user_config';
import { ChessStudyLoader } from '../../lib/obsidian/ChessStudyLoader';
import { JgnStudy } from '../../lib/jgn/JgnStudy';
import { ChessStudy } from '../react/ChessStudy';
import { ChessStudyPluginSettings } from './ChessStudyPluginSettings';
import { NeoStudy } from '../../lib/tree/NeoStudy';

/**
 * This is not the Obsidian Plugin.
 * Instead it is an implementation that renders inside markdown.
 */
export class ChessStudyMarkdownRenderChild extends MarkdownRenderChild {
	root: ReactDOM.Root;
	source: string;
	app: App;
	settings: ChessStudyPluginSettings;
	readonly #jgnStudy: JgnStudy;
	readonly #neoStudy: NeoStudy;
	readonly #studyLoader: ChessStudyLoader;

	/**
	 * The constructor is called from the Obsidian Plugin onload method.
	 * We get to define the constructor because we call it, not Obsidian.
	 * @param containerEL
	 * @param source
	 * @param app
	 * @param settings
	 * @param jgnStudy
	 * @param studyLoader
	 */
	constructor(
		containerEL: HTMLElement,
		source: string,
		app: App,
		settings: ChessStudyPluginSettings,
		jgnStudy: JgnStudy,
		studyLoader: ChessStudyLoader,
	) {
		super(containerEL);
		this.source = source;
		this.app = app;
		this.settings = settings;
		this.#jgnStudy = jgnStudy;
		this.#studyLoader = studyLoader;
	}

	/**
	 * @override
	 */
	onload(): void {
		// This is where we bootstrap React.
		this.root = ReactDOM.createRoot(this.containerEl);
		// This demonstrates that we can pass parsed configuration to the top-level React component.
		const config: ChessStudyAppConfig = parse_user_config(
			this.settings,
			this.source,
		);
		// is there any reason why we have to pass in the source?
		this.root.render(
			<React.StrictMode>
				<ChessStudy
					source={this.source}
					app={this.app}
					pluginSettings={this.settings}
					initialPos={config.initialPosition}
					config={config}
					jgnStudy={this.#jgnStudy}
					neoStudy={this.#neoStudy}
					studyLoader={this.#studyLoader}
				/>
			</React.StrictMode>,
		);
	}

	/**
	 * @override
	 */
	onunload(): void {
		this.root.unmount();
	}
}
