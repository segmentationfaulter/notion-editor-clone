/**
 * Main Zustand store
 *
 * This store manages the entire editor state including:
 * - Document (blocks and content)
 * - Selection state
 * - UI state
 *
 * Uses vanilla Zustand with standard immutable update patterns.
 */

import { create } from "zustand";
import type { EditorState, Block, BlockId, RichText } from "@/types";
import {
  createEmptyDocument,
  createParagraphBlock,
  createHeadingBlock,
} from "@/utils/blockUtils";

/**
 * Extended editor store with actions
 */
type EditorStore = EditorState & {
  // Block Actions
  updateBlockContent: (blockId: BlockId, content: RichText[]) => void;
  createBlock: (afterBlockId: BlockId | null, type: Block["type"]) => BlockId;
  deleteBlock: (blockId: BlockId) => void;
  mergeBlockWithPrevious: (blockId: BlockId) => void;
  splitBlock: (blockId: BlockId, offset: number) => BlockId;

  // UI Actions
  setFocusedBlock: (blockId: BlockId | null) => void;
};

/**
 * Main editor store
 *
 * Uses vanilla Zustand with immutable updates via spread operators.
 */
export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial State
  document: createEmptyDocument(),
  selection: null,
  ui: {
    focusedBlockId: null,
  },

  /**
   * Update the content of a specific block
   *
   * @param blockId - ID of the block to update
   * @param content - New RichText content array
   */
  updateBlockContent: (blockId, content) => {
    set((state) => {
      const block = state.document.blocks[blockId];
      if (!block) return state;

      // Type narrowing: only ParagraphBlock and HeadingBlock have content
      if (block.type === "paragraph" || block.type.startsWith("heading")) {
        return {
          ...state,
          document: {
            ...state.document,
            blocks: {
              ...state.document.blocks,
              [blockId]: {
                ...block,
                content,
                updatedAt: Date.now(),
              },
            },
            updatedAt: Date.now(),
          },
        };
      }

      return state;
    });
  },

  /**
   * Create a new block and insert it into the document
   *
   * @param afterBlockId - ID of block to insert after, or null to append to end
   * @param type - Type of block to create
   * @returns The ID of the newly created block
   */
  createBlock: (afterBlockId, type) => {
    // Create new block based on type
    let newBlock: Block;

    if (type === "paragraph") {
      newBlock = createParagraphBlock();
    } else if (type.startsWith("heading")) {
      const level = parseInt(type.replace("heading", "")) as 1 | 2 | 3;
      newBlock = createHeadingBlock(level);
    } else {
      // Default to paragraph for unknown types
      newBlock = createParagraphBlock();
    }

    const newBlockId = newBlock.id;

    set((state) => {
      let newRootBlockIds: BlockId[];

      if (afterBlockId === null) {
        // Append to end
        newRootBlockIds = [...state.document.rootBlockIds, newBlockId];
      } else {
        // Insert after specified block
        const index = state.document.rootBlockIds.indexOf(afterBlockId);
        if (index !== -1) {
          newRootBlockIds = [
            ...state.document.rootBlockIds.slice(0, index + 1),
            newBlockId,
            ...state.document.rootBlockIds.slice(index + 1),
          ];
        } else {
          // If afterBlockId not found, append to end
          newRootBlockIds = [...state.document.rootBlockIds, newBlockId];
        }
      }

      return {
        ...state,
        document: {
          ...state.document,
          blocks: {
            ...state.document.blocks,
            [newBlockId]: newBlock,
          },
          rootBlockIds: newRootBlockIds,
          updatedAt: Date.now(),
        },
      };
    });

    return newBlockId;
  },

  /**
   * Delete a block from the document
   *
   * @param blockId - ID of the block to delete
   *
   * Note: Will not delete the last remaining block in the document
   */
  deleteBlock: (blockId) => {
    set((state) => {
      // Don't delete if it's the last block
      if (state.document.rootBlockIds.length <= 1) {
        return state;
      }

      // Create new blocks object without the deleted block
      const { [blockId]: _, ...remainingBlocks } = state.document.blocks;

      // Remove from rootBlockIds array
      const newRootBlockIds = state.document.rootBlockIds.filter(
        (id) => id !== blockId,
      );

      return {
        ...state,
        document: {
          ...state.document,
          blocks: remainingBlocks,
          rootBlockIds: newRootBlockIds,
          updatedAt: Date.now(),
        },
      };
    });
  },

  /**
   * Merge current block with the previous block
   *
   * Concatenates the current block's content to the previous block
   * and deletes the current block.
   *
   * Used when pressing Backspace at the start of a block.
   *
   * @param blockId - ID of the block to merge with its predecessor
   */
  mergeBlockWithPrevious: (blockId) => {
    set((state) => {
      const currentIndex = state.document.rootBlockIds.indexOf(blockId);

      // Can't merge if it's the first block
      if (currentIndex <= 0) return state;

      const previousBlockId = state.document.rootBlockIds[currentIndex - 1];
      const previousBlock = state.document.blocks[previousBlockId];
      const currentBlock = state.document.blocks[blockId];

      if (!previousBlock || !currentBlock) return state;

      // Only merge if both blocks have content property
      if (
        (previousBlock.type === "paragraph" ||
          previousBlock.type.startsWith("heading")) &&
        (currentBlock.type === "paragraph" ||
          currentBlock.type.startsWith("heading"))
      ) {
        // Create new blocks object with updated previous block and removed current block
        const { [blockId]: _, ...blocksWithoutCurrent } = state.document.blocks;

        const updatedPreviousBlock = {
          ...previousBlock,
          content: [...previousBlock.content, ...currentBlock.content],
          updatedAt: Date.now(),
        };

        // Remove current block from rootBlockIds
        const newRootBlockIds = state.document.rootBlockIds.filter(
          (id) => id !== blockId,
        );

        return {
          ...state,
          document: {
            ...state.document,
            blocks: {
              ...blocksWithoutCurrent,
              [previousBlockId]: updatedPreviousBlock,
            },
            rootBlockIds: newRootBlockIds,
            updatedAt: Date.now(),
          },
        };
      }

      return state;
    });
  },

  /**
   * Split a block at the specified cursor position
   *
   * Splits the current block into two blocks:
   * - Current block keeps content before cursor
   * - New paragraph block gets content after cursor
   *
   * Used when pressing Enter in the middle of a block.
   *
   * @param blockId - ID of the block to split
   * @param offset - Character offset where to split (0-based)
   * @returns The ID of the newly created block
   */
  splitBlock: (blockId, offset) => {
    const block = get().document.blocks[blockId];
    if (!block) return "";

    // Only split blocks that have content
    if (block.type !== "paragraph" && !block.type.startsWith("heading")) {
      return "";
    }

    // Get the full text content
    const fullText = block.content.map((rt) => rt.text).join("");

    // Split content at offset
    const beforeText = fullText.slice(0, offset);
    const afterText = fullText.slice(offset);

    // Create new paragraph with "after" content
    const newBlock = createParagraphBlock(afterText);
    const newBlockId = newBlock.id;

    set((state) => {
      const currentIndex = state.document.rootBlockIds.indexOf(blockId);
      if (currentIndex === -1) return state;

      // Update current block with "before" content
      const updatedBlock = {
        ...block,
        content: beforeText ? [{ text: beforeText, marks: [] }] : [],
        updatedAt: Date.now(),
      };

      // Insert new block after current block in rootBlockIds
      const newRootBlockIds = [
        ...state.document.rootBlockIds.slice(0, currentIndex + 1),
        newBlockId,
        ...state.document.rootBlockIds.slice(currentIndex + 1),
      ];

      return {
        ...state,
        document: {
          ...state.document,
          blocks: {
            ...state.document.blocks,
            [blockId]: updatedBlock,
            [newBlockId]: newBlock,
          },
          rootBlockIds: newRootBlockIds,
          updatedAt: Date.now(),
        },
      };
    });

    return newBlockId;
  },

  /**
   * Set the currently focused block
   *
   * @param blockId - ID of the block to focus, or null to clear focus
   */
  setFocusedBlock: (blockId) => {
    set((state) => ({
      ...state,
      ui: {
        ...state.ui,
        focusedBlockId: blockId,
      },
    }));
  },
}));
