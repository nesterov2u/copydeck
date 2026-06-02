import { useEffect } from "react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import type { ThemeMode } from "../types";

const WINDOW_POSITION_KEY = "copydeck-window-position";

export function useCopyDeckEffects(theme: ThemeMode, pinned: boolean) {
  useTheme(theme);
  useWindowPlacement();
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

function useWindowPlacement() {
  useEffect(() => {
    let unlistenMoved: (() => void) | undefined;

    Promise.all([
      import("@tauri-apps/api/window"),
      import("@tauri-apps/api/dpi")
    ])
      .then(async ([{ getCurrentWindow }, { PhysicalPosition }]) => {
        const win = getCurrentWindow();
        const savedPosition = readSavedWindowPosition();

        if (savedPosition) {
          await win.setPosition(new PhysicalPosition(savedPosition.x, savedPosition.y));
        }

        unlistenMoved = await win.onMoved(({ payload }) => {
          saveWindowPosition(payload.x, payload.y);
        });
      })
      .catch(() => undefined);

    return () => unlistenMoved?.();
  }, []);
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

function readSavedWindowPosition() {
  try {
    const raw = window.localStorage.getItem(WINDOW_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<{ x: number; y: number }>;
    if (!isValidWindowCoordinate(parsed.x) || !isValidWindowCoordinate(parsed.y)) return null;
    return { x: parsed.x, y: parsed.y };
  } catch {
    return null;
  }
}

function saveWindowPosition(x: number, y: number) {
  if (!isValidWindowCoordinate(x) || !isValidWindowCoordinate(y)) return;
  window.localStorage.setItem(WINDOW_POSITION_KEY, JSON.stringify({ x, y }));
}

function isValidWindowCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) < 20000;
}
