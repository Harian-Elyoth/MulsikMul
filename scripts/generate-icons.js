#!/usr/bin/env node
/**
 * Generates all required app icons from assets/logo.svg
 * Uses @resvg/resvg-js for SVG→PNG conversion
 *
 * Run with: node scripts/generate-icons.js
 */

const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../assets/logo.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Variant: add solid green background rect behind everything (for opaque icons)
const svgWithBg = svgContent.replace(
  '<path d="M0 0 C337.92 0 675.84 0 1024 0 C1024 337.92 1024 675.84 1024 1024 C686.08 1024 348.16 1024 0 1024 C0 686.08 0 348.16 0 0 Z " fill="#FDFDFD"',
  '<rect width="1024" height="1024" fill="#49C872"/>\n<path d="M0 0 C337.92 0 675.84 0 1024 0 C1024 337.92 1024 675.84 1024 1024 C686.08 1024 348.16 1024 0 1024 C0 686.08 0 348.16 0 0 Z " fill="#FDFDFD"'
);

// Android adaptive background: solid green square
const svgBgOnly = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
<rect width="1024" height="1024" fill="#49C872"/>
</svg>`;

// Android monochrome: all paths forced to white
const svgMono = svgContent
  .replace(/fill="#FDFDFD"/g, 'fill="#FFFFFF"')
  .replace(/fill="#FAFBFA"/g, 'fill="#FFFFFF"')
  .replace(/fill="#48C873"/g, 'fill="#FFFFFF"')
  .replace(/fill="#A2E57D"/g, 'fill="#FFFFFF"')
  .replace(/fill="#4AB984"/g, 'fill="#FFFFFF"')
  .replace(/fill="#5DC285"/g, 'fill="#FFFFFF"')
  .replace(/fill="#4DBF8A"/g, 'fill="#FFFFFF"');

function renderPng(svgStr, size) {
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: 'width', value: size },
  });
  return resvg.render().asPng();
}

function write(outPath, png) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png);
  const rel = path.relative(path.join(__dirname, '..'), outPath);
  console.log(`✓ ${rel}  (${(png.length / 1024).toFixed(1)} KB)`);
}

const assets = path.join(__dirname, '../assets');

// Main icon (green bg, 1024×1024)
write(`${assets}/icon.png`,         renderPng(svgWithBg, 1024));

// Splash screen
write(`${assets}/splash-icon.png`,  renderPng(svgWithBg, 1024));

// Web favicon
write(`${assets}/favicon.png`,      renderPng(svgWithBg, 48));

// Store listings
write(`${assets}/appstore.png`,     renderPng(svgWithBg, 1024));
write(`${assets}/playstore.png`,    renderPng(svgWithBg, 512));

// Android adaptive icon layers
write(`${assets}/android-icon-foreground.png`,  renderPng(svgContent, 1024));
write(`${assets}/android-icon-background.png`,  renderPng(svgBgOnly,  1024));
write(`${assets}/android-icon-monochrome.png`,  renderPng(svgMono,    1024));

// Android mipmap launcher icons
const mipmaps = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];
for (const { dir, size } of mipmaps) {
  write(`${assets}/android/${dir}/ic_launcher.png`, renderPng(svgWithBg, size));
}

console.log('\nAll icons generated successfully.');
