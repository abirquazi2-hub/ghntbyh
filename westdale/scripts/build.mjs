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
