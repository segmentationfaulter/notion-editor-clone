/**
 * Block type definitions using discriminated unions
 *
 * Phase 1 includes only basic text blocks:
 * - Paragraph
 * - Heading (levels 1, 2, 3)
 *
 * Future phases will add more block types (lists, toggles, code blocks, etc.)
 */

import type { RichText } from "@/types/richText";

/**
 * Unique identifier for blocks
 */
export type BlockId = string;

/**
 * Base properties shared by all block types
 */
export type BaseBlock = {
  /** Unique identifier for this block */
  id: BlockId;

  /** Array of child block IDs (empty in Phase 1, used in Phase 6 for nesting) */
  children: BlockId[];

  /** Timestamp when block was created */
  createdAt: number;

  /** Timestamp when block was last updated */
  updatedAt: number;
};

/**
 * Paragraph block - standard text block
 */
export type ParagraphBlock = BaseBlock & {
  type: "paragraph";
  content: RichText[];
};

/**
 * Heading block - supports 3 heading levels
 */
export type HeadingBlock = BaseBlock & {
  type: "heading1" | "heading2" | "heading3";
  content: RichText[];
};

/**
 * Discriminated union of all block types
 *
 * Phase 1 only includes Paragraph and Heading blocks.
 * Future phases will extend this union with additional block types.
 *
 * The discriminated union pattern allows TypeScript to narrow types
 * based on the `type` field, enabling type-safe block rendering.
 */
export type Block = ParagraphBlock | HeadingBlock;

/**
 * Document structure with normalized, flat block storage
 */
export type Document = {
  /** Unique identifier for the document */
  id: string;

  /** Document title */
  title: string;

  /**
   * Array of top-level block IDs in display order
   * Phase 1: All blocks are top-level (flat structure)
   * Phase 6: Will add nested blocks (parent-child relationships)
   */
  rootBlockIds: BlockId[];

  /**
   * Normalized flat storage of all blocks
   * Key: BlockId, Value: Block
   *
   * This flat structure enables:
   * - O(1) block lookups
   * - Efficient updates without deep nesting
   * - Easy serialization
   */
  blocks: Record<BlockId, Block>;

  /** Timestamp when document was created */
  createdAt: number;

  /** Timestamp when document was last updated */
  updatedAt: number;
};
