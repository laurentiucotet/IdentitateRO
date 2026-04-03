import { describe, it, expect } from 'vitest';
import {
  CATEGORY_LABELS,
  CATEGORY_LABELS_SINGULAR,
  CATEGORY_ORDER,
  LOGO_LAYOUT_LABELS,
  LOGO_VARIANT_LABELS,
  COLOR_USAGE_LABELS,
  QUALITY_LABELS,
  TYPOGRAPHY_ROLE_LABELS,
} from '../../src/lib/labels';

// ─── CATEGORY_LABELS ─────────────────────────────────────────────────────────

describe('CATEGORY_LABELS', () => {
  const expectedCategories = [
    'guvern', 'minister', 'primarie', 'consiliu-judetean',
    'prefectura', 'agentie', 'autoritate', 'proiect-ue',
    'institutie-cultura', 'altele',
  ];

  it('conține toate cele 10 categorii', () => {
    expectedCategories.forEach(cat => {
      expect(CATEGORY_LABELS[cat], `Categoria "${cat}" lipsește`).toBeDefined();
    });
  });

  it('fiecare categorie are un label non-gol', () => {
    expectedCategories.forEach(cat => {
      expect(typeof CATEGORY_LABELS[cat]).toBe('string');
      expect(CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
    });
  });
});

// ─── CATEGORY_LABELS_SINGULAR ────────────────────────────────────────────────

describe('CATEGORY_LABELS_SINGULAR', () => {
  it('are aceleași categorii ca CATEGORY_LABELS', () => {
    const mainKeys = Object.keys(CATEGORY_LABELS).sort();
    const singularKeys = Object.keys(CATEGORY_LABELS_SINGULAR).sort();
    expect(singularKeys).toEqual(mainKeys);
  });
});

// ─── CATEGORY_ORDER ──────────────────────────────────────────────────────────

describe('CATEGORY_ORDER', () => {
  it('conține exact 10 categorii', () => {
    expect(CATEGORY_ORDER).toHaveLength(10);
  });

  it('fiecare categorie din ordine are un label definit', () => {
    CATEGORY_ORDER.forEach(cat => {
      expect(CATEGORY_LABELS[cat], `Categoria din ordine "${cat}" nu are label`).toBeDefined();
    });
  });

  it('prima categorie este guvern', () => {
    expect(CATEGORY_ORDER[0]).toBe('guvern');
  });
});

// ─── LOGO_LAYOUT_LABELS ──────────────────────────────────────────────────────

describe('LOGO_LAYOUT_LABELS', () => {
  const expectedLayouts = ['horizontal', 'vertical', 'symbol'];

  it('conține toate cele 3 layout-uri', () => {
    expectedLayouts.forEach(layout => {
      expect(LOGO_LAYOUT_LABELS[layout], `Layout "${layout}" lipsește`).toBeDefined();
    });
  });

  it('fiecare layout are un label string non-gol', () => {
    expectedLayouts.forEach(layout => {
      expect(typeof LOGO_LAYOUT_LABELS[layout]).toBe('string');
      expect(LOGO_LAYOUT_LABELS[layout].length).toBeGreaterThan(0);
    });
  });
});

// ─── LOGO_VARIANT_LABELS ─────────────────────────────────────────────────────

describe('LOGO_VARIANT_LABELS', () => {
  const expectedVariants = ['color', 'dark_mode', 'white', 'black', 'monochrome'];

  it('conține toate cele 5 variante cromatice', () => {
    expectedVariants.forEach(variant => {
      expect(LOGO_VARIANT_LABELS[variant], `Varianta "${variant}" lipsește`).toBeDefined();
    });
  });

  it('fiecare variantă are un label string non-gol', () => {
    expectedVariants.forEach(variant => {
      expect(typeof LOGO_VARIANT_LABELS[variant]).toBe('string');
      expect(LOGO_VARIANT_LABELS[variant].length).toBeGreaterThan(0);
    });
  });
});

// ─── COLOR_USAGE_LABELS ──────────────────────────────────────────────────────

describe('COLOR_USAGE_LABELS', () => {
  const expectedUsages = ['primary', 'secondary', 'accent', 'neutral'];

  it('conține toate tipurile de utilizare culoare', () => {
    expectedUsages.forEach(usage => {
      expect(COLOR_USAGE_LABELS[usage], `Utilizarea "${usage}" lipsește`).toBeDefined();
    });
  });
});

// ─── QUALITY_LABELS ──────────────────────────────────────────────────────────

describe('QUALITY_LABELS', () => {
  const expectedLevels = ['verified', 'official_source', 'unverified'];

  it('conține toate cele 3 niveluri de calitate', () => {
    expectedLevels.forEach(level => {
      expect(QUALITY_LABELS[level], `Nivelul "${level}" lipsește`).toBeDefined();
    });
  });

  it('fiecare nivel are câmpul label', () => {
    expectedLevels.forEach(level => {
      expect(typeof QUALITY_LABELS[level].label).toBe('string');
      expect(QUALITY_LABELS[level].label.length).toBeGreaterThan(0);
    });
  });

  it('fiecare nivel are câmpul class', () => {
    expectedLevels.forEach(level => {
      expect(typeof QUALITY_LABELS[level].class).toBe('string');
      expect(QUALITY_LABELS[level].class.length).toBeGreaterThan(0);
    });
  });
});

// ─── TYPOGRAPHY_ROLE_LABELS ──────────────────────────────────────────────────

describe('TYPOGRAPHY_ROLE_LABELS', () => {
  it('conține rolul primary și secondary', () => {
    expect(TYPOGRAPHY_ROLE_LABELS['primary']).toBeDefined();
    expect(TYPOGRAPHY_ROLE_LABELS['secondary']).toBeDefined();
  });
});
