# Art's Autobody & Collision Centre: website

A static website with no server code, no cookies and no third-party requests.

| Page | What it is |
|---|---|
| `index.html` | Landing page: 3D finish selector, exploded-view repair story, services, interactive damage estimator, before/after sliders, work gallery, reviews, contact form |
| `privacy.html` | Privacy Policy |
| `cookies.html` | Cookie Policy (the site uses no cookies) |
| `terms.html` | Terms of Use |
| `accessibility.html` | Accessibility statement and feedback contact |

## Viewing it

Unzip the folder and **double-click `index.html`**. Everything works straight from disk, including the 3D car. Keep the `assets/` folder next to the HTML files.

## Hosting

Upload the whole folder, including `assets/`, to any static host (Netlify, Cloudflare Pages, GitHub Pages, or ordinary shared hosting). There's no build step on the server.

- **Serve it over HTTPS.** The Privacy Policy describes reasonable security practices, and a plain-HTTP site undermines them.
- The Privacy Policy says the web host may keep standard server logs. If your host offers visitor analytics, leave it **off**, or update the Privacy and Cookie policies first.
- Recommended security header, set on the host rather than in the HTML so that double-clicking still works:
  `Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`

## Editing

```bash
npm install          # once
npm run build        # rebuilds CSS, the 3D bundle and the embedded model
npm run watch:css    # rebuild CSS on every change while editing
```

- Styles come from `src/input.css` (Tailwind CSS v4), built into `assets/css/site.css`. Tailwind isn't loaded from a CDN or run in the browser.
- Animation and 3D code come from `src/app.js` (scroll choreography with GSAP and Lenis) and `src/car3d.js` (three.js scenes), bundled into `assets/js/app.js` (`npm run build:js`).
- The 3D model's source is `src/models/car-concept.glb`. `npm run build:model` wraps it into `assets/models/car-concept.glb.js`, which is what lets the site work from disk.
- Opening hours appear in three places: the hours list in `index.html`, the "open now" logic in `assets/js/site.js` (`initHours`), and the JSON-LD block in the `<head>` of `index.html`.
- The Google rating (4.5) and the reviews are copied from Google. Update them by hand; they don't sync.

### Files

```
assets/js/site.js              page behaviour (menu, sliders, gallery, form, estimator logic)
assets/js/app.js               built bundle (three.js, GSAP, Lenis, src/app.js + src/car3d.js), don't edit by hand
assets/models/car-concept.glb.js   built model (base64), don't edit by hand
assets/img/shop/               the shop's own photos (plates blurred, metadata stripped)
assets/fonts/                  self-hosted fonts
src/                           sources: Tailwind CSS, 3D script, 3D model
scripts/                       model embedding and model cleaning scripts
LICENSES/                      third-party licence texts
```

## How the pieces fit

- **No JavaScript:** all content is readable, the gallery images show, and the contact form falls back to a plain `mailto:` form.
- **No WebGL** (old devices, some privacy browsers): the 3D areas show a photo, and the estimator works from its list of areas.
- **Reduced motion** (`prefers-reduced-motion`): animations are switched off, the turntable stops, and camera moves happen instantly.
- **The estimator** runs entirely in the browser. Its text lives in `assets/js/site.js` (`ZONES`, `TYPES`, `STEPS`, `ZONE_NOTES`). It deliberately shows **no prices**. Before adding price ranges, read the note in "Before you launch".
- **The contact form** doesn't submit to a server. It opens the visitor's email app with a pre-filled message to `yasir@artsautobody.ca`. If you ever switch to a form service (Formspree, Netlify Forms and so on), that's a new third-party data processor, so update the Privacy Policy first.

## Before you launch

A checklist for the business owner. These are facts only the owner can confirm:

1. **Photos:** confirm the business owns the photos in `assets/img/shop/`, or has permission to use them (see `CREDITS.md`).
2. **Legal pages:** have the Privacy Policy, Cookie Policy and Terms of Use reviewed by an Ontario lawyer or paralegal. They're written to match how this site actually works, but they aren't legal advice. In particular, check that:
   - the retention practice ("delete enquiries once no longer needed; keep repair records for legal and tax obligations") matches what the shop actually does;
   - the list of who information is shared with (email provider, insurers on request, parts suppliers) matches reality;
   - Yasir is the right privacy contact.
3. **Repair paperwork:** the Terms defer to the shop's written estimate, authorization and invoice, and to the *Consumer Protection Act, 2002*. Make sure the shop's in-person paperwork meets Ontario's motor-vehicle repair rules. The website doesn't replace it.
4. **Estimator prices:** if you want the estimator to show dollar ranges, use real figures from the shop and keep the "not a written estimate" wording next to them. Ontario law has specific rules about repair estimates.
5. **Logo:** the header uses a placeholder "A" mark. Swap in the real logo (as SVG or WebP, served from `assets/img/`) and add it to `CREDITS.md`.
6. **Hosting:** confirm HTTPS is on, and that the host doesn't inject analytics or cookies.

## Rebuilding the 3D model

See the comment at the top of `scripts/clean-model.mjs`. It downloads the original CC BY 4.0 model, removes the licence-excluded logos and compresses it. Keep the attribution in the footer.
