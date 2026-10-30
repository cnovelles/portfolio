import type { APIRoute } from "astro";

// Built from `site` so the sitemap URL follows the domain config.
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL("sitemap-index.xml", site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
