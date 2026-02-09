# Cum să publici pachetul @identitate-ro/logos pe npm

## Problema: npm necesită 2FA pentru publicare

Ai primit eroarea:
```
403 Forbidden - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

## Soluție: Creează un Token Granular cu bypass 2FA

### Pași:

1. **Mergi la pagina de tokens npm**:
   ```
   https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   ```

2. **Click pe "Generate New Token"**

3. **Alege "Granular Access Token"**

4. **Configurează tokenul**:
   - **Token name**: `identitate-ro-publish`
   - **Expiration**: 90 days (maximum)
   - **Select Packages**:
     - Click "Select packages and scopes"
     - Select: "All packages" SAU specifică `@identitate-ro/logos`
   - **Permissions**:
     - Select: **"Read and write"**
   - **IP Allowlist**: Leave empty (optional)
   - **Organizations**: Leave as "No organization" (unless needed)

5. **IMPORTANT**: În secțiunea **"Additional Options"**:
   - ✅ **BIFEAZĂ**: "Bypass 2FA requirement for automation"
   - Aceasta permite publicarea fără 2FA

6. **Click "Generate Token"**

7. **Copiază tokenul** (arată ca: `npm_xxxxxxxxxxxxx...`)

### După ce ai tokenul:

#### Opțiunea 1: Folosește .npmrc (Recomandat pentru local)

```bash
cd packages/logos

# Șterge .npmrc vechi
rm .npmrc

# Creează .npmrc nou cu tokenul
cat > .npmrc << 'EOF'
//registry.npmjs.org/:_authToken=TOKENUL_TAU_AICI
EOF

# Publică
npm publish --access public
```

#### Opțiunea 2: Setează variabila de mediu (Recomandat pentru CI/CD)

```bash
cd packages/logos

# Setează token
export NPM_TOKEN="TOKENUL_TAU_AICI"

# Publică
npm publish --access public
```

#### Opțiunea 3: Folosește npm login + OTP (dacă ai 2FA activat)

```bash
cd packages/logos

# Login
npm login

# Publică cu OTP code din app 2FA
npm publish --access public --otp=123456
```

## Verificare după publicare

```bash
# Verifică că pachetul e publicat
npm view @identitate-ro/logos

# Testează instalarea
npm install @identitate-ro/logos

# Verifică CDN URLs
curl https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.0.0/logos/anaf/anaf.svg
```

## Note de securitate

⚠️ **NU commit-ui .npmrc cu tokenul în Git!**

Fișierul `.gitignore` din `packages/logos/` deja conține:
```
.npmrc
```

## Troubleshooting

### "403 Forbidden" după ce ai setat tokenul

- Verifică că tokenul are permisiunea "Read and write"
- Verifică că ai bifat "Bypass 2FA requirement for automation"
- Tokenul trebuie să fie valid (nu expirat)

### "Package name too similar"

- Verifică că numele `@identitate-ro/logos` e disponibil
- Poate fi nevoie să schimbi scope-ul dacă `@identitate-ro` e luat

### "Invalid token"

- Tokenul a expirat (max 90 zile pentru granular tokens)
- Creează un token nou

## Alternative: Dezactivează 2FA temporar (NU recomandat)

Dacă nu vrei să folosești token granular, poți dezactiva 2FA temporar:

```bash
npm profile disable-2fa
npm publish --access public
npm profile enable-2fa auth-and-writes
```

**Nu este recomandat** pentru securitate.
