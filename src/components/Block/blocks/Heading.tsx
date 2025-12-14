import type { HeadingBlock } from "@/types";
import { renderRichText } from "@/utils/richText";

type HeadingProps = {
  block: HeadingBlock;
};

/**
 * Heading block component
 *
 * Renders heading blocks (H1, H2, H3) based on the block type.
 * Uses discriminated union type narrowing to determine the correct HTML tag.
 */
export function Heading({ block }: HeadingProps) {
  const Tag =
    block.type === "heading1" ? "h1" : block.type === "heading2" ? "h2" : "h3";

  // Tailwind classes for each heading level
  const className =
    block.type === "heading1"
      ? "mb-2 mt-6 text-3xl font-bold leading-tight"
      : block.type === "heading2"
        ? "mb-2 mt-4 text-2xl font-semibold leading-snug"
        : "mb-2 mt-3 text-xl font-semibold leading-normal";

  return <Tag className={className}>{renderRichText(block.content)}</Tag>;
}
