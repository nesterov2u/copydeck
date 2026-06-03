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
- fixed 400 px window width, resizable height, minimum 500 px
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
- English/Russian interface language setting
- guarded clipboard import replacement when the current deck already has progress
- local recent clipboard lists in Storage
- Clear Deck action in Storage
- empty Deck visual state

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
- Empty clipboard/import input does not replace the current queue; it shows a muted `Clipboard is empty` toast.
- Importing non-empty clipboard text over a deck with progress asks for confirmation before replacing the deck.
- Copied content must be plain text only, without formatting. The clipboard is cleared before `writeText` to avoid stale HTML/RTF clipboard flavors.
- Translation is context only and never replaces original text.
- Translation body text should use regular weight; the translation section label can remain accented.
- The app window should be draggable by holding and moving almost any part of the UI except the large `Copy & Next` button. A small movement threshold avoids breaking normal clicks.

## Design Reference

The current MVP UI is based on the user's compact Figma/reference direction:

- fixed 400 px desktop window width
- resizable height, minimum 500 px
- macOS traffic lights
- centered CopyDeck logo/title
- progress row: completed / total, progress bar, percent
- compact block list
- block row: current row highlight, real status icon, preview text, translate, copy
- dominant blue Copy & Next button
- Preview Mode with Back, 24x24 status icon, full original text, optional translation panel, compact copy button, and bottom `Copy & Next`
- Settings screen with General, Import, Translation, Storage, Update sections

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

- app frame: `400 x 696`, radius `26`
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
- `src/services/i18n.ts` - lightweight English/Russian UI string dictionary
- `src/styles.css` - theme tokens and UI styling
- `Manrope/Manrope-VariableFont_wght.ttf` - bundled UI font used by `@font-face`
- `src-tauri/src/lib.rs` - Tauri setup and macOS reopen/focus handling
- `src-tauri/tauri.conf.json` - Tauri shell/config
- `src-tauri/icons/` - generated app icon set

## Recent Features And Fixes

- Compact Figma-derived light/dark UI is implemented.
- Main list no longer has search, filters, or type badges.
- Preview long text/URLs wrap inside their containers.
- Preview Mode uses the top Back button, an in-card 24x24 status icon, an in-card copy button, and the bottom `Copy & Next` primary action.
- The main list current row no longer swaps the status icon for an arrow; it always shows the actual copied/not-copied/skipped status.
- Add/import header icon imports plain text directly from clipboard. File import and Google Docs URL import are removed from the UI.
- App can be dragged from almost any UI area except the main Copy & Next button.
- Header window controls call native close/minimize/toggle maximize.
- Pin/unpin toggles Always On Top and swaps icon.
- Window uses transparent background, 26 px radius, and native macOS shadow.
- Translation uses local cache/dictionary first and MyMemory fallback for public network translation.
- When Translation is disabled in settings, translation UI is hidden entirely: no row translation icon/popover in compact list and no translation panel in Preview Mode.
- Copying settings section was removed by user decision.
- Storage settings exposes `Clear Cache`, `Clear Deck`, and local recent clipboard lists. In Russian UI, recent lists are labeled `Недавние списки`.
- Recent clipboard lists persist locally, keep up to five imports, and can restore a previous imported deck.
- Empty Deck list view shows `icons/tabler_circle-dashed-plus.svg` as a muted background icon, and the bottom `Copy & Next` button is disabled and pale.
- Importing non-empty clipboard text over a deck that already has completed or skipped blocks opens a compact confirmation dialog before replacing the deck.
- Import settings labels are compact: split blocks uses `Empty`, `Line`, `Custom`; custom separator defaults to `//`.
- General settings no longer has `Compact mode`; the app is compact by default.
- General settings includes an interface language segmented control for English and Russian UI text.
- Russian UI uses `Список` for the Back-to-list pill, not `Дека`.
- Import settings no longer has `XLSX / CSV`; MVP import is clipboard-only.
- Language detection is automatic for pasted/imported text and currently has heuristics for English, Russian, Indonesian, Spanish, French, German, Italian, Portuguese, Dutch, Polish, and Turkish.
- Dock reopen/click shows, unminimizes, and focuses the existing main window on macOS without recentering it. The frontend saves/restores the outer window position in localStorage so CopyDeck stays where the user left it. When pinned, the frontend sets the window visible on all workspaces; do not call `setVisibleOnAllWorkspaces(false)` on startup because that can strand the window on another Space.
- The main list scrollbar is aligned to the right app edge.
- Per-row translation icons no longer float above translation popovers.
- Copy buttons keep the 40x40 square while the internal copy icon is 24x24, including preview.
- Settings Translation target select uses a custom CSS arrow with adjusted right spacing.
- Copy actions explicitly clear the clipboard before writing plain text via `@tauri-apps/plugin-clipboard-manager`.
- Settings sidebar styling is normalized: inactive item text/icon are gray, active item text/icon are blue, text is not bold.
- Settings theme selector is stacked vertically: `Theme` label on its own row and `System / Light / Dark` segmented control below it full-width so labels fit.
- Settings sidebar card stretches down the settings area, with the bottom outer gap matching the left side gap (`8px`).
- Dark theme was visually checked against `Main-Dark.png`; progress track, row colors, settings panel, icons, pill buttons, switches, and bottom fade are tuned for the Figma dark palette.
- Toast messages are intentionally muted gray instead of high-contrast dark purple/black.
- `Manrope` is bundled with the app via `@font-face`, so WebView no longer depends on the font being installed in macOS.
- App icon is generated from `icons/image.png` into `src-tauri/icons`.
- Global shortcut code paths and the visible shortcut label on `Copy & Next` are removed.
- Local in-window keyboard controls are enabled outside Settings/text inputs: Arrow Down/Arrow Up move the current block, Arrow Right/Arrow Left toggle the current list block copied/not copied, Space runs `Copy & Next`, Enter opens the current line in Preview, and Backspace returns from Preview to the list.
- Tauri updater is configured for GitHub Releases at `https://github.com/nesterov2u/copydeck/releases/latest/download/latest.json`.
- Manual update checking lives in Settings -> Update. It does not auto-download updates or interrupt the main copy workflow.
- Latest published release is `v0.1.7`.
- Current local app version is `0.1.8`, newer than the latest published release and not yet published.
- `v0.1.6` was published successfully with signed updater artifacts for both `darwin-aarch64` and `darwin-x86_64`; it is the last dual-target release.
- `v0.1.7` was published successfully with signed updater artifacts for Apple Silicon only: `darwin-aarch64` / `darwin-aarch64-app`.
- Future GitHub releases are intentionally Apple Silicon only: `.github/workflows/release.yml` builds only `aarch64-apple-darwin`. Restore `x86_64-apple-darwin` only if Intel Mac updates are needed again.
- The GitHub release workflow uses `--bundles app`; updater releases rely on `.app.tar.gz`, `.app.tar.gz.sig`, and `latest.json`, not on the `.dmg` installer.
- Release cadence: develop features and verify locally during the week; publish a GitHub release about once per week rather than for every small change.

## Build And Verification

Current verified checks:

- `pnpm test` passes: 4 test files, 25 tests
- `pnpm run build` passes
- `PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build` builds the macOS `.app`, `.dmg`, and updater artifacts when run outside the Codex sandbox
- `CI=true PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build --bundles app --config '{"bundle":{"createUpdaterArtifacts":false}}'` builds the current local `0.1.8` `.app` without updater signing artifacts for local smoke testing.
- `hdiutil verify src-tauri/target/release/bundle/dmg/CopyDeck_0.1.6_aarch64.dmg` reports a valid checksum for the generated DMG.
- `v0.1.7` GitHub Actions release run `26806110141` succeeded and uploaded signed updater artifacts plus `latest.json`.

Current app artifact:

- `src-tauri/target/release/bundle/macos/CopyDeck.app`
- Current local app bundle reports `CFBundleShortVersionString` and `CFBundleVersion` as `0.1.8`.
- Latest GitHub release: `https://github.com/nesterov2u/copydeck/releases/tag/v0.1.7`

Known build issue:

- `hdiutil create` fails inside the Codex sandbox with `Устройство не сконфигурировано`; this is a sandbox limitation, not a Tauri DMG packaging failure.
- Run the full Tauri build with escalated permissions when you need to generate or verify a local `.dmg`.
- This sandbox-only DMG issue does not affect GitHub updater releases.
- `pnpm tauri build` can fail in this Codex/macOS environment because signed Node rejects Tauri native bindings. Prefer the cargo-installed CLI:

```sh
PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build
```

Build note:

- File import, Google Docs import, and global shortcut code paths are removed from the app and package metadata. Keep local in-window shortcuts in `src/App.tsx`.
- Compact mode and XLSX/CSV import settings are removed from UI and persisted state; store persistence version is currently `7`.
- Auto-update releases require `TAURI_SIGNING_PRIVATE_KEY` in GitHub Secrets. The public key is safe in `src-tauri/tauri.conf.json`; the private key must stay out of the repository.
- The updater key was rotated before `v0.1.5`; old `0.1.1` installs may discover newer updates but cannot install them because they embed the previous public key.

## Repository

GitHub repo:

`https://github.com/nesterov2u/copydeck`

The current worktree is intentionally dirty with ongoing MVP/UI changes. Do not revert user or prior-agent work.

## Next Bugfix Areas

Most likely next tasks:

- test updating a local/new-key app older than published `v0.1.7` to published `v0.1.7`
- smoke-test the generated `.app` interactively on macOS
- inspect whether macOS Dock/Finder icon cache shows the latest generated icon
- improve translation UX: click-to-open/pin popover, manual translate action, clearer provider/error states
- smoke-test `0.1.8` Storage recent lists / Clear Deck / empty Deck state in the native `.app`
- prepare a future `v0.1.8` release when enough changes are ready
