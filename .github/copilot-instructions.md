# IdentitateRO — AI Agent Instructions

Welcome to the IdentitateRO codebase! This document provides essential context and conventions to help you be immediately productive while maintaining consistency and quality across the project.

## 🏗️ Big Picture Architecture

IdentitateRO is a monorepo consisting of two main parts:

1. **`packages/logos/`**: An NPM package (`@identitate-ro/logos`) containing the source of truth for all logos (SVGs) and their metadata (`index.json`). It also includes a framework-agnostic web component (`identity-loader.js`).
2. **`website/`**: An Astro 5 static site (`identitate.eu`) that serves as the public registry and search interface.

**Data Flow**: 
Raw SVGs and `metadata.md` files in `packages/logos/logos/[slug]/` -> AI Generator -> `website/src/data/institutions/[slug].json` -> Index Generator -> `website/src/data/institutions-index.json` -> Astro Pages.

## 📊 Data Schema (v3.0)

The project uses a flattened JSON schema (v3.0) for institution data.

- **ID Format**: Must be `ro-{slug}` (e.g., `ro-anaf`).
- **Assets**: Must include an `assets.main` object as a shortcut to the primary logo.
- **URLs**: Asset URLs should be CDN-ready absolute paths or local paths that get resolved via `src/lib/cdn-helpers.ts`.
- **Search**: Uses `keywords` (array of strings) instead of `tags`.
- **Location**: Simplified to `country_code`, `county`, `city`.

*Reference: `website/src/types/institution.ts` and `docs/schema-migration-plan.md`*

## 🛠️ Critical Developer Workflows

### 1. Adding/Updating an Institution

We use an AI-assisted workflow to generate the JSON data:

1. Place SVG files in `packages/logos/logos/[slug]/{horizontal,vertical,symbol}/`.
2. Create a `metadata.md` in the slug folder with basic info (name, category, colors).
3. Run the generator:
   ```bash
   cd website
   npm run data:generate:from-md -- [slug]
   ```
4. Update the central index:
   ```bash
   npm run data:generate
   ```

### 2. Local Development
```bash
cd website
npm install
npm run dev # Starts Astro on port 4321
```

## 🧩 Project-Specific Conventions

- **CDN-First Assets**: We serve logos via jsDelivr/unpkg. Use `resolveAssetPath()` from `website/src/lib/cdn-helpers.ts` to get the correct URL for an asset.
- **Language**: Code (variables, functions, comments) is in **English**. User-facing content and data values (like category names) are in **Romanian**. See `website/src/lib/labels.ts` for standard translations.
- **Styling**: Use Tailwind CSS utility classes. Avoid custom CSS unless absolutely necessary (placed in `website/src/styles/global.css`).
- **Components**: Prefer Astro components (`.astro`) over UI framework components (React/Vue) to keep the site static and lightweight.

## 🔗 Integration Points

- **Web Component**: The `<identity-icon>` custom element (`packages/logos/identity-loader.js`) is the recommended way for external users to consume logos. It handles CDN fetching, caching, and SVG injection.
- **Search**: Client-side fuzzy search is powered by `fuse.js` on the homepage (`website/src/pages/index.astro`), querying the generated `institutions-index.json`.

## ✅ Quality Control Guidelines

These rules must be followed to maintain data integrity and consistency across the project:

### Data Integrity

1. **Enforce v3.0 Schema Strictly** — Never use legacy v2.0 nested structures. Always include `assets.main` and use `keywords` (not `tags`).

2. **Validate ID and Slug Format** — IDs must be `ro-{slug}`, lowercase, no diacritics, hyphens only. Example: `ro-anaf`, `ro-primaria-timisoara`.

3. **Require `meta.last_updated`** — Every institution JSON must include `meta.last_updated` in ISO 8601 format (`YYYY-MM-DD`).

4. **Use Romanian for User-Facing Data** — Category labels, descriptions, color names, and UI text must be in Romanian. English is for code only.

5. **Set Correct Quality Level** — Use `verified` (official source), `community` (checked), or `draft` (incomplete). Never mark uncertain data as `verified`.

### Visual Assets

6. **Verify SVG Quality** — All logos must have:
   - Valid `viewBox` attribute
   - No embedded fonts (convert text to paths)
   - No Adobe Illustrator/Figma metadata
   - File size ≤ 200KB
   - Colors matching official brand manual

7. **Maintain Directory Structure** — Follow exact hierarchy:
   ```
   packages/logos/logos/ro-{slug}/
   ├── metadata.md
   ├── horizontal/{color,white,black}.svg
   ├── vertical/{color,white,black}.svg   (optional)
   └── symbol/{color,white,black}.svg
   ```

8. **Use CDN Resolution Helpers** — Never hardcode CDN URLs. Use `resolveAssetPath()` from `cdn-helpers.ts`.

### Code Standards

9. **Prefer Astro Components** — Keep site static and lightweight. Avoid React/Vue/Svelte unless absolutely necessary.

10. **Use Tailwind CSS** — All styling via utility classes. Custom CSS only in `global.css` as last resort.

11. **TypeScript Strict Mode** — Avoid `any`, use explicit return types, ensure no build errors.

### Data Maintenance

12. **Run Index Generator After Changes** — After modifying any JSON file, run both:
    ```bash
    cd packages/logos && node scripts/generate-index.js
    cd website && npm run data:generate
    ```

13. **Validate External Resource URLs** — All URLs in `resources` (website, branding_manual, social_media) must be functional HTTP/HTTPS links.

14. **Keep Keywords Relevant** — Include 3–8 Romanian terms. Avoid generic words like "romania" or "institution."

15. **Document Colors Completely** — Include `name`, `hex`, `usage` (primary/secondary/accent). Add `rgb/cmyk/pantone` when possible.

### Project Structure

16. **Respect Monorepo Boundaries** — `packages/logos/` and `website/` are independent. Consider changes across both directories.

17. **Test Locally Before Proposing Changes** — Run `npm run dev` and verify homepage, search, and detail pages work correctly.

18. **Write Descriptive Commit Messages** — Format: `[area]: brief description` (e.g., `schemas: add ro-cfr entry`, `fix: correct ANAF color hex`).

19. **Update Web Component Examples** — If modifying `identity-loader.js`, update `packages/logos/examples/` to reflect current API.

20. **Preserve Schema Consistency** — When adding new fields, ensure they follow v3.0 conventions (snake_case for dates, flattened structure, etc.).

---

*For the full type definition, see `website/src/types/institution.ts`.*
