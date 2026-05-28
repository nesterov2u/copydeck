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

Next design step: the user plans to finish a Figma UI mockup and provide it later. When that arrives, adapt the current component/CSS-token layer to match Figma while preserving queue/import/clipboard/translation behavior.

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

- `src/App.tsx` - composition layer for the app shell and modes
- `src/components/` - UI components for header, filters, block rows, preview, toolbar, popover
- `src/hooks/useCopyDeckEffects.ts` - theme, pinned window, hotkeys, toast timeout effects
- `src/store/useCopyDeckStore.ts` - queue state, actions, persistence
- `src/services/parser.ts` - text splitting and block type inference
- `src/services/queue.ts` - pure queue navigation helpers
- `src/services/importers.ts` - TXT/DOCX/XLSX/CSV readers
- `src/services/clipboard.ts` - Tauri/browser clipboard wrapper
- `src/services/translation.ts` - translation/detection placeholder
- `src/styles.css` - theme tokens and UI styling
- `src-tauri/` - Tauri shell/config

Current verified checks:

- `pnpm test` passes: 2 test files, 12 tests
- `pnpm run build` passes
- `cargo tauri build` passes

Native macOS build artifacts have been produced:

- `src-tauri/target/release/bundle/macos/CopyDeck.app`
- `src-tauri/target/release/bundle/dmg/CopyDeck_0.1.0_aarch64.dmg`

The repo is published and synced at:

- `https://github.com/nesterov2u/copydeck`

Latest pushed commit at the time of this note:

- `72311d2 Enable native Tauri bundle build`

## Recent Engineering Changes

- UI was split from one large `App.tsx` into focused components.
- `mammoth` and `xlsx` are dynamically imported so heavy importers do not inflate the initial app chunk.
- Core parser and queue navigation tests were added with Vitest.
- Tauri config now uses `pnpm` for `beforeDevCommand` and `beforeBuildCommand`.
- A placeholder `src-tauri/icons/icon.png` was added because Tauri requires an icon for native builds.
- `src-tauri/Cargo.lock` is committed for repeatable native builds.

## Environment Note

In the Codex app environment, Node is signed in a way that can block native Rollup loading on macOS. This project uses `@rollup/wasm-node` via `pnpm-workspace.yaml` to keep Vite builds working in that environment.

In a normal local environment this workaround may be unnecessary, but do not remove it casually until builds are tested.

The npm Tauri CLI wrapper can hit the same signed-Node/native-binding problem. In this environment, use cargo-installed Tauri CLI instead:

```sh
cargo install tauri-cli --version 2.11.2 --locked
cargo tauri build
```

Rust/Cargo were installed and verified with:

- `rustc 1.95.0`
- `cargo 1.95.0`

## Next Work

Most likely next tasks:

- apply the upcoming Figma UI to the current component/token layer
- smoke-test the generated `.app` interactively on macOS
- improve translation UX: click-to-open/pin popover, Preview "Translate now", clear unavailable/error states
- make XLSX/CSV import mode-aware: cell, row, selected column
- add empty/error import states
- expand tests around store actions and import modes
