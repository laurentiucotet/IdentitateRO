# @identitate-ro/logos

> Logo-uri oficiale ale instituțiilor publice din România — Official logos of Romanian public institutions

[![npm version](https://img.shields.io/npm/v/@identitate-ro/logos.svg)](https://www.npmjs.com/package/@identitate-ro/logos)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📦 Instalare

```bash
npm install @identitate-ro/logos
```

## 🚀 Utilizare

### Via CDN (Recomandat)

Logo-urile sunt disponibile automat prin CDN-uri gratuite:

#### jsDelivr (CDN Primară)

```html
<!-- Logo complet -->
<img src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg" alt="ANAF">

<!-- Simbol -->
<img src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/simbol-anaf.svg" alt="ANAF Simbol">

<!-- Versiunea latest (se actualizează automat) -->
<img src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/guvernul-romaniei/guvernul-romaniei.svg" alt="Guvernul României">
```

#### unpkg (CDN Fallback)

```html
<img src="https://unpkg.com/@identitate-ro/logos@1.0.0/logos/pnrr/pnrr.svg" alt="PNRR">
```

### Via npm Package

După instalare, logo-urile sunt disponibile în `node_modules/@identitate-ro/logos/logos/`:

```javascript
// În React, Vue, etc.
import logoPath from '@identitate-ro/logos/logos/anaf/anaf.svg';

function MyComponent() {
  return <img src={logoPath} alt="ANAF" />;
}
```

```javascript
// În Node.js
import { readFileSync } from 'fs';
import { join } from 'path';

const logoPath = join(
  process.cwd(), 
  'node_modules/@identitate-ro/logos/logos/anaf/anaf.svg'
);
const logoContent = readFileSync(logoPath, 'utf8');
```

### Metadata

Pachetul include `index.json` cu metadata despre toate logo-urile:

```javascript
import metadata from '@identitate-ro/logos/index.json';

console.log(metadata.institutions);
// [
//   {
//     "id": "ro-anaf",
//     "slug": "anaf",
//     "name": "Agenția Națională de Administrare Fiscală",
//     "logos": {
//       "horizontal": {
//         "color": "/logos/anaf/anaf.svg"
//       },
//       "symbol": {
//         "color": "/logos/anaf/simbol-anaf.svg"
//       }
//     }
//   },
//   ...
// ]
```

## 📁 Structură

```
@identitate-ro/logos/
├── logos/
│   ├── anaf/
│   │   ├── anaf.svg
│   │   └── simbol-anaf.svg
│   ├── guvernul-romaniei/
│   │   ├── guvernul-romaniei.svg
│   │   ├── guvernul-romaniei-alb.svg
│   │   └── guvernul-romaniei-mono.svg
│   ├── ministerul-educatiei/
│   ├── pnrr/
│   ├── primaria-cluj-napoca/
│   └── ...
├── index.json (metadata)
└── README.md
```

## 🎨 Formate Disponibile

Pentru fiecare instituție, logo-urile sunt disponibile în mai multe variante:

- **Color** — Versiunea color completă (recomandată)
- **Dark Mode** — Optimizată pentru fundal întunecat
- **White** — Pentru fundal întunecat (versiune albă)
- **Black** — Pentru fundal deschis (versiune neagră)
- **Monochrome** — Versiune monocromă

### Layout-uri

- **Horizontal** — Logo complet orizontal (cel mai comun)
- **Vertical** — Logo complet vertical
- **Symbol** — Doar simbolul/iconița (fără text)

## 🔗 CDN URLs Pattern

```
https://cdn.jsdelivr.net/npm/@identitate-ro/logos@{version}/logos/{slug}/{filename}.svg
```

**Exemple:**

```
# Versiune specifică (recomandată pentru producție)
https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg

# Latest version (se actualizează automat)
https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg

# Specific major version
https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1/logos/anaf/anaf.svg
```

## 📋 Lista Instituțiilor

Instituțiile disponibile în v1.0.0:

- `anaf` — Agenția Națională de Administrare Fiscală
- `guvernul-romaniei` — Guvernul României
- `ministerul-educatiei` — Ministerul Educației
- `pnrr` — Plan Național de Redresare și Reziliență
- `primaria-cluj-napoca` — Primăria Cluj-Napoca

Pentru lista completă și actualizată, consultă [identitate.ro](https://identitate.ro).

## 💡 Exemple de Utilizare

### HTML Simplu

```html
<!DOCTYPE html>
<html>
<head>
  <title>Logo-uri Instituții</title>
</head>
<body>
  <img 
    src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg" 
    alt="ANAF"
    width="200"
  >
</body>
</html>
```

### React/Next.js

```jsx
export default function InstitutionLogo({ slug, variant = 'color' }) {
  const cdnUrl = `https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/${slug}/${slug}.svg`;
  
  return (
    <img 
      src={cdnUrl}
      alt={slug}
      loading="lazy"
    />
  );
}
```

### Vue

```vue
<template>
  <img 
    :src="logoUrl" 
    :alt="institution"
    loading="lazy"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['institution', 'variant']);

const logoUrl = computed(() => 
  `https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/${props.institution}/${props.institution}.svg`
);
</script>
```

### CSS Background

```css
.anaf-logo {
  background-image: url('https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 200px;
  height: 100px;
}
```

## 🎯 Best Practices

### 1. Folosește Versiuni Specifice în Producție

```html
<!-- ✅ Bine - versiune fixată -->
<img src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg">

<!-- ⚠️ Evită în producție - poate schimba -->
<img src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg">
```

### 2. Optimizare Performanță

```html
<!-- Lazy loading -->
<img 
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg"
  loading="lazy"
  alt="ANAF"
>

<!-- Preload pentru logo-uri critice -->
<link 
  rel="preload" 
  href="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/guvernul-romaniei/guvernul-romaniei.svg"
  as="image"
>
```

### 3. Fallback Strategy

```html
<img 
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg"
  onerror="this.src='https://unpkg.com/@identitate-ro/logos/logos/anaf/anaf.svg'"
  alt="ANAF"
>
```

### 4. Accesibilitate

```html
<!-- ✅ Include întotdeauna alt text descriptiv -->
<img 
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg"
  alt="Logo Agenția Națională de Administrare Fiscală"
  role="img"
>
```

## 📄 Licență

MIT License - vezi [LICENSE](./LICENSE) pentru detalii.

Toate logo-urile sunt proprietatea instituțiilor respective și sunt disponibile în scopuri informative și de utilizare legală conform ghidurilor de identitate vizuală ale fiecărei instituții.

## 🤝 Contribuții

Acest pachet face parte din proiectul [IdentitateRO](https://github.com/laurentiucotet/IdentitateRO).

Pentru a adăuga logo-uri noi sau pentru a raporta probleme:

1. Vizitează [github.com/laurentiucotet/IdentitateRO](https://github.com/laurentiucotet/IdentitateRO)
2. Consultă [CONTRIBUTING.md](https://github.com/laurentiucotet/IdentitateRO/blob/main/website/CONTRIBUTING.md)
3. Deschide un Pull Request sau Issue

## 🔗 Link-uri Utile

- **Website**: [identitate.ro](https://identitate.ro)
- **GitHub**: [github.com/laurentiucotet/IdentitateRO](https://github.com/laurentiucotet/IdentitateRO)
- **npm Package**: [@identitate-ro/logos](https://www.npmjs.com/package/@identitate-ro/logos)
- **jsDelivr CDN**: [cdn.jsdelivr.net/npm/@identitate-ro/logos](https://cdn.jsdelivr.net/npm/@identitate-ro/logos/)
- **unpkg CDN**: [unpkg.com/@identitate-ro/logos](https://unpkg.com/@identitate-ro/logos/)

## 📊 Stats

![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/@identitate-ro/logos/badge)

---

Made with ❤️ by [IdentitateRO Contributors](https://github.com/laurentiucotet/IdentitateRO/graphs/contributors)
