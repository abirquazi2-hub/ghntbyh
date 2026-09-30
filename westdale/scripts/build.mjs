// 1) bundle client JS  2) generate every page from src/site  3) copy assets  -> dist/
import { build } from 'esbuild';
import { rm, mkdir, cp, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { buildPages, sitemapPaths } from '../src/site/pages.mjs';
import { page } from '../src/site/layout.mjs';
import { SITE } from '../src/site/content.mjs';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('assets', 'dist/assets', { recursive: true });

await build({
  entryPoints: ['src/main.js'], outdir: 'dist/assets/js', bundle: true, splitting: true, format: 'esm',
  minify: true, target: 'es2020', legalComments: 'linked', entryNames: 'app', chunkNames: 'chunk-[hash]',
});

const pages = buildPages();
for (const [path, html] of Object.entries(pages)) {
  const file = join('dist', path, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}
await writeFile('dist/404.html', page({ path: '/404.html', title: 'Page not found', desc: 'Page not found.', robots: 'noindex', og: false,
  body: '<div class="wrap page page--top"><h1>Page not found</h1><p>That page doesn’t exist. <a href="/">Return to the Westdale home page</a>.</p></div>' }));
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths(pages).map((p) => `  <url><loc>${SITE.url}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`built ${Object.keys(pages).length} pages`);
