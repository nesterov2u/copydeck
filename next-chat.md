# CopyDeck Handoff For Next Chat

Use this file as the first context file for a new Codex chat. Also read `context.md` and `agent.md` before making changes.

Last updated: 2026-06-02, after local `0.1.8` app build.

## Current Goal

The recent work focused on polishing the compact CopyDeck MVP, adding manual app updates through Tauri v2 updater and GitHub Releases, publishing signed releases through `v0.1.7`, simplifying future releases to Apple Silicon only, and preparing unreleased local `0.1.8` UX/storage improvements.

Latest follow-up: DMG packaging was checked on 2026-06-01. The apparent `bundle_dmg.sh` failure was caused by Codex sandbox restrictions around `hdiutil create`, not by a broken Tauri/app configuration. A full Tauri build run outside the sandbox successfully produced the `.app`, `.dmg`, `.app.tar.gz`, and `.sig` artifacts.

Current release state: latest published GitHub release is still `v0.1.7`. Local app version is now `0.1.8` and includes unreleased changes. A local `0.1.8` `.app` build was created successfully with updater artifacts disabled for the local build only, because no private updater signing key was present in the shell. GitHub release `v0.1.7` was published successfully through Actions run `26806110141`.

CopyDeck is a compact Tauri desktop app for designers. It should stay small, native-feeling, keyboard-friendly, and focused on copying text blocks into design/layout tools. Do not turn it into an AI writing tool, cloud product, Figma plugin, Adobe plugin, or large web app.

## Repository

- Local repo: `/Users/andrew/Работа/Codex/CopyDeck`
- GitHub repo: `https://github.com/nesterov2u/copydeck`
- Package manager: `pnpm`
- Frontend: React, TypeScript, Vite, Zustand
- Desktop shell: Tauri v2

## Important Files

- `context.md` - product and implementation context
- `agent.md` - local agent instructions and build caveats
- `src/services/updater.ts` - updater wrapper
- `src/services/i18n.ts` - lightweight English/Russian UI string dictionary
- `src/components/Settings.tsx` - Settings UI, including Update section
- `src/components/Preview.tsx` - Preview Mode, including status icon and translation panel
- `src/components/Icon.tsx` - icon registry
- `src/store/useCopyDeckStore.ts` - app state/actions
- `src/hooks/useCopyDeckEffects.ts` - theme, pinned window, saved window position, toast timeout effects
- `src/styles.css` - visual styling and update/toast styles
- `src-tauri/tauri.conf.json` - Tauri config, updater endpoint, public key
- `.github/workflows/release.yml` - GitHub Actions release workflow; currently configured for arm64-only releases
- `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` - app versions must stay aligned

## Auto Update State

Manual update checking has been added.

- UI location: Settings -> Update
- UI shows current app version.
- Button: `Check for update`
- If an update is found, it shows `Version x.y.z is ready.` and an `Install & restart` button.
- Toasts are centered inside Settings and muted gray.
- The Update sidebar icon should use the same inactive/active coloring behavior as other settings icons.

Updater endpoint:

```text
https://github.com/nesterov2u/copydeck/releases/latest/download/latest.json
```

The latest published release at the time of this handoff is `v0.1.7`.

Current local app version is `0.1.8`, which is newer than the latest published release and is not yet published.

The public `latest.json` for `v0.1.7` was verified and contains updater bundles for:

- `darwin-aarch64`
- `darwin-aarch64-app`

Important: `v0.1.6` was the last release with both Apple Silicon and Intel updater targets. `v0.1.7` and future releases are Apple Silicon only unless the user explicitly asks to restore Intel builds.

Published `v0.1.7` updater assets include:

- `CopyDeck_aarch64.app.tar.gz`
- `CopyDeck_aarch64.app.tar.gz.sig`
- `latest.json`

Future arm64-only releases should publish:

- `CopyDeck_aarch64.app.tar.gz`
- `CopyDeck_aarch64.app.tar.gz.sig`
- `latest.json`

## Key State

The updater key pair was rotated during testing.

Important consequence:

- Old installed app `0.1.1` was built with the old public key.
- Releases `0.1.5`, `0.1.6`, and `0.1.7` were signed with the new private key.
- Therefore the old `0.1.1` app can discover newer releases, but install can fail because signatures cannot be verified against the old embedded public key.
- A local `0.1.5` build was created with the new public key embedded. Future updates signed with the same new key should install from that build.

Current new public key in `src-tauri/tauri.conf.json`:

```text
dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDlCRTU0RTQzNjc1NTM5N0MKUldSOE9WVm5RMDdsbStIS2NuVHBrY2xKSWJVa3E4T0VnZ0gwQTJ6VWM1SFduc2hEVXFCWDZESTcK
```

GitHub repository secrets should be:

- `TAURI_SIGNING_PRIVATE_KEY` - full private updater key contents
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - password for the current password-protected updater key

`.github/workflows/release.yml` should keep:

```yaml
TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
```

Do not change it back to an empty string while using the new password-protected key.

Do not commit private keys, local key file paths, or key passwords.

## Local Build Created

A local `0.1.6` build was successfully created on 2026-06-01 with the new public key embedded and signed with the new private key.

Artifacts:

```text
/Users/andrew/Работа/Codex/CopyDeck/src-tauri/target/release/bundle/macos/CopyDeck.app
/Users/andrew/Работа/Codex/CopyDeck/src-tauri/target/release/bundle/dmg/CopyDeck_0.1.6_aarch64.dmg
/Users/andrew/Работа/Codex/CopyDeck/src-tauri/target/release/bundle/macos/CopyDeck.app.tar.gz
/Users/andrew/Работа/Codex/CopyDeck/src-tauri/target/release/bundle/macos/CopyDeck.app.tar.gz.sig
```

The local `0.1.6` app bundle reports `CFBundleShortVersionString` and `CFBundleVersion` as `0.1.6`.

The generated DMG was verified with:

```sh
hdiutil verify src-tauri/target/release/bundle/dmg/CopyDeck_0.1.6_aarch64.dmg
```

Result: checksum is valid.

## Current Local Build And Release

The current local app version is `0.1.8`. The latest published GitHub release is still `v0.1.7`.

Current artifacts:

```text
/Users/andrew/Работа/Codex/CopyDeck/src-tauri/target/release/bundle/macos/CopyDeck.app
```

The current local app bundle was verified with `PlistBuddy`; `CFBundleShortVersionString` and `CFBundleVersion` are both `0.1.8`.

The latest local `.app` build completed on 2026-06-02 at 15:56:46:

```sh
CI=true PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build --bundles app --config '{"bundle":{"createUpdaterArtifacts":false}}'
```

Important: this local command intentionally disables updater artifacts only for the local `.app` build. Do not commit that override into `src-tauri/tauri.conf.json`; release builds must keep updater artifacts enabled and use `TAURI_SIGNING_PRIVATE_KEY`.

Published release:

- Release: `https://github.com/nesterov2u/copydeck/releases/tag/v0.1.7`
- Actions run: `https://github.com/nesterov2u/copydeck/actions/runs/26806110141`
- Assets: `CopyDeck_aarch64.app.tar.gz`, `CopyDeck_aarch64.app.tar.gz.sig`, `latest.json`

Current verified checks:

```sh
CI=true pnpm test
CI=true pnpm run build
CI=true PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build --bundles app --config '{"bundle":{"createUpdaterArtifacts":false}}'
```

Latest test count: 4 test files, 25 tests.

## Current UX State After 0.1.8 Work

- Empty clipboard/import input does not wipe the current queue; it shows `Clipboard is empty`.
- Importing non-empty clipboard text over a deck with progress (`completed` or `skipped`) no longer replaces immediately. It opens a compact confirmation dialog to keep the current deck or replace it.
- Storage settings now include `Clear Deck`, which clears all blocks and returns the app to an empty list.
- Storage settings now include local recent clipboard lists, shown as `Recent imports` in English and `Недавние списки` in Russian. Up to five recent imports are persisted locally and can be restored.
- Empty Deck list view shows `icons/tabler_circle-dashed-plus.svg` as a muted background icon.
- When the Deck is empty, the bottom `Copy & Next` button is disabled and visually pale.
- Translation body text in Preview and the row popover uses Manrope Regular (`font-weight: 400`); the `Перевод`/`Translation` label remains visually accented.
- Local in-window keyboard controls are enabled outside Settings/text inputs.
- Arrow Down / Arrow Up move current block.
- Arrow Right / Arrow Left toggle the current list block copied/not copied.
- Space runs `Copy & Next`.
- Enter opens the current list line in Preview.
- Backspace returns from Preview to the list.
- The list current row always shows the real status icon; the current-row arrow icon was removed from the UI and icon registry.
- Preview shows the current block status icon at 24x24 in the card header.
- Preview/list text highlighted in screenshots uses Manrope SemiBold.
- App window width is fixed at 400px.
- General settings no longer has `Compact mode`.
- Import settings no longer has `XLSX / CSV`.
- General settings includes an `Interface language` segmented control with `English` and `Русский`.
- Russian UI uses `Список` for the Back-to-list pill, not `Дека`.
- Settings Translation target select uses a custom CSS arrow with adjusted right spacing.
- Store persistence version is currently `7` after adding `recentImports` and import replacement confirmation behavior. `pendingImport` is not persisted; `recentImports` is persisted locally.
- macOS startup/reopen no longer recenters the window. The frontend saves/restores outer window position in localStorage under `copydeck-window-position`.
- `src-tauri/capabilities/default.json` includes `core:window:allow-set-position` for window position restore.

## Commands That Worked

Frontend checks:

```sh
CI=true pnpm test
CI=true pnpm run build
```

Restore dependencies if `node_modules` was recreated:

```sh
PNPM_HOME=/Users/andrew/Library/pnpm PATH=/Users/andrew/Library/pnpm:$PATH pnpm install
```

Local Tauri app bundle with new updater key:

```sh
CI=true TAURI_SIGNING_PRIVATE_KEY="$TAURI_SIGNING_PRIVATE_KEY" TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$TAURI_SIGNING_PRIVATE_KEY_PASSWORD" PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build --bundles app
```

Local `.app` bundle without updater signing artifacts, useful when only smoke-testing the app and the private key is not available in the shell:

```sh
CI=true PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build --bundles app --config '{"bundle":{"createUpdaterArtifacts":false}}'
```

Full local Tauri build including DMG and updater artifacts:

```sh
CI=true TAURI_SIGNING_PRIVATE_KEY="$TAURI_SIGNING_PRIVATE_KEY" TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$TAURI_SIGNING_PRIVATE_KEY_PASSWORD" PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build
```

Important Codex/macOS caveat: `hdiutil create` can fail inside the Codex sandbox with `Устройство не сконфигурировано`. Run the full build with escalated permissions when a local `.dmg` is needed. This does not indicate a broken app config.

Prefer the cargo-installed Tauri CLI in this environment:

```sh
PATH=/Users/andrew/.cargo/bin:$PATH /Users/andrew/.cargo/bin/cargo-tauri build
```

`pnpm tauri build` can fail in this Codex/macOS environment because signed Node rejects Tauri native bindings.

Updater safety note: the DMG artifact is not used by the Tauri updater. Updater delivery depends on `.app.tar.gz`, `.app.tar.gz.sig`, and GitHub Release `latest.json`. The DMG check did not change updater config, keys, versions, or release workflow behavior.

## Git History Around Updater

Recent relevant commits/tags:

- `0823c88` - Prepare MVP app with updater
- `7086be3` - Release `0.1.1`, tag `v0.1.1`
- `f1cc774` - Polish update settings
- `dc70a21` - Release `0.1.2`, tag `v0.1.2`
- `8026bc2` - Release `0.1.3`, tag `v0.1.3`
- `d3b8d38` - Release `0.1.4`, tag `v0.1.4`
- `6de9682` - Release `0.1.5`, tag `v0.1.5`
- `b54b009` - Release `0.1.6`, tag `v0.1.6`
- `3c3d8da` - Release `0.1.7`, tag `v0.1.7`

Some early release workflows failed due to build/signing issues. `v0.1.5` eventually published a valid `latest.json` and updater artifacts after the new secrets were set. `v0.1.6` published successfully through GitHub Actions run `26773183969`; `v0.1.7` published successfully through run `26806110141`.

After `v0.1.6`, `.github/workflows/release.yml` was changed and committed to remove `x86_64-apple-darwin` from the matrix.

## User Preference And Current Direction

The user chose the simple path:

- Do not try to make old `0.1.1` update across the key rotation.
- Use a fresh local build with the new embedded public key.
- Use future releases signed with the same new private key for testing updates.
- Future GitHub releases should be Apple Silicon only unless the user explicitly asks to restore Intel builds.

Release cadence:

- During the week, keep developing new features and verifying them locally.
- Build locally as needed for manual testing, especially after updater/native changes.
- Do not create a GitHub release for every small feature.
- Roughly once per week, collect the finished work, bump versions, tag, and publish a GitHub release.
- Weekly releases should remain arm64-only unless the user explicitly asks to restore Intel builds.

GitHub release expectation:

- Future GitHub releases should continue to work normally with the current updater setup.
- `.github/workflows/release.yml` uses `--bundles app`, so it publishes updater artifacts and does not depend on DMG packaging.
- Keep GitHub Secrets `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` set to the current password-protected key values.

Recommended next test:

1. Install/open the local `CopyDeck.app` from `src-tauri/target/release/bundle/macos/CopyDeck.app`.
2. Smoke-test keyboard controls: Arrow Up/Down, Arrow Right/Left, Space, Enter, Backspace.
3. Move the window, quit/reopen CopyDeck, and confirm the position is restored on the same desktop.
4. For updater testing, use a local/new-key build older than published `v0.1.7` to update to published `v0.1.7`. Local `0.1.8` is not useful for that update path until a newer release is published.

## Important Warnings

- Do not rotate updater keys again unless absolutely necessary.
- If the public key in `tauri.conf.json` changes, already installed apps using the previous public key will not trust updates signed by the new private key.
- Version numbers must increase for updater checks to find an update.
- Keep `bundle.createUpdaterArtifacts` enabled in Tauri config.
- Future arm64-only releases will not update Intel/x86_64 installs unless `x86_64-apple-darwin` is restored in the release workflow.
- Keep private keys out of git.
- Do not treat Codex sandbox `hdiutil create` failures as updater breakage.
- Do not revert unrelated user work if the worktree is dirty.
