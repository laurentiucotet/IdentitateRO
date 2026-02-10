#!/usr/bin/env node

/**
 * IdentitateRO  Generate institution JSON from metadata.md + SVG files
 *
 * Workflow:
 *   1. Scans packages/logos/logos/[slug]/ for SVG files in layout subdirs
 *      (horizontal/, vertical/, symbol/) with variants (color.svg, white.svg, dark.svg)
 *   2. Reads metadata.md (frontmatter + body text) for institution info
 *   3. Sends content to OpenRouter LLM to extract structured metadata
 *   4. Merges AI metadata with programmatically discovered assets
 *   5. Validates output with AJV against institution.schema.json
 *   6. Writes validated JSON to website/src/data/institutions/[slug].json
 *   7. Runs generate-index.js to rebuild the institutions index
 *
 * Logo folder structure:
 *   packages/logos/logos/[slug]/
 *     metadata.md                 # Institution metadata (gitignored)
 *     horizontal/
 *       color.svg
 *       white.svg
 *       dark.svg
 *     vertical/
 *       color.svg
 *       white.svg
 *       dark.svg
 *     symbol/
 *       color.svg
 *       white.svg
 *       dark.svg
 *
 * Usage:
 *   node generate.mjs                     # interactive  asks for API key
 *   node generate.mjs --dry-run           # preview output, no writes
 *   node generate.mjs --slug anaf         # process only one slug
 *   node generate.mjs anaf                # same as above (for npm scripts)
 *   node generate.mjs --no-cache          # skip cached AI responses
 *
 * Env:
 *   OPENROUTER_API_KEY  if set, skips the runtime prompt
 *   (automatically saved to .env when entered at runtime)
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

//  Paths 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOOLS_DIR     = __dirname;
const WEBSITE_DIR   = path.resolve(TOOLS_DIR, '..', '..');
const LOGOS_DIR     = path.resolve(WEBSITE_DIR, '..', 'packages', 'logos', 'logos');
const OUTPUT_DIR    = path.resolve(WEBSITE_DIR, 'src', 'data', 'institutions');
const SCHEMA_PATH   = path.resolve(TOOLS_DIR, 'institution.schema.json');
const CACHE_DIR     = path.resolve(TOOLS_DIR, 'ai-cache');
const ENV_PATH      = path.resolve(TOOLS_DIR, '.env');

//  Layout / variant constants 

const LAYOUTS  = ['horizontal', 'vertical', 'symbol'];
const VARIANTS = ['color', 'white', 'dark', 'black'];
const VARIANT_TO_FIELD = { color: 'color', white: 'white', dark: 'dark_mode', black: 'black' };

//  Load .env file 

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    // Don't overwrite existing env vars
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

// Load .env before anything else
loadEnv();

//  CLI args (simple parser  no deps needed) 

const args = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const NO_CACHE  = args.includes('--no-cache');
const FORCE     = args.includes('--force');

// Handle slug argument - can be --slug value or just value
let SLUG_ONLY = null;
if (args.includes('--slug')) {
  SLUG_ONLY = args[args.indexOf('--slug') + 1];
} else if (args.length > 0 && !args[0].startsWith('--')) {
  // If first arg is not a flag, treat it as slug
  SLUG_ONLY = args[0];
}

const MODEL     = getArgValue('--model') || 'openai/gpt-5-mini';

function getArgValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

//  Helpers 

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

//  Save API key to .env 

function saveApiKeyToEnv(key) {
  let content = '';
  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, 'utf-8');
    if (content.includes('OPENROUTER_API_KEY=')) {
      content = content.replace(/OPENROUTER_API_KEY=.*/, `OPENROUTER_API_KEY=${key}`);
    } else {
      content = content.trimEnd() + '\nOPENROUTER_API_KEY=' + key + '\n';
    }
  } else {
    content = 'OPENROUTER_API_KEY=' + key + '\n';
  }
  fs.writeFileSync(ENV_PATH, content, 'utf-8');
}

//  Get API key (env  .env  runtime prompt  save to .env) 

async function getApiKey() {
  if (process.env.OPENROUTER_API_KEY) {
    log('Using OPENROUTER_API_KEY from environment.');
    return process.env.OPENROUTER_API_KEY;
  }
  log('No OPENROUTER_API_KEY found in environment or .env.');
  const key = await askQuestion(' Enter your OpenRouter API key: ');
  if (!key) { err('API key is required. Aborting.'); process.exit(1); }

  // Save to .env for future runs
  saveApiKeyToEnv(key);
  ok('API key saved to .env (' + path.relative(WEBSITE_DIR, ENV_PATH) + ')');

  return key;
}

//  OpenRouter client 

const MAX_RETRIES = 3;

async function callOpenRouter(apiKey, systemPrompt, userPrompt, attempt = 1) {
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
    throw new Error('OpenRouter API error ' + res.status + ': ' + body);
  }

  let data;
  const rawBody = await res.text();
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error('OpenRouter returned non-JSON response (first 200 chars): ' + rawBody.slice(0, 200));
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter. Full response: ' + JSON.stringify(data).slice(0, 300));

  // Parse JSON from response (handle markdown code fences)
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    if (attempt < MAX_RETRIES) {
      warn('Attempt ' + attempt + '/' + MAX_RETRIES + ' — AI returned invalid JSON, retrying...');
      // Wait a bit before retrying
      await new Promise(r => setTimeout(r, 2000 * attempt));
      return callOpenRouter(apiKey, systemPrompt, userPrompt, attempt + 1);
    }
    throw new Error('AI returned invalid JSON after ' + MAX_RETRIES + ' attempts. Last response (first 500 chars): ' + cleaned.slice(0, 500));
  }
}

//  Schema validation 

let validateFn = null;

async function loadValidator() {
  const Ajv = (await import('ajv')).default;
  const ajv = new Ajv({ allErrors: true, strict: false, formats: {} });
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
  validateFn = ajv.compile(schema);
}

function validate(data) {
  const valid = validateFn(data);
  return { valid, errors: validateFn.errors || [] };
}

//  Parse metadata.md frontmatter (simple parser, no gray-matter dep) 

function parseMetadata(content) {
  const frontmatter = {};
  let body = content;

  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (fmMatch) {
    const fmBlock = fmMatch[1];
    body = fmMatch[2];

    for (const line of fmBlock.split('\n')) {
      if (line.trim().startsWith('#') || !line.includes(':')) continue;

      const colonIdx = line.indexOf(':');
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();

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

      val = val.replace(/^["']|["']$/g, '');
      frontmatter[key] = val;
    }
  }

  return { frontmatter, body };
}

// ── Extract hex colors from metadata text ────────────────────────────────────
//
// Parses colors from any format found in metadata.md:
//   "culori: 0772AF"                         → single color
//   "culori albastru: 374990 , rosu:E03544"  → named colors
//   "Albastru Simbol: #2C2C76 (primary)"     → with usage hint
//   Standalone 6-char hex in the text

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return [r, g, b];
}

function extractColorsFromMetadata(rawContent) {
  const colors = [];
  const seenHex = new Set();

  // Usage hint keywords
  const USAGE_KEYWORDS = {
    primary: 'primary', principal: 'primary', principale: 'primary',
    secondary: 'secondary', secundar: 'secondary', secundara: 'secondary',
    accent: 'accent',
    neutral: 'neutral',
  };

  // Pattern: "Name: #HEX (usage)" or "Name: HEX (usage)"
  //   e.g. "Albastru Simbol: #2C2C76 (primary)"
  //   e.g. "culori albastru: 374990"
  //   e.g. "rosu:E03544"
  // Use [^\S\n] instead of \s to avoid matching across newlines
  const namedPattern = /([\w\u00C0-\u024F\u00c0-\u00ff\t -]*):\s*#?([0-9A-Fa-f]{6})(?:\s*\(([^)]+)\))?/g;
  let match;

  while ((match = namedPattern.exec(rawContent)) !== null) {
    const rawName = match[1].trim();
    const hex = match[2].toUpperCase();
    const usageHint = (match[3] || '').trim().toLowerCase();

    if (seenHex.has(hex)) continue;
    seenHex.add(hex);

    const rgb = hexToRgb(hex);
    let usage = null;
    for (const [kw, val] of Object.entries(USAGE_KEYWORDS)) {
      if (usageHint.includes(kw)) { usage = val; break; }
    }
    // Auto-assign first color as primary if no usage specified
    if (!usage && colors.length === 0) usage = 'primary';
    else if (!usage && colors.length === 1) usage = 'secondary';

    // Build name: use raw name, or generate from hex
    let name = rawName;
    // Strip common prefixes like "culori", "culoare"
    name = name.replace(/^(culori|culoare|color|colours?)\s*/i, '').trim();
    if (!name) name = 'Color #' + hex;

    colors.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      hex: '#' + hex,
      rgb: rgb,
      cmyk: null,
      pantone: null,
      usage: usage,
    });
  }

  // Fallback: look for standalone 6-char hex not yet captured
  const standalonePattern = /(?:^|[\s,;])#?([0-9A-Fa-f]{6})(?=[\s,;]|$)/g;
  while ((match = standalonePattern.exec(rawContent)) !== null) {
    const hex = match[1].toUpperCase();
    if (seenHex.has(hex)) continue;
    seenHex.add(hex);

    const rgb = hexToRgb(hex);
    let usage = null;
    if (colors.length === 0) usage = 'primary';
    else if (colors.length === 1) usage = 'secondary';

    colors.push({
      name: 'Color #' + hex,
      hex: '#' + hex,
      rgb: rgb,
      cmyk: null,
      pantone: null,
      usage: usage,
    });
  }

  return colors.length > 0 ? colors : null;
}

// ── Discover assets in the new folder structure ──────────────────────────────
//
//  [slug]/
//    horizontal/  color.svg  white.svg  dark.svg
//    vertical/    color.svg  white.svg  dark.svg
//    symbol/      color.svg  white.svg  dark.svg

function discoverAssets(slugDir) {
  const found = {};
  let totalFiles = 0;

  for (const layout of LAYOUTS) {
    const layoutDir = path.join(slugDir, layout);
    if (!fs.existsSync(layoutDir)) continue;

    const files = fs.readdirSync(layoutDir)
      .filter(f => f.endsWith('.svg') || f.endsWith('.png'))
      .sort();

    if (files.length > 0) {
      found[layout] = files;
      totalFiles += files.length;
    }
  }

  return { found, totalFiles };
}

//  Build assets object programmatically from discovered files 

function buildAssetsFromFiles(slug, discovered) {
  const assets = {
    main: null,
    horizontal: null,
    vertical: null,
    symbol: null,
    favicon: null,
  };

  for (const layout of LAYOUTS) {
    const files = discovered[layout];
    if (!files || files.length === 0) continue;

    const group = {
      type: layout,
      color: null,
      dark_mode: null,
      white: null,
      black: null,
      monochrome: null,
      png: null,
    };

    for (const file of files) {
      const baseName = path.basename(file, path.extname(file));
      const fieldName = VARIANT_TO_FIELD[baseName];
      if (fieldName) {
        group[fieldName] = '/logos/' + slug + '/' + layout + '/' + file;
      }
    }

    assets[layout] = group;
  }

  // Set main: prefer horizontal  symbol  vertical
  if (assets.horizontal)      assets.main = { ...assets.horizontal };
  else if (assets.symbol)     assets.main = { ...assets.symbol, type: 'symbol' };
  else if (assets.vertical)   assets.main = { ...assets.vertical, type: 'vertical' };

  return assets;
}

//  Build the LLM prompt 

function buildSystemPrompt() {
  return 'You are an expert at structuring data for Romanian public institutions.\n' +
'You will receive:\n' +
'  1. A slug (folder name)\n' +
'  2. Available logo layouts and their SVG/PNG variant files\n' +
'  3. Optional metadata from a markdown file (frontmatter + body text)\n' +
'\n' +
'Your task: produce a SINGLE valid JSON object for this institution following the IdentitateRO v3 schema.Respond in Romanian\n' +
'\n' +
'IMPORTANT: Do NOT include the "assets" field  it will be built automatically from the file structure.\n' +
'\n' +
'RULES:\n' +
'- "id" must be "ro-{slug}"\n' +
'- "slug" must be the folder name as-is\n' +
'- "name" must be the full official name in Romanian (with diacritics)\n' +
'- "shortname": lowercase short name or acronym, or null\n' +
'- "category": one of: guvern, minister, primarie, consiliu-judetean, prefectura, agentie, autoritate, proiect-ue, institutie-cultura, altele\n' +
'- "meta.version": "1.0"\n' +
'- "meta.last_updated": today\'s date in YYYY-MM-DD format\n' +
'- "meta.keywords": array of 3-8 Romanian lowercase keywords for search\n' +
'- "meta.quality": "draft"\n' +
'- "location": { "country_code": "RO", "county": county code or null, "city": city name or null }\n' +
'- "description": 1-2 sentences in Romanian describing the institution\n' +
'- "usage_notes": null unless explicitly mentioned\n' +
'- "colors": extract from metadata if provided. Each color: { "name": string, "hex": "#RRGGBB", "rgb": [r,g,b] or null, "cmyk": null, "pantone": string or null, "usage": "primary"|"secondary"|"accent"|"neutral" }. Colors are often HEX codes with or without # marker If no colors known, set to null.\n' +
'- "typography": { "primary": { "family": string, "url": string or null, "weights": [] } or null, "secondary": null }. Search for text font or typography keywords , they are often attached next to a link. If unknown, set entire object to null.\n' +
'- "resources.website": URL if provided, search for keywords like website oficial, site, or simply a link that resembles the slug, with "https://" else null\n' +
'- "resources.branding_manual": URL if provided, else null\n' +
'- "resources.social_media": null\n' +
'\n' +
'Return ONLY the JSON object (without "assets"). No explanations, no markdown fences, no extra text.';
}

function buildUserPrompt(slug, discovered, metadata) {
  const { frontmatter, body } = metadata;

  let prompt = 'Slug: ' + slug + '\n';
  prompt += 'Today\'s date: ' + new Date().toISOString().slice(0, 10) + '\n';

  prompt += '\nAvailable logo files:\n';
  for (const layout of LAYOUTS) {
    const files = discovered[layout];
    if (files && files.length > 0) {
      prompt += '  ' + layout + '/: ' + files.join(', ') + '\n';
    }
  }
  prompt += '\n';

  if (Object.keys(frontmatter).length > 0) {
    prompt += 'Metadata frontmatter:\n';
    for (const [k, v] of Object.entries(frontmatter)) {
      prompt += '  ' + k + ': ' + v + '\n';
    }
    prompt += '\n';
  }

  if (body.trim()) {
    prompt += 'Metadata body:\n' + body.trim() + '\n';
  }

  if (!Object.keys(frontmatter).length && !body.trim()) {
    prompt += 'No metadata.md found. Infer information from the slug and filenames only.\n';
  }

  return prompt;
}

//  Normalize AI response (fix common LLM quirks) 

function normalizeAiResponse(data, slug) {
  const d = JSON.parse(JSON.stringify(data));

  // Fix slug - remove "ro-" prefix if present
  if (d.slug && d.slug.startsWith('ro-')) {
    d.slug = d.slug.replace(/^ro-/, '');
  }
  
  // Fix ID - ensure it's "ro-{slug}"
  d.id = 'ro-' + (d.slug || slug);
  d.slug = d.slug || slug;

  if (!('usage_notes' in d)) d.usage_notes = null;
  if (!('colors' in d)) d.colors = null;
  if (!('typography' in d)) d.typography = null;
  if (!('resources' in d)) d.resources = null;

  // Normalize typography weights to integers
  if (d.typography && typeof d.typography === 'object') {
    const WEIGHT_MAP = {
      'thin': 100, 'hairline': 100,
      'extralight': 200, 'ultralight': 200,
      'light': 300,
      'regular': 400, 'normal': 400,
      'medium': 500,
      'semibold': 600, 'demibold': 600,
      'bold': 700,
      'extrabold': 800, 'ultrabold': 800,
      'black': 900, 'heavy': 900
    };

    function normalizeWeights(weights) {
      if (!Array.isArray(weights)) return [];
      return weights.map(w => {
        if (typeof w === 'number') return w;
        if (typeof w === 'string') {
          const lower = w.toLowerCase().replace(/\s+/g, '');
          return WEIGHT_MAP[lower] || 400; // default to regular
        }
        return 400;
      });
    }

    if (d.typography.primary && d.typography.primary.weights) {
      d.typography.primary.weights = normalizeWeights(d.typography.primary.weights);
    }
    if (d.typography.secondary && d.typography.secondary.weights) {
      d.typography.secondary.weights = normalizeWeights(d.typography.secondary.weights);
    }
  }

  if (d.resources && typeof d.resources === 'object') {
    if (!('website' in d.resources)) d.resources.website = null;
    if (!('branding_manual' in d.resources)) d.resources.branding_manual = null;
    if (!('social_media' in d.resources)) d.resources.social_media = null;
  }

  // Remove assets  they will be built programmatically
  delete d.assets;

  return d;
}

//  Process a single slug 

async function processSlug(slug, apiKey) {
  const slugDir = path.join(LOGOS_DIR, slug);

  // Discover assets in new folder structure
  const { found: discovered, totalFiles } = discoverAssets(slugDir);

  if (totalFiles === 0) {
    warn(slug + ': no SVG/PNG files found in layout subdirs (horizontal/, vertical/, symbol/), skipping.');
    return null;
  }

  const layoutSummary = Object.entries(discovered)
    .map(([layout, files]) => layout + '(' + files.length + ')')
    .join(', ');
  log(slug + ': found ' + totalFiles + ' asset(s) in ' + layoutSummary);

  // Load metadata.md if present
  const mdPath = path.join(slugDir, 'metadata.md');
  let metadata = { frontmatter: {}, body: '' };
  if (fs.existsSync(mdPath)) {
    log(slug + ': loading metadata.md');
    metadata = parseMetadata(fs.readFileSync(mdPath, 'utf-8'));
  } else {
    warn(slug + ': no metadata.md found  AI will infer from slug & filenames');
  }

  // Check cache (AI metadata only)
  const cacheFile = path.join(CACHE_DIR, slug + '.json');
  let aiData;

  if (!NO_CACHE && fs.existsSync(cacheFile)) {
    log(slug + ': using cached AI response');
    aiData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  } else {
    log(slug + ': calling OpenRouter (' + MODEL + ')...');
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(slug, discovered, metadata);
    aiData = await callOpenRouter(apiKey, systemPrompt, userPrompt);

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(aiData, null, 2), 'utf-8');
    log(slug + ': AI response cached');
  }

  // Normalize AI metadata
  const normalized = normalizeAiResponse(aiData, slug);

  // Build assets programmatically from discovered files
  normalized.assets = buildAssetsFromFiles(slug, discovered);

  // Extract colors programmatically from metadata.md (overrides AI if found)
  if (fs.existsSync(mdPath)) {
    const rawMd = fs.readFileSync(mdPath, 'utf-8');
    const extractedColors = extractColorsFromMetadata(rawMd);
    if (extractedColors) {
      log(slug + ': extracted ' + extractedColors.length + ' color(s) from metadata.md');
      normalized.colors = extractedColors;
    }
  }

  return normalized;
}

//  Main 

async function main() {
  console.log('');
  log('');
  log('  IdentitateRO  Institution JSON Generator');
  log('');
  console.log('');

  // 1. Validate directories
  if (!fs.existsSync(LOGOS_DIR)) {
    err('Logo directory not found: ' + LOGOS_DIR);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. Load AJV validator
  log('Loading JSON Schema validator...');
  await loadValidator();

  // 3. Get API key (loads from .env, env, or prompts and saves to .env)
  const apiKey = await getApiKey();

  // 4. Discover slugs
  let slugs = fs.readdirSync(LOGOS_DIR)
    .filter(f => fs.statSync(path.join(LOGOS_DIR, f)).isDirectory());

  if (SLUG_ONLY) {
    if (!slugs.includes(SLUG_ONLY)) {
      err('Slug "' + SLUG_ONLY + '" not found in ' + LOGOS_DIR);
      process.exit(1);
    }
    slugs = [SLUG_ONLY];
  }

  log('Found ' + slugs.length + ' slug(s): ' + slugs.join(', '));
  console.log('');

  // 5. Process each slug
  const results = { success: [], failed: [], skipped: [] };

  for (const slug of slugs) {
    try {
      log(' Processing: ' + slug + ' ');

      const data = await processSlug(slug, apiKey);
      if (!data) { results.skipped.push(slug); continue; }

      // Validate
      const { valid, errors } = validate(data);

      if (!valid) {
        warn(slug + ': validation failed:');
        for (const e of errors) {
          warn('  ' + (e.instancePath || '/') + '  ' + e.message);
        }
        if (!FORCE) {
          err(slug + ': skipping write (use --force to override)');
          results.failed.push(slug);
          continue;
        }
        warn(slug + ': --force flag set, writing anyway');
      }

      // Write
      const outPath = path.join(OUTPUT_DIR, slug + '.json');

      if (DRY_RUN) {
        log(slug + ': [DRY-RUN] would write to ' + outPath);
        console.log(JSON.stringify(data, null, 2));
      } else {
        if (fs.existsSync(outPath)) {
          const backupPath = outPath + '.bak';
          fs.copyFileSync(outPath, backupPath);
          log(slug + ': backed up existing file  ' + path.basename(backupPath));
        }
        fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
        ok(slug + ': written  ' + path.relative(WEBSITE_DIR, outPath));
      }

      results.success.push(slug);

    } catch (ex) {
      err(slug + ': ' + ex.message);
      results.failed.push(slug);
    }

    console.log('');
  }

  // 6. Summary
  log('');
  log('  Summary');
  log('');
  ok('Success:  ' + results.success.length + '  ' + (results.success.join(', ') || '(none)'));
  if (results.failed.length)  warn('Failed:   ' + results.failed.length + '  ' + results.failed.join(', '));
  if (results.skipped.length) warn('Skipped:  ' + results.skipped.length + '  ' + results.skipped.join(', '));

  if (DRY_RUN) {
    log('');
    log('This was a dry run. No files were written.');
    log('Run without --dry-run to write files.');
  }

  // 7. Run generate-index.js to rebuild the institutions index
  if (!DRY_RUN && results.success.length > 0) {
    console.log('');
    log('');
    log('  Running index generation...');
    log('');
    try {
      execSync('npm run data:generate', { cwd: WEBSITE_DIR, stdio: 'inherit' });
      ok('Index regenerated successfully.');
    } catch (e) {
      err('Index generation failed: ' + e.message);
    }
  }

  console.log('');
}

main().catch(ex => { err(ex.message); process.exit(1); });
