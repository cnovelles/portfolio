export type Theme = "light" | "dark";

/** What the visitor chose; null means "follow the system". */
export type Preference = Theme | null;

export const THEME_STORAGE_KEY = "theme";

/** Browser chrome colors (theme-color meta), matching --color-bg in global.css. */
export const THEME_COLORS: Record<Theme, string> = {
  light: "#ffffff",
  dark: "#0d1a1d",
};

/** A stored preference always wins; otherwise follow the system. */
export function resolveTheme(stored: Preference, system: Theme): Theme {
  return stored ?? system;
}

/** The theme the toggle switches to from the one currently shown. */
export function toggleTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

export interface ThemeStore {
  /** The saved preference, or null when none is saved or storage is unavailable. */
  read(): Preference;
  /** Saves the preference; returns false when storage is unavailable. */
  write(theme: Theme): boolean;
}

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Wraps storage so private mode or blocked storage never throws. Takes a getter
 * because merely reading `window.localStorage` can throw a SecurityError.
 */
export function createThemeStore(getStorage: () => KeyValueStorage): ThemeStore {
  return {
    read() {
      try {
        const value = getStorage().getItem(THEME_STORAGE_KEY);
        return value === "light" || value === "dark" ? value : null;
      } catch {
        return null;
      }
    },
    write(theme) {
      try {
        getStorage().setItem(THEME_STORAGE_KEY, theme);
        return true;
      } catch {
        return false;
      }
    },
  };
}
