import type { ParagraphBlock } from "@/types";
import { renderRichText } from "@/utils/richText";

type ParagraphProps = {
  block: ParagraphBlock;
};

/**
 * Paragraph block component
 *
 * Renders a paragraph block with its text content.
 * In Phase 1, this is a static display component (no contentEditable yet).
 */
export function Paragraph({ block }: ParagraphProps) {
  return (
    <p className="my-1 py-1 text-base leading-relaxed">
      {renderRichText(block.content)}
    </p>
  );
}
