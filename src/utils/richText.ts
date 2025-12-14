import type { RichText } from "@/types";

/**
 * Convert RichText array to plain text string
 *
 * For Phase 1, we only handle plain text and ignore marks.
 * Rich text formatting (bold, italic, etc.) will be added in Phase 4.
 *
 * @param content - Array of RichText segments
 * @returns Plain text string with all segments concatenated
 */
export function richTextToPlainText(content: RichText[]): string {
  return content.map((rt) => rt.text).join("");
}

/**
 * Convert plain text string to RichText array
 *
 * Creates a single RichText segment with no marks.
 *
 * @param text - Plain text string
 * @returns Array with single RichText segment, or empty array if text is empty
 */
export function plainTextToRichText(text: string): RichText[] {
  if (!text) return [];
  return [{ text, marks: [] }];
}

/**
 * Render RichText array as plain text for display
 *
 * Phase 1: Returns plain text only (no mark rendering)
 * Phase 4+: Will render marks as HTML (bold, italic, etc.)
 *
 * @param content - Array of RichText segments
 * @returns Plain text string for display
 */
export function renderRichText(content: RichText[]): string {
  return richTextToPlainText(content);
}
