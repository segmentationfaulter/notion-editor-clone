# Phase 1: Foundation - Implementation Plan

**Version:** 1.0
**Last Updated:** 2025-12-10
**Status:** Ready for Implementation

---

## Overview

Phase 1 establishes the fundamental architecture for the Notion-style block editor. This phase focuses exclusively on foundational features: basic block rendering (Paragraph, Heading 1/2/3), simple text editing via contentEditable, and essential keyboard interactions (Enter to create blocks, Backspace to merge).

**What Phase 1 Includes:**
- Project scaffolding with React 19+, TypeScript, Vite
- Core type system with discriminated unions
- Zustand + Immer state management
- Polymorphic block rendering
- ContentEditable text editing
- Basic keyboard shortcuts (Enter/Backspace)

**What Phase 1 Excludes:**
- Slash commands (Phase 3)
- Rich text formatting (Phase 4)
- Drag and drop (Phase 5)
- Block selection & arrow navigation (Phase 2)
- Nested blocks (Phase 6)
- Undo/redo (Phase 7)

---

## Implementation Strategy

Phase 1 is divided into **6 self-contained milestones**, each building incrementally on the previous. Each milestone can be implemented, tested, and committed independently.

**Milestone Flow:**
```
M1: Scaffolding → M2: Types → M3: Store → M4: Rendering → M5: Editing → M6: Keyboard
```

**Total Estimated Scope:** ~15-20 files, ~800-1200 lines of code

---

## Milestone 1: Project Scaffolding & Configuration

**Goal:** Set up a working React + TypeScript + Vite project with all necessary dependencies.

### Files to Create

**Configuration Files:**
```
package.json              - Dependencies and scripts
tsconfig.json            - TypeScript strict mode config
tsconfig.node.json       - TypeScript config for Vite
vite.config.ts          - Vite build configuration
.gitignore              - Ignore node_modules, dist
```

**Entry Points:**
```
index.html              - HTML entry with root div
src/main.tsx           - React entry point
src/App.tsx            - Root App component (placeholder)
```

**Directory Structure:**
```
src/
├── components/
│   ├── Editor/
│   ├── Block/
│   │   └── blocks/
│   └── ui/
├── store/
│   └── actions/
├── hooks/
├── types/
├── utils/
└── tests/
```

### Dependencies to Install

**Core:**
- `react@latest`, `react-dom@latest` (React 19+)
- `typescript@latest` (TypeScript 5.7+)
- `vite@latest`, `@vitejs/plugin-react@latest` (Vite 6+)

**State Management:**
- `zustand@latest` (Zustand 5+)
- `immer@latest` (Immer 10+)

**Utilities:**
- `nanoid@latest` (unique ID generation)

**Type Definitions:**
- `@types/react@latest`
- `@types/react-dom@latest`

**Note:** Always use the latest stable versions of dependencies. Use `npm install <package>@latest` or check package versions before installing.

### Key Configuration Details

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### Acceptance Criteria

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server on port 5173
- [ ] Browser shows "Hello World" at http://localhost:5173
- [ ] TypeScript strict mode enabled (no implicit any)
- [ ] Hot module replacement (HMR) works when editing files
- [ ] All folder structure created
- [ ] Git commit: "chore: initialize project with React + TypeScript + Vite"

### Critical Implementation Notes

- Use `"type": "module"` in package.json for native ESM
- Set `jsx: "react-jsx"` for new JSX transform (no need to import React)
- Enable `isolatedModules: true` for Vite compatibility
- Add `"strict": true` to catch type errors early

---

## Milestone 2: Core Type Definitions

**Goal:** Define all TypeScript types for blocks, documents, and editor state. Establish type safety foundation.

### Files to Create

**Type Definitions:**
```
src/types/block.ts       - Block type definitions (discriminated unions)
src/types/editor.ts      - Editor state types
src/types/richText.ts    - RichText and Mark types
src/types/index.ts       - Barrel export for types
```

**Utilities:**
```
src/utils/ids.ts         - ID generation using nanoid
src/utils/blockUtils.ts  - Block factory functions
```

### Type System Design

**Block Types (Discriminated Unions):**
```typescript
type BlockId = string;

interface BaseBlock {
  id: BlockId;
  children: BlockId[];
  createdAt: number;
  updatedAt: number;
}

interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  content: RichText[];
}

interface HeadingBlock extends BaseBlock {
  type: 'heading1' | 'heading2' | 'heading3';
  content: RichText[];
}

type Block = ParagraphBlock | HeadingBlock;
```

**RichText Model (Simple for Phase 1):**
```typescript
interface RichText {
  text: string;
  marks: Mark[];
}

interface Mark {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'link';
  attrs?: { href?: string };
}
```

**Document Structure:**
```typescript
interface Document {
  id: string;
  title: string;
  rootBlockIds: BlockId[];           // Flat array of top-level blocks
  blocks: Record<BlockId, Block>;    // Normalized block storage
  createdAt: number;
  updatedAt: number;
}
```

**Editor State (Minimal for Phase 1):**
```typescript
interface EditorState {
  document: Document;
  selection: Selection | null;
  ui: {
    focusedBlockId: BlockId | null;
  };
}

interface Selection {
  type: 'caret' | 'range';
  anchorBlockId: BlockId;
  anchorOffset: number;
  focusBlockId: BlockId;
  focusOffset: number;
}
```

### Factory Functions

```typescript
// utils/ids.ts
export function createBlockId(): string {
  return nanoid();
}

// utils/blockUtils.ts
export function createParagraphBlock(text?: string): ParagraphBlock {
  return {
    id: createBlockId(),
    type: 'paragraph',
    content: text ? [{ text, marks: [] }] : [],
    children: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createHeadingBlock(
  level: 1 | 2 | 3,
  text?: string
): HeadingBlock {
  return {
    id: createBlockId(),
    type: `heading${level}` as 'heading1' | 'heading2' | 'heading3',
    content: text ? [{ text, marks: [] }] : [],
    children: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createEmptyDocument(): Document {
  const initialBlock = createParagraphBlock();
  return {
    id: nanoid(),
    title: 'Untitled',
    rootBlockIds: [initialBlock.id],
    blocks: {
      [initialBlock.id]: initialBlock,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
```

### Acceptance Criteria

- [ ] All types compile with no errors in strict mode
- [ ] Block types use discriminated unions (type narrowing works)
- [ ] Factory functions properly typed and tested
- [ ] Can import types from `/types` barrel export
- [ ] Zero `any` types in codebase
- [ ] JSDoc comments on all public interfaces
- [ ] Git commit: "feat: add core type definitions and factory functions"

### Critical Implementation Notes

- Use discriminated unions with `type` field for exhaustive checking
- Keep Phase 1 types minimal - don't add Phase 2+ types yet
- Use `Readonly<>` sparingly - Immer handles immutability
- Export both types and factory functions from modules
- Don't implement nested blocks yet (children always empty in Phase 1)

---

## Milestone 3: Zustand Store with Immer

**Goal:** Set up global state management with Zustand and Immer middleware. Implement core block manipulation actions.

### Files to Create

```
src/store/editorStore.ts         - Main Zustand store with Immer
src/store/actions/blockActions.ts - Block CRUD operations
src/store/selectors.ts           - Memoized selectors
src/hooks/useEditor.ts           - Hook to access store
src/hooks/useBlock.ts            - Hook to get specific block
```

### Store Architecture

**Store Setup:**
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface EditorStore extends EditorState {
  // Block Actions
  updateBlockContent: (blockId: BlockId, content: RichText[]) => void;
  createBlock: (afterBlockId: BlockId | null, type: Block['type']) => BlockId;
  deleteBlock: (blockId: BlockId) => void;
  mergeBlockWithPrevious: (blockId: BlockId) => void;
  splitBlock: (blockId: BlockId, offset: number) => BlockId;

  // UI Actions
  setFocusedBlock: (blockId: BlockId | null) => void;
}

export const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    // Initial state
    document: createEmptyDocument(),
    selection: null,
    ui: { focusedBlockId: null },

    // Actions
    updateBlockContent: (blockId, content) => {
      set((draft) => {
        const block = draft.document.blocks[blockId];
        if (block) {
          block.content = content;
          block.updatedAt = Date.now();
        }
      });
    },

    // ... more actions
  }))
);
```

### Core Actions to Implement

**1. updateBlockContent(blockId, content)**
- Update text content of a block
- Set updatedAt timestamp
- Used on every keystroke

**2. createBlock(afterBlockId, type)**
- Create new block of specified type
- Insert after given block ID (or at end if null)
- Add to both `blocks` map and `rootBlockIds` array
- Return new block ID for focus management

**3. deleteBlock(blockId)**
- Remove block from `blocks` map
- Remove from `rootBlockIds` array
- Handle edge case: don't delete last block

**4. mergeBlockWithPrevious(blockId)**
- Concatenate current block content to previous block
- Delete current block
- Used for Backspace at start of block

**5. splitBlock(blockId, offset)**
- Split block content at cursor position
- Update current block with "before" content
- Create new paragraph with "after" content
- Insert new block after current
- Return new block ID

### Selectors

```typescript
// store/selectors.ts
export const selectDocument = (state: EditorStore) => state.document;

export const selectBlockById = (id: BlockId) => (state: EditorStore) =>
  state.document.blocks[id];

export const selectRootBlockIds = (state: EditorStore) =>
  state.document.rootBlockIds;

export const selectFocusedBlockId = (state: EditorStore) =>
  state.ui.focusedBlockId;
```

### Custom Hooks

```typescript
// hooks/useBlock.ts
export function useBlock(id: BlockId): Block {
  return useEditorStore(selectBlockById(id));
}

// hooks/useEditor.ts
export function useEditor() {
  const document = useEditorStore(selectDocument);
  const updateBlockContent = useEditorStore(s => s.updateBlockContent);
  const createBlock = useEditorStore(s => s.createBlock);
  const deleteBlock = useEditorStore(s => s.deleteBlock);
  const mergeBlockWithPrevious = useEditorStore(s => s.mergeBlockWithPrevious);
  const splitBlock = useEditorStore(s => s.splitBlock);

  return {
    document,
    updateBlockContent,
    createBlock,
    deleteBlock,
    mergeBlockWithPrevious,
    splitBlock,
  };
}
```

### Acceptance Criteria

- [ ] Store initializes with empty document (one paragraph)
- [ ] `updateBlockContent` updates state immutably (verify with React DevTools)
- [ ] `createBlock` adds block to correct position in rootBlockIds
- [ ] `deleteBlock` removes from both blocks map and rootBlockIds array
- [ ] `mergeBlockWithPrevious` concatenates content correctly
- [ ] `splitBlock` creates new block with proper content split
- [ ] Can access state via `useEditorStore()` hook
- [ ] Can access specific block via `useBlock(id)` hook
- [ ] TypeScript infers correct types for all actions
- [ ] Git commit: "feat: implement Zustand store with block actions"

### Critical Implementation Notes

- Use Immer's `set` with draft state - mutate draft directly
- Always update both `blocks` and `rootBlockIds` together
- Set `updatedAt` timestamp on every block modification
- Return new block ID from `createBlock` and `splitBlock` for focus management
- Handle empty content edge cases in merge/split operations
- Don't delete last block in document (leave at least one)
- For splitBlock: empty content after split should create empty RichText array

---

## Milestone 4: Block Rendering Infrastructure

**Goal:** Create polymorphic Block component and individual block type components. Render blocks from store state.

### Files to Create

```
src/components/Editor/Editor.tsx           - Top-level editor container
src/components/Editor/Editor.module.css    - Editor styles
src/components/Editor/index.ts             - Barrel export

src/components/Block/Block.tsx             - Polymorphic block wrapper
src/components/Block/Block.module.css      - Block styles
src/components/Block/index.ts              - Barrel export

src/components/Block/blocks/Paragraph.tsx  - Paragraph component
src/components/Block/blocks/Heading.tsx    - Heading component (h1/h2/h3)
src/components/Block/blocks/index.ts       - Barrel export

src/utils/richText.ts                      - RichText utilities
```

### Component Architecture

**Editor Component (Top Level):**
```tsx
export function Editor() {
  const rootBlockIds = useEditorStore(selectRootBlockIds);

  return (
    <div className={styles.editor}>
      <div className={styles.content}>
        {rootBlockIds.map((id, index) => (
          <Block key={id} id={id} index={index} />
        ))}
      </div>
    </div>
  );
}
```

**Polymorphic Block Component:**
```tsx
interface BlockProps {
  id: BlockId;
  index: number;
}

export function Block({ id, index }: BlockProps) {
  const block = useBlock(id);

  const BlockComponent = getBlockComponent(block.type);

  return (
    <div className={styles.blockWrapper} data-block-id={id}>
      <BlockComponent block={block} />
    </div>
  );
}

function getBlockComponent(type: Block['type']) {
  switch (type) {
    case 'paragraph':
      return Paragraph;
    case 'heading1':
    case 'heading2':
    case 'heading3':
      return Heading;
    default:
      return Paragraph;
  }
}
```

**Block Type Components:**
```tsx
// Paragraph.tsx
export function Paragraph({ block }: { block: ParagraphBlock }) {
  return (
    <p className={styles.paragraph}>
      {renderRichText(block.content)}
    </p>
  );
}

// Heading.tsx
export function Heading({ block }: { block: HeadingBlock }) {
  const Tag = block.type === 'heading1' ? 'h1'
            : block.type === 'heading2' ? 'h2'
            : 'h3';

  return (
    <Tag className={styles[block.type]}>
      {renderRichText(block.content)}
    </Tag>
  );
}
```

### RichText Utilities (Phase 1 - Simple)

```typescript
// utils/richText.ts

// For Phase 1, only handle plain text (ignore marks)
export function richTextToPlainText(content: RichText[]): string {
  return content.map(rt => rt.text).join('');
}

export function plainTextToRichText(text: string): RichText[] {
  if (!text) return [];
  return [{ text, marks: [] }];
}

// Basic rendering for display (no marks in Phase 1)
export function renderRichText(content: RichText[]): string {
  return richTextToPlainText(content);
}
```

### Styling (CSS Modules)

**Editor.module.css:**
```css
.editor {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: #333;
}

.content {
  outline: none;
}
```

**Block.module.css:**
```css
.blockWrapper {
  position: relative;
  margin: 4px 0;
}

.paragraph {
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  padding: 4px 0;
}

.heading1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin: 24px 0 8px;
}

.heading2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
  margin: 16px 0 8px;
}

.heading3 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  margin: 12px 0 8px;
}
```

### Update App.tsx

```tsx
import { Editor } from './components/Editor';
import './App.css';

function App() {
  return <Editor />;
}

export default App;
```

### Acceptance Criteria

- [ ] Editor renders with initial paragraph block
- [ ] Can manually add blocks to store (via DevTools) and see them render
- [ ] Paragraphs render as `<p>` tags
- [ ] Headings render as `<h1>`, `<h2>`, `<h3>` based on type
- [ ] Block type determination works via discriminated union
- [ ] CSS styling applied correctly (typography, spacing)
- [ ] No console errors or warnings
- [ ] TypeScript types compile without errors
- [ ] Git commit: "feat: implement block rendering infrastructure"

### Critical Implementation Notes

- Use `data-block-id` attribute for later DOM querying
- Don't implement contentEditable yet - just static display
- Keep RichText rendering simple (plain text only in Phase 1)
- Use TypeScript type narrowing with discriminated unions
- Prepare structure for future features but don't implement:
  - No drag handles yet (Phase 5)
  - No nested block rendering (Phase 6)
- Use CSS Modules for scoped styling
- Include `index` prop for debugging but don't display it

---

## Milestone 5: ContentEditable Text Editing

**Goal:** Enable text editing within blocks using contentEditable. Handle input, maintain cursor position, sync DOM to state.

### Files to Create

```
src/components/Block/EditableContent.tsx       - ContentEditable wrapper
src/components/Block/EditableContent.module.css - Editable styles
src/hooks/useContentEditable.ts                - ContentEditable logic hook
src/utils/selection.ts                         - Cursor position utilities
```

### Files to Modify

```
src/components/Block/blocks/Paragraph.tsx      - Use EditableContent
src/components/Block/blocks/Heading.tsx        - Use EditableContent
src/utils/richText.ts                          - Add HTML conversion
```

### EditableContent Component

```tsx
interface EditableContentProps {
  blockId: BlockId;
  content: RichText[];
  as?: 'p' | 'h1' | 'h2' | 'h3';
  placeholder?: string;
}

export function EditableContent({
  blockId,
  content,
  as: Element = 'p',
  placeholder = 'Type something...'
}: EditableContentProps) {
  const ref = useRef<HTMLElement>(null);
  const updateBlockContent = useEditorStore(s => s.updateBlockContent);
  const setFocusedBlock = useEditorStore(s => s.setFocusedBlock);

  // Convert RichText to HTML for contentEditable
  const html = useMemo(() => richTextToHtml(content), [content]);

  const handleInput = useCallback((e: FormEvent<HTMLElement>) => {
    const htmlContent = e.currentTarget.innerHTML;
    const newContent = htmlToRichText(htmlContent);
    updateBlockContent(blockId, newContent);
  }, [blockId, updateBlockContent]);

  const handleFocus = useCallback(() => {
    setFocusedBlock(blockId);
  }, [blockId, setFocusedBlock]);

  const handleBlur = useCallback(() => {
    // Optional: clear focused block
  }, []);

  return (
    <Element
      ref={ref}
      className={styles.editable}
      contentEditable
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: html }}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-placeholder={content.length === 0 ? placeholder : undefined}
    />
  );
}
```

### HTML ↔ RichText Conversion (Phase 1 - Simple)

```typescript
// utils/richText.ts (extend)

export function richTextToHtml(content: RichText[]): string {
  if (content.length === 0) return '';
  // Phase 1: just escape HTML, no mark rendering
  return content.map(rt => escapeHtml(rt.text)).join('');
}

export function htmlToRichText(html: string): RichText[] {
  // Strip all HTML tags, get plain text
  const text = stripHtmlTags(html);
  if (!text) return [];
  return [{ text, marks: [] }];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtmlTags(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}
```

### Styling

**EditableContent.module.css:**
```css
.editable {
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  cursor: text;
}

.editable:empty::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}

.editable:focus {
  /* Optional: subtle focus indicator */
}
```

### Update Block Components

```tsx
// Paragraph.tsx
export function Paragraph({ block }: { block: ParagraphBlock }) {
  return (
    <EditableContent
      blockId={block.id}
      content={block.content}
      as="p"
      placeholder="Type something..."
    />
  );
}

// Heading.tsx
export function Heading({ block }: { block: HeadingBlock }) {
  const tag = block.type === 'heading1' ? 'h1'
            : block.type === 'heading2' ? 'h2'
            : 'h3';

  const placeholder = block.type === 'heading1' ? 'Heading 1'
                    : block.type === 'heading2' ? 'Heading 2'
                    : 'Heading 3';

  return (
    <EditableContent
      blockId={block.id}
      content={block.content}
      as={tag}
      placeholder={placeholder}
    />
  );
}
```

### Acceptance Criteria

- [ ] Can click into any block and type text
- [ ] Text updates appear in browser immediately
- [ ] State updates on input (verify in React DevTools)
- [ ] Cursor position maintained while typing
- [ ] Empty blocks show placeholder text
- [ ] Can type multiline text (Shift+Enter works)
- [ ] No console warnings about contentEditable
- [ ] Text properly escaped (test with `<script>alert('xss')</script>`)
- [ ] Focused block tracked in state
- [ ] Git commit: "feat: implement contentEditable text editing"

### Critical Implementation Notes

- Use `suppressContentEditableWarning` to avoid React warning
- Use `dangerouslySetInnerHTML` for initial render only
- Don't update DOM while user is typing - let browser handle it
- Use `onInput` not `onChange` for contentEditable
- Escape HTML entities to prevent XSS attacks
- Store focused block ID for keyboard navigation (next milestone)
- Use CSS `::before` pseudo-element for placeholder
- Use `useCallback` for event handlers to prevent re-renders
- Test with rapid typing to ensure no cursor jumping

---

## Milestone 6: Keyboard Interactions (Enter & Backspace)

**Goal:** Implement fundamental keyboard shortcuts: Enter creates blocks, Backspace merges blocks.

### Files to Create

```
src/hooks/useBlockKeyboard.ts    - Block keyboard event handling
src/utils/dom.ts                 - DOM manipulation helpers
```

### Files to Modify

```
src/utils/selection.ts           - Add cursor position detection
src/components/Block/EditableContent.tsx - Add keyboard handler
```

### Cursor Position Detection

```typescript
// utils/selection.ts

export function getCursorPosition(element: HTMLElement | null): {
  offset: number;
  atStart: boolean;
  atEnd: boolean;
} | null {
  if (!element) return null;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!element.contains(range.commonAncestorContainer)) return null;

  // Check if at start
  const atStart = range.startOffset === 0 &&
                  range.startContainer === getFirstTextNode(element);

  // Check if at end
  const textContent = element.textContent || '';
  const atEnd = range.endOffset === textContent.length;

  const offset = range.startOffset;

  return { offset, atStart, atEnd };
}

function getFirstTextNode(element: HTMLElement): Node {
  return element.firstChild || element;
}

export function setCursorPosition(element: HTMLElement, offset: number): void {
  const range = document.createRange();
  const selection = window.getSelection();

  if (!selection) return;

  const textNode = element.firstChild || element;
  const safeOffset = Math.min(offset, (textNode.textContent || '').length);

  try {
    range.setStart(textNode, safeOffset);
    range.setEnd(textNode, safeOffset);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (e) {
    console.warn('Failed to set cursor position', e);
  }
}
```

### Keyboard Handler Hook

```typescript
// hooks/useBlockKeyboard.ts

export function useBlockKeyboard(blockId: BlockId) {
  const splitBlock = useEditorStore(s => s.splitBlock);
  const mergeBlockWithPrevious = useEditorStore(s => s.mergeBlockWithPrevious);
  const document = useEditorStore(s => s.document);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    const position = getCursorPosition(e.currentTarget);
    if (!position) return;

    // Enter key - split block at cursor
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const newBlockId = splitBlock(blockId, position.offset);

      // Focus new block after React renders
      requestAnimationFrame(() => {
        focusBlock(newBlockId, 0);
      });
    }

    // Backspace at start - merge with previous
    if (e.key === 'Backspace' && position.atStart) {
      const blockIndex = document.rootBlockIds.indexOf(blockId);

      // Don't merge if first block
      if (blockIndex === 0) return;

      e.preventDefault();

      const previousBlockId = document.rootBlockIds[blockIndex - 1];
      const previousBlock = document.blocks[previousBlockId];

      // Calculate cursor position in previous block (at merge point)
      const previousLength = richTextToPlainText(previousBlock.content).length;

      mergeBlockWithPrevious(blockId);

      // Restore focus to previous block at merge point
      requestAnimationFrame(() => {
        focusBlock(previousBlockId, previousLength);
      });
    }
  }, [blockId, splitBlock, mergeBlockWithPrevious, document]);

  return { handleKeyDown };
}

function focusBlock(blockId: BlockId, offset: number): void {
  const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
  if (!blockElement) return;

  const editableElement = blockElement.querySelector('[contenteditable]') as HTMLElement;
  if (!editableElement) return;

  editableElement.focus();
  setCursorPosition(editableElement, offset);
}
```

### Integrate with EditableContent

```tsx
// EditableContent.tsx (modify)

export function EditableContent({
  blockId,
  content,
  as: Element = 'p',
  placeholder = 'Type something...'
}: EditableContentProps) {
  const ref = useRef<HTMLElement>(null);
  const updateBlockContent = useEditorStore(s => s.updateBlockContent);
  const setFocusedBlock = useEditorStore(s => s.setFocusedBlock);

  const { handleKeyDown } = useBlockKeyboard(blockId);

  // ... existing code ...

  return (
    <Element
      ref={ref}
      className={styles.editable}
      contentEditable
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: html }}
      onInput={handleInput}
      onKeyDown={handleKeyDown}  // Add keyboard handler
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-placeholder={content.length === 0 ? placeholder : undefined}
    />
  );
}
```

### Edge Cases to Handle

**Enter Key:**
- Enter at start of heading → create paragraph before heading
- Enter at end of block → create new empty paragraph below
- Enter in middle of text → split content at cursor

**Backspace Key:**
- Backspace at start of first block → do nothing (no merge)
- Backspace at start of paragraph → merge with previous
- Backspace at start of heading → merge with previous

### Acceptance Criteria

- [ ] Pressing Enter creates new paragraph block below
- [ ] Cursor moves to new block after Enter
- [ ] Enter in middle of text splits content correctly
- [ ] Enter at start of heading creates paragraph before
- [ ] Backspace at start of block merges with previous
- [ ] Cursor positioned at merge point after Backspace merge
- [ ] Backspace on first block does nothing
- [ ] Shift+Enter creates line break (browser default)
- [ ] Can type normally with shortcuts working
- [ ] No console errors during keyboard operations
- [ ] Git commit: "feat: implement Enter and Backspace keyboard shortcuts"

### Critical Implementation Notes

- Use `e.preventDefault()` for Enter and Backspace only when needed
- Use `requestAnimationFrame` for all focus operations (ensures DOM updated)
- Query DOM with `data-block-id` attribute to find blocks
- Restore cursor position after state changes using Selection API
- Don't interfere with Shift+Enter (line breaks)
- Calculate merge point before merging (previous block length)
- Handle edge case: empty blocks (offset is 0)
- Use `querySelector` with `[contenteditable]` to find editable element
- Test thoroughly with different block types and content lengths

---

## Final Phase 1 Integration & Testing

### Integration Checklist

**Smoke Test Operations:**
- [ ] Create document with multiple block types
- [ ] Type text in each block type (paragraph, h1, h2, h3)
- [ ] Press Enter to create new blocks
- [ ] Press Backspace to merge blocks
- [ ] Verify state updates in React DevTools
- [ ] Check no console errors or warnings

**Edge Case Testing:**
- [ ] Empty document (should have one empty paragraph)
- [ ] Single block document
- [ ] Long text in block (500+ characters)
- [ ] Rapid typing (no cursor jumping)
- [ ] Rapid Enter/Backspace combinations
- [ ] Enter at start/middle/end of blocks
- [ ] Backspace on first block (should do nothing)

**Developer Experience:**
- [ ] Add ESLint config for code quality
- [ ] Add Prettier for formatting
- [ ] Update README with setup instructions
- [ ] Add JSDoc comments to complex functions
- [ ] Verify HMR works smoothly

### Phase 1 Complete - Acceptance Criteria

**From Specification:**
- [x] Can render document with multiple paragraphs and headings (H1, H2, H3)
- [x] Can type text in any block
- [x] Enter creates new paragraph below current block
- [x] Backspace at start of block merges with previous block
- [x] State updates immutably via Zustand + Immer

**Additional Criteria:**
- [ ] TypeScript strict mode with zero errors
- [ ] No console errors or warnings
- [ ] All files properly organized in folder structure
- [ ] All milestones committed to git
- [ ] Code is well-documented with comments

### Git Workflow

**Commit After Each Milestone:**
```bash
# After M1
git add .
git commit -m "chore: initialize project with React + TypeScript + Vite"

# After M2
git add .
git commit -m "feat: add core type definitions and factory functions"

# After M3
git add .
git commit -m "feat: implement Zustand store with block actions"

# After M4
git add .
git commit -m "feat: implement block rendering infrastructure"

# After M5
git add .
git commit -m "feat: implement contentEditable text editing"

# After M6
git add .
git commit -m "feat: implement Enter and Backspace keyboard shortcuts"

# Tag completion
git tag -a phase-1-complete -m "Phase 1: Foundation complete"
```

---

## What Phase 1 Specifically Excludes

**Not Implementing (Future Phases):**
- Slash command menu → Phase 3
- Block transformation UI → Phase 3
- Rich text formatting (bold, italic, etc.) → Phase 4
- Floating toolbar → Phase 4
- Markdown shortcuts → Phase 4
- Drag and drop → Phase 5
- Block selection with handles → Phase 2
- Arrow key navigation between blocks → Phase 2
- Multi-block selection → Phase 2
- Undo/redo → Phase 7
- Nested blocks (toggles, lists, columns) → Phase 6
- Performance optimization → Phase 8
- Accessibility features → Phase 9

**What We're Building (Phase 1 Only):**
- Basic text editing in paragraph and heading blocks
- Simple keyboard shortcuts (Enter, Backspace)
- Flat block structure (no nesting)
- Plain text only (no formatting marks)
- State management foundation

---

## Learning Outcomes from Phase 1

By completing Phase 1, you'll gain hands-on experience with:

**React Patterns:**
- Modern project setup with Vite and React 19
- Strict TypeScript configuration
- Component composition and polymorphic components
- Custom hooks for reusable logic
- Refs for DOM manipulation

**State Management:**
- Zustand store setup and patterns
- Immer for immutable state updates
- Normalized data structures (flat block storage)
- Selectors and derived state
- State slices and modular organization

**DOM & Browser APIs:**
- ContentEditable API fundamentals
- Selection and Range API basics
- Keyboard event handling
- HTML entity escaping for security
- Programmatic focus management

**TypeScript:**
- Discriminated unions for type safety
- Type narrowing with switch statements
- Factory pattern with proper typing
- Generic types for reusable functions
- Strict mode best practices

**Architecture:**
- Feature-based folder structure
- Separation of concerns (components, hooks, store, utils)
- Barrel exports for clean imports
- CSS Modules for scoped styling

---

## Troubleshooting Guide

### ContentEditable Issues

**Cursor Jumping While Typing:**
- Don't update innerHTML while user is typing
- Let browser handle input naturally
- Only sync on `onInput` event, don't force re-renders

**Focus Not Restoring:**
- Use `requestAnimationFrame` before focus operations
- Ensure DOM is updated before querying
- Check that `data-block-id` attribute exists

**Placeholder Not Showing:**
- Verify `data-placeholder` attribute is set
- Check CSS `::before` pseudo-element
- Ensure content array is empty (not just empty string)

### State Management Issues

**State Not Updating:**
- Verify Immer middleware is applied correctly
- Check that you're mutating draft state, not returning
- Use React DevTools to inspect store state

**Actions Not Working:**
- Check function is properly bound in store
- Verify selectors return correct data
- Use `get()` inside actions to access current state

### TypeScript Errors

**Type Narrowing Not Working:**
- Ensure using discriminated unions with `type` field
- Use switch statements for exhaustive checking
- Don't use `as` type assertions unless necessary

**Callback Type Errors:**
- Properly type event parameters (e.g., `KeyboardEvent<HTMLElement>`)
- Use `useCallback` with correct dependency arrays
- Let TypeScript infer return types where possible

### Keyboard Shortcuts Issues

**Enter/Backspace Not Working:**
- Check `e.preventDefault()` is called
- Verify cursor position detection works
- Ensure `handleKeyDown` is properly bound

**Focus Lost After Operations:**
- Use `requestAnimationFrame` for timing
- Query DOM after state updates complete
- Verify block exists in DOM before focusing

---

## Critical Files Summary

**Most Important Files for Phase 1:**

1. **src/store/editorStore.ts** (150+ lines)
   - Core state management with Zustand+Immer
   - All block manipulation actions
   - Single source of truth

2. **src/types/block.ts** (80+ lines)
   - Type definitions with discriminated unions
   - Provides type safety foundation
   - Enables TypeScript narrowing

3. **src/components/Block/EditableContent.tsx** (100+ lines)
   - ContentEditable wrapper
   - DOM-to-state synchronization
   - Most complex component

4. **src/utils/richText.ts** (80+ lines)
   - HTML ↔ RichText conversion
   - XSS prevention
   - Critical for contentEditable

5. **src/hooks/useBlockKeyboard.ts** (100+ lines)
   - Keyboard interaction logic
   - Enter/Backspace handlers
   - Focus management

---

## Success Metrics

**Phase 1 is complete when:**
- All 6 milestones implemented and tested
- All acceptance criteria met
- Zero TypeScript errors in strict mode
- Zero console errors or warnings
- Can create, edit, and navigate blocks smoothly
- Code is clean, documented, and committed to git

**Ready for Phase 2 when:**
- All Phase 1 features working correctly
- No known bugs or issues
- Code reviewed and refactored if needed
- Documentation updated
- Git tagged: `phase-1-complete`

---

**Next Steps:** Begin implementation with Milestone 1 (Project Scaffolding). Work through milestones sequentially, committing after each one. Focus on quality over speed - Phase 1 is the foundation for everything that follows.