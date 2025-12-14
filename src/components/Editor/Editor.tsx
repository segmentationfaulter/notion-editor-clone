import { Block } from "@/components/Block";
import { useEditor } from "@/hooks";

/**
 * Top-level Editor component
 *
 * Renders the document by mapping over rootBlockIds and rendering
 * each block using the polymorphic Block component.
 */
export function Editor() {
  const {
    document: { rootBlockIds },
  } = useEditor();

  return (
    <div className="mx-auto max-w-3xl px-5 py-15 font-sans leading-relaxed text-gray-800">
      {rootBlockIds.map((id) => (
        <Block key={id} id={id} />
      ))}
    </div>
  );
}
