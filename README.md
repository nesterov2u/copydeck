# CopyDeck

CopyDeck is a compact Tauri desktop utility for designers who need to move many text fragments into layout tools without losing progress.

## MVP Included

- List and preview modes
- Block queue with pending, completed, and skipped states
- Copy per block and Copy & Next flow
- Clipboard, TXT, DOCX, XLSX, and CSV import paths
- Search, filters, progress tracking
- Translation icon with cached block-level preview state
- Light, dark, and system themes
- Always-on-top hook for Tauri
- Local persistence through Zustand

## Local Development

This workspace currently needs Node package tooling and Rust installed before it can run:

```sh
npm install
npm run dev
npm run tauri dev
```

The frontend dev server is configured for `http://localhost:1420`.
