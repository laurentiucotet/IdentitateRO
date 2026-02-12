#!/usr/bin/env node

/**
 * Generează index.json pentru pachetul @identitate-ro/logos
 * Scanează structura: logos/{slug}/{layout}/{variant}.svg
 * Suportă și fișiere flat legacy: logos/{slug}/{layout}_{variant}.svg
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOGOS_DIR = join(__dirname, '../logos');
const OUTPUT_FILE = join(__dirname, '../index.json');

const VALID_LAYOUTS = ['horizontal', 'vertical', 'symbol'];
const VALID_VARIANTS = ['color', 'white', 'black', 'monochrome', 'dark_mode'];

// Map variant aliases to canonical names
const VARIANT_ALIASES = {
  'color': 'color',
  'white': 'white',
  'alb': 'white',
  'black': 'black',
  'negru': 'black',
  'mono': 'monochrome',
  'monochrome': 'monochrome',
  'dark': 'dark_mode',
  'dark_mode': 'dark_mode',
};

/**
 * Detectează varianta dintr-un nume de fișier
 * e.g. "color.svg" → "color", "symbol_black.svg" → "black"
 */
function detectVariant(filename) {
  const name = filename.replace(/\.(svg|png)$/, '').toLowerCase();
  // Try exact match first (for subdirectory files like "color.svg")
  if (VARIANT_ALIASES[name]) return VARIANT_ALIASES[name];
  // Try suffix match (for legacy flat files like "symbol_black.svg")
  for (const [alias, canonical] of Object.entries(VARIANT_ALIASES)) {
    if (name.endsWith(`_${alias}`) || name.endsWith(`-${alias}`)) return canonical;
  }
  // Default: treat as color variant
  return 'color';
}

/**
 * Detectează layout-ul dintr-un nume de fișier legacy
 * e.g. "symbol_black.svg" → "symbol"
 */
function detectLayout(filename) {
  const name = filename.toLowerCase();
  if (name.startsWith('symbol') || name.startsWith('simbol') || name.startsWith('icon')) return 'symbol';
  if (name.startsWith('vertical')) return 'vertical';
  return 'horizontal';
}

function generateIndex() {
  const institutions = [];

  // Citește toate directoarele din logos/
  const slugs = readdirSync(LOGOS_DIR).filter(item => {
    const itemPath = join(LOGOS_DIR, item);
    return statSync(itemPath).isDirectory();
  });

  for (const slug of slugs) {
    const institutionDir = join(LOGOS_DIR, slug);
    const entries = readdirSync(institutionDir);
    const logos = {};

    // 1. Scanează subdirectoare layout (horizontal/, vertical/, symbol/)
    for (const layout of VALID_LAYOUTS) {
      const layoutDir = join(institutionDir, layout);
      if (!existsSync(layoutDir) || !statSync(layoutDir).isDirectory()) continue;

      const files = readdirSync(layoutDir).filter(f => f.endsWith('.svg') || f.endsWith('.png'));
      if (files.length === 0) continue;

      logos[layout] = {};
      for (const file of files) {
        const variant = detectVariant(file);
        logos[layout][variant] = `/logos/${slug}/${layout}/${file}`;
      }
    }

    // 2. Scanează fișiere flat legacy (symbol_color.svg etc.) la rădăcina instituției
    const flatFiles = entries.filter(f =>
      (f.endsWith('.svg') || f.endsWith('.png')) && !statSync(join(institutionDir, f)).isDirectory()
    );
    for (const file of flatFiles) {
      const layout = detectLayout(file);
      const variant = detectVariant(file);
      if (!logos[layout]) logos[layout] = {};
      // Nu suprascrie dacă deja avem din subdirectoare
      if (!logos[layout][variant]) {
        logos[layout][variant] = `/logos/${slug}/${file}`;
      }
    }

    // Încarcă numele din JSON dacă există
    let name = slug
      .replace(/^ro-/, '')
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    try {
      const jsonPath = join(__dirname, `../../../website/src/data/institutions/${slug}.json`);
      const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
      name = data.name;
    } catch (err) {
      // Fallback la numele generat din slug
    }

    const logoCount = Object.values(logos).reduce((sum, layout) => sum + Object.keys(layout).length, 0);

    institutions.push({
      id: slug,       // slug-ul deja conține prefixul "ro-" (e.g. "ro-anaf")
      slug,
      name,
      layouts: Object.keys(logos),
      logoCount,
      logos
    });
  }

  // Statistici globale
  const totalLogos = institutions.reduce((sum, inst) => sum + inst.logoCount, 0);

  const output = {
    version: "1.1.0",
    generated: new Date().toISOString(),
    count: institutions.length,
    totalLogos,
    institutions: institutions.sort((a, b) => a.slug.localeCompare(b.slug))
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  // Raport detaliat
  console.log(`\n✅ Generated index.json`);
  console.log(`   ${institutions.length} institutions, ${totalLogos} logo files\n`);
  for (const inst of output.institutions) {
    const layouts = inst.layouts.join(', ') || 'none';
    console.log(`   ${inst.id.padEnd(25)} ${String(inst.logoCount).padStart(2)} logos  [${layouts}]`);
  }
  console.log('');
}

generateIndex();
