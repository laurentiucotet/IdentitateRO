#!/usr/bin/env node

/**
 * Script de migrare: Adaugă CDN URLs la toate fișierele JSON instituționale
 *
 * Convertește path-urile simple (string) la obiecte AssetUrls cu CDN URLs
 * Păstrează backwards compatibility (path-urile string rămân funcționale)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INSTITUTIONS_DIR = join(__dirname, '../src/data/institutions');
const CDN_VERSION = '1.0.0';

/**
 * Generează CDN URLs din path local
 */
function getCdnUrls(localPath) {
  return {
    cdn_primary: `https://cdn.jsdelivr.net/npm/@identitate-ro/logos@${CDN_VERSION}${localPath}`,
    cdn_fallback: `https://unpkg.com/@identitate-ro/logos@${CDN_VERSION}${localPath}`,
    local: localPath,
  };
}

/**
 * Convertește un asset (string sau deja AssetUrls) la AssetUrls complet
 */
function convertAsset(asset) {
  if (!asset) return asset;

  // Dacă e deja un obiect cu cdn_primary/cdn_fallback, îl păstrăm
  if (typeof asset === 'object' && asset.local) {
    return asset;
  }

  // Dacă e string simplu, convertim la AssetUrls
  if (typeof asset === 'string') {
    return getCdnUrls(asset);
  }

  return asset;
}

/**
 * Convertește un LogoAssetGroup să folosească AssetUrls
 */
function convertLogoGroup(group) {
  if (!group) return group;

  const converted = { ...group };

  // Convertim fiecare variantă
  if (group.color) converted.color = convertAsset(group.color);
  if (group.dark_mode) converted.dark_mode = convertAsset(group.dark_mode);
  if (group.white) converted.white = convertAsset(group.white);
  if (group.black) converted.black = convertAsset(group.black);
  if (group.monochrome) converted.monochrome = convertAsset(group.monochrome);

  // Convertim PNG dacă există
  if (group.png && group.png.path) {
    converted.png = {
      ...group.png,
      path: convertAsset(group.png.path),
    };
  }

  return converted;
}

/**
 * Migrează o instituție la schema v3.1 cu CDN URLs
 */
function migrateInstitution(institution) {
  const migrated = { ...institution };

  // Convertim assets
  if (migrated.assets) {
    if (migrated.assets.main) {
      migrated.assets.main = convertLogoGroup(migrated.assets.main);
    }
    if (migrated.assets.horizontal) {
      migrated.assets.horizontal = convertLogoGroup(migrated.assets.horizontal);
    }
    if (migrated.assets.vertical) {
      migrated.assets.vertical = convertLogoGroup(migrated.assets.vertical);
    }
    if (migrated.assets.symbol) {
      migrated.assets.symbol = convertLogoGroup(migrated.assets.symbol);
    }
  }

  return migrated;
}

/**
 * Procesează toate fișierele JSON din director
 */
function migrateAll() {
  const files = readdirSync(INSTITUTIONS_DIR).filter((f) => f.endsWith('.json'));

  console.log(`🔄 Migrare la schema v3.1 cu CDN URLs...`);
  console.log(`📁 Director: ${INSTITUTIONS_DIR}`);
  console.log(`📦 Versiune CDN: ${CDN_VERSION}\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const filePath = join(INSTITUTIONS_DIR, file);

    try {
      // Citește JSON
      const content = readFileSync(filePath, 'utf8');
      const institution = JSON.parse(content);

      // Verifică dacă are deja CDN URLs
      const hasMainCdn = institution.assets?.main?.color?.cdn_primary;

      if (hasMainCdn) {
        console.log(`⏭️  ${file} - deja migrat, skip`);
        skippedCount++;
        continue;
      }

      // Migrează
      const migrated = migrateInstitution(institution);

      // Salvează (cu formatting frumos)
      writeFileSync(filePath, JSON.stringify(migrated, null, 2) + '\n', 'utf8');

      console.log(`✅ ${file} - migrat cu succes`);
      migratedCount++;
    } catch (err) {
      console.error(`❌ ${file} - eroare:`, err.message);
    }
  }

  console.log(`\n📊 Rezultate:`);
  console.log(`   ✅ Migrate: ${migratedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   📝 Total: ${files.length}`);

  if (migratedCount > 0) {
    console.log(`\n✨ Migrare completă! Toate path-urile au CDN URLs.`);
    console.log(`🔗 CDN URLs folosesc: jsDelivr (primary), unpkg (fallback), local (backup)`);
  } else {
    console.log(`\nℹ️  Nu au fost necesare modificări.`);
  }
}

// Run migration
migrateAll();
