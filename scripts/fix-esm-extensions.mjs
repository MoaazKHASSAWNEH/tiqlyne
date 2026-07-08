import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const targetDir = process.argv[2] || 'dist';
const files = [];

function walk(folder) {
  for (const item of readdirSync(folder)) {
    const filePath = join(folder, item);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.js')) {
      files.push(filePath);
    }
  }
}

function addExtension(filePath, specifier) {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return specifier;
  }

  if (extname(specifier)) {
    return specifier;
  }

  const absolutePath = resolve(dirname(filePath), specifier);

  if (existsSync(`${absolutePath}.js`)) {
    return `${specifier}.js`;
  }

  if (existsSync(join(absolutePath, 'index.js'))) {
    return `${specifier}/index.js`;
  }

  return specifier;
}

function rewrite(filePath) {
  const original = readFileSync(filePath, 'utf8');
  let output = original;

  const fromPattern = new RegExp(`(from\\s+['"])(\\.{1,2}\\/[^'"]+)(['"])`, 'g');
  const importPattern = new RegExp(`(import\\s*['"])(\\.{1,2}\\/[^'"]+)(['"])`, 'g');

  output = output.replace(fromPattern, (_match, before, specifier, after) => {
    return before + addExtension(filePath, specifier) + after;
  });

  output = output.replace(importPattern, (_match, before, specifier, after) => {
    return before + addExtension(filePath, specifier) + after;
  });

  if (output !== original) {
    writeFileSync(filePath, output);
  }
}

walk(targetDir);

for (const filePath of files) {
  rewrite(filePath);
}
