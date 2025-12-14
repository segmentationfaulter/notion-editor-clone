import { useEditor } from "@/hooks/useEditor";
import { useEditorStore } from "@/store/editorStore";
import { selectRootBlockIds } from "@/store/selectors";

function App() {
  const { document, createBlock, updateBlockContent } = useEditor();
  const rootBlockIds = useEditorStore(selectRootBlockIds);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 font-sans">
      <h1 className="text-2xl font-bold">Zustand Store Test</h1>

      <div className="flex flex-col gap-2">
        <p>
          <strong>Document ID:</strong> {document.id}
        </p>
        <p>
          <strong>Title:</strong> {document.title}
        </p>
        <p>
          <strong>Root Block Count:</strong> {rootBlockIds.length}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-bold">Blocks:</h2>
        <div className="flex flex-col gap-2">
          {rootBlockIds.map((blockId) => {
            const block = document.blocks[blockId];
            const content =
              block.type === "paragraph" || block.type.startsWith("heading")
                ? block.content.map((rt) => rt.text).join("")
                : "";
            return (
              <div key={blockId} className="p-2 border border-gray-300 rounded">
                <div>
                  <strong>Type:</strong> {block.type}
                </div>
                <div>
                  <strong>Content:</strong> {content || "(empty)"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            const lastBlockId = rootBlockIds[rootBlockIds.length - 1];
            createBlock(lastBlockId, "paragraph");
          }}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add Paragraph
        </button>
        <button
          onClick={() => {
            const lastBlockId = rootBlockIds[rootBlockIds.length - 1];
            createBlock(lastBlockId, "heading1");
          }}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          Add Heading
        </button>
        <button
          onClick={() => {
            const firstBlockId = rootBlockIds[0];
            updateBlockContent(firstBlockId, [
              {
                text: `Updated at ${new Date().toLocaleTimeString()}`,
                marks: [],
              },
            ]);
          }}
          className="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
        >
          Update First Block
        </button>
      </div>
    </div>
  );
}

export default App;
