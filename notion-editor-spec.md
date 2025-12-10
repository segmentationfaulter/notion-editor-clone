# Notion-Style Block Editor

## Technical Specification & Implementation Guide

---

## Project Overview

A document editor where all content is composed of blocks—paragraphs, headings, lists, code, images, toggles, and more. Blocks can be nested, reordered via drag-and-drop, and transformed between types. The editor supports rich text formatting, keyboard-first navigation, and full undo/redo.

### Goals

1. Build a fully functional block-based editor in React
2. Learn advanced React patterns through practical application
3. Create a portfolio piece demonstrating senior-level React expertise

### Non-Goals

- Backend integration or real-time collaboration (keep it frontend-only)
- Feature parity with Notion (focus on core mechanics)
- Mobile-first design (desktop-first, responsive is a bonus)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18+ | UI framework |
| TypeScript (strict) | Type safety |
| Zustand | Global state management |
| Immer | Immutable state updates |
| dnd-kit | Drag and drop |
| Floating UI | Popover/tooltip positioning |
| Vitest + RTL | Testing |
| CSS Modules or Tailwind | Styling |

---

## Data Model

### Block Structure

```typescript
type BlockId = string; // nanoid or uuid

interface BaseBlock {
  id: BlockId;
  children: BlockId[]; // nested block IDs
  createdAt: number;
  updatedAt: number;
}

interface TextBlock extends BaseBlock {
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'quote';
  content: RichText[];
}

interface ListBlock extends BaseBlock {
  type: 'bulletList' | 'numberedList';
  // children contain listItem blocks
}

interface ListItemBlock extends BaseBlock {
  type: 'listItem';
  content: RichText[];
  // children can contain nested lists
}

interface ToggleBlock extends BaseBlock {
  type: 'toggle';
  content: RichText[]; // toggle header text
  isOpen: boolean;
  // children contain nested blocks
}

interface CodeBlock extends BaseBlock {
  type: 'code';
  content: string; // plain text, not RichText
  language: string;
}

interface DividerBlock extends BaseBlock {
  type: 'divider';
}

interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  caption: RichText[];
}

interface ColumnLayoutBlock extends BaseBlock {
  type: 'columnLayout';
  // children are column blocks
}

interface ColumnBlock extends BaseBlock {
  type: 'column';
  width: number; // percentage or ratio
  // children contain content blocks
}

type Block = 
  | TextBlock 
  | ListBlock 
  | ListItemBlock 
  | ToggleBlock 
  | CodeBlock 
  | DividerBlock 
  | ImageBlock 
  | ColumnLayoutBlock 
  | ColumnBlock;
```

### Rich Text Model

```typescript
interface RichText {
  text: string;
  marks: Mark[];
}

interface Mark {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'link';
  attrs?: {
    href?: string; // for links
  };
}

// Example: "Hello **world**" becomes:
// [
//   { text: "Hello ", marks: [] },
//   { text: "world", marks: [{ type: "bold" }] }
// ]
```

### Document Structure

```typescript
interface Document {
  id: string;
  title: string;
  rootBlockIds: BlockId[]; // top-level blocks in order
  blocks: Record<BlockId, Block>; // normalized block storage
  createdAt: number;
  updatedAt: number;
}
```

### Editor State

```typescript
interface EditorState {
  document: Document;
  selection: Selection | null;
  dragState: DragState | null;
  history: HistoryState;
  ui: UIState;
}

interface Selection {
  type: 'caret' | 'range' | 'block';
  // For caret/range (text selection within a block)
  anchorBlockId?: BlockId;
  anchorOffset?: number;
  focusBlockId?: BlockId;
  focusOffset?: number;
  // For block selection (one or more whole blocks)
  selectedBlockIds?: BlockId[];
}

interface DragState {
  draggedBlockId: BlockId;
  overBlockId: BlockId | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
}

interface HistoryState {
  undoStack: Document[];
  redoStack: Document[];
  pendingChanges: boolean; // for batching typing
}

interface UIState {
  slashMenuOpen: boolean;
  slashMenuPosition: { x: number; y: number } | null;
  slashMenuFilter: string;
  formattingToolbarAnchor: Range | null;
  focusedBlockId: BlockId | null;
}
```

---

## Phase 1: Foundation

### Objectives

- Set up project structure
- Implement basic block rendering
- Enable simple text editing in paragraphs

### What You'll Learn

**React Concepts:**
- Modern project setup with Vite (fast HMR, native ESM)
- Strict TypeScript patterns with React components
- Component composition and prop drilling basics
- Controlled vs uncontrolled components (contentEditable challenges)

**State Management:**
- Zustand store setup and basic patterns
- Immer for immutable state updates (simpler than manual spreading)
- Normalized data structures (flat block storage vs nested)
- State slices and modular store organization

**Advanced Patterns:**
- Custom hooks for reusable logic (`useBlock`, `useEditor`)
- Polymorphic components (dynamic block type rendering)
- Working with refs for DOM manipulation
- Event handling with `useCallback` for performance

**DOM & Browser APIs:**
- ContentEditable API fundamentals
- Selection and Range API basics
- Keyboard event handling
- Converting between HTML and custom data structures

**Architecture:**
- Feature-based folder structure
- Separation of concerns (components, hooks, store, utils)
- TypeScript discriminated unions for type safety
- Index files for clean imports

### Features

1. **Project Setup**
   - Initialize with Vite + React + TypeScript
   - Configure strict TypeScript
   - Set up folder structure (see below)
   - Install dependencies: zustand, immer, nanoid

2. **Basic Block Types**
   - Paragraph
   - Heading 1, 2, 3
   
3. **Block Rendering**
   - Render a flat list of blocks from state
   - Each block renders its content
   - Blocks are editable via contentEditable

4. **Simple Text Editing**
   - Type in a paragraph
   - Press Enter to create new paragraph
   - Press Backspace at start to merge with previous block

### Folder Structure

```
src/
├── components/
│   ├── Editor/
│   │   ├── Editor.tsx
│   │   ├── Editor.module.css
│   │   └── index.ts
│   ├── Block/
│   │   ├── Block.tsx
│   │   ├── BlockContent.tsx
│   │   ├── blocks/
│   │   │   ├── Paragraph.tsx
│   │   │   ├── Heading.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── ui/
│       └── ... (shared UI components)
├── store/
│   ├── editorStore.ts
│   ├── actions/
│   │   ├── blockActions.ts
│   │   └── selectionActions.ts
│   └── selectors.ts
├── hooks/
│   ├── useBlock.ts
│   └── useEditor.ts
├── types/
│   ├── block.ts
│   ├── editor.ts
│   └── index.ts
├── utils/
│   ├── blockUtils.ts
│   ├── richText.ts
│   └── ids.ts
├── App.tsx
└── main.tsx
```

### Implementation Details

**Block Component Pattern**

```tsx
// components/Block/Block.tsx
interface BlockProps {
  id: BlockId;
  index: number;
}

export function Block({ id, index }: BlockProps) {
  const block = useBlock(id);
  
  const BlockComponent = getBlockComponent(block.type);
  
  return (
    <div className={styles.block} data-block-id={id}>
      <BlockComponent block={block} />
    </div>
  );
}

function getBlockComponent(type: Block['type']) {
  switch (type) {
    case 'paragraph': return Paragraph;
    case 'heading1':
    case 'heading2':
    case 'heading3': return Heading;
    // ... more types
    default: return Paragraph;
  }
}
```

**ContentEditable Wrapper**

```tsx
// components/Block/EditableContent.tsx
interface EditableContentProps {
  blockId: BlockId;
  content: RichText[];
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
}

export function EditableContent({ 
  blockId, 
  content, 
  as: Element = 'p' 
}: EditableContentProps) {
  const ref = useRef<HTMLElement>(null);
  const { updateBlockContent } = useEditorActions();
  
  // Convert RichText[] to HTML for display
  const html = useMemo(() => richTextToHtml(content), [content]);
  
  const handleInput = useCallback((e: FormEvent) => {
    const newContent = htmlToRichText(e.currentTarget.innerHTML);
    updateBlockContent(blockId, newContent);
  }, [blockId, updateBlockContent]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Split block at cursor
    }
    if (e.key === 'Backspace' && isCursorAtStart(ref.current)) {
      e.preventDefault();
      // Merge with previous block
    }
  }, []);
  
  return (
    <Element
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: html }}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    />
  );
}
```

### Acceptance Criteria

- [ ] Can render a document with multiple paragraphs and headings
- [ ] Can type text in any block
- [ ] Enter creates a new paragraph below
- [ ] Backspace at start of block merges with previous
- [ ] State updates immutably via Zustand + Immer

---

## Phase 2: Selection & Keyboard Navigation

### Objectives

- Implement proper selection model
- Enable keyboard navigation between blocks
- Support block-level selection

### What You'll Learn

**Advanced DOM APIs:**
- `window.getSelection()` and Selection API
- Range API for precise cursor positioning
- `selectionchange` event and cross-browser considerations
- Calculating cursor position within contentEditable elements

**Complex State Management:**
- Tracking ephemeral UI state (selection, focus)
- Coordinating DOM state with React state
- When to sync vs when to derive state
- Multiple state update patterns (selection + focus)

**Event Handling:**
- Global vs local event listeners
- Event delegation patterns
- Keyboard event composition (Cmd/Ctrl + key combinations)
- Preventing default browser behavior strategically

**React Hooks Mastery:**
- `useEffect` cleanup functions (removing event listeners)
- `useLayoutEffect` for synchronous DOM reads
- `useCallback` dependencies and memoization
- Creating reusable custom hooks for complex logic

**Focus Management:**
- Programmatic focus control
- Focus visible states and accessibility
- Managing focus across dynamic lists
- Restoring focus after state changes

**User Interaction Patterns:**
- Multi-selection with Shift+click
- Range selection implementation
- Click-outside detection
- Keyboard-first navigation design

### Features

1. **Caret Tracking**
   - Track which block has focus
   - Track cursor position within block
   
2. **Keyboard Navigation**
   - Arrow up/down moves between blocks at edges
   - Tab/Shift+Tab for indentation (prep for later phases)
   - Escape to select current block
   
3. **Block Selection**
   - Click block handle to select whole block
   - Shift+click to extend selection
   - Cmd/Ctrl+A selects all blocks
   
4. **Multi-Block Selection**
   - Visual indication of selected blocks
   - Delete key removes selected blocks
   - Copy/paste of selected blocks

### Key Implementation Challenges

**Cursor Position Detection**

```tsx
// hooks/useCursorPosition.ts
export function useCursorPosition(elementRef: RefObject<HTMLElement>) {
  const [position, setPosition] = useState<{
    atStart: boolean;
    atEnd: boolean;
    offset: number;
  }>({ atStart: true, atEnd: true, offset: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      if (!element.contains(range.commonAncestorContainer)) return;
      
      // Calculate if cursor is at start/end
      const atStart = isCursorAtStart(element, range);
      const atEnd = isCursorAtEnd(element, range);
      const offset = calculateOffset(element, range);
      
      setPosition({ atStart, atEnd, offset });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return position;
}
```

**Focus Management Between Blocks**

```tsx
// hooks/useBlockNavigation.ts
export function useBlockNavigation(blockId: BlockId) {
  const { focusBlock, getAdjacentBlockId } = useEditorActions();
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { atStart, atEnd } = getCursorPosition();
    
    if (e.key === 'ArrowUp' && atStart) {
      e.preventDefault();
      const prevId = getAdjacentBlockId(blockId, 'before');
      if (prevId) focusBlock(prevId, 'end');
    }
    
    if (e.key === 'ArrowDown' && atEnd) {
      e.preventDefault();
      const nextId = getAdjacentBlockId(blockId, 'after');
      if (nextId) focusBlock(nextId, 'start');
    }
  }, [blockId, focusBlock, getAdjacentBlockId]);
  
  return { handleKeyDown };
}
```

### Acceptance Criteria

- [ ] Arrow keys navigate between blocks at boundaries
- [ ] Clicking block handle selects the whole block
- [ ] Selected blocks have visual highlight
- [ ] Delete key removes selected blocks
- [ ] Can select multiple blocks with Shift+click
- [ ] Cmd/Ctrl+A selects all blocks in editor

---

## Phase 3: Slash Commands & Block Transformation

### Objectives

- Implement slash command menu
- Enable block type transformation
- Add more block types

### What You'll Learn

**Advanced Component Patterns:**
- Portal pattern with `createPortal` for overlay UI
- Compound components (menu + menu items)
- Command pattern for encapsulating actions
- Render props and component composition

**React Portals:**
- Rendering outside parent hierarchy
- Event bubbling through portals
- Portal mounting/unmounting lifecycle
- Creating portal containers

**State Coordination:**
- Managing modal/overlay state
- Position calculation and absolute positioning
- Filtering and search patterns
- Keyboard + mouse interaction coordination

**Performance Optimization:**
- `useMemo` for expensive filtering operations
- When to memoize vs when to compute inline
- Optimizing list rendering with keys
- Debouncing vs throttling (filter as you type)

**User Experience Patterns:**
- Fuzzy search/filtering implementation
- Keyboard navigation in menus (arrow keys, enter, escape)
- Visual feedback for selected items
- Closing menus (click outside, escape, selection)

**Data Transformation:**
- Type transformation while preserving data
- Handling incompatible transformations gracefully
- Mapping between different block types
- Maintaining referential integrity during transforms

**React 18 Features:**
- `useId` for generating stable IDs
- Automatic batching in action
- Concurrent features preparation

### Features

1. **Slash Command Menu**
   - Type `/` to open menu
   - Filter by typing (e.g., `/head` shows headings)
   - Keyboard navigation (arrow keys, enter to select)
   - Click to select
   - Escape or click outside to close
   
2. **Block Transformation**
   - Transform current block to selected type
   - Preserve text content when transforming
   - Handle incompatible transformations gracefully
   
3. **New Block Types**
   - Quote block
   - Bullet list
   - Numbered list
   - Divider
   - Code block

### Slash Menu Implementation

```tsx
// components/SlashMenu/SlashMenu.tsx
const COMMANDS: Command[] = [
  { 
    id: 'paragraph', 
    label: 'Text', 
    description: 'Plain text block',
    icon: TextIcon,
    keywords: ['paragraph', 'text', 'plain'],
    action: (blockId) => transformBlock(blockId, 'paragraph')
  },
  { 
    id: 'heading1', 
    label: 'Heading 1', 
    description: 'Large heading',
    icon: H1Icon,
    keywords: ['heading', 'h1', 'title'],
    action: (blockId) => transformBlock(blockId, 'heading1')
  },
  // ... more commands
];

export function SlashMenu() {
  const { isOpen, position, filter, blockId } = useSlashMenuState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const filteredCommands = useMemo(() => {
    if (!filter) return COMMANDS;
    const lower = filter.toLowerCase();
    return COMMANDS.filter(cmd => 
      cmd.label.toLowerCase().includes(lower) ||
      cmd.keywords.some(k => k.includes(lower))
    );
  }, [filter]);
  
  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => 
            Math.min(i + 1, filteredCommands.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          filteredCommands[selectedIndex]?.action(blockId);
          closeMenu();
          break;
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, blockId]);
  
  if (!isOpen || !position) return null;
  
  return (
    <Portal>
      <div 
        ref={menuRef}
        className={styles.slashMenu}
        style={{ 
          position: 'absolute',
          top: position.y,
          left: position.x 
        }}
      >
        {filteredCommands.map((cmd, index) => (
          <button
            key={cmd.id}
            className={cn(
              styles.command,
              index === selectedIndex && styles.selected
            )}
            onClick={() => {
              cmd.action(blockId);
              closeMenu();
            }}
          >
            <cmd.icon className={styles.icon} />
            <div>
              <div className={styles.label}>{cmd.label}</div>
              <div className={styles.description}>{cmd.description}</div>
            </div>
          </button>
        ))}
        {filteredCommands.length === 0 && (
          <div className={styles.empty}>No results</div>
        )}
      </div>
    </Portal>
  );
}
```

**Portal Component**

```tsx
// components/ui/Portal.tsx
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted) return null;
  
  return createPortal(
    children,
    document.getElementById('portal-root')!
  );
}
```

### Acceptance Criteria

- [ ] Typing `/` opens command menu at cursor position
- [ ] Menu filters as user types
- [ ] Arrow keys navigate menu, Enter selects
- [ ] Escape closes menu
- [ ] Selecting command transforms current block
- [ ] Text content preserved during transformation
- [ ] Can create all new block types via menu

---

## Phase 4: Rich Text Formatting

### Objectives

- Implement inline text formatting
- Build floating formatting toolbar
- Support markdown shortcuts

### What You'll Learn

**Advanced Selection API:**
- Working with text ranges for formatting
- Modifying selection programmatically
- Extracting text from complex selection ranges
- Handling collapsed vs expanded selections

**Dynamic Positioning:**
- Floating UI / positioning library integration
- Calculating position relative to selection
- Viewport boundary detection
- Dynamic positioning strategies (flip, shift)

**Text Processing:**
- Parsing and applying text marks
- Rich text data structure manipulation
- Regex pattern matching for markdown
- Text transformation algorithms

**useLayoutEffect Mastery:**
- Synchronous DOM measurements
- Reading layout before paint
- Avoiding layout thrashing
- When to use useLayoutEffect vs useEffect

**Toolbar Patterns:**
- Floating/contextual toolbars
- Active state detection (which formats are applied)
- Toggle interactions
- Icon button components

**Input Pattern Matching:**
- Real-time markdown detection
- Pattern-based transformations
- Handling edge cases in text input
- InputEvent vs KeyboardEvent

**State Complexity:**
- Managing formatting marks on text segments
- Merging adjacent text nodes with same formatting
- Splitting text nodes when formatting changes
- Maintaining cursor position during transformations

**Keyboard Shortcuts:**
- Cross-platform keyboard shortcuts (Cmd vs Ctrl)
- Preventing default browser formatting
- Custom formatting application
- Shortcut collision handling

### Features

1. **Formatting Marks**
   - Bold (Cmd+B)
   - Italic (Cmd+I)
   - Underline (Cmd+U)
   - Strikethrough
   - Inline code
   - Link
   
2. **Floating Toolbar**
   - Appears when text is selected
   - Positioned above selection
   - Shows active formats
   - Click to toggle format
   
3. **Markdown Shortcuts**
   - `**text**` → bold
   - `*text*` → italic
   - `` `text` `` → inline code
   - `# ` at line start → heading 1
   - `## ` → heading 2
   - `- ` → bullet list
   - `1. ` → numbered list
   - `> ` → quote
   - `---` → divider

### Floating Toolbar Implementation

```tsx
// components/FormattingToolbar/FormattingToolbar.tsx
export function FormattingToolbar() {
  const { selectionRange, activeMarks } = useTextSelection();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const { toggleMark, addLink } = useEditorActions();
  
  // Position toolbar above selection
  useLayoutEffect(() => {
    if (!selectionRange || selectionRange.collapsed) {
      setPosition(null);
      return;
    }
    
    const rect = selectionRange.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8 // 8px above selection
    });
  }, [selectionRange]);
  
  if (!position) return null;
  
  return (
    <Portal>
      <div 
        className={styles.toolbar}
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <ToolbarButton 
          icon={BoldIcon}
          active={activeMarks.includes('bold')}
          onClick={() => toggleMark('bold')}
          shortcut="⌘B"
        />
        <ToolbarButton 
          icon={ItalicIcon}
          active={activeMarks.includes('italic')}
          onClick={() => toggleMark('italic')}
          shortcut="⌘I"
        />
        {/* ... more buttons */}
        <ToolbarButton 
          icon={LinkIcon}
          active={activeMarks.includes('link')}
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) addLink(url);
          }}
        />
      </div>
    </Portal>
  );
}
```

**Markdown Shortcuts Hook**

```tsx
// hooks/useMarkdownShortcuts.ts
export function useMarkdownShortcuts(blockId: BlockId) {
  const { transformBlock, updateBlockContent } = useEditorActions();
  
  const handleInput = useCallback((e: InputEvent) => {
    const element = e.target as HTMLElement;
    const text = element.textContent || '';
    
    // Line-start shortcuts
    const lineStartPatterns: [RegExp, Block['type']][] = [
      [/^# $/, 'heading1'],
      [/^## $/, 'heading2'],
      [/^### $/, 'heading3'],
      [/^- $/, 'bulletList'],
      [/^\* $/, 'bulletList'],
      [/^1\. $/, 'numberedList'],
      [/^> $/, 'quote'],
      [/^---$/, 'divider'],
    ];
    
    for (const [pattern, type] of lineStartPatterns) {
      if (pattern.test(text)) {
        e.preventDefault();
        transformBlock(blockId, type);
        // Clear the trigger text
        updateBlockContent(blockId, []);
        return;
      }
    }
    
    // Inline formatting shortcuts
    const inlinePatterns: [RegExp, Mark['type']][] = [
      [/\*\*(.+)\*\*$/, 'bold'],
      [/\*(.+)\*$/, 'italic'],
      [/`(.+)`$/, 'code'],
    ];
    
    for (const [pattern, markType] of inlinePatterns) {
      const match = text.match(pattern);
      if (match) {
        // Apply formatting to matched text
        applyInlineFormat(blockId, match[1], markType);
        return;
      }
    }
  }, [blockId, transformBlock, updateBlockContent]);
  
  return { handleInput };
}
```

### Acceptance Criteria

- [ ] Can select text and see formatting toolbar
- [ ] Toolbar buttons toggle formatting
- [ ] Keyboard shortcuts work (Cmd+B, etc.)
- [ ] Markdown shortcuts transform text/blocks
- [ ] Links can be added with URL
- [ ] Active formats shown in toolbar

---

## Phase 5: Drag and Drop (Flat)

### Objectives

- Enable block reordering via drag and drop
- Implement drag handle UI
- Show drop indicators

### What You'll Learn

**Drag and Drop Architecture:**
- Modern drag-and-drop with dnd-kit (vs native DnD API)
- Sensor patterns (pointer, keyboard, touch)
- Collision detection algorithms
- Accessibility-first drag and drop

**dnd-kit Concepts:**
- `DndContext` provider pattern
- `useSortable` hook for list items
- `DragOverlay` for custom drag previews
- Activation constraints (distance threshold)

**Advanced Hooks:**
- Multiple context consumers in one component
- Coordinating multiple refs (drag, DOM, measurement)
- Derived state from drag events
- Optimistic UI updates

**CSS Transforms:**
- Transform-based animations
- CSS-in-JS with style objects
- Transition coordination
- GPU-accelerated animations

**List Manipulation:**
- Reordering items in immutable arrays
- Finding insertion indices
- Moving items efficiently
- Maintaining list consistency

**Visual Feedback:**
- Drag previews and ghost elements
- Drop indicators and zones
- Hover states during drag
- Drag handle UI patterns

**Event Coordination:**
- Drag start/end lifecycle
- Preventing interference with other interactions
- Cancelling drags
- Drag state cleanup

**Performance:**
- Minimizing re-renders during drag
- Transform vs position for animations
- Will-change CSS property
- Measuring performance of interactions

### Features

1. **Drag Handle**
   - Visible on hover to left of block
   - Grab cursor indicates draggable
   - Drag starts on mousedown + move
   
2. **Drop Indicators**
   - Line appears between blocks showing drop position
   - Different indicator for "inside" (for nesting, prep for Phase 6)
   
3. **Drag Preview**
   - Semi-transparent preview of dragged block
   - Follows cursor with offset
   
4. **Reordering Logic**
   - Drop before/after other blocks
   - State updates on drop
   - Keyboard accessible (later phase)

### dnd-kit Implementation

```tsx
// components/Editor/Editor.tsx
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function Editor() {
  const { document, moveBlock } = useEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      moveBlock(active.id as string, over.id as string);
    }
    
    setActiveId(null);
  };
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={document.rootBlockIds}
        strategy={verticalListSortingStrategy}
      >
        {document.rootBlockIds.map((id, index) => (
          <SortableBlock key={id} id={id} index={index} />
        ))}
      </SortableContext>
      
      <DragOverlay>
        {activeId ? (
          <BlockPreview id={activeId} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

**Sortable Block Wrapper**

```tsx
// components/Block/SortableBlock.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableBlock({ id, index }: { id: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} className={styles.sortableBlock}>
      <div 
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>
      <Block id={id} index={index} />
    </div>
  );
}
```

### Acceptance Criteria

- [ ] Drag handle appears on block hover
- [ ] Can drag blocks to reorder
- [ ] Drop indicator shows insertion point
- [ ] Drag preview follows cursor
- [ ] State updates correctly on drop
- [ ] Smooth animations during drag

---

## Phase 6: Nested Blocks

### Objectives

- Implement blocks that contain other blocks
- Enable nested drag and drop
- Handle recursive rendering

### What You'll Learn

**Recursive Component Patterns:**
- Self-referential component rendering
- Depth tracking to prevent infinite recursion
- Passing context through recursive layers
- Performance implications of deep recursion

**Tree Data Structures:**
- Parent-child relationships in React
- Navigating tree structures
- Updating nested data immutably
- Flattening vs nested state storage

**Advanced State Management:**
- Updating deeply nested state with Immer
- Path-based state updates
- Finding nodes in tree structures
- Maintaining parent-child references

**Conditional Rendering:**
- Dynamic children rendering based on block type
- Collapse/expand state management
- Lazy rendering of hidden content
- Rendering different layouts (columns, lists, toggles)

**Complex Drag and Drop:**
- Multi-level drag targets
- Custom collision detection for nested drops
- Drag into/out of containers
- Visual feedback for nesting levels

**Component Composition:**
- Container vs presentational components
- Slot pattern for flexible layouts
- Compound component relationships
- Controlled vs uncontrolled nested components

**CSS Nesting:**
- Styling nested structures
- Depth-based styling
- Indentation and visual hierarchy
- Flexbox and Grid for layouts (columns)

**Keyboard Navigation:**
- Tab/Shift+Tab for indentation changes
- Navigating in and out of nested structures
- Focus management in trees
- Keyboard shortcuts for nesting operations

### Features

1. **Toggle Block**
   - Collapsible container
   - Header text + expand/collapse button
   - Children rendered when expanded
   
2. **Column Layout**
   - Multiple columns side by side
   - Each column contains blocks
   - Resizable column widths (stretch goal)
   
3. **Nested Lists**
   - List items can have sub-lists
   - Tab to indent, Shift+Tab to outdent
   
4. **Nested Drag and Drop**
   - Can drag into toggle blocks
   - Can drag out of containers
   - Visual feedback for nesting

### Recursive Block Rendering

```tsx
// components/Block/Block.tsx
export function Block({ id, depth = 0 }: { id: BlockId; depth?: number }) {
  const block = useBlock(id);
  
  // Prevent infinite recursion
  if (depth > 10) {
    console.warn('Max nesting depth reached');
    return null;
  }
  
  return (
    <div className={styles.block} data-depth={depth}>
      <BlockContent block={block} />
      
      {/* Render children if block has them and is "open" */}
      {block.children.length > 0 && shouldRenderChildren(block) && (
        <div className={styles.children}>
          {block.children.map((childId, index) => (
            <Block 
              key={childId} 
              id={childId} 
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function shouldRenderChildren(block: Block): boolean {
  switch (block.type) {
    case 'toggle':
      return block.isOpen;
    case 'bulletList':
    case 'numberedList':
    case 'column':
    case 'columnLayout':
      return true;
    default:
      return false;
  }
}
```

**Toggle Block Component**

```tsx
// components/Block/blocks/Toggle.tsx
export function Toggle({ block }: { block: ToggleBlock }) {
  const { updateBlock } = useEditorActions();
  
  const toggleOpen = useCallback(() => {
    updateBlock(block.id, { isOpen: !block.isOpen });
  }, [block.id, block.isOpen, updateBlock]);
  
  return (
    <div className={styles.toggle}>
      <div className={styles.toggleHeader}>
        <button 
          className={styles.toggleButton}
          onClick={toggleOpen}
          aria-expanded={block.isOpen}
        >
          <ChevronRight 
            className={cn(
              styles.chevron,
              block.isOpen && styles.expanded
            )}
          />
        </button>
        <EditableContent 
          blockId={block.id}
          content={block.content}
        />
      </div>
      {/* Children rendered by parent Block component */}
    </div>
  );
}
```

**Nested Drag and Drop**

```tsx
// Custom collision detection for nested drops
function customCollisionDetection(args: CollisionDetectionArgs) {
  const { droppableContainers, pointerCoordinates } = args;
  
  if (!pointerCoordinates) {
    return closestCenter(args);
  }
  
  // Find all containers the pointer is over
  const candidates = droppableContainers.filter(container => {
    const rect = container.rect.current;
    if (!rect) return false;
    
    return (
      pointerCoordinates.x >= rect.left &&
      pointerCoordinates.x <= rect.right &&
      pointerCoordinates.y >= rect.top &&
      pointerCoordinates.y <= rect.bottom
    );
  });
  
  // Prefer deeper nesting levels (more specific targets)
  candidates.sort((a, b) => {
    const depthA = getContainerDepth(a.id);
    const depthB = getContainerDepth(b.id);
    return depthB - depthA;
  });
  
  return candidates.length > 0 
    ? [{ id: candidates[0].id }]
    : closestCenter(args);
}
```

### Acceptance Criteria

- [ ] Toggle blocks expand/collapse
- [ ] Can add blocks inside toggle
- [ ] Column layouts render side by side
- [ ] Lists can be nested via Tab
- [ ] Can drag blocks into containers
- [ ] Can drag blocks out of containers
- [ ] Recursive rendering works without infinite loops

---

## Phase 7: Undo/Redo

### Objectives

- Implement full undo/redo system
- Batch typing into logical operations
- Handle complex state changes

### What You'll Learn

**State History Patterns:**
- Command pattern for undo/redo
- Snapshot-based history vs patch-based
- History stack data structures
- Memory management for large histories

**Batching Strategies:**
- Debouncing user input for batching
- Timeout-based batch commits
- Transaction boundaries (when to commit)
- Combining multiple operations into one undo step

**Advanced Zustand:**
- Multiple state slices coordination
- Middleware patterns
- Transient state (not part of history)
- State snapshots with `structuredClone`

**Immutability Deep Dive:**
- Deep cloning strategies
- Structural sharing
- When to clone vs when to share
- Memory implications of snapshots

**Keyboard Shortcuts:**
- Platform-specific shortcuts (Mac vs Windows)
- Preventing browser default undo/redo
- Multiple shortcut bindings
- Global keyboard listeners

**Edge Case Handling:**
- Undo during pending batch
- Redo stack clearing on new actions
- Circular buffer for history limit
- Handling undo of complex operations

**State Restoration:**
- Restoring focus after undo/redo
- Cursor position restoration
- Preventing jarring UI changes
- Smooth transitions between states

**Performance Considerations:**
- Limiting history depth
- Garbage collection of old entries
- Lazy serialization
- Measuring history memory usage

### Features

1. **History Stack**
   - Store document snapshots
   - Configurable max history length
   - Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
   
2. **Batching**
   - Typing batched into single undo operation
   - Batch closes on: pause, blur, different block, non-typing action
   
3. **Operation Types**
   - Typing (batched)
   - Block creation/deletion (immediate)
   - Block transformation (immediate)
   - Drag and drop (immediate)
   - Formatting (immediate)

### History Implementation

```typescript
// store/history.ts
interface HistoryEntry {
  document: Document;
  timestamp: number;
  operationType: string;
}

interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  maxEntries: number;
}

const BATCH_TIMEOUT = 500; // ms

export const createHistorySlice = (set, get) => ({
  history: {
    entries: [],
    currentIndex: -1,
    maxEntries: 100,
  },
  
  pendingBatch: null as {
    timeoutId: number;
    blockId: string;
    operationType: string;
  } | null,
  
  pushHistory: (operationType: string, options?: { batch?: boolean; blockId?: string }) => {
    const state = get();
    const { history, pendingBatch, document } = state;
    
    // Handle batching for typing
    if (options?.batch && options?.blockId) {
      // If we have a pending batch for the same block, extend it
      if (
        pendingBatch && 
        pendingBatch.blockId === options.blockId &&
        pendingBatch.operationType === operationType
      ) {
        clearTimeout(pendingBatch.timeoutId);
        const timeoutId = setTimeout(() => {
          get().commitBatch();
        }, BATCH_TIMEOUT);
        
        set({ pendingBatch: { ...pendingBatch, timeoutId } });
        return;
      }
      
      // Commit any existing batch first
      if (pendingBatch) {
        get().commitBatch();
      }
      
      // Start new batch
      const timeoutId = setTimeout(() => {
        get().commitBatch();
      }, BATCH_TIMEOUT);
      
      set({
        pendingBatch: {
          timeoutId,
          blockId: options.blockId,
          operationType,
        }
      });
      return;
    }
    
    // Commit pending batch if exists
    if (pendingBatch) {
      get().commitBatch();
    }
    
    // Add new entry
    const newEntry: HistoryEntry = {
      document: structuredClone(document),
      timestamp: Date.now(),
      operationType,
    };
    
    // Truncate any redo history
    const entries = history.entries.slice(0, history.currentIndex + 1);
    entries.push(newEntry);
    
    // Enforce max length
    if (entries.length > history.maxEntries) {
      entries.shift();
    }
    
    set({
      history: {
        ...history,
        entries,
        currentIndex: entries.length - 1,
      }
    });
  },
  
  commitBatch: () => {
    const { pendingBatch, document, history } = get();
    if (!pendingBatch) return;
    
    clearTimeout(pendingBatch.timeoutId);
    
    const newEntry: HistoryEntry = {
      document: structuredClone(document),
      timestamp: Date.now(),
      operationType: pendingBatch.operationType,
    };
    
    const entries = history.entries.slice(0, history.currentIndex + 1);
    entries.push(newEntry);
    
    set({
      history: {
        ...history,
        entries,
        currentIndex: entries.length - 1,
      },
      pendingBatch: null,
    });
  },
  
  undo: () => {
    const { history, pendingBatch } = get();
    
    // Commit any pending changes first
    if (pendingBatch) {
      get().commitBatch();
    }
    
    if (history.currentIndex <= 0) return;
    
    const newIndex = history.currentIndex - 1;
    const entry = history.entries[newIndex];
    
    set({
      document: structuredClone(entry.document),
      history: {
        ...history,
        currentIndex: newIndex,
      }
    });
  },
  
  redo: () => {
    const { history } = get();
    
    if (history.currentIndex >= history.entries.length - 1) return;
    
    const newIndex = history.currentIndex + 1;
    const entry = history.entries[newIndex];
    
    set({
      document: structuredClone(entry.document),
      history: {
        ...history,
        currentIndex: newIndex,
      }
    });
  },
  
  canUndo: () => get().history.currentIndex > 0,
  canRedo: () => get().history.currentIndex < get().history.entries.length - 1,
});
```

**Keyboard Shortcuts Hook**

```tsx
// hooks/useEditorKeyboardShortcuts.ts
export function useEditorKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useEditorStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo()) redo();
      }
      
      // Alternative redo shortcut
      if (isMod && e.key === 'y') {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
}
```

### Acceptance Criteria

- [ ] Cmd+Z undoes last action
- [ ] Cmd+Shift+Z / Cmd+Y redoes
- [ ] Typing batched into single undo operation
- [ ] Batch commits on pause or blur
- [ ] Block operations are immediate (not batched)
- [ ] Redo stack cleared on new actions
- [ ] History limited to prevent memory issues

---

## Phase 8: Performance Optimization

### Objectives

- Optimize rendering for large documents
- Implement virtualization
- Profile and eliminate bottlenecks

### What You'll Learn

**React Performance Fundamentals:**
- React reconciliation and diffing algorithm
- When and why components re-render
- Component tree optimization
- Identifying performance bottlenecks

**Memoization Mastery:**
- `React.memo` with custom comparison functions
- `useMemo` vs `useCallback` - when to use which
- Memoization pitfalls and anti-patterns
- Cost/benefit analysis of memoization

**Zustand Optimization:**
- Selector patterns to prevent re-renders
- Shallow vs deep equality comparisons
- Splitting state for granular updates
- Transient updates (no re-render)

**Virtualization:**
- Virtual scrolling concepts
- Variable height item rendering
- Measuring and caching item heights
- Scroll performance optimization
- Overscan for smooth scrolling

**React 18 Concurrent Features:**
- `useTransition` for non-urgent updates
- `useDeferredValue` for expensive computations
- StartTransition API
- Prioritizing user interactions

**Profiling Tools:**
- React DevTools Profiler
- Chrome DevTools Performance tab
- Why Did You Render debugging
- Performance marks and measures

**Reference Stability:**
- Creating stable references
- Object and array identity
- When references change unexpectedly
- Fixing dependency array issues

**Render Optimization Patterns:**
- Moving state down
- Lifting content up
- Component composition vs props
- Lazy loading components

**Memory Management:**
- Preventing memory leaks
- WeakMap for caching
- Cleanup in effects
- Monitoring memory usage

### Features

1. **Memoization**
   - Blocks only re-render when their data changes
   - Custom comparison functions
   - Selector optimization in Zustand
   
2. **Virtualization**
   - Only render visible blocks
   - Buffer above/below viewport
   - Handle variable height blocks
   
3. **Concurrent Features**
   - useTransition for non-urgent updates
   - useDeferredValue for search/filter
   
4. **Profiling**
   - React DevTools profiling
   - Performance marks
   - Identify unnecessary re-renders

### Optimized Block Component

```tsx
// components/Block/Block.tsx
import { memo } from 'react';

// Custom comparison - only re-render if block data changed
function blockPropsAreEqual(
  prevProps: BlockProps, 
  nextProps: BlockProps
): boolean {
  // ID change always requires re-render
  if (prevProps.id !== nextProps.id) return false;
  
  // Compare the actual block data
  const prevBlock = prevProps.block;
  const nextBlock = nextProps.block;
  
  // Quick reference check
  if (prevBlock === nextBlock) return true;
  
  // Detailed comparison
  return (
    prevBlock.type === nextBlock.type &&
    prevBlock.updatedAt === nextBlock.updatedAt
  );
}

export const Block = memo(function Block({ id }: BlockProps) {
  // Use a selector that returns stable references
  const block = useEditorStore(
    useCallback(state => state.document.blocks[id], [id])
  );
  
  // ... render logic
}, blockPropsAreEqual);
```

**Zustand Selector Optimization**

```typescript
// store/selectors.ts
import { shallow } from 'zustand/shallow';

// Bad: Creates new array every time
const badSelector = (state) => 
  state.document.rootBlockIds.map(id => state.document.blocks[id]);

// Good: Return stable reference, let component handle mapping
export const selectRootBlockIds = (state: EditorState) => 
  state.document.rootBlockIds;

export const selectBlockById = (id: BlockId) => (state: EditorState) =>
  state.document.blocks[id];

// For multiple values, use shallow comparison
export const selectUIState = (state: EditorState) => ({
  slashMenuOpen: state.ui.slashMenuOpen,
  focusedBlockId: state.ui.focusedBlockId,
});

// Usage:
const uiState = useEditorStore(selectUIState, shallow);
```

**Virtualization with Variable Heights**

```tsx
// components/Editor/VirtualizedBlockList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedBlockList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blockIds = useEditorStore(selectRootBlockIds);
  
  // Track measured heights
  const blockHeights = useRef<Map<string, number>>(new Map());
  
  const virtualizer = useVirtualizer({
    count: blockIds.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (index) => {
      const id = blockIds[index];
      return blockHeights.current.get(id) ?? 40; // Default estimate
    },
    overscan: 5, // Render 5 extra items above/below
  });
  
  return (
    <div ref={containerRef} className={styles.scrollContainer}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const blockId = blockIds[virtualItem.index];
          
          return (
            <div
              key={blockId}
              ref={(el) => {
                if (el) {
                  const height = el.getBoundingClientRect().height;
                  if (blockHeights.current.get(blockId) !== height) {
                    blockHeights.current.set(blockId, height);
                    virtualizer.measureElement(el);
                  }
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Block id={blockId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Concurrent Updates**

```tsx
// hooks/useSlashMenuFilter.ts
import { useDeferredValue, useMemo } from 'react';

export function useSlashMenuFilter(filter: string) {
  // Defer the filter value so typing stays responsive
  const deferredFilter = useDeferredValue(filter);
  
  const filteredCommands = useMemo(() => {
    if (!deferredFilter) return ALL_COMMANDS;
    
    const lower = deferredFilter.toLowerCase();
    return ALL_COMMANDS.filter(cmd =>
      cmd.label.toLowerCase().includes(lower) ||
      cmd.keywords.some(k => k.includes(lower))
    );
  }, [deferredFilter]);
  
  // UI can show loading state while filtering catches up
  const isFiltering = filter !== deferredFilter;
  
  return { filteredCommands, isFiltering };
}
```

### Performance Testing

```typescript
// utils/performanceTest.ts
export function generateLargeDocument(blockCount: number): Document {
  const blocks: Record<string, Block> = {};
  const rootBlockIds: string[] = [];
  
  for (let i = 0; i < blockCount; i++) {
    const id = `block-${i}`;
    rootBlockIds.push(id);
    blocks[id] = {
      id,
      type: 'paragraph',
      content: [{ 
        text: `This is paragraph ${i} with some sample content.`,
        marks: [] 
      }],
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
  
  return {
    id: 'test-doc',
    title: 'Performance Test',
    rootBlockIds,
    blocks,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Use in development to test with 1000+ blocks
```

### Acceptance Criteria

- [ ] Document with 500 blocks renders smoothly
- [ ] Typing in one block doesn't lag other blocks
- [ ] Scrolling through large documents is smooth (60fps)
- [ ] React DevTools shows minimal unnecessary re-renders
- [ ] Memory usage stays reasonable over time

---

## Phase 9: Polish & Accessibility

### Objectives

- Complete accessibility implementation
- Add animations and micro-interactions
- Handle edge cases
- Final testing and refinement

### What You'll Learn

**Web Accessibility (A11y):**
- ARIA roles, states, and properties
- Semantic HTML in SPAs
- Screen reader testing (VoiceOver, NVDA)
- Keyboard navigation patterns
- Focus management best practices

**ARIA Patterns:**
- Application role and when to use it
- Live regions for dynamic updates
- aria-label vs aria-labelledby
- aria-describedby for instructions
- aria-activedescendant for composite widgets

**Keyboard Accessibility:**
- Roving tabindex pattern
- Focus traps for modals
- Skip links and landmarks
- Logical tab order
- Custom keyboard shortcuts that don't conflict

**Animation & Motion:**
- CSS transitions and animations
- Animation performance (GPU acceleration)
- prefers-reduced-motion media query
- Micro-interactions for feedback
- Avoiding layout shift

**Edge Case Engineering:**
- Defensive programming techniques
- Boundary condition testing
- Error boundaries in React
- Graceful degradation
- Input validation and sanitization

**Testing:**
- Vitest unit testing patterns
- React Testing Library best practices
- Integration testing strategies
- Accessibility testing with axe-core
- Visual regression testing concepts

**Cross-browser Compatibility:**
- Browser API differences
- Polyfills and fallbacks
- Feature detection
- Progressive enhancement
- Testing across browsers

**Production Readiness:**
- Error handling and logging
- Loading states and skeletons
- Empty states and zero data
- User feedback (toasts, notifications)
- Documentation and code comments

### Accessibility Features

1. **Keyboard Navigation**
   - All features accessible via keyboard
   - Logical focus order
   - Focus visible styles
   
2. **Screen Reader Support**
   - Proper ARIA roles and labels
   - Live regions for dynamic content
   - Meaningful alt text
   
3. **Reduced Motion**
   - Respect prefers-reduced-motion
   - Provide non-animated alternatives

### ARIA Implementation

```tsx
// components/Editor/Editor.tsx
export function Editor() {
  return (
    <div
      role="application"
      aria-label="Block editor"
      aria-describedby="editor-instructions"
    >
      <div id="editor-instructions" className="sr-only">
        Use arrow keys to navigate between blocks. 
        Press Enter to create a new block.
        Press slash to open the command menu.
        Press Escape to select the current block.
      </div>
      
      <div
        role="list"
        aria-label="Document blocks"
      >
        {blockIds.map((id, index) => (
          <Block key={id} id={id} index={index} />
        ))}
      </div>
      
      {/* Live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}

// components/Block/Block.tsx
export function Block({ id, index }: BlockProps) {
  const block = useBlock(id);
  const isSelected = useIsBlockSelected(id);
  
  return (
    <div
      role="listitem"
      aria-setsize={totalBlocks}
      aria-posinset={index + 1}
      aria-selected={isSelected}
      aria-label={getBlockAriaLabel(block)}
    >
      {/* ... */}
    </div>
  );
}

function getBlockAriaLabel(block: Block): string {
  const typeLabels: Record<Block['type'], string> = {
    paragraph: 'Paragraph',
    heading1: 'Heading level 1',
    heading2: 'Heading level 2',
    heading3: 'Heading level 3',
    bulletList: 'Bullet list',
    numberedList: 'Numbered list',
    toggle: 'Toggle block',
    quote: 'Quote',
    code: 'Code block',
    divider: 'Divider',
    image: 'Image',
    columnLayout: 'Column layout',
    column: 'Column',
    listItem: 'List item',
  };
  
  const type = typeLabels[block.type] || 'Block';
  const preview = getTextPreview(block, 50);
  
  return preview ? `${type}: ${preview}` : type;
}
```

**Accessible Slash Menu**

```tsx
// components/SlashMenu/SlashMenu.tsx
export function SlashMenu() {
  const menuId = useId();
  
  return (
    <Portal>
      <div
        role="listbox"
        id={menuId}
        aria-label="Block type commands"
        aria-activedescendant={`${menuId}-option-${selectedIndex}`}
      >
        {filteredCommands.map((cmd, index) => (
          <div
            key={cmd.id}
            id={`${menuId}-option-${index}`}
            role="option"
            aria-selected={index === selectedIndex}
          >
            {/* ... */}
          </div>
        ))}
      </div>
    </Portal>
  );
}
```

### Animations

```css
/* styles/animations.css */
@media (prefers-reduced-motion: no-preference) {
  .block {
    transition: transform 200ms ease, opacity 200ms ease;
  }
  
  .block-enter {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .block-enter-active {
    opacity: 1;
    transform: translateY(0);
  }
  
  .block-exit {
    opacity: 1;
  }
  
  .block-exit-active {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .slash-menu {
    animation: slideIn 150ms ease;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -100%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%) scale(1);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Edge Cases Checklist

- [ ] Empty document state
- [ ] Single block document
- [ ] Very long text in a block
- [ ] Very deep nesting
- [ ] Rapid typing
- [ ] Quick successive undo/redo
- [ ] Drag cancelled mid-operation
- [ ] Copy/paste across blocks
- [ ] Browser back/forward navigation
- [ ] Simultaneous keyboard shortcuts
- [ ] Window resize during drag
- [ ] Loss of focus during operation

### Final Testing

1. **Unit Tests**
   - State reducers
   - Utility functions
   - Custom hooks
   
2. **Integration Tests**
   - Block operations
   - Keyboard navigation
   - Drag and drop
   
3. **Accessibility Audit**
   - axe-core automated checks
   - Manual keyboard testing
   - Screen reader testing (VoiceOver, NVDA)
   
4. **Performance Testing**
   - Large document benchmarks
   - Memory leak detection
   - Animation smoothness

### Acceptance Criteria

- [ ] All features keyboard accessible
- [ ] No accessibility violations in axe audit
- [ ] Animations respect reduced motion preference
- [ ] Edge cases handled gracefully
- [ ] Tests pass with good coverage
- [ ] Documentation complete

---

## Appendix: Resources

### Learning Resources

- [React Docs - Escape Hatches](https://react.dev/learn/escape-hatches)
- [React Docs - Concurrent React](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [Floating UI Documentation](https://floating-ui.com/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)

### Reference Implementations

- [Lexical](https://github.com/facebook/lexical) - Meta's text editor framework
- [Plate](https://github.com/udecode/plate) - Rich text editor framework
- [BlockNote](https://github.com/TypeCellOS/BlockNote) - Block-based editor

### Tools

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [Why Did You Render](https://github.com/welldone-software/why-did-you-render)