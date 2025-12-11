/**
 * Editor state types
 *
 * Phase 1 keeps the editor state minimal:
 * - Document (blocks and content)
 * - Selection state (cursor position)
 * - UI state (focused block)
 *
 * Future phases will add:
 * - Drag state (Phase 5)
 * - History state for undo/redo (Phase 7)
 * - Additional UI state (menus, toolbars, etc.)
 */

import type { Document, BlockId } from "@/types/block";

/**
 * Selection state representing cursor position or text selection
 *
 * Phase 1: Basic cursor tracking
 * Phase 2: Will expand for block selection and arrow navigation
 */
export type Selection = {
  /**
   * Type of selection
   * - caret: Single cursor position (no text selected)
   * - range: Text range selection (text is highlighted)
   */
  type: "caret" | "range";

  /**
   * Block ID where selection starts
   * (In Phase 1, this is the currently focused block)
   */
  anchorBlockId: BlockId;

  /**
   * Character offset within the anchor block where selection starts
   * (0 = start of block, text.length = end of block)
   */
  anchorOffset: number;

  /**
   * Block ID where selection ends
   * (For caret, same as anchorBlockId. For range, may differ)
   */
  focusBlockId: BlockId;

  /**
   * Character offset within the focus block where selection ends
   */
  focusOffset: number;
};

/**
 * UI state for ephemeral interface state
 * (state that doesn't need to be persisted or undone)
 */
export type UIState = {
  /**
   * ID of the currently focused block
   * Used for keyboard navigation and styling
   */
  focusedBlockId: BlockId | null;
};

/**
 * Complete editor state
 *
 * This represents the entire state of the editor at any point in time.
 * In Phase 1, we keep it minimal. Future phases will extend this.
 */
export type EditorState = {
  /** The document being edited (blocks, content, metadata) */
  document: Document;

  /**
   * Current text selection/cursor position
   * null = no active selection
   */
  selection: Selection | null;

  /**
   * Ephemeral UI state
   * (menus, focused block, hover states, etc.)
   */
  ui: UIState;
};
