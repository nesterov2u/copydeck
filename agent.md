# CopyDeck Agent Notes

Use this file as local working guidance for future coding agents in this project.

## How To Think About This Project

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
pnpm run build
pnpm run dev --host 127.0.0.1
```

For Tauri, once Rust/Cargo are installed:

```sh
pnpm run tauri dev
```

In the current Codex environment, pnpm was installed under:

```sh
/Users/andrew/Library/pnpm/bin/pnpm
```

If shell PATH does not include it, use:

```sh
PNPM_HOME=/Users/andrew/Library/pnpm PATH=/Users/andrew/Library/pnpm/bin:$PATH pnpm run build
```

## Build Caveat

`pnpm-workspace.yaml` contains:

```yaml
overrides:
  rollup: npm:@rollup/wasm-node@4.60.4

onlyBuiltDependencies:
  - esbuild
```

This is intentional for the Codex/macOS environment where signed Node may reject native Rollup `.node` binaries. Keep it unless normal Rollup builds are verified.

## Implementation Rules

Keep business logic out of presentational UI when practical.

Prefer:

- actions in `useCopyDeckStore.ts`
- parsing in `services/parser.ts`
- import logic in `services/importers.ts`
- native/browser API wrappers in `services/*`
- design tokens in `styles.css`

Do not let Figma/design refactors rewrite queue behavior.

## UX Rules

`Copy & Next` is the primary action:

1. copy current original text
2. mark block completed
3. move to next pending block

Per-block copy must not change current selection.

Translation is context only. It must never replace original block text and must not affect what Copy/Copy & Next copies.

Themes should use CSS variables. Future Figma work should mostly update tokens, spacing, component styling, and icons rather than store/service behavior.

## Performance Direction

Keep the app light:

- lazy-load heavy importers
- do not add PDF until Phase 2
- keep translation optional
- avoid storing full original files when blocks and metadata are enough
- consider list virtualization only when real documents with many hundreds/thousands of blocks show UI lag

`mammoth` is already dynamically imported. `xlsx` should also be made dynamic if bundle size becomes a concern.

## Known Gaps / Next Work

- Verify Tauri native window once Rust/Cargo are available.
- Make XLSX import fully mode-aware: cell, row, selected column.
- Improve translation UX so click can pin/show popover if desired; current version is a lightweight hover/click placeholder.
- Add real settings screen for configurable hotkeys and theme.
- Add proper empty/error states for imports.
- Add tests for parser and queue navigation.
- Consider splitting `src/App.tsx` into components once behavior stabilizes.

