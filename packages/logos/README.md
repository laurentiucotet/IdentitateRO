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

#### URL-uri Simple (Recomandat)

```html
<!-- Logo complet -->
<img src="https://identitate.eu/logos/anaf/anaf.svg" alt="ANAF" />

<!-- Simbol -->
<img src="https://identitate.eu/logos/anaf/simbol-anaf.svg" alt="ANAF Simbol" />

<!-- Alte instituții -->
<img
  src="https://identitate.eu/logos/guvernul-romaniei/guvernul-romaniei.svg"
  alt="Guvernul României"
/>
<img src="https://identitate.eu/logos/pnrr/pnrr.svg" alt="PNRR" />
```

#### jsDelivr (CDN Primară)

```html
<!-- Logo complet -->
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.1/logos/anaf/anaf.svg"
  alt="ANAF"
/>

<!-- Simbol -->
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.1/logos/anaf/simbol-anaf.svg"
  alt="ANAF Simbol"
/>

<!-- Versiunea latest (se actualizează automat) -->
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.1/logos/guvernul-romaniei/guvernul-romaniei.svg"
  alt="Guvernul României"
/>
```

#### unpkg (CDN Fallback)

```html
<img
  src="https://unpkg.com/@identitate-ro/logos@1.3.1/logos/pnrr/pnrr.svg"
  alt="PNRR"
/>
```

### Via npm Package

După instalare, logo-urile sunt disponibile în `node_modules/@identitate-ro/logos/logos/`:

```javascript
// În React, Vue, etc.
import logoPath from "@identitate-ro/logos/logos/anaf/anaf.svg";

function MyComponent() {
  return <img src={logoPath} alt="ANAF" />;
}
```

```javascript
// În Node.js
import { readFileSync } from "fs";
import { join } from "path";

const logoPath = join(
  process.cwd(),
  "node_modules/@identitate-ro/logos/logos/anaf/anaf.svg",
);
const logoContent = readFileSync(logoPath, "utf8");
```

### 🎯 Web Component (Recomandat pentru Aplicații Moderne)

**Metoda profesională, framework-agnostic** — funcționează cu React, Vue, Angular, vanilla HTML, WordPress, etc.

#### Cum funcționează?

Web Component-ul `<identity-icon>` este un element HTML custom care:

- ✅ Descarcă automat SVG-ul din CDN
- ✅ Include caching inteligent (descarcă o singură dată)
- ✅ Permite stilizare CSS (`color`, `width`, `height`, etc.)
- ✅ Gestionează automat erorile și loading states
- ✅ Este complet agnostic de framework

#### Instalare și Setup

**Pas 1: Instalează pachetul**

```bash
npm install @identitate-ro/logos
```

**Pas 2: Importă loader-ul** (o singură dată în aplicație)

```javascript
// În index.js, main.js, App.js, etc.
import "@identitate-ro/logos/loader";
```

Sau în HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/identity-loader.js"></script>
```

**Pas 3: Folosește tag-ul `<identity-icon>`**

```html
<identity-icon src="https://identitate.eu/logos/anaf/anaf.svg"> </identity-icon>
```

#### Exemple Complete

##### Vanilla HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Logo Instituții</title>
    <script src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/identity-loader.js"></script>
    <style>
      .logo-guvern {
        width: 64px;
        height: 64px;
        color: #003399; /* Albastru */
        transition: color 0.3s;
      }

      .logo-guvern:hover {
        color: #ffcc00; /* Galben la hover */
        filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
      }
    </style>
  </head>
  <body>
    <identity-icon
      src="https://identitate.eu/logos/guvernul-romaniei/guvernul-romaniei.svg"
      class="logo-guvern"
    >
    </identity-icon>
  </body>
</html>
```

##### React

```jsx
// App.js sau index.js
import "@identitate-ro/logos/loader";

function InstitutionLogo({ slug }) {
  return (
    <identity-icon
      src={`https://identitate.eu/logos/${slug}/${slug}.svg`}
      className="w-16 h-16 text-blue-600"
    />
  );
}

// Folosire
<InstitutionLogo slug="anaf" />;
```

##### Vue

```vue
<script setup>
// În main.js sau App.vue
import "@identitate-ro/logos/loader";

const props = defineProps(["institution"]);
</script>

<template>
  <identity-icon
    :src="`https://identitate.eu/logos/${institution}/${institution}.svg`"
    class="logo-icon"
  />
</template>

<style scoped>
.logo-icon {
  width: 64px;
  height: 64px;
  color: currentColor;
}
</style>
```

##### Angular

```typescript
// app.component.ts
import "@identitate-ro/logos/loader";

@Component({
  selector: "app-institution-logo",
  template: `
    <identity-icon [attr.src]="logoUrl" class="institution-logo">
    </identity-icon>
  `,
  styles: [
    `
      .institution-logo {
        width: 64px;
        height: 64px;
        color: #003399;
      }
    `,
  ],
})
export class InstitutionLogoComponent {
  @Input() slug!: string;

  get logoUrl() {
    return `https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/${this.slug}/${this.slug}.svg`;
  }
}
```

##### WordPress

```php
<!-- functions.php -->
<?php
function enqueue_identity_loader() {
    wp_enqueue_script(
        'identity-loader',
        'https://cdn.jsdelivr.net/npm/@identitate-ro/logos/identity-loader.js',
        array(),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'enqueue_identity_loader');
?>

<!-- În template (page.php, single.php, etc.) -->
<identity-icon
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.1/logos/primaria-cluj-napoca/primaria-cluj-napoca.svg"
  style="width: 100px; height: 100px; color: #2c5aa0;">
</identity-icon>
```

#### Stilizare CSS

Web Component-ul respectă complet CSS-ul:

```css
/* Dimensiuni */
identity-icon {
  width: 64px;
  height: 64px;
}

/* Culoare (fill: currentColor activat automat) */
identity-icon {
  color: #003399;
}

identity-icon:hover {
  color: #ffcc00;
}

/* Efecte */
identity-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  identity-icon {
    width: 48px;
    height: 48px;
  }
}
```

#### Atribute Suportate

- `src` **(obligatoriu)** — URL-ul către logo-ul SVG
- `size` _(opțional)_ — Shortcut pentru width/height (ex: `size="64px"`)

```html
<!-- Cu size attribute -->
<identity-icon
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg"
  size="128px"
>
</identity-icon>
```

#### Avantaje Web Component

1. **Semantic HTML**: `<identity-icon>` comunică clar ce face
2. **Caching inteligent**: Descarcă fiecare SVG o singură dată, chiar dacă îl folosești în 100 de locuri
3. **Stilizare ușoară**: Folosește CSS normal (`color`, `width`, `height`, etc.)
4. **Framework-agnostic**: Funcționează oriunde rulează JavaScript
5. **Loading states**: Gestionează automat stările de loading și eroare
6. **Security**: Sanitizare automată a SVG-urilor (remove script tags)

### Metadata

Pachetul include `index.json` cu metadata despre toate logo-urile:

```javascript
import metadata from "@identitate-ro/logos/index.json";

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

Pentru lista completă și actualizată, consultă [identitatero.vercel.app](https://identitatero.vercel.app).

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
    />
  </body>
</html>
```

### React/Next.js

```jsx
export default function InstitutionLogo({ slug, variant = "color" }) {
  const cdnUrl = `https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/${slug}/${slug}.svg`;

  return <img src={cdnUrl} alt={slug} loading="lazy" />;
}
```

### Vue

```vue
<template>
  <img :src="logoUrl" :alt="institution" loading="lazy" />
</template>

<script setup>
import { computed } from "vue";

const props = defineProps(["institution", "variant"]);

const logoUrl = computed(
  () =>
    `https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/${props.institution}/${props.institution}.svg`,
);
</script>
```

### CSS Background

```css
.anaf-logo {
  background-image: url("https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.1/logos/anaf/anaf.svg");
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
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg"
/>

<!-- ⚠️ Evită în producție - poate schimba -->
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.1/logos/anaf/anaf.svg"
/>
```

### 2. Optimizare Performanță

```html
<!-- Lazy loading -->
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg"
  loading="lazy"
  alt="ANAF"
/>

<!-- Preload pentru logo-uri critice -->
<link
  rel="preload"
  href="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/guvernul-romaniei/guvernul-romaniei.svg"
  as="image"
/>
```

### 3. Fallback Strategy

```html
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg"
  onerror="this.src='https://unpkg.com/@identitate-ro/logos/logos/anaf/anaf.svg'"
  alt="ANAF"
/>
```

### 4. Accesibilitate

```html
<!-- ✅ Include întotdeauna alt text descriptiv -->
<img
  src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg"
  alt="Logo Agenția Națională de Administrare Fiscală"
  role="img"
/>
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

- **Website**: [identitatero.vercel.app](https://identitatero.vercel.app)
- **Documentație**: [identitatero.vercel.app/utilizare](https://identitatero.vercel.app/utilizare)
- **GitHub**: [github.com/laurentiucotet/IdentitateRO](https://github.com/laurentiucotet/IdentitateRO)
- **npm Package**: [@identitate-ro/logos](https://www.npmjs.com/package/@identitate-ro/logos)
- **jsDelivr CDN**: [cdn.jsdelivr.net/npm/@identitate-ro/logos](https://cdn.jsdelivr.net/npm/@identitate-ro/logos/)
- **unpkg CDN**: [unpkg.com/@identitate-ro/logos](https://unpkg.com/@identitate-ro/logos/)

## 📊 Stats

![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/@identitate-ro/logos/badge)

---

Made with ❤️ by [IdentitateRO Contributors](https://github.com/laurentiucotet/IdentitateRO/graphs/contributors)
