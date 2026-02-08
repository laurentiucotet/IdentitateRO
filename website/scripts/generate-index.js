#!/usr/bin/env node

/**
 * IdentitateRO — Generator index instituții (v2.0)
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
  console.log('📊 Generare index instituții (v2.0)...\n');

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

      // Validare structură minimă
      if (!data.id || !data.institution?.name || !data.institution?.category) {
        console.error(`  ⚠️  ${file}: structură invalidă (lipsește id, name sau category)`);
        continue;
      }

      institutions.push(data);

      // Statistici
      const cat = data.institution.category;
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;

      if (data.institution.manualUrl) withManual++;

      // Verifică dacă are cel puțin un SVG
      const logos = data.assets?.logos || {};
      const hasSvg = Object.values(logos).some(group => {
        const g = /** @type {any} */ (group);
        return g?.variants && (g.variants.color || g.variants.white || g.variants.monochrome);
      });
      if (hasSvg) withSvg++;

      console.log(`  ✅ ${data.institution.name} (${cat})`);
    } catch (err) {
      console.error(`  ❌ Eroare la ${file}:`, err.message);
    }
  }

  // Sortare alfabetică după numele instituției
  institutions.sort((a, b) =>
    a.institution.name.localeCompare(b.institution.name, 'ro')
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
    schemaVersion: '2.0.0',
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
  console.log(`   Schema: v2.0.0`);
  console.log(`   Total instituții: ${institutions.length}`);
  console.log(`   Categorii active: ${categories.length}`);
  console.log(`   Cu manual de brand: ${withManual}`);
  console.log(`   Cu SVG: ${withSvg}`);
  console.log(`\n💾 Index salvat: ${OUTPUT_FILE}`);
}

generateIndex().catch(console.error);
