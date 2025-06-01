const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.rocketoo');
    this.configFile = path.join(this.configDir, 'config.json');
    this.config = this.load();
  }

  /**
   * Načte konfiguraci ze souboru
   */
  load() {
    try {
      if (fs.existsSync(this.configFile)) {
        return fs.readJsonSync(this.configFile);
      }
    } catch (error) {
      // Ignoruj chyby čtení - použije se výchozí konfigurace
    }
    
    return {};
  }

  /**
   * Uloží konfiguraci do souboru
   */
  save() {
    try {
      fs.ensureDirSync(this.configDir);
      fs.writeJsonSync(this.configFile, this.config, { spaces: 2 });
      return true;
    } catch (error) {
      console.error('Chyba při ukládání konfigurace:', error.message);
      return false;
    }
  }

  /**
   * Získá hodnotu konfigurace
   */
  get(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * Nastaví hodnotu konfigurace
   */
  set(key, value) {
    this.config[key] = value;
  }

  /**
   * Smaže klíč z konfigurace
   */
  delete(key) {
    delete this.config[key];
  }

  /**
   * Získá celou konfiguraci
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Vymaže celou konfiguraci
   */
  clear() {
    this.config = {};
  }

  /**
   * Zkontroluje, zda existuje konfigurační soubor
   */
  exists() {
    return fs.existsSync(this.configFile);
  }

  /**
   * Získá cestu ke konfiguračnímu souboru
   */
  getConfigPath() {
    return this.configFile;
  }
}

module.exports = ConfigManager; 