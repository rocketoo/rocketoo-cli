#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

// Import příkazů
const ThemeCommands = require('../src/commands/theme');
const ConfigCommands = require('../src/commands/config');
const AuthCommands = require('../src/commands/auth');

const program = new Command();

// Základní konfigurace
program
  .name('rocketoo')
  .description('CLI nástroj pro správu Rocketoo šablon')
  .version(pkg.version, '-v, --version', 'zobrazí verzi CLI')
  .helpOption('-h, --help', 'zobrazí nápovědu');

// Globální options
program
  .option('--debug', 'zapne debug režim')
  .option('--config <path>', 'cesta ke konfiguračnímu souboru')
  .option('--no-color', 'vypne barevný výstup');

// Registrace příkazů
ThemeCommands.register(program);
ConfigCommands.register(program);
AuthCommands.register(program);

// Hlavní help
program.on('--help', () => {
  console.log('');
  console.log('Příklady použití:');
  console.log('  $ rocketoo auth login');
  console.log('  $ rocketoo theme push my-theme');
  console.log('  $ rocketoo theme publish my-theme');
  console.log('  $ rocketoo config get api_url');
  console.log('');
  console.log('Více informací na: https://rocketoo.cz/cli');
});

// Error handling
program.configureOutput({
  writeOut: (str) => process.stdout.write(str),
  writeErr: (str) => process.stderr.write(chalk.red(str)),
  getOutHelpWidth: () => Math.min(100, process.stdout.columns || 80),
  getErrHelpWidth: () => Math.min(100, process.stderr.columns || 80),
});

// Zpracování argumentů
program.parse();

// Pokud žádný příkaz není zadán, zobraz help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 