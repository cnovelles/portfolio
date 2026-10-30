import { z } from "astro/zod";
import { describe, expect, it } from "vitest";
import {
  createProjectSchema,
  findBySlug,
  formatDateRange,
  missingBodySections,
  selectFeatured,
  sortProjects,
  toCatalog,
} from "./projects";

// Tests stand in a plain string for Astro's image() helper.
const schema = createProjectSchema(z.string());

const validFrontmatter = {
  title: "Sample project",
  summary: "A fixture used only by tests.",
  role: "Sole developer",
  stack: ["TypeScript", "Astro"],
  startDate: "2026-01-15",
  status: "in-progress",
};

function entry(id: string, data: { featured?: boolean; order?: number; startDate?: string } = {}) {
  return {
    id,
    data: {
      featured: data.featured ?? false,
      order: data.order ?? 0,
      startDate: new Date(data.startDate ?? "2026-01-01"),
    },
  };
}

const ids = (entries: { id: string }[]) => entries.map((e) => e.id);

describe("project schema", () => {
  it("accepts a minimal project and applies defaults", () => {
    const parsed = schema.parse(validFrontmatter);
    expect(parsed.featured).toBe(false);
    expect(parsed.order).toBe(0);
    expect(parsed.startDate).toEqual(new Date("2026-01-15"));
  });

  it("accepts a full project with links and a cover image", () => {
    const result = schema.safeParse({
      ...validFrontmatter,
      endDate: "2026-04-01",
      status: "shipped",
      featured: true,
      order: 2,
      repoUrl: "https://github.com/cnovelles/example",
      liveUrl: "https://example.com",
      cover: { src: "./cover.png", alt: "Home screen of the sample app" },
    });
    expect(result.success).toBe(true);
  });

  it.each(["title", "summary", "role", "stack", "startDate", "status"])(
    "rejects a project missing %s",
    (field) => {
      const incomplete = Object.fromEntries(
        Object.entries(validFrontmatter).filter(([key]) => key !== field),
      );
      expect(schema.safeParse(incomplete).success).toBe(false);
    },
  );

  it("rejects a cover image without alt text", () => {
    expect(schema.safeParse({ ...validFrontmatter, cover: { src: "./cover.png" } }).success).toBe(
      false,
    );
    expect(
      schema.safeParse({ ...validFrontmatter, cover: { src: "./cover.png", alt: "   " } }).success,
    ).toBe(false);
  });

  it("rejects an empty stack, unknown status, bad URLs, and unknown fields", () => {
    for (const bad of [
      { stack: [] },
      { status: "abandoned" },
      { repoUrl: "not a url" },
      { liveUrl: "javascript:alert(1)" },
      { tagline: "typo'd field" },
    ]) {
      expect(schema.safeParse({ ...validFrontmatter, ...bad }).success).toBe(false);
    }
  });

  it("rejects an end date before the start date", () => {
    expect(schema.safeParse({ ...validFrontmatter, endDate: "2025-12-31" }).success).toBe(false);
  });
});

describe("sortProjects", () => {
  it("orders by ascending sort order", () => {
    expect(ids(sortProjects([entry("c", { order: 3 }), entry("a", { order: 1 }), entry("b", { order: 2 })]))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("breaks order ties by most recent start date, then by slug", () => {
    const entries = [
      entry("zeta", { startDate: "2025-01-01" }),
      entry("beta", { startDate: "2026-06-01" }),
      entry("alpha", { startDate: "2025-01-01" }),
    ];
    expect(ids(sortProjects(entries))).toEqual(["beta", "alpha", "zeta"]);
  });

  it("returns the same order whatever the input order", () => {
    const entries = [entry("a"), entry("b"), entry("c"), entry("d", { order: -1 })];
    const expected = ["d", "a", "b", "c"];
    expect(ids(sortProjects(entries))).toEqual(expected);
    expect(ids(sortProjects([...entries].reverse()))).toEqual(expected);
  });

  it("does not mutate its input", () => {
    const entries = [entry("b"), entry("a")];
    sortProjects(entries);
    expect(ids(entries)).toEqual(["b", "a"]);
  });
});

describe("selectFeatured", () => {
  it("keeps only featured projects, sorted", () => {
    const entries = [
      entry("plain", { order: 0 }),
      entry("second", { featured: true, order: 2 }),
      entry("first", { featured: true, order: 1 }),
    ];
    expect(ids(selectFeatured(entries))).toEqual(["first", "second"]);
  });

  it("returns nothing when no project is featured", () => {
    expect(selectFeatured([entry("a"), entry("b")])).toEqual([]);
  });
});

describe("findBySlug", () => {
  it("finds a project by slug and returns undefined for an unknown one", () => {
    const entries = [entry("dresser"), entry("other")];
    expect(findBySlug(entries, "dresser")?.id).toBe("dresser");
    expect(findBySlug(entries, "missing")).toBeUndefined();
  });
});

describe("toCatalog", () => {
  it("signals the empty state when there are no projects", () => {
    expect(toCatalog([])).toEqual({ state: "empty" });
  });

  it("showcases featured projects when any exist", () => {
    const catalog = toCatalog([entry("b"), entry("a", { featured: true })]);
    expect(catalog.state).toBe("ready");
    if (catalog.state !== "ready") return;
    expect(ids(catalog.all)).toEqual(["a", "b"]);
    expect(ids(catalog.featured)).toEqual(["a"]);
    expect(ids(catalog.showcase)).toEqual(["a"]);
  });

  it("showcases every project when none is featured", () => {
    const catalog = toCatalog([entry("b"), entry("a")]);
    if (catalog.state !== "ready") throw new Error("expected ready");
    expect(ids(catalog.showcase)).toEqual(["a", "b"]);
  });
});

describe("missingBodySections", () => {
  it("passes a body with problem, approach, and result headings", () => {
    expect(missingBodySections("## Problem\ntext\n\n## Approach\ntext\n\n## result\ntext")).toEqual([]);
  });

  it("lists the sections that are missing", () => {
    expect(missingBodySections("## Problem\ntext\n### Approach\n")).toEqual(["Approach", "Result"]);
    expect(missingBodySections("")).toEqual(["Problem", "Approach", "Result"]);
  });
});

describe("formatDateRange", () => {
  it("formats in-progress, finished, and single-month work", () => {
    expect(formatDateRange(new Date("2026-01-01"))).toBe("Jan 2026 – Present");
    expect(formatDateRange(new Date("2025-11-01"), new Date("2026-03-01"))).toBe("Nov 2025 – Mar 2026");
    expect(formatDateRange(new Date("2026-02-01"), new Date("2026-02-20"))).toBe("Feb 2026");
  });
});
