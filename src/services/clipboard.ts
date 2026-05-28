export async function writeClipboard(text: string) {
  try {
    const clipboard = await import("@tauri-apps/plugin-clipboard-manager");
    await clipboard.writeText(text);
    return;
  } catch {
    await navigator.clipboard.writeText(text);
  }
}

export async function readClipboard() {
  try {
    const clipboard = await import("@tauri-apps/plugin-clipboard-manager");
    return await clipboard.readText();
  } catch {
    return await navigator.clipboard.readText();
  }
}
