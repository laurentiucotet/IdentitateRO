# Ghid de Contribuire — IdentitateRO

Mulțumim că vrei să contribui! Acest document descrie procesul.

## Tipuri de contribuții

### 1. Adaugă un logo nou

**Cel mai valoros tip de contribuție.** Avem nevoie de logo-uri vectoriale curate ale instituțiilor publice.

#### Pași:

1. **Fork** repository-ul
2. Creează un folder nou: `public/logos/{slug}/`
3. Adaugă fișierul SVG principal: `{slug}.svg`
4. (Opțional) Adaugă variante: `{slug}-mono.svg`, `{slug}-alb.svg`
5. Creează metadatele: `src/data/institutions/{slug}.json`
6. Rulează `npm run data:generate`
7. Verifică local cu `npm run dev`
8. Trimite un **Pull Request**

#### Convenția de numire (slug):

```
primaria-timisoara        ✅ Corect
Primaria_Timisoara        ❌ Greșit
primăria-timișoara        ❌ Fără diacritice în slug
```

- Litere mici
- Fără diacritice
- Cuvinte separate prin `-`

#### Cerințe SVG:

- [ ] Fișierul are `viewBox` corect definit
- [ ] Nu conține metadate Adobe Illustrator / Figma
- [ ] Nu conține fonturi embed-uite (convertite la path-uri dacă e necesar)
- [ ] Culorile sunt consistente cu cele din manualul de identitate
- [ ] Fișierul nu depășește 200KB

### 2. Corectează date existente

- Culori greșite? Deschide un Issue sau un PR.
- Link expirat la brand manual? La fel.
- Calitate: schimbă `"quality": "draft"` → `"community"` dacă ai verificat datele.

### 3. Contribuie la cod

- Bugfix-uri sunt întotdeauna binevenite
- Feature-uri noi — deschide mai întâi un Issue pentru discuție

## Schema JSON

Consultă `src/types/institution.ts` pentru definiția completă.

Câmpuri obligatorii:
- `id` (slug unic)
- `name` (numele complet oficial)
- `category` (una din categoriile predefinite)
- `colors` (cel puțin o culoare)
- `assets` (cel puțin un logo)
- `updatedAt` (data ultimei modificări)
- `quality` (verified | community | draft)

## Development

```bash
cd website
npm install
npm run dev        # Server local pe :4321
npm run build      # Build static
npm run preview    # Preview build
```

## Code Style

- TypeScript strict
- Astro components (nu React/Vue)
- Tailwind CSS (nu CSS custom dacă nu e necesar)
- Commit messages în română sau engleză

## Mulțumiri

Contribuitorii sunt credit-ați automat prin GitHub. La fiecare logo adăugat, `"source"` din JSON va reflecta sursa contribuției.
