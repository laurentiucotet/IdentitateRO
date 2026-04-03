import { describe, it, expect } from 'vitest';
import { isInstitution, hasCurrentSchema } from '../../src/types/institution';

// ─── Mock valid institution ───────────────────────────────────────────────────

const validInstitution = {
  id: 'ro-anaf',
  slug: 'anaf',
  name: 'Agenția Națională de Administrare Fiscală',
  shortname: 'anaf',
  category: 'agentie',
  meta: {
    version: '1.0',
    last_updated: '2026-01-01',
    keywords: ['fiscal', 'taxe'],
  },
  assets: {
    main: {
      type: 'horizontal',
      color: '/logos/anaf/anaf.svg',
    },
  },
};

// ─── isInstitution ───────────────────────────────────────────────────────────

describe('isInstitution', () => {
  it('returnează true pentru un obiect Institution valid', () => {
    expect(isInstitution(validInstitution)).toBe(true);
  });

  it('returnează false pentru null', () => {
    expect(isInstitution(null)).toBeFalsy();
  });

  it('returnează false pentru string', () => {
    expect(isInstitution('nu sunt o instituție')).toBe(false);
  });

  it('returnează false dacă id nu începe cu ro-', () => {
    expect(isInstitution({ ...validInstitution, id: 'eu-anaf' })).toBe(false);
  });

  it('returnează false dacă lipsește slug', () => {
    const { slug: _slug, ...rest } = validInstitution;
    expect(isInstitution(rest)).toBe(false);
  });

  it('returnează false dacă lipsește name', () => {
    const { name: _name, ...rest } = validInstitution;
    expect(isInstitution(rest)).toBe(false);
  });

  it('returnează false dacă meta.keywords nu e array', () => {
    const inst = { ...validInstitution, meta: { ...validInstitution.meta, keywords: 'fiscal' } };
    expect(isInstitution(inst)).toBe(false);
  });

  it('returnează false dacă lipsește assets.main', () => {
    const inst = { ...validInstitution, assets: { main: undefined } };
    expect(isInstitution(inst)).toBeFalsy();
  });

  it('returnează false dacă assets.main.type nu e string', () => {
    const inst = { ...validInstitution, assets: { main: { type: 123 } } };
    expect(isInstitution(inst)).toBe(false);
  });
});

// ─── hasCurrentSchema ────────────────────────────────────────────────────────

describe('hasCurrentSchema', () => {
  it('returnează true pentru un obiect cu schema curentă', () => {
    expect(hasCurrentSchema(validInstitution)).toBe(true);
  });

  it('returnează false pentru null', () => {
    expect(hasCurrentSchema(null)).toBeFalsy();
  });

  it('returnează false dacă id nu începe cu ro-', () => {
    expect(hasCurrentSchema({ ...validInstitution, id: 'vechi-format' })).toBe(false);
  });

  it('returnează false dacă meta.keywords lipsește sau nu e array', () => {
    const inst = { ...validInstitution, meta: { version: '1.0', last_updated: '2026-01-01' } };
    expect(hasCurrentSchema(inst)).toBe(false);
  });

  it('returnează false dacă assets.main lipsește', () => {
    const inst = { ...validInstitution, assets: {} };
    expect(hasCurrentSchema(inst)).toBe(false);
  });

  it('returnează false dacă slug lipsește', () => {
    const { slug: _slug, ...rest } = validInstitution;
    expect(hasCurrentSchema(rest)).toBe(false);
  });
});
