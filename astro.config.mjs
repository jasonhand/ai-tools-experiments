// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  build: {
    format: 'file',
    assets: 'assets'
  },

  outDir: './dist',
  publicDir: './public',

  // Process all pages in src/pages
  vite: {},

  integrations: [mdx()]
});
