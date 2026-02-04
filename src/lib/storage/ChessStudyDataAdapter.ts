import { nanoid } from 'nanoid';
import { DataAdapter, normalizePath } from 'obsidian';
import { ROOT_FEN } from 'src/main';
import { ChessStudyFileContent } from '.';

interface UnwantedMoveProperties {
	before: string | undefined;
	captured: string | undefined;
	flags: string | undefined;
	lan: string | undefined;
	piece: string | undefined;
}

export class ChessStudyDataAdapter {
	/**
	 * The adapter is an Obsidian thing.
	 */
	readonly #adapter: DataAdapter;
	readonly #storagePath: string;

	constructor(adapter: DataAdapter, storagePath: string) {
		this.#adapter = adapter;
		this.#storagePath = storagePath;
	}

	async saveFile(fileContent: ChessStudyFileContent, id?: string) {
		const chessStudyId = id || nanoid();
		/*
		console.lg(
			`Writing file to ${normalizePath(
				`${this.#storagePath}/${chessStudyId}.json`,
			)}`,
		);
		*/

		await this.#adapter.write(
			normalizePath(`${this.#storagePath}/${chessStudyId}.json`),
			JSON.stringify(fileContent, null, 2),
			{},
		);

		return chessStudyId;
	}

	async loadFile(id: string): Promise<ChessStudyFileContent> {
		/*
		console.lg(
			`Reading file from ${normalizePath(`${this.#storagePath}/${id}.json`)}`,
		);
		*/

		const data = await this.#adapter.read(
			normalizePath(`${this.#storagePath}/${id}.json`),
		);

		const fileContent = JSON.parse(data) as ChessStudyFileContent;

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

		// Make sure data is compatible with storage version 0.0.1.
		if (!fileContent.rootFEN) {
			return { ...fileContent, rootFEN: ROOT_FEN };
		}

		return fileContent;
	}

	async createStorageFolderIfNotExists() {
		const folderExists = await this.#adapter.exists(this.#storagePath);

		if (!folderExists) {
			// console.lg(`Creating storage folder at: ${this.#storagePath}`);
			this.#adapter.mkdir(this.#storagePath);
		}
	}
}
