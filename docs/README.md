# Dokumentace Rocketoo CLI

Tato složka obsahuje dokumentaci a webové stránky pro Rocketoo CLI.

## Soubory

### `cli-homepage.html`
Kompletní HTML stránka pro https://rocketoo.cz/cli obsahující:

- **Moderní responzivní design** s gradientním pozadím
- **Kompletní dokumentaci** všech CLI příkazů
- **Interaktivní prvky** - kopírování kódu, smooth scroll
- **SEO optimalizace** s Open Graph tags
- **Mobilní podporu** s responzivním designem

## Nasazení

### Na Rocketoo.cz
1. Nahrajte `cli-homepage.html` na server
2. Nastavte ho jako `/cli/index.html`
3. Ověřte, že stránka je dostupná na https://rocketoo.cz/cli

### Lokální náhled
```bash
# Otevření v prohlížeči
open docs/cli-homepage.html

# Nebo spuštění lokálního serveru
cd docs
python -m http.server 8000
# Pak otevřete http://localhost:8000/cli-homepage.html
```

## Obsah stránky

### Sekce
1. **Hero sekce** - Úvod s instalačním příkazem
2. **Instalace** - Požadavky a kroky instalace
3. **Konfigurace** - Nastavení CLI a API
4. **Příkazy** - Kompletní přehled všech příkazů
5. **Příklady** - Praktické příklady použití
6. **API** - Dokumentace server-side API
7. **Troubleshooting** - Řešení častých problémů
8. **Podpora** - Odkazy na komunitu a podporu

### Funkce
- ✅ Kopírování kódu jedním kliknutím
- ✅ Smooth scroll navigace
- ✅ Responzivní design pro mobily
- ✅ Moderní glassmorphism efekty
- ✅ Optimalizované pro SEO
- ✅ Přístupnost (accessibility)

## Aktualizace

Při změnách v CLI aktualizujte:
1. Verze a nové příkazy v tabulkách
2. Příklady použití
3. API endpointy
4. Troubleshooting sekci

## Design systém

### Barvy
- **Primární**: `#667eea` (modrá)
- **Sekundární**: `#764ba2` (fialová) 
- **Accent**: `#48bb78` (zelená pro success)
- **Gradient**: Linear od modré k fialové

### Typography
- **Nadpisy**: Segoe UI, sans-serif
- **Kód**: Courier New, monospace
- **Tělo**: Segoe UI s line-height 1.6 