// Bundles src/ into assets/js. Three.js is split into its own chunk and loaded lazily.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/main.js'],
  outdir: 'assets/js',
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  legalComments: 'linked',
  entryNames: 'app',
  chunkNames: 'chunk-[hash]',
});
console.log('built');

// Assemble the deployable static site in dist/ (used by Netlify; `npm start` serves from source).
import { rm, mkdir, cp } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const f of ['index.html', 'privacy.html', 'terms.html', 'disclosures.html', '404.html', 'robots.txt', 'sitemap.xml', 'client-planner', 'assets']) {
  await cp(f, `dist/${f}`, { recursive: true });
}
console.log('dist ready');
