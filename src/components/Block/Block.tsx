import type { BlockId } from "@/types";
import { useBlock } from "@/hooks/useBlock";
import { Paragraph, Heading } from "./blocks";

type BlockProps = {
  id: BlockId;
};

/**
 * Polymorphic Block component
 *
 * Uses TypeScript discriminated union type narrowing to render the
 * appropriate block component based on block type.
 *
 * @param id - Block ID
 */
export function Block({ id }: BlockProps) {
  const block = useBlock(id);

  // Render appropriate component based on block type
  if (block.type === "paragraph") {
    return <Paragraph block={block} />;
  }

  // heading1, heading2, heading3
  return <Heading block={block} />;
}
