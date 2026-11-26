/**
 * Copy the built plugin into an Obsidian vault, for local development.
 *
 * No default path: this repo is public, and a vault path is specific to
 * whoever is running it. Point CHESS_STUDY_VAULT_PLUGIN_DIR at
 * `<vault>/.obsidian/plugins/chess-study` before running `npm run deploy`.
 * e.g. export CHESS_STUDY_VAULT_PLUGIN_DIR=~/Development/Chess/.obsidian/plugins/chess-study
 */
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const target = process.env.CHESS_STUDY_VAULT_PLUGIN_DIR;

if (!target) {
	console.error(
		'Set CHESS_STUDY_VAULT_PLUGIN_DIR to <vault>/.obsidian/plugins/chess-study first.',
	);
	process.exit(1);
}

if (!existsSync(target)) {
	console.error(`Target plugin folder does not exist: ${target}`);
	process.exit(1);
}

for (const file of ['main.js', 'styles.css', 'manifest.json']) {
	copyFileSync(file, join(target, file));
	console.log(`Copied ${file} -> ${join(target, file)}`);
}

console.log('\nReload the plugin in Obsidian to pick up the changes.');
