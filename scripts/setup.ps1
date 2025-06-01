# Rocketoo CLI - Setup Script (Windows PowerShell)
# Tento script připraví Git repository pro vývoj a distribuci

$ErrorActionPreference = "Stop"

Write-Host "🚀 Rocketoo CLI - Nastavení Git Repository" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Kontrola Node.js
try {
    $nodeVersion = (node -v).Substring(1)
    $requiredVersion = [Version]"16.0.0"
    $currentVersion = [Version]$nodeVersion
    
    if ($currentVersion -lt $requiredVersion) {
        Write-Host "❌ Node.js $nodeVersion je příliš starý. Požadována verze 16.0.0+." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Node.js $nodeVersion je v pořádku" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js není nainstalován. Nainstalujte Node.js 16+ a zkuste znovu." -ForegroundColor Red
    exit 1
}

# Kontrola Git
try {
    git --version | Out-Null
    Write-Host "✅ Git je k dispozici" -ForegroundColor Green
}
catch {
    Write-Host "❌ Git není nainstalován." -ForegroundColor Red
    exit 1
}

# Inicializace Git repository (pokud ještě není)
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializuji Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
    
    # Kontrola Git konfigurace
    try {
        $userName = git config user.name
        if (-not $userName) {
            throw "No user name"
        }
    }
    catch {
        Write-Host "⚙️  Nastavte si Git konfiguraci:" -ForegroundColor Yellow
        Write-Host "   git config user.name 'Vaše Jméno'" -ForegroundColor Gray
        Write-Host "   git config user.email 'vas@email.cz'" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ Git repository již existuje" -ForegroundColor Green
}

# Instalace závislostí
Write-Host "📦 Instaluji NPM závislosti..." -ForegroundColor Yellow
npm install

# Vytvoření symbolického odkazu pro vývoj
Write-Host "🔗 Vytvářím symbolický odkaz..." -ForegroundColor Yellow
npm link

# Test instalace
Write-Host "🧪 Testuji CLI..." -ForegroundColor Yellow
try {
    $version = rocketoo --version
    Write-Host "✅ CLI je funkční: $version" -ForegroundColor Green
}
catch {
    Write-Host "❌ CLI nefunguje správně" -ForegroundColor Red
    exit 1
}

# Kontrola remote origin
try {
    git remote get-url origin | Out-Null
}
catch {
    Write-Host ""
    Write-Host "⚙️  Nastavte si remote origin:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/USERNAME/rocketoo-cli.git" -ForegroundColor Gray
}

# Vytvoření prvního commitu (pokud není)
try {
    git log --oneline -1 | Out-Null
}
catch {
    Write-Host "📝 Vytvářím první commit..." -ForegroundColor Yellow
    git add .
    git commit -m "feat: initial commit - Rocketoo CLI v1.0.0

- CLI nástroj pro správu šablon Rocketoo e-shopů
- Příkazy: theme push, theme publish, auth login
- Validace a bezpečnostní kontroly
- NPM balíček s binárními buildy"
}

Write-Host ""
Write-Host "🎉 Setup dokončen!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Další kroky:" -ForegroundColor Yellow
Write-Host "   1. Nastavte remote origin: git remote add origin https://github.com/USERNAME/rocketoo-cli.git" -ForegroundColor Gray
Write-Host "   2. Pushněte na GitHub: git push -u origin main" -ForegroundColor Gray
Write-Host "   3. Nastavte NPM registry pro publikování" -ForegroundColor Gray
Write-Host "   4. Vytvořte GitHub Actions secrets (NPM_TOKEN)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Vývojářské příkazy:" -ForegroundColor Yellow
Write-Host "   npm test           - Spustit testy" -ForegroundColor Gray
Write-Host "   npm run build      - Build binárních souborů" -ForegroundColor Gray
Write-Host "   rocketoo --help    - Test CLI" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Dokumentace: ./README.md" -ForegroundColor Gray
Write-Host "🤝 Přispívání: ./CONTRIBUTING.md" -ForegroundColor Gray 