// Updates the Content-Security-Policy in index.html with the SHA-256 hash of the inline import map.
// Run after editing the import map: `npm run csp`
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const file = new URL('../index.html', import.meta.url);
let html = readFileSync(file, 'utf8');
const map = html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1];
const hash = `'sha256-${createHash('sha256').update(map).digest('base64')}'`;
html = html.replace(/(script-src 'self' 'wasm-unsafe-eval' )(IMPORTMAP_HASH|'sha256-[^']+')/, `$1${hash}`);
writeFileSync(file, html);
console.log('import map hash:', hash);
