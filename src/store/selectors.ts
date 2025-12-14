/**
 * Memoized selectors for accessing editor state
 *
 * Selectors provide a clean API for accessing state from the store
 * and can be easily memoized for performance optimization in future phases.
 *
 * Usage with Zustand:
 *   const document = useEditorStore(selectDocument);
 *   const block = useEditorStore(selectBlockById(blockId));
 */

import type { EditorState } from "@/types/editor";
import type { BlockId, Block, Document } from "@/types/block";

/**
 * Select the entire document
 */
export const selectDocument = (state: EditorState): Document => state.document;

/**
 * Select a specific block by ID
 *
 * @param id - The block ID to select
 * @returns A selector function that retrieves the block
 */
export const selectBlockById =
  (id: BlockId) =>
  (state: EditorState): Block | undefined =>
    state.document.blocks[id];

/**
 * Select all root-level block IDs in order
 */
export const selectRootBlockIds = (state: EditorState): BlockId[] =>
  state.document.rootBlockIds;

/**
 * Select the currently focused block ID
 */
export const selectFocusedBlockId = (state: EditorState): BlockId | null =>
  state.ui.focusedBlockId;

/**
 * Select the current selection state
 */
export const selectSelection = (state: EditorState) => state.selection;

/**
 * Select all blocks as a map
 */
export const selectBlocks = (state: EditorState): Record<BlockId, Block> =>
  state.document.blocks;

/**
 * Select the document title
 */
export const selectDocumentTitle = (state: EditorState): string =>
  state.document.title;
