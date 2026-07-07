import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] || 'dist';

function walk(folder) {
  const files = [];
  for (const item of readdirSync(folder)) {
    const path = join(folder, item);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (path.endsWith('.js')) files.push(path);
  }
  return files;
}

for (const file of walk(dir)) {
  let text = readFileSync(file, 'utf8');
  text = text.replaceAll("from './", "from './__LOCAL__");
  text = text.replaceAll("from '../", "from '../__LOCAL__");
  text = text.replaceAll("__LOCAL__", "");
  writeFileSync(file, text);
}
