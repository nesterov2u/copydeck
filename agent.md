# CopyDeck Agent Notes

Use this file as local working guidance for future coding agents in this project.

## Product Shape

CopyDeck is a compact native-feeling desktop utility for designers, not a document editor and not an AI content tool.

Prioritize:

- speed
- compact layout
- native macOS feel
- keyboard-first workflows
- low visual noise
- reliable copy/paste progress tracking

Avoid:

- marketing-page UI
- oversized hero layouts
- cloud/team features
- AI writing/summarization
- OCR
- automatic paste into design software
- Adobe/Figma plugins

## Current Commands

Use pnpm.

```sh
pnpm install
pnpm test
pnpm run build
pnpm run dev --host 127.0.0.1
```

In this Codex/macOS environment, prefer the cargo-installed Tauri CLI:

```sh
PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build
```

`pnpm tauri build` can fail because signed Node rejects native Tauri CLI bindings.

## Build Caveats

`pnpm-workspace.yaml` intentionally overrides Rollup with wasm Rollup for the current Codex/macOS environment:

```yaml
overrides:
  rollup: npm:@rollup/wasm-node@4.60.4

onlyBuiltDependencies:
  - esbuild
```

Keep this unless normal Rollup builds are verified.

DMG packaging works, but `hdiutil create` fails inside the Codex sandbox with `Устройство не сконфигурировано`. Run the full Tauri build with escalated permissions when you need to generate or verify a `.dmg` locally:

```sh
CI=true TAURI_SIGNING_PRIVATE_KEY="$TAURI_SIGNING_PRIVATE_KEY" TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$TAURI_SIGNING_PRIVATE_KEY_PASSWORD" PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build
```

Manrope is bundled from `Manrope/Manrope-VariableFont_wght.ttf` through `@font-face` in `src/styles.css`. Do not replace it with system-only font fallback; the bundled font is required so the Tauri WebView renders consistently.

## Auto Update Notes

CopyDeck uses Tauri v2 updater with GitHub Releases as the static update host.

- Updater endpoint: `https://github.com/nesterov2u/copydeck/releases/latest/download/latest.json`
- Public updater key is stored in `src-tauri/tauri.conf.json`.
- Private updater key must never be committed. Put its contents in the GitHub secret `TAURI_SIGNING_PRIVATE_KEY`.
- Current updater key is password-protected; keep `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` wired to the GitHub secret and do not change it to an empty string.
- Local signing key files used during testing must never be committed.
- `.github/workflows/release.yml` publishes macOS releases and lets `tauri-apps/tauri-action` upload `latest.json`.
- The release workflow currently uses `--bundles app`; GitHub updater releases do not depend on DMG packaging.
- Future releases are intentionally arm64-only: the workflow matrix should contain `aarch64-apple-darwin` only unless the user explicitly asks to support Intel again.
- `v0.1.6` was published successfully with both `darwin-aarch64` and `darwin-x86_64` updater artifacts; it can be treated as the last dual-target release.
- Current local app version is `0.1.7`, prepared for the next future release.
- Old `0.1.1` installs embed the previous public updater key and may discover newer versions but fail signature verification. Test updates from a local/new-key `0.1.5` build or newer.
- Release cadence: do feature work and local verification continuously, but publish GitHub releases roughly weekly. Do not bump versions, tag, or release for every small feature unless the user asks.
- Keep `bundle.createUpdaterArtifacts` enabled; without it the release can build but installed apps will not receive update bundles.
- Updater delivery depends on `.app.tar.gz`, `.app.tar.gz.sig`, and GitHub Release `latest.json`; the `.dmg` artifact is separate installer packaging.
- Version bumps must stay aligned across `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`.

## Implementation Rules

Keep business logic out of presentational UI when practical.

Prefer:

- actions in `useCopyDeckStore.ts`
- parsing in `services/parser.ts`
- clipboard import logic in `services/clipboard.ts` and block parsing in `services/parser.ts`
- native/browser API wrappers in `services/*`
- design tokens in `styles.css`

Do not let Figma/design refactors rewrite queue behavior.

## Current UX Rules

`Copy & Next` is the primary action:

1. copy current original text
2. mark block completed
3. move to the immediate next block in the queue

Per-block copy must not change current selection.

Copied content must be plain text only. Keep `writeClipboard` clearing the clipboard before `writeText` so stale HTML/RTF clipboard flavors do not leak into design apps.

Translation is context only. It must never replace original block text and must not affect what Copy/Copy & Next copies.

When Translation is disabled, hide translation UI completely in both list rows and Preview Mode. Do not leave disabled icons or placeholder panels visible.

Search, visible filters, and visible row type badges are intentionally removed from the MVP.

The app should drag from almost any held/moved UI area except the large `Copy & Next` button. Preserve the small drag threshold so normal clicks still work.

Current styling decisions:

- UI text should use bundled Manrope everywhere. Buttons, inputs, and selects inherit the root font.
- Dark theme follows the Figma dark palette: app bg `#130040`, card `#1d0062`, primary `#3c60ff`, control `#d4dcff`.
- Settings sidebar items: inactive gray text/icon, active blue text/icon, regular weight.
- Settings General theme selector should be stacked: label above, `System / Light / Dark` segmented control full-width below.
- Settings sidebar card should stretch down the settings area, but keep its bottom outer gap equal to the left gap (`8px`).
- Toasts should be muted gray and low-contrast, not dark purple/black.
- Copy row button square stays 40x40; internal copy icon is 24x24.
- Preview keeps the bottom `Copy & Next` primary action, plus top Back and the in-card copy button.
- Preview also shows the current block status as a 24x24 icon in the card header.
- Main list rows always show the real status icon; do not replace the current row status with an arrow icon.
- The visible shortcut label on `Copy & Next` is removed.
- Local in-window keyboard controls are enabled outside Settings/text inputs: Arrow Down/Arrow Up move the current block, Arrow Right/Arrow Left toggle the current list block copied/not copied, Space runs `Copy & Next`, Enter opens the current line in Preview, and Backspace returns from Preview to the list.
- Header settings button icon should stay gray.
- Window width is fixed at 400px.
- Scrollbar in the list should sit on the app's right edge.
- On macOS startup/reopen, keep the Rust-side `unminimize -> show -> focus` sequence and do not recenter the window. The frontend saves/restores the outer window position in localStorage. It should only call `setVisibleOnAllWorkspaces(true)` when pinned is enabled; avoid calling it with `false` during startup because that can strand the window on another Space.

## Import Notes

Supported MVP imports:

- Clipboard only

The import menu currently contains:

- one add/import icon in the header
- clicking it reads plain text from the clipboard and imports/splits that text
- no Google Docs URL form
- no file picker

Import settings are intentionally compact:

- split blocks labels: `Empty`, `Line`, `Custom`
- custom separator default/placeholder: `//`

The old `Copying` and `Hotkeys` settings sections were removed. `Storage` currently only has `Clear Cache`.

`Compact mode` and `XLSX / CSV` settings were removed. Empty clipboard/import input must not wipe the current queue; show `Clipboard is empty` instead.

General settings includes an interface language segmented control for English and Russian UI text. The persisted store version is currently `6` because `interfaceLanguage` is saved locally.

Language detection is automatic for imported/pasted blocks. Current heuristics cover English, Russian, Indonesian, Spanish, French, German, Italian, Portuguese, Dutch, Polish, and Turkish.

## Performance Direction

Keep the app light:

- do not add PDF until Phase 2
- keep translation optional
- avoid storing full original files when blocks and metadata are enough
- consider list virtualization only when real documents with many hundreds/thousands of blocks show UI lag

File import, Google Docs import, and global shortcut code paths are intentionally removed from the app and package metadata. Keep local in-window shortcuts in `src/App.tsx`.

## Current Checks

- `pnpm test` passes: 4 test files, 18 tests.
- `pnpm run build` passes.
- `CI=true TAURI_SIGNING_PRIVATE_KEY="$TAURI_SIGNING_PRIVATE_KEY" TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$TAURI_SIGNING_PRIVATE_KEY_PASSWORD" PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build --bundles app` creates the signed `.app.tar.gz` updater artifact and `.sig`.
- Current local `CopyDeck.app` is version `0.1.7`.
- Full cargo Tauri build creates `.app`, `.dmg`, `.app.tar.gz`, and `.sig` when run outside the Codex sandbox.
- GitHub release `v0.1.6` completed successfully via Actions run `26773183969`.

## Next Work

- Test updating from the local/new-key `0.1.5` app to published `0.1.6`.
- Smoke-test the generated `.app` interactively on macOS.
- Improve translation UX: click/pinned popover, manual action, provider/error states.
- Expand tests around store actions and clipboard-only import behavior.
