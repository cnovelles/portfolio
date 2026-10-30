import { z } from "astro/zod";

/*
  Projects catalog (PRD module 2). Everything here is pure so it can be tested
  without Astro; the content-collection adapter lives in project-collection.ts.
*/

export const projectStatuses = ["in-progress", "shipped"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

/** Body headings every write-up must have, in this order. */
export const requiredBodySections = ["Problem", "Approach", "Result"] as const;

const httpUrl = z.url({ protocol: /^https?$/ });
const text = z.string().trim().min(1);

/**
 * Frontmatter schema. `image` is injected so the content collection can pass
 * Astro's `image()` helper while tests pass a plain string schema.
 */
export function createProjectSchema<I extends z.ZodType>(image: I) {
  return z
    .strictObject({
      title: text,
      summary: text.max(280),
      role: text,
      stack: z.array(text).min(1),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      status: z.enum(projectStatuses),
      featured: z.boolean().default(false),
      order: z.number().int().default(0),
      repoUrl: httpUrl.optional(),
      liveUrl: httpUrl.optional(),
      cover: z.strictObject({ src: image, alt: text }).optional(),
    })
    .refine((p) => !p.endDate || p.endDate >= p.startDate, {
      message: "endDate must not be before startDate",
      path: ["endDate"],
    });
}

/** The fields the catalog functions need; real entries carry more. */
export interface CatalogEntry {
  id: string;
  data: { featured: boolean; order: number; startDate: Date };
}

/**
 * Lower `order` first, then most recent start date, then slug, so the result
 * never depends on file-system or loader order.
 */
export function sortProjects<T extends CatalogEntry>(entries: readonly T[]): T[] {
  return [...entries].sort(
    (a, b) =>
      a.data.order - b.data.order ||
      b.data.startDate.getTime() - a.data.startDate.getTime() ||
      a.id.localeCompare(b.id, "en"),
  );
}

export function selectFeatured<T extends CatalogEntry>(entries: readonly T[]): T[] {
  return sortProjects(entries.filter((e) => e.data.featured));
}

export function findBySlug<T extends CatalogEntry>(
  entries: readonly T[],
  slug: string,
): T | undefined {
  return entries.find((e) => e.id === slug);
}

export type ProjectCatalog<T> =
  | { state: "empty" }
  | { state: "ready"; all: T[]; featured: T[]; showcase: T[] };

/**
 * Explicit empty-state signal for the Projects section. `showcase` is what the
 * home page shows: featured projects, or every project if none is featured.
 */
export function toCatalog<T extends CatalogEntry>(entries: readonly T[]): ProjectCatalog<T> {
  if (entries.length === 0) return { state: "empty" };
  const all = sortProjects(entries);
  const featured = all.filter((e) => e.data.featured);
  return { state: "ready", all, featured, showcase: featured.length > 0 ? featured : all };
}

/** Required body sections that are missing from a Markdown write-up. */
export function missingBodySections(markdown: string): string[] {
  const headings = new Set(
    [...markdown.matchAll(/^##[ \t]+(.+?)[ \t]*#*[ \t]*$/gm)].map((m) =>
      (m[1] ?? "").toLowerCase(),
    ),
  );
  return requiredBodySections.filter((s) => !headings.has(s.toLowerCase()));
}

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "Jan 2025 – Present" for in-progress work, "Jan 2025 – Mar 2025" otherwise. */
export function formatDateRange(start: Date, end?: Date): string {
  const from = monthYear.format(start);
  const to = end ? monthYear.format(end) : "Present";
  return from === to ? from : `${from} – ${to}`;
}
