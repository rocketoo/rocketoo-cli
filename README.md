# Rocketoo CLI

Oficiální CLI nástroj pro správu šablon Rocketoo e-shopů.

## 🚀 Instalace

### NPM (doporučeno)
```bash
npm install -g @rocketoo/cli
```

### Yarn
```bash
yarn global add @rocketoo/cli
```

### Stažení binárního souboru
Stáhněte si zkompilovaný binární soubor z [releases](https://github.com/rocketoo/cli/releases).

## 📋 Požadavky

- Node.js 16.0.0 nebo vyšší
- NPM nebo Yarn
- Rocketoo e-shop s aktivním CLI modulem

## 🔐 Přihlášení

Před použitím se musíte přihlásit ke svému Rocketoo e-shopu:

```bash
rocketoo auth login
```

CLI se vás zeptá na:
- **URL vašeho e-shopu** (např. `https://vas-eshop.rocketoo.cz`)
- **API klíč** (získáte v administraci → Integrace → CLI)

## 🎨 Práce se šablonami

### Nahrání šablony na server

```bash
# Základní nahrání
rocketoo theme push my-theme

# S popisem
rocketoo theme push my-theme --description "Nová verze šablony"

# Vynucené nahrání (přeskočí chyby validace)
rocketoo theme push my-theme --force

# Pouze validace bez nahrání
rocketoo theme push my-theme --validate-only
```

### Aktivace šablony

```bash
# Aktivuje nejnovější verzi
rocketoo theme publish my-theme

# Aktivuje konkrétní verzi
rocketoo theme publish my-theme --version 1.2.0

# Bez potvrzovacího dotazu
rocketoo theme publish my-theme --yes
```

### Seznam šablon

```bash
# Seznam vašich šablon
rocketoo theme list

# Zkrácený alias
rocketoo theme ls
```

### Aktuální aktivní šablona

```bash
rocketoo theme current
```

### Verze šablony

```bash
rocketoo theme versions my-theme
```

### Validace šablony

```bash
# Validuje šablonu lokálně
rocketoo theme validate my-theme
```

## ⚙️ Konfigurace

### Zobrazení konfigurace

```bash
# Celá konfigurace
rocketoo config get

# Konkrétní hodnota
rocketoo config get api_url
```

### Nastavení hodnoty

```bash
rocketoo config set api_url https://novy-eshop.rocketoo.cz
```

### Smazání hodnoty

```bash
rocketoo config delete api_key
```

## 📁 Struktura šablony

Šablona musí obsahovat následující strukturu:

```
my-theme/
├── theme.yaml          # Metadata šablony (povinné)
├── layouts/            # Layout soubory (povinné)
│   ├── default.htm
│   └── ...
├── pages/              # Stránky (povinné)
│   ├── home.htm
│   └── ...
├── partials/           # Částečné šablony (volitelné)
│   └── ...
├── assets/             # CSS, JS, obrázky (volitelné)
│   ├── css/
│   ├── js/
│   └── images/
└── lang/               # Jazykové soubory (volitelné)
    └── ...
```

### theme.yaml

```yaml
name: "Název šablony"
description: "Popis šablony"
author: "Autor"
version: "1.0.0"
homepage: "https://example.com"
```

## 🔒 Bezpečnost

CLI automaticky validuje šablony a kontroluje:

- ✅ **Povolené přípony souborů**: htm, html, css, js, json, yaml, yml, png, jpg, jpeg, gif, svg, webp, woff, woff2, ttf, eot, md, txt
- ❌ **Nebezpečný obsah**: PHP kód, eval(), system() funkce, atd.
- 📏 **Velikost souborů**: Max 5MB na soubor, 50MB celkem
- 📂 **Struktura**: Povinné adresáře layouts/ a pages/

## 🛠️ Pokročilé použití

### Debug režim

```bash
rocketoo --debug theme push my-theme
```

### Vlastní konfigurační soubor

```bash
rocketoo --config /path/to/config.json theme push my-theme
```

### Bez barev

```bash
rocketoo --no-color theme list
```

## 🔍 Hledání šablon

CLI hledá šablony v tomto pořadí:

1. Přesná cesta (pokud obsahuje `/` nebo `\`)
2. Aktuální adresář
3. `themes/` adresář v aktuálním adresáři

Příklady:
```bash
rocketoo theme push ./my-theme        # Relativní cesta
rocketoo theme push /path/to/theme    # Absolutní cesta  
rocketoo theme push my-theme          # Hledá v themes/my-theme
```

## 📄 Příkazy

### Autentifikace
- `rocketoo auth login` - Přihlášení
- `rocketoo auth logout` - Odhlášení  
- `rocketoo auth status` - Stav přihlášení

### Šablony
- `rocketoo theme push <theme>` - Nahrání šablony
- `rocketoo theme publish <theme>` - Aktivace šablony
- `rocketoo theme list` - Seznam šablon
- `rocketoo theme current` - Aktivní šablona
- `rocketoo theme versions <theme>` - Verze šablony
- `rocketoo theme validate <theme>` - Validace šablony

### Konfigurace
- `rocketoo config get [key]` - Zobrazení konfigurace
- `rocketoo config set <key> <value>` - Nastavení hodnoty
- `rocketoo config delete <key>` - Smazání hodnoty
- `rocketoo config clear` - Vymazání konfigurace

### Obecné
- `rocketoo --version` - Verze CLI
- `rocketoo --help` - Nápověda

## 🐛 Řešení problémů

### "Neplatný API klíč"
- Zkontrolujte API klíč v administraci
- Ujistěte se, že máte oprávnění k CLI
- Ověřte URL serveru

### "Šablona nebyla nalezena"
- Zkontrolujte cestu k šabloně
- Ujistěte se, že existuje theme.yaml
- Použijte `rocketoo theme validate` pro kontrolu

### "Spojení s API selhalo"  
- Zkontrolujte internetové připojení
- Ověřte URL serveru pomocí `rocketoo auth status`
- Zkontrolujte, zda server běží

## 📞 Podpora

- 📚 [Dokumentace](https://rocketoomax.cz/cli)
- 📧 [Podpora](mailto:podpora@rocketoo.cz)
- 🐛 [Hlášení chyb](https://github.com/rocketoo/cli/issues)

## 📄 Licence

MIT License - viz [LICENSE](LICENSE) soubor. 