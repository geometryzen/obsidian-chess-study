/**
 * The completed position can be a position in FEN notation or 'end' or left blank (meaning end).
 */
export type CompletedPosition = 'end' | string;
export const COMPLETED_POSITION_YAML_NAME = 'completedPosition';
export const COMPLETED_POSITION_END: CompletedPosition = 'end';
