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
const JOURNAL_KEY = 'cs_journal_v1';
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

// ── Section card gradients ────────────────────────────────────────────────────
const SECTION_GRADIENTS = {
  accords:   'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  oreille:   'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)',
  exercices: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
  theorie:   'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  harmonie:  'linear-gradient(135deg, #F43F5E 0%, #BE185D 100%)',
};

// ── Thèmes visuels ────────────────────────────────────────────────────────────
const THEMES = {
  cosmos: {
    id:'cosmos', label:'Cosmos', icon:'🌌',
    bg:'#0D0B1E',
    bgGrad:'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(236,72,153,0.08) 0%, transparent 70%), #0D0B1E',
    headerBg:'rgba(13,11,30,0.88)',
    navBg:'rgba(13,11,30,0.96)',
    surface:'rgba(139,92,246,0.08)',
    surfaceHover:'rgba(139,92,246,0.14)',
    border:'rgba(139,92,246,0.25)',
    borderMuted:'rgba(139,92,246,0.12)',
    text:'#F5F3FF',
    textMuted:'rgba(245,243,255,0.5)',
    textFaint:'rgba(245,243,255,0.25)',
    accent:'#A78BFA',
    logoGrad:'linear-gradient(90deg, #A78BFA, #60A5FA, #F472B6)',
    navActive:'rgba(139,92,246,0.2)',
    css:`input,textarea{background:rgba(139,92,246,0.1)!important;border-color:rgba(139,92,246,0.25)!important;color:#F5F3FF!important;}input::placeholder,textarea::placeholder{color:rgba(245,243,255,0.35)!important;}`,
  },
  neon: {
    id:'neon', label:'Neon', icon:'⚡',
    bg:'#080C10',
    bgGrad:'radial-gradient(ellipse at 15% 30%, rgba(0,255,128,0.12) 0%, transparent 45%), radial-gradient(ellipse at 85% 70%, rgba(6,182,212,0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 90%, rgba(132,204,22,0.08) 0%, transparent 50%), #080C10',
    headerBg:'rgba(8,12,16,0.9)',
    navBg:'rgba(8,12,16,0.97)',
    surface:'rgba(0,255,128,0.07)',
    surfaceHover:'rgba(0,255,128,0.13)',
    border:'rgba(0,255,128,0.22)',
    borderMuted:'rgba(0,255,128,0.1)',
    text:'#ECFDF5',
    textMuted:'rgba(236,253,245,0.5)',
    textFaint:'rgba(236,253,245,0.25)',
    accent:'#4ADE80',
    logoGrad:'linear-gradient(90deg, #4ADE80, #06B6D4, #A3E635)',
    navActive:'rgba(74,222,128,0.18)',
    css:`input,textarea{background:rgba(0,255,128,0.07)!important;border-color:rgba(0,255,128,0.22)!important;color:#ECFDF5!important;}`,
  },
  jazz: {
    id:'jazz', label:'Jazz', icon:'🎷',
    bg:'#110800',
    bgGrad:'radial-gradient(ellipse at 25% 25%, rgba(251,146,60,0.18) 0%, transparent 50%), radial-gradient(ellipse at 75% 75%, rgba(239,68,68,0.14) 0%, transparent 50%), radial-gradient(ellipse at 60% 10%, rgba(245,158,11,0.1) 0%, transparent 40%), #110800',
    headerBg:'rgba(17,8,0,0.9)',
    navBg:'rgba(17,8,0,0.97)',
    surface:'rgba(251,146,60,0.08)',
    surfaceHover:'rgba(251,146,60,0.14)',
    border:'rgba(251,146,60,0.25)',
    borderMuted:'rgba(251,146,60,0.1)',
    text:'#FFF7ED',
    textMuted:'rgba(255,247,237,0.5)',
    textFaint:'rgba(255,247,237,0.25)',
    accent:'#FB923C',
    logoGrad:'linear-gradient(90deg, #FB923C, #F59E0B, #EF4444)',
    navActive:'rgba(251,146,60,0.2)',
    css:`input,textarea{background:rgba(251,146,60,0.08)!important;border-color:rgba(251,146,60,0.25)!important;color:#FFF7ED!important;}`,
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
  {id:'accords',   label:'Accords',   value:35,color:'#C39BD3'},
  {id:'oreille',   label:'Oreille',   value:20,color:'#85C1E9'},
  {id:'rythme',    label:'Rythme',    value:40,color:'#82E0AA'},
  {id:'theorie',   label:'Théorie',   value:25,color:'#F1948A'},
  {id:'technique', label:'Technique', value:30,color:'#F7DC6F'},
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
const DEF_STATS={totalExercises:0,totalSeconds:0,sessionsCount:0,keys:0,todayDate:'',todayExercises:0,todayLibViews:0,todaySections:0,lastPerfect:'',lastIntervalDay:'',lastChordEarDay:'',completedChallenges:[],streak:0,lastActivityDate:'',weeklyGoals:{oreille:0,technique:0,theorie:0,harmonie:0}};
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
  {semi:2,name:"2nde maj.",full:"Seconde majeure",  color:"#F7DC6F"},
  {semi:3,name:"3ce min.", full:"Tierce mineure",   color:"#82E0AA"},
  {semi:4,name:"3ce maj.", full:"Tierce majeure",   color:"#85C1E9"},
  {semi:5,name:"4te juste",full:"Quarte juste",     color:"#C39BD3"},
  {semi:6,name:"Triton",   full:"Triton",           color:"#F1948A"},
  {semi:7,name:"5te juste",full:"Quinte juste",     color:"#AED6F1"},
  {semi:8,name:"6te min.", full:"Sixte mineure",    color:"#82E0AA"},
  {semi:9,name:"6te maj.", full:"Sixte majeure",    color:"#E8A87C"},
  {semi:10,name:"7e min.", full:"Septième mineure", color:"#C39BD3"},
  {semi:11,name:"7e maj.", full:"Septième majeure", color:"#F7DC6F"},
  {semi:12,name:"Octave",  full:"Octave",           color:"#AED6F1"},
];
const NM=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const semiToName=s=>`${NM[s%12]}${4+Math.floor(s/12)}`;
const genEx=arr=>{const n=Math.floor(Math.random()*12),i=arr[Math.floor(Math.random()*arr.length)];return{note1:n,note2:n+i,intSemi:i};};
const genChordEx=arr=>{const r=Math.floor(Math.random()*12),t=arr[Math.floor(Math.random()*arr.length)];return{rootSemi:r,type:t,notes:CHORD_TYPES[t].formula.map(i=>r+i)};};
const CHORD_COLORS={Majeures:'#85C1E9',Mineures:'#82E0AA',"Dom. 7":'#F7DC6F',"Maj. 7":'#C39BD3',"Min. 7":'#F1948A',"MinMaj. 7":'#E8A87C'};

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
    <polygon points={sp.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(195,155,211,0.1)" stroke="#C39BD3" strokeWidth={1.5}/>
    {sp.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3.5} fill={skills[i].color}/>)}
    {skills.map((s,i)=>{const a=sa+i*step,lx=cx+lr*Math.cos(a),ly=cy+lr*Math.sin(a),anchor=lx>cx+5?'start':lx<cx-5?'end':'middle',oy=ly<cy-5?-4:ly>cy+5?13:4;return(<g key={s.id}><text x={lx} y={ly+oy} textAnchor={anchor} fontSize={10} fill="rgba(240,235,224,0.52)" fontFamily="monospace" letterSpacing="0.04em">{s.label.toUpperCase()}</text><text x={lx} y={ly+oy+13} textAnchor={anchor} fontSize={9} fill={s.color} fontFamily="monospace">{s.value}%</text></g>);})}
    <text x={cx} y={cy+4} textAnchor="middle" fontSize={8} fill="rgba(240,235,224,0.15)" fontFamily="monospace">PIANO</text>
  </svg></div>);
}

function PianoKeyboard({activeAbsIndices=[],color,colors={}}){
  const whites=PIANO_KEYS_DATA.filter(k=>k.type==='white'),blacks=PIANO_KEYS_DATA.filter(k=>k.type==='black');
  const getC=ai=>colors[ai]||(activeAbsIndices.includes(ai)?color:null);
  return(<svg viewBox={`0 0 ${14*WW} ${WH+20}`} style={{width:'100%',maxWidth:560,display:'block',margin:'0 auto'}}>
    {whites.map(({absIdx,wi,note})=>{const c=getC(absIdx);return(<g key={`w${absIdx}`}><rect x={wi*WW} y={0} width={WW} height={WH} rx={3} fill={c||'#f3ede0'} stroke="#1a1714" strokeWidth={1.5}/>{c&&<text x={wi*WW+WW/2} y={WH-10} textAnchor="middle" fontSize={10} fill="#1a1714" fontFamily="monospace" fontWeight="bold">{note}</text>}</g>);})}
    {blacks.map(({absIdx,wi,note})=>{const c=getC(absIdx),x=(wi+1)*WW-BW*.58;return(<g key={`b${absIdx}`}><rect x={x} y={0} width={BW} height={BH} rx={2} fill={c||'#181614'} stroke="#0a0908" strokeWidth={.8}/>{c&&<text x={x+BW/2} y={BH-8} textAnchor="middle" fontSize={8} fill="#1a1714" fontFamily="monospace" fontWeight="bold">{note}</text>}</g>);})}
    <line x1={7*WW} y1={0} x2={7*WW} y2={WH} stroke="rgba(240,235,224,0.2)" strokeWidth={1} strokeDasharray="4,3"/>
    <text x={3.5*WW} y={WH+15} textAnchor="middle" fontSize={9} fill="rgba(240,235,224,0.22)" fontFamily="monospace">OCT. 1</text>
    <text x={10.5*WW} y={WH+15} textAnchor="middle" fontSize={9} fill="rgba(240,235,224,0.22)" fontFamily="monospace">OCT. 2</text>
  </svg>);
}

function Hearts({total,remaining}){
  if(total===0)return<span style={{fontSize:11,fontFamily:'monospace',color:'rgba(240,235,224,0.4)'}}>∞</span>;
  return(<div style={{display:'flex',gap:3}}>{Array.from({length:total}).map((_,i)=>(<div key={i} style={{width:13,height:13,borderRadius:'50%',background:i<remaining?'#F1948A':'rgba(240,235,224,0.1)',border:i<remaining?'none':'0.5px solid rgba(240,235,224,0.15)',transition:'all 0.3s'}}/>))}</div>);
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
        {badge&&<span style={{fontSize:9,fontFamily:'monospace',color:'#fff',background:'rgba(74,222,128,0.85)',padding:'3px 9px',borderRadius:20,fontWeight:'bold',letterSpacing:'.06em',boxShadow:'0 2px 10px rgba(74,222,128,0.5)'}}>NOUVEAU</span>}
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
      <span style={{fontSize:10,letterSpacing:'.15em',fontFamily:'monospace',padding:'3px 8px',borderRadius:2,background:tip.level==='Débutant'?'rgba(130,224,170,0.12)':'rgba(133,193,233,0.12)',color:tip.level==='Débutant'?'#82E0AA':'#85C1E9'}}>{tip.level.toUpperCase()}</span>
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
      <div style={{width:'min(420px,92vw)',background:'#161512',border:`0.5px solid ${color}`,borderRadius:6,padding:'1.25rem',animation:'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 8px 40px rgba(0,0,0,0.6)'}}>
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
            return <button key={s} onClick={()=>setConfig(c=>({...(c||{total:10}),secs:s}))} style={{flex:1,padding:'.7rem',background:sel?'rgba(247,220,111,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${sel?'#F7DC6F':'rgba(240,235,224,0.1)'}`,color:sel?'#F7DC6F':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:13,fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>;
          })}
        </div>
      </div>
      <div style={{marginBottom:'2rem'}}>
        <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.65rem'}}>NOMBRE DE CARTES</div>
        <div style={{display:'flex',gap:8}}>
          {[10,20,30].map(n=>{
            const sel=(config?.total||10)===n;
            return <button key={n} onClick={()=>setConfig(c=>({...(c||{secs:5}),total:n}))} style={{flex:1,padding:'.7rem',background:sel?'rgba(247,220,111,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${sel?'#F7DC6F':'rgba(240,235,224,0.1)'}`,color:sel?'#F7DC6F':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>;
          })}
        </div>
      </div>
      <button onClick={()=>{const cfg={secs:config?.secs||5,total:config?.total||10};setConfig(cfg);setRound(0);setScore({correct:0,total:0});setDone(false);setTimeout(()=>{},50);}}
        style={{width:'100%',padding:'1rem',background:'rgba(247,220,111,0.15)',border:'1px solid #F7DC6F',color:'#F7DC6F',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>
        COMMENCER →
      </button>
    </div>
  );

  // Results
  if (done) {
    const pct=Math.round((score.correct/score.total)*100),mc=pct>=90?'#82E0AA':pct>=70?'#85C1E9':pct>=50?'#F7DC6F':'#F1948A';
    return (
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(247,220,111,0.05)',border:'0.5px solid rgba(247,220,111,0.2)',borderRadius:4}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS — SPEED FLASHCARDS</div>
          <div style={{fontSize:72,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:32,opacity:.5}}>/{score.total}</span></div>
          <div style={{fontSize:22,color:mc,marginBottom:'.5rem'}}>{pct}%</div>
          <div style={{fontSize:14,opacity:.6,fontFamily:'Georgia,serif'}}>{pct>=90?'Réflexes excellents !':pct>=70?'Très bonne mémorisation !':pct>=50?'Continue à pratiquer !':'Revois tes accords de base !'}</div>
        </div>
        <button onClick={()=>{setConfig(null);setDone(false);setCard(null);}} style={{padding:'.9rem',background:'rgba(247,220,111,0.15)',border:'1px solid #F7DC6F',color:'#F7DC6F',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>↩ RECONFIGURER</button>
        <button onClick={()=>{setRound(0);setScore({correct:0,total:0});setDone(false);genCard();}} style={{padding:'.9rem',background:'transparent',border:'0.5px solid rgba(240,235,224,0.2)',color:'rgba(240,235,224,0.5)',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em'}}>🔄 REJOUER</button>
      </div>
    );
  }

  // Initialize first card
  if (!card) { genCard(); return null; }

  const tPct = (timeLeft/(config.secs))*100;
  const timerColor = tPct>60?'#82E0AA':tPct>30?'#F7DC6F':'#F1948A';
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
              <div style={{fontSize:18,fontWeight:'bold',color:fullCorrect?'#82E0AA':'#F1948A',fontFamily:'Georgia,serif',marginBottom:8}}>
                {fullCorrect?'✓ Correct !':'✗ Raté'}
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',fontSize:11,fontFamily:'monospace'}}>
                <span style={{color:rootCorrect?'#82E0AA':'#F1948A'}}>Racine : {card.root} {rootCorrect?'✓':'✗'}</span>
                <span style={{opacity:.3}}>|</span>
                <span style={{color:typeCorrect?'#82E0AA':'#F1948A'}}>Type : {card.label} {typeCorrect?'✓':'✗'}</span>
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
                const c = NOTE_COLORS[root]||'#C39BD3';
                return (
                  <button key={root} onClick={()=>handleRootAnswer(root)}
                    style={{background:`${c}`,border:`0.5px solid ${c}`,color:c,padding:'.65rem .25rem',borderRadius:3,cursor:'pointer',fontSize:14,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c}`;e.currentTarget.style.transform='scale(1.04)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${c}`;e.currentTarget.style.transform='scale(1)';}}>
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
              <span style={{fontSize:10,color:NOTE_COLORS[userRoot||'C']||'#C39BD3',fontFamily:'monospace',fontWeight:'bold'}}>(racine : {userRoot})</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
              {Object.entries(CHORD_TYPES).map(([type,{label}]) => {
                const c = CHORD_COLORS[type]||'#C39BD3';
                return (
                  <button key={type} onClick={()=>handleTypeAnswer(type)}
                    style={{background:`${c}`,border:`0.5px solid ${c}`,color:c,padding:'.7rem .5rem',borderRadius:3,cursor:'pointer',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c}`;e.currentTarget.style.transform='scale(1.02)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${c}`;e.currentTarget.style.transform='scale(1)';}}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {answered && (
          <button onClick={next} style={{width:'100%',padding:'.9rem',background:fullCorrect?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.08)',border:`1px solid ${fullCorrect?'#82E0AA':'#F1948A'}`,color:fullCorrect?'#82E0AA':'#F1948A',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
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
      <div style={{background:'#161512',border:'0.5px solid rgba(240,235,224,0.12)',borderRadius:6,width:'min(420px,92vw)',maxHeight:'85vh',overflow:'hidden',display:'flex',flexDirection:'column',animation:'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>

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
              <span style={{fontSize:18,fontWeight:'bold',color:'#F7DC6F',fontFamily:'Georgia,serif'}}>{keys}</span>
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
                      <div style={{fontSize:14,fontWeight:'bold',color:done?'#82E0AA':'#f0ebe0',fontFamily:'Georgia,serif',marginBottom:2}}>{c.title}</div>
                      <div style={{fontSize:11,opacity:.45,fontFamily:'monospace'}}>{c.desc}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0,marginLeft:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:done?'rgba(130,224,170,0.15)':'rgba(247,220,111,0.08)',border:`0.5px solid ${done?'rgba(130,224,170,0.4)':'rgba(247,220,111,0.25)'}`,borderRadius:2}}>
                      <span style={{fontSize:12}}>🗝️</span>
                      <span style={{fontSize:13,fontWeight:'bold',color:done?'#82E0AA':'#F7DC6F',fontFamily:'monospace'}}>+{c.reward}</span>
                    </div>
                    {done&&<span style={{fontSize:9,color:'#82E0AA',fontFamily:'monospace',letterSpacing:'.05em'}}>✓ COMPLÉTÉ</span>}
                  </div>
                </div>
                {!done&&(
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>{prog.cur}/{prog.max}</span>
                      <span style={{fontSize:9,opacity:.35,fontFamily:'monospace'}}>{pct}%</span>
                    </div>
                    <div style={{height:4,background:'rgba(240,235,224,0.08)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:'#F7DC6F',borderRadius:2,transition:'width 0.6s ease'}}/>
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
        <button onClick={onToggleAll} style={{background:allSelected?'rgba(133,193,233,0.15)':'transparent',border:`0.5px solid ${allSelected?'#85C1E9':'rgba(240,235,224,0.2)'}`,color:allSelected?'#85C1E9':'rgba(240,235,224,0.5)',padding:'3px 8px',borderRadius:2,cursor:'pointer',fontSize:9,fontFamily:'monospace',letterSpacing:'.1em'}}>{allSelected?'DÉSÉLECTIONNER':'TOUT SÉLECTIONNER'}</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
        {items.map(item=>{const on=selected.has(item.id);return(<button key={item.id} onClick={()=>onToggle(item.id)} style={{background:on?`${item.color}`:'rgba(240,235,224,0.02)',border:`0.5px solid ${on?item.color:'rgba(240,235,224,0.1)'}`,borderRadius:3,padding:'.6rem .75rem',cursor:'pointer',display:'flex',alignItems:'center',gap:8,textAlign:'left',transition:'all 0.2s'}}>
          <div style={{width:14,height:14,borderRadius:2,flexShrink:0,background:on?item.color:'rgba(240,235,224,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>{on&&<span style={{fontSize:9,color:'#0f0e0c',fontWeight:'bold'}}>✓</span>}</div>
          <div><div style={{fontSize:12,fontWeight:'bold',color:on?item.color:'rgba(240,235,224,0.6)',fontFamily:'monospace'}}>{item.name}</div>{item.sub&&<div style={{fontSize:9,opacity:.4,fontFamily:'monospace'}}>{item.sub}</div>}</div>
        </button>);})}
      </div>
      {!canStart&&<p style={{fontSize:11,color:'#F1948A',fontFamily:'monospace',marginTop:'.5rem',opacity:.8}}>⚠ Sélectionne au moins 2 éléments</p>}
    </div>
    <div style={{marginBottom:'1.25rem'}}>
      <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.65rem'}}>EXERCICES PAR SESSION</div>
      <div style={{display:'flex',gap:8}}>{[5,10,15,20].map(n=>(<button key={n} onClick={()=>setExCount(n)} style={{flex:1,padding:'.6rem',background:exCount===n?'rgba(133,193,233,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${exCount===n?'#85C1E9':'rgba(240,235,224,0.1)'}`,color:exCount===n?'#85C1E9':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>))}</div>
    </div>
    <div style={{marginBottom:'2rem'}}>
      <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.65rem'}}>VIES</div>
      <div style={{display:'flex',gap:8}}>{[[3,'3 ❤'],[5,'5 ❤'],[0,'∞']].map(([n,label])=>(<button key={n} onClick={()=>setMaxLives(n)} style={{flex:1,padding:'.6rem',background:maxLives===n?'rgba(241,148,138,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${maxLives===n?'#F1948A':'rgba(240,235,224,0.1)'}`,color:maxLives===n?'#F1948A':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:13,fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>))}</div>
    </div>
    <button onClick={()=>canStart&&onStart()} style={{width:'100%',padding:'1rem',background:canStart?'rgba(133,193,233,0.15)':'rgba(240,235,224,0.03)',border:`1px solid ${canStart?'#85C1E9':'rgba(240,235,224,0.1)'}`,color:canStart?'#85C1E9':'rgba(240,235,224,0.25)',borderRadius:3,cursor:canStart?'pointer':'not-allowed',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',transition:'all 0.3s'}}>COMMENCER LA SESSION →</button>
  </div>);
}

function SessionResults({score,exCount,lives,maxLives,history,categoryData,onRetry,onReconfig}){
  const pct=Math.round((score/exCount)*100),mc=pct>=90?'#82E0AA':pct>=70?'#85C1E9':pct>=50?'#F7DC6F':'#F1948A';
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
      <button onClick={onRetry} style={{padding:'.9rem',background:'rgba(133,193,233,0.15)',border:'1px solid #85C1E9',color:'#85C1E9',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>🔄 REJOUER</button>
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
  const pianoColors={};if(ex&&answered){pianoColors[ex.note1]='#85C1E9';pianoColors[ex.note2]=iv?.color||'#C39BD3';}
  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'rgba(15,14,12,0.5)'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(240,235,224,0.4)',cursor:'pointer',fontSize:16}}>←</button>
      <div style={{flex:1,margin:'0 1rem'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{idx+1}/{exCount}</span><span style={{fontSize:10,fontFamily:'monospace',color:'#82E0AA'}}>{score} ✓</span></div><div style={{height:3,background:'rgba(240,235,224,0.08)',borderRadius:2}}><div style={{height:'100%',width:`${((idx+1)/exCount)*100}%`,background:'#85C1E9',borderRadius:2,transition:'width 0.3s ease'}}/></div></div>
      <Hearts total={maxLives} remaining={lives}/>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4}}>
        <p style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1rem'}}>QUEL EST CET INTERVALLE ?</p>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'2rem',marginBottom:'1rem'}}>
          <div style={{textAlign:'center'}}><div style={{width:54,height:54,borderRadius:'50%',background:'rgba(133,193,233,0.2)',border:'1px solid #85C1E9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:'bold',color:'#85C1E9',fontFamily:'monospace',margin:'0 auto 5px'}}>{ex?NM[ex.note1%12]:'—'}</div><div style={{fontSize:9,opacity:.3,fontFamily:'monospace'}}>{ex?semiToName(ex.note1):''}</div></div>
          <div style={{fontSize:20,opacity:.25}}>→</div>
          <div style={{textAlign:'center'}}><div style={{width:54,height:54,borderRadius:'50%',background:answered?(iv?`${iv.color}`:'rgba(240,235,224,0.05)'):'rgba(240,235,224,0.05)',border:`1px solid ${answered?(iv?.color||'rgba(240,235,224,0.3)'):'rgba(240,235,224,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:answered?17:22,fontWeight:'bold',color:answered?(iv?.color||'#f0ebe0'):'rgba(240,235,224,0.15)',fontFamily:'monospace',margin:'0 auto 5px',transition:'all 0.3s'}}>{answered?(ex?NM[ex.note2%12]:'—'):'?'}</div><div style={{fontSize:9,opacity:.3,fontFamily:'monospace'}}>{answered&&ex?semiToName(ex.note2):''}</div></div>
        </div>
        {answered&&(<div style={{animation:'fadeIn 0.3s ease',marginBottom:'.75rem'}}><div style={{fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',color:correct?'#82E0AA':'#F1948A',marginBottom:4}}>{correct?'✓ Correct !':'✗ Raté'}</div><div style={{fontSize:13,color:iv?.color,fontFamily:'monospace'}}>{iv?.full} ({ex?.intSemi} demi-ton{ex?.intSemi>1?'s':''})</div>{!correct&&<div style={{fontSize:11,opacity:.4,marginTop:4,fontFamily:'monospace'}}>Tu as répondu : {INTERVALS_DATA.find(i=>i.semi===userSemi)?.full}</div>}</div>)}
        <div style={{display:'flex',gap:7,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>ex&&playSeq(ex.note1,ex.note2)} style={{background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.6)',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🔊 SÉQUENTIEL</button>
          <button onClick={()=>ex&&playSimul(ex.note1,ex.note2)} style={{background:'rgba(133,193,233,0.07)',border:'0.5px solid rgba(133,193,233,0.25)',color:'#85C1E9',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎵 SIMULTANÉ</button>
          {answered&&<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?'rgba(133,193,233,0.1)':'rgba(240,235,224,0.05)',border:`0.5px solid ${showPiano?'#85C1E9':'rgba(240,235,224,0.15)'}`,color:showPiano?'#85C1E9':'rgba(240,235,224,0.5)',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎹 CLAVIER</button>}
        </div>
      </div>
      {answered&&showPiano&&ex&&(<div style={{padding:'1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease',overflowX:'auto'}}><div style={{fontSize:9,opacity:.3,fontFamily:'monospace',marginBottom:'.75rem',textAlign:'center'}}><span style={{color:'#85C1E9'}}>■</span> Départ &nbsp;<span style={{color:iv?.color}}>■</span> Arrivée</div><PianoKeyboard colors={pianoColors}/></div>)}
      <div><div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>{answered?'INTERVALLES':'CHOISIR'}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
          {selIvs.map(i=>{const isU=userSemi===i.semi,isOk=i.semi===ex?.intSemi;let bg='rgba(240,235,224,0.03)',b='rgba(240,235,224,0.1)',col='rgba(240,235,224,0.7)';if(answered){if(isOk){bg=`${i.color}`;b=i.color;col=i.color;}else if(isU){bg='rgba(241,148,138,0.1)';b='#F1948A';col='#F1948A';}else col='rgba(240,235,224,0.2)';}return(<button key={i.semi} onClick={()=>handleAnswer(i.semi)} disabled={answered} style={{background:bg,border:`0.5px solid ${b}`,color:col,padding:'.65rem .25rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.02em',transition:'all 0.2s',lineHeight:1.3}}>{i.name}</button>);})}
        </div>
      </div>
      {answered&&(<button onClick={handleNext} style={{width:'100%',padding:'.9rem',background:correct?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.08)',border:`1px solid ${correct?'#82E0AA':'#F1948A'}`,color:correct?'#82E0AA':'#F1948A',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>{idx>=exCount-1?'VOIR LES RÉSULTATS →':'EXERCICE SUIVANT →'}</button>)}
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
  const pianoColors={};if(ex&&answered){const c=CHORD_COLORS[ex.type]||'#C39BD3';ex.notes.forEach((n,i)=>{pianoColors[n]=i===0?'#85C1E9':c;});}
  const rootName=ex?NM[ex.rootSemi]:'';
  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'rgba(15,14,12,0.5)'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(240,235,224,0.4)',cursor:'pointer',fontSize:16}}>←</button>
      <div style={{flex:1,margin:'0 1rem'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{idx+1}/{exCount}</span><span style={{fontSize:10,fontFamily:'monospace',color:'#82E0AA'}}>{score} ✓</span></div><div style={{height:3,background:'rgba(240,235,224,0.08)',borderRadius:2}}><div style={{height:'100%',width:`${((idx+1)/exCount)*100}%`,background:'#C39BD3',borderRadius:2,transition:'width 0.3s ease'}}/></div></div>
      <Hearts total={maxLives} remaining={lives}/>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4}}>
        <p style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1.25rem'}}>QUEL TYPE D'ACCORD ?</p>
        <div style={{marginBottom:'1rem'}}>
          <div style={{fontSize:answered?52:48,fontWeight:'bold',fontFamily:'Georgia,serif',color:answered?(CHORD_COLORS[ex.type]||'#C39BD3'):'rgba(240,235,224,0.15)',transition:'all 0.4s',lineHeight:1,marginBottom:6}}>{answered?`${rootName}${ci?.suffix}`:'?'}</div>
          {answered&&<div style={{fontSize:13,color:CHORD_COLORS[ex.type]||'#C39BD3',fontFamily:'monospace'}}>{ci?.label}</div>}
          {answered&&ex&&<div style={{fontSize:11,opacity:.4,fontFamily:'monospace',marginTop:4}}>{ex.notes.map(n=>NM[n%12]).join(' – ')}</div>}
        </div>
        {answered&&(<div style={{animation:'fadeIn 0.3s ease',marginBottom:'.75rem'}}><div style={{fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',color:correct?'#82E0AA':'#F1948A'}}>{correct?'✓ Correct !':'✗ Raté — '+ci?.label}</div></div>)}
        <div style={{display:'flex',gap:7,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>ex&&playChordArp(ex.notes)} style={{background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.6)',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🔊 ARPÈGE</button>
          <button onClick={()=>ex&&playChordSimul(ex.notes)} style={{background:'rgba(195,155,211,0.07)',border:'0.5px solid rgba(195,155,211,0.3)',color:'#C39BD3',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎵 SIMULTANÉ</button>
          {answered&&<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?'rgba(195,155,211,0.1)':'rgba(240,235,224,0.05)',border:`0.5px solid ${showPiano?'#C39BD3':'rgba(240,235,224,0.15)'}`,color:showPiano?'#C39BD3':'rgba(240,235,224,0.5)',padding:'.4rem .85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎹 CLAVIER</button>}
        </div>
      </div>
      {answered&&showPiano&&ex&&(<div style={{padding:'1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease',overflowX:'auto'}}><div style={{fontSize:9,opacity:.3,fontFamily:'monospace',marginBottom:'.75rem',textAlign:'center'}}><span style={{color:'#85C1E9'}}>■</span> Tonique &nbsp;<span style={{color:CHORD_COLORS[ex.type]}}>■</span> Notes</div><PianoKeyboard colors={pianoColors}/></div>)}
      <div><div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>{answered?'TYPES':'CHOISIR LE TYPE'}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
          {selTypes.map(([type,{label}])=>{const isU=userType===type,isOk=type===ex?.type,tc=CHORD_COLORS[type]||'#C39BD3';let bg='rgba(240,235,224,0.03)',b='rgba(240,235,224,0.1)',col='rgba(240,235,224,0.7)';if(answered){if(isOk){bg=`${tc}`;b=tc;col=tc;}else if(isU){bg='rgba(241,148,138,0.1)';b='#F1948A';col='#F1948A';}else col='rgba(240,235,224,0.2)';}return(<button key={type} onClick={()=>handleAnswer(type)} disabled={answered} style={{background:bg,border:`0.5px solid ${b}`,color:col,padding:'.7rem .5rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>);})}
        </div>
      </div>
      {answered&&(<button onClick={handleNext} style={{width:'100%',padding:'.9rem',background:correct?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.08)',border:`1px solid ${correct?'#82E0AA':'#F1948A'}`,color:correct?'#82E0AA':'#F1948A',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>{idx>=exCount-1?'VOIR LES RÉSULTATS →':'EXERCICE SUIVANT →'}</button>)}
    </div>
  </div>);
}

function AccordOreilleSection({onBack}){
  const [screen,setScreen]=useState('config');const[config,setConfig]=useState(null);const[result,setResult]=useState(null);
  const [selected,setSelected]=useState(new Set(['Majeures','Mineures']));const[exCount,setExCount]=useState(10);const[maxLives,setMaxLives]=useState(3);
  const items=Object.entries(CHORD_TYPES).map(([t,{label}])=>({id:t,name:label,sub:t,color:CHORD_COLORS[t]||'#C39BD3'}));
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
  { id:'blues',   label:'Blues',         color:'#F59E0B',
    scale:[0,3,5,6,7,10], prog:['C','F','G'], type:'Majeures',
    desc:'Pentatonique mineure + blue note. La couleur émotionnelle du blues.' },
  { id:'jazz',    label:'Jazz',          color:'#8B5CF6',
    scale:[0,2,4,7,9], prog:['D','G','C'], type:'Min. 7',
    desc:'Mode dorien. L\'espace harmonique du jazz moderne.' },
  { id:'pop',     label:'Pop',           color:'#06B6D4',
    scale:[0,2,4,5,7,9,11], prog:['C','G','A','F'], type:'Majeures',
    desc:'Gamme majeure. Lumineux et accessible, idéal pour commencer.' },
  { id:'latin',   label:'Latin',         color:'#EF4444',
    scale:[0,2,3,5,7,8,10], prog:['A','D','E','A'], type:'Mineures',
    desc:'Mode mineur mélodique. Chaleur et danse, flamenco et bossa.' },
  { id:'modal',   label:'Modal',         color:'#10B981',
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
    { id:'easy',   label:'Facile',   length:4, scale:PENTATONIC_SEMIS,  minNote:0,  maxNote:12, lives:5, color:'#82E0AA' },
    { id:'medium', label:'Moyen',    length:6, scale:MAJOR_SCALE_SEMIS, minNote:0,  maxNote:14, lives:3, color:'#F7DC6F' },
    { id:'hard',   label:'Difficile',length:8, scale:MAJOR_SCALE_SEMIS, minNote:0,  maxNote:19, lives:2, color:'#F1948A' },
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
    if (feedback === 'correct' && absIdx === melody[userInput.length-1]) return '#82E0AA';
    if (feedback === 'wrong'   && absIdx === melody[userInput.length])   return '#F1948A';
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
    const mc  = pct>=80?'#82E0AA':pct>=50?'#F7DC6F':'#F1948A';
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
          {!isPlaying && feedback==='correct' && <div style={{fontSize:18,color:'#82E0AA',fontWeight:'bold',fontFamily:'Georgia,serif'}}>✓ Bonne note !</div>}
          {!isPlaying && feedback==='wrong'   && <div style={{fontSize:18,color:'#F1948A',fontWeight:'bold',fontFamily:'Georgia,serif'}}>✗ Mauvaise note</div>}
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
              style={{flex:1,padding:'.6rem',background:'rgba(241,148,138,0.12)',border:'1px solid rgba(241,148,138,0.4)',borderRadius:8,cursor:'pointer',color:'#F1948A',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold'}}>
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
                  style={{position:'absolute',left:adjWi*34,top:0,width:32,height:95,background:c||'#f3ede0',border:'1.5px solid #555',borderRadius:'0 0 5px 5px',cursor:isPlaying?'not-allowed':'pointer',transition:'background 0.1s',display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:4}}
                  onMouseEnter={e=>{if(!c&&!isPlaying)e.currentTarget.style.background='#e0d8c8';}}
                  onMouseLeave={e=>{if(!c)e.currentTarget.style.background='#f3ede0';}}>
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

        <div style={{padding:'.65rem .9rem',background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.18)',borderRadius:10}}>
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
    if (played.includes(ai) && ai===played[played.length-1] && feedback==='correct') return '#82E0AA';
    if (feedback==='wrong' && ai===notes[curIdx]) return '#F1948A';
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
      <div style={{padding:'.9rem',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:12,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.65,fontFamily:'Georgia,serif'}}>L'app joue une mélodie. Tu essaies de la reproduire note par note sur le piano. Choisis ta vitesse d'écoute.</p>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>VITESSE D'ÉCOUTE</div>
        <div style={{display:'flex',gap:8}}>
          {[[1,'🎵 Normale'],[0.5,'🐢 Lente (×0.5)']].map(([v,label])=>(
            <button key={v} onClick={()=>setTempo(v)} style={{flex:1,padding:'.55rem',background:tempo===v?'rgba(139,92,246,0.2)':'transparent',border:`1px solid ${tempo===v?'#A78BFA':'rgba(255,255,255,0.12)'}`,borderRadius:8,cursor:'pointer',color:tempo===v?'#A78BFA':'rgba(255,255,255,0.45)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>CHOISIR UNE MÉLODIE</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {OREILLE_ABSOLUE_PIECES.map(p=>(
          <button key={p.id} onClick={()=>loadPiece(p)}
            style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'.9rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(139,92,246,0.1)';e.currentTarget.style.borderColor='rgba(139,92,246,0.35)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
            <div>
              <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:3}}>{p.title}</div>
              <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{p.desc}</div>
            </div>
            <div style={{display:'flex',gap:2}}>
              {[1,2,3].map(s=><div key={s} style={{width:8,height:8,borderRadius:'50%',background:s<=p.diff?'#A78BFA':'rgba(255,255,255,0.12)'}}/>)}
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
        <div style={{fontSize:18,fontWeight:'bold',color:screen==='done'?'#82E0AA':'#F1948A',fontFamily:'Georgia,serif',marginBottom:8}}>
          {screen==='done'?'Bravo ! Mélodie complète !':'Essaie encore !'}
        </div>
        <div style={{fontSize:12,opacity:.5,fontFamily:'monospace'}}>{piece?.title}</div>
      </div>
      <button onClick={()=>loadPiece(piece)} style={{padding:'.9rem',background:'rgba(139,92,246,0.15)',border:'1.5px solid #A78BFA',color:'#A78BFA',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>🔄 REJOUER</button>
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
            <div style={{height:'100%',width:`${(played.length/notes.length)*100}%`,background:'#A78BFA',borderRadius:2,transition:'width 0.2s'}}/>
          </div>
        </div>
        <Hearts total={3} remaining={lives}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div style={{textAlign:'center',padding:'.85rem',background:feedback==='correct'?'rgba(130,224,170,0.1)':feedback==='wrong'?'rgba(241,148,138,0.1)':isPlaying?'rgba(167,139,250,0.08)':'rgba(255,255,255,0.03)',border:`1px solid ${feedback==='correct'?'rgba(130,224,170,0.35)':feedback==='wrong'?'rgba(241,148,138,0.35)':isPlaying?'rgba(167,139,250,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:10,transition:'all 0.15s'}}>
          {isPlaying   && <span style={{color:'#A78BFA',fontSize:14,fontFamily:'monospace',letterSpacing:'.06em',animation:'fadeIn 0.2s'}}>🎵 Écoute en cours…</span>}
          {!isPlaying && feedback==='correct' && <span style={{color:'#82E0AA',fontSize:16}}>✓ Bonne note !</span>}
          {!isPlaying && feedback==='wrong'   && <span style={{color:'#F1948A',fontSize:16}}>✗ Mauvaise note !</span>}
          {!isPlaying && !feedback            && <span style={{fontSize:11,opacity:.45,fontFamily:'monospace'}}>NOTE {curIdx+1}/{notes.length}</span>}
        </div>
        {/* Controls — avec PAUSE */}
        <div style={{display:'flex',gap:8}}>
          {isPlaying ? (
            <button onClick={clearAllTimeouts}
              style={{flex:1,padding:'.55rem',background:'rgba(241,148,138,0.12)',border:'1px solid rgba(241,148,138,0.4)',borderRadius:8,cursor:'pointer',color:'#F1948A',fontSize:11,fontFamily:'monospace',fontWeight:'bold'}}>
              ⏸ PAUSE
            </button>
          ) : (
            <>
              <button onClick={()=>scheduledPlayNotes(notes,1)}    style={{flex:1,padding:'.55rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'monospace'}}>▶ Écouter</button>
              <button onClick={()=>scheduledPlayNotes(notes,0.55)} style={{flex:1,padding:'.55rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'monospace'}}>🐢 Lent</button>
              <button onClick={()=>{setShowTipBox(v=>!v);setTipIdx(Math.floor(Math.random()*OREILLE_TIPS.length));}} style={{flex:1,padding:'.55rem',background:showTipBox?'rgba(139,92,246,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${showTipBox?'rgba(139,92,246,0.4)':'rgba(255,255,255,0.15)'}`,borderRadius:8,cursor:'pointer',color:showTipBox?'#A78BFA':'rgba(255,255,255,0.7)',fontSize:11,fontFamily:'monospace'}}>💡</button>
            </>
          )}
        </div>
        {showTipBox && <div style={{padding:'.75rem',background:'rgba(139,92,246,0.09)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:10,fontSize:12,color:'rgba(255,255,255,0.7)',fontFamily:'Georgia,serif',fontStyle:'italic',animation:'fadeIn 0.2s ease'}}>{OREILLE_TIPS[tipIdx]}</div>}
        {/* Piano */}
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'.85rem',overflowX:'auto'}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',textAlign:'center',marginBottom:'.65rem',letterSpacing:'.1em'}}>{isPlaying?'ÉCOUTE EN COURS…':'TAPE LA NOTE SUIVANTE'}</div>
          <div style={{position:'relative',height:100}}>
            {whites2.map(({absIdx,wi})=>{
              const c=keyColor2(absIdx);
              return <div key={absIdx} onClick={()=>handlePianoKey(absIdx)}
                style={{position:'absolute',left:wi*34,top:0,width:32,height:95,background:c||'#f3ede0',border:'1.5px solid #555',borderRadius:'0 0 5px 5px',cursor:isPlaying?'not-allowed':'pointer',transition:'background 0.1s',display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:4}}
                onMouseEnter={e=>{if(!c&&!isPlaying)e.currentTarget.style.background='#e0d8c8';}}
                onMouseLeave={e=>{if(!c)e.currentTarget.style.background='#f3ede0';}}>
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
        <div style={{padding:'1.25rem',background:`${style?.color||'#8B5CF6'}`,border:`1px solid ${style?.color||'#8B5CF6'}`,borderRadius:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
            <div style={{fontSize:18,fontWeight:'bold',color:style?.color||'#8B5CF6',fontFamily:'Georgia,serif'}}>{style?.label} — {key}</div>
            <button onClick={generate} style={{padding:'.4rem .85rem',background:`${style?.color||'#8B5CF6'}`,border:`1px solid ${style?.color||'#8B5CF6'}`,color:style?.color||'#8B5CF6',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎲 NOUVEAU</button>
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
              const nc=NOTE_COLORS[n]||'#C39BD3';
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
              const nc=NOTE_COLORS[chord.r]||'#C39BD3';
              return <div key={ci} style={{padding:'.55rem .8rem',background:`${nc}10`,border:`1.5px solid ${nc}`,borderRadius:10,textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:'bold',color:nc,fontFamily:'monospace',lineHeight:1}}>{chord.r}{CHORD_TYPES[chord.t]?.suffix}</div>
              </div>;
            })}
          </div>
        </div>

        {/* Tips */}
        <div style={{padding:'1rem',background:'rgba(247,220,111,0.06)',border:'1px solid rgba(247,220,111,0.18)',borderRadius:12}}>
          <div style={{fontSize:10,color:'#F7DC6F',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>CONSEILS D'IMPROVISATION</div>
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
      <button onClick={generate} style={{width:'100%',padding:'1rem',background:'linear-gradient(135deg,#8B5CF6,#F43F5E)',border:'none',borderRadius:14,cursor:'pointer',fontSize:14,fontFamily:'Georgia,serif',fontWeight:'bold',color:'#fff',marginBottom:'1.25rem',boxShadow:'0 6px 20px rgba(139,92,246,0.35)',letterSpacing:'.02em'}}>
        🎲 GÉNÉRER DE FAÇON ALÉATOIRE
      </button>
      <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>OU CHOISIR UN STYLE</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {IMPRO_STYLES.map(s=>(
          <button key={s.id} onClick={()=>{setStyle(s);generate();}}
            style={{background:style?.id===s.id?`${s.color}`:'rgba(255,255,255,0.03)',border:`1.5px solid ${style?.id===s.id?s.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.85rem 1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${s.color}`;e.currentTarget.style.borderColor=`${s.color}`;}}
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
    <svg viewBox="0 0 80 110" width={size} height={size*1.375} style={{overflow:'visible',filter:'drop-shadow(0 4px 12px rgba(139,92,246,0.4))',animation:animate?'orbFloat 2s ease-in-out infinite':undefined}}>
      {/* Corps de la noire (tête ovale) */}
      <ellipse cx="40" cy="52" rx="26" ry="22" fill="#1a0a2e" stroke="#A78BFA" strokeWidth="2.5"/>
      {/* Reflet lumineux */}
      <ellipse cx="33" cy="43" rx="8" ry="5" fill="rgba(167,139,250,0.25)" transform="rotate(-20,33,43)"/>
      {/* Queue de la noire */}
      <rect x="64" y="18" width="3.5" height="42" rx="1.5" fill="#A78BFA"/>
      {/* Drapeau de la noire */}
      <path d="M 67.5 18 Q 78 24 72 34 Q 78 30 67.5 38" fill="#A78BFA"/>
      {/* Yeux */}
      <ellipse cx="31" cy={eyeY} rx="5" ry="5.5" fill="white"/>
      <ellipse cx="49" cy={eyeY} rx="5" ry="5.5" fill="white"/>
      <circle cx="32.5" cy={eyeY+1} r="3" fill="#1a0a2e"/>
      <circle cx="50.5" cy={eyeY+1} r="3" fill="#1a0a2e"/>
      {/* Reflets des yeux */}
      <circle cx="33.5" cy={eyeY-1} r="1" fill="white" opacity="0.9"/>
      <circle cx="51.5" cy={eyeY-1} r="1" fill="white" opacity="0.9"/>
      {/* Joues (si happy) */}
      {expression==='happy' && <>
        <ellipse cx="20" cy="48" rx="5" ry="3" fill="#F43F5E" opacity="0.5"/>
        <ellipse cx="60" cy="48" rx="5" ry="3" fill="#F43F5E" opacity="0.5"/>
      </>}
      {/* Bouche */}
      <path d={mouthPath} stroke="#A78BFA" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Petites notes décoratives (si happy) */}
      {expression==='happy' && <>
        <text x="4" y="30" fontSize="10" fill="#F7DC6F" opacity="0.8">♪</text>
        <text x="64" y="78" fontSize="8" fill="#82E0AA" opacity="0.8">♫</text>
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
    <div style={{position:'fixed',bottom:'5.5rem',left:'50%',transform:'translateX(-50%)',width:'min(320px,88vw)',background:'linear-gradient(135deg,#1a0a2e,#0D0B1E)',border:'2px solid rgba(167,139,250,0.5)',borderRadius:20,padding:'1.25rem',zIndex:300,boxShadow:'0 16px 48px rgba(139,92,246,0.4)',animation:'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'.85rem'}}>
        <Mascotte expression={expr} size={56} animate={type==='idle'}/>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:'bold',color:'#A78BFA',fontFamily:'Georgia,serif',marginBottom:4}}>Noire</div>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.55,margin:0,fontFamily:'Georgia,serif'}}>{msg}</p>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.35)',cursor:'pointer',fontSize:18,lineHeight:1,flexShrink:0,padding:'0 2px'}}>×</button>
      </div>
      <div style={{display:'flex',gap:8}}>
        {onAction && (
          <button onClick={onAction}
            style={{flex:1,padding:'.55rem',background:'linear-gradient(135deg,#8B5CF6,#A78BFA)',border:'none',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',color:'#fff',fontWeight:'bold',letterSpacing:'.06em',boxShadow:'0 4px 12px rgba(139,92,246,0.4)'}}>
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
            {id:'mode',     label:'Niveau 1 — Majeur ou Mineur', desc:'Identifier la couleur harmonique',  color:'#82E0AA'},
            {id:'tonality', label:'Niveau 2 — + Tonalité',       desc:'Identifier aussi la note tonique',  color:'#F7DC6F'},
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
            <button key={n} onClick={()=>setExCount(n)} style={{flex:1,padding:'.65rem',background:exCount===n?'rgba(247,220,111,0.15)':'rgba(255,255,255,0.03)',border:`1.5px solid ${exCount===n?'#F7DC6F':'rgba(255,255,255,0.1)'}`,color:exCount===n?'#F7DC6F':'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>
          ))}
        </div>
      </div>
      <button onClick={start} style={{width:'100%',padding:'1rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #F7DC6F',color:'#F7DC6F',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>COMMENCER →</button>
    </div>
  );

  // Result
  if (mode==='result') {
    const pct=Math.round((score/exercises.length)*100);
    const mc=pct>=80?'#82E0AA':pct>=50?'#F7DC6F':'#F1948A';
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
        <button onClick={start} style={{padding:'.9rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #F7DC6F',color:'#F7DC6F',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>🔄 REJOUER</button>
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
          <div style={{height:'100%',width:`${((idx+1)/exercises.length)*100}%`,background:'#F7DC6F',borderRadius:2,transition:'width 0.3s ease'}}/>
        </div>
        <span style={{fontSize:10,fontFamily:'monospace',color:'#82E0AA'}}>{score} ✓</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Question */}
        <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(247,220,111,0.05)',border:'1px solid rgba(247,220,111,0.18)',borderRadius:12}}>
          <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1rem'}}>
            {level==='mode'?'CETTE MÉLODIE EST-ELLE MAJEURE OU MINEURE ?':'IDENTIFIE LA TONALITÉ ET LE MODE'}
          </div>
          <button onClick={()=>ex&&playExercise(ex)}
            style={{background:'rgba(247,220,111,0.12)',border:'1px solid rgba(247,220,111,0.4)',color:'#F7DC6F',padding:'.6rem 1.4rem',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.08em',fontWeight:'bold'}}>
            🔊 RÉÉCOUTER
          </button>
        </div>

        {/* Answered feedback */}
        {answered && (
          <div style={{textAlign:'center',padding:'.85rem',background:isCorrect?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.1)',border:`1px solid ${isCorrect?'rgba(130,224,170,0.35)':'rgba(241,148,138,0.35)'}`,borderRadius:10,animation:'fadeIn 0.25s ease'}}>
            <div style={{fontSize:16,fontWeight:'bold',color:isCorrect?'#82E0AA':'#F1948A',fontFamily:'Georgia,serif',marginBottom:4}}>
              {isCorrect?'✓ Correct !':'✗ Incorrect'}
            </div>
            <div style={{fontSize:12,opacity:.65,fontFamily:'monospace'}}>
              Réponse : <strong style={{color:'#F7DC6F'}}>{ex?.key} {ex?.mode==='major'?'Majeur':'Mineur'}</strong>
            </div>
          </div>
        )}

        {/* Level 1 — Majeur/Mineur */}
        {!answered && level==='mode' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {val:'major', label:'☀ MAJEUR',  desc:'Lumineux, joyeux',   color:'#F7DC6F'},
              {val:'minor', label:'🌙 MINEUR', desc:'Sombre, mélancolique', color:'#C39BD3'},
            ].map(opt=>(
              <button key={opt.val} onClick={()=>handleAnswer(opt.val)}
                style={{padding:'1.25rem .5rem',background:`${opt.color}08`,border:`1.5px solid ${opt.color}40`,borderRadius:14,cursor:'pointer',textAlign:'center',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${opt.color}`;e.currentTarget.style.borderColor=opt.color;e.currentTarget.style.transform='scale(1.03)';}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${opt.color}`;e.currentTarget.style.borderColor=`${opt.color}`;e.currentTarget.style.transform='scale(1)';}}>
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
                const nc=NOTE_COLORS[k]||'#F7DC6F';
                return <button key={k} onClick={()=>handleAnswer({key:k,mode:'major'})}
                  style={{background:`${nc}10`,border:`1px solid ${nc}`,color:nc,padding:'.5rem .1rem',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${nc}`;e.currentTarget.style.transform='scale(1.05)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${nc}`;e.currentTarget.style.transform='scale(1)';}}>{k}</button>;
              })}
            </div>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>PUIS LE MODE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[{val:'major',label:'☀ Majeur',color:'#F7DC6F'},{val:'minor',label:'🌙 Mineur',color:'#C39BD3'}].map(m=>(
                <button key={m.val} onClick={()=>handleAnswer({key:ex?.key||'C',mode:m.val})}
                  style={{padding:'.75rem',background:`${m.color}08`,border:`1px solid ${m.color}`,borderRadius:10,cursor:'pointer',color:m.color,fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {answered && (
          <button onClick={next} style={{width:'100%',padding:'.9rem',background:isCorrect?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${isCorrect?'#82E0AA':'#F1948A'}`,color:isCorrect?'#82E0AA':'#F1948A',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
            {idx>=exercises.length-1?'VOIR LES RÉSULTATS →':'EXERCICE SUIVANT →'}
          </button>
        )}

        <div style={{padding:'.65rem .9rem',background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.18)',borderRadius:10}}>
          <p style={{fontSize:11,opacity:.55,margin:0,fontFamily:'Georgia,serif',fontStyle:'italic'}}>
            💡 Astuce : une gamme majeure sonne "heureuse" et lumineuse. Une gamme mineure sonne "nostalgique" ou "sombre". Fais confiance à tes émotions.
          </p>
        </div>
      </div>
    </div>
  );
}

function OreilPage(){
  const [sub,setSub]=useState(null);
  if(sub==='intervalles') return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><IntervallesSection onBack={()=>setSub(null)}/></div>);
  if(sub==='accords')     return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><AccordOreilleSection onBack={()=>setSub(null)}/></div>);
  if(sub==='melodie')     return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><MelodieSection onBack={()=>setSub(null)}/></div>);
  if(sub==='absolue')     return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><OreilleAbsolue onBack={()=>setSub(null)}/></div>);
  if(sub==='gamme')       return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><GammeRecognition onBack={()=>setSub(null)}/></div>);

  const MODS=[
    {id:'intervalles', icon:'🎵', title:'Intervalles',          subtitle:'IDENTIFIER LES DISTANCES',    color:'#85C1E9'},
    {id:'accords',     icon:'🎹', title:'Accords',               subtitle:"IDENTIFIER À L'OREILLE",      color:'#C39BD3'},
    {id:'melodie',     icon:'🎼', title:'Mélodie',               subtitle:'DICTÉE MÉLODIQUE',             color:'#82E0AA'},
    {id:'absolue',     icon:'👁', title:'Oreille Absolue',       subtitle:'ÉCOUTER ET REPRODUIRE',        color:'#A78BFA'},
    {id:'gamme',       icon:'🎸', title:'Reconnaissance Gamme',  subtitle:'MAJEUR · MINEUR · TONALITÉ',   color:'#F7DC6F'},
  ];
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    <div style={{marginBottom:'1.5rem'}}>
      <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Oreille Musicale</h2>
      <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>DÉVELOPPE TON OREILLE PAR L'ÉCOUTE ACTIVE</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
      {MODS.map(m=>(<button key={m.id} onClick={()=>setSub(m.id)}
        style={{background:`${m.color}08`,border:`1px solid ${m.color}`,borderRadius:14,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
        onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-2px)';}}
        onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}`;e.currentTarget.style.borderColor=`${m.color}`;e.currentTarget.style.transform='translateY(0)';}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <span style={{fontSize:26}}>{m.icon}</span>
          <span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}`,padding:'2px 5px',borderRadius:6}}>DISPONIBLE</span>
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
  { id:1, title:"Canon en Ré",     artist:"Pachelbel",     era:"Baroque ~1680", key:"Ré",   bpm:100, cat:"classique", color:"#85C1E9",
    chords:[{n:"D",t:"Majeures"},{n:"A",t:"Majeures"},{n:"B",t:"Mineures"},{n:"F#",t:"Mineures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Majeures"}] },
  { id:2, title:"Prélude en Do",   artist:"J.S. Bach",     era:"Baroque ~1722", key:"Do",   bpm:80,  cat:"classique", color:"#C39BD3",
    chords:[{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"D",t:"Mineures"},{n:"G",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:3, title:"Für Elise",       artist:"Beethoven",     era:"Classique 1810",key:"La min.",bpm:76, cat:"classique", color:"#82E0AA",
    chords:[{n:"A",t:"Mineures"},{n:"E",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"}] },
  { id:4, title:"Minuet en Sol",   artist:"J.S. Bach",     era:"Baroque ~1725", key:"Sol",  bpm:126, cat:"classique", color:"#F7DC6F",
    chords:[{n:"G",t:"Majeures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"}] },
  { id:5, title:"Greensleeves",    artist:"Traditionnel",  era:"XVIe siècle",   key:"La min.",bpm:80, cat:"folk", color:"#AED6F1",
    chords:[{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"F",t:"Majeures"},{n:"E",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"E",t:"Majeures"}] },
  { id:6, title:"Scarborough Fair", artist:"Traditionnel", era:"Folk anglais",  key:"La min.",bpm:90, cat:"folk", color:"#82E0AA",
    chords:[{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"D",t:"Majeures"},{n:"A",t:"Mineures"}] },
  { id:7, title:"Amazing Grace",   artist:"Traditionnel",  era:"Hymne ~1779",   key:"Do",   bpm:70,  cat:"folk", color:"#F1948A",
    chords:[{n:"G",t:"Majeures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:8, title:"Hallelujah",      artist:"L. Cohen",      era:"1984",          key:"Do",   bpm:60,  cat:"pop", color:"#C39BD3",
    chords:[{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"F",t:"Majeures"},{n:"G",t:"Majeures"}] },
  { id:9, title:"Let It Be",       artist:"The Beatles",   era:"1970",          key:"Do",   bpm:76,  cat:"pop", color:"#85C1E9",
    chords:[{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"},{n:"F",t:"Majeures"}] },
  { id:10,title:"Knockin' on Heaven's Door",artist:"B. Dylan",era:"1973",        key:"Sol",  bpm:68,  cat:"pop", color:"#82E0AA",
    chords:[{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:11,title:"Stand By Me",     artist:"B.E. King",     era:"1961",          key:"La",   bpm:120, cat:"pop", color:"#F7DC6F",
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
  {fr:'Ré',  en:'D',  semi:2,  color:'#85C1E9'},
  {fr:'Mi',  en:'E',  semi:4,  color:'#82E0AA'},
  {fr:'Fa',  en:'F',  semi:5,  color:'#F1948A'},
  {fr:'Sol', en:'G',  semi:7,  color:'#C39BD3'},
  {fr:'La',  en:'A',  semi:9,  color:'#F7DC6F'},
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
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"}], scales:["Do majeur","Pentatonique majeure"], color:"#85C1E9" },
  { id:2, name:"ii – V – I",            style:"Jazz",             emotion:"La progression phare du jazz. La tension du ii-V se résout naturellement sur le I, créant un sentiment de sophistication et de satisfaction harmonique.",
    chords:[{r:"D",t:"Min. 7",fn:"ii7"},{r:"G",t:"Dom. 7",fn:"V7"},{r:"C",t:"Maj. 7",fn:"Imaj7"}], scales:["Do majeur","Bebop dominante"], color:"#F7DC6F" },
  { id:3, name:"i – VII – VI – V",      style:"Andalou / Flamenco",emotion:"La cadence andalouse. Mystère, passion et intensité dramatique. Très utilisée en flamenco, metal et pop alternative pour créer une atmosphère ibérique.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"G",t:"Majeures",fn:"VII"},{r:"F",t:"Majeures",fn:"VI"},{r:"E",t:"Majeures",fn:"V"}], scales:["Phrygien dominant","La mineur harmonique"], color:"#F1948A" },
  { id:4, name:"I – IV – V – I",        style:"Blues / Gospel",   emotion:"Le fondement du blues et du gospel. Simple, honnête et profond — communique une énergie directe et une satisfaction rythmique universelle.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"F",t:"Majeures",fn:"IV"},{r:"G",t:"Majeures",fn:"V"},{r:"C",t:"Majeures",fn:"I"}], scales:["Blues","Pentatonique mineure"], color:"#82E0AA" },
  { id:5, name:"I – vi – IV – V",       style:"Doo-Wop / Pop 50s",emotion:"La progression des années 50. Nostalgique, romantique et intemporelle — évoque l'innocence, les premières amours et la musique de voiture.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"},{r:"G",t:"Majeures",fn:"V"}], scales:["Do majeur","Pentatonique majeure"], color:"#AED6F1" },
  { id:6, name:"i – iv – V – i",        style:"Mineur classique", emotion:"Mélancolie profonde et résolution dramatique. Utilisée dans le classique et le métal pour exprimer la douleur et la catharsis émotionnelle.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"D",t:"Mineures",fn:"iv"},{r:"E",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"i"}], scales:["La mineur harmonique","Dorien"], color:"#C39BD3" },
  { id:7, name:"I – III – IV – iv",     style:"Romanesque / Film",emotion:"Le borrowed chord crée une couleur doux-amère unique. Très utilisé dans les bandes originales pour des moments de transition émotionnelle.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"E",t:"Majeures",fn:"III"},{r:"F",t:"Majeures",fn:"IV"},{r:"F",t:"Mineures",fn:"iv"}], scales:["Do majeur","Fa mineur"], color:"#E8A87C" },
  { id:8, name:"vi – IV – I – V",       style:"Pop contemporaine",emotion:"Introspective et mélancolique, elle commence dans l'ombre (vi) pour aboutir à la résolution (V). Omniprésente dans la pop des années 2000.",
    chords:[{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"},{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"}], scales:["Do majeur","Mode éolien"], color:"#82E0AA" },
  { id:9, name:"I – V – vi – iii – IV", style:"Pop baroque",      emotion:"Dérivée du Canon de Pachelbel, elle crée un sentiment de continuité et de plénitude émotionnelle. La descente de basse canonique est immédiatement reconnaissable.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"vi"},{r:"E",t:"Mineures",fn:"iii"},{r:"F",t:"Majeures",fn:"IV"}], scales:["Do majeur","Ionien"], color:"#85C1E9" },
  { id:10,name:"i – VI – III – VII",    style:"Épique / Metal",   emotion:"L'enchaînement de puissance. Évoque l'épique et la détermination. Pilier du metal, de la musique de jeux vidéo et des bandes originales cinématographiques.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"F",t:"Majeures",fn:"VI"},{r:"C",t:"Majeures",fn:"III"},{r:"G",t:"Majeures",fn:"VII"}], scales:["Mode éolien","Pentatonique mineure"], color:"#F1948A" },
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
        style={{width:'100%',padding:'.75rem',background:playing?'rgba(241,148,138,0.15)':'rgba(130,224,170,0.15)',border:`1px solid ${playing?'#F1948A':'#82E0AA'}`,color:playing?'#F1948A':'#82E0AA',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
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
              fill={isCur?'#0D0B1E':isDone?color:'rgba(255,255,255,0.5)'}
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
    { id:'ii-V-I', label:'ii – V – I', desc:'Standard jazz', color:'#F7DC6F',
      build:(key)=>{ const s=KEY_SEMI[key]||0; return [
        {r:transposeChord('D',s-2+12), t:'Min. 7', fn:'ii7'},
        {r:transposeChord('G',s+5),    t:'Dom. 7', fn:'V7'},
        {r:transposeChord('C',s),      t:'Maj. 7', fn:'Imaj7'},
      ];}},
    { id:'I-IV-V', label:'I – IV – V', desc:'Blues / Pop', color:'#82E0AA',
      build:(key)=>{ const s=KEY_SEMI[key]||0; return [
        {r:transposeChord('C',s),   t:'Majeures', fn:'I'},
        {r:transposeChord('F',s+5), t:'Majeures', fn:'IV'},
        {r:transposeChord('G',s+7), t:'Majeures', fn:'V'},
      ];}},
    { id:'I-V-vi-IV', label:'I – V – vi – IV', desc:'Pop universelle', color:'#85C1E9',
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
        <CircleOfFifthsSVG doneKeys={['C','G','D']} currentKey="A" color="#F7DC6F"/>
        <p style={{fontSize:10,opacity:.4,fontFamily:'monospace',marginTop:'.5rem'}}>Exemple : 3 tonalités complétées, "La" en cours</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:'1.5rem'}}>
        {[
          {num:'①',title:"Qu'est-ce que le cycle des quintes ?",color:'#F7DC6F',text:"Un cercle reliant les 12 tonalités. Chaque étape monte d'une quinte (7 demi-tons). C'est l'outil fondamental pour naviguer entre tonalités en jazz et en classique."},
          {num:'②',title:"Comment fonctionne l'exercice ?",color:'#85C1E9',text:"L'app joue une progression dans une tonalité. Tu dois identifier chaque accord : d'abord la note racine, puis le type. Tu fais le tour des 12 tonalités une par une."},
          {num:'③',title:"Astuce pour réussir",color:'#82E0AA',text:"Écoute avant de répondre — le bouton RÉÉCOUTER est là pour ça. Commence par la progression I-IV-V, la plus simple."},
          {num:'④',title:"Pourquoi c'est essentiel ?",color:'#C39BD3',text:"Maîtriser ses progressions dans toutes les tonalités permet de jouer avec n'importe qui. C'est l'exercice quotidien des musiciens de jazz professionnels."},
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
      <button onClick={()=>setScreen('config')} style={{width:'100%',padding:'1rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #F7DC6F',color:'#F7DC6F',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
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
        <CircleOfFifthsSVG doneKeys={[]} currentKey="C" color="#F7DC6F"/>
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
      <button onClick={startExercise} style={{width:'100%',padding:'1rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #F7DC6F',color:'#F7DC6F',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
        COMMENCER LE TOUR →
      </button>
    </div>
  );

  // ── Results ─────────────────────────────────────────────────────────────────
  if (screen==='results') {
    const pct = Math.round(((CIRCLE_KEYS.length-errors)/CIRCLE_KEYS.length)*100);
    const mc  = pct>=90?'#82E0AA':pct>=70?'#85C1E9':'#F7DC6F';
    return (
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(247,220,111,0.05)',border:'1px solid rgba(247,220,111,0.2)',borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>TOUR DU CYCLE TERMINÉ !</div>
          <CircleOfFifthsSVG doneKeys={CIRCLE_KEYS} currentKey={null} color="#82E0AA"/>
          <div style={{fontSize:22,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',marginTop:'1rem'}}>{pct}% de réussite</div>
          <div style={{fontSize:13,opacity:.5,fontFamily:'monospace',marginTop:4}}>{errors} erreur{errors!==1?'s':''} sur 12 tonalités</div>
        </div>
        <button onClick={()=>{setScreen('config');setDoneKeys([]);setErrors(0);setKeyIdx(0);}}
          style={{padding:'.9rem',background:'rgba(247,220,111,0.15)',border:'1.5px solid #F7DC6F',color:'#F7DC6F',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
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
            <span style={{fontSize:10,fontFamily:'monospace',color:'#F7DC6F'}}>{errors} erreur{errors!==1?'s':''}</span>
          </div>
          <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2}}>
            <div style={{height:'100%',width:`${(keyIdx/12)*100}%`,background:'#F7DC6F',borderRadius:2,transition:'width 0.4s ease'}}/>
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
          <div style={{fontSize:52,fontWeight:'bold',color:'#F7DC6F',fontFamily:'Georgia,serif',lineHeight:1,marginBottom:6}}>
            {CIRCLE_LABELS[currentKey]||currentKey}
          </div>
          <div style={{fontSize:12,opacity:.45,fontFamily:'monospace',marginBottom:'1rem'}}>{progType.label} en {currentKey}</div>
          <button onClick={()=>playProgressionInKey(currentKey)}
            style={{background:'rgba(247,220,111,0.1)',border:'1px solid rgba(247,220,111,0.3)',color:'#F7DC6F',padding:'.4rem 1rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>
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
                {answered && <span style={{fontSize:12,color:isCorrect?'#82E0AA':'#F1948A'}}>{isCorrect?'✓':` ✗ → ${tc.r}${CHORD_TYPES[tc.t]?.suffix}`}</span>}
              </div>
              {!answered && (
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4}}>
                    {ROOT_NOTES.map(root=>{
                      const nc=NOTE_COLORS[root]||'#C39BD3', sel=uc?.root===root;
                      return <button key={root} onClick={()=>handleUserChord(ci,root,uc?.type)}
                        style={{background:sel?`${nc}`:`${nc}`,border:`1px solid ${sel?nc:nc+'40'}`,color:nc,padding:'.4rem .1rem',borderRadius:6,cursor:'pointer',fontSize:11,fontFamily:'monospace',fontWeight:sel?'bold':'normal',transition:'all 0.15s'}}>{root}</button>;
                    })}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
                    {Object.entries(CHORD_TYPES).map(([t,{label}])=>{
                      const tc2=CHORD_COLORS[t]||'#C39BD3', sel=uc?.type===t;
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
            style={{width:'100%',padding:'.9rem',background:allFilled?'rgba(247,220,111,0.15)':'rgba(255,255,255,0.03)',border:`1.5px solid ${allFilled?'#F7DC6F':'rgba(255,255,255,0.1)'}`,color:allFilled?'#F7DC6F':'rgba(255,255,255,0.25)',borderRadius:10,cursor:allFilled?'pointer':'not-allowed',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
            VALIDER →
          </button>
        ) : (
          <button onClick={nextKey}
            style={{width:'100%',padding:'.9rem',background:'rgba(130,224,170,0.12)',border:'1.5px solid #82E0AA',color:'#82E0AA',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
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
                  <span key={ci} style={{fontSize:9,fontFamily:'monospace',color:NOTE_COLORS[c.n]||'#C39BD3',padding:'1px 5px',background:`${NOTE_COLORS[c.n]||'#C39BD3'}`,borderRadius:4}}>
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
              const nc=NOTE_COLORS[k]||'#85C1E9', sel=targetKey===k;
              return <button key={k} onClick={()=>setTargetKey(k)}
                style={{background:sel?`${nc}`:`${nc}`,border:`1px solid ${sel?nc:nc+'40'}`,color:nc,padding:'.6rem .25rem',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 10px ${nc}`:'none'}}>
                {k}
              </button>;
            })}
          </div>
        </div>
      )}
      <button onClick={startExercise} disabled={!song||!targetKey}
        style={{width:'100%',padding:'1rem',background:song&&targetKey?'rgba(133,193,233,0.15)':'rgba(255,255,255,0.03)',border:`1.5px solid ${song&&targetKey?'#85C1E9':'rgba(255,255,255,0.1)'}`,color:song&&targetKey?'#85C1E9':'rgba(255,255,255,0.25)',borderRadius:12,cursor:song&&targetKey?'pointer':'not-allowed',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
        COMMENCER →
      </button>
    </div>
  );

  if (screen==='results') {
    const pct=Math.round((score.correct/score.total)*100);
    const mc=pct>=90?'#82E0AA':pct>=70?'#85C1E9':pct>=50?'#F7DC6F':'#F1948A';
    return (
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(133,193,233,0.06)',border:'1px solid rgba(133,193,233,0.2)',borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS — TRANSPOSITION</div>
          <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/{score.total}</span></div>
          <div style={{fontSize:20,color:mc,marginBottom:'.5rem'}}>{pct}%</div>
          <div style={{fontSize:12,opacity:.5,fontFamily:'monospace'}}>{song?.title} → {targetKey}</div>
        </div>
        <button onClick={()=>{setScreen('config');setSong(null);setTargetKey(null);}}
          style={{padding:'.9rem',background:'rgba(133,193,233,0.15)',border:'1.5px solid #85C1E9',color:'#85C1E9',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
          ↩ NOUVELLE TRANSPOSITION
        </button>
      </div>
    );
  }

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'.75rem 1.25rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:11,fontFamily:'Georgia,serif',opacity:.7}}>{song?.title}</span>
        <span style={{fontSize:11,fontFamily:'monospace',color:'#85C1E9'}}>→ {targetKey}</span>
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
                  <span style={{fontSize:13,fontFamily:'monospace',color:isAnswered?(isCorrect?'#82E0AA':'#F1948A'):'rgba(255,255,255,0.3)',fontWeight:isAnswered?'bold':'normal'}}>
                    {isAnswered?`${tc.r}${CHORD_TYPES[tc.t]?.suffix}`:'?'}
                    {!isAnswered&&<span style={{fontSize:9,opacity:.4}}> ({CHORD_TYPES[tc.t]?.label})</span>}
                  </span>
                </div>
                {isAnswered && <span style={{fontSize:14,color:isCorrect?'#82E0AA':'#F1948A'}}>{isCorrect?'✓':'✗'}</span>}
              </div>
              {!isAnswered && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4}}>
                  {ROOT_NOTES.map(root=>{
                    const nc=NOTE_COLORS[root]||'#C39BD3';
                    return <button key={root} onClick={()=>handleAnswer(ci,root)}
                      style={{background:`${nc}10`,border:`1px solid ${nc}`,color:nc,padding:'.45rem .1rem',borderRadius:6,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background=`${nc}`;e.currentTarget.style.transform='scale(1.04)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background=`${nc}`;e.currentTarget.style.transform='scale(1)';}}>
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
    activeTransition.fromNotes.forEach(n => { const k = n % 24; pianoColors[k] = '#85C1E9'; }); // blue = departing
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
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: NOTE_COLORS[t.from.r] || '#85C1E9' }}>{t.from.r}{CHORD_TYPES[t.from.t]?.suffix}</span>
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
                <span style={{ color: '#85C1E9' }}>■</span> Note de départ &nbsp;
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

  const fnColors = {I:'#85C1E9',IV:'#82E0AA',V:'#F7DC6F',vi:'#C39BD3',ii:'#F1948A',iii:'#AED6F1',VII:'#E8A87C'};
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
              <div style={{fontSize:10,color:'#82E0AA',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>GAMMES COMPATIBLES POUR L'IMPRO</div>
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
            <div style={{fontSize:11,color:'#82E0AA',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.3rem'}}>10 PROGRESSIONS ESSENTIELLES</div>
            <p style={{fontSize:12,opacity:.5,margin:0,lineHeight:1.5,fontFamily:'Georgia,serif'}}>Clique sur une progression pour voir l'analyse émotionnelle, jouer les accords et découvrir les gammes compatibles.</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {IMPRO_PROGRESSIONS.map(prog=>(
              <button key={prog.id} onClick={()=>{setSelected(prog);setActiveChord(null);}}
                style={{background:'rgba(240,235,224,0.025)',border:`0.5px solid rgba(240,235,224,0.1)`,borderRadius:4,padding:'1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${prog.color}`;e.currentTarget.style.borderColor=`${prog.color}`;}}
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
          <button key={id} onClick={()=>setViewMode(id)} style={{flex:1,padding:'.6rem',background:'none',border:'none',color:viewMode===id?'#C39BD3':'rgba(240,235,224,0.35)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.08em',borderBottom:viewMode===id?'1.5px solid #C39BD3':'1.5px solid transparent',transition:'all 0.2s'}}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {viewMode==='info' && (
        <div style={{flex:1,overflowY:'auto',padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div style={{display:'flex',gap:3,marginBottom:'.25rem'}}>
            {[1,2,3,4,5].map(s=>(<div key={s} style={{width:10,height:10,borderRadius:'50%',background:s<=work.diff?'#C39BD3':'rgba(240,235,224,0.12)'}}/>))}
            <span style={{fontSize:10,opacity:.4,fontFamily:'monospace',marginLeft:8}}>Difficulté {work.diff}/5</span>
          </div>
          <div style={{padding:'1rem',background:'rgba(195,155,211,0.05)',border:'0.5px solid rgba(195,155,211,0.15)',borderRadius:4}}>
            <div style={{fontSize:10,color:'#C39BD3',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>À PROPOS</div>
            <p style={{fontSize:13,opacity:.65,lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>
              Cette partition est dans le domaine public. Elle est disponible gratuitement sur IMSLP (International Music Score Library Project), la plus grande bibliothèque de partitions au monde.
            </p>
          </div>
          {/* Buttons */}
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:'.5rem'}}>
            <button onClick={()=>setViewMode('viewer')}
              style={{padding:'.9rem',background:'rgba(195,155,211,0.15)',border:'1px solid #C39BD3',color:'#C39BD3',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>
              📖 VOIR LA PARTITION
            </button>
            <a href={imslpUrl} target="_blank" rel="noopener noreferrer"
              style={{padding:'.9rem',background:'transparent',border:'0.5px solid rgba(240,235,224,0.2)',color:'rgba(240,235,224,0.6)',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',textDecoration:'none',textAlign:'center',display:'block'}}>
              ↗ OUVRIR SUR IMSLP
            </a>
          </div>
          <div style={{padding:'.75rem',background:'rgba(133,193,233,0.05)',border:'0.5px solid rgba(133,193,233,0.15)',borderRadius:4}}>
            <div style={{fontSize:10,color:'#85C1E9',fontFamily:'monospace',letterSpacing:'.08em',marginBottom:'.35rem'}}>COMMENT ENREGISTRER SUR ANDROID</div>
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
              style={{fontSize:10,color:'#C39BD3',fontFamily:'monospace',letterSpacing:'.08em',textDecoration:'none'}}>OUVRIR EN PLEIN ÉCRAN ↗</a>
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
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'.6rem',background:'none',border:'none',color:tab===id?'#C39BD3':'rgba(240,235,224,0.35)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.08em',borderBottom:tab===id?'1.5px solid #C39BD3':'1.5px solid transparent',transition:'all 0.2s'}}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1rem'}}>
        <div style={{marginBottom:'1rem',padding:'.75rem',background:'rgba(195,155,211,0.05)',border:'0.5px solid rgba(195,155,211,0.15)',borderRadius:4}}>
          <div style={{fontSize:11,color:'#C39BD3',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.35rem'}}>FRÉDÉRIC CHOPIN — DOMAINE PUBLIC</div>
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
                  <span style={{fontSize:10,color:'#C39BD3',fontFamily:'monospace',opacity:.7}}>Op.{w.op}{w.no?` n°${w.no}`:''}</span>
                  <span style={{fontSize:14,fontWeight:'bold',color:'#f0ebe0',fontFamily:'Georgia,serif'}}>{w.key}</span>
                  {w.nick&&<span style={{fontSize:11,color:'rgba(240,235,224,0.45)',fontStyle:'italic'}}>"{w.nick}"</span>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(s=>(<div key={s} style={{width:6,height:6,borderRadius:'50%',background:s<=w.diff?'#C39BD3':'rgba(240,235,224,0.15)'}}/>))}</div>
                  <span style={{fontSize:11,color:'#C39BD3',opacity:.6}}>›</span>
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
          <button key={c} onClick={()=>setFilter(c)} style={{padding:'.3rem .8rem',background:filter===c?'rgba(195,155,211,0.15)':'transparent',border:`0.5px solid ${filter===c?'#C39BD3':'rgba(240,235,224,0.15)'}`,color:filter===c?'#C39BD3':'rgba(240,235,224,0.45)',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.2s'}}>
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
                const noteColor = NOTE_COLORS[chord.n] || '#C39BD3';
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
    {id:'accords',    label:'Accords',    color:'#C39BD3'},
    {id:'partitions', label:'Partitions', color:'#85C1E9'},
    {id:'grilles',    label:'Grilles',    color:'#82E0AA'},
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
  { id:'cle-sol',    cat:'Clés',   name:'Clé de Sol',     symbol:'𝄞', color:'#8B5CF6',
    desc:"Fixe la note Sol sur la 2e ligne. Clé la plus utilisée : piano (MD), violon, flûte.",
    detail:"Chaque ligne et espace correspond à une note. La clé de Sol indique que la 2e ligne (en bas) est un Sol." },
  { id:'cle-fa',     cat:'Clés',   name:'Clé de Fa',      symbol:'𝄢', color:'#8B5CF6',
    desc:"Fixe la note Fa sur la 4e ligne. Instruments graves : piano (MG), violoncelle, contrebasse.",
    detail:"La clé de Fa place le Fa sur la 4e ligne. Les notes y sont plus graves qu'avec la clé de Sol." },
  { id:'cle-ut',     cat:'Clés',   name:"Clé d'Ut (Do)",  symbol:'𝄡', color:'#8B5CF6',
    desc:"Fixe le Do central. Variable selon la ligne. Utilisée par l'alto, le ténor.",
    detail:"Moins courante, on la retrouve surtout pour l'alto. Elle évite les lignes supplémentaires." },
  // SILENCES
  { id:'sil-ronde',  cat:'Silences', name:'Silence de ronde',   symbol:'𝄻', color:'#06B6D4',
    desc:"4 temps de silence. Rectangle plein suspendu sous la 4e ligne. Retiens : il pend.",
    detail:'Moyen mnémotechnique : il est "lourd", donc il tombe et se suspend sous la ligne.' },
  { id:'sil-blanche',cat:'Silences', name:'Silence de blanche',  symbol:'𝄼', color:'#06B6D4',
    desc:"2 temps de silence. Rectangle plein posé sur la 3e ligne. Retiens : il repose.",
    detail:'Moyen mnémotechnique : il est "léger", donc il flotte et se pose sur la ligne.' },
  { id:'sil-noire',  cat:'Silences', name:'Silence de noire',    symbol:'𝄽', color:'#06B6D4',
    desc:'1 temps de silence. Ressemble à un "z" stylisé.',
    detail:"1 temps — même durée que la noire. Très fréquent dans tous les styles musicaux." },
  { id:'sil-croche', cat:'Silences', name:'Silence de croche',   symbol:'𝄾', color:'#06B6D4',
    desc:'1/2 temps de silence. Ressemble à une virgule stylisée.',
    detail:"La moitié d'un temps. 2 silences de croche = 1 silence de noire." },
  // VALEURS
  { id:'ronde',      cat:'Valeurs', name:'Ronde',          symbol:'○', color:'#10B981',
    desc:"4 temps. Tête vide sans hampe. La note la plus longue en usage courant.",
    detail:"En 4/4 : la ronde dure toute la mesure. 1 ronde = 2 blanches = 4 noires = 8 croches." },
  { id:'blanche',    cat:'Valeurs', name:'Blanche',         symbol:'d', color:'#10B981',
    desc:"2 temps. Tête vide avec hampe verticale. Très utilisée dans les hymnes et ballades.",
    detail:"En 4/4 : la blanche dure la moitié de la mesure. 1 blanche = 2 noires = 4 croches." },
  { id:'noire',      cat:'Valeurs', name:'Noire',           symbol:'♩', color:'#10B981',
    desc:"1 temps. Tête pleine avec hampe. La valeur de référence du rythme (BPM).",
    detail:"Le tempo en BPM compte les noires par minute. 90 BPM = 90 noires/minute." },
  { id:'croche',     cat:'Valeurs', name:'Croche',          symbol:'♪', color:'#10B981',
    desc:"1/2 temps. Noire avec un crochet sur la hampe. Souvent regroupée par paires.",
    detail:"2 croches = 1 noire. Reliées par une barre quand groupées. Base du swing en jazz." },
  { id:'dcr',        cat:'Valeurs', name:'Double-croche',   symbol:'𝅘𝅥𝅯', color:'#10B981',
    desc:"1/4 temps. 2 crochets sur la hampe. Passages rapides et ornements.",
    detail:"4 doubles-croches = 1 noire. Très présentes dans les concertos et l'ornementation baroque." },
  // CHIFFRAGE
  { id:'c44',        cat:'Chiffrage', name:'4/4 — Commun',  symbol:'𝄴', color:'#F59E0B',
    desc:"4 temps par mesure, noire = 1 temps. Le plus fréquent : pop, jazz, classique.",
    detail:"Chiffre du haut = nb de temps. Chiffre du bas = valeur d'1 temps (4 = noire, 8 = croche)." },
  { id:'c34',        cat:'Chiffrage', name:'3/4 — Valse',   symbol:'3/4', color:'#F59E0B',
    desc:"3 temps par mesure. Rythme de la valse. Un-deux-trois, un-deux-trois.",
    detail:"Valse, menuet, scherzo : tous en 3/4. L'accent fort tombe sur le premier temps." },
  { id:'c68',        cat:'Chiffrage', name:'6/8',           symbol:'6/8', color:'#F59E0B',
    desc:"6 croches par mesure, ressenties en 2 temps à 3 croches chacun. Gigue, barcarolle.",
    detail:'6/8 ≠ 3/4. En 6/8 on ressent 2 grands temps balancés. C\'est le rythme "boiteux" du jazz.' },
  // ALTÉRATIONS
  { id:'diese',      cat:'Altérations', name:'Dièse',       symbol:'♯', color:'#EF4444',
    desc:"Monte la note d'1 demi-ton. Do♯ est entre Do et Ré.",
    detail:"S'applique à toutes les notes identiques de la mesure sauf indication contraire." },
  { id:'bemol',      cat:'Altérations', name:'Bémol',       symbol:'♭', color:'#EF4444',
    desc:"Descend la note d'1 demi-ton. Si♭ est entre La et Si.",
    detail:"Essentiel pour les gammes mineures. Les armures (clé) utilisent dièses ou bémols." },
  { id:'becarre',    cat:'Altérations', name:'Bécarre',     symbol:'♮', color:'#EF4444',
    desc:"Annule un dièse ou bémol précédent. Ramène à la hauteur naturelle.",
    detail:"Si une note a été altérée dans la mesure ou l'armure, le bécarre l'annule localement." },
  // NUANCES
  { id:'p-doux',     cat:'Nuances', name:'Piano (p)',       symbol:'p', color:'#A78BFA',
    desc:"Jouer doucement. Échelle : ppp → pp → p → mp → mf → f → ff → fff.",
    detail:"Les nuances viennent de l'italien. \"Piano\" = doux. C'est aussi pourquoi l'instrument s'appelle piano-forte." },
  { id:'f-fort',     cat:'Nuances', name:'Forte (f)',       symbol:'f', color:'#A78BFA',
    desc:"Jouer fort. mf = mezzoforte (moyennement fort). ff = fortissimo (très fort).",
    detail:'"Forte" = fort en italien. Les nuances sont relatives : f après pp semble encore plus percutant.' },
  { id:'cresc',      cat:'Nuances', name:'Crescendo',       symbol:'<', color:'#A78BFA',
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
          {id:'ref',icon:'📚',label:'Référentiel', sub:'Tous les symboles classés',color:'#85C1E9'},
          {id:'ex', icon:'🎯',label:'Exercice',    sub:'Identifier les symboles', color:'#82E0AA'},
        ].map(b=>(
          <button key={b.id} onClick={()=>b.id==='ref'?setScreen('reference'):startExercice()}
            style={{background:`${b.color}08`,border:`1.5px solid ${b.color}40`,borderRadius:14,padding:'1.25rem',cursor:'pointer',textAlign:'center',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${b.color}`;e.currentTarget.style.borderColor=b.color;e.currentTarget.style.transform='translateY(-3px) scale(1.02)';e.currentTarget.style.boxShadow=`0 8px 20px ${b.color}`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${b.color}`;e.currentTarget.style.borderColor=`${b.color}`;e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='none';}}>
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
    const pct=Math.round((score.correct/score.total)*100),mc=pct>=85?'#82E0AA':pct>=60?'#F7DC6F':'#F1948A';
    return(<div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
      <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}35`,borderRadius:14}}>
        <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS</div>
        <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/{score.total}</span></div>
        <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
        <div style={{fontSize:13,opacity:.5,fontFamily:'Georgia,serif',marginTop:8}}>{pct>=85?'Tu maîtrises les symboles musicaux ! 🎉':pct>=60?'Bonne progression !':'Consulte le référentiel et réessaie !'}</div>
      </div>
      <button onClick={startExercice} style={{padding:'.9rem',background:'rgba(130,224,170,0.15)',border:'1.5px solid #82E0AA',color:'#82E0AA',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>🔄 NOUVEL EXERCICE</button>
      <button onClick={()=>setScreen('reference')} style={{padding:'.9rem',background:'rgba(133,193,233,0.1)',border:'1px solid rgba(133,193,233,0.3)',color:'#85C1E9',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>📚 RÉFÉRENTIEL</button>
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
          <div style={{height:'100%',width:`${progress}%`,background:'#82E0AA',borderRadius:2,transition:'width 0.3s ease'}}/>
        </div>
        <span style={{fontSize:10,fontFamily:'monospace',color:'#82E0AA'}}>{score.correct} ✓</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Symbol to identify */}
        <div style={{textAlign:'center',padding:'1.75rem 1rem',background:`${ex.color}08`,border:`1.5px solid ${ex.color}40`,borderRadius:16,animation:'fadeIn 0.3s ease'}}>
          <div style={{fontSize:10,letterSpacing:'.15em',opacity:.4,fontFamily:'monospace',marginBottom:'1rem'}}>QUEL EST CE SYMBOLE ?</div>
          <div style={{fontSize:76,lineHeight:1.1,marginBottom:'1.25rem',filter:`drop-shadow(0 4px 14px ${ex.color}55)`}}>{ex.symbol}</div>
          {answered&&(<div style={{animation:'fadeIn 0.25s ease'}}>
            <div style={{fontSize:15,fontWeight:'bold',color:isRight?'#82E0AA':'#F1948A',fontFamily:'Georgia,serif',marginBottom:6}}>{isRight?`✓ ${ex.name} !`:`✗ C'était : ${ex.name}`}</div>
            <p style={{fontSize:12,opacity:.65,lineHeight:1.55,margin:'0 auto',maxWidth:280,fontFamily:'Georgia,serif'}}>{ex.desc}</p>
          </div>)}
        </div>
        {/* 4 answer options */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {options.map(opt=>{
            const isC=opt.id===ex.id,isU=userAns===opt.id;
            let bg='rgba(255,255,255,0.04)',border='rgba(255,255,255,0.12)',col='rgba(255,255,255,0.78)';
            if(answered){if(isC){bg=`${opt.color}`;border=opt.color;col=opt.color;}else if(isU){bg='rgba(241,148,138,0.1)';border='#F1948A';col='#F1948A';}else{col='rgba(255,255,255,0.22)';}}
            return(<button key={opt.id} onClick={()=>handleExAnswer(opt.id)} disabled={answered}
              style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.85rem .5rem',borderRadius:12,cursor:answered?'default':'pointer',fontSize:11.5,fontFamily:'Georgia,serif',fontWeight:'bold',textAlign:'center',transition:'all 0.2s',lineHeight:1.4}}
              onMouseEnter={e=>{if(!answered){e.currentTarget.style.background=`${opt.color}`;e.currentTarget.style.borderColor=`${opt.color}`;}}}
              onMouseLeave={e=>{if(!answered){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}}
            ><div style={{fontSize:22,marginBottom:4}}>{opt.symbol}</div>{opt.name}</button>);
          })}
        </div>
        {answered&&(<button onClick={nextEx} style={{width:'100%',padding:'.9rem',background:isRight?'rgba(130,224,170,0.12)':'rgba(241,148,138,0.08)',border:`1.5px solid ${isRight?'#82E0AA':'#F1948A'}`,color:isRight?'#82E0AA':'#F1948A',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
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
  const SOL_COLORS= {C4:'#E8A87C',D4:'#85C1E9',E4:'#82E0AA',F4:'#F1948A',G4:'#C39BD3',A4:'#F7DC6F',B4:'#AED6F1',
                     C5:'#E8A87C',D5:'#85C1E9',E5:'#82E0AA',F5:'#F1948A',G5:'#C39BD3'};
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
            ? (feedback==='correct'?'#82E0AA':feedback==='wrong'?'#F1948A':col)
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
  const SOL_COLORS= {Do:'#E8A87C',Ré:'#85C1E9',Mi:'#82E0AA',Fa:'#F1948A',Sol:'#C39BD3',La:'#F7DC6F',Si:'#AED6F1'};

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
          const color = m.fixed?'#85C1E9':'#82E0AA';
          return(
          <button key={m.id} onClick={()=>pickMelody(m)}
            style={{background:`${color}08`,border:`1px solid ${color}30`,borderRadius:12,padding:'1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${color}`;e.currentTarget.style.borderColor=color;e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${color}`;e.currentTarget.style.borderColor=`${color}`;e.currentTarget.style.transform='translateY(0)';}}>
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
          INTERVALLE MAX : <span style={{color:'#82E0AA',fontWeight:'bold'}}>{interval} demi-tons ({['','','Seconde','Tierce mineure','Tierce majeure','Quarte','Triton','Quinte'][interval]||interval+' demi-tons'})</span>
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
              style={{padding:'.55rem .9rem',background:interval===v?'rgba(130,224,170,0.2)':'rgba(255,255,255,0.04)',border:`1.5px solid ${interval===v?'#82E0AA':'rgba(255,255,255,0.12)'}`,borderRadius:10,cursor:'pointer',color:interval===v?'#82E0AA':'rgba(255,255,255,0.5)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={startWithInterval}
        style={{width:'100%',padding:'1rem',background:'rgba(130,224,170,0.15)',border:'1.5px solid #82E0AA',color:'#82E0AA',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
        GÉNÉRER LA MÉLODIE →
      </button>
    </div>
  );

  // ── Done screen ─────────────────────────────────────────────────────────────
  if (screen==='done') {
    const pct=score.total>0?Math.round((score.correct/score.total)*100):0;
    const mc=pct>=90?'#82E0AA':pct>=70?'#85C1E9':pct>=50?'#F7DC6F':'#F1948A';
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
            style={{padding:'.9rem',background:'rgba(130,224,170,0.15)',border:'1.5px solid #82E0AA',color:'#82E0AA',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
            🎲 NOUVELLE MÉLODIE ALÉATOIRE
          </button>
        )}
        <button onClick={()=>{setNoteIdx(0);setFeedback(null);setScore({correct:0,total:0});setScreen('play');}}
          style={{padding:'.9rem',background:'rgba(133,193,233,0.12)',border:'1.5px solid #85C1E9',color:'#85C1E9',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
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
            <span style={{fontSize:9,fontFamily:'monospace',color:'#82E0AA'}}>{score.correct}/{score.total} ✓</span>
          </div>
          <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2}}>
            <div style={{height:'100%',width:`${progressPct}%`,background:'#85C1E9',borderRadius:2,transition:'width 0.3s ease'}}/>
          </div>
        </div>
        {!selMelody?.fixed && (
          <button onClick={()=>{regenMelody();}} title="Nouvelle mélodie"
            style={{background:'rgba(130,224,170,0.1)',border:'1px solid rgba(130,224,170,0.3)',color:'#82E0AA',padding:'3px 8px',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>
            🎲
          </button>
        )}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Staff */}
        <div style={{padding:'.75rem',background:'#faf9f4',borderRadius:12,border:'0.5px solid rgba(255,255,255,0.15)'}}>
          <MusicStaff notes={notes} currentIdx={noteIdx} feedback={feedback}/>
        </div>

        {/* Feedback */}
        <div style={{textAlign:'center',padding:'.75rem',background:feedback==='correct'?'rgba(130,224,170,0.1)':feedback==='wrong'?'rgba(241,148,138,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${feedback==='correct'?'rgba(130,224,170,0.35)':feedback==='wrong'?'rgba(241,148,138,0.35)':'rgba(255,255,255,0.08)'}`,borderRadius:10,transition:'all 0.2s',minHeight:44,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {feedback==='correct'&&<span style={{color:'#82E0AA',fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif'}}>✓ {correctSolfege} !</span>}
          {feedback==='wrong'  &&<span style={{color:'#F1948A',fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif'}}>✗ C'était {correctSolfege}</span>}
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
  { id:'ind-1', cat:'Indépendance', title:"Gamme + tenue", difficulty:1, color:'#8B5CF6',
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
  { id:'ind-2', cat:'Indépendance', title:"Rythmes croisés 2 contre 3", difficulty:3, color:'#8B5CF6',
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
  { id:'ind-3', cat:'Indépendance', title:"Mélodie et accompagnement simultanés", difficulty:2, color:'#8B5CF6',
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
  { id:'arp-1', cat:'Arpèges', title:"Arpège Do majeur - Position de base", difficulty:1, color:'#06B6D4',
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
  { id:'arp-2', cat:'Arpèges', title:"Arpège brisé - Pattern 1-5-3-5", difficulty:2, color:'#06B6D4',
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
  { id:'arp-3', cat:'Arpèges', title:"Arpège à 2 octaves - Toutes gammes", difficulty:3, color:'#06B6D4',
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
  { id:'vit-1', cat:'Vitesse', title:"Gammes en doubles-croches", difficulty:2, color:'#F59E0B',
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
  { id:'vit-2', cat:'Vitesse', title:"Chromatique rapide", difficulty:3, color:'#F59E0B',
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
  { id:'vit-3', cat:'Vitesse', title:"Trilles et ornements", difficulty:3, color:'#F59E0B',
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
  { id:'prec-1', cat:'Précision', title:"Staccato et legato alternatifs", difficulty:1, color:'#10B981',
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
  { id:'prec-2', cat:'Précision', title:"Octaves et accords", difficulty:2, color:'#10B981',
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
  { id:'prec-3', cat:'Précision', title:"Polyphonie à 2 voix", difficulty:3, color:'#10B981',
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
                  style={{padding:'.5rem .9rem',background:timerActive?'rgba(241,148,138,0.15)':'rgba(130,224,170,0.15)',border:`1.5px solid ${timerActive?'#F1948A':'#82E0AA'}`,color:timerActive?'#F1948A':'#82E0AA',borderRadius:9,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold'}}>
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
              <div style={{fontSize:10,color:'#F7DC6F',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.35rem'}}>CONSEIL DE PRATIQUE</div>
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
          <button onClick={()=>setFavOnly(v=>!v)} style={{padding:'3px 10px',background:showFavOnly?'rgba(247,220,111,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${showFavOnly?'#F7DC6F':'rgba(255,255,255,0.1)'}`,borderRadius:8,cursor:'pointer',color:showFavOnly?'#F7DC6F':'rgba(255,255,255,0.45)',fontSize:10,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0,marginLeft:'auto',transition:'all 0.2s'}}>
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
function ExercicesPage() {
  const [sub, setSub] = useState(null);

  const MODS = [
    {id:'flashcards',   icon:'🎯', title:"Dictée d'accords",      subtitle:'JOUER LES ACCORDS AU PIANO',    color:'#F1948A'},
    {id:'cycle',        icon:'🔄', title:'Cycle des quintes',     subtitle:'12 TONALITÉS',                  color:'#F7DC6F'},
    {id:'transposition',icon:'↔', title:'Transposition',         subtitle:'CHANGER DE TONALITÉ',            color:'#85C1E9'},
    {id:'impro',        icon:'✨', title:'Improvisation guidée',  subtitle:'GAMME · STYLE · PROGRESSION',   color:'#A78BFA'},
    {id:'biblio',       icon:'📋', title:'Bibliothèque technique',subtitle:'HANON · ARPÈGES · VÉLOCITÉ',    color:'#10B981'},
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
          {sub==='flashcards'   && <DicteeAccords/>}
          {sub==='cycle'        && <CycleQuintesExercice/>}
          {sub==='transposition'&& <TranspositionExercice/>}
          {sub==='impro'        && <ImprovisationGuidee/>}
          {sub==='biblio'       && <BiblioTechnique/>}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Technique</h2>
        <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>FONDATIONS MUSICALES ESSENTIELLES</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {MODS.map(m=>(
          <button key={m.id} onClick={()=>setSub(m.id)}
            style={{background:`${m.color}08`,border:`1px solid ${m.color}`,borderRadius:14,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}`;e.currentTarget.style.borderColor=`${m.color}`;e.currentTarget.style.transform='translateY(0)';}}>
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

// ── Dictée d'accords (auto-avance) ────────────────────────────────────────────
function DicteeAccords() {
  const [screen,    setScreen]    = useState('config');
  const [selected,  setSelected]  = useState(new Set(['Majeures','Mineures']));
  const [count,     setCount]     = useState(8);
  const [secPerCard,setSecPerCard]= useState(5);
  const [loopMode,  setLoopMode]  = useState(false);

  const [cards,     setCards]     = useState([]);
  const [idx,       setIdx]       = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [running,   setRunning]   = useState(false); // timer ticking
  const [paused,    setPaused]    = useState(false);
  const [pulse,     setPulse]     = useState(false); // metronome visual
  const [history,   setHistory]   = useState([]); // kept minimal for result screen
  const [completed, setCompleted] = useState(0);

  const timerRef    = useRef(null);
  const pulseRef    = useRef(null);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const types = Object.entries(CHORD_TYPES).map(([t,{label,suffix}])=>({id:t,name:label,suffix,color:CHORD_COLORS[t]||'#C39BD3'}));

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
                {on&&<span style={{fontSize:9,color:'#0D0B1E',fontWeight:'bold'}}>✓</span>}
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
            <button key={s} onClick={()=>setSecPerCard(s)} style={{flex:1,padding:'.6rem .25rem',background:secPerCard===s?'rgba(241,148,138,0.18)':'rgba(255,255,255,0.03)',border:`1.5px solid ${secPerCard===s?'#F1948A':'rgba(255,255,255,0.1)'}`,color:secPerCard===s?'#F1948A':'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontFamily:'monospace',fontSize:12,fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>
          ))}
        </div>
      </div>

      {/* Number of cards */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>NOMBRE D'ACCORDS</div>
        <div style={{display:'flex',gap:8}}>
          {[5,8,12,20].map(n=>(
            <button key={n} onClick={()=>setCount(n)} style={{flex:1,padding:'.6rem',background:count===n?'rgba(241,148,138,0.18)':'rgba(255,255,255,0.03)',border:`1.5px solid ${count===n?'#F1948A':'rgba(255,255,255,0.1)'}`,color:count===n?'#F1948A':'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>
          ))}
        </div>
      </div>

      {/* Loop mode */}
      <div style={{marginBottom:'1.5rem',padding:'.85rem',background:loopMode?'rgba(241,148,138,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${loopMode?'rgba(241,148,138,0.35)':'rgba(255,255,255,0.1)'}`,borderRadius:10,cursor:'pointer',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}} onClick={()=>setLoopMode(v=>!v)}>
        <div>
          <div style={{fontSize:13,fontWeight:'bold',color:loopMode?'#F1948A':'rgba(255,255,255,0.7)',fontFamily:'Georgia,serif'}}>🔁 Mode boucle</div>
          <div style={{fontSize:10,opacity:.5,fontFamily:'monospace',marginTop:2}}>La séquence recommence indéfiniment</div>
        </div>
        <div style={{width:36,height:20,borderRadius:10,background:loopMode?'#F1948A':'rgba(255,255,255,0.2)',position:'relative',transition:'all 0.25s'}}>
          <div style={{position:'absolute',top:2,left:loopMode?16:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.25s'}}/>
        </div>
      </div>

      <button onClick={start}
        style={{width:'100%',padding:'1rem',background:'rgba(241,148,138,0.15)',border:'1.5px solid #F1948A',color:'#F1948A',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
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
          <div style={{fontSize:56,fontWeight:'bold',color:'#82E0AA',fontFamily:'Georgia,serif',lineHeight:1,marginBottom:8}}>{completed}</div>
          <div style={{fontSize:13,opacity:.55,fontFamily:'monospace',marginBottom:8}}>accord{completed>1?'s':''} joué{completed>1?'s':''}</div>
          <div style={{fontSize:14,opacity:.6,fontFamily:'Georgia,serif'}}>Régularité + répétition = maîtrise 💪</div>
        </div>
        <button onClick={start} style={{padding:'.9rem',background:'rgba(241,148,138,0.15)',border:'1.5px solid #F1948A',color:'#F1948A',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>🔄 NOUVELLE SESSION</button>
        <button onClick={()=>setScreen('config')} style={{padding:'.9rem',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.5)',borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em'}}>⚙ RECONFIGURER</button>
      </div>
    );
  }

  // ── Play ─────────────────────────────────────────────────────────────────────
  const card = cards[idx];
  if (!card) return null;
  const nc  = NOTE_COLORS[card.root]||'#F1948A';
  const ri2 = CHROMATIC.indexOf(card.root);
  const pianoC = {};
  if(ri2!==-1) CHORD_TYPES[card.type].formula.forEach(f=>{ const k=(ri2+f)%12; pianoC[k]=nc; pianoC[k+12]=nc; });
  const timerPct = (timeLeft / secPerCard) * 100;
  const timerColor = timerPct > 50 ? '#82E0AA' : timerPct > 25 ? '#F7DC6F' : '#F1948A';

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

        {/* Controls */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <button onClick={togglePause}
            style={{padding:'.85rem .25rem',background:paused?'rgba(247,220,111,0.15)':'rgba(255,255,255,0.05)',border:`1.5px solid ${paused?'#F7DC6F':'rgba(255,255,255,0.15)'}`,color:paused?'#F7DC6F':'rgba(255,255,255,0.6)',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
            {paused?'▶ REPRENDRE':'⏸ PAUSE'}
          </button>
          <button onClick={advanceCard}
            style={{padding:'.85rem .25rem',background:'rgba(133,193,233,0.12)',border:'1.5px solid #85C1E9',color:'#85C1E9',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
            PASSER →
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
  const color=selRoot?(NOTE_COLORS[selRoot]||'#C39BD3'):'#C39BD3';
  const handleChordSelect=(root)=>{setSelRoot(root);setInv(0);setShowModal(false);notifyLibraryView();};

  if(showImpro) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.6)',flexShrink:0}}>
        <button onClick={()=>setShowImpro(false)} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:2}} onMouseEnter={e=>e.currentTarget.style.color='#f0ebe0'} onMouseLeave={e=>e.currentTarget.style.color='rgba(240,235,224,0.5)'}>← ACCORDS</button>
        <span style={{opacity:.2}}>|</span>
        <span style={{fontSize:11,fontFamily:'monospace',color:'#F7DC6F',letterSpacing:'.05em'}}>ENCHAÎNEMENTS</span>
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
        <button onClick={()=>{setModalStep('type');setShowModal(true);}} style={{background:'transparent',border:`1px solid ${cName?color:'rgba(240,235,224,0.2)'}`,color:cName?color:'#f0ebe0',padding:'.75rem 1.5rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}} onMouseEnter={e=>{e.currentTarget.style.background=`${color}`;e.currentTarget.style.transform='translateY(-1px)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.transform='translateY(0)';}}>
          {cName?"Changer d'accord":'Choisir un accord'}
        </button>
        {cName&&(<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?`${color}`:'transparent',border:`1px solid ${showPiano?color:'rgba(240,235,224,0.2)'}`,color:showPiano?color:'rgba(240,235,224,0.6)',padding:'.75rem 1.1rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}}>🎹 Clavier</button>)}
        <button onClick={()=>setShowImpro(true)} style={{background:'rgba(247,220,111,0.08)',border:'1px solid rgba(247,220,111,0.35)',color:'#F7DC6F',padding:'.75rem 1.1rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(247,220,111,0.18)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(247,220,111,0.08)'}>🎵 Enchaînements</button>
      </div>
      {showPiano&&cNotes&&(<div style={{marginBottom:'1.5rem',padding:'1.25rem 1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease forwards',overflowX:'auto'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'.75rem'}}>CLAVIER</div><PianoKeyboard activeAbsIndices={aIdx} color={color}/></div>)}
      {inversions&&(<div style={{animation:'fadeIn 0.4s ease 0.15s both'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>RENVERSEMENTS</div><div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>{inversions.map((iv,i)=>(<button key={`inv${i}`} onClick={()=>setInv(i)} style={{background:inv===i?`${color}`:'transparent',border:`0.5px solid ${inv===i?color:'rgba(240,235,224,0.15)'}`,color:inv===i?color:'rgba(240,235,224,0.45)',padding:'.5rem .85rem',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:10,transition:'all 0.2s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:3}} onMouseEnter={e=>{if(inv!==i)e.currentTarget.style.borderColor=`${color}`;}} onMouseLeave={e=>{if(inv!==i)e.currentTarget.style.borderColor='rgba(240,235,224,0.15)';}}>
        <span>{INVERSION_NAMES[i]}</span><span style={{opacity:.5,fontSize:9}}>{iv.join(' – ')}</span>
      </button>))}</div></div>)}
    </div>
    {showModal&&(<div onClick={e=>e.target===e.currentTarget&&setShowModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,backdropFilter:'blur(10px)'}}>
      <div style={{background:'#161512',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:4,width:'min(540px,92vw)',maxHeight:'85vh',overflow:'hidden',display:'flex',flexDirection:'column',animation:'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
        <div style={{padding:'1.25rem 1.5rem',borderBottom:'0.5px solid rgba(240,235,224,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>{modalStep==='root'&&<button onClick={()=>setModalStep('type')} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.4,cursor:'pointer',fontSize:18,padding:'0 6px 0 0'}}>←</button>}<span style={{fontSize:11,letterSpacing:'.2em',opacity:.4,fontFamily:'monospace'}}>{modalStep==='type'?"1 · TYPE D'ACCORD":`2 · NOTE RACINE — ${CHORD_TYPES[selType].label.toUpperCase()}`}</span></div>
          <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.35,cursor:'pointer',fontSize:20,lineHeight:1,padding:'2px 4px'}}>×</button>
        </div>
        {modalStep==='type'&&(<div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:8,overflowY:'auto'}}>{Object.entries(CHORD_TYPES).map(([type,{label}])=>{const ex=CHORD_TYPES[type].formula.map(i=>CHROMATIC[i]),isA=selType===type;return(<button key={type} onClick={()=>{setSelType(type);setSelRoot(null);setModalStep('root');}} style={{background:isA?'rgba(195,155,211,0.1)':'rgba(240,235,224,0.02)',border:`0.5px solid ${isA?'#C39BD3':'rgba(240,235,224,0.1)'}`,borderRadius:2,padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',transition:'all 0.2s ease',textAlign:'left'}} onMouseEnter={e=>{if(!isA)e.currentTarget.style.background='rgba(240,235,224,0.05)';}} onMouseLeave={e=>{if(!isA)e.currentTarget.style.background='rgba(240,235,224,0.02)';}}>
          <div><div style={{fontSize:16,color:isA?'#C39BD3':'#f0ebe0',fontFamily:'Georgia,serif',marginBottom:3}}>{label}</div><div style={{fontSize:11,opacity:.35,fontFamily:'monospace'}}>ex. C{CHORD_TYPES[type].suffix} → {ex.join(' – ')}</div></div>
          <span style={{color:isA?'#C39BD3':'rgba(240,235,224,0.2)',fontSize:18}}>›</span>
        </button>);})}
        </div>)}
        {modalStep==='root'&&(<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'1.25rem',overflowY:'auto'}}>{ROOT_NOTES.map(root=>{const c=NOTE_COLORS[root]||'#C39BD3',ri=CHROMATIC.indexOf(root),prev=CHORD_TYPES[selType].formula.map(i=>CHROMATIC[(ri+i)%12]),isA=selRoot===root;return(<button key={root} onClick={()=>handleChordSelect(root)} style={{background:isA?`${c}`:'rgba(240,235,224,0.03)',border:`0.5px solid ${isA?c:'rgba(240,235,224,0.1)'}`,color:isA?c:'rgba(240,235,224,0.8)',padding:'1rem .5rem',borderRadius:2,cursor:'pointer',transition:'all 0.2s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:6}} onMouseEnter={e=>{e.currentTarget.style.background=`${c}`;e.currentTarget.style.borderColor=`${c}`;e.currentTarget.style.color=c;}} onMouseLeave={e=>{if(!isA){e.currentTarget.style.background='rgba(240,235,224,0.03)';e.currentTarget.style.borderColor='rgba(240,235,224,0.1)';e.currentTarget.style.color='rgba(240,235,224,0.8)';}}}>
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
    {deg:'I',   semi:0,  type:'Majeures', fn:'Tonique',        color:'#8B5CF6'},
    {deg:'ii',  semi:2,  type:'Mineures', fn:'Sus-dominante',  color:'#06B6D4'},
    {deg:'iii', semi:4,  type:'Mineures', fn:'Médiante',       color:'#10B981'},
    {deg:'IV',  semi:5,  type:'Majeures', fn:'Sous-dominante', color:'#F59E0B'},
    {deg:'V',   semi:7,  type:'Majeures', fn:'Dominante',      color:'#EF4444'},
    {deg:'vi',  semi:9,  type:'Mineures', fn:'Sus-ton.',       color:'#F43F5E'},
    {deg:'vii°',semi:11, type:'Mineures', fn:'Sensible',       color:'#A78BFA'},
  ],
  mineur: [
    {deg:'i',    semi:0,  type:'Mineures', fn:'Tonique',        color:'#8B5CF6'},
    {deg:'ii°',  semi:2,  type:'Mineures', fn:'Sus-dom.',       color:'#06B6D4'},
    {deg:'♭III', semi:3,  type:'Majeures', fn:'Médiante',       color:'#10B981'},
    {deg:'iv',   semi:5,  type:'Mineures', fn:'Sous-dominante', color:'#F59E0B'},
    {deg:'V',    semi:7,  type:'Majeures', fn:'Dominante',      color:'#EF4444'},
    {deg:'♭VI',  semi:8,  type:'Majeures', fn:'Sus-ton.',       color:'#F43F5E'},
    {deg:'♭VII', semi:10, type:'Majeures', fn:'Sous-ton.',      color:'#A78BFA'},
  ],
};

const EMOTION_PROGS = [
  {label:'🌟 Joyeux / Pop',     desc:'Lumineux, positif, universel', color:'#F59E0B',
   degs:[0,3,5,4]}, // I IV vi V
  {label:'😢 Mélancolique',     desc:'Introspectif, nostalgique', color:'#06B6D4',
   degs:[5,3,0,4]}, // vi IV I V
  {label:'⚡ Épique / Cinéma',  desc:'Puissant, dramatique', color:'#EF4444',
   degs:[0,2,3,4]}, // I iii IV V
  {label:'🌙 Mystérieux',       desc:'Sombre, incertain', color:'#A78BFA',
   degs:[5,2,4,1]}, // vi iii V ii
  {label:'💛 Romantique',       desc:'Doux, touchant', color:'#F43F5E',
   degs:[0,2,3,1]}, // I iii IV ii
  {label:'🔥 Tension / Jazz',   desc:'Complexe, sophistiqué', color:'#10B981',
   degs:[1,4,0,5]}, // ii V I vi
];

const EXTENSIONS_DATA = [
  {label:'+maj7',  semi:11, name:'Majeure 7',     color:'#A78BFA',
   emotion:'Nostalgique / Pur',
   desc:'Note doucement dissonante qui ajoute une couleur rêveuse, suspendue dans le temps.',
   use:'Parfait pour les ballades et les intros. Remplace le simple accord majeur dans les passages lyriques — Imaj7.'},
  {label:'+7',     semi:10, name:'Dominante 7',   color:'#EF4444',
   emotion:'Tension / Désir',
   desc:'Crée une friction qui appelle à se résoudre. La couleur blues et jazz par excellence.',
   use:'Utilise-le sur le V pour créer une tension forte avant de résoudre sur le I. V7→I.'},
  {label:'+add9',  semi:14, name:'Neuvième ajoutée', color:'#06B6D4',
   emotion:'Brillant / Ouvert',
   desc:'Ajoute une couleur fraîche et lumineuse sans complexifier la structure harmonique.',
   use:'Excellent dans les refrains pop et rock. Iadd9 ou IVadd9 sonnent immédiatement familiers.'},
  {label:'+9',     semi:14, name:'Neuvième',       color:'#10B981',
   emotion:'Jazz / Sophistiqué',
   desc:'Plus riche que l\'add9 car combinée avec la 7e. Signature du jazz moderne.',
   use:'Typique du ii9, Imaj9. Donne une couleur moderne à n\'importe quelle progression.'},
  {label:'+#11',   semi:18, name:'11e augmentée',  color:'#F59E0B',
   emotion:'Mystérieux / Lydien',
   desc:'Note la plus "flottante". Évoque le mode lydien, l\'espace, l\'irréel de Hans Zimmer.',
   use:'Sur le IVmaj7#11 pour une sensation de légèreté surréaliste. Très utilisé en musique de film.'},
  {label:'+b9',    semi:13, name:'9e bémol',        color:'#F43F5E',
   emotion:'Dramatique / Film d\'horreur',
   desc:'La tension la plus sombre. Entre deux demi-tons, crée une dissonance maximum.',
   use:'Uniquement sur le V7 dans des progressions très dramatiques. Signe d\'un point de non-retour.'},
  {label:'+13',    semi:21, name:'Treizième',       color:'#8B5CF6',
   emotion:'Élégant / Complet',
   desc:'L\'accord de jazz le plus luxuriant. Toutes les couleurs harmoniques en une note.',
   use:'Imaj13 pour une conclusion élégante, ou V13 pour une résolution riche et satisfaisante.'},
];

const CADENCES_DATA = [
  {id:'parfaite', name:'Parfaite', label:'V7 → I', color:'#8B5CF6',
   chords:[{r:'G',t:'Dom. 7'},{r:'C',t:'Majeures'}],
   emotion:'Clôture absolue — satisfaction, conclusion définitive, point final.',
   effect:'L\'auditeur ressent un soulagement complet. La plus forte résolution de la musique tonale.',
   usage:'Fin de morceau, de refrain, de section principale. Utilise-la quand tu veux que tout s\'arrête proprement.'},
  {id:'rompue', name:'Rompue', label:'V → vi', color:'#06B6D4',
   chords:[{r:'G',t:'Dom. 7'},{r:'A',t:'Mineures'}],
   emotion:'Surprise douce — l\'oreille attend Do et reçoit La mineur. Rebond inattendu.',
   effect:'Un sourire intérieur. La "tromperie" musicale la plus agréable.',
   usage:'Pour éviter une fin prématurée. Parfait pour prolonger un refrain ou créer une surprise avant un solo.'},
  {id:'demi', name:'Demi-cadence', label:'? → V', color:'#F59E0B',
   chords:[{r:'C',t:'Majeures'},{r:'G',t:'Majeures'}],
   emotion:'Suspension — une question sans réponse, une attente suspendue.',
   effect:'L\'auditeur est tenu en haleine. Il veut la suite.',
   usage:'Milieu de phrase, fin de couplet avant le refrain. Crée de l\'élan vers ce qui suit.'},
  {id:'plagale', name:'Plagale', label:'IV → I', color:'#10B981',
   chords:[{r:'F',t:'Majeures'},{r:'C',t:'Majeures'}],
   emotion:'Spirituel / Sérénité — l\'Amen des hymnes religieux.',
   effect:'Paix intérieure, recueillement. Moins tranchante que la parfaite.',
   usage:'Fin de couplet, de bridge. Gospel, hymnes, ballades douces. Pour une résolution apaisée.'},
  {id:'phrygienne', name:'Phrygienne', label:'♭II → I', color:'#EF4444',
   chords:[{r:'Db',t:'Majeures'},{r:'C',t:'Majeures'}],
   emotion:'Dramatique / Oriental — tension chromatique explosive.',
   effect:'Choc émotionnel. Le demi-ton entre Réb et Do crée une friction très puissante.',
   usage:'Fins dramatiques, musique de film, flamenco, metal. Pour un impact maximal.'},
  {id:'napolitaine', name:'Napolitaine', label:'♭II maj → V → I', color:'#F43F5E',
   chords:[{r:'Db',t:'Majeures'},{r:'G',t:'Dom. 7'},{r:'C',t:'Majeures'}],
   emotion:'Romantique / Opéra — sombre et magnifique à la fois.',
   effect:'Couleur très caractéristique — immédiatement reconnaissable dans l\'opéra et le classique.',
   usage:'Dans les passages lyriques intenses. Très appréciée dans la musique romantique (Beethoven, Schubert).'},
];

const MODULATION_TYPES = [
  {id:'pivot', name:'Par accord pivot', color:'#8B5CF6', diff:'Douce',
   desc:'Un accord appartient aux deux tonalités simultanément. L\'auditeur ne remarque pas le changement.',
   how:'Joue un accord commun aux deux gammes, puis continue dans la nouvelle tonalité.',
   effect:'Naturelle et fluide. L\'auditeur est "emporté" sans s\'en rendre compte.',
   example:'Do→Sol : l\'accord de Ré mineur (ii dans Do, vi dans Sol) sert de pivot.'},
  {id:'directe', name:'Directe / Brusque', color:'#EF4444', diff:'Forte',
   desc:'Changement abrupt sans préparation. La nouvelle tonalité s\'impose par surprise.',
   how:'Termine une phrase dans la tonalité d\'origine, commence la suivante dans la nouvelle.',
   effect:'Choc, surprise, rupture dramatique. Efficace pour signaler un changement émotionnel fort.',
   example:'Do→Mi♭ : le refrain explose dans une tonalité distante sans transition.'},
  {id:'chromatique', name:'Chromatique', color:'#F59E0B', diff:'Colorée',
   desc:'Une note de l\'accord monte ou descend d\'un demi-ton pour atteindre l\'accord de départ de la nouvelle tonalité.',
   how:'Modifie chromatiquement une note de ton dernier accord pour glisser vers le nouvel accord.',
   effect:'Sophistiquée, jazzy. Crée une sensation de "glissement" harmonique.',
   example:'Do→Ré♭ : le Do majeur devient Do7 (avec Si♭), qui "glisse" vers Ré♭ majeur.'},
  {id:'relative', name:'Vers le relatif', color:'#10B981', diff:'Très douce',
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
  const color = NOTE_COLORS[key] || '#8B5CF6';

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
          <button key={s} onClick={()=>setStep(s)} style={{flex:1,padding:'.45rem .25rem',background:step===s?`${color}`:'rgba(255,255,255,0.04)',border:`1px solid ${step===s?color:'rgba(255,255,255,0.1)'}`,borderRadius:10,cursor:'pointer',fontSize:9,fontFamily:'monospace',color:step===s?color:'rgba(255,255,255,0.4)',letterSpacing:'.04em',transition:'all 0.2s',textAlign:'center'}}>
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
                <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'.7rem',background:mode===m?`${color}`:'rgba(255,255,255,0.04)',border:`1px solid ${mode===m?color:'rgba(255,255,255,0.1)'}`,borderRadius:12,cursor:'pointer',color:mode===m?color:'rgba(255,255,255,0.5)',fontFamily:'monospace',fontSize:12,fontWeight:'bold',letterSpacing:'.06em',transition:'all 0.2s',textTransform:'uppercase'}}>
                  {m==='majeur'?'☀ MAJEUR':'🌙 MINEUR'}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.65rem'}}>TONIQUE</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {KEYS.map(k=>{
                const nc=NOTE_COLORS[k]||'#8B5CF6',sel=key===k;
                return <button key={k} onClick={()=>setKey(k)} style={{background:sel?`${nc}`:`${nc}`,border:`1.5px solid ${sel?nc:nc+'40'}`,color:nc,padding:'.6rem .25rem',borderRadius:10,cursor:'pointer',fontSize:14,fontWeight:sel?'bold':'normal',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 4px 14px ${nc}`:'none'}}>{k}</button>;
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
              <button key={em.label} onClick={()=>applyEmotion(em)} style={{background:emotion?.label===em.label?`${em.color}`:'rgba(255,255,255,0.04)',border:`1.5px solid ${emotion?.label===em.label?em.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.9rem 1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:14,fontWeight:'bold',color:em.color,fontFamily:'Georgia,serif',marginBottom:3}}>{em.label}</div>
                  <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{em.desc}</div>
                </div>
                <div style={{display:'flex',gap:5,flexShrink:0,marginLeft:8}}>
                  {em.degs.map((di,i)=>(
                    <span key={i} style={{fontSize:10,fontFamily:'monospace',color:scale[di]?.color,padding:'2px 5px',background:`${scale[di]?.color}`,borderRadius:5}}>
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
            <div style={{padding:'.75rem',background:`${emotion.color}`,border:`1px solid ${emotion.color}`,borderRadius:10,marginBottom:'1.25rem'}}>
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
          {prog.length>1 && <button onClick={()=>setProg(p=>p.slice(0,-1))} style={{padding:'.4rem .85rem',background:'rgba(241,148,138,0.1)',border:'0.5px solid rgba(241,148,138,0.3)',color:'#F1948A',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',marginBottom:'1.25rem',transition:'all 0.2s'}}>↩ Retirer le dernier</button>}
          <button onClick={playProg} disabled={playing} style={{width:'100%',padding:'1rem',background:playing?'rgba(130,224,170,0.1)':'rgba(130,224,170,0.15)',border:`1.5px solid ${playing?'rgba(130,224,170,0.5)':'#82E0AA'}`,color:'#82E0AA',borderRadius:12,cursor:playing?'default':'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
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
  const color = NOTE_COLORS[root] || '#8B5CF6';
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
    pianoColors[k]=isBase?color:(ext?.color||'#F7DC6F');
    pianoColors[k2]=isBase?color:(ext?.color||'#F7DC6F');
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
          {ROOT_NOTES.map(r=>{const nc=NOTE_COLORS[r]||'#8B5CF6',sel=root===r;return(<button key={r} onClick={()=>{setRoot(r);setActive(new Set());}} style={{background:sel?`${nc}`:`${nc}`,border:`1.5px solid ${sel?nc:nc+'30'}`,color:nc,padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 10px ${nc}`:'none'}}>{r}</button>);} )}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
          {Object.entries(CHORD_TYPES).slice(0,3).map(([t,{label}])=>{
            const tc=CHORD_COLORS[t]||'#8B5CF6',sel=baseType===t;
            return(<button key={t} onClick={()=>{setBaseType(t);setActive(new Set());}} style={{background:sel?`${tc}`:`${tc}`,border:`1px solid ${sel?tc:tc+'30'}`,color:sel?tc:`${tc}`,padding:'.5rem .25rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',transition:'all 0.15s'}}>{label}</button>);
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
          {active.size>0&&<button onClick={()=>setActive(new Set())} style={{background:'rgba(241,148,138,0.1)',border:'0.5px solid rgba(241,148,138,0.3)',color:'#F1948A',padding:'.4rem .75rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>✕ Reset</button>}
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
                  <button onClick={()=>toggleExt(ext.label)} style={{background:isOn?ext.color:'rgba(255,255,255,0.06)',border:`1.5px solid ${ext.color}`,color:isOn?'#0D0B1E':ext.color,padding:'.3rem .6rem',borderRadius:8,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',minWidth:56,transition:'all 0.2s',boxShadow:isOn?`0 2px 10px ${ext.color}`:'none'}}>
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
            <div key={cad.id} style={{background:isA?`${cad.color}`:'rgba(255,255,255,0.03)',border:`1.5px solid ${isA?cad.color:'rgba(255,255,255,0.08)'}`,borderRadius:14,padding:'1rem',transition:'all 0.3s'}}>
              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
                <div>
                  <div style={{fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif',color:isA?cad.color:'#fff',marginBottom:3}}>{cad.name}</div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {cad.chords.map((ch,i)=>(
                      <span key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                        {i>0&&<span style={{opacity:.3,fontSize:12}}>→</span>}
                        <span style={{fontSize:12,fontFamily:'monospace',color:NOTE_COLORS[ch.r]||cad.color,padding:'2px 7px',background:`${NOTE_COLORS[ch.r]||cad.color}`,borderRadius:6}}>{ch.r}{CHORD_TYPES[ch.t]?.suffix}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={()=>playCadence(cad)} disabled={playing} style={{background:`${cad.color}08`,border:`1px solid ${cad.color}30`,color:cad.color,padding:'.45rem .85rem',borderRadius:10,cursor:playing?'default':'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold',flexShrink:0,transition:'all 0.2s',boxShadow:`0 2px 10px ${cad.color}`}}>
                  {playing&&isA?'▶…':'▶ ÉCOUTER'}
                </button>
              </div>
              {/* Emotion */}
              <div style={{padding:'.65rem .85rem',background:`${cad.color}08`,borderRadius:10,marginBottom:'.65rem'}}>
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
            {ROOT_NOTES.map(k=>{const nc=NOTE_COLORS[k]||'#8B5CF6',sel=fromKey===k;return(<button key={k} onClick={()=>setFromKey(k)} style={{background:sel?`${nc}`:`${nc}`,border:`1px solid ${sel?nc:nc+'30'}`,color:nc,padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 8px ${nc}`:'none'}}>{k}</button>);} )}
          </div>
        </div>
        {/* Arrow */}
        <div style={{textAlign:'center',paddingTop:'2rem',fontSize:22,opacity:.4}}>→</div>
        {/* To */}
        <div>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem',textAlign:'center'}}>ARRIVÉE</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
            {ROOT_NOTES.map(k=>{const nc=NOTE_COLORS[k]||'#8B5CF6',sel=toKey===k;return(<button key={k} onClick={()=>setToKey(k)} style={{background:sel?`${nc}`:`${nc}`,border:`1px solid ${sel?nc:nc+'30'}`,color:nc,padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 8px ${nc}`:'none'}}>{k}</button>);} )}
          </div>
        </div>
      </div>

      {disabled && <div style={{padding:'1rem',background:'rgba(255,255,255,0.04)',borderRadius:12,marginBottom:'1rem',textAlign:'center',fontSize:12,opacity:.5,fontFamily:'monospace'}}>Sélectionne deux tonalités différentes</div>}

      {!disabled && (<>
        {/* Overview */}
        <div style={{padding:'1rem',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,marginBottom:'1.25rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
            <span style={{fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',color:'#A78BFA'}}>{fromKey} → {toKey}</span>
            <span style={{fontSize:11,fontFamily:'monospace',color:'rgba(167,139,250,0.7)',padding:'3px 8px',background:'rgba(139,92,246,0.15)',borderRadius:8}}>{circDiff} quinte{circDiff>1?'s':''}</span>
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
          <div style={{marginBottom:'1.25rem',padding:'1rem',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:12}}>
            <div style={{fontSize:10,color:'#10B981',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>ACCORDS PIVOTS POSSIBLES</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {pivots.map((p,i)=>{
                const asTo=toDegrees.find(t=>t.name===p.name);
                return(<div key={i} style={{padding:'.5rem .75rem',background:`${p.color}`,border:`1px solid ${p.color}`,borderRadius:10}}>
                  <div style={{fontSize:13,fontWeight:'bold',color:p.color,fontFamily:'monospace',marginBottom:2}}>{p.name}</div>
                  <div style={{fontSize:9,opacity:.55,fontFamily:'monospace'}}>{p.deg} dans {fromKey} / {asTo?.deg} dans {toKey}</div>
                </div>);
              })}
            </div>
          </div>
        )}

        {/* Modulation types */}
        <div style={{marginBottom:'1rem'}}>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.75rem'}}>TECHNIQUES DE MODULATION</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {MODULATION_TYPES.map(mt=>{
              const isA=selType===mt.id;
              return(<button key={mt.id} onClick={()=>setSelType(isA?null:mt.id)} style={{background:isA?`${mt.color}`:'rgba(255,255,255,0.03)',border:`1.5px solid ${isA?mt.color:'rgba(255,255,255,0.08)'}`,borderRadius:12,padding:'.9rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:isA?'.65rem':0}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:'bold',color:mt.color,fontFamily:'Georgia,serif'}}>{mt.name}</span>
                    <span style={{fontSize:9,padding:'2px 7px',background:`${mt.color}`,border:`0.5px solid ${mt.color}`,borderRadius:6,color:mt.color,fontFamily:'monospace'}}>{mt.diff}</span>
                  </div>
                  <span style={{fontSize:12,opacity:.4}}>{isA?'▲':'▼'}</span>
                </div>
                {isA&&(<div style={{animation:'fadeIn 0.25s ease'}}>
                  <p style={{fontSize:12,opacity:.65,lineHeight:1.65,margin:'0 0 .65rem',fontFamily:'Georgia,serif'}}>{mt.desc}</p>
                  <div style={{padding:'.65rem',background:`${mt.color}`,borderRadius:8,marginBottom:'.5rem'}}>
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
      </>)}
    </div>
  );
}

// ── Coin de l'Harmonie ────────────────────────────────────────────────────────
function CoinHarmoniePage() {
  const [sub, setSub] = useState(null);
  const MODS = [
    {id:'composition', icon:'🎹', title:'Composition assistée', subtitle:'GAMME · ÉMOTION · PROGRESSION', color:'#8B5CF6', ok:true},
    {id:'extensions',  icon:'✨', title:'Extensions & Tensions', subtitle:'9e · #11 · b9 · RESSENTI',      color:'#F59E0B', ok:true},
    {id:'cadences',    icon:'🎼', title:'Cadences',              subtitle:'PARFAITE · ROMPUE · PLAGALE',   color:'#06B6D4', ok:true},
    {id:'modulation',  icon:'🔀', title:'Modulation',            subtitle:'CHANGER DE TONALITÉ',            color:'#10B981', ok:true},
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
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em',background:'linear-gradient(90deg,#A78BFA,#F43F5E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Coin de l'Harmonie</h2>
        <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>COMPRENDRE ET RESSENTIR L'HARMONIE</p>
      </div>
      <div style={{padding:'1rem',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:14,marginBottom:'1.5rem'}}>
        <p style={{fontSize:12,opacity:.65,margin:0,lineHeight:1.65,fontFamily:'Georgia,serif'}}>L'harmonie n'est pas un ensemble de règles — c'est un langage que tu apprends à ressentir. Ces 4 modules te donnent les outils pour <em>composer, analyser et émouvoir</em>.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {MODS.map((m)=>(
          <button key={m.id} onClick={()=>setSub(m.id)}
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-3px) scale(1.02)';e.currentTarget.style.boxShadow=`0 10px 28px ${m.color}`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}`;e.currentTarget.style.borderColor=`${m.color}`;e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='none';}}
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
function MotCle({ children, definition, color='#A78BFA', onClickWord }) {
  return (
    <span
      onClick={() => onClickWord && onClickWord(children, definition)}
      style={{
        color, fontWeight:'bold', cursor:'pointer',
        borderBottom:`1.5px dotted ${color}`,
        padding:'0 1px', transition:'all 0.15s',
        display:'inline',
      }}
      onMouseEnter={e=>{e.currentTarget.style.background=`${color}`;e.currentTarget.style.borderRadius='3px';}}
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
        background:'linear-gradient(160deg,#1a0a2e,#0D0B1E)',
        border:'2px solid rgba(167,139,250,0.5)',
        borderRadius:'20px 20px 0 0', padding:'1.5rem',
        boxShadow:'0 -16px 48px rgba(139,92,246,0.35)',
        animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{display:'flex',alignItems:'flex-start',gap:'1rem',marginBottom:'1rem'}}>
          <Mascotte expression="happy" size={64} animate/>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:'#A78BFA',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:4}}>NOIRE EXPLIQUE</div>
            <div style={{fontSize:18,fontWeight:'bold',color:'#fff',fontFamily:'Georgia,serif',marginBottom:8}}>{word}</div>
            <p style={{fontSize:13.5,color:'rgba(255,255,255,0.82)',lineHeight:1.7,margin:0,fontFamily:'Georgia,serif'}}>{definition}</p>
          </div>
        </div>
        <button onClick={onClose} style={{width:'100%',padding:'.7rem',background:'rgba(167,139,250,0.15)',border:'1.5px solid #A78BFA',color:'#A78BFA',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.1em',fontWeight:'bold'}}>
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

  const M = (word, def, color='#A78BFA') => (
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
            style={{flex:1,padding:'.65rem .25rem',background:'none',border:'none',borderBottom:activeSection===s.id?'2px solid #C39BD3':'2px solid transparent',color:activeSection===s.id?'#C39BD3':'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.04em',transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <span style={{fontSize:14}}>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>

        {activeSection==='gammes' && (<div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeIn 0.3s ease'}}>
          <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',background:'linear-gradient(90deg,#C39BD3,#A78BFA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Gammes et modes</h3>

          <div style={{padding:'1rem',background:'rgba(195,155,211,0.08)',border:'1px solid rgba(195,155,211,0.2)',borderRadius:12}}>
            <h4 style={{fontSize:15,fontWeight:'bold',color:'#C39BD3',marginBottom:'.65rem'}}>Qu'est-ce qu'une gamme ?</h4>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif'}}>
              Une {M("gamme","Une gamme est une succession ordonnée de notes qui définit l'univers sonore d'un morceau. Pense à elle comme à une palette de couleurs — certaines notes sont disponibles, d'autres non.","#C39BD3")} est une série de notes ordonnées selon un {M("schéma d'intervalles","Un intervalle est la distance sonore entre deux notes. Les intervalles d'une gamme sont mesurés en tons (T) et demi-tons (1/2). Ex: Do-Ré = 1 ton, Do-Ré♭ = 1/2 ton.","#85C1E9")} fixe. Elle définit le &quot;territoire sonore&quot; d'un morceau. Une gamme commence et finit sur la même note — appelée {M("tonique","La tonique (ou fondamentale) est la note de départ d'une gamme. C'est le centre de gravité de toute la musique tonale. Une mélodie cherche toujours à revenir à la tonique.","#82E0AA")}.
            </p>
          </div>

          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
            <h4 style={{fontSize:15,fontWeight:'bold',color:'#F7DC6F',marginBottom:'.65rem'}}>La gamme majeure</h4>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',marginBottom:'1rem'}}>
              La gamme {M("majeure","La gamme majeure est souvent décrite comme 'joyeuse' ou 'lumineuse'. Son schéma (T-T-1/2-T-T-T-1/2) lui donne sa couleur positive. C'est la gamme de Do (toutes touches blanches du piano).","#F7DC6F")} est la plus fondamentale de la musique occidentale. Son schéma d'intervalles est : {M("Ton","Un Ton = 2 demi-tons = 2 touches consécutives en comptant les noires. Ex: Do à Ré = 1 Ton.","#85C1E9")}-{M("Ton","Un Ton = 2 demi-tons = 2 touches consécutives en comptant les noires. Ex: Do à Ré = 1 Ton.","#85C1E9")}-{M("Demi-ton","Un Demi-ton = la plus petite distance possible entre deux notes. Sur le piano, c'est la distance entre une touche et la touche immédiatement voisine (noire ou blanche). Ex: Mi à Fa = 1 Demi-ton.","#A78BFA")}-Ton-Ton-Ton-Demi-ton.
            </p>
            {/* Visual scale display */}
            <div style={{background:'rgba(0,0,0,0.2)',borderRadius:10,padding:'.85rem',marginBottom:'.75rem'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem'}}>GAMME DE DO MAJEUR</div>
              <div style={{display:'flex',gap:4,alignItems:'flex-end',flexWrap:'wrap'}}>
                {[{n:'Do',i:'T'},{n:'Ré',i:'T'},{n:'Mi',i:'½'},{n:'Fa',i:'T'},{n:'Sol',i:'T'},{n:'La',i:'T'},{n:'Si',i:'½'},{n:'Do',i:''}].map((note,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:36,height:36,borderRadius:8,background:i===0||i===7?'rgba(195,155,211,0.3)':'rgba(255,255,255,0.08)',border:`1px solid ${i===0||i===7?'#C39BD3':'rgba(255,255,255,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:'bold',color:i===0||i===7?'#C39BD3':'rgba(255,255,255,0.7)'}}>
                      {note.n}
                    </div>
                    {note.i&&<div style={{fontSize:9,color:'rgba(255,255,255,0.35)',fontFamily:'monospace'}}>{note.i}</div>}
                  </div>
                ))}
              </div>
            </div>
            <p style={{fontSize:12.5,lineHeight:1.7,opacity:.7,fontFamily:'Georgia,serif',margin:0}}>
              La {M("tierce majeure","La tierce majeure est l'intervalle entre la 1ère et la 3e note d'une gamme majeure — 4 demi-tons (Do-Mi). C'est elle qui donne la couleur 'joyeuse' à l'accord majeur. Enlève-la et tu obtiens une tierce mineure (3 demi-tons) qui donne la couleur 'triste'.","#F7DC6F")} (Do-Mi, soit 4 demi-tons) et la {M("quinte juste","La quinte juste est l'intervalle entre la 1ère et la 5e note — 7 demi-tons. C'est l'intervalle le plus stable et consonant après l'octave. C'est le fondement de tout accord en musique occidentale.","#82E0AA")} (Do-Sol, 7 demi-tons) définissent la couleur lumineuse de la gamme majeure.
            </p>
          </div>

          <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
            <h4 style={{fontSize:15,fontWeight:'bold',color:'#A78BFA',marginBottom:'.65rem'}}>La gamme mineure naturelle</h4>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',marginBottom:'1rem'}}>
              La gamme {M("mineure naturelle","La gamme mineure naturelle (ou mineure éolienne) est la 6e note de la gamme majeure prise comme nouvelle tonique. Ex: La mineur = les mêmes notes que Do majeur mais en partant de La. C'est pourquoi Do majeur et La mineur sont 'relatifs'.","#A78BFA")} a un schéma différent : Ton-Demi-ton-Ton-Ton-Demi-ton-Ton-Ton. Sa {M("tierce mineure","La tierce mineure (Do-Mi♭, 3 demi-tons) est ce qui donne la couleur 'sombre' ou 'mélancolique' à un accord ou une gamme mineure. C'est 1 demi-ton de moins que la tierce majeure.","#A78BFA")} (Do-Mi♭) lui donne sa couleur sombre et introspective.
            </p>
            <div style={{background:'rgba(0,0,0,0.2)',borderRadius:10,padding:'.85rem'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem'}}>GAMME DE LA MINEUR NATUREL</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {[{n:'La',i:'T'},{n:'Si',i:'½'},{n:'Do',i:'T'},{n:'Ré',i:'T'},{n:'Mi',i:'½'},{n:'Fa',i:'T'},{n:'Sol',i:'T'},{n:'La',i:''}].map((note,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:36,height:36,borderRadius:8,background:i===0||i===7?'rgba(167,139,250,0.3)':'rgba(255,255,255,0.08)',border:`1px solid ${i===0||i===7?'#A78BFA':'rgba(255,255,255,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:'bold',color:i===0||i===7?'#A78BFA':'rgba(255,255,255,0.7)'}}>
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
          <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',background:'linear-gradient(90deg,#06B6D4,#8B5CF6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Les modes de la gamme majeure</h3>
          <div style={{padding:'1rem',background:'rgba(6,182,212,0.08)',border:'1px solid rgba(6,182,212,0.2)',borderRadius:12}}>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
              Les {M("modes","Les modes sont des variantes d'une gamme obtenues en changeant la note de départ. La gamme de Do majeur a 7 modes : Ionien, Dorien, Phrygien, Lydien, Mixolydien, Éolien, Locrien. Chacun a une couleur émotionnelle distincte.","#06B6D4")} sont créés en prenant les mêmes notes d'une gamme mais en changeant la {M("tonique","La tonique est la note centrale, le 'Do' de référence du mode. En changeant la tonique sur les mêmes notes, on change la couleur harmonique de tout un morceau.","#82E0AA")}. La gamme de Do majeur (Do-Ré-Mi-Fa-Sol-La-Si) a 7 modes.
            </p>
          </div>
          {[
            {name:'Ionien',  start:'Do', color:'#F7DC6F', feel:'Joyeux, stable',   desc:"C'est simplement la gamme majeure. Ton point de départ.", example:"Do-Ré-Mi-Fa-Sol-La-Si-Do"},
            {name:'Dorien',  start:'Ré', color:'#82E0AA', feel:'Jazz, mélancolie douce', desc:"Gamme mineure avec une sixte majeure 'lumineuse'. Le mode du jazz moderne.", example:"Ré-Mi-Fa-Sol-La-Si-Do-Ré"},
            {name:'Phrygien',start:'Mi', color:'#EF4444', feel:'Espagnol, dramatique', desc:"Sa seconde mineure lui donne ce caractère flamenco et andalou irrésistible.", example:"Mi-Fa-Sol-La-Si-Do-Ré-Mi"},
            {name:'Lydien',  start:'Fa', color:'#A78BFA', feel:'Rêveur, cinéma', desc:"Sa quarte augmentée crée une flottement irréel. Très utilisé par John Williams.", example:"Fa-Sol-La-Si-Do-Ré-Mi-Fa"},
            {name:'Mixolydien',start:'Sol',color:'#F59E0B',feel:'Blues, rock', desc:"Gamme majeure avec une septième mineure. L'accord de Sol7 y est naturel.", example:"Sol-La-Si-Do-Ré-Mi-Fa-Sol"},
            {name:'Éolien',  start:'La', color:'#C39BD3', feel:'Triste, introspectif', desc:"La gamme mineure naturelle. Le mode le plus utilisé en musique populaire.", example:"La-Si-Do-Ré-Mi-Fa-Sol-La"},
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
          <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',color:'#82E0AA'}}>Apprendre ses gammes au piano</h3>
          <div style={{padding:'1rem',background:'rgba(130,224,170,0.08)',border:'1px solid rgba(130,224,170,0.2)',borderRadius:12}}>
            <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif'}}>
              Apprendre ses gammes n'est pas une punition — c'est construire son vocabulaire musical. Un pianiste qui connaît ses gammes peut improviser, transposer et analyser instantanément. La méthode : {M("gamme de Do d'abord","Do majeur = toutes les touches blanches. Pas de dièse ni bémol. C'est la gamme la plus simple visuellement. Une fois maîtrisée, les autres gammes suivent le même schéma décalé.","#82E0AA")}, puis le {M("cycle des quintes","Le cycle des quintes est l'ordre dans lequel on ajoute des dièses (Do, Sol, Ré, La...) ou des bémols (...Mi♭, Si♭, Fa) à l'armure. C'est l'ordre idéal pour apprendre les gammes progressivement.","#F7DC6F")}.
            </p>
          </div>
          {[
            {title:"Doigté main droite — gamme majeure", color:'#85C1E9',
             content:"Le doigté standard de la gamme de Do MD est : 1-2-3 / 1-2-3-4-5. Le passage du pouce (1 sous 3 à la montée, 3 sur 1 à la descente) est la clé. À pratiquer lentement (60 BPM) en contrôlant que le poignet reste horizontal."},
            {title:"Doigté main gauche — gamme majeure", color:'#F1948A',
             content:"MG gamme de Do : 5-4-3-2-1 / 3-2-1 (montée). Le passage s'effectue sur la 6e note. À la descente : 1-2-3 / 1-2-3-4-5. Les deux mains en même temps = même schéma de passage du pouce, symétrique."},
            {title:"Méthode de travail quotidienne", color:'#F7DC6F',
             content:"5 minutes/jour de gammes valent mieux qu'une heure par semaine. Commencer lentement (40 BPM) et ne jamais accélérer avant d'atteindre 10 répétitions parfaites. Jouer les gammes les yeux fermés renforce la mémoire musculaire."},
            {title:"Les gammes pentatoniques", color:'#A78BFA',
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
  const M = (word, def, color='#85C1E9') => (
    <MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>
  );

  const INTERVALS = [
    {name:'Unisson',      semis:0,  abbr:'1', color:'#6B7280', feel:'Identité sonore', ex:'Do-Do'},
    {name:'Seconde mineure',semis:1,abbr:'2m',color:'#EF4444', feel:'Friction maximale',ex:'Do-Ré♭'},
    {name:'Seconde majeure',semis:2,abbr:'2M',color:'#F59E0B', feel:'Tension légère',  ex:'Do-Ré'},
    {name:'Tierce mineure',semis:3, abbr:'3m',color:'#A78BFA', feel:'Mélancolie',       ex:'Do-Mi♭'},
    {name:'Tierce majeure',semis:4, abbr:'3M',color:'#F7DC6F', feel:'Joie, lumière',   ex:'Do-Mi'},
    {name:'Quarte juste',  semis:5, abbr:'4J',color:'#82E0AA', feel:'Stabilité ouverte',ex:'Do-Fa'},
    {name:'Triton',        semis:6, abbr:'4+',color:'#EF4444', feel:'Tension diabolique',ex:'Do-Fa♯'},
    {name:'Quinte juste',  semis:7, abbr:'5J',color:'#06B6D4', feel:'Solidité, force', ex:'Do-Sol'},
    {name:'Sixte mineure', semis:8, abbr:'6m',color:'#C39BD3', feel:'Nostalgique',      ex:'Do-La♭'},
    {name:'Sixte majeure', semis:9, abbr:'6M',color:'#10B981', feel:'Chaleureux',       ex:'Do-La'},
    {name:'Septième mineure',semis:10,abbr:'7m',color:'#F59E0B',feel:'Tension douce',  ex:'Do-Si♭'},
    {name:'Septième majeure',semis:11,abbr:'7M',color:'#8B5CF6',feel:'Suspendu, rêveur',ex:'Do-Si'},
    {name:'Octave',        semis:12,abbr:'8',  color:'#82E0AA', feel:'Résolution totale',ex:'Do-Do'},
  ];

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',background:'linear-gradient(90deg,#85C1E9,#06B6D4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Les intervalles</h3>

      <div style={{padding:'1rem',background:'rgba(133,193,233,0.08)',border:'1px solid rgba(133,193,233,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Un {M("intervalle","Un intervalle est la distance sonore entre deux notes. C'est l'élément de base de l'harmonie. Tous les accords et toutes les gammes sont construits à partir d'intervalles. Les maîtriser à l'oreille, c'est comprendre la musique.")} est la distance entre deux notes, mesurée en {M("demi-tons","Le demi-ton est la plus petite distance musicale en musique occidentale. Sur le piano, c'est la distance entre deux touches adjacentes (ex: Mi et Fa, ou Do et Do♯). 2 demi-tons = 1 ton.","#A78BFA")}. Un intervalle peut être {M("mélodique","Un intervalle mélodique est joué en séquence : une note après l'autre. Ex: Do puis Sol = quinte juste mélodique. C'est ce que fait une mélodie.","#82E0AA")} (notes successives) ou {M("harmonique","Un intervalle harmonique est joué simultanément : les deux notes en même temps. Ex: Do + Sol = quinte juste harmonique. C'est ce que fait un accord.")}.
        </p>
      </div>

      {/* Interval table */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#85C1E9',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>TABLEAU DES INTERVALLES</div>
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
        <div style={{fontSize:10,color:'#85C1E9',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>INTERVALLES FONDAMENTAUX</div>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {[
            {title:"Le triton — diabolus in musica", color:'#EF4444',
             text:`Le ${M("triton","Le triton (6 demi-tons) divise exactement l'octave en deux. Au Moyen Âge, il était interdit car jugé trop dissonant — diabolus in musica (le diable en musique). Aujourd'hui c'est la tension la plus forte de la musique tonale. G7 = Do-Mi-Sol-Si♭ contient un triton entre Mi et Si♭.","#EF4444")} est l'intervalle le plus instable. Il est au cœur de l'accord de dominante 7 et crée la tension qui pousse vers la résolution.`},
            {title:"La quinte juste — le fondement", color:'#06B6D4',
             text:`La ${M("quinte juste","La quinte juste (7 demi-tons) est l'intervalle le plus stable après l'octave. Tous les accordeurs de guitare utilisent la quinte. C'est la base du cycle des quintes, de la construction des accords et de l'intonation naturelle.","#06B6D4")} (7 demi-tons) est l'intervalle le plus consonant après l'octave. Il structure tout l'accord parfait (Do-Mi-Sol : fondamentale, tierce, quinte).`},
            {title:"La tierce — la couleur majeur/mineur", color:'#A78BFA',
             text:`La ${M("tierce","La tierce est l'intervalle entre la 1ère et la 3ème note d'une gamme. Tierce majeure = 4 demi-tons (joie). Tierce mineure = 3 demi-tons (mélancolie). C'est cet unique demi-ton de différence qui change toute la couleur émotionnelle d'un morceau.","#A78BFA")} définit si un accord sonne majeur ou mineur. 4 demi-tons = majeur (lumineux). 3 demi-tons = mineur (sombre). Un seul demi-ton de différence change toute l'atmosphère.`},
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
        <div style={{fontSize:10,color:'#F7DC6F',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>MÉMO : IDENTIFIER LES INTERVALLES PAR L'ÉCOUTE</div>
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
              <span style={{fontWeight:'bold',color:'#F7DC6F',fontFamily:'monospace',minWidth:120,flexShrink:0,fontSize:11}}>{m.int}</span>
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
  const M = (word, def, color='#F7DC6F') => (
    <MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>
  );

  function playExChord(semis) {
    semis.forEach((s,i)=>setTimeout(()=>playNote(s+4*12,0,1.5),i*80));
    setPlayedChord(semis.join('-'));
    setTimeout(()=>setPlayedChord(null),2000);
  }

  const CHORD_TYPES_THEORY = [
    {name:'Accord majeur',  formula:[0,4,7],  color:'#F7DC6F', feel:'Lumineux, positif',   semis_ex:[0,4,7],
     desc:"Fondamentale + tierce majeure (4 demi-tons) + quinte juste (7 demi-tons). L'accord parfait majeur."},
    {name:'Accord mineur',  formula:[0,3,7],  color:'#A78BFA', feel:'Sombre, mélancolique',  semis_ex:[0,3,7],
     desc:"Fondamentale + tierce mineure (3 demi-tons) + quinte juste (7 demi-tons). Un seul demi-ton de moins que le majeur."},
    {name:'Accord diminué', formula:[0,3,6],  color:'#EF4444', feel:'Tension maximale',     semis_ex:[0,3,6],
     desc:"Fondamentale + tierce mineure + quinte diminuée (6 demi-tons = triton). Très instable, demande résolution."},
    {name:'Accord augmenté',formula:[0,4,8],  color:'#F59E0B', feel:'Mystérieux, flottant', semis_ex:[0,4,8],
     desc:"Fondamentale + tierce majeure + quinte augmentée (8 demi-tons). Couleur mystérieuse, très utilisée en Jazz."},
    {name:'Accord de 7e dominante',formula:[0,4,7,10],color:'#EF4444',feel:'Tension forte, appel à résoudre',semis_ex:[0,4,7,10],
     desc:"Accord majeur + septième mineure (10 demi-tons). Contient un triton (entre la tierce et la 7e) qui crée la tension V7→I."},
    {name:'Accord de 7e majeure',formula:[0,4,7,11],color:'#8B5CF6',feel:'Rêveur, nostalgique', semis_ex:[0,4,7,11],
     desc:"Accord majeur + septième majeure (11 demi-tons). Plus doux que la 7e dominante. Signature du jazz moderne et de la bossa nova."},
    {name:'Accord de 7e mineure',formula:[0,3,7,10],color:'#C39BD3',feel:'Jazz, sophistiqué',  semis_ex:[0,3,7,10],
     desc:"Accord mineur + septième mineure. L'accord ii7 fondamental du jazz. Très utilisé pour les progressions ii-V-I."},
  ];

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <h3 style={{fontSize:20,fontWeight:'bold',margin:'0 0 .25rem',background:'linear-gradient(90deg,#F7DC6F,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Construction des accords</h3>

      <div style={{padding:'1rem',background:'rgba(247,220,111,0.08)',border:'1px solid rgba(247,220,111,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Un {M("accord","Un accord est la superposition d'au moins 3 notes jouées simultanément. Un accord à 3 notes s'appelle une triade. À 4 notes : un accord de septième. Un accord est comme un mot dans le langage musical : il transmet une émotion précise.")} est une superposition de notes construite sur des {M("intervalles","Les intervalles sont les distances entre les notes. Pour construire un accord, on empile des tierces (3 ou 4 demi-tons) sur la note fondamentale. C'est la superposition d'intervalles qui crée la couleur de l'accord.","#85C1E9")} caractéristiques. La méthode universelle : partir d'une {M("fondamentale","La fondamentale (ou racine) est la note qui donne son nom à l'accord. Do majeur = accord dont la fondamentale est Do. C'est la note la plus grave dans un accord en position fondamentale.","#82E0AA")}, puis empiler des tierces.
        </p>
      </div>

      {/* Chord types with play button */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#F7DC6F',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>LES 7 TYPES D'ACCORDS ESSENTIELS — clique 🔊 pour écouter en Do</div>
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
        <div style={{fontSize:10,color:'#F7DC6F',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>LES RENVERSEMENTS</div>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',marginBottom:'1rem'}}>
          Un {M("renversement","Un renversement est obtenu en déplaçant la note la plus grave d'un accord vers l'aigu. Accord de Do en position fondamentale : Do-Mi-Sol. 1er renversement : Mi-Sol-Do. 2ème renversement : Sol-Do-Mi. Le son change, mais la couleur (majeur/mineur) reste identique.")} change la note la plus grave de l'accord sans changer sa qualité. Ils permettent des enchaînements fluides ({M("voice leading","Le voice leading (conduite des voix) est l'art de relier les notes d'un accord au suivant avec le minimum de mouvement. Un bon voice leading crée une fluidité mélodique dans l'harmonie. Bach est le maître absolu du voice leading.","#A78BFA")}).
        </p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {[
            {name:'Position fondamentale', notes:'Do-Mi-Sol', color:'#F7DC6F', desc:'La note la plus grave est la fondamentale'},
            {name:'1er renversement',      notes:'Mi-Sol-Do', color:'#85C1E9', desc:'La tierce est à la basse'},
            {name:'2ème renversement',     notes:'Sol-Do-Mi', color:'#82E0AA', desc:'La quinte est à la basse'},
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
        <div style={{fontSize:10,color:'#F7DC6F',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.75rem'}}>LES 7 ACCORDS DIATONIQUES DE DO MAJEUR</div>
        <p style={{fontSize:13,opacity:.7,lineHeight:1.65,marginBottom:'1rem',fontFamily:'Georgia,serif'}}>
          En {M("harmonisant","Harmoniser une gamme = construire un accord sur chaque degré en utilisant uniquement les notes de cette gamme. On obtient 7 accords naturels qui s'entendent bien ensemble — c'est la base de toute composition tonale.","#F7DC6F")} la gamme de Do majeur (un accord sur chaque degré avec uniquement les notes de la gamme), on obtient :
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
          {[{d:'I',n:'Do M',c:'#F7DC6F'},{d:'ii',n:'Ré m',c:'#A78BFA'},{d:'iii',n:'Mi m',c:'#82E0AA'},{d:'IV',n:'Fa M',c:'#85C1E9'},{d:'V',n:'Sol M',c:'#EF4444'},{d:'vi',n:'La m',c:'#C39BD3'},{d:'vii°',n:'Si dim',c:'#6B7280'}].map(a=>(
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
    const mc  = pct>=80?'#82E0AA':pct>=50?'#F7DC6F':'#F1948A';
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
          <span style={{fontSize:10,fontFamily:'monospace',color:'#82E0AA'}}>{score} ✓</span>
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
              else if(isChosen){bg='rgba(241,148,138,0.1)';border='#F1948A';col='#F1948A';}
              else{col='rgba(255,255,255,0.25)';}
            }
            return(
              <button key={i} onClick={()=>pick(i)} disabled={answered}
                style={{background:bg,border:`1.5px solid ${border}`,color:col,padding:'.9rem 1rem',borderRadius:12,cursor:answered?'default':'pointer',textAlign:'left',fontSize:13,fontFamily:'Georgia,serif',lineHeight:1.5,transition:'all 0.2s'}}
                onMouseEnter={e=>{if(!answered){e.currentTarget.style.background=`${color}`;e.currentTarget.style.borderColor=`${color}`;}}}
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
  const M=(word,def,color='#F1948A')=><MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>;

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
      <CourseQuiz questions={QUIZ_QUESTIONS} courseTitle="Fonctions harmoniques" color="#F1948A" onClose={()=>setShowQuiz(false)}/>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#F1948A,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Fonctions harmoniques</h3>
        <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(241,148,138,0.15)',border:'1px solid rgba(241,148,138,0.4)',color:'#F1948A',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
      </div>

      <div style={{padding:'1rem',background:'rgba(241,148,138,0.08)',border:'1px solid rgba(241,148,138,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Chaque accord d'une gamme a un {M("rôle fonctionnel","Une fonction harmonique est le rôle qu'un accord joue dans la progression. Comme dans une phrase, certains mots créent l'attente, d'autres la résolvent. En musique tonale, tout accord est soit une tonique (repos), soit une dominante (tension), soit une sous-dominante (mouvement).")}. La musique tonale repose sur trois pôles : {M("Tonique","La tonique (T) est le centre de repos. En Do majeur, c'est l'accord de Do. Tous les chemins harmoniques y reviennent. Accords toniques en majeur : I, iii, vi.","#82E0AA")}, {M("Dominante","La dominante (D) est le pôle de tension maximale. Elle crée l'envie de revenir à la tonique. Accords dominants en majeur : V, vii°. Le V7 est la dominante la plus puissante.","#EF4444")}, {M("Sous-dominante","La sous-dominante (SD) est le pôle de mouvement — elle s'éloigne de la tonique sans créer autant de tension que la dominante. En majeur : IV, ii. Penser à l'Amen des hymnes (IV→I = cadence plagale).","#F7DC6F")}.
        </p>
      </div>

      {[
        {title:"I — La Tonique : la maison", color:'#82E0AA', icon:'🏠',
         content:[
           "L'accord I est le centre de gravité de toute la musique tonale. Tout morceau cherche à y revenir.",
           "En Do majeur : Do-Mi-Sol. Sa tierce majeure et sa quinte juste lui donnent une stabilité parfaite.",
           "Les accords iii et vi partagent des notes avec I et ont une fonction tonique secondaire (couleurs plus sombres).",
           `Astuce : quand tu entends une mélodie qui "atterrit" et se stabilise, tu es probablement sur un accord I.`,
         ]},
        {title:"V — La Dominante : la tension", color:'#EF4444', icon:'⚡',
         content:[
           "L'accord V (Sol majeur en Do) contient la note sensible (Si) qui veut monter vers Do.",
           "Le V7 (Sol-Si-Ré-Fa) est encore plus fort : il contient un triton Si-Fa qui cherche à se résoudre.",
           "La résolution V→I est appelée cadence parfaite. C'est la conclusion harmonique la plus forte.",
           "En jazz, on utilise souvent le V7alt (dominante altérée) pour une tension encore plus pimentée.",
         ]},
        {title:"IV — La Sous-dominante : le départ", color:'#F7DC6F', icon:'🚀',
         content:[
           "L'accord IV (Fa majeur en Do) crée un mouvement sans tension dramatique.",
           "La progression I→IV donne une sensation d'élévation, d'ouverture — pensez à l'intro de Let It Be.",
           "La cadence plagale IV→I (l'Amen des hymnes) est une résolution douce et spirituelle.",
           "L'accord ii (Ré mineur en Do) est une sous-dominante mineure aux couleurs plus sophistiquées.",
         ]},
        {title:"Les cadences — ponctuations musicales", color:'#C39BD3', icon:'📌',
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
  const M=(word,def,color='#06B6D4')=><MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>;

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
    {name:'Cadence parfaite',   formula:'V7 → I',  chords:[['G','Dom. 7'],['C','Majeures']], color:'#82E0AA',
     feel:'Conclusion définitive — point final.',
     desc:"La plus forte résolution de la musique tonale. L'oreille ressent un soulagement complet.",
     usage:"Fin de morceau, fin de refrain, clôture d'une section. À utiliser quand tu veux que la musique s'arrête vraiment.",
     examples:"Fin de presque toutes les sonates classiques. Bach l'utilise à la fin de chaque chorâl."},
    {name:'Cadence imparfaite', formula:'I → V',   chords:[['C','Majeures'],['G','Majeures']], color:'#F7DC6F',
     feel:'Suspension — une question sans réponse.',
     desc:"La musique se termine sur la dominante, créant une attente. Comme une phrase qui se finit par...",
     usage:"Milieu de couplet, fin de phrase musicale avant le refrain. Crée de l'élan vers ce qui suit.",
     examples:"Fin du couplet de nombreuses chansons pop, fin des phrases dans les sonates de Haydn."},
    {name:'Cadence déceptive',  formula:'V → vi',  chords:[['G','Dom. 7'],['A','Mineures']], color:'#A78BFA',
     feel:"Surprise douce — l'oreille attendait Do et reçoit La mineur.",
     desc:"Le V résout sur vi au lieu de I. La 'tromperie' harmonique la plus agréable.",
     usage:"Pour prolonger une phrase, éviter une fin prématurée, créer une nuance émotionnelle.",
     examples:"Let It Be (Beatles) — bridge. Beethoven Sonate \"Pathétique\" — 2ème mouvement."},
    {name:'Cadence plagale',    formula:'IV → I',  chords:[['F','Majeures'],['C','Majeures']], color:'#85C1E9',
     feel:"Spirituel, sérénité — l'Amen des cathédrales.",
     desc:"Résolution douce sans tension forte. Associée aux hymnes religieux depuis des siècles.",
     usage:"Fins d'hymnes, de ballades douces, de gospel. Pour une conclusion apaisée non dramatique.",
     examples:"Hallelujah (Leonard Cohen) — coda. Yesterday (Beatles) — dernière phrase."},
    {name:'Cadence phrygienne', formula:'i → V/III', chords:[['C','Mineures'],['E','Dom. 7']], color:'#EF4444',
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
      <CourseQuiz questions={QUIZ_QUESTIONS} courseTitle="Cadences" color="#06B6D4" onClose={()=>setShowQuiz(false)}/>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#06B6D4,#A78BFA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Cadences</h3>
        <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(6,182,212,0.15)',border:'1px solid rgba(6,182,212,0.4)',color:'#06B6D4',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
      </div>
      <div style={{padding:'1rem',background:'rgba(6,182,212,0.07)',border:'1px solid rgba(6,182,212,0.2)',borderRadius:12}}>
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
  const M=(word,def,color='#8B5CF6')=><MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>;

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
      <CourseQuiz questions={QUIZ_QUESTIONS} courseTitle="ii-V-I Jazz" color="#8B5CF6" onClose={()=>setShowQuiz(false)}/>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#8B5CF6,#F7DC6F)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>ii-V-I : L'ADN du jazz</h3>
        <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.4)',color:'#8B5CF6',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
      </div>

      <div style={{padding:'1rem',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          La progression {M("ii-V-I","Le ii-V-I est la progression harmonique la plus importante du jazz. Elle représente le mouvement tension→résolution dans sa forme la plus pure. On la retrouve dans 80% des standards jazz. La maîtriser dans les 12 tonalités est l'exercice quotidien de tout jazzman.")} est la colonne vertébrale du jazz. Toutes les ballades, tous les standards de Coltrane, Miles Davis, Bill Evans reposent sur cette progression. Elle concentre le mouvement harmonique fondamental : sous-dominante → dominante → tonique.
        </p>
      </div>

      {/* Visual chord display */}
      <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12}}>
        <div style={{fontSize:10,color:'#8B5CF6',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'.85rem'}}>ii-V-I EN DO MAJEUR</div>
        <div style={{display:'flex',gap:8,marginBottom:'1rem',flexWrap:'wrap'}}>
          {[
            {d:'ii',name:"Dm7",notes:"Ré Fa La Do",color:'#A78BFA',role:'Prépare, s\'éloigne'},
            {d:'V7',name:"G7", notes:"Sol Si Ré Fa",color:'#EF4444',role:'Tension maximale'},
            {d:'Imaj7',name:"Cmaj7",notes:"Do Mi Sol Si",color:'#82E0AA',role:'Résolution, repos'},
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
            style={{flex:1,padding:'.65rem',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.4)',color:'#A78BFA',borderRadius:10,cursor:playing?'default':'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold'}}>
            {playing?'▶ EN COURS…':'▶ ÉCOUTER ii-V-I en Do'}
          </button>
        </div>
      </div>

      {[
        {title:"Pourquoi ça fonctionne ?", color:'#A78BFA',
         content:`Le ii7 (${M("Ré mineur 7","Ré-Fa-La-Do. Il contient la même quinte (Fa-La) que Fa majeur (IV), ce qui explique sa fonction sous-dominante. La 7e Do le relie au I qui suit.","#A78BFA")}) prépare harmoniquement. Le V7 (${M("Sol 7","Sol-Si-Ré-Fa. Il contient le triton Si-Fa. Si veut monter vers Do (sensible), Fa veut descendre vers Mi. Ce double mouvement par demi-ton crée la tension la plus forte possible.","#EF4444")}) crée une tension explosive avec son triton. Le ${M("Imaj7","Do-Mi-Sol-Si. La 7e majeure Si lui donne une couleur rêveuse, suspendue — signature du jazz. Plus sophistiqué que le simple accord de Do.","#82E0AA")} résout et repose.`},
        {title:"Dans les 12 tonalités", color:'#F7DC6F',
         content:"Un musicien de jazz doit jouer ii-V-I dans TOUTES les tonalités. C'est l'exercice de base. En Sol : Am7-D7-Gmaj7. En Fa : Gm7-C7-Fmaj7. En Si♭ : Cm7-F7-B♭maj7. Le cycle des quintes dicte l'ordre d'apprentissage."},
        {title:"La substitution de triton", color:'#EF4444',
         content:"Le triton permet une substitution élégante : G7 remplacé par D♭7. La basse descend par demi-tons (G-G♭-F), créant un mouvement chromatique fluide très apprécié en jazz moderne."},
        {title:"ii-V-I mineur", color:'#C39BD3',
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
  const M=(word,def,color='#10B981')=><MotCle color={color} onClickWord={(w,d)=>{setDefWord(w);setDefText(d);}} definition={def}>{word}</MotCle>;

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
      <CourseQuiz questions={QUIZ_QUESTIONS} courseTitle="Borrowed Chords" color="#10B981" onClose={()=>setShowQuiz(false)}/>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <h3 style={{fontSize:20,fontWeight:'bold',margin:0,background:'linear-gradient(90deg,#10B981,#06B6D4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Borrowed Chords</h3>
        <button onClick={()=>setShowQuiz(true)} style={{padding:'.4rem .85rem',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.4)',color:'#10B981',borderRadius:9,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',flexShrink:0,marginLeft:8}}>🎯 QUIZ</button>
      </div>

      <div style={{padding:'1rem',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:12}}>
        <p style={{fontSize:13.5,lineHeight:1.8,opacity:.82,fontFamily:'Georgia,serif',margin:0}}>
          Les {M("borrowed chords","Un borrowed chord est un accord 'emprunté' à une tonalité parallèle. Do majeur peut emprunter des accords à Do mineur (même tonique, mode différent). Cette technique permet d'enrichir une progression sans modulation complète — juste une 'visite' dans l'ombre.")} sont des accords empruntés au mode {M("parallèle","Le mode parallèle partage la même tonique mais pas les mêmes notes. Do majeur et Do mineur sont parallèles (même Do, mais notes différentes). À ne pas confondre avec le relatif (même notes, tonique différente — Do majeur et La mineur).","#A78BFA")}. Ils introduisent une note chromatique inattendue qui enrichit la couleur sans sortir du contexte tonal. Très utilisés en pop, rock, R&B et jazz moderne.
        </p>
      </div>

      {[
        {title:"♭VII — L'accord de rock", chord:"Si♭ en Do majeur", color:'#EF4444', borrowed:"Do mineur éolien",
         chords:[['C','Majeures'],['Bb','Majeures'],['C','Majeures']],
         desc:"Le Si♭ majeur (♭VII) apporté du mode mineur donne un effet massif, puissant. C'est l'accord signature du rock classique.",
         example:"Sweet Home Alabama — I-♭VII-IV. Hey Jude (Beatles) — ♭VII dans le na-na-na."},
        {title:"iv — La sous-dominante mineure", chord:"Fa mineur en Do majeur", color:'#A78BFA', borrowed:"Do mineur naturel",
         chords:[['C','Majeures'],['F','Majeures'],['F','Mineures'],['C','Majeures']],
         desc:"La progression I-IV-iv-I crée une descente chromatique poignante (Mi→Mi♭). Son effet émotionnel est immédiat et universel.",
         example:"The Beatles - In My Life (pont). Pink Floyd - Comfortably Numb. Très courant en R&B."},
        {title:"♭VI — L'accord cinématique", chord:"La♭ en Do majeur", color:'#8B5CF6', borrowed:"Do mineur naturel",
         chords:[['C','Majeures'],['Ab','Majeures'],['G','Dom. 7'],['C','Majeures']],
         desc:"L'accord ♭VI introduit une couleur sombre et grandiose. Sa résolution vers V puis I crée un effet 'épique' très prisé en musique de film.",
         example:"Hans Zimmer l'utilise constamment. Canon de Pachelbel à l'envers. Nombreuses ballades pop."},
        {title:"♭III — La tierce mineure empruntée", chord:"Mi♭ en Do majeur", color:'#F7DC6F', borrowed:"Do mineur naturel",
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

function TheoriePage() {
  const [section, setSection] = useState('main');
  const [exSub,   setExSub]   = useState(null);
  const [course,  setCourse]  = useState(null);

  const COURSE_TITLES = {
    gammes:"Gammes et modes",intervalles:"Intervalles",accords:"Construction des accords",
    fonctions:"Fonctions harmoniques",cadences:"Cadences",iivi:"ii-V-I Jazz",borrowed:"Borrowed Chords"
  };
  const COURSE_COLORS = {gammes:'#C39BD3',intervalles:'#85C1E9',accords:'#F7DC6F',fonctions:'#F1948A',cadences:'#06B6D4',iivi:'#8B5CF6',borrowed:'#10B981'};

  const CATEGORIES = [
    { title:'Harmonie classique', color:'#C39BD3', icon:'🎼', items:[
      {name:'Gammes et modes',          desc:'Majeur, mineur, modes grecs',         courseId:'gammes'},
      {name:'Intervalles',              desc:'Secondes, tierces, quintes...',        courseId:'intervalles'},
      {name:'Construction des accords', desc:'Triades, accords de 7e',              courseId:'accords'},
      {name:'Fonctions harmoniques',    desc:'Tonique, sous-dominante, dominante',   courseId:'fonctions'},
      {name:'Cadences',                 desc:'Parfaite, rompue, plagale...',          courseId:'cadences'},
      {name:'Modulation',               desc:'Changer de tonalité'},
    ]},
    { title:'Théorie Jazz', color:'#F7DC6F', icon:'🎷', items:[
      {name:"ii-V-I et variations",     desc:"La progression fondamentale du jazz",  courseId:'iivi'},
      {name:"Borrowed chords",          desc:"Emprunter des accords d'autres modes", courseId:'borrowed'},
      {name:"Extensions d'accords",     desc:'9e, 11e, 13e et altérations'},
      {name:'Substitutions',            desc:'Triton, sous-dominante mineure'},
      {name:'Modes appliqués au jazz',  desc:'Dorien, mixolydien, lydien...'},
      {name:'Réharmonisation',          desc:'Enrichir une grille simple'},
    ]},
    { title:'Composition', color:'#85C1E9', icon:'✍', items:[
      {name:'Forme et structure',       desc:'ABA, couplet-refrain, rondo'},
      {name:'Contrepoint',              desc:"Voix indépendantes qui s'harmonisent"},
      {name:'Orchestration',            desc:'Distribuer les voix et timbres'},
    ]},
    { title:'Acoustique musicale', color:'#82E0AA', icon:'🔊', items:[
      {name:'Série harmonique',         desc:'Pourquoi certains accords sonnent bien'},
      {name:'Tempérament égal',         desc:'Comment le piano est accordé'},
      {name:'Résonance et timbre',      desc:'Couleur sonore des instruments'},
    ]},
  ];

  // Course view
  if (course) {
    const courseColor = COURSE_COLORS[course] || '#C39BD3';
    return(
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',background:'rgba(13,11,30,0.8)',flexShrink:0}}>
          <button onClick={()=>setCourse(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,padding:'4px 8px',borderRadius:6,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>← THÉORIE</button>
          <span style={{opacity:.2}}>|</span>
          <span style={{fontSize:11,fontFamily:'monospace',color:courseColor,letterSpacing:'.06em'}}>{COURSE_TITLES[course]?.toUpperCase()}</span>
        </div>
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {course==='gammes'      && <CoursGammesModes/>}
          {course==='intervalles' && <CoursIntervalles/>}
          {course==='accords'     && <CoursConstructionAccords/>}
          {course==='fonctions'   && <CoursFonctionsHarmoniques/>}
          {course==='cadences'    && <CoursCadences/>}
          {course==='iivi'        && <CoursIIVI/>}
          {course==='borrowed'    && <CoursBorrowedChords/>}
        </div>
      </div>
    );
  }

  // Exercices view
  if (section==='exercices') {
    if (exSub) {
      return(
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(255,255,255,0.07)',background:'rgba(13,11,30,0.8)',flexShrink:0}}>
            <button onClick={()=>setExSub(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,padding:'4px 8px',borderRadius:6,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>← EXERCICES THÉORIQUES</button>
            <span style={{opacity:.2}}>|</span>
            <span style={{fontSize:11,fontFamily:'monospace',color:exSub==='solfege'?'#F7DC6F':'#85C1E9',letterSpacing:'.06em'}}>{exSub==='solfege'?'SYMBOLES MUSICAUX':'LECTURE DE PARTITION'}</span>
          </div>
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            {exSub==='solfege' && <SymbolesMusique/>}
            {exSub==='lecture' && <LectureExercice/>}
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
            <p style={{fontSize:11,opacity:.4,fontFamily:'monospace',margin:'2px 0 0'}}>SYMBOLES · LECTURE DE PARTITION</p>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[
            {id:'solfege',icon:'🎵',title:'Symboles Musicaux',sub:'Clés · Silences · Valeurs · Chiffrage · Nuances',color:'#F7DC6F',
             desc:"Apprends à reconnaître tous les symboles d'une partition. 21 symboles classés, exercice d'identification."},
            {id:'lecture',icon:'📖',title:'Lecture de Partition',sub:'Identifier les notes en solfège',color:'#85C1E9',
             desc:"Lis des mélodies sur portée et identifie chaque note. Mélodies fixes et générées aléatoirement."},
          ].map(m=>(
            <button key={m.id} onClick={()=>setExSub(m.id)}
              style={{background:`${m.color}08`,border:`1.5px solid ${m.color}`,borderRadius:14,padding:'1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 20px ${m.color}`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}`;e.currentTarget.style.borderColor=`${m.color}`;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <span style={{fontSize:28}}>{m.icon}</span>
                <div>
                  <div style={{fontSize:15,fontWeight:'bold',color:m.color,fontFamily:'Georgia,serif',marginBottom:4}}>{m.title}</div>
                  <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',letterSpacing:'.04em',marginBottom:6}}>{m.sub}</div>
                  <p style={{fontSize:12,opacity:.6,margin:0,lineHeight:1.55,fontFamily:'Georgia,serif'}}>{m.desc}</p>
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
      <div style={{marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Théorie Musicale</h2>
        <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>COMPRENDRE LA MUSIQUE EN PROFONDEUR</p>
      </div>

      {/* Exercices théoriques button */}
      <button onClick={()=>setSection('exercices')}
        style={{width:'100%',marginBottom:'1.5rem',background:'linear-gradient(135deg,rgba(247,220,111,0.15),rgba(133,193,233,0.1))',border:'1.5px solid rgba(247,220,111,0.4)',borderRadius:14,padding:'1rem 1.25rem',cursor:'pointer',textAlign:'left',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',display:'flex',alignItems:'center',justifyContent:'space-between'}}
        onMouseEnter={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(247,220,111,0.22),rgba(133,193,233,0.16))';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(247,220,111,0.2)';}}
        onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(247,220,111,0.15),rgba(133,193,233,0.1))';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span style={{fontSize:26}}>🎓</span>
          <div>
            <div style={{fontSize:15,fontWeight:'bold',color:'#F7DC6F',fontFamily:'Georgia,serif',marginBottom:2}}>Exercices Théoriques</div>
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
                    onMouseEnter={e=>{if(hasCourse)e.currentTarget.style.background=`${cat.color}`;}}
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
  {id:'accords',   icon:'♩',  title:'Répertoire', subtitle:'ACCORDS · PARTITIONS · GRILLES · IMPRO', color:'#C39BD3'},
  {id:'oreille',   icon:'👂', title:'Oreille',     subtitle:'INTERVALLES · ACCORDS · MÉLODIE',        color:'#85C1E9'},
  {id:'exercices', icon:'✎',  title:'Technique',   subtitle:'DICTÉE · CYCLE · TRANSPOSITION · IMPRO', color:'#82E0AA'},
  {id:'theorie',   icon:'📖', title:'Théorie',      subtitle:'HARMONIE · JAZZ · COMPOSITION',           color:'#F7DC6F'},
  {id:'harmonie',  icon:'🏛',  title:'Harmonie',    subtitle:'CONSTRUIRE · ANALYSER · COMPRENDRE',      color:'#AED6F1'},
];

// ══════════════════════════════════════════════════════════════════════════════
// ── COIN DE L'HARMONIE ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const HARMONIC_CONCEPTS = [
  { title:"La fonction dominante", color:"#F7DC6F", icon:"⚡",
    text:"L'accord de dominante (V) contient une tension naturelle qui veut se résoudre sur la tonique (I). Cette tension vient de la triton entre la sensible et la 7e de dominante. C'est le moteur de toute la musique tonale.",
    example:"G7 → C : la note B monte vers C, la note F descend vers E." },
  { title:"Le ii-V-I en jazz", color:"#85C1E9", icon:"🎷",
    text:"La progression ii-V-I (ex: Dm7 → G7 → Cmaj7) est omniprésente en jazz. Le ii prépare le V, le V crée la tension, le I résout. Comprendre cette mécanique te permet de naviguer dans toutes les tonalités.",
    example:"En Sol : Am7 → D7 → Gmaj7" },
  { title:"Les accords empruntés", color:"#C39BD3", icon:"🔄",
    text:"Un accord emprunté vient d'une tonalité parallèle. En Do majeur, l'accord fm (emprunté au Do mineur) donne une couleur doux-amer très expressif. C'est le 'borrowed chord' des musiciens anglais.",
    example:"C → F → fm → C : le fm crée un moment de flottement entre la chaleur et la mélancolie." },
  { title:"La substitution de triton", color:"#F1948A", icon:"↔",
    text:"Tout accord de dominante peut être remplacé par l'accord dont la fondamentale est un triton (6 demi-tons) plus haut. En Do : G7 peut être remplacé par Db7. Les deux ont la même titon (B-F / Cb-F) et la même fonction.",
    example:"Dm7 → Db7 → Cmaj7 (substitution du G7 par Db7)" },
  { title:"Les cadences", color:"#82E0AA", icon:"🎼",
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
      background:'linear-gradient(160deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 50%, transparent 100%)',
      borderBottom:'1px solid rgba(255,255,255,0.07)',
      marginBottom:'1.25rem',
      position:'relative',overflow:'hidden',
    }}>
      {/* Decorative orb */}
      <div style={{position:'absolute',top:-40,right:-30,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-20,left:-20,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',pointerEvents:'none'}}/>
      <h2 style={{
        fontSize:28, fontWeight:'bold', marginBottom:'.85rem',
        letterSpacing:'-.03em',
        background:'linear-gradient(90deg, #A78BFA, #60A5FA)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
      }}>Apprentissage</h2>
      <p style={{
        fontSize:12.5, lineHeight:1.7,
        color:'rgba(255,255,255,0.55)',
        fontFamily:'Georgia,serif', fontStyle:'italic',
        margin:0, paddingLeft:'.9rem',
        borderLeft:'2.5px solid rgba(139,92,246,0.6)',
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
    {showCatTip && <CategoryTipPopup category={showCatTip} color={info?.color||'#C39BD3'} onClose={handleCloseCatTip}/>}
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
  const [journal, setJournal] = useState(loadJournal);
  const [goals, setGoals]     = useState(loadGoals);
  const [editGoals, setEditGoals] = useState(false);
  const [todayMins, setTodayMins] = useState('');
  const [todayNote, setTodayNote] = useState('');

  const today = todayStr();

  const addEntry = () => {
    const mins = parseInt(todayMins);
    if (!mins || mins < 1) return;
    const entry = { mins, note: todayNote, ts: Date.now() };
    const existing = journal[today] || [];
    const updated = { ...journal, [today]: [...existing, entry] };
    setJournal(updated); saveJournal(updated);
    setTodayMins(''); setTodayNote('');
  };

  // Compute weekly and total stats
  const now = new Date();
  const weekDays = Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-i);return d.toISOString().slice(0,10);}).reverse();
  const weekMins = weekDays.reduce((acc,d)=>acc+(journal[d]||[]).reduce((s,e)=>s+e.mins,0),0);
  const totalMins = Object.values(journal).reduce((acc,entries)=>acc+entries.reduce((s,e)=>s+e.mins,0),0);
  const todayTotalMins = (journal[today]||[]).reduce((s,e)=>s+e.mins,0);

  const weekPct  = Math.min(100, Math.round((weekMins/goals.weeklyMins)*100));
  const totalPct = Math.min(100, Math.round((totalMins/goals.longTermMins)*100));

  const fmt = (m) => m>=60?`${Math.floor(m/60)}h${m%60>0?` ${m%60}min`:''}`:`${m} min`;

  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem'}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Journal de pratique</h2>
          <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>SUIS TA PROGRESSION QUOTIDIENNE</p>
        </div>
        <button onClick={()=>setEditGoals(v=>!v)} style={{background:editGoals?'rgba(133,193,233,0.15)':'transparent',border:`0.5px solid ${editGoals?'#85C1E9':'rgba(240,235,224,0.2)'}`,color:editGoals?'#85C1E9':'rgba(240,235,224,0.45)',padding:'.35rem .7rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',transition:'all 0.2s'}}>
          ⚙ OBJECTIFS
        </button>
      </div>

      {/* Edit goals */}
      {editGoals && (
        <div style={{background:'rgba(133,193,233,0.05)',border:'0.5px solid rgba(133,193,233,0.15)',borderRadius:4,padding:'1rem',marginBottom:'1.25rem',animation:'fadeIn 0.3s ease'}}>
          <div style={{fontSize:10,color:'#85C1E9',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'1rem'}}>OBJECTIFS DE PRATIQUE</div>
          {[
            {label:'Objectif hebdomadaire (minutes)',key:'weeklyMins',hint:'Ex: 150 = 5 sessions de 30 min'},
            {label:'Objectif long terme (minutes)',  key:'longTermMins',hint:'Ex: 3000 ≈ 50 heures'},
          ].map(({label,key,hint})=>(
            <div key={key} style={{marginBottom:'.75rem'}}>
              <div style={{fontSize:10,opacity:.5,fontFamily:'monospace',marginBottom:'.35rem'}}>{label.toUpperCase()}</div>
              <input type="number" value={goals[key]} onChange={e=>{const g={...goals,[key]:parseInt(e.target.value)||0};setGoals(g);saveGoals(g);}}
                style={{width:'100%',background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.2)',borderRadius:2,padding:'.5rem .75rem',color:'#f0ebe0',fontFamily:'monospace',fontSize:13,outline:'none'}}/>
              <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',marginTop:3}}>{hint}</div>
            </div>
          ))}
        </div>
      )}

      {/* Objectives progress */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:'1.5rem'}}>
        {[
          {label:'Cette semaine', cur:weekMins,  max:goals.weeklyMins,  color:'#85C1E9'},
          {label:'Long terme',    cur:totalMins, max:goals.longTermMins, color:'#C39BD3'},
        ].map(({label,cur,max,color})=>{
          const p=Math.min(100,Math.round((cur/max)*100));
          return (
            <div key={label} style={{background:'rgba(240,235,224,0.03)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4,padding:'.85rem'}}>
              <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',marginBottom:'.5rem'}}>{label.toUpperCase()}</div>
              <div style={{fontSize:18,fontWeight:'bold',color,fontFamily:'Georgia,serif',lineHeight:1,marginBottom:2}}>{fmt(cur)}</div>
              <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',marginBottom:'.5rem'}}>/ {fmt(max)} · {p}%</div>
              <div style={{height:4,background:'rgba(240,235,224,0.07)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${p}%`,background:color,borderRadius:2,transition:'width 0.8s ease'}}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add today's session */}
      <div style={{marginBottom:'1.5rem',padding:'1rem',background:'rgba(240,235,224,0.025)',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:4}}>
        <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.75rem'}}>
          AJOUTER UNE SESSION — AUJOURD'HUI {todayTotalMins>0?`(${fmt(todayTotalMins)} enregistrées)`:''}</div>
        <div style={{display:'flex',gap:8,marginBottom:'.6rem'}}>
          <input type="number" placeholder="Durée (min)" value={todayMins} onChange={e=>setTodayMins(e.target.value)}
            style={{flex:'0 0 110px',background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.2)',borderRadius:2,padding:'.5rem .75rem',color:'#f0ebe0',fontFamily:'monospace',fontSize:12,outline:'none'}}/>
          <input type="text" placeholder="Note optionnelle (ex: gammes, accords...)" value={todayNote} onChange={e=>setTodayNote(e.target.value)}
            style={{flex:1,background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.2)',borderRadius:2,padding:'.5rem .75rem',color:'#f0ebe0',fontFamily:'Georgia,serif',fontSize:12,outline:'none'}}/>
        </div>
        <button onClick={addEntry} disabled={!todayMins||parseInt(todayMins)<1}
          style={{width:'100%',padding:'.65rem',background:todayMins?'rgba(130,224,170,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${todayMins?'#82E0AA':'rgba(240,235,224,0.1)'}`,color:todayMins?'#82E0AA':'rgba(240,235,224,0.25)',borderRadius:2,cursor:todayMins?'pointer':'not-allowed',fontSize:11,fontFamily:'monospace',letterSpacing:'.1em',transition:'all 0.2s'}}>
          + ENREGISTRER LA SESSION
        </button>
      </div>

      {/* Week calendar */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.75rem'}}>CETTE SEMAINE</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
          {weekDays.map(d=>{
            const mins=(journal[d]||[]).reduce((s,e)=>s+e.mins,0);
            const isToday=d===today;
            const intensity=Math.min(1,mins/60);
            return (
              <div key={d} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                <div style={{fontSize:8,opacity:.35,fontFamily:'monospace'}}>{['D','L','M','M','J','V','S'][new Date(d+'T12:00:00').getDay()]}</div>
                <div style={{width:'100%',aspectRatio:'1',borderRadius:3,background:mins>0?`rgba(130,224,170,${0.15+intensity*0.6})`:'rgba(240,235,224,0.05)',border:isToday?'1px solid rgba(130,224,170,0.5)':'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {mins>0&&<span style={{fontSize:7,fontFamily:'monospace',color:'#82E0AA'}}>{mins}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent entries */}
      {Object.entries(journal).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7).map(([date,entries])=>(
        <div key={date} style={{marginBottom:'.65rem'}}>
          <div style={{fontSize:9,opacity:.35,fontFamily:'monospace',marginBottom:'.3rem'}}>{date}{date===today?' (aujourd\'hui)':''} — {fmt(entries.reduce((s,e)=>s+e.mins,0))}</div>
          {entries.map((e,i)=>(
            <div key={i} style={{padding:'.45rem .75rem',background:'rgba(240,235,224,0.025)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:3,marginBottom:3,display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:11,fontFamily:'monospace',color:'#82E0AA',flexShrink:0}}>{e.mins} min</span>
              {e.note&&<span style={{fontSize:11,opacity:.5,fontFamily:'Georgia,serif'}}>{e.note}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Compétences Page ──────────────────────────────────────────────────────────
function CompetencesPage({skills,instrument,setInstrument,stats,onNavigate}){
  const [editGoals, setEditGoals] = useState(false);
  const streak = computeStreak(stats);
  const streakColor = streak>=7?'#F59E0B':streak>=3?'#82E0AA':'#A78BFA';

  const WEEKLY_GOAL_DEFS = [
    {id:'oreille',     label:'Exercices Oreille',   icon:'👂', color:'#85C1E9', target:3},
    {id:'technique',   label:'Sessions Technique',  icon:'✎',  color:'#82E0AA', target:3},
    {id:'theorie',     label:'Sessions Théorie',    icon:'📖', color:'#F7DC6F', target:2},
    {id:'harmonie',    label:'Sessions Harmonie',   icon:'🎷', color:'#F1948A', target:1},
  ];

  const STAT_CARDS=[
    {label:'Temps de jeu', value:formatTime(stats.totalSeconds), icon:'⏱', grad:'linear-gradient(135deg,#8B5CF6,#6D28D9)', glow:'139,92,246'},
    {label:'Exercices',    value:stats.totalExercises||0,         icon:'✓',  grad:'linear-gradient(135deg,#06B6D4,#0284C7)', glow:'6,182,212'},
    {label:'Sessions',     value:stats.sessionsCount||0,          icon:'◈',  grad:'linear-gradient(135deg,#10B981,#047857)', glow:'16,185,129'},
    {label:'Clés',         value:`🗝️ ${stats.keys||0}`,           icon:'🗝️', grad:'linear-gradient(135deg,#F59E0B,#D97706)', glow:'245,158,11'},
  ];
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>

    {/* Streak banner */}
    {streak>0 && (
      <div style={{marginBottom:'1.25rem',padding:'1rem 1.25rem',background:streak>=7?'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(239,68,68,0.1))':streak>=3?'linear-gradient(135deg,rgba(130,224,170,0.12),rgba(6,182,212,0.08))':'rgba(255,255,255,0.04)',border:`1px solid ${streakColor}`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
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
          <button onClick={()=>{onNavigate&&onNavigate('apprentissage');setEditGoals(false);}} style={{padding:'.45rem .9rem',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.35)',color:'#A78BFA',borderRadius:8,cursor:'pointer',fontSize:11,fontFamily:'monospace'}}>Aller pratiquer →</button>
        </div>
      )}
    </div>

    {/* Instrument selector */}
    <div style={{marginBottom:'1.5rem'}}>
      <div style={{fontSize:10,letterSpacing:'.2em',opacity:.4,fontFamily:'monospace',marginBottom:'.65rem'}}>INSTRUMENT</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{INSTRUMENTS.map(inst=>{
        const isA=instrument===inst.id;
        return(<button key={inst.id} onClick={()=>inst.available&&setInstrument(inst.id)}
          style={{background:isA?'linear-gradient(135deg,#8B5CF6,#6D28D9)':'rgba(255,255,255,0.05)',
            border:`1.5px solid ${isA?'transparent':'rgba(255,255,255,0.1)'}`,
            color:!inst.available?'rgba(255,255,255,0.2)':'#fff',
            padding:'.5rem 1rem',borderRadius:12,cursor:inst.available?'pointer':'not-allowed',
            fontFamily:'monospace',fontSize:11,transition:'all 0.2s',display:'flex',alignItems:'center',gap:6,
            boxShadow:isA?'0 4px 16px rgba(139,92,246,0.4)':'none'}}>
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

    <div style={{padding:'1rem',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:12}}>
      <div style={{fontSize:10,color:'#A78BFA',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.4rem'}}>PROCHAINEMENT</div>
      <p style={{fontSize:12,opacity:.5,lineHeight:1.6,fontFamily:'Georgia,serif',margin:0}}>Historique des sessions, accords maîtrisés, intervalles reconnus, progression hebdomadaire...</p>
    </div>
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
      <div style={{fontSize:10,color:'#82E0AA',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'1rem'}}>🎵 MÉTRONOME</div>

      {/* Beat visualizer */}
      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:'1.25rem'}}>
        {[...Array(timeSign)].map((_,i)=>(
          <div key={i} style={{width:36,height:36,borderRadius:8,background:running&&beat===i?(i===0&&accent?'#F7DC6F':'#82E0AA'):'rgba(255,255,255,0.08)',border:`1.5px solid ${running&&beat===i?(i===0&&accent?'#F7DC6F':'#82E0AA'):'rgba(255,255,255,0.15)'}`,transition:'all 0.05s',transform:running&&beat===i?'scale(1.1)':'scale(1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'monospace',color:'rgba(255,255,255,0.4)'}}>{i+1}</div>
        ))}
      </div>

      {/* BPM */}
      <div style={{marginBottom:'1rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,opacity:.45,fontFamily:'monospace',letterSpacing:'.1em'}}>TEMPO</span>
          <span style={{fontSize:18,fontWeight:'bold',fontFamily:'monospace',color:'#82E0AA'}}>{bpm} <span style={{fontSize:11,opacity:.5}}>BPM</span></span>
        </div>
        <input type="range" min={30} max={200} value={bpm} onChange={e=>setBpm(+e.target.value)} style={{width:'100%',accentColor:'#82E0AA'}}/>
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
              <button key={n} onClick={()=>setTimeSign(n)} style={{flex:1,padding:'.45rem',background:timeSign===n?'rgba(130,224,170,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${timeSign===n?'#82E0AA':'rgba(255,255,255,0.12)'}`,borderRadius:7,cursor:'pointer',color:timeSign===n?'#82E0AA':'rgba(255,255,255,0.5)',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>{n}/4</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',marginBottom:5}}>ACCENT</div>
          <button onClick={()=>setAccent(v=>!v)} style={{padding:'.45rem .8rem',background:accent?'rgba(247,220,111,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${accent?'#F7DC6F':'rgba(255,255,255,0.12)'}`,borderRadius:7,cursor:'pointer',color:accent?'#F7DC6F':'rgba(255,255,255,0.4)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>
            {accent?'ON':'OFF'}
          </button>
        </div>
      </div>

      <button onClick={running?stop:start}
        style={{width:'100%',padding:'.85rem',background:running?'rgba(241,148,138,0.15)':'rgba(130,224,170,0.15)',border:`1.5px solid ${running?'#F1948A':'#82E0AA'}`,color:running?'#F1948A':'#82E0AA',borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.3s'}}>
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
        <div style={{fontSize:10,color:'#A78BFA',fontFamily:'monospace',letterSpacing:'.12em',marginBottom:'1rem'}}>TA PROGRESSION</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:'1rem'}}>
          {[
            {label:'Sessions totales',  value:stats.sessionsCount||0,   color:'#85C1E9'},
            {label:'Exercices faits',   value:stats.totalExercises||0,  color:'#82E0AA'},
            {label:'Temps de pratique', value:formatTime(stats.totalSeconds), color:'#8B5CF6'},
            {label:'Série actuelle',    value:streak>0?`${streak} 🔥`:'—', color:'#F7DC6F'},
          ].map((s,i)=>(
            <div key={i} style={{padding:'.85rem',background:`${s.color}10`,border:`1px solid ${s.color}25`,borderRadius:12,textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',marginBottom:4}}>{s.value}</div>
              <div style={{fontSize:9,opacity:.5,fontFamily:'monospace',letterSpacing:'.04em'}}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{padding:'.85rem',background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:10}}>
          <div style={{fontSize:10,color:'#A78BFA',fontFamily:'monospace',marginBottom:4}}>BIENTÔT</div>
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
export default function ChordApp(){
  const [page,setPage]=useState('competences');
  const [apprentissageSub,setApprentiassageSub]=useState('landing');
  const [skills]=useState(INITIAL_SKILLS);
  const [instrument,setInstrument]=useState('piano');
  const [tipIndex,setTipIndex]=useState(0);
  const [showTip,setShowTip]=useState(false);
  const [showDefis,setShowDefis]=useState(false);
  const [stats,setStats]=useState(()=>resetDailyIfNeeded(loadStats()));
  const [themeId,setThemeId]=useState(()=>{ try{return localStorage.getItem('cs_theme')||'cosmos';}catch{return'cosmos';} });
  const [pageKey,setPageKey]=useState(0);
  const theme = THEMES[themeId] || THEMES.cosmos;

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

  const NAV=[{id:'competences',label:'Compétences',icon:'◈'},{id:'apprentissage',label:'Apprentissage',icon:'✦'},{id:'journal',label:'Journal',icon:'📅'},{id:'partage',label:'Partage',icon:'↗'}];
  const NC={competences:'#C39BD3',apprentissage:'#85C1E9',journal:'#82E0AA',partage:'#F7DC6F'};
  const keys=stats.keys||0;
  const streak=computeStreak(stats);
  const streakColor = streak>=7?'#F59E0B':streak>=3?'#82E0AA':'rgba(255,255,255,0.5)';

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
      ${theme.css||''}
    `}</style>

    {/* Background orbs */}
    <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
      <div style={{position:'absolute',top:'-15%',left:'-10%',width:420,height:420,borderRadius:'50%',background:`radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)`,animation:'orbFloat 12s ease-in-out infinite'}}/>
      <div style={{position:'absolute',bottom:'-10%',right:'-8%',width:380,height:380,borderRadius:'50%',background:`radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)`,animation:'orbFloat 16s ease-in-out infinite reverse'}}/>
      <div style={{position:'absolute',top:'40%',right:'-5%',width:260,height:260,borderRadius:'50%',background:`radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)`,animation:'orbFloat 10s ease-in-out infinite 3s'}}/>
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
          background:showDefis?'rgba(245,158,11,0.2)':theme.surface,
          border:`1px solid ${showDefis?'rgba(245,158,11,0.5)':theme.border}`,
          color:showDefis?'#FBBF24':theme.textMuted,
          padding:'.28rem .7rem',borderRadius:9,cursor:'pointer',fontSize:11,
          fontFamily:'monospace',letterSpacing:'.06em',transition:'all 0.2s'}}>
          <span style={{fontSize:12}}>🗝️</span>
          <span style={{fontWeight:'bold'}}>{keys}</span>
        </button>
        {/* Conseil */}
        <button onClick={()=>setShowTip(v=>!v)} style={{
          background:showTip?'rgba(245,158,11,0.15)':theme.surface,
          border:`1px solid ${showTip?'rgba(245,158,11,0.4)':theme.border}`,
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
      </div>
    </div>

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
