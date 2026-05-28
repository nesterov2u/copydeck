import { useEffect } from "react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import type { ThemeMode } from "../types";

export function useCopyDeckEffects(theme: ThemeMode, pinned: boolean) {
  useTheme(theme);
  useTauriWindow(pinned);
  useHotkeys();
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
      .then(({ getCurrentWindow }) => getCurrentWindow().setAlwaysOnTop(pinned))
      .catch(() => undefined);
  }, [pinned]);
}

function useHotkeys() {
  const copyAndNext = useCopyDeckStore((state) => state.copyAndNext);
  const copyCurrent = useCopyDeckStore((state) => state.copyCurrent);
  const goNext = useCopyDeckStore((state) => state.goNext);
  const goPrevious = useCopyDeckStore((state) => state.goPrevious);

  useEffect(() => {
    let unregisterGlobal: (() => void) | undefined;

    import("@tauri-apps/plugin-global-shortcut")
      .then(async ({ register, unregister }) => {
        const shortcuts = [
          ["CommandOrControl+Shift+C", copyAndNext],
          ["CommandOrControl+Shift+V", copyCurrent],
          ["CommandOrControl+Shift+Right", goNext],
          ["CommandOrControl+Shift+Left", goPrevious]
        ] as const;

        await Promise.all(shortcuts.map(([shortcut, handler]) => register(shortcut, handler)));
        unregisterGlobal = () => {
          shortcuts.forEach(([shortcut]) => {
            unregister(shortcut).catch(() => undefined);
          });
        };
      })
      .catch(() => undefined);

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || !event.shiftKey) return;

      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        copyAndNext();
      }

      if (event.key.toLowerCase() === "v") {
        event.preventDefault();
        copyCurrent();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unregisterGlobal?.();
    };
  }, [copyAndNext, copyCurrent, goNext, goPrevious]);
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
