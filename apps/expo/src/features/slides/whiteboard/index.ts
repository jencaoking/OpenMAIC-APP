/**
 * Whiteboard Module for Mobile.
 *
 * Display layer for whiteboard elements with pan/zoom and history.
 */

// Store
export { useWhiteboardStore } from './whiteboardStore';
export type { WhiteboardSnapshot } from './whiteboardStore';

// Components
export { Whiteboard } from './Whiteboard';
export { WhiteboardCanvas } from './WhiteboardCanvas';
export { WhiteboardHistory } from './WhiteboardHistory';
