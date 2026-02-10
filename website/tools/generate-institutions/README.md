# generate-institutions

Script care scanează folderele de logo-uri din `packages/logos/logos/[slug]/`,
citește opțional un `metadata.md` și folosește **OpenRouter AI** pentru a genera
fișierele JSON ale instituțiilor conform schemei v3 IdentitateRO.

## Cerințe

- Node.js ≥ 18 (necesită `fetch` nativ)
- `npm install` în `website/` (include `ajv` ca dev dependency)
- Un API key OpenRouter — <https://openrouter.ai/keys>

## Structura folderelor de input

Fiecare instituție are logo-urile organizate în subdirectoare pe layout:

```
packages/logos/logos/
  anaf/
    metadata.md               # informații instituție (gitignored)
    horizontal/
      color.svg               # variantă color
      white.svg               # variantă alb (fundal închis)
      dark.svg                # variantă dark mode
    vertical/
      color.svg
      white.svg
      dark.svg
    symbol/
      color.svg
      white.svg
      dark.svg
```

### Structura directoare

| Director      | Descriere                  |
|---------------|----------------------------|
| `horizontal/` | Logo orizontal (complet)   |
| `vertical/`   | Logo vertical (complet)    |
| `symbol/`     | Simbol / icon              |

### Variante fișiere

| Fișier      | Câmp JSON   | Descriere                      |
|-------------|-------------|--------------------------------|
| `color.svg` | `color`     | Variantă color (principală)    |
| `white.svg` | `white`     | Variantă albă (fundal închis)  |
| `dark.svg`  | `dark_mode` | Variantă dark mode             |

Nu toate layout-urile sau variantele sunt obligatorii — scriptul detectează
automat ce fișiere există și construiește obiectul `assets` corespunzător.

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

# La prima rulare, cheia se salvează automat în .env
# La rulările următoare se citește din .env
npm run data:generate:from-md
```

> **Notă:** La prima rulare, scriptul cere cheia API interactiv și o salvează
> în `tools/generate-institutions/.env` (ignorat de git). La rulările
> următoare, cheia se citește automat din `.env`.

## Output

Fișierele JSON sunt scrise în `website/src/data/institutions/{slug}.json`.
Dacă fișierul există deja, se creează un backup `{slug}.json.bak`.

Răspunsurile AI sunt cache-uite în `tools/generate-institutions/ai-cache/`
(ignorat de git) pentru a evita apeluri API duplicate în iterații succesive.

## După generare

Scriptul rulează automat `npm run data:generate` la final pentru a
regenera indexul agregat. Nu mai este necesar un pas manual.

Testează local:

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
