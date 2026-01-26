import { App, MarkdownRenderChild } from 'obsidian';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ChessStudyDataAdapter, ChessStudyFileData } from 'src/lib/storage';
import { ChessStudyPluginSettings } from './obsidian/ChessStudyPluginSettingsTab';
import { ChessStudy } from './react/ChessStudy';

/**
 * This is not the Obsidian Plugin.
 * Instead it is an implementation that renders inside markdown.
 */
export class ChessStudyMarkdownRenderChild extends MarkdownRenderChild {
	root: ReactDOM.Root;
	source: string;
	app: App;
	settings: ChessStudyPluginSettings;
	data: ChessStudyFileData;
	dataAdapter: ChessStudyDataAdapter;

	/**
	 * The constructor is called from the Obsidian Plugin onload method.
	 * We get to define the constructor because we call it, not Obsidian.
	 * @param containerEL
	 * @param source
	 * @param app
	 * @param settings
	 * @param data
	 * @param dataAdapter
	 */
	constructor(
		containerEL: HTMLElement,
		source: string,
		app: App,
		settings: ChessStudyPluginSettings,
		data: ChessStudyFileData,
		dataAdapter: ChessStudyDataAdapter,
	) {
		super(containerEL);
		this.source = source;
		this.app = app;
		this.settings = settings;
		this.data = data;
		this.dataAdapter = dataAdapter;
	}

	/**
	 * @override
	 */
	onload(): void {
		this.root = ReactDOM.createRoot(this.containerEl);
		this.root.render(
			<React.StrictMode>
				<ChessStudy
					source={this.source}
					app={this.app}
					pluginSettings={this.settings}
					chessStudyData={this.data}
					dataAdapter={this.dataAdapter}
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
