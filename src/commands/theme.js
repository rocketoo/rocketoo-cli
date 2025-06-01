const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');

const ApiClient = require('../services/api-client');
const ThemeValidator = require('../services/theme-validator');
const ThemeZipper = require('../services/theme-zipper');
const ConfigManager = require('../services/config-manager');

class ThemeCommands {
  static register(program) {
    const themeCmd = new Command('theme')
      .description('správa šablon');

    // rocketoo theme push
    themeCmd
      .command('push')
      .description('nahraje šablonu na server')
      .argument('<theme>', 'název šablony nebo cesta k adresáři')
      .option('-f, --force', 'vynucuje nahrání i při chybách validace')
      .option('--validate-only', 'pouze validuje šablonu bez nahrání')
      .option('-d, --description <desc>', 'popis šablony')
      .action(async (theme, options) => {
        await this.pushTheme(theme, options);
      });

    // rocketoo theme publish
    themeCmd
      .command('publish')
      .description('aktivuje šablonu jako aktuální')
      .argument('<theme>', 'název šablony')
      .option('-v, --version <version>', 'konkrétní verze k aktivaci')
      .option('-y, --yes', 'potvrdí bez dotazu')
      .action(async (theme, options) => {
        await this.publishTheme(theme, options);
      });

    // rocketoo theme list
    themeCmd
      .command('list')
      .alias('ls')
      .description('zobrazí seznam šablon')
      .option('-a, --all', 'zobrazí všechny šablony včetně neaktivních')
      .action(async (options) => {
        await this.listThemes(options);
      });

    // rocketoo theme current
    themeCmd
      .command('current')
      .description('zobrazí aktuálně aktivní šablonu')
      .action(async () => {
        await this.currentTheme();
      });

    // rocketoo theme versions
    themeCmd
      .command('versions')
      .description('zobrazí verze šablony')
      .argument('<theme>', 'název šablony')
      .action(async (theme) => {
        await this.themeVersions(theme);
      });

    // rocketoo theme validate
    themeCmd
      .command('validate')
      .description('validuje šablonu lokálně')
      .argument('<theme>', 'název šablony nebo cesta k adresáři')
      .action(async (theme) => {
        await this.validateTheme(theme);
      });

    program.addCommand(themeCmd);
  }

  static async pushTheme(theme, options) {
    const spinner = ora('Zahajuji nahrávání šablony...').start();

    try {
      // 1. Najdi cestu k šabloně
      const themePath = await this.resolveThemePath(theme);
      if (!themePath) {
        spinner.fail(`Šablona '${theme}' nebyla nalezena`);
        return;
      }

      const themeName = path.basename(themePath);
      spinner.text = `Validuji šablonu ${themeName}...`;

      // 2. Validace
      const validator = new ThemeValidator();
      const validation = await validator.validate(themePath);

      if (!validation.valid) {
        spinner.fail('Validace selhala:');
        validation.errors.forEach(error => {
          console.log(chalk.red(`  ✗ ${error}`));
        });

        if (!options.force) {
          console.log(chalk.yellow('\nPoužijte --force pro vynucení nahrání'));
          return;
        }

        console.log(chalk.yellow('\nPokračuji navzdory chybám (--force)...'));
      } else {
        spinner.succeed('Validace úspěšná');
      }

      // Warnings
      if (validation.warnings && validation.warnings.length > 0) {
        console.log(chalk.yellow('\nVarování:'));
        validation.warnings.forEach(warning => {
          console.log(chalk.yellow(`  ⚠ ${warning}`));
        });
      }

      if (options.validateOnly) {
        console.log(chalk.green('\nValidace dokončena'));
        return;
      }

      // 3. Komprese
      spinner.start('Kompresuji šablonu...');
      const zipper = new ThemeZipper();
      const zipPath = await zipper.createArchive(themePath);
      spinner.succeed(`Archiv vytvořen: ${path.basename(zipPath)}`);

      // 4. Nahrání
      spinner.start('Nahráváni na server...');
      const api = new ApiClient();
      const result = await api.uploadTheme(themeName, zipPath, {
        description: options.description
      });

      if (result.success) {
        spinner.succeed(`Šablona '${themeName}' byla úspěšně nahrána`);
        console.log(chalk.green(`  ID: ${result.theme_id}`));
        console.log(chalk.green(`  Verze: ${result.version}`));
      } else {
        spinner.fail(`Nahrání selhalo: ${result.error}`);
      }

      // Vyčištění
      await fs.remove(zipPath);

    } catch (error) {
      spinner.fail(`Chyba: ${error.message}`);
      if (options.debug) {
        console.error(error);
      }
    }
  }

  static async publishTheme(theme, options) {
    const spinner = ora(`Aktivuji šablonu ${theme}...`).start();

    try {
      const api = new ApiClient();

      // 1. Získej verze
      const versions = await api.getThemeVersions(theme);
      if (!versions || versions.length === 0) {
        spinner.fail(`Šablona '${theme}' nebyla nalezena na serveru`);
        console.log(chalk.yellow(`Nejdříve nahrajte šablonu: rocketoo theme push ${theme}`));
        return;
      }

      const version = options.version || versions[0].version;

      // 2. Potvrzení
      if (!options.yes) {
        const current = await api.getCurrentTheme();
        console.log(chalk.yellow(`\nAktuální šablona: ${current.name} v${current.version}`));
        console.log(chalk.yellow(`Nová šablona: ${theme} v${version}`));
        
        const inquirer = require('inquirer');
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: 'Pokračovat?',
          default: false
        }]);

        if (!confirm) {
          spinner.stop();
          console.log('Operace zrušena');
          return;
        }
      }

      // 3. Aktivace
      spinner.start('Aktivuji šablonu...');
      const result = await api.publishTheme(theme, version);

      if (result.success) {
        spinner.succeed(`Šablona '${theme}' v${version} byla aktivována`);
        console.log(chalk.green(`  Aktivována: ${result.activated_at}`));
        console.log(chalk.green(`  Náhled: ${result.preview_url}`));
      } else {
        spinner.fail(`Aktivace selhala: ${result.error}`);
      }

    } catch (error) {
      spinner.fail(`Chyba: ${error.message}`);
    }
  }

  static async listThemes(options) {
    const spinner = ora('Načítám seznam šablon...').start();

    try {
      const api = new ApiClient();
      const themes = await api.getThemes();

      spinner.stop();

      if (!themes || themes.length === 0) {
        console.log(chalk.yellow('Žádné šablony nebyly nalezeny'));
        return;
      }

      console.log(chalk.bold('\nVaše šablony:'));
      console.log('');

      themes.forEach(theme => {
        const status = theme.is_active ? chalk.green('● AKTIVNÍ') : chalk.gray('○ neaktivní');
        const versions = chalk.gray(`(${theme.versions_count} verzí)`);
        
        console.log(`${status} ${chalk.bold(theme.name)} ${versions}`);
        if (theme.description) {
          console.log(`  ${chalk.gray(theme.description)}`);
        }
        console.log(`  ${chalk.gray(`Naposledy: ${theme.updated_at}`)}`);
        console.log('');
      });

    } catch (error) {
      spinner.fail(`Chyba: ${error.message}`);
    }
  }

  static async currentTheme() {
    const spinner = ora('Získávám aktivní šablonu...').start();

    try {
      const api = new ApiClient();
      const current = await api.getCurrentTheme();

      spinner.stop();
      
      console.log(chalk.bold('\nAktivní šablona:'));
      console.log(`${chalk.green('●')} ${chalk.bold(current.name)} v${current.version}`);
      if (current.activated_at) {
        console.log(`   Aktivována: ${current.activated_at}`);
      }

    } catch (error) {
      spinner.fail(`Chyba: ${error.message}`);
    }
  }

  static async themeVersions(theme) {
    const spinner = ora(`Načítám verze šablony ${theme}...`).start();

    try {
      const api = new ApiClient();
      const versions = await api.getThemeVersions(theme);

      spinner.stop();

      if (!versions || versions.length === 0) {
        console.log(chalk.yellow(`Šablona '${theme}' nebyla nalezena`));
        return;
      }

      console.log(chalk.bold(`\nVerze šablony ${theme}:`));
      console.log('');

      versions.forEach(version => {
        const warnings = version.warnings_count > 0 
          ? chalk.yellow(` (${version.warnings_count} varování)`)
          : '';
        
        console.log(`${chalk.bold(version.version)}${warnings}`);
        console.log(`  Nahrána: ${version.uploaded_at}`);
        console.log(`  Velikost: ${this.formatBytes(version.file_size)}`);
        console.log('');
      });

    } catch (error) {
      spinner.fail(`Chyba: ${error.message}`);
    }
  }

  static async validateTheme(theme) {
    const spinner = ora('Validuji šablonu...').start();

    try {
      const themePath = await this.resolveThemePath(theme);
      if (!themePath) {
        spinner.fail(`Šablona '${theme}' nebyla nalezena`);
        return;
      }

      const validator = new ThemeValidator();
      const validation = await validator.validate(themePath);

      if (validation.valid) {
        spinner.succeed('Validace úspěšná');
      } else {
        spinner.fail('Validace selhala');
        validation.errors.forEach(error => {
          console.log(chalk.red(`  ✗ ${error}`));
        });
      }

      if (validation.warnings && validation.warnings.length > 0) {
        console.log(chalk.yellow('\nVarování:'));
        validation.warnings.forEach(warning => {
          console.log(chalk.yellow(`  ⚠ ${warning}`));
        });
      }

    } catch (error) {
      spinner.fail(`Chyba: ${error.message}`);
    }
  }

  static async resolveThemePath(theme) {
    // Pokud je to cesta, použij ji
    if (theme.includes('/') || theme.includes('\\')) {
      const fullPath = path.resolve(theme);
      if (await fs.pathExists(fullPath)) {
        return fullPath;
      }
    }

    // Hledej v aktuálním adresáři
    if (await fs.pathExists(theme)) {
      return path.resolve(theme);
    }

    // Hledej v themes adresáři
    const themesDir = path.join(process.cwd(), 'themes', theme);
    if (await fs.pathExists(themesDir)) {
      return themesDir;
    }

    return null;
  }

  static formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = Math.max(bytes, 0);
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }
}

module.exports = ThemeCommands; 