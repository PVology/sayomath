/* Saif Math usage counter for the monitor page (monitor.html).
   Saves simple counts in this browser only: visits per day, minutes played, answers per day,
   lesson opens, tab opens and finished quizzes. No names or answers leave the device.
   If CLOUD is on, it also adds 1 to a few anonymous shared totals (visits, lesson opens,
   quizzes) so the monitor page can show numbers from every device. */
(() => {
const CLOUD = true;             // Ahmed chose the free shared counter (2026-11-23)
const NS = 'saifmath-pvology';  // shared counter name space
const KEY = 'saifmath.stats';
const get = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
const set = (k, v) => { try { localStorage.setItem(k, v); } catch(e){} };
const dayStr = d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
const today = () => dayStr(new Date());

/* Read, change and save in one go, so two open tabs never undo each other's counts. */
function read(){
  let T = null; try { T = JSON.parse(get(KEY)); } catch(e){}
  if (!T || typeof T !== 'object') T = {};
  return Object.assign({v:1, first:today(), visits:{}, mins:{}, ans:{}, quiz:{}, opens:{}, tabs:{}, last:0, seen:{}}, T);
}
function upd(fn){ const T = read(); fn(T); set(KEY, JSON.stringify(T)); return T; }
const bump = (obj, k, n = 1) => { obj[k] = (obj[k] || 0) + n; };

function cloud(key){
  if (!CLOUD) return;
  try { fetch(`https://abacus.jasoncameron.dev/hit/${NS}/${key}`, {mode:'cors', keepalive:true}).catch(() => {}); } catch(e){}
}

/* A visit = opening the app after 30 minutes or more away. */
upd(T => {
  const now = Date.now();
  if (now - (T.last || 0) > 30 * 60 * 1000) {
    bump(T.visits, today()); cloud('visits');
    if (!get('saifmath.device')) { set('saifmath.device', '1'); cloud('devices'); }
  }
  T.last = now;
});

/* Answers per day: compare each player's total answers with the last count we saw. */
function playerKey(){
  let P = null; try { P = JSON.parse(get('saifmath.players')); } catch(e){}
  const id = P && P.current || 'p1';
  return id === 'p1' ? 'sayomath.v1' : 'sayomath.v1.' + id;
}
function totalAnswers(k){
  let S = null; try { S = JSON.parse(get(k)); } catch(e){}
  if (!S) return 0;
  return [...Object.values(S.facts || {}), ...Object.values(S.dfacts || {})].reduce((s, f) => s + (f.c || 0) + (f.w || 0), 0);
}
function countAnswers(){
  const k = playerKey(), n = totalAnswers(k);
  upd(T => { const was = T.seen[k]; if (was != null && n > was) bump(T.ans, today(), n - was); T.seen[k] = n; });
}
countAnswers();

/* Lesson and tab opens, read from the address the app shows (#learn/long, #quiz ...). */
let lastHash = null;
function checkHash(){
  const hsh = location.hash || '#learn';
  if (hsh === lastHash) return;
  lastHash = hsh;
  const m = hsh.match(/^#learn\/([a-z0-9]+)/);
  const tab = (hsh.match(/^#(learn|practice|quiz|progress)/) || [])[1];
  if (m) cloud('lesson-' + m[1]);
  upd(T => { if (m) bump(T.opens, m[1]); if (tab) bump(T.tabs, tab); });
}

/* Minutes played: a minute counts when the page is visible and was used in that minute. */
let used = false;
['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, () => { used = true; }, {passive:true}));
setInterval(() => {
  if (used && document.visibilityState === 'visible') { cloud('minutes'); upd(T => { bump(T.mins, today()); T.last = Date.now(); }); }
  used = false; countAnswers();
}, 60 * 1000);

setInterval(checkHash, 1000);
addEventListener('load', () => {
  checkHash();
  /* Finished quizzes and 60-second challenges: the results card appears. */
  const done = document.getElementById('qDone');
  if (done && window.MutationObserver) new MutationObserver(() => {
    if (!done.hidden) { cloud('quizzes'); upd(T => bump(T.quiz, today())); countAnswers(); }
  }).observe(done, {attributes:true, attributeFilter:['hidden']});
});
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') countAnswers(); });
})();
