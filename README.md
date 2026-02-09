# IdentitateRO

[![Website](https://img.shields.io/badge/website-identitatero.vercel.app-blue)](https://identitatero.vercel.app)
[![npm version](https://img.shields.io/npm/v/@identitate-ro/logos.svg)](https://www.npmjs.com/package/@identitate-ro/logos)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Registru digital open-source pentru identitatea vizuală a instituțiilor publice din România.

Logo-uri vectoriale (SVG), palete de culori oficiale și manuale de brand — o singură sursă de adevăr.

🌐 **Website**: [identitatero.vercel.app](https://identitatero.vercel.app)  
📦 **NPM Package**: [@identitate-ro/logos](https://www.npmjs.com/package/@identitate-ro/logos)

## 🚀 Utilizare Rapidă

### Prin CDN (Recomandat)

```html
<img src="https://cdn.jsdelivr.net/npm/@identitate-ro/logos/logos/anaf/anaf.svg" alt="ANAF">
```

### Prin NPM

```bash
npm install @identitate-ro/logos
```

```javascript
import logoPath from '@identitate-ro/logos/logos/anaf/anaf.svg';
```

📖 **Documentație completă**: [identitatero.vercel.app/utilizare](https://identitatero.vercel.app/utilizare)

## 📁 Structură Proiect

```
IdentitateRO/
├── packages/logos/          # NPM package cu logo-uri
│   ├── logos/              # Fișiere SVG organizate pe instituții
│   ├── index.json          # Metadata pentru toate logo-urile
│   └── package.json
│
├── website/                # Site-ul Astro (identitatero.vercel.app)
│   ├── src/
│   │   ├── data/          # Date JSON per instituție
│   │   ├── pages/         # Pagini Astro (index, utilizare, despre, etc.)
│   │   └── components/    # Componente reutilizabile
│   └── public/logos/      # Logo-uri pentru preview
│
└── docs/                  # Documentație tehnică
```

## 🎯 Caracteristici

- ✅ **Logo-uri vectoriale** de înaltă calitate (SVG)
- ✅ **CDN gratuit** prin jsDelivr și unpkg
- ✅ **NPM package** pentru integrare ușoară
- ✅ **TypeScript support** cu type definitions
- ✅ **Metadata completă** (culori, dimensiuni, variante)
- ✅ **Open-source** și gratuit de folosit

## 🛠️ Development Setup

### Website

```bash
cd website
npm install
npm run dev
```

Site-ul va fi disponibil la `http://localhost:4321`

### NPM Package

```bash
cd packages/logos
npm install
npm run generate  # Generează index.json
```

## 📦 NPM Package

Pachetul `@identitate-ro/logos` include:

- 🖼️ Toate logo-urile în format SVG
- 📋 `index.json` cu metadata completă
- 🔄 Actualizări regulate cu logo-uri noi
- 📚 TypeScript types (coming soon)

### Instituții Disponibile

- ANAF (Agenția Națională de Administrare Fiscală)
- Guvernul României
- Ministerul Educației
- PNRR (Plan Național de Redresare și Reziliență)
- Primăria Cluj-Napoca
- ...și în continuă creștere!

## 🤝 Contribuții

Contribuțiile sunt binevenite! Pentru a contribui:

1. Consultă [CONTRIBUTING.md](website/CONTRIBUTING.md)
2. Fork repository-ul
3. Creează un branch pentru feature-ul tău
4. Trimite un Pull Request

### Adaugă un logo nou

1. Plasează fișierele SVG în `packages/logos/logos/[slug-institutie]/`
2. Rulează `npm run generate` în `packages/logos/`
3. Actualizează `website/src/data/institutions/[slug].json`
4. Copiază logo-urile și în `website/public/logos/[slug]/`

## 📄 Licență

MIT License - vezi [LICENSE](LICENSE) pentru detalii.

Toate logo-urile sunt proprietatea instituțiilor respective și sunt disponibile în scopuri informative și de utilizare legală conform ghidurilor de identitate vizuală ale fiecărei instituții.

## 🔗 Link-uri Utile

- **Website**: [identitatero.vercel.app](https://identitatero.vercel.app)
- **NPM Package**: [@identitate-ro/logos](https://www.npmjs.com/package/@identitate-ro/logos)
- **CDN (jsDelivr)**: [cdn.jsdelivr.net/npm/@identitate-ro/logos](https://cdn.jsdelivr.net/npm/@identitate-ro/logos/)
- **CDN (unpkg)**: [unpkg.com/@identitate-ro/logos](https://unpkg.com/@identitate-ro/logos/)
- **Documentație**: [identitatero.vercel.app/utilizare](https://identitatero.vercel.app/utilizare)

---

Made with ❤️ by [Contributors](https://github.com/laurentiucotet/IdentitateRO/graphs/contributors)
