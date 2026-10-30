import { useEffect, useRef, useState } from "react";
import { createThemeStore, resolveTheme, THEME_COLORS, toggleTheme, type Theme } from "../lib/theme";

const store = createThemeStore(() => window.localStorage);
const DARK_QUERY = "(prefers-color-scheme: dark)";

// Mirrors the pre-paint script in Base.astro.
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = THEME_COLORS[theme];
  }
}

export default function ThemeToggle() {
  // Null until hydrated: the server can't know the visitor's theme.
  const [theme, setTheme] = useState<Theme | null>(null);
  // Remembers a choice for this page view even when storage is blocked.
  const choice = useRef<Theme | null>(null);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const sync = () => {
      const next = resolveTheme(choice.current ?? store.read(), query.matches ? "dark" : "light");
      applyTheme(next);
      setTheme(next);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const target = theme && toggleTheme(theme);

  return (
    <button
      type="button"
      onClick={() => {
        if (!target) return;
        choice.current = target;
        store.write(target);
        applyTheme(target);
        setTheme(target);
      }}
      className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink hover:text-accent motion-safe:transition-colors"
    >
      <span className="sr-only">{target ? `Switch to ${target} theme` : "Switch color theme"}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {target === "dark" && <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />}
        {target === "light" && (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
