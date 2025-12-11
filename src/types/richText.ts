/**
 * RichText and Mark type definitions for Phase 1
 *
 * Phase 1 keeps the RichText model simple - just plain text with marks.
 * Marks are not implemented yet but the structure is prepared for Phase 4.
 */

/**
 * A mark represents inline formatting applied to text.
 * Examples: bold, italic, underline, code, links
 */
export type Mark = {
  /** Type of formatting mark */
  type: "bold" | "italic" | "underline" | "strikethrough" | "code" | "link";

  /** Additional attributes for certain mark types (e.g., href for links) */
  attrs?: {
    href?: string;
  };
};

/**
 * RichText represents a text segment with optional formatting marks.
 * The editor uses arrays of RichText to represent block content.
 *
 * Example:
 * - Plain text: [{ text: "Hello", marks: [] }]
 * - Bold text: [{ text: "Hello", marks: [{ type: "bold" }] }]
 * - Mixed: [
 *     { text: "Hello ", marks: [] },
 *     { text: "world", marks: [{ type: "bold" }] }
 *   ]
 */
export type RichText = {
  /** The actual text content */
  text: string;

  /** Array of formatting marks applied to this text segment */
  marks: Mark[];
};
