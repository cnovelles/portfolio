// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Canonical origin (custom domain, #11), used for canonical/OG URLs and the sitemap.
// The apex domain and the vercel.app URL both redirect here.
const SITE_URL = 'https://www.christiangonzalezlopez.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});
