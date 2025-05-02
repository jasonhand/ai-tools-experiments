import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  // Output directory remains 'dist' by default
  // Specify site URL for correct absolute path generation
  site: 'https://your-live-site-url.com', // <-- TODO: Replace with your actual deployed site URL
});
