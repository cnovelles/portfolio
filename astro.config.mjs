// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Deployed origin, used for canonical/OG URLs and the sitemap.
// Swap for the custom domain once it's live (#11).
const SITE_URL = 'https://portfolio-xi-one-b66hmycebi.vercel.app';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});
