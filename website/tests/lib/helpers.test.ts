import { describe, it, expect } from 'vitest';
import {
  getDisplayName,
  getFullName,
  formatRgb,
  formatCmyk,
  hasSvg,
  hasColors,
  hasTypography,
  getWebsiteUrl,
  getBrandManualUrl,
  getSiteUrl,
  getSiteOrigin,
} from '../../src/lib/helpers';
import type { Institution } from '../../src/types/institution';

// ─── Mock factory ────────────────────────────────────────────────────────────

function makeInstitution(overrides: Partial<Institution> = {}): Institution {
  return {
    id: 'ro-test',
    slug: 'test',
    name: 'Instituție de Test',
    category: 'autoritate',
    meta: {
      version: '1.0',
      last_updated: '2026-01-01',
      keywords: ['test'],
    },
    assets: {
      main: {
        type: 'horizontal',
        color: '/logos/test/test.svg',
      },
    },
    ...overrides,
  };
}

// ─── getDisplayName ──────────────────────────────────────────────────────────

describe('getDisplayName', () => {
  it('returnează shortname uppercase când există', () => {
    const inst = makeInstitution({ shortname: 'anaf' });
    expect(getDisplayName(inst)).toBe('ANAF');
  });

  it('returnează name când shortname lipsește', () => {
    const inst = makeInstitution({ shortname: undefined });
    expect(getDisplayName(inst)).toBe('Instituție de Test');
  });
});

// ─── getFullName ─────────────────────────────────────────────────────────────

describe('getFullName', () => {
  it('returnează întotdeauna name complet', () => {
    const inst = makeInstitution({ shortname: 'anaf', name: 'Agenția Națională de Administrare Fiscală' });
    expect(getFullName(inst)).toBe('Agenția Națională de Administrare Fiscală');
  });
});

// ─── formatRgb ───────────────────────────────────────────────────────────────

describe('formatRgb', () => {
  it('formatează corect valorile RGB', () => {
    expect(formatRgb([55, 73, 144])).toBe('rgb(55, 73, 144)');
  });

  it('funcționează cu valori de margine (0 și 255)', () => {
    expect(formatRgb([0, 0, 0])).toBe('rgb(0, 0, 0)');
    expect(formatRgb([255, 255, 255])).toBe('rgb(255, 255, 255)');
  });
});

// ─── formatCmyk ──────────────────────────────────────────────────────────────

describe('formatCmyk', () => {
  it('formatează corect valorile CMYK', () => {
    expect(formatCmyk([62, 49, 0, 44])).toBe('62, 49, 0, 44');
  });

  it('funcționează cu valori de margine', () => {
    expect(formatCmyk([0, 0, 0, 0])).toBe('0, 0, 0, 0');
    expect(formatCmyk([100, 100, 100, 100])).toBe('100, 100, 100, 100');
  });
});

// ─── hasSvg ──────────────────────────────────────────────────────────────────

describe('hasSvg', () => {
  it('returnează true când există un SVG color pe main', () => {
    const inst = makeInstitution();
    expect(hasSvg(inst)).toBe(true);
  });

  it('returnează true când SVG e pe varianta white', () => {
    const inst = makeInstitution({
      assets: { main: { type: 'horizontal', white: '/logos/test/white.svg' } },
    });
    expect(hasSvg(inst)).toBe(true);
  });

  it('returnează false când nu există nicio variantă SVG', () => {
    const inst = makeInstitution({
      assets: {
        main: {
          type: 'horizontal',
          png: { path: '/logos/test/test.png', width: 400, height: 100 },
        },
      },
    });
    expect(hasSvg(inst)).toBe(false);
  });
});

// ─── hasColors ───────────────────────────────────────────────────────────────

describe('hasColors', () => {
  it('returnează true când există culori', () => {
    const inst = makeInstitution({
      colors: [{ name: 'Albastru', hex: '#002b7f', rgb: [0, 43, 127] }],
    });
    expect(hasColors(inst)).toBe(true);
  });

  it('returnează false când lista de culori e goală', () => {
    const inst = makeInstitution({ colors: [] });
    expect(hasColors(inst)).toBe(false);
  });

  it('returnează false când colors lipsește', () => {
    const inst = makeInstitution({ colors: undefined });
    expect(hasColors(inst)).toBe(false);
  });
});

// ─── hasTypography ───────────────────────────────────────────────────────────

describe('hasTypography', () => {
  it('returnează true când există tipografie primară', () => {
    const inst = makeInstitution({
      typography: { primary: { family: 'Inter' } },
    });
    expect(hasTypography(inst)).toBe(true);
  });

  it('returnează false când typography lipsește', () => {
    const inst = makeInstitution({ typography: undefined });
    expect(hasTypography(inst)).toBe(false);
  });
});

// ─── getWebsiteUrl / getBrandManualUrl ────────────────────────────────────────

describe('getWebsiteUrl', () => {
  it('returnează URL-ul site-ului când există', () => {
    const inst = makeInstitution({ resources: { website: 'https://anaf.ro' } });
    expect(getWebsiteUrl(inst)).toBe('https://anaf.ro');
  });

  it('returnează undefined când resources lipsește', () => {
    const inst = makeInstitution({ resources: undefined });
    expect(getWebsiteUrl(inst)).toBeUndefined();
  });
});

describe('getBrandManualUrl', () => {
  it('returnează URL-ul manualului când există', () => {
    const inst = makeInstitution({ resources: { branding_manual: 'https://example.com/manual.pdf' } });
    expect(getBrandManualUrl(inst)).toBe('https://example.com/manual.pdf');
  });

  it('returnează undefined când nu există manual', () => {
    const inst = makeInstitution({ resources: { website: 'https://anaf.ro' } });
    expect(getBrandManualUrl(inst)).toBeUndefined();
  });
});

// ─── getSiteUrl ───────────────────────────────────────────────────────────────

describe('getSiteUrl', () => {
  it('returnează URL-ul fără slash la final', () => {
    expect(getSiteUrl('https://identitate.eu/')).toBe('https://identitate.eu');
  });

  it('returnează fallback când nu e furnizat nimic', () => {
    expect(getSiteUrl()).toBe('https://identitate.eu');
  });

  it('nu modifică URL-ul dacă nu are slash la final', () => {
    expect(getSiteUrl('https://identitate.eu')).toBe('https://identitate.eu');
  });
});

// ─── getSiteOrigin ───────────────────────────────────────────────────────────

describe('getSiteOrigin', () => {
  it('returnează origin-ul corect', () => {
    expect(getSiteOrigin('https://identitate.eu')).toBe('https://identitate.eu');
  });

  it('extrage origin-ul din URL cu path', () => {
    expect(getSiteOrigin('https://identitate.eu/catalog')).toBe('https://identitate.eu');
  });
});
