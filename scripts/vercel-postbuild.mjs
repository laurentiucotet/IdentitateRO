/**
 * Vercel postbuild script (runs from repo root after `astro build`)
 *
 * Problem: `npm --prefix website run build` runs Astro with CWD=website/,
 * so the Build Output API output lands at website/.vercel/output/.
 * Vercel's Build Output API requires .vercel/output/ at the repo root.
 *
 * This script:
 *   1. Copies website/.vercel/output → .vercel/output (repo root)
 *   2. Injects CDN proxy routes (logos + loader.js) into config.json
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'website/.vercel/output';
const DEST = '.vercel/output';

if (!existsSync(SRC)) {
  console.error(`ERROR: ${SRC} not found. Did the Astro build succeed?`);
  process.exit(1);
}

// Copy Build Output API directory to repo root
if (!existsSync('.vercel')) mkdirSync('.vercel');
cpSync(SRC, DEST, { recursive: true });
console.log(`✓ Copied ${SRC} → ${DEST}`);

// Patch config.json: inject CDN proxy routes before the filesystem handler
const configPath = join(DEST, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

const cdnRoutes = [
  {
    src: '^/loader\\.js$',
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
    dest: 'https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.7/identity-loader.js',
  },
  {
    src: '^/logos/(.*)$',
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
    dest: 'https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.7/logos/$1',
  },
];

// Insert before the first route (before filesystem handler)
config.routes.unshift(...cdnRoutes);
writeFileSync(configPath, JSON.stringify(config, null, '\t'));
console.log('✓ CDN proxy routes injected into config.json');
