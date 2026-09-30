const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cad = (n) => n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

/* ---------- Planning systems accordion ---------- */
function systems() {
  const toggle = (btn, open) => { btn.setAttribute('aria-expanded', open); $('#' + btn.getAttribute('aria-controls')).hidden = !open; };
  $$('#sys-list button').forEach((b) => b.addEventListener('click', () => toggle(b, b.getAttribute('aria-expanded') !== 'true')));
  const fromHash = () => { const id = location.hash.slice(1); const b = id && $(`#sys-list button[aria-controls="${CSS.escape(id)}"]`); if (b) { toggle(b, true); b.closest('.sysi').scrollIntoView({ block: 'center' }); } };
  fromHash(); addEventListener('hashchange', fromHash);
}

/* ---------- Your Retirement Map ---------- */
const STAGES = [
  { n: 'Today', age: 30, body: 'Everything starts with where you are now: income, goals, commitments and the questions on your mind.', q: ['What do I want retirement to look like?', 'What do I already have in place?'] },
  { n: 'Planning', age: 35, body: 'A plan turns goals into a structured picture, with assumptions written down and tested.', q: ['Which goals come first?', 'How sensitive is the plan to changes?'] },
  { n: 'Accumulation', age: 45, body: 'Years of saving and investing. The focus is on keeping the plan on course as life changes.', q: ['How much risk fits my plan?', 'How do taxes affect what I save?'] },
  { n: 'Transition', age: 58, body: 'The years before and around leaving work, when decisions about pensions, severance and timing tend to arrive.', q: ['When could I stop working?', 'What should I know before a pension decision?'] },
  { n: 'Retirement', age: 65, body: 'The shift from building savings to relying on them, where the plan is put into practice.', q: ['What will my income sources be?', 'What could change my plan?'] },
  { n: 'Income', age: 72, body: 'Drawing income in a tax-aware way and revisiting the plan as circumstances change.', q: ['How should I draw income?', 'When should I review the plan?'] },
  { n: 'Legacy', age: 85, body: 'Thinking about how wealth passes to family and the wishes you want honoured.', q: ['Who should benefit?', 'How is my estate organized?'] },
];
function retirementMap({ reduced }) {
  const range = $('#rm-range'); if (!range) return;
  const steps = $('#rm-steps'), dots = $('#rm-dots'), on = $('#rm-on');
  const NS = 'http://www.w3.org/2000/svg';
  const len = on.getTotalLength();
  on.style.strokeDasharray = len;
  STAGES.forEach((s, i) => { const li = document.createElement('li'); li.textContent = s.n; steps.append(li); const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 7); dots.append(c); s._c = c; s._li = li; });
  const place0 = () => STAGES.forEach((s) => { s._li.style.left = (+s._c.getAttribute('cx') / 7) + '%'; });
  const place = () => STAGES.forEach((s, i) => { const p = on.getPointAtLength((len * i) / (STAGES.length - 1)); s._c.setAttribute('cx', p.x); s._c.setAttribute('cy', p.y); });
  place(); place0();
  let cur = -1, raf = 0, shownAge = 0;
  const render = () => {
    const i = +range.value; if (i === cur) return; cur = i; const s = STAGES[i];
    $('#rm-title').textContent = s.n; $('#rm-body').textContent = s.body;
    $('#rm-q').innerHTML = ''; s.q.forEach((q) => { const li = document.createElement('li'); li.textContent = q; $('#rm-q').append(li); });
    on.style.transition = reduced ? 'none' : 'stroke-dashoffset .8s cubic-bezier(.22,.8,.2,1)';
    on.style.strokeDashoffset = len - (len * i) / (STAGES.length - 1);
    STAGES.forEach((x, j) => { x._li.classList.toggle('on', j <= i); x._c.setAttribute('fill', j <= i ? '#c2a265' : '#13243b'); x._c.setAttribute('stroke', '#c2a265'); x._c.setAttribute('r', j === i ? 10 : 6); });
    const out = $('#rm-age-out'), to = s.age, from = shownAge || to;
    cancelAnimationFrame(raf);
    if (reduced) { out.textContent = to; shownAge = to; return; }
    const t0 = performance.now();
    const step = (t) => { const p = Math.min((t - t0) / 600, 1); out.textContent = Math.round(from + (to - from) * p); if (p < 1) raf = requestAnimationFrame(step); else shownAge = to; };
    raf = requestAnimationFrame(step);
  };
  range.addEventListener('input', render);
  range.setAttribute('aria-valuetext', '');
  range.addEventListener('input', () => range.setAttribute('aria-valuetext', `${STAGES[+range.value].n}, illustrative age ${STAGES[+range.value].age}`));
  render();
}

function stageCards() {
  const host = $('#stage-cards'); if (!host) return;
  host.innerHTML = STAGES.map((s, i) => `<article class="stage reveal"><span>0${i + 1}</span><h3>${s.n}</h3><p>${s.body}</p><ul>${s.q.map((q) => `<li>${q}</li>`).join('')}</ul></article>`).join('');
  host.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
}

/* ---------- Illustrative growth chart ---------- */
function illustrator({ reduced }) {
  const svg = $('#ill-svg'); if (!svg) return;
  const inp = { start: $('#i-start'), month: $('#i-month'), years: $('#i-years'), rate: $('#i-rate') };
  const W = 640, H = 340, L = 64, R = 16, T = 16, B = 34;
  let shown = null, raf = 0;
  const calc = () => {
    const s = +inp.start.value, m = +inp.month.value, y = +inp.years.value, r = +inp.rate.value / 100;
    const mr = Math.pow(1 + r, 1 / 12) - 1;
    const val = [s], con = [s]; let v = s;
    for (let mo = 1; mo <= y * 12; mo++) { v = v * (1 + mr) + m; if (mo % 12 === 0) { val.push(v); con.push(s + m * mo); } }
    return { val, con, y };
  };
  const labels = () => {
    $('#o-start').textContent = cad(+inp.start.value); $('#o-month').textContent = cad(+inp.month.value);
    $('#o-years').textContent = inp.years.value + (inp.years.value === '1' ? ' year' : ' years'); $('#o-rate').textContent = (+inp.rate.value).toFixed(1) + '%';
  };
  const draw = (d, scaleMax) => {
    const n = d.val.length - 1 || 1, max = scaleMax || 1;
    const x = (i) => L + ((W - L - R) * i) / n, y = (v) => T + (H - T - B) * (1 - v / max);
    let html = '';
    for (let k = 0; k <= 4; k++) { const v = (max * k) / 4, yy = y(v); html += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="rgba(20,32,46,.1)"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="#56626f">${cad(Math.round(v / 1000) * 1000).replace(/,000$/, 'k').replace(/(\d),(\d{3}),000/, '$1.$2M')}</text>`; }
    const tickStep = n > 20 ? 10 : n > 10 ? 5 : 1;
    for (let i = 0; i <= n; i += tickStep) html += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#56626f">Yr ${i}</text>`;
    const path = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('');
    html += `<path d="${path(d.val)}L${x(n)} ${y(0)}L${x(0)} ${y(0)}Z" fill="rgba(194,162,101,.18)"/>`;
    html += `<path d="${path(d.con)}" fill="none" stroke="#8a96a3" stroke-width="2" stroke-dasharray="5 4"/><path d="${path(d.val)}" fill="none" stroke="#8a6d33" stroke-width="3"/>`;
    svg.innerHTML = html;
  };
  const update = (animate) => {
    labels();
    const d = calc(), max = Math.max(d.val.at(-1), 1) * 1.05;
    const fin = d.val.at(-1), con = d.con.at(-1);
    $('#ill-cap').innerHTML = `After ${d.y} years, this hypothetical illustration shows <strong>${cad(fin)}</strong> from ${cad(con)} contributed, at an assumed constant ${(+inp.rate.value).toFixed(1)}% a year. Illustration only; not a forecast.`;
    svg.setAttribute('aria-label', `Line chart of a hypothetical illustration: contributions grow to ${cad(con)} and the illustrative value to ${cad(fin)} over ${d.y} years.`);
    if (reduced || !animate || !shown) { draw(d, max); shown = { d, max }; return; }
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now();
    const lerpArr = (a, b, p) => b.map((v, i) => { const av = a[Math.min(i, a.length - 1)] ?? v; return av + (v - av) * p; });
    const step = (t) => {
      const p = Math.min((t - t0) / 350, 1), e = 1 - Math.pow(1 - p, 3);
      draw({ val: lerpArr(from.d.val, d.val, e), con: lerpArr(from.d.con, d.con, e) }, from.max + (max - from.max) * e);
      if (p < 1) raf = requestAnimationFrame(step); else shown = { d, max };
    };
    raf = requestAnimationFrame(step);
  };
  Object.values(inp).forEach((i) => i.addEventListener('input', () => update(true)));
  update(false);
}

/* ---------- Build your retirement plan ---------- */
const PLANS = {
  prep: { h: 'Preparing for retirement', steps: ['Clarify what you want retirement to look like.', 'See how saving, time and tax considerations fit together.', 'Build a structured plan and review it regularly.'], topic: 'Retirement planning' },
  near: { h: 'Approaching retirement', steps: ['Test when and how you could stop working.', 'Understand pension, severance and income options before deciding.', 'Plan the transition from saving to drawing income.'], topic: 'Retirement planning' },
  in: { h: 'Already retired', steps: ['Review how your income is being drawn and taxed.', 'Check that your plan still fits your circumstances.', 'Keep planning as life and needs change.'], topic: 'Retirement planning' },
  legacy: { h: 'Planning for family and legacy', steps: ['Think through who you want to benefit and how.', 'Understand how wealth transfer and estate planning fit your plan.', 'Coordinate with your legal professionals.'], topic: 'Estate / wealth transfer' },
};
function buildPlan() {
  const out = $('#bp-out'); if (!out) return;
  $$('#bp [data-stage]').forEach((b) => b.addEventListener('click', () => {
    $$('#bp [data-stage]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    const p = PLANS[b.dataset.stage];
    $('#bp-h').textContent = p.h;
    const ol = $('#bp-list'); ol.innerHTML = ''; p.steps.forEach((s) => { const li = document.createElement('li'); li.textContent = s; ol.append(li); });
    $('#bp-cta').href = '/book-a-consultation/?topic=' + encodeURIComponent(p.topic); out.hidden = false;
  }));
}

export function initTools(opts) { systems(); stageCards(); retirementMap(opts); illustrator(opts); buildPlan(); }
