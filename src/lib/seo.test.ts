import { describe, expect, it } from "vitest";
import { buildMeta, siteDefaults, type PageMeta } from "./seo";

const site = "https://example.dev";

function tag(meta: PageMeta, key: string): string | undefined {
  return meta.tags.find((t) => t.key === key)?.content;
}

describe("buildMeta", () => {
  it("applies site defaults when fields are omitted", () => {
    const meta = buildMeta({}, site);
    expect(meta.title).toBe("Christian Gonzalez Lopez | Full-Stack Software Engineer");
    expect(meta.description).toBe(siteDefaults.description);
    expect(meta.canonical).toBe("https://example.dev/");
    expect(tag(meta, "og:type")).toBe("website");
    expect(tag(meta, "og:image")).toBe("https://example.dev/og-default.png");
    expect(tag(meta, "og:image:alt")).toBe(siteDefaults.image.alt);
  });

  it("lets per-page values override the defaults", () => {
    const meta = buildMeta(
      {
        title: "Dresser",
        description: "A wardrobe app.",
        path: "/projects/dresser",
        type: "article",
        image: { src: "/img/dresser.png", alt: "Dresser home screen", width: 1200, height: 630 },
      },
      site,
    );
    expect(meta.description).toBe("A wardrobe app.");
    expect(tag(meta, "og:description")).toBe("A wardrobe app.");
    expect(tag(meta, "twitter:description")).toBe("A wardrobe app.");
    expect(meta.canonical).toBe("https://example.dev/projects/dresser");
    expect(tag(meta, "og:type")).toBe("article");
    expect(tag(meta, "og:image")).toBe("https://example.dev/img/dresser.png");
    expect(tag(meta, "og:image:alt")).toBe("Dresser home screen");
    expect(tag(meta, "twitter:image:alt")).toBe("Dresser home screen");
  });

  it("suffixes page titles with the site name", () => {
    const meta = buildMeta({ title: "Page not found" }, site);
    expect(meta.title).toBe("Page not found | Christian Gonzalez Lopez");
    expect(tag(meta, "og:title")).toBe(meta.title);
    expect(tag(meta, "twitter:title")).toBe(meta.title);
  });

  it("does not repeat the site name when the title already has it", () => {
    const title = "Christian Gonzalez Lopez | Full-Stack Software Engineer";
    expect(buildMeta({ title }, site).title).toBe(title);
  });

  it("makes canonical and image URLs absolute", () => {
    const meta = buildMeta({ path: "/404" }, new URL("https://example.dev/"));
    for (const url of [meta.canonical, tag(meta, "og:url"), tag(meta, "og:image"), tag(meta, "twitter:image")]) {
      expect(url).toMatch(/^https:\/\/example\.dev\//);
    }
  });

  it("keeps an already-absolute image URL", () => {
    const image = { src: "https://cdn.example.com/a.png", alt: "A", width: 1200, height: 630 };
    expect(tag(buildMeta({ image }, site), "og:image")).toBe(image.src);
  });

  it("emits every Open Graph and Twitter tag", () => {
    const meta = buildMeta({}, site);
    const og = [
      "og:title",
      "og:description",
      "og:url",
      "og:type",
      "og:image",
      "og:image:alt",
      "og:site_name",
      "og:locale",
    ];
    const twitter = ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"];
    for (const key of og) {
      expect(meta.tags.find((t) => t.key === key)).toMatchObject({ attr: "property", content: expect.any(String) });
    }
    for (const key of twitter) {
      expect(meta.tags.find((t) => t.key === key)).toMatchObject({ attr: "name", content: expect.any(String) });
    }
    expect(tag(meta, "twitter:card")).toBe("summary_large_image");
    expect(tag(meta, "og:site_name")).toBe("Christian Gonzalez Lopez");
    expect(tag(meta, "og:locale")).toBe("en_US");
    expect(meta.tags.every((t) => t.content.length > 0)).toBe(true);
  });
});
