import type { Update } from "@tauri-apps/plugin-updater";
import type { AppUpdateInfo } from "../types";

let pendingUpdate: Update | null = null;

export async function checkForAppUpdate(): Promise<AppUpdateInfo | null> {
  const { check } = await import("@tauri-apps/plugin-updater");
  const update = await check({ timeout: 10_000 });

  pendingUpdate = update;
  if (!update) return null;

  return {
    version: update.version,
    currentVersion: update.currentVersion,
    date: update.date,
    body: update.body
  };
}

export async function installPendingAppUpdate(): Promise<void> {
  const update = pendingUpdate ?? await getFreshPendingUpdate();
  if (!update) {
    throw new Error("No update available");
  }

  await update.downloadAndInstall();
  const { relaunch } = await import("@tauri-apps/plugin-process");
  await relaunch();
}

async function getFreshPendingUpdate() {
  const { check } = await import("@tauri-apps/plugin-updater");
  pendingUpdate = await check({ timeout: 10_000 });
  return pendingUpdate;
}
