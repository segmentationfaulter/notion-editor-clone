/**
 * Custom hook for accessing a specific block by ID
 *
 * This hook provides convenient access to individual blocks from the store.
 * It's optimized to only re-render when the specific block changes.
 *
 * @example
 * function BlockComponent({ id }: { id: BlockId }) {
 *   const block = useBlock(id);
 *   // Use block data...
 * }
 */

import { useEditorStore } from "@/store/editorStore";
import { selectBlockById } from "@/store/selectors";
import type { Block, BlockId } from "@/types/block";

/**
 * Hook to get a specific block by ID
 *
 * @param id - The ID of the block to retrieve
 * @returns The block with the given ID
 *
 * Note: This hook assumes the block exists. In production code,
 * you may want to handle the undefined case more gracefully.
 */
export function useBlock(id: BlockId): Block {
  const block = useEditorStore(selectBlockById(id));

  if (!block) {
    throw new Error(`Block with id "${id}" not found`);
  }

  return block;
}
