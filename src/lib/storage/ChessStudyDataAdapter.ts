import { DataAdapter, normalizePath } from 'obsidian';
import { ChessStudyFileContent } from '.';
import { nanoid } from 'nanoid';
import { ROOT_FEN } from 'src/main';

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
