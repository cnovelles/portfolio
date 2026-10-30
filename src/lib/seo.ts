import { identity } from "../data/profile";

export interface SocialImage {
  /** Root-relative path (e.g. "/og.png") or an absolute URL. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface PageMetaInput {
  /**
   * Page-specific title; gets a " | <site name>" suffix. Omit it (home page)
   * to use the site title; a title already naming the site is used as-is.
   */
  title?: string;
  description?: string;
  /** Root-relative path of the page, e.g. "/" or "/projects/dresser". */
  path?: string;
  image?: SocialImage;
  type?: "website" | "article" | "profile";
}

export interface MetaTag {
  /** `property` for Open Graph, `name` for everything else. */
  attr: "name" | "property";
  key: string;
  content: string;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  tags: MetaTag[];
}

// Site-wide defaults: pages override only what differs.
export const siteDefaults = {
  siteName: identity.name,
  siteTitle: `${identity.name} | ${identity.title}`,
  titleSeparator: " | ",
  description: identity.stackLine,
  locale: "en_US",
  type: "website",
  image: {
    src: "/og-default.png",
    alt: `${identity.name}, ${identity.title}`,
    width: 1200,
    height: 630,
  },
} as const satisfies {
  siteName: string;
  siteTitle: string;
  titleSeparator: string;
  description: string;
  locale: string;
  type: PageMetaInput["type"];
  image: SocialImage;
};

function absolute(pathOrUrl: string, site: string | URL): string {
  return new URL(pathOrUrl, site).href;
}

/**
 * Builds the full meta set for a page. `site` is the deployed origin
 * (Astro's `site` config), so every URL in the result is absolute.
 */
export function buildMeta(input: PageMetaInput, site: string | URL): PageMeta {
  const title = !input.title
    ? siteDefaults.siteTitle
    : input.title.includes(siteDefaults.siteName)
      ? input.title
      : `${input.title}${siteDefaults.titleSeparator}${siteDefaults.siteName}`;
  const description = input.description ?? siteDefaults.description;
  const canonical = absolute(input.path ?? "/", site);
  const image = input.image ?? siteDefaults.image;
  const imageUrl = absolute(image.src, site);

  const og = (key: string, content: string): MetaTag => ({ attr: "property", key, content });
  const named = (key: string, content: string): MetaTag => ({ attr: "name", key, content });

  return {
    title,
    description,
    canonical,
    tags: [
      named("description", description),
      og("og:title", title),
      og("og:description", description),
      og("og:url", canonical),
      og("og:type", input.type ?? siteDefaults.type),
      og("og:site_name", siteDefaults.siteName),
      og("og:locale", siteDefaults.locale),
      og("og:image", imageUrl),
      og("og:image:alt", image.alt),
      og("og:image:width", String(image.width)),
      og("og:image:height", String(image.height)),
      named("twitter:card", "summary_large_image"),
      named("twitter:title", title),
      named("twitter:description", description),
      named("twitter:image", imageUrl),
      named("twitter:image:alt", image.alt),
    ],
  };
}
