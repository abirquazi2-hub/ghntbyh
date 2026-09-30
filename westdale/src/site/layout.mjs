import { SITE, SERVICES } from './content.mjs';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const topicUrl = (t) => `/book-a-consultation/?topic=${encodeURIComponent(t)}`;

const NAV = [
  { label: 'Planning', href: '/our-process/' },
  { label: 'Services', href: '/services/', menu: SERVICES.map((s) => [s.nav, `/services/${s.slug}/`, s.short]) },
  { label: 'Your Retirement Map', href: '/your-retirement-map/' },
  { label: 'Planning Systems', href: '/planning-systems/' },
  { label: 'About Steve', href: '/about-steve/' },
  { label: 'Resources', href: '/resources/', menu: [
    ['Client Planner', '/client-planner/', 'Westdale’s client planner'],
    ['Growth illustration', '/investment-illustration/', 'Explore time and contributions, hypothetically'],
    ['Build your retirement plan', '/build-your-retirement-plan/', 'A short educational journey'],
    ['Our process', '/our-process/', 'From first conversation to ongoing service'],
  ] },
  { label: 'Contact', href: '/contact/' },
];

const here = (path, href) => (href === '/' ? path === '/' : path === href || path.startsWith(href) && href !== '/');

function header(path, solid) {
  const items = NAV.map((n) => {
    const cur = here(path, n.href) ? ' aria-current="page"' : '';
    if (!n.menu) return `<a class="nav__link" href="${n.href}"${cur}>${n.label}</a>`;
    return `<div class="nav__item"><a class="nav__link" href="${n.href}"${cur}>${n.label}<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></a>
      <div class="menu"><div class="menu__in">${n.menu.map(([l, h, d]) => `<a href="${h}"><b>${l}</b><span>${d}</span></a>`).join('')}</div></div></div>`;
  }).join('');
  const drawer = NAV.map((n) => `<a href="${n.href}">${n.label}</a>${n.menu ? `<div class="drawer__sub">${n.menu.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}</div>` : ''}`).join('');
  return `<header class="nav${solid ? ' scrolled' : ''}" id="nav"><div class="nav__bar">
    <a class="brand" href="/" aria-label="${SITE.name}, home"><svg class="brand__mark" viewBox="0 0 64 64" width="30" height="30" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M8 14 L20 50 L32 22 L44 50 L56 14"/></svg><span class="brand__text"><b>Westdale</b><small>Financial Services</small></span></a>
    <nav class="nav__links" aria-label="Primary">${items}</nav>
    <a class="btn btn--gold btn--sm nav__cta" href="/book-a-consultation/" data-magnetic>Book a Consultation</a>
    <button class="burger" id="burger" aria-expanded="false" aria-controls="drawer" aria-label="Open menu"><span></span><span></span></button>
  </div><div class="progress" id="progress" aria-hidden="true"></div></header>
  <div class="drawer" id="drawer" hidden><nav aria-label="Mobile">${drawer}<a href="/client-planner/">Client Planner</a></nav><a class="btn btn--gold btn--block" href="/book-a-consultation/">Book a Consultation</a></div>`;
}

function footer() {
  return `<footer class="foot"><div class="foot__cta wrap"><h2>Ready to talk it through?</h2><a class="btn btn--gold btn--lg" href="/book-a-consultation/">Book a Consultation</a></div>
  <div class="wrap foot__grid">
    <div><p class="foot__brand">Westdale <small>Financial Services</small></p><p>${SITE.tagline}</p>
      <p><a href="mailto:${SITE.email}">${SITE.email}</a></p><p>Serving ${SITE.area}, Ontario</p>
      <!-- TODO(client): verified street address and phone number. -->
    </div>
    <nav aria-label="Services"><h3>Services</h3>${SERVICES.map((s) => `<a href="/services/${s.slug}/">${s.nav}</a>`).join('')}</nav>
    <nav aria-label="Explore"><h3>Explore</h3><a href="/your-retirement-map/">Your Retirement Map</a><a href="/planning-systems/">Planning Systems</a><a href="/our-process/">Our Process</a><a href="/about-steve/">About Steve</a><a href="/resources/">Resources</a><a href="/client-planner/">Client Planner</a><a href="/contact/">Contact</a></nav>
    <nav aria-label="Legal"><h3>Legal</h3><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/disclosures/">Disclosures</a></nav>
  </div>
  <div class="wrap foot__legal"><p>Illustrations on this site are hypothetical and educational. Investing involves risk; returns are not guaranteed. Nothing here is personalized advice.</p><p>&copy; ${new Date().getFullYear()} ${SITE.name}</p></div></footer>
  <div class="mobile-cta"><a class="btn btn--gold btn--block" href="/book-a-consultation/">Book a Consultation</a></div>`;
}

const LOADER = `<div class="loader" id="loader" aria-hidden="true"><div class="loader__inner"><svg class="loader__mark" viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5"><path class="draw" d="M8 14 L20 50 L32 22 L44 50 L56 14"/><path class="draw d2" d="M8 56 H56" stroke-linecap="round"/></svg><p class="loader__name">${SITE.name}</p><p class="loader__tag">${SITE.tagline}</p></div></div>`;

export function page({ path, title, desc, body, robots = 'index,follow', ld, og = true }) {
  const url = SITE.url + path;
  const full = path === '/' ? title : `${title} | ${SITE.name}`;
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0b1626">
${og ? `<meta property="og:type" content="website"><meta property="og:site_name" content="${SITE.name}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE.url}/assets/img/og.png"><meta name="twitter:card" content="summary_large_image">` : ''}
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/fraunces-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<script src="/assets/js/boot.js"></script>
<link rel="stylesheet" href="/assets/css/site.css">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}
</head>
<body data-path="${path}">
<a class="skip" href="#main">Skip to main content</a>
${LOADER}
${header(path, !body.includes('class="hero '))}
<main id="main">
${body}
</main>
${footer()}
<script type="module" src="/assets/js/app.js"></script>
</body>
</html>
`;
}
