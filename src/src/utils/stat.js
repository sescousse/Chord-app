// ── Gestion des statistiques ──────────────────────────────────────────────────
 
export const STATS_KEY = 'cs_stats_v2';
export const DEF_STATS = {
  totalExercises:0, totalSeconds:0, sessionsCount:0, keys:0,
  todayDate:'', todayExercises:0, todayLibViews:0, todaySections:0,
  lastPerfect:'', lastIntervalDay:'', lastChordEarDay:'', completedChallenges:[],
};
 
export const loadStats = () => {
  try { return { ...DEF_STATS, ...JSON.parse(localStorage.getItem(STATS_KEY)||'{}') }; }
  catch { return { ...DEF_STATS }; }
};
export const saveStats = s => { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (error) { console.error(error); } };
 
export function formatTime(s) {
  if (!s || s<60) return '0 min';
  const m=Math.floor(s/60);
  if (m<60) return `${m} min`;
  const h=Math.floor(m/60), r=m%60;
  return r>0 ? `${h}h ${r}min` : `${h}h`;
}
export function todayStr() { return new Date().toISOString().slice(0,10); }
export function resetDailyIfNeeded(stats) {
  const today=todayStr();
  if (stats.todayDate !== today)
    return { ...stats, todayDate:today, todayExercises:0, todayLibViews:0, todaySections:0 };
  return stats;
}
 
// ── Callbacks (enregistrés par App.jsx) ───────────────────────────────────────
let _updater     = null;
let _timeUpdater = null;
export let _sessionStart = Date.now();
 
export function setStatsUpdater(fn)   { _updater     = fn; }
export function setTimeUpdater(fn)    { _timeUpdater = fn; }
 
export function updateStats(fn) {
  if (_updater) _updater(fn);
}
 
export function commitTime() {
  const secs = Math.floor((Date.now()-_sessionStart)/1000);
  _sessionStart = Date.now();
  if (_timeUpdater && secs>5) _timeUpdater(secs);
}
 
// Appelé depuis les composants d'exercice
export function notifyExerciseDone(count, type, perfect) {
  updateStats((s, today) => {
    let n = { ...s,
      totalExercises: (s.totalExercises||0)+count,
      sessionsCount:  (s.sessionsCount||0)+1,
      todayExercises: (s.todayExercises||0)+count,
    };
    if (perfect)            n = { ...n, lastPerfect:today };
    if (type==='interval')  n = { ...n, lastIntervalDay:today };
    if (type==='chord_ear') n = { ...n, lastChordEarDay:today };
    return n;
  });
}
export function notifyLibraryView()   { updateStats(s => ({ ...s, todayLibViews:(s.todayLibViews||0)+1 })); }
export function notifySectionVisit()  { updateStats(s => ({ ...s, todaySections:(s.todaySections||0)+1 })); }
 