#!/usr/bin/env node

/**
 * Simple script to convert MBTiles to PMTiles
 * Run with: node convert-tiles.js
 */

const fs = require('fs');
const path = require('path');

console.log('MBTiles to PMTiles Conversion Script');
console.log('=====================================\n');

const tilesDir = './assets/tiles';
const mbtiles = [
  'co_roads.mbtiles',
  'co_railways.mbtiles', 
  'co_power_lines.mbtiles'
];

// Check if MBTiles files exist
console.log('Checking for MBTiles files...');
for (const file of mbtiles) {
  const filepath = path.join(tilesDir, file);
  if (fs.existsSync(filepath)) {
    console.log(`✓ Found: ${file}`);
  } else {
    console.log(`✗ Missing: ${file}`);
  }
}

console.log('\nTo convert these files to PMTiles format:');
console.log('1. Install pmtiles CLI globally:');
console.log('   npm install -g pmtiles');
console.log('\n2. Run conversion commands:');

for (const file of mbtiles) {
  const baseName = path.basename(file, '.mbtiles');
  const inputPath = path.join(tilesDir, file);
  const outputPath = path.join(tilesDir, `${baseName}.pmtiles`);
  
  console.log(`   pmtiles convert "${inputPath}" "${outputPath}"`);
}

console.log('\n3. Alternative using Python pmtiles:');
console.log('   pip install pmtiles');
console.log('   python -m pmtiles convert assets/tiles/co_roads.mbtiles assets/tiles/co_roads.pmtiles');

console.log('\n4. Or use online converter:');
console.log('   https://protomaps.github.io/PMTiles/');

console.log('\nOnce converted, refresh your browser to load the tiles.');

// Check if any PMTiles already exist
console.log('\nChecking for existing PMTiles files...');
for (const file of mbtiles) {
  const baseName = path.basename(file, '.mbtiles');
  const pmtilesPath = path.join(tilesDir, `${baseName}.pmtiles`);
  
  if (fs.existsSync(pmtilesPath)) {
    const stats = fs.statSync(pmtilesPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`✓ Found: ${baseName}.pmtiles (${sizeMB} MB)`);
  } else {
    console.log(`✗ Missing: ${baseName}.pmtiles`);
  }
}