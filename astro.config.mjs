import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  integrations: [mdx()],
  devToolbar: {
    enabled: false,
  },
  // Output directory remains 'dist' by default
  // Specify site URL for correct absolute path generation
  site: 'https://ai-tools-lab-tst.netlify.app', // Updated with test Netlify site URL
});
