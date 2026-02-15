export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['./src/tests'],
	transformIgnorePatterns: [
		'node_modules/(?!(@mliebelt/pgn-parser|nanoid|node:crypto|obsidian)/)',
	],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
