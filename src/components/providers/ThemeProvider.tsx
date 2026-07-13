"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { themeStorageKey } from "@/config/theme.config";
import type { ThemeMode } from "@/types";

const systemThemeQuery = "(prefers-color-scheme: dark)";

type ResolvedTheme = Exclude<ThemeMode, "system">;

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function reportStorageError(action: "đọc" | "lưu", error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`Không thể ${action} lựa chọn giao diện.`, error);
  }
}

function getStoredTheme(): ThemeMode | null {
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    return isThemeMode(storedTheme) ? storedTheme : null;
  } catch (error) {
    reportStorageError("đọc", error);
    return null;
  }
}

function persistTheme(theme: ThemeMode): void {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch (error) {
    reportStorageError("lưu", error);
  }
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia(systemThemeQuery).matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode): ResolvedTheme {
  const resolvedTheme = resolveTheme(theme);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = theme;
  document.documentElement.style.colorScheme = resolvedTheme;
  return resolvedTheme;
}

function subscribeToHydration(): () => void {
  return () => undefined;
}

function subscribeToSystemTheme(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(systemThemeQuery);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSystemThemeSnapshot(): boolean {
  return window.matchMedia(systemThemeQuery).matches;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    return getStoredTheme() ?? defaultTheme;
  });
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const systemUsesDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    () => defaultTheme === "dark",
  );
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemUsesDark ? "dark" : "light") : theme;

  useEffect(() => {
    persistTheme(theme);
    applyTheme(theme);
  }, [systemUsesDark, theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    persistTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, mounted, setTheme }),
    [mounted, resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme phải được sử dụng bên trong ThemeProvider.");
  }

  return context;
}
