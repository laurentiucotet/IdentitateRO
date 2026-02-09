#!/usr/bin/env node

/**
 * IdentitateRO — Generator index instituții (v3.0)
 *
 * Citește toate fișierele JSON din src/data/institutions/
 * și generează un index central (institutions-index.json)
 * cu statistici și rezumat pe categorii.
 *
 * Rulare: node scripts/generate-index.js
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INSTITUTIONS_DIR = join(__dirname, '../src/data/institutions');
const OUTPUT_FILE = join(__dirname, '../src/data/institutions-index.json');

const CATEGORY_LABELS = {
  'guvern': 'Guvern',
  'minister': 'Ministere',
  'primarie': 'Primării',
  'consiliu-judetean': 'Consilii Județene',
  'prefectura': 'Prefecturi',
  'agentie': 'Agenții',
  'autoritate': 'Autorități',
  'proiect-ue': 'Proiecte UE / PNRR',
  'institutie-cultura': 'Cultură',
  'altele': 'Altele',
};

const CATEGORY_ORDER = [
  'guvern', 'minister', 'agentie', 'autoritate',
  'primarie', 'consiliu-judetean', 'prefectura',
  'proiect-ue', 'institutie-cultura', 'altele',
];

async function generateIndex() {
  console.log('📊 Generare index instituții (v3.0)...\n');

  const files = await readdir(INSTITUTIONS_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const institutions = [];
  const categoryStats = {};
  let withManual = 0;
  let withSvg = 0;

  for (const file of jsonFiles) {
    try {
      const content = await readFile(join(INSTITUTIONS_DIR, file), 'utf-8');
      const data = JSON.parse(content);

      // Validare structură minimă v3
      if (!data.id || !data.slug || !data.name || !data.category) {
        console.error(`  ⚠️  ${file}: structură invalidă (lipsește id, slug, name sau category)`);
        continue;
      }

      // Validate v3 schema markers
      if (!data.id.startsWith('ro-') || !data.meta?.keywords || !data.assets?.main) {
        console.error(`  ⚠️  ${file}: nu respectă schema v3.0 (lipsește ro- prefix, keywords sau assets.main)`);
        continue;
      }

      institutions.push(data);

      // Statistici
      const cat = data.category;
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;

      if (data.resources?.branding_manual) withManual++;

      // Verifică dacă are cel puțin un SVG (v3: verifică assets.main și layouturi)
      const { main, horizontal, vertical, symbol } = data.assets;
      const groups = [main, horizontal, vertical, symbol].filter(Boolean);
      const hasSvg = groups.some(group => 
        group && (group.color || group.dark_mode || group.white || group.black || group.monochrome)
      );
      if (hasSvg) withSvg++;

      console.log(`  ✅ ${data.name} (${cat})`);
    } catch (err) {
      console.error(`  ❌ Eroare la ${file}:`, err.message);
    }
  }

  // Sortare alfabetică după numele instituției
  institutions.sort((a, b) =>
    a.name.localeCompare(b.name, 'ro')
  );

  // Generare rezumat categorii (doar cele active, sortate)
  const categories = CATEGORY_ORDER
    .filter(cat => categoryStats[cat])
    .map(cat => ({
      id: cat,
      label: CATEGORY_LABELS[cat] || cat,
      count: categoryStats[cat],
    }));

  const index = {
    schemaVersion: '3.0.0',
    generatedAt: new Date().toISOString(),
    total: institutions.length,
    stats: {
      byCategory: categoryStats,
      withManual,
      withSvg,
    },
    categories,
    institutions,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');

  console.log(`\n📋 REZUMAT`);
  console.log(`   Schema: v3.0.0`);
  console.log(`   Total instituții: ${institutions.length}`);
  console.log(`   Categorii active: ${categories.length}`);
  console.log(`   Cu manual de brand: ${withManual}`);
  console.log(`   Cu SVG: ${withSvg}`);
  console.log(`\n💾 Index salvat: ${OUTPUT_FILE}`);
}

generateIndex().catch(console.error);
