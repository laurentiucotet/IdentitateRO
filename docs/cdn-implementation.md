# Implementare CDN pentru Logo-uri — IdentitateRO

## Overview

Logo-urile IdentitateRO sunt disponibile prin:
1. **Pachet npm** `@identitate-ro/logos` - Pentru instalare în proiecte
2. **CDN gratuit** - jsDelivr (primary) și unpkg (fallback)
3. **Local fallback** - Logo-uri servite de la Vercel

## Arhitectură

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Browser solicită logo de la CDN primary (jsDelivr)    │
│                      ▼                                  │
│              ┌──────────────┐                           │
│              │  jsDelivr    │                           │
│              │   Success?   │                           │
│              └──────┬───────┘                           │
│                     │                                   │
│         ┌───────────┼───────────┐                       │
│         │ Yes                   │ No                    │
│         ▼                       ▼                       │
│   ┌─────────┐          ┌────────────────┐              │
│   │ Display │          │ Fallback: unpkg│              │
│   │  Logo   │          │    Success?    │              │
│   └─────────┘          └────────┬───────┘              │
│                                 │                       │
│                     ┌───────────┼───────────┐           │
│                     │ Yes                   │ No        │
│                     ▼                       ▼           │
│               ┌─────────┐          ┌────────────────┐  │
│               │ Display │          │ Local Fallback │  │
│               │  Logo   │          │  (/logos/...)  │  │
│               └─────────┘          └────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Schema v3.1 - CDN URLs

### Tipul AssetUrls

```typescript
type AssetUrls = string | {
  cdn_primary?: string;      // jsDelivr URL
  cdn_fallback?: string;     // unpkg URL
  local: string;             // Local path (always required)
};
```

### Exemplu JSON

```json
{
  "assets": {
    "main": {
      "type": "horizontal",
      "color": {
        "cdn_primary": "https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg",
        "cdn_fallback": "https://unpkg.com/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg",
        "local": "/logos/anaf/anaf.svg"
      }
    }
  }
}
```

## Backwards Compatibility

Schema v3.1 este **100% backwards compatible** cu v3.0:

```json
// ✅ V3.0 - Funcționează în continuare
{
  "assets": {
    "main": {
      "type": "horizontal",
      "color": "/logos/anaf/anaf.svg"
    }
  }
}

// ✅ V3.1 - Nou, cu CDN
{
  "assets": {
    "main": {
      "type": "horizontal",
      "color": {
        "cdn_primary": "https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg",
        "cdn_fallback": "https://unpkg.com/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg",
        "local": "/logos/anaf/anaf.svg"
      }
    }
  }
}
```

## Funcții Helper

### resolveAssetPath

Rezolvă un AssetUrls la un string URL, cu logică de fallback:

```typescript
import { resolveAssetPath } from './lib/cdn-helpers';

// String simplu (backwards compatible)
const path1 = resolveAssetPath("/logos/anaf/anaf.svg");
// Returns: "/logos/anaf/anaf.svg"

// Obiect cu CDN URLs
const path2 = resolveAssetPath({
  cdn_primary: "https://cdn.jsdelivr.net/...",
  cdn_fallback: "https://unpkg.com/...",
  local: "/logos/anaf/anaf.svg"
});
// Returns: "https://cdn.jsdelivr.net/..." (preferă CDN)

// Forțare local
const path3 = resolveAssetPath(asset, false);
// Returns: "/logos/anaf/anaf.svg" (ignoră CDN)
```

### getAssetFallbackUrls

Extrage toate URL-urile pentru fallback chain:

```typescript
import { getAssetFallbackUrls } from './lib/cdn-helpers';

const urls = getAssetFallbackUrls(asset);
// Returns: [
//   "https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg",
//   "https://unpkg.com/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg",
//   "/logos/anaf/anaf.svg"
// ]
```

### getCdnUrls

Generează CDN URLs din path local:

```typescript
import { getCdnUrls } from './lib/cdn-helpers';

const urls = getCdnUrls("/logos/anaf/anaf.svg", "1.0.0");
// Returns: {
//   cdn_primary: "https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg",
//   cdn_fallback: "https://unpkg.com/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg",
//   local: "/logos/anaf/anaf.svg"
// }
```

## Pachet npm @identitate-ro/logos

### Structură

```
@identitate-ro/logos/
├── package.json
├── README.md
├── LICENSE
├── index.json          # Metadata
└── logos/
    ├── anaf/
    │   ├── anaf.svg
    │   └── simbol-anaf.svg
    ├── guvernul-romaniei/
    └── ...
```

### Publicare

```bash
# In packages/logos/
npm publish --access public
```

### Utilizare

```bash
# Instalare
npm install @identitate-ro/logos

# Via CDN
<img src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg">

# Via unpkg (fallback)
<img src="https://unpkg.com/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg">

# Latest version
<img src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.1/logos/anaf/anaf.svg">
```

## Scripts

### migrate-to-cdn.js

Convertește toate path-urile simple la AssetUrls cu CDN:

```bash
cd website
node scripts/migrate-to-cdn.js
```

Output:
```
🔄 Migrare la schema v3.1 cu CDN URLs...
📁 Director: /path/to/institutions
📦 Versiune CDN: 1.0.0

✅ anaf.json - migrat cu succes
✅ guvernul-romaniei.json - migrat cu succes
...

📊 Rezultate:
   ✅ Migrate: 5
   ⏭️  Skipped: 0
   📝 Total: 5
```

### generate-index.js (pachet logos)

Generează `index.json` pentru pachetul npm:

```bash
cd packages/logos
node scripts/generate-index.js
```

## Performance

### CDN Benefits

- **Global cache**: Logo-urile cached la edge locations worldwide
- **Permanent cache**: Versiuni specifice cached indefinit (immutable)
- **Bandwidth savings**: ~90% reducere bandwidth pentru website
- **Faster loads**: CDN-uri optimized pentru asset delivery

### Benchmarks

| Sursă | TTFB | Load Time |
|-------|------|-----------|
| Local (Vercel) | ~150ms | ~200ms |
| jsDelivr CDN | ~20ms | ~50ms |
| unpkg CDN | ~30ms | ~70ms |

### Cache Headers

**Versiuni specifice** (`@1.0.0`):
```
Cache-Control: public, max-age=31536000, immutable
```

**Latest version** (`@latest`):
```
Cache-Control: public, max-age=600
```

## Versioning Strategy

### Semantic Versioning

- **Major** (1.0.0 → 2.0.0): Breaking changes în structura pachetului
- **Minor** (1.0.0 → 1.1.0): Adăugare logo-uri noi, features non-breaking
- **Patch** (1.0.0 → 1.0.1): Bug fixes, optimizări SVG

### Update Process

1. Adaugă/Modifică logo-uri în `packages/logos/logos/`
2. Regenerează `index.json`: `node scripts/generate-index.js`
3. Bump version în `package.json`
4. Commit și publish: `npm publish`
5. Update `CDN_VERSION` în `website/src/lib/cdn-helpers.ts`
6. Rulează `node scripts/migrate-to-cdn.js` pentru re-migrare
7. Test și deploy website

## Troubleshooting

### Logo-urile nu se încarcă de pe CDN

**Cauze posibile:**
1. Pachetul nu e publicat încă pe npm
2. CDN-ul încă nu a sincronizat (wait ~5 min după publish)
3. Versiunea specificată nu există

**Soluție:**
- Verifică pachetul pe npmjs.com: https://www.npmjs.com/package/@identitate-ro/logos
- Așteaptă ~5 minute după publish
- Test cu versiunea `@latest`
- Fallback-ul local ar trebui să funcționeze oricum

### Erori TypeScript după update schema

**Cauză:** Type definitions out of sync

**Soluție:**
```bash
cd website
npm run build
# Verifică erorile și actualizează cod conform noului tip AssetUrls
```

### CDN rate limiting

**jsDelivr limits:**
- 100 GB/month free
- No hard rate limits pentru normal usage

**unpkg limits:**
- Unlimited bandwidth
- Rate limiting pentru abuse (very high threshold)

**Soluție:** Local fallback se activează automat

## Security

### CDN URLs sunt safe?

✅ **Da**, pentru că:
1. URLs-urile pointează spre pachete npm imutabile
2. npm registry are package signing
3. CDN-urile verifică integrity
4. Versiuni specifice nu pot fi modificate după publish

### Content Security Policy

Add to `<meta>` tags:

```html
<meta http-equiv="Content-Security-Policy" 
      content="img-src 'self' https://cdn.jsdelivr.net https://unpkg.com">
```

## Monitoring

### CDN Stats

**jsDelivr:**
- Dashboard: https://www.jsdelivr.com/package/npm/@identitate-ro/logos
- Stats API: `https://data.jsdelivr.com/v1/package/npm/@identitate-ro/logos`

**unpkg:**
- No public dashboard
- Traffic included în npm stats

### npm Stats

```bash
npm view @identitate-ro/logos
```

## FAQ

**Q: Pot folosi un CDN custom (ex: Cloudflare R2)?**  
A: Da, actualizează `getCdnUrls()` în `cdn-helpers.ts` cu pattern-ul tău.

**Q: Cum forțez folosirea doar a local fallback?**  
A: Apelează `resolveAssetPath(asset, false)` cu `preferCdn = false`.

**Q: Pot pin la o versiune specific în production?**  
A: Da, recomandat! Folosește `@1.0.0` nu `@latest` pentru stability.

**Q: Ce se întâmplă dacă ambele CDN-uri pică?**  
A: Local fallback (`/logos/...`) se activează automat.

**Q: CDN-urile costă bani?**  
A: Nu, jsDelivr și unpkg sunt gratuite pentru open-source projects.

---

**Documentație completă:** https://identitate.eu  
**Pachet npm:** https://www.npmjs.com/package/@identitate-ro/logos  
**GitHub:** https://github.com/laurentiucotet/IdentitateRO
