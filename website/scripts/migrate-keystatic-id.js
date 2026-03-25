/**
 * Migrate: add `_id` slug field required by Keystatic to each institution JSON.
 *
 * Keystatic collections require a `slugField` of type `fields.slug()`,
 * which stores `{ name, slug }`. This script adds:
 *   "_id": { "name": "ro-anaf", "slug": "ro-anaf" }
 * to every institution JSON file, derived from the existing `id` field.
 *
 * Safe to re-run — skips files that already have `_id`.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const institutionsDir = join(__dirname, '..', 'src', 'data', 'institutions');

const files = readdirSync(institutionsDir).filter((f) => f.endsWith('.json'));

let migrated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = join(institutionsDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  if (data._id) {
    skipped++;
    continue;
  }

  // Derive the ID from the filename (e.g., "ro-anaf.json" → "ro-anaf")
  const entryId = basename(file, '.json');

  // Insert `_id` at the top of the object for readability
  const migrated_data = {
    _id: {
      name: entryId,
      slug: entryId,
    },
    ...data,
  };

  writeFileSync(filePath, JSON.stringify(migrated_data, null, 2) + '\n', 'utf-8');
  console.log(`✓ ${file}`);
  migrated++;
}

console.log(`\nDone: ${migrated} migrated, ${skipped} already had _id.`);
