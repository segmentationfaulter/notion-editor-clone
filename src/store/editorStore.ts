/**
 * Main Zustand store
 *
 * This store manages the entire editor state including:
 * - Document (blocks and content)
 * - Selection state
 * - UI state
 *
 * Uses Zustand with Immer middleware for immutable state updates.
 * DevTools middleware is enabled in development for debugging.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
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
 * Uses Zustand with Immer middleware for simplified immutable updates.
 * The immer middleware allows us to write "mutating" code that is automatically
 * converted to immutable updates.
 *
 * DevTools middleware is conditionally applied only in development mode
 * for debugging state changes with Redux DevTools browser extension.
 */
export const useEditorStore = create<EditorStore>()(
  devtools(
    immer((set, get) => ({
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
        set((draft) => {
          const block = draft.document.blocks[blockId];
          if (!block) return;

          // Type narrowing: only ParagraphBlock and HeadingBlock have content
          if (block.type === "paragraph" || block.type.startsWith("heading")) {
            block.content = content;
            block.updatedAt = Date.now();
            draft.document.updatedAt = Date.now();
          }
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

        set((draft) => {
          // Add to blocks map
          draft.document.blocks[newBlockId] = newBlock;

          // Insert into rootBlockIds
          if (afterBlockId === null) {
            // Append to end
            draft.document.rootBlockIds.push(newBlockId);
          } else {
            // Insert after specified block
            const index = draft.document.rootBlockIds.indexOf(afterBlockId);
            if (index !== -1) {
              draft.document.rootBlockIds.splice(index + 1, 0, newBlockId);
            } else {
              // If afterBlockId not found, append to end
              draft.document.rootBlockIds.push(newBlockId);
            }
          }

          draft.document.updatedAt = Date.now();
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
        set((draft) => {
          // Don't delete if it's the last block
          if (draft.document.rootBlockIds.length <= 1) {
            return;
          }

          // Remove from blocks map
          delete draft.document.blocks[blockId];

          // Remove from rootBlockIds array
          const index = draft.document.rootBlockIds.indexOf(blockId);
          if (index !== -1) {
            draft.document.rootBlockIds.splice(index, 1);
          }

          draft.document.updatedAt = Date.now();
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
        set((draft) => {
          const currentIndex = draft.document.rootBlockIds.indexOf(blockId);

          // Can't merge if it's the first block
          if (currentIndex <= 0) return;

          const previousBlockId = draft.document.rootBlockIds[currentIndex - 1];
          const previousBlock = draft.document.blocks[previousBlockId];
          const currentBlock = draft.document.blocks[blockId];

          if (!previousBlock || !currentBlock) return;

          // Only merge if both blocks have content property
          if (
            (previousBlock.type === "paragraph" ||
              previousBlock.type.startsWith("heading")) &&
            (currentBlock.type === "paragraph" ||
              currentBlock.type.startsWith("heading"))
          ) {
            // Concatenate content
            previousBlock.content.push(...currentBlock.content);
            previousBlock.updatedAt = Date.now();

            // Remove current block
            delete draft.document.blocks[blockId];
            draft.document.rootBlockIds.splice(currentIndex, 1);

            draft.document.updatedAt = Date.now();
          }
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

        set((draft) => {
          const currentIndex = draft.document.rootBlockIds.indexOf(blockId);
          if (currentIndex === -1) return;

          const currentBlock = draft.document.blocks[blockId];
          if (!currentBlock) return;

          // Update current block with "before" content
          if (
            currentBlock.type === "paragraph" ||
            currentBlock.type.startsWith("heading")
          ) {
            currentBlock.content = beforeText
              ? [{ text: beforeText, marks: [] }]
              : [];
            currentBlock.updatedAt = Date.now();
          }

          // Add new block to blocks map
          draft.document.blocks[newBlockId] = newBlock;

          // Insert new block after current block in rootBlockIds
          draft.document.rootBlockIds.splice(currentIndex + 1, 0, newBlockId);

          draft.document.updatedAt = Date.now();
        });

        return newBlockId;
      },

      /**
       * Set the currently focused block
       *
       * @param blockId - ID of the block to focus, or null to clear focus
       */
      setFocusedBlock: (blockId) => {
        set((draft) => {
          draft.ui.focusedBlockId = blockId;
        });
      },
    })),
    {
      name: "EditorStore",
      enabled: import.meta.env.DEV,
    },
  ),
);
