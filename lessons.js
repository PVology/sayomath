/* Saif Math lessons: visual, interactive lessons up to Year 5 (and long division), plus decimals, cube numbers and clue puzzles.
   Uses helpers from index.html through window.SM. */
(() => {
const SM = window.SM;
const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const fmt = n => n.toLocaleString('en-GB');
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Lesson list ---------- */
const GROUPS = [
  {title:'Times tables', color:'#1C6FD1', items:[
    {id:'groups', icon:'⠿', name:'Equal groups', desc:'See what × means with dots', yr:'Year 2-3'},
    {id:'line', icon:'↷', name:'Number line jumps', desc:'Jump forward to ×, back to ÷', yr:'Year 2-4'},
    {id:'share', icon:'🍬', name:'Sharing sweets', desc:'Share fairly and find leftovers', yr:'Year 2-4'},
    {id:'family', icon:'△', name:'Fact families', desc:'One fact gives you four', yr:'Year 3-4'}
  ]},
  {title:'Bigger numbers', color:'#E0702B', items:[
    {id:'place', icon:'×10', name:'× and ÷ by 10, 100, 1000', desc:'Watch digits slide', yr:'Year 4-5'},
    {id:'area', icon:'▦', name:'Area model', desc:'Split numbers into easy parts', yr:'Year 4-5'},
    {id:'column', icon:'⊞', name:'Column multiplication', desc:'Step-by-step, with carrying', yr:'Year 4-5'},
    {id:'short', icon:'⟌', name:'Short division', desc:'The bus stop method', yr:'Year 4-5'},
    {id:'long', icon:'÷', name:'Long division', desc:'Divide, multiply, subtract, bring down', yr:'Year 5-6'}
  ]},
  {title:'Number facts', color:'#1E9E62', items:[
    {id:'multiples', icon:'#', name:'Multiples', desc:'Find them on the 100 square', yr:'Year 4-5'},
    {id:'factors', icon:'▭', name:'Factors', desc:'Factor pairs as rectangles', yr:'Year 5'},
    {id:'primes', icon:'★', name:'Prime numbers', desc:'Sieve them out step by step', yr:'Year 5'},
    {id:'squares', icon:'■', name:'Square numbers', desc:'Numbers that make squares', yr:'Year 5'},
    {id:'cubes', icon:'³', name:'Cube numbers', desc:'A number times itself, three times', yr:'Year 5-6'}
  ]},
  {title:'Decimals', color:'#D9485F', items:[
    {id:'round', icon:'≈', name:'Rounding decimals', desc:'Look at the tenths digit', yr:'Year 5'},
    {id:'dseq', icon:'+', name:'Decimal sequences', desc:'Find the step, fill the gaps', yr:'Year 5'},
    {id:'bonds', icon:'1', name:'Make 1 and make 10', desc:'Decimals that fit together', yr:'Year 5'},
    {id:'dcol', icon:'.', name:'Add and subtract decimals', desc:'Line up the points', yr:'Year 5'}
  ]},
  {title:'Problem solving', color:'#8A4FD3', items:[
    {id:'missing', icon:'?', name:'Missing numbers', desc:'Use the inverse to find ?', yr:'Year 3-5'},
    {id:'words', icon:'✎', name:'Word problems', desc:'Draw a bar model, then solve', yr:'Year 3-5'},
    {id:'clues', icon:'🔍', name:'Number clue puzzles', desc:'Use the clues to find the number', yr:'Year 5'}
  ]}
];
const ALL = GROUPS.flatMap(g => g.items.map(it => ({...it, color:g.color, group:g.title})));

function renderMenu(){
  const done = SM.S().lessons || {};
  const el = $('lGroups'); el.innerHTML = '';
  GROUPS.forEach(g => {
    const sec = h('div', 'lgroup');
    sec.appendChild(h('h3', null, `<i style="background:${g.color}"></i>${g.title}`));
    const tiles = h('div', 'tiles');
    g.items.forEach(it => {
      const b = h('button', 'tile', `<span class="ti" style="background:${g.color}">${it.icon}</span><span class="tt"><b>${it.name}</b><span>${it.desc}</span><em>${it.yr}${done[it.id] ? ' · ✓ tried' : ''}</em></span>`);
      b.onclick = () => openLesson(it.id);
      tiles.appendChild(b);
    });
    sec.appendChild(tiles); el.appendChild(sec);
  });
}

let current = null;
let padTarget = null;      // handlers for the physical keyboard while a lesson keypad is showing
function openLesson(id, noScroll){
  const it = ALL.find(x => x.id === id); if (!it) return;
  current = id; padTarget = null;
  $('lMenu').hidden = true; $('lLesson').hidden = false;
  $('lCrumb').textContent = it.name;
  const i = ALL.indexOf(it), nx = ALL[i + 1];
  $('lNext').hidden = !nx; if (nx) { $('lNext').textContent = `Next: ${nx.name} →`; $('lNext').onclick = () => openLesson(nx.id); }
  const host = $('lHost');
  $('lsn-groups').hidden = id !== 'groups'; host.hidden = id === 'groups';
  host.innerHTML = ''; host.className = 'lesson';
  if (id === 'groups') SM.renderLearn(true); else LESSONS[id](host, it);
  const S = SM.S(); S.lessons = S.lessons || {}; if (!S.lessons[id]) { S.lessons[id] = 1; SM.save(); }
  try { history.replaceState(null, '', '#learn/' + id); } catch(e){}
  if (!noScroll) $('v-learn').scrollIntoView({block:'start', behavior: reduced ? 'auto' : 'smooth'});
}
function closeLesson(){
  current = null; padTarget = null;
  $('lMenu').hidden = false; $('lLesson').hidden = true; renderMenu();
  try { history.replaceState(null, '', '#learn'); } catch(e){}
}
$('lBack').onclick = closeLesson;
$('lBack2').onclick = closeLesson;
SM.onLearn = () => { if (!current) renderMenu(); };
SM.openLesson = openLesson;

document.addEventListener('keydown', e => {
  if (!padTarget || $('v-learn').hidden || $('lLesson').hidden || e.target.tagName === 'INPUT') return;
  if (/^[0-9]$/.test(e.key)) { padTarget.digit(e.key); e.preventDefault(); }
  else if (e.key === '.' && padTarget.dot) { padTarget.dot(); e.preventDefault(); }
  else if (e.key === 'Backspace') { padTarget.del(); e.preventDefault(); }
  else if (e.key === 'Enter') { padTarget.go(); e.preventDefault(); }
});

/* small helpers */
function stepper(label, val, min, max, onChange, cls){
  const w = h('div', 'stepper ' + (cls || ''));
  w.innerHTML = `<span class="lbl">${label}</span><div class="ctl"><button aria-label="Less">−</button><output>${val}</output><button aria-label="More">+</button></div>`;
  const [m, o, p] = w.querySelector('.ctl').children;
  const set = v => { val = Math.max(min, Math.min(max, v)); o.textContent = val; onChange(val); };
  m.onclick = () => set(val - 1); p.onclick = () => set(val + 1);
  w.set = v => { val = v; o.textContent = v; };
  return w;
}
function seg(items, value, onPick){
  const el = h('div', 'seg');
  const draw = () => { el.innerHTML = ''; items.forEach(([v, l]) => { const b = h('button', null, l); b.setAttribute('aria-pressed', v === value); b.onclick = () => { value = v; draw(); onPick(v); }; el.appendChild(b); }); };
  draw(); return el;
}
function head(host, title, sub){ host.appendChild(h('div', null, `<h2>${title}</h2><p class="sub">${sub}</p>`)); }
function btn(text, cls, fn){ const b = h('button', 'btn ' + (cls || ''), text); b.onclick = fn; return b; }
function shake(el){ if (reduced || !el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function reward(n, kind){
  const S = SM.S(); S.done = S.done || {};
  if (kind) S.done[kind] = (S.done[kind] || 0) + 1;
  SM.activity(); if (n) SM.addStars(n); else { SM.save(); SM.checkBadges(); }
}
function dots(n, cls){ return Array.from({length:n}, () => `<i class="${cls || 'sd'}"></i>`).join(''); }

/* =====================================================================
   NUMBER LINE
   ===================================================================== */
function lessonLine(host){
  head(host, 'Number line jumps', 'Multiplying is making equal jumps forward. Dividing is jumping back to find how many jumps fit.');
  let mode = 'mul', a = 3, b = 4, N = 17, d = 5, shown = 0;
  const ctl = h('div', 'controls');
  const steps = h('div', 'steppers');
  const svgBox = h('div', 'nl-box');
  const eq = h('p', 'explain');
  const row = h('div', 'row'); row.style.justifyContent = 'center';
  ctl.appendChild(seg([['mul','Jump forward ×'],['div','Jump back ÷']], mode, v => { mode = v; shown = 0; buildSteps(); draw(); }));
  host.append(ctl, steps, svgBox, eq, row);
  const jumpB = btn('Jump!', '', () => { if (shown < total()) { shown++; draw(true); } });
  const allB = btn('All jumps', 'ghost', () => { shown = total(); draw(); });
  const resetB = btn('Start again', 'ghost', () => { shown = 0; draw(); });
  row.append(jumpB, allB, resetB);
  function buildSteps(){
    steps.innerHTML = '';
    if (mode === 'mul'){
      steps.append(stepper('Jumps', a, 1, 12, v => { a = v; shown = 0; draw(); }, 'a'), h('span', 'op', '×'), stepper('Jump size', b, 1, 12, v => { b = v; shown = 0; draw(); }, 'b'));
    } else {
      steps.append(stepper('Start at', N, 1, 100, v => { N = v; shown = 0; draw(); }, 'a'), h('span', 'op', '÷'), stepper('Jump size', d, 1, 12, v => { d = v; shown = 0; draw(); }, 'b'));
    }
  }
  const total = () => mode === 'mul' ? a : Math.floor(N / d);
  function draw(anim){
    const M = mode === 'mul' ? a * b : N, L = 24, R = 616, Y = 120;
    const x = v => L + (R - L) * v / Math.max(M, 1);
    let s = `<svg viewBox="0 0 640 160" class="nl" role="img" aria-label="Number line">`;
    s += `<line x1="${L-8}" y1="${Y}" x2="${R+8}" y2="${Y}" class="ax"/>`;
    const every = M <= 30 ? 1 : M <= 60 ? 2 : 5;
    for (let v = 0; v <= M; v++){ if (v % every && v !== M) continue; s += `<line x1="${x(v)}" y1="${Y-5}" x2="${x(v)}" y2="${Y+5}" class="tk"/>`; }
    const marks = new Set([0, M]);
    const size = mode === 'mul' ? b : d;
    for (let k = 1; k <= shown; k++){
      const from = mode === 'mul' ? (k-1)*b : N - (k-1)*d, to = mode === 'mul' ? k*b : N - k*d;
      marks.add(to);
      const x1 = x(from), x2 = x(to), mid = (x1 + x2) / 2, ht = Math.max(26, Math.min(80, Math.abs(x2 - x1) * .6));
      s += `<path d="M${x1} ${Y} Q${mid} ${Y - ht*1.6} ${x2} ${Y}" class="arc ${mode}${anim && k === shown ? ' draw' : ''}"/>`;
      s += `<text x="${mid}" y="${Y - ht*0.8 - 6}" class="jl">${mode === 'mul' ? '+' : '−'}${size}</text>`;
      s += `<circle cx="${x2}" cy="${Y}" r="5" class="land ${mode}"/>`;
    }
    if (mode === 'div' && shown === total() && N % d){
      const r = N % d;
      s += `<rect x="${x(0)}" y="${Y+12}" width="${x(r)-x(0)}" height="10" rx="4" class="rem"/><text x="${(x(0)+x(r))/2}" y="${Y+38}" class="rl">${r} left over</text>`;
    }
    marks.forEach(v => s += `<text x="${x(v)}" y="${Y+26}" class="nlab">${v}</text>`);
    s += '</svg>';
    svgBox.innerHTML = s;
    if (mode === 'mul'){
      eq.innerHTML = shown ? `${Array(shown).fill(`<b class="b">${b}</b>`).join(' + ')} = <b>${shown*b}</b>` + (shown === a ? `<br>${a} jumps of ${b} is <b>${a} × ${b} = ${a*b}</b>` : '') : `Press <b>Jump!</b> to make ${a} jumps of ${b}.`;
    } else {
      const q = total(), r = N % d;
      eq.innerHTML = !shown ? `How many jumps of ${d} fit in ${N}? Press <b>Jump!</b> to find out.`
        : shown < q ? `${shown} jump${shown > 1 ? 's' : ''} so far. You are at <b>${N - shown*d}</b>.`
        : `<b>${q}</b> jumps of ${d} fit, so <b>${N} ÷ ${d} = ${q}${r ? ` remainder ${r}` : ''}</b>${r ? `. The last ${r} is too small for another jump.` : '.'}`;
    }
    jumpB.disabled = shown >= total(); allB.disabled = shown >= total();
  }
  buildSteps(); draw();
}

/* =====================================================================
   SHARING
   ===================================================================== */
function lessonShare(host){
  head(host, 'Sharing sweets', 'Dividing can mean sharing fairly. Give one sweet to each plate, again and again, until you can’t share any more.');
  let N = 14, p = 3, plates = [], pile = N, timer = null;
  const steps = h('div', 'steppers');
  steps.append(stepper('Sweets', N, 1, 40, v => { N = v; reset(); }, 'a'), h('span', 'op', '÷'), stepper('Plates', p, 2, 8, v => { p = v; reset(); }, 'b'));
  const pileEl = h('div', 'pile');
  const platesEl = h('div', 'plates');
  const eq = h('p', 'explain');
  const row = h('div', 'row'); row.style.justifyContent = 'center';
  const oneB = btn('Share one round', '', () => round());
  const allB = btn('Share them all', 'ghost', () => { clearInterval(timer); timer = setInterval(() => { if (!round()) clearInterval(timer); }, reduced ? 10 : 450); });
  row.append(oneB, allB, btn('Start again', 'ghost', () => reset()));
  host.append(steps, h('p', 'lbl2 center', 'Sweets to share'), pileEl, platesEl, eq, row);
  function reset(){ clearInterval(timer); pile = N; plates = Array(p).fill(0); draw(); }
  function round(){ if (pile < p) return false; pile -= p; plates = plates.map(x => x + 1); draw(true); return pile >= p; }
  function draw(anim){
    pileEl.innerHTML = pile ? dots(pile, 'sw') : '<span class="sub">All shared!</span>';
    platesEl.innerHTML = plates.map((n, i) => `<div class="plate"><div class="pd">${Array.from({length:n}, (_, k) => `<i class="sw${anim && k === n-1 ? ' pop' : ''}"></i>`).join('')}</div><span>${n}</span></div>`).join('');
    const each = plates[0];
    if (pile >= p) eq.innerHTML = each ? `Each plate has <b>${each}</b>. There are still <b>${pile}</b> sweets, so keep sharing.` : `Share <b>${N}</b> sweets between <b>${p}</b> plates.`;
    else eq.innerHTML = `Each plate gets <b>${each}</b>${pile ? ` and <b class="bad-t">${pile}</b> ${pile === 1 ? 'is' : 'are'} left over, because there aren't enough for every plate` : ''}.<br><b>${N} ÷ ${p} = ${each}${pile ? ` remainder ${pile}` : ''}</b>`;
    oneB.disabled = allB.disabled = pile < p;
  }
  reset();
}

/* =====================================================================
   FACT FAMILIES
   ===================================================================== */
function lessonFamily(host){
  head(host, 'Fact families', 'Three numbers that belong together make four facts. If you know one, you know them all.');
  let a = 6, b = 7;
  const steps = h('div', 'steppers');
  const sa = stepper('Number', a, 2, 12, v => { a = v; draw(); }, 'a'), sb = stepper('Number', b, 2, 12, v => { b = v; draw(); }, 'b');
  steps.append(sa, h('span', 'op', '×'), sb);
  const wrap = h('div', 'fam');
  const tri = h('div', 'tri'), facts = h('div', 'facts');
  wrap.append(tri, facts);
  const more = h('p', 'explain');
  const row = h('div', 'row'); row.style.justifyContent = 'center';
  const fb = h('div', 'feedback'); fb.setAttribute('aria-live', 'polite');
  row.append(btn('Check my answers', '', check), btn('New family', 'ghost', () => { a = rnd(2, 12); b = rnd(2, 12); sa.set(a); sb.set(b); draw(); }));
  host.append(steps, wrap, fb, row, more);
  let blanks = [], paid = false;
  function draw(){
    paid = false;
    const p = a * b;
    tri.innerHTML = `<svg viewBox="0 0 220 190" role="img" aria-label="Fact family triangle ${a}, ${b}, ${p}"><path d="M110 30 L30 160 L190 160 Z" class="trl"/><circle cx="110" cy="38" r="30" class="tc p"/><circle cx="38" cy="152" r="28" class="tc a"/><circle cx="182" cy="152" r="28" class="tc b"/><text x="110" y="47" class="tt">${p}</text><text x="38" y="161" class="tt">${a}</text><text x="182" y="161" class="tt">${b}</text><text x="110" y="130" class="tm">× ÷</text></svg>`;
    const rows = [[a,'×',b,p],[b,'×',a,p],[p,'÷',a,b],[p,'÷',b,a]];
    blanks = [];
    facts.innerHTML = '';
    rows.forEach(r => {
      const hide = pick([0, 2, 3]);
      const line = h('div', 'fact');
      [r[0], r[1], r[2], '=', r[3]].forEach((v, i) => {
        const idx = i < 3 ? i : i - 1;
        if (i !== 3 && idx === hide){ const inp = h('input', 'blank'); inp.inputMode = 'numeric'; inp.maxLength = 3; inp.setAttribute('aria-label', 'Missing number'); inp.dataset.ans = v; blanks.push(inp); line.appendChild(inp); }
        else line.appendChild(h('span', typeof v === 'number' ? 'n' : 'o', String(v)));
      });
      facts.appendChild(line);
    });
    blanks.forEach((inp, i) => inp.onkeydown = e => { if (e.key === 'Enter') { const n = blanks[i+1]; n ? n.focus() : check(); } });
    fb.textContent = ''; fb.className = 'feedback';
    more.innerHTML = `It works for bigger numbers too: <b>${a*10} × ${b} = ${fmt(p*10)}</b>, so <b>${fmt(p*10)} ÷ ${b} = ${a*10}</b>.`;
  }
  function check(){
    let right = 0;
    blanks.forEach(inp => { const ok = inp.value.trim() === inp.dataset.ans; inp.classList.toggle('good', ok); inp.classList.toggle('bad', !ok); if (ok) right++; });
    if (right === 4){ fb.className = 'feedback good'; fb.textContent = 'All four facts are right! +2 stars'; if (!paid) reward(2, 'family'); paid = true; }
    else { fb.className = 'feedback bad'; fb.textContent = `${right} of 4 right. Look at the triangle: the top number is the answer to ×, and you start with it for ÷.`; }
  }
  draw();
}

/* =====================================================================
   PLACE VALUE: × and ÷ by 10, 100, 1000
   ===================================================================== */
function lessonPlace(host){
  head(host, '× and ÷ by 10, 100 and 1000', 'The digits slide! × 10 moves every digit one place to the left. ÷ 10 moves them one place to the right. Zeros fill the empty places.');
  const PL = [5, 4, 3, 2, 1, 0, -1, -2, -3];
  const NAMES = {5:'HTh',4:'TTh',3:'Th',2:'H',1:'T',0:'O','-1':'t','-2':'h','-3':'th'};
  const FULL = {5:'hundred thousands',4:'ten thousands',3:'thousands',2:'hundreds',1:'tens',0:'ones','-1':'tenths','-2':'hundredths','-3':'thousandths'};
  let tiles = [], uid = 0, last = '';
  const inRow = h('div', 'row');
  inRow.innerHTML = `<label class="lbl2" for="pvIn">Start number</label>`;
  const inp = h('input', 'txt'); inp.id = 'pvIn'; inp.value = '35'; inp.inputMode = 'decimal'; inp.style.maxWidth = '140px';
  inRow.append(inp, btn('Use this number', 'small ghost', () => setNum(inp.value)));
  const chart = h('div', 'pv');
  const ops = h('div', 'pvops');
  const eq = h('p', 'explain');
  host.append(inRow, chart, ops, eq);
  [['×',10],['×',100],['×',1000],['÷',10],['÷',100],['÷',1000]].forEach(([o, n]) => {
    const b = btn(`${o} ${fmt(n)}`, o === '×' ? '' : 'alt', () => apply(o, n)); ops.appendChild(b);
  });
  inp.onkeydown = e => { if (e.key === 'Enter') setNum(inp.value); };
  chart.innerHTML = `<div class="pvh">${PL.map(p => `<span title="${FULL[p]}">${NAMES[p]}</span>`).join('')}</div><div class="pvb"><i class="pt"></i></div>`;
  const body = chart.querySelector('.pvb');
  const val = () => tiles.filter(t => !t.ph).reduce((s, t) => s + t.d * Math.pow(10, t.p), 0);
  const show = v => fmt(+v.toFixed(3));
  function setNum(txt){
    const v = parseFloat(String(txt).replace(/,/g, ''));
    if (!(v > 0) || v >= 1e6) { eq.innerHTML = 'Type a number bigger than 0 and smaller than 1,000,000, with up to 3 decimal places.'; return; }
    const s = (+v.toFixed(3)).toString();
    const [ip, dp = ''] = s.split('.');
    tiles = []; body.querySelectorAll('.tile2').forEach(e => e.remove());
    [...ip].forEach((c, i) => tiles.push({id:uid++, d:+c, p:ip.length - 1 - i}));
    [...dp].forEach((c, i) => tiles.push({id:uid++, d:+c, p:-1 - i}));
    tidy(); draw(); eq.innerHTML = `This is <b>${show(val())}</b>. Now press a button to see the digits slide.`;
    last = '';
  }
  function tidy(){
    tiles.forEach(t => t.ph = false);
    const nz = tiles.filter(t => t.d !== 0);
    const hi = Math.max(0, ...nz.map(t => t.p)), lo = Math.min(0, ...nz.map(t => t.p));
    tiles = tiles.filter(t => t.p <= hi && t.p >= lo);
    for (let p = lo; p <= hi; p++) if (!tiles.some(t => t.p === p)) tiles.push({id:uid++, d:0, p, ph:true, fresh:true});
    tiles.forEach(t => { if (t.d === 0 && !t.fresh) t.ph = t.p === 0 || t.p > 0 && t.p < Math.min(...nz.map(n => n.p)); });
  }
  function draw(){
    const W = 100 / PL.length;
    const seen = new Set();
    tiles.forEach(t => {
      seen.add(t.id);
      let el = body.querySelector(`[data-id="${t.id}"]`);
      if (!el){ el = h('span', 'tile2' + (t.fresh ? ' new' : ''), String(t.d)); el.dataset.id = t.id; body.appendChild(el); }
      el.classList.toggle('ph', !!t.ph || t.fresh);
      el.style.left = `calc(${(5 - t.p) * W}% + ${W/2}% - 22px)`;
      t.fresh = false;
    });
    body.querySelectorAll('.tile2').forEach(e => { if (!seen.has(+e.dataset.id)) { e.classList.add('gone'); setTimeout(() => e.remove(), 400); } });
  }
  function apply(o, n){
    const k = Math.log10(n), sh = o === '×' ? k : -k;
    const nz = tiles.filter(t => t.d !== 0);
    if (!nz.length) return;
    const hi = Math.max(...nz.map(t => t.p)) + sh, lo = Math.min(...nz.map(t => t.p)) + sh;
    if (hi > 5 || lo < -3){ eq.innerHTML = `That would slide a digit off the chart. Try a smaller jump.`; shake(chart); return; }
    const before = val();
    tiles.forEach(t => t.p += sh);
    tidy(); draw();
    const after = val();
    eq.innerHTML = `<b>${show(before)} ${o} ${fmt(n)} = ${show(after)}</b><br>Every digit moved ${k} place${k > 1 ? 's' : ''} to the ${o === '×' ? 'left, so the number got bigger' : 'right, so the number got smaller'}.${o === '×' && after % 1 === 0 && before % 1 === 0 ? ` Zeros hold the empty places.` : ''}`;
    if (last !== o + n){ reward(0, 'place'); last = o + n; }
  }
  setNum(35);
}

/* =====================================================================
   GUIDED WORKED EXAMPLES (column ×, short ÷, long ÷, area model)
   Modes: watch (Next step), help (questions + hints), own (fill in alone)
   ===================================================================== */
const MODES = [['watch','👀 Show me'],['help','🤝 Help me'],['own','💪 On my own']];
function guided(host, cfg){
  const S = SM.S(); S.glevel = S.glevel || {};
  let mode = S.gmode || 'help', level = S.glevel[cfg.kind] || cfg.levels[0][0];
  head(host, cfg.title, cfg.sub);
  const ctl = h('div', 'controls');
  ctl.append(
    seg(MODES, mode, v => { mode = v; S.gmode = v; SM.save(); newProblem(); }),
    seg(cfg.levels, level, v => { level = v; S.glevel[cfg.kind] = v; SM.save(); newProblem(); })
  );
  const area = h('div', 'g-area');
  const left = h('div', 'g-left'), right = h('div', 'g-right');
  const sheetBox = h('div', 'sheet-box'), sheet = h('div');
  sheetBox.appendChild(sheet);
  const phases = h('div', 'phases'); phases.hidden = !cfg.phases;
  const say = h('div', 'say'); say.setAttribute('aria-live', 'polite');
  left.append(phases, sheetBox, say);
  const side = h('div', 'side');
  const pad = h('div', 'pad');
  const btns = h('div', 'row');
  right.append(side, pad, btns);
  area.append(left, right);
  host.append(ctl, area);
  let P, K, steps, i, buf, wrong, tries, help, finished;
  const handlers = {
    digit: d => { if (mode === 'watch' || finished || !steps[i]) return; const st = steps[i]; if (buf.length >= st.val.length) return; buf += d; show(st, buf, true); if (buf.length === st.val.length) setTimeout(check, 120); },
    del: () => { if (mode === 'watch' || finished) return; buf = buf.slice(0, -1); show(steps[i], buf, true); },
    go: () => { if (mode === 'watch' || finished) { next(); return; } if (buf) check(); }
  };
  SM.buildPad(pad, handlers);
  SM._g = () => ({steps, i, finished});
  function newProblem(){
    P = cfg.make(level); sheet.innerHTML = ''; sheet.className = '';
    K = P.build(sheet); steps = P.steps; i = 0; buf = ''; wrong = 0; finished = false;
    if (cfg.phases) phases.innerHTML = cfg.phases.map(([k, l, ic]) => `<span data-p="${k}"><b>${ic}</b>${l}</span>`).join('<i>→</i>');
    pad.hidden = mode === 'watch';
    padTarget = handlers;
    btns.innerHTML = '';
    if (mode === 'watch') btns.append(btn('Next step', '', next));
    else btns.append(btn('Hint', 'ghost', hint));
    btns.append(btn('New problem', 'ghost', newProblem));
    render();
  }
  const setT = (e, v) => { const t = e.querySelector(':scope > .v'); (t || e).textContent = v; };
  function cells(st){ return st.k.map(k => K[k]).filter(Boolean); }
  function show(st, v, typing){
    const els = cells(st);
    if (els.length === 1) setT(els[0], v || '');
    else { const pad = v.padStart(els.length, ' '); els.forEach((e, j) => setT(e, pad[j] === ' ' ? '' : pad[j])); }
  }
  function render(){
    Object.values(K).forEach(e => e.classList.remove('cur', 'hl'));
    if (i >= steps.length) return done();
    const st = steps[i];
    tries = 0; help = mode === 'help' ? 1 : 0;
    cells(st).forEach(e => e.classList.add('cur'));
    (st.hl || []).forEach(k => K[k] && K[k].classList.add('hl'));
    if (cfg.phases) phases.querySelectorAll('span').forEach(s => s.classList.toggle('on', s.dataset.p === st.ph));
    side.innerHTML = P.side ? P.side(st, mode === 'watch') : '';
    if (mode === 'watch') say.innerHTML = `<span class="sn">Step ${i+1} of ${steps.length}</span>${st.ask}<br><b>${st.tell}</b>`;
    else sayFor();
    const first = cells(st)[0]; if (first && first.scrollIntoView && i) first.scrollIntoView({block:'nearest', inline:'nearest'});
  }
  function sayFor(){
    const st = steps[i];
    const lv = help;
    say.className = 'say';
    say.innerHTML = `<span class="sn">Step ${i+1} of ${steps.length}</span>` + (lv === 0 ? 'Fill in the highlighted box. Press <b>Hint</b> if you need help.'
      : lv === 1 ? st.ask : lv === 2 ? `${st.ask}<br><span class="hn">${st.hint || st.tell}</span>` : `${st.ask}<br><b>${st.tell}</b>`);
    if (lv >= 2 && P.side) side.innerHTML = P.side(st, true);
  }
  function hint(){ if (finished) return; help = Math.min(3, help + 1); sayFor(); }
  function fill(st){ show(st, st.val); cells(st).forEach(e => { e.classList.add('ok'); e.classList.remove('cur'); }); if (P.onFill) P.onFill(st); }
  function next(){
    if (finished){ newProblem(); return; }
    const st = steps[i]; fill(st);
    i++; render();
  }
  function check(){
    const st = steps[i]; if (!st) return;
    if (buf === st.val){
      fill(st); buf = '';
      say.className = 'say good';
      if (mode === 'help') say.innerHTML = `<span class="sn">Step ${i+1} of ${steps.length}</span>✓ ${st.tell}`;
      i++;
      setTimeout(render, mode === 'help' ? 900 : 250);
    } else {
      wrong++; tries++; buf = '';
      cells(st).forEach(e => shake(e));
      setTimeout(() => show(st, ''), 350);
      help = Math.min(3, help + 1);
      sayFor(); say.classList.add('bad');
    }
  }
  function done(){
    finished = true; padTarget = handlers;
    if (cfg.phases) phases.querySelectorAll('span').forEach(s => s.classList.remove('on'));
    side.innerHTML = P.side ? P.side(null, true) : '';
    const stars = mode === 'watch' ? 0 : mode === 'help' ? 2 : wrong === 0 ? 4 : 3;
    say.className = 'say good';
    say.innerHTML = `🎉 <b>${P.answer}</b><br>${mode === 'watch' ? 'Now try it yourself with <b>Help me</b>.' : `You did it${wrong ? ` with ${wrong} mistake${wrong > 1 ? 's' : ''}` : ' with no mistakes'}! +${stars} stars.`}`;
    btns.innerHTML = ''; btns.append(btn('Next problem', '', newProblem));
    if (mode === 'watch') btns.append(btn('Try it: Help me', 'ghost', () => { mode = 'help'; S.gmode = 'help'; SM.save(); ctl.firstChild.replaceWith(seg(MODES, mode, v => { mode = v; S.gmode = v; SM.save(); newProblem(); })); newProblem(); }));
    reward(stars, mode === 'own' ? cfg.kind : null);
  }
  newProblem();
}

/* grid builder for written methods */
function grid(el, rows, cols){
  el.className = 'sheet'; el.style.gridTemplateColumns = `repeat(${cols}, var(--cw))`;
  const K = {}, C = [];
  for (let r = 0; r < rows; r++){ C[r] = []; for (let c = 0; c < cols; c++){ const e = h('div', 'cell', '<span class="v"></span>'); el.appendChild(e); C[r][c] = e; } }
  const at = (r, c) => C[r][c];
  const key = (r, c) => { const k = r + ',' + c; if (!K[k]) { K[k] = C[r][c]; C[r][c].classList.add('in'); } return k; };
  const carry = (r, c, pos) => { const k = r + ',' + c + ',cy'; if (!K[k]) { const e = h('span', 'cy ' + (pos || '')); C[r][c].appendChild(e); K[k] = e; } return k; };
  const put = (r, c, txt, cls) => { C[r][c].firstChild.textContent = txt; if (cls) C[r][c].classList.add(...cls.split(' ')); };
  return {K, at, key, carry, put};
}
const digitsOf = n => String(n).split('').map(Number);
function rndDigits(n){ return rnd(Math.pow(10, n-1), Math.pow(10, n) - 1); }

/* ---------- Column multiplication ---------- */
function makeColumn(level){
  const [tn, bn] = {'2x1':[2,1],'3x1':[3,1],'4x1':[4,1],'2x2':[2,2],'3x2':[3,2]}[level];
  const top = rndDigits(tn), bot = bn === 1 ? rnd(3, 9) : rnd(12, 49);
  const T = digitsOf(top).reverse(), B = digitsOf(bot).reverse();
  const W = tn + bn + 1, rows = 2 + bn + (bn > 1 ? 1 : 0);
  const steps = [];
  const P = {answer: `${fmt(top)} × ${bot} = ${fmt(top * bot)}`, steps};
  const plan = [];
  const col = p => W - 1 - p;
  const partials = [];
  B.forEach((bj, j) => {
    const r = 2 + j; let carry = 0;
    for (let z = 0; z < j; z++) plan.push({k:[[r, col(z)]], val:'0', ph:'M', ask:`Now we multiply by the <b>${bj}</b>, which is really <b>${bj}0</b>. Write a <b>0</b> in the ones column first to hold the place.`, tell:'Write 0 as a place holder.', hl:[[1, col(j)]]});
    T.forEach((ti, i) => {
      const p = ti * bj + carry, last = i === T.length - 1, place = i + j;
      const hl = [[0, col(i)], [1, col(j)]];
      const cyNote = carry ? ` + ${carry} carried` : '';
      if (last && p >= 10){
        plan.push({k:[[r, col(place + 1)], [r, col(place)]], val:String(p), ph:'M', hl, ask:`Multiply: <b>${ti} × ${bj}${cyNote}</b>. This is the last digit, so write the whole answer.`, hint:`${ti} × ${bj} = ${ti*bj}${carry ? `, then add ${carry}` : ''}.`, tell:`${ti} × ${bj} = ${ti*bj}${carry ? `, + ${carry} = ${p}` : ''}. Write ${p}.`});
      } else {
        plan.push({k:[[r, col(place)]], val:String(p % 10), ph:'M', hl, ask:`Multiply: <b>${ti} × ${bj}${cyNote}</b>. Write the ones digit of the answer.`, hint:`${ti} × ${bj} = ${ti*bj}${carry ? `, then add ${carry}` : ''}.`, tell:`${ti} × ${bj} = ${ti*bj}${carry ? `, + ${carry} = ${p}` : ''}. Write ${p % 10}${p >= 10 ? ` and carry ${Math.floor(p/10)}` : ''}.`});
        if (p >= 10) plan.push({k:[[r, col(place + 1), 'cy']], val:String(Math.floor(p/10)), ph:'C', hl:[[r, col(place)]], ask:`${p} has <b>${Math.floor(p/10)}</b> ten${p >= 20 ? 's' : ''}. Carry it to the next column.`, tell:`Carry ${Math.floor(p/10)}.`});
      }
      carry = Math.floor(p / 10);
    });
    partials.push(top * bj * Math.pow(10, j));
  });
  if (bn > 1){
    const r = rows - 1, A = partials.map(x => digitsOf(x).reverse()), sum = partials.reduce((s, x) => s + x, 0);
    const n = Math.max(...A.map(a => a.length)); let carry = 0;
    for (let p = 0; p < n; p++){
      const ds = A.map(a => a[p] || 0), s = ds.reduce((x, y) => x + y, 0) + carry, last = p === n - 1;
      const hl = A.map((a, j) => [2 + j, col(p)]);
      const what = ds.join(' + ') + (carry ? ` + ${carry} carried` : '');
      if (last && s >= 10) plan.push({k:[[r, col(p + 1)], [r, col(p)]], val:String(s), ph:'A', hl, ask:`Add this column: <b>${what}</b>. Last column, so write it all.`, tell:`${what} = ${s}.`});
      else {
        plan.push({k:[[r, col(p)]], val:String(s % 10), ph:'A', hl, ask:`Add this column: <b>${what}</b>.`, tell:`${what} = ${s}. Write ${s % 10}${s >= 10 ? ` and carry ${Math.floor(s/10)}` : ''}.`});
        if (s >= 10) plan.push({k:[[r, col(p + 1), 'cy']], val:String(Math.floor(s/10)), ph:'C', hl:[[r, col(p)]], ask:'Carry the ten to the next column.', tell:`Carry ${Math.floor(s/10)}.`});
      }
      carry = Math.floor(s / 10);
    }
    void sum;
  }
  P.build = el => {
    const g = grid(el, rows, W);
    T.forEach((d, i) => g.put(0, col(i), d));
    g.put(1, 0, '×', 'sg'); B.forEach((d, j) => g.put(1, col(j), d));
    for (let c = 0; c < W; c++){ g.at(2, c).classList.add('lt'); if (bn > 1){ g.at(rows - 1, c).classList.add('lt', 'lb'); } }
    if (bn > 1) g.put(rows - 1, 0, '+', 'sg');
    plan.forEach(st => { st.k = st.k.map(([r, c, cy]) => cy ? g.carry(r, c) : g.key(r, c)); st.hl = (st.hl || []).map(([r, c]) => { const k = 'h' + r + ',' + c; g.K[k] = g.at(r, c); return k; }); });
    return g.K;
  };
  plan.forEach(st => steps.push(st));
  return P;
}

/* ---------- Short division (bus stop) ---------- */
function makeShort(level){
  const d = rnd(3, 9);
  const nd = level === '4d' ? 4 : level === 'rem' ? rnd(3, 4) : 3;
  let N, q, r = 0;
  do { q = rnd(Math.ceil(Math.pow(10, nd-1) / d), Math.floor((Math.pow(10, nd) - 1) / d)); r = level === 'rem' ? rnd(1, d - 1) : 0; N = q * d + r; } while (String(N).length !== nd);
  const D = digitsOf(N), W = nd + 3;
  const plan = [];
  let rem = 0, started = false;
  D.forEach((nv, i) => {
    const cur = rem * 10 + nv, qd = Math.floor(cur / d); rem = cur % d;
    const hl = [[1, i + 1]];
    if (qd === 0 && !started){
      if (i < nd - 1) plan.push({k:[[1, i + 2, 'cy']], val:String(cur), ph:'C', hl, ask:`How many <b>${d}</b>s go into <b>${cur}</b>? None! ${d} is bigger than ${cur}. So carry the <b>${cur}</b> over to the next digit.`, tell:`Carry ${cur}.`});
      return;
    }
    started = true;
    plan.push({k:[[0, i + 1]], val:String(qd), ph:'D', hl, cur, ask:`How many <b>${d}</b>s go into <b>${cur}</b>?`, hint:`Count in ${d}s: ${Array.from({length:Math.min(10, qd + 1)}, (_, k) => (k + 1) * d).join(', ')}…`, tell:`${qd} × ${d} = ${qd * d}${rem ? `, with ${rem} left over` : ', exactly'}. Write ${qd}.`});
    if (rem && i < nd - 1) plan.push({k:[[1, i + 2, 'cy']], val:String(rem), ph:'C', hl:[[1, i + 2]], ask:`${cur} − ${qd * d} = ? That's what is left over. Carry it to the next digit.`, tell:`${cur} − ${qd * d} = ${rem}. Carry ${rem}.`});
  });
  if (rem) plan.push({k:[[0, nd + 2]], val:String(rem), ph:'R', hl:[], ask:'There is some left over at the end. Write the <b>remainder</b>.', tell:`The remainder is ${rem}.`});
  return {
    answer: `${fmt(N)} ÷ ${d} = ${fmt(q)}${rem ? ` remainder ${rem}` : ''}`, steps: plan,
    side: (st, open) => multStrip(d, st && st.cur, !!(st && st.ph === 'D'), open),
    build: el => {
      const g = grid(el, 2, W);
      g.put(1, 0, d, 'dv');
      D.forEach((v, i) => { g.put(1, i + 1, v); g.at(1, i + 1).classList.add('bus'); });
      if (rem) g.put(0, nd + 1, 'r', 'sg');
      plan.forEach(st => { st.k = st.k.map(([r, c, cy]) => cy ? g.carry(r, c, 'tl') : g.key(r, c)); st.hl = st.hl.map(([r, c]) => { const k = 'h' + r + ',' + c; g.K[k] = g.at(r, c); return k; }); });
      return g.K;
    }
  };
}
function multStrip(d, cur, active, reveal){
  let s = `<p class="lbl2">The ${d} times table</p><div class="mstrip">`;
  for (let k = 1; k <= 10; k++){
    const v = k * d, fits = cur != null && v <= cur, best = cur != null && v <= cur && (k + 1) * d > cur;
    s += `<span class="${active && reveal && best ? 'best' : active && fits ? 'fits' : active && cur != null ? 'too' : ''}">${k} × ${d} = <b>${v}</b></span>`;
  }
  return s + '</div>' + (active && cur != null ? `<p class="sub small">The green ones fit into ${cur}. Which is the biggest?</p>` : '');
}

/* ---------- Long division ---------- */
function makeLong(level){
  let d, N, q, r;
  do {
    d = level === '1d' ? rnd(3, 9) : rnd(11, 25);
    const nd = level === '1d' ? 4 : rnd(3, 4);
    q = rnd(Math.ceil(Math.pow(10, nd-1) / d), Math.floor((Math.pow(10, nd) - 1) / d));
    r = level === 'rem' ? rnd(1, d - 1) : 0; N = q * d + r;
  } while (String(N).length < 3 || String(N).length > 4);
  const D = digitsOf(N), nd = D.length, dl = String(d).length, off = dl;   // dividend starts at column `off`
  const plan = [];
  let k = 0, cur = D[0];
  while (cur < d) { k++; cur = cur * 10 + D[k]; }
  let row = 2, curRow = 1, firstNote = k > 0 ? ` (${d} won't go into ${D.slice(0, k).join('')}, so we start with ${cur}.)` : '';
  const signs = [], lines = [];
  for (;;){
    const qd = Math.floor(cur / d), end = off + k;
    plan.push({k:[[0, end]], val:String(qd), ph:'D', cur, hl:[[curRow, end]], ask:`<b>Divide:</b> how many <b>${d}</b>s go into <b>${cur}</b>?${firstNote}`, hint:'Look at the times table helper. Find the biggest answer that is not more than ' + cur + '.', tell:qd ? `${qd} × ${d} = ${qd * d}${(qd + 1) * d > cur ? `, and ${qd + 1} × ${d} = ${(qd + 1) * d} is too big` : ''}. Write ${qd}.` : `${d} is bigger than ${cur}, so write 0.`});
    firstNote = '';
    let diff = cur;
    if (qd > 0){
      const pr = qd * d, ps = String(pr), ds = String(cur - pr);
      plan.push({k:[...ps].map((_, j) => [row, end - ps.length + 1 + j]), val:ps, ph:'M', cur, hl:[[0, end]], ask:`<b>Multiply:</b> ${qd} × ${d} = ? Write it under ${cur}.`, tell:`${qd} × ${d} = ${pr}.`});
      signs.push([row, end - Math.max(ps.length, String(cur).length)]);
      diff = cur - pr;
      plan.push({k:[...ds].map((_, j) => [row + 1, end - ds.length + 1 + j]), val:ds, ph:'S', hl:[], ask:`<b>Subtract:</b> ${cur} − ${pr} = ?`, tell:`${cur} − ${pr} = ${diff}.`});
      lines.push([row + 1, end - String(cur).length + 1, end]);
      curRow = row + 1; row += 2;
    }
    if (k < nd - 1){
      k++;
      const nv = D[k], nc = diff * 10 + nv;
      plan.push({k:[[curRow, off + k]], val:String(nv), ph:'B', hl:[[1, off + k]], ask:`<b>Bring down</b> the next digit from the top.`, tell:`Bring down the ${nv}. Now we have ${nc}.`});
      cur = nc;
    } else { r = diff; break; }
  }
  if (r) plan.push({k:[...String(r)].map((_, j) => [0, off + nd + 1 + j]), val:String(r), ph:'R', hl:[], ask:'Nothing left to bring down. What is left over is the <b>remainder</b>. Write it.', tell:`The remainder is ${r}.`});
  const W = off + nd + 3, rows = row;
  return {
    answer: `${fmt(N)} ÷ ${d} = ${fmt(Math.floor(N / d))}${r ? ` remainder ${r}` : ''}`, steps: plan,
    side: (st, open) => multStrip(d, st ? st.cur : null, !!(st && st.ph === 'D'), open),
    build: el => {
      const g = grid(el, rows, W);
      [...String(d)].forEach((c, j) => g.put(1, j, c, 'dvl'));
      g.at(1, dl - 1).classList.add('dvr');
      D.forEach((v, i) => { g.put(1, off + i, v); g.at(1, off + i).classList.add('bus'); });
      if (r) g.put(0, off + nd, 'r', 'sg');
      signs.forEach(([rr, c]) => { if (c >= 0) g.put(rr, c, '−', 'sg'); });
      lines.forEach(([rr, a, b]) => { for (let c = a; c <= b; c++) g.at(rr, c).classList.add('lt'); });
      plan.forEach(st => { st.k = st.k.map(([r2, c]) => g.key(r2, c)); st.hl = st.hl.map(([r2, c]) => { const kk = 'h' + r2 + ',' + c; g.K[kk] = g.at(r2, c); return kk; }); });
      return g.K;
    }
  };
}

/* ---------- Area model (grid method) ---------- */
function makeArea(level){
  const [an, bn] = {'2x1':[2,1],'3x1':[3,1],'2x2':[2,2]}[level];
  let a, b;
  do { a = rndDigits(an); b = bn === 1 ? rnd(3, 9) : rnd(12, 39); } while (a % 10 === 0 || (bn > 1 && b % 10 === 0));
  const split = n => digitsOf(n).map((dg, i, arr) => dg * Math.pow(10, arr.length - 1 - i)).filter(x => x);
  const A = split(a), B = split(b), max = Math.max(...A, ...B);
  const plan = [], parts = [];
  B.forEach((bp, r) => A.forEach((ap, c) => {
    const pr = ap * bp; parts.push(pr);
    const z = String(ap).length - 1 + String(bp).length - 1, sa = String(ap)[0], sb = String(bp)[0];
    plan.push({k:['p' + r + c], val:String(pr), ph:'M', hl:['ha' + c, 'hb' + r], ask:`What is <b>${fmt(ap)} × ${fmt(bp)}</b>?`, hint: z ? `Do ${sa} × ${sb} = ${sa * sb}, then put ${z} zero${z > 1 ? 's' : ''} on the end.` : `Use your ${bp} times table.`, tell:`${fmt(ap)} × ${fmt(bp)} = ${fmt(pr)}.`});
  }));
  const total = a * b;
  plan.push({k:['tot'], val:String(total), ph:'A', hl:parts.map((_, i) => 's' + i), ask:`Now add all the parts: <b>${parts.map(fmt).join(' + ')}</b>`, hint:'Add the biggest parts first, then the small ones.', tell:`${parts.map(fmt).join(' + ')} = ${fmt(total)}.`});
  const fr = v => (0.9 + 2.2 * v / max).toFixed(2);
  return {
    answer: `${a} × ${b} = ${fmt(total)}`, steps: plan,
    onFill: st => { if (st.k[0][0] === 'p'){ const idx = plan.indexOf(st); const s = document.querySelector(`[data-s="${idx}"]`); if (s) s.textContent = fmt(+st.val); } },
    build: el => {
      el.className = 'amodel';
      const K = {};
      const g = h('div', 'agrid');
      g.style.gridTemplateColumns = `48px ${A.map(fr).map(x => x + 'fr').join(' ')}`;
      g.style.gridTemplateRows = `36px ${B.map(fr).map(x => `minmax(${Math.round(40 + 30 * x)}px, ${x}fr)`).join(' ')}`;
      g.appendChild(h('span', 'ah', '×'));
      A.forEach((ap, c) => { const e = h('span', 'ah a', fmt(ap)); K['ha' + c] = e; g.appendChild(e); });
      B.forEach((bp, r) => {
        const e = h('span', 'ah b', fmt(bp)); K['hb' + r] = e; g.appendChild(e);
        A.forEach((ap, c) => { const cell = h('div', 'ablock c' + ((r + c) % 3)); const box = h('span', 'abox'); cell.appendChild(box); K['p' + r + c] = box; g.appendChild(cell); });
      });
      const sum = h('div', 'asum');
      sum.innerHTML = `<span>${a} × ${b} = </span>` + parts.map((_, i) => `<span class="sp" data-s="${i}">?</span>`).join('<span>+</span>') + '<span>=</span>';
      const tot = h('span', 'abox tot'); sum.appendChild(tot); K.tot = tot;
      sum.querySelectorAll('.sp').forEach((s, i) => K['s' + i] = s);
      el.append(h('p', 'sub center', `Split <b>${a}</b> into ${A.map(fmt).join(' + ')}${B.length > 1 ? ` and <b>${b}</b> into ${B.map(fmt).join(' + ')}` : ''}. Work out each part, then add them up.`), g, sum);
      return K;
    }
  };
}

const LESSONS = {
  line: lessonLine, share: lessonShare, family: lessonFamily, place: lessonPlace,
  column: host => guided(host, {kind:'column', title:'Column multiplication', sub:'Multiply each digit, starting from the ones. If an answer is 10 or more, carry the tens to the next column.',
    levels:[['2x1','2-digit × 1'],['3x1','3-digit × 1'],['4x1','4-digit × 1'],['2x2','2-digit × 2'],['3x2','3-digit × 2']], make:makeColumn,
    phases:[['M','Multiply','×'],['C','Carry','↖'],['A','Add','+']]}),
  short: host => guided(host, {kind:'short', title:'Short division', sub:'The bus stop method. Divide each digit from the left. Anything left over is carried to the next digit.',
    levels:[['3d','3-digit ÷ 1'],['4d','4-digit ÷ 1'],['rem','With remainders']], make:makeShort,
    phases:[['D','Divide','÷'],['C','Carry','↗'],['R','Remainder','r']]}),
  long: host => guided(host, {kind:'long', title:'Long division', sub:'Repeat four steps: Divide, Multiply, Subtract, Bring down. Use the times table helper if you get stuck.',
    levels:[['1d','÷ 1-digit'],['2d','÷ 2-digit'],['rem','With remainders']], make:makeLong,
    phases:[['D','Divide','÷'],['M','Multiply','×'],['S','Subtract','−'],['B','Bring down','↓'],['R','Remainder','r']]}),
  area: host => guided(host, {kind:'area', title:'Area model', sub:'Split the numbers into tens and ones. Each rectangle is an easy multiplication. Add them all to get the answer.',
    levels:[['2x1','2-digit × 1'],['3x1','3-digit × 1'],['2x2','2-digit × 2']], make:makeArea}),
  multiples: host => hundred(host, 'multiples'), factors: host => hundred(host, 'factors'),
  primes: host => hundred(host, 'primes'), squares: host => hundred(host, 'squares'),
  missing: host => quick(host, 'missing'), words: host => quick(host, 'words'),
  round: lessonRound, dseq: lessonSeq, bonds: lessonBonds, dcol: lessonDcol, clues: lessonClues, cubes: lessonCubes
};

/* =====================================================================
   100 SQUARE: multiples, factors, primes, squares
   ===================================================================== */
function hundred(host, mode){
  const T = {multiples:['Multiples','Multiples are the answers in a times table. Pick a number, then tap all its multiples on the 100 square.'],
    factors:['Factors','Factors are numbers that divide exactly. Every factor pair makes a rectangle of dots. Tap any number to see its factors.'],
    primes:['Prime numbers','A prime number has exactly two factors: 1 and itself. Cross out the multiples step by step, and the primes are what is left.'],
    squares:['Square numbers','A square number is a number times itself. The dots make a perfect square. Tap a highlighted number.']}[mode];
  head(host, T[0], T[1]);
  const top = h('div', 'controls'), sq = h('div', 'hsq'), info = h('div', 'hinfo'), row = h('div', 'row');
  row.style.justifyContent = 'center';
  host.append(top, sq, info, row);
  const cells = [];
  for (let n = 1; n <= 100; n++){ const c = h('button', 'hc', String(n)); c.dataset.n = n; sq.appendChild(c); cells.push(c); }
  const C = n => cells[n - 1];
  const clear = () => cells.forEach(c => c.className = 'hc');
  if (mode === 'multiples'){
    let m = 6, found = new Set(), miss = 0;
    const st = stepper('Multiples of', m, 2, 12, v => { m = v; start(); }, 'a');
    top.append(st);
    const fb = h('div', 'feedback'); fb.setAttribute('aria-live', 'polite'); info.appendChild(fb);
    row.append(btn('Show me', 'ghost', () => { for (let n = m; n <= 100; n += m) C(n).classList.add('on'); fb.className = 'feedback'; fb.textContent = `The multiples of ${m} up to 100. Do you see the pattern?`; }), btn('Start again', 'ghost', start));
    const total = () => Math.floor(100 / m);
    function start(){ clear(); found = new Set(); miss = 0; fb.className = 'feedback'; fb.textContent = `Tap every multiple of ${m}. Count in ${m}s: ${m}, ${2*m}, ${3*m}…`; }
    cells.forEach(c => c.onclick = () => {
      const n = +c.dataset.n;
      if (n % m === 0){ if (!found.has(n)){ found.add(n); c.classList.add('on'); }
        fb.className = 'feedback good'; fb.textContent = `${n} = ${n/m} × ${m} ✓  Found ${found.size} of ${total()}`;
        if (found.size === total()){ fb.textContent = `You found all ${total()} multiples of ${m}! +3 stars`; reward(3, 'multiples'); }
      } else { miss++; c.classList.add('no'); setTimeout(() => c.classList.remove('no'), 600); fb.className = 'feedback bad'; fb.textContent = `${n} is not in the ${m} times table. ${n} ÷ ${m} leaves ${n % m} left over.`; }
    });
    start();
  } else if (mode === 'factors'){
    let N = 24;
    const st = stepper('Number', N, 1, 100, v => { N = v; showF(); }, 'a');
    top.append(st);
    cells.forEach(c => c.onclick = () => { N = +c.dataset.n; st.set(N); showF(); });
    function showF(){
      clear();
      const pairs = []; for (let a = 1; a * a <= N; a++) if (N % a === 0) pairs.push([a, N / a]);
      const fs = [...new Set(pairs.flat())].sort((x, y) => x - y);
      fs.forEach(f => C(f).classList.add('on')); C(N).classList.add('pick');
      const kind = fs.length === 2 ? ` <b>${N} is prime</b>: only 1 and itself.` : N === 1 ? ' 1 has only one factor, so it is not prime.' : pairs.some(([a, b]) => a === b) ? ` <b>${N} is a square number</b>: one rectangle is a square!` : '';
      info.innerHTML = `<p class="explain">Factors of <b>${N}</b>: ${fs.join(', ')}.${kind}</p><div class="rects">${pairs.map(([a, b]) => `<div class="rect"><div class="rd" style="grid-template-columns:repeat(${b}, var(--rd))">${dots(a*b, 'rdot')}</div><span>${a} × ${b}</span></div>`).join('')}</div>`;
      info.querySelectorAll('.rd').forEach(r => { const cols = +r.style.gridTemplateColumns.match(/repeat\((\d+)/)[1]; r.style.setProperty('--rd', Math.max(4, Math.min(12, Math.floor(260 / cols) - 2)) + 'px'); });
      reward(0, null);
    }
    showF();
  } else if (mode === 'primes'){
    const PR = [2, 3, 5, 7]; let stage = 0;
    const fb = h('p', 'explain'); info.appendChild(fb);
    const nextB = btn('Next step', '', step);
    row.append(nextB, btn('Start again', 'ghost', () => { stage = 0; clear(); fb.innerHTML = 'Press <b>Next step</b> to start the sieve.'; nextB.disabled = false; }));
    fb.innerHTML = 'Press <b>Next step</b> to start the sieve.';
    function step(){
      if (stage === 0){ C(1).classList.add('x'); fb.innerHTML = '<b>1</b> is not prime: it has only one factor. Cross it out.'; }
      else if (stage <= PR.length){
        const p = PR[stage - 1]; C(p).classList.add('prime');
        let n = 0; for (let k = p * 2; k <= 100; k += p) if (!C(k).classList.contains('x')){ C(k).classList.add('x', 'nx'); n++; }
        setTimeout(() => cells.forEach(c => c.classList.remove('nx')), 900);
        fb.innerHTML = `<b>${p}</b> is prime, so circle it. Cross out every other multiple of ${p}: ${n} more number${n === 1 ? '' : 's'} crossed out.`;
      } else {
        const primes = cells.filter(c => !c.classList.contains('x')).map(c => +c.dataset.n);
        primes.forEach(n => C(n).classList.add('prime'));
        fb.innerHTML = `Everything left is prime! There are <b>${primes.length}</b> primes up to 100:<br>${primes.join(', ')}.`;
        nextB.disabled = true; reward(2, 'primes');
      }
      stage++;
    }
  } else {
    const fb = h('div', null); info.appendChild(fb);
    for (let k = 1; k <= 10; k++) C(k * k).classList.add('on');
    const showS = k => {
      fb.innerHTML = `<p class="explain"><b>${k} × ${k} = ${k*k}</b>. We say “${k} squared”, written ${k}².</p><div class="rects"><div class="rect"><div class="rd" style="grid-template-columns:repeat(${k}, 14px);--rd:14px">${dots(k*k, 'rdot')}</div></div></div>`;
      cells.forEach(c => c.classList.remove('pick')); C(k*k).classList.add('pick');
    };
    cells.forEach(c => c.onclick = () => { const n = +c.dataset.n, k = Math.round(Math.sqrt(n)); if (k * k === n) showS(k); else { fb.innerHTML = `<p class="explain">${n} is not a square number. ${Math.floor(Math.sqrt(n))}² = ${Math.floor(Math.sqrt(n)) ** 2} is a bit smaller and ${Math.ceil(Math.sqrt(n))}² = ${Math.ceil(Math.sqrt(n)) ** 2} is a bit bigger.</p>`; } });
    showS(4); reward(0, null);
  }
}

/* =====================================================================
   QUICK QUESTIONS: missing numbers, word problems (with bar models)
   ===================================================================== */
function barModel(n, part, total, unknown, extra){
  // n equal parts; unknown: 'total' | 'part' | 'count'
  const W = 600, x0 = 10, bw = (W - 20) / n, y = 54, fs = n > 8 ? 18 : 24;
  let s = `<svg viewBox="0 0 ${W} ${extra ? 190 : 150}" class="bm" role="img" aria-label="Bar model">`;
  s += `<path d="M${x0} 40 v-12 h${W - 20} v12" class="br"/><text x="${W/2}" y="20" class="bt">${unknown === 'total' ? 'total = ?' : fmt(total)}</text>`;
  for (let i = 0; i < n; i++){
    s += `<rect x="${x0 + i*bw + 2}" y="${y}" width="${bw - 4}" height="54" rx="10" class="bp${unknown === 'part' && i === 0 ? ' q' : ''}"/>`;
    s += `<text x="${x0 + i*bw + bw/2}" y="${y + 36}" class="bpt" style="font-size:${fs}px">${unknown === 'part' ? (i === 0 ? '?' : '') : fmt(part)}</text>`;
  }
  s += `<text x="${W/2}" y="${y + 86}" class="bc">${unknown === 'count' ? 'How many groups?' : `${n} equal parts`}</text>`;
  if (extra) s += `<text x="${W/2}" y="${y + 122}" class="bc">${extra}</text>`;
  return s + '</svg>';
}
const ITEMS = [['boxes','pencils'],['bags','apples'],['packs','stickers'],['rows','chairs'],['shelves','books'],['teams','players'],['trays','cupcakes'],['buses','children']];
const NAMES = ['Saif','Amira','Omar','Layla','Yusuf','Mariam','Adam','Noor','Zain','Huda'];
function makeWord(){
  const t = rnd(1, 7), [box, thing] = pick(ITEMS), who = pick(NAMES);
  let n, k, q;
  switch (t){
    case 1: n = rnd(3, 9); k = rnd(4, 12); return {text:`There are <b>${n} ${box}</b> with <b>${k} ${thing}</b> in each. How many ${thing} are there altogether?`, op:'×', ans:n*k,
      bar:barModel(n, k, n*k, 'total'), explain:`${n} groups of ${k}: ${n} × ${k} = ${n*k}.`};
    case 2: n = rnd(3, 8); k = rnd(4, 12); return {text:`${who} shares <b>${n*k} ${thing}</b> equally between <b>${n} ${box}</b>. How many ${thing} go in each?`, op:'÷', ans:k,
      bar:barModel(n, k, n*k, 'part'), explain:`Sharing ${n*k} into ${n} equal parts: ${n*k} ÷ ${n} = ${k}.`};
    case 3: n = rnd(3, 9); k = rnd(3, 10); return {text:`${who} puts <b>${n*k} ${thing}</b> into ${box} of <b>${k}</b>. How many ${box} does ${who} fill?`, op:'÷', ans:n,
      bar:barModel(n, k, n*k, 'count'), explain:`How many groups of ${k} in ${n*k}? ${n*k} ÷ ${k} = ${n}.`};
    case 4: k = rnd(4, 8); n = rnd(3, 8); q = n * k + rnd(1, k - 1); return {text:`<b>${q} children</b> are going on a trip. Each minibus holds <b>${k}</b> children. How many minibuses are needed?`, op:'÷', ans:Math.ceil(q/k),
      bar:barModel(n + 1, k, q, 'count', `${q} ÷ ${k} = ${Math.floor(q/k)} r ${q % k}`), explain:`${q} ÷ ${k} = ${Math.floor(q/k)} remainder ${q % k}. The ${q % k} children left over still need a bus, so round UP to ${Math.ceil(q/k)}.`};
    case 5: k = rnd(3, 9); n = rnd(3, 9); q = n * k + rnd(1, k - 1); return {text:`${who} has <b>${q} cm</b> of ribbon. Each bow needs <b>${k} cm</b>. How many whole bows can ${who} make?`, op:'÷', ans:Math.floor(q/k),
      bar:barModel(n, k, q, 'count', `${q} ÷ ${k} = ${n} r ${q % k}`), explain:`${q} ÷ ${k} = ${n} remainder ${q % k}. The ${q % k} cm left over is not enough for another bow, so round DOWN to ${n}.`};
    case 6: n = rnd(3, 8); k = rnd(5, 12); q = rnd(2, n*k - 5); return {text:`${who} buys <b>${n} ${box}</b> of ${thing} with <b>${k}</b> in each, then gives away <b>${q}</b>. How many ${thing} are left?`, op:'two', ans:n*k - q,
      bar:barModel(n, k, n*k, 'total', `then take away ${q}`), explain:`Step 1: ${n} × ${k} = ${n*k}. Step 2: ${n*k} − ${q} = ${n*k - q}.`};
    default: k = rnd(12, 45); n = rnd(3, 6); return {text:`A pencil is <b>${k} mm</b> long. A ruler is <b>${n} times</b> as long. How long is the ruler, in mm?`, op:'×', ans:n*k,
      bar:barModel(n, k, n*k, 'total'), explain:`${n} times as long means ${n} × ${k} = ${n*k} mm.`};
  }
}
function makeMissing(level){
  const a = rnd(2, 12), b = rnd(2, 12), big = level === 'big';
  const A = big ? a * pick([10, 100]) : a, c = A * b;
  const t = rnd(1, 4);
  const q = [
    [`<span class="mbox">?</span> × ${b} = ${fmt(c)}`, A, `Use the inverse: ? = ${fmt(c)} ÷ ${b}`],
    [`${fmt(A)} × <span class="mbox">?</span> = ${fmt(c)}`, b, `Use the inverse: ? = ${fmt(c)} ÷ ${fmt(A)}`],
    [`${fmt(c)} ÷ <span class="mbox">?</span> = ${b}`, A, `Think: ${b} × ? = ${fmt(c)}`],
    [`<span class="mbox">?</span> ÷ ${b} = ${fmt(A)}`, c, `Use the inverse: ? = ${fmt(A)} × ${b}`]
  ][t - 1];
  return {text:`<div class="problem small">${q[0]}</div>`, ans:q[1], hintText:q[2], explain:`The missing number is ${fmt(q[1])}.`,
    fam:`<div class="minitri">Fact family: <b>${fmt(A)}</b>, <b>${b}</b>, <b>${fmt(c)}</b>. ${fmt(A)} × ${b} = ${fmt(c)} · ${b} × ${fmt(A)} = ${fmt(c)} · ${fmt(c)} ÷ ${b} = ${fmt(A)} · ${fmt(c)} ÷ ${fmt(A)} = ${b}</div>`};
}
function quick(host, kind){
  const words = kind === 'words';
  head(host, words ? 'Word problems' : 'Missing numbers', words ? 'Read carefully. Draw a bar model to see what is happening. Decide: × or ÷? Then solve it.' : 'Find the number hiding behind the box. Multiplying and dividing undo each other, so use the inverse.');
  const S = SM.S(); let level = (S.glevel || {}).missing || 'tt';
  const top = h('div', 'controls');
  if (!words) top.appendChild(seg([['tt','Times tables'],['big','Bigger numbers']], level, v => { level = v; S.glevel = S.glevel || {}; S.glevel.missing = v; SM.save(); next(); }));
  const meter = h('div', 'meter'); meter.innerHTML = 'Right <b>0</b>';
  top.appendChild(meter);
  const area = h('div', 'q-area');
  const qEl = h('div', 'q wq'), pad = h('div', 'pad');
  area.append(qEl, pad); host.append(top, area);
  let P, input = '', stage = 'ans', right = 0, missed = false, locked = false;
  const handlers = {
    digit: d => { if (locked || stage !== 'ans' || input.length >= 5) return; input += d; drawAns(); },
    del: () => { if (locked) return; input = input.slice(0, -1); drawAns(); },
    go: () => { if (locked) { next(); return; } if (stage === 'ans' && input) check(); }
  };
  SM.buildPad(pad, handlers);
  function drawAns(){ const a = qEl.querySelector('.answer'); if (a){ a.textContent = input || '?'; a.classList.toggle('empty', !input); } }
  function next(){
    P = words ? makeWord() : makeMissing(level);
    input = ''; missed = false; locked = false; padTarget = handlers;
    stage = words && P.op !== 'two' ? 'op' : 'ans';
    qEl.className = 'q wq';
    qEl.innerHTML = `<div class="wtext">${P.text}</div>
      ${stage === 'op' ? `<div class="opq"><p class="lbl2">Do you need to multiply or divide?</p><div class="row"><button class="btn ghost opb" data-o="×">× Multiply</button><button class="btn ghost opb" data-o="÷">÷ Divide</button></div></div>` : ''}
      <div class="ansrow" ${stage === 'op' ? 'hidden' : ''}>Answer: <span class="answer empty">?</span></div>
      <div class="feedback" aria-live="polite"></div>
      <div class="hint" hidden></div>
      <div class="row"><button class="btn ghost small hb">${words ? 'Show the bar model' : 'Hint'}</button></div>`;
    qEl.querySelectorAll('.opb').forEach(b => b.onclick = () => {
      const fb = qEl.querySelector('.feedback');
      if (b.dataset.o === P.op){ fb.className = 'feedback good'; fb.textContent = `Yes, ${P.op === '×' ? 'multiply' : 'divide'}! Now work it out.`; stage = 'ans'; qEl.querySelector('.opq').hidden = true; qEl.querySelector('.ansrow').hidden = false; }
      else { missed = true; fb.className = 'feedback bad'; fb.textContent = 'Not quite. Look at the bar model: do we know the total or the parts?'; showHint(); shake(b); }
    });
    qEl.querySelector('.hb').onclick = showHint;
  }
  function showHint(){ const hn = qEl.querySelector('.hint'); hn.hidden = false; hn.innerHTML = words ? P.bar : `<p>${P.hintText}</p>${P.fam}`; }
  function check(){
    const fb = qEl.querySelector('.feedback');
    if (+input === P.ans){
      locked = true; right++; meter.innerHTML = `Right <b>${right}</b>`;
      qEl.classList.add('good'); fb.className = 'feedback good'; fb.innerHTML = `Correct! ${P.explain}` + (missed ? '' : ' +1 star');
      if (words){ const hn = qEl.querySelector('.hint'); hn.hidden = false; hn.innerHTML = P.bar; }
      reward(missed ? 0 : 1, kind);
      qEl.querySelector('.row').innerHTML = ''; qEl.querySelector('.row').appendChild(btn('Next question', '', next));
    } else {
      missed = true; input = ''; drawAns(); shake(qEl);
      fb.className = 'feedback bad'; fb.textContent = words ? 'Not quite. Look at the bar model and try again.' : `Not quite. ${P.hintText}.`;
      showHint();
    }
  }
  next();
}

/* =====================================================================
   DECIMALS, PUZZLES AND CUBES (Year 5)
   ===================================================================== */
const D = s => Math.round(parseFloat(s) * 1000);                 // text -> thousandths
const fd = n => { const s = (n / 1000).toFixed(3); return s.replace(/\.?0+$/, ''); };   // thousandths -> text
const fh = n => fd(n * 10);                                       // hundredths -> text
const shuffle = a => { for (let i = a.length - 1; i > 0; i--){ const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function dpad(el, handlers){
  el.innerHTML = ''; el.classList.add('dpad');
  ['1','2','3','4','5','6','7','8','9','.','0','del','go'].forEach(k => {
    const b = h('button', k === 'del' ? 'del' : k === 'go' ? 'go' : '', k === 'del' ? '⌫' : k === 'go' ? '✓ Check' : k);
    if (k === 'del') b.setAttribute('aria-label', 'Delete');
    if (k === 'go') b.setAttribute('aria-label', 'Check answer');
    if (k === '.') b.setAttribute('aria-label', 'Decimal point');
    b.onclick = () => k === 'del' ? handlers.del() : k === 'go' ? handlers.go() : handlers.digit(k);
    el.appendChild(b);
  });
}
function typer(onChange, maxLen){
  let input = '';
  const t = {
    get v(){ return input; }, set v(x){ input = x; onChange(input); },
    digit(d){ if (t.locked || input.length >= (maxLen || 8)) return; if (d === '.' && input.includes('.')) return; input = (d === '.' && !input ? '0' : input) + d; onChange(input); },
    dot(){ t.digit('.'); },
    del(){ if (t.locked) return; input = input.slice(0, -1); onChange(input); },
    locked: false
  };
  return t;
}

/* Generic decimal quiz: cfg.make(level) -> {html, ans (thousandths), hint, explain} */
function dquiz(host, cfg){
  const S = SM.S(); S.glevel = S.glevel || {};
  let level = S.glevel[cfg.kind] || (cfg.levels ? cfg.levels[0][0] : null);
  const top = h('div', 'controls');
  if (cfg.levels) top.appendChild(seg(cfg.levels, level, v => { level = v; S.glevel[cfg.kind] = v; SM.save(); next(); }));
  const meter = h('div', 'meter'); meter.innerHTML = 'Right <b>0</b>'; top.appendChild(meter);
  const area = h('div', 'q-area'), qEl = h('div', 'q wq'), pad = h('div', 'pad');
  area.append(qEl, pad); host.append(top, area);
  let P, right = 0, missed = false;
  const T = typer(v => { const a = qEl.querySelector('.answer'); if (a){ a.textContent = v || '?'; a.classList.toggle('empty', !v); } });
  T.go = () => { if (T.locked) { next(); return; } if (T.v && T.v !== '0.') check(); };
  dpad(pad, T);
  function next(){
    P = cfg.make(level); T.locked = false; T.v = ''; missed = false; padTarget = T;
    qEl.className = 'q wq';
    qEl.innerHTML = `<div class="wtext">${P.html}</div><div class="ansrow">${P.label || 'Answer'}: <span class="answer empty">?</span></div>
      <div class="feedback" aria-live="polite"></div><div class="hint" hidden></div><div class="row"><button class="btn ghost small hb">Hint</button></div>`;
    qEl.querySelector('.hb').onclick = showHint;
  }
  function showHint(){ const hn = qEl.querySelector('.hint'); hn.hidden = false; hn.innerHTML = P.hint; }
  function check(){
    const fb = qEl.querySelector('.feedback');
    if (D(T.v) === P.ans){
      T.locked = true; right++; meter.innerHTML = `Right <b>${right}</b>`;
      qEl.classList.add('good'); fb.className = 'feedback good'; fb.innerHTML = `Correct! ${P.explain}` + (missed ? '' : ' +1 star');
      if (P.after){ const hn = qEl.querySelector('.hint'); hn.hidden = false; hn.innerHTML = P.after; }
      reward(missed ? 0 : 1, cfg.kind);
      const r = qEl.querySelector('.row'); r.innerHTML = ''; r.appendChild(btn('Next question', '', next));
    } else {
      missed = true; T.v = ''; shake(qEl);
      fb.className = 'feedback bad'; fb.textContent = 'Not quite. Look at the hint and try again.'; showHint();
    }
  }
  next();
}

/* Tap-to-choose challenge (ring / tick) */
function tapChallenge(host, cfg){
  host.appendChild(h('h3', 'y5-h3', cfg.title));
  const q = h('p', 'explain'), chips = h('div', 'y5-chips'), fb = h('div', 'feedback'), list = h('div', 'y5-why'), row = h('div', 'row');
  fb.setAttribute('aria-live', 'polite'); row.style.justifyContent = 'center';
  host.append(q, chips, row, fb, list);
  let P, picked = new Set(), done = false;
  const checkB = btn('Check', '', check);
  row.append(checkB, btn('New numbers', 'ghost', start));
  function start(){
    P = cfg.make(); picked = new Set(); done = false; checkB.disabled = false;
    q.innerHTML = P.q; fb.className = 'feedback'; fb.textContent = ''; list.innerHTML = '';
    chips.innerHTML = '';
    P.items.forEach((it, i) => {
      const c = h('button', 'y5-chip', it.label); c.setAttribute('aria-pressed', 'false');
      c.onclick = () => {
        if (done) return;
        if (picked.has(i)) picked.delete(i); else { if (cfg.max && picked.size >= cfg.max) return; picked.add(i); }
        c.setAttribute('aria-pressed', picked.has(i));
      };
      chips.appendChild(c);
    });
  }
  function check(){
    const els = [...chips.children];
    const wrong = P.items.filter((it, i) => it.good !== picked.has(i)).length;
    els.forEach((c, i) => { c.classList.remove('ok', 'no'); if (picked.has(i)) c.classList.add(P.items[i].good ? 'ok' : 'no'); });
    if (!wrong){
      done = true; checkB.disabled = true; fb.className = 'feedback good'; fb.textContent = 'All correct! +2 stars'; reward(2, cfg.kind);
      list.innerHTML = P.why;
    } else {
      fb.className = 'feedback bad'; fb.textContent = cfg.tryMsg(wrong); shake(chips);
      if (cfg.showWhyOnMiss) list.innerHTML = P.why;
    }
  }
  start();
}

/* ---------- Rounding decimals ---------- */
function lessonRound(host){
  head(host, 'Rounding decimals', 'To round to the nearest whole number, look at the <b>tenths digit</b> (the first digit after the point). 5 or more: round <b>up</b>. Less than 5: the whole number <b>stays</b>.');
  let W = 8, t = 54;
  const top = h('div', 'controls');
  top.appendChild(stepper('Whole number', W, 0, 99, v => { W = v; draw(); }, 'a'));
  const box = h('div', 'nl-box'), say = h('p', 'explain');
  const rng = h('input', 'y5-rng'); rng.type = 'range'; rng.min = 0; rng.max = 99; rng.value = t; rng.setAttribute('aria-label', 'Slide the decimal along the line');
  rng.oninput = () => { t = +rng.value; draw(); };
  host.append(top, box, rng, say);
  function draw(){
    const x0 = 34, x1 = 486, X = k => x0 + (x1 - x0) * k / 100, up = t >= 50, R = up ? W + 1 : W;
    let s = `<svg class="nl y5-nl" viewBox="0 0 520 104" role="img" aria-label="Number line from ${W} to ${W + 1}">`;
    s += `<rect class="y5-half" x="${X(50)}" y="30" width="${X(100) - X(50)}" height="30" rx="4"/>`;
    s += `<line class="ax" x1="${x0}" y1="45" x2="${x1}" y2="45"/>`;
    for (let k = 0; k <= 10; k++){
      const big = k === 0 || k === 10 || k === 5;
      s += `<line class="tk" x1="${X(k * 10)}" x2="${X(k * 10)}" y1="${big ? 32 : 38}" y2="${big ? 58 : 52}"/>`;
      s += `<text class="nlab" x="${X(k * 10)}" y="80" style="font-size:${k === 0 || k === 10 ? 24 : 16}px">${k === 0 ? W : k === 10 ? W + 1 : fh(W * 100 + k * 10)}</text>`;
    }
    s += `<circle class="y5-ring" cx="${X(up ? 100 : 0)}" cy="74" r="16"/>`;
    s += `<path class="y5-mk ${up ? 'up' : 'dn'}" d="M${X(t)} 30 l-8 -13 h16z"/>`;
    s += `<text class="nlab" x="${Math.max(30, Math.min(490, X(t)))}" y="14" style="font-size:20px">${fh(W * 100 + t)}</text></svg>`;
    box.innerHTML = s;
    const td = Math.floor(t / 10);
    say.innerHTML = `<b>${fh(W * 100 + t)}</b>: the tenths digit is <b class="${up ? 'y5-good' : 'bad-t'}">${td}</b>. ${td} is ${up ? '5 or more, so round <b>up</b>' : 'less than 5, so the whole number <b>stays</b>'} → <b>${R}</b>`;
  }
  draw();
  const rounds = v => Math.floor((v + 50) / 100);
  tapChallenge(host, {kind:'round', title:'Challenge: ring the numbers', tryMsg: n => `${n} not right yet. Check the tenths digit of each number.`, showWhyOnMiss:false,
    make(){
      const T = rnd(3, 30); let good = [], bad = [], seen = new Set(), guard = 0;
      while ((good.length < 3 || bad.length < 3) && guard++ < 500){
        const base = pick([T - 1, T, T, T + 1]); let f = rnd(0, 99); if (rnd(0, 1)) f = rnd(0, 9) * 10;
        const v = base * 100 + f; if (v <= 0 || seen.has(v)) continue;
        if (rounds(v) === T){ if (good.length < 3){ good.push(v); seen.add(v); } } else if (bad.length < 3){ bad.push(v); seen.add(v); }
      }
      const items = shuffle([...good.map(v => ({v, good:true})), ...bad.map(v => ({v, good:false}))]).map(o => ({...o, label: fh(o.v)}));
      return {q:`Tap to ring every number that equals <b>${T}</b> when rounded to the nearest whole number.`, items,
        why:'<ul>' + items.map(o => `<li>${o.label}: tenths digit ${Math.floor((o.v % 100) / 10)} → <b>${rounds(o.v)}</b> ${o.good ? '✓' : ''}</li>`).join('') + '</ul>'};
    }});
  reward(0, null);
}

/* ---------- Decimal sequences ---------- */
function lessonSeq(host){
  head(host, 'Decimal sequences', 'A sequence changes by the same amount each time. Find the step from two numbers next to each other, then keep adding. To go backwards, subtract.');
  const S = SM.S(); S.glevel = S.glevel || {}; let level = S.glevel.dseq || 'find';
  const top = h('div', 'controls');
  top.appendChild(seg([['find','Find the step'],['back','Go backwards']], level, v => { level = v; S.glevel.dseq = v; SM.save(); next(); }));
  const meter = h('div', 'meter'); meter.innerHTML = 'Right <b>0</b>'; top.appendChild(meter);
  const area = h('div', 'q-area'), qEl = h('div', 'q wq'), pad = h('div', 'pad');
  area.append(qEl, pad); host.append(top, area);
  let P, right = 0, missed = false;
  const T = typer(v => { const c = qEl.querySelector('.y5-term.cur'); if (c){ c.textContent = v || '?'; } const a = qEl.querySelector('.answer'); if (a){ a.textContent = v || '?'; a.classList.toggle('empty', !v); } });
  T.go = () => { if (T.locked) { next(); return; } if (T.v) check(); };
  dpad(pad, T);
  function next(){
    const step = pick([5, 10, 15, 20, 25, 25, 30, 50, 75]);
    const start = rnd(2, 60) * 5;
    const terms = Array.from({length:6}, (_, i) => start + i * step);
    let blanks, stage;
    if (level === 'find'){ blanks = pick([[2, 3, 5], [2, 4, 5], [3, 4], [2, 3]]); stage = 'step'; }
    else { blanks = [0, 3]; stage = 'fill'; terms.length = 4; }
    P = {step, terms, blanks, known:new Set(), stage, cur: stage === 'fill' ? blanks[0] : -1};
    T.locked = false; T.v = ''; missed = false; padTarget = T; render();
  }
  function render(){
    const showStep = P.stage === 'fill' || P.stage === 'done';
    const row = P.terms.map((v, i) => {
      const hidden = P.blanks.includes(i) && !P.known.has(i);
      const cls = 'y5-term' + (hidden ? ' gap' : '') + (i === P.cur ? ' cur' : '') + (P.known.has(i) ? ' found' : '');
      return `<span class="${cls}">${hidden ? '?' : fh(v)}</span>`;
    }).join(`<span class="y5-step">${showStep ? '+' + fh(P.step) : '+ ?'}</span>`);
    const first = P.terms.findIndex((_, i) => !P.blanks.includes(i));
    let ask;
    if (P.stage === 'step') ask = `Step: <span class="answer empty">?</span>`;
    else if (P.stage === 'done') ask = 'Sequence complete!';
    else ask = `Type the number in the yellow box.`;
    qEl.className = 'q wq';
    qEl.innerHTML = `<div class="y5-seq">${row}</div><div class="ansrow">${ask}</div><div class="feedback" aria-live="polite"></div><div class="hint" hidden></div>
      <div class="row">${P.stage === 'done' ? '' : '<button class="btn ghost small hb">Hint</button>'}</div>`;
    const hb = qEl.querySelector('.hb'); if (hb) hb.onclick = showHint;
    P.hintText = P.stage === 'step'
      ? `Take two numbers next to each other: ${fh(P.terms[first + 1])} − ${fh(P.terms[first])} = ?`
      : P.cur === 0 ? `Going backwards: ${fh(P.terms[1])} − ${fh(P.step)} = ?` : `Add the step: ${fh(P.terms[P.cur - 1])} + ${fh(P.step)} = ?`;
  }
  function showHint(){ const hn = qEl.querySelector('.hint'); hn.hidden = false; hn.innerHTML = `<p>${P.hintText}</p>`; }
  function nextBlank(){ return P.blanks.find(i => !P.known.has(i)); }
  function check(){
    const want = P.stage === 'step' ? P.step : P.terms[P.cur];
    const fb = () => qEl.querySelector('.feedback');
    if (D(T.v) === want * 10){
      if (P.stage === 'step'){ P.stage = 'fill'; P.cur = nextBlank(); T.v = ''; render(); const f = fb(); f.className = 'feedback good'; f.textContent = `Yes! The step is ${fh(P.step)}. Now fill the gaps.`; return; }
      P.known.add(P.cur); const nb = nextBlank(); T.v = '';
      if (nb === undefined){
        P.stage = 'done'; P.cur = -1; T.locked = true; right++; meter.innerHTML = `Right <b>${right}</b>`; render();
        const f = fb(); f.className = 'feedback good'; f.textContent = 'You filled every gap!' + (missed ? '' : ' +2 stars');
        reward(missed ? 0 : 2, 'dseq');
        const r = qEl.querySelector('.row'); r.innerHTML = ''; r.appendChild(btn('Next sequence', '', next));
      } else { P.cur = nb; render(); const f = fb(); f.className = 'feedback good'; f.textContent = 'Correct! Next gap.'; }
    } else {
      missed = true; T.v = ''; shake(qEl); const f = fb(); f.className = 'feedback bad'; f.textContent = 'Not quite. Try the hint.'; showHint();
    }
  }
  next();
}

/* ---------- Make 1 and 10 ---------- */
function hundredGrid(filled){
  return `<div class="y5-hg" aria-hidden="true">${Array.from({length:100}, (_, i) => `<i class="${i < filled ? 'on' : ''}"></i>`).join('')}</div>`;
}
function lessonBonds(host){
  head(host, 'Make 1 and make 10', 'Some decimals fit together perfectly. 1 whole is 100 hundredths, so 0.37 + 0.63 = 1. To make 10, first fill up to the next whole number.');
  dquiz(host, {kind:'bonds', levels:[['one','Make 1'],['ten','Make 10']], make(level){
    if (level === 'one'){
      const n = rnd(0, 1) ? rnd(1, 9) * 10 : rnd(1, 99);
      return {html:`<div class="problem small">${fh(n)} + <span class="mbox">?</span> = 1</div>`, ans:(100 - n) * 10,
        hint:`${hundredGrid(n)}<p>${fh(n)} is ${n} hundredths (shaded). 100 − ${n} = ${100 - n} empty squares.</p>`,
        explain:`${fh(n)} + ${fh(100 - n)} = 1`, after: hundredGrid(n)};
    }
    const w = rnd(1, 9), f = rnd(0, 1) ? rnd(1, 9) * 10 : rnd(1, 99), a = w * 100 + f, need = 100 - f;
    return {html:`<div class="problem small">${fh(a)} + <span class="mbox">?</span> = 10</div>`, ans:(1000 - a) * 10,
      hint:`<p>Count up in two hops: ${fh(a)} + <b>${fh(need)}</b> = ${w + 1}, then ${w + 1} + <b>${9 - w}</b> = 10.</p>`,
      explain:`${fh(a)} + ${fh(1000 - a)} = 10`};
  }});
  tapChallenge(host, {kind:'bonds', max:2, title:'Challenge: tick the two numbers that total 10', tryMsg: () => 'Not those two. Add them up: do you get exactly 10?', showWhyOnMiss:false,
    make(){
      for (let g = 0; g < 300; g++){
        const p = rnd(5, 9) * 100 + (rnd(0, 1) ? rnd(1, 9) * 10 : rnd(1, 99)), q = 1000 - p;
        const pool = [...new Set([q + 10, q + 100, p - 9 * (p % 10 ? 1 : 10), p - 90, q + 1, q - 1, p + 1, 1000 - p + 90].filter(v => v > 0 && v < 1000 && v !== p && v !== q))];
        if (pool.length < 4) continue;
        const ds = shuffle(pool).slice(0, 4), all = [p, q, ...ds];
        let pairs = 0; for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (all[i] + all[j] === 1000) pairs++;
        if (pairs !== 1 || new Set(all).size !== 6) continue;
        const items = shuffle(all.map(v => ({v, good: v === p || v === q, label: fh(v)})));
        return {q:'Tick the <b>two</b> numbers that total <b>10</b>.', items, why:`<p class="explain">${fh(p)} + ${fh(q)} = 10 ✓</p>`};
      }
    }});
}

/* ---------- Add and subtract decimals ---------- */
const dpOf = n => (fd(n).split('.')[1] || '').length;
function colHTML(rows, sign, ansRow){
  const dp = Math.max(...rows.concat(ansRow == null ? [] : [ansRow]).map(dpOf));
  const strs = rows.concat(ansRow == null ? [] : [ansRow]).map(n => {
    const own = dpOf(n), s = (n / 1000).toFixed(dp);
    return {s, pad: dp - own};
  });
  const wmax = Math.max(...strs.map(o => o.s.length));
  const line = (o, op, cls) => {
    const sp = wmax - o.s.length; let cells = `<span class="op">${op}</span>` + '<span></span>'.repeat(sp);
    [...o.s].forEach((ch, i) => { const zero = i >= o.s.length - o.pad; cells += `<span class="${ch === '.' ? 'pt' : ''}${zero ? ' z' : ''}">${ch}</span>`; });
    return `<div class="y5-crow ${cls || ''}" style="grid-template-columns:repeat(${wmax + 1}, 1.1em)">${cells}</div>`;
  };
  let out = `<div class="y5-col">` + line(strs[0], '') + line(strs[1], sign);
  out += `<div class="y5-cline"></div>`;
  if (ansRow != null) out += line(strs[2], '', 'ans');
  out += '</div>';
  if (strs.some(o => o.pad)) out += `<p class="small center">Faded zeros are added so every number has the same number of decimal places.</p>`;
  return out;
}
function genDec(maxW, dp){ const unit = Math.pow(10, 3 - dp); let f; do { f = rnd(0, Math.pow(10, dp) - 1); } while (f % 10 === 0 && dp > 1 && rnd(0, 2)); return rnd(1, maxW) * 1000 + f * unit; }
function lessonDcol(host){
  head(host, 'Add and subtract decimals', 'Line up the decimal points, one under the other. Fill empty places with zeros. Then add or subtract column by column from the right, just like whole numbers.');
  dquiz(host, {kind:'dcol', levels:[['add','Add'],['sub','Subtract'],['miss','Missing number']], make(level){
    if (level === 'add'){
      const a = genDec(200, rnd(1, 2)), b = genDec(60, rnd(2, 3)), s = a + b;
      return {html:`<div class="problem small">${fd(a)} + ${fd(b)} = <span class="mbox">?</span></div>`, ans:s,
        hint:`<p>Line up the points:</p>${colHTML([a, b], '+')}`, explain:`${fd(a)} + ${fd(b)} = ${fd(s)}`, after: colHTML([a, b], '+', s)};
    }
    if (level === 'sub'){
      let a, b; do { a = genDec(99, rnd(1, 3)); b = genDec(60, rnd(1, 3)); } while (b >= a);
      return {html:`<div class="problem small">${fd(a)} − ${fd(b)} = <span class="mbox">?</span></div>`, ans:a - b,
        hint:`<p>Line up the points. If a top digit is too small, exchange from the column to its left.</p>${colHTML([a, b], '−')}`, explain:`${fd(a)} − ${fd(b)} = ${fd(a - b)}`, after: colHTML([a, b], '−', a - b)};
    }
    let a, c; do { a = genDec(30, 3); c = genDec(15, 1); } while (c >= a);
    const ans = a - c;
    if (rnd(0, 1)) return {html:`<div class="problem small">${fd(a)} − <span class="mbox">?</span> = ${fd(c)}</div>`, ans,
      hint:`<p>Use the inverse: ? = ${fd(a)} − ${fd(c)}</p>${colHTML([a, c], '−')}`, explain:`${fd(a)} − ${fd(ans)} = ${fd(c)}. Check: ${fd(c)} + ${fd(ans)} = ${fd(a)} ✓`};
    return {html:`<div class="problem small"><span class="mbox">?</span> + ${fd(c)} = ${fd(a)}</div>`, ans,
      hint:`<p>Use the inverse: ? = ${fd(a)} − ${fd(c)}</p>${colHTML([a, c], '−')}`, explain:`${fd(ans)} + ${fd(c)} = ${fd(a)} ✓`};
  }});
}

/* ---------- Number clue puzzles ---------- */
function makeDigitPuzzle(){
  const u = rnd(1, 4), hd = 2 * u, t = rnd(0, 6), k = rnd(1, Math.min(4, 9 - t)), th = t + k, S = th + hd + t + u, N = th * 1000 + hd * 100 + t * 10 + u;
  const rest = k + hd + u;
  return {ans:N, clues:['I am thinking of a four-digit number.', `The hundreds digit is ${hd}.`, 'The hundreds digit is double the units digit.', `The thousands digit is ${k} more than the tens digit.`, `All four digits total ${S}.`],
    places:{Th:th, H:hd, T:t, U:u},
    steps:[
      {fill:['H'], text:`Hundreds digit: H = <b>${hd}</b>`},
      {fill:['U'], text:`Hundreds is double units: ${hd} = 2 × U, so U = <b>${u}</b>`},
      {fill:[], text:`Thousands is ${k} more than tens: Th = T + ${k}`},
      {fill:['T'], text:`Add all digits: (T + ${k}) + ${hd} + T + ${u} = ${S}<br>2 × T + ${rest} = ${S} → 2 × T = ${S - rest} → T = <b>${t}</b>`},
      {fill:['Th'], text:`Th = ${t} + ${k} = <b>${th}</b>. The number is <b>${N}</b>. Check: ${th} + ${hd} + ${t} + ${u} = ${S} ✓`}
    ]};
}
function makeMultiplePuzzle(){
  for (let g = 0; g < 500; g++){
    const m = pick([25, 15, 35, 45, 25]), lo = rnd(2, 18) * 50, hi = lo + pick([100, 150, 200]);
    const cands = []; for (let v = Math.ceil((lo + 1) / m) * m; v < hi; v += m) cands.push(v);
    const par = pick(['even', 'odd']), keep = cands.filter(v => (v % 2 === 0) === (par === 'even'));
    if (cands.length < 3 || cands.length > 7 || keep.length !== 2) continue;
    const ex = pick(keep), ans = keep.find(v => v !== ex);
    return {ans, cands, keep, ex, clues:[`It is a multiple of ${m}.`, `It is ${par}.`, `It is greater than ${lo} but less than ${hi}.`, `It is not ${ex}.`],
      steps:[
        {cross:[], text:`Multiples of ${m} between ${lo} and ${hi}: ${cands.join(', ')}`},
        {cross:cands.filter(v => !keep.includes(v)), text:`It is ${par}: ${par === 'even' ? 'even numbers end in 0, 2, 4, 6 or 8' : 'odd numbers end in 1, 3, 5, 7 or 9'}. Cross out the rest.`},
        {cross:[ex], text:`It is not ${ex}: cross it out. Only <b>${ans}</b> is left!`}
      ]};
  }
}
function lessonClues(host){
  head(host, 'Number clue puzzles', 'Read every clue. Start with the clue that tells you the most, then use the others one by one. Tap <b>Help me</b> to see the next step.');
  const S = SM.S(); S.glevel = S.glevel || {}; let level = S.glevel.clues || 'digits';
  const top = h('div', 'controls');
  top.appendChild(seg([['digits','Digit puzzle'],['multiple','Multiple puzzle']], level, v => { level = v; S.glevel.clues = v; SM.save(); next(); }));
  const meter = h('div', 'meter'); meter.innerHTML = 'Solved <b>0</b>'; top.appendChild(meter);
  const area = h('div', 'q-area'), qEl = h('div', 'q wq'), pad = h('div', 'pad');
  area.append(qEl, pad); host.append(top, area);
  let P, shown = 0, right = 0, missed = false;
  const T = typer(v => { const a = qEl.querySelector('.answer'); if (a){ a.textContent = v || '?'; a.classList.toggle('empty', !v); } }, 5);
  T.go = () => { if (T.locked) { next(); return; } if (T.v) check(); };
  dpad(pad, T);
  function next(){
    P = level === 'digits' ? makeDigitPuzzle() : makeMultiplePuzzle();
    shown = 0; missed = false; T.locked = false; T.v = ''; padTarget = T;
    qEl.className = 'q wq';
    qEl.innerHTML = `<div class="y5-bubble">${P.clues.map(c => `<p>${c}</p>`).join('')}</div><div class="y5-work"></div>
      <div class="ansrow">Number: <span class="answer empty">?</span></div><div class="feedback" aria-live="polite"></div>
      <div class="row"><button class="btn ghost small hb">Help me: next step</button></div>`;
    qEl.querySelector('.hb').onclick = help;
    drawWork();
  }
  function drawWork(){
    const w = qEl.querySelector('.y5-work'); if (!w) return;
    let vis = '';
    if (P.places){
      const filled = new Set(P.steps.slice(0, shown).flatMap(s => s.fill));
      vis = `<div class="y5-pv">${['Th','H','T','U'].map(p => `<div class="${filled.has(p) ? 'on' : ''}"><small>${p}</small><b>${filled.has(p) ? P.places[p] : '?'}</b></div>`).join('')}</div>`;
    } else if (shown){
      const crossed = new Set(P.steps.slice(0, shown).flatMap(s => s.cross));
      vis = `<div class="y5-chips">${P.cands.map(v => `<span class="y5-chip ${crossed.has(v) ? 'x' : ''} ${shown === P.steps.length && v === P.ans ? 'ok' : ''}">${v}</span>`).join('')}</div>`;
    }
    w.innerHTML = vis + (shown ? `<ol class="y5-steps">${P.steps.slice(0, shown).map(s => `<li>${s.text}</li>`).join('')}</ol>` : '');
  }
  function help(){ if (shown < P.steps.length){ shown++; missed = true; drawWork(); } }
  function check(){
    const fb = qEl.querySelector('.feedback');
    if (+T.v === P.ans){
      T.locked = true; right++; meter.innerHTML = `Solved <b>${right}</b>`; shown = P.steps.length; drawWork();
      qEl.classList.add('good'); fb.className = 'feedback good'; fb.textContent = `Correct, the number is ${P.ans}!` + (missed ? ' +1 star' : ' +3 stars, solved on your own!');
      reward(missed ? 1 : 3, 'clues');
      const r = qEl.querySelector('.row'); r.innerHTML = ''; r.appendChild(btn('Next puzzle', '', next));
    } else {
      T.v = ''; shake(qEl); fb.className = 'feedback bad'; fb.textContent = 'Not quite. Check your number against every clue, or tap Help me.';
    }
  }
  next();
}

/* ---------- Cube numbers ---------- */
function isoCube(n){
  const s = Math.max(14, Math.min(30, Math.floor(150 / n))), a = s * 0.866, b = s * 0.5;
  const P = (x, y, z) => [(x - y) * a, (x + y) * b - z * s];
  const pts = arr => arr.map(p => P(...p).map(v => v.toFixed(1)).join(',')).join(' ');
  let polys = '';
  for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) for (let y = 0; y < n; y++){
    const L = z % 2 ? 'b' : 'a';
    polys += `<polygon class="y5-c ${L} top" points="${pts([[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]])}"/>`;
    polys += `<polygon class="y5-c ${L} rt" points="${pts([[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]])}"/>`;
    polys += `<polygon class="y5-c ${L} lf" points="${pts([[x,y+1,z],[x+1,y+1,z],[x+1,y+1,z+1],[x,y+1,z+1]])}"/>`;
  }
  const minX = -n * a - 2, maxX = n * a + 2, minY = -n * s - 2, maxY = 2 * n * b + 2;
  return `<svg class="y5-iso" viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}" role="img" aria-label="${n} by ${n} by ${n} cube made of ${n ** 3} small cubes">${polys}</svg>`;
}
function lessonCubes(host){
  head(host, 'Cube numbers', 'A cube number is a number multiplied by itself <b>three</b> times. The small blocks build a perfect cube: n layers, and each layer is an n × n square.');
  let n = 3;
  const top = h('div', 'controls'); top.appendChild(stepper('Side length', n, 1, 6, v => { n = v; draw(); }, 'a'));
  const pic = h('div', 'y5-isobox'), say = h('p', 'explain');
  host.append(top, pic, say);
  function draw(){
    pic.innerHTML = isoCube(n);
    say.innerHTML = `<b>${n} × ${n} × ${n}</b> = ${n * n} × ${n} = <b>${n ** 3}</b><br>Each layer has ${n} × ${n} = ${n * n} blocks, and there are ${n} layers (the colours swap each layer). We say “${n} cubed”, written ${n}³.`;
    reward(0, null);
  }
  draw();
  host.appendChild(h('div', 'y5-chips', Array.from({length:10}, (_, i) => `<span class="y5-chip">${i + 1}³ = ${(i + 1) ** 3}</span>`).join('')));
  host.appendChild(h('div', 'tip', `<span class="t">Square or cube?</span><p>Square = number × itself (2 times). Cube = number × itself × itself (3 times). <b>64</b> is both: 8 × 8 = 64 and 4 × 4 × 4 = 64. So is 1!</p>`));
  dquiz(host, {kind:'cubes', levels:[['cube','Work out the cube'],['root','Which number was cubed?']], make(level){
    const k = rnd(1, 10);
    if (level === 'cube') return {html:`<div class="problem small">${k}³ = <span class="mbox">?</span></div>`, ans:k ** 3 * 1000,
      hint:`<p>${k}³ = ${k} × ${k} × ${k}. First ${k} × ${k} = ${k * k}, then × ${k}.</p>`, explain:`${k} × ${k} × ${k} = ${k ** 3}`};
    return {html:`<div class="problem small"><span class="mbox">?</span>³ = ${k ** 3}</div>`, ans:k * 1000,
      hint:`<p>Try numbers: which number × itself × itself makes ${k ** 3}? Look at the list of cube numbers above.</p>`, explain:`${k} × ${k} × ${k} = ${k ** 3}`};
  }});
}

/* ---------- start ---------- */
SM._make = {makeColumn, makeShort, makeLong, makeArea, makeWord, makeMissing};
renderMenu();
const m = location.hash.match(/^#learn\/(\w+)/);
if (m && ALL.some(x => x.id === m[1])) openLesson(m[1], true);
})();
