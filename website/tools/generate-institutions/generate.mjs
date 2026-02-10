#!/usr/bin/env node

/**
 * IdentitateRO — Generate institution JSON from metadata.md + SVG files
 *
 * Workflow:
 *   1. Scans packages/logos/logos/[slug]/ for SVG files + metadata.md
 *   2. Sends content to OpenRouter LLM to extract structured data
 *   3. Validates output with AJV against institution.schema.json
 *   4. Writes validated JSON to website/src/data/institutions/[slug].json
 *
 * Usage:
 *   node generate.mjs                     # interactive — asks for API key
 *   node generate.mjs --dry-run           # preview output, no writes
 *   node generate.mjs --slug anaf         # process only one slug
 *   node generate.mjs --no-cache          # skip cached AI responses
 *
 * Env:
 *   OPENROUTER_API_KEY — if set, skips the runtime prompt
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

// ── Paths ────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOOLS_DIR     = __dirname;
const WEBSITE_DIR   = path.resolve(TOOLS_DIR, '..', '..');
const LOGOS_DIR     = path.resolve(WEBSITE_DIR, '..', 'packages', 'logos', 'logos');
const OUTPUT_DIR    = path.resolve(WEBSITE_DIR, 'src', 'data', 'institutions');
const SCHEMA_PATH   = path.resolve(TOOLS_DIR, 'institution.schema.json');
const CACHE_DIR     = path.resolve(TOOLS_DIR, 'ai-cache');

// ── CLI args (simple parser — no deps needed) ────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const NO_CACHE  = args.includes('--no-cache');
const FORCE     = args.includes('--force');
const SLUG_ONLY = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
const MODEL     = getArgValue('--model') || 'qwen/qwen3-vl-32b-instruct';

function getArgValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) { console.log(`\x1b[36m[gen]\x1b[0m ${msg}`); }
function warn(msg) { console.warn(`\x1b[33m[warn]\x1b[0m ${msg}`); }
function err(msg)  { console.error(`\x1b[31m[err]\x1b[0m ${msg}`); }
function ok(msg)   { console.log(`\x1b[32m[ok]\x1b[0m ${msg}`); }

async function askQuestion(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

// ── Get API key (env or runtime prompt) ──────────────────────────────────────

async function getApiKey() {
  if (process.env.OPENROUTER_API_KEY) {
    log('Using OPENROUTER_API_KEY from environment.');
    return process.env.OPENROUTER_API_KEY;
  }
  log('No OPENROUTER_API_KEY found in environment.');
  const key = await askQuestion('🔑 Enter your OpenRouter API key: ');
  if (!key) { err('API key is required. Aborting.'); process.exit(1); }
  return key;
}

// ── OpenRouter client ────────────────────────────────────────────────────────

async function callOpenRouter(apiKey, systemPrompt, userPrompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://identitate.ro',
      'X-Title': 'IdentitateRO Generator',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');

  // Parse JSON from response (handle markdown code fences)
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  return JSON.parse(cleaned);
}

// ── Schema validation (inline AJV-lite — or we use the real thing) ───────────

let validateFn = null;

async function loadValidator() {
  // Dynamic import — ajv must be installed
  const Ajv = (await import('ajv')).default;
  const ajv = new Ajv({ allErrors: true, strict: false, formats: {} });
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
  validateFn = ajv.compile(schema);
}

function validate(data) {
  const valid = validateFn(data);
  return { valid, errors: validateFn.errors || [] };
}

// ── Parse metadata.md frontmatter (simple parser, no gray-matter dep) ────────

function parseMetadata(content) {
  const frontmatter = {};
  let body = content;

  // Extract YAML frontmatter between --- delimiters
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (fmMatch) {
    const fmBlock = fmMatch[1];
    body = fmMatch[2];

    for (const line of fmBlock.split('\n')) {
      // Skip comments
      if (line.trim().startsWith('#') || !line.includes(':')) continue;

      const colonIdx = line.indexOf(':');
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();

      // Handle multi-line block scalars (|)
      if (val === '|') {
        const blockLines = [];
        const startIdx = fmBlock.split('\n').indexOf(line);
        const allLines = fmBlock.split('\n');
        for (let i = startIdx + 1; i < allLines.length; i++) {
          if (allLines[i].match(/^\S/) && allLines[i].includes(':')) break;
          blockLines.push(allLines[i].trim());
        }
        val = blockLines.filter(Boolean).join('\n');
      }

      // Strip quotes
      val = val.replace(/^["']|["']$/g, '');
      frontmatter[key] = val;
    }
  }

  return { frontmatter, body };
}

// ── Discover SVG files in a slug folder ──────────────────────────────────────

function discoverAssets(slugDir) {
  if (!fs.existsSync(slugDir)) return [];
  return fs.readdirSync(slugDir)
    .filter(f => f.endsWith('.svg') || f.endsWith('.png'))
    .sort();
}

// ── Build the LLM prompt ─────────────────────────────────────────────────────

function buildSystemPrompt() {
  return `You are an expert at structuring data for Romanian public institutions.
You will receive:
  1. A slug (folder name)
  2. Filenames of available SVG/PNG logo files
  3. Optional metadata from a markdown file (frontmatter + body text)

Your task: produce a SINGLE valid JSON object for this institution following the IdentitateRO v3 schema EXACTLY.

RULES:
- "id" must be "ro-{slug}"
- "slug" must be the folder name as-is
- "name" must be the full official name in Romanian (with diacritics)
- "shortname": lowercase short name or acronym, or null
- "category": one of: guvern, minister, primarie, consiliu-judetean, prefectura, agentie, autoritate, proiect-ue, institutie-cultura, altele
- "meta.version": "1.0"
- "meta.last_updated": today's date in YYYY-MM-DD format
- "meta.keywords": array of 3-8 Romanian lowercase keywords for search
- "meta.quality": "draft"
- "location": { "country_code": "RO", "county": county code or null, "city": city name or null }
- "description": 1-2 sentences in Romanian describing the institution
- "usage_notes": null unless explicitly mentioned
- "colors": extract from metadata OR from SVG analysis. Each color: { "name": string, "hex": "#RRGGBB", "rgb": [r,g,b] or null, "cmyk": null, "pantone": string or null, "usage": "primary"|"secondary"|"accent"|"neutral" }. If no colors known, set to null.
- "typography": { "primary": { "family": string, "url": string or null, "weights": [] } or null, "secondary": null }. If unknown, set entire object to null.
- "assets.main": the primary logo file. "type" should be "horizontal" if the filename suggests a full logo, "symbol" if it contains "simbol" or "symbol" or "icon".
  - Map files to variants: filename with "-alb" or "-white" → "white", "-mono" → "monochrome", "-negru" or "-black" → "black", "-dark" → "dark_mode". The base file (no suffix) → "color".
  - Paths must be: "/logos/{slug}/{filename}"
- "assets.horizontal", "assets.vertical", "assets.symbol": group files by layout. Set to null if no files match that layout.
  - A file is "symbol" if its name contains "simbol", "symbol", "icon", or "sigla".
  - Otherwise it's "horizontal" by default.
- For each asset group, set unused variant fields to null.
- "assets.favicon": null
- "resources.website": URL if provided, else null
- "resources.branding_manual": URL if provided, else null
- "resources.social_media": null

Return ONLY the JSON object. No explanations, no markdown fences, no extra text.`;
}

function buildUserPrompt(slug, files, metadata) {
  const { frontmatter, body } = metadata;

  let prompt = `Slug: ${slug}\n`;
  prompt += `Today's date: ${new Date().toISOString().slice(0, 10)}\n`;
  prompt += `Available files: ${files.join(', ')}\n\n`;

  if (Object.keys(frontmatter).length > 0) {
    prompt += `Metadata frontmatter:\n`;
    for (const [k, v] of Object.entries(frontmatter)) {
      prompt += `  ${k}: ${v}\n`;
    }
    prompt += '\n';
  }

  if (body.trim()) {
    prompt += `Metadata body:\n${body.trim()}\n`;
  }

  if (!Object.keys(frontmatter).length && !body.trim()) {
    prompt += `No metadata.md found. Infer information from the slug and filenames only.\n`;
  }

  return prompt;
}

// ── Normalize AI response (fix common LLM quirks) ───────────────────────────

function normalizeAiResponse(data, slug) {
  // Deep clone to avoid mutating cache
  const d = JSON.parse(JSON.stringify(data));

  // Fix slug (some LLMs prefix with "ro-")
  if (d.slug && d.slug.startsWith('ro-')) {
    d.slug = d.slug.replace(/^ro-/, '');
  }
  // Ensure id matches
  d.id = `ro-${d.slug || slug}`;
  d.slug = d.slug || slug;

  // — Fix asset path fields: if AI returned an object instead of a string,
  //   extract the string path from common keys (src, path, local, url)
  function flattenPath(val) {
    if (val === null || val === undefined) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.src || val.path || val.local || val.url || null;
    }
    return null;
  }

  // — Fix a single asset group
  function fixAssetGroup(group, layoutKey) {
    if (!group || typeof group !== 'object') return group;

    // Ensure "type" field exists
    if (!group.type) {
      if (layoutKey === 'symbol') group.type = 'symbol';
      else if (layoutKey === 'vertical') group.type = 'vertical';
      else group.type = 'horizontal';
    }

    // Flatten variant paths
    for (const variant of ['color', 'dark_mode', 'white', 'black', 'monochrome']) {
      group[variant] = flattenPath(group[variant]);
    }

    // Fix PNG if present
    if (group.png && typeof group.png === 'object') {
      if (group.png.path) group.png.path = flattenPath(group.png.path);
    }

    // Ensure all variant keys exist (set missing ones to null)
    for (const variant of ['color', 'dark_mode', 'white', 'black', 'monochrome']) {
      if (!(variant in group)) group[variant] = null;
    }
    if (!('png' in group)) group.png = null;

    return group;
  }

  // Fix assets
  if (d.assets) {
    d.assets.main = fixAssetGroup(d.assets.main, 'horizontal');
    d.assets.horizontal = d.assets.horizontal ? fixAssetGroup(d.assets.horizontal, 'horizontal') : null;
    d.assets.vertical = d.assets.vertical ? fixAssetGroup(d.assets.vertical, 'vertical') : null;
    d.assets.symbol = d.assets.symbol ? fixAssetGroup(d.assets.symbol, 'symbol') : null;
    if (!('favicon' in d.assets)) d.assets.favicon = null;
  }

  // Ensure null fields for optional top-level
  if (!('usage_notes' in d)) d.usage_notes = null;
  if (!('colors' in d)) d.colors = null;
  if (!('typography' in d)) d.typography = null;
  if (!('resources' in d)) d.resources = null;

  // Fix resources sub-fields
  if (d.resources && typeof d.resources === 'object') {
    if (!('website' in d.resources)) d.resources.website = null;
    if (!('branding_manual' in d.resources)) d.resources.branding_manual = null;
    if (!('social_media' in d.resources)) d.resources.social_media = null;
  }

  return d;
}

// ── Process a single slug ────────────────────────────────────────────────────

async function processSlug(slug, apiKey) {
  const slugDir = path.join(LOGOS_DIR, slug);
  const files = discoverAssets(slugDir);

  if (files.length === 0) {
    warn(`${slug}: no SVG/PNG files found in ${slugDir}, skipping.`);
    return null;
  }

  log(`${slug}: found ${files.length} asset(s): ${files.join(', ')}`);

  // Load metadata.md if present
  const mdPath = path.join(slugDir, 'metadata.md');
  let metadata = { frontmatter: {}, body: '' };
  if (fs.existsSync(mdPath)) {
    log(`${slug}: loading metadata.md`);
    metadata = parseMetadata(fs.readFileSync(mdPath, 'utf-8'));
  } else {
    warn(`${slug}: no metadata.md found — AI will infer from slug & filenames`);
  }

  // Check cache
  const cacheFile = path.join(CACHE_DIR, `${slug}.json`);
  if (!NO_CACHE && fs.existsSync(cacheFile)) {
    log(`${slug}: using cached AI response`);
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    return normalizeAiResponse(cached, slug);
  }

  // Call OpenRouter
  log(`${slug}: calling OpenRouter (${MODEL})...`);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(slug, files, metadata);
  const result = await callOpenRouter(apiKey, systemPrompt, userPrompt);
  const normalized = normalizeAiResponse(result, slug);

  // Cache result (normalized)
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(normalized, null, 2), 'utf-8');
  log(`${slug}: AI response cached`);

  return normalized;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  log('═══════════════════════════════════════════════');
  log('  IdentitateRO — Institution JSON Generator');
  log('═══════════════════════════════════════════════');
  console.log('');

  // 1. Validate directories
  if (!fs.existsSync(LOGOS_DIR)) {
    err(`Logo directory not found: ${LOGOS_DIR}`);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. Load AJV validator
  log('Loading JSON Schema validator...');
  await loadValidator();

  // 3. Get API key
  const apiKey = await getApiKey();

  // 4. Discover slugs
  let slugs = fs.readdirSync(LOGOS_DIR)
    .filter(f => fs.statSync(path.join(LOGOS_DIR, f)).isDirectory());

  if (SLUG_ONLY) {
    if (!slugs.includes(SLUG_ONLY)) {
      err(`Slug "${SLUG_ONLY}" not found in ${LOGOS_DIR}`);
      process.exit(1);
    }
    slugs = [SLUG_ONLY];
  }

  log(`Found ${slugs.length} slug(s): ${slugs.join(', ')}`);
  console.log('');

  // 5. Process each slug
  const results = { success: [], failed: [], skipped: [] };

  for (const slug of slugs) {
    try {
      log(`──── Processing: ${slug} ────`);

      const data = await processSlug(slug, apiKey);
      if (!data) { results.skipped.push(slug); continue; }

      // Validate
      const { valid, errors } = validate(data);

      if (!valid) {
        warn(`${slug}: validation failed:`);
        for (const e of errors) {
          warn(`  ${e.instancePath || '/'} — ${e.message}`);
        }
        if (!FORCE) {
          err(`${slug}: skipping write (use --force to override)`);
          results.failed.push(slug);
          continue;
        }
        warn(`${slug}: --force flag set, writing anyway`);
      }

      // Write
      const outPath = path.join(OUTPUT_DIR, `${slug}.json`);

      if (DRY_RUN) {
        log(`${slug}: [DRY-RUN] would write to ${outPath}`);
        console.log(JSON.stringify(data, null, 2));
      } else {
        // Backup existing file
        if (fs.existsSync(outPath)) {
          const backupPath = outPath + '.bak';
          fs.copyFileSync(outPath, backupPath);
          log(`${slug}: backed up existing file → ${path.basename(backupPath)}`);
        }
        fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
        ok(`${slug}: written → ${path.relative(WEBSITE_DIR, outPath)}`);
      }

      results.success.push(slug);

    } catch (ex) {
      err(`${slug}: ${ex.message}`);
      results.failed.push(slug);
    }

    console.log('');
  }

  // 6. Summary
  log('═══════════════════════════════════════════════');
  log('  Summary');
  log('═══════════════════════════════════════════════');
  ok(`Success:  ${results.success.length} — ${results.success.join(', ') || '(none)'}`);
  if (results.failed.length)  warn(`Failed:   ${results.failed.length} — ${results.failed.join(', ')}`);
  if (results.skipped.length) warn(`Skipped:  ${results.skipped.length} — ${results.skipped.join(', ')}`);

  if (DRY_RUN) {
    log('');
    log('This was a dry run. No files were written.');
    log('Run without --dry-run to write files.');
  } else if (results.success.length > 0) {
    log('');
    log('Next step: regenerate the index file:');
    log('  npm run data:generate');
  }

  console.log('');
}

main().catch(ex => { err(ex.message); process.exit(1); });
