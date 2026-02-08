#!/usr/bin/env node

/**
 * IdentitateRO - Generator index instituții
 *
 * Citește toate fișierele JSON din src/data/institutions/
 * și generează un index central (institutions-index.json).
 *
 * Rulare: node scripts/generate-index.js
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INSTITUTIONS_DIR = join(__dirname, '../src/data/institutions');
const OUTPUT_FILE = join(__dirname, '../src/data/institutions-index.json');

async function generateIndex() {
  console.log('📊 Generare index instituții...\n');

  const files = await readdir(INSTITUTIONS_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const institutions = [];
  const categoryStats = {};
  let withBrandManual = 0;
  let withSvg = 0;

  for (const file of jsonFiles) {
    try {
      const content = await readFile(join(INSTITUTIONS_DIR, file), 'utf-8');
      const data = JSON.parse(content);
      institutions.push(data);

      // Statistici
      categoryStats[data.category] = (categoryStats[data.category] || 0) + 1;
      if (data.resources?.brandManual) withBrandManual++;
      if (data.assets?.some(a => a.format === 'svg')) withSvg++;

      console.log(`  ✅ ${data.name}`);
    } catch (err) {
      console.error(`  ❌ Eroare la ${file}:`, err.message);
    }
  }

  // Sortare alfabetică
  institutions.sort((a, b) => a.name.localeCompare(b.name, 'ro'));

  const index = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    total: institutions.length,
    stats: {
      byCategory: categoryStats,
      withBrandManual,
      withSvg,
    },
    institutions,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');

  console.log(`\n📋 REZUMAT`);
  console.log(`   Total instituții: ${institutions.length}`);
  console.log(`   Cu manual de brand: ${withBrandManual}`);
  console.log(`   Cu SVG: ${withSvg}`);
  console.log(`\n💾 Index salvat: ${OUTPUT_FILE}`);
}

generateIndex().catch(console.error);
