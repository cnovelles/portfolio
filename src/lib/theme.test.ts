import { describe, expect, it } from "vitest";
import {
  createThemeStore,
  resolveTheme,
  toggleTheme,
  type Preference,
  type Theme,
} from "./theme";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

const blocked = () => {
  throw new DOMException("The operation is insecure.", "SecurityError");
};

const throwingStorage = {
  getItem: blocked,
  setItem: () => {
    throw new DOMException("Quota exceeded", "QuotaExceededError");
  },
};

describe("resolveTheme", () => {
  const cases: [Preference, Theme, Theme][] = [
    ["light", "light", "light"],
    ["light", "dark", "light"],
    ["dark", "light", "dark"],
    ["dark", "dark", "dark"],
    [null, "light", "light"],
    [null, "dark", "dark"],
  ];

  it.each(cases)("stored %s with system %s resolves to %s", (stored, system, expected) => {
    expect(resolveTheme(stored, system)).toBe(expected);
  });
});

describe("toggleTheme", () => {
  it("switches light to dark and back", () => {
    expect(toggleTheme("light")).toBe("dark");
    expect(toggleTheme("dark")).toBe("light");
    expect(toggleTheme(toggleTheme("light"))).toBe("light");
  });

  it("persists the choice so it wins over the system on the next visit", () => {
    const storage = memoryStorage();
    const store = createThemeStore(() => storage);
    const system: Theme = "light";

    const next = toggleTheme(resolveTheme(store.read(), system));
    expect(store.write(next)).toBe(true);

    const reloaded = createThemeStore(() => storage);
    expect(resolveTheme(reloaded.read(), system)).toBe("dark");
  });
});

describe("createThemeStore", () => {
  it("reads nothing when no preference is saved", () => {
    expect(createThemeStore(() => memoryStorage()).read()).toBeNull();
  });

  it("ignores values that are not a theme", () => {
    const store = createThemeStore(() => memoryStorage({ theme: "sepia" }));
    expect(store.read()).toBeNull();
  });

  it.each([
    ["getItem throws", () => throwingStorage],
    ["accessing storage throws", blocked],
  ])("falls back to the system theme when %s", (_, getStorage) => {
    const store = createThemeStore(getStorage);
    expect(resolveTheme(store.read(), "dark")).toBe("dark");
    expect(resolveTheme(store.read(), "light")).toBe("light");
  });

  it("reports a failed save instead of throwing", () => {
    expect(createThemeStore(() => throwingStorage).write("dark")).toBe(false);
    expect(createThemeStore(blocked).write("dark")).toBe(false);
  });
});
