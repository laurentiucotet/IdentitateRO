# generate-institutions

Script care scanează folderele de logo-uri din `packages/logos/logos/[slug]/`,
citește opțional un `metadata.md` și folosește **OpenRouter AI** pentru a genera
fișierele JSON ale instituțiilor conform schemei v3 IdentitateRO.

## Cerințe

- Node.js ≥ 18 (necesită `fetch` nativ)
- `npm install` în `website/` (include `ajv` ca dev dependency)
- Un API key OpenRouter — <https://openrouter.ai/keys>

## Structura folderelor de input

```
packages/logos/logos/
  anaf/
    anaf.svg                  # logo principal
    simbol-anaf.svg           # simbol
    metadata.md               # opțional — informații suplimentare
  primaria-timisoara/
    primaria-timisoara.svg
    primaria-timisoara-alb.svg
    metadata.md
```

### Convenții de numire fișiere SVG

Scriptul mapează automat sufixele la variante de culoare:

| Sufix            | Variantă    |
|------------------|-------------|
| (fără sufix)     | `color`     |
| `-alb`, `-white` | `white`     |
| `-mono`          | `monochrome`|
| `-negru`,`-black`| `black`     |
| `-dark`          | `dark_mode` |

Fișierele care conțin `simbol`, `symbol`, `icon` sau `sigla` sunt clasificate
automat ca layout `symbol`. Restul sunt `horizontal` implicit.

### metadata.md (opțional dar recomandat)

```yaml
---
name: "Agenția Națională de Administrare Fiscală"
shortname: "anaf"
category: "agentie"
county: "B"
city: "București"
website: "https://www.anaf.ro"
keywords: "guvernamental, taxe, fiscalitate"
colors: |
  Albastru Simbol: #2C2C76 (primary)
  Negru Text: #151515 (neutral)
font_primary: "Source Sans Pro"
quality: "draft"
---

## Descriere

Autoritatea responsabilă cu administrarea fiscală.
```

Dacă `metadata.md` lipsește, AI-ul va încerca să deducă informațiile din slug
și numele fișierelor.

## Utilizare

```bash
# Din directorul website/
cd website

# Dry-run (arată JSON-ul generat fără a scrie fișiere)
npm run data:generate:from-md -- --dry-run

# Generare completă (va cere API key-ul interactiv)
npm run data:generate:from-md

# Generare doar pentru un slug specific
npm run data:generate:from-md -- --slug anaf

# Forțează scrierea chiar dacă validarea eșuează
npm run data:generate:from-md -- --force

# Ignoră cache-ul AI și re-generează
npm run data:generate:from-md -- --no-cache

# Folosește un alt model OpenRouter
npm run data:generate:from-md -- --model anthropic/claude-sonnet-4

# Setează cheia API din env (nu va mai cere interactiv)
OPENROUTER_API_KEY=sk-... npm run data:generate:from-md
```

## Output

Fișierele JSON sunt scrise în `website/src/data/institutions/{slug}.json`.
Dacă fișierul există deja, se creează un backup `{slug}.json.bak`.

Răspunsurile AI sunt cache-uite în `tools/generate-institutions/ai-cache/`
(ignorat de git) pentru a evita apeluri API duplicate în iterații succesive.

## După generare

Regenerează indexul agregat:

```bash
npm run data:generate
```

Apoi testează local:

```bash
npm run dev
```

## Fișiere

| Fișier                    | Scop                                |
|---------------------------|-------------------------------------|
| `generate.mjs`           | Script principal                     |
| `institution.schema.json`| JSON Schema AJV (v3)               |
| `example-metadata.md`    | Template metadata.md                |
| `.gitignore`             | Ignoră secrets & cache              |
| `ai-cache/`              | Cache răspunsuri AI (ignorat)       |
