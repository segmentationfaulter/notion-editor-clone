# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Notion-style block editor** built as a learning project to master advanced React patterns. It's a frontend-only application focused on core block-based editing mechanics.

**Key Goals:**
- Build a fully functional block-based document editor in React
- Learn advanced React patterns through practical application
- Create a portfolio piece demonstrating senior-level React expertise

**Explicit Non-Goals:**
- Backend integration or real-time collaboration (frontend-only)
- Feature parity with Notion (focus on core mechanics)
- Mobile-first design (desktop-first, responsive is a bonus)

## Tech Stack

- **React 19+** - UI framework with concurrent features
- **TypeScript (strict mode)** - Type safety
- **Zustand** - Global state management
- **Immer** - Immutable state updates
- **dnd-kit** - Drag and drop
- **Floating UI** - Popover/tooltip positioning
- **Vitest + React Testing Library** - Testing
- **CSS Modules or Tailwind** - Styling

## Dependency Management

**Always use the latest stable versions of dependencies:**
- When adding new packages, use `npm install <package>@latest`
- Regularly check for updates with `npm outdated`
- Update dependencies with `npm update` or `npm install <package>@latest`
- Use caret ranges (^) in package.json to allow minor/patch updates
- Test thoroughly after major version updates
- Prefer stable releases over pre-release versions


## Core Architecture

### Data Model

The editor uses a **normalized, flat data structure** for blocks:

```typescript
interface Document {
  id: string;
  title: string;
  rootBlockIds: BlockId[]; // top-level blocks in order
  blocks: Record<BlockId, Block>; // normalized flat storage
  createdAt: number;
  updatedAt: number;
}
```

**Key Design Decisions:**
- Blocks stored in flat `Record<BlockId, Block>` (not nested tree)
- Parent-child relationships tracked via `children: BlockId[]` arrays
- This enables efficient lookups, updates, and prevents deep nesting issues
- Block types use TypeScript discriminated unions

### State Management Pattern

**Zustand store structure:**
```typescript
interface EditorState {
  document: Document;        // Document data
  selection: Selection | null; // Cursor/selection state
  dragState: DragState | null; // Drag-and-drop state
  history: HistoryState;      // Undo/redo stacks
  ui: UIState;                // Ephemeral UI state (menus, toolbars)
}
```

**Important patterns:**
- Use Immer for all state updates (via Zustand middleware)
- Separate transient UI state from document state
- History uses snapshot-based undo/redo with batching for typing
- Selection state syncs with DOM Selection API

### Component Architecture

**Folder structure:**
```
src/
├── components/
│   ├── Editor/           # Top-level editor component
│   ├── Block/            # Block rendering (polymorphic)
│   │   └── blocks/       # Individual block type components
│   ├── SlashMenu/        # Command palette
│   ├── FormattingToolbar/ # Rich text toolbar
│   └── ui/               # Shared UI primitives
├── store/
│   ├── editorStore.ts    # Main Zustand store
│   ├── actions/          # Action creators
│   └── selectors.ts      # Memoized selectors
├── hooks/                # Custom hooks
├── types/                # TypeScript definitions
└── utils/                # Pure utility functions
```

**Block Rendering Pattern:**
- `Block.tsx` is polymorphic - uses `getBlockComponent(type)` to render correct component
- Each block type has its own component (Paragraph, Heading, Toggle, etc.)
- Recursive rendering for nested blocks with depth tracking (max depth: 10)

### Rich Text Model

Text content uses a **mark-based model** (not HTML):
```typescript
interface RichText {
  text: string;
  marks: Mark[]; // bold, italic, underline, code, link, etc.
}
```

Conversion utilities handle HTML ↔ RichText transformation for contentEditable.

## Development Phases

The project follows a **9-phase implementation plan** (see `docs/notion-editor-spec.md`):

**Mandatory Phases (1-5):**
1. **Foundation** - Basic blocks, Zustand setup, contentEditable
2. **Selection & Keyboard Navigation** - Selection API, focus management
3. **Slash Commands** - Command menu, block transformation, Portals
4. **Rich Text Formatting** - Marks, floating toolbar, markdown shortcuts
5. **Drag and Drop (Flat)** - dnd-kit integration, reordering

**Optional Phases (6-9):**
6. **Nested Blocks** - Recursive rendering, tree operations
7. **Undo/Redo** - History stack, batching, state snapshots
8. **Performance** - Memoization, virtualization, concurrent features
9. **Polish & Accessibility** - ARIA, animations, edge cases, testing

### Phase 1 Implementation Plan

**Phase 1 detailed implementation plan is located at:** `docs/plan/phase-1-foundation.md`

This plan breaks Phase 1 into **6 self-contained milestones**:
1. Project Scaffolding & Configuration
2. Core Type Definitions
3. Zustand Store with Immer
4. Block Rendering Infrastructure
5. ContentEditable Text Editing
6. Keyboard Interactions (Enter & Backspace)

**When implementing features:**
- Follow the phase order - each phase builds on previous phases
- Complete phases 1-5 as they form the core editor functionality
- Phases 6-9 are optional enhancements - implement based on learning goals
- **CRITICAL IMPLEMENTATION RULE: When implementing a milestone or phase, focus EXCLUSIVELY on that specific milestone/phase** - do not implement, plan, or touch features from other milestones or phases unless explicitly instructed
- **Work on ONE milestone at a time** - complete all acceptance criteria for the current milestone before moving to the next
- Each milestone should be independently testable and committable to git
- Check the "What You'll Learn" section for each phase to understand learning objectives
- Reference the "Implementation Details" code examples in the spec
- Complete "Acceptance Criteria" before moving to next milestone/phase
- Do not add "nice to have" features that belong to future phases

## Critical Implementation Details

### ContentEditable Challenges

ContentEditable is complex and has browser inconsistencies:
- Always use `suppressContentEditableWarning` in React
- Convert between HTML and RichText data model (don't store HTML directly)
- Handle cursor position carefully with Selection API
- Prevent default browser formatting (implement custom)

### Selection & Focus Management

- Track selection in Zustand state AND read from DOM via `window.getSelection()`
- Use `selectionchange` event (document-level) for tracking
- Restore focus/cursor after state updates
- Handle both text selection (within block) and block selection (whole blocks)

### Nested Block Operations

- Always update via Immer to handle nested changes
- Use path-based updates for deeply nested blocks
- Prevent infinite recursion with depth limits
- Handle drag-and-drop between nesting levels with custom collision detection

### History/Undo Pattern

- Typing is batched (500ms timeout) into single undo operations
- Block operations (create, delete, transform) are immediate
- Use `structuredClone()` for deep copying document state
- Commit pending batch before undo/redo
- Clear redo stack on new actions

### Performance Considerations

- Memoize block components with `React.memo` and custom comparison
- Use Zustand selectors that return stable references
- Implement virtual scrolling for documents with 100+ blocks
- Use `useTransition`/`useDeferredValue` for non-urgent updates (filtering, etc.)
- Profile with React DevTools before optimizing

## Block Types

**Implemented block types:**
- `paragraph`, `heading1`, `heading2`, `heading3` - Text blocks
- `quote` - Blockquote
- `bulletList`, `numberedList`, `listItem` - Lists (can nest)
- `toggle` - Collapsible container block
- `code` - Code block with language
- `divider` - Horizontal rule
- `image` - Image with caption
- `columnLayout`, `column` - Multi-column layouts

**Block transformation rules:**
- Most blocks can transform to any other type
- Content (RichText[]) is preserved when compatible
- Lists must contain listItem children
- Column layouts must contain column children

## Testing Strategy

- **Unit tests**: State management, utilities, custom hooks
- **Integration tests**: Block operations, keyboard navigation, drag-and-drop
- **Accessibility**: axe-core automated checks, manual keyboard testing
- **Performance**: Test with 500+ block documents

Use Vitest + React Testing Library for all tests.

## Reference Documentation

The complete technical specification is in `docs/notion-editor-spec.md`, which includes:
- Detailed data model definitions
- Implementation code examples for each phase
- Acceptance criteria checklists
- Learning objectives per phase
- Links to external resources (React docs, library docs, etc.)

**Always refer to the spec when:**
- Starting a new phase
- Implementing a complex feature
- Unsure about data structures or patterns
- Looking for code examples

## Key Patterns to Follow

**Immutability:**
- All state updates via Immer (never mutate directly)
- Use Zustand's `set` with Immer middleware

**Component patterns:**
- Polymorphic components for block types
- Portal pattern for overlays (menus, toolbars)
- Recursive components for nested blocks
- Compound components for complex widgets

**Hook patterns:**
- Custom hooks for reusable logic (useBlock, useCursorPosition, etc.)
- useCallback for event handlers
- useMemo for expensive computations
- useLayoutEffect for DOM measurements

**TypeScript patterns:**
- Strict mode enabled
- Discriminated unions for Block types
- Proper typing for all component props
- No `any` types
