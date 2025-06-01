const archiver = require('archiver');
const yauzl = require('yauzl');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class ThemeZipper {
  constructor() {
    this.allowedExtensions = [
      'htm', 'html', 'css', 'js', 'json', 'yaml', 'yml',
      'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp',
      'woff', 'woff2', 'ttf', 'eot', 'md', 'txt'
    ];
  }

  /**
   * Vytvoří ZIP archiv ze šablony
   */
  async createArchive(themePath) {
    const themeName = path.basename(themePath);
    const tempDir = path.join(os.tmpdir(), 'rocketoo-cli');
    await fs.ensureDir(tempDir);
    
    const zipPath = path.join(tempDir, `${themeName}-${Date.now()}.zip`);
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Nejvyšší komprese
      });

      output.on('close', () => {
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Přidej všechny soubory s filtrováním
      this.addDirectoryToArchive(archive, themePath, '', (filePath) => {
        const ext = path.extname(filePath).slice(1).toLowerCase();
        const relativePath = path.relative(themePath, filePath);
        
        // Filtruj podle povolených přípon
        if (!this.allowedExtensions.includes(ext) && ext !== '') {
          console.warn(`Přeskakuji nepovolený soubor: ${relativePath}`);
          return false;
        }

        // Filtruj systémové soubory
        if (relativePath.startsWith('.') || relativePath.includes('/.')) {
          return false;
        }

        return true;
      });

      archive.finalize();
    });
  }

  /**
   * Přidá adresář do archivu rekurzivně
   */
  async addDirectoryToArchive(archive, dirPath, archivePath, filter) {
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const archiveItemPath = archivePath ? `${archivePath}/${item}` : item;
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        await this.addDirectoryToArchive(archive, itemPath, archiveItemPath, filter);
      } else {
        if (filter && !filter(itemPath)) {
          continue;
        }

        archive.file(itemPath, { name: archiveItemPath });
      }
    }
  }

  /**
   * Validuje ZIP archiv
   */
  async validateThemeArchive(zipPath) {
    return new Promise((resolve) => {
      const result = {
        valid: true,
        errors: []
      };

      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          result.valid = false;
          result.errors.push('Nelze otevřít ZIP archiv: ' + err.message);
          resolve(result);
          return;
        }

        let hasThemeYaml = false;
        let hasLayouts = false;
        let hasPages = false;
        let totalSize = 0;

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          const fileName = entry.fileName;
          
          // Kontrola velikosti
          totalSize += entry.uncompressedSize;
          if (totalSize > 50 * 1024 * 1024) { // 50MB
            result.valid = false;
            result.errors.push('Archiv je příliš velký (max 50MB)');
          }

          // Kontrola jednotlivých souborů
          if (entry.uncompressedSize > 5 * 1024 * 1024) { // 5MB
            result.valid = false;
            result.errors.push(`Soubor ${fileName} je příliš velký (max 5MB)`);
          }

          // Kontrola přípony
          const ext = path.extname(fileName).slice(1).toLowerCase();
          if (ext && !this.allowedExtensions.includes(ext)) {
            result.valid = false;
            result.errors.push(`Nepovolená přípona: ${fileName}`);
          }

          // Kontrola struktury
          if (fileName === 'theme.yaml' || fileName.endsWith('/theme.yaml')) {
            hasThemeYaml = true;
          }
          if (fileName.startsWith('layouts/') || fileName.includes('/layouts/')) {
            hasLayouts = true;
          }
          if (fileName.startsWith('pages/') || fileName.includes('/pages/')) {
            hasPages = true;
          }

          zipfile.readEntry();
        });

        zipfile.on('end', () => {
          if (!hasThemeYaml) {
            result.valid = false;
            result.errors.push('Archiv neobsahuje theme.yaml');
          }
          if (!hasLayouts) {
            result.valid = false;
            result.errors.push('Archiv neobsahuje adresář layouts');
          }
          if (!hasPages) {
            result.valid = false;
            result.errors.push('Archiv neobsahuje adresář pages');
          }

          resolve(result);
        });

        zipfile.on('error', (err) => {
          result.valid = false;
          result.errors.push('Chyba při čtení archivu: ' + err.message);
          resolve(result);
        });
      });
    });
  }

  /**
   * Extrahuje archiv do adresáře
   */
  async extractThemeArchive(zipPath, outputDir) {
    await fs.ensureDir(outputDir);

    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }

        zipfile.readEntry();

        zipfile.on('entry', async (entry) => {
          const fileName = entry.fileName;
          const outputPath = path.join(outputDir, fileName);

          // Bezpečnostní kontrola cesty (Directory Traversal)
          if (!outputPath.startsWith(outputDir)) {
            zipfile.readEntry();
            return;
          }

          if (/\/$/.test(fileName)) {
            // Adresář
            await fs.ensureDir(outputPath);
            zipfile.readEntry();
          } else {
            // Soubor
            await fs.ensureDir(path.dirname(outputPath));
            
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err);
                return;
              }

              const writeStream = fs.createWriteStream(outputPath);
              readStream.pipe(writeStream);
              
              writeStream.on('close', () => {
                zipfile.readEntry();
              });

              writeStream.on('error', reject);
            });
          }
        });

        zipfile.on('end', () => {
          resolve(outputDir);
        });

        zipfile.on('error', reject);
      });
    });
  }
}

module.exports = ThemeZipper; 