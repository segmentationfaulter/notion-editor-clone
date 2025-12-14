/**
 * Custom hook for accessing editor state and actions
 *
 * This hook provides a convenient API for components to interact with
 * the editor store without directly importing the store or selectors.
 *
 * @example
 * function MyComponent() {
 *   const { document, updateBlockContent, createBlock } = useEditor();
 *   // Use editor state and actions...
 * }
 */

import { useEditorStore } from "@/store/editorStore";
import { selectDocument } from "@/store/selectors";

/**
 * Hook to access editor state and actions
 *
 * Returns commonly used editor state and all available actions.
 * Components can destructure only what they need.
 */
export function useEditor() {
  const document = useEditorStore(selectDocument);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const createBlock = useEditorStore((s) => s.createBlock);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const mergeBlockWithPrevious = useEditorStore(
    (s) => s.mergeBlockWithPrevious,
  );
  const splitBlock = useEditorStore((s) => s.splitBlock);
  const setFocusedBlock = useEditorStore((s) => s.setFocusedBlock);

  return {
    document,
    updateBlockContent,
    createBlock,
    deleteBlock,
    mergeBlockWithPrevious,
    splitBlock,
    setFocusedBlock,
  };
}
