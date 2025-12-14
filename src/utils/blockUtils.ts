/**
 * Block factory functions for creating new blocks
 *
 * These functions provide a clean, type-safe way to create blocks
 * with proper default values and timestamps.
 */

import type { ParagraphBlock, HeadingBlock, Document } from "@/types";
import { createId } from "@/utils/ids";

/**
 * Create a new paragraph block
 *
 * @param text - Optional initial text content
 * @returns A new ParagraphBlock with generated ID and timestamps
 *
 * @example
 * const block = createParagraphBlock("Hello world");
 * // Returns: { id: "...", type: "paragraph", content: [{ text: "Hello world", marks: [] }], ... }
 */
export function createParagraphBlock(text?: string): ParagraphBlock {
  const now = Date.now();

  return {
    id: createId(),
    type: "paragraph",
    content: text ? [{ text, marks: [] }] : [],
    children: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a new heading block
 *
 * @param level - Heading level (1, 2, or 3)
 * @param text - Optional initial text content
 * @returns A new HeadingBlock with generated ID and timestamps
 *
 * @example
 * const block = createHeadingBlock(1, "My Title");
 * // Returns: { id: "...", type: "heading1", content: [{ text: "My Title", marks: [] }], ... }
 */
export function createHeadingBlock(
  level: 1 | 2 | 3,
  text?: string,
): HeadingBlock {
  const now = Date.now();
  const type = `heading${level}` as "heading1" | "heading2" | "heading3";

  return {
    id: createId(),
    type,
    content: text ? [{ text, marks: [] }] : [],
    children: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create an empty document with a single paragraph block
 *
 * @returns A new Document with one empty paragraph block
 *
 * @example
 * const doc = createEmptyDocument();
 * // Returns: {
 * //   id: "...",
 * //   title: "Untitled",
 * //   rootBlockIds: ["block-id"],
 * //   blocks: { "block-id": { ... paragraph block ... } },
 * //   ...
 * // }
 */
export function createEmptyDocument(): Document {
  const now = Date.now();

  // For Milestone 4 testing: create blocks with sample text to verify rendering
  // TODO: Remove sample text in Milestone 5 when we add contentEditable
  const block1 = createParagraphBlock(
    "This is a test paragraph to verify Milestone 4 rendering works correctly.",
  );
  const block2 = createHeadingBlock(1, "Heading 1 Test");
  const block3 = createHeadingBlock(2, "Heading 2 Test");
  const block4 = createParagraphBlock("Another paragraph block.");

  return {
    id: createId(),
    title: "Untitled",
    rootBlockIds: [block1.id, block2.id, block3.id, block4.id],
    blocks: {
      [block1.id]: block1,
      [block2.id]: block2,
      [block3.id]: block3,
      [block4.id]: block4,
    },
    createdAt: now,
    updatedAt: now,
  };
}
