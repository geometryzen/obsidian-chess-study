import { JSONContent } from '@tiptap/react';
import { Move } from 'chess.js';
import { DrawShape } from 'chessground/draw';
import { nanoid } from 'nanoid';
import { DataAdapter, normalizePath } from 'obsidian';
import { ROOT_FEN } from 'src/main';

export const CURRENT_STORAGE_VERSION = '0.0.2';

/**
 * This interface is part of the serialization structure and should not be changed.
 */
export interface Variant {
	variantId: string;
	parentMoveId: string;
	moves: VariantMove[];
}

/**
 * The design of extending Move seems questionable to me.
 */
export interface VariantMove extends Move {
	moveId: string;
	shapes: DrawShape[];
	comment: JSONContent | null;
}

/**
 * The design of extending Move seems questionable to me.
 * This interface is part of the serialization structure and should not be changed.
 */
export interface ChessStudyMove extends Move {
	moveId: string;
	variants: Variant[];
	shapes: DrawShape[];
	comment: JSONContent | null;
}

/**
 * A version, headers, comment (top level), moves, and a rootFEN.
 * This interface defines the serialization structure and should not be changed.
 */
export interface ChessStudyFileContent {
	/**
	 * The version is not being used at present.
	 */
	version: string;
	/**
	 * The headers are obtained from chess.js, which does the parsing of PGN data.
	 */
	headers: Record<string, string>;
	/**
	 * The top-level comment.
	 */
	comment: JSONContent | null;
	/**
	 * The moves that follow from the root FEN.
	 */
	moves: ChessStudyMove[];
	/**
	 * The starting position.
	 */
	rootFEN: string;
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
