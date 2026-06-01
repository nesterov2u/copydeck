export async function writeClipboard(text: string) {
  const plainText = String(text);
  try {
    const clipboard = await import("@tauri-apps/plugin-clipboard-manager");
    await clipboard.clear();
    await clipboard.writeText(plainText);
    return;
  } catch {
    await navigator.clipboard.writeText(plainText);
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
