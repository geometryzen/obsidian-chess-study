/**
 * The initial position can be a move e.g. "1. e4" or "1... e5" or a specially recognized value such as 'begin', 'first', or 'end'.
 */
export type InitialPosition = 'begin' | 'first' | 'end' | string;
export const INITIAL_POSITION_YAML_NAME = 'initialPosition';
export const INITIAL_POSITION_BEGIN: InitialPosition = 'begin';
export const INITIAL_POSITION_END: InitialPosition = 'end';
export const INITIAL_POSITION_FIRST: InitialPosition = 'first';
