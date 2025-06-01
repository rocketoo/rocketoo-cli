const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

const ConfigManager = require('../services/config-manager');
const ApiClient = require('../services/api-client');

class AuthCommands {
  static register(program) {
    const authCmd = new Command('auth')
      .description('autentifikace a správa účtu');

    // rocketoo auth login
    authCmd
      .command('login')
      .description('přihlášení k Rocketoo API')
      .option('--api-key <key>', 'API klíč')
      .option('--url <url>', 'URL API serveru')
      .action(async (options) => {
        await this.login(options);
      });

    // rocketoo auth logout
    authCmd
      .command('logout')
      .description('odhlášení z Rocketoo API')
      .action(async () => {
        await this.logout();
      });

    // rocketoo auth status
    authCmd
      .command('status')
      .description('zobrazí stav přihlášení')
      .action(async () => {
        await this.status();
      });

    program.addCommand(authCmd);
  }

  static async login(options) {
    console.log(chalk.bold('🚀 Přihlášení k Rocketoo CLI\n'));

    const config = new ConfigManager();
    let apiKey = options.apiKey;
    let apiUrl = options.url;

    // Dotaz na URL pokud není zadáno
    if (!apiUrl) {
      const urlAnswer = await inquirer.prompt([{
        type: 'input',
        name: 'url',
        message: 'URL vašeho Rocketoo eshopu:',
        default: config.get('api_url', 'https://demo.rocketoo.cz'),
        validate: (input) => {
          if (!input.trim()) return 'URL je povinné';
          if (!input.match(/^https?:\/\/.+/)) return 'URL musí začínat http:// nebo https://';
          return true;
        }
      }]);
      apiUrl = urlAnswer.url.replace(/\/$/, ''); // Remove trailing slash
    }

    // Dotaz na API klíč pokud není zadán
    if (!apiKey) {
      console.log(chalk.gray('\nAPI klíč získáte v administraci vašeho e-shopu v sekci Integrace > CLI\n'));
      
      const keyAnswer = await inquirer.prompt([{
        type: 'password',
        name: 'apiKey',
        message: 'API klíč:',
        mask: '*',
        validate: (input) => {
          if (!input.trim()) return 'API klíč je povinný';
          if (input.length < 20) return 'API klíč je příliš krátký';
          return true;
        }
      }]);
      apiKey = keyAnswer.apiKey;
    }

    // Ověření API klíče
    const spinner = ora('Ověřuji API klíč...').start();
    
    try {
      // Dočasně nastav konfiguraci
      config.set('api_url', apiUrl);
      config.set('api_key', apiKey);

      const api = new ApiClient();
      const isValid = await api.validateApiKey(apiKey);

      if (isValid) {
        config.save();
        spinner.succeed('Přihlášení úspěšné!');
        
        console.log(chalk.green(`\n✓ Připojeno k: ${apiUrl}`));
        console.log(chalk.green('✓ API klíč je platný'));
        console.log(chalk.gray('\nMůžete začít používat Rocketoo CLI:'));
        console.log(chalk.gray('  rocketoo theme push <theme>'));
        console.log(chalk.gray('  rocketoo theme publish <theme>'));
        
      } else {
        spinner.fail('Neplatný API klíč');
        // Vymaž neplatnou konfiguraci
        config.delete('api_key');
        config.save();
        
        console.log(chalk.red('\nOvěřte si:'));
        console.log(chalk.red('• Že je API klíč správný'));
        console.log(chalk.red('• Že je URL serveru správné'));
        console.log(chalk.red('• Že máte oprávnění k API'));
      }

    } catch (error) {
      spinner.fail('Chyba při ověřování');
      console.error(chalk.red(`\nChyba: ${error.message}`));
      
      // Vymaž neplatnou konfiguraci
      config.delete('api_key');
      config.save();
    }
  }

  static async logout() {
    const config = new ConfigManager();
    
    if (!config.get('api_key')) {
      console.log(chalk.yellow('Nejste přihlášeni'));
      return;
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Opravdu se chcete odhlásit?',
      default: false
    }]);

    if (confirm) {
      config.delete('api_key');
      config.save();
      console.log(chalk.green('✓ Odhlášení úspěšné'));
    } else {
      console.log('Operace zrušena');
    }
  }

  static async status() {
    const config = new ConfigManager();
    const apiKey = config.get('api_key');
    const apiUrl = config.get('api_url');

    console.log(chalk.bold('Stav přihlášení:\n'));

    if (!apiKey) {
      console.log(chalk.red('✗ Nejste přihlášeni'));
      console.log(chalk.gray('\nPro přihlášení použijte: rocketoo auth login'));
      return;
    }

    console.log(chalk.green('✓ Přihlášeni'));
    console.log(`URL: ${apiUrl || 'není nastaveno'}`);
    console.log(`API klíč: ${apiKey.substring(0, 8)}...`);

    // Test spojení
    const spinner = ora('Testuji spojení...').start();
    
    try {
      const api = new ApiClient();
      const connected = await api.testConnection();
      
      if (connected) {
        spinner.succeed('Spojení s API je funkční');
      } else {
        spinner.fail('Spojení s API selhalo');
        console.log(chalk.yellow('\nMožné příčiny:'));
        console.log(chalk.yellow('• Server není dostupný'));
        console.log(chalk.yellow('• API klíč už není platný'));
        console.log(chalk.yellow('• Změnila se URL serveru'));
      }

    } catch (error) {
      spinner.fail('Chyba při testování spojení');
      console.error(chalk.red(`Chyba: ${error.message}`));
    }
  }
}

module.exports = AuthCommands; 