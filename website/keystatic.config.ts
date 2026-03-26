import { config, collection, fields } from '@keystatic/core';

// Reusable logo asset group schema
const logoAssetGroupFields = {
  type: fields.select({
    label: 'Tip layout',
    options: [
      { label: 'Orizontal', value: 'horizontal' },
      { label: 'Vertical', value: 'vertical' },
      { label: 'Simbol', value: 'symbol' },
    ],
    defaultValue: 'horizontal',
  }),
  color: fields.text({ label: 'Color SVG (cale sau URL CDN)' }),
  dark_mode: fields.text({ label: 'Dark mode SVG' }),
  white: fields.text({ label: 'White SVG' }),
  black: fields.text({ label: 'Black SVG' }),
  monochrome: fields.text({ label: 'Monochrome SVG' }),
};

export default config({
  storage:
    import.meta.env.PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID
      ? {
          kind: 'github',
          repo: 'laurentiucotet/IdentitateRO',
          branchPrefix: 'keystatic/',
        }
      : { kind: 'local' },

  ui: {
    brand: { name: 'IdentitateRO' },
    navigation: {
      Continut: ['institutions'],
    },
  },

  collections: {
    institutions: collection({
      label: 'Instituții',
      path: 'website/src/data/institutions/*',
      format: { data: 'json' },
      slugField: '_id',
      columns: ['name', 'category'],
      schema: {
        // --- Keystatic slug field (drives file name) ---
        _id: fields.slug({
          name: {
            label: 'ID instituție (ex: ro-anaf)',
            description: 'Determină numele fișierului JSON. Folosiți formatul: ro-{slug}',
          },
          slug: {
            label: 'Slug generat',
          },
        }),

        // --- Identificare ---
        id: fields.text({
          label: 'ID (câmp legacy)',
          description: 'Menținut pentru compatibilitate. Va fi același cu ID-ul de mai sus.',
        }),
        slug: fields.text({
          label: 'Slug URL (ex: anaf)',
          description: 'Folosit în URL-ul paginii: /institution/{slug}',
          validation: { isRequired: true },
        }),
        name: fields.text({
          label: 'Denumire completă',
          validation: { isRequired: true },
        }),
        shortname: fields.text({
          label: 'Denumire scurtă / acronim',
        }),
        category: fields.select({
          label: 'Categorie',
          options: [
            { label: 'Guvern', value: 'guvern' },
            { label: 'Minister', value: 'minister' },
            { label: 'Primărie', value: 'primarie' },
            { label: 'Consiliu Județean', value: 'consiliu-judetean' },
            { label: 'Prefectură', value: 'prefectura' },
            { label: 'Agenție', value: 'agentie' },
            { label: 'Autoritate', value: 'autoritate' },
            { label: 'Proiect UE', value: 'proiect-ue' },
            { label: 'Instituție culturală', value: 'institutie-cultura' },
            { label: 'Altele', value: 'altele' },
          ],
          defaultValue: 'agentie',
        }),

        // --- Metadata ---
        meta: fields.object(
          {
            version: fields.text({ label: 'Versiune date (ex: 1.0)' }),
            last_updated: fields.date({ label: 'Ultima actualizare' }),
            keywords: fields.array(
              fields.text({ label: 'Cuvânt cheie' }),
              {
                label: 'Cuvinte cheie (pentru căutare)',
                itemLabel: (props) => props.value || 'Keyword nou',
              }
            ),
            quality: fields.select({
              label: 'Status confirmare',
              options: [
                { label: 'Confirmat oficial', value: 'verified' },
                { label: 'Din surse oficiale', value: 'official_source' },
                { label: 'Neconfirmat oficial', value: 'unverified' },
              ],
              defaultValue: 'unverified',
            }),
            seo_title: fields.text({ label: 'SEO title (optional)' }),
            seo_description: fields.text({
              label: 'SEO description (optional)',
              multiline: true,
            }),
          },
          { label: 'Metadata' }
        ),

        // --- Locatie ---
        location: fields.object(
          {
            country_code: fields.text({ label: 'Cod tara', defaultValue: 'RO' }),
            county: fields.text({ label: 'Judet (ex: B, CJ)' }),
            city: fields.text({ label: 'Oras' }),
          },
          { label: 'Locatie' }
        ),

        // --- Descriere ---
        description: fields.text({
          label: 'Descriere',
          multiline: true,
        }),
        usage_notes: fields.text({
          label: 'Note de utilizare / restrictii',
          multiline: true,
        }),

        // --- Culori ---
        colors: fields.array(
          fields.object({
            name: fields.text({ label: 'Nume culoare (ex: Principala)' }),
            hex: fields.text({
              label: 'HEX',
              description: 'Ex: #2C2C76',
            }),
            rgb: fields.array(
              fields.integer({ label: 'Valoare (0-255)', validation: { isRequired: true, min: 0, max: 255 } }),
              {
                label: 'RGB [R, G, B]',
                itemLabel: (props) => String(props.value ?? ''),
              }
            ),
            cmyk: fields.array(
              fields.integer({ label: 'Valoare (0-100)', validation: { isRequired: true, min: 0, max: 100 } }),
              {
                label: 'CMYK [C, M, Y, K]',
                itemLabel: (props) => String(props.value ?? ''),
              }
            ),
            pantone: fields.text({ label: 'Pantone (ex: 2758 C)' }),
            usage: fields.select({
              label: 'Rol culoare',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Neutral', value: 'neutral' },
              ],
              defaultValue: 'primary',
            }),
          }),
          {
            label: 'Culori identitate vizuala',
            itemLabel: (props) =>
              props.fields.name.value
                ? `${props.fields.name.value} (${props.fields.hex.value || 'fara HEX'})`
                : 'Culoare noua',
          }
        ),

        // --- Tipografie ---
        typography: fields.object(
          {
            primary: fields.object(
              {
                family: fields.text({ label: 'Familie font' }),
                url: fields.text({ label: 'URL font (Google Fonts, MyFonts etc.)' }),
                weights: fields.array(
                  fields.integer({ label: 'Weight (ex: 400, 700)' }),
                  {
                    label: 'Weights disponibili',
                    itemLabel: (props) => String(props.value ?? ''),
                  }
                ),
              },
              { label: 'Font primar' }
            ),
            secondary: fields.object(
              {
                family: fields.text({ label: 'Familie font' }),
                url: fields.text({ label: 'URL font' }),
                weights: fields.array(
                  fields.integer({ label: 'Weight' }),
                  {
                    label: 'Weights disponibili',
                    itemLabel: (props) => String(props.value ?? ''),
                  }
                ),
              },
              { label: 'Font secundar (optional)' }
            ),
          },
          { label: 'Tipografie' }
        ),

        // --- Assets ---
        assets: fields.object(
          {
            main: fields.object(logoAssetGroupFields, { label: 'Logo principal (shortcut)' }),
            horizontal: fields.object(logoAssetGroupFields, { label: 'Layout orizontal' }),
            vertical: fields.object(logoAssetGroupFields, { label: 'Layout vertical' }),
            symbol: fields.object(logoAssetGroupFields, { label: 'Simbol / emblema' }),
            favicon: fields.text({ label: 'Favicon (cale SVG/PNG)' }),
          },
          { label: 'Assets logo' }
        ),

        // --- Resurse ---
        resources: fields.object(
          {
            website: fields.text({ label: 'Website oficial' }),
            branding_manual: fields.text({ label: 'Manual de identitate (URL PDF)' }),
            wikidata_id: fields.text({ label: 'Wikidata ID (ex: Q12345)' }),
            wikipedia_url: fields.text({ label: 'Wikipedia RO (URL)' }),
            official_resources: fields.text({ label: 'Resurse oficiale (arhiva, ZIP etc.)' }),
            social_media: fields.object(
              {
                facebook: fields.text({ label: 'Facebook' }),
                twitter: fields.text({ label: 'Twitter / X' }),
                linkedin: fields.text({ label: 'LinkedIn' }),
                instagram: fields.text({ label: 'Instagram' }),
                youtube: fields.text({ label: 'YouTube' }),
              },
              { label: 'Social media' }
            ),
          },
          { label: 'Resurse externe' }
        ),
      },
    }),
  },
});
