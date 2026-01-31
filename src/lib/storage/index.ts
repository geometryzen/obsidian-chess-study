import { JSONContent } from '@tiptap/react';
import { Move } from 'chess.js';
import { DrawShape } from 'chessground/draw';
import { nanoid } from 'nanoid';
import { DataAdapter, normalizePath } from 'obsidian';
import { ROOT_FEN } from 'src/main';

export const CURRENT_STORAGE_VERSION = '0.0.2';

export interface Variant {
	variantId: string;
	parentMoveId: string;
	moves: VariantMove[];
}

export interface VariantMove extends Move {
	moveId: string;
	shapes: DrawShape[];
	comment: JSONContent | null;
}

export interface ChessStudyMove extends Move {
	moveId: string;
	variants: Variant[];
	shapes: DrawShape[];
	comment: JSONContent | null;
	// TODO: Why do we have this function here?
	// It does not belong
	isCapture(): boolean;
}

export interface ChessStudyFileContent {
	/**
	 * The version is not being used at present.
	 */
	version: string;
	/**
	 * The headers are obtained from chess.js, which does the parsing of PGN data.
	 */
	headers: Record<string, string>;
	comment: JSONContent | null;
	moves: ChessStudyMove[];
	rootFEN: string;
}

export class ChessStudyDataAdapter {
	/**
	 * The adapter is an Obsidian thing.
	 */
	adapter: DataAdapter;
	storagePath: string;

	constructor(adapter: DataAdapter, storagePath: string) {
		this.adapter = adapter;
		this.storagePath = storagePath;
	}

	async saveFile(fileContent: ChessStudyFileContent, id?: string) {
		const chessStudyId = id || nanoid();

		console.log(
			`Writing file to ${normalizePath(
				`${this.storagePath}/${chessStudyId}.json`,
			)}`,
		);

		await this.adapter.write(
			normalizePath(`${this.storagePath}/${chessStudyId}.json`),
			JSON.stringify(fileContent, null, 2),
			{},
		);

		return chessStudyId;
	}

	async loadFile(id: string): Promise<ChessStudyFileContent> {
		console.log(
			`Reading file from ${normalizePath(`${this.storagePath}/${id}.json`)}`,
		);

		const data = await this.adapter.read(
			normalizePath(`${this.storagePath}/${id}.json`),
		);

		const fileContent = JSON.parse(data) as ChessStudyFileContent;

		// Make sure data is compatible with storage version 0.0.1.
		if (!fileContent.rootFEN) {
			return { ...fileContent, rootFEN: ROOT_FEN };
		}

		return fileContent;
	}

	async createStorageFolderIfNotExists() {
		const folderExists = await this.adapter.exists(this.storagePath);

		if (!folderExists) {
			console.log(`Creating storage folder at: ${this.storagePath}`);
			this.adapter.mkdir(this.storagePath);
		}
	}
}
