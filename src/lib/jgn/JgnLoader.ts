import { nanoid } from 'nanoid';
import { DataAdapter, normalizePath } from 'obsidian';
import { ROOT_FEN } from '../chess-logic/ROOT_FEN';
import { jgn_from_model } from '../transform/jgn_from_model';
import { model_from_jgn } from '../transform/model_from_jgn';
import { NeoStudy } from '../tree/NeoStudy';
import { JgnStudy } from './JgnStudy';

interface UnwantedMoveProperties {
	before: string | undefined;
	captured: string | undefined;
	flags: string | undefined;
	lan: string | undefined;
	piece: string | undefined;
}

export class JgnLoader {
	/**
	 * The adapter is an Obsidian thing.
	 */
	readonly #adapter: DataAdapter;
	readonly #studiesPath: string;

	constructor(adapter: DataAdapter, studiesPath: string) {
		this.#adapter = adapter;
		this.#studiesPath = studiesPath;
	}

	async save(model: NeoStudy, id?: string): Promise<string> {
		const jgn = jgn_from_model(model);
		return this.saveFile(jgn, id);
	}

	async saveFile(jgn: JgnStudy, id?: string): Promise<string> {
		const chessStudyId = id || nanoid();
		/*
		console.lg(
			`Writing file to ${normalizePath(
				`${this.#studiesPath}/${chessStudyId}.json`,
			)}`,
		);
		*/

		await this.#adapter.write(
			normalizePath(`${this.#studiesPath}/${chessStudyId}.json`),
			JSON.stringify(jgn, null, 2),
			{},
		);

		return chessStudyId;
	}

	async load(id: string): Promise<NeoStudy> {
		const jgnStudy = await this.loadFile(id);
		return model_from_jgn(jgnStudy);
	}

	async loadFile(id: string): Promise<JgnStudy> {
		/*
		console.lg(
			`Reading file from ${normalizePath(`${this.#studiesPath}/${id}.json`)}`,
		);
		*/

		const data = await this.#adapter.read(
			normalizePath(`${this.#studiesPath}/${id}.json`),
		);

		const fileContent = JSON.parse(data) as JgnStudy;

		// Perform conversions based upon version or otherwise.
		const moves = fileContent.moves;
		for (let i = 0; i < moves.length; i++) {
			const move = moves[i];
			if (!Array.isArray(move.nags)) {
				move.nags = [];
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const x = move as any as UnwantedMoveProperties;
			if (x.before) {
				x.before = void 0;
			}
			if (x.captured) {
				x.captured = void 0;
			}
			if (x.flags) {
				x.flags = void 0;
			}
			if (x.lan) {
				x.lan = void 0;
			}
			if (x.piece) {
				x.piece = void 0;
			}
		}

		// Make sure data is compatible with version 0.0.1.
		if (!fileContent.rootFEN) {
			return { ...fileContent, rootFEN: ROOT_FEN };
		}

		return fileContent;
	}

	async createStudiesFolderIfNotExists() {
		const folderExists = await this.#adapter.exists(this.#studiesPath);

		if (!folderExists) {
			// console.lg(`Creating studies folder at: ${this.#studiesPath}`);
			this.#adapter.mkdir(this.#studiesPath);
		}
	}
}
