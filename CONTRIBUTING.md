# Přispívání do Rocketoo CLI

Děkujeme za váš zájem o přispívání do Rocketoo CLI! Tento dokument vás provede procesem přispívání.

## 🚀 Rychlý start

### Požadavky
- Node.js 16.0.0 nebo vyšší
- NPM nebo Yarn
- Git

### Nastavení vývojového prostředí

1. **Forknete repository**
   ```bash
   # Klikněte na "Fork" na GitHubu
   ```

2. **Klonujte svůj fork**
   ```bash
   git clone https://github.com/VAS_USERNAME/rocketoo-cli.git
   cd rocketoo-cli
   ```

3. **Nainstalujte závislosti**
   ```bash
   npm install
   ```

4. **Vytvořte symbolický odkaz**
   ```bash
   npm link
   ```

5. **Testujte instalaci**
   ```bash
   rocketoo --version
   rocketoo --help
   ```

## 🔧 Vývojový workflow

### Větve
- `main` - stabilní verze
- `develop` - vývojová větev
- `feature/nazev-funkce` - nové funkce
- `bugfix/nazev-chyby` - opravy chyb
- `hotfix/nazev-hotfixu` - kritické opravy

### Vytvoření nové funkce

1. **Vytvořte novou větev**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nova-funkce
   ```

2. **Proveďte změny**
   ```bash
   # Editujte soubory
   npm test  # Spusťte testy
   ```

3. **Commitněte změny**
   ```bash
   git add .
   git commit -m "feat: přidání nové funkce"
   ```

4. **Pushněte větev**
   ```bash
   git push origin feature/nova-funkce
   ```

5. **Vytvořte Pull Request**

## 📝 Konvence commitů

Používáme [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - nová funkce
- `fix:` - oprava chyby
- `docs:` - dokumentace
- `style:` - formátování
- `refactor:` - refaktoring
- `test:` - testy
- `chore:` - údržba

Příklady:
```
feat: přidání validace šablon
fix: oprava nahrávání velkých souborů
docs: aktualizace README
```

## 🧪 Testování

### Spuštění testů
```bash
npm test                # Všechny testy
npm run test:unit       # Unit testy
npm run test:integration # Integrační testy
```

### Lokální testování CLI
```bash
# Testovací šablona
mkdir test-theme
cd test-theme
echo "name: test" > theme.yaml
mkdir -p layouts pages
echo "<html>test</html>" > layouts/default.htm
echo "<h1>Home</h1>" > pages/home.htm

# Test validace
rocketoo theme validate .

# Test komprese
rocketoo theme push . --validate-only
```

## 📚 Struktura projektu

```
rocketoo-cli/
├── bin/                # CLI entry point
├── src/
│   ├── commands/       # CLI příkazy
│   ├── services/       # Business logika
│   └── utils/          # Pomocné funkce
├── tests/              # Testy
├── docs/               # Dokumentace
└── examples/           # Příklady šablon
```

## 🎯 Jak přispět

### 🐛 Hlášení chyb
1. Zkontrolujte [existující issues](https://github.com/rocketoo/cli/issues)
2. Vytvořte nový issue s:
   - Popis problému
   - Kroky k reprodukci
   - Očekávané vs skutečné chování
   - Prostředí (OS, Node.js verze)

### 💡 Návrhy funkcí
1. Otevřete issue s tagem "enhancement"
2. Popište funkci a její použití
3. Diskutujte s maintainery

### 🔧 Kód
1. Forknete repository
2. Vytvořte feature branch
3. Implementujte změny
4. Přidejte testy
5. Aktualizujte dokumentaci
6. Vytvořte Pull Request

## ✅ Checklist pro Pull Request

- [ ] Kód dodržuje coding standards
- [ ] Přidány/aktualizovány testy
- [ ] Všechny testy prochází
- [ ] Dokumentace je aktualizována
- [ ] Commit zprávy dodržují konvence
- [ ] PR popis vysvětluje změny

## 🔍 Code Review

Všechny PR procházejí code review:
- Automatické kontroly (testy, linting)
- Review od maintainerů
- Diskuse a úpravy
- Merge po schválení

## 📦 Release proces

1. Aktualizace verze v `package.json`
2. Aktualizace `CHANGELOG.md`
3. Vytvoření tagu `v1.2.3`
4. GitHub Actions spustí:
   - Testy
   - Build binárních souborů
   - Publikace na NPM
   - GitHub Release

## 🤝 Komunita

- 💬 [Diskuse na GitHubu](https://github.com/rocketoo/cli/discussions)
- 📧 Email: dev@rocketoo.cz
- 🐛 [Issues](https://github.com/rocketoo/cli/issues)

## 📄 Licence

Přispíváním souhlasíte s licencí MIT tohoto projektu. 