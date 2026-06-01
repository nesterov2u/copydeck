import { useEffect } from "react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import type { ThemeMode } from "../types";

export function useCopyDeckEffects(theme: ThemeMode, pinned: boolean) {
  useTheme(theme);
  useTauriWindow(pinned);
  useToastTimeout();
}

function useTheme(theme: ThemeMode) {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}

function useTauriWindow(pinned: boolean) {
  useEffect(() => {
    import("@tauri-apps/api/window")
      .then(async ({ getCurrentWindow }) => {
        const win = getCurrentWindow();
        const updates = [
          win.setAlwaysOnTop(pinned),
          win.setShadow(true)
        ];

        if (pinned) {
          updates.push(win.setVisibleOnAllWorkspaces(true));
        }

        await Promise.allSettled(updates);
      })
      .catch(() => undefined);
  }, [pinned]);
}

function useToastTimeout() {
  const toast = useCopyDeckStore((state) => state.toast);
  const clearToast = useCopyDeckStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 1800);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);
}
