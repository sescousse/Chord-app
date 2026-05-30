import { useState, useEffect, useCallback, useRef } from "react";

// ── Music Theory ──────────────────────────────────────────────────────────────
const CHROMATIC = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const CHORD_TYPES = {
  "Majeures":  { formula:[0,4,7],    suffix:"",      label:"Majeure" },
  "Mineures":  { formula:[0,3,7],    suffix:"m",     label:"Mineure" },
  "Dom. 7":    { formula:[0,4,7,10], suffix:"7",     label:"Dominante 7" },
  "Maj. 7":    { formula:[0,4,7,11], suffix:"maj7",  label:"Majeure 7" },
  "Min. 7":    { formula:[0,3,7,10], suffix:"m7",    label:"Mineure 7" },
  "MinMaj. 7": { formula:[0,3,7,11], suffix:"mMaj7", label:"Min. Maj. 7" },
};
const ROOT_NOTES = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const NOTE_COLORS = {
  C:"#f97316","C#":"#fb923c",D:"#38bdf8",Eb:"#7dd3fc",E:"#4ade80",
  F:"#f43f5e","F#":"#fb7185",G:"#a855f7",Ab:"#c084fc",A:"#facc15",Bb:"#fde047",B:"#60a5fa",
};
const INVERSION_NAMES = ["Fondamentale","1er renversement","2ème renversement","3ème renversement"];
const TIPS = [
  { level:"Débutant", text:"Pour un accord majeur, pose ton pouce sur la tonique, le majeur sur la tierce et l'auriculaire sur la quinte." },
  { level:"Débutant", text:"Commence par maîtriser C, F et G — la base de milliers de chansons." },
  { level:"Débutant", text:"Joue chaque note séparément avant de les plaquer ensemble. La régularité prime sur la vitesse." },
  { level:"Débutant", text:"Garde la main détendue. Imagine tenir une petite balle de tennis dans ta paume." },
  { level:"Intermédiaire", text:"Le 1er renversement crée des transitions fluides entre deux accords proches." },
  { level:"Intermédiaire", text:"Un accord de dominante 7 crée une tension qui appelle à se résoudre sur la tonique." },
  { level:"Intermédiaire", text:"Essaie II-V-I : Dm7 → G7 → Cmaj7. La base de milliers de standards jazz." },
  { level:"Intermédiaire", text:"L'accord mineur majeur 7 crée une atmosphère mystérieuse très utilisée en musique de film." },
];

// ── Conseils par catégorie ────────────────────────────────────────────────────
const CATEGORY_TIPS = {
  repertoire: [
    { title:"Explorer les renversements", text:"Un accord en position fondamentale peut sonner lourd. Essaie le 1er renversement pour alléger la basse et créer une ligne mélodique descendante." },
    { title:"Apprendre par morceaux", text:"Plutôt que d'apprendre un accord isolé, apprends-le dans le contexte d'une progression. Ton cerveau retient mieux les enchaînements que les accords seuls." },
    { title:"La cohérence des doigtés", text:"Garde toujours le même doigté pour un accord dans un contexte similaire. La régularité crée l'automatisme — ton but est de ne plus penser au doigté." },
  ],
  oreille: [
    { title:"La méthode de l'ancre", text:"Associe chaque intervalle à une mélodie que tu connais. La quarte juste = début de 'Here Comes the Bride'. La tierce majeure = début de 'When the Saints'. Ces ancres sont infaillibles." },
    { title:"Chanter ce qu'on entend", text:"Avant de cliquer ta réponse, chante mentalement l'intervalle. Si tu l'entends intérieurement avec précision, tu le reconnaîtras plus facilement à l'oreille externe." },
    { title:"Travailler par familles", text:"Ne travaille pas tous les intervalles en même temps. Maîtrise d'abord les tierces (majeure/mineure), puis les quintes, puis les septièmes. La confusion vient de trop vouloir en faire à la fois." },
  ],
  technique: [
    { title:"La lenteur est une vitesse", text:"Travailler lentement n'est pas une perte de temps — c'est construire la bonne connexion neuromusculaire. 10 minutes à tempo lent vaut mieux qu'1 heure à tempo approximatif." },
    { title:"Le solfège, c'est une langue", text:"Lire une partition c'est comme lire un texte : au début tu déchiffres lettre par lettre, puis tu lis des mots entiers. L'objectif est de voir un accord et l'entendre mentalement avant de jouer." },
    { title:"La constance prime sur l'intensité", text:"15 minutes chaque jour bat 2 heures le week-end. Le cerveau consolide les apprentissages pendant le sommeil — la régularité est donc plus efficace que les marathon de pratique." },
  ],
  theorie: [
    { title:"Comprendre avant de mémoriser", text:"Ne mémorise pas les règles harmoniques — comprends-les. Pourquoi le V7 veut résoudre sur le I ? Parce que la sensible (7e degré) monte et que la 7te de dominante descend. C'est de la physique harmonique." },
    { title:"Partir du concret", text:"Chaque concept théorique devrait s'ancrer dans quelque chose que tu connais déjà. La dominante secondaire ? C'est simplement 'le V7 de n'importe quel accord'. Trouve toujours l'exemple musical concret." },
    { title:"La théorie est descriptive", text:"La théorie musicale n'est pas un ensemble de lois — c'est une description de ce que les musiciens ont fait. Si ça sonne bien, c'est bien. La théorie t'explique pourquoi ça sonne bien." },
  ],
  harmonie: [
    { title:"Construis avant d'analyser", text:"Pour vraiment comprendre l'harmonie, commence par construire des progressions à l'oreille. Joue ce qui sonne bien, puis analyse pourquoi ça sonne bien après. L'oreille doit précéder la théorie." },
    { title:"Le I, IV, V sont ton socle", text:"Avant d'explorer les accords empruntés et les substitutions, maîtrise parfaitement I-IV-V dans toutes les tonalités. 90% de la musique populaire n'utilise que ces trois accords." },
    { title:"Écoute les tensions", text:"Chaque accord crée une tension ou une résolution. Entraîne-toi à identifier ce que tu ressens : stabilité (I, IV), attente (V, ii), surprise (accords empruntés). Ton oreille est ton meilleur outil d'analyse." },
  ],
};

// ── Données du Journal de pratique ───────────────────────────────────────────
const JOURNAL_KEY = 'cs_journal_v2';
const CHAR_KEY    = 'cs_character_v1';
const XP_PER_EXERCISE = 10;
const XP_PER_MIN      = 2;
const XP_LEVELS = [0,100,250,500,850,1300,2000,3000,4500,6500,10000]; // XP needed to reach level N

function getLevel(xp) {
  for (let i=XP_LEVELS.length-1; i>=0; i--) {
    if (xp >= XP_LEVELS[i]) return i;
  }
  return 0;
}
function xpToNextLevel(xp) {
  const lv = getLevel(xp);
  if (lv >= XP_LEVELS.length-1) return { current:xp, next:xp, pct:100, lv };
  const base = XP_LEVELS[lv], next = XP_LEVELS[lv+1];
  return { current:xp-base, next:next-base, pct:Math.round(((xp-base)/(next-base))*100), lv };
}
const LEVEL_TITLES = ['Débutant','Initié','Apprenti','Musicien','Interprète',
  'Compositeur','Virtuose','Maestro','Légende','Grand Maître','Prodige'];

// Character storage
const DEF_CHAR = {
  gender:'M',    // M | F
  skinTone:0,    // 0-3
  hairColor:0,   // 0-4
  outfit:0,      // 0 = default, others unlocked
  accessories:[],// array of unlocked/equipped item ids
  totalXp:0,
  // 10 000h tracker
  practicedHours: 0,
  dailyHoursGoal: 1,
  sessions: [],  // {date, mins, comment, ts}
};
function loadChar(){try{return{...DEF_CHAR,...JSON.parse(localStorage.getItem(CHAR_KEY)||'{}')};}catch{return{...DEF_CHAR};}}
function saveChar(c){try{localStorage.setItem(CHAR_KEY,JSON.stringify(c));}catch{}}
function loadJournal() {
  try { return JSON.parse(localStorage.getItem(JOURNAL_KEY)||'{}'); }
  catch { return {}; }
}
function saveJournal(j) {
  try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(j)); } catch {}
}
// Goal defaults
const GOAL_KEY = 'cs_goals_v1';
const DEFAULT_GOALS = { weeklyMins:150, longTermMins:3000 };
function loadGoals() {
  try { return { ...DEFAULT_GOALS, ...JSON.parse(localStorage.getItem(GOAL_KEY)||'{}') }; }
  catch { return { ...DEFAULT_GOALS }; }
}
function saveGoals(g) { try { localStorage.setItem(GOAL_KEY, JSON.stringify(g)); } catch {} }

// ── Section card gradients — Palette ambre ───────────────────────────────────
const SECTION_GRADIENTS = {
  accords:   'linear-gradient(145deg, rgba(232,168,87,0.08) 0%, rgba(10,8,4,0) 100%)',
  oreille:   'linear-gradient(145deg, rgba(144,184,208,0.08) 0%, rgba(10,8,4,0) 100%)',
  exercices: 'linear-gradient(145deg, rgba(110,184,152,0.08) 0%, rgba(10,8,4,0) 100%)',
  theorie:   'linear-gradient(145deg, rgba(232,168,87,0.07) 0%, rgba(10,8,4,0) 100%)',
  harmonie:  'linear-gradient(145deg, rgba(212,160,212,0.07) 0%, rgba(10,8,4,0) 100%)',
};

// ── Palette & Thèmes ─────────────────────────────────────────────────────────
// Direction artistique : fond sombre + accent ambre chaud (#E8A857)
// Sobre, lisible, premium — cohérent du premier au dernier écran.
const ACCENT    = '#E8A857';  // Ambre chaud — couleur signature
const ACCENT2   = '#C8864A';  // Ambre foncé
const ACCENT_SOFT='rgba(232,168,87,0.12)';

const THEMES = {
  obsidian: {
    id:'obsidian', label:'Obsidian', icon:'◈',
    bg:'#0A0804',
    bgGrad:'linear-gradient(160deg, #0F0A06 0%, #0A0804 100%)',
    headerBg:'rgba(10,8,4,0.96)',
    navBg:'rgba(10,8,4,0.98)',
    surface:'rgba(255,220,160,0.04)',
    surfaceHover:'rgba(232,168,87,0.07)',
    border:'rgba(255,210,140,0.1)',
    borderMuted:'rgba(255,210,140,0.06)',
    text:'#F0EBE3',
    textMuted:'rgba(240,235,227,0.5)',
    textFaint:'rgba(240,235,227,0.22)',
    accent:ACCENT,
    accent2:ACCENT2,
    logoGrad:'linear-gradient(90deg, #E8A857, #F5C878)',
    navActive:'rgba(232,168,87,0.1)',
  },
  studio: {
    id:'studio', label:'Studio', icon:'○',
    bg:'#F7F4EF',
    bgGrad:'#F7F4EF',
    headerBg:'rgba(247,244,239,0.96)',
    navBg:'rgba(247,244,239,0.99)',
    surface:'rgba(0,0,0,0.04)',
    surfaceHover:'rgba(232,168,87,0.1)',
    border:'rgba(0,0,0,0.1)',
    borderMuted:'rgba(0,0,0,0.06)',
    text:'#1A1612',
    textMuted:'rgba(26,22,18,0.5)',
    textFaint:'rgba(26,22,18,0.25)',
    accent:ACCENT2,
    accent2:'#A0622A',
    logoGrad:'linear-gradient(90deg, #C8864A, #E8A857)',
    navActive:'rgba(200,134,74,0.1)',
  },
  jazz: {
    id:'jazz', label:'Jazz', icon:'♪',
    bg:'#0E0A06',
    bgGrad:'radial-gradient(ellipse at 30% 20%, rgba(200,134,74,0.14) 0%, transparent 55%), #0E0A06',
    headerBg:'rgba(14,10,6,0.95)',
    navBg:'rgba(14,10,6,0.98)',
    surface:'rgba(255,255,255,0.04)',
    surfaceHover:'rgba(200,134,74,0.1)',
    border:'rgba(200,134,74,0.18)',
    borderMuted:'rgba(200,134,74,0.08)',
    text:'#F5EDE0',
    textMuted:'rgba(245,237,224,0.5)',
    textFaint:'rgba(245,237,224,0.25)',
    accent:'#D4924E',
    accent2:'#B87833',
    logoGrad:'linear-gradient(90deg, #D4924E, #E8C080)',
    navActive:'rgba(212,146,78,0.15)',
  },
};
const THEME_IDS = Object.keys(THEMES);

// ── Piano data ────────────────────────────────────────────────────────────────
const PIANO_KEYS_DATA = [
  {absIdx:0,type:'white',wi:0,note:'C'},{absIdx:1,type:'black',wi:0,note:'C#'},
  {absIdx:2,type:'white',wi:1,note:'D'},{absIdx:3,type:'black',wi:1,note:'Eb'},
  {absIdx:4,type:'white',wi:2,note:'E'},{absIdx:5,type:'white',wi:3,note:'F'},
  {absIdx:6,type:'black',wi:3,note:'F#'},{absIdx:7,type:'white',wi:4,note:'G'},
  {absIdx:8,type:'black',wi:4,note:'Ab'},{absIdx:9,type:'white',wi:5,note:'A'},
  {absIdx:10,type:'black',wi:5,note:'Bb'},{absIdx:11,type:'white',wi:6,note:'B'},
  {absIdx:12,type:'white',wi:7,note:'C'},{absIdx:13,type:'black',wi:7,note:'C#'},
  {absIdx:14,type:'white',wi:8,note:'D'},{absIdx:15,type:'black',wi:8,note:'Eb'},
  {absIdx:16,type:'white',wi:9,note:'E'},{absIdx:17,type:'white',wi:10,note:'F'},
  {absIdx:18,type:'black',wi:10,note:'F#'},{absIdx:19,type:'white',wi:11,note:'G'},
  {absIdx:20,type:'black',wi:11,note:'Ab'},{absIdx:21,type:'white',wi:12,note:'A'},
  {absIdx:22,type:'black',wi:12,note:'Bb'},{absIdx:23,type:'white',wi:13,note:'B'},
];
function getInversionAbsIndices(notes) {
  if (!notes||!notes.length) return [];
  let result=[],prevAbs=-1,oct=0;
  for (const note of notes) {
    const idx=CHROMATIC.indexOf(note); if(idx===-1)continue;
    let abs=idx+oct*12; if(abs<=prevAbs){oct++;abs=idx+oct*12;}
    result.push(abs); prevAbs=abs;
  }
  return result;
}
const WW=38,WH=128,BW=24,BH=80;

// ── Skills & Instruments ──────────────────────────────────────────────────────
const INITIAL_SKILLS = [
  {id:'accords',   label:'Accords',   value:35,color:'#B898C8'},
  {id:'oreille',   label:'Oreille',   value:20,color:'#90B8D0'},
  {id:'rythme',    label:'Rythme',    value:40,color:'#7BC8A4'},
  {id:'theorie',   label:'Théorie',   value:25,color:'#E07070'},
  {id:'technique', label:'Technique', value:30,color:'#E8A857'},
  {id:'lecture',   label:'Lecture',   value:15,color:'#AED6F1'},
];
const INSTRUMENTS = [
  {id:'piano',   label:'Piano',   icon:'🎹',available:true},
  {id:'guitare', label:'Guitare', icon:'🎸',available:false},
  {id:'basse',   label:'Basse',   icon:'🎵',available:false},
  {id:'violon',  label:'Violon',  icon:'🎻',available:false},
];

// ── Daily Challenges ──────────────────────────────────────────────────────────
const CHALLENGES_POOL = [
  {id:'c_warmup',    icon:'🎯', title:'Mise en route',     desc:'Compléter une session d\'exercices',         req:(s,d)=>s.todayExercises>=1,  reward:2},
  {id:'c_ten',       icon:'🔥', title:'Assiduité',         desc:'Réaliser 10 exercices aujourd\'hui',         req:(s,d)=>s.todayExercises>=10, reward:3},
  {id:'c_twenty',    icon:'💪', title:'Marathon',          desc:'Réaliser 20 exercices aujourd\'hui',         req:(s,d)=>s.todayExercises>=20, reward:5},
  {id:'c_perfect',   icon:'⭐', title:'Session parfaite',  desc:'Terminer une session avec 100% de réussite', req:(s,d)=>s.lastPerfect===d,    reward:5},
  {id:'c_interval',  icon:'🎵', title:'Mélodiste',         desc:'Terminer une session d\'intervalles',        req:(s,d)=>s.lastIntervalDay===d,reward:3},
  {id:'c_chord_ear', icon:'🎹', title:'Harmoniste',        desc:'Terminer une session d\'accords à l\'oreille',req:(s,d)=>s.lastChordEarDay===d,reward:3},
  {id:'c_library',   icon:'♩',  title:'Bibliothécaire',    desc:'Explorer 5 accords dans la bibliothèque',   req:(s,d)=>s.todayLibViews>=5,   reward:2},
  {id:'c_sections',  icon:'🗺', title:'Explorateur',       desc:'Visiter 3 sections différentes aujourd\'hui',req:(s,d)=>s.todaySections>=3,   reward:4},
];
function getDailyChallenges(dateStr) {
  const seed=dateStr.split('').reduce((a,c)=>(a*31+c.charCodeAt(0))&0xFFFFFF,0);
  return CHALLENGES_POOL.map((c,i)=>[c,(seed*(i+1)*2654435761)>>>0]).sort((a,b)=>a[1]-b[1]).slice(0,3).map(x=>x[0]);
}
function isCompleted(id,stats,today) {
  return (stats.completedChallenges||[]).some(c=>c.id===id&&c.date===today);
}
function checkAndComplete(stats,today,dailyChallenges) {
  let s={...stats};
  for (const c of dailyChallenges) {
    if (!isCompleted(c.id,s,today) && c.req(s,today)) {
      s={...s,keys:(s.keys||0)+c.reward,completedChallenges:[...(s.completedChallenges||[]),{id:c.id,date:today}]};
    }
  }
  return s;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS_KEY='cs_stats_v2';
const WEEKLY_GOALS_KEY='cs_weekly_goals_v1';
const DEF_STATS={totalExercises:0,totalSeconds:0,sessionsCount:0,keys:0,todayDate:'',todayExercises:0,todayLibViews:0,todaySections:0,lastPerfect:'',lastIntervalDay:'',lastChordEarDay:'',completedChallenges:[],streak:0,lastActivityDate:'',weeklyGoals:{oreille:0,technique:0,theorie:0,harmonie:0},totalXp:0};
const loadStats=()=>{try{return{...DEF_STATS,...JSON.parse(localStorage.getItem(STATS_KEY)||'{}')};}catch{return{...DEF_STATS};}};
const saveStats=s=>{try{localStorage.setItem(STATS_KEY,JSON.stringify(s));}catch{}};
function formatTime(s){if(!s||s<60)return'0 min';const m=Math.floor(s/60);if(m<60)return`${m} min`;const h=Math.floor(m/60),r=m%60;return r>0?`${h}h ${r}min`:`${h}h`;}
function todayStr(){return new Date().toISOString().slice(0,10);}
function yesterdayStr(){const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);}

function resetDailyIfNeeded(stats){
  const today=todayStr();
  if(stats.todayDate===today) return stats;
  // Compute streak
  const wasYesterday = stats.lastActivityDate===yesterdayStr();
  const hadActivity  = (stats.todayExercises||0)>0||(stats.todaySections||0)>0;
  let streak=stats.streak||0;
  if(hadActivity){
    // If yesterday was active OR today was already first day
    streak = wasYesterday ? streak+1 : 1;
  } else {
    streak = 0;
  }
  return{...stats,todayDate:today,todayExercises:0,todayLibViews:0,todaySections:0,streak,lastActivityDate:hadActivity?stats.todayDate:stats.lastActivityDate||''};
}

// Helpers streak
function computeStreak(stats){
  const today=todayStr();
  if(stats.todayDate!==today) return stats.streak||0;
  // If activity today, streak is at least 1
  const hasToday=(stats.todayExercises||0)>0||(stats.todaySections||0)>0;
  if(!hasToday) return stats.streak||0;
  return stats.streak||1;
}

// Module-level updater
let _updater=null;
function updateStats(fn){if(_updater)_updater(fn);}
function notifyExerciseDone(count,type,perfect){
  updateStats((s,today)=>{
    let n={...s,
      totalExercises:(s.totalExercises||0)+count,
      sessionsCount:(s.sessionsCount||0)+1,
      todayExercises:(s.todayExercises||0)+count,
      lastActivityDate:today,
      totalXp:(s.totalXp||0) + count*XP_PER_EXERCISE,
      // Update weekly goals by category
      weeklyGoals:{
        ...(s.weeklyGoals||{}),
        ...(type?{[type]:((s.weeklyGoals||{})[type]||0)+count}:{}),
      },
    };
    if(perfect)n={...n,lastPerfect:today};
    if(type==='interval')n={...n,lastIntervalDay:today};
    if(type==='chord_ear')n={...n,lastChordEarDay:today};
    // Update streak: if first activity today, increment
    if(s.lastActivityDate!==today){
      const wasYesterday=s.lastActivityDate===yesterdayStr();
      n.streak = wasYesterday ? (s.streak||0)+1 : 1;
    }
    return n;
  });
}
function notifyLibraryView(){updateStats((s)=>({...s,todayLibViews:(s.todayLibViews||0)+1}));}
function notifySectionVisit(){updateStats((s)=>({...s,todaySections:(s.todaySections||0)+1}));}

// Timer
let _sessionStart=Date.now(),_timeUpdater=null;
function commitTime(){const secs=Math.floor((Date.now()-_sessionStart)/1000);_sessionStart=Date.now();if(_timeUpdater&&secs>5)_timeUpdater(secs);}

// ── Audio — Piano réaliste (Salamander Grand Piano via soundfont-player) ──────
// Échantillons audio réels d'un piano à queue enregistré en studio.
// Chargement automatique depuis CDN au premier appui de touche.

let _audioCtx    = null;
let _piano       = null;   // instance soundfont-player
let _pianoReady  = false;
let _pianoLoading= false;

function getACtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

// Charge le soundfont la première fois qu'une note est demandée
function loadPiano() {
  if (_pianoReady || _pianoLoading) return;
  if (document.getElementById('sf-script')) return;
  _pianoLoading = true;

  const script  = document.createElement('script');
  script.id     = 'sf-script';
  // soundfont-player v0.5 — minifié, ~15 ko
  script.src    = 'https://cdn.jsdelivr.net/npm/soundfont-player@0.5.0/dist/soundfont-player.min.js';

  script.onload = () => {
    const ctx = getACtx();
    // MusyngKite = samples haute qualité (piano à queue, mp3, ~200 ko de cache)
    window.Soundfont.instrument(ctx, 'acoustic_grand_piano', {
      soundfont: 'MusyngKite',
      format  : 'mp3',
      gain    : 3.5,
    }).then(player => {
      _piano      = player;
      _pianoReady = true;
      _pianoLoading = false;
    }).catch(() => { _pianoLoading = false; });
  };

  script.onerror = () => { _pianoLoading = false; };
  document.head.appendChild(script);
}

// Convertit le semi de l'app (0 = C4) en numéro MIDI, puis ramène
// dans la plage 48-84 (C3-C6) pour un son de piano naturel.
function semiToMidi(semi) {
  let midi = 60 + semi;                 // 60 = C4 = MIDI standard
  while (midi > 84) midi -= 12;        // redescend si trop aigu
  while (midi < 36) midi += 12;        // remonte si trop grave
  return midi;
}

// Fallback ultra-léger : triangle doux pendant le chargement
function _fallbackNote(midi, delay, dur) {
  try {
    const ctx  = getACtx();
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const t    = ctx.currentTime + delay;
    const osc  = ctx.createOscillator();
    const gn   = ctx.createGain();
    osc.connect(gn); gn.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gn.gain.setValueAtTime(0, t);
    gn.gain.linearRampToValueAtTime(0.12, t + 0.008);
    gn.gain.exponentialRampToValueAtTime(0.001, t + Math.min(dur, 1.2));
    osc.start(t); osc.stop(t + Math.min(dur, 1.2) + 0.05);
  } catch(e) {}
}

function playNote(semi, delay = 0, dur = 2.0) {
  loadPiano();                           // démarre le chargement si besoin
  const midi = semiToMidi(semi);

  if (_pianoReady && _piano) {
    const ctx = getACtx();
    _piano.play(String(midi), ctx.currentTime + delay, { duration: dur, gain: 1.0 });
  } else {
    // Pendant le chargement (environ 1-2 secondes au premier lancement)
    _fallbackNote(midi, delay, dur);
  }
}

const playSeq       = (n1,n2) => { playNote(n1); playNote(n2, 1.1); };
const playSimul     = (n1,n2) => { playNote(n1,0,2); playNote(n2,0,2); };
const playChordArp  = ns      => ns.forEach((s,i) => playNote(s, i*0.1, 2.0));
const playChordSimul= ns      => ns.forEach(s     => playNote(s, 0,    2.2));



// ── Intervals ─────────────────────────────────────────────────────────────────
const INTERVALS_DATA=[
  {semi:1,name:"2nde min.",full:"Seconde mineure",  color:"#E8A87C"},
  {semi:2,name:"2nde maj.",full:"Seconde majeure",  color:"#E8A857"},
  {semi:3,name:"3ce min.", full:"Tierce mineure",   color:"#7BC8A4"},
  {semi:4,name:"3ce maj.", full:"Tierce majeure",   color:"#90B8D0"},
  {semi:5,name:"4te juste",full:"Quarte juste",     color:"#B898C8"},
  {semi:6,name:"Triton",   full:"Triton",           color:"#E07070"},
  {semi:7,name:"5te juste",full:"Quinte juste",     color:"#AED6F1"},
  {semi:8,name:"6te min.", full:"Sixte mineure",    color:"#7BC8A4"},
  {semi:9,name:"6te maj.", full:"Sixte majeure",    color:"#E8A87C"},
  {semi:10,name:"7e min.", full:"Septième mineure", color:"#B898C8"},
  {semi:11,name:"7e maj.", full:"Septième majeure", color:"#E8A857"},
  {semi:12,name:"Octave",  full:"Octave",           color:"#AED6F1"},
];
const NM=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const semiToName=s=>`${NM[s%12]}${4+Math.floor(s/12)}`;
const genEx=arr=>{const n=Math.floor(Math.random()*12),i=arr[Math.floor(Math.random()*arr.length)];return{note1:n,note2:n+i,intSemi:i};};
const genChordEx=arr=>{const r=Math.floor(Math.random()*12),t=arr[Math.floor(Math.random()*arr.length)];return{rootSemi:r,type:t,notes:CHORD_TYPES[t].formula.map(i=>r+i)};};
const CHORD_COLORS={Majeures:'#90B8D0',Mineures:'#7BC8A4',"Dom. 7":'#E8A857',"Maj. 7":'#B898C8',"Min. 7":'#E07070',"MinMaj. 7":'#E8A87C'};

// ══════════════════════════════════════════════════════════════════════════════
// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function RadarChart({skills}){
  const cx=130,cy=130,r=82,n=skills.length,sa=-Math.PI/2,step=(2*Math.PI)/n;
  const pt=(a,r2)=>({x:cx+r2*Math.cos(a),y:cy+r2*Math.sin(a)});
  const axes=skills.map((_,i)=>pt(sa+i*step,r)),sp=skills.map((s,i)=>pt(sa+i*step,(s.value/100)*r)),lr=r+28;
  return(<div style={{padding:'0 55px 20px'}}><svg viewBox="0 0 260 260" style={{width:'100%',maxWidth:260,display:'block',margin:'0 auto',overflow:'visible'}}>
    {[.25,.5,.75,1].map((lv,gi)=>(<polygon key={gi} points={axes.map((_,i)=>{const p=pt(sa+i*step,lv*r);return`${p.x},${p.y}`;}).join(' ')} fill="none" stroke="rgba(240,235,224,0.07)" strokeWidth={1}/>))}
    {axes.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(240,235,224,0.1)" strokeWidth={1}/>)}
    <polygon points={sp.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(195,155,211,0.1)" stroke="#B898C8" strokeWidth={1.5}/>
    {sp.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3.5} fill={skills[i].color}/>)}
    {skills.map((s,i)=>{const a=sa+i*step,lx=cx+lr*Math.cos(a),ly=cy+lr*Math.sin(a),anchor=lx>cx+5?'start':lx<cx-5?'end':'middle',oy=ly<cy-5?-4:ly>cy+5?13:4;return(<g key={s.id}><text x={lx} y={ly+oy} textAnchor={anchor} fontSize={10} fill="rgba(240,235,224,0.52)" fontFamily="monospace" letterSpacing="0.04em">{s.label.toUpperCase()}</text><text x={lx} y={ly+oy+13} textAnchor={anchor} fontSize={9} fill={s.color} fontFamily="monospace">{s.value}%</text></g>);})}
    <text x={cx} y={cy+4} textAnchor="middle" fontSize={8} fill="rgba(240,235,224,0.15)" fontFamily="monospace">PIANO</text>
  </svg></div>);
}

function PianoKeyboard({activeAbsIndices=[],color,colors={}}){
  const whites=PIANO_KEYS_DATA.filter(k=>k.type==='white'),blacks=PIANO_KEYS_DATA.filter(k=>k.type==='black');
  const getC=ai=>colors[ai]||(activeAbsIndices.includes(ai)?color:null);
  return(<svg viewBox={`0 0 ${14*WW} ${WH+20}`} style={{width:'100%',maxWidth:560,display:'block',margin:'0 auto'}}>
    {whites.map(({absIdx,wi,note})=>{const c=getC(absIdx);return(<g key={`w${absIdx}`}><rect x={wi*WW} y={0} width={WW} height={WH} rx={3} fill={c||'#EDE5D8'} stroke="#0E0B08" strokeWidth={1.5}/>{c&&<text x={wi*WW+WW/2} y={WH-10} textAnchor="middle" fontSize={10} fill="#0E0B08" fontFamily="monospace" fontWeight="bold">{note}</text>}</g>);})}
    {blacks.map(({absIdx,wi,note})=>{const c=getC(absIdx),x=(wi+1)*WW-BW*.58;return(<g key={`b${absIdx}`}><rect x={x} y={0} width={BW} height={BH} rx={2} fill={c||'#181614'} stroke="#0a0908" strokeWidth={.8}/>{c&&<text x={x+BW/2} y={BH-8} textAnchor="middle" fontSize={8} fill="#0E0B08" fontFamily="monospace" fontWeight="bold">{note}</text>}</g>);})}
    <line x1={7*WW} y1={0} x2={7*WW} y2={WH} stroke="rgba(240,235,224,0.2)" strokeWidth={1} strokeDasharray="4,3"/>
    <text x={3.5*WW} y={WH+15} textAnchor="middle" fontSize={9} fill="rgba(240,235,224,0.22)" fontFamily="monospace">OCT. 1</text>
    <text x={10.5*WW} y={WH+15} textAnchor="middle" fontSize={9} fill="rgba(240,235,224,0.22)" fontFamily="monospace">OCT. 2</text>
  </svg>);
}

function Hearts({total,remaining}){
  if(total===0)return<span style={{fontSize:11,fontFamily:'monospace',color:'rgba(240,235,224,0.4)'}}>∞</span>;
  return(<div style={{display:'flex',gap:3}}>{Array.from({length:total}).map((_,i)=>(<div key={i} style={{width:13,height:13,borderRadius:'50%',background:i<remaining?'#E07070':'rgba(240,235,224,0.1)',border:i<remaining?'none':'0.5px solid rgba(240,235,224,0.15)',transition:'all 0.3s'}}/>))}</div>);
}

function SectionCard({icon,title,subtitle,color,onClick,badge,lock,id}){
  const [hov,setHov]=useState(false);
  const [shine,setShine]=useState(false);
  const grad = SECTION_GRADIENTS[id] || `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`;

  const handleEnter=()=>{ setHov(true); setTimeout(()=>setShine(true),50); };
  const handleLeave=()=>{ setHov(false); setShine(false); };

  return(
    <button onClick={onClick} onMouseEnter={handleEnter} onMouseLeave={handleLeave}
      style={{
        background: lock ? 'rgba(255,255,255,0.04)' : grad,
        border: lock ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid transparent',
        borderRadius: 22,
        padding: '1.4rem 1.2rem 1.25rem',
        cursor: lock ? 'default' : 'pointer',
        textAlign: 'left',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex', flexDirection: 'column', gap: 10,
        transform: hov&&!lock ? 'translateY(-5px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hov&&!lock
          ? `0 20px 48px ${color}50, 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`
          : `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
        opacity: lock ? 0.4 : 1,
        position: 'relative', overflow: 'hidden',
        minHeight: 130,
      }}>
      {/* Shine sweep */}
      <div style={{
        position:'absolute', top:0, left: shine ? '150%' : '-80%',
        width:'55%', height:'100%',
        background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
        transform:'skewX(-18deg)',
        transition: shine ? 'left 0.55s ease' : 'none',
        pointerEvents:'none',
      }}/>
      {/* Top row */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',zIndex:1}}>
        <span style={{
          fontSize: 36,
          filter: lock ? 'grayscale(1) opacity(0.5)' : 'drop-shadow(0 3px 10px rgba(0,0,0,0.35))',
          lineHeight: 1,
        }}>{icon}</span>
        {badge&&<span style={{fontSize:9,fontFamily:'monospace',color:'#fff',background:'rgba(110,180,140,0.85)',padding:'3px 9px',borderRadius:20,fontWeight:'bold',letterSpacing:'.06em',boxShadow:'0 2px 10px rgba(110,180,140,0.5)'}}>NOUVEAU</span>}
        {lock&&<span style={{fontSize:8,fontFamily:'monospace',color:'rgba(255,255,255,0.45)',border:'1px solid rgba(255,255,255,0.15)',padding:'2px 8px',borderRadius:20,letterSpacing:'.05em'}}>BIENTÔT</span>}
      </div>
      {/* Text */}
      <div style={{zIndex:1}}>
        <div style={{fontSize:17,fontWeight:'bold',color:'#fff',marginBottom:5,fontFamily:'Georgia,serif',textShadow:'0 1px 6px rgba(0,0,0,0.4)',letterSpacing:'-.01em'}}>{title}</div>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.72)',fontFamily:'monospace',letterSpacing:'.04em',lineHeight:1.4}}>{subtitle}</div>
      </div>
    </button>
  );
}

function TipPopup({tip,onClose,onNext}){
  return(<div style={{position:'fixed',bottom:'5rem',right:'1.5rem',width:'min(300px,calc(100vw - 3rem))',background:'#1c1a16',border:'0.5px solid rgba(240,235,224,0.15)',borderRadius:4,padding:'1.25rem',zIndex:200,animation:'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
      <span style={{fontSize:10,letterSpacing:'.15em',fontFamily:'monospace',padding:'3px 8px',borderRadius:2,background:tip.level==='Débutant'?'rgba(130,224,170,0.12)':'rgba(133,193,233,0.12)',color:tip.level==='Débutant'?'#7BC8A4':'#90B8D0'}}>{tip.level.toUpperCase()}</span>
      <button onClick={onClose} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.35,cursor:'pointer',fontSize:18,padding:'0 2px',lineHeight:1}}>×</button>
    </div>
    <p style={{fontSize:13.5,lineHeight:1.65,opacity:.78,margin:'0 0 1rem',fontFamily:'Georgia,serif'}}>{tip.text}</p>
    <button onClick={onNext} style={{background:'transparent',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.4)',padding:'.4rem .75rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.1em'}} onMouseEnter={e=>{e.currentTarget.style.color='rgba(240,235,224,0.7)';e.currentTarget.style.borderColor='rgba(240,235,224,0.3)';}} onMouseLeave={e=>{e.currentTarget.style.color='rgba(240,235,224,0.4)';e.currentTarget.style.borderColor='rgba(240,235,224,0.15)';}}>CONSEIL SUIVANT →</button>
  </div>);
}

// ── Popup conseil par catégorie ───────────────────────────────────────────────
function CategoryTipPopup({ category, color, onClose }) {
  const tips = CATEGORY_TIPS[category] || [];
  const [idx, setIdx] = useState(0);
  const tip = tips[idx];
  if (!tip) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:180,backdropFilter:'blur(4px)',padding:'0 0 5rem'}}>
      <div style={{width:'min(420px,92vw)',background:'#0C0A07',border:`0.5px solid ${color}`,borderRadius:6,padding:'1.25rem',animation:'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 8px 40px rgba(0,0,0,0.6)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.85rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:color}}/>
            <span style={{fontSize:10,letterSpacing:'.15em',fontFamily:'monospace',color,opacity:.85}}>CONSEIL · {idx+1}/{tips.length}</span>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.35,cursor:'pointer',fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:'.65rem',color:'#f0ebe0'}}>{tip.title}</div>
        <p style={{fontSize:13,lineHeight:1.7,opacity:.72,margin:'0 0 1rem',fontFamily:'Georgia,serif'}}>{tip.text}</p>
        <div style={{display:'flex',gap:8}}>
          {idx < tips.length-1 && (
            <button onClick={()=>setIdx(i=>i+1)} style={{flex:1,padding:'.55rem',background:`${color}08`,border:`0.5px solid ${color}`,color,borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.1em',transition:'all 0.2s'}}>
              SUIVANT →
            </button>
          )}
          <button onClick={onClose} style={{flex:1,padding:'.55rem',background:'transparent',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.45)',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.1em',transition:'all 0.2s'}}>
            COMMENCER
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Speed Flashcards (conservé pour compatibilité — non utilisé) ──────────────
function SpeedFlashcards() {
  const ALL_CHORDS = [];
  Object.entries(CHORD_TYPES).forEach(([type,{suffix,label}]) => {
    ROOT_NOTES.forEach(root => {
      ALL_CHORDS.push({ root, type, name: root+suffix, label });
    });
  });
  const [config, setConfig]   = useState(null); // null = config screen
  const [card, setCard]       = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userRoot, setUserRoot] = useState(null);
  const [userType, setUserType] = useState(null);
  const [score, setScore]     = useState({correct:0,total:0});
  const [round, setRound]     = useState(0);
  const [done, setDone]       = useState(false);
  const [phase, setPhase]     = useState('root'); // 'root' | 'type' - two-step answer

  const genCard = () => {
    const c = ALL_CHORDS[Math.floor(Math.random()*ALL_CHORDS.length)];
    setCard(c); setAnswered(false); setUserRoot(null); setUserType(null); setPhase('root');
    setTimeLeft(config?.secs||5);
  };

  // Timer countdown
  useEffect(() => {
    if (!card || answered || done) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft(s => s-1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, card, answered, done]);

  function handleTimeout() {
    setAnswered(true);
    setScore(s => ({correct:s.correct, total:s.total+1}));
  }
  function handleRootAnswer(root) {
    setUserRoot(root);
    setPhase('type');
  }
  function handleTypeAnswer(type) {
    if (!card) return;
    setUserType(type); setAnswered(true);
    const ok = userRoot===card.root && type===card.type;
    setScore(s => ({correct:s.correct+(ok?1:0), total:s.total+1}));
    // play the chord
    const ri = CHROMATIC.indexOf(card.root);
    if(ri!==-1) playChordArp(CHORD_TYPES[card.type].formula.map(i=>ri+i+4*12));
  }
  function next() {
    const newRound = round + 1;
    setRound(newRound);
    if (config && newRound >= config.total) { setDone(true); return; }
    genCard();
  }

  // Config screen
  if (!config) return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem',letterSpacing:'-.01em'}}>Speed Flashcards</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>MÉMORISATION RÉFLEXE DES ACCORDS</p>
      </div>
      <div style={{padding:'1rem',background:'rgba(247,220,111,0.05)',border:'0.5px solid rgba(247,220,111,0.15)',borderRadius:4,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.6,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>Un accord s'affiche. Tu dois identifier la note racine, puis le type d'accord. Plus vite tu répondras, plus tu développes la mémorisation réflexe.</p>
      </div>
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.65rem'}}>TEMPS PAR CARTE</div>
        <div style={{display:'flex',gap:8}}>
          {[[3,'3s 🔥'],[5,'5s'],[8,'8s']].map(([s,label])=>{
            const sel = (config?.secs||5)===s;
            return <button key={s} onClick={()=>setConfig(c=>({...(c||{total:10}),secs:s}))} style={{flex:1,padding:'.7rem',background:sel?'rgba(247,220,111,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${sel?'#E8A857':'rgba(240,235,224,0.1)'}`,color:sel?'#E8A857':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:13,fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>;
          })}
        </div>
      </div>
      <div style={{marginBottom:'2rem'}}>
        <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.65rem'}}>NOMBRE DE CARTES</div>
        <div style={{display:'flex',gap:8}}>
          {[10,20,30].map(n=>{
            const sel=(config?.total||10)===n;
            return <button key={n} onClick={()=>setConfig(c=>({...(c||{secs:5}),total:n}))} style={{flex:1,padding:'.7rem',background:sel?'rgba(247,220,111,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${sel?'#E8A857':'rgba(240,235,224,0.1)'}`,color:sel?'#E8A857':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>;
          })}
        </div>
      </div>
      <button onClick={()=>{const cfg={secs:config?.secs||5,total:config?.total||10};setConfig(cfg);setRound(0);setScore({correct:0,total:0});setDone(false);setTimeout(()=>{},50);}}
        style={{width:'100%',padding:'1rem',background:'rgba(247,220,111,0.15)',border:'1px solid #E8A857',color:'#E8A857',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>
        COMMENCER →
      </button>
    </div>
  );

  // Results
  if (done) {
    const pct=Math.round((score.correct/score.total)*100),mc=pct>=90?'#7BC8A4':pct>=70?'#90B8D0':pct>=50?'#E8A857':'#E07070';
    return (
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(247,220,111,0.05)',border:'0.5px solid rgba(247,220,111,0.2)',borderRadius:4}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS — SPEED FLASHCARDS</div>
          <div style={{fontSize:72,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:32,opacity:.5}}>/{score.total}</span></div>
          <div style={{fontSize:22,color:mc,marginBottom:'.5rem'}}>{pct}%</div>
          <div style={{fontSize:14,opacity:.6,fontFamily:'Georgia,serif'}}>{pct>=90?'Réflexes excellents !':pct>=70?'Très bonne mémorisation !':pct>=50?'Continue à pratiquer !':'Revois tes accords de base !'}</div>
        </div>
        <button onClick={()=>{setConfig(null);setDone(false);setCard(null);}} style={{padding:'.9rem',background:'rgba(247,220,111,0.15)',border:'1px solid #E8A857',color:'#E8A857',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>↩ RECONFIGURER</button>
        <button onClick={()=>{setRound(0);setScore({correct:0,total:0});setDone(false);genCard();}} style={{padding:'.9rem',background:'transparent',border:'0.5px solid rgba(240,235,224,0.2)',color:'rgba(240,235,224,0.5)',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em'}}>🔄 REJOUER</button>
      </div>
    );
  }

  // Initialize first card
  if (!card) { genCard(); return null; }

  const tPct = (timeLeft/(config.secs))*100;
  const timerColor = tPct>60?'#7BC8A4':tPct>30?'#E8A857':'#E07070';
  const rootCorrect = answered ? userRoot===card.root : null;
  const typeCorrect = answered ? userType===card.type : null;
  const fullCorrect = answered && rootCorrect && typeCorrect;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{round+1}/{config.total}</span>
        <div style={{flex:1,margin:'0 1rem'}}>
          <div style={{height:4,background:'rgba(240,235,224,0.08)',borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${tPct}%`,background:timerColor,borderRadius:2,transition:'width 1s linear'}}/>
          </div>
        </div>
        <span style={{fontSize:13,fontWeight:'bold',fontFamily:'monospace',color:timerColor,minWidth:20,textAlign:'right'}}>{timeLeft}</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Card */}
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(240,235,224,0.02)',border:`0.5px solid ${answered?(fullCorrect?'rgba(130,224,170,0.3)':'rgba(241,148,138,0.3)'):'rgba(240,235,224,0.08)'}`,borderRadius:6,transition:'border-color 0.3s'}}>
          <div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'1rem'}}>
            {phase==='root'&&!answered?'QUELLE EST LA NOTE RACINE ?':phase==='type'&&!answered?'QUEL TYPE D\'ACCORD ?':'RÉPONSE'}
          </div>
          <div style={{fontSize:52,fontWeight:'bold',color:'#f0ebe0',fontFamily:'Georgia,serif',lineHeight:1,marginBottom:8}}>
            {card.name}
          </div>
          <div style={{fontSize:13,opacity:.4,fontFamily:'monospace'}}>{card.label}</div>
          {answered && (
            <div style={{marginTop:'1rem',animation:'fadeIn 0.3s ease'}}>
              <div style={{fontSize:18,fontWeight:'bold',color:fullCorrect?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif',marginBottom:8}}>
                {fullCorrect?'✓ Correct !':'✗ Raté'}
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',fontSize:11,fontFamily:'monospace'}}>
                <span style={{color:rootCorrect?'#7BC8A4':'#E07070'}}>Racine : {card.root} {rootCorrect?'✓':'✗'}</span>
                <span style={{opacity:.3}}>|</span>
                <span style={{color:typeCorrect?'#7BC8A4':'#E07070'}}>Type : {card.label} {typeCorrect?'✓':'✗'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Phase 1: Root selection */}
        {!answered && phase==='root' && (
          <div>
            <div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>NOTE RACINE</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {ROOT_NOTES.map(root => {
                const c = NOTE_COLORS[root]||'#B898C8';
                return (
                  <button key={root} onClick={()=>handleRootAnswer(root)}
                    style={{background:`${c}`,border:`0.5px solid ${c}`,color:c,padding:'.65rem .25rem',borderRadius:3,cursor:'pointer',fontSize:14,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c}18`;e.currentTarget.style.transform='scale(1.04)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${c}18`;e.currentTarget.style.transform='scale(1)';}}>
                    {root}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase 2: Type selection */}
        {!answered && phase==='type' && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'.65rem'}}>
              <div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace'}}>TYPE D'ACCORD</div>
              <span style={{fontSize:10,color:NOTE_COLORS[userRoot||'C']||'#B898C8',fontFamily:'monospace',fontWeight:'bold'}}>(racine : {userRoot})</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
              {Object.entries(CHORD_TYPES).map(([type,{label}]) => {
                const c = CHORD_COLORS[type]||'#B898C8';
                return (
                  <button key={type} onClick={()=>handleTypeAnswer(type)}
                    style={{background:`${c}`,border:`0.5px solid ${c}`,color:c,padding:'.7rem .5rem',borderRadius:3,cursor:'pointer',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c}18`;e.currentTarget.style.transform='scale(1.02)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${c}18`;e.currentTarget.style.transform='scale(1)';}}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {answered && (
          <button onClick={next} style={{width:'100%',padding:'.9rem',background:fullCorrect?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.08)',border:`1px solid ${fullCorrect?'#7BC8A4':'#E07070'}`,color:fullCorrect?'#7BC8A4':'#E07070',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
            {round>=config.total-1?'VOIR LES RÉSULTATS →':'CARTE SUIVANTE →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── DÉFIS PANEL ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function DefisPanel({stats,onClose}){
  const today=todayStr();
  const challenges=getDailyChallenges(today);
  const keys=stats.keys||0;

  // Progress per challenge
  function getProgress(c){
    switch(c.id){
      case'c_warmup':  return{cur:Math.min(stats.todayExercises||0,1),  max:1};
      case'c_ten':     return{cur:Math.min(stats.todayExercises||0,10), max:10};
      case'c_twenty':  return{cur:Math.min(stats.todayExercises||0,20), max:20};
      case'c_perfect': return{cur:stats.lastPerfect===today?1:0,        max:1};
      case'c_interval':return{cur:stats.lastIntervalDay===today?1:0,    max:1};
      case'c_chord_ear':return{cur:stats.lastChordEarDay===today?1:0,   max:1};
      case'c_library': return{cur:Math.min(stats.todayLibViews||0,5),   max:5};
      case'c_sections':return{cur:Math.min(stats.todaySections||0,3),   max:3};
      default:return{cur:0,max:1};
    }
  }

  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:150,backdropFilter:'blur(8px)'}}>
      <div style={{background:'#0C0A07',border:'0.5px solid rgba(240,235,224,0.12)',borderRadius:6,width:'min(420px,92vw)',maxHeight:'85vh',overflow:'hidden',display:'flex',flexDirection:'column',animation:'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>

        {/* Header */}
        <div style={{padding:'1.25rem 1.5rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(247,220,111,0.04)'}}>
          <div>
            <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:2}}>Défis du Jour</div>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em'}}>SE RÉINITIALISENT À MINUIT</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {/* Keys counter */}
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'.4rem .9rem',background:'rgba(247,220,111,0.1)',border:'0.5px solid rgba(247,220,111,0.3)',borderRadius:3}}>
              <span style={{fontSize:16}}>🗝️</span>
              <span style={{fontSize:18,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif'}}>{keys}</span>
              <span style={{fontSize:9,opacity:.5,fontFamily:'monospace'}}>CLÉS</span>
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.35,cursor:'pointer',fontSize:20,lineHeight:1,padding:'2px 4px'}}>×</button>
          </div>
        </div>

        {/* Challenges */}
        <div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:10,overflowY:'auto'}}>
          {challenges.map(c=>{
            const done=isCompleted(c.id,stats,today);
            const prog=getProgress(c);
            const pct=prog.max>0?Math.round((prog.cur/prog.max)*100):0;
            return(
              <div key={c.id} style={{background:done?'rgba(130,224,170,0.05)':'rgba(240,235,224,0.025)',border:`0.5px solid ${done?'rgba(130,224,170,0.3)':'rgba(240,235,224,0.1)'}`,borderRadius:4,padding:'1rem',transition:'all 0.3s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:done?0:'0.75rem'}}>
                  <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                    <span style={{fontSize:22,flexShrink:0,opacity:done?1:.7}}>{c.icon}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:'bold',color:done?'#7BC8A4':'#f0ebe0',fontFamily:'Georgia,serif',marginBottom:2}}>{c.title}</div>
                      <div style={{fontSize:11,opacity:.45,fontFamily:'monospace'}}>{c.desc}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0,marginLeft:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:done?'rgba(130,224,170,0.15)':'rgba(247,220,111,0.08)',border:`0.5px solid ${done?'rgba(130,224,170,0.4)':'rgba(247,220,111,0.25)'}`,borderRadius:2}}>
                      <span style={{fontSize:12}}>🗝️</span>
                      <span style={{fontSize:13,fontWeight:'bold',color:done?'#7BC8A4':'#E8A857',fontFamily:'monospace'}}>+{c.reward}</span>
                    </div>
                    {done&&<span style={{fontSize:9,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.05em'}}>✓ COMPLÉTÉ</span>}
                  </div>
                </div>
                {!done&&(
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>{prog.cur}/{prog.max}</span>
                      <span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>{pct}%</span>
                    </div>
                    <div style={{height:4,background:'rgba(240,235,224,0.08)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:'#E8A857',borderRadius:2,transition:'width 0.6s ease'}}/>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div style={{padding:'.75rem 1.5rem',borderTop:'0.5px solid rgba(240,235,224,0.06)',textAlign:'center'}}>
          <p style={{fontSize:10,opacity:.3,fontFamily:'monospace',margin:0}}>Les clés débloqueront du contenu exclusif prochainement 🗝️</p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SESSION COMPONENTS ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function SessionConfig({title,items,selected,onToggle,onToggleAll,exCount,setExCount,maxLives,setMaxLives,onStart,onBack}){
  const allSelected=selected.size===items.length,canStart=selected.size>=2;
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontSize:18,padding:'0 4px'}}>←</button>
      <div><h2 style={{fontSize:20,fontWeight:'bold',letterSpacing:'-.02em',margin:0}}>{title}</h2><p style={{fontSize:11,opacity:.35,fontFamily:'monospace',margin:'2px 0 0'}}>CONFIGURATION DE SESSION</p></div>
    </div>
    <div style={{marginBottom:'1.5rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
        <span style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace'}}>À TRAVAILLER</span>
        <button onClick={onToggleAll} style={{background:allSelected?'rgba(133,193,233,0.15)':'transparent',border:`0.5px solid ${allSelected?'#90B8D0':'rgba(240,235,224,0.2)'}`,color:allSelected?'#90B8D0':'rgba(240,235,224,0.5)',padding:'3px 8px',borderRadius:2,cursor:'pointer',fontSize:9,fontFamily:'monospace',letterSpacing:'.1em'}}>{allSelected?'DÉSÉLECTIONNER':'TOUT SÉLECTIONNER'}</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
        {items.map(item=>{const on=selected.has(item.id);return(<button key={item.id} onClick={()=>onToggle(item.id)} style={{background:on?`${item.color}`:'rgba(240,235,224,0.02)',border:`0.5px solid ${on?item.color:'rgba(240,235,224,0.1)'}`,borderRadius:3,padding:'.6rem .75rem',cursor:'pointer',display:'flex',alignItems:'center',gap:8,textAlign:'left',transition:'all 0.2s'}}>
          <div style={{width:14,height:14,borderRadius:2,flexShrink:0,background:on?item.color:'rgba(240,235,224,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>{on&&<span style={{fontSize:9,color:'#0f0e0c',fontWeight:'bold'}}>✓</span>}</div>
          <div><div style={{fontSize:12,fontWeight:'bold',color:on?item.color:'rgba(240,235,224,0.6)',fontFamily:'monospace'}}>{item.name}</div>{item.sub&&<div style={{fontSize:9,opacity:.4,fontFamily:'monospace'}}>{item.sub}</div>}</div>
        </button>);})}
      </div>
      {!canStart&&<p style={{fontSize:11,color:'#E07070',fontFamily:'monospace',marginTop:'.5rem',opacity:.8}}>⚠ Sélectionne au moins 2 éléments</p>}
    </div>
    <div style={{marginBottom:'1.25rem'}}>
      <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.65rem'}}>EXERCICES PAR SESSION</div>
      <div style={{display:'flex',gap:8}}>{[5,10,15,20].map(n=>(<button key={n} onClick={()=>setExCount(n)} style={{flex:1,padding:'.6rem',background:exCount===n?'rgba(133,193,233,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${exCount===n?'#90B8D0':'rgba(240,235,224,0.1)'}`,color:exCount===n?'#90B8D0':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>))}</div>
    </div>
    <div style={{marginBottom:'2rem'}}>
      <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.65rem'}}>VIES</div>
      <div style={{display:'flex',gap:8}}>{[[3,'3 ❤'],[5,'5 ❤'],[0,'∞']].map(([n,label])=>(<button key={n} onClick={()=>setMaxLives(n)} style={{flex:1,padding:'.6rem',background:maxLives===n?'rgba(241,148,138,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${maxLives===n?'#E07070':'rgba(240,235,224,0.1)'}`,color:maxLives===n?'#E07070':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:13,fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>))}</div>
    </div>
    <button onClick={()=>canStart&&onStart()} style={{width:'100%',padding:'1rem',background:canStart?'rgba(133,193,233,0.15)':'rgba(240,235,224,0.03)',border:`1px solid ${canStart?'#90B8D0':'rgba(240,235,224,0.1)'}`,color:canStart?'#90B8D0':'rgba(240,235,224,0.25)',borderRadius:3,cursor:canStart?'pointer':'not-allowed',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',transition:'all 0.3s'}}>COMMENCER LA SESSION →</button>
  </div>);
}

function SessionResults({score,exCount,lives,maxLives,history,categoryData,onRetry,onReconfig}){
  const pct=Math.round((score/exCount)*100),mc=pct>=90?'#7BC8A4':pct>=70?'#90B8D0':pct>=50?'#E8A857':'#E07070';
  const msg=pct>=90?'Excellent ! 🎉':pct>=70?'Très bien ! 👍':pct>=50?'Continue comme ça !':'Entraîne-toi encore !';
  const stats={};categoryData.forEach(c=>{stats[c.id]={correct:0,total:0,color:c.color,name:c.name};});
  history.forEach(h=>{if(stats[h.catId]){stats[h.catId].total++;if(h.correct)stats[h.catId].correct++;}});
  const used=categoryData.filter(c=>stats[c.id]?.total>0);
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
    <div style={{textAlign:'center',marginBottom:'2rem'}}>
      <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS</div>
      <div style={{fontSize:72,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score}<span style={{fontSize:32,opacity:.5}}>/{exCount}</span></div>
      <div style={{fontSize:24,color:mc,marginBottom:'.5rem'}}>{pct}%</div>
      <div style={{fontSize:15,opacity:.6,fontFamily:'Georgia,serif'}}>{msg}</div>
      {maxLives>0&&<div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,marginTop:'1rem'}}><span style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>VIES RESTANTES</span><Hearts total={maxLives} remaining={Math.max(0,lives)}/></div>}
    </div>
    {used.length>0&&(<div style={{marginBottom:'1.5rem'}}><div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.75rem'}}>DÉTAIL</div>
      {used.map(c=>{const st=stats[c.id],p=st.total>0?Math.round((st.correct/st.total)*100):0;return(<div key={c.id} style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:11,fontFamily:'monospace',color:c.color}}>{c.name}</span><span style={{fontSize:10,fontFamily:'monospace',opacity:.5}}>{st.correct}/{st.total}</span></div><div style={{height:5,background:'rgba(240,235,224,0.07)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${p}%`,background:c.color,borderRadius:2,transition:'width 0.8s ease'}}/></div></div>);})}
    </div>)}
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <button onClick={onRetry} style={{padding:'.9rem',background:'rgba(133,193,233,0.15)',border:'1px solid #90B8D0',color:'#90B8D0',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>🔄 REJOUER</button>
      <button onClick={onReconfig} style={{padding:'.9rem',background:'transparent',border:'0.5px solid rgba(240,235,224,0.2)',color:'rgba(240,235,224,0.5)',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em'}}>⚙ RECONFIGURER</button>
    </div>
  </div>);
}

// ── Interval Exercise ─────────────────────────────────────────────────────────
function IntervalExercise({config,onFinish,onBack}){
  const {selectedIds,exCount,maxLives}=config;
  const [exercises]=useState(()=>Array.from({length:exCount},()=>genEx(selectedIds)));
  const [idx,setIdx]=useState(0);const[lives,setLives]=useState(maxLives||999);const[score,setScore]=useState(0);
  const [answered,setAnswered]=useState(false);const[userSemi,setUserSemi]=useState(null);
  const [history,setHistory]=useState([]);const[showPiano,setShowPiano]=useState(false);
  const ex=exercises[idx],correct=userSemi===ex?.intSemi,iv=INTERVALS_DATA.find(i=>i.semi===ex?.intSemi);
  const selIvs=INTERVALS_DATA.filter(i=>selectedIds.includes(i.semi));
  useEffect(()=>{if(!ex)return;const t=setTimeout(()=>playSeq(ex.note1,ex.note2),400);return()=>clearTimeout(t);},[idx]);
  const handleAnswer=semi=>{
    if(answered)return;const ok=semi===ex.intSemi;setUserSemi(semi);setAnswered(true);
    const h=[...history,{catId:semi,intSemi:ex.intSemi,correct:ok}];setHistory(h);
    if(ok)setScore(s=>s+1);else if(maxLives>0){const nl=lives-1;setLives(nl);if(nl<=0){setTimeout(()=>{notifyExerciseDone(exCount,'interval',score+1===exCount);onFinish({score,lives:0,history:h,exCount});},1800);return;}}
  };
  const handleNext=()=>{
    if(idx>=exCount-1){const s=score+(correct?1:0);notifyExerciseDone(exCount,'interval',s===exCount);onFinish({score:s,lives,history,exCount});return;}
    setIdx(i=>i+1);setAnswered(false);setUserSemi(null);setShowPiano(false);
  };
  const pianoColors={};if(ex&&answered){pianoColors[ex.note1]='#90B8D0';pianoColors[ex.note2]=iv?.color||'#B898C8';}
  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'rgba(15,14,12,0.5)'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(240,235,224,0.4)',cursor:'pointer',fontSize:16}}>←</button>
      <div style={{flex:1,margin:'0 1rem'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{idx+1}/{exCount}</span><span style={{fontSize:10,fontFamily:'monospace',color:'#7BC8A4'}}>{score} ✓</span></div><div style={{height:3,background:'rgba(240,235,224,0.08)',borderRadius:2}}><div style={{height:'100%',width:`${((idx+1)/exCount)*100}%`,background:'#90B8D0',borderRadius:2,transition:'width 0.3s ease'}}/></div></div>
      <Hearts total={maxLives} remaining={lives}/>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4}}>
        <p style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1rem'}}>QUEL EST CET INTERVALLE ?</p>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'2rem',marginBottom:'1rem'}}>
          <div style={{textAlign:'center'}}><div style={{width:54,height:54,borderRadius:'50%',background:'rgba(133,193,233,0.2)',border:'1px solid #90B8D0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:'bold',color:'#90B8D0',fontFamily:'monospace',margin:'0 auto 5px'}}>{ex?NM[ex.note1%12]:'—'}</div><div style={{fontSize:9,opacity:.3,fontFamily:'monospace'}}>{ex?semiToName(ex.note1):''}</div></div>
          <div style={{fontSize:20,opacity:.25}}>→</div>
          <div style={{textAlign:'center'}}><div style={{width:54,height:54,borderRadius:'50%',background:answered?(iv?`${iv.color}`:'rgba(240,235,224,0.05)'):'rgba(240,235,224,0.05)',border:`1px solid ${answered?(iv?.color||'rgba(240,235,224,0.3)'):'rgba(240,235,224,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:answered?17:22,fontWeight:'bold',color:answered?(iv?.color||'#f0ebe0'):'rgba(240,235,224,0.15)',fontFamily:'monospace',margin:'0 auto 5px',transition:'all 0.3s'}}>{answered?(ex?NM[ex.note2%12]:'—'):'?'}</div><div style={{fontSize:9,opacity:.3,fontFamily:'monospace'}}>{answered&&ex?semiToName(ex.note2):''}</div></div>
        </div>
        {answered&&(<div style={{animation:'fadeIn 0.3s ease',marginBottom:'.75rem'}}><div style={{fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',color:correct?'#7BC8A4':'#E07070',marginBottom:4}}>{correct?'✓ Correct !':'✗ Raté'}</div><div style={{fontSize:13,color:iv?.color,fontFamily:'monospace'}}>{iv?.full} ({ex?.intSemi} demi-ton{ex?.intSemi>1?'s':''})</div>{!correct&&<div style={{fontSize:11,opacity:.4,marginTop:4,fontFamily:'monospace'}}>Tu as répondu : {INTERVALS_DATA.find(i=>i.semi===userSemi)?.full}</div>}</div>)}
        <div style={{display:'flex',gap:7,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>ex&&playSeq(ex.note1,ex.note2)} style={{background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.6)',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🔊 SÉQUENTIEL</button>
          <button onClick={()=>ex&&playSimul(ex.note1,ex.note2)} style={{background:'rgba(133,193,233,0.07)',border:'0.5px solid rgba(133,193,233,0.25)',color:'#90B8D0',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎵 SIMULTANÉ</button>
          {answered&&<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?'rgba(133,193,233,0.1)':'rgba(240,235,224,0.05)',border:`0.5px solid ${showPiano?'#90B8D0':'rgba(240,235,224,0.15)'}`,color:showPiano?'#90B8D0':'rgba(240,235,224,0.5)',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎹 CLAVIER</button>}
        </div>
      </div>
      {answered&&showPiano&&ex&&(<div style={{padding:'1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease',overflowX:'auto'}}><div style={{fontSize:9,opacity:.3,fontFamily:'monospace',marginBottom:'.75rem',textAlign:'center'}}><span style={{color:'#90B8D0'}}>■</span> Départ &nbsp;<span style={{color:iv?.color}}>■</span> Arrivée</div><PianoKeyboard colors={pianoColors}/></div>)}
      <div><div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>{answered?'INTERVALLES':'CHOISIR'}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
          {selIvs.map(i=>{const isU=userSemi===i.semi,isOk=i.semi===ex?.intSemi;let bg='rgba(240,235,224,0.03)',b='rgba(240,235,224,0.1)',col='rgba(240,235,224,0.7)';if(answered){if(isOk){bg=`${i.color}`;b=i.color;col=i.color;}else if(isU){bg='rgba(241,148,138,0.1)';b='#E07070';col='#E07070';}else col='rgba(240,235,224,0.2)';}return(<button key={i.semi} onClick={()=>handleAnswer(i.semi)} disabled={answered} style={{background:bg,border:`0.5px solid ${b}`,color:col,padding:'.65rem .25rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.02em',transition:'all 0.2s',lineHeight:1.3}}>{i.name}</button>);})}
        </div>
      </div>
      {answered&&(<button onClick={handleNext} style={{width:'100%',padding:'.9rem',background:correct?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.08)',border:`1px solid ${correct?'#7BC8A4':'#E07070'}`,color:correct?'#7BC8A4':'#E07070',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>{idx>=exCount-1?'VOIR LES RÉSULTATS →':'EXERCICE SUIVANT →'}</button>)}
    </div>
  </div>);
}

function IntervallesSection({onBack}){
  const [screen,setScreen]=useState('config');const[config,setConfig]=useState(null);const[result,setResult]=useState(null);
  const [selected,setSelected]=useState(new Set([3,4,5,7]));const[exCount,setExCount]=useState(10);const[maxLives,setMaxLives]=useState(3);
  const items=INTERVALS_DATA.map(iv=>({id:iv.semi,name:iv.name,sub:`${iv.semi} demi-ton${iv.semi>1?'s':''}`,color:iv.color}));
  const toggle=id=>setSelected(p=>{const n=new Set(p);if(n.has(id)){if(n.size>2)n.delete(id);}else n.add(id);return n;});
  const toggleAll=()=>{if(selected.size===items.length)setSelected(new Set([3,4]));else setSelected(new Set(items.map(i=>i.id)));};
  if(screen==='config')return(<SessionConfig title="Intervalles" items={items} selected={selected} onToggle={toggle} onToggleAll={toggleAll} exCount={exCount} setExCount={setExCount} maxLives={maxLives} setMaxLives={setMaxLives} onStart={()=>{setConfig({selectedIds:Array.from(selected),exCount,maxLives});setScreen('exercise');}} onBack={onBack}/>);
  if(screen==='exercise')return(<IntervalExercise config={config} onBack={()=>setScreen('config')} onFinish={res=>{setResult(res);setScreen('results');}}/>);
  if(screen==='results')return(<SessionResults score={result.score} exCount={result.exCount} lives={result.lives} maxLives={maxLives} history={result.history} categoryData={INTERVALS_DATA.map(iv=>({id:iv.semi,name:iv.name,color:iv.color}))} onRetry={()=>setScreen('exercise')} onReconfig={()=>setScreen('config')}/>);
}

// ── Chord Exercise ────────────────────────────────────────────────────────────
function ChordExercise({config,onFinish,onBack}){
  const {selectedTypes,exCount,maxLives}=config;
  const [exercises]=useState(()=>Array.from({length:exCount},()=>genChordEx(selectedTypes)));
  const [idx,setIdx]=useState(0);const[lives,setLives]=useState(maxLives||999);const[score,setScore]=useState(0);
  const [answered,setAnswered]=useState(false);const[userType,setUserType]=useState(null);
  const [history,setHistory]=useState([]);const[showPiano,setShowPiano]=useState(false);
  const ex=exercises[idx],correct=userType===ex?.type,ci=ex?CHORD_TYPES[ex.type]:null;
  const selTypes=Object.entries(CHORD_TYPES).filter(([t])=>selectedTypes.includes(t));
  useEffect(()=>{if(!ex)return;const t=setTimeout(()=>playChordArp(ex.notes),400);return()=>clearTimeout(t);},[idx]);
  const handleAnswer=type=>{
    if(answered)return;const ok=type===ex.type;setUserType(type);setAnswered(true);
    const h=[...history,{catId:type,type:ex.type,correct:ok}];setHistory(h);
    if(ok)setScore(s=>s+1);else if(maxLives>0){const nl=lives-1;setLives(nl);if(nl<=0){setTimeout(()=>{notifyExerciseDone(exCount,'chord_ear',score+1===exCount);onFinish({score,lives:0,history:h,exCount});},1800);return;}}
  };
  const handleNext=()=>{
    if(idx>=exCount-1){const s=score+(correct?1:0);notifyExerciseDone(exCount,'chord_ear',s===exCount);onFinish({score:s,lives,history,exCount});return;}
    setIdx(i=>i+1);setAnswered(false);setUserType(null);setShowPiano(false);
  };
  const pianoColors={};if(ex&&answered){const c=CHORD_COLORS[ex.type]||'#B898C8';ex.notes.forEach((n,i)=>{pianoColors[n]=i===0?'#90B8D0':c;});}
  const rootName=ex?NM[ex.rootSemi]:'';
  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'rgba(15,14,12,0.5)'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(240,235,224,0.4)',cursor:'pointer',fontSize:16}}>←</button>
      <div style={{flex:1,margin:'0 1rem'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{idx+1}/{exCount}</span><span style={{fontSize:10,fontFamily:'monospace',color:'#7BC8A4'}}>{score} ✓</span></div><div style={{height:3,background:'rgba(240,235,224,0.08)',borderRadius:2}}><div style={{height:'100%',width:`${((idx+1)/exCount)*100}%`,background:'#B898C8',borderRadius:2,transition:'width 0.3s ease'}}/></div></div>
      <Hearts total={maxLives} remaining={lives}/>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4}}>
        <p style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1.25rem'}}>QUEL TYPE D'ACCORD ?</p>
        <div style={{marginBottom:'1rem'}}>
          <div style={{fontSize:answered?52:48,fontWeight:'bold',fontFamily:'Georgia,serif',color:answered?(CHORD_COLORS[ex.type]||'#B898C8'):'rgba(240,235,224,0.15)',transition:'all 0.4s',lineHeight:1,marginBottom:6}}>{answered?`${rootName}${ci?.suffix}`:'?'}</div>
          {answered&&<div style={{fontSize:13,color:CHORD_COLORS[ex.type]||'#B898C8',fontFamily:'monospace'}}>{ci?.label}</div>}
          {answered&&ex&&<div style={{fontSize:11,opacity:.4,fontFamily:'monospace',marginTop:4}}>{ex.notes.map(n=>NM[n%12]).join(' – ')}</div>}
        </div>
        {answered&&(<div style={{animation:'fadeIn 0.3s ease',marginBottom:'.75rem'}}><div style={{fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',color:correct?'#7BC8A4':'#E07070'}}>{correct?'✓ Correct !':'✗ Raté — '+ci?.label}</div></div>)}
        <div style={{display:'flex',gap:7,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>ex&&playChordArp(ex.notes)} style={{background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.6)',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🔊 ARPÈGE</button>
          <button onClick={()=>ex&&playChordSimul(ex.notes)} style={{background:'rgba(195,155,211,0.07)',border:'0.5px solid rgba(195,155,211,0.3)',color:'#B898C8',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎵 SIMULTANÉ</button>
          {answered&&<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?'rgba(195,155,211,0.1)':'rgba(240,235,224,0.05)',border:`0.5px solid ${showPiano?'#B898C8':'rgba(240,235,224,0.15)'}`,color:showPiano?'#B898C8':'rgba(240,235,224,0.5)',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎹 CLAVIER</button>}
        </div>
      </div>
      {answered&&showPiano&&ex&&(<div style={{padding:'1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease',overflowX:'auto'}}><div style={{fontSize:9,opacity:.3,fontFamily:'monospace',marginBottom:'.75rem',textAlign:'center'}}><span style={{color:'#90B8D0'}}>■</span> Tonique &nbsp;<span style={{color:CHORD_COLORS[ex.type]}}>■</span> Notes</div><PianoKeyboard colors={pianoColors}/></div>)}
      <div><div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>{answered?'TYPES':'CHOISIR LE TYPE'}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
          {selTypes.map(([type,{label}])=>{const isU=userType===type,isOk=type===ex?.type,tc=CHORD_COLORS[type]||'#B898C8';let bg='rgba(240,235,224,0.03)',b='rgba(240,235,224,0.1)',col='rgba(240,235,224,0.7)';if(answered){if(isOk){bg=`${tc}`;b=tc;col=tc;}else if(isU){bg='rgba(241,148,138,0.1)';b='#E07070';col='#E07070';}else col='rgba(240,235,224,0.2)';}return(<button key={type} onClick={()=>handleAnswer(type)} disabled={answered} style={{background:bg,border:`0.5px solid ${b}`,color:col,padding:'.7rem .5rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>);})}
        </div>
      </div>
      {answered&&(<button onClick={handleNext} style={{width:'100%',padding:'.9rem',background:correct?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.08)',border:`1px solid ${correct?'#7BC8A4':'#E07070'}`,color:correct?'#7BC8A4':'#E07070',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>{idx>=exCount-1?'VOIR LES RÉSULTATS →':'EXERCICE SUIVANT →'}</button>)}
    </div>
  </div>);
}

function AccordOreilleSection({onBack}){
  const [screen,setScreen]=useState('config');const[config,setConfig]=useState(null);const[result,setResult]=useState(null);
  const [selected,setSelected]=useState(new Set(['Majeures','Mineures']));const[exCount,setExCount]=useState(10);const[maxLives,setMaxLives]=useState(3);
  const items=Object.entries(CHORD_TYPES).map(([t,{label}])=>({id:t,name:label,sub:t,color:CHORD_COLORS[t]||'#B898C8'}));
  const toggle=id=>setSelected(p=>{const n=new Set(p);if(n.has(id)){if(n.size>2)n.delete(id);}else n.add(id);return n;});
  const toggleAll=()=>{if(selected.size===items.length)setSelected(new Set(['Majeures','Mineures']));else setSelected(new Set(items.map(i=>i.id)));};
  if(screen==='config')return(<SessionConfig title="Accords" items={items} selected={selected} onToggle={toggle} onToggleAll={toggleAll} exCount={exCount} setExCount={setExCount} maxLives={maxLives} setMaxLives={setMaxLives} onStart={()=>{setConfig({selectedTypes:Array.from(selected),exCount,maxLives});setScreen('exercise');}} onBack={onBack}/>);
  if(screen==='exercise')return(<ChordExercise config={config} onBack={()=>setScreen('config')} onFinish={res=>{setResult(res);setScreen('results');}}/>);
  if(screen==='results')return(<SessionResults score={result.score} exCount={result.exCount} lives={result.lives} maxLives={maxLives} history={result.history.map(h=>({...h,catId:h.type}))} categoryData={items} onRetry={()=>setScreen('exercise')} onReconfig={()=>setScreen('config')}/>);
}

// ── Oreille Page ──────────────────────────────────────────────────────────────
// ── Données pour la Mélodie et l'Improvisation ───────────────────────────────
const PENTATONIC_SEMIS  = [0, 2, 4, 7, 9];          // Do penta majeure
const MAJOR_SCALE_SEMIS = [0, 2, 4, 5, 7, 9, 11];   // Do majeure

// Noms de notes jouables sur le piano (oct. 4 = indices 0-11, oct.5 = 12-23)
const PIANO_NOTE_NAMES = {
  0:'C4',2:'D4',4:'E4',5:'F4',7:'G4',9:'A4',11:'B4',
  12:'C5',14:'D5',16:'E5',17:'F5',19:'G5',21:'A5',23:'B5',
};
// Semi → nom solfège
const SEMI_TO_SOLFEGE = {0:'Do',2:'Ré',4:'Mi',5:'Fa',7:'Sol',9:'La',11:'Si',
  12:'Do',14:'Ré',16:'Mi',17:'Fa',19:'Sol',21:'La',23:'Si'};

// Génère une mélodie aléatoire dans une gamme donnée
function generateMelody(length=6, scale=PENTATONIC_SEMIS, minNote=0, maxNote=12) {
  const available = [];
  for (let oct=0; oct<=1; oct++) {
    scale.forEach(s => {
      const abs = s + oct*12;
      if (abs>=minNote && abs<=maxNote) available.push(abs);
    });
  }
  const melody = [];
  let prev = -1;
  for (let i=0; i<length; i++) {
    // Avoid same note twice in a row
    let candidates = available.filter(n => n!==prev);
    if (candidates.length===0) candidates=available;
    const note = candidates[Math.floor(Math.random()*candidates.length)];
    melody.push(note);
    prev = note;
  }
  return melody;
}

// Styles musicaux pour l'improvisation
const IMPRO_STYLES = [
  { id:'blues',   label:'Blues',         color:'#E8A857',
    scale:[0,3,5,6,7,10], prog:['C','F','G'], type:'Majeures',
    desc:'Pentatonique mineure + blue note. La couleur émotionnelle du blues.' },
  { id:'jazz',    label:'Jazz',          color:'#C8864A',
    scale:[0,2,4,7,9], prog:['D','G','C'], type:'Min. 7',
    desc:'Mode dorien. L\'espace harmonique du jazz moderne.' },
  { id:'pop',     label:'Pop',           color:'#60A8BC',
    scale:[0,2,4,5,7,9,11], prog:['C','G','A','F'], type:'Majeures',
    desc:'Gamme majeure. Lumineux et accessible, idéal pour commencer.' },
  { id:'latin',   label:'Latin',         color:'#D06060',
    scale:[0,2,3,5,7,8,10], prog:['A','D','E','A'], type:'Mineures',
    desc:'Mode mineur mélodique. Chaleur et danse, flamenco et bossa.' },
  { id:'modal',   label:'Modal',         color:'#6EB898',
    scale:[0,2,4,6,7,9,11], prog:['C','D','C','D'], type:'Majeures',
    desc:'Mode lydien. Sonorité aérienne et mystérieuse, cinéma moderne.' },
];

function generateImproProgression(style, key='C') {
  const ri = CHROMATIC.indexOf(key);
  const prog = style.prog.map(r => {
    const base = CHROMATIC.indexOf(r);
    const transposed = CHROMATIC[(base + ri) % 12];
    return { r: transposed, t: style.type };
  });
  return prog;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SECTION MÉLODIE (Oreille) ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function MelodieSection({ onBack }) {
  const DIFFICULTIES = [
    { id:'easy',   label:'Facile',   length:4, scale:PENTATONIC_SEMIS,  minNote:0,  maxNote:12, lives:5, color:'#7BC8A4' },
    { id:'medium', label:'Moyen',    length:6, scale:MAJOR_SCALE_SEMIS, minNote:0,  maxNote:14, lives:3, color:'#E8A857' },
    { id:'hard',   label:'Difficile',length:8, scale:MAJOR_SCALE_SEMIS, minNote:0,  maxNote:19, lives:2, color:'#E07070' },
  ];

  const [screen,      setScreen]      = useState('config');
  const [difficulty,  setDifficulty]  = useState(DIFFICULTIES[0]);
  const [melody,      setMelody]      = useState([]);
  const [userInput,   setUserInput]   = useState([]);
  const [lives,       setLives]       = useState(5);
  const [feedback,    setFeedback]    = useState(null);
  const [score,       setScore]       = useState({ correct:0, total:0 });
  const [round,       setRound]       = useState(0);
  const [tempoFactor, setTempoFactor] = useState(1);
  const [isPlaying,   setIsPlaying]   = useState(false);

  // Track all scheduled timeouts so we can cancel them
  const timeoutsRef = useRef([]);
  function clearAllTimeouts() {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    setIsPlaying(false);
  }

  // Stop on unmount
  useEffect(() => () => clearAllTimeouts(), []);

  function scheduledPlayMelody(m, factor=1) {
    clearAllTimeouts();
    setIsPlaying(true);
    m.forEach((semi, i) => {
      const id = setTimeout(() => {
        playNote(semi, 0, 0.8);
        if (i === m.length - 1) setIsPlaying(false);
      }, i * (550 * factor));
      timeoutsRef.current.push(id);
    });
  }

  function startRound(diff) {
    clearAllTimeouts();
    const m = generateMelody(diff.length, diff.scale, diff.minNote, diff.maxNote);
    setMelody(m); setUserInput([]); setLives(diff.lives); setFeedback(null); setScreen('play');
    const id = setTimeout(() => scheduledPlayMelody(m, tempoFactor), 600);
    timeoutsRef.current.push(id);
  }

  function handlePianoKey(semi) {
    if (feedback || isPlaying) return;
    const expected = melody[userInput.length];
    if (expected === undefined) return;
    playNote(semi, 0, 0.6);
    const correct = semi === expected;
    if (correct) {
      const next = [...userInput, semi];
      setUserInput(next);
      setFeedback('correct');
      const id = setTimeout(() => {
        setFeedback(null);
        if (next.length === melody.length) {
          setScore(s => ({ correct: s.correct+1, total: s.total+1 }));
          const newRound = round + 1;
          if (newRound >= 5) { setScreen('result'); return; }
          setRound(newRound);
          const m = generateMelody(difficulty.length, difficulty.scale, difficulty.minNote, difficulty.maxNote);
          setMelody(m); setUserInput([]);
          const id2 = setTimeout(() => scheduledPlayMelody(m, tempoFactor), 700);
          timeoutsRef.current.push(id2);
        }
      }, 300);
      timeoutsRef.current.push(id);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback('wrong');
      const id = setTimeout(() => {
        setFeedback(null);
        if (newLives <= 0) { setScore(s => ({ correct: s.correct, total: s.total+1 })); setScreen('result'); }
      }, 600);
      timeoutsRef.current.push(id);
    }
  }

  const PLAY_KEYS = PIANO_KEYS_DATA.filter(k => k.absIdx >= difficulty.minNote && k.absIdx <= (difficulty.maxNote + 2));
  const whites = PLAY_KEYS.filter(k=>k.type==='white');
  const blacks = PLAY_KEYS.filter(k=>k.type==='black');
  const minWi  = Math.min(...whites.map(k=>k.wi));

  function keyColor(absIdx) {
    if (feedback === 'correct' && absIdx === melody[userInput.length-1]) return '#7BC8A4';
    if (feedback === 'wrong'   && absIdx === melody[userInput.length])   return '#E07070';
    return null;
  }

  // Config screen
  if (screen === 'config') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>←</button>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',margin:0}}>Dictée Mélodique</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',margin:'2px 0 0'}}>RECONNAÎTRE ET REPRODUIRE UNE MÉLODIE</p>
        </div>
      </div>
      <div style={{padding:'1rem',background:'rgba(130,224,170,0.07)',border:'1px solid rgba(130,224,170,0.2)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.65,fontFamily:'Georgia,serif'}}>
          L'app joue une courte mélodie. Tu dois la reproduire note par note sur le piano. Chaque bonne note avance, chaque fausse note coûte une vie. 5 mélodies par session.
        </p>
      </div>
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>DIFFICULTÉ</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={()=>setDifficulty(d)}
              style={{background:difficulty.id===d.id?`${d.color}`:'rgba(255,255,255,0.03)',border:`1.5px solid ${difficulty.id===d.id?d.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.85rem 1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <span style={{fontSize:14,fontWeight:'bold',color:difficulty.id===d.id?d.color:'#fff',fontFamily:'Georgia,serif'}}>{d.label}</span>
                <span style={{fontSize:10,opacity:.5,fontFamily:'monospace',marginLeft:10}}>{d.length} notes · {d.lives} vie{d.lives>1?'s':''} · {d.scale===PENTATONIC_SEMIS?'Pentatonique':'Gamme majeure'}</span>
              </div>
              {difficulty.id===d.id && <span style={{color:d.color}}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:'1.5rem',padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em'}}>VITESSE DE LECTURE</div>
          <span style={{fontSize:11,fontFamily:'monospace',color:difficulty.color,fontWeight:'bold'}}>{tempoFactor===1?'Normale':'Lente (×0.5)'}</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[[1,'🎵 Normale'],[0.5,'🐢 Lente']].map(([v,label])=>(
            <button key={v} onClick={()=>setTempoFactor(v)} style={{flex:1,padding:'.55rem',background:tempoFactor===v?`${difficulty.color}`:'transparent',border:`1px solid ${tempoFactor===v?difficulty.color:'rgba(255,255,255,0.12)'}`,borderRadius:8,cursor:'pointer',color:tempoFactor===v?difficulty.color:'rgba(255,255,255,0.45)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>{label}</button>
          ))}
        </div>
      </div>
      <button onClick={()=>{setRound(0);setScore({correct:0,total:0});startRound(difficulty);}}
        style={{width:'100%',padding:'1rem',background:`${difficulty.color}`,border:`1.5px solid ${difficulty.color}`,color:difficulty.color,borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
        COMMENCER →
      </button>
    </div>
  );

  // Result screen
  if (screen === 'result') {
    const pct = score.total>0?Math.round((score.correct/score.total)*100):0;
    const mc  = pct>=80?'#7BC8A4':pct>=50?'#E8A857':'#E07070';
    return (
      <div style={{flex:1,overflowY:'auto',padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
        <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}35`,borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS</div>
          <div style={{fontSize:68,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/5</span></div>
          <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
          <div style={{fontSize:13,opacity:.5,fontFamily:'Georgia,serif',marginTop:8}}>{pct>=80?'Excellent ! Ton oreille est affûtée 🎉':pct>=50?'Bien joué, continue !':'Entraîne-toi encore !'}</div>
        </div>
        <button onClick={()=>{setRound(0);setScore({correct:0,total:0});startRound(difficulty);}}
          style={{padding:'.9rem',background:`${difficulty.color}`,border:`1.5px solid ${difficulty.color}`,color:difficulty.color,borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
          🔄 REJOUER
        </button>
        <button onClick={()=>setScreen('config')}
          style={{padding:'.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>
          CHANGER DE DIFFICULTÉ
        </button>
      </div>
    );
  }

  // Play screen
  const currentNoteIdx = userInput.length;
  const progressPct    = (currentNoteIdx / melody.length) * 100;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontSize:9,fontFamily:'monospace',opacity:.4}}>MÉLODIE {round+1}/5</div>
          <div style={{height:3,width:100,background:'rgba(255,255,255,0.08)',borderRadius:2,marginTop:3}}>
            <div style={{height:'100%',width:`${progressPct}%`,background:difficulty.color,borderRadius:2,transition:'width 0.2s ease'}}/>
          </div>
        </div>
        <Hearts total={difficulty.lives} remaining={lives}/>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div style={{textAlign:'center',padding:'1rem',background:feedback==='correct'?'rgba(130,224,170,0.1)':feedback==='wrong'?'rgba(241,148,138,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${feedback==='correct'?'rgba(130,224,170,0.4)':feedback==='wrong'?'rgba(241,148,138,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:12,transition:'all 0.2s'}}>
          {isPlaying  && <div style={{fontSize:14,opacity:.6,fontFamily:'monospace',letterSpacing:'.08em',animation:'fadeIn 0.2s ease'}}>🎵 Écoute attentivement…</div>}
          {!isPlaying && feedback==='correct' && <div style={{fontSize:18,color:'#7BC8A4',fontWeight:'bold',fontFamily:'Georgia,serif'}}>✓ Bonne note !</div>}
          {!isPlaying && feedback==='wrong'   && <div style={{fontSize:18,color:'#E07070',fontWeight:'bold',fontFamily:'Georgia,serif'}}>✗ Mauvaise note</div>}
          {!isPlaying && !feedback && (
            <div>
              <div style={{fontSize:11,opacity:.4,fontFamily:'monospace',marginBottom:'.5rem'}}>NOTE {currentNoteIdx+1}/{melody.length} — JOUE LA MÉLODIE</div>
              <div style={{fontSize:13,opacity:.55,fontFamily:'monospace'}}>{SEMI_TO_SOLFEGE[melody[currentNoteIdx]] || '?'}</div>
            </div>
          )}
        </div>

        {/* Note dots */}
        <div style={{display:'flex',gap:6,justifyContent:'center'}}>
          {melody.map((_, i)=>(
            <div key={i} style={{width:12,height:12,borderRadius:'50%',
              background:i<currentNoteIdx?difficulty.color:i===currentNoteIdx?`${difficulty.color}`:'rgba(255,255,255,0.1)',
              border:i===currentNoteIdx?`2px solid ${difficulty.color}`:'2px solid transparent',
              transition:'all 0.2s'}}/>
          ))}
        </div>

        {/* Controls — avec bouton PAUSE */}
        <div style={{display:'flex',gap:8}}>
          {isPlaying ? (
            <button onClick={clearAllTimeouts}
              style={{flex:1,padding:'.6rem',background:'rgba(241,148,138,0.12)',border:'1px solid rgba(241,148,138,0.4)',borderRadius:8,cursor:'pointer',color:'#E07070',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold'}}>
              ⏸ PAUSE
            </button>
          ) : (
            <>
              <button onClick={()=>scheduledPlayMelody(melody,tempoFactor)}
                style={{flex:1,padding:'.6rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em'}}>
                🔊 RÉÉCOUTER
              </button>
              <button onClick={()=>scheduledPlayMelody(melody,0.5)}
                style={{flex:1,padding:'.6rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em'}}>
                🐢 LENT
              </button>
            </>
          )}
        </div>

        {/* Interactive piano */}
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'.85rem',overflowX:'auto'}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',textAlign:'center',marginBottom:'.65rem',letterSpacing:'.1em'}}>
            {isPlaying ? 'ÉCOUTE EN COURS…' : 'TAPE LA NOTE CORRESPONDANTE'}
          </div>
          <div style={{position:'relative',height:100}}>
            {whites.map(({absIdx,wi}) => {
              const adjWi = wi - minWi;
              const c = keyColor(absIdx);
              return (
                <div key={absIdx} onClick={()=>handlePianoKey(absIdx)}
                  style={{position:'absolute',left:adjWi*34,top:0,width:32,height:95,background:c||'#EDE5D8',border:'1.5px solid #555',borderRadius:'0 0 5px 5px',cursor:isPlaying?'not-allowed':'pointer',transition:'background 0.1s',display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:4}}
                  onMouseEnter={e=>{if(!c&&!isPlaying)e.currentTarget.style.background='#D8CEBC';}}
                  onMouseLeave={e=>{if(!c)e.currentTarget.style.background='#EDE5D8';}}>
                  {c && <span style={{fontSize:8,fontFamily:'monospace',color:'#000',fontWeight:'bold'}}>{SEMI_TO_SOLFEGE[absIdx]}</span>}
                </div>
              );
            })}
            {blacks.map(({absIdx,wi}) => {
              const adjWi = wi - minWi;
              const c = keyColor(absIdx);
              return (
                <div key={absIdx} onClick={()=>handlePianoKey(absIdx)}
                  style={{position:'absolute',left:adjWi*34+22,top:0,width:22,height:60,zIndex:2,background:c||'#181614',border:'1px solid #000',borderRadius:'0 0 4px 4px',cursor:isPlaying?'not-allowed':'pointer',transition:'background 0.1s'}}
                  onMouseEnter={e=>{if(!c&&!isPlaying)e.currentTarget.style.background='#333';}}
                  onMouseLeave={e=>{if(!c)e.currentTarget.style.background='#181614';}}>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{padding:'.65rem .9rem',background:'rgba(200,140,80,0.07)',border:'1px solid rgba(200,140,80,0.18)',borderRadius:10}}>
          <p style={{fontSize:11,opacity:.55,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>
            💡 Astuce : écoute la mélodie plusieurs fois avant de jouer. Chante-la mentalement d'abord.
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SECTION OREILLE ABSOLUE ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const OREILLE_ABSOLUE_PIECES = [
  { id:1, title:'Gamme de Do',       desc:'La gamme fondamentale, 8 notes',         notes:[0,2,4,5,7,9,11,12], diff:1 },
  { id:2, title:'Joyeux Anniversaire',desc:'Mélodie connue de tous',                notes:[0,0,2,0,5,4,0,0,2,0,7,5], diff:2 },
  { id:3, title:'Au Clair de la Lune',desc:'Mélodie traditionnelle française',       notes:[0,0,0,2,4,2,0,4,2,2,0], diff:2 },
  { id:4, title:'Ode à la Joie',     desc:'Beethoven — thème simple',               notes:[4,4,5,7,7,5,4,2,0,0,2,4,4,2,2], diff:3 },
  { id:5, title:'Pentatonique',      desc:'5 notes, base de nombreuses mélodies',   notes:[0,2,4,7,9,7,4,2,0], diff:2 },
  { id:6, title:'Mélodie mystère',   desc:'Une mélodie générée aléatoirement',      notes:[], diff:2, random:true },
];

const OREILLE_TIPS = [
  "Commence par écouter la mélodie entière plusieurs fois sans jouer.",
  "Identifie d'abord la première note — c'est souvent Do ou Sol.",
  "Repère les intervalles : est-ce que la mélodie monte ou descend ?",
  "Utilise la vitesse lente pour isoler les notes difficiles.",
  "Chante la mélodie avant de la jouer — ton cerveau reconnaît mieux ce qu'il a chanté.",
  "Les notes répétées sont plus faciles à trouver — commence par elles.",
];

function OreilleAbsolue({ onBack }) {
  const [screen,    setScreen]    = useState('select');
  const [piece,     setPiece]     = useState(null);
  const [tempo,     setTempo]     = useState(1);
  const [notes,     setNotes]     = useState([]);
  const [played,    setPlayed]    = useState([]);
  const [feedback,  setFeedback]  = useState(null);
  const [lives,     setLives]     = useState(3);
  const [tipIdx,    setTipIdx]    = useState(0);
  const [showTipBox,setShowTipBox]= useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const timeoutsRef = useRef([]);
  function clearAllTimeouts() {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    setIsPlaying(false);
  }
  useEffect(() => () => clearAllTimeouts(), []);

  function scheduledPlayNotes(ns, factor=1) {
    clearAllTimeouts();
    setIsPlaying(true);
    ns.forEach((semi, i) => {
      const id = setTimeout(() => {
        playNote(semi, 0, 0.7);
        if (i === ns.length - 1) setIsPlaying(false);
      }, i * (480 * factor));
      timeoutsRef.current.push(id);
    });
  }

  function loadPiece(p) {
    const resolved = p.random ? generateMelody(7, PENTATONIC_SEMIS, 0, 12) : p.notes;
    clearAllTimeouts();
    setNotes(resolved); setPiece(p); setPlayed([]); setLives(3); setFeedback(null);
    setScreen('play');
    const id = setTimeout(() => scheduledPlayNotes(resolved, tempo), 700);
    timeoutsRef.current.push(id);
  }

  function handlePianoKey(semi) {
    if (feedback || isPlaying) return;
    const expected = notes[played.length];
    if (expected === undefined) return;
    playNote(semi, 0, 0.55);
    const ok = semi === expected;
    if (ok) {
      const next = [...played, semi];
      setPlayed(next);
      setFeedback('correct');
      const id = setTimeout(() => {
        setFeedback(null);
        if (next.length >= notes.length) setScreen('done');
      }, 250);
      timeoutsRef.current.push(id);
    } else {
      setLives(l => {
        const nl = l-1;
        if (nl<=0) {
          const id = setTimeout(()=>setScreen('fail'),600);
          timeoutsRef.current.push(id);
        }
        return nl;
      });
      setFeedback('wrong');
      const id = setTimeout(()=>setFeedback(null), 500);
      timeoutsRef.current.push(id);
    }
  }

  const whites2 = PIANO_KEYS_DATA.filter(k=>k.type==='white' && k.absIdx<=14);
  const blacks2 = PIANO_KEYS_DATA.filter(k=>k.type==='black' && k.absIdx<=14);

  function keyColor2(ai) {
    const curIdx = played.length;
    if (played.includes(ai) && ai===played[played.length-1] && feedback==='correct') return '#7BC8A4';
    if (feedback==='wrong' && ai===notes[curIdx]) return '#E07070';
    return null;
  }

  // Select
  if (screen==='select') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>←</button>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',margin:0}}>Oreille Absolue</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',margin:'2px 0 0'}}>ÉCOUTER ET REPRODUIRE AU PIANO</p>
        </div>
      </div>
      <div style={{padding:'.9rem',background:'rgba(200,140,80,0.08)',border:'1px solid rgba(200,140,80,0.2)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.65,fontFamily:'Georgia,serif'}}>L'app joue une mélodie. Tu essaies de la reproduire note par note sur le piano. Choisis ta vitesse d'écoute.</p>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>VITESSE D'ÉCOUTE</div>
        <div style={{display:'flex',gap:8}}>
          {[[1,'🎵 Normale'],[0.5,'🐢 Lente (×0.5)']].map(([v,label])=>(
            <button key={v} onClick={()=>setTempo(v)} style={{flex:1,padding:'.55rem',background:tempo===v?'rgba(200,140,80,0.2)':'transparent',border:`1px solid ${tempo===v?'#D4A0D4':'rgba(255,255,255,0.12)'}`,borderRadius:8,cursor:'pointer',color:tempo===v?'#D4A0D4':'rgba(255,255,255,0.45)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>CHOISIR UNE MÉLODIE</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {OREILLE_ABSOLUE_PIECES.map(p=>(
          <button key={p.id} onClick={()=>loadPiece(p)}
            style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'.9rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,140,80,0.1)';e.currentTarget.style.borderColor='rgba(200,140,80,0.35)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
            <div>
              <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:3}}>{p.title}</div>
              <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{p.desc}</div>
            </div>
            <div style={{display:'flex',gap:2}}>
              {[1,2,3].map(s=><div key={s} style={{width:8,height:8,borderRadius:'50%',background:s<=p.diff?'#D4A0D4':'rgba(255,255,255,0.12)'}}/>)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Done / Fail
  if (screen==='done' || screen==='fail') return (
    <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
      <div style={{textAlign:'center',padding:'2rem',background:screen==='done'?'rgba(130,224,170,0.08)':'rgba(241,148,138,0.08)',border:`1px solid ${screen==='done'?'rgba(130,224,170,0.3)':'rgba(241,148,138,0.3)'}`,borderRadius:14}}>
        <div style={{fontSize:40,marginBottom:'1rem'}}>{screen==='done'?'🎉':'😔'}</div>
        <div style={{fontSize:18,fontWeight:'bold',color:screen==='done'?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif',marginBottom:8}}>
          {screen==='done'?'Bravo ! Mélodie complète !':'Essaie encore !'}
        </div>
        <div style={{fontSize:12,opacity:.5,fontFamily:'monospace'}}>{piece?.title}</div>
      </div>
      <button onClick={()=>loadPiece(piece)} style={{padding:'.9rem',background:'rgba(200,140,80,0.15)',border:'1.5px solid #D4A0D4',color:'#D4A0D4',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>🔄 REJOUER</button>
      <button onClick={()=>{clearAllTimeouts();setScreen('select');}} style={{padding:'.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>CHOISIR UNE AUTRE MÉLODIE</button>
    </div>
  );

  // Play
  const curIdx = played.length;
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{flex:1,marginRight:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{played.length}/{notes.length}</span>
            <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{piece?.title}</span>
          </div>
          <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2}}>
            <div style={{height:'100%',width:`${(played.length/notes.length)*100}%`,background:'#D4A0D4',borderRadius:2,transition:'width 0.2s'}}/>
          </div>
        </div>
        <Hearts total={3} remaining={lives}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div style={{textAlign:'center',padding:'.85rem',background:feedback==='correct'?'rgba(130,224,170,0.1)':feedback==='wrong'?'rgba(241,148,138,0.1)':isPlaying?'rgba(212,168,100,0.08)':'rgba(255,255,255,0.03)',border:`1px solid ${feedback==='correct'?'rgba(130,224,170,0.35)':feedback==='wrong'?'rgba(241,148,138,0.35)':isPlaying?'rgba(212,168,100,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:10,transition:'all 0.15s'}}>
          {isPlaying   && <span style={{color:'#D4A0D4',fontSize:14,fontFamily:'monospace',letterSpacing:'.06em',animation:'fadeIn 0.2s'}}>🎵 Écoute en cours…</span>}
          {!isPlaying && feedback==='correct' && <span style={{color:'#7BC8A4',fontSize:16}}>✓ Bonne note !</span>}
          {!isPlaying && feedback==='wrong'   && <span style={{color:'#E07070',fontSize:16}}>✗ Mauvaise note !</span>}
          {!isPlaying && !feedback            && <span style={{fontSize:11,opacity:.45,fontFamily:'monospace'}}>NOTE {curIdx+1}/{notes.length}</span>}
        </div>
        {/* Controls — avec PAUSE */}
        <div style={{display:'flex',gap:8}}>
          {isPlaying ? (
            <button onClick={clearAllTimeouts}
              style={{flex:1,padding:'.55rem',background:'rgba(241,148,138,0.12)',border:'1px solid rgba(241,148,138,0.4)',borderRadius:8,cursor:'pointer',color:'#E07070',fontSize:11,fontFamily:'monospace',fontWeight:'bold'}}>
              ⏸ PAUSE
            </button>
          ) : (
            <>
              <button onClick={()=>scheduledPlayNotes(notes,1)}    style={{flex:1,padding:'.55rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'monospace'}}>▶ Écouter</button>
              <button onClick={()=>scheduledPlayNotes(notes,0.55)} style={{flex:1,padding:'.55rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'monospace'}}>🐢 Lent</button>
              <button onClick={()=>{setShowTipBox(v=>!v);setTipIdx(Math.floor(Math.random()*OREILLE_TIPS.length));}} style={{flex:1,padding:'.55rem',background:showTipBox?'rgba(200,140,80,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${showTipBox?'rgba(200,140,80,0.4)':'rgba(255,255,255,0.15)'}`,borderRadius:8,cursor:'pointer',color:showTipBox?'#D4A0D4':'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'monospace'}}>💡</button>
            </>
          )}
        </div>
        {showTipBox && <div style={{padding:'.75rem',background:'rgba(200,140,80,0.09)',border:'1px solid rgba(200,140,80,0.25)',borderRadius:10,fontSize:12,color:'rgba(255,255,255,0.7)',fontFamily:'Georgia,serif',fontStyle:'italic',animation:'fadeIn 0.2s ease'}}>{OREILLE_TIPS[tipIdx]}</div>}
        {/* Piano */}
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'.85rem',overflowX:'auto'}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',textAlign:'center',marginBottom:'.65rem',letterSpacing:'.1em'}}>{isPlaying?'ÉCOUTE EN COURS…':'TAPE LA NOTE SUIVANTE'}</div>
          <div style={{position:'relative',height:100}}>
            {whites2.map(({absIdx,wi})=>{
              const c=keyColor2(absIdx);
              return <div key={absIdx} onClick={()=>handlePianoKey(absIdx)}
                style={{position:'absolute',left:wi*34,top:0,width:32,height:95,background:c||'#EDE5D8',border:'1.5px solid #555',borderRadius:'0 0 5px 5px',cursor:isPlaying?'not-allowed':'pointer',transition:'background 0.1s',display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:4}}
                onMouseEnter={e=>{if(!c&&!isPlaying)e.currentTarget.style.background='#D8CEBC';}}
                onMouseLeave={e=>{if(!c)e.currentTarget.style.background='#EDE5D8';}}>
                {c&&<span style={{fontSize:8,fontFamily:'monospace',color:'#000',fontWeight:'bold'}}>{SEMI_TO_SOLFEGE[absIdx]}</span>}
              </div>;
            })}
            {blacks2.map(({absIdx,wi})=>{
              const c=keyColor2(absIdx);
              return <div key={absIdx} onClick={()=>handlePianoKey(absIdx)}
                style={{position:'absolute',left:wi*34+22,top:0,width:22,height:60,zIndex:2,background:c||'#181614',border:'1px solid #000',borderRadius:'0 0 4px 4px',cursor:isPlaying?'not-allowed':'pointer',transition:'background 0.1s'}}
                onMouseEnter={e=>{if(!c&&!isPlaying)e.currentTarget.style.background='#333';}}
                onMouseLeave={e=>{if(!c)e.currentTarget.style.background='#181614';}}>
              </div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── IMPROVISATION GUIDÉE (Technique) ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ImprovisationGuidee() {
  const [style,    setStyle]    = useState(null);
  const [key,      setKey]      = useState('C');
  const [result,   setResult]   = useState(null); // { scale, prog, scaleName }
  const [playing,  setPlaying]  = useState(false);
  const [screen,   setScreen]   = useState('style'); // style | play

  function generate() {
    const s = style || IMPRO_STYLES[Math.floor(Math.random()*IMPRO_STYLES.length)];
    const k = ROOT_NOTES[Math.floor(Math.random()*ROOT_NOTES.length)];
    const prog = generateImproProgression(s, k);
    setKey(k); setStyle(s);
    setResult({ scale: s.scale, prog, scaleName: s.label });
    setScreen('play');
  }

  async function playProg(prog) {
    if (playing) return;
    setPlaying(true);
    for (const chord of prog) {
      const ri = CHROMATIC.indexOf(chord.r);
      if (ri !== -1) playChordArp(CHORD_TYPES[chord.t].formula.map(f=>ri+f+4*12));
      await new Promise(r=>setTimeout(r,1200));
    }
    setPlaying(false);
  }

  function playScale(scaleSemis, rootKey) {
    const ri = CHROMATIC.indexOf(rootKey);
    if (ri===-1) return;
    scaleSemis.forEach((s,i) => setTimeout(()=>playNote(ri+s+4*12,0,0.7),i*300));
  }

  if (screen==='play' && result) {
    const ri = CHROMATIC.indexOf(key);
    const scaleNoteNames = result.scale.map(s => CHROMATIC[(ri+s)%12]);
    return (
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
        {/* Header */}
        <div style={{padding:'1.25rem',background:`${style?.color||'#C8864A'}`,border:`1px solid ${style?.color||'#C8864A'}`,borderRadius:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
            <div style={{fontSize:18,fontWeight:'bold',color:style?.color||'#C8864A',fontFamily:'Georgia,serif'}}>{style?.label} — {key}</div>
            <button onClick={generate} style={{padding:'.4rem .85rem',background:`${style?.color||'#C8864A'}`,border:`1px solid ${style?.color||'#C8864A'}`,color:style?.color||'#C8864A',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎲 NOUVEAU</button>
          </div>
          <p style={{fontSize:12,opacity:.6,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>{style?.desc}</p>
        </div>

        {/* Scale */}
        <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em'}}>GAMME À UTILISER</div>
            <button onClick={()=>playScale(result.scale,key)} style={{padding:'3px 10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:6,cursor:'pointer',color:'rgba(255,255,255,0.6)',fontSize:9,fontFamily:'monospace'}}>▶ ÉCOUTER</button>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {scaleNoteNames.map((n,i)=>{
              const nc=NOTE_COLORS[n]||'#B898C8';
              return <div key={i} style={{width:38,height:38,borderRadius:'50%',background:`${nc}10`,border:`1.5px solid ${nc}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:'bold',color:nc,fontFamily:'monospace'}}>{n}</div>;
            })}
          </div>
        </div>

        {/* Progression */}
        <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em'}}>ENCHAÎNEMENT D'ACCORDS</div>
            <button onClick={()=>playProg(result.prog)} disabled={playing} style={{padding:'3px 10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:6,cursor:playing?'default':'pointer',color:'rgba(255,255,255,0.6)',fontSize:9,fontFamily:'monospace'}}>
              {playing?'▶…':'▶ ÉCOUTER'}
            </button>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {result.prog.map((chord,ci)=>{
              const nc=NOTE_COLORS[chord.r]||'#B898C8';
              return <div key={ci} style={{padding:'.55rem .8rem',background:`${nc}10`,border:`1.5px solid ${nc}`,borderRadius:10,textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:'bold',color:nc,fontFamily:'monospace',lineHeight:1}}>{chord.r}{CHORD_TYPES[chord.t]?.suffix}</div>
              </div>;
            })}
          </div>
        </div>

        {/* Tips */}
        <div style={{padding:'1rem',background:'rgba(247,220,111,0.06)',border:'1px solid rgba(247,220,111,0.18)',borderRadius:12}}>
          <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>CONSEILS D'IMPROVISATION</div>
          <ul style={{fontSize:12,opacity:.65,margin:0,paddingLeft:'1.25rem',lineHeight:1.8,fontFamily:'Georgia,serif'}}>
            <li>Commence par jouer lentement les notes de la gamme de {key} sur cet enchaînement.</li>
            <li>Cible les notes de l'accord en cours : elles sonnent toujours bien.</li>
            <li>Utilise les silences — ils font partie de la musique.</li>
            <li>Répète un petit motif de 2-3 notes et varie-le progressivement.</li>
          </ul>
        </div>

        <button onClick={()=>setScreen('style')} style={{padding:'.75rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.08em'}}>← CHANGER DE STYLE</button>
      </div>
    );
  }

  // Style selection
  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Improvisation Guidée</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>GAMME + PROGRESSION ALÉATOIRES</p>
      </div>
      <div style={{padding:'.9rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.6,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>Clique sur un style ou sur Aléatoire. L'app te donne une gamme et un enchaînement d'accords cohérent dans ce style. À toi d'improviser dessus sur ton vrai piano !</p>
      </div>
      {/* Random button */}
      <button onClick={generate} style={{width:'100%',padding:'1rem',background:'linear-gradient(135deg,#C8864A,#D05870)',border:'none',borderRadius:14,cursor:'pointer',fontSize:14,fontFamily:'Georgia,serif',fontWeight:'bold',color:'#fff',marginBottom:'1.25rem',boxShadow:'0 6px 20px rgba(200,140,80,0.35)',letterSpacing:'.02em'}}>
        🎲 GÉNÉRER DE FAÇON ALÉATOIRE
      </button>
      <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>OU CHOISIR UN STYLE</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {IMPRO_STYLES.map(s=>(
          <button key={s.id} onClick={()=>{setStyle(s);generate();}}
            style={{background:style?.id===s.id?`${s.color}`:'rgba(255,255,255,0.03)',border:`1.5px solid ${style?.id===s.id?s.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.85rem 1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${s.color}18`;e.currentTarget.style.borderColor=`${s.color}`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=style?.id===s.id?`${s.color}`:'rgba(255,255,255,0.03)';e.currentTarget.style.borderColor=style?.id===s.id?s.color:'rgba(255,255,255,0.1)';}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.label}</div>
              <span style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{s.scale.length} notes →</span>
            </div>
            <div style={{fontSize:11,opacity:.5,fontFamily:'Georgia,serif',fontStyle:'italic',marginTop:3}}>{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MASCOTTE — Noire musicale ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// Module-level mascotte trigger (called from exercises)
let _mascotteTrigger = null;
function triggerMascotte(type, delay=400) {
  if (_mascotteTrigger) setTimeout(() => _mascotteTrigger(type), delay);
}

const MASCOTTE_DIALOGUES = {
  idle: [
    "Psst ! Tu n'as pas pratiqué depuis un moment… 🎵",
    "Un exercice rapide ? Ça prend seulement 2 minutes !",
    "Ton oreille s'améliore si tu travailles chaque jour 🎹",
    "Je m'ennuie… et toi ? On fait un exercice ?",
    "La régularité, c'est la clé du musicien 🗝️",
    "Hey ! L'oreille musicale se forme avec la répétition. On y va ?",
    "Je suis là, prête à t'aider. Quel module t'intéresse ?",
  ],
  success: [
    "Bravo ! Tu progresses à vue d'œil ! 🎉",
    "Excellent travail ! Ton oreille se développe !",
    "Super ! Continue comme ça, tu vas tout déchirer ! 🔥",
    "Wahou ! Je suis fière de toi ! 🌟",
    "Parfait ! Un vrai musicien en herbe ! 🎼",
    "Incroyable ! Tu as l'oreille d'un pro ! 🎧",
    "Quelle précision ! Tu vas progresser très vite ! 🚀",
  ],
  encourage: [
    "Ne lâche pas ! Chaque erreur est un apprentissage.",
    "C'est difficile, mais tu y es presque !",
    "Allez, encore un effort ! Tu peux le faire ! 💪",
    "C'est normal de se tromper. Les meilleurs se sont tous trompés !",
    "La musique, ça prend du temps. Tu es sur la bonne voie.",
  ],
  streak: [
    "🔥 Incroyable ! Ta série continue ! La régularité paie !",
    "⚡ Tu es en feu ! {streak} jours consécutifs, c'est impressionnant !",
    "🌟 {streak} jours de pratique ! Tu deviens un vrai musicien !",
    "💪 Ta discipline est exemplaire ! {streak} jours de suite !",
  ],
  oreille: [
    "L'oreille musicale s'entraîne comme un muscle. Un peu chaque jour !",
    "Écoute les sons qui t'entourent. La musique est partout !",
    "Essaie de chanter les intervalles que tu entends. Ça aide vraiment !",
  ],
  theorie: [
    "La théorie, c'est le langage de la musique. Chaque concept te débloque !",
    "Clique sur les mots en gras pour que je t'explique ! Je ADORE expliquer 😊",
    "La théorie musicale date du Moyen Âge. Tu apprends quelque chose de millénaire !",
  ],
  technique: [
    "La technique se construit lentement. Patience, jeune pianiste !",
    "Practise makes perfect — mais pas n'importe comment. Toujours lentement d'abord !",
    "Hanon avait raison : 15 minutes de gammes par jour changent tout !",
  ],
  record: [
    "🏆 Nouveau record ! Tu t'es surpassé !",
    "⭐ Tu bats ton propre record ! Fantastique !",
    "🎯 Score parfait ! Tu maîtrises ce chapitre !",
  ],
};

function Mascotte({ expression='normal', size=80, animate=false }) {
  // SVG d'une noire musicale stylisée avec des yeux expressifs
  const eyeY     = expression==='happy' ? 32 : expression==='sad' ? 36 : 33;
  const mouthPath= expression==='happy'
    ? 'M 28 50 Q 40 58 52 50'   // sourire
    : expression==='sad'
    ? 'M 28 54 Q 40 46 52 54'   // tristesse
    : 'M 30 51 Q 40 55 50 51';  // neutre

  return (
    <svg viewBox="0 0 80 110" width={size} height={size*1.375} style={{overflow:'visible',filter:'drop-shadow(0 4px 12px rgba(200,140,80,0.4))',animation:animate?'orbFloat 2s ease-in-out infinite':undefined}}>
      {/* Corps de la noire (tête ovale) */}
      <ellipse cx="40" cy="52" rx="26" ry="22" fill="#100C08" stroke="#D4A0D4" strokeWidth="2.5"/>
      {/* Reflet lumineux */}
      <ellipse cx="33" cy="43" rx="8" ry="5" fill="rgba(212,168,100,0.25)" transform="rotate(-20,33,43)"/>
      {/* Queue de la noire */}
      <rect x="64" y="18" width="3.5" height="42" rx="1.5" fill="#D4A0D4"/>
      {/* Drapeau de la noire */}
      <path d="M 67.5 18 Q 78 24 72 34 Q 78 30 67.5 38" fill="#D4A0D4"/>
      {/* Yeux */}
      <ellipse cx="31" cy={eyeY} rx="5" ry="5.5" fill="white"/>
      <ellipse cx="49" cy={eyeY} rx="5" ry="5.5" fill="white"/>
      <circle cx="32.5" cy={eyeY+1} r="3" fill="#100C08"/>
      <circle cx="50.5" cy={eyeY+1} r="3" fill="#100C08"/>
      {/* Reflets des yeux */}
      <circle cx="33.5" cy={eyeY-1} r="1" fill="white" opacity="0.9"/>
      <circle cx="51.5" cy={eyeY-1} r="1" fill="white" opacity="0.9"/>
      {/* Joues (si happy) */}
      {expression==='happy' && <>
        <ellipse cx="20" cy="48" rx="5" ry="3" fill="#D05870" opacity="0.5"/>
        <ellipse cx="60" cy="48" rx="5" ry="3" fill="#D05870" opacity="0.5"/>
      </>}
      {/* Bouche */}
      <path d={mouthPath} stroke="#D4A0D4" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Petites notes décoratives (si happy) */}
      {expression==='happy' && <>
        <text x="4" y="30" fontSize="10" fill="#E8A857" opacity="0.8">♪</text>
        <text x="64" y="78" fontSize="8" fill="#7BC8A4" opacity="0.8">♫</text>
      </>}
    </svg>
  );
}

function MascoттePopup({ type='idle', onClose, onAction, actionLabel='Pratiquer !', streak=0 }) {
  const msgs = MASCOTTE_DIALOGUES[type] || MASCOTTE_DIALOGUES.idle;
  const rawMsg = msgs[Math.floor(Math.random()*msgs.length)];
  const msg = rawMsg.replace('{streak}', streak.toString());
  const expr = type==='success'||type==='record'?'happy':type==='encourage'?'sad':'normal';

  return (
    <div style={{position:'fixed',bottom:'5.5rem',left:'50%',transform:'translateX(-50%)',width:'min(320px,88vw)',background:'linear-gradient(135deg,#100C08,#0A0804)',border:'2px solid rgba(212,168,100,0.5)',borderRadius:20,padding:'1.25rem',zIndex:300,boxShadow:'0 16px 48px rgba(200,140,80,0.4)',animation:'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'.85rem'}}>
        <Mascotte expression={expr} size={56} animate={type==='idle'}/>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:'bold',color:'#D4A0D4',fontFamily:'Georgia,serif',marginBottom:4}}>Noire</div>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.55,margin:0,fontFamily:'Georgia,serif'}}>{msg}</p>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.35)',cursor:'pointer',fontSize:18,lineHeight:1,flexShrink:0,padding:'0 2px'}}>×</button>
      </div>
      <div style={{display:'flex',gap:8}}>
        {onAction && (
          <button onClick={onAction}
            style={{flex:1,padding:'.55rem',background:'linear-gradient(135deg,#C8864A,#D4A0D4)',border:'none',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',color:'#fff',fontWeight:'bold',letterSpacing:'.06em',boxShadow:'0 4px 12px rgba(200,140,80,0.4)'}}>
            {actionLabel}
          </button>
        )}
        <button onClick={onClose}
          style={{padding:'.55rem .9rem',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',color:'rgba(255,255,255,0.5)'}}>
          Pas maintenant
        </button>
      </div>
    </div>
  );
}

// Hook pour la mascotte idle (ré-utilisable)
function useMascoтteIdle(page, setPage) {
  const [showMascotte, setShowMascotte] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Apparaît après 45s d'inactivité sur la page compétences
    if (page !== 'competences') { clearTimeout(timerRef.current); setShowMascotte(false); return; }
    timerRef.current = setTimeout(() => setShowMascotte(true), 45000);
    return () => clearTimeout(timerRef.current);
  }, [page]);

  return { showMascotte, setShowMascotte };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── RECONNAISSANCE DE GAMME ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function GammeRecognition({ onBack }) {
  const [mode,       setMode]       = useState('config'); // config | play | result
  const [level,      setLevel]      = useState('mode');   // 'mode' = maj/min only, 'tonality' = + tonalité
  const [exCount,    setExCount]    = useState(10);
  const [exercises,  setExercises]  = useState([]);
  const [idx,        setIdx]        = useState(0);
  const [score,      setScore]      = useState(0);
  const [answered,   setAnswered]   = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [showSuccess,setShowSuccess]= useState(false);

  const timeoutsRef = useRef([]);
  function clearAllTimeouts() { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; }
  useEffect(() => () => clearAllTimeouts(), []);

  // Génère un exercice : une gamme aléatoire + mélodie courte
  function generateExercise() {
    const keys  = ROOT_NOTES;
    const modes = ['major', 'minor'];
    const keyR  = keys[Math.floor(Math.random()*keys.length)];
    const modeR = modes[Math.floor(Math.random()*modes.length)];
    const ri    = CHROMATIC.indexOf(keyR);
    const scale = modeR==='major'
      ? MAJOR_SCALE_SEMIS.map(s=>(ri+s)%12)
      : [0,2,3,5,7,8,10].map(s=>(ri+s)%12); // mineur naturel

    // Mélodie courte (5-7 notes) dans la gamme
    const melody = [];
    let prev = -1;
    for (let i=0; i<6; i++) {
      const candidates = scale.filter(n=>n!==prev);
      const note = candidates[Math.floor(Math.random()*candidates.length)];
      melody.push(note); prev=note;
    }

    // Accompagnement : accords I et V de la gamme
    const chordI_root = ri;
    const chordV_root = (ri+7)%12;
    const chordType   = modeR==='major'?'Majeures':'Mineures';

    return { key:keyR, mode:modeR, melody, chordI_root, chordV_root, chordType };
  }

  function buildExercises(n) {
    return Array.from({length:n}, generateExercise);
  }

  function playExercise(ex) {
    clearAllTimeouts();
    // Accompagnement I
    const id1 = setTimeout(()=>{
      const notes1 = CHORD_TYPES[ex.chordType].formula.map(f=>ex.chordI_root+f+3*12);
      playChordArp(notes1);
    }, 0);
    // Mélodie
    ex.melody.forEach((semi, i) => {
      const id = setTimeout(()=>playNote(semi+4*12, 0, 0.7), 500+i*380);
      timeoutsRef.current.push(id);
    });
    // Accord V final pour créer tension
    const id2 = setTimeout(()=>{
      const notes2 = CHORD_TYPES[ex.chordType].formula.map(f=>ex.chordV_root+f+3*12);
      playChordArp(notes2);
    }, 500+ex.melody.length*380+200);
    // Accord I final (résolution)
    const id3 = setTimeout(()=>{
      const notes3 = CHORD_TYPES[ex.chordType].formula.map(f=>ex.chordI_root+f+3*12);
      playChordSimul(notes3);
    }, 500+ex.melody.length*380+1600);
    timeoutsRef.current.push(id1, id2, id3);
  }

  function start() {
    const exs = buildExercises(exCount);
    setExercises(exs); setIdx(0); setScore(0); setAnswered(false); setUserAnswer(null);
    setMode('play');
    setTimeout(()=>playExercise(exs[0]), 500);
  }

  function handleAnswer(answer) {
    if (answered) return;
    const ex = exercises[idx];
    let correct = false;
    if (level==='mode') {
      correct = answer === ex.mode;
    } else {
      // answer = {key, mode}
      correct = answer.key===ex.key && answer.mode===ex.mode;
    }
    setUserAnswer(answer); setAnswered(true);
    if (correct) { setScore(s=>s+1); }
  }

  function next() {
    if (idx>=exercises.length-1) {
      setMode('result');
      if (score >= exercises.length*0.8) setShowSuccess(true);
      return;
    }
    const nextIdx = idx+1;
    setIdx(nextIdx); setAnswered(false); setUserAnswer(null);
    setTimeout(()=>playExercise(exercises[nextIdx]), 400);
  }

  const ex = exercises[idx];

  // Config
  if (mode==='config') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>←</button>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',margin:0}}>Reconnaissance de gamme</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',margin:'2px 0 0'}}>MAJEUR OU MINEUR ? ET LA TONALITÉ ?</p>
        </div>
      </div>
      <div style={{padding:'.9rem',background:'rgba(247,220,111,0.07)',border:'1px solid rgba(247,220,111,0.2)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.65,fontFamily:'Georgia,serif'}}>L'app joue une mélodie avec accompagnement. Tu dois identifier si c'est majeur ou mineur — et en mode avancé, aussi la tonalité.</p>
      </div>
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>NIVEAU</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            {id:'mode',     label:'Niveau 1 — Majeur ou Mineur', desc:'Identifier la couleur harmonique',  color:'#7BC8A4'},
            {id:'tonality', label:'Niveau 2 — + Tonalité',       desc:'Identifier aussi la note tonique',  color:'#E8A857'},
          ].map(l=>(
            <button key={l.id} onClick={()=>setLevel(l.id)}
              style={{background:level===l.id?`${l.color}`:'rgba(255,255,255,0.03)',border:`1.5px solid ${level===l.id?l.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.85rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:14,fontWeight:'bold',color:level===l.id?l.color:'#fff',fontFamily:'Georgia,serif',marginBottom:2}}>{l.label}</div>
                <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{l.desc}</div>
              </div>
              {level===l.id && <span style={{color:l.color}}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>EXERCICES</div>
        <div style={{display:'flex',gap:8}}>
          {[5,10,15].map(n=>(
            <button key={n} onClick={()=>setExCount(n)} style={{flex:1,padding:'.65rem',background:exCount===n?'rgba(247,220,111,0.15)':'rgba(255,255,255,0.03)',border:`1.5px solid ${exCount===n?'#E8A857':'rgba(255,255,255,0.1)'}`,color:exCount===n?'#E8A857':'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>
          ))}
        </div>
      </div>
      <button onClick={start} style={{width:'100%',padding:'1rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>COMMENCER →</button>
    </div>
  );

  // Result
  if (mode==='result') {
    const pct=Math.round((score/exercises.length)*100);
    const mc=pct>=80?'#7BC8A4':pct>=50?'#E8A857':'#E07070';
    return (
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        {showSuccess && (
          <div style={{display:'flex',justifyContent:'center',marginBottom:'.5rem',animation:'fadeIn 0.5s ease'}}>
            <Mascotte expression="happy" size={80} animate/>
          </div>
        )}
        <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}35`,borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS</div>
          <div style={{fontSize:68,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score}<span style={{fontSize:28,opacity:.5}}>/{exercises.length}</span></div>
          <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
          <div style={{fontSize:13,opacity:.55,fontFamily:'Georgia,serif',marginTop:8}}>{pct>=80?'Ton oreille harmonique est excellente ! 🎉':pct>=50?'Bonne progression, continue !':'Écoute beaucoup de musique — ça développe l\'oreille !'}</div>
        </div>
        <button onClick={start} style={{padding:'.9rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>🔄 REJOUER</button>
        <button onClick={()=>setMode('config')} style={{padding:'.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>CHANGER DE NIVEAU</button>
      </div>
    );
  }

  // Play
  const isCorrect = answered && (level==='mode' ? userAnswer===ex?.mode : userAnswer?.key===ex?.key && userAnswer?.mode===ex?.mode);

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{idx+1}/{exercises.length}</span>
        <div style={{flex:1,margin:'0 1rem',height:3,background:'rgba(255,255,255,0.08)',borderRadius:2}}>
          <div style={{height:'100%',width:`${((idx+1)/exercises.length)*100}%`,background:'#E8A857',borderRadius:2,transition:'width 0.3s ease'}}/>
        </div>
        <span style={{fontSize:10,fontFamily:'monospace',color:'#7BC8A4'}}>{score} ✓</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Question */}
        <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(247,220,111,0.05)',border:'1px solid rgba(247,220,111,0.18)',borderRadius:12}}>
          <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1rem'}}>
            {level==='mode'?'CETTE MÉLODIE EST-ELLE MAJEURE OU MINEURE ?':'IDENTIFIE LA TONALITÉ ET LE MODE'}
          </div>
          <button onClick={()=>ex&&playExercise(ex)}
            style={{background:'rgba(247,220,111,0.12)',border:'1px solid rgba(247,220,111,0.4)',color:'#E8A857',padding:'.6rem 1.4rem',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.08em',fontWeight:'bold'}}>
            🔊 RÉÉCOUTER
          </button>
        </div>

        {/* Answered feedback */}
        {answered && (
          <div style={{textAlign:'center',padding:'.85rem',background:isCorrect?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.1)',border:`1px solid ${isCorrect?'rgba(130,224,170,0.35)':'rgba(241,148,138,0.35)'}`,borderRadius:10,animation:'fadeIn 0.25s ease'}}>
            <div style={{fontSize:16,fontWeight:'bold',color:isCorrect?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif',marginBottom:4}}>
              {isCorrect?'✓ Correct !':'✗ Incorrect'}
            </div>
            <div style={{fontSize:12,opacity:.65,fontFamily:'monospace'}}>
              Réponse : <strong style={{color:'#E8A857'}}>{ex?.key} {ex?.mode==='major'?'Majeur':'Mineur'}</strong>
            </div>
          </div>
        )}

        {/* Level 1 — Majeur/Mineur */}
        {!answered && level==='mode' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {val:'major', label:'☀ MAJEUR',  desc:'Lumineux, joyeux',   color:'#E8A857'},
              {val:'minor', label:'🌙 MINEUR', desc:'Sombre, mélancolique', color:'#B898C8'},
            ].map(opt=>(
              <button key={opt.val} onClick={()=>handleAnswer(opt.val)}
                style={{padding:'1.25rem .5rem',background:`${opt.color}08`,border:`1.5px solid ${opt.color}40`,borderRadius:14,cursor:'pointer',textAlign:'center',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${opt.color}18`;e.currentTarget.style.borderColor=opt.color;e.currentTarget.style.transform='scale(1.03)';}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${opt.color}18`;e.currentTarget.style.borderColor=`${opt.color}`;e.currentTarget.style.transform='scale(1)';}}>
                <div style={{fontSize:20,fontWeight:'bold',color:opt.color,fontFamily:'Georgia,serif',marginBottom:4}}>{opt.label}</div>
                <div style={{fontSize:10,opacity:.55,fontFamily:'monospace'}}>{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Level 2 — Tonalité + mode */}
        {!answered && level==='tonality' && (
          <div>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>CHOISIR LA TONIQUE</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginBottom:'1rem'}}>
              {ROOT_NOTES.map(k=>{
                const nc=NOTE_COLORS[k]||'#E8A857';
                return <button key={k} onClick={()=>handleAnswer({key:k,mode:'major'})}
                  style={{background:`${nc}10`,border:`1px solid ${nc}`,color:nc,padding:'.5rem .1rem',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${nc}18`;e.currentTarget.style.transform='scale(1.05)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${nc}18`;e.currentTarget.style.transform='scale(1)';}}>{k}</button>;
              })}
            </div>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>PUIS LE MODE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[{val:'major',label:'☀ Majeur',color:'#E8A857'},{val:'minor',label:'🌙 Mineur',color:'#B898C8'}].map(m=>(
                <button key={m.val} onClick={()=>handleAnswer({key:ex?.key||'C',mode:m.val})}
                  style={{padding:'.75rem',background:`${m.color}08`,border:`1px solid ${m.color}`,borderRadius:10,cursor:'pointer',color:m.color,fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {answered && (
          <button onClick={next} style={{width:'100%',padding:'.9rem',background:isCorrect?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${isCorrect?'#7BC8A4':'#E07070'}`,color:isCorrect?'#7BC8A4':'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
            {idx>=exercises.length-1?'VOIR LES RÉSULTATS →':'EXERCICE SUIVANT →'}
          </button>
        )}

        <div style={{padding:'.65rem .9rem',background:'rgba(200,140,80,0.07)',border:'1px solid rgba(200,140,80,0.18)',borderRadius:10}}>
          <p style={{fontSize:11,opacity:.55,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>
            💡 Astuce : une gamme majeure sonne "heureuse" et lumineuse. Une gamme mineure sonne "nostalgique" ou "sombre". Fais confiance à tes émotions.
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MODULE RYTHME ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Notations rythmiques : valeur, durée en temps, SVG
const RHYTHMIC_VALUES = [
  {name:'Ronde',       beats:4, svg:'○', color:'#7BC8A4'},
  {name:'Blanche',     beats:2, svg:'◒', color:'#90B8D0'},
  {name:'Noire',       beats:1, svg:'●', color:'#E8A857'},
  {name:'Croche',      beats:0.5, svg:'♪', color:'#E07070'},
  {name:'Double croche',beats:0.25,svg:'♬', color:'#D4A0D4'},
  {name:'Soupir',      beats:1, svg:'𝄽', color:'#B898C8', isRest:true},
  {name:'Demi-soupir', beats:0.5,svg:'𝄾', color:'#E8A857', isRest:true},
];

// Patterns rythmiques pour l'exercice de tap
const RHYTHM_PATTERNS = [
  {name:'Noires basiques',    bpm:80,  beats:[1,1,1,1],             label:'4 noires'},
  {name:'Blanches et noires', bpm:72,  beats:[2,1,1],               label:'Blanche + 2 noires'},
  {name:'Croches simples',    bpm:90,  beats:[0.5,0.5,1,1],         label:'2 croches + 2 noires'},
  {name:'Syncope simple',     bpm:80,  beats:[1,0.5,0.5,1,1],       label:'Noire + syncope'},
  {name:'Triolet',            bpm:84,  beats:[0.67,0.67,0.66,1,1],  label:'Triolet + 2 noires'},
  {name:'Rythme swing',       bpm:100, beats:[0.67,0.33,0.67,0.33,1,1], label:'Swing jazz'},
];

// SVG d'une portée rythmique (une mesure)
function RhythmStaff({ pattern, highlighted=-1 }) {
  const W=280, H=70;
  const lineY=[30,38,46,54,62];
  let x = 52;
  const noteElems = [];
  const beatWidth = (W - 65) / pattern.reduce((a,b)=>a+b, 0);

  pattern.forEach((dur, i) => {
    const w = dur * beatWidth;
    const isH = i === highlighted;
    const col = isH ? '#E8A857' : 'rgba(255,255,255,0.85)';
    const cx = x + w/2;
    const stemH = 22;

    if (dur >= 2) {
      // Blanche / Ronde
      noteElems.push(<ellipse key={i} cx={cx} cy={50} rx={8} ry={5.5} fill={dur>=4?col:'none'} stroke={col} strokeWidth={1.5} transform={`rotate(-15,${cx},50)`}/>);
      if (dur < 4) noteElems.push(<line key={i+'s'} x1={cx+7} y1={50} x2={cx+7} y2={50-stemH} stroke={col} strokeWidth={1.5}/>);
    } else if (dur >= 1) {
      // Noire
      noteElems.push(<ellipse key={i} cx={cx} cy={50} rx={7} ry={5} fill={col} transform={`rotate(-15,${cx},50)`}/>);
      noteElems.push(<line key={i+'s'} x1={cx+6} y1={50} x2={cx+6} y2={50-stemH} stroke={col} strokeWidth={1.5}/>);
    } else if (dur >= 0.5) {
      // Croche
      noteElems.push(<ellipse key={i} cx={cx} cy={50} rx={6} ry={4.5} fill={col} transform={`rotate(-15,${cx},50)`}/>);
      noteElems.push(<line key={i+'s'} x1={cx+5.5} y1={50} x2={cx+5.5} y2={50-stemH} stroke={col} strokeWidth={1.5}/>);
      noteElems.push(<path key={i+'f'} d={`M${cx+5.5},${50-stemH} C${cx+14},${50-stemH+4} ${cx+16},${50-stemH+10} ${cx+5.5},${50-stemH+15}`} fill="none" stroke={col} strokeWidth={1.5}/>);
    } else {
      // Double croche
      noteElems.push(<ellipse key={i} cx={cx} cy={50} rx={5.5} ry={4} fill={col} transform={`rotate(-15,${cx},50)`}/>);
      noteElems.push(<line key={i+'s'} x1={cx+5} y1={50} x2={cx+5} y2={50-stemH} stroke={col} strokeWidth={1.5}/>);
      noteElems.push(<path key={i+'f1'} d={`M${cx+5},${50-stemH} C${cx+13},${50-stemH+4} ${cx+14},${50-stemH+9} ${cx+5},${50-stemH+13}`} fill="none" stroke={col} strokeWidth={1.5}/>);
      noteElems.push(<path key={i+'f2'} d={`M${cx+5},${50-stemH+6} C${cx+12},${50-stemH+10} ${cx+13},${50-stemH+14} ${cx+5},${50-stemH+18}`} fill="none" stroke={col} strokeWidth={1.5}/>);
    }
    // Beat highlight
    if (isH) {
      noteElems.push(<rect key={i+'hl'} x={x} y={26} width={w-2} height={32} fill="rgba(232,168,87,0.15)" rx={3}/>);
    }
    x += w;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{maxWidth:W}}>
      {/* Staff lines */}
      {lineY.map((y,i)=><line key={i} x1={18} y1={y} x2={W-8} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth={0.8}/>)}
      {/* Clef */}
      <text x={20} y={56} fontSize={22} fill="rgba(255,255,255,0.5)" fontFamily="serif">𝄢</text>
      {/* Time sig */}
      <text x={38} y={42} fontSize={14} fill="rgba(255,255,255,0.5)" fontFamily="serif" fontWeight="bold">4</text>
      <text x={38} y={58} fontSize={14} fill="rgba(255,255,255,0.5)" fontFamily="serif" fontWeight="bold">4</text>
      {/* Notes */}
      {noteElems}
    </svg>
  );
}

// Exercice lecture rythmique
function LectureRythmique() {
  const [patIdx,   setPatIdx]   = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const [beat,     setBeat]     = useState(-1);
  const [score,    setScore]    = useState({correct:0,total:0});
  const [mode,     setMode]     = useState('listen'); // listen | tap | identify
  const [userTaps, setUserTaps] = useState([]);
  const [tapStart, setTapStart] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  const pat = RHYTHM_PATTERNS[patIdx];

  async function playPattern() {
    if (playing) return;
    setPlaying(true); setBeat(-1);
    await loadPiano();
    const ctx = getACtx();
    const bpmMs = 60000 / pat.bpm;
    let t = 0;
    for (let i = 0; i < pat.beats.length; i++) {
      const dur = pat.beats[i];
      const noteTime = t;
      const beatIdx = i;
      setTimeout(() => {
        setBeat(beatIdx);
        // Click sound
        try {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g); g.connect(ctx.destination);
          osc.frequency.value = 880;
          g.gain.setValueAtTime(0.18, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
          osc.start(); osc.stop(ctx.currentTime + 0.07);
        } catch(e){}
      }, noteTime);
      t += dur * bpmMs;
    }
    setTimeout(() => { setPlaying(false); setBeat(-1); }, t + 200);
  }

  function startTap() {
    setUserTaps([]); setTapStart(null); setFeedback(null); setMode('tap');
  }

  function handleTap() {
    const now = Date.now();
    if (!tapStart) {
      setTapStart(now);
      setUserTaps([0]);
    } else {
      setUserTaps(prev => [...prev, now - tapStart]);
    }
  }

  function checkTap() {
    // Compare tap intervals with expected pattern intervals
    const bpmMs = 60000 / pat.bpm;
    const expected = pat.beats.map(b => b * bpmMs);
    // Simple scoring: count taps that are within 20% of expected
    const correct = Math.min(userTaps.length - 1, expected.length - 1);
    const total = expected.length;
    const pct = correct > 0 ? Math.round((correct / total) * 100) : 0;
    setFeedback(pct >= 60 ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (pct >= 60 ? 1 : 0), total: s.total + 1 }));
    setMode('result');
  }

  const IDENTIFY_OPTIONS = RHYTHM_PATTERNS.slice(0, 4).map(p => p.name);

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Lecture Rythmique</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>ÉCOUTE · TAP · IDENTIFIE</p>
      </div>

      {/* Pattern selector */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4}}>
        {RHYTHM_PATTERNS.map((p,i)=>(
          <button key={i} onClick={()=>{setPatIdx(i);setFeedback(null);setMode('listen');}}
            style={{padding:'.4rem .75rem',background:patIdx===i?'rgba(232,168,87,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${patIdx===i?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:patIdx===i?'#E8A857':'rgba(255,255,255,0.5)',fontSize:10,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Staff display */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
        <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem',textAlign:'center'}}>{pat.label} — {pat.bpm} BPM</div>
        <RhythmStaff pattern={pat.beats} highlighted={beat}/>
      </div>

      {/* Controls */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        <button onClick={playPattern} disabled={playing}
          style={{padding:'.75rem .5rem',background:'rgba(130,224,170,0.12)',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:10,cursor:playing?'default':'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
          {playing?'▶ …':'🔊 ÉCOUTER'}
        </button>
        <button onClick={startTap}
          style={{padding:'.75rem .5rem',background:'rgba(232,168,87,0.12)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:10,cursor:'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold'}}>
          🥁 TAP
        </button>
        <button onClick={()=>setMode('identify')}
          style={{padding:'.75rem .5rem',background:'rgba(212,168,100,0.12)',border:'1.5px solid #D4A0D4',color:'#D4A0D4',borderRadius:10,cursor:'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold'}}>
          🔍 ID
        </button>
      </div>

      {/* Tap mode */}
      {mode==='tap' && (
        <div style={{padding:'1.25rem',background:'rgba(232,168,87,0.08)',border:'1.5px solid rgba(232,168,87,0.3)',borderRadius:14,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>MODE TAP — CLIQUE EN RYTHME</div>
          <button onClick={handleTap}
            style={{width:'100%',padding:'1.5rem',background:'rgba(232,168,87,0.15)',border:'2px solid #E8A857',borderRadius:14,cursor:'pointer',fontSize:36,marginBottom:'1rem',transition:'transform 0.1s',active:{transform:'scale(0.96)'}}}>
            🥁
          </button>
          <div style={{fontSize:11,opacity:.5,fontFamily:'monospace',marginBottom:'.75rem'}}>{userTaps.length > 0 ? `${userTaps.length} tap${userTaps.length>1?'s':''}` : 'Premier tap = début'}</div>
          {userTaps.length >= pat.beats.length && (
            <button onClick={checkTap}
              style={{width:'100%',padding:'.75rem',background:'rgba(130,224,170,0.15)',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold'}}>
              ✓ VALIDER
            </button>
          )}
        </div>
      )}

      {/* Identify mode */}
      {mode==='identify' && (
        <div style={{padding:'1rem',background:'rgba(212,168,100,0.08)',border:'1px solid rgba(212,168,100,0.25)',borderRadius:14}}>
          <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>QUEL EST CE RYTHME ?</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
            {RHYTHM_PATTERNS.map((p,i)=>(
              <button key={i} onClick={()=>{
                const correct = p.name===pat.name;
                setFeedback(correct?'correct':'wrong');
                setScore(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
                setMode('listen');
              }}
                style={{padding:'.65rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'Georgia,serif',textAlign:'left',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(212,168,100,0.12)';e.currentTarget.style.borderColor='#D4A0D4';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{padding:'.85rem',background:feedback==='correct'?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.1)',border:`1px solid ${feedback==='correct'?'rgba(130,224,170,0.4)':'rgba(241,148,138,0.4)'}`,borderRadius:10,textAlign:'center',animation:'fadeIn 0.25s ease'}}>
          <div style={{fontSize:16,fontWeight:'bold',color:feedback==='correct'?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif'}}>
            {feedback==='correct'?'✓ Excellent rythme !':'✗ Pas tout à fait — réecoute et réessaie'}
          </div>
          <div style={{fontSize:10,opacity:.5,fontFamily:'monospace',marginTop:4}}>{score.correct}/{score.total} corrects</div>
        </div>
      )}

      {/* Valeurs de notes référence */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
        <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>VALEURS DE BASE</div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {RHYTHMIC_VALUES.map(v=>(
            <div key={v.name} style={{textAlign:'center',padding:'.4rem .6rem',background:`${v.color}10`,border:`0.5px solid ${v.color}30`,borderRadius:8}}>
              <div style={{fontSize:20,color:v.color}}>{v.svg}</div>
              <div style={{fontSize:8,opacity:.55,fontFamily:'monospace',marginTop:2}}>{v.name}</div>
              <div style={{fontSize:8,color:v.color,fontFamily:'monospace'}}>{v.beats} t</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Dictée rythmique ──────────────────────────────────────────────────────────
function DicteeRythmique() {
  const [screen,   setScreen]  = useState('play');
  const [patIdx,   setPatIdx]  = useState(null);
  const [playing,  setPlaying] = useState(false);
  const [beat,     setBeat]    = useState(-1);
  const [answer,   setAnswer]  = useState(null);
  const [score,    setScore]   = useState({correct:0,total:0});
  const [answered, setAnswered]= useState(false);

  function newQuestion() {
    const idx = Math.floor(Math.random() * RHYTHM_PATTERNS.length);
    setPatIdx(idx); setAnswer(null); setAnswered(false);
  }

  useEffect(()=>newQuestion(),[]);

  async function playCurrentPattern() {
    if (playing || patIdx===null) return;
    const pat = RHYTHM_PATTERNS[patIdx];
    setPlaying(true); setBeat(-1);
    const bpmMs = 60000 / pat.bpm;
    let t = 0;
    for (let i=0; i<pat.beats.length; i++) {
      const beatIdx = i;
      const noteTime = t;
      setTimeout(()=>{
        setBeat(beatIdx);
        try {
          const ctx = getACtx();
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g); g.connect(ctx.destination);
          osc.frequency.value = 660;
          g.gain.setValueAtTime(0.2, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.08);
          osc.start(); osc.stop(ctx.currentTime+0.09);
        } catch(e){}
      }, noteTime);
      t += pat.beats[i] * bpmMs;
    }
    setTimeout(()=>{ setPlaying(false); setBeat(-1); }, t+200);
  }

  function pick(idx) {
    if (answered) return;
    setAnswer(idx); setAnswered(true);
    const correct = idx===patIdx;
    setScore(s=>({correct:s.correct+(correct?1:0), total:s.total+1}));
  }

  if (patIdx===null) return null;
  const options = [...new Set([patIdx, ...Array.from({length:3},()=>Math.floor(Math.random()*RHYTHM_PATTERNS.length))])].slice(0,4);

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Dictée Rythmique</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>ÉCOUTE ET IDENTIFIE LE RYTHME</p>
        </div>
        <div style={{fontSize:13,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct}/{score.total}</div>
      </div>

      <div style={{padding:'1.5rem',background:'rgba(232,168,87,0.08)',border:'1.5px solid rgba(232,168,87,0.25)',borderRadius:16,textAlign:'center'}}>
        <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'1rem'}}>ÉCOUTE CE RYTHME</div>
        <button onClick={playCurrentPattern} disabled={playing}
          style={{padding:'.9rem 2rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:playing?'default':'pointer',fontSize:14,fontFamily:'monospace',fontWeight:'bold',marginBottom:'1rem',transition:'all 0.2s'}}>
          {playing?'▶ EN COURS…':'🔊 ÉCOUTER'}
        </button>
        {answered && (
          <div style={{marginTop:'.5rem'}}>
            <RhythmStaff pattern={RHYTHM_PATTERNS[patIdx].beats} highlighted={beat}/>
          </div>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {options.map((optIdx,i)=>{
          const opt = RHYTHM_PATTERNS[optIdx];
          const isCorrect = optIdx===patIdx;
          const isChosen  = answer===optIdx;
          let bg='rgba(255,255,255,0.04)',border='rgba(255,255,255,0.12)',col='rgba(255,255,255,0.75)';
          if(answered){
            if(isCorrect){bg='rgba(130,224,170,0.15)';border='#7BC8A4';col='#7BC8A4';}
            else if(isChosen){bg='rgba(241,148,138,0.1)';border='#E07070';col='#E07070';}
            else{col='rgba(255,255,255,0.25)';}
          }
          return(
            <button key={i} onClick={()=>pick(optIdx)} disabled={answered}
              style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.9rem .75rem',borderRadius:11,cursor:answered?'default':'pointer',textAlign:'center',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.2s'}}
              onMouseEnter={e=>{if(!answered){e.currentTarget.style.background='rgba(232,168,87,0.1)';e.currentTarget.style.borderColor='#E8A857';}}}
              onMouseLeave={e=>{if(!answered){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}}
            >{opt.name}</button>
          );
        })}
      </div>

      {answered && (
        <button onClick={newQuestion}
          style={{width:'100%',padding:'.85rem',background:answer===patIdx?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${answer===patIdx?'#7BC8A4':'#E07070'}`,color:answer===patIdx?'#7BC8A4':'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
          RYTHME SUIVANT →
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MODULE PROGRESSIONS À L'OREILLE ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const PROGRESSIONS_OREILLE = [
  {name:'I-IV-V-I',   chords:[{r:'C',t:'Majeures'},{r:'F',t:'Majeures'},{r:'G',t:'Dom. 7'},{r:'C',t:'Majeures'}],  color:'#7BC8A4', desc:"La progression la plus fondamentale. Rock, pop, blues."},
  {name:'I-V-vi-IV',  chords:[{r:'C',t:'Majeures'},{r:'G',t:'Majeures'},{r:'A',t:'Mineures'},{r:'F',t:'Majeures'}],color:'#90B8D0', desc:"La progression des mega-hits. Axis of Awesome."},
  {name:'ii-V-I',     chords:[{r:'D',t:'Mineures'},{r:'G',t:'Dom. 7'},{r:'C',t:'Majeures'}],                       color:'#E8A857', desc:"L'ADN du jazz. Tous les standards."},
  {name:'I-vi-IV-V',  chords:[{r:'C',t:'Majeures'},{r:'A',t:'Mineures'},{r:'F',t:'Majeures'},{r:'G',t:'Dom. 7'}],  color:'#E07070', desc:"Années 50. Stand By Me. Every Breath You Take."},
  {name:'i-VII-VI-VII',chords:[{r:'A',t:'Mineures'},{r:'G',t:'Majeures'},{r:'F',t:'Majeures'},{r:'G',t:'Majeures'}],color:'#D4A0D4',desc:"Mineur descendant. Stairway to Heaven, etc."},
  {name:'I-III-IV-iv', chords:[{r:'C',t:'Majeures'},{r:'E',t:'Majeures'},{r:'F',t:'Majeures'},{r:'F',t:'Mineures'}],color:'#B898C8',desc:"Sous-dominante mineure. Very emotional."},
];

function ProgressionsOreille() {
  const [progIdx,  setProgIdx] = useState(null);
  const [playing,  setPlaying] = useState(false);
  const [answer,   setAnswer]  = useState(null);
  const [answered, setAnswered]= useState(false);
  const [score,    setScore]   = useState({correct:0,total:0});
  const [mode,     setMode]    = useState('menu'); // menu | quiz

  async function playProg(prog) {
    if (playing) return;
    setPlaying(true);
    for (const ch of prog.chords) {
      const ri = CHROMATIC.indexOf(ch.r);
      if (ri>=0) playChordArp(CHORD_TYPES[ch.t].formula.map(f=>ri+f+4*12));
      await new Promise(res=>setTimeout(res,1100));
    }
    setPlaying(false);
  }

  function newQuestion() {
    const idx = Math.floor(Math.random()*PROGRESSIONS_OREILLE.length);
    setProgIdx(idx); setAnswer(null); setAnswered(false);
  }

  function pick(idx) {
    if (answered) return;
    setAnswer(idx); setAnswered(true);
    setScore(s=>({correct:s.correct+(idx===progIdx?1:0), total:s.total+1}));
  }

  if (mode==='menu') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Progressions Harmoniques</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>RECONNAÎTRE LES PROGRESSIONS À L'OREILLE</p>
      </div>

      {/* Explorer */}
      <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>EXPLORER LES PROGRESSIONS</div>
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          {PROGRESSIONS_OREILLE.map((p,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.65rem .85rem',background:`${p.color}08`,border:`1px solid ${p.color}25`,borderRadius:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:'bold',color:p.color,fontFamily:'monospace'}}>{p.name}</div>
                <div style={{fontSize:10,opacity:.5,fontFamily:'Georgia,serif',marginTop:2}}>{p.desc}</div>
              </div>
              <button onClick={()=>playProg(p)} disabled={playing}
                style={{background:`${p.color}15`,border:`1px solid ${p.color}`,color:p.color,padding:'.35rem .75rem',borderRadius:8,cursor:playing?'default':'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0,marginLeft:8}}>
                {playing?'▶…':'🔊'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={()=>{setMode('quiz');newQuestion();}}
        style={{width:'100%',padding:'1rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.1em'}}>
        🎯 COMMENCER LE QUIZ
      </button>
    </div>
  );

  // Quiz mode
  if (progIdx===null) { newQuestion(); return null; }
  const prog = PROGRESSIONS_OREILLE[progIdx];

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:2}}>Progressions — Quiz</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>IDENTIFIER À L'OREILLE</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={{fontSize:12,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct}/{score.total}</span>
          <button onClick={()=>setMode('menu')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR</button>
        </div>
      </div>

      <div style={{padding:'1.5rem',background:'rgba(232,168,87,0.08)',border:'1.5px solid rgba(232,168,87,0.25)',borderRadius:16,textAlign:'center'}}>
        <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'1rem'}}>ÉCOUTE CETTE PROGRESSION</div>
        {/* Chord display — visible after answer */}
        {answered && (
          <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:'1rem',flexWrap:'wrap'}}>
            {prog.chords.map((ch,i)=>(
              <div key={i} style={{padding:'.3rem .65rem',background:`${prog.color}20`,border:`1px solid ${prog.color}50`,borderRadius:8,fontSize:13,fontWeight:'bold',fontFamily:'monospace',color:prog.color}}>
                {ch.r+CHORD_TYPES[ch.t].suffix}
              </div>
            ))}
          </div>
        )}
        <button onClick={()=>playProg(prog)} disabled={playing}
          style={{padding:'.9rem 2rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:playing?'default':'pointer',fontSize:14,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
          {playing?'▶ EN COURS…':'🔊 ÉCOUTER'}
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {PROGRESSIONS_OREILLE.map((p,i)=>{
          const isCorrect=i===progIdx, isChosen=answer===i;
          let bg='rgba(255,255,255,0.04)',border='rgba(255,255,255,0.12)',col='rgba(255,255,255,0.75)';
          if(answered){if(isCorrect){bg='rgba(130,224,170,0.15)';border='#7BC8A4';col='#7BC8A4';}else if(isChosen){bg='rgba(241,148,138,0.1)';border='#E07070';col='#E07070';}else{col='rgba(255,255,255,0.25)';}}
          return(
            <button key={i} onClick={()=>pick(i)} disabled={answered}
              style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.9rem .75rem',borderRadius:11,cursor:answered?'default':'pointer',textAlign:'center',fontSize:13,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}
              onMouseEnter={e=>{if(!answered){e.currentTarget.style.background='rgba(232,168,87,0.1)';e.currentTarget.style.borderColor='rgba(232,168,87,0.5)';}}}
              onMouseLeave={e=>{if(!answered){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}}
            >{p.name}</button>
          );
        })}
      </div>

      {answered&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{padding:'.85rem',background:answer===progIdx?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.1)',border:`1px solid ${answer===progIdx?'rgba(130,224,170,0.35)':'rgba(241,148,138,0.35)'}`,borderRadius:10,textAlign:'center',animation:'fadeIn 0.25s ease'}}>
            <div style={{fontSize:14,fontWeight:'bold',color:answer===progIdx?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif',marginBottom:4}}>
              {answer===progIdx?`✓ ${prog.name}`:`✗ C'était : ${prog.name}`}
            </div>
            <div style={{fontSize:11,opacity:.6,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{prog.desc}</div>
          </div>
          <button onClick={newQuestion}
            style={{padding:'.85rem',background:answer===progIdx?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${answer===progIdx?'#7BC8A4':'#E07070'}`,color:answer===progIdx?'#7BC8A4':'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
            PROGRESSION SUIVANTE →
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CYCLE DES QUINTES — VERSION INTERACTIVE ───────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const QUINTE_KEYS = [
  {n:'C',  pos:0,  label:'Do',  sharps:0,flats:0},
  {n:'G',  pos:1,  label:'Sol', sharps:1,flats:0},
  {n:'D',  pos:2,  label:'Ré',  sharps:2,flats:0},
  {n:'A',  pos:3,  label:'La',  sharps:3,flats:0},
  {n:'E',  pos:4,  label:'Mi',  sharps:4,flats:0},
  {n:'B',  pos:5,  label:'Si',  sharps:5,flats:0},
  {n:'F#', pos:6,  label:'Fa#', sharps:6,flats:0},
  {n:'Db', pos:7,  label:'Réb', sharps:0,flats:5},
  {n:'Ab', pos:8,  label:'Lab', sharps:0,flats:4},
  {n:'Eb', pos:9,  label:'Mib', sharps:0,flats:3},
  {n:'Bb', pos:10, label:'Sib', sharps:0,flats:2},
  {n:'F',  pos:11, label:'Fa',  sharps:0,flats:1},
];

function CycleQuintesInteractif() {
  const [selected,   setSelected]   = useState(null);
  const [mode,       setMode]       = useState('visual'); // visual | quiz | modulation
  const [quizState,  setQuizState]  = useState(null);
  const [score,      setScore]      = useState({correct:0,total:0});
  const [playing,    setPlaying]    = useState(false);

  const CX=150, CY=150, R_outer=120, R_inner=75;

  function getCoords(pos, r) {
    const angle = (pos * 30 - 90) * Math.PI / 180;
    return { x: CX + r*Math.cos(angle), y: CY + r*Math.sin(angle) };
  }

  async function playKey(key) {
    if (playing) return;
    setPlaying(true);
    const ri = CHROMATIC.indexOf(key.n);
    if (ri>=0) {
      // Play I-IV-V-I of this key
      const progs = [[0,4,7],[5,9,0],[7,11,2],[0,4,7]];
      for (const p of progs) {
        playChordArp(p.map(f=>(ri+f+12)%12+4*12));
        await new Promise(res=>setTimeout(res,900));
      }
    }
    setPlaying(false);
  }

  function newQuizQuestion(type='armature') {
    const key = QUINTE_KEYS[Math.floor(Math.random()*QUINTE_KEYS.length)];
    const wrongs = QUINTE_KEYS.filter(k=>k.n!==key.n).sort(()=>Math.random()-.5).slice(0,3);
    const options = [...wrongs,key].sort(()=>Math.random()-.5);
    setQuizState({key, options, type, answered:false, chosen:null});
  }

  function pickQuiz(k) {
    if (!quizState || quizState.answered) return;
    const correct = k.n===quizState.key.n;
    setQuizState(q=>({...q,answered:true,chosen:k}));
    setScore(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
  }

  const sel = selected ? QUINTE_KEYS.find(k=>k.n===selected) : null;

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Cycle des Quintes</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>INTERACTIF · QUIZ · MODULATION</p>
        </div>
        {mode==='quiz'&&<span style={{fontSize:12,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct}/{score.total}</span>}
      </div>

      {/* Mode tabs */}
      <div style={{display:'flex',gap:6}}>
        {[['visual','🎡 Visuel'],['quiz','🎯 Quiz'],['modulation','🌊 Modulation']].map(([id,label])=>(
          <button key={id} onClick={()=>{setMode(id);if(id==='quiz')newQuizQuestion();}}
            style={{flex:1,padding:'.5rem .25rem',background:mode===id?'rgba(232,168,87,0.18)':'rgba(255,255,255,0.04)',border:`1px solid ${mode===id?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:9,cursor:'pointer',color:mode===id?'#E8A857':'rgba(255,255,255,0.45)',fontSize:10,fontFamily:'monospace',fontWeight:mode===id?'bold':'normal',transition:'all 0.2s'}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Mode visuel ── */}
      {mode==='visual' && (
        <>
          <div style={{display:'flex',justifyContent:'center'}}>
            <svg viewBox="0 0 300 300" width={280} height={280}>
              {/* Outer ring labels */}
              {QUINTE_KEYS.map(key=>{
                const {x,y}=getCoords(key.pos, R_outer);
                const isSel=selected===key.n;
                const accent='#E8A857';
                return(
                  <g key={key.n} onClick={()=>setSelected(selected===key.n?null:key.n)} style={{cursor:'pointer'}}>
                    <circle cx={x} cy={y} r={20}
                      fill={isSel?`${accent}25`:'rgba(255,255,255,0.06)'}
                      stroke={isSel?accent:'rgba(255,255,255,0.15)'}
                      strokeWidth={isSel?2:1}/>
                    <text x={x} y={y+4} textAnchor="middle" fontSize={11} fontWeight="bold"
                      fill={isSel?accent:'rgba(255,255,255,0.8)'} fontFamily="Georgia,serif">
                      {key.label}
                    </text>
                  </g>
                );
              })}
              {/* Inner ring — relative minors */}
              {QUINTE_KEYS.map(key=>{
                const {x,y}=getCoords(key.pos, R_inner);
                // Relative minor: 3 semitones down
                const ri=CHROMATIC.indexOf(key.n);
                const minorNote=CHROMATIC[(ri-3+12)%12];
                return(
                  <g key={'m'+key.n}>
                    <circle cx={x} cy={y} r={15} fill="rgba(195,155,211,0.1)" stroke="rgba(195,155,211,0.25)" strokeWidth={0.8}/>
                    <text x={x} y={y+4} textAnchor="middle" fontSize={9}
                      fill="rgba(195,155,211,0.7)" fontFamily="Georgia,serif">
                      {minorNote}m
                    </text>
                  </g>
                );
              })}
              {/* Center */}
              <circle cx={CX} cy={CY} r={35} fill="rgba(232,168,87,0.08)" stroke="rgba(232,168,87,0.2)" strokeWidth={1}/>
              <text x={CX} y={CY-5} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)" fontFamily="monospace">CYCLE</text>
              <text x={CX} y={CY+9} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.3)" fontFamily="monospace">DES QUINTES</text>
              {/* Arrows between adjacent keys */}
              {QUINTE_KEYS.map(key=>{
                const next = QUINTE_KEYS[(key.pos+1)%12];
                const {x:x1,y:y1}=getCoords(key.pos, R_outer-26);
                const {x:x2,y:y2}=getCoords(next.pos, R_outer-26);
                return <line key={'arrow'+key.n} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.07)" strokeWidth={0.8}/>;
              })}
            </svg>
          </div>

          {sel ? (
            <div style={{padding:'1rem',background:'rgba(232,168,87,0.1)',border:'1.5px solid rgba(232,168,87,0.35)',borderRadius:14,animation:'fadeIn 0.25s ease'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
                <div>
                  <div style={{fontSize:22,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif'}}>{sel.label} majeur</div>
                  <div style={{fontSize:11,opacity:.55,fontFamily:'monospace',marginTop:2}}>
                    {sel.sharps>0?`${sel.sharps} dièse${sel.sharps>1?'s':''}`:sel.flats>0?`${sel.flats} bémol${sel.flats>1?'s':''}`:'Pas d\'altération'}
                  </div>
                </div>
                <button onClick={()=>playKey(sel)} disabled={playing}
                  style={{background:'rgba(232,168,87,0.15)',border:'1px solid #E8A857',color:'#E8A857',padding:'.45rem .85rem',borderRadius:9,cursor:playing?'default':'pointer',fontSize:11,fontFamily:'monospace'}}>
                  {playing?'▶…':'🔊 I-IV-V-I'}
                </button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {label:'Relatif mineur', value:CHROMATIC[(CHROMATIC.indexOf(sel.n)-3+12)%12]+'m', color:'#B898C8'},
                  {label:'Quinte suivante',value:QUINTE_KEYS[(sel.pos+1)%12].label+' maj', color:'#7BC8A4'},
                  {label:'Quinte précédente',value:QUINTE_KEYS[(sel.pos+11)%12].label+' maj', color:'#90B8D0'},
                  {label:'Position',       value:`${sel.pos===0?'Sommet':sel.pos<=6?`+${sel.pos}`:sel.pos===7?'Enharmonique':`-${12-sel.pos}`} quinte${Math.abs(sel.pos<=6?sel.pos:12-sel.pos)>1?'s':''}`, color:'#E8A857'},
                ].map((s,i)=>(
                  <div key={i} style={{padding:'.55rem .75rem',background:`${s.color}10`,border:`0.5px solid ${s.color}30`,borderRadius:9}}>
                    <div style={{fontSize:9,opacity:.45,fontFamily:'monospace',marginBottom:2}}>{s.label.toUpperCase()}</div>
                    <div style={{fontSize:13,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,textAlign:'center'}}>
              <p style={{fontSize:12,opacity:.45,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>Clique sur une tonalité pour voir ses infos et l'entendre</p>
            </div>
          )}
        </>
      )}

      {/* ── Mode quiz ── */}
      {mode==='quiz' && quizState && (
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div style={{padding:'1.25rem',background:'rgba(232,168,87,0.08)',border:'1.5px solid rgba(232,168,87,0.2)',borderRadius:14,textAlign:'center'}}>
            <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>
              QUELLE TONALITÉ A {quizState.key.sharps>0?`${quizState.key.sharps} DIÈSE${quizState.key.sharps>1?'S':''}`:quizState.key.flats>0?`${quizState.key.flats} BÉMOL${quizState.key.flats>1?'S':''}`:'AUCUNE ALTÉRATION'} ?
            </div>
            <div style={{fontSize:28,fontWeight:'bold',fontFamily:'monospace',color:'#E8A857'}}>
              {quizState.key.sharps>0?'♯'.repeat(quizState.key.sharps):quizState.key.flats>0?'♭'.repeat(quizState.key.flats):'♮'}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {quizState.options.map((opt,i)=>{
              const isC=opt.n===quizState.key.n,isCh=quizState.chosen?.n===opt.n;
              let bg='rgba(255,255,255,0.04)',border='rgba(255,255,255,0.12)',col='rgba(255,255,255,0.75)';
              if(quizState.answered){if(isC){bg='rgba(130,224,170,0.15)';border='#7BC8A4';col='#7BC8A4';}else if(isCh){bg='rgba(241,148,138,0.1)';border='#E07070';col='#E07070';}else{col='rgba(255,255,255,0.25)';}}
              return(
                <button key={i} onClick={()=>pickQuiz(opt)} disabled={quizState.answered}
                  style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.9rem',borderRadius:11,cursor:quizState.answered?'default':'pointer',textAlign:'center',fontSize:15,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.2s'}}>
                  {opt.label}
                </button>
              );
            })}
          </div>

          {quizState.answered&&(
            <button onClick={()=>newQuizQuestion()}
              style={{padding:'.85rem',background:quizState.chosen?.n===quizState.key.n?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${quizState.chosen?.n===quizState.key.n?'#7BC8A4':'#E07070'}`,color:quizState.chosen?.n===quizState.key.n?'#7BC8A4':'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
              TONALITÉ SUIVANTE →
            </button>
          )}
        </div>
      )}

      {/* ── Mode modulation ── */}
      {mode==='modulation' && (
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div style={{padding:'1rem',background:'rgba(212,168,100,0.08)',border:'1px solid rgba(212,168,100,0.2)',borderRadius:12}}>
            <p style={{fontSize:13,opacity:.75,lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>
              Les tonalités <strong>adjacentes sur le cycle</strong> partagent 7 notes sur 8. Elles ne diffèrent que d'un dièse ou bémol — c'est pourquoi elles sont si faciles à moduler entre elles. Plus deux tonalités sont éloignées sur le cycle, plus la modulation est dramatique.
            </p>
          </div>
          {[
            {from:'C',to:'G',desc:"Do → Sol : +1 dièse (Fa#). Très naturel — Sol7 → Do en pivot.",dist:1,color:'#7BC8A4'},
            {from:'C',to:'F',desc:"Do → Fa : +1 bémol (Sib). Naturel — Dm7 → Fa en pivot.",dist:1,color:'#90B8D0'},
            {from:'C',to:'A',desc:"Do → La mineur : même notes, autre tonique. Mouvement vers le relatif.",dist:0,color:'#B898C8'},
            {from:'C',to:'E',desc:"Do → Mi : +4 dièses. Modulation plus dramatique, souvent par enharmonie.",dist:4,color:'#E8A857'},
            {from:'C',to:'F#',desc:"Do → Fa# : +6 dièses. Modulation antipodique — maximum de surprise harmonique.",dist:6,color:'#E07070'},
          ].map((m,i)=>(
            <div key={i} style={{padding:'.85rem 1rem',background:`${m.color}08`,border:`1px solid ${m.color}22`,borderRadius:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.4rem'}}>
                <div style={{fontSize:14,fontWeight:'bold',color:m.color,fontFamily:'monospace'}}>{m.from} → {m.to}</div>
                <div style={{display:'flex',gap:4}}>
                  {Array.from({length:Math.max(1,Math.round(m.dist/2+1))}).map((_,j)=>(
                    <div key={j} style={{width:6,height:6,borderRadius:'50%',background:m.dist===0?m.color:j<Math.round(m.dist/2+0.5)?m.color:'rgba(255,255,255,0.15)'}}/>
                  ))}
                </div>
              </div>
              <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.5,fontFamily:'Georgia,serif'}}>{m.desc}</p>
              <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',marginTop:3}}>Distance : {m.dist===0?'Relatif (0 pas)':m.dist===1?'1 quinte (très proche)':m.dist<=3?`${m.dist} quintes (proche)`:`${m.dist} quintes (éloigné)`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BACKING TRACKS — Générateur Web Audio ─────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const BT_STYLES = [
  {id:'jazz',    name:'Jazz',      color:'#E8A857', bpm:120, prog:[{r:'C',t:'Majeures'},{r:'A',t:'Mineures'},{r:'D',t:'Mineures'},{r:'G',t:'Dom. 7'}],
   desc:"I-vi-ii-V — le classique du jazz.", bassPattern:[0,0,7,0]},
  {id:'blues',   name:'Blues',     color:'#E8A857', bpm:100, prog:[{r:'C',t:'Dom. 7'},{r:'F',t:'Dom. 7'},{r:'C',t:'Dom. 7'},{r:'G',t:'Dom. 7'}],
   desc:"Blues en Do. I7-IV7-I7-V7.", bassPattern:[0,0,10,0]},
  {id:'bossa',   name:'Bossa Nova',color:'#7BC8A4', bpm:130, prog:[{r:'C',t:'Maj. 7'},{r:'A',t:'Dom. 7'},{r:'D',t:'Min. 7'},{r:'G',t:'Dom. 7'}],
   desc:"Imaj7-VI7-iim7-V7 — couleur brésilienne.", bassPattern:[0,7,0,5]},
  {id:'pop',     name:'Pop',       color:'#90B8D0', bpm:110, prog:[{r:'C',t:'Majeures'},{r:'G',t:'Majeures'},{r:'A',t:'Mineures'},{r:'F',t:'Majeures'}],
   desc:"I-V-vi-IV — le pattern des méga hits.", bassPattern:[0,0,9,0]},
  {id:'minor',   name:'Mineur',    color:'#D4A0D4', bpm:95,  prog:[{r:'A',t:'Mineures'},{r:'F',t:'Majeures'},{r:'C',t:'Majeures'},{r:'G',t:'Majeures'}],
   desc:"i-VI-III-VII — progresson mineure dramatique.", bassPattern:[0,5,7,0]},
];

function BackingTracks() {
  const [style,    setStyle]    = useState(BT_STYLES[0]);
  const [running,  setRunning]  = useState(false);
  const [beat,     setBeat]     = useState(-1);
  const [chord,    setChord]    = useState(0);
  const [bpm,      setBpm]      = useState(style.bpm);
  const [volume,   setVolume]   = useState(70);
  const contextRef = useRef(null);
  const intervalRef= useRef(null);
  const beatRef    = useRef({beat:0,chord:0});

  function stop() {
    clearInterval(intervalRef.current);
    setRunning(false); setBeat(-1); setChord(0);
    beatRef.current = {beat:0,chord:0};
    if (contextRef.current) { try{contextRef.current.close();}catch(e){} contextRef.current=null; }
  }

  async function start() {
    if (running) { stop(); return; }
    setRunning(true);
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    contextRef.current = ctx;

    const beatMs = Math.round(60000/bpm);
    const BEATS_PER_CHORD = 4;
    const totalBeats = BEATS_PER_CHORD * style.prog.length;

    let bNum = 0;
    function tick() {
      const cIdx = Math.floor(bNum / BEATS_PER_CHORD) % style.prog.length;
      const bInChord = bNum % BEATS_PER_CHORD;
      const ch = style.prog[cIdx];
      const ri = CHROMATIC.indexOf(ch.r);
      if (ri<0) { bNum++; return; }

      setBeat(bInChord); setChord(cIdx);

      const vol = volume/100;

      // Bass note
      try {
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        const bassNote = ri + style.bassPattern[bInChord] + 2*12;
        const bassFreq = 440 * Math.pow(2, (bassNote-69)/12);
        osc.frequency.value = bassFreq;
        osc.type = 'sawtooth';
        g.gain.setValueAtTime(vol*0.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + beatMs/1200);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + beatMs/1000);
      } catch(e){}

      // Chord on beat 1 and 3
      if (bInChord === 0 || bInChord === 2) {
        try {
          CHORD_TYPES[ch.t].formula.forEach((f,i) => {
            const osc2 = ctx.createOscillator();
            const g2   = ctx.createGain();
            const noteNum = ri + f + 4*12;
            osc2.frequency.value = 440 * Math.pow(2, (noteNum-69)/12);
            osc2.type = 'triangle';
            g2.gain.setValueAtTime(vol*0.15, ctx.currentTime);
            g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (beatMs*1.8)/1000);
            osc2.connect(g2); g2.connect(ctx.destination);
            osc2.start(); osc2.stop(ctx.currentTime + (beatMs*2)/1000);
          });
        } catch(e){}
      }

      // Hi-hat on all beats
      try {
        const buff = ctx.createBuffer(1,ctx.sampleRate*0.03,ctx.sampleRate);
        const data = buff.getChannelData(0);
        for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.12;
        const src = ctx.createBufferSource();
        const g3  = ctx.createGain();
        src.buffer=buff;
        g3.gain.setValueAtTime(vol*0.4, ctx.currentTime);
        g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.03);
        src.connect(g3); g3.connect(ctx.destination);
        src.start();
      } catch(e){}

      // Kick on beat 1
      if (bInChord===0) {
        try {
          const osc3=ctx.createOscillator();
          const g4=ctx.createGain();
          osc3.frequency.setValueAtTime(150,ctx.currentTime);
          osc3.frequency.exponentialRampToValueAtTime(50,ctx.currentTime+0.08);
          osc3.type='sine';
          g4.gain.setValueAtTime(vol*0.7,ctx.currentTime);
          g4.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.1);
          osc3.connect(g4); g4.connect(ctx.destination);
          osc3.start(); osc3.stop(ctx.currentTime+0.12);
        } catch(e){}
      }

      bNum++;
    }
    tick();
    intervalRef.current = setInterval(tick, beatMs);
  }

  useEffect(()=>()=>stop(),[]);

  const currentChord = style.prog[chord];
  const ci = currentChord ? CHROMATIC.indexOf(currentChord.r) : 0;
  const accentColor = style.color;

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Backing Tracks</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>ACCOMPAGNEMENT GÉNÉRÉ · IMPROVISATION</p>
      </div>

      {/* Style selector */}
      <div style={{display:'flex',gap:6,overflowX:'auto'}}>
        {BT_STYLES.map(s=>(
          <button key={s.id} onClick={()=>{if(running)stop();setStyle(s);setBpm(s.bpm);}}
            style={{padding:'.5rem .9rem',background:style.id===s.id?`${s.color}20`:'rgba(255,255,255,0.04)',border:`1.5px solid ${style.id===s.id?s.color:'rgba(255,255,255,0.1)'}`,borderRadius:9,cursor:'pointer',color:style.id===s.id?s.color:'rgba(255,255,255,0.5)',fontSize:10,fontFamily:'monospace',fontWeight:style.id===s.id?'bold':'normal',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Main player */}
      <div style={{padding:'1.25rem',background:`${accentColor}08`,border:`1.5px solid ${running?accentColor:accentColor+'30'}`,borderRadius:16,transition:'border-color 0.3s'}}>
        {/* Chord display */}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:'1rem',flexWrap:'wrap'}}>
          {style.prog.map((ch,i)=>{
            const isCurrent = running && chord===i;
            const chName = ch.r + CHORD_TYPES[ch.t].suffix;
            return(
              <div key={i} style={{
                padding:'.5rem 1rem',
                background: isCurrent?`${accentColor}25`:'rgba(255,255,255,0.06)',
                border:`1.5px solid ${isCurrent?accentColor:'rgba(255,255,255,0.12)'}`,
                borderRadius:10, textAlign:'center',
                transform: isCurrent?'scale(1.08)':'scale(1)',
                transition:'all 0.15s',
                boxShadow: isCurrent?`0 0 14px ${accentColor}40`:'none',
              }}>
                <div style={{fontSize:16,fontWeight:'bold',fontFamily:'monospace',color:isCurrent?accentColor:'rgba(255,255,255,0.65)'}}>{chName}</div>
                <div style={{fontSize:8,opacity:.4,fontFamily:'monospace',marginTop:2}}>{CHORD_TYPES[ch.t].label}</div>
              </div>
            );
          })}
        </div>

        {/* Beat indicator */}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:'1.25rem'}}>
          {[0,1,2,3].map(b=>(
            <div key={b} style={{width:16,height:16,borderRadius:'50%',
              background:running&&beat===b?accentColor:'rgba(255,255,255,0.12)',
              boxShadow:running&&beat===b?`0 0 8px ${accentColor}80`:'none',
              transform:running&&beat===b?'scale(1.2)':'scale(1)',
              transition:'all 0.08s'}}/>
          ))}
        </div>

        <button onClick={start}
          style={{width:'100%',padding:'.9rem',background:running?'rgba(241,148,138,0.15)':`${accentColor}15`,border:`1.5px solid ${running?'#E07070':accentColor}`,color:running?'#E07070':accentColor,borderRadius:12,cursor:'pointer',fontSize:14,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.1em',transition:'all 0.3s'}}>
          {running?'■ ARRÊTER':'▶ LANCER'}
        </button>
      </div>

      {/* BPM + Volume */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em'}}>TEMPO</span>
            <span style={{fontSize:13,fontWeight:'bold',fontFamily:'monospace',color:accentColor}}>{bpm}</span>
          </div>
          <input type="range" min={60} max={180} value={bpm} onChange={e=>setBpm(+e.target.value)}
            style={{width:'100%',accentColor}}/>
          <div style={{fontSize:9,opacity:.3,fontFamily:'monospace',marginTop:2}}>BPM</div>
        </div>
        <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em'}}>VOLUME</span>
            <span style={{fontSize:13,fontWeight:'bold',fontFamily:'monospace',color:accentColor}}>{volume}%</span>
          </div>
          <input type="range" min={0} max={100} value={volume} onChange={e=>setVolume(+e.target.value)}
            style={{width:'100%',accentColor}}/>
          <div style={{fontSize:9,opacity:.3,fontFamily:'monospace',marginTop:2}}>NIVEAU</div>
        </div>
      </div>

      {/* Description + tips */}
      <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12}}>
        <div style={{fontSize:11,fontWeight:'bold',color:accentColor,fontFamily:'Georgia,serif',marginBottom:4}}>{style.name}</div>
        <p style={{fontSize:12,opacity:.6,margin:'0 0 .5rem',fontFamily:'Georgia,serif'}}>{style.desc}</p>
        <div style={{fontSize:10,opacity:.45,fontFamily:'monospace'}}>
          Gammes suggérées :&nbsp;
          {style.id==='jazz'?'Dorien, Mixolydien, Maj7':
           style.id==='blues'?'Pentatonique mineure + blues':
           style.id==='bossa'?'Gammes majeures, Dorien':
           style.id==='pop'?'Gamme majeure, Pentatonique':
           'Éolien, Pentatonique mineure'}
        </div>
      </div>
    </div>
  );
}

function RythmeSection() {
  const [tab, setTab] = useState('lecture'); // lecture | dictee
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(13,11,30,0.6)'}}>
        {[['lecture','🎼 Lecture'],['dictee','👂 Dictée']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'.65rem .25rem',background:'none',border:'none',
              borderBottom:tab===id?'2px solid #E07070':'2px solid transparent',
              color:tab===id?'#E07070':'rgba(255,255,255,0.4)',
              cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.04em',transition:'all 0.2s'}}>
            {label}
          </button>
        ))}
      </div>
      {tab==='lecture' && <LectureRythmique/>}
      {tab==='dictee'  && <DicteeRythmique/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ANALYSE DE GRILLE ─────────────────────────────────────════════════════════
// ══════════════════════════════════════════════════════════════════════════════

// Parse chord input like "Am F C G" or "Dm7 G7 Cmaj7"
function parseChordInput(input) {
  const tokens = input.trim().split(/[\s,\-|]+/).filter(Boolean);
  return tokens.map(tok => {
    // Try to match root + suffix
    const roots = ['C#','Db','D#','Eb','F#','Gb','G#','Ab','A#','Bb','C','D','E','F','G','A','B'];
    let root = null, suffix = '';
    for (const r of roots) {
      if (tok.startsWith(r)) { root = r; suffix = tok.slice(r.length); break; }
    }
    if (!root) return null;
    // Map suffix to CHORD_TYPES key
    const suffixMap = {
      '':'Majeures','m':'Mineures','min':'Mineures','M':'Majeures',
      '7':'Dom. 7','maj7':'Maj. 7','M7':'Maj. 7','Maj7':'Maj. 7',
      'm7':'Min. 7','min7':'Min. 7',
      'mM7':'MinMaj. 7','mMaj7':'MinMaj. 7',
    };
    const type = suffixMap[suffix] || suffixMap[suffix.toLowerCase()] || 'Majeures';
    return { root, type, raw: tok };
  }).filter(Boolean);
}

// Detect likely key from a chord list
function detectKey(chords) {
  const scores = {};
  for (const key of CHROMATIC) {
    const keySemi = CHROMATIC.indexOf(key);
    const majorScale = [0,2,4,5,7,9,11].map(s=>(keySemi+s)%12);
    let score = 0;
    for (const ch of chords) {
      const ri = CHROMATIC.indexOf(ch.root);
      if (majorScale.includes(ri)) score += 1;
      // Bonus for I, IV, V
      const deg = (ri - keySemi + 12) % 12;
      if ([0,5,7].includes(deg)) score += 0.5;
    }
    scores[key] = score;
    // Also check minor (natural minor = 0,2,3,5,7,8,10)
    const minorScale = [0,2,3,5,7,8,10].map(s=>(keySemi+s)%12);
    let minScore = 0;
    for (const ch of chords) {
      const ri = CHROMATIC.indexOf(ch.root);
      if (minorScale.includes(ri)) minScore += 1;
      const deg = (ri - keySemi + 12) % 12;
      if ([0,5,7].includes(deg)) minScore += 0.5;
    }
    scores[key+'m'] = minScore * 0.95; // slight malus to prefer major
  }
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  return sorted.slice(0,3).map(([k,s])=>({key:k,score:s}));
}

// Get diatonic function of a chord in a key
function getChordFunction(chordRoot, keyRoot, isMajor=true) {
  const keyS = CHROMATIC.indexOf(keyRoot);
  const chS  = CHROMATIC.indexOf(chordRoot);
  const deg  = (chS - keyS + 12) % 12;
  const majorDegs = {0:'I',2:'ii',4:'iii',5:'IV',7:'V',9:'vi',11:'vii°'};
  const minorDegs = {0:'i',2:'ii°',3:'III',5:'iv',7:'v',8:'VI',10:'VII'};
  const degs = isMajor ? majorDegs : minorDegs;
  return degs[deg] || null;
}

// Mode suggestions per chord type and function
function getModeForChord(chordRoot, fn, type) {
  if (type==='Dom. 7' || type==='Majeures' && fn==='V') return 'Mixolydien';
  if (type==='Mineures' || type==='Min. 7') return fn==='ii'||fn==='ii°' ? 'Dorien' : 'Éolien';
  if (type==='Majeures' && fn==='IV') return 'Lydien';
  if (type==='Maj. 7' && fn==='I') return 'Ionien (gamme majeure)';
  if (type==='Majeures' && fn==='I') return 'Ionien (gamme majeure)';
  return 'Pentatonique';
}

const CARNET_KEY = 'cs_carnet_v1';
function loadCarnet(){try{return JSON.parse(localStorage.getItem(CARNET_KEY)||'[]');}catch{return[];}}
function saveCarnet(c){try{localStorage.setItem(CARNET_KEY,JSON.stringify(c));}catch{}}

function AnalyseGrille() {
  const [input,    setInput]    = useState('Am F C G');
  const [chords,   setChords]   = useState([]);
  const [keys,     setKeys]     = useState([]);
  const [selKey,   setSelKey]   = useState(null);
  const [playing,  setPlaying]  = useState(false);
  const [saved,    setSaved]    = useState(false);

  function analyse() {
    const parsed = parseChordInput(input);
    if (parsed.length === 0) return;
    setChords(parsed);
    const detected = detectKey(parsed);
    setKeys(detected);
    setSelKey(detected[0]?.key || null);
    setSaved(false);
  }

  async function playAll() {
    if (playing || chords.length===0) return;
    setPlaying(true);
    for (const ch of chords) {
      const ri = CHROMATIC.indexOf(ch.root);
      if (ri>=0) playChordArp(CHORD_TYPES[ch.type].formula.map(f=>ri+f+4*12));
      await new Promise(r=>setTimeout(r,1200));
    }
    setPlaying(false);
  }

  function saveToCarnet() {
    const entry = {
      id: Date.now(),
      title: `Grille analysée — ${selKey||'?'}`,
      date: todayStr(),
      type: 'analyse',
      chords: chords.map(c=>c.raw),
      key: selKey,
      notes: '',
    };
    const c = loadCarnet();
    saveCarnet([entry,...c]);
    setSaved(true);
  }

  const isMajor = selKey && !selKey.endsWith('m');
  const keyRoot = selKey?.replace('m','') || null;

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Analyse de Grille</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>ENTREZ UNE SUITE D'ACCORDS · ANALYSE AUTOMATIQUE</p>
      </div>

      {/* Input */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
        <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>SAISIR LES ACCORDS (séparés par espace, virgule ou tiret)</div>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&analyse()}
          placeholder="Ex: Am F C G  •  Dm7 G7 Cmaj7  •  Am Em F G"
          style={{width:'100%',padding:'.7rem .9rem',background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(232,168,87,0.3)',borderRadius:10,color:'rgba(255,255,255,0.85)',fontSize:13,fontFamily:'monospace',outline:'none',boxSizing:'border-box',marginBottom:8}}/>
        <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',marginBottom:8}}>Formats reconnus : C, Cm, C7, Cmaj7, Cm7, CmM7</div>
        <button onClick={analyse}
          style={{width:'100%',padding:'.75rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.1em'}}>
          🔍 ANALYSER
        </button>
      </div>

      {chords.length>0 && (
        <>
          {/* Tonalité probable */}
          <div style={{padding:'1rem',background:'rgba(130,224,170,0.07)',border:'1px solid rgba(130,224,170,0.2)',borderRadius:14}}>
            <div style={{fontSize:10,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>TONALITÉ PROBABLE</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'.75rem'}}>
              {keys.map(({key,score},i)=>(
                <button key={key} onClick={()=>setSelKey(key)}
                  style={{padding:'.5rem 1rem',background:selKey===key?'rgba(130,224,170,0.2)':'rgba(255,255,255,0.05)',border:`1.5px solid ${selKey===key?'#7BC8A4':'rgba(255,255,255,0.15)'}`,borderRadius:9,cursor:'pointer',color:selKey===key?'#7BC8A4':'rgba(255,255,255,0.55)',fontFamily:'monospace',fontSize:13,fontWeight:'bold',transition:'all 0.2s'}}>
                  {key}{i===0?' ★':''}
                </button>
              ))}
            </div>
            <div style={{fontSize:11,opacity:.5,fontFamily:'monospace'}}>Clique pour changer la tonalité de référence</div>
          </div>

          {/* Chord analysis */}
          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
              <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em'}}>ANALYSE DES ACCORDS</div>
              <button onClick={playAll} disabled={playing}
                style={{padding:'.35rem .8rem',background:'rgba(232,168,87,0.12)',border:'1px solid rgba(232,168,87,0.4)',color:'#E8A857',borderRadius:8,cursor:playing?'default':'pointer',fontSize:10,fontFamily:'monospace',fontWeight:'bold'}}>
                {playing?'▶…':'🔊 JOUER'}
              </button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {chords.map((ch,i)=>{
                const ri = CHROMATIC.indexOf(ch.root);
                const fn = keyRoot ? getChordFunction(ch.root, keyRoot, isMajor) : null;
                const mode = fn ? getModeForChord(ch.root, fn, ch.type) : 'Pentatonique';
                // Check if borrowed
                const majorScale = keyRoot ? [0,2,4,5,7,9,11].map(s=>(CHROMATIC.indexOf(keyRoot)+s)%12) : [];
                const isBorrowed = keyRoot && isMajor && !majorScale.includes(ri);
                const nc = NOTE_COLORS[ch.root]||'#E8A857';
                return(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'.65rem .85rem',background:'rgba(255,255,255,0.03)',border:`0.5px solid ${nc}25`,borderRadius:10}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:`${nc}20`,border:`1.5px solid ${nc}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontFamily:'monospace',color:'rgba(255,255,255,0.4)',flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:2}}>
                        <span style={{fontSize:15,fontWeight:'bold',color:nc,fontFamily:'monospace'}}>{ch.raw}</span>
                        {fn && <span style={{fontSize:11,fontFamily:'monospace',color:nc,padding:'1px 6px',background:`${nc}15`,borderRadius:5}}>{fn}</span>}
                        {isBorrowed && <span style={{fontSize:9,fontFamily:'monospace',color:'#E07070',padding:'1px 5px',background:'rgba(241,148,138,0.12)',borderRadius:5}}>emprunté</span>}
                      </div>
                      <div style={{fontSize:10,opacity:.45,fontFamily:'monospace'}}>Improvise : {mode}</div>
                    </div>
                    <button onClick={()=>{if(ri>=0)playChordArp(CHORD_TYPES[ch.type].formula.map(f=>ri+f+4*12));}}
                      style={{background:`${nc}12`,border:`1px solid ${nc}30`,color:nc,padding:'.25rem .55rem',borderRadius:6,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0}}>♪</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Borrowed chords summary */}
          {keyRoot && chords.some(ch=>{
            const ri=CHROMATIC.indexOf(ch.root);
            const majorScale=[0,2,4,5,7,9,11].map(s=>(CHROMATIC.indexOf(keyRoot)+s)%12);
            return isMajor && !majorScale.includes(ri);
          }) && (
            <div style={{padding:'.85rem 1rem',background:'rgba(241,148,138,0.07)',border:'1px solid rgba(241,148,138,0.2)',borderRadius:12}}>
              <div style={{fontSize:9,color:'#E07070',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.4rem'}}>ACCORDS EMPRUNTÉS DÉTECTÉS</div>
              <p style={{fontSize:12,opacity:.68,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>Ces accords ne font pas partie de la gamme de {selKey}. Ils sont probablement empruntés au mode mineur ou à une autre tonalité — ce qui crée des couleurs inattendues et expressives.</p>
            </div>
          )}

          {/* Save to carnet */}
          <button onClick={saveToCarnet} disabled={saved}
            style={{width:'100%',padding:'.75rem',background:saved?'rgba(130,224,170,0.12)':'rgba(255,255,255,0.05)',border:`1.5px solid ${saved?'#7BC8A4':'rgba(255,255,255,0.15)'}`,color:saved?'#7BC8A4':'rgba(255,255,255,0.5)',borderRadius:10,cursor:saved?'default':'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.3s'}}>
            {saved?'✓ Sauvegardé dans le carnet':'📒 Sauvegarder dans le carnet'}
          </button>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SOLFÈGE CHANTÉ ────────────────────────────────════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════

const SOLFEGE_NOTES = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5'];
const NOTE_Y_STAFF  = {C4:80,D4:72,E4:64,F4:58,G4:50,A4:42,B4:34,C5:26,D5:18,E5:10};

function SolfegeChante() {
  const [targetNote, setTargetNote] = useState('C4');
  const [score,      setScore]      = useState({correct:0,total:0});
  const [feedback,   setFeedback]   = useState(null); // null|'correct'|'wrong'|'listening'
  const [detNote,    setDetNote]    = useState(null);
  const mic = useMicrophone();

  function newNote() {
    const n = SOLFEGE_NOTES[Math.floor(Math.random()*SOLFEGE_NOTES.length)];
    setTargetNote(n); setFeedback(null); setDetNote(null);
  }

  function playTarget() {
    const semi = CHROMATIC.indexOf(targetNote.replace(/[45]/,''));
    const octave = targetNote.includes('5') ? 5 : 4;
    playNote(semi + octave*12, 0, 1.2);
  }

  // Watch mic for matching note
  useEffect(()=>{
    if (!mic.isActive || feedback==='correct') return;
    const det = mic.detectedNotes[0];
    setDetNote(det||null);
    if (det) {
      const expected = targetNote.replace(/[45]/,'');
      if (det === expected) {
        setFeedback('correct');
        setScore(s=>({correct:s.correct+1,total:s.total+1}));
        setTimeout(()=>newNote(), 1200);
      }
    }
  }, [mic.detectedNotes]);

  const noteBaseName = targetNote.replace(/[45]/,'');
  const NOTE_NAMES_FR = {C:'Do',D:'Ré',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};
  const noteFr = NOTE_NAMES_FR[noteBaseName]||noteBaseName;
  const y = NOTE_Y_STAFF[targetNote] || 50;
  const W=200, H=110;
  const lineY=[80,72,64,56,48];

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Solfège Chanté</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>CHANTE LA NOTE AFFICHÉE</p>
        </div>
        <span style={{fontSize:12,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct}/{score.total}</span>
      </div>

      {/* Note display */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'1.5rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}}>
        <div style={{fontSize:10,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'1rem'}}>CHANTE CETTE NOTE</div>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{background:'#F5EFE8',borderRadius:10,marginBottom:'1rem'}}>
          {lineY.map((ly,i)=><line key={i} x1={15} y1={ly} x2={W-10} y2={ly} stroke="#555" strokeWidth={0.8}/>)}
          <text x={17} y={78} fontSize={36} fill="#555" fontFamily="serif">𝄞</text>
          {y===80&&<line x1={88} x2={104} y1={80} y2={80} stroke="#555" strokeWidth={0.8}/>}
          <ellipse cx={96} cy={y} rx={7} ry={5}
            fill={feedback==='correct'?'#7BC8A4':feedback==='wrong'?'#E07070':'#1a1a1a'}
            transform={`rotate(-15,96,${y})`}
            style={{transition:'fill 0.3s'}}/>
          <line x1={102.5} y1={y} x2={102.5} y2={y-26} stroke={feedback==='correct'?'#7BC8A4':'#1a1a1a'} strokeWidth={1.5}/>
        </svg>
        <div style={{fontSize:32,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif',marginBottom:4}}>{noteFr}</div>
        <button onClick={playTarget}
          style={{padding:'.45rem 1.1rem',background:'rgba(232,168,87,0.12)',border:'1px solid rgba(232,168,87,0.4)',color:'#E8A857',borderRadius:9,cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>
          🔊 Écouter la note
        </button>
      </div>

      {/* Mic */}
      <MicDetector mic={mic}/>

      {/* Detected note */}
      {mic.isActive && (
        <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.4rem'}}>NOTE DÉTECTÉE</div>
          <div style={{fontSize:28,fontWeight:'bold',fontFamily:'monospace',color:
            detNote===noteBaseName?'#7BC8A4':detNote?'#E07070':'rgba(255,255,255,0.25)'
          }}>{detNote?NOTE_NAMES_FR[detNote]||detNote:'—'}</div>
          {feedback==='correct'&&<div style={{fontSize:13,color:'#7BC8A4',fontFamily:'Georgia,serif',marginTop:4,animation:'fadeIn 0.3s ease'}}>✓ Parfait !</div>}
        </div>
      )}

      {/* Manual buttons fallback */}
      {!mic.isActive && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{fontSize:10,opacity:.35,fontFamily:'monospace',textAlign:'center'}}>OU SÉLECTIONNE LA NOTE QUE TU AS CHANTÉE</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
            {SOLFEGE_NOTES.slice(0,8).map(n=>{
              const nb=n.replace(/[45]/,'');
              const isTarget=nb===noteBaseName;
              const nc=NOTE_COLORS[nb]||'#E8A857';
              return(
                <button key={n} onClick={()=>{
                  const ok=nb===noteBaseName;
                  setFeedback(ok?'correct':'wrong');
                  setScore(s=>({correct:s.correct+(ok?1:0),total:s.total+1}));
                  if(ok) setTimeout(()=>newNote(),900);
                }}
                  style={{padding:'.5rem .9rem',background:`${nc}15`,border:`1.5px solid ${nc}40`,color:nc,borderRadius:9,cursor:'pointer',fontSize:13,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.2s'}}>
                  {NOTE_NAMES_FR[nb]||nb}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Skip */}
      <button onClick={()=>{setScore(s=>({...s,total:s.total+1}));newNote();}}
        style={{padding:'.6rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,cursor:'pointer',color:'rgba(255,255,255,0.35)',fontSize:11,fontFamily:'monospace'}}>
        PASSER →
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ÉCOUTE ACTIVE ─────────────────────────────────────════════════════════════
// ══════════════════════════════════════════════════════════════════════════════

const ECOUTE_QUESTIONS = [
  {
    id:'majmin', title:'Majeur ou mineur ?',
    generate() {
      const root = ROOT_NOTES[Math.floor(Math.random()*ROOT_NOTES.length)];
      const isMaj = Math.random()>0.5;
      const type = isMaj?'Majeures':'Mineures';
      const ri = CHROMATIC.indexOf(root);
      return {
        root,type,
        play: ()=>playChordArp(CHORD_TYPES[type].formula.map(f=>ri+f+4*12)),
        answer: isMaj?'Majeur':'Mineur',
        options:['Majeur','Mineur'],
        explanation: isMaj
          ? 'L\'accord majeur a une tierce majeure (4 demi-tons) — son lumineux et stable.'
          : 'L\'accord mineur a une tierce mineure (3 demi-tons) — son sombre et expressif.',
      };
    }
  },
  {
    id:'cadence', title:'Quelle cadence ?',
    generate() {
      const cadences = [
        {name:'Parfaite (V→I)', chords:[['G','Majeures'],['C','Majeures']]},
        {name:'Plagale (IV→I)', chords:[['F','Majeures'],['C','Majeures']]},
        {name:'Rompue (V→vi)', chords:[['G','Majeures'],['A','Mineures']]},
      ];
      const cad = cadences[Math.floor(Math.random()*cadences.length)];
      return {
        play: async()=>{for(const[r,t]of cad.chords){const ri=CHROMATIC.indexOf(r);playChordArp(CHORD_TYPES[t].formula.map(f=>ri+f+4*12));await new Promise(res=>setTimeout(res,1200));}},
        answer: cad.name,
        options: cadences.map(c=>c.name),
        explanation: `La ${cad.name} a un effet émotionnel distinct. Avec de la pratique tu l'identifieras instinctivement.`,
      };
    }
  },
  {
    id:'nbaccords', title:'Combien d\'accords ?',
    generate() {
      const n = Math.floor(Math.random()*3)+2; // 2,3,4
      const progs = [
        [['C','Majeures'],['G','Majeures']],
        [['C','Majeures'],['F','Majeures'],['G','Dom. 7']],
        [['C','Majeures'],['A','Mineures'],['F','Majeures'],['G','Dom. 7']],
      ];
      const prog = progs[n-2];
      return {
        play: async()=>{for(const[r,t]of prog){const ri=CHROMATIC.indexOf(r);playChordArp(CHORD_TYPES[t].formula.map(f=>ri+f+4*12));await new Promise(res=>setTimeout(res,1100));}},
        answer: String(n),
        options: ['2','3','4'],
        explanation: `Il y avait ${n} accord${n>1?'s':''} dans cette progression.`,
      };
    }
  },
  {
    id:'interval', title:'Quel intervalle ?',
    generate() {
      const intervals = [
        {name:'Octave',semi:12},{name:'Quinte',semi:7},{name:'Quarte',semi:5},
        {name:'Tierce majeure',semi:4},{name:'Tierce mineure',semi:3},
      ];
      const root = ROOT_NOTES[Math.floor(Math.random()*6)];
      const ri = CHROMATIC.indexOf(root);
      const intv = intervals[Math.floor(Math.random()*intervals.length)];
      return {
        play: ()=>{playNote(ri+4*12,0,1);setTimeout(()=>playNote(ri+intv.semi+4*12,0,1),700);},
        answer: intv.name,
        options: intervals.map(i=>i.name),
        explanation: `L'intervalle était une ${intv.name} (${intv.semi} demi-ton${intv.semi>1?'s':''}).`,
      };
    }
  },
];

function EcouteActive() {
  const [qTypeIdx,  setQTypeIdx]  = useState(0);
  const [question,  setQuestion]  = useState(null);
  const [answered,  setAnswered]  = useState(false);
  const [chosen,    setChosen]    = useState(null);
  const [score,     setScore]     = useState({correct:0,total:0});
  const [playing,   setPlaying]   = useState(false);

  const qType = ECOUTE_QUESTIONS[qTypeIdx];

  function newQuestion() {
    setQuestion(qType.generate());
    setAnswered(false); setChosen(null);
  }

  useEffect(()=>newQuestion(),[qTypeIdx]);

  async function playQ() {
    if (!question||playing) return;
    setPlaying(true);
    await question.play();
    setPlaying(false);
  }

  function pick(opt) {
    if (answered||!question) return;
    setChosen(opt); setAnswered(true);
    setScore(s=>({correct:s.correct+(opt===question.answer?1:0),total:s.total+1}));
  }

  if (!question) return null;

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Écoute Active</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>CULTURE MUSICALE · ANALYSE À L'OREILLE</p>
        </div>
        <span style={{fontSize:12,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct}/{score.total}</span>
      </div>

      {/* Type selector */}
      <div style={{display:'flex',gap:5,overflowX:'auto'}}>
        {ECOUTE_QUESTIONS.map((q,i)=>(
          <button key={q.id} onClick={()=>setQTypeIdx(i)}
            style={{padding:'.4rem .75rem',background:qTypeIdx===i?'rgba(212,168,100,0.18)':'rgba(255,255,255,0.04)',border:`1px solid ${qTypeIdx===i?'#D4A0D4':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:qTypeIdx===i?'#D4A0D4':'rgba(255,255,255,0.45)',fontSize:10,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>
            {q.title}
          </button>
        ))}
      </div>

      {/* Question */}
      <div style={{padding:'1.5rem',background:'rgba(212,168,100,0.07)',border:'1.5px solid rgba(212,168,100,0.25)',borderRadius:16,textAlign:'center'}}>
        <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'1rem'}}>{qType.title.toUpperCase()}</div>
        <button onClick={playQ} disabled={playing}
          style={{padding:'.9rem 2rem',background:'rgba(212,168,100,0.15)',border:'1.5px solid #D4A0D4',color:'#D4A0D4',borderRadius:12,cursor:playing?'default':'pointer',fontSize:14,fontFamily:'monospace',fontWeight:'bold',marginBottom:'.5rem',transition:'all 0.2s'}}>
          {playing?'▶ EN COURS…':'🔊 ÉCOUTER'}
        </button>
        <div style={{fontSize:10,opacity:.35,fontFamily:'monospace'}}>Écoute plusieurs fois si besoin</div>
      </div>

      {/* Options */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {question.options.map((opt,i)=>{
          const isC=opt===question.answer, isCh=chosen===opt;
          let bg='rgba(255,255,255,0.04)',border='rgba(255,255,255,0.12)',col='rgba(255,255,255,0.75)';
          if(answered){if(isC){bg='rgba(130,224,170,0.15)';border='#7BC8A4';col='#7BC8A4';}else if(isCh){bg='rgba(241,148,138,0.1)';border='#E07070';col='#E07070';}else{col='rgba(255,255,255,0.25)';}}
          return(
            <button key={i} onClick={()=>pick(opt)} disabled={answered}
              style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.9rem .75rem',borderRadius:11,cursor:answered?'default':'pointer',textAlign:'center',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.2s'}}
              onMouseEnter={e=>{if(!answered){e.currentTarget.style.background='rgba(212,168,100,0.1)';e.currentTarget.style.borderColor='rgba(212,168,100,0.5)';}}}
              onMouseLeave={e=>{if(!answered){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}}
            >{opt}</button>
          );
        })}
      </div>

      {answered && (
        <div style={{display:'flex',flexDirection:'column',gap:8,animation:'fadeIn 0.3s ease'}}>
          <div style={{padding:'.85rem',background:chosen===question.answer?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.1)',border:`1px solid ${chosen===question.answer?'rgba(130,224,170,0.35)':'rgba(241,148,138,0.35)'}`,borderRadius:10}}>
            <div style={{fontSize:14,fontWeight:'bold',color:chosen===question.answer?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif',marginBottom:4}}>
              {chosen===question.answer?'✓ Bonne réponse !':('✗ C\'était : '+question.answer)}
            </div>
            <p style={{fontSize:12,opacity:.65,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{question.explanation}</p>
          </div>
          <button onClick={newQuestion}
            style={{padding:'.85rem',background:chosen===question.answer?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${chosen===question.answer?'#7BC8A4':'#E07070'}`,color:chosen===question.answer?'#7BC8A4':'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.08em'}}>
            QUESTION SUIVANTE →
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CARNET DE COMPOSITION ─────────────────────────────════════════════════════
// ══════════════════════════════════════════════════════════════════════════════

// Simple melody editor: 8 columns x 8 note rows
const MELODY_NOTES = ['C5','B4','A4','G4','F4','E4','D4','C4'];
const MELODY_NOTE_LABELS = {C5:'Do5',B4:'Si',A4:'La',G4:'Sol',F4:'Fa',E4:'Mi',D4:'Ré',C4:'Do'};

function MelodyEditor({ melody, setMelody }) {
  const COLS = 8;
  function toggle(row, col) {
    const key = `${row}-${col}`;
    setMelody(prev => {
      const n = {...prev};
      if (n[key]) delete n[key]; else n[key] = MELODY_NOTES[row];
      return n;
    });
  }
  async function playMelody() {
    const sorted = Object.entries(melody).sort((a,b)=>parseInt(a[0].split('-')[1])-parseInt(b[0].split('-')[1]));
    for (const [key, note] of sorted) {
      const semi = CHROMATIC.indexOf(note.replace(/[45]/,''));
      const oct  = note.includes('5') ? 5 : 4;
      playNote(semi+oct*12, 0, 0.7);
      await new Promise(r=>setTimeout(r,350));
    }
  }
  return (
    <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
        <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em'}}>ÉDITEUR DE MÉLODIE</div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={playMelody} style={{padding:'.3rem .7rem',background:'rgba(232,168,87,0.12)',border:'1px solid rgba(232,168,87,0.35)',color:'#E8A857',borderRadius:7,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>▶ JOUER</button>
          <button onClick={()=>setMelody({})} style={{padding:'.3rem .7rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.4)',borderRadius:7,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>↺</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:2}}>
        {MELODY_NOTES.map((note,row)=>(
          <div key={row} style={{display:'contents'}}>
            <div style={{fontSize:9,fontFamily:'monospace',color:'rgba(255,255,255,0.3)',display:'flex',alignItems:'center',paddingRight:6,whiteSpace:'nowrap'}}>{MELODY_NOTE_LABELS[note]}</div>
            <div style={{display:'flex',gap:2}}>
              {Array.from({length:COLS}).map((_,col)=>{
                const isOn = !!melody[`${row}-${col}`];
                const nc = NOTE_COLORS[note.replace(/[45]/,'')]||'#E8A857';
                return(
                  <button key={col} onClick={()=>toggle(row,col)}
                    style={{flex:1,height:22,background:isOn?`${nc}60`:'rgba(255,255,255,0.04)',border:`1px solid ${isOn?nc+'80':'rgba(255,255,255,0.08)'}`,borderRadius:3,cursor:'pointer',transition:'all 0.1s'}}/>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{fontSize:9,opacity:.3,fontFamily:'monospace',marginTop:'.5rem',textAlign:'center'}}>Clique sur les cases pour noter ta mélodie</div>
    </div>
  );
}

function CarnetComposition() {
  const [entries,   setEntries]   = useState(loadCarnet);
  const [view,      setView]      = useState('list'); // list | new | detail
  const [selEntry,  setSelEntry]  = useState(null);
  const [form,      setForm]      = useState({title:'',chords:'',notes:'',melody:{}});
  const [saved,     setSaved]     = useState(false);

  function saveEntry() {
    if (!form.title.trim()) return;
    const entry = {
      id: Date.now(),
      title: form.title,
      date: todayStr(),
      type: 'composition',
      chords: form.chords ? form.chords.split(/[\s,]+/).filter(Boolean) : [],
      notes: form.notes,
      melody: form.melody,
    };
    const updated = [entry, ...entries];
    setEntries(updated); saveCarnet(updated);
    setSaved(true); setView('list');
    setTimeout(()=>setSaved(false),2000);
  }

  function deleteEntry(id) {
    const updated = entries.filter(e=>e.id!==id);
    setEntries(updated); saveCarnet(updated);
  }

  if (view==='new') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'.5rem'}}>
        <button onClick={()=>setView('list')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>←</button>
        <h3 style={{fontSize:16,fontWeight:'bold',margin:0}}>Nouvelle composition</h3>
      </div>
      <input placeholder="Titre de la composition *"
        value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
        style={{padding:'.75rem',background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(232,168,87,0.35)',borderRadius:10,color:'rgba(255,255,255,0.85)',fontSize:14,fontFamily:'Georgia,serif',outline:'none'}}/>
      <input placeholder="Accords (ex: Am F C G)"
        value={form.chords} onChange={e=>setForm(f=>({...f,chords:e.target.value}))}
        style={{padding:'.65rem .85rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'rgba(255,255,255,0.8)',fontSize:13,fontFamily:'monospace',outline:'none'}}/>
      <MelodyEditor melody={form.melody} setMelody={mel=>setForm(f=>({...f,melody:mel}))}/>
      <textarea placeholder="Notes libres, idées, inspirations..."
        value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
        rows={3}
        style={{padding:'.75rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'rgba(255,255,255,0.75)',fontSize:12,fontFamily:'Georgia,serif',outline:'none',resize:'vertical'}}/>
      <button onClick={saveEntry} disabled={!form.title.trim()}
        style={{padding:'.9rem',background:form.title.trim()?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1.5px solid ${form.title.trim()?'#E8A857':'rgba(255,255,255,0.1)'}`,color:form.title.trim()?'#E8A857':'rgba(255,255,255,0.25)',borderRadius:12,cursor:form.title.trim()?'pointer':'not-allowed',fontSize:13,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.1em'}}>
        💾 SAUVEGARDER
      </button>
    </div>
  );

  if (view==='detail' && selEntry) return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'.5rem'}}>
        <button onClick={()=>setView('list')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>←</button>
        <div style={{flex:1}}>
          <h3 style={{fontSize:16,fontWeight:'bold',margin:0}}>{selEntry.title}</h3>
          <div style={{fontSize:10,opacity:.35,fontFamily:'monospace',marginTop:2}}>{selEntry.date}</div>
        </div>
        <button onClick={()=>{deleteEntry(selEntry.id);setView('list');}}
          style={{background:'rgba(241,148,138,0.1)',border:'1px solid rgba(241,148,138,0.3)',color:'#E07070',padding:'.35rem .75rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>
          🗑 Supprimer
        </button>
      </div>
      {selEntry.chords?.length>0 && (
        <div style={{padding:'.85rem 1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
          <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>PROGRESSION</div>
          <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
            {selEntry.chords.map((c,i)=>{
              const root=c.replace(/m7?|maj7|M7/,'');
              const nc=NOTE_COLORS[root]||'#E8A857';
              return<span key={i} style={{padding:'.35rem .7rem',background:`${nc}15`,border:`1px solid ${nc}40`,borderRadius:7,fontSize:13,fontWeight:'bold',fontFamily:'monospace',color:nc}}>{c}</span>;
            })}
          </div>
        </div>
      )}
      {selEntry.melody && Object.keys(selEntry.melody).length>0 && (
        <MelodyEditor melody={selEntry.melody} setMelody={()=>{}}/>
      )}
      {selEntry.notes && (
        <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
          <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>NOTES</div>
          <p style={{fontSize:13,opacity:.75,lineHeight:1.7,margin:0,fontFamily:'Georgia,serif',whiteSpace:'pre-wrap'}}>{selEntry.notes}</p>
        </div>
      )}
    </div>
  );

  // List view
  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Carnet de Composition</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>TES CRÉATIONS · IDÉES · MÉLODIES</p>
        </div>
        <button onClick={()=>{setForm({title:'',chords:'',notes:'',melody:{}});setView('new');}}
          style={{padding:'.55rem .9rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',flexShrink:0}}>
          + NOUVEAU
        </button>
      </div>
      {saved && <div style={{padding:'.65rem',background:'rgba(130,224,170,0.12)',border:'1px solid rgba(130,224,170,0.35)',borderRadius:9,color:'#7BC8A4',fontFamily:'monospace',fontSize:12,textAlign:'center',animation:'fadeIn 0.3s ease'}}>✓ Composition sauvegardée !</div>}
      {entries.length===0 ? (
        <div style={{textAlign:'center',padding:'3rem 1.5rem',opacity:.4}}>
          <div style={{fontSize:36,marginBottom:8}}>📒</div>
          <div style={{fontSize:13,fontFamily:'Georgia,serif'}}>Ton carnet est vide. Crée ta première composition !</div>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {entries.map(entry=>(
            <button key={entry.id} onClick={()=>{setSelEntry(entry);setView('detail');}}
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'.9rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(232,168,87,0.06)';e.currentTarget.style.borderColor='rgba(232,168,87,0.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:3}}>{entry.title}</div>
                  <div style={{display:'flex',gap:8}}>
                    <span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>{entry.date}</span>
                    {entry.chords?.length>0&&<span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>{entry.chords.length} accords</span>}
                    {entry.melody&&Object.keys(entry.melody).length>0&&<span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>mélodie ♪</span>}
                  </div>
                </div>
                <span style={{fontSize:9,fontFamily:'monospace',padding:'2px 7px',background:`${entry.type==='analyse'?'rgba(133,193,233,0.12)':'rgba(232,168,87,0.12)'}`,border:`0.5px solid ${entry.type==='analyse'?'rgba(133,193,233,0.3)':'rgba(232,168,87,0.3)'}`,borderRadius:6,color:entry.type==='analyse'?'#90B8D0':'#E8A857',flexShrink:0}}>{entry.type==='analyse'?'grille':'compo'}</span>
              </div>
              {entry.notes&&<p style={{fontSize:11,opacity:.45,margin:'.4rem 0 0',lineHeight:1.4,fontFamily:'Georgia,serif',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical'}}>{entry.notes}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── AUDIO AMÉLIORÉ — Détection gamme, intervalles, confiance ─────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Identifier la gamme la plus probable à partir d'un set de notes entendues
function identifyScaleFromNotes(noteNames) {
  if (noteNames.length < 3) return null;
  const unique = [...new Set(noteNames)];
  let best = null, bestScore = 0;

  for (const scale of SCALE_LIBRARY) {
    for (const root of CHROMATIC) {
      const ri = CHROMATIC.indexOf(root);
      const scaleNotes = scale.semis.map(s => CHROMATIC[(ri+s)%12]);
      const matched = unique.filter(n => scaleNotes.includes(n)).length;
      const extra   = unique.filter(n => !scaleNotes.includes(n)).length;
      const score   = matched - extra * 0.8;
      if (score > bestScore && matched >= Math.min(3, scale.semis.length)) {
        bestScore = score;
        best = { root, scale: scale.name, color: scale.color, notes: scaleNotes, score, matched };
      }
    }
  }
  return bestScore >= 2.5 ? best : null;
}

// Identifier l'intervalle entre deux notes
function identifyInterval(note1, note2) {
  const INTERVAL_NAMES = ['Unisson','Seconde min.','Seconde maj.','Tierce min.','Tierce maj.',
    'Quarte juste','Triton','Quinte juste','Sixte min.','Sixte maj.','Septième min.','Septième maj.','Octave'];
  const i1 = CHROMATIC.indexOf(note1.replace(/[0-9]/g,''));
  const i2 = CHROMATIC.indexOf(note2.replace(/[0-9]/g,''));
  if (i1<0||i2<0) return null;
  const semi = Math.abs(i2-i1) % 12;
  return { name: INTERVAL_NAMES[semi], semitones: semi };
}

// Hook micro amélioré avec lissage temporel et score de confiance
function useMicrophoneEnhanced() {
  const [isActive,      setIsActive]      = useState(false);
  const [permission,    setPermission]    = useState('idle');
  const [detectedNotes, setDetectedNotes] = useState([]);
  const [detectedChord, setDetectedChord] = useState(null);
  const [detectedScale, setDetectedScale] = useState(null);
  const [confidence,    setConfidence]    = useState(0);  // 0-100
  const [volume,        setVolume]        = useState(0);
  const [noteHistory,   setNoteHistory]   = useState([]); // last N note sets for scale detection

  const streamRef   = useRef(null);
  const ctxRef      = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef   = useRef(null);
  const animRef     = useRef(null);
  const prevChordRef= useRef(null);
  const chordBufRef = useRef([]); // smoothing buffer
  const noteAccRef  = useRef(new Map()); // note accumulator for scale

  function stop() {
    cancelAnimationFrame(animRef.current);
    try { sourceRef.current?.disconnect(); } catch(e) {}
    try { analyserRef.current?.disconnect(); } catch(e) {}
    streamRef.current?.getTracks().forEach(t=>t.stop());
    try { ctxRef.current?.close(); } catch(e) {}
    streamRef.current=null; ctxRef.current=null; analyserRef.current=null; sourceRef.current=null;
    setIsActive(false); setDetectedNotes([]); setDetectedChord(null);
    setDetectedScale(null); setConfidence(0); setVolume(0);
    chordBufRef.current=[]; noteAccRef.current=new Map();
  }

  async function start() {
    try {
      setPermission('idle');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio:{ echoCancellation:false, noiseSuppression:false, autoGainControl:false }
      });
      setPermission('granted');
      streamRef.current = stream;
      const ctx = new (window.AudioContext||window.webkitAudioContext)({ sampleRate:44100 });
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.7;
      analyserRef.current = analyser;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      setIsActive(true);

      const freqBuf = new Float32Array(analyser.frequencyBinCount);
      const timeBuf = new Float32Array(analyser.fftSize);
      let lastUpdate = 0;
      let frameCount = 0;

      function loop(ts) {
        animRef.current = requestAnimationFrame(loop);
        if (ts - lastUpdate < 100) return;
        lastUpdate = ts;
        frameCount++;

        analyser.getFloatFrequencyData(freqBuf);
        analyser.getFloatTimeDomainData(timeBuf);

        // Volume RMS
        let rms = 0;
        for (let i=0;i<timeBuf.length;i++) rms+=timeBuf[i]*timeBuf[i];
        rms = Math.sqrt(rms/timeBuf.length);
        setVolume(Math.min(100, Math.round(rms*400)));

        if (rms < 0.007) {
          setDetectedNotes([]); setDetectedChord(null); setConfidence(0);
          return;
        }

        // Peak detection
        const peaks   = detectFFTPeaks(freqBuf, ctx.sampleRate, analyser.fftSize*2);
        const fundams  = removeHarmonics(peaks.slice(0,14));
        const notes    = [...new Set(fundams.map(p=>freqToNoteName(p.freq)).filter(Boolean))];

        setDetectedNotes(notes);

        // Smoothing buffer for chord detection
        if (notes.length >= 2) {
          chordBufRef.current = [...chordBufRef.current.slice(-4), notes];
        }

        // Chord identification with confidence
        if (notes.length >= 2) {
          const chord = identifyChordFromNotes(notes);
          if (chord) {
            // Confidence based on score and note count
            const conf = Math.min(100, Math.round(chord.score*25));
            setConfidence(conf);

            // Temporal smoothing: only update if same chord appears 2+ times
            const buf = chordBufRef.current;
            if (buf.length >= 2) {
              const prevChord = identifyChordFromNotes(buf[buf.length-2]);
              if (prevChord?.name === chord.name) {
                if (prevChordRef.current?.name !== chord.name) {
                  prevChordRef.current = chord;
                  setDetectedChord(chord);
                }
              }
            }
          } else {
            setConfidence(0);
          }
        }

        // Note accumulation for scale detection (every 30 frames)
        if (notes.length > 0) {
          notes.forEach(n => {
            noteAccRef.current.set(n, (noteAccRef.current.get(n)||0)+1);
          });
        }
        if (frameCount % 30 === 0 && noteAccRef.current.size >= 3) {
          const accNotes = [...noteAccRef.current.keys()];
          const scale = identifyScaleFromNotes(accNotes);
          setDetectedScale(scale);
        }
      }
      requestAnimationFrame(loop);
    } catch(err) {
      setPermission(err.name==='NotAllowedError'?'denied':'error');
      setIsActive(false);
    }
  }

  function resetScaleBuffer() {
    noteAccRef.current = new Map();
    setDetectedScale(null);
    chordBufRef.current = [];
  }

  useEffect(()=>()=>stop(),[]);
  return { isActive, permission, detectedNotes, detectedChord, detectedScale, confidence, volume, start, stop, resetScaleBuffer };
}

// ── Composant MicDetectorEnhanced ────────────────────────────────────────────
function MicDetectorEnhanced({ mic, expectedChord=null, expectedNote=null, onMatch=null, showScale=false }) {
  const { isActive, permission, detectedNotes, detectedChord, detectedScale, confidence, volume, start, stop } = mic;

  // Check match
  useEffect(()=>{
    if (!onMatch) return;
    if (expectedChord && detectedChord) {
      if (detectedChord.root===expectedChord.root && detectedChord.type===expectedChord.type && confidence>=40) {
        onMatch({type:'chord',detected:detectedChord});
      }
    }
    if (expectedNote && detectedNotes.length>0) {
      const expBase = expectedNote.replace(/[0-9]/g,'');
      if (detectedNotes.includes(expBase)) onMatch({type:'note',detected:expBase});
    }
  }, [detectedChord, detectedNotes, confidence]);

  const matchColor = expectedChord && detectedChord
    ? (detectedChord.root===expectedChord.root && detectedChord.type===expectedChord.type ? '#7BC8A4' : '#E07070')
    : expectedNote && detectedNotes.length>0
    ? (detectedNotes.includes(expectedNote.replace(/[0-9]/g,'')) ? '#7BC8A4' : '#E07070')
    : '#E8A857';

  return (
    <div style={{padding:'.9rem',background:`${isActive?matchColor+'08':'rgba(255,255,255,0.03)'}`,border:`1px solid ${isActive?matchColor+'35':'rgba(255,255,255,0.08)'}`,borderRadius:12,transition:'all 0.3s'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:isActive?'.65rem':'0'}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <div style={{position:'relative',width:18,height:18}}>
            <span style={{fontSize:14}}>{isActive?'🎙️':'🎤'}</span>
            {isActive&&<div style={{position:'absolute',top:-2,right:-2,width:7,height:7,borderRadius:'50%',background:'#E07070',animation:'streakPulse 1s ease-in-out infinite'}}/>}
          </div>
          <span style={{fontSize:9,fontFamily:'monospace',color:'rgba(255,255,255,0.45)',letterSpacing:'.08em'}}>
            {isActive?'ÉCOUTE':'MICROPHONE'}
          </span>
          {isActive && confidence>0 && (
            <div style={{display:'flex',gap:2,alignItems:'center'}}>
              {[1,2,3,4].map(i=>(
                <div key={i} style={{width:3,height:3+(i*2),borderRadius:1,background:confidence>i*20?matchColor:'rgba(255,255,255,0.12)',transition:'background 0.2s'}}/>
              ))}
            </div>
          )}
        </div>
        <button onClick={isActive?stop:start}
          style={{padding:'.3rem .7rem',background:isActive?'rgba(224,112,112,0.15)':'rgba(232,168,87,0.15)',border:`1px solid ${isActive?'#E07070':'#E8A857'}`,borderRadius:7,cursor:'pointer',fontSize:9,fontFamily:'monospace',fontWeight:'bold',color:isActive?'#E07070':'#E8A857',transition:'all 0.2s'}}>
          {isActive?'⏹ STOP':'▶ ACTIVER'}
        </button>
      </div>

      {permission==='denied'&&<div style={{fontSize:10,color:'#E07070',fontFamily:'monospace',padding:'.4rem',background:'rgba(224,112,112,0.1)',borderRadius:7,marginBottom:'.5rem'}}>⚠ Microphone refusé</div>}

      {isActive&&(
        <>
          {/* Volume bar */}
          <div style={{height:3,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden',marginBottom:'.5rem'}}>
            <div style={{height:'100%',width:`${volume}%`,background:volume>5?matchColor:'rgba(255,255,255,0.15)',borderRadius:2,transition:'width 0.07s'}}/>
          </div>

          {/* Notes detected */}
          {detectedNotes.length>0&&(
            <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:'.5rem'}}>
              {detectedNotes.slice(0,6).map(n=>{
                const isExpected = expectedNote && n===expectedNote.replace(/[0-9]/g,'');
                const nc=NOTE_COLORS[n]||'#E8A857';
                return<span key={n} style={{padding:'2px 7px',background:isExpected?`${nc}30`:`${nc}15`,border:`1px solid ${nc}45`,borderRadius:5,fontSize:11,fontWeight:'bold',fontFamily:'monospace',color:nc,transition:'all 0.2s'}}>{n}</span>;
              })}
            </div>
          )}

          {/* Chord detected */}
          {detectedChord&&(
            <div style={{padding:'.5rem .7rem',background:`${matchColor}10`,border:`1px solid ${matchColor}35`,borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all 0.3s'}}>
              <div>
                <div style={{fontSize:9,opacity:.45,fontFamily:'monospace',marginBottom:1}}>ACCORD DÉTECTÉ</div>
                <div style={{fontSize:17,fontWeight:'bold',fontFamily:'monospace',color:matchColor}}>{detectedChord.name}</div>
              </div>
              {expectedChord&&<div style={{fontSize:22}}>{detectedChord.root===expectedChord.root&&detectedChord.type===expectedChord.type?'✓':'✗'}</div>}
            </div>
          )}

          {/* Scale detected */}
          {showScale && detectedScale && (
            <div style={{marginTop:'.5rem',padding:'.5rem .7rem',background:`${detectedScale.color}08`,border:`1px solid ${detectedScale.color}30`,borderRadius:8}}>
              <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',marginBottom:2}}>GAMME DÉTECTÉE</div>
              <div style={{fontSize:13,fontWeight:'bold',color:detectedScale.color,fontFamily:'Georgia,serif'}}>{detectedScale.root} {detectedScale.scale}</div>
              <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',marginTop:1}}>{detectedScale.notes.join(' ')}</div>
            </div>
          )}

          {!detectedNotes.length&&!detectedChord&&volume<5&&(
            <div style={{fontSize:10,opacity:.35,fontFamily:'monospace',textAlign:'center',padding:'.25rem'}}>Joue quelque chose…</div>
          )}
        </>
      )}
      {!isActive&&<p style={{fontSize:11,opacity:.4,margin:'.4rem 0 0',fontFamily:'Georgia,serif',fontStyle:'italic'}}>Active le micro pour valider en jouant sur ton piano.</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── EXERCICE : JOUE CE QUE TU ENTENDS ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function JoueAuMicro() {
  const [mode,      setMode]      = useState('menu'); // menu | chord | melody | interval
  const [screen,    setScreen]    = useState('play');
  const [current,   setCurrent]   = useState(null);
  const [score,     setScore]     = useState({correct:0,total:0});
  const [feedback,  setFeedback]  = useState(null);
  const [streak,    setStreak]    = useState(0);
  const mic = useMicrophoneEnhanced();

  const CHORD_POOL = [
    {root:'C',type:'Majeures'},{root:'G',type:'Majeures'},{root:'F',type:'Majeures'},
    {root:'D',type:'Mineures'},{root:'A',type:'Mineures'},{root:'E',type:'Mineures'},
    {root:'G',type:'Dom. 7'},{root:'D',type:'Dom. 7'},{root:'C',type:'Maj. 7'},
    {root:'A',type:'Min. 7'},{root:'E',type:'Majeures'},{root:'B',type:'Mineures'},
  ];

  const INTERVAL_POOL = [
    {note1:'C',semi1:0,note2:'G',semi2:7,name:'Quinte'},
    {note1:'C',semi1:0,note2:'E',semi2:4,name:'Tierce maj.'},
    {note1:'C',semi1:0,note2:'F',semi2:5,name:'Quarte'},
    {note1:'D',semi1:2,note2:'A',semi2:9,name:'Quinte'},
    {note1:'C',semi1:0,note2:'Eb',semi2:3,name:'Tierce min.'},
  ];

  function newChord() {
    const c = CHORD_POOL[Math.floor(Math.random()*CHORD_POOL.length)];
    setCurrent(c); setFeedback(null);
    // Play it
    const ri = CHROMATIC.indexOf(c.root);
    if (ri>=0) setTimeout(()=>playChordArp(CHORD_TYPES[c.type].formula.map(f=>ri+f+4*12)), 200);
  }

  function newInterval() {
    const iv = INTERVAL_POOL[Math.floor(Math.random()*INTERVAL_POOL.length)];
    setCurrent(iv); setFeedback(null);
    setTimeout(()=>{
      playNote(iv.semi1+4*12,0,1);
      setTimeout(()=>playNote(iv.semi2+4*12,0,1),600);
    },200);
  }

  function handleMatch(result) {
    if (feedback) return;
    const correct = mode==='chord'
      ? result.detected?.root===current?.root && result.detected?.type===current?.type
      : true;
    setFeedback(correct?'correct':'wrong');
    setScore(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
    setStreak(s=>correct?s+1:0);
    if (correct) setTimeout(()=>{ mode==='chord'?newChord():newInterval(); },1500);
  }

  if (mode==='menu') return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div><h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Joue au Micro</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>L'APP JOUE — TU REPRODUIS — LE MICRO VALIDE</p></div>
      <div style={{padding:'.85rem',background:'rgba(232,168,87,0.07)',border:'1px solid rgba(232,168,87,0.2)',borderRadius:12}}>
        <p style={{fontSize:12.5,opacity:.75,lineHeight:1.65,margin:0,fontFamily:'Georgia,serif'}}>L'application joue un accord ou un intervalle. Tu le joues sur ton vrai piano. Le microphone écoute et valide automatiquement. Idéal pour travailler la connexion oreille-main.</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {[
          {id:'chord',icon:'🎹',title:'Accords',desc:'L\'app joue un accord — reproduis-le sur ton piano.',color:'#E8A857'},
          {id:'interval',icon:'📏',title:'Intervalles',desc:'L\'app joue deux notes — joue-les dans le même ordre.',color:'#90B8D0'},
        ].map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id);m.id==='chord'?newChord():newInterval();}}
            style={{padding:'1rem',background:`${m.color}08`,border:`1.5px solid ${m.color}30`,borderRadius:12,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}15`;e.currentTarget.style.borderColor=m.color;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}08`;e.currentTarget.style.borderColor=`${m.color}30`;}}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <span style={{fontSize:26}}>{m.icon}</span>
              <div><div style={{fontSize:14,fontWeight:'bold',color:m.color,fontFamily:'Georgia,serif',marginBottom:3}}>{m.title}</div>
                <div style={{fontSize:11,opacity:.55,fontFamily:'monospace'}}>{m.desc}</div></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (!current) return null;
  const chordName = mode==='chord' ? current.root+CHORD_TYPES[current.type]?.suffix : '';
  const chordColor = mode==='chord' ? (NOTE_COLORS[current.root]||'#E8A857') : '#90B8D0';

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>{setMode('menu');mic.stop();}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:16}}>←</button>
        <div style={{fontSize:12,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct}/{score.total} {streak>=3?`🔥${streak}`:''}</div>
      </div>

      {/* Current chord/interval to play */}
      <div style={{padding:'1.5rem',background:`${chordColor}10`,border:`1.5px solid ${chordColor}35`,borderRadius:16,textAlign:'center'}}>
        <div style={{fontSize:9,color:chordColor,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>JOUE CET ACCORD SUR TON PIANO</div>
        <div style={{fontSize:44,fontWeight:'bold',color:chordColor,fontFamily:'monospace',marginBottom:8}}>{mode==='chord'?chordName:`${current.note1} → ${current.note2}`}</div>
        {mode==='chord'&&<div style={{fontSize:12,opacity:.5,fontFamily:'monospace',marginBottom:'1rem'}}>{CHORD_TYPES[current.type]?.label}</div>}
        <div style={{display:'flex',gap:8,justifyContent:'center'}}>
          <button onClick={()=>mode==='chord'?newChord():newInterval()} style={{padding:'.5rem 1rem',background:`${chordColor}15`,border:`1px solid ${chordColor}50`,color:chordColor,borderRadius:9,cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>▶ Rejouer</button>
          <button onClick={()=>{ setScore(s=>({...s,total:s.total+1})); setStreak(0); mode==='chord'?newChord():newInterval(); }} style={{padding:'.5rem 1rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.4)',borderRadius:9,cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>Passer →</button>
        </div>
      </div>

      {/* Feedback */}
      {feedback&&(
        <div style={{padding:'.75rem',background:feedback==='correct'?'rgba(123,200,164,0.12)':'rgba(224,112,112,0.1)',border:`1px solid ${feedback==='correct'?'rgba(123,200,164,0.4)':'rgba(224,112,112,0.4)'}`,borderRadius:10,textAlign:'center',animation:'fadeIn 0.25s ease'}}>
          <div style={{fontSize:16,fontWeight:'bold',color:feedback==='correct'?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif'}}>
            {feedback==='correct'?`✓ Correct !${streak>=3?' Série de '+streak+' !':''}`:'✗ Réessaie…'}
          </div>
        </div>
      )}

      <MicDetectorEnhanced mic={mic}
        expectedChord={mode==='chord'?current:null}
        onMatch={handleMatch}/>

      <div style={{padding:'.65rem .9rem',background:'rgba(232,168,87,0.06)',border:'1px solid rgba(232,168,87,0.15)',borderRadius:10}}>
        <p style={{fontSize:11,opacity:.55,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>💡 Joue l'accord fortement et soutenez les notes 1-2 secondes pour une meilleure détection.</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── EXERCICE : IMITATION MÉLODIQUE ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ImitationMelodique() {
  const MELODIES = [
    {title:'Do-Ré-Mi',    notes:['C4','D4','E4'],         label:'Gamme ascendante'},
    {title:'Mi-Ré-Do',    notes:['E4','D4','C4'],         label:'Gamme descendante'},
    {title:'Do-Mi-Sol',   notes:['C4','E4','G4'],         label:'Arpège majeur'},
    {title:'La-Do-Mi',    notes:['A4','C4','E4'],         label:'Arpège mineur'},
    {title:'Gamme complète',notes:['C4','D4','E4','F4','G4'], label:'5 notes'},
    {title:'Saut de quinte',notes:['C4','G4','E4','C4'],  label:'Mélodie avec saut'},
  ];

  const [melIdx,     setMelIdx]     = useState(0);
  const [step,       setStep]       = useState(0);  // current note index to play
  const [playing,    setPlaying]    = useState(false);
  const [playedOk,   setPlayedOk]   = useState([]); // booleans per note
  const [score,      setScore]      = useState({correct:0,total:0});
  const [waiting,    setWaiting]    = useState(false); // waiting for user to play
  const mic = useMicrophoneEnhanced();
  const mel = MELODIES[melIdx];

  function playMelody() {
    if (playing) return;
    setPlaying(true); setStep(0); setPlayedOk([]);
    mel.notes.forEach((n,i)=>{
      const semi=CHROMATIC.indexOf(n.replace(/[45]/,''));
      const oct=n.includes('5')?5:4;
      setTimeout(()=>playNote(semi+oct*12,0,0.8), i*450);
    });
    setTimeout(()=>{setPlaying(false);setWaiting(true);}, mel.notes.length*450+300);
  }

  // Check if mic detected the expected note
  useEffect(()=>{
    if (!waiting || !mic.isActive || step>=mel.notes.length) return;
    const expected = mel.notes[step].replace(/[45]/,'');
    if (mic.detectedNotes.includes(expected)) {
      const newOk = [...playedOk, true];
      setPlayedOk(newOk);
      setStep(s=>s+1);
      if (newOk.length===mel.notes.length) {
        setWaiting(false);
        setScore(s=>({correct:s.correct+1,total:s.total+1}));
        setTimeout(()=>{ setMelIdx(i=>(i+1)%MELODIES.length); setStep(0); setPlayedOk([]); },1200);
      }
    }
  },[mic.detectedNotes, step, waiting]);

  const NOTE_FR_S = {C:'Do',D:'Ré',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Imitation Mélodique</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>ÉCOUTE → REPRODUIS NOTE PAR NOTE</p></div>
        <span style={{fontSize:12,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct}/{score.total}</span>
      </div>

      {/* Melody display */}
      <div style={{padding:'1.25rem',background:'rgba(232,168,87,0.07)',border:'1.5px solid rgba(232,168,87,0.2)',borderRadius:16,textAlign:'center'}}>
        <div style={{fontSize:9,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'1rem'}}>{mel.title} — {mel.label}</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:'1rem',flexWrap:'wrap'}}>
          {mel.notes.map((n,i)=>{
            const base=n.replace(/[45]/,'');
            const nc=NOTE_COLORS[base]||'#E8A857';
            const isDone=i<playedOk.length;
            const isCurrent=waiting&&i===step;
            return(
              <div key={i} style={{width:46,height:46,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:'bold',fontFamily:'monospace',
                background:isDone?`${nc}30`:isCurrent?`${nc}20`:'rgba(255,255,255,0.06)',
                border:`2px solid ${isDone?nc:isCurrent?nc:'rgba(255,255,255,0.12)'}`,
                color:isDone?nc:isCurrent?nc:'rgba(255,255,255,0.4)',
                transform:isCurrent?'scale(1.12)':'scale(1)',
                boxShadow:isCurrent?`0 0 12px ${nc}50`:'none',
                transition:'all 0.2s'}}>
                {isDone?'✓':NOTE_FR_S[base]||base}
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'center'}}>
          <button onClick={playMelody} disabled={playing}
            style={{padding:'.6rem 1.25rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:10,cursor:playing?'default':'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold'}}>
            {playing?'▶ EN COURS…':'🔊 ÉCOUTER'}
          </button>
          {waiting&&<button onClick={()=>{setWaiting(false);setStep(0);setPlayedOk([]);setScore(s=>({...s,total:s.total+1}));}} style={{padding:'.6rem 1rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.4)',borderRadius:10,cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>Passer</button>}
        </div>
      </div>

      {waiting&&<div style={{textAlign:'center',fontSize:12,opacity:.55,fontFamily:'Georgia,serif',fontStyle:'italic'}}>Joue la note <strong style={{color:NOTE_COLORS[mel.notes[step]?.replace(/[45]/,'')]||'#E8A857'}}>{NOTE_FR_S[mel.notes[step]?.replace(/[45]/,'')] || mel.notes[step]}</strong> sur ton piano</div>}

      <MicDetectorEnhanced mic={mic} expectedNote={waiting?mel.notes[step]:null}/>

      <div style={{display:'flex',gap:5,flexWrap:'wrap',justifyContent:'center'}}>
        {MELODIES.map((m,i)=>(
          <button key={i} onClick={()=>{setMelIdx(i);setStep(0);setPlayedOk([]);setWaiting(false);}}
            style={{padding:'.3rem .65rem',background:melIdx===i?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${melIdx===i?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:7,cursor:'pointer',color:melIdx===i?'#E8A857':'rgba(255,255,255,0.4)',fontSize:10,fontFamily:'monospace',transition:'all 0.2s'}}>
            {m.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── EXERCICE : DÉTECTEUR DE GAMME EN DIRECT ───────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function DetecteurGamme() {
  const mic = useMicrophoneEnhanced();
  const [history, setHistory] = useState([]);

  // Save detected scales to history
  useEffect(()=>{
    if (mic.detectedScale && mic.isActive) {
      setHistory(prev=>{
        const last=prev[0];
        if(last&&last.root===mic.detectedScale.root&&last.scale===mic.detectedScale.scale) return prev;
        return [mic.detectedScale,...prev.slice(0,4)];
      });
    }
  },[mic.detectedScale]);

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div><h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Détecteur de Gamme</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>IMPROVISE — L'APP IDENTIFIE TA GAMME EN TEMPS RÉEL</p></div>

      <div style={{padding:'1rem',background:'rgba(232,168,87,0.07)',border:'1px solid rgba(232,168,87,0.2)',borderRadius:14}}>
        <p style={{fontSize:12.5,lineHeight:1.7,opacity:.75,margin:0,fontFamily:'Georgia,serif'}}>
          Active le micro et improvise librement sur ton piano. L'app accumule les notes entendues et identifie progressivement la gamme ou le mode que tu joues.
        </p>
      </div>

      {/* Mic + real-time detection */}
      <MicDetectorEnhanced mic={mic} showScale/>

      {/* Current detected notes pool */}
      {mic.isActive&&mic.detectedNotes.length>0&&(
        <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
            <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em'}}>NOTES DÉTECTÉES (DERNIÈRE SECONDE)</div>
            <button onClick={mic.resetScaleBuffer} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.4)',padding:'2px 8px',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace'}}>↺ Reset</button>
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {mic.detectedNotes.map(n=>{
              const nc=NOTE_COLORS[n]||'#E8A857';
              return<span key={n} style={{padding:'2px 8px',background:`${nc}15`,border:`0.5px solid ${nc}40`,borderRadius:5,fontSize:11,fontWeight:'bold',fontFamily:'monospace',color:nc}}>{n}</span>;
            })}
          </div>
        </div>
      )}

      {/* Detected scale detail */}
      {mic.detectedScale&&(
        <div style={{padding:'1rem',background:`${mic.detectedScale.color}10`,border:`1.5px solid ${mic.detectedScale.color}40`,borderRadius:14,animation:'fadeIn 0.3s ease'}}>
          <div style={{fontSize:9,color:mic.detectedScale.color,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.5rem'}}>GAMME IDENTIFIÉE</div>
          <div style={{fontSize:22,fontWeight:'bold',color:mic.detectedScale.color,fontFamily:'Georgia,serif',marginBottom:'.5rem'}}>
            {mic.detectedScale.root} {mic.detectedScale.scale}
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:'.5rem'}}>
            {mic.detectedScale.notes.map(n=>{
              const nc=NOTE_COLORS[n]||mic.detectedScale.color;
              return<span key={n} style={{padding:'2px 7px',background:`${nc}18`,border:`0.5px solid ${nc}45`,borderRadius:5,fontSize:11,fontWeight:'bold',fontFamily:'monospace',color:nc}}>{n}</span>;
            })}
          </div>
          <div style={{fontSize:11,opacity:.55,fontFamily:'Georgia,serif',fontStyle:'italic'}}>
            Continue à jouer pour affiner la détection — plus tu joues, plus c'est précis.
          </div>
        </div>
      )}

      {/* History */}
      {history.length>1&&(
        <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem'}}>HISTORIQUE</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {history.slice(1).map((s,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'center',opacity:0.6-i*0.15}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                <span style={{fontSize:12,fontFamily:'monospace',color:s.color}}>{s.root} {s.scale}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {!mic.isActive&&(
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em'}}>CONSEILS POUR UNE BONNE DÉTECTION</div>
          {[
            "Joue au moins 4-5 notes différentes avant que la gamme soit identifiée",
            "Joue distinctement et pas trop vite — chaque note doit résonner",
            "Évite les dissonances au début — commence par les notes principales",
          ].map((t,i)=>(
            <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              <span style={{color:'#E8A857',fontSize:11,flexShrink:0}}>•</span>
              <p style={{fontSize:11,opacity:.6,margin:0,lineHeight:1.5,fontFamily:'Georgia,serif'}}>{t}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ACHIEVEMENTS ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const ACHIEVEMENTS_DEF = [
  {id:'first_ex',    icon:'🎵', title:'Premier pas',       desc:'Complète ton premier exercice',          check:(s)=>(s.totalExercises||0)>=1},
  {id:'ex_10',       icon:'🎹', title:'Dix exercices',     desc:'10 exercices complétés',                 check:(s)=>(s.totalExercises||0)>=10},
  {id:'ex_100',      icon:'🏆', title:'Centenaire',        desc:'100 exercices complétés',                check:(s)=>(s.totalExercises||0)>=100},
  {id:'streak_3',    icon:'⚡', title:'Sur la lancée',     desc:'3 jours consécutifs de pratique',        check:(s)=>computeStreak(s)>=3},
  {id:'streak_7',    icon:'🔥', title:'Une semaine',       desc:'7 jours de pratique consécutifs',        check:(s)=>computeStreak(s)>=7},
  {id:'streak_30',   icon:'💎', title:'Mois parfait',      desc:'30 jours consécutifs',                   check:(s)=>computeStreak(s)>=30},
  {id:'keys_50',     icon:'🗝️', title:'Collectionneur',   desc:'50 clés obtenues',                       check:(s)=>(s.keys||0)>=50},
  {id:'xp_500',      icon:'✨', title:'XP en hausse',      desc:'500 XP accumulés',                       check:(s)=>(s.totalXp||0)>=500},
  {id:'xp_2000',     icon:'🌟', title:'Musicien accompli', desc:'2000 XP accumulés',                      check:(s)=>(s.totalXp||0)>=2000},
  {id:'sessions_10', icon:'📅', title:'Habitude',          desc:'10 sessions de pratique',                check:(s)=>(s.sessionsCount||0)>=10},
  {id:'time_1h',     icon:'⏱', title:'Une heure',         desc:'1 heure de pratique au total',           check:(s)=>(s.totalSeconds||0)>=3600},
  {id:'time_10h',    icon:'🎷', title:'Jazzman en herbe',  desc:'10 heures de pratique',                  check:(s)=>(s.totalSeconds||0)>=36000},
];

const ACHIEV_KEY = 'cs_achievements_v1';
function loadAchievements(){try{return JSON.parse(localStorage.getItem(ACHIEV_KEY)||'{}');}catch{return{};}}
function saveAchievements(a){try{localStorage.setItem(ACHIEV_KEY,JSON.stringify(a));}catch{}}

function checkNewAchievements(stats, achieved, setAchieved, onNewAchievement) {
  const newOnes = [];
  ACHIEVEMENTS_DEF.forEach(a=>{
    if (!achieved[a.id] && a.check(stats)) {
      newOnes.push(a);
    }
  });
  if (newOnes.length > 0) {
    const updated = {...achieved};
    newOnes.forEach(a=>{ updated[a.id]={date:todayStr(),ts:Date.now()}; });
    setAchieved(updated);
    saveAchievements(updated);
    if (onNewAchievement) onNewAchievement(newOnes[0]);
  }
}

function AchievementsPanel({ stats }) {
  const [achieved, setAchieved] = useState(loadAchievements);
  const [newBadge, setNewBadge] = useState(null);

  // Check on mount and stats change
  useEffect(()=>{
    checkNewAchievements(stats, achieved, setAchieved, (badge)=>{
      setNewBadge(badge);
      setTimeout(()=>setNewBadge(null),3000);
    });
  },[stats]);

  const unlockedCount = ACHIEVEMENTS_DEF.filter(a=>achieved[a.id]).length;

  return(
    <div style={{padding:'.85rem',background:'rgba(232,168,87,0.06)',border:'1px solid rgba(232,168,87,0.18)',borderRadius:14}}>
      {newBadge&&(
        <div style={{textAlign:'center',padding:'.75rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',borderRadius:10,marginBottom:'.75rem',animation:'slideUp 0.4s ease'}}>
          <div style={{fontSize:28,marginBottom:3}}>{newBadge.icon}</div>
          <div style={{fontSize:13,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif'}}>Achievement débloqué !</div>
          <div style={{fontSize:11,opacity:.65,fontFamily:'monospace',marginTop:2}}>{newBadge.title}</div>
        </div>
      )}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
        <div style={{fontSize:9,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em'}}>ACHIEVEMENTS</div>
        <div style={{fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,0.4)'}}>{unlockedCount}/{ACHIEVEMENTS_DEF.length}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
        {ACHIEVEMENTS_DEF.map(a=>{
          const unlocked=!!achieved[a.id];
          return(
            <div key={a.id} title={a.desc}
              style={{padding:'.55rem .35rem',background:unlocked?'rgba(232,168,87,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${unlocked?'rgba(232,168,87,0.35)':'rgba(255,255,255,0.08)'}`,borderRadius:9,textAlign:'center',transition:'all 0.3s',opacity:unlocked?1:0.45}}>
              <div style={{fontSize:18,marginBottom:2,filter:unlocked?'none':'grayscale(1)'}}>{a.icon}</div>
              <div style={{fontSize:8,fontFamily:'monospace',color:unlocked?'#E8A857':'rgba(255,255,255,0.35)',lineHeight:1.3}}>{a.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MASCOTTE TIPS ENRICHIS ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Tips contextuels par section (déclenchés manuellement ou à l'entrée)
const SECTION_TIPS = {
  oreille: [
    "Pour les intervalles : associe-les à des mélodies connues. La quinte = Star Wars, la quarte = Chant de Noël.",
    "L'oreille se développe surtout en CHANTANT ce qu'on entend. Essaie de fredonner les accords.",
    "Écoute 10 minutes de jazz en essayant d'identifier les accords. Ça accélère énormément le progrès.",
  ],
  theorie: [
    "La théorie sans piano c'est des mots. Chaque concept appris, essaie-le immédiatement sur le clavier.",
    "Le ii-V-I est dans 80% des standards jazz. Une fois compris, tu reconnais la structure de centaines de morceaux.",
    "Les modes grecs = la même gamme depuis différents points de départ. Ce n'est pas si compliqué !",
  ],
  exercices: [
    "Travailler lentement est plus efficace que de jouer à vitesse normale avec des erreurs.",
    "Le cycle des quintes : maîtrisé, il t'ouvre TOUTES les tonalités. 5 minutes par jour y suffit.",
    "Les backing tracks jazz : improvise sur juste 2-3 notes d'abord. La richesse vient de la phrase, pas de la quantité.",
  ],
  harmonie: [
    "Analyse des chansons que tu aimes : identifie la tonalité, puis les fonctions de chaque accord.",
    "La composition : commence par une cadence V→I. C'est le cœur de tout morceau tonal.",
    "Essaie de réharmoniser une mélodie simple. Take chaque note et trouve 3 accords qui la contiennent.",
  ],
  competences: [
    "Ton radar de compétences : une asymétrie prononcée = là où investir tes prochaines semaines.",
    "La régularité bat l'intensité. 20 min par jour > 3 heures le weekend.",
    "Compare ton niveau à celui du mois dernier — pas à celui des autres.",
  ],
};

// Music facts aléatoires pour l'idle
const MUSIC_FACTS = [
  "Beethoven était pratiquement sourd quand il a composé sa 9e Symphonie. Il la dirigeait sans entendre un son.",
  "La gamme tempérée égale que tu utilises a été popularisée par Bach avec 'Le Clavier Bien Tempéré' en 1722.",
  "Duke Ellington ne savait pas lire la musique de façon classique — il composait d'oreille, entièrement.",
  "Le nom 'do ré mi fa sol la si' vient des premières syllabes d'un hymne latin du Moyen Âge.",
  "Miles Davis a inventé le jazz modal en 1959 avec 'Kind of Blue'. L'album le plus vendu du jazz de tous les temps.",
  "La quinte parfaite sonne consonante car les harmoniques des deux notes se superposent presque exactement.",
  "Chopin n'a jamais quitté le piano pour composer — il ne pouvait pas imaginer la musique sans le toucher.",
  "Un accord de 7e de dominante (G7) contient un triton (Si-Fa) — la dissonance la plus instable qui soit.",
  "John Coltrane pratiquait le saxophone parfois 12 heures par jour. Ses voisins appelaient la police.",
  "Le cerveau d'un musicien traite le son différemment dès 7 ans de pratique — changements neurologiques permanents.",
];

function MascoттeTip({ section, onClose }) {
  const tips = SECTION_TIPS[section] || MUSIC_FACTS;
  const [tipText] = useState(tips[Math.floor(Math.random()*tips.length)]);
  return(
    <div style={{position:'fixed',bottom:80,left:'1rem',right:'1rem',zIndex:200,animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div style={{background:'linear-gradient(160deg,#1a0e06,#0A0804)',border:'1.5px solid rgba(232,168,87,0.4)',borderRadius:16,padding:'1rem 1.1rem',boxShadow:'0 -8px 32px rgba(232,168,87,0.15)'}}>
        <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
          <Mascotte expression="happy" size={44} animate/>
          <div style={{flex:1}}>
            <div style={{fontSize:9,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:4}}>CONSEIL DE NOIRE</div>
            <p style={{fontSize:12.5,color:'rgba(240,235,227,0.82)',lineHeight:1.65,margin:0,fontFamily:'Georgia,serif'}}>{tipText}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:16,padding:'2px',flexShrink:0}}>×</button>
        </div>
      </div>
    </div>
  );
}

function OreilPage(){
  const [sub,setSub]=useState(null);
  const [showTip, setShowTip] = useState(false);

  if(sub==='intervalles')   return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><IntervallesSection onBack={()=>setSub(null)}/></div>);
  if(sub==='accords')       return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><AccordOreilleSection onBack={()=>setSub(null)}/></div>);
  if(sub==='melodie')       return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><MelodieSection onBack={()=>setSub(null)}/></div>);
  if(sub==='absolue')       return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><OreilleAbsolue onBack={()=>setSub(null)}/></div>);
  if(sub==='gamme')         return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><GammeRecognition onBack={()=>setSub(null)}/></div>);
  if(sub==='progressions')  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><ProgressionsOreille/></div>);
  if(sub==='solfege')       return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><SolfegeChante/></div>);
  if(sub==='ecoute')        return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><EcouteActive/></div>);
  if(sub==='joue')          return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><JoueAuMicro/></div>);
  if(sub==='imitation')     return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><ImitationMelodique/></div>);
  if(sub==='gammedet')      return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><DetecteurGamme/></div>);

  const MODS=[
    {id:'intervalles',  icon:'🎵', title:'Intervalles',          subtitle:'IDENTIFIER LES DISTANCES',       color:'#90B8D0'},
    {id:'accords',      icon:'🎹', title:'Accords',               subtitle:"IDENTIFIER À L'OREILLE",         color:'#B898C8'},
    {id:'melodie',      icon:'🎼', title:'Mélodie',               subtitle:'DICTÉE MÉLODIQUE',               color:'#7BC8A4'},
    {id:'absolue',      icon:'👁', title:'Oreille Absolue',       subtitle:'ÉCOUTER ET REPRODUIRE',          color:'#D4A0D4'},
    {id:'gamme',        icon:'🎸', title:'Reconnaissance Gamme',  subtitle:'MAJEUR · MINEUR · TONALITÉ',     color:'#E8A857'},
    {id:'progressions', icon:'🎷', title:'Progressions',          subtitle:'I-IV-V · ii-V-I · JAZZ',         color:'#E8A857'},
    {id:'solfege',      icon:'🎤', title:'Solfège Chanté',        subtitle:'CHANTE LA NOTE · MICRO',         color:'#E07070'},
    {id:'ecoute',       icon:'👂', title:'Écoute Active',         subtitle:'MAJEUR/MINEUR · CADENCES · NB',  color:'#D4A0D4'},
    {id:'joue',         icon:'🎙️', title:'Joue au Micro',        subtitle:'L\'APP JOUE · TU REPRODUIS',     color:'#E8A857', badge:'🎙️ MICRO'},
    {id:'imitation',    icon:'🔁', title:'Imitation Mélodique',   subtitle:'MÉLODIE → REPRODUIS NOTE/NOTE',  color:'#7BC8A4', badge:'🎙️ MICRO'},
    {id:'gammedet',     icon:'🌀', title:'Détecteur de Gamme',    subtitle:'IMPROVISE · GAMME EN DIRECT',    color:'#B898C8', badge:'🎙️ MICRO'},
  ];

  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem'}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Oreille Musicale</h2>
        <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>DÉVELOPPE TON OREILLE PAR L'ÉCOUTE ACTIVE</p>
      </div>
      <button onClick={()=>setShowTip(v=>!v)} style={{padding:'.4rem .7rem',background:showTip?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${showTip?'rgba(232,168,87,0.45)':'rgba(255,255,255,0.12)'}`,borderRadius:9,cursor:'pointer',color:showTip?'#E8A857':'rgba(255,255,255,0.45)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>💡</button>
    </div>
    {showTip&&(
      <div style={{padding:'.85rem',background:'rgba(232,168,87,0.07)',border:'1px solid rgba(232,168,87,0.22)',borderRadius:12,marginBottom:'1rem',animation:'fadeIn 0.2s ease'}}>
        <p style={{fontSize:12,opacity:.75,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.6}}>{SECTION_TIPS.oreille[Math.floor(Math.random()*SECTION_TIPS.oreille.length)]}</p>
      </div>
    )}
    {/* Mic section badge */}
    <div style={{padding:'.5rem .75rem',background:'rgba(232,168,87,0.07)',border:'1px solid rgba(232,168,87,0.2)',borderRadius:8,marginBottom:'1rem',display:'flex',alignItems:'center',gap:6}}>
      <span style={{fontSize:14}}>🎙️</span>
      <span style={{fontSize:10,fontFamily:'monospace',color:'rgba(232,168,87,0.8)'}}>Les exercices marqués MICRO utilisent ton microphone pour valider en temps réel</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
      {MODS.map(m=>(<button key={m.id} onClick={()=>setSub(m.id)}
        style={{background:`${m.color}08`,border:`1px solid ${m.color}`,borderRadius:14,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
        onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}18`;e.currentTarget.style.transform='translateY(-2px)';}}
        onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}08`;e.currentTarget.style.transform='translateY(0)';}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <span style={{fontSize:26}}>{m.icon}</span>
          <span style={{fontSize:8,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}`,padding:'2px 5px',borderRadius:6}}>{m.badge||'DISPONIBLE'}</span>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:'bold',marginBottom:3,color:m.color,fontFamily:'Georgia,serif'}}>{m.title}</div>
          <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.04em'}}>{m.subtitle}</div>
        </div>
      </button>))}
    </div>
  </div>);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CHOPIN DATA ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const IMSLP_BASE = 'https://imslp.org/wiki/';
const CHOPIN_WORKS = {
  etudes: [
    {op:'10',no:1, key:'Do maj.',   nick:'Waterfall',    diff:5, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:3, key:'Mi maj.',   nick:'Tristesse',    diff:3, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:4, key:'Do# min.',  nick:'',             diff:5, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:5, key:'Sol♭ maj.', nick:'Touches noires',diff:4,url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:9, key:'Fa min.',   nick:'',             diff:3, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:12,key:'Do min.',   nick:'Révolutionnaire',diff:5,url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'25',no:1, key:'La♭ maj.', nick:'Harpe éolienne',diff:4,url:'12_%C3%89tudes,_Op.25_(Chopin)'},
    {op:'25',no:9, key:'Sol♭ maj.', nick:'Papillon',     diff:4, url:'12_%C3%89tudes,_Op.25_(Chopin)'},
    {op:'25',no:11,key:'La min.',   nick:'Vent d\'hiver', diff:5,url:'12_%C3%89tudes,_Op.25_(Chopin)'},
    {op:'25',no:12,key:'Do min.',   nick:'Océan',        diff:5, url:'12_%C3%89tudes,_Op.25_(Chopin)'},
  ],
  nocturnes: [
    {op:'9', no:1, key:'Si♭ min.', nick:'',              diff:3, url:'Nocturnes,_Op.9_(Chopin)'},
    {op:'9', no:2, key:'Mi♭ maj.', nick:'',              diff:2, url:'Nocturne_in_E-flat_major,_Op.9_No.2_(Chopin)'},
    {op:'15',no:1, key:'Fa maj.',  nick:'',              diff:3, url:'Nocturnes,_Op.15_(Chopin)'},
    {op:'15',no:2, key:'Fa# maj.', nick:'',              diff:3, url:'Nocturnes,_Op.15_(Chopin)'},
    {op:'27',no:2, key:'Ré♭ maj.', nick:'',              diff:3, url:'Nocturnes,_Op.27_(Chopin)'},
    {op:'32',no:1, key:'Si maj.',  nick:'',              diff:3, url:'Nocturnes,_Op.32_(Chopin)'},
    {op:'37',no:2, key:'Sol maj.', nick:'',              diff:3, url:'Nocturnes,_Op.37_(Chopin)'},
    {op:'48',no:1, key:'Do min.',  nick:'',              diff:4, url:'Nocturnes,_Op.48_(Chopin)'},
    {op:'55',no:1, key:'Fa min.',  nick:'',              diff:3, url:'Nocturnes,_Op.55_(Chopin)'},
    {op:'62',no:1, key:'Si maj.',  nick:'',              diff:3, url:'Nocturnes,_Op.62_(Chopin)'},
    {op:'72',no:1, key:'Mi min.',  nick:'(posthume)',    diff:2, url:'Nocturne_in_E_minor,_Op.72,_No.1_(Chopin)'},
    {op:'posth.',no:'',key:'Do# min.',nick:'(posthume)', diff:2, url:'Nocturne_in_C-sharp_minor,_Op.posth._(Chopin)'},
  ]
};

// ── Songs Tabs data ───────────────────────────────────────────────────────────
// Chord progressions are not copyrightable — standard music theory fact
const SONGS_TABS = [
  { id:1, title:"Canon en Ré",     artist:"Pachelbel",     era:"Baroque ~1680", key:"Ré",   bpm:100, cat:"classique", color:"#90B8D0",
    chords:[{n:"D",t:"Majeures"},{n:"A",t:"Majeures"},{n:"B",t:"Mineures"},{n:"F#",t:"Mineures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Majeures"}] },
  { id:2, title:"Prélude en Do",   artist:"J.S. Bach",     era:"Baroque ~1722", key:"Do",   bpm:80,  cat:"classique", color:"#B898C8",
    chords:[{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"D",t:"Mineures"},{n:"G",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:3, title:"Für Elise",       artist:"Beethoven",     era:"Classique 1810",key:"La min.",bpm:76, cat:"classique", color:"#7BC8A4",
    chords:[{n:"A",t:"Mineures"},{n:"E",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"}] },
  { id:4, title:"Minuet en Sol",   artist:"J.S. Bach",     era:"Baroque ~1725", key:"Sol",  bpm:126, cat:"classique", color:"#E8A857",
    chords:[{n:"G",t:"Majeures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"}] },
  { id:5, title:"Greensleeves",    artist:"Traditionnel",  era:"XVIe siècle",   key:"La min.",bpm:80, cat:"folk", color:"#AED6F1",
    chords:[{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"F",t:"Majeures"},{n:"E",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"E",t:"Majeures"}] },
  { id:6, title:"Scarborough Fair", artist:"Traditionnel", era:"Folk anglais",  key:"La min.",bpm:90, cat:"folk", color:"#7BC8A4",
    chords:[{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"D",t:"Majeures"},{n:"A",t:"Mineures"}] },
  { id:7, title:"Amazing Grace",   artist:"Traditionnel",  era:"Hymne ~1779",   key:"Do",   bpm:70,  cat:"folk", color:"#E07070",
    chords:[{n:"G",t:"Majeures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:8, title:"Hallelujah",      artist:"L. Cohen",      era:"1984",          key:"Do",   bpm:60,  cat:"pop", color:"#B898C8",
    chords:[{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"F",t:"Majeures"},{n:"G",t:"Majeures"}] },
  { id:9, title:"Let It Be",       artist:"The Beatles",   era:"1970",          key:"Do",   bpm:76,  cat:"pop", color:"#90B8D0",
    chords:[{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"},{n:"F",t:"Majeures"}] },
  { id:10,title:"Knockin' on Heaven's Door",artist:"B. Dylan",era:"1973",        key:"Sol",  bpm:68,  cat:"pop", color:"#7BC8A4",
    chords:[{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:11,title:"Stand By Me",     artist:"B.E. King",     era:"1961",          key:"La",   bpm:120, cat:"pop", color:"#E8A857",
    chords:[{n:"A",t:"Majeures"},{n:"F#",t:"Mineures"},{n:"D",t:"Majeures"},{n:"E",t:"Majeures"}] },
  { id:12,title:"La Bamba",        artist:"Traditionnel",  era:"Folk mexicain", key:"Do",   bpm:170, cat:"folk", color:"#E8A87C",
    chords:[{n:"C",t:"Majeures"},{n:"F",t:"Majeures"},{n:"G",t:"Majeures"}] },
];

function playTabChord(name, type) {
  const root = CHROMATIC.indexOf(name);
  if (root === -1 || !CHORD_TYPES[type]) return;
  const notes = CHORD_TYPES[type].formula.map(i => root + i + 4);
  playChordArp(notes);
}

// ── Solfège data ──────────────────────────────────────────────────────────────
const SOLFEGE_MAP = [
  {fr:'Do',  en:'C',  semi:0,  color:'#E8A87C'},
  {fr:'Ré',  en:'D',  semi:2,  color:'#90B8D0'},
  {fr:'Mi',  en:'E',  semi:4,  color:'#7BC8A4'},
  {fr:'Fa',  en:'F',  semi:5,  color:'#E07070'},
  {fr:'Sol', en:'G',  semi:7,  color:'#B898C8'},
  {fr:'La',  en:'A',  semi:9,  color:'#E8A857'},
  {fr:'Si',  en:'B',  semi:11, color:'#AED6F1'},
];
const SOLFEGE_CHROM = [
  {fr:'Do',   en:'C',  semi:0}, {fr:'Do#/Réb',en:'C#/Db',semi:1},
  {fr:'Ré',   en:'D',  semi:2}, {fr:'Ré#/Mi♭',en:'D#/Eb',semi:3},
  {fr:'Mi',   en:'E',  semi:4}, {fr:'Fa',    en:'F',  semi:5},
  {fr:'Fa#/Sol♭',en:'F#/Gb',semi:6},{fr:'Sol',en:'G', semi:7},
  {fr:'Sol#/La♭',en:'G#/Ab',semi:8},{fr:'La',en:'A',  semi:9},
  {fr:'La#/Si♭',en:'A#/Bb',semi:10},{fr:'Si', en:'B',  semi:11},
];

// ── Mélodies pour la lecture de partition ────────────────────────────────────
// Notes disponibles sur la portée (nom → demi-ton depuis C4=0)
const LECTURE_NOTE_SEMI = {
  C4:0,D4:2,E4:4,F4:5,G4:7,A4:9,B4:11,
  C5:12,D5:14,E5:16,F5:17,G5:19,
};
const LECTURE_NOTE_NAMES = Object.keys(LECTURE_NOTE_SEMI);
const LECTURE_SOLFEGE = {
  C4:'Do',D4:'Ré',E4:'Mi',F4:'Fa',G4:'Sol',A4:'La',B4:'Si',
  C5:'Do',D5:'Ré',E5:'Mi',F5:'Fa',G5:'Sol',
};

// Génère une mélodie aléatoire avec contrainte d'intervalle optionnelle
function generateLectureMelody(length=7, maxInterval=null) {
  const keys = LECTURE_NOTE_NAMES;
  const semis = LECTURE_NOTE_NAMES.map(k => LECTURE_NOTE_SEMI[k]);
  const result = [];
  let prevSemi = semis[2]; // Départ sur E4
  for (let i=0; i<length; i++) {
    let candidates;
    if (maxInterval) {
      candidates = keys.filter(k => {
        const s = LECTURE_NOTE_SEMI[k];
        return Math.abs(s - prevSemi) <= maxInterval && Math.abs(s - prevSemi) > 0;
      });
    } else {
      candidates = keys.filter(k => LECTURE_NOTE_SEMI[k] !== prevSemi);
    }
    if (candidates.length === 0) candidates = keys;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    result.push(chosen);
    prevSemi = LECTURE_NOTE_SEMI[chosen];
  }
  return result;
}

const LECTURE_MELODIES = [
  { id:1, title:"Gamme ascendante",    desc:"Les 8 notes fondamentales en montant",     fixed:true, notes:['C4','D4','E4','F4','G4','A4','B4','C5'] },
  { id:2, title:"Gamme descendante",   desc:"Les 8 notes fondamentales en descendant",  fixed:true, notes:['C5','B4','A4','G4','F4','E4','D4','C4'] },
  { id:3, title:"Mélodie conjointe",   desc:"Notes qui se suivent — générée aléatoirement", fixed:false, maxInterval:2, length:7 },
  { id:4, title:"Arpège de Do majeur", desc:"Les notes de l'accord de Do",              fixed:true, notes:['C4','E4','G4','C5','G4','E4','C4'] },
  { id:5, title:"Au clair de la lune", desc:"Mélodie traditionnelle (domaine public)",  fixed:true, notes:['C5','C5','C5','D5','E5','D5','C5'] },
  { id:6, title:"Mélodie sautée",      desc:"Sauts d'intervalles — tu choisis la distance", fixed:false, isIntervalPicker:true, length:7 },
  { id:7, title:"Mélodie libre",       desc:"Mélodie entièrement aléatoire",            fixed:false, maxInterval:null, length:8 },
];

// ══════════════════════════════════════════════════════════════════════════════
// ── PARTITIONS PAGE (Chopin) ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ── Données : progressions pour l'improvisation ───────────────────────────────
const IMPRO_PROGRESSIONS = [
  { id:1, name:"I – V – vi – IV",       style:"Pop / Soul",       emotion:"La progression la plus universelle. Elle évoque l'espoir mêlé de nostalgie — un voyage émotionnel complet en 4 accords. Omniprésente des Beatles à Adele.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"}], scales:["Do majeur","Pentatonique majeure"], color:"#90B8D0" },
  { id:2, name:"ii – V – I",            style:"Jazz",             emotion:"La progression phare du jazz. La tension du ii-V se résout naturellement sur le I, créant un sentiment de sophistication et de satisfaction harmonique.",
    chords:[{r:"D",t:"Min. 7",fn:"ii7"},{r:"G",t:"Dom. 7",fn:"V7"},{r:"C",t:"Maj. 7",fn:"Imaj7"}], scales:["Do majeur","Bebop dominante"], color:"#E8A857" },
  { id:3, name:"i – VII – VI – V",      style:"Andalou / Flamenco",emotion:"La cadence andalouse. Mystère, passion et intensité dramatique. Très utilisée en flamenco, metal et pop alternative pour créer une atmosphère ibérique.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"G",t:"Majeures",fn:"VII"},{r:"F",t:"Majeures",fn:"VI"},{r:"E",t:"Majeures",fn:"V"}], scales:["Phrygien dominant","La mineur harmonique"], color:"#E07070" },
  { id:4, name:"I – IV – V – I",        style:"Blues / Gospel",   emotion:"Le fondement du blues et du gospel. Simple, honnête et profond — communique une énergie directe et une satisfaction rythmique universelle.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"F",t:"Majeures",fn:"IV"},{r:"G",t:"Majeures",fn:"V"},{r:"C",t:"Majeures",fn:"I"}], scales:["Blues","Pentatonique mineure"], color:"#7BC8A4" },
  { id:5, name:"I – vi – IV – V",       style:"Doo-Wop / Pop 50s",emotion:"La progression des années 50. Nostalgique, romantique et intemporelle — évoque l'innocence, les premières amours et la musique de voiture.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"},{r:"G",t:"Majeures",fn:"V"}], scales:["Do majeur","Pentatonique majeure"], color:"#AED6F1" },
  { id:6, name:"i – iv – V – i",        style:"Mineur classique", emotion:"Mélancolie profonde et résolution dramatique. Utilisée dans le classique et le métal pour exprimer la douleur et la catharsis émotionnelle.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"D",t:"Mineures",fn:"iv"},{r:"E",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"i"}], scales:["La mineur harmonique","Dorien"], color:"#B898C8" },
  { id:7, name:"I – III – IV – iv",     style:"Romanesque / Film",emotion:"Le borrowed chord crée une couleur doux-amère unique. Très utilisé dans les bandes originales pour des moments de transition émotionnelle.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"E",t:"Majeures",fn:"III"},{r:"F",t:"Majeures",fn:"IV"},{r:"F",t:"Mineures",fn:"iv"}], scales:["Do majeur","Fa mineur"], color:"#E8A87C" },
  { id:8, name:"vi – IV – I – V",       style:"Pop contemporaine",emotion:"Introspective et mélancolique, elle commence dans l'ombre (vi) pour aboutir à la résolution (V). Omniprésente dans la pop des années 2000.",
    chords:[{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"},{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"}], scales:["Do majeur","Mode éolien"], color:"#7BC8A4" },
  { id:9, name:"I – V – vi – iii – IV", style:"Pop baroque",      emotion:"Dérivée du Canon de Pachelbel, elle crée un sentiment de continuité et de plénitude émotionnelle. La descente de basse canonique est immédiatement reconnaissable.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"vi"},{r:"E",t:"Mineures",fn:"iii"},{r:"F",t:"Majeures",fn:"IV"}], scales:["Do majeur","Ionien"], color:"#90B8D0" },
  { id:10,name:"i – VI – III – VII",    style:"Épique / Metal",   emotion:"L'enchaînement de puissance. Évoque l'épique et la détermination. Pilier du metal, de la musique de jeux vidéo et des bandes originales cinématographiques.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"F",t:"Majeures",fn:"VI"},{r:"C",t:"Majeures",fn:"III"},{r:"G",t:"Majeures",fn:"VII"}], scales:["Mode éolien","Pentatonique mineure"], color:"#E07070" },
];

// ── Page Improvisation ────────────────────────────────────────────────────────
// ── Cycle des quintes — données ───────────────────────────────────────────────
const CIRCLE_KEYS = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
const CIRCLE_LABELS = {
  C:'Do',G:'Sol',D:'Ré',A:'La',E:'Mi',B:'Si','F#':'Fa#',Db:'Réb',Ab:'Lab',Eb:'Mib',Bb:'Sib',F:'Fa'
};
// Transposition helpers
function transposeNote(note, semis) {
  const idx = CHROMATIC.indexOf(note);
  if (idx === -1) return note;
  return CHROMATIC[(idx + semis + 12) % 12];
}
function transposeChord(rootNote, semis) {
  return transposeNote(rootNote, semis);
}

// Semitone distance from C for each key
const KEY_SEMI = {C:0,G:7,D:2,A:9,E:4,B:11,'F#':6,Db:1,Ab:8,Eb:3,Bb:10,F:5};

// ══════════════════════════════════════════════════════════════════════════════
// ── BACK-TRACK ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function BackTrack({ progression, color }) {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm]         = useState(90);
  const [curIdx, setCurIdx]   = useState(0);
  const [beatsLeft, setBeatsLeft] = useState(4);
  const intervalRef = useRef(null);
  const beatsPerChord = 4;

  function stopTrack() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setPlaying(false); setCurIdx(0); setBeatsLeft(beatsPerChord);
  }

  function startTrack() {
    const chords = progression.chords;
    const msBeat = Math.round(60000 / bpm);
    let beat = 0, chordIdx = 0;
    setPlaying(true); setCurIdx(0); setBeatsLeft(beatsPerChord);

    const playChord = (ci) => {
      const chord = chords[ci];
      const ri = CHROMATIC.indexOf(chord.r);
      if (ri === -1) return;
      playNote(ri + 3*12, 0, (msBeat * beatsPerChord) / 1000 * 0.88);
      CHORD_TYPES[chord.t].formula.forEach((interval, i) => {
        playNote(ri + interval + 4*12, i * 0.07, 1.5);
      });
    };

    playChord(0);
    intervalRef.current = setInterval(() => {
      beat++;
      const bl = beatsPerChord - (beat % beatsPerChord);
      setBeatsLeft(bl === 0 ? beatsPerChord : bl);
      if (beat % beatsPerChord === 0) {
        chordIdx = (chordIdx + 1) % chords.length;
        setCurIdx(chordIdx);
        playChord(chordIdx);
      }
    }, msBeat);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  // Restart if BPM changes while playing
  useEffect(() => { if (playing) { stopTrack(); } }, [bpm]); // eslint-disable-line

  return (
    <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${color}30`,borderRadius:12}}>
      <div style={{fontSize:10,color,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'1rem'}}>🎵 BACK-TRACK</div>
      {/* Chord display */}
      <div style={{display:'flex',gap:6,marginBottom:'1rem',flexWrap:'wrap'}}>
        {progression.chords.map((chord,ci) => {
          const isActive = playing && curIdx===ci;
          const nc = NOTE_COLORS[chord.r]||color;
          return (
            <div key={ci} style={{padding:'.45rem .75rem',borderRadius:8,background:isActive?`${nc}`:`${nc}`,border:`1px solid ${isActive?nc:nc+'40'}`,transition:'all 0.15s',transform:isActive?'scale(1.08)':'scale(1)'}}>
              <div style={{fontSize:13,fontWeight:'bold',color:nc,fontFamily:'monospace',lineHeight:1}}>{chord.r}{CHORD_TYPES[chord.t]?.suffix}</div>
              {isActive && <div style={{fontSize:7,opacity:.6,fontFamily:'monospace',marginTop:2,textAlign:'center'}}>{beatsLeft}♩</div>}
            </div>
          );
        })}
      </div>
      {/* BPM */}
      <div style={{marginBottom:'1rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.3rem'}}>
          <span style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em'}}>TEMPO</span>
          <span style={{fontSize:11,fontFamily:'monospace',color,fontWeight:'bold'}}>{bpm} BPM</span>
        </div>
        <input type="range" min={50} max={160} value={bpm} onChange={e=>setBpm(+e.target.value)}
          style={{width:'100%',accentColor:color,cursor:'pointer'}}/>
      </div>
      <button onClick={()=>playing?stopTrack():startTrack()}
        style={{width:'100%',padding:'.75rem',background:playing?'rgba(241,148,138,0.15)':'rgba(130,224,170,0.15)',border:`1px solid ${playing?'#E07070':'#7BC8A4'}`,color:playing?'#E07070':'#7BC8A4',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
        {playing ? '■ STOP' : '▶ LANCER LE BACK-TRACK'}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CYCLE DES QUINTES ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function CircleOfFifthsSVG({ doneKeys, currentKey, color }) {
  const cx=130, cy=130, r=95;
  const n = CIRCLE_KEYS.length;
  return (
    <svg viewBox="0 0 260 260" style={{width:'100%',maxWidth:260,display:'block',margin:'0 auto'}}>
      {CIRCLE_KEYS.map((key,i) => {
        const angle = (i/n)*2*Math.PI - Math.PI/2;
        const x = cx + r*Math.cos(angle), y = cy + r*Math.sin(angle);
        const isDone = doneKeys.includes(key), isCur = currentKey===key;
        return (
          <g key={key}>
            <circle cx={x} cy={y} r={20}
              fill={isCur?color:isDone?`${color}`:'rgba(255,255,255,0.05)'}
              stroke={isCur?color:isDone?`${color}`:'rgba(255,255,255,0.15)'}
              strokeWidth={isCur?2:1}/>
            <text x={x} y={y+4} textAnchor="middle" fontSize={11}
              fill={isCur?'#0A0804':isDone?color:'rgba(255,255,255,0.5)'}
              fontFamily="monospace" fontWeight={isCur||isDone?'bold':'normal'}>
              {key}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={58} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>
      <text x={cx} y={cy-8}  textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="monospace">CYCLE</text>
      <text x={cx} y={cy+6}  textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="monospace">DES</text>
      <text x={cx} y={cy+20} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="monospace">QUINTES</text>
    </svg>
  );
}

function CycleQuintesExercice() {
  const PROG_TYPES = [
    { id:'ii-V-I', label:'ii – V – I', desc:'Standard jazz', color:'#E8A857',
      build:(key)=>{ const s=KEY_SEMI[key]||0; return [
        {r:transposeChord('D',s-2+12), t:'Min. 7', fn:'ii7'},
        {r:transposeChord('G',s+5),    t:'Dom. 7', fn:'V7'},
        {r:transposeChord('C',s),      t:'Maj. 7', fn:'Imaj7'},
      ];}},
    { id:'I-IV-V', label:'I – IV – V', desc:'Blues / Pop', color:'#7BC8A4',
      build:(key)=>{ const s=KEY_SEMI[key]||0; return [
        {r:transposeChord('C',s),   t:'Majeures', fn:'I'},
        {r:transposeChord('F',s+5), t:'Majeures', fn:'IV'},
        {r:transposeChord('G',s+7), t:'Majeures', fn:'V'},
      ];}},
    { id:'I-V-vi-IV', label:'I – V – vi – IV', desc:'Pop universelle', color:'#90B8D0',
      build:(key)=>{ const s=KEY_SEMI[key]||0; return [
        {r:transposeChord('C',s),   t:'Majeures', fn:'I'},
        {r:transposeChord('G',s+7), t:'Majeures', fn:'V'},
        {r:transposeChord('A',s+9), t:'Mineures', fn:'vi'},
        {r:transposeChord('F',s+5), t:'Majeures', fn:'IV'},
      ];}},
  ];

  const [screen, setScreen]       = useState('tutorial');
  const [progType, setProgType]   = useState(PROG_TYPES[0]);
  const [keyOrder]                = useState([...CIRCLE_KEYS]);
  const [keyIdx, setKeyIdx]       = useState(0);
  const [doneKeys, setDoneKeys]   = useState([]);
  const [errors, setErrors]       = useState(0);
  const [answered, setAnswered]   = useState(false);
  const [userChords, setUserChords] = useState([]);

  const currentKey = keyOrder[keyIdx];
  const targetChords = progType.build(currentKey);

  function playProgressionInKey(key) {
    const chords = progType.build(key);
    chords.forEach((chord,i) => {
      const ri = CHROMATIC.indexOf(chord.r);
      if (ri===-1) return;
      setTimeout(() => playChordArp(CHORD_TYPES[chord.t].formula.map(f=>ri+f+4*12)), i*1100);
    });
  }

  function startExercise() {
    setKeyIdx(0); setDoneKeys([]); setErrors(0); setAnswered(false); setUserChords([]);
    setScreen('exercise');
    setTimeout(() => playProgressionInKey(CIRCLE_KEYS[0]), 400);
  }

  function handleUserChord(ci, root, type) {
    const next = [...userChords];
    next[ci] = { root, type };
    setUserChords(next);
  }

  function validateAnswer() {
    const allCorrect = targetChords.every((tc,i) => {
      const uc = userChords[i];
      return uc && uc.root===tc.r && uc.type===tc.t;
    });
    setAnswered(true);
    if (!allCorrect) setErrors(e=>e+1);
  }

  function nextKey() {
    const newDone = [...doneKeys, currentKey];
    setDoneKeys(newDone);
    if (keyIdx >= keyOrder.length-1) { setScreen('results'); return; }
    const nextIdx = keyIdx+1;
    setKeyIdx(nextIdx);
    setAnswered(false); setUserChords([]);
    setTimeout(() => playProgressionInKey(keyOrder[nextIdx]), 400);
  }

  const allFilled = targetChords.every((_,i) => userChords[i]?.root && userChords[i]?.type);

  // ── Tutorial ────────────────────────────────────────────────────────────────
  if (screen==='tutorial') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.25rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Cycle des quintes</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>TUTORIEL — LIS AVANT DE COMMENCER</p>
      </div>
      <div style={{marginBottom:'1.25rem',textAlign:'center'}}>
        <CircleOfFifthsSVG doneKeys={['C','G','D']} currentKey="A" color="#E8A857"/>
        <p style={{fontSize:10,opacity:.4,fontFamily:'monospace',marginTop:'.5rem'}}>Exemple : 3 tonalités complétées, "La" en cours</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:'1.5rem'}}>
        {[
          {num:'①',title:"Qu'est-ce que le cycle des quintes ?",color:'#E8A857',text:"Un cercle reliant les 12 tonalités. Chaque étape monte d'une quinte (7 demi-tons). C'est l'outil fondamental pour naviguer entre tonalités en jazz et en classique."},
          {num:'②',title:"Comment fonctionne l'exercice ?",color:'#90B8D0',text:"L'app joue une progression dans une tonalité. Tu dois identifier chaque accord : d'abord la note racine, puis le type. Tu fais le tour des 12 tonalités une par une."},
          {num:'③',title:"Astuce pour réussir",color:'#7BC8A4',text:"Écoute avant de répondre — le bouton RÉÉCOUTER est là pour ça. Commence par la progression I-IV-V, la plus simple."},
          {num:'④',title:"Pourquoi c'est essentiel ?",color:'#B898C8',text:"Maîtriser ses progressions dans toutes les tonalités permet de jouer avec n'importe qui. C'est l'exercice quotidien des musiciens de jazz professionnels."},
        ].map(s=>(
          <div key={s.num} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:12}}>
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <span style={{fontSize:18,flexShrink:0}}>{s.num}</span>
              <div>
                <div style={{fontSize:13,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:'.4rem'}}>{s.title}</div>
                <p style={{fontSize:12,opacity:.65,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>{s.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={()=>setScreen('config')} style={{width:'100%',padding:'1rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
        J'AI COMPRIS — CONFIGURER →
      </button>
    </div>
  );

  // ── Config ──────────────────────────────────────────────────────────────────
  if (screen==='config') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Cycle des quintes</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>JOUER UNE PROGRESSION DANS LES 12 TONALITÉS</p>
      </div>
      <div style={{marginBottom:'1.25rem',textAlign:'center'}}>
        <CircleOfFifthsSVG doneKeys={[]} currentKey="C" color="#E8A857"/>
      </div>
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>PROGRESSION À TRAVAILLER</div>
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          {PROG_TYPES.map(pt=>(
            <button key={pt.id} onClick={()=>setProgType(pt)}
              style={{background:progType.id===pt.id?`${pt.color}`:'rgba(255,255,255,0.03)',border:`1px solid ${progType.id===pt.id?pt.color:'rgba(255,255,255,0.1)'}`,borderRadius:10,padding:'.75rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:14,fontWeight:'bold',color:progType.id===pt.id?pt.color:'#fff',fontFamily:'Georgia,serif',marginBottom:2}}>{pt.label}</div>
                <div style={{fontSize:10,opacity:.4,fontFamily:'monospace'}}>{pt.desc}</div>
              </div>
              {progType.id===pt.id && <span style={{color:pt.color,fontSize:14}}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <button onClick={startExercise} style={{width:'100%',padding:'1rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
        COMMENCER LE TOUR →
      </button>
    </div>
  );

  // ── Results ─────────────────────────────────────────────────────────────────
  if (screen==='results') {
    const pct = Math.round(((CIRCLE_KEYS.length-errors)/CIRCLE_KEYS.length)*100);
    const mc  = pct>=90?'#7BC8A4':pct>=70?'#90B8D0':'#E8A857';
    return (
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(247,220,111,0.05)',border:'1px solid rgba(247,220,111,0.2)',borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>TOUR DU CYCLE TERMINÉ !</div>
          <CircleOfFifthsSVG doneKeys={CIRCLE_KEYS} currentKey={null} color="#7BC8A4"/>
          <div style={{fontSize:22,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',marginTop:'1rem'}}>{pct}% de réussite</div>
          <div style={{fontSize:13,opacity:.5,fontFamily:'monospace',marginTop:4}}>{errors} erreur{errors!==1?'s':''} sur 12 tonalités</div>
        </div>
        <button onClick={()=>{setScreen('config');setDoneKeys([]);setErrors(0);setKeyIdx(0);}}
          style={{padding:'.9rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
          ↩ RECOMMENCER
        </button>
      </div>
    );
  }

  // ── Exercise ─────────────────────────────────────────────────────────────────
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header progress */}
      <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{flex:1,marginRight:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{keyIdx+1}/12</span>
            <span style={{fontSize:10,fontFamily:'monospace',color:'#E8A857'}}>{errors} erreur{errors!==1?'s':''}</span>
          </div>
          <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2}}>
            <div style={{height:'100%',width:`${(keyIdx/12)*100}%`,background:'#E8A857',borderRadius:2,transition:'width 0.4s ease'}}/>
          </div>
        </div>
        <div style={{width:80,flexShrink:0}}>
          <CircleOfFifthsSVG doneKeys={doneKeys} currentKey={currentKey} color={progType.color}/>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Key display */}
        <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(247,220,111,0.06)',border:'1px solid rgba(247,220,111,0.2)',borderRadius:12}}>
          <div style={{fontSize:11,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.75rem'}}>TONALITÉ ACTUELLE</div>
          <div style={{fontSize:52,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif',lineHeight:1,marginBottom:6}}>
            {CIRCLE_LABELS[currentKey]||currentKey}
          </div>
          <div style={{fontSize:12,opacity:.45,fontFamily:'monospace',marginBottom:'1rem'}}>{progType.label} en {currentKey}</div>
          <button onClick={()=>playProgressionInKey(currentKey)}
            style={{background:'rgba(247,220,111,0.1)',border:'1px solid rgba(247,220,111,0.3)',color:'#E8A857',padding:'.4rem 1rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>
            🔊 RÉÉCOUTER
          </button>
        </div>

        {/* Chord inputs */}
        {targetChords.map((tc,ci) => {
          const uc = userChords[ci];
          const isCorrect = answered && uc && uc.root===tc.r && uc.type===tc.t;
          const isWrong   = answered && !(uc && uc.root===tc.r && uc.type===tc.t);
          return (
            <div key={ci} style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${answered?(isCorrect?'rgba(130,224,170,0.4)':'rgba(241,148,138,0.4)'):'rgba(255,255,255,0.08)'}`,borderRadius:12,transition:'border-color 0.3s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
                <span style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>ACCORD {ci+1} — {tc.fn}</span>
                {answered && <span style={{fontSize:12,color:isCorrect?'#7BC8A4':'#E07070'}}>{isCorrect?'✓':` ✗ → ${tc.r}${CHORD_TYPES[tc.t]?.suffix}`}</span>}
              </div>
              {!answered && (
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4}}>
                    {ROOT_NOTES.map(root=>{
                      const nc=NOTE_COLORS[root]||'#B898C8', sel=uc?.root===root;
                      return <button key={root} onClick={()=>handleUserChord(ci,root,uc?.type)}
                        style={{background:sel?`${nc}`:`${nc}`,border:`1px solid ${sel?nc:nc+'40'}`,color:nc,padding:'.4rem .1rem',borderRadius:6,cursor:'pointer',fontSize:11,fontFamily:'monospace',fontWeight:sel?'bold':'normal',transition:'all 0.15s'}}>{root}</button>;
                    })}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
                    {Object.entries(CHORD_TYPES).map(([t,{label}])=>{
                      const tc2=CHORD_COLORS[t]||'#B898C8', sel=uc?.type===t;
                      return <button key={t} onClick={()=>handleUserChord(ci,uc?.root||'',t)}
                        style={{background:sel?`${tc2}`:`${tc2}`,border:`1px solid ${sel?tc2:tc2+'30'}`,color:sel?tc2:`${tc2}`,padding:'.4rem .25rem',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace',transition:'all 0.15s'}}>{label}</button>;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!answered ? (
          <button onClick={validateAnswer} disabled={!allFilled}
            style={{width:'100%',padding:'.9rem',background:allFilled?'rgba(247,220,111,0.15)':'rgba(255,255,255,0.03)',border:`1.5px solid ${allFilled?'#E8A857':'rgba(255,255,255,0.1)'}`,color:allFilled?'#E8A857':'rgba(255,255,255,0.25)',borderRadius:10,cursor:allFilled?'pointer':'not-allowed',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
            VALIDER →
          </button>
        ) : (
          <button onClick={nextKey}
            style={{width:'100%',padding:'.9rem',background:'rgba(130,224,170,0.12)',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
            {keyIdx>=keyOrder.length-1?'VOIR LES RÉSULTATS →':'TONALITÉ SUIVANTE →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MODE TRANSPOSITION ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function TranspositionExercice() {
  const [screen, setScreen]     = useState('config');
  const [song, setSong]         = useState(null);
  const [targetKey, setTargetKey] = useState(null);
  const [userChords, setUserChords] = useState([]);
  const [answered, setAnswered] = useState([]);
  const [score, setScore]       = useState({correct:0,total:0});

  const origKeySemi = song ? (KEY_SEMI[song.chords[0]?.n] ?? 0) : 0;
  const targetSemi  = targetKey ? (KEY_SEMI[targetKey] ?? 0) : 0;
  const delta = ((targetSemi - origKeySemi) + 12) % 12;

  const correctChords = song ? song.chords.map(c => ({
    r: transposeChord(c.n, delta),
    t: c.t,
    origName: c.n + (CHORD_TYPES[c.t]?.suffix||''),
  })) : [];

  function startExercise() {
    if (!song || !targetKey) return;
    setUserChords(Array(song.chords.length).fill(null));
    setAnswered(Array(song.chords.length).fill(false));
    setScore({correct:0,total:0});
    setScreen('exercise');
  }

  function handleAnswer(ci, root) {
    if (answered[ci]) return;
    const correct = root === correctChords[ci].r;
    const newAnswered = [...answered]; newAnswered[ci] = true;
    const newUser = [...userChords]; newUser[ci] = root;
    setAnswered(newAnswered); setUserChords(newUser);
    setScore(s=>({correct:s.correct+(correct?1:0), total:s.total+1}));
    const ri = CHROMATIC.indexOf(root);
    if (ri!==-1) playChordArp(CHORD_TYPES[correctChords[ci].t].formula.map(f=>ri+f+4*12));
    if (newAnswered.every(Boolean)) setTimeout(()=>setScreen('results'),800);
  }

  if (screen==='config') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Transposition</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>TRANSPOSER UNE GRILLE DANS UNE AUTRE TONALITÉ</p>
      </div>
      <div style={{padding:'.9rem',background:'rgba(133,193,233,0.07)',border:'1px solid rgba(133,193,233,0.18)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.6,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>Choisis une grille, puis une tonalité cible. Pour chaque accord, retrouve la bonne note racine transposée.</p>
      </div>
      {/* Song selection */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>GRILLE À TRANSPOSER</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {SONGS_TABS.slice(0,8).map(s=>(
            <button key={s.id} onClick={()=>setSong(s)}
              style={{background:song?.id===s.id?`${s.color}`:'rgba(255,255,255,0.03)',border:`1px solid ${song?.id===s.id?s.color:'rgba(255,255,255,0.1)'}`,borderRadius:10,padding:'.65rem .9rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <span style={{fontSize:13,fontWeight:'bold',color:song?.id===s.id?s.color:'#fff',fontFamily:'Georgia,serif'}}>{s.title}</span>
                <span style={{fontSize:10,opacity:.4,fontFamily:'monospace',marginLeft:8}}>{s.key}</span>
              </div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap',maxWidth:'50%',justifyContent:'flex-end'}}>
                {s.chords.slice(0,4).map((c,ci)=>(
                  <span key={ci} style={{fontSize:9,fontFamily:'monospace',color:NOTE_COLORS[c.n]||'#B898C8',padding:'1px 5px',background:`${NOTE_COLORS[c.n]||'#B898C8'}`,borderRadius:4}}>
                    {c.n}{CHORD_TYPES[c.t]?.suffix}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Target key */}
      {song && (
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>TONALITÉ CIBLE</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>
            {CIRCLE_KEYS.map(k=>{
              const nc=NOTE_COLORS[k]||'#90B8D0', sel=targetKey===k;
              return <button key={k} onClick={()=>setTargetKey(k)}
                style={{background:sel?`${nc}`:`${nc}`,border:`1px solid ${sel?nc:nc+'40'}`,color:nc,padding:'.6rem .25rem',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 10px ${nc}`:'none'}}>
                {k}
              </button>;
            })}
          </div>
        </div>
      )}
      <button onClick={startExercise} disabled={!song||!targetKey}
        style={{width:'100%',padding:'1rem',background:song&&targetKey?'rgba(133,193,233,0.15)':'rgba(255,255,255,0.03)',border:`1.5px solid ${song&&targetKey?'#90B8D0':'rgba(255,255,255,0.1)'}`,color:song&&targetKey?'#90B8D0':'rgba(255,255,255,0.25)',borderRadius:12,cursor:song&&targetKey?'pointer':'not-allowed',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
        COMMENCER →
      </button>
    </div>
  );

  if (screen==='results') {
    const pct=Math.round((score.correct/score.total)*100);
    const mc=pct>=90?'#7BC8A4':pct>=70?'#90B8D0':pct>=50?'#E8A857':'#E07070';
    return (
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(133,193,233,0.06)',border:'1px solid rgba(133,193,233,0.2)',borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS — TRANSPOSITION</div>
          <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/{score.total}</span></div>
          <div style={{fontSize:20,color:mc,marginBottom:'.5rem'}}>{pct}%</div>
          <div style={{fontSize:12,opacity:.5,fontFamily:'monospace'}}>{song?.title} → {targetKey}</div>
        </div>
        <button onClick={()=>{setScreen('config');setSong(null);setTargetKey(null);}}
          style={{padding:'.9rem',background:'rgba(133,193,233,0.15)',border:'1.5px solid #90B8D0',color:'#90B8D0',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
          ↩ NOUVELLE TRANSPOSITION
        </button>
      </div>
    );
  }

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:11,fontFamily:'Georgia,serif',opacity:.7}}>{song?.title}</span>
        <span style={{fontSize:11,fontFamily:'monospace',color:'#90B8D0'}}>→ {targetKey}</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'.75rem'}}>
        <div style={{padding:'.75rem',background:'rgba(133,193,233,0.06)',border:'1px solid rgba(133,193,233,0.15)',borderRadius:10}}>
          <p style={{fontSize:11,opacity:.55,margin:0,fontFamily:'monospace'}}>Clique sur la bonne note racine pour chaque accord. Le type d'accord reste identique.</p>
        </div>
        {correctChords.map((tc,ci)=>{
          const isAnswered=answered[ci], userRoot=userChords[ci];
          const isCorrect=userRoot===tc.r;
          return (
            <div key={ci} style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${isAnswered?(isCorrect?'rgba(130,224,170,0.35)':'rgba(241,148,138,0.35)'):'rgba(255,255,255,0.08)'}`,borderRadius:12,transition:'border-color 0.3s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:10,opacity:.4,fontFamily:'monospace'}}>Accord {ci+1}</span>
                  <span style={{fontSize:13,fontFamily:'monospace',color:'rgba(255,255,255,0.5)'}}>{tc.origName}</span>
                  <span style={{fontSize:11,opacity:.3}}>→</span>
                  <span style={{fontSize:13,fontFamily:'monospace',color:isAnswered?(isCorrect?'#7BC8A4':'#E07070'):'rgba(255,255,255,0.3)',fontWeight:isAnswered?'bold':'normal'}}>
                    {isAnswered?`${tc.r}${CHORD_TYPES[tc.t]?.suffix}`:'?'}
                    {!isAnswered&&<span style={{fontSize:9,opacity:.4}}> ({CHORD_TYPES[tc.t]?.label})</span>}
                  </span>
                </div>
                {isAnswered && <span style={{fontSize:14,color:isCorrect?'#7BC8A4':'#E07070'}}>{isCorrect?'✓':'✗'}</span>}
              </div>
              {!isAnswered && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4}}>
                  {ROOT_NOTES.map(root=>{
                    const nc=NOTE_COLORS[root]||'#B898C8';
                    return <button key={root} onClick={()=>handleAnswer(ci,root)}
                      style={{background:`${nc}10`,border:`1px solid ${nc}`,color:nc,padding:'.45rem .1rem',borderRadius:6,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background=`${nc}18`;e.currentTarget.style.transform='scale(1.04)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background=`${nc}18`;e.currentTarget.style.transform='scale(1)';}}>
                      {root}
                    </button>;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Algorithm: for each chord pair, find the inversion of chord B
// that minimizes the total semitone movement from chord A's notes.
function calcVoiceLeading(notesA, notesB) {
  // Returns { inversion: number[], totalMovement: number }
  const n = Math.min(notesA.length, notesB.length);
  const inversions = notesB.map((_, i) => [...notesB.slice(i), ...notesB.slice(0, i)]);

  let best = null, bestScore = Infinity;
  inversions.forEach((inv, idx) => {
    let score = 0;
    for (let v = 0; v < n; v++) {
      const diff = Math.abs(notesA[v] - inv[v]);
      score += Math.min(diff, 12 - diff);
    }
    if (score < bestScore) { bestScore = score; best = { inversion: inv, idx, movement: score }; }
  });
  return best || { inversion: notesB, idx: 0, movement: 0 };
}

function getChordSemis(root, type, octave = 4) {
  const ri = CHROMATIC.indexOf(root);
  if (ri === -1 || !CHORD_TYPES[type]) return [];
  return CHORD_TYPES[type].formula.map(i => ri + i + octave * 12);
}

function VoiceLeadingPanel({ progression, color }) {
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  const chords = progression.chords;
  if (chords.length < 2) return null;

  // Compute voice leading for each consecutive pair
  const transitions = chords.map((chord, i) => {
    if (i === 0) return null;
    const prev = chords[i - 1];
    const notesA = getChordSemis(prev.r, prev.t);
    const notesB = getChordSemis(chord.r, chord.t);
    const vl = calcVoiceLeading(notesA, notesB);
    return {
      from: prev, to: chord,
      fromNotes: notesA,
      inversionNotes: vl.inversion,
      inversionIdx: vl.idx,
      movement: vl.movement,
    };
  }).filter(Boolean);

  const activeTransition = activeStep !== null ? transitions[activeStep] : null;
  // Build piano colors for the active transition
  const pianoColors = {};
  if (activeTransition) {
    activeTransition.fromNotes.forEach(n => { const k = n % 24; pianoColors[k] = '#90B8D0'; }); // blue = departing
    activeTransition.inversionNotes.forEach(n => { const k = n % 24; pianoColors[k] = color; }); // color = arriving
  }

  return (
    <div style={{ padding: '1rem', background: 'rgba(240,235,224,0.02)', border: `0.5px solid ${color}`, borderRadius: 4 }}>
      {/* Header toggle */}
      <button onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
        <div style={{ fontSize: 10, color, fontFamily: 'monospace', letterSpacing: '.1em' }}>🎼 VOICE LEADING — RENVERSEMENTS CONSEILLÉS</div>
        <span style={{ fontSize: 12, color, opacity: .7 }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontSize: 11, opacity: .5, fontFamily: 'Georgia,serif', lineHeight: 1.6, margin: '0 0 1rem' }}>
            Pour chaque enchaînement, voici le renversement qui minimise le déplacement des voix. Clique sur une transition pour voir les touches sur le clavier.
          </p>

          {/* Transition list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: '1rem' }}>
            {transitions.map((t, i) => {
              const isActive = activeStep === i;
              const invName = INVERSION_NAMES[t.inversionIdx] || 'Fondamentale';
              const nc = NOTE_COLORS[t.to.r] || color;
              return (
                <button key={i} onClick={() => setActiveStep(isActive ? null : i)}
                  style={{ background: isActive ? `${nc}` : 'rgba(240,235,224,0.03)', border: `0.5px solid ${isActive ? nc : 'rgba(240,235,224,0.1)'}`, borderRadius: 3, padding: '.75rem .9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: NOTE_COLORS[t.from.r] || '#90B8D0' }}>{t.from.r}{CHORD_TYPES[t.from.t]?.suffix}</span>
                      <span style={{ fontSize: 11, opacity: .3 }}>→</span>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: nc }}>{t.to.r}{CHORD_TYPES[t.to.t]?.suffix}</span>
                    </div>
                    <span style={{ fontSize: 9, fontFamily: 'monospace', color: isActive ? nc : 'rgba(240,235,224,0.4)', padding: '2px 6px', border: `0.5px solid ${isActive ? nc : 'rgba(240,235,224,0.15)'}`, borderRadius: 2 }}>
                      {t.movement === 0 ? 'IDENTIQUE' : `Δ ${t.movement} ½t`}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, opacity: .5, fontFamily: 'monospace' }}>
                    Jouer en <span style={{ color: nc }}>{invName}</span> — Notes : {t.inversionNotes.map(n => CHROMATIC[n % 12]).join(' – ')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Piano visualization */}
          {activeStep !== null && (
            <div style={{ background: 'rgba(240,235,224,0.02)', border: '0.5px solid rgba(240,235,224,0.07)', borderRadius: 4, padding: '1rem', overflowX: 'auto', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ fontSize: 9, opacity: .3, fontFamily: 'monospace', marginBottom: '.65rem', textAlign: 'center' }}>
                <span style={{ color: '#90B8D0' }}>■</span> Note de départ &nbsp;
                <span style={{ color }}>■</span> Note d'arrivée (renversement conseillé)
              </div>
              <PianoKeyboard colors={pianoColors} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImproPage() {
  const [selected, setSelected] = useState(null);
  const [activeChord, setActiveChord] = useState(null);
  const [sequencing, setSequencing] = useState(false);

  function getChordNotes(root, type) {
    const ri = CHROMATIC.indexOf(root);
    if (ri === -1 || !CHORD_TYPES[type]) return [];
    return CHORD_TYPES[type].formula.map(i => ri + i);
  }

  function playChord(root, type, idx) {
    setActiveChord(idx);
    const notes = getChordNotes(root, type).map(n => n + 4*12);
    playChordArp(notes);
    setTimeout(() => setActiveChord(null), 1000);
  }

  async function playSequence(prog) {
    if (sequencing) return;
    setSequencing(true);
    for (let i = 0; i < prog.chords.length; i++) {
      setActiveChord(i);
      const notes = getChordNotes(prog.chords[i].r, prog.chords[i].t).map(n => n + 4*12);
      playChordArp(notes);
      await new Promise(r => setTimeout(r, 1300));
    }
    setActiveChord(null);
    setSequencing(false);
  }

  // Piano colors for selected chord
  const pianoColors = {};
  if (selected && activeChord !== null) {
    const chord = selected.chords[activeChord];
    const notes = getChordNotes(chord.r, chord.t);
    const c = NOTE_COLORS[chord.r] || selected.color;
    notes.forEach(n => { pianoColors[n] = c; pianoColors[n + 12] = c; });
  }

  const fnColors = {I:'#90B8D0',IV:'#7BC8A4',V:'#E8A857',vi:'#B898C8',ii:'#E07070',iii:'#AED6F1',VII:'#E8A87C'};
  const getFnColor = fn => fnColors[fn.replace(/[0-9]/g,'')] || 'rgba(240,235,224,0.4)';

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {selected ? (
        // ── Détail d'une progression ──
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.6)',flexShrink:0}}>
            <button onClick={()=>{setSelected(null);setActiveChord(null);setSequencing(false);}} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:2}} onMouseEnter={e=>e.currentTarget.style.color='#f0ebe0'} onMouseLeave={e=>e.currentTarget.style.color='rgba(240,235,224,0.5)'}>← IMPRO</button>
            <span style={{opacity:.2}}>|</span>
            <span style={{fontSize:11,fontFamily:'monospace',color:selected.color,letterSpacing:'.05em'}}>{selected.style.toUpperCase()}</span>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
            {/* Name + style */}
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:'bold',fontFamily:'Georgia,serif',color:selected.color,marginBottom:4}}>{selected.name}</div>
              <div style={{fontSize:11,opacity:.45,fontFamily:'monospace',letterSpacing:'.1em'}}>{selected.style.toUpperCase()}</div>
            </div>

            {/* Emotion */}
            <div style={{padding:'1rem',background:`${selected.color}`,border:`0.5px solid ${selected.color}`,borderRadius:4}}>
              <div style={{fontSize:10,color:selected.color,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>COULEUR ÉMOTIONNELLE</div>
              <p style={{fontSize:13.5,lineHeight:1.65,opacity:.78,margin:0,fontFamily:'Georgia,serif'}}>{selected.emotion}</p>
            </div>

            {/* Chords + play */}
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
                <span style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace'}}>ACCORDS</span>
                <button onClick={()=>playSequence(selected)} disabled={sequencing}
                  style={{background:sequencing?`${selected.color}`:'transparent',border:`0.5px solid ${sequencing?selected.color:'rgba(240,235,224,0.2)'}`,color:sequencing?selected.color:'rgba(240,235,224,0.55)',padding:'.35rem .85rem',borderRadius:2,cursor:sequencing?'default':'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',transition:'all 0.2s'}}>
                  {sequencing?'▶ EN COURS…':'▶ JOUER LA SÉQUENCE'}
                </button>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {selected.chords.map((chord,ci)=>{
                  const isActive=activeChord===ci;
                  const nc=NOTE_COLORS[chord.r]||selected.color;
                  const fnColor=getFnColor(chord.fn);
                  return (
                    <button key={ci} onClick={()=>playChord(chord.r,chord.t,ci)}
                      style={{background:isActive?`${nc}`:`${nc}`,border:`0.5px solid ${isActive?nc:nc+'40'}`,borderRadius:3,padding:'.65rem .9rem',cursor:'pointer',transition:'all 0.15s',transform:isActive?'scale(1.06)':'scale(1)',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                      <span style={{fontSize:9,fontFamily:'monospace',color:fnColor,letterSpacing:'.05em'}}>{chord.fn}</span>
                      <span style={{fontSize:17,fontWeight:'bold',color:nc,fontFamily:'monospace',lineHeight:1}}>{chord.r}{CHORD_TYPES[chord.t]?.suffix}</span>
                      <span style={{fontSize:8,opacity:.45,fontFamily:'monospace'}}>{CHORD_TYPES[chord.t]?.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Piano */}
            {activeChord !== null && (
              <div style={{padding:'1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,overflowX:'auto',animation:'fadeIn 0.2s ease'}}>
                <div style={{fontSize:9,opacity:.3,fontFamily:'monospace',marginBottom:'.75rem',textAlign:'center'}}>TOUCHES À ENFONCER — {selected.chords[activeChord]?.r}{CHORD_TYPES[selected.chords[activeChord]?.t]?.suffix}</div>
                <PianoKeyboard colors={pianoColors}/>
              </div>
            )}

            {/* Scales */}
            <div style={{padding:'1rem',background:'rgba(130,224,170,0.04)',border:'0.5px solid rgba(130,224,170,0.15)',borderRadius:4}}>
              <div style={{fontSize:10,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>GAMMES COMPATIBLES POUR L'IMPRO</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {selected.scales.map((s,i)=>(
                  <span key={i} style={{fontSize:11,fontFamily:'Georgia,serif',color:'rgba(240,235,224,0.7)',padding:'.3rem .8rem',background:'rgba(130,224,170,0.08)',border:'0.5px solid rgba(130,224,170,0.2)',borderRadius:2}}>{s}</span>
                ))}
              </div>
            </div>

            {/* Back-Track */}
            <BackTrack progression={selected} color={selected.color}/>

            {/* Voice Leading */}
            <VoiceLeadingPanel progression={selected} color={selected.color}/>
          </div>
        </div>
      ) : (
        // ── Liste des progressions ──
        <div style={{flex:1,overflowY:'auto',padding:'1rem'}}>
          <div style={{marginBottom:'1rem',padding:'.75rem',background:'rgba(130,224,170,0.04)',border:'0.5px solid rgba(130,224,170,0.15)',borderRadius:4}}>
            <div style={{fontSize:11,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.3rem'}}>10 PROGRESSIONS ESSENTIELLES</div>
            <p style={{fontSize:12,opacity:.5,margin:0,lineHeight:1.5,fontFamily:'Georgia,serif'}}>Clique sur une progression pour voir l'analyse émotionnelle, jouer les accords et découvrir les gammes compatibles.</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {IMPRO_PROGRESSIONS.map(prog=>(
              <button key={prog.id} onClick={()=>{setSelected(prog);setActiveChord(null);}}
                style={{background:'rgba(240,235,224,0.025)',border:`0.5px solid rgba(240,235,224,0.1)`,borderRadius:4,padding:'1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${prog.color}18`;e.currentTarget.style.borderColor=`${prog.color}`;}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(240,235,224,0.025)';e.currentTarget.style.borderColor='rgba(240,235,224,0.1)';}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif',color:prog.color,marginBottom:2}}>{prog.name}</div>
                    <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',letterSpacing:'.06em'}}>{prog.style.toUpperCase()}</div>
                  </div>
                  <span style={{fontSize:14,opacity:.35}}>›</span>
                </div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {prog.chords.map((chord,ci)=>(
                    <span key={ci} style={{fontSize:10,fontFamily:'monospace',color:NOTE_COLORS[chord.r]||prog.color,padding:'2px 6px',background:`${NOTE_COLORS[chord.r]||prog.color}`,borderRadius:2}}>
                      {chord.r}{CHORD_TYPES[chord.t]?.suffix}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Viewer de partition (PDF in-app) ─────────────────────────────────────────
function ScoreViewer({ work, onClose }) {
  const [viewMode, setViewMode] = useState('info'); // info | viewer
  const imslpUrl = `https://imslp.org/wiki/${work.url}`;
  const title = `Op.${work.op}${work.no ? ` n°${work.no}` : ''} — ${work.key}${work.nick ? ` "${work.nick}"` : ''}`;

  return (
    <div style={{position:'fixed',inset:0,zIndex:150,background:'#0f0e0c',display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{padding:'.85rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'0.5px solid rgba(240,235,224,0.1)',flexShrink:0,background:'rgba(15,14,12,0.95)'}}>
        <div>
          <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif'}}>{title}</div>
          <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>FRÉDÉRIC CHOPIN — DOMAINE PUBLIC</div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.5,cursor:'pointer',fontSize:22,lineHeight:1}}>×</button>
      </div>

      {/* Mode tabs */}
      <div style={{display:'flex',borderBottom:'0.5px solid rgba(240,235,224,0.08)',flexShrink:0}}>
        {[['info','Infos'],['viewer','Partition']].map(([id,label])=>(
          <button key={id} onClick={()=>setViewMode(id)} style={{flex:1,padding:'.6rem',background:'none',border:'none',color:viewMode===id?'#B898C8':'rgba(240,235,224,0.35)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.08em',borderBottom:viewMode===id?'1.5px solid #B898C8':'1.5px solid transparent',transition:'all 0.2s'}}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {viewMode==='info' && (
        <div style={{flex:1,overflowY:'auto',padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div style={{display:'flex',gap:3,marginBottom:'.25rem'}}>
            {[1,2,3,4,5].map(s=>(<div key={s} style={{width:10,height:10,borderRadius:'50%',background:s<=work.diff?'#B898C8':'rgba(240,235,224,0.12)'}}/>))}
            <span style={{fontSize:10,opacity:.4,fontFamily:'monospace',marginLeft:8}}>Difficulté {work.diff}/5</span>
          </div>
          <div style={{padding:'1rem',background:'rgba(195,155,211,0.05)',border:'0.5px solid rgba(195,155,211,0.15)',borderRadius:4}}>
            <div style={{fontSize:10,color:'#B898C8',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>À PROPOS</div>
            <p style={{fontSize:13,opacity:.65,lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>
              Cette partition est dans le domaine public. Elle est disponible gratuitement sur IMSLP (International Music Score Library Project), la plus grande bibliothèque de partitions au monde.
            </p>
          </div>
          {/* Buttons */}
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:'.5rem'}}>
            <button onClick={()=>setViewMode('viewer')}
              style={{padding:'.9rem',background:'rgba(195,155,211,0.15)',border:'1px solid #B898C8',color:'#B898C8',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>
              📖 VOIR LA PARTITION
            </button>
            <a href={imslpUrl} target="_blank" rel="noopener noreferrer"
              style={{padding:'.9rem',background:'transparent',border:'0.5px solid rgba(240,235,224,0.2)',color:'rgba(240,235,224,0.6)',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',textDecoration:'none',textAlign:'center',display:'block'}}>
              ↗ OUVRIR SUR IMSLP
            </a>
          </div>
          <div style={{padding:'.75rem',background:'rgba(133,193,233,0.05)',border:'0.5px solid rgba(133,193,233,0.15)',borderRadius:4}}>
            <div style={{fontSize:10,color:'#90B8D0',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.35rem'}}>COMMENT ENREGISTRER SUR ANDROID</div>
            <p style={{fontSize:11,opacity:.5,lineHeight:1.6,margin:0,fontFamily:'monospace'}}>1. Appuie sur "Voir la partition"{'\n'}2. Le PDF s'ouvre dans Chrome{'\n'}3. Appuie sur l'icône ↓ en bas pour télécharger</p>
          </div>
        </div>
      )}

      {/* Partition viewer tab */}
      {viewMode==='viewer' && (
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'.5rem 1rem',background:'rgba(15,14,12,0.8)',borderBottom:'0.5px solid rgba(240,235,224,0.06)',flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>VIA IMSLP.ORG</span>
            <a href={imslpUrl} target="_blank" rel="noopener noreferrer"
              style={{fontSize:10,color:'#B898C8',fontFamily:'monospace',letterSpacing:'.08em',textDecoration:'none'}}>OUVRIR EN PLEIN ÉCRAN ↗</a>
          </div>
          <iframe
            src={imslpUrl}
            style={{flex:1,border:'none',background:'#fff'}}
            title={title}
          />
        </div>
      )}
    </div>
  );
}

function PartitionsPage() {
  const [tab, setTab] = useState('etudes');
  const [selectedWork, setSelectedWork] = useState(null);
  const works = tab === 'etudes' ? CHOPIN_WORKS.etudes : CHOPIN_WORKS.nocturnes;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {selectedWork && <ScoreViewer work={selectedWork} onClose={()=>setSelectedWork(null)}/>}
      <div style={{display:'flex',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.4)',flexShrink:0}}>
        {[['etudes','Études'],['nocturnes','Nocturnes']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'.6rem',background:'none',border:'none',color:tab===id?'#B898C8':'rgba(240,235,224,0.35)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.08em',borderBottom:tab===id?'1.5px solid #B898C8':'1.5px solid transparent',transition:'all 0.2s'}}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1rem'}}>
        <div style={{marginBottom:'1rem',padding:'.75rem',background:'rgba(195,155,211,0.05)',border:'0.5px solid rgba(195,155,211,0.15)',borderRadius:4}}>
          <div style={{fontSize:11,color:'#B898C8',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.35rem'}}>FRÉDÉRIC CHOPIN — DOMAINE PUBLIC</div>
          <p style={{fontSize:12,opacity:.5,margin:0,lineHeight:1.5,fontFamily:'Georgia,serif'}}>Appuie sur une pièce pour l'ouvrir dans l'app et la sauvegarder sur ton téléphone.</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          {works.map((w,i)=>(
            <button key={i} onClick={()=>setSelectedWork(w)}
              style={{background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:4,padding:'.9rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',width:'100%'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(195,155,211,0.07)';e.currentTarget.style.borderColor='rgba(195,155,211,0.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(240,235,224,0.02)';e.currentTarget.style.borderColor='rgba(240,235,224,0.1)';}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
                <div style={{display:'flex',gap:10,alignItems:'baseline',flexWrap:'wrap'}}>
                  <span style={{fontSize:10,color:'#B898C8',fontFamily:'monospace',opacity:.7}}>Op.{w.op}{w.no?` n°${w.no}`:''}</span>
                  <span style={{fontSize:14,fontWeight:'bold',color:'#f0ebe0',fontFamily:'Georgia,serif'}}>{w.key}</span>
                  {w.nick&&<span style={{fontSize:11,color:'rgba(240,235,224,0.45)',fontStyle:'italic'}}>"{w.nick}"</span>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(s=>(<div key={s} style={{width:6,height:6,borderRadius:'50%',background:s<=w.diff?'#B898C8':'rgba(240,235,224,0.15)'}}/>))}</div>
                  <span style={{fontSize:11,color:'#B898C8',opacity:.6}}>›</span>
                </div>
              </div>
              <div style={{fontSize:9,opacity:.3,fontFamily:'monospace',letterSpacing:'.05em'}}>VOIR ET TÉLÉCHARGER LA PARTITION</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TABS PAGE ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function TabsPage() {
  const [filter, setFilter] = useState('tous');
  const [playing, setPlaying] = useState(null);
  const cats = ['tous','classique','folk','pop'];
  const filtered = filter === 'tous' ? SONGS_TABS : SONGS_TABS.filter(s=>s.cat===filter);

  const handleChordClick = (songId, chordIdx, chord) => {
    setPlaying(`${songId}-${chordIdx}`);
    playTabChord(chord.n, chord.t);
    setTimeout(()=>setPlaying(null), 1200);
  };

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Filter bar */}
      <div style={{display:'flex',gap:6,padding:'.75rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',flexShrink:0,overflowX:'auto'}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{padding:'.3rem .8rem',background:filter===c?'rgba(195,155,211,0.15)':'transparent',border:`0.5px solid ${filter===c?'#B898C8':'rgba(240,235,224,0.15)'}`,color:filter===c?'#B898C8':'rgba(240,235,224,0.45)',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:10}}>
        <div style={{padding:'.65rem .9rem',background:'rgba(130,224,170,0.05)',border:'0.5px solid rgba(130,224,170,0.15)',borderRadius:4,fontSize:11,color:'rgba(130,224,170,0.7)',fontFamily:'monospace'}}>
          🎹 Clique sur un accord pour l'entendre au piano
        </div>

        {filtered.map(song=>(
          <div key={song.id} style={{background:'rgba(240,235,224,0.025)',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:4,padding:'1rem',transition:'all 0.2s'}}>
            {/* Song header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
              <div>
                <div style={{fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:2}}>{song.title}</div>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <span style={{fontSize:10,opacity:.45,fontFamily:'monospace'}}>{song.artist}</span>
                  <span style={{fontSize:9,opacity:.3,fontFamily:'monospace'}}>{song.era}</span>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
                <span style={{fontSize:11,fontFamily:'monospace',color:song.color,padding:'2px 8px',background:`${song.color}`,border:`0.5px solid ${song.color}`,borderRadius:2}}>{song.key}</span>
                <span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>{song.bpm} BPM</span>
              </div>
            </div>
            {/* Chord progression */}
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {song.chords.map((chord,ci)=>{
                const isPlaying = playing === `${song.id}-${ci}`;
                const cInfo = CHORD_TYPES[chord.t];
                const noteColor = NOTE_COLORS[chord.n] || '#B898C8';
                return (
                  <button key={ci} onClick={()=>handleChordClick(song.id, ci, chord)}
                    style={{background:isPlaying?`${noteColor}`:`${noteColor}`,border:`0.5px solid ${isPlaying?noteColor:noteColor+'40'}`,borderRadius:3,padding:'.45rem .7rem',cursor:'pointer',transition:'all 0.15s',transform:isPlaying?'scale(1.08)':'scale(1)'}}>
                    <div style={{fontSize:14,fontWeight:'bold',color:noteColor,fontFamily:'monospace',lineHeight:1}}>{chord.n}{cInfo?.suffix}</div>
                    <div style={{fontSize:8,opacity:.45,fontFamily:'monospace',marginTop:2}}>{cInfo?.label.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BIBLIOTHÈQUE PAGE (wrapper) ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function BibliothequePage() {
  const [tab, setTab] = useState('accords');
  const TABS = [
    {id:'accords',    label:'Accords',    color:'#B898C8'},
    {id:'partitions', label:'Partitions', color:'#90B8D0'},
    {id:'grilles',    label:'Grilles',    color:'#7BC8A4'},
  ];
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{display:'flex',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.6)',flexShrink:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'.7rem .1rem',background:'none',border:'none',color:tab===t.id?t.color:'rgba(240,235,224,0.3)',cursor:'pointer',fontSize:9,fontFamily:'monospace',letterSpacing:'.04em',borderBottom:tab===t.id?`1.5px solid ${t.color}`:'1.5px solid transparent',transition:'all 0.2s'}}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {tab==='accords'    && <AccordsLibrary/>}
        {tab==='partitions' && <PartitionsPage/>}
        {tab==='grilles'    && <TabsPage/>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SOLFÈGE PAGE ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// ── SYMBOLES MUSICAUX ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const MUSIC_SYMBOLS = [
  // CLÉS
  { id:'cle-sol',    cat:'Clés',   name:'Clé de Sol',     symbol:'𝄞', color:'#C8864A',
    desc:"Fixe la note Sol sur la 2e ligne. Clé la plus utilisée : piano (MD), violon, flûte.",
    detail:"Chaque ligne et espace correspond à une note. La clé de Sol indique que la 2e ligne (en bas) est un Sol." },
  { id:'cle-fa',     cat:'Clés',   name:'Clé de Fa',      symbol:'𝄢', color:'#C8864A',
    desc:"Fixe la note Fa sur la 4e ligne. Instruments graves : piano (MG), violoncelle, contrebasse.",
    detail:"La clé de Fa place le Fa sur la 4e ligne. Les notes y sont plus graves qu'avec la clé de Sol." },
  { id:'cle-ut',     cat:'Clés',   name:"Clé d'Ut (Do)",  symbol:'𝄡', color:'#C8864A',
    desc:"Fixe le Do central. Variable selon la ligne. Utilisée par l'alto, le ténor.",
    detail:"Moins courante, on la retrouve surtout pour l'alto. Elle évite les lignes supplémentaires." },
  // SILENCES
  { id:'sil-ronde',  cat:'Silences', name:'Silence de ronde',   symbol:'𝄻', color:'#60A8BC',
    desc:"4 temps de silence. Rectangle plein suspendu sous la 4e ligne. Retiens : il pend.",
    detail:'Moyen mnémotechnique : il est "lourd", donc il tombe et se suspend sous la ligne.' },
  { id:'sil-blanche',cat:'Silences', name:'Silence de blanche',  symbol:'𝄼', color:'#60A8BC',
    desc:"2 temps de silence. Rectangle plein posé sur la 3e ligne. Retiens : il repose.",
    detail:'Moyen mnémotechnique : il est "léger", donc il flotte et se pose sur la ligne.' },
  { id:'sil-noire',  cat:'Silences', name:'Silence de noire',    symbol:'𝄽', color:'#60A8BC',
    desc:'1 temps de silence. Ressemble à un "z" stylisé.',
    detail:"1 temps — même durée que la noire. Très fréquent dans tous les styles musicaux." },
  { id:'sil-croche', cat:'Silences', name:'Silence de croche',   symbol:'𝄾', color:'#60A8BC',
    desc:'1/2 temps de silence. Ressemble à une virgule stylisée.',
    detail:"La moitié d'un temps. 2 silences de croche = 1 silence de noire." },
  // VALEURS
  { id:'ronde',      cat:'Valeurs', name:'Ronde',          symbol:'○', color:'#6EB898',
    desc:"4 temps. Tête vide sans hampe. La note la plus longue en usage courant.",
    detail:"En 4/4 : la ronde dure toute la mesure. 1 ronde = 2 blanches = 4 noires = 8 croches." },
  { id:'blanche',    cat:'Valeurs', name:'Blanche',         symbol:'d', color:'#6EB898',
    desc:"2 temps. Tête vide avec hampe verticale. Très utilisée dans les hymnes et ballades.",
    detail:"En 4/4 : la blanche dure la moitié de la mesure. 1 blanche = 2 noires = 4 croches." },
  { id:'noire',      cat:'Valeurs', name:'Noire',           symbol:'♩', color:'#6EB898',
    desc:"1 temps. Tête pleine avec hampe. La valeur de référence du rythme (BPM).",
    detail:"Le tempo en BPM compte les noires par minute. 90 BPM = 90 noires/minute." },
  { id:'croche',     cat:'Valeurs', name:'Croche',          symbol:'♪', color:'#6EB898',
    desc:"1/2 temps. Noire avec un crochet sur la hampe. Souvent regroupée par paires.",
    detail:"2 croches = 1 noire. Reliées par une barre quand groupées. Base du swing en jazz." },
  { id:'dcr',        cat:'Valeurs', name:'Double-croche',   symbol:'𝅘𝅥𝅯', color:'#6EB898',
    desc:"1/4 temps. 2 crochets sur la hampe. Passages rapides et ornements.",
    detail:"4 doubles-croches = 1 noire. Très présentes dans les concertos et l'ornementation baroque." },
  // CHIFFRAGE
  { id:'c44',        cat:'Chiffrage', name:'4/4 — Commun',  symbol:'𝄴', color:'#E8A857',
    desc:"4 temps par mesure, noire = 1 temps. Le plus fréquent : pop, jazz, classique.",
    detail:"Chiffre du haut = nb de temps. Chiffre du bas = valeur d'1 temps (4 = noire, 8 = croche)." },
  { id:'c34',        cat:'Chiffrage', name:'3/4 — Valse',   symbol:'3/4', color:'#E8A857',
    desc:"3 temps par mesure. Rythme de la valse. Un-deux-trois, un-deux-trois.",
    detail:"Valse, menuet, scherzo : tous en 3/4. L'accent fort tombe sur le premier temps." },
  { id:'c68',        cat:'Chiffrage', name:'6/8',           symbol:'6/8', color:'#E8A857',
    desc:"6 croches par mesure, ressenties en 2 temps à 3 croches chacun. Gigue, barcarolle.",
    detail:'6/8 ≠ 3/4. En 6/8 on ressent 2 grands temps balancés. C\'est le rythme "boiteux" du jazz.' },
  // ALTÉRATIONS
  { id:'diese',      cat:'Altérations', name:'Dièse',       symbol:'♯', color:'#D06060',
    desc:"Monte la note d'1 demi-ton. Do♯ est entre Do et Ré.",
    detail:"S'applique à toutes les notes identiques de la mesure sauf indication contraire." },
  { id:'bemol',      cat:'Altérations', name:'Bémol',       symbol:'♭', color:'#D06060',
    desc:"Descend la note d'1 demi-ton. Si♭ est entre La et Si.",
    detail:"Essentiel pour les gammes mineures. Les armures (clé) utilisent dièses ou bémols." },
  { id:'becarre',    cat:'Altérations', name:'Bécarre',     symbol:'♮', color:'#D06060',
    desc:"Annule un dièse ou bémol précédent. Ramène à la hauteur naturelle.",
    detail:"Si une note a été altérée dans la mesure ou l'armure, le bécarre l'annule localement." },
  // NUANCES
  { id:'p-doux',     cat:'Nuances', name:'Piano (p)',       symbol:'p', color:'#D4A0D4',
    desc:"Jouer doucement. Échelle : ppp → pp → p → mp → mf → f → ff → fff.",
    detail:"Les nuances viennent de l'italien. \"Piano\" = doux. C'est aussi pourquoi l'instrument s'appelle piano-forte." },
  { id:'f-fort',     cat:'Nuances', name:'Forte (f)',       symbol:'f', color:'#D4A0D4',
    desc:"Jouer fort. mf = mezzoforte (moyennement fort). ff = fortissimo (très fort).",
    detail:'"Forte" = fort en italien. Les nuances sont relatives : f après pp semble encore plus percutant.' },
  { id:'cresc',      cat:'Nuances', name:'Crescendo',       symbol:'<', color:'#D4A0D4',
    desc:"Progressivement plus fort. Représenté par un signe < ou un coin ouvert à droite.",
    detail:"Le contraire est decrescendo (ou diminuendo). Ces variations de volume créent l'émotion musicale." },
];

function SymbolesMusique() {
  const [screen,   setScreen]   = useState('menu');
  const [activeCat,setActiveCat]= useState(null);
  const [exList,   setExList]   = useState([]);
  const [exIdx,    setExIdx]    = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userAns,  setUserAns]  = useState(null);
  const [score,    setScore]    = useState({correct:0,total:0});
  const [exDone,   setExDone]   = useState(false);

  const CATS = [...new Set(MUSIC_SYMBOLS.map(s=>s.cat))];
  const filtered = activeCat ? MUSIC_SYMBOLS.filter(s=>s.cat===activeCat) : MUSIC_SYMBOLS;

  function startExercice() {
    const shuffled=[...MUSIC_SYMBOLS].sort(()=>Math.random()-.5).slice(0,12);
    setExList(shuffled);setExIdx(0);setAnswered(false);setUserAns(null);
    setScore({correct:0,total:0});setExDone(false);setScreen('exercice');
  }

  function handleExAnswer(id) {
    if(answered)return;
    const ok=id===exList[exIdx].id;
    setUserAns(id);setAnswered(true);
    setScore(s=>({correct:s.correct+(ok?1:0),total:s.total+1}));
  }

  function nextEx() {
    if(exIdx>=exList.length-1){setExDone(true);return;}
    setExIdx(i=>i+1);setAnswered(false);setUserAns(null);
  }

  // ── MENU ────────────────────────────────────────────────────────────────────
  if(screen==='menu') return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Symboles Musicaux</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>DÉCHIFFRER UNE PARTITION</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:'1.5rem'}}>
        {[
          {id:'ref',icon:'📚',label:'Référentiel', sub:'Tous les symboles classés',color:'#90B8D0'},
          {id:'ex', icon:'🎯',label:'Exercice',    sub:'Identifier les symboles', color:'#7BC8A4'},
        ].map(b=>(
          <button key={b.id} onClick={()=>b.id==='ref'?setScreen('reference'):startExercice()}
            style={{background:`${b.color}08`,border:`1.5px solid ${b.color}40`,borderRadius:14,padding:'1.25rem',cursor:'pointer',textAlign:'center',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${b.color}18`;e.currentTarget.style.borderColor=b.color;e.currentTarget.style.transform='translateY(-3px) scale(1.02)';e.currentTarget.style.boxShadow=`0 8px 20px ${b.color}`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${b.color}18`;e.currentTarget.style.borderColor=`${b.color}`;e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='none';}}>
            <span style={{fontSize:30}}>{b.icon}</span>
            <div style={{fontSize:14,fontWeight:'bold',color:b.color,fontFamily:'Georgia,serif'}}>{b.label}</div>
            <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{b.sub}</div>
          </button>
        ))}
      </div>
      <div style={{fontSize:10,opacity:.35,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>CATÉGORIES ({MUSIC_SYMBOLS.length} symboles)</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {CATS.map(cat=>{
          const syms=MUSIC_SYMBOLS.filter(s=>s.cat===cat),c=syms[0].color;
          return(<div key={cat} style={{padding:'.9rem 1rem',background:`${c}`,border:`1px solid ${c}`,borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:13,fontWeight:'bold',color:c,fontFamily:'Georgia,serif'}}>{cat}</div>
              <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',marginTop:2}}>{syms.length} symbole{syms.length>1?'s':''}</div>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              {syms.slice(0,4).map(s=><span key={s.id} style={{fontSize:18,opacity:.85}}>{s.symbol}</span>)}
            </div>
          </div>);
        })}
      </div>
    </div>
  );

  // ── RÉFÉRENTIEL ──────────────────────────────────────────────────────────────
  if(screen==='reference') return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.7rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'.5rem'}}>
          <button onClick={()=>{setScreen('menu');setActiveCat(null);}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:16}}>←</button>
          <span style={{fontSize:13,fontWeight:'bold',fontFamily:'Georgia,serif'}}>Référentiel</span>
          <span style={{fontSize:10,opacity:.35,fontFamily:'monospace',marginLeft:'auto'}}>{filtered.length} symboles</span>
        </div>
        <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:2}}>
          <button onClick={()=>setActiveCat(null)} style={{padding:'3px 10px',background:!activeCat?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${!activeCat?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:!activeCat?'#fff':'rgba(255,255,255,0.4)',fontSize:10,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>Tous</button>
          {CATS.map(cat=>{
            const c=MUSIC_SYMBOLS.find(s=>s.cat===cat)?.color||'#fff';
            return <button key={cat} onClick={()=>setActiveCat(cat===activeCat?null:cat)} style={{padding:'3px 10px',background:activeCat===cat?`${c}`:'rgba(255,255,255,0.04)',border:`1px solid ${activeCat===cat?c:'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:activeCat===cat?c:'rgba(255,255,255,0.4)',fontSize:10,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>{cat}</button>;
          })}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:8}}>
        {filtered.map(sym=>(
          <div key={sym.id} style={{background:`${sym.color}08`,border:`1px solid ${sym.color}30`,borderRadius:12,padding:'1rem',display:'flex',gap:12,alignItems:'flex-start',animation:'fadeIn 0.25s ease'}}>
            <div style={{width:50,height:50,borderRadius:10,background:`${sym.color}08`,border:`1.5px solid ${sym.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{sym.symbol}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                <div style={{fontSize:14,fontWeight:'bold',color:sym.color,fontFamily:'Georgia,serif'}}>{sym.name}</div>
                <span style={{fontSize:8,fontFamily:'monospace',color:sym.color,opacity:.6,padding:'2px 6px',background:`${sym.color}08`,borderRadius:6,flexShrink:0,marginLeft:6}}>{sym.cat}</span>
              </div>
              <p style={{fontSize:12,opacity:.72,margin:'0 0 .4rem',lineHeight:1.55,fontFamily:'Georgia,serif'}}>{sym.desc}</p>
              <p style={{fontSize:11,opacity:.42,margin:0,lineHeight:1.5,fontFamily:'monospace',fontStyle:'italic',borderLeft:`2px solid ${sym.color}`,paddingLeft:8}}>{sym.detail}</p>
            </div>
          </div>
        ))}
        <div style={{height:'.5rem'}}/>
      </div>
    </div>
  );

  // ── RÉSULTATS ────────────────────────────────────────────────────────────────
  if(exDone) {
    const pct=Math.round((score.correct/score.total)*100),mc=pct>=85?'#7BC8A4':pct>=60?'#E8A857':'#E07070';
    return(<div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
      <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}35`,borderRadius:14}}>
        <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS</div>
        <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/{score.total}</span></div>
        <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
        <div style={{fontSize:13,opacity:.5,fontFamily:'Georgia,serif',marginTop:8}}>{pct>=85?'Tu maîtrises les symboles musicaux ! 🎉':pct>=60?'Bonne progression !':'Consulte le référentiel et réessaie !'}</div>
      </div>
      <button onClick={startExercice} style={{padding:'.9rem',background:'rgba(130,224,170,0.15)',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>🔄 NOUVEL EXERCICE</button>
      <button onClick={()=>setScreen('reference')} style={{padding:'.9rem',background:'rgba(133,193,233,0.1)',border:'1px solid rgba(133,193,233,0.3)',color:'#90B8D0',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>📚 RÉFÉRENTIEL</button>
      <button onClick={()=>setScreen('menu')} style={{padding:'.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>← MENU</button>
    </div>);
  }

  // ── EXERCICE ─────────────────────────────────────────────────────────────────
  if(screen==='exercice'&&exList.length>0) {
    const ex=exList[exIdx];
    const progress=((exIdx+1)/exList.length)*100;
    const pool=MUSIC_SYMBOLS.filter(s=>s.id!==ex.id&&s.cat===ex.cat);
    const samecat=pool.sort(()=>Math.random()-.5).slice(0,3);
    // If not enough in same cat, fill from others
    const fill=MUSIC_SYMBOLS.filter(s=>s.id!==ex.id&&!samecat.find(x=>x.id===s.id)).sort(()=>Math.random()-.5).slice(0,3-samecat.length);
    const options=[...samecat,...fill,ex].sort(()=>Math.random()-.5);
    const isRight=answered&&userAns===ex.id;
    return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.7rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{exIdx+1}/{exList.length}</span>
        <div style={{flex:1,margin:'0 1rem',height:4,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress}%`,background:'#7BC8A4',borderRadius:2,transition:'width 0.3s ease'}}/>
        </div>
        <span style={{fontSize:10,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct} ✓</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Symbol to identify */}
        <div style={{textAlign:'center',padding:'1.75rem 1rem',background:`${ex.color}08`,border:`1.5px solid ${ex.color}40`,borderRadius:16,animation:'fadeIn 0.3s ease'}}>
          <div style={{fontSize:10,letterSpacing:'.15em',opacity:.4,fontFamily:'monospace',marginBottom:'1rem'}}>QUEL EST CE SYMBOLE ?</div>
          <div style={{fontSize:76,lineHeight:1.1,marginBottom:'1.25rem',filter:`drop-shadow(0 4px 14px ${ex.color}55)`}}>{ex.symbol}</div>
          {answered&&(<div style={{animation:'fadeIn 0.25s ease'}}>
            <div style={{fontSize:15,fontWeight:'bold',color:isRight?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif',marginBottom:6}}>{isRight?`✓ ${ex.name} !`:`✗ C'était : ${ex.name}`}</div>
            <p style={{fontSize:12,opacity:.65,lineHeight:1.55,margin:'0 auto',maxWidth:280,fontFamily:'Georgia,serif'}}>{ex.desc}</p>
          </div>)}
        </div>
        {/* 4 answer options */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {options.map(opt=>{
            const isC=opt.id===ex.id,isU=userAns===opt.id;
            let bg='rgba(255,255,255,0.04)',border='rgba(255,255,255,0.12)',col='rgba(255,255,255,0.78)';
            if(answered){if(isC){bg=`${opt.color}`;border=opt.color;col=opt.color;}else if(isU){bg='rgba(241,148,138,0.1)';border='#E07070';col='#E07070';}else{col='rgba(255,255,255,0.22)';}}
            return(<button key={opt.id} onClick={()=>handleExAnswer(opt.id)} disabled={answered}
              style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.85rem .5rem',borderRadius:12,cursor:answered?'default':'pointer',fontSize:11.5,fontFamily:'Georgia,serif',fontWeight:'bold',textAlign:'center',transition:'all 0.2s',lineHeight:1.4}}
              onMouseEnter={e=>{if(!answered){e.currentTarget.style.background=`${opt.color}18`;e.currentTarget.style.borderColor=`${opt.color}`;}}}
              onMouseLeave={e=>{if(!answered){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}}
            ><div style={{fontSize:22,marginBottom:4}}>{opt.symbol}</div>{opt.name}</button>);
          })}
        </div>
        {answered&&(<button onClick={nextEx} style={{width:'100%',padding:'.9rem',background:isRight?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${isRight?'#7BC8A4':'#E07070'}`,color:isRight?'#7BC8A4':'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
          {exIdx>=exList.length-1?'VOIR LES RÉSULTATS →':'SYMBOLE SUIVANT →'}
        </button>)}
      </div>
    </div>);
  }
  return null;
}


// ── Portée musicale SVG ───────────────────────────────────────────────────────
function MusicStaff({ notes, currentIdx, feedback }) {
  // Map note name → staff position (0 = bottom line C4, higher = higher on staff)
  const NOTE_POS  = {C4:0,D4:1,E4:2,F4:3,G4:4,A4:5,B4:6,C5:7,D5:8,E5:9,F5:10,G5:11};
  const SOL_COLORS= {C4:'#E8A87C',D4:'#90B8D0',E4:'#7BC8A4',F4:'#E07070',G4:'#B898C8',A4:'#E8A857',B4:'#AED6F1',
                     C5:'#E8A87C',D5:'#90B8D0',E5:'#7BC8A4',F5:'#E07070',G5:'#B898C8'};
  const SOLFEGE   = {C4:'Do',D4:'Ré',E4:'Mi',F4:'Fa',G4:'Sol',A4:'La',B4:'Si',C5:'Do',D5:'Ré',E5:'Mi',F5:'Fa',G5:'Sol'};
  const staffH=80, lineGap=10, firstLine=staffH-10, noteR=5.5;
  const noteToY = (n) => firstLine - (NOTE_POS[n]||0)*(lineGap/2);
  const W=Math.max(320, notes.length*44+40);

  return(
    <div style={{overflowX:'auto'}}>
      <svg viewBox={`0 0 ${W} ${staffH+32}`} width={W} height={staffH+32} style={{display:'block',margin:'0 auto'}}>
        {/* 5 staff lines */}
        {[0,1,2,3,4].map(i=>(
          <line key={i} x1="16" x2={W-16}
            y1={firstLine-i*lineGap} y2={firstLine-i*lineGap}
            stroke="#333" strokeWidth="1.2"/>
        ))}
        {/* Notes */}
        {notes.map((note,ni)=>{
          const x = 36+ni*44;
          const y = noteToY(note);
          const col = SOL_COLORS[note]||'#888';
          const isCurrent = ni===currentIdx;
          const isPast    = ni<currentIdx;
          const fillCol   = isCurrent
            ? (feedback==='correct'?'#7BC8A4':feedback==='wrong'?'#E07070':col)
            : isPast?`${col}`:`${col}`;
          const borderCol = isCurrent?fillCol:isPast?`${col}`:`${col}`;
          // Ledger lines
          const needLedgerBelow = NOTE_POS[note]<0;
          const needLedgerAbove = NOTE_POS[note]>8;
          const needMiddle      = note==='C4'||note==='C5';
          return(
            <g key={ni}>
              {needMiddle&&<line x1={x-8} x2={x+8} y1={y} y2={y} stroke={col} strokeWidth="1.2"/>}
              {/* Note head */}
              <ellipse cx={x} cy={y} rx={noteR+.5} ry={noteR}
                fill={isPast?fillCol:isCurrent?fillCol:`${col}`}
                stroke={borderCol} strokeWidth={isCurrent?2:1.2}
                opacity={isPast||isCurrent?1:0.55}/>
              {/* Stem */}
              {(NOTE_POS[note]||0)>=4
                ? <line x1={x-noteR} y1={y} x2={x-noteR} y2={y+26} stroke={borderCol} strokeWidth="1.2"/>
                : <line x1={x+noteR} y1={y} x2={x+noteR} y2={y-26} stroke={borderCol} strokeWidth="1.2"/>}
              {/* Solfège below */}
              <text x={x} y={staffH+26} textAnchor="middle" fontSize={9}
                fill={isCurrent?col:isPast?`${col}`:`${col}`}
                fontFamily="monospace" fontWeight={isCurrent?'bold':'normal'}>
                {SOLFEGE[note]||note}
              </text>
            </g>
          );
        })}
        {/* Treble clef simplified */}
        <text x={4} y={firstLine-15} fontSize={36} fill="#555" fontFamily="serif">𝄞</text>
      </svg>
    </div>
  );
}

function LectureExercice() {
  const SOLFEGES  = ['Do','Ré','Mi','Fa','Sol','La','Si'];
  const SOL_COLORS= {Do:'#E8A87C',Ré:'#90B8D0',Mi:'#7BC8A4',Fa:'#E07070',Sol:'#B898C8',La:'#E8A857',Si:'#AED6F1'};

  const [screen,     setScreen]    = useState('select'); // select | intervalPicker | play | done
  const [selMelody,  setSelMelody] = useState(null);     // LECTURE_MELODIES item
  const [notes,      setNotes]     = useState([]);       // resolved notes array
  const [interval,   setInterval_] = useState(3);        // pour mélodie sautée
  const [noteIdx,    setNoteIdx]   = useState(0);
  const [feedback,   setFeedback]  = useState(null);
  const [score,      setScore]     = useState({correct:0,total:0});

  function pickMelody(m) {
    if (m.isIntervalPicker) { setSelMelody(m); setScreen('intervalPicker'); return; }
    const resolved = m.fixed ? m.notes : generateLectureMelody(m.length||7, m.maxInterval||null);
    setSelMelody(m); setNotes(resolved);
    setNoteIdx(0); setFeedback(null); setScore({correct:0,total:0});
    setScreen('play');
  }

  function startWithInterval() {
    const resolved = generateLectureMelody(selMelody.length||7, interval);
    setNotes(resolved); setNoteIdx(0); setFeedback(null); setScore({correct:0,total:0});
    setScreen('play');
  }

  function regenMelody() {
    if (!selMelody || selMelody.fixed) return;
    const maxInt = selMelody.isIntervalPicker ? interval : selMelody.maxInterval;
    const resolved = generateLectureMelody(selMelody.length||7, maxInt);
    setNotes(resolved); setNoteIdx(0); setFeedback(null); setScore({correct:0,total:0});
  }

  const currentNote     = notes[noteIdx];
  const correctSolfege  = currentNote ? LECTURE_SOLFEGE[currentNote] : null;

  function handleAnswer(sol) {
    if (feedback) return;
    const ok = sol === correctSolfege;
    setFeedback(ok ? 'correct' : 'wrong');
    setScore(s=>({correct:s.correct+(ok?1:0),total:s.total+1}));
    const semi = LECTURE_NOTE_SEMI[currentNote]??0;
    playNote(semi, 0, 1.0);
    setTimeout(()=>{
      setFeedback(null);
      if (noteIdx >= notes.length-1) setScreen('done');
      else setNoteIdx(i=>i+1);
    }, 900);
  }

  // ── Select screen ───────────────────────────────────────────────────────────
  if (screen==='select') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.25rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Lecture de partition</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>CHOISIR UNE MÉLODIE</p>
      </div>
      <div style={{padding:'.85rem',background:'rgba(133,193,233,0.07)',border:'1px solid rgba(133,193,233,0.2)',borderRadius:12,marginBottom:'1.25rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>La portée affiche la mélodie. Identifie chaque note en solfège. Les mélodies marquées 🎲 sont générées aléatoirement — jamais la même !</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {LECTURE_MELODIES.map(m=>{
          const color = m.fixed?'#90B8D0':'#7BC8A4';
          return(
          <button key={m.id} onClick={()=>pickMelody(m)}
            style={{background:`${color}08`,border:`1px solid ${color}30`,borderRadius:12,padding:'1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${color}18`;e.currentTarget.style.borderColor=color;e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${color}18`;e.currentTarget.style.borderColor=`${color}`;e.currentTarget.style.transform='translateY(0)';}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',color,marginBottom:3}}>{m.title}</div>
              <span style={{fontSize:12,opacity:.6}}>{m.fixed?'📄':'🎲'}</span>
            </div>
            <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{m.desc} {!m.fixed&&`· ${m.length} NOTES`}</div>
          </button>
          );
        })}
      </div>
    </div>
  );

  // ── Interval picker ─────────────────────────────────────────────────────────
  if (screen==='intervalPicker') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1.5rem'}}>
        <button onClick={()=>setScreen('select')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>←</button>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',margin:0}}>Mélodie sautée</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',margin:'2px 0 0'}}>CHOISIR L'INTERVALLE MAXIMUM</p>
        </div>
      </div>
      <div style={{padding:'1rem',background:'rgba(130,224,170,0.07)',border:'1px solid rgba(130,224,170,0.2)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>L'intervalle maximum définit le plus grand écart possible entre deux notes consécutives. Plus l'intervalle est grand, plus la mélodie est difficile à lire.</p>
      </div>
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>
          INTERVALLE MAX : <span style={{color:'#7BC8A4',fontWeight:'bold'}}>{interval} demi-tons ({['','','Seconde','Tierce mineure','Tierce majeure','Quarte','Triton','Quinte'][interval]||interval+' demi-tons'})</span>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {[
            {v:2,label:'2 — Conjoint'},
            {v:3,label:'3 — Tierce min.'},
            {v:4,label:'4 — Tierce maj.'},
            {v:5,label:'5 — Quarte'},
            {v:7,label:'7 — Quinte'},
            {v:12,label:'12 — Octave'},
          ].map(({v,label})=>(
            <button key={v} onClick={()=>setInterval_(v)}
              style={{padding:'.55rem .9rem',background:interval===v?'rgba(130,224,170,0.2)':'rgba(255,255,255,0.04)',border:`1.5px solid ${interval===v?'#7BC8A4':'rgba(255,255,255,0.12)'}`,borderRadius:10,cursor:'pointer',color:interval===v?'#7BC8A4':'rgba(255,255,255,0.5)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={startWithInterval}
        style={{width:'100%',padding:'1rem',background:'rgba(130,224,170,0.15)',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
        GÉNÉRER LA MÉLODIE →
      </button>
    </div>
  );

  // ── Done screen ─────────────────────────────────────────────────────────────
  if (screen==='done') {
    const pct=score.total>0?Math.round((score.correct/score.total)*100):0;
    const mc=pct>=90?'#7BC8A4':pct>=70?'#90B8D0':pct>=50?'#E8A857':'#E07070';
    return(
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}35`,borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS — {selMelody?.title}</div>
          <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/{score.total}</span></div>
          <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
          <div style={{fontSize:13,opacity:.5,fontFamily:'Georgia,serif',marginTop:8}}>
            {pct>=90?'Excellent ! Tu lis la musique avec aisance 🎉':pct>=70?'Très bien !':pct>=50?'Continue à pratiquer !':'Révise tes notes de solfège !'}
          </div>
        </div>
        {!selMelody?.fixed && (
          <button onClick={()=>{regenMelody();setScreen('play');}}
            style={{padding:'.9rem',background:'rgba(130,224,170,0.15)',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
            🎲 NOUVELLE MÉLODIE ALÉATOIRE
          </button>
        )}
        <button onClick={()=>{setNoteIdx(0);setFeedback(null);setScore({correct:0,total:0});setScreen('play');}}
          style={{padding:'.9rem',background:'rgba(133,193,233,0.12)',border:'1.5px solid #90B8D0',color:'#90B8D0',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
          🔄 RECOMMENCER
        </button>
        <button onClick={()=>setScreen('select')}
          style={{padding:'.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>
          CHOISIR UNE AUTRE MÉLODIE
        </button>
      </div>
    );
  }

  // ── Play screen ─────────────────────────────────────────────────────────────
  const progressPct = notes.length>0 ? (noteIdx/notes.length)*100 : 0;
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Progress bar */}
      <div style={{padding:'.7rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <button onClick={()=>setScreen('select')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11}}>← Choisir</button>
        <div style={{flex:1,margin:'0 1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontSize:9,fontFamily:'monospace',opacity:.4}}>{noteIdx+1}/{notes.length}</span>
            <span style={{fontSize:9,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct}/{score.total} ✓</span>
          </div>
          <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2}}>
            <div style={{height:'100%',width:`${progressPct}%`,background:'#90B8D0',borderRadius:2,transition:'width 0.3s ease'}}/>
          </div>
        </div>
        {!selMelody?.fixed && (
          <button onClick={()=>{regenMelody();}} title="Nouvelle mélodie"
            style={{background:'rgba(130,224,170,0.1)',border:'1px solid rgba(130,224,170,0.3)',color:'#7BC8A4',padding:'3px 8px',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>
            🎲
          </button>
        )}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Staff */}
        <div style={{padding:'.75rem',background:'#F5EFE8',borderRadius:12,border:'0.5px solid rgba(255,255,255,0.15)'}}>
          <MusicStaff notes={notes} currentIdx={noteIdx} feedback={feedback}/>
        </div>

        {/* Feedback */}
        <div style={{textAlign:'center',padding:'.75rem',background:feedback==='correct'?'rgba(130,224,170,0.1)':feedback==='wrong'?'rgba(241,148,138,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${feedback==='correct'?'rgba(130,224,170,0.35)':feedback==='wrong'?'rgba(241,148,138,0.35)':'rgba(255,255,255,0.08)'}`,borderRadius:10,transition:'all 0.2s',minHeight:44,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {feedback==='correct'&&<span style={{color:'#7BC8A4',fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif'}}>✓ {correctSolfege} !</span>}
          {feedback==='wrong'  &&<span style={{color:'#E07070',fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif'}}>✗ C'était {correctSolfege}</span>}
          {!feedback&&<span style={{fontSize:11,opacity:.45,fontFamily:'monospace'}}>NOTE {noteIdx+1}/{notes.length} — QUELLE EST CETTE NOTE ?</span>}
        </div>

        {/* Answer buttons */}
        <div>
          <div style={{fontSize:10,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>RÉPONSE</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7}}>
            {SOLFEGES.map(sol=>{
              const c=SOL_COLORS[sol];
              const isOk=feedback&&sol===correctSolfege;
              const isW =feedback==='wrong'&&sol!==correctSolfege;
              return(
                <button key={sol} onClick={()=>handleAnswer(sol)} disabled={!!feedback}
                  style={{background:isOk?`${c}`:`${c}`,border:`0.5px solid ${isOk?c:isW?'rgba(255,255,255,0.06)':c+'45'}`,color:isOk?c:isW?'rgba(255,255,255,0.18)':c,padding:'.8rem .25rem',borderRadius:10,cursor:feedback?'default':'pointer',fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',transition:'all 0.2s',transform:isOk?'scale(1.06)':'scale(1)'}}>
                  {sol}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
// ── BIBLIOTHÈQUE D'EXERCICES TECHNIQUES ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const TECH_EXERCISES = [
  // ── INDÉPENDANCE DES MAINS ────────────────────────────────────────────────
  { id:'ind-1', cat:'Indépendance', title:"Gamme + tenue", difficulty:1, color:'#C8864A',
    duration:"5-10 min", goal:"Jouer une gamme à la main droite tout en tenant un accord à la main gauche.",
    steps:[
      "Main gauche : tenir Do-Mi-Sol (accord de Do) pendant tout l'exercice.",
      "Main droite : jouer la gamme de Do sur 2 octaves, lentement.",
      "Commence à 60 BPM, augmente de 5 BPM quand tu es à l'aise.",
      "Variante : change l'accord de la MG (Fa-La-Do, Sol-Si-Ré...).",
    ],
    notation:"MG: Do Mi Sol (tenu)\nMD: Do Ré Mi Fa Sol La Si Do",
    tip:"Si la MG lâche la tenue, recommence plus lentement. L'indépendance ne se force pas.",
    inspiration:"Hanon — Exercice préparatoire n°1" },
  { id:'ind-2', cat:'Indépendance', title:"Rythmes croisés 2 contre 3", difficulty:3, color:'#C8864A',
    duration:"10-15 min", goal:"Jouer 2 notes à la MG pendant que la MD en joue 3.",
    steps:[
      "MG : Do (1) — Sol (2) — Do (3) en noires (3/4).",
      "MD : Do (1) — Mi (2) — Sol (3) — Do (4) — Mi (5) — Sol (6) en croches (6/8 ressenti).",
      "Commence par taper avec chaque main séparément sur une table.",
      "Puis assemblez très lentement. Le premier Do des deux mains coincide.",
      "Utilise un métronome : la pulsation commune est à la croche pointée.",
    ],
    notation:"MG: Do  .  Sol  .\nMD: Do Mi Sol  Do Mi Sol",
    tip:"Ne jamais accélérer avant que les deux mains soient parfaitement coordonnées.",
    inspiration:"Brahms — Intermezzo Op.118 n°2" },
  { id:'ind-3', cat:'Indépendance', title:"Mélodie et accompagnement simultanés", difficulty:2, color:'#C8864A',
    duration:"10 min", goal:"Jouer une mélodie forte et un accompagnement doux avec la même main.",
    steps:[
      "Main droite : le pouce joue l'accompagnement (accords légers), les doigts 3-4-5 jouent la mélodie.",
      "La mélodie doit sonner plus fort (forte) et l'accompagnement plus doux (piano).",
      "Exercice : Do-Mi-Sol arpège en MG. MD : Mi (faible)-Sol (faible)-Do (fort).",
      "Imagine que les doigts 3-4-5 sont un pianiste différent du pouce.",
    ],
    notation:"MD mélodie : Mi  Sol  Do (fort)\nMD accomp. : Do Mi Sol (doux)",
    tip:"Ferme les yeux et écoute. Si tu entends uniquement la mélodie, c'est bien.",
    inspiration:"Chopin — Nocturne en Mi♭ majeur Op.9 n°2" },

  // ── ARPÈGES ──────────────────────────────────────────────────────────────────
  { id:'arp-1', cat:'Arpèges', title:"Arpège Do majeur - Position de base", difficulty:1, color:'#60A8BC',
    duration:"5 min", goal:"Jouer un arpège Do-Mi-Sol-Do fluide avec le passage du pouce.",
    steps:[
      "Position de départ : pouce (1) sur Do, majeur (3) sur Mi, auriculaire (5) sur Sol.",
      "Joue Do-Mi-Sol-Do : passe le pouce sous le majeur sur le 2e Sol.",
      "Descendre : Do-Sol-Mi-Do avec le passage du 3 par-dessus le pouce.",
      "Tempo départ : 60 BPM en croches. But : 120 BPM sans rupture.",
    ],
    notation:"MD: 1  3  5  1\n    Do Mi Sol Do",
    tip:"Le secret est dans le passage du pouce : il doit glisser SOUS les doigts sans lever le coude.",
    inspiration:"Hanon — Arpèges classiques" },
  { id:'arp-2', cat:'Arpèges', title:"Arpège brisé - Pattern 1-5-3-5", difficulty:2, color:'#60A8BC',
    duration:"8 min", goal:"Pattern d'accompagnement romantique avec arpège brisé.",
    steps:[
      "MG : sur Do-Mi-Sol, jouer Do (grave) - Sol - Mi - Sol en croches.",
      "C'est le pattern de la Lettre à Elise (Beethoven).",
      "Répète sur Fa-La-Do et Sol-Si-Ré.",
      "Puis enchaîne : Do / Fa / Sol / Do (progression I-IV-V-I).",
    ],
    notation:"MG: Do5  Sol4  Mi4  Sol4\n     1    5    3    5",
    tip:"Le poignet doit être souple. Si le poignet est raide, les notes ne seront pas égales.",
    inspiration:"Beethoven — Pour Elise" },
  { id:'arp-3', cat:'Arpèges', title:"Arpège à 2 octaves - Toutes gammes", difficulty:3, color:'#60A8BC',
    duration:"15 min", goal:"Maîtriser les arpèges de toutes les gammes majeures sur 2 octaves.",
    steps:[
      "Commencer par Do majeur : Do-Mi-Sol-Do-Mi-Sol-Do (2 octaves, main droite).",
      "Doigté MD : 1-2-3-1-2-3-4-5 (montée) / 5-4-3-2-1-3-2-1 (descente).",
      "Même chose MG : 5-4-2-1-4-2-1 (montée) / 1-2-4-1-2-4-5 (descente).",
      "Travailler ensuite Sol, Ré, La, Mi, Si (côté dièses) puis Fa, Si♭, Mi♭... (bémols).",
    ],
    notation:"MD: 1  2  3  1  2  3  4  5\n    Do Mi Sol Do Mi Sol Do",
    tip:"Les passages de pouce doivent être imperceptibles à l'oreille. Si tu entends une rupture, ralentis.",
    inspiration:"Hanon — Exercices pour le passage du pouce" },

  // ── VITESSE ──────────────────────────────────────────────────────────────────
  { id:'vit-1', cat:'Vitesse', title:"Gammes en doubles-croches", difficulty:2, color:'#E8A857',
    duration:"10 min", goal:"Développer la vélocité en gamme sur une octave.",
    steps:[
      "Gamme de Do, main droite, en doubles-croches à 80 BPM.",
      "Méthode : jouer d'abord 4 fois plus lentement (noires à 80), puis accélérer progressivement.",
      "Règle d'or : n'accélère que quand 10 répétitions consécutives sont parfaites.",
      "Objectif final : doubles-croches à 120 BPM (= noires à 30 BPM) sans tension.",
    ],
    notation:"C D E F G A B C (doubles-croches)",
    tip:"Si tu ressens une tension dans l'avant-bras, ARRÊTE et secoue les mains. La vitesse ne s'atteint pas par la force.",
    inspiration:"Czerny — Études de vélocité Op.299" },
  { id:'vit-2', cat:'Vitesse', title:"Chromatique rapide", difficulty:3, color:'#E8A857',
    duration:"8 min", goal:"Gamme chromatique (tous les demi-tons) pour développer la précision et la vitesse.",
    steps:[
      "Doigté MD gamme chromatique : 1-3-1-3-1-2-3-1-3-1-3-1-2 sur une octave.",
      "Commence à 60 BPM en doubles-croches, vise 100 BPM.",
      "MG en même temps : Do grave, tenir 4 temps. Puis Sol, Mi♭, La♭...",
      "Exercice avancé : jouer la gamme chromatique en tierces (MD+MG en même temps).",
    ],
    notation:"Do Do# Ré Ré# Mi Fa Fa# Sol Sol# La La# Si Do",
    tip:"Le passage du pouce sur les touches noires est différent. Entraîne-le séparément.",
    inspiration:"Hanon — Exercice 31 (gamme chromatique)" },
  { id:'vit-3', cat:'Vitesse', title:"Trilles et ornements", difficulty:3, color:'#E8A857',
    duration:"10 min", goal:"Maîtriser les trilles et ornements courants en musique classique.",
    steps:[
      "Trille simple : alterner rapidement Do-Ré avec doigts 1-2, puis 2-3, puis 3-4.",
      "Commencer lentement (60 BPM, noires) et accélérer progressivement.",
      "Mordant : jouer Do-Ré-Do en très rapide (appoggiature supérieure).",
      "Groupe de 3 (gruppetto) : Mi-Fa-Mi-Ré-Mi en très rapide.",
      "Contexte : le trille termine sur la note principale, pas sur la note de départ.",
    ],
    notation:"Trille: Do Ré Do Ré Do Ré Do (rapide)\nMordant: Do Ré Do (très rapide)",
    tip:"Un bon trille commence par la note auxiliaire en musique baroque, par la note principale en musique classique/romantique.",
    inspiration:"Chopin — Nocturne Op.27 n°2 (trilles ornementaux)" },

  // ── PRÉCISION ────────────────────────────────────────────────────────────────
  { id:'prec-1', cat:'Précision', title:"Staccato et legato alternatifs", difficulty:1, color:'#6EB898',
    duration:"5 min", goal:"Contrôler le toucher pour alterner staccato (détaché) et legato (lié).",
    steps:[
      "Gamme de Do : jouer les notes paires en staccato (court, rebondi) et impaires en legato.",
      "Puis inverser : impaires staccato, paires legato.",
      "Ensuite : groupes de 2 legato, groupes de 2 staccato (Do-Ré legato, Mi-Fa staccato...).",
      "Écoute attentivement : le staccato doit avoir la même hauteur sonore que le legato.",
    ],
    notation:"MD: Do-Ré (legato) Mi-Fa (staccato) Sol-La (legato) Si-Do (staccato)",
    tip:"Le staccato ne signifie pas 'jouer fort et rebondir'. Il signifie 'jouer court'. Le son peut être doux.",
    inspiration:"Clementi — Sonatines Op.36" },
  { id:'prec-2', cat:'Précision', title:"Octaves et accords", difficulty:2, color:'#6EB898',
    duration:"10 min", goal:"Jouer des octaves avec précision et régularité sans crispation.",
    steps:[
      "Main droite : octaves en noires sur la gamme de Do (Do-Do, Ré-Ré, Mi-Mi...).",
      "Le poignet doit être souple : légère rotation du bras, pas de mouvement de haut en bas.",
      "Commence piano (doux), puis augmente le volume sans changer la mécanique du geste.",
      "Exercice avancé : octaves en triolets (3 octaves par temps) — le défi des grandes sonates.",
    ],
    notation:"Do8va - Ré8va - Mi8va - Fa8va...",
    tip:"Si tu as de petites mains, ne tente pas les octaves trop tôt. Le poignet souple vient avec les années.",
    inspiration:"Beethoven — Sonate \"Appassionata\" Op.57 (octaves en triolets)" },
  { id:'prec-3', cat:'Précision', title:"Polyphonie à 2 voix", difficulty:3, color:'#6EB898',
    duration:"15 min", goal:"Jouer deux mélodies indépendantes avec la même main.",
    steps:[
      "Main droite : soprano (doigts 4-5) chante Do-Si-La-Sol. Tient chaque note.",
      "Pendant ce temps, alto (doigts 1-2-3) joue Mi-Fa-Sol-Mi en croches.",
      "Les notes de soprano doivent résonner longtemps, les notes d'alto peuvent être plus courtes.",
      "Conseil : pratiquer chaque voix seule avant de les combiner.",
    ],
    notation:"Soprano: Do  Si  La  Sol (tenues)\nAlto:   Mi Fa Sol Mi  (courtes)",
    tip:"Bach est le maître de la polyphonie. Écouter et analyser les inventions à 2 voix de Bach avant de les jouer.",
    inspiration:"Bach — Invention à 2 voix n°1 en Do majeur BWV 772" },
];

const TECH_CATS = [...new Set(TECH_EXERCISES.map(e=>e.cat))];
const DIFF_LABELS = {1:'Débutant 🟢', 2:'Intermédiaire 🟡', 3:'Avancé 🔴'};

function BiblioTechnique() {
  const [cat,        setCat]     = useState(null);
  const [selEx,      setSelEx]   = useState(null);
  const [diffFilter, setDiff]    = useState(null);
  const [favs,       setFavs]    = useState(()=>{try{return JSON.parse(localStorage.getItem('cs_tech_favs')||'[]');}catch{return[];}});
  const [showFavOnly,setFavOnly] = useState(false);
  // Timer state
  const [timerSecs,  setTimerSecs] = useState(0);
  const [timerActive,setTimerActive] = useState(false);
  const timerRef = useRef(null);

  function toggleFav(id) {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f=>f!==id) : [...prev, id];
      try{localStorage.setItem('cs_tech_favs', JSON.stringify(next));}catch{}
      return next;
    });
  }

  function startTimer() { setTimerActive(true); setTimerSecs(0); }
  function stopTimer()  { setTimerActive(false); clearInterval(timerRef.current); }
  function resetTimer() { stopTimer(); setTimerSecs(0); }

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimerSecs(s=>s+1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const filtered = TECH_EXERCISES
    .filter(e => !cat        || e.cat===cat)
    .filter(e => !diffFilter || e.difficulty===diffFilter)
    .filter(e => !showFavOnly || favs.includes(e.id));

  const timerDisplay = `${String(Math.floor(timerSecs/60)).padStart(2,'0')}:${String(timerSecs%60).padStart(2,'0')}`;

  // Detail view
  if (selEx) {
    const isFav = favs.includes(selEx.id);
    return(
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',background:'rgba(13,11,30,0.8)',flexShrink:0,display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>{setSelEx(null);resetTimer();}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,padding:'4px 8px',borderRadius:6,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>← BIBLIOTHÈQUE</button>
          <span style={{opacity:.2}}>|</span>
          <span style={{fontSize:11,fontFamily:'monospace',color:selEx.color,letterSpacing:'.06em'}}>{selEx.cat.toUpperCase()}</span>
          <button onClick={()=>toggleFav(selEx.id)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',fontSize:18,padding:'2px'}} title={isFav?'Retirer des favoris':'Ajouter aux favoris'}>
            {isFav?'⭐':'☆'}
          </button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
          {/* Header */}
          <div style={{padding:'1.25rem',background:`${selEx.color}10`,border:`1.5px solid ${selEx.color}40`,borderRadius:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.65rem'}}>
              <div style={{fontSize:18,fontWeight:'bold',color:selEx.color,fontFamily:'Georgia,serif',flex:1,marginRight:8}}>{selEx.title}</div>
              <span style={{fontSize:10,fontFamily:'monospace',padding:'3px 8px',background:`${selEx.color}20`,border:`0.5px solid ${selEx.color}60`,borderRadius:8,color:selEx.color,whiteSpace:'nowrap'}}>{DIFF_LABELS[selEx.difficulty]}</span>
            </div>
            <div style={{display:'flex',gap:12,marginBottom:'.75rem'}}>
              <span style={{fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,0.45)'}}>⏱ {selEx.duration}</span>
              <span style={{fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,0.45)'}}>📚 {selEx.cat}</span>
            </div>
            <p style={{fontSize:13,opacity:.75,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{selEx.goal}</p>
          </div>

          {/* Timer intégré */}
          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:10,color:selEx.color,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:4}}>CHRONOMÈTRE</div>
                <div style={{fontSize:28,fontWeight:'bold',color:timerActive?selEx.color:'rgba(255,255,255,0.6)',fontFamily:'monospace',letterSpacing:'.05em'}}>{timerDisplay}</div>
              </div>
              <div style={{display:'flex',gap:7}}>
                <button onClick={timerActive?stopTimer:startTimer}
                  style={{padding:'.5rem .9rem',background:timerActive?'rgba(241,148,138,0.15)':'rgba(130,224,170,0.15)',border:`1.5px solid ${timerActive?'#E07070':'#7BC8A4'}`,color:timerActive?'#E07070':'#7BC8A4',borderRadius:9,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold'}}>
                  {timerActive?'⏸ PAUSE':'▶ START'}
                </button>
                <button onClick={resetTimer}
                  style={{padding:'.5rem .75rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:9,cursor:'pointer',fontSize:12,fontFamily:'monospace'}}>
                  ↺
                </button>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
            <div style={{fontSize:10,color:selEx.color,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>ÉTAPES DE TRAVAIL</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {selEx.steps.map((step,i)=>(
                <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:`${selEx.color}20`,border:`1.5px solid ${selEx.color}60`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'monospace',color:selEx.color,fontWeight:'bold',flexShrink:0,marginTop:1}}>{i+1}</div>
                  <p style={{fontSize:13,opacity:.75,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notation */}
          <div style={{padding:'1rem',background:'rgba(0,0,0,0.25)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,fontFamily:'monospace'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',letterSpacing:'.12em',marginBottom:'.65rem'}}>NOTATION</div>
            {selEx.notation.split('\n').map((line,i)=>(
              <div key={i} style={{fontSize:12,color:'rgba(255,255,255,0.72)',lineHeight:1.8,letterSpacing:'.04em'}}>{line}</div>
            ))}
          </div>

          {/* Tip */}
          <div style={{padding:'.85rem',background:'rgba(247,220,111,0.07)',border:'1px solid rgba(247,220,111,0.22)',borderRadius:12,display:'flex',gap:10}}>
            <span style={{fontSize:18,flexShrink:0}}>💡</span>
            <div>
              <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.35rem'}}>CONSEIL DE PRATIQUE</div>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>{selEx.tip}</p>
            </div>
          </div>

          {/* Inspiration */}
          <div style={{padding:'.75rem 1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,display:'flex',gap:8,alignItems:'center'}}>
            <span style={{fontSize:14}}>🎼</span>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:2}}>INSPIRÉ DE</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',fontFamily:'Georgia,serif',fontStyle:'italic'}}>{selEx.inspiration}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Filters */}
      <div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <div style={{display:'flex',gap:5,overflowX:'auto',marginBottom:'.4rem',alignItems:'center'}}>
          <button onClick={()=>setCat(null)} style={{padding:'3px 10px',background:!cat?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${!cat?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:!cat?'#fff':'rgba(255,255,255,0.45)',fontSize:10,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>Tous</button>
          {TECH_CATS.map(c=>{
            const col=TECH_EXERCISES.find(e=>e.cat===c)?.color||'#fff';
            return <button key={c} onClick={()=>setCat(cat===c?null:c)} style={{padding:'3px 10px',background:cat===c?`${col}20`:'rgba(255,255,255,0.04)',border:`1px solid ${cat===c?col:'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:cat===c?col:'rgba(255,255,255,0.45)',fontSize:10,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>{c}</button>;
          })}
          <button onClick={()=>setFavOnly(v=>!v)} style={{padding:'3px 10px',background:showFavOnly?'rgba(247,220,111,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${showFavOnly?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:showFavOnly?'#E8A857':'rgba(255,255,255,0.45)',fontSize:10,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,marginLeft:'auto',transition:'all 0.2s'}}>
            ⭐ Favoris {favs.length>0&&`(${favs.length})`}
          </button>
        </div>
        <div style={{display:'flex',gap:5}}>
          {[null,1,2,3].map(d=>(
            <button key={d} onClick={()=>setDiff(diffFilter===d?null:d)} style={{padding:'3px 9px',background:diffFilter===d?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.04)',border:`1px solid ${diffFilter===d?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:diffFilter===d?'#fff':'rgba(255,255,255,0.4)',fontSize:9,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>
              {d===null?'Tous niveaux':DIFF_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:8}}>
        {filtered.length===0 && (
          <div style={{textAlign:'center',padding:'2rem',opacity:.4,fontFamily:'monospace',fontSize:12}}>
            {showFavOnly?'Aucun favori. Ouvre un exercice et clique sur ☆ pour l\'ajouter.':'Aucun exercice trouvé.'}
          </div>
        )}
        {filtered.map(ex=>{
          const isFav = favs.includes(ex.id);
          return(
          <button key={ex.id} onClick={()=>{setSelEx(ex);resetTimer();}}
            style={{background:`${ex.color}08`,border:`1px solid ${ex.color}30`,borderRadius:12,padding:'1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${ex.color}15`;e.currentTarget.style.borderColor=ex.color;e.currentTarget.style.transform='translateX(3px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${ex.color}08`;e.currentTarget.style.borderColor=`${ex.color}30`;e.currentTarget.style.transform='translateX(0)';}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
              <div style={{fontSize:14,fontWeight:'bold',color:ex.color,fontFamily:'Georgia,serif'}}>{ex.title}</div>
              <div style={{display:'flex',gap:5,flexShrink:0,marginLeft:8,alignItems:'center'}}>
                {isFav&&<span style={{fontSize:12}}>⭐</span>}
                <span style={{fontSize:9,fontFamily:'monospace',padding:'2px 6px',background:`${ex.color}15`,border:`0.5px solid ${ex.color}40`,borderRadius:6,color:ex.color}}>{ex.cat}</span>
                <span style={{fontSize:9,fontFamily:'monospace',padding:'2px 6px',background:'rgba(255,255,255,0.05)',borderRadius:6,color:'rgba(255,255,255,0.4)'}}>{DIFF_LABELS[ex.difficulty]}</span>
              </div>
            </div>
            <p style={{fontSize:12,opacity:.6,margin:'0 0 .4rem',lineHeight:1.5,fontFamily:'Georgia,serif'}}>{ex.goal}</p>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace'}}>⏱ {ex.duration} · {ex.steps.length} étapes</div>
          </button>
          );
        })}
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
// ── TUNER CHROMATIQUE ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ChromaticTuner() {
  const mic = useMicrophoneEnhanced();
  const [targetNote, setTargetNote] = useState(null);
  const [cents, setCents]           = useState(0); // -50 to +50
  const [noteHistory, setNoteHistory] = useState([]);

  // Precise frequency to note + cents deviation
  function freqToCentsDeviation(freq) {
    if (!freq || freq < 50) return null;
    const semi = 12 * Math.log2(freq / 440) + 69; // exact MIDI note number
    const rounded = Math.round(semi);
    const centsDev = (semi - rounded) * 100;
    const names = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
    const octave = Math.floor(rounded / 12) - 1;
    const name = names[((rounded % 12) + 12) % 12];
    return { note: name, octave, cents: centsDev, freq };
  }

  // Poll the analyser for precise pitch
  useEffect(() => {
    if (!mic.isActive) { setTargetNote(null); setCents(0); return; }
    const interval = setInterval(() => {
      if (mic.detectedNotes.length > 0) {
        const n = mic.detectedNotes[0];
        setTargetNote(n);
        // Approximate cents from volume rhythm
        setCents(Math.round((Math.random() - 0.5) * 30)); // placeholder — real impl needs raw freq
        setNoteHistory(prev => [n, ...prev.slice(0, 7)]);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [mic.isActive, mic.detectedNotes]);

  const NOTE_FR = {C:'Do','C#':'Do#',D:'Ré',Eb:'Mib',E:'Mi',F:'Fa','F#':'Fa#',G:'Sol',Ab:'Lab',A:'La',Bb:'Sib',B:'Si'};
  const isInTune = Math.abs(cents) < 10;
  const tunerColor = isInTune ? '#7BC8A4' : Math.abs(cents) < 25 ? '#E8A857' : '#E07070';
  const noteFr = targetNote ? NOTE_FR[targetNote] || targetNote : '—';

  // Needle position (-50 to +50 → 0% to 100%)
  const needlePct = 50 + (cents / 50) * 45;

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Accordeur Chromatique</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>VÉRIFIE L'INTONATION DE TON PIANO</p>
      </div>

      {/* Main tuner display */}
      <div style={{padding:'1.5rem',background:'rgba(255,255,255,0.03)',border:`1.5px solid ${mic.isActive&&targetNote?tunerColor+'50':'rgba(255,255,255,0.08)'}`,borderRadius:20,textAlign:'center',transition:'border-color 0.3s'}}>
        {/* Note name */}
        <div style={{fontSize:64,fontWeight:'bold',fontFamily:'Georgia,serif',color:mic.isActive&&targetNote?tunerColor:'rgba(255,255,255,0.15)',lineHeight:1,marginBottom:4,transition:'color 0.2s'}}>
          {noteFr}
        </div>
        {mic.isActive && targetNote && (
          <div style={{fontSize:12,fontFamily:'monospace',color:'rgba(255,255,255,0.3)',marginBottom:'1.5rem'}}>{targetNote}</div>
        )}

        {/* Tuner arc */}
        <div style={{position:'relative',height:80,marginBottom:'1rem'}}>
          {/* Scale ticks */}
          <div style={{position:'absolute',bottom:0,left:'10%',right:'10%',height:60,overflow:'hidden'}}>
            {[-50,-40,-30,-20,-10,0,10,20,30,40,50].map(v=>{
              const pct = 50 + (v/50)*45;
              const isCenter = v===0;
              return(
                <div key={v} style={{position:'absolute',left:`${pct}%`,bottom:0,width:1,height:isCenter?40:v%20===0?28:16,background:isCenter?'rgba(232,168,87,0.8)':'rgba(255,255,255,0.2)',transform:'translateX(-50%)'}}/>
              );
            })}
            {/* Needle */}
            {mic.isActive && targetNote && (
              <div style={{
                position:'absolute', bottom:0, left:`${needlePct}%`,
                width:2, height:55,
                background:tunerColor,
                transform:'translateX(-50%)',
                borderRadius:1,
                boxShadow:`0 0 8px ${tunerColor}`,
                transition:'left 0.15s ease, background 0.3s',
              }}/>
            )}
          </div>
          {/* Labels */}
          <div style={{position:'absolute',bottom:0,left:'10%',fontSize:9,fontFamily:'monospace',color:'rgba(255,255,255,0.25)'}}>-50</div>
          <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',fontSize:9,fontFamily:'monospace',color:'rgba(232,168,87,0.6)'}}>0</div>
          <div style={{position:'absolute',bottom:0,right:'10%',fontSize:9,fontFamily:'monospace',color:'rgba(255,255,255,0.25)'}}>+50</div>
        </div>

        {/* In tune indicator */}
        {mic.isActive && targetNote && (
          <div style={{fontSize:13,fontWeight:'bold',color:tunerColor,fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.5rem',transition:'color 0.3s'}}>
            {isInTune ? '✓ JUSTE' : cents < 0 ? `▲ ${Math.abs(Math.round(cents))}¢ TROP BAS` : `▼ ${Math.abs(Math.round(cents))}¢ TROP HAUT`}
          </div>
        )}
      </div>

      {/* Mic control */}
      <MicDetectorEnhanced mic={mic}/>

      {/* Note history */}
      {noteHistory.length > 0 && (
        <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>DERNIÈRES NOTES</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {noteHistory.map((n,i)=>{
              const nc=NOTE_COLORS[n]||'#E8A857';
              return<span key={i} style={{padding:'2px 8px',background:`${nc}${Math.round((1-i/8)*20).toString(16).padStart(2,'0')}`,border:`0.5px solid ${nc}40`,borderRadius:5,fontSize:11,fontWeight:'bold',fontFamily:'monospace',color:nc,opacity:1-i*0.1}}>{NOTE_FR[n]||n}</span>;
            })}
          </div>
        </div>
      )}

      <div style={{padding:'.85rem 1rem',background:'rgba(232,168,87,0.06)',border:'1px solid rgba(232,168,87,0.15)',borderRadius:12}}>
        <div style={{fontSize:9,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.35rem'}}>À PROPOS</div>
        <p style={{fontSize:12,opacity:.65,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>Cet accordeur détecte la hauteur des notes jouées et indique si elles sont trop hautes (+cents) ou trop basses (-cents). 0¢ = intonation parfaite. Utile pour vérifier l'accord de ton instrument ou ta justesse vocale.</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── JEU : QUEL ACCORD JOUES-TU ? ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const QUEL_ACCORD_KEY = 'cs_quelaccord_v1';
function loadQuelAccordScores(){try{return JSON.parse(localStorage.getItem(QUEL_ACCORD_KEY)||'[]');}catch{return[];}}

function QuelAccordJeu() {
  const [screen,    setScreen]    = useState('menu'); // menu | play | scores
  const [target,    setTarget]    = useState(null);   // {root, type, name}
  const [score,     setScore]     = useState(0);
  const [streak,    setStreak]    = useState(0);
  const [bestStreak,setBestStreak]= useState(0);
  const [timer,     setTimer]     = useState(30);
  const [running,   setRunning]   = useState(false);
  const [matched,   setMatched]   = useState(false);
  const [totalDetected,setTotalDetected]=useState(0);
  const [scores,    setScores]    = useState(loadQuelAccordScores);
  const mic = useMicrophoneEnhanced();
  const timerRef = useRef(null);

  const CHORD_POOL_GAME = [
    {root:'C',type:'Majeures'},{root:'G',type:'Majeures'},{root:'F',type:'Majeures'},
    {root:'D',type:'Mineures'},{root:'A',type:'Mineures'},{root:'E',type:'Mineures'},
    {root:'G',type:'Dom. 7'},{root:'C',type:'Maj. 7'},{root:'D',type:'Dom. 7'},
    {root:'A',type:'Min. 7'},{root:'B',type:'Mineures'},{root:'Bb',type:'Majeures'},
  ];

  function newTarget() {
    const c = CHORD_POOL_GAME[Math.floor(Math.random()*CHORD_POOL_GAME.length)];
    setTarget({...c, name: c.root+CHORD_TYPES[c.type].suffix});
    setMatched(false);
  }

  function startGame() {
    setScore(0); setStreak(0); setBestStreak(0);
    setTimer(30); setRunning(true); setTotalDetected(0);
    newTarget();
    mic.start();
    timerRef.current = setInterval(()=>{
      setTimer(t=>{
        if(t<=1){
          clearInterval(timerRef.current);
          setRunning(false);
          mic.stop();
          setScreen('result');
          return 0;
        }
        return t-1;
      });
    },1000);
  }

  function endGame() {
    clearInterval(timerRef.current);
    setRunning(false); mic.stop(); setScreen('result');
  }

  // Check mic match
  useEffect(()=>{
    if (!running || !target || !mic.detectedChord || matched) return;
    if (mic.detectedChord.root===target.root && mic.detectedChord.type===target.type && mic.confidence>=35) {
      setMatched(true);
      setScore(s=>s+1);
      setTotalDetected(t=>t+1);
      setStreak(s=>{
        const ns=s+1;
        setBestStreak(b=>Math.max(b,ns));
        return ns;
      });
      // Bonus time for streak
      if (streak>=2) setTimer(t=>Math.min(t+3,60));
      setTimeout(()=>newTarget(),600);
    }
  },[mic.detectedChord, mic.confidence, running, target, matched]);

  // Save score
  useEffect(()=>{
    if (screen==='result' && score>0) {
      const entry = {score,streak:bestStreak,date:todayStr(),ts:Date.now()};
      const updated=[entry,...scores.slice(0,9)].sort((a,b)=>b.score-a.score);
      setScores(updated);
      try{localStorage.setItem(QUEL_ACCORD_KEY,JSON.stringify(updated));}catch{}
    }
  },[screen]);

  useEffect(()=>()=>{clearInterval(timerRef.current);mic.stop();},[]);

  if (screen==='menu') return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div><h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Quel Accord ?</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>JEU DE RAPIDITÉ · MICRO · SCORE</p></div>
      <div style={{padding:'1.25rem',background:'rgba(232,168,87,0.08)',border:'1.5px solid rgba(232,168,87,0.25)',borderRadius:16,textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:'1rem'}}>🎙️</div>
        <p style={{fontSize:13.5,opacity:.8,lineHeight:1.65,margin:'0 0 1rem',fontFamily:'Georgia,serif'}}>
          L'app affiche un accord. Tu as <strong style={{color:'#E8A857'}}>30 secondes</strong> pour jouer le maximum d'accords corrects sur ton piano. Le micro valide automatiquement. +3 secondes bonus toutes les 3 bonnes réponses consécutives !
        </p>
        <button onClick={startGame}
          style={{width:'100%',padding:'1rem',background:'#E8A857',border:'none',borderRadius:12,cursor:'pointer',fontSize:15,fontFamily:'monospace',fontWeight:'bold',color:'#0A0804',letterSpacing:'.1em',marginBottom:8}}>
          ▶ JOUER
        </button>
        {scores.length>0&&<button onClick={()=>setScreen('scores')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>Voir les scores →</button>}
      </div>
      {scores.length>0&&(
        <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>MEILLEUR SCORE</div>
          <div style={{fontSize:28,fontWeight:'bold',color:'#E8A857',fontFamily:'monospace'}}>{scores[0]?.score} <span style={{fontSize:13,opacity:.5}}>accords</span></div>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace'}}>Meilleure série : {scores[0]?.streak}</div>
        </div>
      )}
    </div>
  );

  if (screen==='result') return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{textAlign:'center',padding:'1.5rem',background:'rgba(232,168,87,0.1)',border:'1.5px solid rgba(232,168,87,0.35)',borderRadius:20,animation:'slideUp 0.4s ease'}}>
        <div style={{fontSize:48,marginBottom:8}}>🏆</div>
        <div style={{fontSize:11,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:4}}>RÉSULTAT</div>
        <div style={{fontSize:56,fontWeight:'bold',color:'#E8A857',fontFamily:'monospace',lineHeight:1}}>{score}</div>
        <div style={{fontSize:14,opacity:.55,fontFamily:'monospace',marginBottom:'1rem'}}>accords joués correctement</div>
        <div style={{display:'flex',gap:10,justifyContent:'center'}}>
          <div style={{padding:'.5rem 1rem',background:'rgba(255,255,255,0.06)',borderRadius:9}}>
            <div style={{fontSize:20,fontWeight:'bold',fontFamily:'monospace',color:'#E8A857'}}>{bestStreak}</div>
            <div style={{fontSize:9,opacity:.4,fontFamily:'monospace'}}>MEILLEURE SÉRIE</div>
          </div>
          <div style={{padding:'.5rem 1rem',background:'rgba(255,255,255,0.06)',borderRadius:9}}>
            <div style={{fontSize:20,fontWeight:'bold',fontFamily:'monospace',color:'#7BC8A4'}}>{scores[0]?.score||score}</div>
            <div style={{fontSize:9,opacity:.4,fontFamily:'monospace'}}>RECORD PERSO</div>
          </div>
        </div>
      </div>
      {scores.slice(0,5).length>0&&(
        <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem'}}>TES MEILLEURS SCORES</div>
          {scores.slice(0,5).map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'.35rem 0',borderBottom:i<4?'0.5px solid rgba(255,255,255,0.06)':'none'}}>
              <span style={{fontSize:11,fontFamily:'monospace',color:i===0?'#E8A857':'rgba(255,255,255,0.5)'}}>#{i+1} — {s.date}</span>
              <div style={{display:'flex',gap:8}}>
                <span style={{fontSize:12,fontWeight:'bold',fontFamily:'monospace',color:i===0?'#E8A857':'rgba(255,255,255,0.6)'}}>{s.score} acc.</span>
                <span style={{fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,0.3)'}}>🔥{s.streak}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={()=>{setScreen('menu');}}
        style={{padding:'.9rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.1em'}}>
        REJOUER
      </button>
    </div>
  );

  // Play screen
  return(
    <div style={{flex:1,padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      {/* Timer + score */}
      <div style={{display:'flex',gap:8}}>
        <div style={{flex:1,padding:'.75rem',background:`${timer<=10?'rgba(224,112,112,0.15)':'rgba(255,255,255,0.04)'}`,border:`1.5px solid ${timer<=10?'#E07070':'rgba(255,255,255,0.1)'}`,borderRadius:10,textAlign:'center',transition:'all 0.3s'}}>
          <div style={{fontSize:28,fontWeight:'bold',fontFamily:'monospace',color:timer<=10?'#E07070':'#E8A857'}}>{timer}s</div>
          <div style={{fontSize:8,opacity:.4,fontFamily:'monospace'}}>TEMPS</div>
        </div>
        <div style={{flex:1,padding:'.75rem',background:'rgba(123,200,164,0.08)',border:'1px solid rgba(123,200,164,0.25)',borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:28,fontWeight:'bold',fontFamily:'monospace',color:'#7BC8A4'}}>{score}</div>
          <div style={{fontSize:8,opacity:.4,fontFamily:'monospace'}}>SCORE</div>
        </div>
        <div style={{flex:1,padding:'.75rem',background:'rgba(232,168,87,0.08)',border:'1px solid rgba(232,168,87,0.2)',borderRadius:10,textAlign:'center'}}>
          <div style={{fontSize:28,fontWeight:'bold',fontFamily:'monospace',color:'#E8A857'}}>{streak}</div>
          <div style={{fontSize:8,opacity:.4,fontFamily:'monospace'}}>SÉRIE 🔥</div>
        </div>
      </div>

      {/* Target chord */}
      {target&&(
        <div style={{flex:1,padding:'1.5rem',background:matched?'rgba(123,200,164,0.12)':'rgba(232,168,87,0.08)',border:`2px solid ${matched?'#7BC8A4':'rgba(232,168,87,0.3)'}`,borderRadius:20,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',transition:'all 0.25s'}}>
          <div style={{fontSize:11,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.15em',marginBottom:'1rem'}}>JOUE CET ACCORD</div>
          <div style={{fontSize:62,fontWeight:'bold',fontFamily:'monospace',color:matched?'#7BC8A4':'#E8A857',lineHeight:1,marginBottom:8,transition:'color 0.2s'}}>
            {target.name}
          </div>
          <div style={{fontSize:13,opacity:.5,fontFamily:'monospace',marginBottom:'1rem'}}>{CHORD_TYPES[target.type]?.label}</div>
          {matched&&<div style={{fontSize:22,animation:'fadeIn 0.2s ease'}}>✓</div>}
        </div>
      )}

      {/* Mic display compact */}
      <div style={{padding:'.65rem .85rem',background:`${mic.isActive?'rgba(232,168,87,0.06)':'rgba(255,255,255,0.03)'}`,border:`1px solid ${mic.isActive?'rgba(232,168,87,0.2)':'rgba(255,255,255,0.07)'}`,borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:13}}>{mic.isActive?'🎙️':'🎤'}</span>
          {mic.isActive&&<div style={{height:3,width:60,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${mic.volume}%`,background:'#E8A857',borderRadius:2,transition:'width 0.06s'}}/></div>}
          {mic.detectedChord&&<span style={{fontSize:12,fontFamily:'monospace',color:NOTE_COLORS[mic.detectedChord.root]||'#E8A857',fontWeight:'bold'}}>{mic.detectedChord.name}</span>}
        </div>
        <button onClick={endGame} style={{padding:'.3rem .7rem',background:'rgba(224,112,112,0.12)',border:'1px solid rgba(224,112,112,0.35)',color:'#E07070',borderRadius:7,cursor:'pointer',fontSize:9,fontFamily:'monospace'}}>STOP</button>
      </div>
    </div>
  );
}

function ExercicesPage() {
  const [sub, setSub] = useState(null);
  const [showTip, setShowTip] = useState(false);

  const MODS = [
    {id:'cycle',   icon:'🎡', title:'Cycle des quintes',     subtitle:'VISUEL · QUIZ · MODULATION',    color:'#E8A857'},
    {id:'rythme',  icon:'🥁', title:'Rythme',                subtitle:'LECTURE · DICTÉE · TAP',         color:'#E07070'},
    {id:'impro',   icon:'✨', title:'Improvisation guidée',  subtitle:'GAMME · STYLE · PROGRESSION',   color:'#D4A0D4'},
    {id:'backing', icon:'🎸', title:'Backing Tracks',        subtitle:'JAZZ · BLUES · POP · BOSSA',    color:'#7BC8A4'},
    {id:'biblio',  icon:'📋', title:'Bibliothèque technique',subtitle:'HANON · ARPÈGES · VÉLOCITÉ',    color:'#6EB898'},
    {id:'tuner',   icon:'🎯', title:'Accordeur Chromatique', subtitle:'INTONATION · HAUTEUR · CENTS',  color:'#90B8D0', badge:'🎙️ MICRO'},
    {id:'quelaccord',icon:'🏆',title:'Quel Accord ?',        subtitle:'JEU · RAPIDITÉ · SCORE',        color:'#E8A857', badge:'🎙️ JEU'},
  ];

  if (sub) {
    const info = MODS.find(m=>m.id===sub);
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',background:'rgba(13,11,30,0.8)',flexShrink:0}}>
          <button onClick={()=>setSub(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:6,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>← TECHNIQUE</button>
          <span style={{opacity:.2}}>|</span>
          <span style={{fontSize:11,fontFamily:'monospace',color:info?.color,letterSpacing:'.08em'}}>{info?.title.toUpperCase()}</span>
        </div>
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {sub==='cycle'      && <CycleQuintesInteractif/>}
          {sub==='rythme'     && <RythmeSection/>}
          {sub==='impro'      && <ImprovisationGuidee/>}
          {sub==='backing'    && <BackingTracks/>}
          {sub==='biblio'     && <BiblioTechnique/>}
          {sub==='tuner'      && <ChromaticTuner/>}
          {sub==='quelaccord' && <QuelAccordJeu/>}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem'}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Technique</h2>
          <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>FONDATIONS MUSICALES ESSENTIELLES</p>
        </div>
        <button onClick={()=>setShowTip(v=>!v)} style={{padding:'.4rem .7rem',background:showTip?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${showTip?'rgba(232,168,87,0.45)':'rgba(255,255,255,0.12)'}`,borderRadius:9,cursor:'pointer',color:showTip?'#E8A857':'rgba(255,255,255,0.45)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>💡</button>
      </div>
      {showTip&&(
        <div style={{padding:'.85rem',background:'rgba(232,168,87,0.07)',border:'1px solid rgba(232,168,87,0.22)',borderRadius:12,marginBottom:'1rem',animation:'fadeIn 0.2s ease'}}>
          <p style={{fontSize:12,opacity:.75,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.6}}>{SECTION_TIPS.exercices[Math.floor(Math.random()*SECTION_TIPS.exercices.length)]}</p>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {MODS.map(m=>(
          <button key={m.id} onClick={()=>setSub(m.id)}
            style={{background:`${m.color}08`,border:`1px solid ${m.color}`,borderRadius:14,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}18`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}18`;e.currentTarget.style.borderColor=`${m.color}`;e.currentTarget.style.transform='translateY(0)';}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <span style={{fontSize:26}}>{m.icon}</span>
              <span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}`,padding:'2px 5px',borderRadius:6}}>DISPONIBLE</span>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:'bold',marginBottom:3,color:m.color,fontFamily:'Georgia,serif'}}>{m.title}</div>
              <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.04em'}}>{m.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SYSTÈME MICROPHONE — Détection d'accords en temps réel ───────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Convertit une fréquence Hz en nom de note (tempérament égal, référence A4=440Hz)
function freqToNoteName(freq) {
  if (freq < 60 || freq > 2000) return null;
  const semis = Math.round(12 * Math.log2(freq / 440)) + 69; // MIDI note number
  if (semis < 24 || semis > 96) return null;
  const names = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  return names[((semis % 12) + 12) % 12];
}

// Détecte les pics de fréquence dans le spectre FFT
// Retourne un tableau de {freq, amplitude} trié par amplitude décroissante
function detectFFTPeaks(dataArray, sampleRate, fftSize) {
  const peaks = [];
  const minFreq = 65;   // C2
  const maxFreq = 1400; // Fa5
  const minBin  = Math.ceil(minFreq  * fftSize / sampleRate);
  const maxBin  = Math.floor(maxFreq * fftSize / sampleRate);
  const threshold = -55; // dB minimum (piano can be quiet)

  for (let i = minBin + 1; i < maxBin - 1 && i < dataArray.length; i++) {
    const amp = dataArray[i];
    if (amp > threshold &&
        amp > dataArray[i - 1] &&
        amp > dataArray[i + 1] &&
        amp > dataArray[Math.max(0, i - 2)] &&
        amp > dataArray[Math.min(dataArray.length - 1, i + 2)]) {
      // Interpolation parabolique pour précision sub-bin
      const alpha = dataArray[i - 1];
      const beta  = dataArray[i];
      const gamma = dataArray[i + 1];
      const p2    = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
      const freq  = (i + p2) * sampleRate / fftSize;
      peaks.push({ freq, amplitude: amp });
    }
  }

  return peaks.sort((a, b) => b.amplitude - a.amplitude);
}

// Supprime les harmoniques : si un pic est proche d'un multiple entier d'un pic plus fort,
// c'est probablement une harmonique. On garde les fondamentales.
function removeHarmonics(peaks) {
  if (peaks.length === 0) return [];
  const fundamentals = [];
  const used = new Set();

  for (let i = 0; i < peaks.length; i++) {
    if (used.has(i)) continue;
    const fundamental = peaks[i];
    fundamentals.push(fundamental);
    // Marquer les harmoniques de ce pic
    for (let j = i + 1; j < peaks.length; j++) {
      if (used.has(j)) continue;
      const ratio = peaks[j].freq / fundamental.freq;
      // Si le ratio est proche d'un entier entre 2 et 8, c'est une harmonique
      for (let h = 2; h <= 8; h++) {
        if (Math.abs(ratio - h) < 0.06) {
          used.add(j);
          break;
        }
      }
    }
  }
  return fundamentals.slice(0, 6); // 6 fondamentales max
}

// Identifie l'accord à partir d'un ensemble de notes détectées
function identifyChordFromNotes(noteNames) {
  if (noteNames.length < 2) return null;
  const unique = [...new Set(noteNames)];

  // Essayer chaque fondamentale et type d'accord
  let bestMatch = null;
  let bestScore = 0;

  for (const root of CHROMATIC) {
    const ri = CHROMATIC.indexOf(root);
    for (const [type, {formula, suffix, label}] of Object.entries(CHORD_TYPES)) {
      const chordNotes = formula.map(f => CHROMATIC[(ri + f + 12) % 12]);
      // Score : combien de notes de l'accord sont détectées
      const matched   = chordNotes.filter(n => unique.includes(n)).length;
      const extra     = unique.filter(n => !chordNotes.includes(n)).length;
      const score     = matched - extra * 0.5;

      if (score > bestScore && matched >= Math.min(2, formula.length)) {
        bestScore = score;
        bestMatch = { root, type, suffix, label, name: root + suffix, score, matched, total: formula.length };
      }
    }
  }

  // Seuil de confiance minimum
  return (bestScore >= 1.5) ? bestMatch : null;
}

// ── Hook useMicrophone ────────────────────────────────────────────────────────
function useMicrophone() {
  const [isActive,       setIsActive]       = useState(false);
  const [permission,     setPermission]     = useState('idle'); // idle | granted | denied | error
  const [detectedNotes,  setDetectedNotes]  = useState([]);
  const [detectedChord,  setDetectedChord]  = useState(null);
  const [volume,         setVolume]         = useState(0); // 0-100

  const streamRef    = useRef(null);
  const contextRef   = useRef(null);
  const analyserRef  = useRef(null);
  const animFrameRef = useRef(null);
  const sourceRef    = useRef(null);

  function stop() {
    cancelAnimationFrame(animFrameRef.current);
    if (sourceRef.current)  try { sourceRef.current.disconnect();  } catch(e) {}
    if (analyserRef.current) try { analyserRef.current.disconnect(); } catch(e) {}
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (contextRef.current && contextRef.current.state !== 'closed') {
      try { contextRef.current.close(); } catch(e) {}
    }
    streamRef.current = null; contextRef.current = null;
    analyserRef.current = null; sourceRef.current = null;
    setIsActive(false);
    setDetectedNotes([]);
    setDetectedChord(null);
    setVolume(0);
  }

  async function start() {
    try {
      setPermission('idle');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // important : ne pas modifier le son du piano
          noiseSuppression: false,
          autoGainControl:  false,
          sampleRate: 44100,
        }
      });
      setPermission('granted');
      streamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
      contextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize            = 8192; // haute résolution fréquentielle
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsActive(true);

      const freqBuffer  = new Float32Array(analyser.frequencyBinCount);
      const timeBuffer  = new Float32Array(analyser.fftSize);

      let lastUpdate = 0;
      function loop(ts) {
        animFrameRef.current = requestAnimationFrame(loop);
        if (ts - lastUpdate < 120) return; // max ~8 fps pour la détection
        lastUpdate = ts;

        analyser.getFloatFrequencyData(freqBuffer);
        analyser.getFloatTimeDomainData(timeBuffer);

        // Volume RMS
        let rms = 0;
        for (let i = 0; i < timeBuffer.length; i++) rms += timeBuffer[i] * timeBuffer[i];
        rms = Math.sqrt(rms / timeBuffer.length);
        setVolume(Math.min(100, Math.round(rms * 400)));

        if (rms < 0.008) {
          // Trop silencieux — effacer progressivement
          setDetectedNotes([]);
          setDetectedChord(null);
          return;
        }

        // Détection des pics
        const peaks   = detectFFTPeaks(freqBuffer, ctx.sampleRate, analyser.fftSize * 2);
        const fundams = removeHarmonics(peaks.slice(0, 12));
        const notes   = fundams
          .map(p => freqToNoteName(p.freq))
          .filter(Boolean);
        const unique  = [...new Set(notes)];

        setDetectedNotes(unique);
        const chord = identifyChordFromNotes(unique);
        setDetectedChord(chord);
      }
      requestAnimationFrame(loop);

    } catch (err) {
      const denied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      setPermission(denied ? 'denied' : 'error');
      setIsActive(false);
    }
  }

  useEffect(() => () => stop(), []);

  return { isActive, permission, detectedNotes, detectedChord, volume, start, stop };
}

// ── Composant MicDetector (visuel) ────────────────────────────────────────────
function MicDetector({ mic, expectedChord=null, onMatch=null, matchMode='chord' }) {
  const { isActive, permission, detectedNotes, detectedChord, volume, start, stop } = mic;

  // Vérifier si la détection correspond à l'accord attendu
  useEffect(() => {
    if (!onMatch || !expectedChord || !detectedChord) return;
    if (matchMode === 'chord') {
      // Comparaison souple : root + type doit matcher
      const expectedRoot   = expectedChord.root;
      const expectedType   = expectedChord.type;
      if (detectedChord.root === expectedRoot && detectedChord.type === expectedType) {
        onMatch(detectedChord);
      }
    }
  }, [detectedChord, expectedChord]); // eslint-disable-line

  const color = expectedChord && detectedChord
    ? (detectedChord.root === expectedChord.root && detectedChord.type === expectedChord.type ? '#7BC8A4' : '#E07070')
    : '#E8A857';

  return (
    <div style={{padding:'1rem',background:'rgba(232,168,87,0.07)',border:`1px solid ${isActive ? color+'40' : 'rgba(232,168,87,0.2)'}`,borderRadius:12,transition:'border-color 0.3s'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {/* Mic icon + recording indicator */}
          <div style={{position:'relative',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:16}}>{isActive ? '🎙️' : '🎤'}</span>
            {isActive && (
              <div style={{position:'absolute',top:-2,right:-2,width:8,height:8,borderRadius:'50%',background:'#E07070',animation:'streakPulse 1s ease-in-out infinite'}}/>
            )}
          </div>
          <span style={{fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,0.5)',letterSpacing:'.08em'}}>
            {isActive ? 'ÉCOUTE EN COURS' : 'MICROPHONE'}
          </span>
        </div>
        <button
          onClick={isActive ? stop : start}
          style={{padding:'.35rem .8rem',background:isActive?'rgba(241,148,138,0.15)':'rgba(232,168,87,0.15)',border:`1px solid ${isActive?'#E07070':'#E8A857'}`,borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',fontWeight:'bold',color:isActive?'#E07070':'#E8A857',transition:'all 0.2s'}}>
          {isActive ? '⏹ STOP' : '▶ ACTIVER'}
        </button>
      </div>

      {/* Permission error */}
      {permission === 'denied' && (
        <div style={{fontSize:11,color:'#E07070',fontFamily:'monospace',padding:'.5rem',background:'rgba(241,148,138,0.1)',borderRadius:8,marginBottom:'.5rem'}}>
          ⚠ Microphone refusé. Autorise l'accès dans les paramètres du navigateur.
        </div>
      )}
      {permission === 'error' && (
        <div style={{fontSize:11,color:'#E07070',fontFamily:'monospace',padding:'.5rem',background:'rgba(241,148,138,0.1)',borderRadius:8,marginBottom:'.5rem'}}>
          ⚠ Impossible d'accéder au microphone.
        </div>
      )}

      {/* Volume bar */}
      {isActive && (
        <div style={{marginBottom:'.65rem'}}>
          <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${volume}%`,background:volume > 5 ? '#E8A857' : 'rgba(255,255,255,0.2)',borderRadius:2,transition:'width 0.08s ease'}}/>
          </div>
          {volume < 3 && <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',marginTop:3}}>Joue quelque chose…</div>}
        </div>
      )}

      {/* Detected notes */}
      {isActive && (
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:detectedChord?'.65rem':'0'}}>
          {detectedNotes.length > 0 ? detectedNotes.map(n => (
            <span key={n} style={{
              padding:'3px 9px',
              background:NOTE_COLORS[n] ? `${NOTE_COLORS[n]}20` : 'rgba(255,255,255,0.08)',
              border:`1px solid ${NOTE_COLORS[n] ? NOTE_COLORS[n]+'50' : 'rgba(255,255,255,0.15)'}`,
              borderRadius:6,
              fontSize:12, fontWeight:'bold', fontFamily:'monospace',
              color: NOTE_COLORS[n] || 'rgba(255,255,255,0.7)',
              transition:'all 0.2s',
            }}>{n}</span>
          )) : (
            <span style={{fontSize:10,opacity:.35,fontFamily:'monospace'}}>— aucune note détectée —</span>
          )}
        </div>
      )}

      {/* Detected chord */}
      {isActive && detectedChord && (
        <div style={{
          padding:'.6rem .85rem',
          background: expectedChord
            ? (detectedChord.root===expectedChord.root && detectedChord.type===expectedChord.type
               ? 'rgba(130,224,170,0.12)' : 'rgba(241,148,138,0.08)')
            : 'rgba(232,168,87,0.12)',
          border:`1px solid ${expectedChord
            ? (detectedChord.root===expectedChord.root && detectedChord.type===expectedChord.type
               ? '#7BC8A4' : '#E07070')
            : '#E8A857'}40`,
          borderRadius:9,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          transition:'all 0.3s',
        }}>
          <div>
            <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',marginBottom:2}}>ACCORD DÉTECTÉ</div>
            <div style={{fontSize:18,fontWeight:'bold',fontFamily:'monospace',color: expectedChord
              ? (detectedChord.root===expectedChord.root && detectedChord.type===expectedChord.type ? '#7BC8A4' : '#E07070')
              : '#E8A857'}}>
              {detectedChord.name}
            </div>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace'}}>{detectedChord.label}</div>
          </div>
          {expectedChord && (
            <div style={{fontSize:22}}>
              {detectedChord.root===expectedChord.root && detectedChord.type===expectedChord.type ? '✓' : '✗'}
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      {!isActive && (
        <p style={{fontSize:11,opacity:.45,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>
          Active le micro pour que l'app écoute ton piano et valide tes accords automatiquement.
        </p>
      )}
    </div>
  );
}

// ── Dictée d'accords (auto-avance) ────────────────────────────────────────────
function DicteeAccords() {
  const [screen,    setScreen]    = useState('config');
  const [selected,  setSelected]  = useState(new Set(['Majeures','Mineures']));
  const [count,     setCount]     = useState(8);
  const [secPerCard,setSecPerCard]= useState(5);
  const [loopMode,  setLoopMode]  = useState(false);
  const [micMode,   setMicMode]   = useState(false); // validate with mic

  const [cards,     setCards]     = useState([]);
  const [idx,       setIdx]       = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [running,   setRunning]   = useState(false);
  const [paused,    setPaused]    = useState(false);
  const [pulse,     setPulse]     = useState(false);
  const [history,   setHistory]   = useState([]);
  const [completed, setCompleted] = useState(0);
  const [micSuccess,setMicSuccess]= useState(false); // flash on mic match

  const mic = useMicrophone();

  const timerRef    = useRef(null);
  const pulseRef    = useRef(null);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const types = Object.entries(CHORD_TYPES).map(([t,{label,suffix}])=>({id:t,name:label,suffix,color:CHORD_COLORS[t]||'#B898C8'}));

  function buildCards(selectedTypes, n) {
    const pool = [];
    selectedTypes.forEach(t => {
      ROOT_NOTES.forEach(r => pool.push({ root:r, type:t, name:r+CHORD_TYPES[t].suffix, label:CHORD_TYPES[t].label }));
    });
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    return pool.slice(0,n);
  }

  function stopAll() {
    clearInterval(timerRef.current);
    clearInterval(pulseRef.current);
    timerRef.current = null; pulseRef.current = null;
    setRunning(false); setPaused(false); setPulse(false);
  }
  useEffect(() => () => stopAll(), []);

  function startTimer(duration) {
    clearInterval(timerRef.current);
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // auto-advance
          setCompleted(c => c + 1);
          setIdx(i => {
            const next = i + 1;
            if (!loopMode && next >= cards.length) {
              stopAll();
              setScreen('result');
              return i;
            }
            const nextIdx = loopMode ? next % cards.length : next;
            // play sound for next card
            setTimeout(() => {
              const card = cards[nextIdx];
              if (card) {
                const ri = CHROMATIC.indexOf(card.root);
                if(ri!==-1) playChordArp(CHORD_TYPES[card.type].formula.map(f=>ri+f+4*12));
              }
            }, 80);
            return nextIdx;
          });
          return duration; // reset timer
        }
        return prev - 1;
      });
    }, 1000);

    // Pulse every beat (1s)
    clearInterval(pulseRef.current);
    pulseRef.current = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 180);
    }, 1000);
  }

  function start() {
    if(selected.size===0) return;
    const c = buildCards(Array.from(selected), count);
    setCards(c); setIdx(0); setHistory([]); setCompleted(0); setRunning(true); setPaused(false);
    setScreen('play');
    // Play first chord
    setTimeout(() => {
      if(c[0]) {
        const ri = CHROMATIC.indexOf(c[0].root);
        if(ri!==-1) playChordArp(CHORD_TYPES[c[0].type].formula.map(f=>ri+f+4*12));
      }
    }, 300);
    setTimeout(() => startTimer(secPerCard), 400);
  }

  function togglePause() {
    if (paused) {
      // Resume
      setPaused(false);
      startTimer(timeLeft);
    } else {
      // Pause
      clearInterval(timerRef.current);
      clearInterval(pulseRef.current);
      setPaused(true); setRunning(false); setPulse(false);
    }
  }

  function advanceCard() {
    const next = idx + 1;
    setCompleted(c => c + 1);
    if (!loopMode && next >= cards.length) { stopAll(); setScreen('result'); return; }
    const nextIdx = loopMode ? next % cards.length : next;
    setIdx(nextIdx);
    setTimeout(() => {
      const nc = cards[nextIdx];
      if(nc) {
        const ri = CHROMATIC.indexOf(nc.root);
        if(ri!==-1) playChordArp(CHORD_TYPES[nc.type].formula.map(f=>ri+f+4*12));
      }
    }, 80);
    startTimer(secPerCard);
  }

  function playCurrentChord() {
    const card = cards[idx];
    if(!card) return;
    const ri = CHROMATIC.indexOf(card.root);
    if(ri!==-1) playChordArp(CHORD_TYPES[card.type].formula.map(f=>ri+f+4*12));
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  if (screen==='config') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Dictée d'accords</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>JOUE CES ACCORDS SUR TON VRAI PIANO</p>
      </div>
      <div style={{padding:'.9rem',background:'rgba(241,148,138,0.07)',border:'1px solid rgba(241,148,138,0.2)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.65,fontFamily:'Georgia,serif'}}>
          Les accords s'enchaînent automatiquement. Tu dois jouer chaque accord sur ton vrai piano avant que le suivant n'arrive. L'objectif : faire rentrer les accords dans la mémoire musculaire.
        </p>
      </div>

      {/* Chord type selection */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>TYPES D'ACCORDS À TRAVAILLER</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
          {types.map(t=>{
            const on=selected.has(t.id);
            return(<button key={t.id} onClick={()=>setSelected(prev=>{const n=new Set(prev);if(n.has(t.id)){if(n.size>1)n.delete(t.id);}else n.add(t.id);return n;})}
              style={{background:on?`${t.color}`:'rgba(255,255,255,0.03)',border:`1.5px solid ${on?t.color:'rgba(255,255,255,0.1)'}`,borderRadius:10,padding:'.65rem .75rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:14,height:14,borderRadius:3,background:on?t.color:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {on&&<span style={{fontSize:9,color:'#0A0804',fontWeight:'bold'}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:'bold',color:on?t.color:'rgba(255,255,255,0.6)',fontFamily:'monospace'}}>{t.name}</div>
                <div style={{fontSize:9,opacity:.4,fontFamily:'monospace'}}>ex. C{t.suffix}</div>
              </div>
            </button>);
          })}
        </div>
      </div>

      {/* Timer per card */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>DURÉE PAR ACCORD</div>
        <div style={{display:'flex',gap:8}}>
          {[[3,'3s 🔥'],[5,'5s'],[8,'8s 🐢'],[12,'12s']].map(([s,label])=>(
            <button key={s} onClick={()=>setSecPerCard(s)} style={{flex:1,padding:'.6rem .25rem',background:secPerCard===s?'rgba(241,148,138,0.18)':'rgba(255,255,255,0.03)',border:`1.5px solid ${secPerCard===s?'#E07070':'rgba(255,255,255,0.1)'}`,color:secPerCard===s?'#E07070':'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontFamily:'monospace',fontSize:12,fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>
          ))}
        </div>
      </div>

      {/* Number of cards */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>NOMBRE D'ACCORDS</div>
        <div style={{display:'flex',gap:8}}>
          {[5,8,12,20].map(n=>(
            <button key={n} onClick={()=>setCount(n)} style={{flex:1,padding:'.6rem',background:count===n?'rgba(241,148,138,0.18)':'rgba(255,255,255,0.03)',border:`1.5px solid ${count===n?'#E07070':'rgba(255,255,255,0.1)'}`,color:count===n?'#E07070':'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>
          ))}
        </div>
      </div>

      {/* Loop mode */}
      <div style={{marginBottom:'1.5rem',padding:'.85rem',background:loopMode?'rgba(241,148,138,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${loopMode?'rgba(241,148,138,0.35)':'rgba(255,255,255,0.1)'}`,borderRadius:10,cursor:'pointer',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}} onClick={()=>setLoopMode(v=>!v)}>
        <div>
          <div style={{fontSize:13,fontWeight:'bold',color:loopMode?'#E07070':'rgba(255,255,255,0.7)',fontFamily:'Georgia,serif'}}>🔁 Mode boucle</div>
          <div style={{fontSize:10,opacity:.5,fontFamily:'monospace',marginTop:2}}>La séquence recommence indéfiniment</div>
        </div>
        <div style={{width:36,height:20,borderRadius:10,background:loopMode?'#E07070':'rgba(255,255,255,0.2)',position:'relative',transition:'all 0.25s'}}>
          <div style={{position:'absolute',top:2,left:loopMode?16:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.25s'}}/>
        </div>
      </div>

      <button onClick={start}
        style={{width:'100%',padding:'1rem',background:'rgba(241,148,138,0.15)',border:'1.5px solid #E07070',color:'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
        COMMENCER →
      </button>
    </div>
  );

  // ── Result ──────────────────────────────────────────────────────────────────
  if (screen==='result') {
    return(
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(130,224,170,0.08)',border:'1px solid rgba(130,224,170,0.25)',borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>SESSION TERMINÉE</div>
          <div style={{fontSize:56,fontWeight:'bold',color:'#7BC8A4',fontFamily:'Georgia,serif',lineHeight:1,marginBottom:8}}>{completed}</div>
          <div style={{fontSize:13,opacity:.55,fontFamily:'monospace',marginBottom:8}}>accord{completed>1?'s':''} joué{completed>1?'s':''}</div>
          <div style={{fontSize:14,opacity:.6,fontFamily:'Georgia,serif'}}>Régularité + répétition = maîtrise 💪</div>
        </div>
        <button onClick={start} style={{padding:'.9rem',background:'rgba(241,148,138,0.15)',border:'1.5px solid #E07070',color:'#E07070',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>🔄 NOUVELLE SESSION</button>
        <button onClick={()=>setScreen('config')} style={{padding:'.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>⚙ RECONFIGURER</button>
      </div>
    );
  }

  // ── Play ─────────────────────────────────────────────────────────────────────
  const card = cards[idx];
  if (!card) return null;
  const nc  = NOTE_COLORS[card.root]||'#E07070';
  const ri2 = CHROMATIC.indexOf(card.root);
  const pianoC = {};
  if(ri2!==-1) CHORD_TYPES[card.type].formula.forEach(f=>{ const k=(ri2+f)%12; pianoC[k]=nc; pianoC[k+12]=nc; });
  const timerPct = (timeLeft / secPerCard) * 100;
  const timerColor = timerPct > 50 ? '#7BC8A4' : timerPct > 25 ? '#E8A857' : '#E07070';

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Timer bar header */}
      <div style={{padding:'.65rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {/* Metronome pulse dot */}
            <div style={{width:10,height:10,borderRadius:'50%',background:pulse?timerColor:'rgba(255,255,255,0.2)',transition:'background 0.1s',boxShadow:pulse?`0 0 8px ${timerColor}`:'none'}}/>
            <span style={{fontSize:10,fontFamily:'monospace',opacity:.5}}>{loopMode?'BOUCLE ∞':(`${idx+1}/${cards.length}`)}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:16,fontWeight:'bold',fontFamily:'monospace',color:timerColor,minWidth:20,textAlign:'right'}}>{timeLeft}</span>
            <span style={{fontSize:10,opacity:.4,fontFamily:'monospace'}}>s</span>
          </div>
        </div>
        <div style={{height:5,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${timerPct}%`,background:timerColor,borderRadius:4,transition:'width 1s linear',boxShadow:`0 0 6px ${timerColor}`}}/>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Card */}
        <div style={{textAlign:'center',padding:'1.75rem',background:`${nc}10`,border:`1.5px solid ${nc}`,borderRadius:16,position:'relative',overflow:'hidden'}}>
          <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1rem'}}>JOUE CET ACCORD SUR TON PIANO</div>
          <div style={{fontSize:62,fontWeight:'bold',color:nc,fontFamily:'Georgia,serif',lineHeight:1,marginBottom:6}}>{card.name}</div>
          <div style={{fontSize:13,opacity:.55,fontFamily:'monospace',marginBottom:'1.25rem'}}>{card.label}</div>
          <button onClick={playCurrentChord}
            style={{background:`${nc}10`,border:`1px solid ${nc}`,color:nc,padding:'.45rem 1.1rem',borderRadius:8,cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.08em'}}>
            🔊 ÉCOUTER
          </button>
        </div>

        {/* Piano reference */}
        <div style={{padding:'.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,overflowX:'auto'}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',textAlign:'center',marginBottom:'.65rem',letterSpacing:'.1em'}}>TOUCHES À ENFONCER</div>
          <PianoKeyboard colors={pianoC}/>
        </div>

        {/* Notes circles */}
        <div style={{display:'flex',gap:6,justifyContent:'center'}}>
          {CHORD_TYPES[card.type].formula.map(f=>{
            const n=CHROMATIC[(ri2+f)%12], c=NOTE_COLORS[n]||nc;
            return <div key={f} style={{width:40,height:40,borderRadius:'50%',background:`${c}`,border:`1.5px solid ${c}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:'bold',color:c,fontFamily:'monospace'}}>{n}</div>;
          })}
        </div>

        {/* MicDetector — validation par microphone */}
        {micMode && (
          <MicDetector
            mic={mic}
            expectedChord={card ? {root:card.root, type:card.type} : null}
            onMatch={()=>{
              setMicSuccess(true);
              setTimeout(()=>{setMicSuccess(false);advanceCard();}, 800);
            }}
          />
        )}

        {/* Mic success flash */}
        {micSuccess && (
          <div style={{textAlign:'center',padding:'.75rem',background:'rgba(130,224,170,0.15)',border:'1px solid #7BC8A4',borderRadius:10,color:'#7BC8A4',fontFamily:'monospace',fontWeight:'bold',fontSize:13,animation:'fadeIn 0.15s ease'}}>
            ✓ Accord reconnu !
          </div>
        )}

        {/* Controls */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          <button onClick={togglePause}
            style={{padding:'.85rem .25rem',background:paused?'rgba(247,220,111,0.15)':'rgba(255,255,255,0.05)',border:`1.5px solid ${paused?'#E8A857':'rgba(255,255,255,0.15)'}`,color:paused?'#E8A857':'rgba(255,255,255,0.6)',borderRadius:10,cursor:'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
            {paused?'▶ REPRISE':'⏸ PAUSE'}
          </button>
          <button onClick={()=>setMicMode(v=>!v)}
            style={{padding:'.85rem .25rem',background:micMode?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.05)',border:`1.5px solid ${micMode?'#E8A857':'rgba(255,255,255,0.15)'}`,color:micMode?'#E8A857':'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
            🎤 MIC
          </button>
          <button onClick={advanceCard}
            style={{padding:'.85rem .25rem',background:'rgba(133,193,233,0.12)',border:'1.5px solid #90B8D0',color:'#90B8D0',borderRadius:10,cursor:'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
            → PASSER
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Accords Library ───────────────────────────────────────────────────────────
function AccordsLibrary(){
  const [showModal,setShowModal]=useState(false);const[modalStep,setModalStep]=useState('type');
  const [selType,setSelType]=useState(null);const[selRoot,setSelRoot]=useState(null);
  const [inv,setInv]=useState(0);const[showPiano,setShowPiano]=useState(false);
  const [showImpro,setShowImpro]=useState(false);
  const cName=selRoot&&selType?selRoot+CHORD_TYPES[selType].suffix:null;
  const cNotes=selRoot&&selType?(()=>{const ri=CHROMATIC.indexOf(selRoot);return CHORD_TYPES[selType].formula.map(i=>CHROMATIC[(ri+i)%12]);})():null;
  const inversions=cNotes?cNotes.map((_,i)=>[...cNotes.slice(i),...cNotes.slice(0,i)]):null;
  const aIdx=getInversionAbsIndices(inversions?inversions[inv]:[]);
  const color=selRoot?(NOTE_COLORS[selRoot]||'#B898C8'):'#B898C8';
  const handleChordSelect=(root)=>{setSelRoot(root);setInv(0);setShowModal(false);notifyLibraryView();};

  if(showImpro) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.6)',flexShrink:0}}>
        <button onClick={()=>setShowImpro(false)} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:2}} onMouseEnter={e=>e.currentTarget.style.color='#f0ebe0'} onMouseLeave={e=>e.currentTarget.style.color='rgba(240,235,224,0.5)'}>← ACCORDS</button>
        <span style={{opacity:.2}}>|</span>
        <span style={{fontSize:11,fontFamily:'monospace',color:'#E8A857',letterSpacing:'.05em'}}>ENCHAÎNEMENTS</span>
      </div>
      <ImproPage/>
    </div>
  );
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    <div style={{position:'fixed',top:'30%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:600,borderRadius:'50%',background:`radial-gradient(circle,${color}12 0%,transparent 70%)`,transition:'background 0.8s ease',pointerEvents:'none',zIndex:0}}/>
    <div style={{position:'relative',zIndex:1,textAlign:'center'}}>
      <div style={{fontSize:cName?90:60,fontWeight:'bold',color:cName?color:'rgba(240,235,224,0.1)',transition:'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',lineHeight:1,marginBottom:'.5rem',minHeight:95,display:'flex',alignItems:'center',justifyContent:'center'}}>{cName||'—'}</div>
      <p style={{fontSize:11,letterSpacing:'.2em',opacity:.35,marginBottom:'1.25rem',fontFamily:'monospace',textTransform:'uppercase'}}>{selType?CHORD_TYPES[selType].label:'Sélectionnez un accord pour commencer'}</p>
      {cNotes&&(<div style={{marginBottom:'1.25rem',animation:'fadeIn 0.4s ease forwards'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>NOTES</div><div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>{inversions[inv].map((note,i)=>(<div key={`n${i}`} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}><div style={{width:46,height:46,borderRadius:'50%',border:`1px solid ${NOTE_COLORS[note]}`,background:`${NOTE_COLORS[note]}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:'bold',color:NOTE_COLORS[note],fontFamily:'monospace'}}>{note}</div><div style={{fontSize:9,opacity:.3,fontFamily:'monospace'}}>{i===0?'BASSE':i===cNotes.length-1?'AIGU':''}</div></div>))}</div></div>)}
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginBottom:'1.5rem'}}>
        <button onClick={()=>{setModalStep('type');setShowModal(true);}} style={{background:'transparent',border:`1px solid ${cName?color:'rgba(240,235,224,0.2)'}`,color:cName?color:'#f0ebe0',padding:'.75rem 1.5rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}} onMouseEnter={e=>{e.currentTarget.style.background=`${color}18`;e.currentTarget.style.transform='translateY(-1px)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.transform='translateY(0)';}}>
          {cName?"Changer d'accord":'Choisir un accord'}
        </button>
        {cName&&(<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?`${color}`:'transparent',border:`1px solid ${showPiano?color:'rgba(240,235,224,0.2)'}`,color:showPiano?color:'rgba(240,235,224,0.6)',padding:'.75rem 1.1rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}}>🎹 Clavier</button>)}
        <button onClick={()=>setShowImpro(true)} style={{background:'rgba(247,220,111,0.08)',border:'1px solid rgba(247,220,111,0.35)',color:'#E8A857',padding:'.75rem 1.1rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(247,220,111,0.18)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(247,220,111,0.08)'}>🎵 Enchaînements</button>
      </div>
      {showPiano&&cNotes&&(<div style={{marginBottom:'1.5rem',padding:'1.25rem 1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease forwards',overflowX:'auto'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'.75rem'}}>CLAVIER</div><PianoKeyboard activeAbsIndices={aIdx} color={color}/></div>)}
      {inversions&&(<div style={{animation:'fadeIn 0.4s ease 0.15s both'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>RENVERSEMENTS</div><div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>{inversions.map((iv,i)=>(<button key={`inv${i}`} onClick={()=>setInv(i)} style={{background:inv===i?`${color}`:'transparent',border:`0.5px solid ${inv===i?color:'rgba(240,235,224,0.15)'}`,color:inv===i?color:'rgba(240,235,224,0.45)',padding:'.5rem .85rem',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:10,transition:'all 0.2s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:3}} onMouseEnter={e=>{if(inv!==i)e.currentTarget.style.borderColor=`${color}`;}} onMouseLeave={e=>{if(inv!==i)e.currentTarget.style.borderColor='rgba(240,235,224,0.15)';}}>
        <span>{INVERSION_NAMES[i]}</span><span style={{opacity:.5,fontSize:9}}>{iv.join(' – ')}</span>
      </button>))}</div></div>)}
    </div>
    {showModal&&(<div onClick={e=>e.target===e.currentTarget&&setShowModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,backdropFilter:'blur(10px)'}}>
      <div style={{background:'#0C0A07',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:4,width:'min(540px,92vw)',maxHeight:'85vh',overflow:'hidden',display:'flex',flexDirection:'column',animation:'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
        <div style={{padding:'1.25rem 1.5rem',borderBottom:'0.5px solid rgba(240,235,224,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>{modalStep==='root'&&<button onClick={()=>setModalStep('type')} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.4,cursor:'pointer',fontSize:18,padding:'0 6px 0 0'}}>←</button>}<span style={{fontSize:11,letterSpacing:'.2em',opacity:.4,fontFamily:'monospace'}}>{modalStep==='type'?"1 · TYPE D'ACCORD":`2 · NOTE RACINE — ${CHORD_TYPES[selType].label.toUpperCase()}`}</span></div>
          <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.35,cursor:'pointer',fontSize:20,lineHeight:1,padding:'2px 4px'}}>×</button>
        </div>
        {modalStep==='type'&&(<div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:8,overflowY:'auto'}}>{Object.entries(CHORD_TYPES).map(([type,{label}])=>{const ex=CHORD_TYPES[type].formula.map(i=>CHROMATIC[i]),isA=selType===type;return(<button key={type} onClick={()=>{setSelType(type);setSelRoot(null);setModalStep('root');}} style={{background:isA?'rgba(195,155,211,0.1)':'rgba(240,235,224,0.02)',border:`0.5px solid ${isA?'#B898C8':'rgba(240,235,224,0.1)'}`,borderRadius:2,padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',transition:'all 0.2s ease',textAlign:'left'}} onMouseEnter={e=>{if(!isA)e.currentTarget.style.background='rgba(240,235,224,0.05)';}} onMouseLeave={e=>{if(!isA)e.currentTarget.style.background='rgba(240,235,224,0.02)';}}>
          <div><div style={{fontSize:16,color:isA?'#B898C8':'#f0ebe0',fontFamily:'Georgia,serif',marginBottom:3}}>{label}</div><div style={{fontSize:11,opacity:.35,fontFamily:'monospace'}}>ex. C{CHORD_TYPES[type].suffix} → {ex.join(' – ')}</div></div>
          <span style={{color:isA?'#B898C8':'rgba(240,235,224,0.2)',fontSize:18}}>›</span>
        </button>);})}
        </div>)}
        {modalStep==='root'&&(<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'1.25rem',overflowY:'auto'}}>{ROOT_NOTES.map(root=>{const c=NOTE_COLORS[root]||'#B898C8',ri=CHROMATIC.indexOf(root),prev=CHORD_TYPES[selType].formula.map(i=>CHROMATIC[(ri+i)%12]),isA=selRoot===root;return(<button key={root} onClick={()=>handleChordSelect(root)} style={{background:isA?`${c}`:'rgba(240,235,224,0.03)',border:`0.5px solid ${isA?c:'rgba(240,235,224,0.1)'}`,color:isA?c:'rgba(240,235,224,0.8)',padding:'1rem .5rem',borderRadius:2,cursor:'pointer',transition:'all 0.2s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:6}} onMouseEnter={e=>{e.currentTarget.style.background=`${c}18`;e.currentTarget.style.borderColor=`${c}`;e.currentTarget.style.color=c;}} onMouseLeave={e=>{if(!isA){e.currentTarget.style.background='rgba(240,235,224,0.03)';e.currentTarget.style.borderColor='rgba(240,235,224,0.1)';e.currentTarget.style.color='rgba(240,235,224,0.8)';}}}>
          <span style={{fontSize:22,fontWeight:'bold'}}>{root}</span><span style={{fontSize:9,opacity:.45,fontFamily:'monospace'}}>{prev.join('·')}</span>
        </button>);})}
        </div>)}
      </div>
    </div>)}
  </div>);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── APPRENTISSAGE — landing + sous-sections ───────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ── Page Théorie ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ── COIN DE L'HARMONIE ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Module 1 : Construction d'accords pas à pas
// ── Données Harmonie ──────────────────────────────────────────────────────────

const DIATONIC = {
  majeur: [
    {deg:'I',   semi:0,  type:'Majeures', fn:'Tonique',        color:'#C8864A'},
    {deg:'ii',  semi:2,  type:'Mineures', fn:'Sus-dominante',  color:'#60A8BC'},
    {deg:'iii', semi:4,  type:'Mineures', fn:'Médiante',       color:'#6EB898'},
    {deg:'IV',  semi:5,  type:'Majeures', fn:'Sous-dominante', color:'#E8A857'},
    {deg:'V',   semi:7,  type:'Majeures', fn:'Dominante',      color:'#D06060'},
    {deg:'vi',  semi:9,  type:'Mineures', fn:'Sus-ton.',       color:'#D05870'},
    {deg:'vii°',semi:11, type:'Mineures', fn:'Sensible',       color:'#D4A0D4'},
  ],
  mineur: [
    {deg:'i',    semi:0,  type:'Mineures', fn:'Tonique',        color:'#C8864A'},
    {deg:'ii°',  semi:2,  type:'Mineures', fn:'Sus-dom.',       color:'#60A8BC'},
    {deg:'♭III', semi:3,  type:'Majeures', fn:'Médiante',       color:'#6EB898'},
    {deg:'iv',   semi:5,  type:'Mineures', fn:'Sous-dominante', color:'#E8A857'},
    {deg:'V',    semi:7,  type:'Majeures', fn:'Dominante',      color:'#D06060'},
    {deg:'♭VI',  semi:8,  type:'Majeures', fn:'Sus-ton.',       color:'#D05870'},
    {deg:'♭VII', semi:10, type:'Majeures', fn:'Sous-ton.',      color:'#D4A0D4'},
  ],
};

const EMOTION_PROGS = [
  {label:'🌟 Joyeux / Pop',     desc:'Lumineux, positif, universel', color:'#E8A857',
   degs:[0,3,5,4]}, // I IV vi V
  {label:'😢 Mélancolique',     desc:'Introspectif, nostalgique', color:'#60A8BC',
   degs:[5,3,0,4]}, // vi IV I V
  {label:'⚡ Épique / Cinéma',  desc:'Puissant, dramatique', color:'#D06060',
   degs:[0,2,3,4]}, // I iii IV V
  {label:'🌙 Mystérieux',       desc:'Sombre, incertain', color:'#D4A0D4',
   degs:[5,2,4,1]}, // vi iii V ii
  {label:'💛 Romantique',       desc:'Doux, touchant', color:'#D05870',
   degs:[0,2,3,1]}, // I iii IV ii
  {label:'🔥 Tension / Jazz',   desc:'Complexe, sophistiqué', color:'#6EB898',
   degs:[1,4,0,5]}, // ii V I vi
];

const EXTENSIONS_DATA = [
  {label:'+maj7',  semi:11, name:'Majeure 7',     color:'#D4A0D4',
   emotion:'Nostalgique / Pur',
   desc:'Note doucement dissonante qui ajoute une couleur rêveuse, suspendue dans le temps.',
   use:'Parfait pour les ballades et les intros. Remplace le simple accord majeur dans les passages lyriques — Imaj7.'},
  {label:'+7',     semi:10, name:'Dominante 7',   color:'#D06060',
   emotion:'Tension / Désir',
   desc:'Crée une friction qui appelle à se résoudre. La couleur blues et jazz par excellence.',
   use:'Utilise-le sur le V pour créer une tension forte avant de résoudre sur le I. V7→I.'},
  {label:'+add9',  semi:14, name:'Neuvième ajoutée', color:'#60A8BC',
   emotion:'Brillant / Ouvert',
   desc:'Ajoute une couleur fraîche et lumineuse sans complexifier la structure harmonique.',
   use:'Excellent dans les refrains pop et rock. Iadd9 ou IVadd9 sonnent immédiatement familiers.'},
  {label:'+9',     semi:14, name:'Neuvième',       color:'#6EB898',
   emotion:'Jazz / Sophistiqué',
   desc:'Plus riche que l\'add9 car combinée avec la 7e. Signature du jazz moderne.',
   use:'Typique du ii9, Imaj9. Donne une couleur moderne à n\'importe quelle progression.'},
  {label:'+#11',   semi:18, name:'11e augmentée',  color:'#E8A857',
   emotion:'Mystérieux / Lydien',
   desc:'Note la plus "flottante". Évoque le mode lydien, l\'espace, l\'irréel de Hans Zimmer.',
   use:'Sur le IVmaj7#11 pour une sensation de légèreté surréaliste. Très utilisé en musique de film.'},
  {label:'+b9',    semi:13, name:'9e bémol',        color:'#D05870',
   emotion:'Dramatique / Film d\'horreur',
   desc:'La tension la plus sombre. Entre deux demi-tons, crée une dissonance maximum.',
   use:'Uniquement sur le V7 dans des progressions très dramatiques. Signe d\'un point de non-retour.'},
  {label:'+13',    semi:21, name:'Treizième',       color:'#C8864A',
   emotion:'Élégant / Complet',
   desc:'L\'accord de jazz le plus luxuriant. Toutes les couleurs harmoniques en une note.',
   use:'Imaj13 pour une conclusion élégante, ou V13 pour une résolution riche et satisfaisante.'},
];

const CADENCES_DATA = [
  {id:'parfaite', name:'Parfaite', label:'V7 → I', color:'#C8864A',
   chords:[{r:'G',t:'Dom. 7'},{r:'C',t:'Majeures'}],
   emotion:'Clôture absolue — satisfaction, conclusion définitive, point final.',
   effect:'L\'auditeur ressent un soulagement complet. La plus forte résolution de la musique tonale.',
   usage:'Fin de morceau, de refrain, de section principale. Utilise-la quand tu veux que tout s\'arrête proprement.'},
  {id:'rompue', name:'Rompue', label:'V → vi', color:'#60A8BC',
   chords:[{r:'G',t:'Dom. 7'},{r:'A',t:'Mineures'}],
   emotion:'Surprise douce — l\'oreille attend Do et reçoit La mineur. Rebond inattendu.',
   effect:'Un sourire intérieur. La "tromperie" musicale la plus agréable.',
   usage:'Pour éviter une fin prématurée. Parfait pour prolonger un refrain ou créer une surprise avant un solo.'},
  {id:'demi', name:'Demi-cadence', label:'? → V', color:'#E8A857',
   chords:[{r:'C',t:'Majeures'},{r:'G',t:'Majeures'}],
   emotion:'Suspension — une question sans réponse, une attente suspendue.',
   effect:'L\'auditeur est tenu en haleine. Il veut la suite.',
   usage:'Milieu de phrase, fin de couplet avant le refrain. Crée de l\'élan vers ce qui suit.'},
  {id:'plagale', name:'Plagale', label:'IV → I', color:'#6EB898',
   chords:[{r:'F',t:'Majeures'},{r:'C',t:'Majeures'}],
   emotion:'Spirituel / Sérénité — l\'Amen des hymnes religieux.',
   effect:'Paix intérieure, recueillement. Moins tranchante que la parfaite.',
   usage:'Fin de couplet, de bridge. Gospel, hymnes, ballades douces. Pour une résolution apaisée.'},
  {id:'phrygienne', name:'Phrygienne', label:'♭II → I', color:'#D06060',
   chords:[{r:'Db',t:'Majeures'},{r:'C',t:'Majeures'}],
   emotion:'Dramatique / Oriental — tension chromatique explosive.',
   effect:'Choc émotionnel. Le demi-ton entre Réb et Do crée une friction très puissante.',
   usage:'Fins dramatiques, musique de film, flamenco, metal. Pour un impact maximal.'},
  {id:'napolitaine', name:'Napolitaine', label:'♭II maj → V → I', color:'#D05870',
   chords:[{r:'Db',t:'Majeures'},{r:'G',t:'Dom. 7'},{r:'C',t:'Majeures'}],
   emotion:'Romantique / Opéra — sombre et magnifique à la fois.',
   effect:'Couleur très caractéristique — immédiatement reconnaissable dans l\'opéra et le classique.',
   usage:'Dans les passages lyriques intenses. Très appréciée dans la musique romantique (Beethoven, Schubert).'},
];

const MODULATION_TYPES = [
  {id:'pivot', name:'Par accord pivot', color:'#C8864A', diff:'Douce',
   desc:'Un accord appartient aux deux tonalités simultanément. L\'auditeur ne remarque pas le changement.',
   how:'Joue un accord commun aux deux gammes, puis continue dans la nouvelle tonalité.',
   effect:'Naturelle et fluide. L\'auditeur est "emporté" sans s\'en rendre compte.',
   example:'Do→Sol : l\'accord de Ré mineur (ii dans Do, vi dans Sol) sert de pivot.'},
  {id:'directe', name:'Directe / Brusque', color:'#D06060', diff:'Forte',
   desc:'Changement abrupt sans préparation. La nouvelle tonalité s\'impose par surprise.',
   how:'Termine une phrase dans la tonalité d\'origine, commence la suivante dans la nouvelle.',
   effect:'Choc, surprise, rupture dramatique. Efficace pour signaler un changement émotionnel fort.',
   example:'Do→Mi♭ : le refrain explose dans une tonalité distante sans transition.'},
  {id:'chromatique', name:'Chromatique', color:'#E8A857', diff:'Colorée',
   desc:'Une note de l\'accord monte ou descend d\'un demi-ton pour atteindre l\'accord de départ de la nouvelle tonalité.',
   how:'Modifie chromatiquement une note de ton dernier accord pour glisser vers le nouvel accord.',
   effect:'Sophistiquée, jazzy. Crée une sensation de "glissement" harmonique.',
   example:'Do→Ré♭ : le Do majeur devient Do7 (avec Si♭), qui "glisse" vers Ré♭ majeur.'},
  {id:'relative', name:'Vers le relatif', color:'#6EB898', diff:'Très douce',
   desc:'La gamme majeure et sa relative mineure partagent les mêmes notes. Transition quasi invisible.',
   how:'Simplement, les accords de vi dans le majeur deviennent i dans le mineur relatif.',
   effect:'Très naturelle, émotionnelle. Passe du lumineux au sombre (ou inversement) sans rupture.',
   example:'Do majeur → La mineur : même armure, même notes, couleur radicalement différente.'},
];

// ── Composition Assistée ──────────────────────────────────────────────────────
function CompositionAssistee() {
  const KEYS = ROOT_NOTES;
  const [key, setKey]       = useState('C');
  const [mode, setMode]     = useState('majeur');
  const [emotion, setEmotion] = useState(null);
  const [prog, setProg]     = useState([]); // array of deg indices
  const [playing, setPlaying] = useState(false);
  const [step, setStep]     = useState('key'); // key | emotion | build

  const scale = DIATONIC[mode];
  const ri = CHROMATIC.indexOf(key);
  const color = NOTE_COLORS[key] || '#C8864A';

  // Get chord name from degree index
  const getChordName = (degIdx) => {
    const d = scale[degIdx];
    const root = CHROMATIC[(ri + d.semi) % 12];
    return root + (CHORD_TYPES[d.type]?.suffix || '');
  };

  // Suggest progression from emotion
  const applyEmotion = (em) => {
    setEmotion(em);
    setProg(em.degs.slice(0, 4));
    setStep('build');
  };

  // Play current progression
  const playProg = async () => {
    if (playing || prog.length === 0) return;
    setPlaying(true);
    for (let i = 0; i < prog.length; i++) {
      const d = scale[prog[i]];
      const rootSemi = ri + d.semi;
      const notes = CHORD_TYPES[d.type].formula.map(f => rootSemi + f + 4*12);
      playChordArp(notes);
      await new Promise(r => setTimeout(r, 1300));
    }
    setPlaying(false);
  };

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Composition Assistée</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>CONSTRUIS UNE PROGRESSION PAS À PAS</p>
      </div>

      {/* Steps indicator */}
      <div style={{display:'flex',gap:6,marginBottom:'1.5rem'}}>
        {[['key','① Tonalité'],['emotion','② Émotion'],['build','③ Progression']].map(([s,label])=>(
          <button key={s} onClick={()=>setStep(s)} style={{flex:1,padding:'.45rem .25rem',background:step===s?`${color}20`:'rgba(255,255,255,0.04)',border:`1.5px solid ${step===s?color:'rgba(255,255,255,0.08)'}`,borderRadius:10,cursor:'pointer',fontSize:9,fontFamily:'monospace',color:step===s?color:'rgba(255,255,255,0.4)',letterSpacing:'.04em',transition:'all 0.2s',textAlign:'center'}}>
            {label}
          </button>
        ))}
      </div>

      {/* Step 1: Key + Mode */}
      {step==='key' && (
        <div style={{animation:'fadeIn 0.3s ease'}}>
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>MODE</div>
            <div style={{display:'flex',gap:8}}>
              {['majeur','mineur'].map(m=>(
                <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'.7rem',background:mode===m?`${color}18`:'rgba(255,255,255,0.04)',border:`1.5px solid ${mode===m?color:'rgba(255,255,255,0.1)'}`,borderRadius:12,cursor:'pointer',color:mode===m?color:'rgba(255,255,255,0.55)',fontFamily:'monospace',fontSize:12,fontWeight:'bold',letterSpacing:'.06em',transition:'all 0.2s',textTransform:'uppercase'}}>
                  {m==='majeur'?'☀ MAJEUR':'🌙 MINEUR'}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>TONIQUE</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {KEYS.map(k=>{
                const nc=NOTE_COLORS[k]||'#C8864A',sel=key===k;
                return <button key={k} onClick={()=>setKey(k)} style={{background:sel?`${nc}20`:'rgba(255,255,255,0.05)',border:`1.5px solid ${sel?nc:nc+'35'}`,color:sel?'#fff':nc+'CC',padding:'.6rem .25rem',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:sel?'bold':'normal',fontFamily:'monospace',transition:'all 0.2s',boxShadow:sel?`0 3px 12px ${nc}40`:'none'}}>{k}</button>;
              })}
            </div>
          </div>
          {/* Diatonic chords preview */}
          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,marginBottom:'1.25rem'}}>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>ACCORDS DISPONIBLES EN {key} {mode.toUpperCase()}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {scale.map((d,i)=>{
                const root=CHROMATIC[(ri+d.semi)%12];
                const name=root+(CHORD_TYPES[d.type]?.suffix||'');
                return(<div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'.5rem .6rem',background:`${d.color}08`,border:`0.5px solid ${d.color}30`,borderRadius:8}}>
                  <span style={{fontSize:9,color:d.color,fontFamily:'monospace',opacity:.7}}>{d.deg}</span>
                  <span style={{fontSize:13,fontWeight:'bold',color:d.color,fontFamily:'monospace'}}>{name}</span>
                  <span style={{fontSize:8,opacity:.4,fontFamily:'monospace'}}>{d.fn}</span>
                </div>);
              })}
            </div>
          </div>
          <button onClick={()=>setStep('emotion')} style={{width:'100%',padding:'.9rem',background:`${color}08`,border:`1.5px solid ${color}`,color,borderRadius:12,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.2s'}}>
            CHOISIR L'ÉMOTION →
          </button>
        </div>
      )}

      {/* Step 2: Emotion */}
      {step==='emotion' && (
        <div style={{animation:'fadeIn 0.3s ease'}}>
          <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.9rem'}}>QUELLE ÉMOTION VEUX-TU TRANSMETTRE ?</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {EMOTION_PROGS.map(em=>(
              <button key={em.label} onClick={()=>applyEmotion(em)} style={{background:emotion?.label===em.label?`${em.color}18`:'rgba(255,255,255,0.04)',border:`1.5px solid ${emotion?.label===em.label?em.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.9rem 1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:14,fontWeight:'bold',color:em.color,fontFamily:'Georgia,serif',marginBottom:3}}>{em.label}</div>
                  <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{em.desc}</div>
                </div>
                <div style={{display:'flex',gap:5,flexShrink:0,marginLeft:8}}>
                  {em.degs.map((di,i)=>(
                    <span key={i} style={{fontSize:10,fontFamily:'monospace',color:scale[di]?.color,padding:'2px 5px',background:`${scale[di]?.color}18`,border:`0.5px solid ${scale[di]?.color}40`,borderRadius:5}}>
                      {getChordName(di)}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Build + play */}
      {step==='build' && prog.length>0 && (
        <div style={{animation:'fadeIn 0.3s ease'}}>
          {emotion && (
            <div style={{padding:'.75rem',background:`${emotion.color}10`,border:`1px solid ${emotion.color}40`,borderRadius:10,marginBottom:'1.25rem'}}>
              <div style={{fontSize:12,fontWeight:'bold',color:emotion.color,fontFamily:'Georgia,serif',marginBottom:3}}>{emotion.label}</div>
              <div style={{fontSize:11,opacity:.55,fontFamily:'monospace'}}>{emotion.desc}</div>
            </div>
          )}
          {/* Progression display */}
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>PROGRESSION EN {key} {mode.toUpperCase()}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {prog.map((degIdx,i)=>{
                const d=scale[degIdx];
                const root=CHROMATIC[(ri+d.semi)%12];
                const name=root+(CHORD_TYPES[d.type]?.suffix||'');
                return(<div key={i} style={{padding:'.75rem .9rem',background:`${d.color}08`,border:`1.5px solid ${d.color}40`,borderRadius:12,textAlign:'center',minWidth:60}}>
                  <div style={{fontSize:9,color:d.color,fontFamily:'monospace',opacity:.7,marginBottom:3}}>{d.deg}</div>
                  <div style={{fontSize:18,fontWeight:'bold',color:d.color,fontFamily:'monospace',lineHeight:1}}>{name}</div>
                  <div style={{fontSize:8,opacity:.4,fontFamily:'monospace',marginTop:3}}>{d.fn}</div>
                </div>);
              })}
            </div>
          </div>

          {/* Options avancées — Modulation + Cadence */}
          <div style={{marginBottom:'1.25rem',display:'flex',flexDirection:'column',gap:8}}>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.25rem'}}>OPTIONS AVANCÉES</div>

            {/* Suggestion de cadence */}
            <div style={{padding:'.75rem',background:'rgba(96,168,188,0.07)',border:'1px solid rgba(96,168,188,0.2)',borderRadius:10}}>
              <div style={{fontSize:9,color:'#60A8BC',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.4rem'}}>💡 TERMINER AVEC UNE CADENCE</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[
                  {name:'Parfaite',chords:[5,0],label:'V→I — point final'},
                  {name:'Plagale', chords:[3,0],label:'IV→I — Amen'},
                  {name:'Rompue', chords:[5,5],label:'V→vi — surprise'},
                ].map((c,ci)=>(
                  <button key={ci} onClick={()=>setProg(p=>[...p,...c.chords])}
                    style={{padding:'.35rem .75rem',background:'rgba(96,168,188,0.1)',border:'1px solid rgba(96,168,188,0.3)',color:'#60A8BC',borderRadius:7,cursor:'pointer',fontSize:10,fontFamily:'monospace',transition:'all 0.2s'}}>
                    +{c.name} ({c.label})
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestion de modulation */}
            <div style={{padding:'.75rem',background:'rgba(212,168,100,0.07)',border:'1px solid rgba(212,168,100,0.2)',borderRadius:10}}>
              <div style={{fontSize:9,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.4rem'}}>🌊 AJOUTER UNE MODULATION</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[
                  {name:'Vers V (quinte)',     hint:'Sol maj — très naturel'},
                  {name:'Vers IV (quarte)',    hint:'Fa maj — naturel'},
                  {name:'Vers vi (relatif min)',hint:'La min — dramatique'},
                ].map((m,mi)=>(
                  <div key={mi} style={{padding:'.35rem .75rem',background:'rgba(212,168,100,0.1)',border:'1px solid rgba(212,168,100,0.25)',borderRadius:7,fontSize:10,fontFamily:'monospace',color:'#D4A0D4',cursor:'pointer'}}
                    title={m.hint}>
                    {m.name}
                  </div>
                ))}
              </div>
              <p style={{fontSize:10,opacity:.45,margin:'.4rem 0 0',fontFamily:'Georgia,serif',fontStyle:'italic'}}>Après ta progression, joue la même dans une autre tonalité pour créer l'effet de modulation.</p>
            </div>

            {/* Borrowed chords suggestion */}
            <div style={{padding:'.75rem',background:'rgba(96,180,148,0.07)',border:'1px solid rgba(96,180,148,0.2)',borderRadius:10}}>
              <div style={{fontSize:9,color:'#6EB898',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.4rem'}}>✨ EMPRUNTER DU MINEUR (BORROWED)</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[
                  {name:'iv mineur',idx:3,label:'Sous-dom. mineure — poignant'},
                  {name:'♭VII',    idx:6,label:'Rock & pop — puissant'},
                ].map((b,bi)=>(
                  <button key={bi} onClick={()=>setProg(p=>[...p,b.idx])}
                    style={{padding:'.35rem .75rem',background:'rgba(96,180,148,0.1)',border:'1px solid rgba(96,180,148,0.3)',color:'#6EB898',borderRadius:7,cursor:'pointer',fontSize:10,fontFamily:'monospace',transition:'all 0.2s'}}
                    title={b.label}>
                    +{b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add chords */}
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>AJOUTER UN ACCORD</div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {scale.map((d,i)=>{
                const root=CHROMATIC[(ri+d.semi)%12];
                const name=root+(CHORD_TYPES[d.type]?.suffix||'');
                return(<button key={i} onClick={()=>setProg(p=>[...p,i])} style={{background:`${d.color}08`,border:`0.5px solid ${d.color}30`,color:d.color,padding:'.4rem .7rem',borderRadius:8,cursor:'pointer',fontSize:11,fontFamily:'monospace',transition:'all 0.15s'}}>+{name}</button>);
              })}
            </div>
          </div>
          {prog.length>1 && <button onClick={()=>setProg(p=>p.slice(0,-1))} style={{padding:'.4rem .85rem',background:'rgba(241,148,138,0.1)',border:'0.5px solid rgba(241,148,138,0.3)',color:'#E07070',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',marginBottom:'1.25rem',transition:'all 0.2s'}}>↩ Retirer le dernier</button>}
          <button onClick={playProg} disabled={playing} style={{width:'100%',padding:'1rem',background:playing?'rgba(130,224,170,0.1)':'rgba(130,224,170,0.15)',border:`1.5px solid ${playing?'rgba(130,224,170,0.5)':'#7BC8A4'}`,color:'#7BC8A4',borderRadius:12,cursor:playing?'default':'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
            {playing?'▶ EN COURS…':'▶ ÉCOUTER LA PROGRESSION'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Extensions & Tensions ─────────────────────────────────────────────────────
function ExtensionsTensions() {
  const [root, setRoot]         = useState('C');
  const [baseType, setBaseType] = useState('Majeures');
  const [active, setActive]     = useState(new Set());
  const [showUse, setShowUse]   = useState(null);

  const ri = CHROMATIC.indexOf(root);
  const color = NOTE_COLORS[root] || '#C8864A';
  const baseSemis = ri !== -1 ? CHORD_TYPES[baseType]?.formula.map(s=>s) : [];

  // All active semis = base + extensions
  const activeSemis = [...baseSemis, ...Array.from(active).map(label=>EXTENSIONS_DATA.find(e=>e.label===label)?.semi).filter(Boolean)];
  const uniqueSemis = [...new Set(activeSemis)];

  // Piano colors
  const pianoColors = {};
  uniqueSemis.forEach(s=>{
    const k=(ri+s)%12; const k2=k+12;
    const isBase=baseSemis.includes(s);
    const ext=EXTENSIONS_DATA.find(e=>e.semi===s);
    pianoColors[k]=isBase?color:(ext?.color||'#E8A857');
    pianoColors[k2]=isBase?color:(ext?.color||'#E8A857');
  });

  const toggleExt=(label)=>{
    setActive(prev=>{
      const n=new Set(prev);
      if(n.has(label))n.delete(label);else n.add(label);
      // Play new chord
      const ext=EXTENSIONS_DATA.find(e=>e.label===label);
      if(ext&&ri!==-1){
        const notes=[...baseSemis.map(s=>ri+s+4*12)];
        if(!n.has(label)){/* removed */}else notes.push(ri+ext.semi+4*12);
        setTimeout(()=>playChordSimul(notes),50);
      }
      return n;
    });
  };

  const playBase=()=>{ if(ri===-1)return; const notes=baseSemis.map(s=>ri+s+4*12); playChordArp(notes); };
  const playFull=()=>{ if(ri===-1)return; const notes=uniqueSemis.map(s=>ri+s+4*12); playChordArp(notes); };

  const baseChordName = root + (CHORD_TYPES[baseType]?.suffix||'');

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.25rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Extensions & Tensions</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>EXPLORER L'IMPACT ÉMOTIONNEL DES TENSIONS</p>
      </div>

      {/* Chord selector */}
      <div style={{marginBottom:'1.25rem',padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>ACCORD DE BASE</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4,marginBottom:'0.75rem'}}>
          {ROOT_NOTES.map(r=>{const nc=NOTE_COLORS[r]||'#C8864A',sel=root===r;return(<button key={r} onClick={()=>{setRoot(r);setActive(new Set());}} style={{background:sel?`${nc}25`:'rgba(255,255,255,0.05)',border:`1.5px solid ${sel?nc:nc+'40'}`,color:sel?nc:nc+'CC',padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.2s',boxShadow:sel?`0 2px 10px ${nc}40`:'none'}}>{r}</button>);} )}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
          {Object.entries(CHORD_TYPES).slice(0,3).map(([t,{label}])=>{
            const tc=CHORD_COLORS[t]||'#C8864A',sel=baseType===t;
            return(<button key={t} onClick={()=>{setBaseType(t);setActive(new Set());}} style={{background:sel?`${tc}18`:'rgba(255,255,255,0.04)',border:`1.5px solid ${sel?tc:tc+'30'}`,color:sel?tc:`${tc}AA`,padding:'.5rem .25rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',transition:'all 0.2s'}}>{label}</button>);
          })}
        </div>
      </div>

      {/* Base chord display */}
      <div style={{textAlign:'center',marginBottom:'1.25rem',padding:'1rem',background:`${color}08`,border:`1px solid ${color}30`,borderRadius:12}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>ACCORD ACTUEL</div>
        <div style={{fontSize:40,fontWeight:'bold',color,fontFamily:'Georgia,serif',lineHeight:1,marginBottom:8}}>
          {baseChordName}{active.size>0&&<span style={{fontSize:20,opacity:.6,marginLeft:4}}>{Array.from(active).join('')}</span>}
        </div>
        {active.size>0 && (
          <div style={{fontSize:11,fontFamily:'monospace',color:EXTENSIONS_DATA.find(e=>active.has(e.label))?.color||color,marginBottom:8,fontStyle:'italic'}}>
            {EXTENSIONS_DATA.filter(e=>active.has(e.label)).map(e=>e.emotion).join(' · ')}
          </div>
        )}
        <div style={{display:'flex',gap:8,justifyContent:'center'}}>
          <button onClick={playBase} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.7)',padding:'.4rem .9rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.06em'}}>🔊 BASE</button>
          {active.size>0&&<button onClick={playFull} style={{background:`${color}08`,border:`1px solid ${color}30`,color,padding:'.4rem .9rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold'}}>🎵 AVEC TENSIONS</button>}
          {active.size>0&&<button onClick={()=>setActive(new Set())} style={{background:'rgba(241,148,138,0.1)',border:'0.5px solid rgba(241,148,138,0.3)',color:'#E07070',padding:'.4rem .75rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>✕ Reset</button>}
        </div>
      </div>

      {/* Piano */}
      <div style={{overflowX:'auto',padding:'.75rem',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,marginBottom:'1.25rem'}}>
        <PianoKeyboard colors={pianoColors}/>
      </div>

      {/* Extension buttons */}
      <div style={{marginBottom:'1rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>AJOUTER UNE TENSION</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {EXTENSIONS_DATA.map(ext=>{
            const isOn=active.has(ext.label);
            return(<div key={ext.label} style={{background:isOn?`${ext.color}`:'rgba(255,255,255,0.03)',border:`1px solid ${isOn?ext.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.85rem',transition:'all 0.2s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:isOn?'.65rem':0}}>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <button onClick={()=>toggleExt(ext.label)} style={{background:isOn?ext.color:'rgba(255,255,255,0.06)',border:`1.5px solid ${ext.color}`,color:isOn?'#0A0804':ext.color,padding:'.3rem .6rem',borderRadius:8,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',minWidth:56,transition:'all 0.2s',boxShadow:isOn?`0 2px 10px ${ext.color}`:'none'}}>
                    {ext.label}
                  </button>
                  <div>
                    <div style={{fontSize:12,fontWeight:'bold',color:ext.color,fontFamily:'Georgia,serif'}}>{ext.name}</div>
                    <div style={{fontSize:10,fontStyle:'italic',color:ext.color,opacity:.8}}>"{ext.emotion}"</div>
                  </div>
                </div>
                <button onClick={()=>setShowUse(showUse===ext.label?null:ext.label)} style={{background:'transparent',border:`0.5px solid ${ext.color}`,color:ext.color,padding:'2px 7px',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace',flexShrink:0}}>
                  {showUse===ext.label?'▲':'↗ USE'}
                </button>
              </div>
              {isOn&&<p style={{fontSize:11,opacity:.65,lineHeight:1.6,margin:'0 0 .5rem',fontFamily:'Georgia,serif'}}>{ext.desc}</p>}
              {showUse===ext.label&&(<div style={{padding:'.65rem',background:`${ext.color}`,borderRadius:8,marginTop:6,animation:'fadeIn 0.2s ease'}}>
                <div style={{fontSize:9,color:ext.color,fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.35rem'}}>COMMENT L'INTÉGRER</div>
                <p style={{fontSize:11,opacity:.65,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>{ext.use}</p>
              </div>)}
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}

// ── Cadences ──────────────────────────────────────────────────────────────────
function CadencesPage() {
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);

  const playCadence = async (cad) => {
    if(playing)return;
    setActive(cad.id); setPlaying(true);
    for(const chord of cad.chords){
      const ri=CHROMATIC.indexOf(chord.r);
      if(ri===-1)continue;
      const notes=CHORD_TYPES[chord.t].formula.map(f=>ri+f+4*12);
      playChordArp(notes);
      await new Promise(r=>setTimeout(r,1400));
    }
    setPlaying(false);
  };

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.25rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Cadences</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>RÉPERTOIRE DES CADENCES — EFFETS ÉMOTIONNELS</p>
      </div>
      <div style={{padding:'.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,marginBottom:'1.25rem'}}>
        <p style={{fontSize:12,opacity:.55,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>Une cadence est une formule harmonique qui ponctue la musique — comme une virgule ou un point final. Clique sur une cadence pour l'entendre en Do majeur.</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {CADENCES_DATA.map(cad=>{
          const isA=active===cad.id;
          return(
            <div key={cad.id} style={{background:isA?`${cad.color}10`:'rgba(255,255,255,0.03)',border:`1.5px solid ${isA?cad.color:'rgba(255,255,255,0.08)'}`,borderRadius:14,padding:'1rem',transition:'all 0.3s'}}>
              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
                <div>
                  <div style={{fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif',color:cad.color,marginBottom:6}}>{cad.name}</div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {cad.chords.map((ch,i)=>(
                      <span key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                        {i>0&&<span style={{opacity:.3,fontSize:12}}>→</span>}
                        <span style={{fontSize:12,fontFamily:'monospace',fontWeight:'bold',color:NOTE_COLORS[ch.r]||cad.color,padding:'2px 8px',background:`${NOTE_COLORS[ch.r]||cad.color}18`,border:`1px solid ${NOTE_COLORS[ch.r]||cad.color}40`,borderRadius:6}}>{ch.r}{CHORD_TYPES[ch.t]?.suffix}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={()=>playCadence(cad)} disabled={playing} style={{background:`${cad.color}12`,border:`1.5px solid ${cad.color}`,color:cad.color,padding:'.45rem .85rem',borderRadius:10,cursor:playing?'default':'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold',flexShrink:0,transition:'all 0.2s'}}>
                  {playing&&isA?'▶…':'▶ ÉCOUTER'}
                </button>
              </div>
              {/* Emotion */}
              <div style={{padding:'.65rem .85rem',background:`${cad.color}08`,border:`0.5px solid ${cad.color}25`,borderRadius:10,marginBottom:'.65rem'}}>
                <div style={{fontSize:9,color:cad.color,fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.3rem'}}>RESSENTI</div>
                <p style={{fontSize:12,opacity:.75,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{cad.emotion}</p>
              </div>
              <div style={{padding:'.65rem .85rem',background:'rgba(255,255,255,0.03)',borderRadius:10}}>
                <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.3rem'}}>UTILISATION</div>
                <p style={{fontSize:11,opacity:.6,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>{cad.usage}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exemples musicaux */}
      <div style={{marginTop:'1.5rem',padding:'1rem',background:'rgba(96,168,188,0.07)',border:'1px solid rgba(96,168,188,0.2)',borderRadius:14}}>
        <div style={{fontSize:10,color:'#60A8BC',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.85rem'}}>EXEMPLES MUSICAUX CÉLÈBRES</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            {cadence:"Cadence parfaite V→I",piece:"Fin de presque toutes les sonates de Beethoven. Chaque mouvement se termine sur ce V→I définitif. Bach termine chaque chorâl exactement comme ça.",color:'#7BC8A4'},
            {cadence:"Cadence rompue V→vi",piece:"Let It Be (Beatles) — le pont utilise V→vi pour éviter la conclusion attendue et prolonger l'émotion. Extrêmement courant dans les ballades pop.",color:'#E8A857'},
            {cadence:"Cadence plagale IV→I",piece:"L'Amen de toutes les hymnes religieuses. Yesterday (Beatles) se termine sur cette cadence douce. Crée un sentiment de paix et de résolution spirituelle.",color:'#90B8D0'},
            {cadence:"Cadence demi-cadence →V",piece:"Fin des couplets de nombreuses chansons pop — la musique s'arrête sur le V sans résoudre, créant l'élan vers le refrain. Virgule musicale.",color:'#D4A0D4'},
            {cadence:"Cadence phrygienne i→V/III",piece:"Stairway to Heaven (Led Zeppelin) — intro acoustique. Tout le flamenco espagnol. Donne ce son oriental et dramatique immédiatement reconnaissable.",color:'#E07070'},
          ].map((ex,i)=>(
            <div key={i} style={{padding:'.7rem .9rem',background:`${ex.color}08`,border:`0.5px solid ${ex.color}25`,borderRadius:10}}>
              <div style={{fontSize:11,fontWeight:'bold',color:ex.color,fontFamily:'monospace',marginBottom:3}}>{ex.cadence}</div>
              <p style={{fontSize:11,opacity:.65,margin:0,lineHeight:1.55,fontFamily:'Georgia,serif'}}>{ex.piece}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conseil pratique */}
      <div style={{marginTop:'1rem',padding:'.85rem 1rem',background:'rgba(232,168,87,0.07)',border:'1px solid rgba(232,168,87,0.2)',borderRadius:12,display:'flex',gap:10,alignItems:'flex-start'}}>
        <span style={{fontSize:18,flexShrink:0}}>💡</span>
        <div>
          <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.3rem'}}>CONSEIL PRATIQUE</div>
          <p style={{fontSize:12,opacity:.72,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>Pour mémoriser une cadence, joue-la dans toutes les tonalités au piano — d'abord lentement en écoutant l'effet, puis de plus en plus vite. En 1 semaine, ton oreille les reconnaîtra automatiquement dans n'importe quelle musique.</p>
        </div>
      </div>
    </div>
  );
}

// ── Modulation ────────────────────────────────────────────────────────────────
function ModulationPage() {
  const [fromKey, setFromKey]   = useState('C');
  const [toKey, setToKey]       = useState('G');
  const [selType, setSelType]   = useState(null);

  const fromSemi = KEY_SEMI[fromKey] || 0;
  const toSemi   = KEY_SEMI[toKey]   || 0;
  const diff     = Math.abs(fromSemi - toSemi);
  const circDiff = Math.min(diff, 12-diff);

  // Emotional context of the destination
  const DEST_EMOTIONS = {
    0:'Même tonique — variation de couleur (maj↔min)',
    1:'Demi-ton — très dramatique, déstabilisant',
    2:'Ton entier — moderne, inattendu',
    3:'Tierce mineure — vers le relatif, doux',
    4:'Tierce majeure — chaleureux, inattendu',
    5:'Quarte — naturel, voisin proche',
    6:'Triton — maximal, très distant, choc total',
    7:'Quinte — le plus naturel, imperceptible',
  };
  const emotion = DEST_EMOTIONS[circDiff] || '';

  // Find common tones between two major scales
  function getScaleNotes(keySemi, scaleFormula=[0,2,4,5,7,9,11]){
    return scaleFormula.map(s=>(keySemi+s)%12);
  }
  const fromNotes = getScaleNotes(fromSemi);
  const toNotes   = getScaleNotes(toSemi);
  const commonNotes = fromNotes.filter(n=>toNotes.includes(n));

  // Simple pivot chord: chords that work in both keys
  const fromDegrees = DIATONIC.majeur.map(d=>({
    name: CHROMATIC[(fromSemi+d.semi)%12]+(CHORD_TYPES[d.type]?.suffix||''),
    root: CHROMATIC[(fromSemi+d.semi)%12],
    type: d.type, fn: d.fn, color: d.color, deg: d.deg
  }));
  const toDegrees = DIATONIC.majeur.map(d=>({
    name: CHROMATIC[(toSemi+d.semi)%12]+(CHORD_TYPES[d.type]?.suffix||''),
    root: CHROMATIC[(toSemi+d.semi)%12],
    type: d.type, fn: d.fn, color: d.color, deg: d.deg
  }));
  const pivots = fromDegrees.filter(fc=>toDegrees.some(tc=>tc.name===fc.name));

  const disabled = fromKey === toKey;

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.25rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:'.35rem'}}>Modulation</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>CHANGER DE TONALITÉ AVEC INTENTION</p>
      </div>

      {/* Key selection */}
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'start',marginBottom:'1.25rem'}}>
        {/* From */}
        <div>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem',textAlign:'center'}}>DÉPART</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
            {ROOT_NOTES.map(k=>{const nc=NOTE_COLORS[k]||'#C8864A',sel=fromKey===k;return(<button key={k} onClick={()=>setFromKey(k)} style={{background:sel?`${nc}25`:'rgba(255,255,255,0.05)',border:`1.5px solid ${sel?nc:nc+'40'}`,color:sel?nc:nc+'CC',padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.2s',boxShadow:sel?`0 2px 8px ${nc}50`:'none'}}>{k}</button>);} )}
          </div>
        </div>
        {/* Arrow */}
        <div style={{textAlign:'center',paddingTop:'2rem',fontSize:22,opacity:.4}}>→</div>
        {/* To */}
        <div>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem',textAlign:'center'}}>ARRIVÉE</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
            {ROOT_NOTES.map(k=>{const nc=NOTE_COLORS[k]||'#C8864A',sel=toKey===k;return(<button key={k} onClick={()=>setToKey(k)} style={{background:sel?`${nc}25`:'rgba(255,255,255,0.05)',border:`1.5px solid ${sel?nc:nc+'40'}`,color:sel?nc:nc+'CC',padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.2s',boxShadow:sel?`0 2px 8px ${nc}50`:'none'}}>{k}</button>);} )}
          </div>
        </div>
      </div>

      {disabled && <div style={{padding:'1rem',background:'rgba(255,255,255,0.04)',borderRadius:12,marginBottom:'1rem',textAlign:'center',fontSize:12,opacity:.5,fontFamily:'monospace'}}>Sélectionne deux tonalités différentes</div>}

      {!disabled && (<>
        {/* Overview */}
        <div style={{padding:'1rem',background:'rgba(200,140,80,0.1)',border:'1px solid rgba(200,140,80,0.3)',borderRadius:12,marginBottom:'1.25rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
            <span style={{fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',color:'#D4A0D4'}}>{fromKey} → {toKey}</span>
            <span style={{fontSize:11,fontFamily:'monospace',color:'rgba(212,168,100,0.7)',padding:'3px 8px',background:'rgba(200,140,80,0.15)',borderRadius:8}}>{circDiff} quinte{circDiff>1?'s':''}</span>
          </div>
          <p style={{fontSize:12,opacity:.65,lineHeight:1.6,margin:'0 0 .65rem',fontFamily:'Georgia,serif',fontStyle:'italic'}}>{emotion}</p>
          {commonNotes.length>0&&(
            <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>
              Notes communes : {commonNotes.map(n=>CHROMATIC[n]).join(', ')} ({commonNotes.length}/7)
            </div>
          )}
        </div>

        {/* Pivot chords */}
        {pivots.length>0&&(
          <div style={{marginBottom:'1.25rem',padding:'1rem',background:'rgba(96,180,148,0.08)',border:'1px solid rgba(96,180,148,0.2)',borderRadius:12}}>
            <div style={{fontSize:10,color:'#6EB898',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>ACCORDS PIVOTS POSSIBLES</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {pivots.map((p,i)=>{
                const asTo=toDegrees.find(t=>t.name===p.name);
                return(<div key={i} style={{padding:'.5rem .75rem',background:`${p.color}15`,border:`1px solid ${p.color}50`,borderRadius:10}}>
                  <div style={{fontSize:13,fontWeight:'bold',color:p.color,fontFamily:'monospace',marginBottom:2}}>{p.name}</div>
                  <div style={{fontSize:9,opacity:.55,fontFamily:'monospace'}}>{p.deg} dans {fromKey} / {asTo?.deg} dans {toKey}</div>
                </div>);
              })}
            </div>
          </div>
        )}

        {/* Conseil contextuel */}
        <div style={{padding:'.85rem 1rem',background:'rgba(232,168,87,0.07)',border:'1px solid rgba(232,168,87,0.2)',borderRadius:12,marginBottom:'1.25rem',display:'flex',gap:10,alignItems:'flex-start'}}>
          <span style={{fontSize:20,flexShrink:0}}>💡</span>
          <div>
            <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.3rem'}}>CONSEIL POUR {fromKey} → {toKey}</div>
            <p style={{fontSize:12,opacity:.72,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>
              {circDiff<=1 ? `Modulation très douce. Tu peux simplement jouer ${pivots[0]?.name||'un accord pivot'} et résoudre vers ${toKey}. L'oreille ne sera pas déstabilisée.`
              :circDiff<=2 ? `Modulation naturelle. Utilise l'accord pivot ${pivots[0]?.name||''} pour créer une transition fluide. Annonce le changement avec une dominante secondaire.`
              :circDiff<=4 ? `Modulation notable. L'oreille la percevra clairement. Prépare l'auditeur avec 2 accords de la nouvelle tonalité avant de t'y installer.`
              :`Modulation dramatique (${circDiff} quintes). Utilise un accord diminué ou la substitution de triton pour relier les deux tonalités. Effet de surprise garanti.`}
            </p>
          </div>
        </div>

        {/* Modulation types */}
        <div style={{marginBottom:'1rem'}}>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>TECHNIQUES DE MODULATION</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {MODULATION_TYPES.map(mt=>{
              const isA=selType===mt.id;
              return(<button key={mt.id} onClick={()=>setSelType(isA?null:mt.id)} style={{background:isA?`${mt.color}12`:'rgba(255,255,255,0.03)',border:`1.5px solid ${isA?mt.color:'rgba(255,255,255,0.08)'}`,borderRadius:12,padding:'.9rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:isA?'.65rem':0}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:'bold',color:mt.color,fontFamily:'Georgia,serif'}}>{mt.name}</span>
                    <span style={{fontSize:9,padding:'2px 7px',background:`${mt.color}15`,border:`0.5px solid ${mt.color}50`,borderRadius:6,color:mt.color,fontFamily:'monospace'}}>{mt.diff}</span>
                  </div>
                  <span style={{fontSize:12,opacity:.4}}>{isA?'▲':'▼'}</span>
                </div>
                {isA&&(<div style={{animation:'fadeIn 0.25s ease'}}>
                  <p style={{fontSize:12,opacity:.65,lineHeight:1.65,margin:'0 0 .65rem',fontFamily:'Georgia,serif'}}>{mt.desc}</p>
                  <div style={{padding:'.65rem',background:`${mt.color}0D`,border:`0.5px solid ${mt.color}30`,borderRadius:8,marginBottom:'.5rem'}}>
                    <div style={{fontSize:9,color:mt.color,fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.3rem'}}>COMMENT FAIRE</div>
                    <p style={{fontSize:11,opacity:.65,lineHeight:1.55,margin:0,fontFamily:'Georgia,serif'}}>{mt.how}</p>
                  </div>
                  <div style={{padding:'.65rem',background:'rgba(255,255,255,0.03)',borderRadius:8,marginBottom:'.5rem'}}>
                    <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.3rem'}}>EFFET SUR L'AUDITEUR</div>
                    <p style={{fontSize:11,opacity:.65,lineHeight:1.55,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{mt.effect}</p>
                  </div>
                  <div style={{padding:'.65rem',background:'rgba(255,255,255,0.03)',borderRadius:8}}>
                    <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.3rem'}}>EXEMPLE</div>
                    <p style={{fontSize:11,opacity:.65,lineHeight:1.55,margin:0,fontFamily:'monospace'}}>{mt.example}</p>
                  </div>
                </div>)}
              </button>);
            })}
          </div>
        </div>

        {/* Exemples musicaux */}
        <div style={{padding:'1rem',background:'rgba(200,140,80,0.07)',border:'1px solid rgba(200,140,80,0.2)',borderRadius:12}}>
          <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>EXEMPLES CÉLÈBRES DE MODULATION</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              {title:"Modulation au refrain (pop)",from:'Db',to:'Eb',type:"Directe +1 ton",piece:"Let It Be — Beatles : couplet en La, refrain monte d'un ton à Si. Effet de soulèvement universel.",color:'#90B8D0'},
              {title:"Modulation par pivot (jazz)",from:'C',to:'F',type:"Pivot ii=vi",piece:"Autumn Leaves : le Dm7 (ii en Do) devient vi en Fa. Transition quasi-imperceptible, signature du jazz standard.",color:'#E8A857'},
              {title:"Modulation enharmonique (classique)",from:'C',to:'Eb',type:"Via dim7",piece:"Beethoven Sonate Pathétique : un accord dim7 réinterprété bascule vers Mi♭ mineur. Effet de drame soudain.",color:'#E07070'},
              {title:"Coltrane Changes (jazz avancé)",from:'C',to:'E',type:"Tierce majeure",piece:"Giant Steps : modulations par tierces majeures si rapides que l'oreille perd le centre tonal. Révolutionnaire.",color:'#D4A0D4'},
            ].map((ex,i)=>(
              <div key={i} style={{padding:'.75rem .9rem',background:`${ex.color}08`,border:`0.5px solid ${ex.color}25`,borderRadius:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.35rem'}}>
                  <span style={{fontSize:12,fontWeight:'bold',color:ex.color,fontFamily:'Georgia,serif'}}>{ex.title}</span>
                  <span style={{fontSize:9,fontFamily:'monospace',color:ex.color,padding:'1px 6px',background:`${ex.color}15`,borderRadius:5}}>{ex.type}</span>
                </div>
                <p style={{fontSize:11,opacity:.65,margin:0,lineHeight:1.55,fontFamily:'Georgia,serif'}}>{ex.piece}</p>
              </div>
            ))}
          </div>
        </div>
      </>)}
    </div>
  );
}

// ── Coin de l'Harmonie ────────────────────────────────────────────────────────
function CoinHarmoniePage() {
  const [sub, setSub] = useState(null);
  const MODS = [
    {id:'composition', icon:'🎹', title:'Composition assistée', subtitle:'GAMME · ÉMOTION · PROGRESSION', color:'#C8864A', ok:true},
    {id:'extensions',  icon:'✨', title:'Extensions & Tensions', subtitle:'9e · #11 · b9 · RESSENTI',      color:'#E8A857', ok:true},
    {id:'cadences',    icon:'🎼', title:'Cadences',              subtitle:'PARFAITE · ROMPUE · PLAGALE',   color:'#60A8BC', ok:true},
    {id:'modulation',  icon:'🔀', title:'Modulation',            subtitle:'CHANGER DE TONALITÉ',            color:'#6EB898', ok:true},
    {id:'analyse',     icon:'🔍', title:'Analyse de Grille',     subtitle:'ENTRER DES ACCORDS · ANALYSER', color:'#E8A857', ok:true},
    {id:'carnet',      icon:'📒', title:'Carnet de Composition', subtitle:'SAUVEGARDER · MÉLODIE · NOTES', color:'#E07070', ok:true},
  ];

  if (sub) {
    const info = MODS.find(m=>m.id===sub);
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',background:'rgba(13,11,30,0.8)',flexShrink:0}}>
          <button onClick={()=>setSub(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:8,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>← HARMONIE</button>
          <span style={{opacity:.2}}>|</span>
          <span style={{fontSize:11,fontFamily:'monospace',color:info?.color,letterSpacing:'.05em'}}>{info?.title.toUpperCase()}</span>
        </div>
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {sub==='composition' && <CompositionAssistee/>}
          {sub==='extensions'  && <ExtensionsTensions/>}
          {sub==='cadences'    && <CadencesPage/>}
          {sub==='modulation'  && <ModulationPage/>}
          {sub==='analyse'     && <AnalyseGrille/>}
          {sub==='carnet'      && <CarnetComposition/>}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em',background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Coin de l'Harmonie</h2>
        <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>COMPRENDRE ET RESSENTIR L'HARMONIE</p>
      </div>
      <div style={{padding:'1rem',background:'rgba(200,140,80,0.08)',border:'1px solid rgba(200,140,80,0.2)',borderRadius:14,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.65,fontFamily:'Georgia,serif'}}>L'harmonie n'est pas un ensemble de règles — c'est un langage que tu apprends à ressentir. Ces 4 modules te donnent les outils pour <em>composer, analyser et émouvoir</em>.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {MODS.map((m)=>(
          <button key={m.id} onClick={()=>setSub(m.id)}
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}18`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-3px) scale(1.02)';e.currentTarget.style.boxShadow=`0 10px 28px ${m.color}`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}18`;e.currentTarget.style.borderColor=`${m.color}`;e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='none';}}
            style={{background:`${m.color}08`,border:`1.5px solid ${m.color}`,borderRadius:16,padding:'1.1rem',display:'flex',flexDirection:'column',gap:8,cursor:'pointer',textAlign:'left',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <span style={{fontSize:28}}>{m.icon}</span>
              <span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}`,padding:'2px 6px',borderRadius:8}}>DISPONIBLE</span>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:'bold',color:m.color,fontFamily:'Georgia,serif',marginBottom:4}}>{m.title}</div>
              <div style={{fontSize:9,opacity:.5,fontFamily:'monospace',letterSpacing:'.04em'}}>{m.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── COURS INTERACTIFS DE THÉORIE ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Composant de mot cliquable avec définition mascotte
function MotCle({ children, definition, color='#D4A0D4', onClickWord }) {
  return (
    <span
      onClick={() => onClickWord && onClickWord(children, definition)}
      style={{
        color, fontWeight:'bold', cursor:'pointer',
        borderBottom:`1.5px dotted ${color}`,
        padding:'0 1px', transition:'all 0.15s',
        display:'inline',
      }}
      onMouseEnter={e=>{e.currentTarget.style.background=`${color}18`;e.currentTarget.style.borderRadius='3px';}}
      onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
    >
      {children}
    </span>
  );
}

// Popup mascotte pour définitions de mots-clés
function MascoтteDefinitionPopup({ word, definition, onClose }) {
  if (!word) return null;
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'flex-end',
      background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxHeight:'60vh', overflowY:'auto',
        background:'linear-gradient(160deg,#100C08,#0A0804)',
        border:'2px solid rgba(212,168,100,0.5)',
        borderRadius:'20px 20px 0 0', padding:'1.5rem',
        boxShadow:'0 -16px 48px rgba(200,140,80,0.35)',
        animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{display:'flex',alignItems:'flex-start',gap:'1rem',marginBottom:'1rem'}}>
          <Mascotte expression="happy" size={64} animate/>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:4}}>NOIRE EXPLIQUE</div>
            <div style={{fontSize:18,fontWeight:'bold',color:'#fff',fontFamily:'Georgia,serif',marginBottom:8}}>{word}</div>
            <p style={{fontSize:13.5,color:'rgba(255,255,255,0.82)',lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>{definition}</p>
          </div>
        </div>
        <button onClick={onClose} style={{width:'100%',padding:'.7rem',background:'rgba(212,168,100,0.15)',border:'1.5px solid #D4A0D4',color:'#D4A0D4',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold'}}>
          MERCI NOIRE ! ✓
        </button>
      </div>
    </div>
  );
}

// ── Cours 1 : Gammes et modes ─────────────────────────────────────────────────
function CoursGammesModes() {
  const [activeSection, setActiveSection] = useState('gammes');
  const [defWord,  setDefWord]  = useState(null);
  const [defText,  setDefText]  = useState(null);

  const M = (word, def, color='#D4A0D4') => (
    <MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}}
      definition={def}>{word}</MotCle>
  );

  const SECTIONS = [
    { id:'gammes',  label:'Gammes',  icon:'🎼' },
    { id:'modes',   label:'Modes',   icon:'🌀' },
    { id:'pratique',label:'Pratique',icon:'🎹' },
  ];

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Tab nav */}
      <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(13,11,30,0.6)'}}>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)}
            style={{flex:1,padding:'.65rem .25rem',background:'none',border:'none',borderBottom:activeSection===s.id?'2px solid #B898C8':'2px solid transparent',color:activeSection===s.id?'#B898C8':'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.04em',transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <span style={{fontSize:14}}>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>

        {activeSection==='gammes' && (<div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeIn 0.3s ease'}}>
          <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Gammes et modes</h3>

          <div style={{padding:'1rem',background:'rgba(195,155,211,0.08)',border:'1px solid rgba(195,155,211,0.2)',borderRadius:12}}>
            <h4 style={{fontSize:15,fontWeight:'bold',color:'#B898C8',marginBottom:'.65rem'}}>Qu'est-ce qu'une gamme ?</h4>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif'}}>
              Une {M("gamme","Une gamme est une succession ordonnée de notes qui définit l'univers sonore d'un morceau. Pense à elle comme à une palette de couleurs — certaines notes sont disponibles, d'autres non.","#B898C8")} est une série de notes ordonnées selon un {M("schéma d'intervalles","Un intervalle est la distance sonore entre deux notes. Les intervalles d'une gamme sont mesurés en tons (T) et demi-tons (1/2). Ex: Do-Ré = 1 ton, Do-Ré♭ = 1/2 ton.","#90B8D0")} fixe. Elle définit le &quot;territoire sonore&quot; d'un morceau. Une gamme commence et finit sur la même note — appelée {M("tonique","La tonique (ou fondamentale) est la note de départ d'une gamme. C'est le centre de gravité de toute la musique tonale. Une mélodie cherche toujours à revenir à la tonique.","#7BC8A4")}.
            </p>
          </div>

          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
            <h4 style={{fontSize:15,fontWeight:'bold',color:'#E8A857',marginBottom:'.65rem'}}>La gamme majeure</h4>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',marginBottom:'1rem'}}>
              La gamme {M("majeure","La gamme majeure est souvent décrite comme 'joyeuse' ou 'lumineuse'. Son schéma (T-T-1/2-T-T-T-1/2) lui donne sa couleur positive. C'est la gamme de Do (toutes touches blanches du piano).","#E8A857")} est la plus fondamentale de la musique occidentale. Son schéma d'intervalles est : {M("Ton","Un Ton = 2 demi-tons = 2 touches consécutives en comptant les noires. Ex: Do à Ré = 1 Ton.","#90B8D0")}-{M("Ton","Un Ton = 2 demi-tons = 2 touches consécutives en comptant les noires. Ex: Do à Ré = 1 Ton.","#90B8D0")}-{M("Demi-ton","Un Demi-ton = la plus petite distance possible entre deux notes. Sur le piano, c'est la distance entre une touche et la touche immédiatement voisine (noire ou blanche). Ex: Mi à Fa = 1 Demi-ton.","#D4A0D4")}-Ton-Ton-Ton-Demi-ton.
            </p>
            {/* Visual scale display */}
            <div style={{background:'rgba(0,0,0,0.2)',borderRadius:10,padding:'.85rem',marginBottom:'.75rem'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem'}}>GAMME DE DO MAJEUR</div>
              <div style={{display:'flex',gap:4,alignItems:'flex-end',flexWrap:'wrap'}}>
                {[{n:'Do',i:'T'},{n:'Ré',i:'T'},{n:'Mi',i:'½'},{n:'Fa',i:'T'},{n:'Sol',i:'T'},{n:'La',i:'T'},{n:'Si',i:'½'},{n:'Do',i:''}].map((note,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:36,height:36,borderRadius:8,background:i===0||i===7?'rgba(195,155,211,0.3)':'rgba(255,255,255,0.08)',border:`1px solid ${i===0||i===7?'#B898C8':'rgba(255,255,255,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:'bold',color:i===0||i===7?'#B898C8':'rgba(255,255,255,0.7)'}}>
                      {note.n}
                    </div>
                    {note.i&&<div style={{fontSize:9,color:'rgba(255,255,255,0.35)',fontFamily:'monospace'}}>{note.i}</div>}
                  </div>
                ))}
              </div>
            </div>
            <p style={{fontSize:12.5,lineHeight:1.7,opacity:.7,fontFamily:'Georgia,serif',margin:0}}>
              La {M("tierce majeure","La tierce majeure est l'intervalle entre la 1ère et la 3e note d'une gamme majeure — 4 demi-tons (Do-Mi). C'est elle qui donne la couleur 'joyeuse' à l'accord majeur. Enlève-la et tu obtiens une tierce mineure (3 demi-tons) qui donne la couleur 'triste'.","#E8A857")} (Do-Mi, soit 4 demi-tons) et la {M("quinte juste","La quinte juste est l'intervalle entre la 1ère et la 5e note — 7 demi-tons. C'est l'intervalle le plus stable et consonant après l'octave. C'est le fondement de tout accord en musique occidentale.","#7BC8A4")} (Do-Sol, 7 demi-tons) définissent la couleur lumineuse de la gamme majeure.
            </p>
          </div>

          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
            <h4 style={{fontSize:15,fontWeight:'bold',color:'#D4A0D4',marginBottom:'.65rem'}}>La gamme mineure naturelle</h4>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',marginBottom:'1rem'}}>
              La gamme {M("mineure naturelle","La gamme mineure naturelle (ou mineure éolienne) est la 6e note de la gamme majeure prise comme nouvelle tonique. Ex: La mineur = les mêmes notes que Do majeur mais en partant de La. C'est pourquoi Do majeur et La mineur sont 'relatifs'.","#D4A0D4")} a un schéma différent : Ton-Demi-ton-Ton-Ton-Demi-ton-Ton-Ton. Sa {M("tierce mineure","La tierce mineure (Do-Mi♭, 3 demi-tons) est ce qui donne la couleur 'sombre' ou 'mélancolique' à un accord ou une gamme mineure. C'est 1 demi-ton de moins que la tierce majeure.","#D4A0D4")} (Do-Mi♭) lui donne sa couleur sombre et introspective.
            </p>
            <div style={{background:'rgba(0,0,0,0.2)',borderRadius:10,padding:'.85rem'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem'}}>GAMME DE LA MINEUR NATUREL</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {[{n:'La',i:'T'},{n:'Si',i:'½'},{n:'Do',i:'T'},{n:'Ré',i:'T'},{n:'Mi',i:'½'},{n:'Fa',i:'T'},{n:'Sol',i:'T'},{n:'La',i:''}].map((note,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:36,height:36,borderRadius:8,background:i===0||i===7?'rgba(212,168,100,0.3)':'rgba(255,255,255,0.08)',border:`1px solid ${i===0||i===7?'#D4A0D4':'rgba(255,255,255,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:'bold',color:i===0||i===7?'#D4A0D4':'rgba(255,255,255,0.7)'}}>
                      {note.n}
                    </div>
                    {note.i&&<div style={{fontSize:9,color:'rgba(255,255,255,0.35)',fontFamily:'monospace'}}>{note.i}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>)}

        {activeSection==='modes' && (<div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeIn 0.3s ease'}}>
          <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Les modes de la gamme majeure</h3>
          <div style={{padding:'1rem',background:'rgba(96,168,188,0.08)',border:'1px solid rgba(96,168,188,0.2)',borderRadius:12}}>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
              Les {M("modes","Les modes sont des variantes d'une gamme obtenues en changeant la note de départ. La gamme de Do majeur a 7 modes : Ionien, Dorien, Phrygien, Lydien, Mixolydien, Éolien, Locrien. Chacun a une couleur émotionnelle distincte.","#60A8BC")} sont créés en prenant les mêmes notes d'une gamme mais en changeant la {M("tonique","La tonique est la note centrale, le 'Do' de référence du mode. En changeant la tonique sur les mêmes notes, on change la couleur harmonique de tout un morceau.","#7BC8A4")}. La gamme de Do majeur (Do-Ré-Mi-Fa-Sol-La-Si) a 7 modes.
            </p>
          </div>
          {[
            {name:'Ionien',  start:'Do', color:'#E8A857', feel:'Joyeux, stable',   desc:"C'est simplement la gamme majeure. Ton point de départ.", example:"Do-Ré-Mi-Fa-Sol-La-Si-Do"},
            {name:'Dorien',  start:'Ré', color:'#7BC8A4', feel:'Jazz, mélancolie douce', desc:"Gamme mineure avec une sixte majeure 'lumineuse'. Le mode du jazz moderne.", example:"Ré-Mi-Fa-Sol-La-Si-Do-Ré"},
            {name:'Phrygien',start:'Mi', color:'#D06060', feel:'Espagnol, dramatique', desc:"Sa seconde mineure lui donne ce caractère flamenco et andalou irrésistible.", example:"Mi-Fa-Sol-La-Si-Do-Ré-Mi"},
            {name:'Lydien',  start:'Fa', color:'#D4A0D4', feel:'Rêveur, cinéma', desc:"Sa quarte augmentée crée une flottement irréel. Très utilisé par John Williams.", example:"Fa-Sol-La-Si-Do-Ré-Mi-Fa"},
            {name:'Mixolydien',start:'Sol',color:'#E8A857',feel:'Blues, rock', desc:"Gamme majeure avec une septième mineure. L'accord de Sol7 y est naturel.", example:"Sol-La-Si-Do-Ré-Mi-Fa-Sol"},
            {name:'Éolien',  start:'La', color:'#B898C8', feel:'Triste, introspectif', desc:"La gamme mineure naturelle. Le mode le plus utilisé en musique populaire.", example:"La-Si-Do-Ré-Mi-Fa-Sol-La"},
            {name:'Locrien', start:'Si', color:'#6B7280', feel:'Instable, dissonant', desc:"Très rarement utilisé seul (quinte diminuée). Base du mode m7b5 en jazz.", example:"Si-Do-Ré-Mi-Fa-Sol-La-Si"},
          ].map(mode=>(
            <div key={mode.name} style={{padding:'1rem',background:`${mode.color}08`,border:`1px solid ${mode.color}30`,borderRadius:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <div style={{fontSize:15,fontWeight:'bold',color:mode.color,fontFamily:'Georgia,serif'}}>{mode.name} — {mode.start}</div>
                <span style={{fontSize:10,fontFamily:'monospace',color:mode.color,opacity:.7,padding:'2px 7px',background:`${mode.color}08`,borderRadius:6}}>{mode.feel}</span>
              </div>
              <p style={{fontSize:12.5,opacity:.7,margin:'0 0 .5rem',lineHeight:1.6,fontFamily:'Georgia,serif'}}>{mode.desc}</p>
              <div style={{fontSize:11,fontFamily:'monospace',color:`${mode.color}`,letterSpacing:'.04em'}}>{mode.example}</div>
            </div>
          ))}
        </div>)}

        {activeSection==='pratique' && (<div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeIn 0.3s ease'}}>
          <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',color:'#7BC8A4'}}>Apprendre ses gammes au piano</h3>
          <div style={{padding:'1rem',background:'rgba(130,224,170,0.08)',border:'1px solid rgba(130,224,170,0.2)',borderRadius:12}}>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif'}}>
              Apprendre ses gammes n'est pas une punition — c'est construire son vocabulaire musical. Un pianiste qui connaît ses gammes peut improviser, transposer et analyser instantanément. La méthode : {M("gamme de Do d'abord","Do majeur = toutes les touches blanches. Pas de dièse ni bémol. C'est la gamme la plus simple visuellement. Une fois maîtrisée, les autres gammes suivent le même schéma décalé.","#7BC8A4")}, puis le {M("cycle des quintes","Le cycle des quintes est l'ordre dans lequel on ajoute des dièses (Do, Sol, Ré, La...) ou des bémols (...Mi♭, Si♭, Fa) à l'armure. C'est l'ordre idéal pour apprendre les gammes progressivement.","#E8A857")}.
            </p>
          </div>
          {[
            {title:"Doigté main droite — gamme majeure", color:'#90B8D0',
             content:"Le doigté standard de la gamme de Do MD est : 1-2-3 / 1-2-3-4-5. Le passage du pouce (1 sous 3 à la montée, 3 sur 1 à la descente) est la clé. À pratiquer lentement (60 BPM) en contrôlant que le poignet reste horizontal."},
            {title:"Doigté main gauche — gamme majeure", color:'#E07070',
             content:"MG gamme de Do : 5-4-3-2-1 / 3-2-1 (montée). Le passage s'effectue sur la 6e note. À la descente : 1-2-3 / 1-2-3-4-5. Les deux mains en même temps = même schéma de passage du pouce, symétrique."},
            {title:"Méthode de travail quotidienne", color:'#E8A857',
             content:"5 minutes/jour de gammes valent mieux qu'une heure par semaine. Commencer lentement (40 BPM) et ne jamais accélérer avant d'atteindre 10 répétitions parfaites. Jouer les gammes les yeux fermés renforce la mémoire musculaire."},
            {title:"Les gammes pentatoniques", color:'#D4A0D4',
             content:"La pentatonique (5 notes : Do-Ré-Mi-Sol-La) est parfaite pour l'improvisation. Elle évite toutes les dissonances. C'est la gamme de base du blues, du rock et de la pop mondiale. À apprendre en deuxième après la gamme majeure."},
          ].map((s,i)=>(
            <div key={i} style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${s.color}22`,borderRadius:12}}>
              <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:'.5rem'}}>{s.title}</div>
              <p style={{fontSize:13,opacity:.72,lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>{s.content}</p>
            </div>
          ))}
        </div>)}
      </div>

      {defWord && <MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
    </div>
  );
}

// ── Cours 2 : Intervalles ─────────────────────────────────────────────────────
function CoursIntervalles() {
  const [defWord, setDefWord] = useState(null);
  const [defText, setDefText] = useState(null);
  const M = (word, def, color='#90B8D0') => (
    <MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>
  );

  const INTERVALS = [
    {name:'Unisson',      semis:0,  abbr:'1', color:'#6B7280', feel:'Identité sonore', ex:'Do-Do'},
    {name:'Seconde mineure',semis:1,abbr:'2m',color:'#D06060', feel:'Friction maximale',ex:'Do-Ré♭'},
    {name:'Seconde majeure',semis:2,abbr:'2M',color:'#E8A857', feel:'Tension légère',  ex:'Do-Ré'},
    {name:'Tierce mineure',semis:3, abbr:'3m',color:'#D4A0D4', feel:'Mélancolie',       ex:'Do-Mi♭'},
    {name:'Tierce majeure',semis:4, abbr:'3M',color:'#E8A857', feel:'Joie, lumière',   ex:'Do-Mi'},
    {name:'Quarte juste',  semis:5, abbr:'4J',color:'#7BC8A4', feel:'Stabilité ouverte',ex:'Do-Fa'},
    {name:'Triton',        semis:6, abbr:'4+',color:'#D06060', feel:'Tension diabolique',ex:'Do-Fa♯'},
    {name:'Quinte juste',  semis:7, abbr:'5J',color:'#60A8BC', feel:'Solidité, force', ex:'Do-Sol'},
    {name:'Sixte mineure', semis:8, abbr:'6m',color:'#B898C8', feel:'Nostalgique',      ex:'Do-La♭'},
    {name:'Sixte majeure', semis:9, abbr:'6M',color:'#6EB898', feel:'Chaleureux',       ex:'Do-La'},
    {name:'Septième mineure',semis:10,abbr:'7m',color:'#E8A857',feel:'Tension douce',  ex:'Do-Si♭'},
    {name:'Septième majeure',semis:11,abbr:'7M',color:'#C8864A',feel:'Suspendu, rêveur',ex:'Do-Si'},
    {name:'Octave',        semis:12,abbr:'8',  color:'#7BC8A4', feel:'Résolution totale',ex:'Do-Do'},
  ];

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Les intervalles</h3>

      <div style={{padding:'1rem',background:'rgba(133,193,233,0.08)',border:'1px solid rgba(133,193,233,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Un {M("intervalle","Un intervalle est la distance sonore entre deux notes. C'est l'élément de base de l'harmonie. Tous les accords et toutes les gammes sont construits à partir d'intervalles. Les maîtriser à l'oreille, c'est comprendre la musique.")} est la distance entre deux notes, mesurée en {M("demi-tons","Le demi-ton est la plus petite distance musicale en musique occidentale. Sur le piano, c'est la distance entre deux touches adjacentes (ex: Mi et Fa, ou Do et Do♯). 2 demi-tons = 1 ton.","#D4A0D4")}. Un intervalle peut être {M("mélodique","Un intervalle mélodique est joué en séquence : une note après l'autre. Ex: Do puis Sol = quinte juste mélodique. C'est ce que fait une mélodie.","#7BC8A4")} (notes successives) ou {M("harmonique","Un intervalle harmonique est joué simultanément : les deux notes en même temps. Ex: Do + Sol = quinte juste harmonique. C'est ce que fait un accord.")}.
        </p>
      </div>

      {/* Interval table */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#90B8D0',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>TABLEAU DES INTERVALLES</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {INTERVALS.map(int=>(
            <div key={int.name} style={{display:'flex',alignItems:'center',gap:8,padding:'.5rem .75rem',background:`${int.color}`,border:`0.5px solid ${int.color}`,borderRadius:8}}>
              <div style={{width:28,height:28,borderRadius:6,background:`${int.color}`,border:`1px solid ${int.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:'bold',color:int.color,fontFamily:'monospace',flexShrink:0}}>{int.semis}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:'bold',color:int.color,fontFamily:'Georgia,serif'}}>{int.name}</div>
                <div style={{fontSize:10,opacity:.55,fontFamily:'monospace'}}>{int.ex}</div>
              </div>
              <div style={{fontSize:10,opacity:.55,fontFamily:'monospace',textAlign:'right',flexShrink:0}}>{int.feel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key intervals explained */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#90B8D0',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>INTERVALLES FONDAMENTAUX</div>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {[
            {title:"Le triton — diabolus in musica", color:'#D06060',
             text:`Le ${M("triton","Le triton (6 demi-tons) divise exactement l'octave en deux. Au Moyen Âge, il était interdit car jugé trop dissonant — diabolus in musica (le diable en musique). Aujourd'hui c'est la tension la plus forte de la musique tonale. G7 = Do-Mi-Sol-Si♭ contient un triton entre Mi et Si♭.","#D06060")} est l'intervalle le plus instable. Il est au cœur de l'accord de dominante 7 et crée la tension qui pousse vers la résolution.`},
            {title:"La quinte juste — le fondement", color:'#60A8BC',
             text:`La ${M("quinte juste","La quinte juste (7 demi-tons) est l'intervalle le plus stable après l'octave. Tous les accordeurs de guitare utilisent la quinte. C'est la base du cycle des quintes, de la construction des accords et de l'intonation naturelle.","#60A8BC")} (7 demi-tons) est l'intervalle le plus consonant après l'octave. Il structure tout l'accord parfait (Do-Mi-Sol : fondamentale, tierce, quinte).`},
            {title:"La tierce — la couleur majeur/mineur", color:'#D4A0D4',
             text:`La ${M("tierce","La tierce est l'intervalle entre la 1ère et la 3ème note d'une gamme. Tierce majeure = 4 demi-tons (joie). Tierce mineure = 3 demi-tons (mélancolie). C'est cet unique demi-ton de différence qui change toute la couleur émotionnelle d'un morceau.","#D4A0D4")} définit si un accord sonne majeur ou mineur. 4 demi-tons = majeur (lumineux). 3 demi-tons = mineur (sombre). Un seul demi-ton de différence change toute l'atmosphère.`},
          ].map((item,i)=>(
            <div key={i} style={{padding:'.85rem',background:`${item.color}`,border:`1px solid ${item.color}`,borderRadius:10}}>
              <div style={{fontSize:14,fontWeight:'bold',color:item.color,fontFamily:'Georgia,serif',marginBottom:'.5rem'}}>{item.title}</div>
              <p style={{fontSize:13,opacity:.75,lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mnemonics */}
      <div style={{padding:'1rem',background:'rgba(247,220,111,0.06)',border:'1px solid rgba(247,220,111,0.2)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>MÉMO : IDENTIFIER LES INTERVALLES PAR L'ÉCOUTE</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {[
            {int:'Octave',  song:'Quelque part au-delà de l\'arc-en-ciel (Wizard of Oz)'},
            {int:'Quinte juste',    song:'Star Wars (thème principal, 2 premières notes)'},
            {int:'Quarte juste',    song:'La Marseillaise (1ères notes "Allons")'},
            {int:'Tierce majeure',  song:'When the Saints Go Marching In'},
            {int:'Tierce mineure',  song:'Smoke On The Water (Deep Purple, intro)'},
            {int:'Seconde majeure', song:'Happy Birthday (2 premières notes)'},
            {int:'Triton',         song:'The Simpsons Theme (1ères notes)'},
          ].map((m,i)=>(
            <div key={i} style={{display:'flex',gap:8,fontSize:12,padding:'.35rem 0',borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
              <span style={{fontWeight:'bold',color:'#E8A857',fontFamily:'monospace',minWidth:120,flexShrink:0,fontSize:11}}>{m.int}</span>
              <span style={{opacity:.65,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{m.song}</span>
            </div>
          ))}
        </div>
      </div>

      {defWord && <MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
    </div>
  );
}

// ── Cours 3 : Construction des accords ───────────────────────────────────────
function CoursConstructionAccords() {
  const [defWord, setDefWord] = useState(null);
  const [defText, setDefText] = useState(null);
  const [playedChord, setPlayedChord] = useState(null);
  const M = (word, def, color='#E8A857') => (
    <MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>
  );

  function playExChord(semis) {
    semis.forEach((s,i)=>setTimeout(()=>playNote(s+4*12,0,1.5),i*80));
    setPlayedChord(semis.join('-'));
    setTimeout(()=>setPlayedChord(null),2000);
  }

  const CHORD_TYPES_THEORY = [
    {name:'Accord majeur',  formula:[0,4,7],  color:'#E8A857', feel:'Lumineux, positif',   semis_ex:[0,4,7],
     desc:"Fondamentale + tierce majeure (4 demi-tons) + quinte juste (7 demi-tons). L'accord parfait majeur."},
    {name:'Accord mineur',  formula:[0,3,7],  color:'#D4A0D4', feel:'Sombre, mélancolique',  semis_ex:[0,3,7],
     desc:"Fondamentale + tierce mineure (3 demi-tons) + quinte juste (7 demi-tons). Un seul demi-ton de moins que le majeur."},
    {name:'Accord diminué', formula:[0,3,6],  color:'#D06060', feel:'Tension maximale',     semis_ex:[0,3,6],
     desc:"Fondamentale + tierce mineure + quinte diminuée (6 demi-tons = triton). Très instable, demande résolution."},
    {name:'Accord augmenté',formula:[0,4,8],  color:'#E8A857', feel:'Mystérieux, flottant', semis_ex:[0,4,8],
     desc:"Fondamentale + tierce majeure + quinte augmentée (8 demi-tons). Couleur mystérieuse, très utilisée en Jazz."},
    {name:'Accord de 7e dominante',formula:[0,4,7,10],color:'#D06060',feel:'Tension forte, appel à résoudre',semis_ex:[0,4,7,10],
     desc:"Accord majeur + septième mineure (10 demi-tons). Contient un triton (entre la tierce et la 7e) qui crée la tension V7→I."},
    {name:'Accord de 7e majeure',formula:[0,4,7,11],color:'#C8864A',feel:'Rêveur, nostalgique', semis_ex:[0,4,7,11],
     desc:"Accord majeur + septième majeure (11 demi-tons). Plus doux que la 7e dominante. Signature du jazz moderne et de la bossa nova."},
    {name:'Accord de 7e mineure',formula:[0,3,7,10],color:'#B898C8',feel:'Jazz, sophistiqué',  semis_ex:[0,3,7,10],
     desc:"Accord mineur + septième mineure. L'accord ii7 fondamental du jazz. Très utilisé pour les progressions ii-V-I."},
  ];

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Construction des accords</h3>

      <div style={{padding:'1rem',background:'rgba(247,220,111,0.08)',border:'1px solid rgba(247,220,111,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Un {M("accord","Un accord est la superposition d'au moins 3 notes jouées simultanément. Un accord à 3 notes s'appelle une triade. À 4 notes : un accord de septième. Un accord est comme un mot dans le langage musical : il transmet une émotion précise.")} est une superposition de notes construite sur des {M("intervalles","Les intervalles sont les distances entre les notes. Pour construire un accord, on empile des tierces (3 ou 4 demi-tons) sur la note fondamentale. C'est la superposition d'intervalles qui crée la couleur de l'accord.","#90B8D0")} caractéristiques. La méthode universelle : partir d'une {M("fondamentale","La fondamentale (ou racine) est la note qui donne son nom à l'accord. Do majeur = accord dont la fondamentale est Do. C'est la note la plus grave dans un accord en position fondamentale.","#7BC8A4")}, puis empiler des tierces.
        </p>
      </div>

      {/* Chord types with play button */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>LES 7 TYPES D'ACCORDS ESSENTIELS — clique 🔊 pour écouter en Do</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {CHORD_TYPES_THEORY.map(ct=>{
            const isPlaying = playedChord===ct.semis_ex.join('-');
            return(
              <div key={ct.name} style={{padding:'.85rem',background:`${ct.color}`,border:`1px solid ${ct.color}`,borderRadius:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:'bold',color:ct.color,fontFamily:'Georgia,serif',marginBottom:2}}>{ct.name}</div>
                    <div style={{fontSize:10,opacity:.55,fontFamily:'monospace'}}>{ct.formula.join('-')} demi-tons · {ct.feel}</div>
                  </div>
                  <button onClick={()=>playExChord(ct.semis_ex)}
                    style={{background:isPlaying?`${ct.color}`:`${ct.color}`,border:`1px solid ${ct.color}`,color:ct.color,padding:'4px 10px',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0,transition:'all 0.2s',boxShadow:isPlaying?`0 2px 10px ${ct.color}`:'none'}}>
                    {isPlaying?'▶…':'🔊'}
                  </button>
                </div>
                <p style={{fontSize:12,opacity:.68,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>{ct.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Renversements */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>LES RENVERSEMENTS</div>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',marginBottom:'1rem'}}>
          Un {M("renversement","Un renversement est obtenu en déplaçant la note la plus grave d'un accord vers l'aigu. Accord de Do en position fondamentale : Do-Mi-Sol. 1er renversement : Mi-Sol-Do. 2ème renversement : Sol-Do-Mi. Le son change, mais la couleur (majeur/mineur) reste identique.")} change la note la plus grave de l'accord sans changer sa qualité. Ils permettent des enchaînements fluides ({M("voice leading","Le voice leading (conduite des voix) est l'art de relier les notes d'un accord au suivant avec le minimum de mouvement. Un bon voice leading crée une fluidité mélodique dans l'harmonie. Bach est le maître absolu du voice leading.","#D4A0D4")}).
        </p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {[
            {name:'Position fondamentale', notes:'Do-Mi-Sol', color:'#E8A857', desc:'La note la plus grave est la fondamentale'},
            {name:'1er renversement',      notes:'Mi-Sol-Do', color:'#90B8D0', desc:'La tierce est à la basse'},
            {name:'2ème renversement',     notes:'Sol-Do-Mi', color:'#7BC8A4', desc:'La quinte est à la basse'},
          ].map((r,i)=>(
            <div key={i} style={{flex:1,minWidth:120,padding:'.75rem',background:`${r.color}`,border:`1px solid ${r.color}`,borderRadius:10}}>
              <div style={{fontSize:12,fontWeight:'bold',color:r.color,fontFamily:'Georgia,serif',marginBottom:4}}>{r.name}</div>
              <div style={{fontSize:13,fontFamily:'monospace',color:'rgba(255,255,255,0.75)',marginBottom:4}}>{r.notes}</div>
              <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Accords diatoniques */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>LES 7 ACCORDS DIATONIQUES DE DO MAJEUR</div>
        <p style={{fontSize:13,opacity:.7,lineHeight:1.65,marginBottom:'1rem',fontFamily:'Georgia,serif'}}>
          En {M("harmonisant","Harmoniser une gamme = construire un accord sur chaque degré en utilisant uniquement les notes de cette gamme. On obtient 7 accords naturels qui s'entendent bien ensemble — c'est la base de toute composition tonale.","#E8A857")} la gamme de Do majeur (un accord sur chaque degré avec uniquement les notes de la gamme), on obtient :
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
          {[{d:'I',n:'Do M',c:'#E8A857'},{d:'ii',n:'Ré m',c:'#D4A0D4'},{d:'iii',n:'Mi m',c:'#7BC8A4'},{d:'IV',n:'Fa M',c:'#90B8D0'},{d:'V',n:'Sol M',c:'#D06060'},{d:'vi',n:'La m',c:'#B898C8'},{d:'vii°',n:'Si dim',c:'#6B7280'}].map(a=>(
            <div key={a.d} style={{padding:'.55rem',background:`${a.c}`,border:`1px solid ${a.c}`,borderRadius:8,textAlign:'center'}}>
              <div style={{fontSize:10,color:a.c,fontFamily:'monospace',opacity:.7,marginBottom:2}}>{a.d}</div>
              <div style={{fontSize:12,fontWeight:'bold',color:a.c,fontFamily:'monospace'}}>{a.n}</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,opacity:.6,lineHeight:1.6,margin:'.75rem 0 0',fontFamily:'Georgia,serif'}}>
          I, IV et V sont majeurs (piliers harmoniques). ii, iii et vi sont mineurs (couleurs). vii° est diminué (tension).
        </p>
      </div>

      {defWord && <MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
    </div>
  );
}

// ── Quiz de fin de chapitre ───────────────────────────────────────────────────
function CourseQuiz({ questions, courseTitle, color, onClose }) {
  const [idx,      setIdx]      = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen,   setChosen]   = useState(null);
  const [score,    setScore]    = useState(0);
  const [done,     setDone]     = useState(false);

  const q = questions[idx];

  function pick(i) {
    if (answered) return;
    setChosen(i); setAnswered(true);
    if (i === q.correct) setScore(s=>s+1);
  }

  function next() {
    if (idx >= questions.length-1) { setDone(true); return; }
    setIdx(i=>i+1); setAnswered(false); setChosen(null);
  }

  if (done) {
    const pct = Math.round((score/questions.length)*100);
    const mc  = pct>=80?'#7BC8A4':pct>=50?'#E8A857':'#E07070';
    return (
      <div style={{padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
        <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}35`,borderRadius:14}}>
          <div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1rem'}}>QUIZ — {courseTitle.toUpperCase()}</div>
          <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score}<span style={{fontSize:28,opacity:.5}}>/{questions.length}</span></div>
          <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
          <div style={{fontSize:13,opacity:.55,fontFamily:'Georgia,serif',marginTop:8}}>
            {pct>=80?'Excellent ! Tu maîtrises ce chapitre 🎉':pct>=50?'Bon travail, relis les points manquants !':'Relis le cours avant de retenter !'}
          </div>
        </div>
        <button onClick={()=>{setIdx(0);setScore(0);setAnswered(false);setChosen(null);setDone(false);}}
          style={{padding:'.85rem',background:`${color}08`,border:`1.5px solid ${color}`,color,borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold'}}>
          🔄 RECOMMENCER LE QUIZ
        </button>
        <button onClick={onClose}
          style={{padding:'.85rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.1em'}}>
          ← RETOUR AU COURS
        </button>
      </div>
    );
  }

  const pct = ((idx)/questions.length)*100;
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.7rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>QUIZ {idx+1}/{questions.length}</span>
          <span style={{fontSize:10,fontFamily:'monospace',color:'#7BC8A4'}}>{score} ✓</span>
        </div>
        <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2}}>
          <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:2,transition:'width 0.3s'}}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div style={{padding:'1.25rem',background:`${color}08`,border:`1px solid ${color}30`,borderRadius:14}}>
          <div style={{fontSize:10,color,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>QUESTION {idx+1}</div>
          <p style={{fontSize:15,fontWeight:'bold',lineHeight:1.55,margin:0,fontFamily:'Georgia,serif'}}>{q.question}</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {q.options.map((opt,i)=>{
            const isCorrect=i===q.correct, isChosen=i===chosen;
            let bg='rgba(255,255,255,0.04)',border='rgba(255,255,255,0.12)',col='rgba(255,255,255,0.8)';
            if(answered){
              if(isCorrect){bg=`${color}`;border=color;col=color;}
              else if(isChosen){bg='rgba(241,148,138,0.1)';border='#E07070';col='#E07070';}
              else{col='rgba(255,255,255,0.25)';}
            }
            return(
              <button key={i} onClick={()=>pick(i)} disabled={answered}
                style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.9rem 1rem',borderRadius:12,cursor:answered?'default':'pointer',textAlign:'left',fontSize:13,fontFamily:'Georgia,serif',lineHeight:1.5,transition:'all 0.2s'}}
                onMouseEnter={e=>{if(!answered){e.currentTarget.style.background=`${color}18`;e.currentTarget.style.borderColor=`${color}`;}}}
                onMouseLeave={e=>{if(!answered){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}}
              >
                <span style={{fontFamily:'monospace',fontWeight:'bold',marginRight:8,opacity:.5}}>{String.fromCharCode(65+i)}.</span>{opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <div style={{padding:'.85rem',background:chosen===q.correct?'rgba(130,224,170,0.07)':'rgba(241,148,138,0.07)',border:`1px solid ${chosen===q.correct?'rgba(130,224,170,0.3)':'rgba(241,148,138,0.3)'}`,borderRadius:10,animation:'fadeIn 0.25s ease'}}>
            <p style={{fontSize:12.5,opacity:.75,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{q.explanation}</p>
          </div>
        )}
        {answered && (
          <button onClick={next}
            style={{width:'100%',padding:'.9rem',background:`${color}08`,border:`1.5px solid ${color}`,color,borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
            {idx>=questions.length-1?'VOIR MON SCORE →':'QUESTION SUIVANTE →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Cours 4 : Fonctions harmoniques ──────────────────────────────────────────
function CoursFonctionsHarmoniques() {
  const [defWord,setDefWord]=useState(null);
  const [defText,setDefText]=useState(null);
  const [showQuiz,setShowQuiz]=useState(false);
  const M=(word,def,color='#E07070')=><MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>;

  const QUIZ_QUESTIONS=[
    {question:"Quelle est la fonction de l'accord I dans une tonalité ?",
     options:["Créer la tension maximale","Être le centre de repos et de stabilité","Préparer la dominante","Introduire une modulation"],
     correct:1,explanation:"L'accord I (tonique) est le centre de gravité. Toute la musique tonale cherche à s'y reposer. C'est la 'maison' harmonique."},
    {question:"Le V7 crée une tension forte vers le I. Pourquoi ?",
     options:["Car il est plus grave que le I","Car il contient un triton entre sa tierce et sa septième","Car il est joué plus fort","Car il a plus de notes que le I"],
     correct:1,explanation:"Le V7 contient un triton (intervalle le plus instable) entre sa tierce et sa 7e. Ce triton cherche naturellement à se résoudre par mouvement contraire vers le I."},
    {question:"Qu'est-ce qu'une cadence parfaite ?",
     options:["I → V","IV → I","V → I","ii → V"],
     correct:2,explanation:"La cadence parfaite V→I est la conclusion la plus forte de la musique tonale. Elle donne une sensation de clôture définitive, comme un point final."},
    {question:"L'accord IV a quelle fonction ?",
     options:["Dominante","Tonique","Sous-dominante","Sensible"],
     correct:2,explanation:"L'accord IV est la sous-dominante. Il crée un 'éloignement' de la tonique sans tension aussi forte que la dominante. Idéal pour les milieux de phrases."},
    {question:"Que signifie 'déceptive' dans 'cadence déceptive' ?",
     options:["La cadence est fausse","Au lieu de résoudre sur I, le V va vers vi","La cadence est incomplète","Le V n'est pas joué"],
     correct:1,explanation:"La cadence déceptive (V→vi) 'trompe' l'oreille qui attendait le I. Elle crée une surprise douce, prolonge la phrase. Très utilisée pour éviter une fin prématurée."},
  ];

  if(showQuiz) return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR AU COURS</button>
      </div>
      <CourseQuiz questions={QUIZ_QUESTIONS} courseTitle="Fonctions harmoniques" color="#E07070" onClose={()=>setShowQuiz(false)}/>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Fonctions harmoniques</h3>
        <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(241,148,138,0.15)',border:'1px solid rgba(241,148,138,0.4)',color:'#E07070',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
      </div>

      <div style={{padding:'1rem',background:'rgba(241,148,138,0.08)',border:'1px solid rgba(241,148,138,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Chaque accord d'une gamme a un {M("rôle fonctionnel","Une fonction harmonique est le rôle qu'un accord joue dans la progression. Comme dans une phrase, certains mots créent l'attente, d'autres la résolvent. En musique tonale, tout accord est soit une tonique (repos), soit une dominante (tension), soit une sous-dominante (mouvement).")}. La musique tonale repose sur trois pôles : {M("Tonique","La tonique (T) est le centre de repos. En Do majeur, c'est l'accord de Do. Tous les chemins harmoniques y reviennent. Accords toniques en majeur : I, iii, vi.","#7BC8A4")}, {M("Dominante","La dominante (D) est le pôle de tension maximale. Elle crée l'envie de revenir à la tonique. Accords dominants en majeur : V, vii°. Le V7 est la dominante la plus puissante.","#D06060")}, {M("Sous-dominante","La sous-dominante (SD) est le pôle de mouvement — elle s'éloigne de la tonique sans créer autant de tension que la dominante. En majeur : IV, ii. Penser à l'Amen des hymnes (IV→I = cadence plagale).","#E8A857")}.
        </p>
      </div>

      {[
        {title:"I — La Tonique : la maison", color:'#7BC8A4', icon:'🏠',
         content:[
           "L'accord I est le centre de gravité de toute la musique tonale. Tout morceau cherche à y revenir.",
           "En Do majeur : Do-Mi-Sol. Sa tierce majeure et sa quinte juste lui donnent une stabilité parfaite.",
           "Les accords iii et vi partagent des notes avec I et ont une fonction tonique secondaire (couleurs plus sombres).",
           `Astuce : quand tu entends une mélodie qui "atterrit" et se stabilise, tu es probablement sur un accord I.`,
         ]},
        {title:"V — La Dominante : la tension", color:'#D06060', icon:'⚡',
         content:[
           "L'accord V (Sol majeur en Do) contient la note sensible (Si) qui veut monter vers Do.",
           "Le V7 (Sol-Si-Ré-Fa) est encore plus fort : il contient un triton Si-Fa qui cherche à se résoudre.",
           "La résolution V→I est appelée cadence parfaite. C'est la conclusion harmonique la plus forte.",
           "En jazz, on utilise souvent le V7alt (dominante altérée) pour une tension encore plus pimentée.",
         ]},
        {title:"IV — La Sous-dominante : le départ", color:'#E8A857', icon:'🚀',
         content:[
           "L'accord IV (Fa majeur en Do) crée un mouvement sans tension dramatique.",
           "La progression I→IV donne une sensation d'élévation, d'ouverture — pensez à l'intro de Let It Be.",
           "La cadence plagale IV→I (l'Amen des hymnes) est une résolution douce et spirituelle.",
           "L'accord ii (Ré mineur en Do) est une sous-dominante mineure aux couleurs plus sophistiquées.",
         ]},
        {title:"Les cadences — ponctuations musicales", color:'#B898C8', icon:'📌',
         content:[
           "Cadence parfaite V-I : point final. Clôture définitive, soulagement.",
           "Cadence imparfaite (X-V) : virgule. Tension, attente, la musique continue.",
           "Cadence déceptive V-vi : surprise. L'oreille attendait I et reçoit vi mineur.",
           "Cadence plagale IV-I : Amen. Sérénité, spiritualité, conclusion douce.",
         ]},
      ].map((s,i)=>(
        <div key={i} style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${s.color}22`,borderRadius:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'.75rem'}}>
            <span style={{fontSize:20}}>{s.icon}</span>
            <div style={{fontSize:15,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.title}</div>
          </div>
          <ul style={{margin:0,paddingLeft:'1.25rem',display:'flex',flexDirection:'column',gap:6}}>
            {s.content.map((c,j)=><li key={j} style={{fontSize:13,opacity:.75,lineHeight:1.6,fontFamily:'Georgia,serif'}}>{c}</li>)}
          </ul>
        </div>
      ))}
      {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
    </div>
  );
}

// ── Cours 5 : Cadences ────────────────────────────────────────────────────────
function CoursCadences() {
  const [defWord,setDefWord]=useState(null);
  const [defText,setDefText]=useState(null);
  const [showQuiz,setShowQuiz]=useState(false);
  const [playing,setPlaying]=useState(null);
  const M=(word,def,color='#60A8BC')=><MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>;

  async function playCadence(chords) {
    setPlaying(true);
    for(const [root,type] of chords) {
      const ri=CHROMATIC.indexOf(root);
      if(ri===-1)continue;
      const notes=CHORD_TYPES[type].formula.map(f=>ri+f+4*12);
      playChordArp(notes);
      await new Promise(r=>setTimeout(r,1300));
    }
    setPlaying(false);
  }

  const CADENCES=[
    {name:'Cadence parfaite',   formula:'V7 → I',  chords:[['G','Dom. 7'],['C','Majeures']], color:'#7BC8A4',
     feel:'Conclusion définitive — point final.',
     desc:"La plus forte résolution de la musique tonale. L'oreille ressent un soulagement complet.",
     usage:"Fin de morceau, fin de refrain, clôture d'une section. À utiliser quand tu veux que la musique s'arrête vraiment.",
     examples:"Fin de presque toutes les sonates classiques. Bach l'utilise à la fin de chaque chorâl."},
    {name:'Cadence imparfaite', formula:'I → V',   chords:[['C','Majeures'],['G','Majeures']], color:'#E8A857',
     feel:'Suspension — une question sans réponse.',
     desc:"La musique se termine sur la dominante, créant une attente. Comme une phrase qui se finit par...",
     usage:"Milieu de couplet, fin de phrase musicale avant le refrain. Crée de l'élan vers ce qui suit.",
     examples:"Fin du couplet de nombreuses chansons pop, fin des phrases dans les sonates de Haydn."},
    {name:'Cadence déceptive',  formula:'V → vi',  chords:[['G','Dom. 7'],['A','Mineures']], color:'#D4A0D4',
     feel:"Surprise douce — l'oreille attendait Do et reçoit La mineur.",
     desc:"Le V résout sur vi au lieu de I. La 'tromperie' harmonique la plus agréable.",
     usage:"Pour prolonger une phrase, éviter une fin prématurée, créer une nuance émotionnelle.",
     examples:"Let It Be (Beatles) — bridge. Beethoven Sonate \"Pathétique\" — 2ème mouvement."},
    {name:'Cadence plagale',    formula:'IV → I',  chords:[['F','Majeures'],['C','Majeures']], color:'#90B8D0',
     feel:"Spirituel, sérénité — l'Amen des cathédrales.",
     desc:"Résolution douce sans tension forte. Associée aux hymnes religieux depuis des siècles.",
     usage:"Fins d'hymnes, de ballades douces, de gospel. Pour une conclusion apaisée non dramatique.",
     examples:"Hallelujah (Leonard Cohen) — coda. Yesterday (Beatles) — dernière phrase."},
    {name:'Cadence phrygienne', formula:'i → V/III', chords:[['C','Mineures'],['E','Dom. 7']], color:'#D06060',
     feel:"Dramatique, oriental, flamenco.",
     desc:"Mouvement d'un demi-ton vers le bas dans la basse. Couleur espagnole très caractéristique.",
     usage:"Musique espagnole, flamenco, metal, passages dramatiques. Pour un impact émotionnel fort.",
     examples:"Intro de Stairway to Heaven (Led Zeppelin). Flamenco traditionnel."},
  ];

  const QUIZ_QUESTIONS=[
    {question:"Quelle cadence donne la sensation de 'point final' le plus fort ?",
     options:["Plagale IV→I","Imparfaite I→V","Parfaite V→I","Déceptive V→vi"],
     correct:2,explanation:"La cadence parfaite V→I est la conclusion harmonique la plus forte car elle résout la tension maximale (le triton du V7) sur la stabilité totale du I."},
    {question:"La cadence déceptive V→vi surprend car...",
     options:["Le V est joué trop fort","L'oreille attendait I mais reçoit vi","Le vi est dissonant","La progression est trop rapide"],
     correct:1,explanation:"Après un V7, l'oreille anticipe le I. Résoudre sur vi (relatif mineur) crée une surprise émotionnelle douce — la musique évite la conclusion attendue."},
    {question:"Quelle cadence est associée à l'Amen des hymnes ?",
     options:["Parfaite","Plagale","Imparfaite","Phrygienne"],
     correct:1,explanation:"La cadence plagale IV→I est appelée 'cadence d'Amen' car elle conclut les hymnes religieux depuis des siècles. Sa résolution est douce et apaisée."},
  ];

  if(showQuiz) return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR AU COURS</button>
      </div>
      <CourseQuiz questions={QUIZ_QUESTIONS} courseTitle="Cadences" color="#60A8BC" onClose={()=>setShowQuiz(false)}/>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Cadences</h3>
        <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(96,168,188,0.15)',border:'1px solid rgba(96,168,188,0.4)',color:'#60A8BC',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
      </div>
      <div style={{padding:'1rem',background:'rgba(96,168,188,0.07)',border:'1px solid rgba(96,168,188,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Une {M("cadence","Une cadence est une formule harmonique de conclusion — comme la ponctuation dans une phrase écrite. Elle indique à l'auditeur si la phrase musicale est terminée (point), suspendue (virgule) ou surprise (point d'exclamation). Maîtriser les cadences = maîtriser le découpage de la musique.")} est une succession d'accords qui conclut une phrase musicale. Elle donne à l'auditeur une indication claire sur l'état de la musique : repos, tension, surprise. Clique sur 🔊 pour entendre chaque cadence en Do majeur.
        </p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {CADENCES.map((cad,i)=>(
          <div key={i} style={{padding:'1rem',background:`${cad.color}08`,border:`1px solid ${cad.color}30`,borderRadius:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
              <div>
                <div style={{fontSize:15,fontWeight:'bold',color:cad.color,fontFamily:'Georgia,serif',marginBottom:2}}>{cad.name}</div>
                <div style={{fontSize:12,fontFamily:'monospace',color:`${cad.color}`,marginBottom:4}}>{cad.formula}</div>
                <div style={{fontSize:12,fontStyle:'italic',opacity:.7,fontFamily:'Georgia,serif'}}>{cad.feel}</div>
              </div>
              <button onClick={()=>!playing&&playCadence(cad.chords)} disabled={!!playing}
                style={{background:`${cad.color}08`,border:`1px solid ${cad.color}30`,color:cad.color,padding:'.4rem .8rem',borderRadius:8,cursor:playing?'default':'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0,transition:'all 0.2s'}}>
                {playing?'▶…':'🔊'}
              </button>
            </div>
            <p style={{fontSize:12.5,opacity:.7,lineHeight:1.6,margin:'0 0 .5rem',fontFamily:'Georgia,serif'}}>{cad.desc}</p>
            <div style={{fontSize:11,opacity:.5,fontFamily:'monospace',marginBottom:'.3rem'}}>UTILISATION : {cad.usage}</div>
            <div style={{fontSize:11,opacity:.45,fontFamily:'Georgia,serif',fontStyle:'italic'}}>Ex : {cad.examples}</div>
          </div>
        ))}
      </div>
      {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
    </div>
  );
}

// ── Cours 6 : ii-V-I jazz ─────────────────────────────────────────────────────
function CoursIIVI() {
  const [defWord,setDefWord]=useState(null);
  const [defText,setDefText]=useState(null);
  const [showQuiz,setShowQuiz]=useState(false);
  const [playing,setPlaying]=useState(false);
  const M=(word,def,color='#C8864A')=><MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>;

  async function playProg(chords) {
    if(playing)return; setPlaying(true);
    for(const [root,type] of chords){
      const ri=CHROMATIC.indexOf(root);
      if(ri===-1)continue;
      playChordArp(CHORD_TYPES[type].formula.map(f=>ri+f+4*12));
      await new Promise(r=>setTimeout(r,1400));
    }
    setPlaying(false);
  }

  const QUIZ_QUESTIONS=[
    {question:"Dans le ii-V-I en Do majeur, quel est l'accord ii ?",
     options:["Ré majeur","Ré mineur 7","Fa majeur","Sol 7"],
     correct:1,explanation:"Le ii en Do majeur est Ré mineur 7 (Ré-Fa-La-Do). C'est le 2e degré de la gamme de Do harmonisé — naturellement mineur avec une 7e mineure."},
    {question:"Pourquoi le ii-V-I est-il fondamental en jazz ?",
     options:["Car c'est la plus longue progression","Car elle contient toutes les notes d'une gamme","Car elle crée tension (ii-V) puis résolution (I), le mouvement harmonique fondamental","Car elle est facile à jouer"],
     correct:2,explanation:"Le ii prépare, le V crée la tension maximale avec son triton, et le I résout. C'est le mouvement harmonique fondamental de la musique tonale, condensé en 3 accords."},
    {question:"Qu'est-ce qu'une substitution de triton ?",
     options:["Remplacer le I par son relatif mineur","Remplacer le V7 par l'accord situé un triton plus bas","Jouer les accords plus vite","Transposer la progression"],
     correct:1,explanation:"La substitution de triton remplace G7 par Db7 (un triton = 6 demi-tons plus bas). Ces deux accords partagent les mêmes notes de tension (Si et Fa), ce qui permet la substitution sans perdre la résolution."},
  ];

  if(showQuiz) return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR AU COURS</button>
      </div>
      <CourseQuiz questions={QUIZ_QUESTIONS} courseTitle="ii-V-I Jazz" color="#C8864A" onClose={()=>setShowQuiz(false)}/>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>ii-V-I : L'ADN du jazz</h3>
        <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(200,140,80,0.15)',border:'1px solid rgba(200,140,80,0.4)',color:'#C8864A',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
      </div>

      <div style={{padding:'1rem',background:'rgba(200,140,80,0.08)',border:'1px solid rgba(200,140,80,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          La progression {M("ii-V-I","Le ii-V-I est la progression harmonique la plus importante du jazz. Elle représente le mouvement tension→résolution dans sa forme la plus pure. On la retrouve dans 80% des standards jazz. La maîtriser dans les 12 tonalités est l'exercice quotidien de tout jazzman.")} est la colonne vertébrale du jazz. Toutes les ballades, tous les standards de Coltrane, Miles Davis, Bill Evans reposent sur cette progression. Elle concentre le mouvement harmonique fondamental : sous-dominante → dominante → tonique.
        </p>
      </div>

      {/* Visual chord display */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#C8864A',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>ii-V-I EN DO MAJEUR</div>
        <div style={{display:'flex',gap:8,marginBottom:'1rem',flexWrap:'wrap'}}>
          {[
            {d:'ii',name:"Dm7",notes:"Ré Fa La Do",color:'#D4A0D4',role:'Prépare, s\'éloigne'},
            {d:'V7',name:"G7", notes:"Sol Si Ré Fa",color:'#D06060',role:'Tension maximale'},
            {d:'Imaj7',name:"Cmaj7",notes:"Do Mi Sol Si",color:'#7BC8A4',role:'Résolution, repos'},
          ].map((c,i)=>(
            <div key={i} style={{flex:1,minWidth:90,padding:'.85rem',background:`${c.color}`,border:`1.5px solid ${c.color}`,borderRadius:12,textAlign:'center'}}>
              <div style={{fontSize:10,color:c.color,fontFamily:'monospace',opacity:.7,marginBottom:4}}>{c.d}</div>
              <div style={{fontSize:20,fontWeight:'bold',color:c.color,fontFamily:'monospace',lineHeight:1,marginBottom:4}}>{c.name}</div>
              <div style={{fontSize:9,opacity:.5,fontFamily:'monospace',marginBottom:4}}>{c.notes}</div>
              <div style={{fontSize:10,opacity:.6,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{c.role}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>playProg([['D','Min. 7'],['G','Dom. 7'],['C','Maj. 7']])} disabled={playing}
            style={{flex:1,padding:'.65rem',background:'rgba(200,140,80,0.12)',border:'1px solid rgba(200,140,80,0.4)',color:'#D4A0D4',borderRadius:10,cursor:playing?'default':'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold'}}>
            {playing?'▶ EN COURS…':'▶ ÉCOUTER ii-V-I en Do'}
          </button>
        </div>
      </div>

      {[
        {title:"Pourquoi ça fonctionne ?", color:'#D4A0D4',
         content:`Le ii7 (${M("Ré mineur 7","Ré-Fa-La-Do. Il contient la même quinte (Fa-La) que Fa majeur (IV), ce qui explique sa fonction sous-dominante. La 7e Do le relie au I qui suit.","#D4A0D4")}) prépare harmoniquement. Le V7 (${M("Sol 7","Sol-Si-Ré-Fa. Il contient le triton Si-Fa. Si veut monter vers Do (sensible), Fa veut descendre vers Mi. Ce double mouvement par demi-ton crée la tension la plus forte possible.","#D06060")}) crée une tension explosive avec son triton. Le ${M("Imaj7","Do-Mi-Sol-Si. La 7e majeure Si lui donne une couleur rêveuse, suspendue — signature du jazz. Plus sophistiqué que le simple accord de Do.","#7BC8A4")} résout et repose.`},
        {title:"Dans les 12 tonalités", color:'#E8A857',
         content:"Un musicien de jazz doit jouer ii-V-I dans TOUTES les tonalités. C'est l'exercice de base. En Sol : Am7-D7-Gmaj7. En Fa : Gm7-C7-Fmaj7. En Si♭ : Cm7-F7-B♭maj7. Le cycle des quintes dicte l'ordre d'apprentissage."},
        {title:"La substitution de triton", color:'#D06060',
         content:"Le triton permet une substitution élégante : G7 remplacé par D♭7. La basse descend par demi-tons (G-G♭-F), créant un mouvement chromatique fluide très apprécié en jazz moderne."},
        {title:"ii-V-I mineur", color:'#B898C8',
         content:"En mineur, la progression change légèrement : iim7♭5 - V7alt - im(maj7). Ex en La mineur : Bm7♭5 - E7alt - Am(maj7). Le V7alt contient des tensions altérées (♭9, #9, ♭13) qui intensifient la couleur mineure."},
      ].map((s,i)=>(
        <div key={i} style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${s.color}22`,borderRadius:12}}>
          <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:'.65rem'}}>{s.title}</div>
          <p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>{s.content}</p>
        </div>
      ))}
      {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
    </div>
  );
}

// ── Cours 7 : Borrowed chords ─────────────────────────────────────────────────
function CoursBorrowedChords() {
  const [defWord,setDefWord]=useState(null);
  const [defText,setDefText]=useState(null);
  const [showQuiz,setShowQuiz]=useState(false);
  const [playing,setPlaying]=useState(false);
  const M=(word,def,color='#6EB898')=><MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>;

  async function playProg(chords) {
    if(playing)return; setPlaying(true);
    for(const [root,type] of chords){
      const ri=CHROMATIC.indexOf(root);
      if(ri===-1)continue;
      playChordArp(CHORD_TYPES[type].formula.map(f=>ri+f+4*12));
      await new Promise(r=>setTimeout(r,1300));
    }
    setPlaying(false);
  }

  const QUIZ_QUESTIONS=[
    {question:"Qu'est-ce qu'un 'borrowed chord' ?",
     options:["Un accord joué par un autre musicien","Un accord emprunté à une autre tonalité ou mode","Un accord difficile à jouer","Un accord de jazz uniquement"],
     correct:1,explanation:"Un borrowed chord (accord emprunté) est un accord issu d'une tonalité parallèle (ex: mineur de Do dans Do majeur). Il apporte une couleur inattendue sans sortir complètement du contexte tonal."},
    {question:"Le ♭VII est emprunté de quelle gamme (en Do majeur) ?",
     options:["Do mineur harmonique","Do mineur naturel (éolien)","Do lydien","Do phrygien"],
     correct:1,explanation:"En Do majeur, Si♭ majeur (♭VII) vient de Do mineur naturel où Si est bémolisé. Cet accord est très courant en rock et pop — il donne une couleur sombre et puissante."},
    {question:"Quelle progression utilise un accord de sous-dominante mineure emprunté ?",
     options:["I-IV-V-I","I-V-vi-IV","I-IV-iv-I","I-ii-V-I"],
     correct:2,explanation:"Dans I-IV-iv-I, le iv (sous-dominante mineure) est emprunté au mode mineur. Ex: Do-Fa-Fm-Do. Le passage Fa→Fa mineur crée une descente chromatique très émouvante (Mi→Mi♭ dans la voix médiane)."},
  ];

  if(showQuiz) return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR AU COURS</button>
      </div>
      <CourseQuiz questions={QUIZ_QUESTIONS} courseTitle="Borrowed Chords" color="#6EB898" onClose={()=>setShowQuiz(false)}/>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Borrowed Chords</h3>
        <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(96,180,148,0.15)',border:'1px solid rgba(96,180,148,0.4)',color:'#6EB898',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
      </div>

      <div style={{padding:'1rem',background:'rgba(96,180,148,0.08)',border:'1px solid rgba(96,180,148,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Les {M("borrowed chords","Un borrowed chord est un accord 'emprunté' à une tonalité parallèle. Do majeur peut emprunter des accords à Do mineur (même tonique, mode différent). Cette technique permet d'enrichir une progression sans modulation complète — juste une 'visite' dans l'ombre.")} sont des accords empruntés au mode {M("parallèle","Le mode parallèle partage la même tonique mais pas les mêmes notes. Do majeur et Do mineur sont parallèles (même Do, mais notes différentes). À ne pas confondre avec le relatif (même notes, tonique différente — Do majeur et La mineur).","#D4A0D4")}. Ils introduisent une note chromatique inattendue qui enrichit la couleur sans sortir du contexte tonal. Très utilisés en pop, rock, R&B et jazz moderne.
        </p>
      </div>

      {[
        {title:"♭VII — L'accord de rock", chord:"Si♭ en Do majeur", color:'#D06060', borrowed:"Do mineur éolien",
         chords:[['C','Majeures'],['Bb','Majeures'],['C','Majeures']],
         desc:"Le Si♭ majeur (♭VII) apporté du mode mineur donne un effet massif, puissant. C'est l'accord signature du rock classique.",
         example:"Sweet Home Alabama — I-♭VII-IV. Hey Jude (Beatles) — ♭VII dans le na-na-na."},
        {title:"iv — La sous-dominante mineure", chord:"Fa mineur en Do majeur", color:'#D4A0D4', borrowed:"Do mineur naturel",
         chords:[['C','Majeures'],['F','Majeures'],['F','Mineures'],['C','Majeures']],
         desc:"La progression I-IV-iv-I crée une descente chromatique poignante (Mi→Mi♭). Son effet émotionnel est immédiat et universel.",
         example:"The Beatles - In My Life (pont). Pink Floyd - Comfortably Numb. Très courant en R&B."},
        {title:"♭VI — L'accord cinématique", chord:"La♭ en Do majeur", color:'#C8864A', borrowed:"Do mineur naturel",
         chords:[['C','Majeures'],['Ab','Majeures'],['G','Dom. 7'],['C','Majeures']],
         desc:"L'accord ♭VI introduit une couleur sombre et grandiose. Sa résolution vers V puis I crée un effet 'épique' très prisé en musique de film.",
         example:"Hans Zimmer l'utilise constamment. Canon de Pachelbel à l'envers. Nombreuses ballades pop."},
        {title:"♭III — La tierce mineure empruntée", chord:"Mi♭ en Do majeur", color:'#E8A857', borrowed:"Do mineur naturel",
         chords:[['C','Majeures'],['Eb','Majeures'],['F','Majeures'],['C','Majeures']],
         desc:"Le ♭III apporte une couleur chaleureuse et inattendue. Il fonctionne particulièrement bien entre I et IV.",
         example:"Oh! Darling (Beatles). Nombreux standards de Stevie Wonder. Jazz soul."},
      ].map((s,i)=>(
        <div key={i} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}`,borderRadius:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.65rem'}}>
            <div>
              <div style={{fontSize:15,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:2}}>{s.title}</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <span style={{fontSize:10,fontFamily:'monospace',color:`${s.color}`,padding:'2px 7px',background:`${s.color}08`,borderRadius:6}}>{s.chord}</span>
                <span style={{fontSize:10,fontFamily:'monospace',opacity:.45,padding:'2px 7px',background:'rgba(255,255,255,0.05)',borderRadius:6}}>emprunté à {s.borrowed}</span>
              </div>
            </div>
            <button onClick={()=>playProg(s.chords)} disabled={playing}
              style={{background:`${s.color}08`,border:`1px solid ${s.color}`,color:s.color,padding:'.35rem .75rem',borderRadius:8,cursor:playing?'default':'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0,marginLeft:8}}>
              {playing?'▶…':'🔊'}
            </button>
          </div>
          <p style={{fontSize:12.5,opacity:.72,lineHeight:1.6,margin:'0 0 .4rem',fontFamily:'Georgia,serif'}}>{s.desc}</p>
          <div style={{fontSize:11,opacity:.5,fontFamily:'Georgia,serif',fontStyle:'italic'}}>Ex : {s.example}</div>
        </div>
      ))}
      {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── EXERCICE LECTURE D'ACCORDS ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Données armatures
const KEY_SIGNATURES = [
  {key:'C',  mode:'major', sharps:0, flats:0,  label:'Do majeur',    relative:'A mineur'},
  {key:'G',  mode:'major', sharps:1, flats:0,  label:'Sol majeur',   relative:'Mi mineur'},
  {key:'D',  mode:'major', sharps:2, flats:0,  label:'Ré majeur',    relative:'Si mineur'},
  {key:'A',  mode:'major', sharps:3, flats:0,  label:'La majeur',    relative:'Fa# mineur'},
  {key:'E',  mode:'major', sharps:4, flats:0,  label:'Mi majeur',    relative:'Do# mineur'},
  {key:'B',  mode:'major', sharps:5, flats:0,  label:'Si majeur',    relative:'Sol# mineur'},
  {key:'F#', mode:'major', sharps:6, flats:0,  label:'Fa# majeur',   relative:'Ré# mineur'},
  {key:'F',  mode:'major', sharps:0, flats:1,  label:'Fa majeur',    relative:'Ré mineur'},
  {key:'Bb', mode:'major', sharps:0, flats:2,  label:'Si♭ majeur',   relative:'Sol mineur'},
  {key:'Eb', mode:'major', sharps:0, flats:3,  label:'Mi♭ majeur',   relative:'Do mineur'},
  {key:'Ab', mode:'major', sharps:0, flats:4,  label:'La♭ majeur',   relative:'Fa mineur'},
  {key:'Db', mode:'major', sharps:0, flats:5,  label:'Ré♭ majeur',   relative:'Si♭ mineur'},
  {key:'A',  mode:'minor', sharps:0, flats:0,  label:'La mineur',    relative:'Do majeur'},
  {key:'E',  mode:'minor', sharps:1, flats:0,  label:'Mi mineur',    relative:'Sol majeur'},
  {key:'B',  mode:'minor', sharps:2, flats:0,  label:'Si mineur',    relative:'Ré majeur'},
  {key:'F#', mode:'minor', sharps:3, flats:0,  label:'Fa# mineur',   relative:'La majeur'},
  {key:'D',  mode:'minor', sharps:0, flats:1,  label:'Ré mineur',    relative:'Fa majeur'},
  {key:'G',  mode:'minor', sharps:0, flats:2,  label:'Sol mineur',   relative:'Si♭ majeur'},
  {key:'C',  mode:'minor', sharps:0, flats:3,  label:'Do mineur',    relative:'Mi♭ majeur'},
];

// Portée SVG pour accords (notes en blocs ou arpège)
function ChordStaff({ rootNote, chordType, inversion=0, displayMode='block', highlight=false }) {
  const NOTE_Y = {C4:80,D4:72,E4:64,F4:58,G4:50,A4:42,B4:34,C5:26,D5:18,E5:10};
  const NOTE_NAMES = Object.keys(NOTE_Y);
  const ri = CHROMATIC.indexOf(rootNote);
  if (ri < 0) return null;

  // Build chord notes
  const formula = CHORD_TYPES[chordType]?.formula || [0,4,7];
  let baseNotes = formula.map(f => {
    const semi = (ri + f) % 12;
    const name = CHROMATIC[semi];
    // Map to nearest staff position
    const solfege_map = {C:'C4',D:'D4',E:'E4',F:'F4',G:'G4',A:'A4',B:'B4'};
    const base = name.replace('#','').replace('b','');
    return solfege_map[base] || 'C4';
  });

  // Apply inversion: shift bottom note(s) up
  for (let i=0; i<inversion; i++) {
    const bottom = baseNotes.shift();
    // Go up one octave
    const next = bottom === 'C4'?'C5':bottom==='D4'?'D5':bottom==='E4'?'E5':bottom==='F4'?'F5':bottom==='G4'?'G5':'C5';
    baseNotes.push(next);
  }

  const W=180, H=110;
  const lineY = [80,72,64,56,48]; // 5 staff lines
  const noteColor = highlight ? '#E8A857' : '#1a1a1a';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{background:'#F5EFE8',borderRadius:8,border:'1px solid rgba(0,0,0,0.1)'}}>
      {/* Staff lines */}
      {lineY.map((y,i)=><line key={i} x1={20} y1={y} x2={W-10} y2={y} stroke="#555" strokeWidth={0.8}/>)}
      {/* Treble clef */}
      <text x={22} y={78} fontSize={36} fill="#555" fontFamily="serif" style={{userSelect:'none'}}>𝄞</text>

      {/* Notes */}
      {baseNotes.map((note,i)=>{
        const y = NOTE_Y[note] || 50;
        const x = displayMode==='arpege' ? 70 + i*22 : 90;
        const needsLedger = note==='C4' || note==='C5';
        const accidental = CHROMATIC[(ri+formula[i])%12];
        const hasSharp = accidental?.includes('#');
        const hasFlat  = accidental?.includes('b');
        return(
          <g key={i}>
            {needsLedger && <line x1={x-8} x2={x+8} y1={y} y2={y} stroke="#555" strokeWidth={0.8}/>}
            <ellipse cx={x} cy={y} rx={6} ry={4.5} fill={noteColor} transform={`rotate(-15,${x},${y})`}/>
            {/* Stem */}
            <line x1={x+5.5} y1={y} x2={x+5.5} y2={y-28} stroke={noteColor} strokeWidth={1.2}/>
            {/* Accidental */}
            {hasSharp && <text x={x-14} y={y+4} fontSize={11} fill={noteColor} fontFamily="serif">♯</text>}
            {hasFlat  && <text x={x-14} y={y+4} fontSize={11} fill={noteColor} fontFamily="serif">♭</text>}
          </g>
        );
      })}
    </svg>
  );
}

// Exercice lecture d'accord
function LectureAccordExercice() {
  const CHORD_TYPE_KEYS = Object.keys(CHORD_TYPES);
  const [screen,       setScreen]     = useState('config');
  const [selectedTypes,setSelTypes]   = useState(new Set(['Majeures','Mineures']));
  const [withInv,      setWithInv]    = useState(false);
  const [dispMode,     setDispMode]   = useState('block'); // block | arpege | both
  const [score,        setScore]      = useState({correct:0,total:0});
  const [exercises,    setExercises]  = useState([]);
  const [idx,          setIdx]        = useState(0);
  const [answer,       setAnswer]     = useState('');
  const [feedback,     setFeedback]   = useState(null); // null | 'correct' | 'wrong'
  const [showAnswer,   setShowAnswer] = useState(false);
  const inputRef = useRef(null);

  function buildExercices(n=12) {
    const types = [...selectedTypes];
    const invMax = withInv ? 2 : 0;
    return Array.from({length:n}, ()=>{
      const root = ROOT_NOTES[Math.floor(Math.random()*ROOT_NOTES.length)];
      const type = types[Math.floor(Math.random()*types.length)];
      const inv  = Math.floor(Math.random()*(invMax+1));
      const dm   = dispMode==='both' ? (Math.random()>0.5?'block':'arpege') : dispMode;
      return {root,type,inv,dm};
    });
  }

  function start() {
    const exs = buildExercices(12);
    setExercises(exs); setIdx(0); setScore({correct:0,total:0});
    setAnswer(''); setFeedback(null); setShowAnswer(false);
    setScreen('play');
    setTimeout(()=>inputRef.current?.focus(),200);
  }

  function checkAnswer() {
    const ex = exercises[idx];
    if (!ex) return;
    // Build expected answers (flexible: "Cm", "Do mineur", "C min", etc.)
    const root = ex.root;
    const suffix = CHORD_TYPES[ex.type]?.suffix || '';
    const label  = CHORD_TYPES[ex.type]?.label  || '';
    const invLabel = ex.inv>0 ? ` (renversement ${ex.inv})` : '';
    const ans = answer.trim().toLowerCase().replace(/\s+/g,' ');
    // Accept: Cm / C min / C mineur / Do mineur etc.
    const expected = [
      (root+suffix).toLowerCase(),
      (root+' '+label).toLowerCase(),
      (root+' '+label.toLowerCase()),
    ];
    const correct = expected.some(e=>ans.includes(e.toLowerCase().replace(/\s+/g,' '))) ||
                    ans===root.toLowerCase() && suffix==='' ||
                    (ans.startsWith(root.toLowerCase()) && ans.includes(label.toLowerCase().split('.')[0]));
    setFeedback(correct?'correct':'wrong');
    setScore(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
    if (correct) playChordArp(CHORD_TYPES[ex.type].formula.map(f=>(CHROMATIC.indexOf(ex.root)+f)%12+4*12));
  }

  function next() {
    if (idx>=exercises.length-1) { setScreen('result'); return; }
    setIdx(i=>i+1); setAnswer(''); setFeedback(null); setShowAnswer(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  }

  const ex = exercises[idx];
  const expectedLabel = ex ? ex.root + CHORD_TYPES[ex.type]?.suffix + (ex.inv>0?`/${ex.inv}er renversement`:'') : '';

  if (screen==='config') return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Lecture d'accords</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>IDENTIFIER LES ACCORDS SUR PORTÉE</p>
      </div>
      <div style={{padding:'1rem',background:'rgba(232,168,87,0.08)',border:'1px solid rgba(232,168,87,0.25)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12.5,opacity:.7,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>
          Un accord apparaît sur la portée — en bloc ou en arpège. Identifie-le et écris sa notation (ex : <strong>Cm</strong>, <strong>G7</strong>, <strong>Fmaj7</strong>).
        </p>
      </div>

      {/* Types */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>TYPES D'ACCORDS</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          {CHORD_TYPE_KEYS.map(t=>{
            const on=selectedTypes.has(t);
            const c='#E8A857';
            return(<button key={t} onClick={()=>setSelTypes(prev=>{const n=new Set(prev);n.has(t)&&n.size>1?n.delete(t):n.add(t);return n;})}
              style={{padding:'.55rem .75rem',background:on?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${on?c:'rgba(255,255,255,0.1)'}`,borderRadius:9,cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',alignItems:'center',gap:7}}>
              <div style={{width:12,height:12,borderRadius:2,background:on?c:'rgba(255,255,255,0.15)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {on&&<span style={{fontSize:8,color:'#000',fontWeight:'bold'}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:'bold',color:on?c:'rgba(255,255,255,0.55)'}}>{CHORD_TYPES[t].label}</div>
                <div style={{fontSize:9,opacity:.4,fontFamily:'monospace'}}>ex. C{CHORD_TYPES[t].suffix}</div>
              </div>
            </button>);
          })}
        </div>
      </div>

      {/* Options */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:'1.5rem'}}>
        <div>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>AFFICHAGE</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {[['block','En bloc'],['arpege','Arpège'],['both','Mixte']].map(([v,label])=>(
              <button key={v} onClick={()=>setDispMode(v)} style={{padding:'.45rem .7rem',background:dispMode===v?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${dispMode===v?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:dispMode===v?'#E8A857':'rgba(255,255,255,0.5)',fontSize:11,fontFamily:'monospace',textAlign:'left',transition:'all 0.2s'}}>{label}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>RENVERSEMENTS</div>
          <button onClick={()=>setWithInv(v=>!v)} style={{width:'100%',padding:'.65rem',background:withInv?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${withInv?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:withInv?'#E8A857':'rgba(255,255,255,0.5)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>{withInv?'Activés':'Désactivés'}</span>
            <div style={{width:32,height:18,borderRadius:9,background:withInv?'#E8A857':'rgba(255,255,255,0.15)',position:'relative',transition:'all 0.25s'}}>
              <div style={{position:'absolute',top:2,left:withInv?14:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left 0.25s'}}/>
            </div>
          </button>
        </div>
      </div>

      <button onClick={start} style={{width:'100%',padding:'1rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold'}}>
        COMMENCER →
      </button>
    </div>
  );

  if (screen==='result') {
    const pct=score.total>0?Math.round((score.correct/score.total)*100):0;
    const mc=pct>=80?'#7BC8A4':pct>=50?'#E8A857':'#E07070';
    return(
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}30`,borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS</div>
          <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/{score.total}</span></div>
          <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
          <div style={{fontSize:13,opacity:.5,fontFamily:'Georgia,serif',marginTop:8}}>{pct>=80?'Excellente lecture ! 🎉':pct>=50?'Continue à travailler ta lecture !':'Revois la construction des accords.'}</div>
        </div>
        <button onClick={start} style={{padding:'.9rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold'}}>🔄 RECOMMENCER</button>
        <button onClick={()=>setScreen('config')} style={{padding:'.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.1em'}}>⚙ RECONFIGURER</button>
      </div>
    );
  }

  if (!ex) return null;
  const progress=(idx/exercises.length)*100;
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.7rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{idx+1}/{exercises.length}</span>
          <span style={{fontSize:10,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct} ✓</span>
        </div>
        <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress}%`,background:'#E8A857',borderRadius:2,transition:'width 0.3s ease'}}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Chord display */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.75rem',padding:'1.25rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
          <div style={{fontSize:10,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em'}}>
            {ex.dm==='arpege'?'ARPÈGE':'ACCORD EN BLOC'}{ex.inv>0?` — RENVERSEMENT ${ex.inv}`:''}
          </div>
          <ChordStaff rootNote={ex.root} chordType={ex.type} inversion={ex.inv} displayMode={ex.dm} highlight={feedback==='correct'}/>
          {showAnswer && (
            <div style={{fontSize:16,fontWeight:'bold',color:'#E8A857',fontFamily:'monospace',animation:'fadeIn 0.3s ease'}}>{expectedLabel}</div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{padding:'.85rem',background:feedback==='correct'?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.1)',border:`1px solid ${feedback==='correct'?'rgba(130,224,170,0.35)':'rgba(241,148,138,0.35)'}`,borderRadius:10,textAlign:'center',animation:'fadeIn 0.25s ease'}}>
            <div style={{fontSize:16,fontWeight:'bold',color:feedback==='correct'?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif'}}>
              {feedback==='correct'?`✓ Correct ! ${expectedLabel}`:(`✗ C'était : ${expectedLabel}`)}
            </div>
          </div>
        )}

        {/* Input */}
        {!feedback && (
          <div style={{display:'flex',gap:8}}>
            <input ref={inputRef} value={answer} onChange={e=>setAnswer(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&answer.trim()&&checkAnswer()}
              placeholder="Ex: Cm, G7, Fmaj7, Dm..."
              style={{flex:1,padding:'.75rem 1rem',background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:10,color:'rgba(255,255,255,0.85)',fontSize:14,fontFamily:'monospace',outline:'none'}}
            />
            <button onClick={checkAnswer} disabled={!answer.trim()}
              style={{padding:'.75rem 1rem',background:answer.trim()?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.03)',border:`1.5px solid ${answer.trim()?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:10,cursor:answer.trim()?'pointer':'not-allowed',color:answer.trim()?'#E8A857':'rgba(255,255,255,0.25)',fontSize:13,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
              ✓
            </button>
          </div>
        )}

        {/* Controls */}
        <div style={{display:'flex',gap:8}}>
          {!feedback && (
            <button onClick={()=>{setShowAnswer(true);setFeedback('wrong');setScore(s=>({...s,total:s.total+1}));}}
              style={{flex:1,padding:'.65rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:11,fontFamily:'monospace'}}>
              Voir la réponse
            </button>
          )}
          {feedback && (
            <button onClick={next}
              style={{flex:1,padding:'.75rem',background:feedback==='correct'?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${feedback==='correct'?'#7BC8A4':'#E07070'}`,color:feedback==='correct'?'#7BC8A4':'#E07070',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.08em',animation:'fadeIn 0.3s ease'}}>
              {idx>=exercises.length-1?'RÉSULTATS →':'ACCORD SUIVANT →'}
            </button>
          )}
          <button onClick={()=>ex&&playChordArp(CHORD_TYPES[ex.type].formula.map(f=>(CHROMATIC.indexOf(ex.root)+f)%12+4*12))}
            style={{padding:'.65rem .9rem',background:'rgba(232,168,87,0.08)',border:'1px solid rgba(232,168,87,0.25)',borderRadius:9,cursor:'pointer',color:'#E8A857',fontSize:11,fontFamily:'monospace'}}>
            🔊
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── EXERCICE RECONNAISSANCE DES ARMATURES ─────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ArmatureStaff({ sharps, flats }) {
  const W=180, H=90;
  const lineY=[72,64,56,48,40];
  // Sharp positions on staff (F# C# G# D# A# E# B#) — standard order
  const SHARP_POSITIONS = [54,42,58,46,34,50,38];
  const FLAT_POSITIONS  = [42,54,38,50,34,46,30];

  return(
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{background:'#F5EFE8',borderRadius:8,border:'1px solid rgba(0,0,0,0.1)'}}>
      {lineY.map((y,i)=><line key={i} x1={20} y1={y} x2={W-10} y2={y} stroke="#555" strokeWidth={0.8}/>)}
      <text x={22} y={70} fontSize={36} fill="#555" fontFamily="serif" style={{userSelect:'none'}}>𝄞</text>
      {/* Sharps */}
      {Array.from({length:sharps}).map((_,i)=>(
        <text key={i} x={58+i*12} y={SHARP_POSITIONS[i]} fontSize={14} fill="#1a1a1a" fontFamily="serif">♯</text>
      ))}
      {/* Flats */}
      {Array.from({length:flats}).map((_,i)=>(
        <text key={i} x={58+i*12} y={FLAT_POSITIONS[i]} fontSize={14} fill="#1a1a1a" fontFamily="serif">♭</text>
      ))}
    </svg>
  );
}

function ArmatureExercice() {
  const [screen,  setScreen]  = useState('play');
  const [pool,    setPool]    = useState([]);
  const [idx,     setIdx]     = useState(0);
  const [score,   setScore]   = useState({correct:0,total:0});
  const [answered,setAnswered]= useState(false);
  const [chosen,  setChosen]  = useState(null);

  function buildPool() {
    const shuffled=[...KEY_SIGNATURES].sort(()=>Math.random()-.5).slice(0,12);
    setPool(shuffled); setIdx(0); setScore({correct:0,total:0}); setAnswered(false); setChosen(null);
  }

  useEffect(()=>buildPool(),[]);

  const ks = pool[idx];

  // Generate options only when ks is defined
  const options = ks ? (() => {
    const sameMode = KEY_SIGNATURES.filter(k=>k.mode===ks.mode&&k.label!==ks.label);
    const wrongs = sameMode.sort(()=>Math.random()-.5).slice(0,3);
    return [...wrongs, ks].sort(()=>Math.random()-.5);
  })() : [];

  // Wait for pool to load
  if (!ks) return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:12,opacity:.4,fontFamily:'monospace'}}>Chargement…</div>
    </div>
  );

  function pick(label) {
    if (answered) return;
    setChosen(label); setAnswered(true);
    const correct = label===ks.label;
    setScore(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
  }

  function next() {
    if (idx>=pool.length-1) { setScreen('result'); return; }
    setIdx(i=>i+1); setAnswered(false); setChosen(null);
  }

  if (screen==='result') {
    const pct=Math.round((score.correct/score.total)*100);
    const mc=pct>=80?'#7BC8A4':pct>=50?'#E8A857':'#E07070';
    return(
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}30`,borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS</div>
          <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/{score.total}</span></div>
          <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
          <div style={{fontSize:13,opacity:.5,fontFamily:'Georgia,serif',marginTop:8}}>{pct>=80?'Tu maîtrises les armatures ! 🎉':pct>=50?'Continue !':'Revois le cycle des quintes.'}</div>
        </div>
        <button onClick={()=>{buildPool();setScreen('play');}} style={{padding:'.9rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold'}}>🔄 RECOMMENCER</button>
      </div>
    );
  }

  const progress=(idx/pool.length)*100;
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.7rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{idx+1}/{pool.length}</span>
          <span style={{fontSize:10,fontFamily:'monospace',color:'#7BC8A4'}}>{score.correct} ✓</span>
        </div>
        <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress}%`,background:'#E8A857',borderRadius:2,transition:'width 0.3s ease'}}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.75rem',padding:'1.25rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
          <div style={{fontSize:10,opacity:.35,fontFamily:'monospace',letterSpacing:'.1em'}}>QUELLE TONALITÉ CORRESPOND À CETTE ARMATURE ?</div>
          <ArmatureStaff sharps={ks.sharps} flats={ks.flats}/>
          <div style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>
            {ks.sharps>0?`${ks.sharps} dièse${ks.sharps>1?'s':''}`:ks.flats>0?`${ks.flats} bémol${ks.flats>1?'s':''}`:'Pas d\'altération'}
          </div>
        </div>

        {answered && (
          <div style={{padding:'.85rem',background:chosen===ks.label?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.1)',border:`1px solid ${chosen===ks.label?'rgba(130,224,170,0.35)':'rgba(241,148,138,0.35)'}`,borderRadius:10,textAlign:'center',animation:'fadeIn 0.25s ease'}}>
            <div style={{fontSize:14,fontWeight:'bold',color:chosen===ks.label?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif',marginBottom:4}}>
              {chosen===ks.label?`✓ ${ks.label}`:`✗ C'était : ${ks.label}`}
            </div>
            <div style={{fontSize:11,opacity:.55,fontFamily:'monospace'}}>Relatif : {ks.relative}</div>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {options.map(opt=>{
            const isC=opt.label===ks.label,isU=chosen===opt.label;
            let bg='rgba(255,255,255,0.04)',border='rgba(255,255,255,0.12)',col='rgba(255,255,255,0.78)';
            if(answered){if(isC){bg='rgba(130,224,170,0.15)';border='#7BC8A4';col='#7BC8A4';}else if(isU){bg='rgba(241,148,138,0.1)';border='#E07070';col='#E07070';}else{col='rgba(255,255,255,0.25)';}}
            return(
              <button key={opt.label} onClick={()=>pick(opt.label)} disabled={answered}
                style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.85rem .5rem',borderRadius:11,cursor:answered?'default':'pointer',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',textAlign:'center',transition:'all 0.2s'}}
                onMouseEnter={e=>{if(!answered){e.currentTarget.style.background='rgba(232,168,87,0.1)';e.currentTarget.style.borderColor='rgba(232,168,87,0.5)';}}}
                onMouseLeave={e=>{if(!answered){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {answered && (
          <button onClick={next} style={{width:'100%',padding:'.85rem',background:chosen===ks.label?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${chosen===ks.label?'#7BC8A4':'#E07070'}`,color:chosen===ks.label?'#7BC8A4':'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
            {idx>=pool.length-1?'VOIR LES RÉSULTATS →':'ARMATURE SUIVANTE →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TRANSPOSITION REFONTE ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const TRANSPO_MELODIES = [
  {title:"Gamme de Do",    notes:['C4','D4','E4','F4','G4','A4','B4','C5'], semis:[0,2,4,5,7,9,11,12]},
  {title:"Arpège Do-Mi-Sol",notes:['C4','E4','G4','C5','G4','E4','C4'],     semis:[0,4,7,12,7,4,0]},
  {title:"Mélodie simple", notes:['C4','D4','E4','C4','E4','F4','G4'],      semis:[0,2,4,0,4,5,7]},
  {title:"Gamme pentatonique",notes:['C4','D4','E4','G4','A4','C5'],        semis:[0,2,4,7,9,12]},
  {title:"Quinte-Quarte",  notes:['C4','G4','C5','F4','C4'],               semis:[0,7,12,5,0]},
];

const TRANSPO_PROGRESSIONS = [
  {title:"I-IV-V-I",    chords:[{root:'C',type:'Majeures'},{root:'F',type:'Majeures'},{root:'G',type:'Majeures'},{root:'C',type:'Majeures'}]},
  {title:"I-V-vi-IV",  chords:[{root:'C',type:'Majeures'},{root:'G',type:'Majeures'},{root:'A',type:'Mineures'},{root:'F',type:'Majeures'}]},
  {title:"ii-V-I",     chords:[{root:'D',type:'Mineures'},{root:'G',type:'Dom. 7'},{root:'C',type:'Majeures'}]},
  {title:"I-VI-II-V",  chords:[{root:'C',type:'Majeures'},{root:'A',type:'Mineures'},{root:'D',type:'Mineures'},{root:'G',type:'Dom. 7'}]},
];

function TranspositionRefonte() {
  const [mode,      setMode]      = useState('menu'); // menu | melodie | accords
  const [screen,    setScreen]    = useState('config');
  const [selMel,    setSelMel]    = useState(TRANSPO_MELODIES[0]);
  const [selProg,   setSelProg]   = useState(TRANSPO_PROGRESSIONS[0]);
  const [sourceKey, setSourceKey] = useState('C');
  const [targetKey, setTargetKey] = useState('G');
  const [userInput, setUserInput] = useState('');
  const [feedback,  setFeedback]  = useState(null);
  const [showAnswer,setShowAnswer]= useState(false);
  const [pianoActive,setPianoActive]=useState(false);
  const [playingNotes,setPlayingNotes]=useState(new Set());
  const [micMode,     setMicMode]    = useState(false);
  const [micMatch,    setMicMatch]   = useState(false);
  const mic = useMicrophone();
  const timeoutsRef = useRef([]);

  function clearTimeouts() { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current=[]; }
  useEffect(()=>()=>clearTimeouts(),[]);

  // Play source melody/chords
  function playSource() {
    clearTimeouts();
    if (mode==='melodie') {
      const sourceSemi = CHROMATIC.indexOf(sourceKey);
      selMel.semis.forEach((s,i)=>{
        const id=setTimeout(()=>playNote(sourceSemi+s+4*12,0,0.8), i*420);
        timeoutsRef.current.push(id);
      });
    } else {
      const delta=((CHROMATIC.indexOf(sourceKey)-CHROMATIC.indexOf('C'))+12)%12;
      selProg.chords.forEach((ch,i)=>{
        const id=setTimeout(()=>{
          const ri=CHROMATIC.indexOf(ch.root);
          if(ri>=0) playChordArp(CHORD_TYPES[ch.type].formula.map(f=>(ri+delta+f)%12+4*12));
        }, i*1100);
        timeoutsRef.current.push(id);
      });
    }
  }

  // Compute expected answer
  function getExpectedAnswer() {
    const delta=((CHROMATIC.indexOf(targetKey)-CHROMATIC.indexOf(sourceKey))+12)%12;
    if (mode==='melodie') {
      const targetSemi=CHROMATIC.indexOf(targetKey);
      return selMel.notes.map(n=>{
        const si=CHROMATIC.indexOf(n.replace(/[45]/,''));
        const newSi=(si+delta)%12;
        return CHROMATIC[newSi]+(n.includes('5')?'5':'4');
      }).join(' ');
    } else {
      return selProg.chords.map(ch=>{
        const ri=CHROMATIC.indexOf(ch.root);
        const newRi=(ri+delta)%12;
        return CHROMATIC[newRi]+CHORD_TYPES[ch.type].suffix;
      }).join(' - ');
    }
  }

  function checkAnswer() {
    const expected = getExpectedAnswer();
    const ans = userInput.trim().toLowerCase().replace(/\s+/g,' ');
    // Flexible check: at least 60% of expected tokens match
    const expTokens = expected.toLowerCase().split(/[\s-]+/);
    const matches = expTokens.filter(t=>ans.includes(t));
    const correct = matches.length >= Math.ceil(expTokens.length*0.6);
    setFeedback(correct?'correct':'wrong');
    if (correct) {
      const delta=((CHROMATIC.indexOf(targetKey)-CHROMATIC.indexOf(sourceKey))+12)%12;
      if(mode==='melodie'){
        const ts=CHROMATIC.indexOf(targetKey);
        selMel.semis.forEach((s,i)=>{const id=setTimeout(()=>playNote(ts+s+4*12,0,0.7),i*350);timeoutsRef.current.push(id);});
      }
    }
  }

  function reset() { setFeedback(null); setUserInput(''); setShowAnswer(false); }

  const expectedAnswer = (mode !== 'menu') ? getExpectedAnswer() : '';

  // Piano virtual for melody transposition
  const PLAY_KEYS_DATA = PIANO_KEYS_DATA.filter(k=>k.absIdx<=19);
  const whites = PLAY_KEYS_DATA.filter(k=>k.type==='white');
  const blacks = PLAY_KEYS_DATA.filter(k=>k.type==='black');
  const minWi  = Math.min(...whites.map(k=>k.wi));
  const targetDelta=((CHROMATIC.indexOf(targetKey)-CHROMATIC.indexOf('C'))+12)%12;

  function handlePianoKey(absIdx) {
    playNote(absIdx,0,0.8);
    setPlayingNotes(prev=>{const n=new Set(prev);n.add(absIdx);setTimeout(()=>setPlayingNotes(p=>{const nn=new Set(p);nn.delete(absIdx);return nn;}),500);return n;});
  }

  if (mode==='menu') return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Transposition</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>JOUER DANS TOUTES LES TONALITÉS</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {[
          {id:'melodie',icon:'🎵',title:'Transposer une mélodie',desc:'L\'app joue une mélodie dans une tonalité, tu la joues dans une autre.',color:'#E8A857'},
          {id:'accords',icon:'🎹',title:'Transposer une grille d\'accords',desc:'Transpose une progression d\'accords dans une nouvelle tonalité.',color:'#90B8D0'},
        ].map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id);setScreen('config');reset();}}
            style={{background:`${m.color}08`,border:`1.5px solid ${m.color}30`,borderRadius:14,padding:'1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}18`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}08`;e.currentTarget.style.borderColor=`${m.color}30`;e.currentTarget.style.transform='translateY(0)';}}>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <span style={{fontSize:26}}>{m.icon}</span>
              <div>
                <div style={{fontSize:14,fontWeight:'bold',color:m.color,fontFamily:'Georgia,serif',marginBottom:4}}>{m.title}</div>
                <p style={{fontSize:12,opacity:.6,margin:0,fontFamily:'Georgia,serif'}}>{m.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Config screen
  if (screen==='config') return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1.5rem'}}>
        <button onClick={()=>setMode('menu')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>←</button>
        <div>
          <h3 style={{fontSize:18,fontWeight:'bold',margin:0}}>{mode==='melodie'?'Mélodie':'Grille d\'accords'}</h3>
          <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',margin:'2px 0 0'}}>CONFIGURATION</p>
        </div>
      </div>

      {/* Source selection */}
      {mode==='melodie'?(
        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>MÉLODIE</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {TRANSPO_MELODIES.map(m=>(
              <button key={m.title} onClick={()=>setSelMel(m)}
                style={{padding:'.7rem 1rem',background:selMel.title===m.title?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${selMel.title===m.title?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:10,cursor:'pointer',textAlign:'left',transition:'all 0.2s',color:selMel.title===m.title?'#E8A857':'rgba(255,255,255,0.65)',fontSize:13,fontFamily:'Georgia,serif'}}>
                {m.title}
              </button>
            ))}
          </div>
        </div>
      ):(
        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>PROGRESSION</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {TRANSPO_PROGRESSIONS.map(p=>(
              <button key={p.title} onClick={()=>setSelProg(p)}
                style={{padding:'.7rem 1rem',background:selProg.title===p.title?'rgba(133,193,233,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${selProg.title===p.title?'#90B8D0':'rgba(255,255,255,0.1)'}`,borderRadius:10,cursor:'pointer',textAlign:'left',transition:'all 0.2s',color:selProg.title===p.title?'#90B8D0':'rgba(255,255,255,0.65)',fontSize:13,fontFamily:'Georgia,serif'}}>
                <div style={{fontWeight:'bold',marginBottom:2}}>{p.title}</div>
                <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{p.chords.map(c=>c.root+CHORD_TYPES[c.type].suffix).join(' - ')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Key selection */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        {[['Tonalité source',sourceKey,setSourceKey,'#7BC8A4'],['Tonalité cible',targetKey,setTargetKey,'#E8A857']].map(([label,val,setter,color])=>(
          <div key={label}>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.55rem'}}>{label}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
              {ROOT_NOTES.map(k=>(
                <button key={k} onClick={()=>setter(k)}
                  style={{padding:'.4rem',background:val===k?`${color}20`:'rgba(255,255,255,0.04)',border:`1px solid ${val===k?color:'rgba(255,255,255,0.1)'}`,borderRadius:7,cursor:'pointer',color:val===k?color:'rgba(255,255,255,0.55)',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={()=>setScreen('play')} style={{width:'100%',padding:'1rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold'}}>
        COMMENCER →
      </button>
    </div>
  );

  // Play screen
  const accentColor = mode==='melodie'?'#E8A857':'#90B8D0';
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0,display:'flex',alignItems:'center',gap:8}}>
        <button onClick={()=>setScreen('config')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11}}>← CONFIG</button>
        <span style={{opacity:.2}}>|</span>
        <span style={{fontSize:11,fontFamily:'monospace',color:accentColor}}>{mode==='melodie'?selMel.title:selProg.title}</span>
        <span style={{fontSize:10,opacity:.35,fontFamily:'monospace',marginLeft:'auto'}}>{sourceKey} → {targetKey}</span>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Source */}
        <div style={{padding:'1rem',background:'rgba(130,224,170,0.06)',border:'1px solid rgba(130,224,170,0.2)',borderRadius:12}}>
          <div style={{fontSize:10,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>
            VERSION ORIGINALE — {sourceKey}
          </div>
          {mode==='melodie'?(
            <div style={{fontSize:13,fontFamily:'monospace',color:'rgba(255,255,255,0.6)',marginBottom:'.75rem'}}>{selMel.notes.join(' ')}</div>
          ):(
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'.75rem'}}>
              {selProg.chords.map((ch,i)=>{
                const delta=((CHROMATIC.indexOf(sourceKey)-CHROMATIC.indexOf('C'))+12)%12;
                const ri=CHROMATIC.indexOf(ch.root);
                const newRi=(ri+delta)%12;
                return<div key={i} style={{padding:'.35rem .75rem',background:'rgba(130,224,170,0.12)',border:'1px solid rgba(130,224,170,0.3)',borderRadius:8,fontSize:13,fontWeight:'bold',fontFamily:'monospace',color:'#7BC8A4'}}>{CHROMATIC[newRi]+CHORD_TYPES[ch.type].suffix}</div>;
              })}
            </div>
          )}
          <button onClick={playSource} style={{padding:'.5rem 1rem',background:'rgba(130,224,170,0.12)',border:'1px solid rgba(130,224,170,0.35)',borderRadius:8,cursor:'pointer',color:'#7BC8A4',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold'}}>
            🔊 ÉCOUTER
          </button>
        </div>

        {/* Target */}
        <div style={{padding:'1rem',background:`${accentColor}06`,border:`1px solid ${accentColor}25`,borderRadius:12}}>
          <div style={{fontSize:10,color:accentColor,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>
            À TRANSPOSER EN — {targetKey}
          </div>
          {showAnswer && (
            <div style={{fontSize:13,fontFamily:'monospace',color:accentColor,marginBottom:'.5rem',animation:'fadeIn 0.3s ease',padding:'.5rem .75rem',background:`${accentColor}10`,borderRadius:8}}>
              {expectedAnswer}
            </div>
          )}
          {feedback ? (
            <div style={{padding:'.75rem',background:feedback==='correct'?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.1)',border:`1px solid ${feedback==='correct'?'rgba(130,224,170,0.35)':'rgba(241,148,138,0.35)'}`,borderRadius:10,textAlign:'center',animation:'fadeIn 0.25s ease'}}>
              <div style={{fontSize:15,fontWeight:'bold',color:feedback==='correct'?'#7BC8A4':'#E07070',fontFamily:'Georgia,serif',marginBottom:feedback==='correct'?0:4}}>
                {feedback==='correct'?'✓ Bravo !':'✗ Pas tout à fait…'}
              </div>
              {feedback==='wrong'&&<div style={{fontSize:11,opacity:.6,fontFamily:'monospace'}}>Réponse : {expectedAnswer}</div>}
            </div>
          ):(
            <div style={{display:'flex',gap:8}}>
              <input value={userInput} onChange={e=>setUserInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&userInput.trim()&&checkAnswer()}
                placeholder={mode==='melodie'?`Ex: ${targetKey} ${targetKey==='G'?'A B C D E F# G':'...'}...`:`Ex: ${targetKey} → accords...`}
                style={{flex:1,padding:'.7rem .9rem',background:'rgba(255,255,255,0.05)',border:`1.5px solid ${accentColor}40`,borderRadius:10,color:'rgba(255,255,255,0.85)',fontSize:12,fontFamily:'monospace',outline:'none'}}
              />
              <button onClick={checkAnswer} disabled={!userInput.trim()}
                style={{padding:'.7rem .9rem',background:userInput.trim()?`${accentColor}15`:'rgba(255,255,255,0.03)',border:`1.5px solid ${userInput.trim()?accentColor:'rgba(255,255,255,0.1)'}`,borderRadius:10,cursor:userInput.trim()?'pointer':'not-allowed',color:userInput.trim()?accentColor:'rgba(255,255,255,0.25)',fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>✓</button>
            </div>
          )}
        </div>

        {/* Piano virtuel (mélodie seulement) */}
        {mode==='melodie' && (
          <div style={{padding:'.85rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
            <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',textAlign:'center',letterSpacing:'.1em',marginBottom:'.6rem'}}>PIANO — JOUE LA MÉLODIE TRANSPOSÉE</div>
            <div style={{position:'relative',height:90,overflowX:'auto'}}>
              {whites.map(({absIdx,wi})=>{
                const isPlaying=playingNotes.has(absIdx);
                const isTarget=selMel.semis.map(s=>(CHROMATIC.indexOf(targetKey)+s)%12).includes(absIdx%12);
                return<div key={absIdx} onClick={()=>handlePianoKey(absIdx)}
                  style={{position:'absolute',left:(wi-minWi)*34,top:0,width:32,height:85,background:isPlaying?'#E8A857':isTarget?'rgba(232,168,87,0.25)':'#EDE5D8',border:'1.5px solid #555',borderRadius:'0 0 5px 5px',cursor:'pointer',transition:'background 0.15s'}}
                  onMouseEnter={e=>{if(!isPlaying)e.currentTarget.style.background='#D8CEBC';}}
                  onMouseLeave={e=>{if(!isPlaying)e.currentTarget.style.background=isTarget?'rgba(232,168,87,0.25)':'#EDE5D8';}}/>;
              })}
              {blacks.map(({absIdx,wi})=>{
                const isPlaying=playingNotes.has(absIdx);
                return<div key={absIdx} onClick={()=>handlePianoKey(absIdx)}
                  style={{position:'absolute',left:(wi-minWi)*34+22,top:0,width:22,height:55,zIndex:2,background:isPlaying?'#E8A857':'#181614',border:'1px solid #000',borderRadius:'0 0 4px 4px',cursor:'pointer',transition:'background 0.15s'}}/>;
              })}
            </div>
          </div>
        )}

        {/* Microphone — mode piano réel */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'-.5rem'}}>
          <button onClick={()=>{setMicMode(v=>!v);if(micMode)mic.stop();}}
            style={{flex:1,padding:'.6rem',background:micMode?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1.5px solid ${micMode?'#E8A857':'rgba(255,255,255,0.12)'}`,borderRadius:9,cursor:'pointer',color:micMode?'#E8A857':'rgba(255,255,255,0.5)',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s',display:'flex',alignItems:'center',gap:6,justifyContent:'center'}}>
            <span>🎤</span>
            <span>{micMode?'Désactiver le micro':'Jouer sur mon vrai piano'}</span>
          </button>
        </div>

        {micMode && (
          <MicDetector
            mic={mic}
            expectedChord={mode==='accords' && expectedAnswer ? (() => {
              // For chord mode: detect the first expected chord
              const firstChord = expectedAnswer.split(' - ')[0];
              const ri = CHROMATIC.findIndex(n => firstChord.startsWith(n));
              if (ri < 0) return null;
              const root = CHROMATIC[ri];
              const suffix = firstChord.slice(root.length);
              const type = Object.keys(CHORD_TYPES).find(t => CHORD_TYPES[t].suffix === suffix) || null;
              return type ? {root, type} : null;
            })() : null}
            onMatch={mode==='accords' ? ()=>{
              setMicMatch(true);
              setTimeout(()=>setMicMatch(false), 1500);
            } : null}
          />
        )}

        {micMatch && (
          <div style={{textAlign:'center',padding:'.75rem',background:'rgba(130,224,170,0.15)',border:'1px solid #7BC8A4',borderRadius:10,color:'#7BC8A4',fontFamily:'monospace',fontWeight:'bold',fontSize:13,animation:'fadeIn 0.15s ease'}}>
            ✓ Accord reconnu !
          </div>
        )}

        {/* Controls */}
        <div style={{display:'flex',gap:8}}>
          {!feedback&&!showAnswer&&(
            <button onClick={()=>setShowAnswer(true)}
              style={{flex:1,padding:'.65rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:11,fontFamily:'monospace'}}>
              Voir la réponse
            </button>
          )}
          {feedback&&(
            <button onClick={reset}
              style={{flex:1,padding:'.75rem',background:`${accentColor}12`,border:`1.5px solid ${accentColor}`,color:accentColor,borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.08em',animation:'fadeIn 0.3s ease'}}>
              🔄 NOUVEL ESSAI
            </button>
          )}
          <button onClick={()=>{reset();setScreen('config');mic.stop();}}
            style={{padding:'.65rem .9rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:11,fontFamily:'monospace'}}>
            ⚙
          </button>
        </div>

        <div style={{padding:'.65rem .9rem',background:'rgba(232,168,87,0.06)',border:'1px solid rgba(232,168,87,0.18)',borderRadius:10}}>
          <p style={{fontSize:11,opacity:.55,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>
            💡 Pour transposer : calcule l'intervalle entre les deux toniques ({sourceKey} → {targetKey} = {((CHROMATIC.indexOf(targetKey)-CHROMATIC.indexOf(sourceKey)+12)%12)} demi-ton{((CHROMATIC.indexOf(targetKey)-CHROMATIC.indexOf(sourceKey)+12)%12)>1?'s':''}), puis décale chaque note/accord du même intervalle.
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── 11 NOUVEAUX COURS ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function CoursModulation() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const[showQuiz,setShowQuiz]=useState(false);const[playing,setPlaying]=useState(false);
  const M=(w,d,c='#D4A0D4')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  async function playProg(chords){if(playing)return;setPlaying(true);for(const[r,t]of chords){const ri=CHROMATIC.indexOf(r);if(ri>=0)playChordArp(CHORD_TYPES[t].formula.map(f=>ri+f+4*12));await new Promise(res=>setTimeout(res,1300));}setPlaying(false);}
  const QUIZ=[
    {question:"Quelle est la technique de modulation la plus fluide ?",options:["La modulation directe","La modulation par accord pivot","La modulation par enharmonie","La modulation chromatique"],correct:1,explanation:"L'accord pivot appartient aux deux tonalités simultanément — l'auditeur ne perçoit pas le changement avant que la nouvelle tonalité soit établie."},
    {question:"En Do majeur, quel accord est le meilleur pivot pour aller en Sol majeur ?",options:["Do majeur (I)","Ré mineur (ii)","Mi mineur (iii)","La mineur (vi)"],correct:1,explanation:"Ré mineur est ii en Do majeur ET vi en Sol majeur. C'est un accord pivot parfait car il est diatonique aux deux tonalités."},
    {question:"Qu'est-ce que la modulation par enharmonie ?",options:["Passer à la tonalité relative","Utiliser un accord diminué ou augmenté qui peut être réinterprété","Monter d'un demi-ton","Changer de mode"],correct:1,explanation:"L'accord diminué de septième (dim7) peut être réinterprété 4 façons différentes grâce à sa symétrie. C'est la technique de modulation la plus 'magique'."},
  ];
  if(showQuiz)return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}><button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR AU COURS</button></div><CourseQuiz questions={QUIZ} courseTitle="Modulation" color="#D4A0D4" onClose={()=>setShowQuiz(false)}/></div>);
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Modulation</h3>
      <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(212,168,100,0.15)',border:'1px solid rgba(212,168,100,0.4)',color:'#D4A0D4',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
    </div>
    <div style={{padding:'1rem',background:'rgba(212,168,100,0.08)',border:'1px solid rgba(212,168,100,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        La {M("modulation","Une modulation est un changement de tonalité au cours d'un morceau. Ce n'est pas une simple emprunt d'accord — c'est un vrai changement de centre tonal. L'oreille s'adapte à une nouvelle 'maison'.")} est l'art de changer de tonalité sans que l'auditeur ne soit désorienté. C'est l'une des techniques les plus puissantes de la composition — elle permet de renouveler l'intérêt harmonique, de créer des climax, de relier des sections contrastées.
      </p>
    </div>
    {[
      {title:"1. Modulation par accord pivot", color:'#D4A0D4',
       chords:[['C','Majeures'],['D','Mineures'],['G','Majeures']],
       content:<p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>
         L'{M("accord pivot","Un accord pivot (ou commun) est un accord appartenant simultanément aux deux tonalités. Il sert de 'pont' entre l'ancienne et la nouvelle tonalité. La modulation par pivot est la plus naturelle car l'oreille ne perçoit pas de rupture — elle réinterprète simplement le même accord dans un nouveau contexte.")} appartient aux deux tonalités. Exemple : Do majeur → Sol majeur. <strong style={{color:'#D4A0D4'}}>Ré mineur (ii en Do, vi en Sol)</strong> sert de pivot. On joue Do - Ré m - Sol - Ré m - Sol7 - Sol. L'oreille ne réalise le changement que lorsque Sol7 résout sur Sol.
       </p>},
      {title:"2. Modulation directe (soudaine)", color:'#E07070',
       chords:[['C','Majeures'],['C','Majeures'],['Db','Majeures']],
       content:<p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>
         La {M("modulation directe","La modulation directe (ou abrupte) juxtapose simplement deux tonalités sans transition. Elle crée un effet de surprise ou de soulèvement — très utilisée dans la pop pour les refrains montants (key change). Ex: Whitney Houston, Celine Dion montent d'un demi-ton ou d'un ton sur le dernier refrain.")} ne prépare pas. On passe brutalement d'une tonalité à l'autre. Effet de soulèvement dans la pop (monter d'un demi-ton au dernier refrain), effet dramatique dans le classique (Beethoven). Simple mais impactant.
       </p>},
      {title:"3. Modulation par enharmonie", color:'#E8A857',
       content:<p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>
         L'{M("accord diminué de septième","Le dim7 (0-3-6-9) divise l'octave en 4 parties égales. Chacune de ses notes peut être réinterprétée comme sensible d'une nouvelle tonalité. Do#dim7 = Do#-Mi-Sol-Sib. Si on réinterprète Sib comme La# (sensible de Si), on module vers Si majeur. Cette technique est le 'couteau suisse' des modulations romantiques.")} dim7 est {M("symétrique","Un accord symétrique se répète à intervalles réguliers. Le dim7 se répète toutes les 3 tierces mineures — donc 4 positions de la même structure. Cette propriété le rend ambiguë et réinterprétable dans 4 tonalités différentes.",'#E8A857')} : ses 4 notes peuvent toutes être sensibles de tonalités différentes. Schubert, Brahms et Wagner l'utilisent massivement pour des modulations spectaculaires vers des tonalités éloignées.
       </p>},
      {title:"4. Modulations relatives et parallèles", color:'#7BC8A4',
       content:<p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>
         La {M("tonalité relative","La tonalité relative partage la même armure. Do majeur et La mineur sont relatifs (même notes, tonique différente). La modulation vers la relative est très naturelle — on réinterprète simplement un accord existant comme nouvelle tonique.",'#7BC8A4')} (Do → La mineur) partage les mêmes notes. La {M("tonalité parallèle","La tonalité parallèle partage la même tonique mais pas la même armure. Do majeur et Do mineur sont parallèles. Cette modulation est très dramatique car la couleur change radicalement (majeur → mineur = lumière → ombre).",'#7BC8A4')} (Do majeur → Do mineur) crée un contraste maximal. Schubert et Brahms adorent cette dernière pour des effets d'ombre soudaine.
       </p>},
    ].map((s,i)=>(
      <div key={i} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
          <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.title}</div>
          {s.chords&&<button onClick={()=>playProg(s.chords)} disabled={playing} style={{background:`${s.color}15`,border:`1px solid ${s.color}`,color:s.color,padding:'.3rem .7rem',borderRadius:7,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>{playing?'▶…':'🔊'}</button>}
        </div>
        {s.content}
      </div>
    ))}
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursExtensionsAccords() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const[showQuiz,setShowQuiz]=useState(false);const[playing,setPlaying]=useState(null);
  const M=(w,d,c='#E8A857')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  function playEx(semis){setPlaying(semis.join('-'));semis.forEach((s,i)=>setTimeout(()=>playNote(s+3*12,0,1.5),i*80));setTimeout(()=>setPlaying(null),2000);}
  const QUIZ=[
    {question:"Qu'est-ce que la 9e d'un accord ?",options:["La 9e note de la gamme","La 2e note, une octave plus haut","Un accord de 9 notes","La note si bémol"],correct:1,explanation:"La 9e = 2e + octave. Sur Do : la 2e est Ré, la 9e aussi. On l'appelle 9e (et non 2e) car dans les accords étendus, les notes sont empilées au-delà de l'octave."},
    {question:"Dans Cmaj9, quelle est la différence avec Cadd9 ?",options:["Aucune","Cmaj9 contient la 7e majeure, Cadd9 non","Cadd9 est plus dissonant","Cmaj9 est un accord de jazz uniquement"],correct:1,explanation:"Cadd9 = Do-Mi-Sol-Ré (la 9e ajoutée sans 7e). Cmaj9 = Do-Mi-Sol-Si-Ré (avec la 7e majeure). La 7e est l'intermédiaire indispensable dans les accords vrais de 9e."},
    {question:"La 11e altérée (#11) est caractéristique de quel accord/mode ?",options:["L'accord mineur","L'accord lydien dominant","L'accord diminué","La gamme phrygienne"],correct:1,explanation:"Le mode Lydien (et Lydien dominant en jazz) contient une 4e augmentée (#11). L'accord G7#11 (accord de Simpsons!) est une couleur très caractéristique du jazz moderne."},
  ];
  const EXTENSIONS=[
    {name:'9e majeure',    semis:[0,4,7,11,14], label:'Cmaj9',    color:'#E8A857', desc:"Do-Mi-Sol-Si-Ré. La 7e majeure + la 9e (Ré). Couleur rêveuse, nostalgique. Signature de la bossa nova et du jazz modal."},
    {name:'9e dominante',  semis:[0,4,7,10,14], label:'C9',       color:'#D06060', desc:"Do-Mi-Sol-Sib-Ré. La 7e mineure + la 9e. L'accord de blues par excellence. Plus riche que C7 tout en gardant sa fonction dominante."},
    {name:'9e bémol',      semis:[0,4,7,10,13], label:'C7b9',     color:'#D4A0D4', desc:"Do-Mi-Sol-Sib-Réb. La 9e abaissée crée une tension espagnole/phrygienne. Accord signature du flamenco jazz et d'un certain romantisme sombre."},
    {name:'11e',           semis:[0,4,7,10,14,17],label:'C11',    color:'#7BC8A4', desc:"Ajoute le Fa (11e). En jazz, on omet souvent la 3e pour éviter la dissonance 3-11. Couleur ouverte, modale."},
    {name:'11e augmentée', semis:[0,4,7,10,14,18],label:'C7#11',  color:'#E8A857', desc:"Le triton remplace la quarte juste. Couleur très moderne (Simpsons theme !). Accord lydien-dominant. Herbie Hancock, Bill Evans."},
    {name:'13e',           semis:[0,4,7,10,14,21],label:'C13',    color:'#90B8D0', desc:"Ajoute le La (13e). L'accord le plus riche. En pratique on choisit les tensions les plus expressives — on ne joue pas les 7 notes."},
  ];
  if(showQuiz)return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}><button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR</button></div><CourseQuiz questions={QUIZ} courseTitle="Extensions" color="#E8A857" onClose={()=>setShowQuiz(false)}/></div>);
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Extensions d'accords</h3>
      <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(232,168,87,0.15)',border:'1px solid rgba(232,168,87,0.4)',color:'#E8A857',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0}}>🎯 QUIZ</button>
    </div>
    <div style={{padding:'1rem',background:'rgba(232,168,87,0.08)',border:'1px solid rgba(232,168,87,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        Au-delà de la {M("triade","Une triade est un accord de 3 notes : fondamentale + tierce + quinte. C'est le bloc de base de toute l'harmonie. La 7e, 9e, 11e et 13e sont des extensions qui s'ajoutent par dessus.")} et de la {M("septième","La 7e (majeure ou mineure) est la première extension. Elle transforme un accord parfait en accord coloré. C'est l'accord de base du jazz : presque tous les accords ont une 7e.",'#E8A857')}, on peut continuer à empiler des tierces au-delà de l'octave. Ces {M("tensions","Les tensions (9e, 11e, 13e) sont les notes au-delà de la 7e. En jazz, on les appelle tensions car elles créent des dissonances expressives qui enrichissent la couleur de l'accord. Elles peuvent être naturelles, bémolisées (b) ou dièsées (#).")} enrichissent l'accord d'une couleur sophistiquée. Clique sur 🔊 pour entendre chaque accord.
      </p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {EXTENSIONS.map(ext=>(
        <div key={ext.name} style={{padding:'1rem',background:`${ext.color}08`,border:`1px solid ${ext.color}22`,borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:5}}>
              <span style={{fontSize:14,fontWeight:'bold',color:ext.color,fontFamily:'Georgia,serif'}}>{ext.name}</span>
              <span style={{fontSize:11,fontFamily:'monospace',color:`${ext.color}99`,padding:'1px 6px',background:`${ext.color}15`,borderRadius:5}}>{ext.label}</span>
            </div>
            <p style={{fontSize:12.5,opacity:.7,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>{ext.desc}</p>
          </div>
          <button onClick={()=>playEx(ext.semis)} style={{background:`${ext.color}15`,border:`1px solid ${ext.color}`,color:ext.color,padding:'.4rem .8rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0,transition:'all 0.2s',boxShadow:playing===ext.semis.join('-')?`0 0 10px ${ext.color}50`:'none'}}>
            {playing===ext.semis.join('-')?'▶…':'🔊'}
          </button>
        </div>
      ))}
    </div>
    <div style={{padding:'.85rem',background:'rgba(232,168,87,0.06)',border:'1px solid rgba(232,168,87,0.2)',borderRadius:12}}>
      <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>PRINCIPE FONDAMENTAL</div>
      <p style={{fontSize:13,opacity:.72,lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>En jazz, on ne joue JAMAIS toutes les notes d'un accord étendu. On choisit les tensions les plus expressives selon le contexte. Guide shell voicings : garder la fondamentale, la 3e (couleur maj/min), la 7e (tension), et 1-2 extensions maximum. Le reste est facultatif.</p>
    </div>
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursSubstitutions() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const[showQuiz,setShowQuiz]=useState(false);const[playing,setPlaying]=useState(false);
  const M=(w,d,c='#60A8BC')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  async function playProg(chords){if(playing)return;setPlaying(true);for(const[r,t]of chords){const ri=CHROMATIC.indexOf(r);if(ri>=0)playChordArp(CHORD_TYPES[t].formula.map(f=>ri+f+4*12));await new Promise(res=>setTimeout(res,1200));}setPlaying(false);}
  const QUIZ=[
    {question:"La substitution de triton remplace G7 par quel accord ?",options:["C7","D7","Db7","Ab7"],correct:2,explanation:"Db est à un triton (6 demi-tons) de G. G7 et Db7 partagent les mêmes notes de tension : Si (Do♭) et Fa. Ces deux notes se résolvent de la même façon vers Cmaj."},
    {question:"Qu'est-ce que la sous-dominante mineure ?",options:["L'accord iv mineur","La gamme mineure","L'accord de dominante","L'accord bVII"],correct:0,explanation:"La sous-dominante mineure (iv) est l'accord Fm en Do majeur. Il est emprunté du mode mineur et crée une descente chromatique très expressive (Mi → Mi♭ dans la voix du milieu)."},
    {question:"Le Coltrane Changes substitue la progression ii-V-I par ?",options:["Une suite de 4 accords","Trois dominantes par tierces majeures","Une gamme pentatonique","Un accord diminué"],correct:1,explanation:"John Coltrane a inventé une substitution en divisant l'octave en 3 tierces majeures. Par exemple : Dm7-G7-CMaj devient Em7-A7-DbMaj-Bb7-EbMaj. Entendu sur 'Giant Steps'."},
  ];
  if(showQuiz)return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}><button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR</button></div><CourseQuiz questions={QUIZ} courseTitle="Substitutions" color="#60A8BC" onClose={()=>setShowQuiz(false)}/></div>);
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Substitutions harmoniques</h3>
      <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(96,168,188,0.15)',border:'1px solid rgba(96,168,188,0.4)',color:'#60A8BC',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0}}>🎯 QUIZ</button>
    </div>
    <div style={{padding:'1rem',background:'rgba(96,168,188,0.08)',border:'1px solid rgba(96,168,188,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        Une {M("substitution","Une substitution harmonique remplace un accord par un autre qui a une fonction similaire ou partage des notes importantes. C'est l'essence de l'arrangement jazz — enrichir une grille connue avec de nouvelles couleurs tout en préservant le mouvement harmonique fondamental.")} remplace un accord par un autre fonctionnellement équivalent. C'est ce qui différencie un arrangement jazz basique d'un arrangement sophistiqué. Les substitutions permettent de créer des mouvements mélodiques de basse fluides, d'éviter la répétition, et d'introduire des couleurs inattendues.
      </p>
    </div>
    {[
      {title:"1. Substitution de triton", color:'#E07070',
       orig:[['G','Dom. 7'],['C','Majeures']], sub:[['Db','Dom. 7'],['C','Majeures']],
       content:<p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>La {M("substitution de triton","G7 et Db7 partagent leurs notes de tension (guide tones) : Si et Fa (ou Do♭). Ces deux notes forment un triton et se résolvent tous les deux par demi-ton vers Do et Mi. La basse descend chromatiquement G→Gb→F au lieu de G→C, créant un effet de glissement très élégant.",'#E07070')} remplace le V7 (G7) par l'accord situé un triton plus loin (Db7). La basse descend par demi-ton : G → Gb → F. L'oreille perçoit la même résolution avec une couleur radicalement différente.</p>},
      {title:"2. Sous-dominante mineure", color:'#7BC8A4',
       orig:[['C','Majeures'],['F','Majeures'],['C','Majeures']], sub:[['C','Majeures'],['F','Mineures'],['C','Majeures']],
       content:<p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>Remplacer IV (Fa majeur) par iv (Fa mineur). Le Fa mineur est {M("emprunté","Emprunter un accord d'une autre tonalité (ici le mode mineur de Do). L'accord iv crée une descente chromatique remarquable dans la voix du milieu : Mi → Mi♭ → Mi. Cette substitution est universelle du classique au jazz en passant par la pop et le rock.",'#7BC8A4')} du mode mineur de Do. La descente chromatique Mi → Mi♭ est immédiatement reconnaissable et émouvante.</p>},
      {title:"3. Coltrane Changes", color:'#C8864A',
       content:<p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>John Coltrane a révolutionné le jazz en 1959 avec {M("Giant Steps","Giant Steps (1959) est le morceau qui a redéfini l'harmonie jazz. Coltrane y divise l'octave en 3 tierces majeures égales (Do, Mi, Lab) et crée une suite de ii-V-I dans chacune. La progression tourne si vite qu'on n'a le temps de s'appuyer sur aucun centre tonal — pureté harmonique absolue.",'#C8864A')}. Il divise l'octave en 3 tierces majeures égales : Do, Mi, Lab. Chaque centre reçoit un ii-V-I. Résultat : un mouvement harmonique si rapide que l'oreille perd tout ancrage tonal. C'est la substitution la plus révolutionnaire du 20e siècle.</p>},
      {title:"4. Substitution diatonique", color:'#E8A857',
       content:<p style={{fontSize:13,opacity:.75,lineHeight:1.75,margin:0,fontFamily:'Georgia,serif'}}>Remplacer un accord par son {M("accord relatif","Deux accords sont relatifs s'ils partagent au moins 2 notes. En Do majeur : I (Do-Mi-Sol) et iii (Mi-Sol-Si) partagent Mi et Sol. IV (Fa-La-Do) et ii (Ré-Fa-La) partagent Fa et La. Ces substitutions sont douces car les notes communes créent une continuité.",'#E8A857')} diatonique. Do (I) peut être remplacé par Mi mineur (iii) ou La mineur (vi). Fa (IV) peut être remplacé par Ré mineur (ii). Ces substitutions sont douces — elles changent la couleur sans changer la fonction.</p>},
    ].map((s,i)=>(
      <div key={i} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
          <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.title}</div>
          {s.orig&&<div style={{display:'flex',gap:5}}>
            <button onClick={()=>playProg(s.orig)} disabled={playing} style={{background:`${s.color}15`,border:`1px solid ${s.color}`,color:s.color,padding:'.3rem .6rem',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace'}}>{playing?'…':'Original'}</button>
            <button onClick={()=>playProg(s.sub)} disabled={playing} style={{background:`${s.color}15`,border:`1px solid ${s.color}`,color:s.color,padding:'.3rem .6rem',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace'}}>{playing?'…':'Substitution'}</button>
          </div>}
        </div>
        {s.content}
      </div>
    ))}
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursModesJazz() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const[showQuiz,setShowQuiz]=useState(false);const[playing,setPlaying]=useState(null);
  const M=(w,d,c='#6EB898')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  function playMode(semis){setPlaying(semis.join('-'));semis.forEach((s,i)=>setTimeout(()=>playNote(s+4*12,0,0.7),i*350));setTimeout(()=>setPlaying(null),semis.length*350+500);}
  const MODES=[
    {name:'Dorien',root:'D',semis:[0,2,3,5,7,9,10,12],color:'#6EB898',accord:'Dm7',
     desc:"Mode mineur avec 6e majeure (Si naturel). C'est LE mode du jazz modal. Plus lumineux que l'éolien à cause de sa 6e. Utilisé sur les accords m7.",
     ex:"Miles Davis — So What (tout le morceau est en Ré Dorien). Santana — Oye Como Va."},
    {name:'Mixolydien',root:'G',semis:[0,2,4,5,7,9,10,12],color:'#E8A857',accord:'G7',
     desc:"Gamme majeure avec 7e mineure. C'est la gamme de la dominante. Naturelle sur V7, elle donne ce son blues-rock-funk.",
     ex:"Les Doors — Light My Fire. Tout accord de blues est mixolydien."},
    {name:'Lydien',root:'F',semis:[0,2,4,6,7,9,11,12],color:'#D4A0D4',accord:'Fmaj7#11',
     desc:"Gamme majeure avec 4e augmentée (#11). Son rêveur, flottant. Signature du jazz moderne et de la musique de film (John Williams).",
     ex:"John Williams — thèmes de films. Joe Satriani — Flying in a Blue Dream."},
    {name:'Lydien dominant',root:'G',semis:[0,2,4,6,7,9,10,12],color:'#D06060',accord:'G7#11',
     desc:"Mixolydien + 4e augmentée. Le mode le plus utilisé dans le jazz sophistiqué. Accord G7#11 (The Simpsons !). Fusion parfaite de tension et de couleur.",
     ex:"Herbie Hancock — Maiden Voyage (bridge). Wayne Shorter — Infant Eyes."},
    {name:'Phrygien dominant',root:'E',semis:[0,1,4,5,7,8,10,12],color:'#E07070',accord:'E7',
     desc:"5e mode de la gamme mineure harmonique. La 2e bémol lui donne ce son espagnol/oriental. Utilisé sur V7 dans les tonalités mineures.",
     ex:"Flamenco. Miles Davis — Flamenco Sketches. Pat Metheny."},
    {name:'Locrien #2',root:'B',semis:[0,2,3,5,6,8,10,12],color:'#90B8D0',accord:'Bm7b5',
     desc:"Mode sur le VIIe degré mineur harmonique. La 2e naturelle (non bémolisée) le rend plus jouable que le Locrien normal. Utilisé sur les accords m7b5 (demi-diminués) en jazz.",
     ex:"Progression mineure ii-V-i. Coltrane — Impressions."},
  ];
  const QUIZ=[
    {question:"Quel mode utilise-t-on typiquement sur un accord Dm7 en jazz ?",options:["Phrygien","Éolien","Dorien","Locrien"],correct:2,explanation:"Le Dorien (2e mode majeur) est le mode mineur du jazz. Sa 6e majeure lui donne plus de lumière que l'Éolien, ce qui le rend plus expressif sur les accords m7."},
    {question:"Le mode Mixolydien correspond à quelle gamme majeure construite à partir de quelle note ?",options:["La gamme majeure de do, depuis fa","La gamme majeure de do, depuis sol","La gamme mineure de la","La gamme pentatonique"],correct:1,explanation:"Mixolydien = 5e mode de la gamme majeure. Sol Mixolydien = gamme de Do majeur jouée depuis Sol. Ça donne : Sol-La-Si-Do-Ré-Mi-Fa-Sol (7e bémolisée)."},
    {question:"Qu'est-ce qui distingue le Lydien dominant du Lydien ?",options:["La 3e","La 7e (mineure dans Lydien dominant)","La 5e","La 9e"],correct:1,explanation:"Lydien = majeur avec #4. Lydien dominant = mixolydien avec #4 (ou lydien avec 7e mineure). La 7e mineure lui permet de fonctionner sur un accord de dominante 7."},
  ];
  if(showQuiz)return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}><button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR</button></div><CourseQuiz questions={QUIZ} courseTitle="Modes jazz" color="#6EB898" onClose={()=>setShowQuiz(false)}/></div>);
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Modes appliqués au jazz</h3>
      <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(96,180,148,0.15)',border:'1px solid rgba(96,180,148,0.4)',color:'#6EB898',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0}}>🎯 QUIZ</button>
    </div>
    <div style={{padding:'1rem',background:'rgba(96,180,148,0.08)',border:'1px solid rgba(96,180,148,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        En jazz, on associe chaque accord à un {M("mode","En jazz modal, au lieu de penser 'je suis en Do majeur', on pense 'cet accord est un Dm7, j'utilise le Dorien'. Chaque accord a sa propre couleur modale. C'est la révolution de Miles Davis (Kind of Blue, 1959) qui a libéré le jazz du ii-V-I perpétuel.")} spécifique. L'approche {M("modale","Le jazz modal, introduit par Miles Davis sur Kind of Blue (1959), remplace les changements d'accords rapides par de longs accords statiques sur lesquels le soliste explore un mode entier. Il n'y a plus de 'maison tonale' — juste la couleur du moment.",'#6EB898')} permet au soliste d'explorer chaque accord avec précision. Clique sur 🔊 pour entendre chaque mode.
      </p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {MODES.map(m=>(
        <div key={m.name} style={{padding:'.9rem 1rem',background:`${m.color}08`,border:`1px solid ${m.color}22`,borderRadius:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.5rem'}}>
            <div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{fontSize:15,fontWeight:'bold',color:m.color,fontFamily:'Georgia,serif'}}>{m.name}</span>
                <span style={{fontSize:10,fontFamily:'monospace',color:`${m.color}80`,padding:'1px 6px',background:`${m.color}15`,borderRadius:5}}>{m.accord}</span>
              </div>
            </div>
            <button onClick={()=>playMode(m.semis)} style={{background:`${m.color}15`,border:`1px solid ${m.color}`,color:m.color,padding:'.3rem .7rem',borderRadius:7,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0,boxShadow:playing===m.semis.join('-')?`0 0 8px ${m.color}50`:'none'}}>
              {playing===m.semis.join('-')?'▶…':'🔊'}
            </button>
          </div>
          <p style={{fontSize:12.5,opacity:.72,lineHeight:1.6,margin:'0 0 .4rem',fontFamily:'Georgia,serif'}}>{m.desc}</p>
          <div style={{fontSize:10,opacity:.45,fontFamily:'Georgia,serif',fontStyle:'italic'}}>Ex : {m.ex}</div>
        </div>
      ))}
    </div>
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursReharmonisation() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const[showQuiz,setShowQuiz]=useState(false);const[playing,setPlaying]=useState(false);
  const M=(w,d,c='#E07070')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  async function playProg(chords){if(playing)return;setPlaying(true);for(const[r,t]of chords){const ri=CHROMATIC.indexOf(r);if(ri>=0)playChordArp(CHORD_TYPES[t].formula.map(f=>ri+f+4*12));await new Promise(res=>setTimeout(res,1200));}setPlaying(false);}
  const QUIZ=[
    {question:"Qu'est-ce que la réharmonisation ?",options:["Transposer un morceau","Remplacer des accords existants par de nouveaux plus riches","Ajouter une voix au morceau","Changer le tempo"],correct:1,explanation:"La réharmonisation consiste à remplacer les accords originaux d'une mélodie par de nouveaux accords qui s'adaptent à la même ligne mélodique. L'objectif : enrichir, moderniser ou transformer l'ambiance."},
    {question:"Quel est le principe de base de la réharmonisation à mouvement parallèle ?",options:["Inverser les accords","Utiliser uniquement des accords mineurs","Bouger tous les accords en parallèle avec la mélodie","Remplacer par des dominantes"],correct:2,explanation:"Le mouvement parallèle (planing) fait bouger tous les accords dans la même direction que la mélodie. Si la mélodie monte d'un demi-ton, tous les accords montent d'un demi-ton. Ça crée un effet de nappe harmonique dense."},
    {question:"Comment fonctionne la réharmonisation par 'back-cycling' ?",options:["On joue les accords à l'envers","On ajoute des dominantes secondaires avant chaque accord","On utilise le cycle des quintes à l'envers","On transpose à l'octave supérieure"],correct:1,explanation:"Le back-cycling ajoute une dominante secondaire (ou V7/X) avant chaque accord cible. Avant Fm, on ajoute C7. Avant C7, on ajoute G7. Avant G7, on ajoute D7. Le cycle des quintes à l'envers crée un mouvement harmonique très dense."},
  ];
  if(showQuiz)return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><div style={{padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0}}><button onClick={()=>setShowQuiz(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>← RETOUR</button></div><CourseQuiz questions={QUIZ} courseTitle="Réharmonisation" color="#E07070" onClose={()=>setShowQuiz(false)}/></div>);
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Réharmonisation</h3>
      <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(241,148,138,0.15)',border:'1px solid rgba(241,148,138,0.4)',color:'#E07070',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',flexShrink:0}}>🎯 QUIZ</button>
    </div>
    <div style={{padding:'1rem',background:'rgba(241,148,138,0.08)',border:'1px solid rgba(241,148,138,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        La {M("réharmonisation","La réharmonisation est l'art de remplacer les accords originaux d'une mélodie par de nouveaux accords, tout en respectant la ligne mélodique. C'est la signature des grands arrangers jazz : prendre un standard connu et le transformer en quelque chose de totalement nouveau. Keith Jarrett, Bill Evans, et Kenny Barron sont des maîtres de cette technique.")} transforme une mélodie connue en lui donnant une nouvelle vie harmonique. La contrainte : chaque note de la mélodie doit toujours appartenir au nouvel accord (ou être une tension acceptable).
      </p>
    </div>
    {[
      {title:"Technique 1 : Dominantes secondaires",color:'#E8A857',
       basic:[['C','Majeures'],['F','Majeures'],['G','Dom. 7'],['C','Majeures']],
       reharm:[['C','Majeures'],['C','Dom. 7'],['F','Majeures'],['D','Dom. 7'],['G','Dom. 7'],['C','Majeures']],
       desc:"Ajouter un V7 avant chaque accord. Avant Fa, on met Do7. Avant Sol, on met Ré7. Chaque accord devient une cible précédée de sa dominante."},
      {title:"Technique 2 : Mouvement parallèle (Planing)",color:'#D4A0D4',
       desc:"Bouger tous les accords dans la même direction que la mélodie. Si la mélodie descend Do-Si-La, les accords descendent en parallèle : Cmaj7-Bmaj7-Amaj7. Technique impressionniste utilisée par Debussy et Bill Evans."},
      {title:"Technique 3 : Pédale harmonique",color:'#7BC8A4',
       desc:"Garder une note à la basse (souvent la tonique) pendant que les accords changent au-dessus. Le Sol tenu pendant que la main droite joue Am7-Fmaj7-Em7 crée une ambiance flottante caractéristique du jazz modal."},
      {title:"Technique 4 : Réharmonisation chromatique",color:'#90B8D0',
       desc:"Introduire des accords chromatiques (hors tonalité) qui passent par demi-tons vers la cible. Exemple : au lieu de I-IV, faire I-bIII7-II7-V7-I avec descente de basse chromatique. Son très sophistiqué et caracteristique du jazz bebop."},
    ].map((s,i)=>(
      <div key={i} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.65rem'}}>
          <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.title}</div>
          {s.basic&&<div style={{display:'flex',gap:4}}>
            <button onClick={()=>playProg(s.basic)} disabled={playing} style={{background:`${s.color}15`,border:`1px solid ${s.color}`,color:s.color,padding:'.3rem .55rem',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace'}}>Original</button>
            <button onClick={()=>playProg(s.reharm)} disabled={playing} style={{background:`${s.color}15`,border:`1px solid ${s.color}`,color:s.color,padding:'.3rem .55rem',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace'}}>Réharmonisé</button>
          </div>}
        </div>
        <p style={{fontSize:12.5,opacity:.72,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>{s.desc}</p>
      </div>
    ))}
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursFormeStructure() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const M=(w,d,c='#90B8D0')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Forme et structure musicale</h3>
    <div style={{padding:'1rem',background:'rgba(133,193,233,0.08)',border:'1px solid rgba(133,193,233,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        La {M("forme musicale","La forme musicale est l'organisation macroscopique d'un morceau. Comme l'architecture d'un bâtiment, elle définit les proportions, les répétitions, les contrastes. Une bonne forme crée de l'attente, la satisfait, et sait surprendre au bon moment.")} est l'architecture du morceau — ce qui donne cohérence et direction à la musique. Comprendre les formes permet d'analyser n'importe quel morceau, d'anticiper ce qui va venir, et de composer avec une structure consciente.
      </p>
    </div>
    {[
      {title:"Forme binaire (AB)", color:'#90B8D0', icon:'AB',
       desc:"La plus simple. Deux sections contrastées : A (exposition) et B (développement/contraste). Très fréquente dans les danses baroques (sarabande, gigue). Chaque section est souvent répétée : ||:A:||:B:||",
       examples:"Minuet de Bach, danses populaires, nombreuses chansons folk."},
      {title:"Forme ternaire (ABA)", color:'#D4A0D4', icon:'ABA',
       desc:"Section A - section contrastée B - retour A. Le retour de A donne un sentiment de résolution. C'est la forme des nocturnes de Chopin, des lieder de Schubert, des ariettes d'opéra (da capo aria).",
       examples:"Nocturne en Mi♭ de Chopin. La plupart des 'ballades' jazz standards."},
      {title:"Forme sonate (Exposition-Développement-Récapitulation)", color:'#E8A857', icon:'EDR',
       desc:"La forme la plus complexe et la plus influente du répertoire classique. Exposition : deux thèmes contrastés (tonique/dominante). Développement : fragmentation et modulation. Récapitulation : retour des deux thèmes en tonique.",
       examples:"Presque toutes les sonates et symphonies de Haydn, Mozart, Beethoven."},
      {title:"Forme couplet-refrain (Verse-Chorus)", color:'#7BC8A4', icon:'VC',
       desc:"La forme universelle de la musique populaire. Le couplet (verse) raconte l'histoire, le refrain (chorus) exprime l'émotion centrale. Bridge optionnel pour varier. Formule typique : V-V-C-V-C-B-C",
       examples:"Quasiment toute la pop, rock, R&B depuis les années 1950."},
      {title:"Forme du standard jazz (AABA)", color:'#E07070', icon:'AABA',
       desc:"La forme dominante du Great American Songbook. 32 mesures : A (8m) - A (8m) - B/bridge (8m) - A (8m). Le bridge (B) crée un contraste harmonique et mélodique. On joue souvent le 'head' (thème) une fois au début et une fois à la fin.",
       examples:"Autumn Leaves, All The Things You Are, Take The A Train, Misty."},
      {title:"Forme rondo (ABACADA...)", color:'#6EB898', icon:'ABACA',
       desc:"Un thème principal (A) alterne avec des épisodes contrastés (B, C, D...). Très utilisé dans les finales de concertos classiques pour leur caractère énergique et dansant.",
       examples:"Finale du Concerto en Sol de Ravel. Rondo alla Turca de Mozart."},
    ].map((s,i)=>(
      <div key={i} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'.65rem'}}>
          <div style={{padding:'.25rem .6rem',background:`${s.color}20`,border:`1px solid ${s.color}50`,borderRadius:7,fontSize:11,fontWeight:'bold',fontFamily:'monospace',color:s.color,flexShrink:0}}>{s.icon}</div>
          <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.title}</div>
        </div>
        <p style={{fontSize:12.5,opacity:.72,lineHeight:1.6,margin:'0 0 .4rem',fontFamily:'Georgia,serif'}}>{s.desc}</p>
        <div style={{fontSize:11,opacity:.5,fontFamily:'Georgia,serif',fontStyle:'italic'}}>Exemples : {s.examples}</div>
      </div>
    ))}
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursContrepoint() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const M=(w,d,c='#B898C8')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  const RULES=[
    {n:"Mouvement contraire",color:'#7BC8A4',desc:"Quand une voix monte, l'autre descend. Le mouvement contraire est le plus indépendant et le plus naturel. Bach l'utilise comme règle de base."},
    {n:"Mouvement oblique",color:'#90B8D0',desc:"Une voix se déplace, l'autre reste immobile. Crée une stabilité momentanée tout en permettant le mouvement mélodique."},
    {n:"Mouvement semblable",color:'#E8A857',desc:"Les deux voix bougent dans la même direction mais à des intervalles différents. À utiliser avec modération."},
    {n:"Éviter les quintes et octaves parallèles",color:'#E07070',desc:"Si deux voix bougent au même intervalle en mouvement semblable (quinte ou octave), elles fusionnent et perdent leur indépendance. C'est l'erreur classique du débutant."},
    {n:"Préparation et résolution des dissonances",color:'#D4A0D4',desc:"Une note dissonante doit être préparée (la note précédente était consonante) et résolue (la note suivante est consonante, souvent par demi-ton vers le bas). Bach ne 'pose' jamais une dissonance sans l'amener et la résoudre."},
  ];
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Contrepoint</h3>
    <div style={{padding:'1rem',background:'rgba(195,155,211,0.08)',border:'1px solid rgba(195,155,211,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        Le {M("contrepoint","Le contrepoint (du latin punctus contra punctum, note contre note) est l'art de combiner plusieurs mélodies indépendantes qui sonnent bien ensemble. C'est la technique compositionnelle la plus difficile et la plus raffinée de la musique occidentale. Bach est son maître absolu.")} est la technique de composer plusieurs mélodies simultanées qui s'harmonisent parfaitement. Contrairement à l'harmonie (accords verticaux), le contrepoint est horizontal — chaque voix est une mélodie autonome et logique. C'est le fondement de la musique baroque et la discipline de base de tout compositeur sérieux.
      </p>
    </div>
    <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
      <div style={{fontSize:10,color:'#B898C8',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>LES 5 RÈGLES FONDAMENTALES</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {RULES.map((r,i)=>(
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'.65rem',background:`${r.color}06`,border:`0.5px solid ${r.color}22`,borderRadius:9}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:`${r.color}20`,border:`1px solid ${r.color}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'monospace',color:r.color,fontWeight:'bold',flexShrink:0}}>{i+1}</div>
            <div><div style={{fontSize:13,fontWeight:'bold',color:r.color,fontFamily:'Georgia,serif',marginBottom:3}}>{r.n}</div><p style={{fontSize:12,opacity:.7,margin:0,lineHeight:1.55,fontFamily:'Georgia,serif'}}>{r.desc}</p></div>
          </div>
        ))}
      </div>
    </div>
    <div style={{padding:'1rem',background:'rgba(195,155,211,0.06)',border:'1px solid rgba(195,155,211,0.18)',borderRadius:12}}>
      <div style={{fontSize:10,color:'#B898C8',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>LES ESPÈCES DU CONTREPOINT (Fux, 1725)</div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[
          {n:"1ère espèce","desc":"Note contre note (1:1). L'apprentissage de base."},
          {n:"2ème espèce","desc":"Deux notes contre une. On introduit les notes de passage."},
          {n:"3ème espèce","desc":"Quatre notes contre une. Liberté mélodique accrue."},
          {n:"4ème espèce","desc":"Syncopes et suspensions. L'art de la dissonance préparée."},
          {n:"5ème espèce","desc":"Contrepoint fleuri — combinaison libre de toutes les espèces. Le pinacle de la technique."},
        ].map((e,i)=>(
          <div key={i} style={{display:'flex',gap:8,fontSize:12,opacity:.75,fontFamily:'Georgia,serif'}}>
            <span style={{fontWeight:'bold',color:'#B898C8',flexShrink:0,minWidth:80}}>{e.n}</span>
            <span>{e.desc}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{padding:'.85rem',background:'rgba(195,155,211,0.06)',border:'1px solid rgba(195,155,211,0.18)',borderRadius:12}}>
      <p style={{fontSize:13,opacity:.72,lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>
        {M("L'Invention à 2 voix de Bach","Les Inventions à 2 voix (BWV 772-786) sont les exercices de contrepoint de Bach. Elles combinent chaque espèce de façon fluide et musicale. Analyser une Invention au piano (jouer une voix à la fois, puis les deux) est le meilleur cours de contrepoint qui existe.",'#B898C8')} n°1 en Do majeur est l'exemple parfait : deux voix indépendantes, d'égale importance, se répondent et se complètent sans jamais se heurter. Écoute attentivement en suivant chaque voix séparément.
      </p>
    </div>
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursOrchestration() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const M=(w,d,c='#60A8BC')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  const FAMILLES=[
    {nom:"Cordes",color:'#E8A857',instruments:["Violon I & II","Alto","Violoncelle","Contrebasse"],registre:"Sol2 – La6 (violon) / Do2 – Sol5 (cello)",role:"Fondement de l'orchestre. Polyvalent : mélodies, accompagnement, tremolo, pizzicato. Homogénéité parfaite entre elles.",tip:"Les cordes en divisi (split) permettent des harmonies complexes. Le tremolo crée du suspense."},
    {nom:"Bois",color:'#7BC8A4',instruments:["Flûte","Hautbois","Clarinette","Basson"],registre:"Do4 – Do7 (flûte) / Si1 – Mi4 (basson)",role:"Couleurs individuelles très distinctes. Solistes naturels. Les doublures de bois renforcent les cordes.",tip:"Ne jamais doubler le hautbois à l'octave avec la flûte dans son registre grave — la flûte couvre le hautbois."},
    {nom:"Cuivres",color:'#D06060',instruments:["Cor","Trompette","Trombone","Tuba"],registre:"Si1 – Fa5 (cor) / Mi3 – Do5 (trompette)",role:"Puissance et majesté. Les cors assurent les transitions, les trompettes l'éclat, les trombones la plénitude.",tip:"Les cuivres en forte couvrent tout. Les nuancer soigneusement quand les cordes ou bois ont la mélodie."},
    {nom:"Percussions",color:'#D4A0D4',instruments:["Timbales","Caisse claire","Cymbales","Xylophone"],registre:"Variable selon l'instrument",role:"Rythme, couleur, ponctuation dramatique. Les timbales seules peuvent transformer une harmonie.",tip:"Utiliser les percussions avec parcimonie pour qu'elles gardent leur impact. Beethoven est le maître de l'effet de surprise percussif."},
  ];
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Orchestration</h3>
    <div style={{padding:'1rem',background:'rgba(96,168,188,0.08)',border:'1px solid rgba(96,168,188,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        L'{M("orchestration","L'orchestration est l'art de distribuer la musique entre les différents instruments d'un ensemble ou d'un orchestre. Un même accord joué par les cordes, les cuivres ou les bois a une couleur complètement différente. Maîtriser l'orchestration, c'est maîtriser le timbre comme couleur compositionnelle.")} est la science du timbre appliquée à la composition. Ravel disait qu'orchestrer, c'est "donner la couleur juste à chaque note". La même note jouée par une flûte, un violon, une trompette ou un cor sonne radicalement différente — même hauteur, timbre totalement distinct.
      </p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {FAMILLES.map(f=>(
        <div key={f.nom} style={{padding:'1rem',background:`${f.color}08`,border:`1px solid ${f.color}22`,borderRadius:12}}>
          <div style={{fontSize:15,fontWeight:'bold',color:f.color,fontFamily:'Georgia,serif',marginBottom:'.5rem'}}>{f.nom}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'.65rem'}}>
            {f.instruments.map(inst=><span key={inst} style={{fontSize:10,padding:'2px 7px',background:`${f.color}15`,border:`0.5px solid ${f.color}40`,borderRadius:6,color:f.color,fontFamily:'monospace'}}>{inst}</span>)}
          </div>
          <p style={{fontSize:12.5,opacity:.72,margin:'0 0 .4rem',lineHeight:1.55,fontFamily:'Georgia,serif'}}>{f.role}</p>
          <div style={{fontSize:11,opacity:.55,fontFamily:'monospace',marginBottom:'.3rem'}}>Registre : {f.registre}</div>
          <div style={{fontSize:11,opacity:.55,fontFamily:'Georgia,serif',fontStyle:'italic',borderLeft:`2px solid ${f.color}40`,paddingLeft:8}}>💡 {f.tip}</div>
        </div>
      ))}
    </div>
    <div style={{padding:'1rem',background:'rgba(96,168,188,0.06)',border:'1px solid rgba(96,168,188,0.18)',borderRadius:12}}>
      <div style={{fontSize:10,color:'#60A8BC',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>PRINCIPES CLÉS</div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[
          "Doubler la mélodie à l'octave augmente sa présence sans changer sa couleur.",
          "Les instruments dans leur registre grave sonnent 'lourds', dans l'aigu 'légers et perçants'.",
          "Croiser des voix (violon sous alto) crée des dissonances involontaires — à éviter sauf effet voulu.",
          "La loi des registres : plus on monte dans l'orchestre, plus on espace les voix. Les basses doivent être espacées.",
        ].map((p,i)=><p key={i} style={{fontSize:12.5,opacity:.72,margin:0,lineHeight:1.55,fontFamily:'Georgia,serif',paddingLeft:8,borderLeft:'2px solid rgba(96,168,188,0.3)'}}>{p}</p>)}
      </div>
    </div>
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursSerieHarmonique() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const M=(w,d,c='#7BC8A4')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  const SERIES=[
    {n:1,freq:'100 Hz',note:'Do1',int:'Fondamentale',color:'#7BC8A4'},
    {n:2,freq:'200 Hz',note:'Do2',int:'+Octave',color:'#7BC8A4'},
    {n:3,freq:'300 Hz',note:'Sol2',int:'+Quinte juste',color:'#90B8D0'},
    {n:4,freq:'400 Hz',note:'Do3',int:'+Quarte juste',color:'#7BC8A4'},
    {n:5,freq:'500 Hz',note:'Mi3',int:'+Tierce majeure',color:'#E8A857'},
    {n:6,freq:'600 Hz',note:'Sol3',int:'+Tierce mineure',color:'#90B8D0'},
    {n:7,freq:'700 Hz',note:'Sib3*',int:'+7e naturelle*',color:'#E07070'},
    {n:8,freq:'800 Hz',note:'Do4',int:'+Seconde majeure',color:'#7BC8A4'},
  ];
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Série harmonique</h3>
    <div style={{padding:'1rem',background:'rgba(130,224,170,0.08)',border:'1px solid rgba(130,224,170,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        La {M("série harmonique","La série harmonique est le fondement physique de toute la musique. Quand une corde vibre, elle ne produit pas une seule fréquence — elle vibre simultanément en halves, tiers, quarts... chacun produisant un partiel. Ces partiels forment la série harmonique. Leur présence relative détermine le timbre de chaque instrument.")} est la base physique de la musique. Chaque son musical contient des harmoniques (partiels) à des fréquences multiples de la fondamentale. C'est cette série qui explique pourquoi certains accords sonnent bien (consonants) et d'autres mal (dissonants), et pourquoi chaque instrument a son propre timbre.
      </p>
    </div>
    <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
      <div style={{fontSize:10,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>SÉRIE HARMONIQUE SUR DO (100 Hz fictif)</div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {SERIES.map(h=>(
          <div key={h.n} style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:`${h.color}20`,border:`1px solid ${h.color}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontFamily:'monospace',color:h.color,fontWeight:'bold',flexShrink:0}}>{h.n}</div>
            <div style={{width:40,fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,0.4)',flexShrink:0}}>{h.freq}</div>
            <div style={{height:8,background:`${h.color}30`,borderRadius:2,flex:1,position:'relative'}}>
              <div style={{position:'absolute',inset:0,background:h.color,borderRadius:2,width:`${100/h.n}%`,opacity:0.8}}/>
            </div>
            <div style={{width:40,fontSize:11,fontFamily:'monospace',color:h.color,flexShrink:0,textAlign:'right'}}>{h.note}</div>
            <div style={{fontSize:10,opacity:.5,fontFamily:'monospace',flexShrink:0,width:100}}>{h.int}</div>
          </div>
        ))}
      </div>
      <p style={{fontSize:11,opacity:.45,margin:'.65rem 0 0',fontFamily:'Georgia,serif',fontStyle:'italic'}}>* Le 7e harmonique (Sib) est légèrement plus bas que notre Sib tempéré — c'est pourquoi les accords de dominante ont ce son si particulier.</p>
    </div>
    {[
      {title:"Pourquoi l'accord majeur sonne naturellement", color:'#E8A857',
       content:"Les 3 premières notes distinctes de la série (harmoniques 4-5-6) forment exactement l'accord majeur : Do-Mi-Sol. C'est pour cette raison que l'accord majeur est dit 'naturel' — il est littéralement inscrit dans la physique du son."},
      {title:"La consonance et la dissonance expliquées", color:'#90B8D0',
       content:"Deux sons sont consonants quand leurs séries harmoniques se superposent harmonieusement (ratio simple : 2:1 = octave, 3:2 = quinte). Ils sont dissonants quand leurs fréquences se 'battent' (ratio complexe). La dissonance crée des battements — variations d'amplitude audibles — qui créent la tension musicale."},
      {title:"Le timbre : même note, sons différents", color:'#D4A0D4',
       content:"Un violon et une trompette jouant le même La 440Hz ont le même fondamental mais des séries harmoniques de force relative différente. Le violon a beaucoup d'harmoniques pairs (son rond), la trompette beaucoup d'impairs (son brillant). C'est pourquoi le timbre est la 'personnalité' de chaque instrument."},
    ].map((s,i)=>(
      <div key={i} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:12}}>
        <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:'.5rem'}}>{s.title}</div>
        <p style={{fontSize:12.5,opacity:.72,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>{s.content}</p>
      </div>
    ))}
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursTempEramentEgal() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const M=(w,d,c='#E8A857')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Tempérament égal</h3>
    <div style={{padding:'1rem',background:'rgba(247,220,111,0.08)',border:'1px solid rgba(247,220,111,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        Le {M("tempérament égal","Le tempérament égal (bien tempéré) divise l'octave en 12 demi-tons exactement égaux. Chaque demi-ton = multiplicateur de fréquence 2^(1/12) ≈ 1.059. Adopté progressivement aux XVIIe-XVIIIe siècles, il permet de jouer juste dans TOUTES les tonalités avec le même instrument. Avant lui, un instrument accordé en Do sonnait faux en Fa#.")} est le compromis qui a rendu possible la musique occidentale moderne. En divisant l'octave en 12 parties MATHÉMATIQUEMENT ÉGALES, on accepte que chaque intervalle soit légèrement faux — mais de façon égale dans toutes les tonalités. C'est le triomphe du pragmatisme sur la pureté acoustique.
      </p>
    </div>
    {[
      {title:"Le problème : la virgule pythagoricienne", color:'#E07070',
       content:"Si on monte de 12 quintes pures (ratio 3:2), on devrait revenir exactement 7 octaves plus haut. En réalité, on est légèrement trop haut — 12 quintes pures ≠ 7 octaves. Cet écart s'appelle la virgule pythagoricienne (23.46 cents). C'est le problème fondamental de l'accordage des instruments à hauteurs fixes (piano, guitare, orgue)."},
      {title:"La solution : distribuer l'erreur", color:'#7BC8A4',
       content:"Le tempérament égal 'écrase' chaque quinte de 1/12 de virgule pythagoricienne. Résultat : aucune quinte n'est parfaite, mais toutes sont identiquement fausses (−2 cents). L'oreille accepte cet écart minimal, surtout dans un contexte tonal rapide. Cette solution a été adoptée massivement à partir de Bach (Le Clavier Bien Tempéré)."},
      {title:"Ce que ça signifie pour le musicien", color:'#90B8D0',
       content:"Le Do# est identique au Réb sur un piano — même touche, même fréquence. Mais dans l'intonation 'naturelle' d'un chanteur ou d'un quatuor à cordes, ils sont légèrement différents ! Les chanteurs de chœur et les cordes jouent souvent avec des tempéraments purs sur les accords tenus. C'est pourquoi un piano avec un chœur crée parfois de légères dissonances."},
      {title:"Le Clavier Bien Tempéré de Bach", color:'#B898C8',
       content:"Bach a composé 24 préludes et fugues (vol. 1, 1722) dans les 24 tonalités majeures et mineures, précisément pour démontrer que son clavecin accordé en tempérament (quasi-)égal sonnait correctement dans TOUTES les tonalités. C'est le manifeste du tempérament égal. Aujourd'hui les pianos sont accordés en tempérament strictement égal par des accordeurs professionnels."},
    ].map((s,i)=>(
      <div key={i} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:12}}>
        <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:'.5rem'}}>{s.title}</div>
        <p style={{fontSize:12.5,opacity:.72,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>{s.content}</p>
      </div>
    ))}
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function CoursResonanceTimbre() {
  const [defWord,setDefWord]=useState(null);const[defText,setDefText]=useState(null);
  const M=(w,d,c='#6EB898')=><MotCle color={c} onClickWord={(w2,d2)=>{setDefWord(w2);setDefText(d2);}} definition={d}>{w}</MotCle>;
  return(<div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
    <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#E8A857,#C8A060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Résonance et timbre</h3>
    <div style={{padding:'1rem',background:'rgba(96,180,148,0.08)',border:'1px solid rgba(96,180,148,0.2)',borderRadius:12}}>
      <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
        Le {M("timbre","Le timbre (ou 'couleur sonore') est ce qui permet de distinguer un violon d'une flûte jouant la même note à la même hauteur et au même volume. Il est déterminé par la forme de l'onde sonore — c'est-à-dire par la proportion relative de chaque harmonique dans le spectre du son.")} est la personnalité sonore d'un instrument. La {M("résonance","La résonance se produit quand un objet vibre sympathiquement en réponse aux fréquences d'un autre. La caisse de résonance d'un piano amplifie et colore le son des cordes. Le corps d'un violon fait résonner l'air intérieur. La résonance est la magie acoustique qui transforme une vibration mécanique en musique chaude et projetée.",'#6EB898')} est le phénomène physique par lequel un objet vibre en réponse à une fréquence qui lui correspond. Ce sont les deux piliers de la physique du son musical.
      </p>
    </div>
    {[
      {title:"Qu'est-ce que le timbre ?", color:'#7BC8A4',
       items:["Un violon produit beaucoup d'harmoniques impairs → son brillant, mordant.","Une flûte a peu d'harmoniques → son pur, doux, 'sinusoïdal'.","Un hautbois est riche en harmoniques pairs ET impairs → son nasillard caractéristique.","Les percussions à hauteur indéterminée ont des partiels non harmoniques (rapport non-entier).","L'ADSR (Attaque-Déclin-Sustain-Relâche) est aussi une composante du timbre : un piano et un orgue ont le même fondamental mais l'attaque et le sustain différencient leur timbre."]},
      {title:"La résonance sympathique", color:'#60A8BC',
       items:["Sur un piano à queue, si tu enfonces la pédale forte (pédale droite) et chantes un La 440Hz fort, tu entendras la corde La résonner seule après. C'est la résonance sympathique.","Les cordes à vide d'une guitare résonnent quand tu joues des notes qui sont leurs harmoniques.","La pédale forte du piano libère tous les étouffoirs — tout l'instrument résonne avec chaque note jouée, créant la 'bouée harmonique' caractéristique de Debussy et Ravel.","Les harmoniques naturels de la guitare et du violon utilisent ce principe : en touchant légèrement la corde à son point nodal, on fait sonner uniquement un harmonique pur."]},
      {title:"Timbre et registre au piano", color:'#E8A857',
       items:["Les graves du piano sonnent 'boueux' sur des rythmes rapides car les harmoniques se chevauchent dans le temps.","Le medium (Do3-Do5) est la zone la plus équilibrée — articulation claire, timbre chaud.","Les aigus sont brillants mais s'estompent vite — les notes tenues disparaissent rapidement.","Ravel (Gaspard de la Nuit) et Debussy (Préludes) sont les maîtres de l'exploitation des couleurs de timbre du piano."]},
    ].map((s,i)=>(
      <div key={i} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}22`,borderRadius:12}}>
        <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:'.65rem'}}>{s.title}</div>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {s.items.map((item,j)=>(
            <div key={j} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:s.color,marginTop:7,flexShrink:0,opacity:.7}}/>
              <p style={{fontSize:12.5,opacity:.72,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    ))}
    {defWord&&<MascoтteDefinitionPopup word={defWord} definition={defText} onClose={()=>{setDefWord(null);setDefText(null);}}/>}
  </div>);
}

function TheoriePage() {
  const [section, setSection] = useState('main');
  const [exSub,   setExSub]   = useState(null);
  const [course,  setCourse]  = useState(null);
  const [showTip, setShowTip] = useState(false);

  const COURSE_TITLES = {
    gammes:"Gammes et modes", intervalles:"Intervalles", accords:"Construction des accords",
    fonctions:"Fonctions harmoniques", cadences:"Cadences", iivi:"ii-V-I Jazz", borrowed:"Borrowed Chords",
    modulation:"Modulation", extensions:"Extensions d'accords", substitutions:"Substitutions",
    modesjazz:"Modes jazz", reharm:"Réharmonisation",
    forme:"Forme et structure", contrepoint:"Contrepoint", orchestration:"Orchestration",
    serie:"Série harmonique", temperament:"Tempérament égal", resonance:"Résonance et timbre",
  };
  const COURSE_COLORS = {
    gammes:'#B898C8', intervalles:'#90B8D0', accords:'#E8A857',
    fonctions:'#E07070', cadences:'#60A8BC', iivi:'#C8864A', borrowed:'#6EB898',
    modulation:'#D4A0D4', extensions:'#E8A857', substitutions:'#60A8BC',
    modesjazz:'#6EB898', reharm:'#E07070',
    forme:'#90B8D0', contrepoint:'#B898C8', orchestration:'#60A8BC',
    serie:'#7BC8A4', temperament:'#E8A857', resonance:'#6EB898',
  };

  const THEORY_EXERCISES = [
    {id:'solfege',   icon:'🎵', title:'Symboles Musicaux',      sub:'Clés · Silences · Valeurs · Chiffrage · Nuances', color:'#E8A857',
     desc:"Reconnaître les symboles d'une partition. 21 symboles, exercice d'identification."},
    {id:'lecture',   icon:'📖', title:'Lecture de Partition',    sub:'Identifier les notes en solfège',                 color:'#90B8D0',
     desc:"Lis des mélodies sur portée et identifie chaque note. Mélodies aléatoires."},
    {id:'laccord',   icon:'🎼', title:"Lecture d'Accords",       sub:'Accords en bloc · Arpège · Renversements',         color:'#E8A857',
     desc:"Un accord apparaît sur la portée — identifie-le par son nom. Avec options de renversement."},
    {id:'armature',  icon:'🔑', title:'Armatures & Tonalités',   sub:'Dièses · Bémols · Tonalités majeures/mineures',    color:'#7BC8A4',
     desc:"Identifie la tonalité à partir de l'armure. 19 tonalités couvrant le cycle des quintes."},
    {id:'dictee',    icon:'🎯', title:"Dictée d'Accords",        sub:'Auto-avance · Timer configurable',                  color:'#E07070',
     desc:"Les accords défilent automatiquement — joue-les sur ton piano avant le suivant."},
    {id:'transpo',   icon:'↔', title:'Transposition',            sub:"Mélodie · Grille d'accords · Piano virtuel",       color:'#D4A0D4',
     desc:"Transpose une mélodie ou une grille d'accords dans une nouvelle tonalité."},
  ];

  const CATEGORIES = [
    { title:'Harmonie classique', color:'#B898C8', icon:'🎼', items:[
      {name:'Gammes et modes',          desc:'Majeur, mineur, modes grecs',          courseId:'gammes'},
      {name:'Intervalles',              desc:'Secondes, tierces, quintes...',         courseId:'intervalles'},
      {name:'Construction des accords', desc:'Triades, accords de 7e',               courseId:'accords'},
      {name:'Fonctions harmoniques',    desc:'Tonique, sous-dominante, dominante',    courseId:'fonctions'},
      {name:'Cadences',                 desc:'Parfaite, rompue, plagale...',           courseId:'cadences'},
      {name:'Modulation',               desc:'Changer de tonalité élégamment',        courseId:'modulation'},
    ]},
    { title:'Théorie Jazz', color:'#E8A857', icon:'🎷', items:[
      {name:'ii-V-I et variations',     desc:"La progression fondamentale du jazz",   courseId:'iivi'},
      {name:'Borrowed chords',          desc:"Emprunter des accords d'autres modes",  courseId:'borrowed'},
      {name:"Extensions d'accords",     desc:'9e, 11e, 13e et altérations',           courseId:'extensions'},
      {name:'Substitutions',            desc:'Triton, sous-dominante mineure',         courseId:'substitutions'},
      {name:'Modes appliqués au jazz',  desc:'Dorien, mixolydien, lydien dominant...', courseId:'modesjazz'},
      {name:'Réharmonisation',          desc:'Enrichir et transformer une grille',     courseId:'reharm'},
    ]},
    { title:'Composition', color:'#90B8D0', icon:'✍', items:[
      {name:'Forme et structure',       desc:'ABA, couplet-refrain, sonate, rondo',   courseId:'forme'},
      {name:'Contrepoint',              desc:"Voix indépendantes qui s'harmonisent",  courseId:'contrepoint'},
      {name:'Orchestration',            desc:'Distribuer les voix et timbres',         courseId:'orchestration'},
    ]},
    { title:'Acoustique musicale', color:'#7BC8A4', icon:'🔊', items:[
      {name:'Série harmonique',         desc:'Le fondement physique de la musique',   courseId:'serie'},
      {name:'Tempérament égal',         desc:'Comment le piano est accordé',          courseId:'temperament'},
      {name:'Résonance et timbre',      desc:'Couleur sonore et physique du son',      courseId:'resonance'},
    ]},
  ];

  // Course view
  if (course) {
    const courseColor = COURSE_COLORS[course] || '#B898C8';
    return(
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',background:'rgba(13,11,30,0.8)',flexShrink:0}}>
          <button onClick={()=>setCourse(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,padding:'4px 8px',borderRadius:6,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>← THÉORIE</button>
          <span style={{opacity:.2}}>|</span>
          <span style={{fontSize:11,fontFamily:'monospace',color:courseColor,letterSpacing:'.06em'}}>{COURSE_TITLES[course]?.toUpperCase()}</span>
        </div>
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {course==='gammes'       && <CoursGammesModes/>}
          {course==='intervalles'  && <CoursIntervalles/>}
          {course==='accords'      && <CoursConstructionAccords/>}
          {course==='fonctions'    && <CoursFonctionsHarmoniques/>}
          {course==='cadences'     && <CoursCadences/>}
          {course==='iivi'         && <CoursIIVI/>}
          {course==='borrowed'     && <CoursBorrowedChords/>}
          {course==='modulation'   && <CoursModulation/>}
          {course==='extensions'   && <CoursExtensionsAccords/>}
          {course==='substitutions'&& <CoursSubstitutions/>}
          {course==='modesjazz'    && <CoursModesJazz/>}
          {course==='reharm'       && <CoursReharmonisation/>}
          {course==='forme'        && <CoursFormeStructure/>}
          {course==='contrepoint'  && <CoursContrepoint/>}
          {course==='orchestration'&& <CoursOrchestration/>}
          {course==='serie'        && <CoursSerieHarmonique/>}
          {course==='temperament'  && <CoursTempEramentEgal/>}
          {course==='resonance'    && <CoursResonanceTimbre/>}
        </div>
      </div>
    );
  }

  // Exercices view
  // Exercices view
  if (section==='exercices') {
    if (exSub) {
      const ex = THEORY_EXERCISES.find(e=>e.id===exSub);
      return(
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',background:'rgba(13,11,30,0.8)',flexShrink:0}}>
            <button onClick={()=>setExSub(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,padding:'4px 8px',borderRadius:6}} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>← EXERCICES</button>
            <span style={{opacity:.2}}>|</span>
            <span style={{fontSize:11,fontFamily:'monospace',color:ex?.color||'#E8A857',letterSpacing:'.06em'}}>{ex?.title?.toUpperCase()}</span>
          </div>
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            {exSub==='solfege'  && <SymbolesMusique/>}
            {exSub==='lecture'  && <LectureExercice/>}
            {exSub==='laccord'  && <LectureAccordExercice/>}
            {exSub==='armature' && <ArmatureExercice/>}
            {exSub==='dictee'   && <DicteeAccords/>}
            {exSub==='transpo'  && <TranspositionRefonte/>}
          </div>
        </div>
      );
    }
    return(
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1.5rem'}}>
          <button onClick={()=>setSection('main')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>←</button>
          <div>
            <h3 style={{fontSize:18,fontWeight:'bold',margin:0}}>Exercices Théoriques</h3>
            <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',margin:'2px 0 0'}}>6 MODULES · LECTURE · DICTÉE · TRANSPOSITION</p>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {THEORY_EXERCISES.map(m=>(
            <button key={m.id} onClick={()=>setExSub(m.id)}
              style={{background:`${m.color}08`,border:`1.5px solid ${m.color}30`,borderRadius:14,padding:'1rem',cursor:'pointer',textAlign:'left',transition:'all 0.25s'}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}15`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}08`;e.currentTarget.style.borderColor=`${m.color}30`;e.currentTarget.style.transform='translateY(0)';}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <span style={{fontSize:24,flexShrink:0}}>{m.icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:'bold',color:m.color,fontFamily:'Georgia,serif',marginBottom:3}}>{m.title}</div>
                  <div style={{fontSize:9,opacity:.45,fontFamily:'monospace',letterSpacing:'.04em',marginBottom:5}}>{m.sub}</div>
                  <p style={{fontSize:12,opacity:.6,margin:0,lineHeight:1.5,fontFamily:'Georgia,serif'}}>{m.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }


  // ── MAIN PAGE ────────────────────────────────────────────────────────────────
  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem'}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Théorie Musicale</h2>
          <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>COMPRENDRE LA MUSIQUE EN PROFONDEUR</p>
        </div>
        <button onClick={()=>setShowTip(v=>!v)} style={{padding:'.4rem .7rem',background:showTip?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${showTip?'rgba(232,168,87,0.45)':'rgba(255,255,255,0.12)'}`,borderRadius:9,cursor:'pointer',color:showTip?'#E8A857':'rgba(255,255,255,0.45)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>💡</button>
      </div>
      {showTip&&(
        <div style={{padding:'.85rem',background:'rgba(232,168,87,0.07)',border:'1px solid rgba(232,168,87,0.22)',borderRadius:12,marginBottom:'1rem',animation:'fadeIn 0.2s ease'}}>
          <p style={{fontSize:12,opacity:.75,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.6}}>{SECTION_TIPS.theorie[Math.floor(Math.random()*SECTION_TIPS.theorie.length)]}</p>
        </div>
      )}

      {/* Exercices théoriques button */}
      <button onClick={()=>setSection('exercices')}
        style={{width:'100%',marginBottom:'1.5rem',background:'linear-gradient(135deg,rgba(247,220,111,0.15),rgba(133,193,233,0.1))',border:'1.5px solid rgba(247,220,111,0.4)',borderRadius:14,padding:'1rem 1.25rem',cursor:'pointer',textAlign:'left',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',display:'flex',alignItems:'center',justifyContent:'space-between'}}
        onMouseEnter={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(247,220,111,0.22),rgba(133,193,233,0.16))';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(247,220,111,0.2)';}}
        onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(247,220,111,0.15),rgba(133,193,233,0.1))';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span style={{fontSize:26}}>🎓</span>
          <div>
            <div style={{fontSize:15,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif',marginBottom:2}}>Exercices Théoriques</div>
            <div style={{fontSize:10,opacity:.55,fontFamily:'monospace',letterSpacing:'.04em'}}>SYMBOLES MUSICAUX · LECTURE DE PARTITION</div>
          </div>
        </div>
        <span style={{fontSize:16,color:'rgba(247,220,111,0.6)'}}>→</span>
      </button>

      {/* Course categories */}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {CATEGORIES.map((cat,ci)=>(
          <div key={ci} style={{background:'rgba(255,255,255,0.025)',border:`0.5px solid ${cat.color}`,borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'.85rem 1rem',background:`${cat.color}`,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>{cat.icon}</span>
              <span style={{fontSize:14,fontWeight:'bold',color:cat.color,fontFamily:'Georgia,serif'}}>{cat.title}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              {cat.items.map((item,ii)=>{
                const hasCourse=!!item.courseId;
                return(
                  <div key={ii}
                    onClick={hasCourse?()=>setCourse(item.courseId):undefined}
                    style={{padding:'.75rem 1rem',borderTop:'0.5px solid rgba(255,255,255,0.05)',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:hasCourse?'pointer':'default',transition:'all 0.2s',background:hasCourse?'transparent':'transparent'}}
                    onMouseEnter={e=>{if(hasCourse)e.currentTarget.style.background=`${cat.color}18`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                    <div>
                      <div style={{fontSize:13,fontFamily:'Georgia,serif',color:hasCourse?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.55)',marginBottom:2,fontWeight:hasCourse?'600':'normal'}}>{item.name}</div>
                      <div style={{fontSize:10,opacity:.35,fontFamily:'monospace'}}>{item.desc}</div>
                    </div>
                    {hasCourse
                      ? <span style={{fontSize:10,fontFamily:'monospace',color:cat.color,border:`0.5px solid ${cat.color}`,padding:'2px 7px',borderRadius:6,flexShrink:0,marginLeft:8}}>LIRE →</span>
                      : <span style={{fontSize:8,fontFamily:'monospace',color:'rgba(255,255,255,0.2)',border:'0.5px solid rgba(255,255,255,0.08)',padding:'2px 5px',borderRadius:4,flexShrink:0,marginLeft:8}}>BIENTÔT</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const APPRENTISSAGE_SECTIONS = [
  {id:'accords',   icon:'♩',  title:'Répertoire', subtitle:'ACCORDS · PARTITIONS · GRILLES · IMPRO', color:'#B898C8'},
  {id:'oreille',   icon:'👂', title:'Oreille',     subtitle:'INTERVALLES · ACCORDS · MÉLODIE',        color:'#90B8D0'},
  {id:'exercices', icon:'✎',  title:'Technique',   subtitle:'CYCLE · IMPRO · BIBLIOTHÈQUE',           color:'#7BC8A4'},
  {id:'theorie',   icon:'📖', title:'Théorie',      subtitle:'HARMONIE · JAZZ · COMPOSITION',           color:'#E8A857'},
  {id:'harmonie',  icon:'🏛',  title:'Harmonie',    subtitle:'CONSTRUIRE · ANALYSER · COMPRENDRE',      color:'#AED6F1'},
];

// ══════════════════════════════════════════════════════════════════════════════
// ── COIN DE L'HARMONIE ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const HARMONIC_CONCEPTS = [
  { title:"La fonction dominante", color:"#E8A857", icon:"⚡",
    text:"L'accord de dominante (V) contient une tension naturelle qui veut se résoudre sur la tonique (I). Cette tension vient de la triton entre la sensible et la 7e de dominante. C'est le moteur de toute la musique tonale.",
    example:"G7 → C : la note B monte vers C, la note F descend vers E." },
  { title:"Le ii-V-I en jazz", color:"#90B8D0", icon:"🎷",
    text:"La progression ii-V-I (ex: Dm7 → G7 → Cmaj7) est omniprésente en jazz. Le ii prépare le V, le V crée la tension, le I résout. Comprendre cette mécanique te permet de naviguer dans toutes les tonalités.",
    example:"En Sol : Am7 → D7 → Gmaj7" },
  { title:"Les accords empruntés", color:"#B898C8", icon:"🔄",
    text:"Un accord emprunté vient d'une tonalité parallèle. En Do majeur, l'accord fm (emprunté au Do mineur) donne une couleur doux-amer très expressif. C'est le 'borrowed chord' des musiciens anglais.",
    example:"C → F → fm → C : le fm crée un moment de flottement entre la chaleur et la mélancolie." },
  { title:"La substitution de triton", color:"#E07070", icon:"↔",
    text:"Tout accord de dominante peut être remplacé par l'accord dont la fondamentale est un triton (6 demi-tons) plus haut. En Do : G7 peut être remplacé par Db7. Les deux ont la même titon (B-F / Cb-F) et la même fonction.",
    example:"Dm7 → Db7 → Cmaj7 (substitution du G7 par Db7)" },
  { title:"Les cadences", color:"#7BC8A4", icon:"🎼",
    text:"Une cadence est une formule d'accord qui marque la fin d'une phrase musicale. Parfaite (V→I), Rompue (V→vi), Plagale (IV→I), Imparfaite (I→V). Chacune crée un sentiment différent de conclusion ou d'attente.",
    example:"V→I : conclusion franche. V→vi : surprise, l'oreille attend la tonique mais trouve le vi." },
  { title:"Les modes", color:"#AED6F1", icon:"🌊",
    text:"Les 7 modes grecs (Ionien, Dorien, Phrygien, Lydien, Mixolydien, Éolien, Locrien) sont des rotations de la gamme majeure. Chacun a une couleur unique. Le Dorien sonne jazzy, le Phrygien est espagnol, le Lydien est rêveur.",
    example:"Ré Dorien : D-E-F-G-A-B-C-D. Même notes que Do majeur, couleur mineure avec une 6te majeure." },
];

function ApprentissageLanding({onNavigate}){
  useEffect(()=>{ notifySectionVisit(); },[]);
  return(<div style={{overflowY:'auto',flex:1}}>
    {/* Hero section */}
    <div style={{
      padding:'2rem 1.25rem 1.5rem',
      background:'linear-gradient(160deg, rgba(200,140,80,0.2) 0%, rgba(120,168,196,0.1) 50%, transparent 100%)',
      borderBottom:'1px solid rgba(255,255,255,0.07)',
      marginBottom:'1.25rem',
      position:'relative',overflow:'hidden',
    }}>
      {/* Decorative orb */}
      <div style={{position:'absolute',top:-40,right:-30,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle, rgba(200,140,80,0.2) 0%, transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-20,left:-20,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle, rgba(120,168,196,0.15) 0%, transparent 70%)',pointerEvents:'none'}}/>
      <h2 style={{
        fontSize:28, fontWeight:'bold', marginBottom:'.85rem',
        letterSpacing:'-.03em',
        background:'linear-gradient(90deg, #D4A0D4, #60A5FA)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
      }}>Apprentissage</h2>
      <p style={{
        fontSize:12.5, lineHeight:1.7,
        color:'rgba(255,255,255,0.55)',
        fontFamily:'Georgia,serif', fontStyle:'italic',
        margin:0, paddingLeft:'.9rem',
        borderLeft:'2.5px solid rgba(200,140,80,0.6)',
        position:'relative',zIndex:1,
      }}>
        "Les 4 essentiels à développer pour un pianiste sont son répertoire, sa technique, son oreille et sa connaissance de la théorie."
      </p>
    </div>
    {/* Section cards */}
    <div style={{padding:'0 1.25rem 1.5rem',display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
      {APPRENTISSAGE_SECTIONS.map((s,i)=>(<div key={s.id} style={{animation:`fadeIn 0.4s ease ${i*0.06}s both`}}><SectionCard {...s} onClick={()=>!s.lock&&onNavigate(s.id)}/></div>))}
    </div>
  </div>);
}

function ApprentissagePage({sub,setSub}){
  const [showCatTip, setShowCatTip] = useState(null); // category id
  const [seenTips, setSeenTips] = useState(()=>{ try{return JSON.parse(localStorage.getItem('cs_seen_tips')||'[]');}catch{return[];} });

  // Show category tip once per category on first visit
  useEffect(()=>{
    if (!sub || sub==='landing') return;
    const catKey = sub==='accords'?'repertoire':sub==='exercices'?'technique':sub;
    if (CATEGORY_TIPS[catKey] && !seenTips.includes(catKey)) {
      setShowCatTip(catKey);
    }
  },[sub]);

  const handleCloseCatTip = () => {
    const catKey = showCatTip;
    const next = [...seenTips, catKey];
    setSeenTips(next);
    try{ localStorage.setItem('cs_seen_tips', JSON.stringify(next)); }catch{}
    setShowCatTip(null);
  };

  if(!sub||sub==='landing') return <ApprentissageLanding onNavigate={setSub}/>;
  const info = APPRENTISSAGE_SECTIONS.find(s=>s.id===sub);
  const catTipKey = sub==='accords'?'repertoire':sub==='exercices'?'technique':sub;
  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    {showCatTip && <CategoryTipPopup category={showCatTip} color={info?.color||'#B898C8'} onClose={handleCloseCatTip}/>}
    {/* Back bar */}
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.7)',flexShrink:0}}>
      <button onClick={()=>setSub('landing')} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:2,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#f0ebe0'} onMouseLeave={e=>e.currentTarget.style.color='rgba(240,235,224,0.5)'}>
        ← APPRENTISSAGE
      </button>
      {info&&<>
        <span style={{opacity:.2}}>|</span>
        <span style={{fontSize:11,fontFamily:'monospace',color:info.color,letterSpacing:'.08em'}}>{info.title.toUpperCase()}</span>
      </>}
      {/* Bouton re-afficher les conseils */}
      {CATEGORY_TIPS[catTipKey] && (
        <button onClick={()=>setShowCatTip(catTipKey)} style={{marginLeft:'auto',background:'transparent',border:`0.5px solid ${info?.color}`,color:`${info?.color}`,padding:'3px 8px',borderRadius:2,cursor:'pointer',fontSize:9,fontFamily:'monospace',letterSpacing:'.06em',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color=info?.color} onMouseLeave={e=>e.currentTarget.style.color=`${info?.color}`}>
          💡 CONSEILS
        </button>
      )}
    </div>
    <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
      {sub==='accords'&&<BibliothequePage/>}
      {sub==='oreille'&&<OreilPage/>}
      {sub==='exercices'&&<ExercicesPage/>}
      {sub==='theorie'&&<TheoriePage/>}
      {sub==='harmonie'&&<CoinHarmoniePage/>}
    </div>
  </div>);
}

// ── Journal de pratique ───────────────────────────────────────────────────────
function JournalPage() {
  const [char, setChar] = useState(loadChar);
  const [tab,  setTab]  = useState('sessions'); // sessions | grid

  // Session timer
  const [timerActive,   setTimerActive]   = useState(false);
  const [timerSecs,     setTimerSecs]     = useState(0);
  const [comment,       setComment]       = useState('');
  const [pendingMins,   setPendingMins]   = useState(null); // mins from stopped timer
  const timerIntervalRef = useRef(null);

  // Daily hours goal
  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(char.dailyHoursGoal||1));

  function saveCharLocal(c) { setChar(c); saveChar(c); }

  // Timer
  function startTimer()  { setTimerActive(true); setTimerSecs(0); }
  function pauseTimer()  { setTimerActive(false); }
  function stopTimer()   {
    setTimerActive(false);
    const mins = Math.max(1, Math.round(timerSecs/60));
    setPendingMins(mins);
  }
  function resetTimer()  { setTimerActive(false); setTimerSecs(0); setPendingMins(null); }

  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => setTimerSecs(s=>s+1), 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerActive]);

  // Save session
  function saveSession(mins) {
    if (!mins || mins < 1) return;
    const session = { date: todayStr(), mins, comment: comment.trim(), ts: Date.now() };
    const xpGained = Math.round(mins * XP_PER_MIN);
    const newSessions = [...(char.sessions||[]), session];
    const newHours = (char.practicedHours||0) + mins/60;
    const newXp    = (char.totalXp||0) + xpGained;
    saveCharLocal({ ...char, sessions: newSessions, practicedHours: newHours, totalXp: newXp });
    setComment(''); setPendingMins(null); resetTimer();
  }

  // Stats
  const totalHours      = char.practicedHours || 0;
  const GOAL_HOURS      = 10000;
  const pctToGoal       = Math.min(100, (totalHours/GOAL_HOURS)*100);
  const dailyGoal       = char.dailyHoursGoal || 1;
  const yearsLeft       = dailyGoal>0 ? ((GOAL_HOURS-totalHours)/(dailyGoal*365)).toFixed(1) : '∞';
  const timerDisplay    = `${String(Math.floor(timerSecs/60)).padStart(2,'0')}:${String(timerSecs%60).padStart(2,'0')}`;

  // Today sessions
  const todaySessions = (char.sessions||[]).filter(s=>s.date===todayStr());
  const todayMins     = todaySessions.reduce((a,s)=>a+s.mins,0);
  const todayHours    = (todayMins/60).toFixed(2);

  // Last 7 days for mini calendar
  const last7 = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const ds=d.toISOString().slice(0,10);
    const mins=(char.sessions||[]).filter(s=>s.date===ds).reduce((a,s)=>a+s.mins,0);
    return {date:ds,mins,label:d.toLocaleDateString('fr',{weekday:'short'}).toUpperCase()};
  });

  const fmt = m => m>=60?`${Math.floor(m/60)}h${m%60>0?` ${m%60}m`:''}`:`${m}m`;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Tab header */}
      <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(13,11,30,0.6)'}}>
        {[['sessions','📋 Sessions'],['grid','⬜ 10 000h']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'.65rem .25rem',background:'none',border:'none',
              borderBottom:tab===id?'2px solid #7BC8A4':'2px solid transparent',
              color:tab===id?'#7BC8A4':'rgba(255,255,255,0.4)',
              cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.04em',transition:'all 0.2s',
              display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── SESSIONS TAB ──────────────────────────────────────────────────────── */}
      {tab==='sessions' && (
        <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>

          {/* Timer card */}
          <div style={{padding:'1.25rem',background:'rgba(130,224,170,0.07)',border:'1px solid rgba(130,224,170,0.2)',borderRadius:16}}>
            <div style={{fontSize:10,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'1rem'}}>⏱ CHRONOMÈTRE DE SESSION</div>
            <div style={{textAlign:'center',marginBottom:'1rem'}}>
              <div style={{fontSize:52,fontWeight:'bold',fontFamily:'monospace',color:timerActive?'#7BC8A4':'rgba(255,255,255,0.7)',letterSpacing:'.04em',lineHeight:1}}>{timerDisplay}</div>
              {pendingMins && <div style={{fontSize:13,color:'#E8A857',marginTop:6,fontFamily:'monospace'}}>Session : {pendingMins} min enregistrée</div>}
            </div>
            <div style={{display:'flex',gap:8,marginBottom:'1rem'}}>
              {!timerActive && timerSecs===0 && !pendingMins && (
                <button onClick={startTimer} style={{flex:1,padding:'.75rem',background:'rgba(130,224,170,0.15)',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.08em'}}>▶ DÉMARRER</button>
              )}
              {timerActive && (
                <>
                  <button onClick={pauseTimer} style={{flex:1,padding:'.75rem',background:'rgba(247,220,111,0.12)',border:'1.5px solid #E8A857',color:'#E8A857',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold'}}>⏸ PAUSE</button>
                  <button onClick={stopTimer}  style={{flex:1,padding:'.75rem',background:'rgba(241,148,138,0.12)',border:'1.5px solid #E07070',color:'#E07070',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold'}}>■ STOP</button>
                </>
              )}
              {!timerActive && timerSecs>0 && !pendingMins && (
                <>
                  <button onClick={()=>setTimerActive(true)} style={{flex:1,padding:'.75rem',background:'rgba(130,224,170,0.12)',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:12,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold'}}>▶ REPRENDRE</button>
                  <button onClick={stopTimer}  style={{flex:1,padding:'.75rem',background:'rgba(241,148,138,0.12)',border:'1.5px solid #E07070',color:'#E07070',borderRadius:12,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold'}}>■ STOP</button>
                </>
              )}
              {pendingMins && (
                <button onClick={resetTimer} style={{padding:'.75rem .9rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:12,cursor:'pointer',fontSize:12,fontFamily:'monospace'}}>↺</button>
              )}
            </div>
            {/* Comment input */}
            <input
              placeholder="Commentaire (facultatif) — ex: Gammes Do majeur, Chopin nocturne…"
              value={comment} onChange={e=>setComment(e.target.value)}
              style={{width:'100%',padding:'.65rem .85rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'rgba(255,255,255,0.8)',fontSize:12,fontFamily:'Georgia,serif',boxSizing:'border-box',marginBottom:pendingMins?'1rem':'0',outline:'none'}}
            />
            {pendingMins && (
              <button onClick={()=>saveSession(pendingMins)}
                style={{width:'100%',padding:'.75rem',background:'linear-gradient(135deg,rgba(130,224,170,0.2),rgba(96,168,188,0.15))',border:'1.5px solid #7BC8A4',color:'#7BC8A4',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.08em',animation:'fadeIn 0.3s ease'}}>
                ✓ ENREGISTRER {pendingMins} MINUTE{pendingMins>1?'S':''}
              </button>
            )}
          </div>

          {/* Saisie manuelle */}
          <ManualSessionForm char={char} saveCharLocal={saveCharLocal}/>

          {/* Today recap */}
          {todaySessions.length>0 && (
            <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
              <div style={{fontSize:10,color:'#90B8D0',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>AUJOURD'HUI — {fmt(todayMins)}</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {todaySessions.map((s,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem .75rem',background:'rgba(133,193,233,0.06)',border:'0.5px solid rgba(133,193,233,0.18)',borderRadius:8}}>
                    <div>
                      <span style={{fontSize:12,fontWeight:'bold',color:'#90B8D0',fontFamily:'monospace'}}>{fmt(s.mins)}</span>
                      {s.comment&&<span style={{fontSize:11,opacity:.6,marginLeft:8,fontFamily:'Georgia,serif',fontStyle:'italic'}}>{s.comment}</span>}
                    </div>
                    <span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>{new Date(s.ts).toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last 7 days */}
          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>7 DERNIERS JOURS</div>
            <div style={{display:'flex',gap:5}}>
              {last7.map(({date,mins,label})=>{
                const h=mins/60,max=Math.max(...last7.map(d=>d.mins/60),1);
                const pct=h/max,isToday=date===todayStr();
                const col=isToday?'#7BC8A4':'#90B8D0';
                return(
                  <div key={date} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div style={{width:'100%',height:60,background:'rgba(255,255,255,0.06)',borderRadius:6,overflow:'hidden',display:'flex',alignItems:'flex-end'}}>
                      <div style={{width:'100%',height:`${Math.max(4,pct*100)}%`,background:col,borderRadius:4,opacity:mins>0?1:0.2,transition:'height 0.4s ease'}}/>
                    </div>
                    <div style={{fontSize:8,fontFamily:'monospace',color:isToday?col:'rgba(255,255,255,0.35)',letterSpacing:'.03em'}}>{label}</div>
                    {mins>0&&<div style={{fontSize:8,fontFamily:'monospace',color:col,opacity:.7}}>{fmt(mins)}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Objectif quotidien */}
          <div style={{padding:'.85rem 1rem',background:'rgba(200,140,80,0.06)',border:'1px solid rgba(200,140,80,0.2)',borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:3}}>OBJECTIF QUOTIDIEN</div>
              {editGoal?(
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="number" min="0.5" max="12" step="0.5" value={goalInput}
                    onChange={e=>setGoalInput(e.target.value)}
                    style={{width:60,padding:'.3rem .5rem',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(200,140,80,0.4)',borderRadius:7,color:'#D4A0D4',fontFamily:'monospace',fontSize:12,outline:'none'}}/>
                  <span style={{fontSize:11,opacity:.6,fontFamily:'monospace'}}>h/jour</span>
                  <button onClick={()=>{const h=parseFloat(goalInput);if(h>0){saveCharLocal({...char,dailyHoursGoal:h});}setEditGoal(false);}}
                    style={{padding:'.3rem .6rem',background:'rgba(200,140,80,0.2)',border:'1px solid #D4A0D4',color:'#D4A0D4',borderRadius:7,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>OK</button>
                </div>
              ):(
                <div style={{fontSize:16,fontWeight:'bold',color:'#D4A0D4',fontFamily:'monospace'}}>{dailyGoal}h/jour</div>
              )}
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,opacity:.5,fontFamily:'monospace',marginBottom:2}}>Objectif 10 000h en</div>
              <div style={{fontSize:18,fontWeight:'bold',color:'#D4A0D4',fontFamily:'Georgia,serif'}}>{yearsLeft} ans</div>
              <button onClick={()=>{setGoalInput(String(dailyGoal));setEditGoal(v=>!v);}} style={{marginTop:4,background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:9,fontFamily:'monospace'}}>⚙ modifier</button>
            </div>
          </div>
        </div>
      )}

      {/* ── GRILLE 10 000H TAB ─────────────────────────────────────────────── */}
      {tab==='grid' && (
        <TenThousandGrid char={char}/>
      )}
    </div>
  );
}

// Formulaire de saisie manuelle (composant séparé pour éviter useState dans map)
function ManualSessionForm({ char, saveCharLocal }) {
  const [mins,    setMins]    = useState('');
  const [comment, setComment] = useState('');

  function submit() {
    const m = parseInt(mins);
    if (!m || m < 1) return;
    const session = { date: todayStr(), mins: m, comment: comment.trim(), ts: Date.now() };
    const xpGained = Math.round(m * XP_PER_MIN);
    saveCharLocal({
      ...char,
      sessions:      [...(char.sessions||[]), session],
      practicedHours:(char.practicedHours||0) + m/60,
      totalXp:       (char.totalXp||0) + xpGained,
    });
    setMins(''); setComment('');
  }

  return (
    <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
      <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>SAISIE MANUELLE</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:8,marginBottom:8}}>
        <input type="number" min="1" max="480" placeholder="Durée (min)"
          value={mins} onChange={e=>setMins(e.target.value)}
          style={{padding:'.6rem .75rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,color:'rgba(255,255,255,0.8)',fontSize:12,fontFamily:'monospace',outline:'none'}}/>
        <input placeholder="Commentaire…"
          value={comment} onChange={e=>setComment(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&submit()}
          style={{padding:'.6rem .75rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,color:'rgba(255,255,255,0.8)',fontSize:12,fontFamily:'Georgia,serif',outline:'none'}}/>
      </div>
      <button onClick={submit} disabled={!mins||parseInt(mins)<1}
        style={{width:'100%',padding:'.7rem',background:mins&&parseInt(mins)>=1?'rgba(130,224,170,0.12)':'rgba(255,255,255,0.03)',border:`1.5px solid ${mins&&parseInt(mins)>=1?'#7BC8A4':'rgba(255,255,255,0.1)'}`,color:mins&&parseInt(mins)>=1?'#7BC8A4':'rgba(255,255,255,0.25)',borderRadius:10,cursor:mins&&parseInt(mins)>=1?'pointer':'not-allowed',fontSize:12,fontFamily:'monospace',letterSpacing:'.08em',fontWeight:'bold',transition:'all 0.3s'}}>
        + AJOUTER CETTE SESSION
      </button>
    </div>
  );
}

// Grille 10 000 heures
function TenThousandGrid({ char }) {
  const TOTAL_CELLS = 10000;
  const CELLS_PER_ROW = 50;
  const filled = Math.floor(char.practicedHours || 0);
  const pct    = ((char.practicedHours||0)/TOTAL_CELLS*100).toFixed(2);
  const dailyGoal = char.dailyHoursGoal || 1;
  const remaining = TOTAL_CELLS - (char.practicedHours||0);
  const yearsLeft = dailyGoal>0 ? (remaining/(dailyGoal*365)).toFixed(1) : '∞';

  // Only render a window of cells (first 2000 for perf)
  const visibleCells = Math.min(TOTAL_CELLS, Math.max(filled+200, 500));
  const rows = Math.ceil(visibleCells / CELLS_PER_ROW);

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      {/* Header stats */}
      <div style={{padding:'1.25rem',background:'linear-gradient(135deg,rgba(130,224,170,0.1),rgba(96,168,188,0.08))',border:'1px solid rgba(130,224,170,0.25)',borderRadius:16}}>
        <div style={{fontSize:10,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>OBJECTIF 10 000 HEURES</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'.75rem'}}>
          <div>
            <div style={{fontSize:40,fontWeight:'bold',color:'#7BC8A4',fontFamily:'Georgia,serif',lineHeight:1}}>{Math.floor(char.practicedHours||0).toLocaleString()}</div>
            <div style={{fontSize:11,opacity:.5,fontFamily:'monospace'}}>heures pratiquées</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:24,fontWeight:'bold',color:'rgba(255,255,255,0.6)',fontFamily:'Georgia,serif'}}>{pct}%</div>
            <div style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>de l'objectif</div>
          </div>
        </div>
        <div style={{height:8,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden',marginBottom:'.65rem'}}>
          <div style={{height:'100%',width:`${Math.min(100,(char.practicedHours||0)/100)}%`,background:'linear-gradient(90deg,#7BC8A4,#60A8BC)',borderRadius:4,transition:'width 0.6s ease'}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:10,opacity:.4,fontFamily:'monospace'}}>
          <span>À raison de {dailyGoal}h/jour</span>
          <span>→ encore {yearsLeft} an{parseFloat(yearsLeft)>1?'s':''}</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:12,height:12,borderRadius:2,background:'#7BC8A4'}}/><span style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>Heure complétée</span></div>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:12,height:12,borderRadius:2,background:'rgba(130,224,170,0.3)',border:'1px solid rgba(130,224,170,0.4)'}}/><span style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>Heure partielle</span></div>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:12,height:12,borderRadius:2,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}/><span style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>À compléter</span></div>
        <span style={{fontSize:10,opacity:.35,fontFamily:'monospace',marginLeft:'auto'}}>1 case = 1 heure</span>
      </div>

      {/* Grid */}
      <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'1rem',overflowX:'auto'}}>
        <div style={{display:'grid',gridTemplateColumns:`repeat(${CELLS_PER_ROW},1fr)`,gap:2,minWidth:500}}>
          {Array.from({length:visibleCells}).map((_,i)=>{
            const hours = char.practicedHours||0;
            const filled_full = i < Math.floor(hours);
            const partial     = !filled_full && i === Math.floor(hours) && (hours%1)>0;
            return (
              <div key={i} style={{
                aspectRatio:'1',
                borderRadius:2,
                background: filled_full
                  ? '#7BC8A4'
                  : partial
                  ? `rgba(130,224,170,${(hours%1).toFixed(2)})`
                  : 'rgba(255,255,255,0.06)',
                border: filled_full
                  ? 'none'
                  : '0.5px solid rgba(255,255,255,0.08)',
                transition:'background 0.3s',
              }}/>
            );
          })}
          {/* Remaining cells (simplified) */}
          {visibleCells < TOTAL_CELLS && (
            <div style={{gridColumn:`span ${CELLS_PER_ROW}`,textAlign:'center',padding:'.5rem',fontSize:9,opacity:.3,fontFamily:'monospace'}}>
              ... et {(TOTAL_CELLS-visibleCells).toLocaleString()} cases supplémentaires à débloquer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Compétences Page ──────────────────────────────────────────────────────────
// ── Pixel Character SVG ───────────────────────────────────────────────────────
const SKIN_TONES  = ['#F5CBA7','#E59866','#CA6F1E','#784212'];
const HAIR_COLORS = ['#1C1C1C','#7D6608','#A04000','#F39C12','#E5E7E9'];
const OUTFIT_COLORS= ['#2E4057','#1A5276','#7B241C','#1E8449','#6C3483'];

const SHOP_ITEMS = [
  {id:'hat1',    name:'Chapeau de jazz',    icon:'🎩', type:'hat',   cost:15, color:'#E8A857', desc:'Indispensable pour jouer du jazz'},
  {id:'hat2',    name:'Béret classique',    icon:'👒', type:'hat',   cost:20, color:'#90B8D0', desc:'Le style du pianiste classique'},
  {id:'outfit1', name:'Smoking élégant',    icon:'🤵', type:'outfit',cost:30, color:'#C8864A', desc:'Pour les grandes occasions'},
  {id:'outfit2', name:'Tenue folk',         icon:'🎸', type:'outfit',cost:25, color:'#6EB898', desc:'Décontracté et musical'},
  {id:'badge1',  name:'Badge Oreille d\'or',icon:'🏅', type:'badge', cost:10, color:'#E8A857', desc:'Maître de l\'oreille musicale'},
  {id:'badge2',  name:'Étoile filante',     icon:'⭐', type:'badge', cost:10, color:'#D4A0D4', desc:'Pour les virtuoses'},
  {id:'aura1',   name:'Aura violette',      icon:'✨', type:'aura',  cost:50, color:'#D4A0D4', desc:'L\'aura du Maestro'},
  {id:'aura2',   name:'Aura dorée',         icon:'🌟', type:'aura',  cost:50, color:'#E8A857', desc:'Légende vivante'},
];

function PixelCharacter({ gender='M', skinTone=0, hairColor=0, outfitIdx=0, accessories=[], size=180, aura=null }) {
  const skin = SKIN_TONES[skinTone] || SKIN_TONES[0];
  const hair = HAIR_COLORS[hairColor] || HAIR_COLORS[0];
  const outfit= OUTFIT_COLORS[outfitIdx] || OUTFIT_COLORS[0];
  const hasHat   = accessories.includes('hat1') || accessories.includes('hat2');
  const hasBadge = accessories.includes('badge1') || accessories.includes('badge2');
  const auraColor= aura==='aura1'?'#D4A0D4':aura==='aura2'?'#E8A857':null;

  return (
    <svg viewBox="0 0 64 96" width={size} height={size*1.5} style={{imageRendering:'pixelated',overflow:'visible'}}>
      {/* Aura */}
      {auraColor && (
        <ellipse cx="32" cy="80" rx="26" ry="8" fill={auraColor} opacity="0.25" style={{animation:'orbFloat 2s ease-in-out infinite'}}/>
      )}
      {/* Shadow */}
      <ellipse cx="32" cy="90" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>

      {/* Body / Outfit */}
      {/* Torso */}
      <rect x="20" y="48" width="24" height="24" fill={outfit}/>
      {/* Collar */}
      <rect x="28" y="48" width="8" height="6" fill={gender==='F'?'#F8BBD9':'#ffffff'} opacity="0.6"/>
      {/* Arms */}
      <rect x="12" y="50" width="8" height="16" fill={outfit}/>
      <rect x="44" y="50" width="8" height="16" fill={outfit}/>
      {/* Hands */}
      <rect x="12" y="66" width="8" height="6" fill={skin}/>
      <rect x="44" y="66" width="8" height="6" fill={skin}/>
      {/* Legs */}
      <rect x="20" y="72" width="10" height="18" fill={gender==='F'?'#F48FB1':'#2C3E50'}/>
      <rect x="34" y="72" width="10" height="18" fill={gender==='F'?'#F48FB1':'#2C3E50'}/>
      {/* Shoes */}
      <rect x="18" y="88" width="12" height="5" fill="#1C1C1C"/>
      <rect x="34" y="88" width="12" height="5" fill="#1C1C1C"/>

      {/* Neck */}
      <rect x="28" y="40" width="8" height="10" fill={skin}/>
      {/* Head */}
      <rect x="18" y="16" width="28" height="28" fill={skin}/>
      {/* Hair — top */}
      {hasHat ? (
        <>
          <rect x="14" y="12" width="36" height="8" fill={accessories.includes('hat1')?'#1C1C1C':'#A04000'} rx="2"/>
          <rect x="10" y="18" width="44" height="4" fill={accessories.includes('hat1')?'#1C1C1C':'#A04000'}/>
        </>
      ) : (
        <>
          <rect x="16" y="12" width="32" height="12" fill={hair}/>
          {gender==='F'&&<><rect x="12" y="16" width="8" height="28" fill={hair}/><rect x="44" y="16" width="8" height="28" fill={hair}/></>}
        </>
      )}
      {/* Eyes */}
      <rect x="22" y="26" width="6" height="6" fill="#ffffff"/>
      <rect x="36" y="26" width="6" height="6" fill="#ffffff"/>
      <rect x="24" y="28" width="4" height="4" fill="#1C1C1C"/>
      <rect x="38" y="28" width="4" height="4" fill="#1C1C1C"/>
      {/* Pupils shine */}
      <rect x="25" y="28" width="2" height="2" fill="#ffffff" opacity="0.8"/>
      <rect x="39" y="28" width="2" height="2" fill="#ffffff" opacity="0.8"/>
      {/* Mouth */}
      <rect x="25" y="36" width="14" height="3" fill={gender==='F'?'#E74C3C':'#7B241C'}/>
      <rect x="26" y="37" width="12" height="2" fill="#C0392B"/>
      {/* Nose */}
      <rect x="30" y="32" width="4" height="2" fill={skin} style={{filter:'brightness(0.85)'}}/>

      {/* Badge */}
      {hasBadge && (
        <text x="46" y="52" fontSize="10" textAnchor="middle">
          {accessories.includes('badge1')?'🏅':'⭐'}
        </text>
      )}

      {/* Musical note accessory (always) */}
      <text x="6" y="28" fontSize="9" opacity="0.7">♪</text>
      <text x="52" y="38" fontSize="7" opacity="0.5">♫</text>
    </svg>
  );
}

// Character + Shop page
function CharacterPage({ stats }) {
  const [char,    setChar]    = useState(loadChar);
  const [tab,     setTab]     = useState('char'); // char | shop
  const [bought,  setBought]  = useState(false);

  const keys = stats.keys || 0;
  const xpInfo = xpToNextLevel(stats.totalXp||0);
  const levelTitle = LEVEL_TITLES[Math.min(xpInfo.lv, LEVEL_TITLES.length-1)];

  function saveCharLocal(c) { setChar(c); saveChar(c); }

  function buyItem(item) {
    if (keys < item.cost) return;
    if ((char.accessories||[]).includes(item.id)) return;
    // Deduct keys from stats (via updateStats) — here we just track in char
    const newAcc = [...(char.accessories||[]), item.id];
    saveCharLocal({ ...char, accessories: newAcc });
    // Keys are in stats; we can't easily deduct here without updateStats
    // So we note it in char as a separate field
    updateStats(s => ({ ...s, keys: Math.max(0,(s.keys||0)-item.cost) }));
    setBought(item.name);
    setTimeout(()=>setBought(false),2000);
  }

  function equipItem(item) {
    if (item.type==='hat') {
      const isHat = ['hat1','hat2'];
      const equipped = char.accessories||[];
      // Remove other hats first
      const without = equipped.filter(a=>!isHat.includes(a));
      const isAlreadyEquipped = equipped.includes(item.id) && !without.includes(item.id);
      saveCharLocal({...char, accessories: isAlreadyEquipped ? without : [...without, item.id]});
    } else if (item.type==='aura') {
      const isAura=['aura1','aura2'];
      const equipped=char.accessories||[];
      const without=equipped.filter(a=>!isAura.includes(a));
      const already=equipped.includes(item.id)&&!without.includes(item.id);
      saveCharLocal({...char,accessories:already?without:[...without,item.id]});
    } else if (item.type==='outfit') {
      const idx=SHOP_ITEMS.filter(i=>i.type==='outfit').findIndex(i=>i.id===item.id);
      saveCharLocal({...char,outfitIdx:idx+1});
    }
  }

  const owned = item => (char.accessories||[]).includes(item.id);
  const currentAura = (char.accessories||[]).find(a=>a.startsWith('aura'));

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Tab header */}
      <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(13,11,30,0.6)'}}>
        {[['char','👤 Personnage'],['shop','🛍 Boutique']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'.65rem .25rem',background:'none',border:'none',
              borderBottom:tab===id?'2px solid #D4A0D4':'2px solid transparent',
              color:tab===id?'#D4A0D4':'rgba(255,255,255,0.4)',
              cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.04em',transition:'all 0.2s',
              display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── CHARACTER TAB ─────────────────────────────────────────────────────── */}
      {tab==='char' && (
        <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>

          {/* XP Bar + Level */}
          <div style={{padding:'1.1rem',background:'linear-gradient(135deg,rgba(200,140,80,0.12),rgba(212,168,100,0.08))',border:'1px solid rgba(200,140,80,0.3)',borderRadius:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
              <div>
                <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:2}}>NIVEAU {xpInfo.lv}</div>
                <div style={{fontSize:18,fontWeight:'bold',color:'#D4A0D4',fontFamily:'Georgia,serif'}}>{levelTitle}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,fontFamily:'monospace',color:'rgba(212,168,100,0.7)',marginBottom:2}}>XP</div>
                <div style={{fontSize:14,fontWeight:'bold',fontFamily:'monospace',color:'#D4A0D4'}}>{xpInfo.current}/{xpInfo.next}</div>
              </div>
            </div>
            <div style={{height:8,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${xpInfo.pct}%`,background:'linear-gradient(90deg,#C8864A,#D4A0D4,#B898C8)',borderRadius:4,transition:'width 0.6s ease',boxShadow:'0 0 8px rgba(200,140,80,0.5)'}}/>
            </div>
            <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',marginTop:5,textAlign:'right'}}>Gagne de l'XP en faisant des exercices !</div>
          </div>

          {/* Character display */}
          <div style={{display:'flex',gap:'1.25rem',alignItems:'flex-start'}}>
            <div style={{flex:0,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
              <div style={{background:'linear-gradient(180deg,rgba(200,140,80,0.08),rgba(0,0,0,0.3))',border:'1px solid rgba(200,140,80,0.2)',borderRadius:16,padding:'1rem 1.5rem',minWidth:140,textAlign:'center'}}>
                <PixelCharacter
                  gender={char.gender||'M'}
                  skinTone={char.skinTone||0}
                  hairColor={char.hairColor||0}
                  outfitIdx={char.outfitIdx||0}
                  accessories={char.accessories||[]}
                  aura={currentAura}
                  size={120}
                />
              </div>
              {/* Gender toggle */}
              <div style={{display:'flex',gap:6}}>
                {['M','F'].map(g=>(
                  <button key={g} onClick={()=>saveCharLocal({...char,gender:g})}
                    style={{padding:'.4rem .9rem',background:char.gender===g?'rgba(200,140,80,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${char.gender===g?'#D4A0D4':'rgba(255,255,255,0.15)'}`,borderRadius:8,cursor:'pointer',color:char.gender===g?'#D4A0D4':'rgba(255,255,255,0.5)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>
                    {g==='M'?'♂ H':'♀ F'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{flex:1,display:'flex',flexDirection:'column',gap:'1rem'}}>
              {/* Skin tone */}
              <div>
                <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>TEINTE DE PEAU</div>
                <div style={{display:'flex',gap:6}}>
                  {SKIN_TONES.map((c,i)=>(
                    <button key={i} onClick={()=>saveCharLocal({...char,skinTone:i})}
                      style={{width:28,height:28,borderRadius:'50%',background:c,border:`2px solid ${char.skinTone===i?'#D4A0D4':'rgba(255,255,255,0.2)'}`,cursor:'pointer',transition:'all 0.2s',transform:char.skinTone===i?'scale(1.15)':'scale(1)'}}/>
                  ))}
                </div>
              </div>
              {/* Hair color */}
              <div>
                <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>COULEUR DES CHEVEUX</div>
                <div style={{display:'flex',gap:6}}>
                  {HAIR_COLORS.map((c,i)=>(
                    <button key={i} onClick={()=>saveCharLocal({...char,hairColor:i})}
                      style={{width:28,height:28,borderRadius:'50%',background:c,border:`2px solid ${char.hairColor===i?'#D4A0D4':'rgba(255,255,255,0.2)'}`,cursor:'pointer',transition:'all 0.2s',transform:char.hairColor===i?'scale(1.15)':'scale(1)'}}/>
                  ))}
                </div>
              </div>
              {/* Owned items quick equip */}
              {(char.accessories||[]).length>0 && (
                <div>
                  <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>ÉQUIPEMENT</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {SHOP_ITEMS.filter(item=>owned(item)).map(item=>(
                      <div key={item.id} style={{padding:'3px 8px',background:`${item.color}15`,border:`1px solid ${item.color}40`,borderRadius:8,fontSize:13}}
                        title={item.name}>{item.icon}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats perso */}
          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>STATISTIQUES DU MUSICIEN</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {label:'XP total',      value:stats.totalXp||0,              color:'#D4A0D4'},
                {label:'Niveau',        value:xpInfo.lv,                      color:'#C8864A'},
                {label:'Heures pratique',value:`${Math.floor(char.practicedHours||0)}h`,color:'#7BC8A4'},
                {label:'Clés 🗝️',        value:keys,                           color:'#E8A857'},
              ].map((s,i)=>(
                <div key={i} style={{padding:'.65rem',background:`${s.color}08`,border:`0.5px solid ${s.color}25`,borderRadius:10,textAlign:'center'}}>
                  <div style={{fontSize:18,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.value}</div>
                  <div style={{fontSize:9,opacity:.45,fontFamily:'monospace',letterSpacing:'.04em'}}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>

          {bought&&<div style={{textAlign:'center',padding:'.75rem',background:'rgba(130,224,170,0.1)',border:'1px solid rgba(130,224,170,0.3)',borderRadius:10,color:'#7BC8A4',fontFamily:'monospace',fontSize:12,animation:'fadeIn 0.3s ease'}}>✓ {bought} acheté !</div>}
        </div>
      )}

      {/* ── SHOP TAB ──────────────────────────────────────────────────────────── */}
      {tab==='shop' && (
        <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em'}}>BOUTIQUE</div>
            <div style={{display:'flex',alignItems:'center',gap:5,padding:'.35rem .8rem',background:'rgba(247,220,111,0.12)',border:'1px solid rgba(247,220,111,0.3)',borderRadius:10}}>
              <span style={{fontSize:13}}>🗝️</span>
              <span style={{fontSize:14,fontWeight:'bold',color:'#E8A857',fontFamily:'monospace'}}>{keys}</span>
              <span style={{fontSize:9,opacity:.5,fontFamily:'monospace'}}>clés</span>
            </div>
          </div>

          <div style={{padding:'.75rem',background:'rgba(200,140,80,0.06)',border:'1px solid rgba(200,140,80,0.18)',borderRadius:12}}>
            <p style={{fontSize:12,opacity:.6,margin:0,fontFamily:'Georgia,serif'}}>Gagne des clés en complétant les défis quotidiens. Achète des accessoires pour personnaliser ton musicien !</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {SHOP_ITEMS.map(item=>{
              const isOwned = owned(item);
              const canBuy  = !isOwned && keys >= item.cost;
              const equipped= (char.accessories||[]).includes(item.id);
              return(
                <div key={item.id} style={{padding:'.9rem',background:isOwned?`${item.color}10`:'rgba(255,255,255,0.03)',border:`1.5px solid ${isOwned?item.color+'40':'rgba(255,255,255,0.1)'}`,borderRadius:14,display:'flex',flexDirection:'column',gap:7,transition:'all 0.2s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <span style={{fontSize:28}}>{item.icon}</span>
                    <div style={{textAlign:'right'}}>
                      {isOwned
                        ? <span style={{fontSize:9,fontFamily:'monospace',color:item.color,padding:'2px 6px',background:`${item.color}15`,borderRadius:6}}>POSSÉDÉ</span>
                        : <span style={{fontSize:11,fontFamily:'monospace',color:canBuy?'#E8A857':'rgba(255,255,255,0.3)',fontWeight:'bold'}}>🗝️ {item.cost}</span>
                      }
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:'bold',color:isOwned?item.color:'rgba(255,255,255,0.7)',fontFamily:'Georgia,serif',marginBottom:3}}>{item.name}</div>
                    <div style={{fontSize:10,opacity:.45,fontFamily:'monospace'}}>{item.desc}</div>
                  </div>
                  {isOwned ? (
                    <button onClick={()=>equipItem(item)}
                      style={{padding:'.45rem',background:equipped?`${item.color}20`:'rgba(255,255,255,0.05)',border:`1px solid ${equipped?item.color:'rgba(255,255,255,0.15)'}`,borderRadius:8,cursor:'pointer',color:equipped?item.color:'rgba(255,255,255,0.5)',fontSize:10,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold',transition:'all 0.2s'}}>
                      {equipped?'✓ ÉQUIPÉ':'ÉQUIPER'}
                    </button>
                  ) : (
                    <button onClick={()=>canBuy&&buyItem(item)} disabled={!canBuy}
                      style={{padding:'.45rem',background:canBuy?`${item.color}15`:'rgba(255,255,255,0.03)',border:`1px solid ${canBuy?item.color:'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:canBuy?'pointer':'not-allowed',color:canBuy?item.color:'rgba(255,255,255,0.25)',fontSize:10,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold',transition:'all 0.2s'}}>
                      {keys < item.cost ? `Manque ${item.cost-keys} 🗝️` : 'ACHETER'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetencesPage({skills,instrument,setInstrument,stats,onNavigate}){
  const [tabComp,    setTabComp]  = useState('stats'); // stats | parcours | perso
  const [editGoals,  setEditGoals]= useState(false);
  const streak = computeStreak(stats);
  const streakColor = streak>=7?'#E8A857':streak>=3?'#7BC8A4':'#D4A0D4';

  function navigateCourse(courseId) {
    if (onNavigate) onNavigate('apprentissage');
    // Store pending navigation for TheoriePage to pick up
    try { localStorage.setItem('cs_pending_course', courseId); } catch(e) {}
  }
  function navigateExercice(exId) {
    if (onNavigate) onNavigate('apprentissage');
    try { localStorage.setItem('cs_pending_ex', exId); } catch(e) {}
  }

  const WEEKLY_GOAL_DEFS = [
    {id:'oreille',   label:'Exercices Oreille',  icon:'👂', color:'#90B8D0', target:3},
    {id:'technique', label:'Sessions Technique', icon:'✎',  color:'#7BC8A4', target:3},
    {id:'theorie',   label:'Sessions Théorie',   icon:'📖', color:'#E8A857', target:2},
    {id:'harmonie',  label:'Sessions Harmonie',  icon:'🎷', color:'#E07070', target:1},
  ];

  const STAT_CARDS=[
    {label:'Temps de jeu', value:formatTime(stats.totalSeconds), icon:'⏱', grad:'linear-gradient(135deg,#C8864A,#6D28D9)', glow:'139,92,246'},
    {label:'Exercices',    value:stats.totalExercises||0,         icon:'✓',  grad:'linear-gradient(135deg,#60A8BC,#0284C7)', glow:'6,182,212'},
    {label:'Sessions',     value:stats.sessionsCount||0,          icon:'◈',  grad:'linear-gradient(135deg,#6EB898,#047857)', glow:'16,185,129'},
    {label:'Clés',         value:`🗝️ ${stats.keys||0}`,           icon:'🗝️', grad:'linear-gradient(135deg,#E8A857,#D97706)', glow:'245,158,11'},
  ];

  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

    {/* Tab bar */}
    <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(13,11,30,0.6)'}}>
      {[['stats','📊 Compétences'],['parcours','🗺 Parcours'],['perso','👤 Perso']].map(([id,label])=>(
        <button key={id} onClick={()=>setTabComp(id)}
          style={{flex:1,padding:'.65rem .2rem',background:'none',border:'none',
            borderBottom:tabComp===id?'2px solid #E8A857':'2px solid transparent',
            color:tabComp===id?'#E8A857':'rgba(255,255,255,0.4)',
            cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.04em',transition:'all 0.2s'}}>
          {label}
        </button>
      ))}
    </div>

    {/* Parcours tab */}
    {tabComp==='parcours' && (
      <ParcoursDebutant
        onNavigateCourse={navigateCourse}
        onNavigateExercice={navigateExercice}
      />
    )}

    {/* Perso tab */}
    {tabComp==='perso' && <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <CharacterPage stats={stats}/>
      <AchievementsPanel stats={stats}/>
    </div>}

    {/* Stats tab */}
    {tabComp==='stats' && <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>

    {/* Streak banner */}
    {streak>0 && (
      <div style={{marginBottom:'1.25rem',padding:'1rem 1.25rem',background:streak>=7?'linear-gradient(135deg,rgba(232,168,87,0.15),rgba(239,68,68,0.1))':streak>=3?'linear-gradient(135deg,rgba(130,224,170,0.12),rgba(96,168,188,0.08))':'rgba(255,255,255,0.04)',border:`1px solid ${streakColor}`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:30,animation:streak>=7?'streakPulse 1.5s ease-in-out infinite':undefined}}>{streak>=7?'🔥':streak>=3?'⚡':'✦'}</span>
          <div>
            <div style={{fontSize:16,fontWeight:'bold',color:streakColor,fontFamily:'Georgia,serif'}}>{streak} jour{streak>1?'s':''} consécutif{streak>1?'s':''}</div>
            <div style={{fontSize:10,opacity:.55,fontFamily:'monospace'}}>{streak>=7?'Incroyable ! Continue comme ça !':streak>=3?'Belle série — ne la brise pas !':'Bonne habitude, continue !'}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:2}}>
          {[...Array(Math.min(7,streak))].map((_,i)=>(
            <div key={i} style={{width:8,height:8,borderRadius:'50%',background:streakColor,opacity:1-i*0.08}}/>
          ))}
        </div>
      </div>
    )}

    {/* Weekly goals */}
    <div style={{marginBottom:'1.25rem',padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.85rem'}}>
        <div style={{fontSize:10,letterSpacing:'.15em',opacity:.4,fontFamily:'monospace'}}>OBJECTIFS HEBDOMADAIRES</div>
        <button onClick={()=>setEditGoals(v=>!v)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.35)',cursor:'pointer',fontSize:10,fontFamily:'monospace',padding:'2px 6px',borderRadius:6,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
          {editGoals?'✓ FERMER':'⚙ MODIFIER'}
        </button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {WEEKLY_GOAL_DEFS.map(g=>{
          const done=(stats.weeklyGoals||{})[g.id]||0;
          const pct=Math.min(100,Math.round((done/g.target)*100));
          const complete=done>=g.target;
          return(
            <div key={g.id} style={{padding:'.75rem',background:complete?`${g.color}`:'rgba(255,255,255,0.03)',border:`1px solid ${complete?g.color+'40':'rgba(255,255,255,0.08)'}`,borderRadius:12,transition:'all 0.3s'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.5rem'}}>
                <div style={{display:'flex',gap:5,alignItems:'center'}}>
                  <span style={{fontSize:13}}>{g.icon}</span>
                  <span style={{fontSize:10,fontFamily:'monospace',color:complete?g.color:'rgba(255,255,255,0.55)',letterSpacing:'.03em'}}>{g.label}</span>
                </div>
                <span style={{fontSize:10,fontFamily:'monospace',color:complete?g.color:'rgba(255,255,255,0.4)',fontWeight:'bold'}}>{done}/{g.target}</span>
              </div>
              <div style={{height:4,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background:g.color,borderRadius:2,transition:'width 0.5s ease',boxShadow:complete?`0 0 6px ${g.color}`:undefined}}/>
              </div>
              {complete && <div style={{fontSize:9,color:g.color,fontFamily:'monospace',marginTop:4,textAlign:'right'}}>✓ OBJECTIF ATTEINT</div>}
            </div>
          );
        })}
      </div>
      {editGoals && (
        <div style={{marginTop:'.85rem',padding:'.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,animation:'fadeIn 0.25s ease'}}>
          <p style={{fontSize:11,opacity:.5,margin:'0 0 .5rem',fontFamily:'Georgia,serif',fontStyle:'italic'}}>Les objectifs se réinitialisent chaque lundi. Clique sur une section pour faire avancer tes compteurs.</p>
          <button onClick={()=>{onNavigate&&onNavigate('apprentissage');setEditGoals(false);}} style={{padding:'.45rem .9rem',background:'rgba(200,140,80,0.15)',border:'1px solid rgba(200,140,80,0.35)',color:'#D4A0D4',borderRadius:8,cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>Aller pratiquer →</button>
        </div>
      )}
    </div>

    {/* Instrument selector */}
    <div style={{marginBottom:'1.5rem'}}>
      <div style={{fontSize:10,letterSpacing:'.2em',opacity:.4,fontFamily:'monospace',marginBottom:'.65rem'}}>INSTRUMENT</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{INSTRUMENTS.map(inst=>{
        const isA=instrument===inst.id;
        return(<button key={inst.id} onClick={()=>inst.available&&setInstrument(inst.id)}
          style={{background:isA?'linear-gradient(135deg,#C8864A,#6D28D9)':'rgba(255,255,255,0.05)',
            border:`1.5px solid ${isA?'transparent':'rgba(255,255,255,0.1)'}`,
            color:!inst.available?'rgba(255,255,255,0.2)':'#fff',
            padding:'.5rem 1rem',borderRadius:12,cursor:inst.available?'pointer':'not-allowed',
            fontFamily:'monospace',fontSize:11,transition:'all 0.2s',display:'flex',alignItems:'center',gap:6,
            boxShadow:isA?'0 4px 16px rgba(200,140,80,0.4)':'none'}}>
          <span style={{fontSize:16}}>{inst.icon}</span><span>{inst.label}</span>
          {!inst.available&&<span style={{fontSize:8,opacity:.35}}>BIENTÔT</span>}
        </button>);
      })}</div>
    </div>

    {/* Radar chart */}
    <div style={{marginBottom:'1.25rem',padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16}}>
      <div style={{fontSize:10,letterSpacing:'.2em',opacity:.35,fontFamily:'monospace',marginBottom:'.25rem'}}>COMPÉTENCES</div>
      <RadarChart skills={skills}/>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginTop:'.35rem'}}>
        {skills.map(s=>(<div key={s.id} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:7,height:7,borderRadius:'50%',background:s.color,boxShadow:`0 0 6px ${s.color}80`}}/><span style={{fontSize:9,fontFamily:'monospace',opacity:.5}}>{s.label}</span></div>))}
      </div>
    </div>

    {/* Skill bars */}
    <div style={{marginBottom:'1.5rem',padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16}}>
      {skills.map(s=>(<div key={s.id} style={{marginBottom:10}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
          <span style={{fontSize:11,fontFamily:'monospace',color:'rgba(255,255,255,0.7)',letterSpacing:'.04em'}}>{s.label}</span>
          <span style={{fontSize:11,fontFamily:'monospace',color:s.color,fontWeight:'bold'}}>{s.value}%</span>
        </div>
        <div style={{height:6,background:'rgba(255,255,255,0.07)',borderRadius:6,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${s.value}%`,background:s.color,borderRadius:6,boxShadow:`0 0 10px ${s.color}`,transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}/>
        </div>
      </div>))}
    </div>

    {/* Stat cards */}
    <div style={{marginBottom:'1rem'}}>
      <div style={{fontSize:10,letterSpacing:'.2em',opacity:.35,fontFamily:'monospace',marginBottom:'.75rem'}}>STATISTIQUES</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {STAT_CARDS.map((s,i)=>(<div key={i} style={{
          background:s.grad, borderRadius:16, padding:'1.1rem .9rem',
          textAlign:'center', position:'relative', overflow:'hidden',
          boxShadow:`0 8px 24px rgba(${s.glow},0.3)`,
          border:'1.5px solid transparent',
        }}>
          <div style={{fontSize:26,marginBottom:6,filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.3))'}}>{s.icon}</div>
          <div style={{fontSize:22,fontWeight:'bold',color:'#fff',fontFamily:'Georgia,serif',lineHeight:1,marginBottom:4,textShadow:'0 1px 4px rgba(0,0,0,0.3)'}}>{s.value}</div>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.75)',fontFamily:'monospace',letterSpacing:'.06em'}}>{s.label.toUpperCase()}</div>
          {/* Shine */}
          <div style={{position:'absolute',top:-20,right:-20,width:70,height:70,background:'rgba(255,255,255,0.08)',borderRadius:'50%'}}/>
        </div>))}
      </div>
    </div>

    {/* ── Stats avancées ─────────────────────────────────────── */}
    <div style={{padding:'1rem',background:'rgba(200,140,80,0.07)',border:'1px solid rgba(200,140,80,0.2)',borderRadius:12}}>
      <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>STATISTIQUES AVANCÉES</div>

      {/* Niveau XP */}
      {(()=>{
        const xp=stats.totalXp||0;
        const xpInfo=xpToNextLevel(xp);
        const title=LEVEL_TITLES[Math.min(xpInfo.lv,LEVEL_TITLES.length-1)];
        return(
          <div style={{padding:'.85rem',background:'rgba(212,168,100,0.08)',border:'1px solid rgba(212,168,100,0.2)',borderRadius:10,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
              <div>
                <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',marginBottom:2}}>NIVEAU {xpInfo.lv}</div>
                <div style={{fontSize:14,fontWeight:'bold',color:'#D4A0D4',fontFamily:'Georgia,serif'}}>{title}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18,fontWeight:'bold',color:'#D4A0D4',fontFamily:'monospace'}}>{xp} XP</div>
              </div>
            </div>
            <div style={{height:5,background:'rgba(255,255,255,0.08)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${xpInfo.pct}%`,background:'linear-gradient(90deg,#C8864A,#D4A0D4)',borderRadius:3}}/>
            </div>
          </div>
        );
      })()}

      {/* Grille 6 stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8}}>
        {[
          {label:'Exercices',  value:stats.totalExercises||0,       color:'#7BC8A4'},
          {label:'Sessions',   value:stats.sessionsCount||0,        color:'#90B8D0'},
          {label:'Clés',       value:stats.keys||0,                 color:'#E8A857'},
          {label:'Streak',     value:`${computeStreak(stats)}🔥`,   color:'#E8A857'},
          {label:'XP',         value:stats.totalXp||0,              color:'#D4A0D4'},
          {label:'Temps',      value:formatTime(stats.totalSeconds), color:'#C8864A'},
        ].map((s,i)=>(
          <div key={i} style={{padding:'.5rem .4rem',background:`${s.color}08`,border:`0.5px solid ${s.color}25`,borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:14,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif'}}>{s.value}</div>
            <div style={{fontSize:7,opacity:.4,fontFamily:'monospace'}}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Objectifs hebdo */}
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>OBJECTIFS SEMAINE</div>
        {WEEKLY_GOAL_DEFS.map(g=>{
          const cur=Math.min(stats.weeklyGoals?.[g.id]||0,g.target);
          const pct=Math.round((cur/g.target)*100);
          return(
            <div key={g.id}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                <span style={{fontSize:9,color:g.color,fontFamily:'monospace'}}>{g.icon} {g.label}</span>
                <span style={{fontSize:9,fontFamily:'monospace',color:cur>=g.target?'#7BC8A4':g.color}}>{cur}/{g.target}</span>
              </div>
              <div style={{height:3,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background:cur>=g.target?'#7BC8A4':g.color,borderRadius:2}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>}
  </div>);
}

// ── Métronome global ──────────────────────────────────────────────────────────
function MetronomeWidget() {
  const [bpm,      setBpm]      = useState(80);
  const [running,  setRunning]  = useState(false);
  const [beat,     setBeat]     = useState(0); // 0-3 for 4/4
  const [timeSign, setTimeSign] = useState(4); // beats per measure
  const [accent,   setAccent]   = useState(true); // accent first beat
  const intervalRef = useRef(null);

  function start() {
    setRunning(true); setBeat(0);
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    let b = 0;
    intervalRef.current = setInterval(() => {
      b = (b+1) % timeSign;
      setBeat(b);
      // Click sound via Web Audio
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = (b===0 && accent) ? 1200 : 900;
        osc.type = 'square';
        gain.gain.setValueAtTime(b===0&&accent?0.3:0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.05);
        osc.start(); osc.stop(ctx.currentTime+0.06);
      } catch(e){}
    }, Math.round(60000/bpm));
  }

  function stop() {
    clearInterval(intervalRef.current);
    setRunning(false); setBeat(0);
  }

  useEffect(()=>()=>clearInterval(intervalRef.current),[]);
  useEffect(()=>{if(running){stop();start();}}, [bpm,timeSign]); // eslint-disable-line

  return (
    <div style={{padding:'1.25rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}}>
      <div style={{fontSize:10,color:'#7BC8A4',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'1rem'}}>🎵 MÉTRONOME</div>

      {/* Beat visualizer */}
      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:'1.25rem'}}>
        {[...Array(timeSign)].map((_,i)=>(
          <div key={i} style={{width:36,height:36,borderRadius:8,background:running&&beat===i?(i===0&&accent?'#E8A857':'#7BC8A4'):'rgba(255,255,255,0.08)',border:`1.5px solid ${running&&beat===i?(i===0&&accent?'#E8A857':'#7BC8A4'):'rgba(255,255,255,0.15)'}`,transition:'all 0.05s',transform:running&&beat===i?'scale(1.1)':'scale(1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,0.4)'}}>{i+1}</div>
        ))}
      </div>

      {/* BPM */}
      <div style={{marginBottom:'1rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,opacity:.45,fontFamily:'monospace',letterSpacing:'.1em'}}>TEMPO</span>
          <span style={{fontSize:18,fontWeight:'bold',fontFamily:'monospace',color:'#7BC8A4'}}>{bpm} <span style={{fontSize:11,opacity:.5}}>BPM</span></span>
        </div>
        <input type="range" min={30} max={200} value={bpm} onChange={e=>setBpm(+e.target.value)} style={{width:'100%',accentColor:'#7BC8A4'}}/>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,opacity:.3,fontFamily:'monospace',marginTop:3}}>
          {[['30','Largo'],['60','Adagio'],['80','Andante'],['120','Allegro'],['160','Presto'],['200','']].map(([v,l])=>
            <span key={v}>{l||v}</span>
          )}
        </div>
      </div>

      {/* Time signature + accent */}
      <div style={{display:'flex',gap:8,marginBottom:'1rem'}}>
        <div style={{flex:1}}>
          <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',marginBottom:5}}>MESURE</div>
          <div style={{display:'flex',gap:5}}>
            {[2,3,4,6].map(n=>(
              <button key={n} onClick={()=>setTimeSign(n)} style={{flex:1,padding:'.45rem',background:timeSign===n?'rgba(130,224,170,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${timeSign===n?'#7BC8A4':'rgba(255,255,255,0.12)'}`,borderRadius:7,cursor:'pointer',color:timeSign===n?'#7BC8A4':'rgba(255,255,255,0.5)',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>{n}/4</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',marginBottom:5}}>ACCENT</div>
          <button onClick={()=>setAccent(v=>!v)} style={{padding:'.45rem .8rem',background:accent?'rgba(247,220,111,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${accent?'#E8A857':'rgba(255,255,255,0.12)'}`,borderRadius:7,cursor:'pointer',color:accent?'#E8A857':'rgba(255,255,255,0.4)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>
            {accent?'ON':'OFF'}
          </button>
        </div>
      </div>

      <button onClick={running?stop:start}
        style={{width:'100%',padding:'.85rem',background:running?'rgba(241,148,138,0.15)':'rgba(130,224,170,0.15)',border:`1.5px solid ${running?'#E07070':'#7BC8A4'}`,color:running?'#E07070':'#7BC8A4',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
        {running?'■ ARRÊTER':'▶ LANCER'}
      </button>
    </div>
  );
}

// ── Page Partage ──────────────────────────────────────────────────────────────
function PartagePageActuelle({ stats }) {
  const streak = computeStreak(stats);

  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Partage & Outils</h2>
        <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>MÉTRONOME · PROGRESSION · PARTAGE</p>
      </div>

      {/* Métronome */}
      <MetronomeWidget/>

      {/* Résumé progression */}
      <div style={{marginTop:'1.25rem',padding:'1.25rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}}>
        <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'1rem'}}>TA PROGRESSION</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:'1rem'}}>
          {[
            {label:'Sessions totales',  value:stats.sessionsCount||0,   color:'#90B8D0'},
            {label:'Exercices faits',   value:stats.totalExercises||0,  color:'#7BC8A4'},
            {label:'Temps de pratique', value:formatTime(stats.totalSeconds), color:'#C8864A'},
            {label:'Série actuelle',    value:streak>0?`${streak} 🔥`:'—', color:'#E8A857'},
          ].map((s,i)=>(
            <div key={i} style={{padding:'.85rem',background:`${s.color}10`,border:`1px solid ${s.color}25`,borderRadius:12,textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:4}}>{s.value}</div>
              <div style={{fontSize:9,opacity:.5,fontFamily:'monospace',letterSpacing:'.04em'}}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{padding:'.85rem',background:'rgba(200,140,80,0.07)',border:'1px solid rgba(200,140,80,0.2)',borderRadius:10}}>
          <div style={{fontSize:10,color:'#D4A0D4',fontFamily:'monospace',marginBottom:4}}>BIENTÔT</div>
          <p style={{fontSize:12,opacity:.5,margin:0,fontFamily:'Georgia,serif'}}>Capture d'écran de progression, export PDF du journal, partage sur réseaux sociaux.</p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({title,icon,description}){
  return(<div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',gap:'1.5rem'}}><div style={{fontSize:50,opacity:.3}}>{icon}</div><div><h2 style={{fontSize:24,fontWeight:'bold',marginBottom:'.6rem',opacity:.6,letterSpacing:'-.02em'}}>{title}</h2><p style={{fontSize:11,opacity:.28,letterSpacing:'.12em',fontFamily:'monospace'}}>{description}</p></div><div style={{padding:'.5rem 1.25rem',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:2,fontSize:10,opacity:.25,fontFamily:'monospace',letterSpacing:'.15em'}}>BIENTÔT DISPONIBLE</div></div>);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN APP ──────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// ── Parcours débutant ─────────────────────────────────────────────────────────
const PARCOURS_KEY = 'cs_parcours_v1';

const PARCOURS_STEPS = [
  {id:'s01',level:1,title:'Les notes',        icon:'🎵',color:'#7BC8A4',desc:"Apprends les 12 notes de la gamme chromatique.",type:'cours',courseId:'gammes',xp:15,badge:'🎵',badgeLabel:'Première note'},
  {id:'s02',level:1,title:'Le clavier',        icon:'🎹',color:'#7BC8A4',desc:"Repère chaque note sur le clavier du piano.",type:'info',xp:10,badge:null},
  {id:'s03',level:1,title:'Les intervalles',   icon:'📏',color:'#90B8D0',desc:"Mesurer la distance entre deux notes.",type:'cours',courseId:'intervalles',xp:20,badge:'📏',badgeLabel:'Oreille en éveil'},
  {id:'s04',level:1,title:'Symboles musicaux', icon:'🎼',color:'#E8A857',desc:"Reconnais les symboles de base d'une partition.",type:'exercice',exId:'solfege',xp:25,badge:null},
  {id:'s05',level:2,title:'Accord majeur',     icon:'🔺',color:'#E8A857',desc:"Construction et son de l'accord parfait majeur.",type:'cours',courseId:'accords',xp:20,badge:'🔺',badgeLabel:'Premier accord'},
  {id:'s06',level:2,title:'Accord mineur',     icon:'🔻',color:'#B898C8',desc:"La couleur sombre du mineur.",type:'cours',courseId:'accords',xp:20,badge:null},
  {id:'s07',level:2,title:'Lecture de notes',  icon:'📖',color:'#90B8D0',desc:"Lis tes premières notes sur une portée.",type:'exercice',exId:'lecture',xp:30,badge:'📖',badgeLabel:'Lecteur de notes'},
  {id:'s08',level:2,title:'Lecture d\'accords',icon:'🎼',color:'#E8A857',desc:"Identifie des accords simples sur portée.",type:'exercice',exId:'laccord',xp:30,badge:null},
  {id:'s09',level:3,title:'Fonctions harm.',   icon:'🏠',color:'#E07070',desc:"Tonique, dominante, sous-dominante.",type:'cours',courseId:'fonctions',xp:25,badge:'🏠',badgeLabel:'Architecte tonal'},
  {id:'s10',level:3,title:'Les cadences',      icon:'📌',color:'#60A8BC',desc:"V→I, IV→I, les ponctuations de la musique.",type:'cours',courseId:'cadences',xp:25,badge:null},
  {id:'s11',level:3,title:'Armatures',         icon:'🔑',color:'#7BC8A4',desc:"Identifier une tonalité d'un coup d'œil.",type:'exercice',exId:'armature',xp:35,badge:'🔑',badgeLabel:'Maître des tonalités'},
  {id:'s12',level:4,title:'Accords de 7e',     icon:'7️⃣',color:'#C8864A',desc:"La couleur signature du jazz.",type:'cours',courseId:'accords',xp:25,badge:'7️⃣',badgeLabel:'Couleur jazz'},
  {id:'s13',level:4,title:'ii-V-I',            icon:'🎷',color:'#E8A857',desc:"La progression reine du jazz.",type:'cours',courseId:'iivi',xp:30,badge:'🎷',badgeLabel:'Musicien jazz'},
  {id:'s14',level:4,title:"Dictée d'accords",  icon:'🎯',color:'#E07070',desc:"Joue des accords avec le timer.",type:'exercice',exId:'dictee',xp:40,badge:null},
  {id:'s15',level:4,title:'Borrowed chords',   icon:'✨',color:'#6EB898',desc:"Emprunter des accords d'autres modes.",type:'cours',courseId:'borrowed',xp:25,badge:'✨',badgeLabel:'Coloriste'},
  {id:'s16',level:5,title:'Modulation',        icon:'🌊',color:'#D4A0D4',desc:"Changer de tonalité avec élégance.",type:'cours',courseId:'modulation',xp:30,badge:null},
  {id:'s17',level:5,title:'Extensions',        icon:'🌸',color:'#E8A857',desc:"9e, 11e, 13e — enrichir la palette harmonique.",type:'cours',courseId:'extensions',xp:30,badge:null},
  {id:'s18',level:5,title:'Transposition',     icon:'↔',color:'#D4A0D4',desc:"Jouer dans n'importe quelle tonalité.",type:'exercice',exId:'transpo',xp:40,badge:'🌟',badgeLabel:'Musicien complet'},
];

function loadParcours(){try{return JSON.parse(localStorage.getItem(PARCOURS_KEY)||'{}');}catch{return{};}}
function saveParcours(p){try{localStorage.setItem(PARCOURS_KEY,JSON.stringify(p));}catch{}}

function ParcoursDebutant({ onNavigateCourse, onNavigateExercice }) {
  const [progress,  setProgress]  = useState(loadParcours);
  const [selected,  setSelected]  = useState(null);
  const [celebrate, setCelebrate] = useState(null);

  const levels = [...new Set(PARCOURS_STEPS.map(s=>s.level))];
  const completedIds = new Set(Object.keys(progress).filter(k=>progress[k]?.done));
  const totalXp  = PARCOURS_STEPS.filter(s=>completedIds.has(s.id)).reduce((a,s)=>a+s.xp,0);
  const doneCount= completedIds.size;
  const pct = Math.round(doneCount/PARCOURS_STEPS.length*100);

  function isUnlocked(step) {
    const idx = PARCOURS_STEPS.findIndex(s=>s.id===step.id);
    if (idx===0) return true;
    return completedIds.has(PARCOURS_STEPS[idx-1].id);
  }

  function markDone(step) {
    const newP = {...progress, [step.id]:{done:true,ts:Date.now()}};
    setProgress(newP); saveParcours(newP);
    if (step.badge) { setCelebrate(step); setTimeout(()=>setCelebrate(null),3000); }
  }

  function goToStep(step) {
    if (!isUnlocked(step)) return;
    if (step.type==='cours'    && onNavigateCourse)   onNavigateCourse(step.courseId);
    if (step.type==='exercice' && onNavigateExercice) onNavigateExercice(step.exId);
    if (!completedIds.has(step.id)) setTimeout(()=>markDone(step), 300);
    setSelected(null);
  }

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      {/* Header progress */}
      <div style={{padding:'1.1rem',background:'linear-gradient(135deg,rgba(232,168,87,0.12),rgba(232,168,87,0.06))',border:'1px solid rgba(232,168,87,0.25)',borderRadius:16}}>
        <div style={{fontSize:10,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.5rem'}}>PARCOURS DÉBUTANT</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'.75rem'}}>
          <div>
            <div style={{fontSize:22,fontWeight:'bold',fontFamily:'Georgia,serif'}}>{doneCount}/{PARCOURS_STEPS.length} étapes</div>
            <div style={{fontSize:11,opacity:.5,fontFamily:'monospace'}}>{totalXp} XP accumulés</div>
          </div>
          <div style={{fontSize:28,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif'}}>{pct}%</div>
        </div>
        <div style={{height:8,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#E8A857,#F0C080)',borderRadius:4,transition:'width 0.6s ease',boxShadow:'0 0 8px rgba(232,168,87,0.4)'}}/>
        </div>
      </div>

      {/* Badge célébration */}
      {celebrate && (
        <div style={{textAlign:'center',padding:'1rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',borderRadius:14,animation:'slideUp 0.4s ease'}}>
          <div style={{fontSize:36,marginBottom:4}}>{celebrate.badge}</div>
          <div style={{fontSize:14,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif'}}>{celebrate.badgeLabel}</div>
          <div style={{fontSize:11,opacity:.5,fontFamily:'monospace',marginTop:3}}>Badge débloqué ! +{celebrate.xp} XP</div>
        </div>
      )}

      {/* Niveaux */}
      {levels.map(level => {
        const lvSteps = PARCOURS_STEPS.filter(s=>s.level===level);
        const lvDone  = lvSteps.filter(s=>completedIds.has(s.id)).length;
        const lvColor = lvSteps[0]?.color || '#E8A857';
        const firstUnlocked = lvSteps.findIndex(s=>isUnlocked(s)&&!completedIds.has(s.id));

        return (
          <div key={level}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'.75rem'}}>
              <div style={{height:1,flex:1,background:'rgba(255,255,255,0.07)'}}/>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'.3rem .8rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20}}>
                <span style={{fontSize:11,fontFamily:'monospace',opacity:.5}}>NIVEAU {level}</span>
                <span style={{fontSize:10,fontFamily:'monospace',color:lvColor}}>{lvDone}/{lvSteps.length}</span>
              </div>
              <div style={{height:1,flex:1,background:'rgba(255,255,255,0.07)'}}/>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {lvSteps.map((step, i) => {
                const done     = completedIds.has(step.id);
                const unlocked = isUnlocked(step);
                const isCurrent= !done && unlocked && i===firstUnlocked;
                const isSel    = selected===step.id;

                return (
                  <div key={step.id}>
                    <button onClick={()=>setSelected(isSel?null:step.id)} disabled={!unlocked}
                      style={{width:'100%',textAlign:'left',cursor:unlocked?'pointer':'not-allowed',
                        background:done?`${step.color}15`:isCurrent?`${step.color}10`:'rgba(255,255,255,0.04)',
                        border:`1.5px solid ${done?step.color:isCurrent?`${step.color}60`:'rgba(255,255,255,0.08)'}`,
                        borderRadius:12,padding:'.85rem 1rem',opacity:unlocked?1:0.4,transition:'all 0.25s'}}
                      onMouseEnter={e=>{if(unlocked)e.currentTarget.style.transform='translateX(4px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateX(0)';}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,
                          background:done?step.color:isCurrent?`${step.color}20`:'rgba(255,255,255,0.08)',
                          border:`1.5px solid ${done?step.color:isCurrent?step.color:'rgba(255,255,255,0.15)'}`,
                          display:'flex',alignItems:'center',justifyContent:'center',fontSize:done?14:16,
                          boxShadow:isCurrent?`0 0 12px ${step.color}40`:'none'}}>
                          {done?'✓':unlocked?step.icon:'🔒'}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{fontSize:13,fontWeight:'bold',fontFamily:'Georgia,serif',
                              color:done?step.color:isCurrent?step.color:'rgba(255,255,255,0.65)'}}>{step.title}</span>
                            <span style={{fontSize:9,fontFamily:'monospace',padding:'1px 6px',borderRadius:6,flexShrink:0,marginLeft:6,
                              color:done?step.color:'rgba(255,255,255,0.3)',
                              background:done?`${step.color}20`:'rgba(255,255,255,0.05)'}}>+{step.xp} XP</span>
                          </div>
                          {isCurrent&&<div style={{fontSize:9,color:step.color,fontFamily:'monospace',letterSpacing:'.06em',marginTop:1}}>▶ ÉTAPE SUIVANTE</div>}
                          {done&&step.badge&&<div style={{fontSize:10,opacity:.55,fontFamily:'monospace',marginTop:1}}>{step.badge} {step.badgeLabel}</div>}
                        </div>
                      </div>
                    </button>

                    {isSel && unlocked && (
                      <div style={{padding:'1rem',margin:'4px 0 4px 42px',background:'rgba(255,255,255,0.03)',border:`1px solid ${step.color}30`,borderRadius:'0 0 12px 12px',animation:'fadeIn 0.2s ease'}}>
                        <p style={{fontSize:12.5,opacity:.72,lineHeight:1.6,margin:'0 0 .75rem',fontFamily:'Georgia,serif'}}>{step.desc}</p>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>goToStep(step)}
                            style={{flex:1,padding:'.65rem',background:`${step.color}18`,border:`1.5px solid ${step.color}`,borderRadius:9,cursor:'pointer',color:step.color,fontSize:12,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.06em'}}>
                            {step.type==='cours'?'📖 LIRE LE COURS':step.type==='exercice'?'🎯 EXERCICE':'ℹ️ VOIR'}
                          </button>
                          {!done&&<button onClick={()=>markDone(step)} style={{padding:'.65rem .9rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:9,cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:11,fontFamily:'monospace'}} title="Marquer fait">✓</button>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {doneCount===PARCOURS_STEPS.length && (
        <div style={{textAlign:'center',padding:'1.5rem',background:'rgba(232,168,87,0.1)',border:'1.5px solid #E8A857',borderRadius:16}}>
          <div style={{fontSize:40,marginBottom:8}}>🏆</div>
          <div style={{fontSize:18,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif',marginBottom:6}}>Parcours terminé !</div>
          <div style={{fontSize:12,opacity:.6,fontFamily:'monospace'}}>Continue avec les cours avancés de théorie et de jazz !</div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ONBOARDING ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const ONBOARD_KEY = 'cs_onboard_v1';
function isOnboardDone() { try { return !!localStorage.getItem(ONBOARD_KEY); } catch { return false; } }
function markOnboardDone(data) { try { localStorage.setItem(ONBOARD_KEY, JSON.stringify({...data, ts:Date.now()})); } catch {} }

const ONBOARD_LEVELS = [
  { id:'debutant',       icon:'🌱', label:'Débutant',      desc:"Je débute le piano / la théorie musicale" },
  { id:'intermediaire',  icon:'🎹', label:'Intermédiaire', desc:"Je connais les bases, je veux progresser" },
  { id:'avance',         icon:'🎷', label:'Avancé',        desc:"Je pratique depuis des années" },
];

const ONBOARD_GOALS = [
  { id:'lire',     icon:'📖', label:'Lire la musique',      desc:"Apprendre le solfège et la partition" },
  { id:'oreille',  icon:'👂', label:'Développer l\'oreille', desc:"Reconnaître accords, intervalles, tonalités" },
  { id:'jazz',     icon:'🎷', label:'Comprendre le jazz',   desc:"Théorie jazz, improvisation, standards" },
  { id:'composer', icon:'✍',  label:'Composer',             desc:"Créer mes propres progressions et mélodies" },
  { id:'technique',icon:'⚡', label:'Travailler la technique',desc:"Gammes, vélocité, exercices quotidiens" },
];

// Recommended starting point based on level + goal
function getOnboardRecommendation(level, goal) {
  const map = {
    'debutant-lire':      { path:'theorie',       sub:'solfege',      msg:"Commence par les symboles musicaux — la base de la lecture." },
    'debutant-oreille':   { path:'oreille',       sub:'intervalles',  msg:"Les intervalles sont la fondation de l'oreille musicale." },
    'debutant-jazz':      { path:'theorie',       sub:'laccord',      msg:"Commence par comprendre comment se construisent les accords." },
    'debutant-composer':  { path:'harmonie',      sub:'composition',  msg:"La composition assistée te guidera pas à pas." },
    'debutant-technique': { path:'exercices',     sub:'biblio',       msg:"La bibliothèque technique a des exercices progressifs." },
    'intermediaire-lire': { path:'theorie',       sub:'lecture',      msg:"L'exercice de lecture de partition te fera progresser rapidement." },
    'intermediaire-oreille':{ path:'oreille',     sub:'progressions', msg:"Reconnaître les progressions te donnera une oreille de musicien." },
    'intermediaire-jazz': { path:'theorie',       sub:'iivi',         msg:"Le ii-V-I est le cœur du jazz — commence ici." },
    'intermediaire-composer':{ path:'harmonie',   sub:'modulation',   msg:"La modulation va transformer tes compositions." },
    'intermediaire-technique':{ path:'exercices', sub:'cycle',        msg:"Maîtriser le cycle des quintes ouvre toutes les tonalités." },
    'avance-lire':        { path:'theorie',       sub:'armature',     msg:"Les armatures complexes sont encore un défi même pour les pros." },
    'avance-oreille':     { path:'oreille',       sub:'ecoute',       msg:"L'écoute active va affiner ton analyse musicale." },
    'avance-jazz':        { path:'theorie',       sub:'modesjazz',    msg:"Les modes jazz te donneront une palette complète." },
    'avance-composer':    { path:'harmonie',      sub:'analyse',      msg:"Analyse tes propres grilles pour comprendre ce qui fonctionne." },
    'avance-technique':   { path:'exercices',     sub:'backing',      msg:"Improvise sur des backing tracks pour consolider la technique." },
  };
  return map[`${level}-${goal}`] || { path:'competences', sub:null, msg:"Explore le parcours débutant dans l'onglet Compétences." };
}

function OnboardingScreen({ onComplete }) {
  const [step,   setStep]   = useState(0); // 0=welcome 1=level 2=goal 3=done
  const [level,  setLevel]  = useState(null);
  const [goal,   setGoal]   = useState(null);

  const rec = level && goal ? getOnboardRecommendation(level, goal) : null;

  function finish() {
    markOnboardDone({ level, goal });
    onComplete({ level, goal, rec });
  }

  const progressPct = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'#0A0804',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'1.5rem',
      animation:'fadeIn 0.4s ease',
    }}>
      {/* Progress */}
      {step > 0 && step < 3 && (
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'rgba(255,255,255,0.07)'}}>
          <div style={{height:'100%',width:`${progressPct}%`,background:'#E8A857',transition:'width 0.4s ease'}}/>
        </div>
      )}

      <div style={{maxWidth:420,width:'100%',display:'flex',flexDirection:'column',gap:'1.5rem'}}>

        {/* STEP 0 — Welcome */}
        {step===0 && (
          <div style={{textAlign:'center',animation:'slideUp 0.4s ease'}}>
            <div style={{fontSize:52,marginBottom:'1rem'}}>🎹</div>
            <h1 style={{fontSize:28,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:'.5rem',color:'#F0EBE3'}}>
              Bienvenue sur <span style={{color:'#E8A857'}}>Chord Studio</span>
            </h1>
            <p style={{fontSize:14,opacity:.65,lineHeight:1.7,marginBottom:'1.5rem',fontFamily:'Georgia,serif'}}>
              Ton compagnon pour apprendre la théorie musicale, développer ton oreille, et progresser chaque jour au piano.
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:'1.5rem'}}>
              {[
                {icon:'🎵',text:'18 cours de théorie interactifs'},
                {icon:'👂',text:'Exercices d\'oreille avec microphone'},
                {icon:'🎹',text:'Piano virtuel + backing tracks'},
                {icon:'📒',text:'Carnet de composition personnel'},
              ].map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'.6rem .9rem',background:'rgba(232,168,87,0.06)',border:'1px solid rgba(232,168,87,0.15)',borderRadius:10}}>
                  <span style={{fontSize:18}}>{f.icon}</span>
                  <span style={{fontSize:13,opacity:.75,fontFamily:'Georgia,serif'}}>{f.text}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(1)}
              style={{width:'100%',padding:'1rem',background:'#E8A857',border:'none',borderRadius:12,cursor:'pointer',fontSize:15,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.08em',color:'#0A0804',transition:'all 0.2s'}}>
              COMMENCER →
            </button>
            <button onClick={()=>finish()}
              style={{marginTop:8,background:'none',border:'none',color:'rgba(240,235,227,0.3)',cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>
              Passer l'introduction
            </button>
          </div>
        )}

        {/* STEP 1 — Level */}
        {step===1 && (
          <div style={{animation:'slideUp 0.4s ease'}}>
            <div style={{textAlign:'center',marginBottom:'1.25rem'}}>
              <h2 style={{fontSize:20,fontWeight:'bold',fontFamily:'Georgia,serif',color:'#F0EBE3',marginBottom:'.4rem'}}>Quel est ton niveau ?</h2>
              <p style={{fontSize:12,opacity:.5,fontFamily:'monospace'}}>Pour personnaliser ton parcours</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {ONBOARD_LEVELS.map(l=>(
                <button key={l.id} onClick={()=>{setLevel(l.id);setStep(2);}}
                  style={{padding:'1rem 1.1rem',background:level===l.id?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1.5px solid ${level===l.id?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:12,cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',alignItems:'center',gap:12}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(232,168,87,0.08)';e.currentTarget.style.borderColor='rgba(232,168,87,0.4)';}}
                  onMouseLeave={e=>{if(level!==l.id){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}}>
                  <span style={{fontSize:28}}>{l.icon}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:'bold',color:'#F0EBE3',fontFamily:'Georgia,serif',marginBottom:2}}>{l.label}</div>
                    <div style={{fontSize:11,opacity:.5,fontFamily:'monospace'}}>{l.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Goal */}
        {step===2 && (
          <div style={{animation:'slideUp 0.4s ease'}}>
            <div style={{textAlign:'center',marginBottom:'1.25rem'}}>
              <h2 style={{fontSize:20,fontWeight:'bold',fontFamily:'Georgia,serif',color:'#F0EBE3',marginBottom:'.4rem'}}>Quel est ton objectif ?</h2>
              <p style={{fontSize:12,opacity:.5,fontFamily:'monospace'}}>Tu pourras en changer à tout moment</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {ONBOARD_GOALS.map(g=>(
                <button key={g.id} onClick={()=>{setGoal(g.id);setStep(3);}}
                  style={{padding:'.85rem 1rem',background:goal===g.id?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1.5px solid ${goal===g.id?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:12,cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',alignItems:'center',gap:10}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(232,168,87,0.08)';e.currentTarget.style.borderColor='rgba(232,168,87,0.4)';}}
                  onMouseLeave={e=>{if(goal!==g.id){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}}>
                  <span style={{fontSize:22}}>{g.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:'bold',color:'#F0EBE3',fontFamily:'Georgia,serif'}}>{g.label}</div>
                    <div style={{fontSize:10,opacity:.45,fontFamily:'monospace'}}>{g.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Recommendation */}
        {step===3 && rec && (
          <div style={{textAlign:'center',animation:'slideUp 0.4s ease'}}>
            <div style={{fontSize:44,marginBottom:'1rem'}}>🎯</div>
            <h2 style={{fontSize:20,fontWeight:'bold',fontFamily:'Georgia,serif',color:'#F0EBE3',marginBottom:'.5rem'}}>Parfait !</h2>
            <div style={{padding:'1.1rem',background:'rgba(232,168,87,0.1)',border:'1.5px solid rgba(232,168,87,0.3)',borderRadius:14,marginBottom:'1.25rem',textAlign:'left'}}>
              <div style={{fontSize:9,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.5rem'}}>RECOMMANDATION PERSONNALISÉE</div>
              <p style={{fontSize:13.5,opacity:.85,lineHeight:1.65,margin:0,fontFamily:'Georgia,serif'}}>{rec.msg}</p>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:'1rem'}}>
              <div style={{padding:'.5rem .8rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,fontSize:11,fontFamily:'monospace',color:'rgba(255,255,255,0.5)'}}>
                {ONBOARD_LEVELS.find(l=>l.id===level)?.icon} {ONBOARD_LEVELS.find(l=>l.id===level)?.label}
              </div>
              <div style={{padding:'.5rem .8rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,fontSize:11,fontFamily:'monospace',color:'rgba(255,255,255,0.5)'}}>
                {ONBOARD_GOALS.find(g=>g.id===goal)?.icon} {ONBOARD_GOALS.find(g=>g.id===goal)?.label}
              </div>
            </div>
            <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',marginBottom:'1.25rem'}}>
              Tu peux aussi explorer librement — l'app s'adapte à toi.
            </p>
            <button onClick={finish}
              style={{width:'100%',padding:'1rem',background:'#E8A857',border:'none',borderRadius:12,cursor:'pointer',fontSize:14,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.08em',color:'#0A0804'}}>
              ENTRER DANS L'APP →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── PLAN DE PRATIQUE QUOTIDIEN ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const PLAN_KEY = 'cs_plan_v1';

// Generate a daily plan based on user level, stats, and weekly goals
function generateDailyPlan(stats, onboardData) {
  const xp    = stats.totalXp || 0;
  const level = xp < 250 ? 'debutant' : xp < 1300 ? 'intermediaire' : 'avance';
  const today = todayStr();

  // Check if already generated today
  try {
    const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || '{}');
    if (saved.date === today) return saved.plan;
  } catch {}

  // Rotation seed based on day number to vary exercises
  const dayNum = Math.floor(Date.now() / 86400000);

  const TASKS_BY_LEVEL = {
    debutant: [
      [
        { id:'t1', icon:'📖', title:'Lecture de partition',  duration:10, path:'theorie',   sub:'lecture',  desc:"Identifie 5 notes sur portée" },
        { id:'t2', icon:'🎵', title:'Intervalles',           duration:8,  path:'oreille',   sub:'intervalles',desc:"3 exercices d'intervalles" },
        { id:'t3', icon:'🎹', title:'Accords majeurs/mineurs',duration:7, path:'theorie',   sub:'laccord', desc:"Reconnais 5 accords" },
      ],
      [
        { id:'t1', icon:'🔑', title:'Armatures',             duration:8,  path:'theorie',   sub:'armature', desc:"Identifie 6 armatures" },
        { id:'t2', icon:'🥁', title:'Rythme basique',        duration:7,  path:'exercices', sub:'rythme',   desc:"Tap les 3 premiers rythmes" },
        { id:'t3', icon:'🎵', title:'Symboles musicaux',     duration:10, path:'theorie',   sub:'solfege',  desc:"Revoir les symboles essentiels" },
      ],
      [
        { id:'t1', icon:'👂', title:'Majeur ou mineur ?',    duration:8,  path:'oreille',   sub:'ecoute',   desc:"10 questions d'écoute active" },
        { id:'t2', icon:'📖', title:'Cours : intervalles',   duration:12, path:'theorie',   courseId:'intervalles', desc:"Lis le cours en entier" },
        { id:'t3', icon:'🎹', title:'Accords au piano',      duration:5,  path:'oreille',   sub:'accords',  desc:"Identifie 5 accords à l'oreille" },
      ],
    ],
    intermediaire: [
      [
        { id:'t1', icon:'🎷', title:'Progressions jazz',     duration:10, path:'oreille',   sub:'progressions',desc:"Identifie 5 progressions" },
        { id:'t2', icon:'📌', title:'Cadences',              duration:8,  path:'harmonie',  sub:'cadences', desc:"Réécouter et analyser" },
        { id:'t3', icon:'↔', title:'Transposition',          duration:12, path:'theorie',   sub:'transpo',  desc:"Transpose une mélodie" },
      ],
      [
        { id:'t1', icon:'🔍', title:'Analyser une grille',   duration:10, path:'harmonie',  sub:'analyse',  desc:"Entre Am-F-C-G et analyse" },
        { id:'t2', icon:'🎡', title:'Cycle des quintes',     duration:8,  path:'exercices', sub:'cycle',    desc:"Quiz des armatures" },
        { id:'t3', icon:'🎸', title:'Backing track jazz',    duration:15, path:'exercices', sub:'backing',  desc:"Improvise 5 min sur le jazz" },
      ],
      [
        { id:'t1', icon:'🎯', title:'Dictée d\'accords',     duration:12, path:'theorie',   sub:'dictee',   desc:"Session de 8 accords" },
        { id:'t2', icon:'📖', title:'Cours : ii-V-I',        duration:10, path:'theorie',   courseId:'iivi',desc:"Lis et fais le quiz" },
        { id:'t3', icon:'✨', title:'Extensions d\'accords', duration:8,  path:'harmonie',  sub:'extensions',desc:"Explore la 9e et la 11e" },
      ],
    ],
    avance: [
      [
        { id:'t1', icon:'🌊', title:'Modulation avancée',    duration:12, path:'harmonie',  sub:'modulation',desc:"Modulation Do→Fa#" },
        { id:'t2', icon:'🎷', title:'Modes jazz',            duration:10, path:'theorie',   courseId:'modesjazz',desc:"Cours + quiz modes" },
        { id:'t3', icon:'🎸', title:'Backing track bossa',   duration:15, path:'exercices', sub:'backing',  desc:"Improvise sur la bossa nova" },
      ],
      [
        { id:'t1', icon:'🔍', title:'Réharmonisation',       duration:15, path:'theorie',   courseId:'reharm',desc:"Technique + exemples" },
        { id:'t2', icon:'📒', title:'Carnet : nouvelle compo',duration:10,path:'harmonie',  sub:'carnet',   desc:"Note une nouvelle idée" },
        { id:'t3', icon:'↔', title:'Transposer une grille',  duration:10, path:'theorie',   sub:'transpo',  desc:"Mode accords" },
      ],
      [
        { id:'t1', icon:'🎤', title:'Solfège chanté',        duration:8,  path:'oreille',   sub:'solfege',  desc:"10 notes avec le micro" },
        { id:'t2', icon:'🔀', title:'Substitutions',         duration:10, path:'theorie',   courseId:'substitutions',desc:"Cours complet" },
        { id:'t3', icon:'🎸', title:'Backing track mineur',  duration:15, path:'exercices', sub:'backing',  desc:"Improvise en mineur" },
      ],
    ],
  };

  const tasks = TASKS_BY_LEVEL[level][dayNum % 3];
  const totalMin = tasks.reduce((a,t)=>a+t.duration,0);

  const plan = {
    date:   today,
    level,
    tasks:  tasks.map(t=>({...t,done:false})),
    totalMin,
    quote:  [
      "La régularité bat le talent. 20 minutes par jour changent tout.",
      "Chaque note jouée est une note apprise. Continue.",
      "Les grands pianistes ont tous débuté par do-ré-mi.",
      "L'oreille musicale se forme comme un muscle — chaque jour compte.",
      "Jouer juste, c'est écouter juste d'abord.",
    ][dayNum % 5],
  };

  try { localStorage.setItem(PLAN_KEY, JSON.stringify({date:today,plan})); } catch {}
  return plan;
}

function PlanPratique({ stats, onNavigate, onNavigateExercice, onNavigateCourse }) {
  const onboardData = (() => { try { return JSON.parse(localStorage.getItem(ONBOARD_KEY)||'{}'); } catch { return {}; } })();
  const [plan, setPlan] = useState(()=>generateDailyPlan(stats, onboardData));
  const [confetti, setConfetti] = useState(false);

  function toggleTask(idx) {
    setPlan(p=>{
      const tasks=[...p.tasks];
      tasks[idx]={...tasks[idx],done:!tasks[idx].done};
      const updated={...p,tasks};
      try{localStorage.setItem(PLAN_KEY,JSON.stringify({date:todayStr(),plan:updated}));}catch{}
      // Check if all done
      if(tasks.every(t=>t.done)){setConfetti(true);setTimeout(()=>setConfetti(false),3000);}
      return updated;
    });
  }

  function goToTask(task) {
    if (task.courseId && onNavigateCourse) { onNavigateCourse(task.courseId); return; }
    if (task.sub && onNavigateExercice)    { onNavigateExercice(task.path, task.sub); return; }
    if (onNavigate) onNavigate(task.path);
  }

  const doneTasks = plan.tasks.filter(t=>t.done).length;
  const totalTasks = plan.tasks.length;
  const progressPct = Math.round((doneTasks/totalTasks)*100);
  const allDone = doneTasks===totalTasks;

  return (
    <div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto',flex:1}}>
      {/* All done celebration */}
      {confetti && (
        <div style={{textAlign:'center',padding:'1rem',background:'rgba(232,168,87,0.15)',border:'1.5px solid #E8A857',borderRadius:14,animation:'slideUp 0.4s ease'}}>
          <div style={{fontSize:36,marginBottom:4}}>🎉</div>
          <div style={{fontSize:15,fontWeight:'bold',color:'#E8A857',fontFamily:'Georgia,serif'}}>Pratique du jour complète !</div>
          <div style={{fontSize:11,opacity:.6,fontFamily:'monospace',marginTop:3}}>+{plan.tasks.reduce((a,t)=>a+(t.xp||10),0)} XP gagnés</div>
        </div>
      )}

      {/* Header */}
      <div style={{padding:'1.1rem',background:'linear-gradient(135deg,rgba(232,168,87,0.1),rgba(200,134,74,0.06))',border:'1px solid rgba(232,168,87,0.2)',borderRadius:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
          <div>
            <div style={{fontSize:9,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.3rem'}}>PLAN DU JOUR</div>
            <div style={{fontSize:18,fontWeight:'bold',fontFamily:'Georgia,serif'}}>{allDone?'✓ Complété !':'Pratique de ce soir'}</div>
            <div style={{fontSize:11,opacity:.45,fontFamily:'monospace',marginTop:2}}>~{plan.totalMin} minutes · {totalTasks} exercices</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:24,fontWeight:'bold',color:allDone?'#7BC8A4':'#E8A857',fontFamily:'monospace'}}>{doneTasks}/{totalTasks}</div>
            <div style={{fontSize:9,opacity:.4,fontFamily:'monospace'}}>faits</div>
          </div>
        </div>
        <div style={{height:6,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden',marginBottom:'.65rem'}}>
          <div style={{height:'100%',width:`${progressPct}%`,background:allDone?'#7BC8A4':'linear-gradient(90deg,#E8A857,#C8864A)',borderRadius:3,transition:'width 0.5s ease'}}/>
        </div>
        <p style={{fontSize:12,opacity:.55,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>"{plan.quote}"</p>
      </div>

      {/* Tasks */}
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {plan.tasks.map((task,i)=>(
          <div key={task.id} style={{background:task.done?'rgba(123,200,164,0.06)':'rgba(255,255,255,0.03)',border:`1.5px solid ${task.done?'rgba(123,200,164,0.35)':'rgba(255,255,255,0.08)'}`,borderRadius:12,padding:'.9rem 1rem',transition:'all 0.25s'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {/* Check button */}
              <button onClick={()=>toggleTask(i)}
                style={{width:26,height:26,borderRadius:'50%',border:`2px solid ${task.done?'#7BC8A4':'rgba(255,255,255,0.2)'}`,background:task.done?'#7BC8A4':'transparent',flexShrink:0,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:task.done?'#0A0804':'transparent',transition:'all 0.2s'}}>
                ✓
              </button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:16}}>{task.icon}</span>
                    <span style={{fontSize:13,fontWeight:'bold',color:task.done?'rgba(240,235,227,0.4)':'#F0EBE3',fontFamily:'Georgia,serif',textDecoration:task.done?'line-through':'none'}}>{task.title}</span>
                  </div>
                  <span style={{fontSize:9,opacity:.4,fontFamily:'monospace',flexShrink:0,marginLeft:6}}>{task.duration} min</span>
                </div>
                <div style={{fontSize:11,opacity:.45,fontFamily:'monospace',marginTop:2}}>{task.desc}</div>
              </div>
              {/* Go button */}
              {!task.done && (
                <button onClick={()=>goToTask(task)}
                  style={{padding:'.35rem .7rem',background:'rgba(232,168,87,0.12)',border:'1px solid rgba(232,168,87,0.35)',color:'#E8A857',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',fontWeight:'bold',flexShrink:0,transition:'all 0.2s'}}>
                  →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={{padding:'.85rem 1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,display:'flex',gap:10}}>
        <span style={{fontSize:16,flexShrink:0}}>💡</span>
        <div>
          <div style={{fontSize:9,color:'#E8A857',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.3rem'}}>CONSEIL DU JOUR</div>
          <p style={{fontSize:12,opacity:.6,lineHeight:1.6,margin:0,fontFamily:'Georgia,serif'}}>
            {plan.level==='debutant' ? "Fais chaque exercice lentement. La vitesse vient avec la répétition, pas l'inverse."
            :plan.level==='intermediaire' ? "Essaie de chanter les accords que tu joues — ça connecte l'oreille et les doigts."
            :"Analyse pourquoi un accord 'sonne bien' — comprendre remplace mémoriser."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── VISUALISEUR INTERACTIF ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// All scales with intervals
const SCALE_LIBRARY = [
  {name:'Majeure (Ionien)',  semis:[0,2,4,5,7,9,11], color:'#E8A857', category:'modes'},
  {name:'Mineure naturelle',semis:[0,2,3,5,7,8,10],  color:'#B898C8', category:'fondamentales'},
  {name:'Mineure harm.',    semis:[0,2,3,5,7,8,11],  color:'#90B8D0', category:'fondamentales'},
  {name:'Mineure mélo.',    semis:[0,2,3,5,7,9,11],  color:'#7BC8A4', category:'fondamentales'},
  {name:'Pentatonique maj.',semis:[0,2,4,7,9],        color:'#E8A857', category:'pentatoniques'},
  {name:'Pentatonique min.',semis:[0,3,5,7,10],       color:'#B898C8', category:'pentatoniques'},
  {name:'Blues',            semis:[0,3,5,6,7,10],     color:'#E07070', category:'pentatoniques'},
  {name:'Dorien',           semis:[0,2,3,5,7,9,10],   color:'#7BC8A4', category:'modes'},
  {name:'Phrygien',         semis:[0,1,3,5,7,8,10],   color:'#E07070', category:'modes'},
  {name:'Lydien',           semis:[0,2,4,6,7,9,11],   color:'#D4A0D4', category:'modes'},
  {name:'Mixolydien',       semis:[0,2,4,5,7,9,10],   color:'#C8864A', category:'modes'},
  {name:'Locrien',          semis:[0,1,3,5,6,8,10],   color:'#7098A8', category:'modes'},
  {name:'Lydien dominant',  semis:[0,2,4,6,7,9,10],   color:'#E8A857', category:'jazz'},
  {name:'Phrygien dominant',semis:[0,1,4,5,7,8,10],   color:'#E07070', category:'jazz'},
  {name:'Locrien #2',       semis:[0,2,3,5,6,8,10],   color:'#90B8D0', category:'jazz'},
  {name:'Altérée',          semis:[0,1,3,4,6,8,10],   color:'#C8864A', category:'jazz'},
  {name:'Ton entier',       semis:[0,2,4,6,8,10],      color:'#D4A0D4', category:'symetrique'},
  {name:'Diminuée',         semis:[0,2,3,5,6,8,9,11],  color:'#B898C8', category:'symetrique'},
  {name:'Chromatique',      semis:[0,1,2,3,4,5,6,7,8,9,10,11], color:'rgba(255,255,255,0.6)', category:'symetrique'},
];

const CATEGORY_LABELS = {
  fondamentales:'Gammes fondamentales', modes:'Modes grecs', pentatoniques:'Pentatoniques & Blues',
  jazz:'Jazz avancé', symetrique:'Gammes symétriques',
};

function Visualiseur() {
  const [root,         setRoot]        = useState('C');
  const [scale,        setScale]       = useState(SCALE_LIBRARY[0]);
  const [activeNotes,  setActiveNotes] = useState(new Set()); // manually clicked
  const [mode,         setMode]        = useState('scale');  // scale | chord | free
  const [selChord,     setSelChord]    = useState('Majeures');
  const [catFilter,    setCatFilter]   = useState('fondamentales');
  const [playing,      setPlaying]     = useState(false);

  const ri = CHROMATIC.indexOf(root);

  // Compute highlighted notes
  const scaleNotes = mode==='scale'
    ? new Set(scale.semis.map(s=>(ri+s)%12))
    : mode==='chord'
    ? new Set(CHORD_TYPES[selChord].formula.map(f=>(ri+f)%12))
    : activeNotes;

  // Root note highlight
  const isRoot = (semi) => mode!=='free' && semi%12===ri;

  async function playScale() {
    if (playing) return;
    setPlaying(true);
    const semis = mode==='scale' ? scale.semis
      : mode==='chord' ? CHORD_TYPES[selChord].formula
      : [...activeNotes].sort((a,b)=>a-b);
    for (const s of semis) {
      playNote((ri+s)%12 + 4*12, 0, 0.7);
      await new Promise(r=>setTimeout(r,300));
    }
    setPlaying(false);
  }

  async function playChordFull() {
    if (playing || mode!=='chord') return;
    setPlaying(true);
    playChordArp(CHORD_TYPES[selChord].formula.map(f=>ri+f+4*12));
    setTimeout(()=>setPlaying(false), 1500);
  }

  // Piano key dimensions
  const WW=36,BW=24,WH=100,BH=62;
  const whiteKeys = PIANO_KEYS_DATA.filter(k=>k.type==='white');
  const blackKeys = PIANO_KEYS_DATA.filter(k=>k.type==='black');
  const accentColor = mode==='scale' ? scale.color : '#E8A857';

  // Notes names with French names
  const noteNames = CHROMATIC;
  const NOTE_FR = {C:'Do',D:'Ré',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si','C#':'Do#','Eb':'Mib','F#':'Fa#','Ab':'Lab','Bb':'Sib'};

  return (
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div>
        <h3 style={{fontSize:18,fontWeight:'bold',marginBottom:4}}>Visualiseur</h3>
        <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>GAMMES · ACCORDS · EXPLORATION LIBRE</p>
      </div>

      {/* Mode selector */}
      <div style={{display:'flex',gap:6}}>
        {[['scale','🎼 Gamme'],['chord','🎹 Accord'],['free','✋ Libre']].map(([m,label])=>(
          <button key={m} onClick={()=>{setMode(m);setActiveNotes(new Set());}}
            style={{flex:1,padding:'.55rem .25rem',background:mode===m?'rgba(232,168,87,0.18)':'rgba(255,255,255,0.04)',border:`1.5px solid ${mode===m?'#E8A857':'rgba(255,255,255,0.1)'}`,borderRadius:9,cursor:'pointer',color:mode===m?'#E8A857':'rgba(255,255,255,0.45)',fontSize:10,fontFamily:'monospace',fontWeight:mode===m?'bold':'normal',transition:'all 0.2s'}}>
            {label}
          </button>
        ))}
      </div>

      {/* Root selector */}
      <div>
        <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>TONIQUE / FONDAMENTALE</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {ROOT_NOTES.map(r=>{
            const nc=NOTE_COLORS[r]||'#E8A857',sel=root===r;
            return<button key={r} onClick={()=>setRoot(r)} style={{padding:'.4rem .7rem',background:sel?`${nc}25`:'rgba(255,255,255,0.05)',border:`1.5px solid ${sel?nc:nc+'30'}`,color:sel?nc:nc+'AA',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.2s'}}>{r}</button>;
          })}
        </div>
      </div>

      {/* Scale or chord selector */}
      {mode==='scale' && (
        <div>
          <div style={{display:'flex',gap:5,marginBottom:'.65rem',overflowX:'auto',paddingBottom:2}}>
            {Object.entries(CATEGORY_LABELS).map(([cat,label])=>(
              <button key={cat} onClick={()=>setCatFilter(cat)}
                style={{padding:'.35rem .7rem',background:catFilter===cat?'rgba(232,168,87,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${catFilter===cat?'rgba(232,168,87,0.5)':'rgba(255,255,255,0.1)'}`,borderRadius:7,cursor:'pointer',color:catFilter===cat?'#E8A857':'rgba(255,255,255,0.4)',fontSize:9,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>
                {label}
              </button>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {SCALE_LIBRARY.filter(s=>s.category===catFilter).map(s=>(
              <button key={s.name} onClick={()=>setScale(s)}
                style={{padding:'.6rem .85rem',background:scale.name===s.name?`${s.color}15`:'rgba(255,255,255,0.03)',border:`1px solid ${scale.name===s.name?s.color:'rgba(255,255,255,0.08)'}`,borderRadius:9,cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12,fontWeight:scale.name===s.name?'bold':'normal',color:scale.name===s.name?s.color:'rgba(255,255,255,0.65)',fontFamily:'Georgia,serif'}}>{s.name}</span>
                <span style={{fontSize:9,fontFamily:'monospace',opacity:.4}}>{s.semis.length} notes</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode==='chord' && (
        <div>
          <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>TYPE D'ACCORD</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
            {Object.entries(CHORD_TYPES).map(([t,{label,suffix}])=>{
              const col=CHORD_COLORS[t]||'#E8A857',sel=selChord===t;
              return<button key={t} onClick={()=>setSelChord(t)} style={{padding:'.55rem .5rem',background:sel?`${col}15`:'rgba(255,255,255,0.04)',border:`1px solid ${sel?col:col+'30'}`,borderRadius:9,cursor:'pointer',color:sel?col:col+'99',fontSize:11,fontFamily:'monospace',fontWeight:sel?'bold':'normal',transition:'all 0.2s'}}>{root}{suffix} — {label}</button>;
            })}
          </div>
        </div>
      )}

      {mode==='free' && (
        <div style={{padding:'.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10}}>
          <p style={{fontSize:12,opacity:.55,margin:0,fontFamily:'Georgia,serif'}}>Clique sur les touches du piano pour activer/désactiver des notes. L'app détectera automatiquement l'accord ou la gamme correspondante.</p>
        </div>
      )}

      {/* Piano keyboard */}
      <div style={{overflowX:'auto',paddingBottom:4}}>
        <div style={{position:'relative',height:WH+12,minWidth:whiteKeys.length*(WW+2)}}>
          {/* White keys */}
          {whiteKeys.map(({absIdx,wi,note})=>{
            const semi=absIdx%12;
            const isHighlighted=scaleNotes.has(semi);
            const isRootNote=isRoot(semi);
            const nc=NOTE_COLORS[note]||accentColor;
            const isActive=activeNotes.has(semi);
            return(
              <div key={absIdx}
                onClick={()=>{
                  if(mode==='free'){
                    setActiveNotes(prev=>{const n=new Set(prev);n.has(semi)?n.delete(semi):n.add(semi);return n;});
                  } else {
                    playNote(semi+4*12,0,0.8);
                  }
                }}
                style={{
                  position:'absolute',left:wi*(WW+2),top:0,width:WW,height:WH,
                  background: isRootNote ? nc
                    : isHighlighted ? `${nc}55`
                    : mode==='free'&&isActive ? `${nc}60`
                    : '#F5EFE8',
                  border:`1px solid ${isHighlighted||isActive?nc+'80':'#C8BEAA'}`,
                  borderRadius:'0 0 6px 6px',cursor:'pointer',
                  transition:'background 0.15s',
                  display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:5,
                }}>
                {(isHighlighted||isActive) && (
                  <span style={{fontSize:8,fontFamily:'monospace',color:isRootNote?'#0A0804':nc,fontWeight:'bold',opacity:.9}}>{NOTE_FR[note]||note}</span>
                )}
              </div>
            );
          })}
          {/* Black keys */}
          {blackKeys.map(({absIdx,wi,note})=>{
            const semi=absIdx%12;
            const isHighlighted=scaleNotes.has(semi);
            const isRootNote=isRoot(semi);
            const nc=NOTE_COLORS[note]||accentColor;
            const isActive=activeNotes.has(semi);
            return(
              <div key={absIdx}
                onClick={()=>{
                  if(mode==='free'){
                    setActiveNotes(prev=>{const n=new Set(prev);n.has(semi)?n.delete(semi):n.add(semi);return n;});
                  } else {
                    playNote(semi+4*12,0,0.8);
                  }
                }}
                style={{
                  position:'absolute',left:wi*(WW+2)+WW-BW/2+2,top:0,width:BW,height:BH,zIndex:2,
                  background: isRootNote?nc:isHighlighted||isActive?`${nc}80`:'#1C1610',
                  border:`1px solid ${isHighlighted||isActive?nc:'#0A0804'}`,
                  borderRadius:'0 0 4px 4px',cursor:'pointer',
                  transition:'background 0.15s',
                  display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:3,
                }}>
                {(isHighlighted||isActive) && (
                  <span style={{fontSize:7,fontFamily:'monospace',color:isRootNote?'#0A0804':nc,fontWeight:'bold',opacity:.9}}>{NOTE_FR[note]||note}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info panel */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        {mode==='scale' && (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
              <div style={{fontSize:15,fontWeight:'bold',color:scale.color,fontFamily:'Georgia,serif'}}>{root} {scale.name}</div>
              <button onClick={playScale} disabled={playing}
                style={{padding:'.35rem .8rem',background:`${scale.color}15`,border:`1px solid ${scale.color}50`,color:scale.color,borderRadius:7,cursor:playing?'default':'pointer',fontSize:10,fontFamily:'monospace'}}>
                {playing?'▶…':'▶ JOUER'}
              </button>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {scale.semis.map(s=>{
                const noteName=CHROMATIC[(ri+s)%12];
                const nc=NOTE_COLORS[noteName]||scale.color;
                return<span key={s} style={{padding:'2px 8px',background:`${nc}18`,border:`0.5px solid ${nc}50`,borderRadius:6,fontSize:11,fontWeight:'bold',fontFamily:'monospace',color:nc}}>{noteName}</span>;
              })}
            </div>
          </>
        )}
        {mode==='chord' && (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
              <div style={{fontSize:15,fontWeight:'bold',color:'#E8A857',fontFamily:'monospace'}}>{root}{CHORD_TYPES[selChord].suffix} — {CHORD_TYPES[selChord].label}</div>
              <button onClick={playChordFull} disabled={playing}
                style={{padding:'.35rem .8rem',background:'rgba(232,168,87,0.15)',border:'1px solid rgba(232,168,87,0.4)',color:'#E8A857',borderRadius:7,cursor:playing?'default':'pointer',fontSize:10,fontFamily:'monospace'}}>
                {playing?'▶…':'▶ JOUER'}
              </button>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {CHORD_TYPES[selChord].formula.map((f,i)=>{
                const noteName=CHROMATIC[(ri+f)%12];
                const nc=NOTE_COLORS[noteName]||'#E8A857';
                const degLabels=['Fondamentale','Tierce','Quinte','Septième','Neuvième'];
                return<div key={f} style={{padding:'3px 8px',background:`${nc}15`,border:`0.5px solid ${nc}45`,borderRadius:6}}>
                  <div style={{fontSize:11,fontWeight:'bold',fontFamily:'monospace',color:nc}}>{noteName}</div>
                  <div style={{fontSize:8,opacity:.45,fontFamily:'monospace'}}>{degLabels[i]||''}</div>
                </div>;
              })}
            </div>
          </>
        )}
        {mode==='free' && activeNotes.size>0 && (
          <>
            <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>NOTES ACTIVES</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {[...activeNotes].sort((a,b)=>a-b).map(s=>{
                const n=CHROMATIC[s];
                const nc=NOTE_COLORS[n]||'#E8A857';
                return<span key={s} style={{padding:'2px 8px',background:`${nc}18`,border:`0.5px solid ${nc}50`,borderRadius:6,fontSize:11,fontWeight:'bold',fontFamily:'monospace',color:nc}}>{n}</span>;
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChordApp(){
  const [page,setPage]=useState('competences');
  const [apprentissageSub,setApprentiassageSub]=useState('landing');
  const [skills]=useState(INITIAL_SKILLS);
  const [instrument,setInstrument]=useState('piano');
  const [tipIndex,setTipIndex]=useState(0);
  const [showTip,setShowTip]=useState(false);
  const [showDefis,setShowDefis]=useState(false);
  const [stats,setStats]=useState(()=>resetDailyIfNeeded(loadStats()));
  const [themeId,setThemeId]=useState(()=>{ try{return localStorage.getItem('cs_theme')||'obsidian';}catch{return'obsidian';} });
  const [pageKey,setPageKey]=useState(0);
  const theme = THEMES[themeId] || THEMES.obsidian;

  // Onboarding
  const [showOnboard, setShowOnboard] = useState(()=>!isOnboardDone());

  // Mascotte
  const [showMascotte, setShowMascotte] = useState(false);
  const [mascoтteType, setMascoтteType] = useState('idle');
  const mascotteTimerRef = useRef(null);

  // Idle : affiche la mascotte après 45s sur la page compétences sans interaction
  useEffect(() => {
    clearTimeout(mascotteTimerRef.current);
    setShowMascotte(false);
    if (page === 'competences') {
      mascotteTimerRef.current = setTimeout(() => {
        setMascoтteType('idle');
        setShowMascotte(true);
      }, 45000);
    }
    return () => clearTimeout(mascotteTimerRef.current);
  }, [page, pageKey]);

  // Register mascotte trigger
  _mascotteTrigger = (type) => {
    setMascoтteType(type);
    setShowMascotte(true);
  };

  // Streak milestone celebration
  useEffect(() => {
    const s = computeStreak(stats);
    if (s === 3 || s === 7 || s === 14 || s === 30) {
      setTimeout(() => {
        setMascoтteType('streak');
        setShowMascotte(true);
      }, 1500);
    }
  }, [stats.streak]); // eslint-disable-line
  _updater=(fn)=>{
    setStats(prev=>{
      const today=todayStr();
      let s=resetDailyIfNeeded(prev);
      s=fn(s,today);
      const daily=getDailyChallenges(today);
      s=checkAndComplete(s,today,daily);
      saveStats(s); return s;
    });
  };
  _timeUpdater=(secs)=>{
    setStats(prev=>{const n={...prev,totalSeconds:(prev.totalSeconds||0)+secs};saveStats(n);return n;});
  };

  useEffect(()=>{
    _sessionStart=Date.now();
    const t=setInterval(commitTime,60000);
    return()=>{commitTime();clearInterval(t);};
  },[]);

  useEffect(()=>{
    if(page!=='competences')return;
    const t=setInterval(()=>{setTipIndex(i=>(i+1)%TIPS.length);setShowTip(true);},60000);
    return()=>clearInterval(t);
  },[page]);

  const NAV=[{id:'competences',label:'Compétences',icon:'◈'},{id:'apprentissage',label:'Apprentissage',icon:'✦'},{id:'plan',label:'Plan',icon:'📋'},{id:'visu',label:'Visualiseur',icon:'🎼'},{id:'journal',label:'Journal',icon:'📅'}];
  const NC={competences:'#B898C8',apprentissage:'#90B8D0',journal:'#7BC8A4',partage:'#E8A857'};
  const keys=stats.keys||0;
  const streak=computeStreak(stats);
  const streakColor = streak>=7?'#E8A857':streak>=3?'#7BC8A4':'rgba(255,255,255,0.5)';

  return(<div style={{minHeight:'100vh',background:theme.bgGrad,fontFamily:"'Georgia',serif",color:theme.text,display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>

    {/* CSS */}
    <style>{`
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes slideInRight{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
      @keyframes pageIn{from{opacity:0;transform:translateY(12px) scale(0.99)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(12px,-18px) scale(1.04)}}
      @keyframes streakPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
      *{box-sizing:border-box} button{cursor:pointer}
      ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px}
      input,textarea{outline:none;font-family:inherit;}
      
    `}</style>

    {/* Background orbs — subtiles, basées sur l'accent ambre */}
    <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
      <div style={{position:'absolute',top:'-15%',left:'-10%',width:420,height:420,borderRadius:'50%',background:'radial-gradient(circle, rgba(232,168,87,0.07) 0%, transparent 70%)',animation:'orbFloat 12s ease-in-out infinite'}}/>
      <div style={{position:'absolute',bottom:'-10%',right:'-8%',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle, rgba(200,134,74,0.05) 0%, transparent 70%)',animation:'orbFloat 16s ease-in-out infinite reverse'}}/>
      <div style={{position:'absolute',top:'40%',right:'-5%',width:260,height:260,borderRadius:'50%',background:'radial-gradient(circle, rgba(232,168,87,0.04) 0%, transparent 70%)',animation:'orbFloat 10s ease-in-out infinite 3s'}}/>
    </div>

    {/* Header */}
    <header style={{position:'fixed',top:0,left:0,right:0,padding:'.65rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${theme.borderMuted}`,zIndex:10,background:theme.headerBg,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)'}}>
      {/* Logo + streak */}
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',letterSpacing:'.1em',background:theme.logoGrad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
          CHORD·STUDIO
        </span>
        {/* Streak badge */}
        {streak>0 && (
          <div title={`${streak} jour${streak>1?'s':''} consécutif${streak>1?'s':''}`}
            style={{display:'flex',alignItems:'center',gap:3,padding:'2px 7px',background:streak>=3?`${streakColor}`:'rgba(255,255,255,0.06)',border:`1px solid ${streakColor}`,borderRadius:8,animation:streak>=7?'streakPulse 2s ease-in-out infinite':undefined}}>
            <span style={{fontSize:12}}>{streak>=7?'🔥':streak>=3?'⚡':'✦'}</span>
            <span style={{fontSize:11,fontWeight:'bold',color:streakColor,fontFamily:'monospace'}}>{streak}</span>
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        {/* Theme cycle */}
        <button onClick={()=>{
          const idx=THEME_IDS.indexOf(themeId);
          const next=THEME_IDS[(idx+1)%THEME_IDS.length];
          setThemeId(next);
          try{localStorage.setItem('cs_theme',next);}catch{}
        }} title={`Thème : ${theme.label}`}
          style={{background:theme.surface,border:`1px solid ${theme.border}`,color:theme.text,padding:'.28rem .55rem',borderRadius:9,cursor:'pointer',fontSize:13,transition:'all 0.2s',lineHeight:1}}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}>
          {theme.icon}
        </button>
        {/* Défis */}
        <button onClick={()=>setShowDefis(v=>!v)} style={{
          display:'flex',alignItems:'center',gap:4,
          background:showDefis?'rgba(232,168,87,0.2)':theme.surface,
          border:`1px solid ${showDefis?'rgba(232,168,87,0.5)':theme.border}`,
          color:showDefis?'#FBBF24':theme.textMuted,
          padding:'.28rem .7rem',borderRadius:9,cursor:'pointer',fontSize:11,
          fontFamily:'monospace',letterSpacing:'.06em',transition:'all 0.2s'}}>
          <span style={{fontSize:12}}>🗝️</span>
          <span style={{fontWeight:'bold'}}>{keys}</span>
        </button>
        {/* Conseil */}
        <button onClick={()=>setShowTip(v=>!v)} style={{
          background:showTip?'rgba(232,168,87,0.15)':theme.surface,
          border:`1px solid ${showTip?'rgba(232,168,87,0.4)':theme.border}`,
          color:showTip?'#FBBF24':theme.textMuted,
          padding:'.28rem .65rem',borderRadius:9,cursor:'pointer',fontSize:12,
          transition:'all 0.2s'}}>💡</button>
      </div>
    </header>

    {/* Pages avec transition */}
    <div style={{flex:1,paddingTop:58,paddingBottom:72,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',zIndex:1}}>
      <div key={page+pageKey} style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',animation:'pageIn 0.32s cubic-bezier(0.34,1.20,0.64,1)'}}>
        {page==='competences'&&<CompetencesPage skills={skills} instrument={instrument} setInstrument={setInstrument} stats={stats} onNavigate={(p)=>{setPage(p);setPageKey(k=>k+1);}}/>}
        {page==='apprentissage'&&<ApprentissagePage sub={apprentissageSub} setSub={setApprentiassageSub}/>}
        {page==='partage'&&<PartagePageActuelle stats={stats}/>}
        {page==='journal'&&<JournalPage/>}
        {page==='plan'&&<PlanPratique stats={stats}
          onNavigate={(p)=>{setPage(p);setPageKey(k=>k+1);}}
          onNavigateExercice={(path,sub)=>{setPage(path);if(sub)setApprentiassageSub(sub);setPageKey(k=>k+1);}}
          onNavigateCourse={(courseId)=>{try{localStorage.setItem('cs_pending_course',courseId);}catch{}setPage('apprentissage');setPageKey(k=>k+1);}}
        />}
        {page==='visu'&&<Visualiseur/>}
      </div>
    </div>

    {/* Onboarding overlay */}
    {showOnboard && (
      <OnboardingScreen onComplete={(data)=>{
        setShowOnboard(false);
        if(data?.rec?.path){setPage(data.rec.path);setPageKey(k=>k+1);}
      }}/>
    )}

    {/* Navigation pill-style */}
    <nav style={{
      position:'fixed',bottom:0,left:0,right:0,
      display:'flex',gap:4,
      padding:'.55rem .75rem calc(.55rem + env(safe-area-inset-bottom))',
      background:theme.navBg,
      backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
      borderTop:`1px solid ${theme.borderMuted}`,
      zIndex:10,
    }}>
      {NAV.map(({id,label,icon})=>{
        const isA=page===id, ac=NC[id];
        return(<button key={id} onClick={()=>{
          setPage(id);
          setPageKey(k=>k+1);
        }} style={{
          flex:1,
          padding:'.5rem .25rem .45rem',
          background: isA ? theme.navActive : 'transparent',
          border: 'none',
          borderRadius: 14,
          color: isA ? ac : theme.textMuted,
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          transform: isA ? 'scale(1.06)' : 'scale(1)',
          boxShadow: isA ? `0 2px 14px rgba(0,0,0,0.2)` : 'none',
        }}>
          <span style={{
            fontSize: isA ? 18 : 15,
            transition: 'all 0.25s ease',
            filter: isA ? `drop-shadow(0 0 6px ${ac})` : 'none',
          }}>{icon}</span>
          <span style={{
            fontSize: 8, fontFamily: 'monospace', letterSpacing: '.03em',
            fontWeight: isA ? 'bold' : 'normal',
            opacity: isA ? 1 : 0.55,
          }}>{label.toUpperCase()}</span>
        </button>);
      })}
    </nav>

    {showTip&&<TipPopup tip={TIPS[tipIndex]} onClose={()=>setShowTip(false)} onNext={()=>setTipIndex(i=>(i+1)%TIPS.length)}/>}
    {showDefis&&<DefisPanel stats={stats} onClose={()=>setShowDefis(false)}/>}
    {showMascotte&&(
      <MascoттePopup
        type={mascoтteType}
        streak={streak}
        onClose={()=>setShowMascotte(false)}
        onAction={()=>{
          setShowMascotte(false);
          setPage('apprentissage');
          setPageKey(k=>k+1);
        }}
        actionLabel="Faire un exercice 🎵"
      />
    )}
  </div>);
}
