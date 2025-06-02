const fs = require('fs');
const path = require('path');

describe('Rocketoo CLI', () => {
  test('CLI binary exists', () => {
    const cliPath = path.join(__dirname, '../bin/rocketoo.js');
    expect(fs.existsSync(cliPath)).toBe(true);
  });

  test('package.json has correct structure', () => {
    const packagePath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    expect(packageJson.name).toBe('@rocketoo/cli');
    expect(packageJson.version).toBe('1.0.1');
    expect(packageJson.bin.rocketoo).toBe('./bin/rocketoo.js');
  });
});
