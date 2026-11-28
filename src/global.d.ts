// TypeScript does not recognize .css files as valid modules by default,
// causing an error when you perform a side-effect import, like import './main.css'.
// This is common in Obsidian plugin or web app setups where a bundler (like esbuild) handles CSS extraction.
declare module '*.css';
