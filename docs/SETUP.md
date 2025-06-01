# Nastavení Git Repository pro Rocketoo CLI

Kompletní průvodce pro přípravu Git repository, distribuci a publikování Rocketoo CLI.

## 🚀 Rychlé nastavení

### Automatické nastavení

**Linux/macOS:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\setup.ps1
```

### Manuální nastavení

1. **Kontrola požadavků**
   ```bash
   node --version  # 16.0.0+
   git --version
   npm --version
   ```

2. **Inicializace Git repository**
   ```bash
   git init
   git branch -M main
   ```

3. **Konfigurace Git**
   ```bash
   git config user.name "Vaše Jméno"
   git config user.email "vas@email.cz"
   ```

4. **Instalace závislostí**
   ```bash
   npm install
   npm link  # Pro lokální vývoj
   ```

## 📦 Distribuce na GitHub

### 1. Vytvoření GitHub repository

1. Jděte na [GitHub](https://github.com/new)
2. Vytvořte repository `rocketoo-cli`
3. **Nezaškrtávejte** "Initialize with README"

### 2. Přidání remote origin

```bash
git remote add origin https://github.com/USERNAME/rocketoo-cli.git
```

### 3. První push

```bash
git add .
git commit -m "feat: initial commit - Rocketoo CLI v1.0.0"
git push -u origin main
```

### 4. Nastavení GitHub Actions

V GitHub repository → Settings → Secrets and variables → Actions:

**Secrets:**
- `NPM_TOKEN` - NPM access token pro publikování

**Variables:**
- `REGISTRY_URL` - `https://registry.npmjs.org` (výchozí)

## 📦 NPM publikování

### 1. Registrace na NPM

```bash
npm adduser
# nebo
npm login
```

### 2. Ověření konfigurace

```bash
npm whoami
npm config get registry
```

### 3. Testovací publikování

```bash
# Dry run - pouze test
npm publish --dry-run

# Skutečné publikování
npm publish --access public
```

### 4. Automatické publikování

Při vytvoření tagu se automaticky spustí GitHub Actions:

```bash
# Aktualizace verze
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0

# Push s tagem
git push origin main --tags
```

## 🔧 Vývojové prostředí

### Struktura větví

```
main         ← Stabilní verze (protected)
├── develop  ← Vývojová větev
├── feature/ ← Nové funkce
├── bugfix/  ← Opravy chyb
└── hotfix/  ← Kritické opravy
```

### Git Flow workflow

```bash
# Nová funkce
git checkout develop
git checkout -b feature/nova-funkce
# ... vývoj ...
git commit -m "feat: nová funkce"
git push origin feature/nova-funkce
# → Pull Request do develop

# Release
git checkout develop
git checkout -b release/1.1.0
# ... finální úpravy ...
git checkout main
git merge release/1.1.0
git tag v1.1.0
git push origin main --tags
```

### Lokální vývoj

```bash
# Symbolický odkaz pro testování
npm link

# Test CLI
rocketoo --version
rocketoo --help

# Test s ukázkovou šablonou
mkdir test-theme
cd test-theme
echo "name: test" > theme.yaml
mkdir -p layouts pages
echo "<html>test</html>" > layouts/default.htm
echo "<h1>Home</h1>" > pages/home.htm

rocketoo theme validate .
rocketoo theme push . --validate-only
```

## 🔒 Nastavení ochrany

### GitHub Branch Protection

Settings → Branches → Add rule pro `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Restrict pushes that create files larger than 100MB

### NPM 2FA

```bash
npm profile enable-2fa auth-and-writes
```

## 📊 Monitoring a Analytics

### NPM statistiky

```bash
npm view @rocketoo/cli
npm view @rocketoo/cli downloads
```

### GitHub Insights

- Repository → Insights → Traffic
- Repository → Insights → Community

## 🚨 Bezpečnost

### Audit závislostí

```bash
npm audit
npm audit fix
```

### Bezpečnostní skenování

GitHub automaticky skenuje:
- Dependabot alerts
- Security advisories
- Code scanning (CodeQL)

### Secrets management

**Nikdy necommitujte:**
- API klíče
- Tokeny
- Hesla
- Privátní klíče

Použijte:
- `.env` soubory (v `.gitignore`)
- GitHub Secrets
- Environment variables

## 📋 Checklist před publikováním

### Kód
- [ ] Všechny testy prochází
- [ ] Linting bez chyb
- [ ] Dokumentace aktualizována
- [ ] CHANGELOG.md aktualizován
- [ ] Verze v package.json zvýšena

### Bezpečnost
- [ ] npm audit clean
- [ ] Žádné sensitive data v kódu
- [ ] Dependencies aktualizovány

### Distribuce
- [ ] README.md kompletní
- [ ] LICENSE přítomna
- [ ] package.json správně nakonfigurován
- [ ] GitHub Actions funkční

### Test
- [ ] CLI lze nainstalovat: `npm install -g @rocketoo/cli`
- [ ] Základní příkazy fungují
- [ ] Dokumentace odpovídá funkcionalitě

## 🆘 Řešení problémů

### "Permission denied" při npm publish

```bash
npm login
npm whoami  # Ověř přihlášení
```

### GitHub Actions selhávají

1. Zkontroluj GitHub Secrets
2. Ověř npm token platnost
3. Zkontroluj Node.js verzi v workflow

### CLI nefunguje po instalaci

```bash
# Kontrola globální instalace
npm list -g @rocketoo/cli

# Reinstalace
npm uninstall -g @rocketoo/cli
npm install -g @rocketoo/cli

# Kontrola PATH
echo $PATH
which rocketoo
```

### Build selhává

```bash
# Vyčištění cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Kontrola pkg konfigurace
npm run build -- --debug
```

## 📞 Podpora

- 📧 **Email:** dev@rocketoo.cz
- 💬 **GitHub Discussions:** [github.com/rocketoo/cli/discussions](https://github.com/rocketoo/cli/discussions)
- 🐛 **Issues:** [github.com/rocketoo/cli/issues](https://github.com/rocketoo/cli/issues)
- 📚 **Dokumentace:** [rocketoo.cz/docs/cli](https://rocketoo.cz/docs/cli) 