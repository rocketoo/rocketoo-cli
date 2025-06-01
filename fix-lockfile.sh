#!/bin/bash

echo "Regeneruji package-lock.json..."

# Smažeme node_modules pokud existuje
if [ -d "node_modules" ]; then
    echo "Mažu staré node_modules..."
    rm -rf node_modules
fi

# Vyčistíme npm cache
echo "Čistím npm cache..."
npm cache clean --force

# Nainstalujeme dependencies s novým lockfile
echo "Instaluji dependencies..."
npm install

echo "Hotovo! Nový package-lock.json byl vytvořen." 