# Schema Migration Plan: v2.0 → v3.0

## Executive Summary

Migrarea de la schema ierarhică v2.0 la noua schemă v3.0 simplificată, cu focus pe:
1. Asset URLs absolute (CDN-ready)
2. Shortcut `main` pentru developer experience
3. Keywords pentru search îmbunătățit
4. Structură simplificată

---

## Comparison: v2.0 vs v3.0

### Schema v2.0 (Current)

```json
{
  "id": "anaf",
  "meta": {
    "version": "1.0",
    "lastUpdated": "2026-02-08",
    "tags": ["guvernamental", "taxe"],
    "internalId": "RO-ANAF-001",
    "quality": "verified",
    "source": "Website oficial"
  },
  "institution": {
    "name": "Agenția Națională de Administrare Fiscală",
    "shortName": "ANAF",
    "category": "agentie",
    "location": {
      "locality": "București",
      "county": "Municipiul București",
      "countyCode": "B"
    }
  },
  "visualIdentity": {
    "colors": [...],
    "typography": [...]
  },
  "assets": {
    "logos": {
      "fullHorizontal": {
        "variants": {
          "color": "/logos/anaf/anaf.svg"
        }
      }
    }
  }
}
```

### Schema v3.0 (Proposed)

```json
{
  "id": "ro-anaf",
  "slug": "anaf",
  "name": "Agenția Națională de Administrare Fiscală",
  "shortname": "ANAF",
  "category": "agency",
  
  "meta": {
    "version": "1.2.0",
    "last_updated": "2024-03-15",
    "keywords": ["taxe", "impozite", "fisc", "anaf"]
  },
  
  "location": {
    "country_code": "RO",
    "county": "B",
    "city": "București"
  },
  
  "description": "Instituția specializată...",
  
  "colors": [...],
  "typography": {...},
  
  "assets": {
    "main": {
      "type": "horizontal",
      "color": "https://cdn.identity.ro/assets/ro/anaf/horizontal/color.svg",
      "dark_mode": "https://cdn.identity.ro/assets/ro/anaf/horizontal/dark-mode.svg",
      "white": "https://cdn.identity.ro/assets/ro/anaf/horizontal/white.svg",
      "black": "https://cdn.identity.ro/assets/ro/anaf/horizontal/black.svg"
    },
    "horizontal": {...},
    "vertical": {...},
    "symbol": {...}
  },
  
  "resources": {
    "website": "https://www.anaf.ro",
    "branding_manual": "https://..."
  }
}
```

---

## Key Changes

### 1. **Top-Level Restructuring**

| v2.0 Path | v3.0 Path | Notes |
|-----------|-----------|-------|
| `id` | `slug` | ID becomes `ro-{slug}` |
| - | `id` | New: `ro-{slug}` format |
| `institution.name` | `name` | Moved to top level |
| `institution.shortName` | `shortname` | Moved to top level, lowercase |
| `institution.acronym` | Removed | Redundant with shortname |
| `institution.description` | `description` | Moved to top level |
| `institution.website` | `resources.website` | Moved to resources |
| `institution.manualUrl` | `resources.branding_manual` | Renamed |

### 2. **Meta Changes**

| v2.0 | v3.0 | Change Type |
|------|------|-------------|
| `lastUpdated` | `last_updated` | Snake case |
| `tags` | `keywords` | Renamed for clarity |
| `internalId` | Removed | Not needed |
| `source` | Removed | Not needed for public API |
| `quality` | Removed | Can be inferred or separate |

### 3. **Location Simplification**

```json
// v2.0
"location": {
  "locality": "București",
  "county": "Municipiul București",
  "countyCode": "B",
  "sirutaCode": "..."
}

// v3.0
"location": {
  "country_code": "RO",
  "county": "B",
  "city": "București"
}
```

### 4. **Visual Identity Flattening**

```json
// v2.0
"visualIdentity": {
  "colors": [...],
  "typography": [...]
}

// v3.0
"colors": [...],
"typography": {...}  // Single object, not array
```

### 5. **Assets Revolution** ⭐ MAJOR CHANGE

#### Current v2.0 Structure:
```json
"assets": {
  "logos": {
    "fullHorizontal": {
      "variants": {
        "color": "/logos/anaf/anaf.svg",
        "white": "/logos/anaf/anaf-white.svg"
      }
    }
  }
}
```

#### New v3.0 Structure:
```json
"assets": {
  "main": {
    "type": "horizontal",
    "color": "https://cdn.identity.ro/.../horizontal/color.svg",
    "dark_mode": "https://cdn.identity.ro/.../horizontal/dark-mode.svg",
    "white": "https://cdn.identity.ro/.../horizontal/white.svg",
    "black": "https://cdn.identity.ro/.../horizontal/black.svg"
  },
  "horizontal": {
    "color": "https://cdn.identity.ro/.../horizontal/color.svg",
    "white": "https://cdn.identity.ro/.../horizontal/white.svg",
    "black": "https://cdn.identity.ro/.../horizontal/black.svg"
  },
  "vertical": {...},
  "symbol": {...}
}
```

**Benefits:**
1. ✅ `main` shortcut - developers get the "standard" logo immediately
2. ✅ CDN URLs - ready for production CDN deployment
3. ✅ Flatter structure - easier to access
4. ✅ `dark_mode` variant - explicit support for dark themes
5. ✅ Eliminates `variants` nesting level

---

## Migration Strategy

### Option A: Big Bang Migration (NOT RECOMMENDED)
- Convert all files at once
- High risk, difficult to rollback
- Testing nightmare

### Option B: Parallel Schema Support (RECOMMENDED) ⭐
1. Create v3 types alongside v2
2. Add migration utilities
3. Support both formats temporarily
4. Gradually migrate files
5. Remove v2 support once complete

### Option C: Hybrid Approach
- Keep v2 for storage
- Transform to v3 on read
- Allows gradual frontend migration

---

## Recommended Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal:** Set up v3 schema without breaking v2

- [ ] Create `src/types/institution-v3.ts` with new schema
- [ ] Create migration utilities:
  - `convertV2toV3(v2: InstitutionV2): InstitutionV3`
  - `convertV3toV2(v3: InstitutionV3): InstitutionV2`
- [ ] Create validation schemas (Zod/Yup)
- [ ] Add tests for conversion functions
- [ ] Document CDN strategy (local vs prod URLs)

### Phase 2: Data Layer (Week 1-2)
**Goal:** Support reading both formats

- [ ] Update `helpers.ts`:
  - Add `isV3Schema(inst): boolean` detector
  - Wrap existing helpers with version detection
  - Add v3-specific helpers
- [ ] Update `generate-index.js`:
  - Detect schema version in each file
  - Convert v2 to v3 in-memory for index
  - Output v3 format in institutions-index.json
- [ ] Create migration script: `npm run migrate:v2-to-v3`

### Phase 3: Component Updates (Week 2)
**Goal:** Components work with v3 format

- [ ] Update `LogoCard.astro` to handle v3 assets
- [ ] Update `institution/[id].astro` detail page
- [ ] Update search/filter logic for keywords
- [ ] Test with mixed v2/v3 data

### Phase 4: Data Migration (Week 2-3)
**Goal:** Convert all institution files to v3

- [ ] Run automated migration on all JSON files
- [ ] Manual review of each file
- [ ] Update logo paths (local → CDN if needed)
- [ ] Add keywords based on existing tags
- [ ] Regenerate index

### Phase 5: Cleanup (Week 3)
**Goal:** Remove v2 support

- [ ] Remove v2 types and helpers
- [ ] Remove conversion utilities
- [ ] Update CONTRIBUTING.md with v3 schema
- [ ] Update AGENTS.md
- [ ] Archive v2 docs for reference

---

## Technical Decisions Needed

### 1. CDN Strategy

**Question:** Use real CDN URLs or relative paths?

**Options:**

**A) Local paths in dev, CDN in prod** (RECOMMENDED)
```json
"assets": {
  "main": {
    "color": "/logos/anaf/horizontal/color.svg"  // Dev
    // OR
    "color": "https://cdn.identity.ro/assets/ro/anaf/horizontal/color.svg"  // Prod
  }
}
```
- Pros: Works locally, CDN-ready
- Cons: Need build-time URL rewriting

**B) Always use CDN URLs**
```json
"assets": {
  "main": {
    "color": "https://cdn.identity.ro/assets/ro/anaf/horizontal/color.svg"
  }
}
```
- Pros: Simpler, explicit
- Cons: Doesn't work locally without CDN setup

**C) Hybrid: relative + absolute**
```json
"assets": {
  "main": {
    "path": "/logos/anaf/horizontal/color.svg",
    "cdn": "https://cdn.identity.ro/assets/ro/anaf/horizontal/color.svg"
  }
}
```
- Pros: Works everywhere
- Cons: More verbose, duplication

**Recommendation:** Option A with environment-based URL resolver

### 2. Backward Compatibility

**Question:** Support v2 files during transition?

**Recommendation:** YES
- Use schema version detector
- Auto-convert v2 to v3 on read
- Allows gradual migration
- Remove once all files migrated

### 3. Typography Structure

**Current v2:**
```json
"typography": [
  {
    "family": "Roboto",
    "role": "primary",
    "url": "..."
  }
]
```

**Proposed v3:**
```json
"typography": {
  "font": "Roboto",
  "url": "..."
}
```

**Question:** Single font or keep array?

**Options:**
- A) Single object (proposed) - simpler, most institutions use 1 font
- B) Keep array - more flexible, handles multi-font brands
- C) Hybrid: `primary` + `secondary?` objects

**Recommendation:** Option C (hybrid)
```json
"typography": {
  "primary": {
    "family": "Roboto",
    "url": "..."
  },
  "secondary": {
    "family": "Open Sans",
    "url": "..."
  }
}
```

### 4. Category Naming

**v2 categories (Romanian):**
- `guvern`, `minister`, `primarie`, `agentie`, etc.

**v3 categories (English - proposed):**
- `government`, `ministry`, `city_hall`, `agency`, etc.

**Question:** Keep Romanian or switch to English?

**Options:**
- A) Keep Romanian - consistency, no migration needed
- B) Switch to English - international standard
- C) Support both with mapping

**Recommendation:** Option A (keep Romanian)
- Schema internals can stay Romanian
- Labels already translated via CATEGORY_LABELS
- Avoid unnecessary complexity

---

## File Structure Changes

### New Directories

```
website/
├── src/
│   ├── types/
│   │   ├── institution.ts         # v2 (keep for now)
│   │   ├── institution-v3.ts      # New v3 schema
│   │   └── institution-common.ts  # Shared types
│   ├── lib/
│   │   ├── helpers.ts             # Updated with v3 support
│   │   ├── helpers-v3.ts          # v3-specific helpers
│   │   ├── migration.ts           # Conversion utilities
│   │   └── cdn.ts                 # CDN URL resolution
│   └── schemas/
│       ├── institution-v2.schema.ts  # Validation
│       └── institution-v3.schema.ts  # Validation
└── scripts/
    ├── generate-index.js          # Updated
    ├── migrate-v2-to-v3.js        # New migration script
    └── validate-schemas.js        # Schema validation
```

---

## Testing Strategy

### Unit Tests
- [ ] V2 to V3 conversion accuracy
- [ ] V3 to V2 conversion (if needed)
- [ ] Helper functions with both schemas
- [ ] CDN URL resolution

### Integration Tests
- [ ] Index generation with mixed schemas
- [ ] Component rendering with v3 data
- [ ] Search functionality with keywords
- [ ] Download links (CDN vs local)

### Manual Testing
- [ ] All pages render correctly
- [ ] Search works with new keywords
- [ ] Logo previews load
- [ ] Download buttons work
- [ ] Mobile responsiveness

---

## Rollback Plan

If migration fails:

1. **Immediate:** Keep v2 files as backup in `.backup/` folder
2. **Git:** Use feature branch, don't merge to main until verified
3. **Conversion:** v3 → v2 converter available
4. **Deployment:** Use Vercel preview deployments for testing

---

## Timeline Estimate

| Phase | Duration | Effort | Risk |
|-------|----------|--------|------|
| **Phase 1: Foundation** | 2-3 days | Medium | Low |
| **Phase 2: Data Layer** | 3-4 days | High | Medium |
| **Phase 3: Components** | 2-3 days | Medium | Medium |
| **Phase 4: Migration** | 3-5 days | Low | Low |
| **Phase 5: Cleanup** | 1-2 days | Low | Low |
| **Total** | ~2-3 weeks | - | - |

### Milestones

- **Week 1 End:** v3 schema defined, migration tools ready
- **Week 2 End:** All components support v3, 1-2 institutions migrated as proof of concept
- **Week 3 End:** All institutions migrated, v2 removed, documentation updated

---

## Risk Assessment

### High Risks
1. **Breaking changes in production** 
   - Mitigation: Use feature branch, preview deployments
2. **Data loss during migration**
   - Mitigation: Git backups, validation scripts
3. **CDN URL issues**
   - Mitigation: Start with local paths, CDN later

### Medium Risks
1. **Search performance with keywords**
   - Mitigation: Test with Fuse.js, optimize if needed
2. **Component rendering issues**
   - Mitigation: Comprehensive testing
3. **Incomplete migration**
   - Mitigation: Automated validation

### Low Risks
1. **Type errors**
   - Mitigation: TypeScript strict mode
2. **Documentation outdated**
   - Mitigation: Update docs as part of each phase

---

## Decision Matrix

Before starting implementation, these decisions need to be made:

| Decision | Options | Impact | Urgency |
|----------|---------|--------|---------|
| **CDN Strategy** | Local/Prod/Hybrid | High | High |
| **Category naming** | RO/EN/Both | Medium | Low |
| **Typography structure** | Single/Array/Hybrid | Low | Medium |
| **Backward compat** | Yes/No | High | High |
| **Migration approach** | Big Bang/Parallel/Hybrid | High | High |

**Recommended Decisions:**
1. ✅ CDN Strategy: **Local in dev, CDN in prod** (Option A)
2. ✅ Category naming: **Keep Romanian** (Option A)
3. ✅ Typography: **Hybrid with primary/secondary** (Option C)
4. ✅ Backward compat: **Yes, support both during transition**
5. ✅ Migration: **Parallel schema support** (Option B)

---

## Alternative: Simplified Approach

If full migration is too complex, consider a **simplified hybrid approach**:

### Keep v2 Internal, Add v3 API Layer

1. Keep all JSON files in v2 format
2. Add a transformation layer that converts v2 → v3 on demand
3. Expose v3 format through API/exports
4. Gradually add v3-specific features (keywords, main shortcut)

**Pros:**
- No file migration needed
- Lower risk
- Can add features incrementally

**Cons:**
- Performance overhead (transformation on every request)
- Complexity in codebase (two formats)
- Technical debt

**Best for:** Projects with many institutions, limited time

---

## Questions for Stakeholders

Before proceeding, clarify:

1. **Is CDN deployment planned?** If yes, when?
2. **How many institutions will be added in next 6 months?** (determines urgency)
3. **Is API access needed?** (affects URL structure decision)
4. **Budget for testing?** (determines thoroughness)
5. **Acceptable downtime?** (determines migration strategy)

---

## Next Steps

### Immediate Actions (After Approval)

1. **Review this document** with stakeholders
2. **Finalize technical decisions** (CDN, categories, etc.)
3. **Create feature branch**: `feature/schema-v3`
4. **Begin Phase 1**: Create v3 types
5. **Set up testing** infrastructure

### Success Criteria

✅ All institutions display correctly  
✅ Search works with new keywords  
✅ Downloads work (local or CDN)  
✅ No console errors  
✅ Performance maintained or improved  
✅ Documentation updated  
✅ Zero data loss  

---

## Conclusion

Schema v3.0 offers significant improvements:
- **Developer Experience:** `main` shortcut, flatter structure
- **Search:** Keywords for better discoverability
- **CDN-Ready:** Absolute URLs for production scaling
- **Maintainability:** Simpler structure, easier to understand

The recommended **parallel support approach** balances safety with progress, allowing gradual migration with full rollback capability.

**Estimated effort:** 2-3 weeks  
**Risk level:** Medium (with proper testing: Low)  
**Value delivered:** High

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-09  
**Author:** IdentitateRO Development Team
