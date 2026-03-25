import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://identitate.eu',
  integrations: [react(), tailwind(), sitemap(), keystatic()],
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: '_assets/[name].[hash][extname]',
        },
      },
    },
  },
});
