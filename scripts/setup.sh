#!/bin/bash

# Rocketoo CLI - Setup Script
# Tento script připraví Git repository pro vývoj a distribuci

set -e

echo "🚀 Rocketoo CLI - Nastavení Git Repository"
echo "=========================================="

# Kontrola Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js není nainstalován. Nainstalujte Node.js 16+ a zkuste znovu."
    exit 1
fi

NODE_VERSION=$(node -v | cut -c2-)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js $NODE_VERSION je příliš starý. Požadována verze $REQUIRED_VERSION+."
    exit 1
fi

echo "✅ Node.js $NODE_VERSION je v pořádku"

# Kontrola Git
if ! command -v git &> /dev/null; then
    echo "❌ Git není nainstalován."
    exit 1
fi

echo "✅ Git je k dispozici"

# Inicializace Git repository (pokud ještě není)
if [ ! -d ".git" ]; then
    echo "📦 Inicializuji Git repository..."
    git init
    git branch -M main
    
    # Výchozí autor (lze změnit později)
    if [ -z "$(git config user.name)" ]; then
        echo "⚙️  Nastavte si Git konfiguraci:"
        echo "   git config user.name 'Vaše Jméno'"
        echo "   git config user.email 'vas@email.cz'"
    fi
else
    echo "✅ Git repository již existuje"
fi

# Instalace závislostí
echo "📦 Instaluji NPM závislosti..."
npm install

# Vytvoření symbolického odkazu pro vývoj
echo "🔗 Vytvářím symbolický odkaz..."
npm link

# Test instalace
echo "🧪 Testuji CLI..."
if rocketoo --version &> /dev/null; then
    echo "✅ CLI je funkční: $(rocketoo --version)"
else
    echo "❌ CLI nefunguje správně"
    exit 1
fi

# Přidání remote origin (pokud není)
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "⚙️  Nastavte si remote origin:"
    echo "   git remote add origin https://github.com/USERNAME/rocketoo-cli.git"
fi

# Vytvoření prvního commitu (pokud není)
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    echo "📝 Vytvářím první commit..."
    git add .
    git commit -m "feat: initial commit - Rocketoo CLI v1.0.0

- CLI nástroj pro správu šablon Rocketoo e-shopů
- Příkazy: theme push, theme publish, auth login
- Validace a bezpečnostní kontroly
- NPM balíček s binárními buildy"
fi

echo ""
echo "🎉 Setup dokončen!"
echo ""
echo "📋 Další kroky:"
echo "   1. Nastavte remote origin: git remote add origin https://github.com/USERNAME/rocketoo-cli.git"
echo "   2. Pushněte na GitHub: git push -u origin main"
echo "   3. Nastavte NPM registry pro publikování"
echo "   4. Vytvořte GitHub Actions secrets (NPM_TOKEN)"
echo ""
echo "🔧 Vývojářské příkazy:"
echo "   npm test           - Spustit testy"
echo "   npm run build      - Build binárních souborů"
echo "   rocketoo --help    - Test CLI"
echo ""
echo "📚 Dokumentace: ./README.md"
echo "🤝 Přispívání: ./CONTRIBUTING.md" 