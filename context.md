# CopyDeck Context

CopyDeck is a compact desktop utility for designers who need to move many text fragments from source documents into design/layout tools without losing progress.

Primary workflow:

```text
Import -> Split into blocks -> Copy -> Paste into layout -> Copy & Next
```

Target tools include InDesign, Illustrator, Figma, Affinity Publisher, Keynote, PowerPoint, and Canva.

## Product Direction

CopyDeck should feel like a small native macOS utility, not a full web app. It should stay compact, be keyboard-first, and avoid blocking the designer's main workspace.

The product is a text queue manager. It must not become an AI writing, summarization, OCR, cloud sync, team collaboration, Adobe plugin, or Figma plugin product.

## MVP Scope

Version 0.1 should include:

- macOS-style compact UI
- List Mode
- Preview Mode
- Back to List
- Clipboard import
- TXT import
- DOCX import
- XLSX/CSV import
- block parsing modes: paragraph, line, delimiter, custom separator
- block statuses: pending, completed, skipped
- Copy button on every block
- Copy & Next main action
- completion toggle
- search
- filters
- progress tracking
- Always On Top
- hotkeys
- local persistence
- light, dark, and system themes
- translation icon and quick translation preview

## Translation

Translation is only for context while placing text. The original text is never modified, and Copy & Next always copies the original block text.

Translation should be optional. The app must work without translation support.

Preferred direction:

1. Native Apple Translate API if practical
2. local translation cache
3. optional fallback providers later

## Design Reference

The first MVP UI is based on the provided reference image:

- narrow desktop window, around 360-420 px wide
- macOS traffic lights
- centered title
- progress area
- filters and search
- block list with status, number, preview, type tag, copy, translate
- dominant purple Copy & Next button
- Preview Mode with full text and translation panel

This reference is a working design hypothesis. The code should be structured so a future Figma design can replace visual details without rewriting business logic.

## Architecture Preference

Keep product logic separate from UI:

- queue/status/current-position logic in state/store
- parsing/import services in separate modules
- clipboard/native actions in service wrappers
- theme values via CSS variables/tokens
- UI components should consume store actions, not own business rules

Avoid overbuilding. For MVP, localStorage is enough; SQLite is future work.

## Current Implementation State

The project was scaffolded from scratch in this directory.

Current stack:

- Tauri v2
- React
- TypeScript
- Vite
- Zustand
- CSS variables
- mammoth for DOCX
- xlsx for XLSX/CSV
- lucide-react icons
- pnpm

Important files:

- `src/App.tsx` - main UI and mode rendering
- `src/store/useCopyDeckStore.ts` - queue state, actions, persistence
- `src/services/parser.ts` - text splitting and block type inference
- `src/services/importers.ts` - TXT/DOCX/XLSX/CSV readers
- `src/services/clipboard.ts` - Tauri/browser clipboard wrapper
- `src/services/translation.ts` - translation/detection placeholder
- `src/styles.css` - theme tokens and UI styling
- `src-tauri/` - Tauri shell/config

Frontend TypeScript and Vite production build have passed. Tauri native run has not been verified yet because Rust/Cargo were not available in the environment at the time.

## Environment Note

In the Codex app environment, Node is signed in a way that can block native Rollup loading on macOS. This project uses `@rollup/wasm-node` via `pnpm-workspace.yaml` to keep Vite builds working in that environment.

In a normal local environment this workaround may be unnecessary, but do not remove it casually until builds are tested.

