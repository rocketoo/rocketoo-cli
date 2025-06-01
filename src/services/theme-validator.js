const fs = require('fs-extra');
const path = require('path');
const yaml = require('yaml');

class ThemeValidator {
  constructor() {
    this.allowedExtensions = [
      'htm', 'html', 'css', 'js', 'json', 'yaml', 'yml',
      'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp',
      'woff', 'woff2', 'ttf', 'eot', 'md', 'txt'
    ];

    this.requiredDirectories = ['layouts', 'pages'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.maxTotalSize = 50 * 1024 * 1024; // 50MB

    this.dangerousPatterns = [
      /<\?php/i,
      /\beval\s*\(/i,
      /\bexec\s*\(/i,
      /\bsystem\s*\(/i,
      /\bshell_exec\s*\(/i,
      /\bpassthru\s*\(/i,
      /\bproc_open\s*\(/i,
      /\bpopen\s*\(/i,
      /<script[^>]*src\s*=\s*["'][^"']*(?:\.php|\.asp|\.jsp)/i,
      /document\.write\s*\(/i,
      /innerHTML\s*=/i,
      /\bsetTimeout\s*\(\s*["'][^"']*["']/i,
      /\bsetInterval\s*\(\s*["'][^"']*["']/i
    ];
  }

  /**
   * Validuje šablonu
   */
  async validate(themePath) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      // 1. Kontrola existence adresáře
      if (!await fs.pathExists(themePath)) {
        result.errors.push('Adresář šablony neexistuje');
        result.valid = false;
        return result;
      }

      // 2. Kontrola theme.yaml
      const themeConfigPath = path.join(themePath, 'theme.yaml');
      if (!await fs.pathExists(themeConfigPath)) {
        result.errors.push('Soubor theme.yaml je povinný');
        result.valid = false;
      } else {
        await this.validateThemeConfig(themeConfigPath, result);
      }

      // 3. Kontrola struktury adresářů
      await this.validateDirectoryStructure(themePath, result);

      // 4. Kontrola souborů
      await this.validateFiles(themePath, result);

      // 5. Kontrola velikosti
      await this.validateSize(themePath, result);

    } catch (error) {
      result.errors.push(`Chyba při validaci: ${error.message}`);
      result.valid = false;
    }

    return result;
  }

  /**
   * Validuje theme.yaml konfiguraci
   */
  async validateThemeConfig(configPath, result) {
    try {
      const content = await fs.readFile(configPath, 'utf8');
      const config = yaml.parse(content);

      if (!config.name) {
        result.errors.push('theme.yaml musí obsahovat název (name)');
        result.valid = false;
      }

      if (!config.version) {
        result.warnings.push('theme.yaml neobsahuje verzi (version)');
      } else if (!this.isValidVersion(config.version)) {
        result.warnings.push('Verze není ve formátu semantic versioning (např. 1.0.0)');
      }

      if (!config.description) {
        result.warnings.push('theme.yaml neobsahuje popis (description)');
      }

    } catch (error) {
      result.errors.push('theme.yaml obsahuje neplatný YAML: ' + error.message);
      result.valid = false;
    }
  }

  /**
   * Validuje strukturu adresářů
   */
  async validateDirectoryStructure(themePath, result) {
    for (const dir of this.requiredDirectories) {
      const dirPath = path.join(themePath, dir);
      if (!await fs.pathExists(dirPath)) {
        result.errors.push(`Povinný adresář '${dir}' neexistuje`);
        result.valid = false;
      } else if (!(await fs.stat(dirPath)).isDirectory()) {
        result.errors.push(`'${dir}' musí být adresář`);
        result.valid = false;
      }
    }

    // Kontrola, zda layouts obsahuje nějaké soubory
    const layoutsPath = path.join(themePath, 'layouts');
    if (await fs.pathExists(layoutsPath)) {
      const layoutFiles = await fs.readdir(layoutsPath);
      const htmFiles = layoutFiles.filter(f => f.endsWith('.htm'));
      if (htmFiles.length === 0) {
        result.errors.push('Adresář layouts musí obsahovat alespoň jeden .htm soubor');
        result.valid = false;
      }
    }
  }

  /**
   * Validuje všechny soubory v šabloně
   */
  async validateFiles(themePath, result) {
    const files = await this.getAllFiles(themePath);
    
    for (const file of files) {
      const relativePath = path.relative(themePath, file);
      const ext = path.extname(file).slice(1).toLowerCase();
      
      // Kontrola přípony
      if (!this.allowedExtensions.includes(ext)) {
        result.errors.push(`Nepovolená přípona souboru: ${relativePath}`);
        result.valid = false;
        continue;
      }

      // Kontrola velikosti souboru
      const stat = await fs.stat(file);
      if (stat.size > this.maxFileSize) {
        result.errors.push(`Soubor je příliš velký (max 5MB): ${relativePath}`);
        result.valid = false;
        continue;
      }

      // Kontrola nebezpečného obsahu pro textové soubory
      if (this.isTextFile(ext)) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const dangerous = this.findDangerousContent(content);
          if (dangerous.length > 0) {
            result.errors.push(`Nebezpečný obsah v ${relativePath}: ${dangerous.join(', ')}`);
            result.valid = false;
          }
        } catch (error) {
          // Možná binární soubor, přeskočit
        }
      }
    }
  }

  /**
   * Validuje celkovou velikost šablony
   */
  async validateSize(themePath, result) {
    const files = await this.getAllFiles(themePath);
    let totalSize = 0;

    for (const file of files) {
      const stat = await fs.stat(file);
      totalSize += stat.size;
    }

    if (totalSize > this.maxTotalSize) {
      result.errors.push(`Celková velikost šablony je příliš velká (max 50MB): ${Math.round(totalSize / 1024 / 1024)}MB`);
      result.valid = false;
    }
  }

  /**
   * Získá všechny soubory v adresáři rekurzivně
   */
  async getAllFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Kontroluje, zda je soubor textový
   */
  isTextFile(ext) {
    const textExtensions = ['htm', 'html', 'css', 'js', 'json', 'yaml', 'yml', 'md', 'txt'];
    return textExtensions.includes(ext);
  }

  /**
   * Hledá nebezpečný obsah v textu
   */
  findDangerousContent(content) {
    const found = [];
    
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(content)) {
        found.push(pattern.source);
      }
    }

    return found;
  }

  /**
   * Kontroluje, zda je verze validní (semantic versioning)
   */
  isValidVersion(version) {
    return /^\d+\.\d+\.\d+/.test(version);
  }
}

module.exports = ThemeValidator; 