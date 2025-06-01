const { Command } = require('commander');
const chalk = require('chalk');
const ConfigManager = require('../services/config-manager');

class ConfigCommands {
  static register(program) {
    const configCmd = new Command('config')
      .description('správa konfigurace');

    // rocketoo config get
    configCmd
      .command('get')
      .description('zobrazí hodnotu konfigurace')
      .argument('[key]', 'klíč konfigurace')
      .action(async (key) => {
        await this.getConfig(key);
      });

    // rocketoo config set
    configCmd
      .command('set')
      .description('nastaví hodnotu konfigurace')
      .argument('<key>', 'klíč konfigurace')
      .argument('<value>', 'hodnota')
      .action(async (key, value) => {
        await this.setConfig(key, value);
      });

    // rocketoo config delete
    configCmd
      .command('delete')
      .alias('del')
      .description('smaže hodnotu konfigurace')
      .argument('<key>', 'klíč konfigurace')
      .action(async (key) => {
        await this.deleteConfig(key);
      });

    // rocketoo config clear
    configCmd
      .command('clear')
      .description('vymaže celou konfiguraci')
      .option('-y, --yes', 'potvrdí bez dotazu')
      .action(async (options) => {
        await this.clearConfig(options);
      });

    program.addCommand(configCmd);
  }

  static async getConfig(key) {
    const config = new ConfigManager();

    if (key) {
      const value = config.get(key);
      if (value !== null) {
        console.log(value);
      } else {
        console.log(chalk.yellow(`Klíč '${key}' není nastaven`));
      }
    } else {
      // Zobraz celou konfiguraci
      const allConfig = config.getAll();
      
      if (Object.keys(allConfig).length === 0) {
        console.log(chalk.yellow('Konfigurace je prázdná'));
        return;
      }

      console.log(chalk.bold('Aktuální konfigurace:\n'));
      
      Object.entries(allConfig).forEach(([key, value]) => {
        // Maskuj sensitive hodnoty
        const displayValue = key.includes('key') || key.includes('token') 
          ? this.maskSensitiveValue(value)
          : value;
        
        console.log(`${chalk.cyan(key)}: ${displayValue}`);
      });
    }
  }

  static async setConfig(key, value) {
    const config = new ConfigManager();
    
    config.set(key, value);
    
    if (config.save()) {
      console.log(chalk.green(`✓ ${key} = ${value}`));
    } else {
      console.log(chalk.red(`✗ Chyba při ukládání konfigurace`));
    }
  }

  static async deleteConfig(key) {
    const config = new ConfigManager();
    
    if (config.get(key) === null) {
      console.log(chalk.yellow(`Klíč '${key}' není nastaven`));
      return;
    }

    config.delete(key);
    
    if (config.save()) {
      console.log(chalk.green(`✓ Klíč '${key}' byl smazán`));
    } else {
      console.log(chalk.red(`✗ Chyba při ukládání konfigurace`));
    }
  }

  static async clearConfig(options) {
    const config = new ConfigManager();
    
    if (!options.yes) {
      const inquirer = require('inquirer');
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Opravdu chcete vymazat celou konfiguraci?',
        default: false
      }]);

      if (!confirm) {
        console.log('Operace zrušena');
        return;
      }
    }

    config.clear();
    
    if (config.save()) {
      console.log(chalk.green('✓ Konfigurace byla vymazána'));
    } else {
      console.log(chalk.red('✗ Chyba při mazání konfigurace'));
    }
  }

  static maskSensitiveValue(value) {
    if (typeof value !== 'string') return value;
    if (value.length <= 8) return '***';
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  }
}

module.exports = ConfigCommands; 