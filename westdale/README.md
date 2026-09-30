# Westdale Financial Services: website rebuild

Multi-page static site (generated HTML, CSS/JS, self-hosted fonts, lazy-loaded three.js 3D scenes) plus a small **dependency-free Node server** (`server/`) that serves the site with security headers and handles the consultation form.

```bash
npm install
npm run build     # generates pages + bundles JS into dist/
npm test          # validation, rate limiter, CSRF tests
npm start         # builds, then serves dist/ at http://localhost:3000 (reads .env if present)
```

## What works now vs. what you must configure

| Item | Status |
|---|---|
| Pages, navigation, interactive tools, 3D hero, mobile menu | Working |
| Consultation form: validation, honeypot, CSRF, origin check, rate limit, duplicate suppression | Working (tested) |
| **Email delivery to steve@westdalefinancial.com** | **Not active until configured.** Set `RESEND_API_KEY`, `EMAIL_FROM` (domain verified with Resend) and `CSRF_SECRET` (see `.env.example`). Until then the form honestly tells visitors to email Steve directly. |
| Cloudflare Turnstile | Optional; set `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` to enable |
| HTTPS / HSTS | Terminate TLS at the host or proxy; set `NODE_ENV=production` (adds HSTS and Secure cookie) and `TRUST_PROXY=1` only behind a trusted proxy |
| Rate limiting | In memory, per instance. Use a shared store if you run several instances |

No secrets live in frontend code. The CSP allows only same-origin scripts (plus Turnstile when enabled). Nothing is stored in localStorage (only a non-sensitive `sessionStorage` flag so the intro plays once per session).

## Content: verified vs. NOT verified

The existing site (westdalefinancial.com) was **unreachable from the build environment**, so nothing was copied from it. Only facts supplied in the brief are used as facts: Stephen Fricker, CFP; 34+ years; founded 2006; 150+ households, greater Hamilton; steve@westdalefinancial.com; the six service areas; the eight program names; the seven process steps.

**Must be checked against the current site before launch:**
1. Program descriptions (`#systems`) are deliberately minimal and inferred from names only. Replace with Westdale's own wording.
2. Service panels' "addresses / relevant to / involves" text and the service-to-program mapping are general descriptions, not Westdale copy.
3. Retirement Map stage text is generic education, not a description of how the program works; the ages are illustrative.
4. Missing: phone, street address, affiliations, registrations, required disclosures, any "other services", client-access links, social links, resources. Placeholders are marked in `disclosures.html`, `client-planner/index.html` and a TODO in `index.html`.
5. `privacy.html`, `terms.html`, `disclosures.html` are clearly marked drafts needing legal/compliance review.
6. The `.ca` domain in canonical/OG/sitemap URLs assumes www.westdalefinancial.com.
7. The photo (`assets/img/steve-fricker.png`) was supplied with the brief at 312x437; a higher-resolution original will look sharper.
8. The illustration disclaimer wording should be approved by compliance.

## Structure
A real multi-page site generated at build time from `src/site/` (`content.mjs` = all copy, `layout.mjs` = header/footer, `pages.mjs` = pages). `npm run build` writes everything to `dist/`.

Pages: Home, Services + six service pages, Your Retirement Map, Planning Systems, Our Process, About Steve, Resources, Growth Illustration, Build Your Retirement Plan, Client Planner, Book a Consultation, Contact, Privacy, Terms, Disclosures, 404. Edit copy in `content.mjs` / `pages.mjs`, then rebuild. Page-to-page navigation uses View Transitions where the browser supports them.

## Deploying on Netlify
`netlify.toml` is included. In Netlify set **Base directory = `westdale`** (the repo root holds an unrelated site). `npm run build` writes the deployable site to `dist/` (publish directory) and the form API runs as Netlify Functions (`netlify/functions/`, sharing `server/handlers.mjs` with the Node server).

Set these environment variables in Netlify (Site configuration → Environment variables): `CSRF_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, optionally `EMAIL_TO`, `ALLOWED_ORIGINS` (add your custom domain), `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`. Netlify's own site URL is allowed automatically. Note: function rate limiting is per warm instance, so it is best-effort; Turnstile is recommended on Netlify.
