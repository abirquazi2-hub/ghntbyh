import { SITE, SERVICES, PROGRAMS, PROCESS, TOPICS } from './content.mjs';
import { page, esc, topicUrl } from './layout.mjs';

const svc = (slug) => SERVICES.find((s) => s.slug === slug);
const prog = (id) => PROGRAMS.find((p) => p.id === id);
const DISCLAIM = 'Illustration only. Hypothetical, constant-rate projection; investment returns are not guaranteed and actual results will vary, including losses. Does not account for fees, taxes or inflation. This tool does not constitute personalized investment advice.';

/* ---------- components ---------- */
const hero = ({ eyebrow, title, lede, ctas = '', scene = 'landscape', home = false, crumbs = [] }) => `
<section class="hero ${home ? 'hero--home' : 'hero--page'}" id="top" aria-labelledby="hero-title">
  <canvas class="hero__canvas" id="hero-canvas" data-scene="${scene}" aria-hidden="true"></canvas>
  <div class="hero__fallback" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div class="hero__copy">
      ${crumbs.length ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a>${crumbs.map(([l, h]) => ` <span aria-hidden="true">/</span> ${h ? `<a href="${h}">${l}</a>` : `<span aria-current="page">${l}</span>`}`).join('')}</nav>` : ''}
      <p class="eyebrow">${eyebrow}</p>
      <h1 id="hero-title">${title}</h1>
      <p class="lede">${lede}</p>
      <div class="hero__ctas">${ctas}</div>
    </div>
    ${home ? `<aside class="hero__card" aria-label="Firm facts"><p class="hero__card-label">The practice</p><dl>
      <div><dt>Founded</dt><dd>${SITE.founded}</dd></div>
      <div><dt>Experience</dt><dd>${SITE.years}+ years in financial services</dd></div>
      <div><dt>Serving</dt><dd>${SITE.households}+ households, greater Hamilton</dd></div></dl></aside>` : ''}
  </div>
  ${home ? '<a class="hero__scroll" href="#proof" aria-label="Scroll to next section"><span></span></a>' : ''}
</section>`;

const head = (eyebrow, title, p = '', light = false) => `<div class="head reveal ${light ? 'head--light' : ''}"><p class="eyebrow ${light ? '' : 'eyebrow--dark'}">${eyebrow}</p><h2>${title}</h2>${p ? `<p>${p}</p>` : ''}</div>`;

const proof = () => `<section class="proof" id="proof" aria-label="Westdale at a glance"><div class="wrap proof__grid">
  <div class="stat"><span class="stat__n" data-count="${SITE.years}" data-suffix="+">${SITE.years}+</span><span class="stat__l">Years in financial services</span></div>
  <div class="stat"><span class="stat__n" data-count="${SITE.founded}">${SITE.founded}</span><span class="stat__l">Westdale Financial Services founded</span></div>
  <div class="stat"><span class="stat__n" data-count="${SITE.households}" data-suffix="+">${SITE.households}+</span><span class="stat__l">Households served in the greater Hamilton area</span></div>
  <div class="stat"><span class="stat__n">CFP</span><span class="stat__l">Professional credential held by Stephen Fricker</span></div></div></section>`;

const serviceGrid = () => `<div class="sgrid">${SERVICES.map((s) => `<a class="scard tilt reveal" href="/services/${s.slug}/"><span class="scard__n">${s.n}</span><h3>${s.title}</h3><p>${s.short}</p><span class="scard__go">Explore <i aria-hidden="true">→</i></span></a>`).join('')}</div>`;

const processList = () => `<ol class="proc">${PROCESS.map(([t, d], i) => `<li class="reveal"><span>0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>`;

const systemsList = (only) => `<div class="sys" id="sys-list">${(only ? PROGRAMS.filter((p) => only.includes(p.id)) : PROGRAMS).map((p) => `
  <div class="sysi tilt"><h3><button aria-expanded="false" aria-controls="sys-${p.id}">${p.title}</button></h3>
  <div id="sys-${p.id}" hidden><p>${p.text}</p><p class="sysi__links">${p.href ? `<a href="${p.href}">Explore the interactive overview →</a> ` : ''}<a href="/services/${p.service}/">Related: ${svc(p.service).nav}</a> <a href="${topicUrl(svc(p.service).topic)}">Ask Steve about this →</a></p></div></div>`).join('')}</div>`;

const mapSection = (own = false) => `<section class="map" id="retirement-map" aria-labelledby="map-title"><div class="wrap">
  <div class="head head--light reveal"><p class="eyebrow">${own ? 'Interactive' : 'A Westdale planning program'}</p><h2 id="map-title">${own ? 'Move through <em>the journey.</em>' : 'Your Retirement Map.<br><em>See the path before you take it.</em>'}</h2>
  <p>Retirement planning is a journey with distinct stages. Move through them to see the questions each one raises. Ages are illustrative, not a prediction for any individual.</p></div>
  <div class="rm" id="rm"><div class="rm__stage" aria-live="polite"><p class="rm__age"><span id="rm-age-out">35</span><small>illustrative age</small></p><h3 id="rm-title">Planning</h3><p id="rm-body"></p><ul id="rm-q" class="rm__q"></ul></div>
  <div class="rm__track"><svg class="rm__svg" viewBox="0 0 700 120" role="img" aria-label="Seven stages of the retirement journey: Today, Planning, Accumulation, Transition, Retirement, Income, Legacy"><path d="M30 80 C 130 80, 140 30, 230 40 S 380 90, 470 50 S 620 20, 670 40" class="rm__path"/><path d="M30 80 C 130 80, 140 30, 230 40 S 380 90, 470 50 S 620 20, 670 40" class="rm__path rm__path--on" id="rm-on"/><g id="rm-dots"></g></svg>
  <ol class="rm__steps" id="rm-steps"></ol>
  <label class="rm__slider" for="rm-range"><span>Drag through the journey</span><input type="range" id="rm-range" min="0" max="6" step="1" value="1" aria-describedby="rm-note"></label>
  <p class="note" id="rm-note">General planning concepts for education only. Your Retirement Map itself is prepared with Steve as part of your plan.</p></div></div></div></section>`;

const illustrator = () => `<div class="ill">
  <form class="ill__controls" onsubmit="return false" aria-label="Illustration inputs">
    <label>Starting amount <output id="o-start">$10,000</output><input type="range" id="i-start" min="0" max="500000" step="1000" value="10000"></label>
    <label>Monthly contribution <output id="o-month">$500</output><input type="range" id="i-month" min="0" max="5000" step="50" value="500"></label>
    <label>Time horizon <output id="o-years">25 years</output><input type="range" id="i-years" min="1" max="40" step="1" value="25"></label>
    <label>Illustrative annual return <output id="o-rate">5.0%</output><input type="range" id="i-rate" min="0" max="10" step="0.5" value="5"></label>
  </form>
  <figure class="ill__chart"><svg id="ill-svg" viewBox="0 0 640 340" role="img" aria-labelledby="ill-cap"></svg>
  <div class="ill__legend"><span class="k k--a"></span>Contributions <span class="k k--b"></span>Illustrative value</div><figcaption id="ill-cap" class="ill__sum" aria-live="polite"></figcaption></figure></div>
  <p class="disclaimer">${DISCLAIM}</p>`;

const buildPlan = () => `<div class="bp" id="bp"><div class="bp__choices" role="group" aria-label="Your stage">
  <button data-stage="prep" aria-pressed="false">Preparing for retirement</button><button data-stage="near" aria-pressed="false">Approaching retirement</button>
  <button data-stage="in" aria-pressed="false">Already retired</button><button data-stage="legacy" aria-pressed="false">Planning for family / legacy</button></div>
  <div class="bp__out" id="bp-out" aria-live="polite" hidden><h3 id="bp-h"></h3><ol id="bp-list" class="bp__list"></ol>
  <a class="btn btn--gold" id="bp-cta" href="/book-a-consultation/">Book a consultation</a><p class="note">Educational overview only. A real plan starts with a conversation and your full circumstances.</p></div></div>`;

const steveBlock = (full) => `<section class="steve" id="steve" aria-labelledby="steve-title"><div class="wrap steve__grid">
  <div class="steve__photo reveal"><div class="tilt tilt--photo"><img src="/assets/img/steve-fricker.png" width="312" height="437" alt="Portrait of Stephen Fricker, CFP" loading="lazy" decoding="async"></div></div>
  <div class="steve__copy reveal"><p class="eyebrow">About Steve</p><h2 id="steve-title">Stephen Fricker, <em>CFP</em></h2>
  <p class="big">Steve founded Westdale Financial Services in ${SITE.founded} and has more than ${SITE.years} years of experience in financial services. He works with more than ${SITE.households} households in the greater Hamilton area.</p>
  <p>Steve holds the Certified Financial Planner (CFP) designation. Professional affiliations and registration details are on the <a href="/disclosures/">disclosures</a> page.</p>
  <div class="steve__ctas"><a class="btn btn--gold" href="/book-a-consultation/">Talk to Steve</a>${full ? '' : '<a class="tlink tlink--light" href="/about-steve/">More about Steve →</a>'}<a class="tlink tlink--light" href="mailto:${SITE.email}">${SITE.email}</a></div></div></div></section>`;

const form = () => `<form class="form" id="cform" method="post" action="/api/consultation" novalidate>
  <div class="form__row"><div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required maxlength="100"><p class="err" data-for="name"></p></div>
  <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="200"><p class="err" data-for="email"></p></div></div>
  <div class="form__row"><div class="field"><label for="f-phone">Phone <span>(optional)</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="30"><p class="err" data-for="phone"></p></div>
  <div class="field"><label for="f-topic">What would you like to discuss?</label><select id="f-topic" name="topic" required><option value="">Choose a topic</option>${TOPICS.map((t) => `<option>${t}</option>`).join('')}</select><p class="err" data-for="topic"></p></div></div>
  <fieldset class="field"><legend>Preferred contact method</legend><label class="pill"><input type="radio" name="contactMethod" value="Email" checked><span>Email</span></label><label class="pill"><input type="radio" name="contactMethod" value="Phone"><span>Phone</span></label></fieldset>
  <div class="field"><label for="f-msg">Message <span>(optional)</span></label><textarea id="f-msg" name="message" rows="4" maxlength="1500"></textarea><p class="err" data-for="message"></p></div>
  <div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>
  <div class="field field--check"><label><input type="checkbox" name="consent" required> <span>I agree that Westdale Financial Services may use the details above to respond to my enquiry, as described in the <a href="/privacy/">Privacy Policy</a>.</span></label><p class="err" data-for="consent"></p></div>
  <div id="turnstile" class="turnstile"></div>
  <button class="btn btn--gold btn--lg btn--block" type="submit" id="c-submit">Request a consultation</button><p class="form__status" id="c-status" role="status" aria-live="polite"></p>
  <noscript><p class="form__status">This form needs JavaScript. Please email <a href="mailto:${SITE.email}">${SITE.email}</a> instead.</p></noscript></form>`;

const consultBlock = () => `<section class="consult" id="consultation" aria-labelledby="c-title"><div class="wrap consult__grid">
  <div class="consult__intro reveal"><p class="eyebrow">Book a consultation</p><h2 id="c-title">Start with a <em>conversation.</em></h2>
  <p>Tell us a little about what you’d like to discuss and how to reach you. Steve will follow up directly using your preferred contact method.</p>
  <p class="warn"><strong>Please don’t send sensitive information here.</strong> Do not include account numbers, SIN, passwords or detailed financial information. We’ll cover what’s needed securely after we speak.</p></div>${form()}</section>`;

const related = (cur) => `<div class="sgrid sgrid--3">${SERVICES.filter((s) => s.slug !== cur).slice(0, 3).map((s) => `<a class="scard tilt" href="/services/${s.slug}/"><span class="scard__n">${s.n}</span><h3>${s.title}</h3><p>${s.short}</p><span class="scard__go">Explore <i aria-hidden="true">→</i></span></a>`).join('')}</div>`;

const ctas = (t = '') => `<a class="btn btn--gold btn--lg" href="${t ? topicUrl(t) : '/book-a-consultation/'}" data-magnetic>Book a Consultation</a><a class="btn btn--ghost btn--lg" href="/client-planner/">Start Your Financial Plan</a>`;
const ld = { '@context': 'https://schema.org', '@type': 'FinancialService', name: SITE.name, url: SITE.url + '/', email: SITE.email, foundingDate: String(SITE.founded), areaServed: 'Greater Hamilton area, Ontario, Canada', founder: { '@type': 'Person', name: 'Stephen Fricker', honorificSuffix: 'CFP', jobTitle: 'Financial Planner' }, address: { '@type': 'PostalAddress', addressLocality: 'Hamilton', addressRegion: 'ON', addressCountry: 'CA' } };

/* ---------- pages: { path: html } ---------- */
export function buildPages() {
  const P = {};

  P['/'] = page({ path: '/', title: 'Westdale Financial Services | Financial Planner in Hamilton, Ontario', ld,
    desc: 'Westdale Financial Services, led by Stephen Fricker, CFP, offers financial planning and investment guidance to households in the greater Hamilton area. Book a consultation.',
    body: hero({ home: true, eyebrow: 'Hamilton, Ontario &nbsp;·&nbsp; Financial planning &amp; investment guidance', title: 'Informed decisions for <em>your financial future.</em>',
      lede: 'Westdale Financial Services helps people in the greater Hamilton area make informed decisions about their financial future, through experienced financial planning and investment guidance.',
      ctas: `${ctas()}<div class="hero__links"><a class="tlink" href="${topicUrl('')}">Talk to Steve <span aria-hidden="true">→</span></a><a class="tlink" href="/build-your-retirement-plan/">Build Your Retirement Plan <span aria-hidden="true">→</span></a></div>` })
    + proof()
    + `<section class="section" id="planning"><div class="wrap split"><div class="reveal"><p class="eyebrow eyebrow--dark">Planning first</p><h2>A plan built around your household, <em>not a product.</em></h2></div>
      <div class="reveal"><p class="big">Westdale works through a structured planning process: gathering information, running planning calculations, researching products where appropriate, and presenting customized proposals for your review.</p><p>Planning continues after implementation, with ongoing service for clients. See the <a href="/our-process/">full process</a> or go straight to a <a href="/book-a-consultation/">conversation with Steve</a>.</p></div></div></section>`
    + `<section class="section section--tint" id="services"><div class="wrap">${head('Services', 'Six areas of <em>financial planning.</em>', 'Each area has its own page explaining what it addresses, who it may be relevant to and how Westdale approaches it.')}${serviceGrid()}</div></section>`
    + mapSection() + `<div class="center center--dark"><a class="btn btn--gold" href="/your-retirement-map/">Explore Your Retirement Map</a></div>`
    + `<section class="section" id="illustrator"><div class="wrap">${head('Interactive illustration', 'See how time can affect <em>an illustrative portfolio.</em>', 'Adjust the inputs to explore how contributions and time interact. This is a simple mathematical illustration, not a forecast.')}${illustrator()}</div></section>`
    + `<section class="section section--navy" id="systems"><div class="wrap">${head('Planning systems', 'Westdale’s own <em>planning programs.</em>', 'Eight programs used in Westdale’s planning work.', true)}<div class="sysgrid">${PROGRAMS.map((p) => `<a class="sysmini" href="/planning-systems/#sys-${p.id}"><span>${p.title}</span><i aria-hidden="true">→</i></a>`).join('')}</div></div></section>`
    + `<section class="section section--tint" id="process"><div class="wrap">${head('Our process', 'From first conversation to <em>ongoing service.</em>')}${processList()}</div></section>`
    + steveBlock(false) + consultBlock() });

  P['/services/'] = page({ path: '/services/', title: 'Financial Planning Services in Hamilton', desc: 'Retirement income and tax planning, investments, insurance, pensions and severance, inheritance and wealth transfer, and planning for young families, from Westdale Financial Services in Hamilton.',
    body: hero({ eyebrow: 'Services', title: 'Six areas of <em>financial planning.</em>', lede: 'Westdale advises households on the decisions that shape their financial future. Choose an area to learn more.', ctas: ctas(), scene: 'stack', crumbs: [['Services']] })
    + `<section class="section"><div class="wrap">${serviceGrid()}</div></section><section class="section section--tint"><div class="wrap">${head('How it works', 'Every area follows <em>the same process.</em>')}${processList()}</div></section>` });

  for (const s of SERVICES) {
    P[`/services/${s.slug}/`] = page({ path: `/services/${s.slug}/`, title: s.title, desc: `${s.short} ${s.lede.split('. ')[0]}. Westdale Financial Services, Hamilton.`,
      body: hero({ eyebrow: `Service ${s.n}`, title: s.title.replace(/(&.*|\S+)$/, '<em>$1</em>'), lede: s.lede, ctas: ctas(s.topic), scene: s.scene, crumbs: [['Services', '/services/'], [s.nav]] })
      + `<section class="section"><div class="wrap svcp"><div class="svcp__main">
          <div class="reveal"><h2>What it addresses</h2><ul class="ticks">${s.addresses.map((a) => `<li>${a}</li>`).join('')}</ul></div>
          <div class="reveal"><h2>May be relevant to</h2><ul class="ticks">${s.relevant.map((a) => `<li>${a}</li>`).join('')}</ul></div>
          <div class="reveal"><h2>Questions worth asking</h2><div class="qgrid">${s.questions.map((q, i) => `<div class="qcard"><span>0${i + 1}</span><p>${q}</p></div>`).join('')}</div></div>
          ${s.note ? `<p class="callout reveal">${s.note}</p>` : ''}
        </div><aside class="svcp__side"><div class="sidecard"><h3>How the planning works</h3><ol class="mini">${PROCESS.slice(0, 5).map(([t]) => `<li>${t}</li>`).join('')}</ol><a href="/our-process/">See the full process →</a></div>
          ${s.programs.length ? `<div class="sidecard"><h3>Related Westdale programs</h3><ul class="plain">${s.programs.map((id) => `<li><a href="${prog(id).href || '/planning-systems/#sys-' + id}">${prog(id).title}</a></li>`).join('')}</ul></div>` : ''}
          <a class="btn btn--gold btn--block" href="${topicUrl(s.topic)}">Discuss this with Steve</a></aside></div></section>
        <section class="section section--tint"><div class="wrap">${head('Keep exploring', 'Other <em>areas of planning.</em>')}${related(s.slug)}</div></section>` });
  }

  P['/your-retirement-map/'] = page({ path: '/your-retirement-map/', title: 'Your Retirement Map', desc: 'Your Retirement Map is a Westdale Financial Services planning program that shows the path from today through retirement, income and legacy. Explore the stages.',
    body: hero({ eyebrow: 'A Westdale planning program', title: 'Your Retirement Map. <em>See the path before you take it.</em>', lede: 'From today through planning, accumulation, transition, retirement, income and legacy: a clear view of the journey and the decisions along it.', ctas: ctas('Retirement planning'), scene: 'rings', crumbs: [['Your Retirement Map']] })
    + mapSection(true)
    + `<section class="section"><div class="wrap">${head('The seven stages', 'Questions that <em>belong to each stage.</em>', 'General planning concepts. Your own map is prepared with Steve around your circumstances.')}<div class="stages" id="stage-cards"></div></div></section>`
    + `<section class="section section--tint"><div class="wrap split"><div><p class="eyebrow eyebrow--dark">Related</p><h2>Retirement planning, <em>end to end.</em></h2></div><div><p class="big">Your Retirement Map sits alongside Westdale’s work on retirement income, taxation and pensions.</p><ul class="plain plain--big"><li><a href="/services/retirement-income-tax-planning/">Retirement Income &amp; Tax Planning</a></li><li><a href="/services/severance-pension-transfers/">Severance &amp; Pension Transfers</a></li><li><a href="/build-your-retirement-plan/">Build your retirement plan</a></li></ul></div></div></section>` });

  P['/planning-systems/'] = page({ path: '/planning-systems/', title: 'Planning Systems', desc: 'Westdale’s planning programs: Your Retirement Map, Portfolio Recovery Strategy Program, Estate Capital Management System, Commuted Value Proposal System and more.',
    body: hero({ eyebrow: 'Planning systems', title: 'Westdale’s own <em>planning programs.</em>', lede: 'Eight programs used in Westdale’s planning work. Select one to read more and see the service it relates to.', ctas: ctas(), scene: 'stack', crumbs: [['Planning Systems']] })
    + `<section class="section"><div class="wrap">${systemsList()}</div></section>` });

  P['/our-process/'] = page({ path: '/our-process/', title: 'Our Planning Process', desc: 'How Westdale Financial Services plans: information gathering, planning calculations, product research, customized proposals, review, implementation and ongoing service.',
    body: hero({ eyebrow: 'Our process', title: 'From first conversation to <em>ongoing service.</em>', lede: 'A structured process, from understanding your household to continued planning over time.', ctas: ctas(), scene: 'rings', crumbs: [['Our Process']] })
    + `<section class="section"><div class="wrap"><ol class="vproc">${PROCESS.map(([t, d], i) => `<li class="reveal"><span>0${i + 1}</span><div><h2>${t}</h2><p>${d}</p></div></li>`).join('')}</ol></div></section>` });

  P['/about-steve/'] = page({ path: '/about-steve/', title: 'About Steve Fricker, CFP', desc: 'Stephen Fricker, CFP founded Westdale Financial Services in 2006 and has more than 34 years of experience in financial services, serving households in the greater Hamilton area.',
    ld: { '@context': 'https://schema.org', '@type': 'Person', name: 'Stephen Fricker', honorificSuffix: 'CFP', jobTitle: 'Financial Planner', worksFor: { '@type': 'FinancialService', name: SITE.name }, email: SITE.email },
    body: hero({ eyebrow: 'About Steve', title: 'Stephen Fricker, <em>CFP</em>', lede: `Founder of Westdale Financial Services, with more than ${SITE.years} years of experience in financial services.`, ctas: ctas(), scene: 'prism', crumbs: [['About Steve']] })
    + proof() + steveBlock(true)
    + `<section class="section"><div class="wrap split"><div class="reveal"><p class="eyebrow eyebrow--dark">Credentials &amp; affiliations</p><h2>What you can <em>verify.</em></h2></div><div class="reveal"><ul class="ticks"><li>Certified Financial Planner (CFP) designation</li><li>Westdale Financial Services founded in ${SITE.founded}</li><li>More than ${SITE.years} years in financial services</li></ul><p>Registrations, licensing and affiliations are listed on the <a href="/disclosures/">disclosures</a> page.</p></div></div></section>` });

  P['/resources/'] = page({ path: '/resources/', title: 'Resources', desc: 'Tools and resources from Westdale Financial Services: the client planner, a growth illustration and a retirement plan builder.',
    body: hero({ eyebrow: 'Resources &amp; client access', title: 'Tools for <em>clients and visitors.</em>', lede: 'Educational tools and client access in one place.', ctas: ctas(), scene: 'stack', crumbs: [['Resources']] })
    + `<section class="section"><div class="wrap"><div class="res">
      <a class="res__card tilt" href="/client-planner/"><h3>Client Planner</h3><p>Westdale’s client planner.</p><span>Open →</span></a>
      <a class="res__card tilt" href="/investment-illustration/"><h3>Growth illustration</h3><p>An educational, hypothetical look at time and contributions.</p><span>Try it →</span></a>
      <a class="res__card tilt" href="/build-your-retirement-plan/"><h3>Build your retirement plan</h3><p>A short educational journey by stage of life.</p><span>Start →</span></a>
      <a class="res__card tilt" href="/your-retirement-map/"><h3>Your Retirement Map</h3><p>Explore the stages from today to legacy.</p><span>Explore →</span></a>
      <a class="res__card tilt" href="/planning-systems/"><h3>Planning systems</h3><p>The eight programs behind Westdale’s planning work.</p><span>Explore →</span></a>
      <a class="res__card tilt" href="/our-process/"><h3>Our process</h3><p>How planning works, step by step.</p><span>See it →</span></a></div></div></section>` });

  P['/investment-illustration/'] = page({ path: '/investment-illustration/', title: 'Growth Illustration', desc: 'An interactive, hypothetical illustration of how contributions and time can affect an illustrative portfolio. Not a forecast or personalized advice.',
    body: hero({ eyebrow: 'Interactive illustration', title: 'See how time can affect <em>an illustrative portfolio.</em>', lede: 'Adjust the inputs to explore how contributions and time interact. A simple mathematical illustration, not a forecast.', ctas: ctas('Investment planning'), scene: 'stack', crumbs: [['Resources', '/resources/'], ['Growth illustration']] })
    + `<section class="section"><div class="wrap">${illustrator()}</div></section>` });

  P['/build-your-retirement-plan/'] = page({ path: '/build-your-retirement-plan/', title: 'Build Your Retirement Plan', desc: 'A short educational journey for people preparing for, approaching or already in retirement, or planning for family and legacy. No financial details needed.',
    body: hero({ eyebrow: 'Build your retirement plan', title: 'Where are you <em>today?</em>', lede: 'Choose a stage for a short educational overview. We never ask for financial details here.', ctas: ctas('Retirement planning'), scene: 'rings', crumbs: [['Resources', '/resources/'], ['Build your retirement plan']] })
    + `<section class="section section--navy"><div class="wrap">${buildPlan()}</div></section>` });

  P['/client-planner/'] = page({ path: '/client-planner/', title: 'Client Planner', desc: 'Westdale Financial Services client planner.',
    body: hero({ eyebrow: 'Client access', title: 'Client <em>Planner</em>', lede: 'The Client Planner is part of Westdale’s planning process.', ctas: ctas(), scene: 'stack', crumbs: [['Client Planner']] })
    + `<section class="section"><div class="wrap page"><p class="banner"><strong>Content to migrate.</strong> This route replaces https://www.westdalefinancial.com/client-planner/. That page could not be read while building this site, so its content has not been reproduced. Copy it, and any forms, here before launch.</p><p>To get started or to request the planner, <a href="/book-a-consultation/">book a consultation</a> or email <a href="mailto:${SITE.email}">${SITE.email}</a>. Please do not email account numbers or other sensitive information.</p></div></section>` });

  P['/book-a-consultation/'] = page({ path: '/book-a-consultation/', title: 'Book a Consultation', desc: 'Book a consultation with Stephen Fricker, CFP at Westdale Financial Services in Hamilton, Ontario.',
    body: hero({ eyebrow: 'Book a consultation', title: 'Start with a <em>conversation.</em>', lede: 'A few details are all we need. Please do not send sensitive financial information through this form.', scene: 'prism', crumbs: [['Book a Consultation']] }) + consultBlock() });

  P['/contact/'] = page({ path: '/contact/', title: 'Contact', desc: 'Contact Westdale Financial Services, serving the greater Hamilton area, Ontario.',
    body: hero({ eyebrow: 'Contact', title: SITE.name, lede: 'Serving the greater Hamilton area, Ontario.', ctas: ctas(), scene: 'prism', crumbs: [['Contact']] })
    + `<section class="section"><div class="wrap split"><div><h2>Get in touch</h2><p class="big">Email: <a href="mailto:${SITE.email}">${SITE.email}</a></p><p>Serving ${SITE.area}, Ontario.</p><!-- TODO(client): add verified street address and phone number. --></div><div><p class="warn warn--dark"><strong>Please don’t send sensitive information</strong> such as account numbers or SIN by email or through the form.</p><a class="btn btn--navy" href="/book-a-consultation/">Use the consultation form</a></div></div></section>` });

  const BAN = '<p class="banner"><strong>Draft for review.</strong> This page is a clearly marked placeholder, not reviewed legal advice. Westdale Financial Services should have its legal and compliance professionals review and finalize it before launch.</p>';
  const legal = (path, title, desc, inner) => page({ path, title, desc, robots: 'noindex', body: `<div class="wrap page page--top">${`<h1>${title}</h1>`}${BAN}${inner}</div>` });
  P['/privacy/'] = legal('/privacy/', 'Privacy Policy', 'How Westdale Financial Services handles personal information submitted through this website.', `<h2>What we collect</h2><p>When you use the consultation form we collect your name, email address, optional phone number, chosen topic, preferred contact method, optional message, and your consent. We ask you not to submit sensitive financial or account information through the form.</p><h2>How it is used</h2><p>To respond to your enquiry. The request is delivered by email to Westdale Financial Services. The website does not store submissions in a database.</p><h2>Service providers</h2><p>Email delivery is handled by an email service provider, and an optional spam-protection service (Cloudflare Turnstile) may be used on the form. <em>[Business to confirm providers, where data is processed, and retention period.]</em></p><h2>Cookies</h2><p>The form uses one short-lived, strictly necessary security cookie to protect against forged submissions. No advertising or analytics cookies are used by this site.</p><h2>Your rights and contact</h2><p>To ask about or request correction of your personal information, email <a href="mailto:${SITE.email}">${SITE.email}</a>. <em>[Business and counsel to add PIPEDA-aligned wording, privacy officer details and complaint process.]</em></p>`);
  P['/terms/'] = legal('/terms/', 'Terms of Use', 'Terms of use for the Westdale Financial Services website.', '<h2>General information only</h2><p>Content on this website, including the interactive illustrations, is general and educational. It is not personalized financial, investment, tax, legal or insurance advice, and does not create an advisory relationship.</p><h2>Hypothetical illustrations</h2><p>Illustrations use user-chosen assumptions and are not forecasts. Investment returns are not guaranteed and actual results will vary, including loss of capital.</p><h2>Other terms</h2><p><em>[Business and counsel to add limitation of liability, intellectual property, linking and governing-law terms.]</em></p>');
  P['/disclosures/'] = legal('/disclosures/', 'Disclosures', 'Regulatory and professional disclosures for Westdale Financial Services.', '<h2>Professional designation</h2><p>Stephen Fricker holds the Certified Financial Planner (CFP) designation.</p><h2>Registrations, licences and affiliations</h2><p><em>[To be completed from the existing westdalefinancial.com disclosures: registrations, licensing, sponsoring firms and affiliations, exactly as currently stated. None have been added here because they could not be verified.]</em></p><h2>Investment risk</h2><p>Investments are not guaranteed, values change frequently and past performance may not be repeated. Read the relevant offering documents before investing.</p>');

  return P;
}

export const sitemapPaths = (P) => Object.keys(P).filter((p) => !['/privacy/', '/terms/', '/disclosures/'].includes(p));
