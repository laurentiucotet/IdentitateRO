import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://identitate.ro',
  integrations: [tailwind()],
  output: 'static',
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
