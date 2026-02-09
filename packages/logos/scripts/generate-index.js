#!/usr/bin/env node

/**
 * Generează index.json pentru pachetul @identitate-ro/logos
 * Acesta conține metadata despre toate logo-urile disponibile
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOGOS_DIR = join(__dirname, '../logos');
const OUTPUT_FILE = join(__dirname, '../index.json');

function generateIndex() {
  const institutions = [];
  
  // Citește toate directoarele din logos/
  const slugs = readdirSync(LOGOS_DIR).filter(item => {
    const itemPath = join(LOGOS_DIR, item);
    return statSync(itemPath).isDirectory();
  });

  for (const slug of slugs) {
    const institutionDir = join(LOGOS_DIR, slug);
    const files = readdirSync(institutionDir);
    
    const logos = {
      horizontal: {},
      vertical: {},
      symbol: {}
    };

    // Analizează fiecare fișier și determină layout-ul și varianta
    for (const file of files) {
      if (!file.endsWith('.svg') && !file.endsWith('.png')) continue;

      const path = `/logos/${slug}/${file}`;
      const extension = file.split('.').pop();
      
      // Detectează layout-ul și varianta
      if (file.includes('simbol') || file.includes('symbol') || file.includes('icon')) {
        // Symbol
        if (file.includes('mono')) {
          logos.symbol.monochrome = path;
        } else if (file.includes('alb') || file.includes('white')) {
          logos.symbol.white = path;
        } else if (file.includes('black') || file.includes('negru')) {
          logos.symbol.black = path;
        } else if (file.includes('dark')) {
          logos.symbol.dark_mode = path;
        } else {
          logos.symbol.color = path;
        }
      } else if (file.includes('vertical')) {
        // Vertical
        if (file.includes('mono')) {
          logos.vertical.monochrome = path;
        } else if (file.includes('alb') || file.includes('white')) {
          logos.vertical.white = path;
        } else if (file.includes('black') || file.includes('negru')) {
          logos.vertical.black = path;
        } else if (file.includes('dark')) {
          logos.vertical.dark_mode = path;
        } else {
          logos.vertical.color = path;
        }
      } else {
        // Horizontal (default)
        if (file.includes('mono')) {
          logos.horizontal.monochrome = path;
        } else if (file.includes('alb') || file.includes('white')) {
          logos.horizontal.white = path;
        } else if (file.includes('black') || file.includes('negru')) {
          logos.horizontal.black = path;
        } else if (file.includes('dark')) {
          logos.horizontal.dark_mode = path;
        } else {
          logos.horizontal.color = path;
        }
      }
    }

    // Curăță layout-urile goale
    Object.keys(logos).forEach(layout => {
      if (Object.keys(logos[layout]).length === 0) {
        delete logos[layout];
      }
    });

    // Încarcă numele din JSON dacă există
    let name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    try {
      const jsonPath = join(__dirname, `../../../website/src/data/institutions/${slug}.json`);
      const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
      name = data.name;
    } catch (err) {
      // Fallback la numele generat
    }

    institutions.push({
      id: `ro-${slug}`,
      slug,
      name,
      logos
    });
  }

  const output = {
    version: "1.0.0",
    generated: new Date().toISOString(),
    count: institutions.length,
    institutions: institutions.sort((a, b) => a.slug.localeCompare(b.slug))
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`✅ Generated index.json with ${institutions.length} institutions`);
}

generateIndex();
