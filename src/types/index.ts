/**
 * Barrel export for all type definitions
 *
 * This allows clean imports like:
 *   import { Block, Document, RichText } from '@/types'
 *
 * Instead of:
 *   import { Block } from '@/types/block'
 *   import { Document } from '@/types/document'
 *   import { RichText } from '@/types/richText'
 */

// Block types
export type {
  BlockId,
  BaseBlock,
  ParagraphBlock,
  HeadingBlock,
  Block,
  Document,
} from "@/types/block";

// Rich text types
export type { RichText, Mark } from "@/types/richText";

// Editor state types
export type { EditorState, Selection, UIState } from "@/types/editor";
