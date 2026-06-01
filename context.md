# CopyDeck Context

CopyDeck is a compact Tauri desktop utility for designers who need to move many text fragments from source documents into design/layout tools without losing progress.

Primary workflow:

```text
Import -> Split into blocks -> Copy -> Paste into layout -> Copy & Next
```

Target tools include InDesign, Illustrator, Figma, Affinity Publisher, Keynote, PowerPoint, and Canva.

## Product Direction

CopyDeck should feel like a small native macOS utility, not a full web app. It should stay compact, be keyboard-first, and avoid blocking the designer's main workspace.

The product is a text queue manager. It must not become an AI writing, summarization, OCR, cloud sync, team collaboration, Adobe plugin, or Figma plugin product.

## Current MVP Scope

Included or currently implemented:

- macOS-style compact UI
- fixed 350 px window width, resizable height, minimum 500 px
- List Mode
- Preview Mode
- Back to List
- Clipboard import only
- block parsing modes: empty line, new line, delimiter, custom separator
- block statuses: pending, completed, skipped
- Copy button on every block
- Copy & Next main action
- completion toggle
- progress tracking
- Always On Top
- local persistence via Zustand/localStorage
- light, dark, and system themes
- translation icon and quick translation preview
- bottom `Copy & Next` action in Preview Mode
- manual update checking via Tauri updater and GitHub Releases

Out of scope:

- AI writing
- AI summarization
- OCR
- cloud sync
- team collaboration
- Adobe/Figma plugins
- automatic paste into design software

## Current UX Decisions

- Search is removed from MVP by user decision.
- Visible filters are removed from the compact main UI.
- Visible block type badges (`P`, `S`, `H`, etc.) are removed because they were not informative.
- Block types still exist internally for parsing/future behavior, but they are not shown in rows or preview.
- `Copy & Next` always copies the original block text, marks it completed, then moves forward.
- `Copy & Next` moves to the immediate next block, not the next pending block, to avoid skipping already completed rows.
- Per-block copy does not change current position.
- Copied content must be plain text only, without formatting. The clipboard is cleared before `writeText` to avoid stale HTML/RTF clipboard flavors.
- Translation is context only and never replaces original text.
- The app window should be draggable by holding and moving almost any part of the UI except the large `Copy & Next` button. A small movement threshold avoids breaking normal clicks.

## Design Reference

The current MVP UI is based on the user's compact Figma/reference direction:

- fixed 350 px desktop window width
- resizable height, minimum 500 px
- macOS traffic lights
- centered CopyDeck logo/title
- progress row: completed / total, progress bar, percent
- compact block list
- block row: status/current indicator, preview text, translate, copy
- dominant blue Copy & Next button
- Preview Mode with Back, full original text, optional translation panel, compact copy button, and bottom `Copy & Next`
- Settings screen with General, Import, Translation, Storage sections

Current Figma source for visual tokens is:

`https://www.figma.com/design/uvBOywQjm7rZR9YAeAjlvT/1Ci-Drafts?node-id=52-7&t=a8Jreu986lYP3bjo-1`

Useful frame nodes:

- `52:56` Main-Light
- `52:95` Main-Dark
- `52:134` Inner-Light
- `52:197` Inner-Dark
- `52:260` Settings-Light
- `52:339` Settings-Dark

MCP-derived visual tokens currently applied in CSS:

- app frame: `350 x 696`, radius `26`
- fonts: bundled `Manrope` for UI text, `Unbounded Medium` in the logo SVG
- primary: `#3c60ff`
- light background: `#f9f9f9`, light text: `#130040`, light control: `#6e6e6e`
- dark background: `#130040`, dark card: `#1d0062`, dark control: `#d4dcff`, dark hover: `rgba(98,127,255,0.3)`
- rows: 8px gap, 16px radius, active row uses primary hover tint

## Block Types

Current internal block types:

- `header`
- `subhead`
- `caption`
- `table`
- `list`
- `paragraph`

Unknown imported content should fall back to `paragraph`.

## Current Implementation State

Current stack:

- Tauri v2
- React
- TypeScript
- Vite
- Zustand
- CSS variables
- local SVG/PNG assets in `icons/`
- pnpm

Important files:

- `src/App.tsx` - composition layer for the app shell, modes, and app-wide drag behavior
- `src/components/` - UI components for header, block rows, preview, toolbar, settings, popover
- `src/components/Icon.tsx` - local icon registry
- `src/hooks/useCopyDeckEffects.ts` - theme, pinned window, workspace visibility, toast timeout effects
- `src/store/useCopyDeckStore.ts` - queue state, actions, persistence
- `src/services/parser.ts` - text splitting and block type inference
- `src/services/queue.ts` - pure queue navigation helpers
- `src/services/clipboard.ts` - Tauri/browser clipboard wrapper
- `src/services/translation.ts` - language detection plus translation fallback
- `src/services/updater.ts` - Tauri updater wrapper for checking and installing app updates
- `src/styles.css` - theme tokens and UI styling
- `Manrope/Manrope-VariableFont_wght.ttf` - bundled UI font used by `@font-face`
- `src-tauri/src/lib.rs` - Tauri setup and macOS reopen/focus handling
- `src-tauri/tauri.conf.json` - Tauri shell/config
- `src-tauri/icons/` - generated app icon set

## Recent Features And Fixes

- Compact Figma-derived light/dark UI is implemented.
- Main list no longer has search, filters, or type badges.
- Preview long text/URLs wrap inside their containers.
- Preview Mode uses the top Back button, an in-card copy button, and the bottom `Copy & Next` primary action.
- Add/import header icon imports plain text directly from clipboard. File import and Google Docs URL import are removed from the UI.
- App can be dragged from almost any UI area except the main Copy & Next button.
- Header window controls call native close/minimize/toggle maximize.
- Pin/unpin toggles Always On Top and swaps icon.
- Window uses transparent background, 26 px radius, and native macOS shadow.
- Translation uses local cache/dictionary first and MyMemory fallback for public network translation.
- When Translation is disabled in settings, translation UI is hidden entirely: no row translation icon/popover in compact list and no translation panel in Preview Mode.
- Copying settings section was removed by user decision.
- Storage settings currently only exposes `Clear Cache`, which clears cached translations/status fields related to translation.
- Import settings labels are compact: split blocks uses `Empty`, `Line`, `Custom`; custom separator defaults to `//`.
- Language detection is automatic for pasted/imported text and currently has heuristics for English, Russian, Indonesian, Spanish, French, German, Italian, Portuguese, Dutch, Polish, and Turkish.
- Dock reopen/click centers, shows, unminimizes, and focuses the existing main window on macOS. On startup the window is also centered and shown. When pinned, the frontend sets the window visible on all workspaces; do not call `setVisibleOnAllWorkspaces(false)` on startup because that can strand the window on another Space.
- The main list scrollbar is aligned to the right app edge.
- Per-row translation icons no longer float above translation popovers.
- Copy buttons keep the 40x40 square while the internal copy icon is 24x24, including preview.
- Copy actions explicitly clear the clipboard before writing plain text via `@tauri-apps/plugin-clipboard-manager`.
- Settings sidebar styling is normalized: inactive item text/icon are gray, active item text/icon are blue, text is not bold.
- Settings theme selector is stacked vertically: `Theme` label on its own row and `System / Light / Dark` segmented control below it full-width so labels fit.
- Settings sidebar card stretches down the settings area, with the bottom outer gap matching the left side gap (`8px`).
- Dark theme was visually checked against `Main-Dark.png`; progress track, row colors, settings panel, icons, pill buttons, switches, and bottom fade are tuned for the Figma dark palette.
- Toast messages are intentionally muted gray instead of high-contrast dark purple/black.
- `Manrope` is bundled with the app via `@font-face`, so WebView no longer depends on the font being installed in macOS.
- App icon is generated from `icons/image.png` into `src-tauri/icons`.
- Keyboard/global shortcuts are removed, including the visible shortcut label on `Copy & Next`.
- Tauri updater is configured for GitHub Releases at `https://github.com/nesterov2u/copydeck/releases/latest/download/latest.json`.
- Manual update checking lives in Settings -> General. It does not auto-download updates or interrupt the main copy workflow.

## Build And Verification

Current verified checks:

- `pnpm test` passes: 3 test files, 15 tests
- `pnpm run build` passes
- `PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build` builds the macOS `.app`

Current app artifact:

- `src-tauri/target/release/bundle/macos/CopyDeck.app`

Known build issue:

- DMG packaging currently fails at `bundle_dmg.sh`.
- The `.app` bundle is still generated successfully before the DMG failure.
- `pnpm tauri build` can fail in this Codex/macOS environment because signed Node rejects Tauri native bindings. Prefer the cargo-installed CLI:

```sh
PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build
```

Build note:

- File import, Google Docs import, and global shortcut code paths are removed from the app and package metadata.
- Auto-update releases require `TAURI_SIGNING_PRIVATE_KEY` in GitHub Secrets. The public key is safe in `src-tauri/tauri.conf.json`; the private key must stay out of the repository.

## Repository

GitHub repo:

`https://github.com/nesterov2u/copydeck`

The current worktree is intentionally dirty with ongoing MVP/UI changes. Do not revert user or prior-agent work.

## Next Bugfix Areas

Most likely next tasks:

- smoke-test the generated `.app` interactively on macOS
- inspect whether macOS Dock/Finder icon cache shows the latest generated icon
- fix DMG packaging failure
- improve translation UX: click-to-open/pin popover, manual translate action, clearer provider/error states
- improve settings details for Import, Translation, Storage
- add empty/error import states
- expand tests around store actions, import modes, and clipboard-only import behavior
