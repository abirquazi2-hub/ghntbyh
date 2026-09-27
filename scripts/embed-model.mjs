// Wraps the GLB in a classic script (window.__CAR_GLB = "<base64>") so the 3D car also loads
// when index.html is opened directly from disk (file://), where fetch() is blocked.
import { readFileSync, writeFileSync } from 'node:fs';
const src = new URL('../src/models/car-concept.glb', import.meta.url);
const out = new URL('../assets/models/car-concept.glb.js', import.meta.url);
const b64 = readFileSync(src).toString('base64');
writeFileSync(out, `/* "Car Concept" by Eric Chadwick, (c) Darmstadt Graphics Group GmbH, CC BY 4.0 (modified). See CREDITS.md. */\nwindow.__CAR_GLB="${b64}";\n`);
console.log(`wrote ${out.pathname} (${(b64.length / 1048576).toFixed(1)} MB)`);
