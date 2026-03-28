const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERSION = String(Date.now());
const SKIP_DIRS = new Set(['.git', 'node_modules', 'build', 'dist']);
const ASSET_EXTENSIONS = new Set([
  '.css',
  '.js',
  '.json',
  '.webmanifest',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.ico',
]);

function shouldSkipAsset(target) {
  return (
    !target ||
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('//') ||
    target.startsWith('data:') ||
    target.startsWith('mailto:') ||
    target.startsWith('tel:') ||
    target.startsWith('#')
  );
}

function withVersion(target) {
  if (shouldSkipAsset(target)) return target;

  const hashIndex = target.indexOf('#');
  const hash = hashIndex >= 0 ? target.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? target.slice(0, hashIndex) : target;

  const queryIndex = withoutHash.indexOf('?');
  const base = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const rawQuery = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';
  const extension = path.extname(base).toLowerCase();

  if (!ASSET_EXTENSIONS.has(extension)) {
    return target;
  }

  const params = rawQuery
    ? rawQuery
        .split('&')
        .filter(Boolean)
        .filter((entry) => !entry.startsWith('v='))
    : [];

  params.push(`v=${VERSION}`);

  return `${base}?${params.join('&')}${hash}`;
}

function updateHtmlContent(content) {
  return content.replace(/(["'])([^"'<>]+)\1/g, (match, quote, target) => {
    const updated = withVersion(target);
    if (updated === target) return match;
    return `${quote}${updated}${quote}`;
  });
}

function walk(dir, htmlFiles = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name), htmlFiles);
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(path.join(dir, entry.name));
    }
  }

  return htmlFiles;
}

function main() {
  const htmlFiles = walk(ROOT);
  const updatedFiles = [];

  for (const file of htmlFiles) {
    const original = fs.readFileSync(file, 'utf8');
    const updated = updateHtmlContent(original);

    if (updated !== original) {
      fs.writeFileSync(file, updated);
      updatedFiles.push(path.relative(ROOT, file));
    }
  }

  console.log(`Asset version: ${VERSION}`);

  if (!updatedFiles.length) {
    console.log('No HTML files needed updates.');
    return;
  }

  console.log('Updated HTML files:');
  updatedFiles.forEach((file) => console.log(`- ${file}`));
}

main();
