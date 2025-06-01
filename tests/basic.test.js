const { exec } = require('child_process');
const path = require('path');

describe('Rocketoo CLI', () => {
  const cliPath = path.join(__dirname, '../bin/rocketoo.js');

  test('should show version', (done) => {
    exec(`node ${cliPath} --version`, (error, stdout, stderr) => {
      expect(error).toBeNull();
      expect(stdout.trim()).toBe('1.0.0');
      done();
    });
  });

  test('should show help', (done) => {
    exec(`node ${cliPath} --help`, (error, stdout, stderr) => {
      expect(error).toBeNull();
      expect(stdout).toContain('CLI nástroj pro správu Rocketoo šablon');
      done();
    });
  });

  test('should handle invalid command', (done) => {
    exec(`node ${cliPath} invalid-command`, (error, stdout, stderr) => {
      expect(error).not.toBeNull();
      expect(error.code).toBe(1);
      done();
    });
  });
}); 