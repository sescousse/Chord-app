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
const DEF_STATS={totalExercises:0,totalSeconds:0,sessionsCount:0,keys:0,todayDate:'',todayExercises:0,todayLibViews:0,todaySections:0,lastPerfect:'',lastIntervalDay:'',lastChordEarDay:'',completedChallenges:[]};
const loadStats=()=>{try{return{...DEF_STATS,...JSON.parse(localStorage.getItem(STATS_KEY)||'{}')};}catch{return{...DEF_STATS};}};
const saveStats=s=>{try{localStorage.setItem(STATS_KEY,JSON.stringify(s));}catch{}};
function formatTime(s){if(!s||s<60)return'0 min';const m=Math.floor(s/60);if(m<60)return`${m} min`;const h=Math.floor(m/60),r=m%60;return r>0?`${h}h ${r}min`:`${h}h`;}
function todayStr(){return new Date().toISOString().slice(0,10);}
function resetDailyIfNeeded(stats){
  const today=todayStr();
  if(stats.todayDate!==today) return{...stats,todayDate:today,todayExercises:0,todayLibViews:0,todaySections:0};
  return stats;
}

// Module-level updater
let _updater=null;
function updateStats(fn){if(_updater)_updater(fn);}
function notifyExerciseDone(count,type,perfect){
  updateStats((s,today)=>{
    let n={...s,totalExercises:(s.totalExercises||0)+count,sessionsCount:(s.sessionsCount||0)+1,todayExercises:(s.todayExercises||0)+count};
    if(perfect)n={...n,lastPerfect:today};
    if(type==='interval')n={...n,lastIntervalDay:today};
    if(type==='chord_ear')n={...n,lastChordEarDay:today};
    return n;
  });
}
function notifyLibraryView(){updateStats((s)=>({...s,todayLibViews:(s.todayLibViews||0)+1}));}
function notifySectionVisit(){updateStats((s)=>({...s,todaySections:(s.todaySections||0)+1}));}

// Timer
let _sessionStart=Date.now(),_timeUpdater=null;
function commitTime(){const secs=Math.floor((Date.now()-_sessionStart)/1000);_sessionStart=Date.now();if(_timeUpdater&&secs>5)_timeUpdater(secs);}

// ── Audio ─────────────────────────────────────────────────────────────────────
let _audioCtx=null;
function getACtx(){if(!_audioCtx)_audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(_audioCtx.state==='suspended')_audioCtx.resume();return _audioCtx;}
function playNote(semi,delay=0,dur=1.8){try{const ctx=getACtx(),freq=261.63*Math.pow(2,semi/12),t=ctx.currentTime+delay;[[1,.45],[2,.12],[3,.07],[4,.03]].forEach(([h,g])=>{const o=ctx.createOscillator(),gn=ctx.createGain();o.connect(gn);gn.connect(ctx.destination);o.frequency.value=freq*h;o.type='sine';gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+.008);gn.gain.exponentialRampToValueAtTime(.001,t+dur);o.start(t);o.stop(t+dur+.05);});}catch{}}
const playSeq=(n1,n2)=>{playNote(n1);playNote(n2,1.1);};
const playSimul=(n1,n2)=>{playNote(n1,0,2);playNote(n2,0,2);};
const playChordArp=ns=>ns.forEach((s,i)=>playNote(s,i*.1,2.2));
const playChordSimul=ns=>ns.forEach(s=>playNote(s,0,2.5));

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
      <div style={{width:'min(420px,92vw)',background:'#161512',border:`0.5px solid ${color}40`,borderRadius:6,padding:'1.25rem',animation:'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 8px 40px rgba(0,0,0,0.6)'}}>
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
            <button onClick={()=>setIdx(i=>i+1)} style={{flex:1,padding:'.55rem',background:`${color}15`,border:`0.5px solid ${color}50`,color,borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.1em',transition:'all 0.2s'}}>
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
                    style={{background:`${c}12`,border:`0.5px solid ${c}50`,color:c,padding:'.65rem .25rem',borderRadius:3,cursor:'pointer',fontSize:14,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c}25`;e.currentTarget.style.transform='scale(1.04)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${c}12`;e.currentTarget.style.transform='scale(1)';}}>
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
                    style={{background:`${c}10`,border:`0.5px solid ${c}40`,color:c,padding:'.7rem .5rem',borderRadius:3,cursor:'pointer',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c}22`;e.currentTarget.style.transform='scale(1.02)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${c}10`;e.currentTarget.style.transform='scale(1)';}}>
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
        {items.map(item=>{const on=selected.has(item.id);return(<button key={item.id} onClick={()=>onToggle(item.id)} style={{background:on?`${item.color}15`:'rgba(240,235,224,0.02)',border:`0.5px solid ${on?item.color:'rgba(240,235,224,0.1)'}`,borderRadius:3,padding:'.6rem .75rem',cursor:'pointer',display:'flex',alignItems:'center',gap:8,textAlign:'left',transition:'all 0.2s'}}>
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
          <div style={{textAlign:'center'}}><div style={{width:54,height:54,borderRadius:'50%',background:answered?(iv?`${iv.color}22`:'rgba(240,235,224,0.05)'):'rgba(240,235,224,0.05)',border:`1px solid ${answered?(iv?.color||'rgba(240,235,224,0.3)'):'rgba(240,235,224,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:answered?17:22,fontWeight:'bold',color:answered?(iv?.color||'#f0ebe0'):'rgba(240,235,224,0.15)',fontFamily:'monospace',margin:'0 auto 5px',transition:'all 0.3s'}}>{answered?(ex?NM[ex.note2%12]:'—'):'?'}</div><div style={{fontSize:9,opacity:.3,fontFamily:'monospace'}}>{answered&&ex?semiToName(ex.note2):''}</div></div>
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
          {selIvs.map(i=>{const isU=userSemi===i.semi,isOk=i.semi===ex?.intSemi;let bg='rgba(240,235,224,0.03)',b='rgba(240,235,224,0.1)',col='rgba(240,235,224,0.7)';if(answered){if(isOk){bg=`${i.color}20`;b=i.color;col=i.color;}else if(isU){bg='rgba(241,148,138,0.1)';b='#F1948A';col='#F1948A';}else col='rgba(240,235,224,0.2)';}return(<button key={i.semi} onClick={()=>handleAnswer(i.semi)} disabled={answered} style={{background:bg,border:`0.5px solid ${b}`,color:col,padding:'.65rem .25rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold',letterSpacing:'.02em',transition:'all 0.2s',lineHeight:1.3}}>{i.name}</button>);})}
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
          {selTypes.map(([type,{label}])=>{const isU=userType===type,isOk=type===ex?.type,tc=CHORD_COLORS[type]||'#C39BD3';let bg='rgba(240,235,224,0.03)',b='rgba(240,235,224,0.1)',col='rgba(240,235,224,0.7)';if(answered){if(isOk){bg=`${tc}20`;b=tc;col=tc;}else if(isU){bg='rgba(241,148,138,0.1)';b='#F1948A';col='#F1948A';}else col='rgba(240,235,224,0.2)';}return(<button key={type} onClick={()=>handleAnswer(type)} disabled={answered} style={{background:bg,border:`0.5px solid ${b}`,color:col,padding:'.7rem .5rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>);})}
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
              style={{background:difficulty.id===d.id?`${d.color}15`:'rgba(255,255,255,0.03)',border:`1.5px solid ${difficulty.id===d.id?d.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.85rem 1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
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
            <button key={v} onClick={()=>setTempoFactor(v)} style={{flex:1,padding:'.55rem',background:tempoFactor===v?`${difficulty.color}18`:'transparent',border:`1px solid ${tempoFactor===v?difficulty.color:'rgba(255,255,255,0.12)'}`,borderRadius:8,cursor:'pointer',color:tempoFactor===v?difficulty.color:'rgba(255,255,255,0.45)',fontSize:11,fontFamily:'monospace',transition:'all 0.2s'}}>{label}</button>
          ))}
        </div>
      </div>
      <button onClick={()=>{setRound(0);setScore({correct:0,total:0});startRound(difficulty);}}
        style={{width:'100%',padding:'1rem',background:`${difficulty.color}18`,border:`1.5px solid ${difficulty.color}`,color:difficulty.color,borderRadius:12,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
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
        <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}30`,borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS</div>
          <div style={{fontSize:68,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/5</span></div>
          <div style={{fontSize:20,color:mc,marginTop:4}}>{pct}%</div>
          <div style={{fontSize:13,opacity:.5,fontFamily:'Georgia,serif',marginTop:8}}>{pct>=80?'Excellent ! Ton oreille est affûtée 🎉':pct>=50?'Bien joué, continue !':'Entraîne-toi encore !'}</div>
        </div>
        <button onClick={()=>{setRound(0);setScore({correct:0,total:0});startRound(difficulty);}}
          style={{padding:'.9rem',background:`${difficulty.color}15`,border:`1.5px solid ${difficulty.color}`,color:difficulty.color,borderRadius:10,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold'}}>
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
              background:i<currentNoteIdx?difficulty.color:i===currentNoteIdx?`${difficulty.color}60`:'rgba(255,255,255,0.1)',
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
        <div style={{padding:'1.25rem',background:`${style?.color||'#8B5CF6'}12`,border:`1px solid ${style?.color||'#8B5CF6'}35`,borderRadius:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
            <div style={{fontSize:18,fontWeight:'bold',color:style?.color||'#8B5CF6',fontFamily:'Georgia,serif'}}>{style?.label} — {key}</div>
            <button onClick={generate} style={{padding:'.4rem .85rem',background:`${style?.color||'#8B5CF6'}20`,border:`1px solid ${style?.color||'#8B5CF6'}`,color:style?.color||'#8B5CF6',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🎲 NOUVEAU</button>
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
              return <div key={i} style={{width:38,height:38,borderRadius:'50%',background:`${nc}20`,border:`1.5px solid ${nc}60`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:'bold',color:nc,fontFamily:'monospace'}}>{n}</div>;
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
              return <div key={ci} style={{padding:'.55rem .8rem',background:`${nc}15`,border:`1.5px solid ${nc}50`,borderRadius:10,textAlign:'center'}}>
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
            style={{background:style?.id===s.id?`${s.color}15`:'rgba(255,255,255,0.03)',border:`1.5px solid ${style?.id===s.id?s.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.85rem 1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${s.color}10`;e.currentTarget.style.borderColor=`${s.color}50`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=style?.id===s.id?`${s.color}15`:'rgba(255,255,255,0.03)';e.currentTarget.style.borderColor=style?.id===s.id?s.color:'rgba(255,255,255,0.1)';}}>
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

function OreilPage(){
  const [sub,setSub]=useState(null);
  if(sub==='intervalles') return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><IntervallesSection onBack={()=>setSub(null)}/></div>);
  if(sub==='accords')     return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><AccordOreilleSection onBack={()=>setSub(null)}/></div>);
  if(sub==='melodie')     return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><MelodieSection onBack={()=>setSub(null)}/></div>);
  if(sub==='absolue')     return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><OreilleAbsolue onBack={()=>setSub(null)}/></div>);

  const MODS=[
    {id:'intervalles', icon:'🎵', title:'Intervalles',    subtitle:'IDENTIFIER LES DISTANCES',    color:'#85C1E9', ok:true},
    {id:'accords',     icon:'🎹', title:'Accords',         subtitle:"IDENTIFIER À L'OREILLE",      color:'#C39BD3', ok:true},
    {id:'melodie',     icon:'🎼', title:'Mélodie',         subtitle:'DICTÉE MÉLODIQUE',             color:'#82E0AA', ok:true},
    {id:'absolue',     icon:'👁', title:'Oreille Absolue', subtitle:'ÉCOUTER ET REPRODUIRE',        color:'#A78BFA', ok:true},
  ];
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    <div style={{marginBottom:'1.5rem'}}><h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Oreille Musicale</h2><p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>DÉVELOPPE TON OREILLE PAR L'ÉCOUTE ACTIVE</p></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
      {MODS.map(m=>(<button key={m.id} onClick={()=>setSub(m.id)} style={{background:`${m.color}08`,border:`1px solid ${m.color}40`,borderRadius:14,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
        onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}15`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-2px)';}}
        onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}08`;e.currentTarget.style.borderColor=`${m.color}40`;e.currentTarget.style.transform='translateY(0)';}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><span style={{fontSize:26}}>{m.icon}</span><span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}50`,padding:'2px 5px',borderRadius:6}}>DISPONIBLE</span></div>
        <div><div style={{fontSize:14,fontWeight:'bold',marginBottom:3,color:m.color,fontFamily:'Georgia,serif'}}>{m.title}</div><div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.04em'}}>{m.subtitle}</div></div>
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
const LECTURE_MELODIES = [
  { id:1, title:"Gamme ascendante",    desc:"Les 8 notes fondamentales en montant",     notes:['C4','D4','E4','F4','G4','A4','B4','C5'] },
  { id:2, title:"Gamme descendante",   desc:"Les 8 notes fondamentales en descendant",  notes:['C5','B4','A4','G4','F4','E4','D4','C4'] },
  { id:3, title:"Mélodie conjointe",   desc:"Notes qui se suivent progressivement",     notes:['E4','F4','G4','A4','G4','F4','E4','D4'] },
  { id:4, title:"Arpège de Do majeur", desc:"Les notes de l'accord de Do",              notes:['C4','E4','G4','C5','G4','E4','C4'] },
  { id:5, title:"Au clair de la lune", desc:"Mélodie traditionnelle (domaine public)",  notes:['C5','C5','C5','D5','E5','D5','C5'] },
  { id:6, title:"Mélodie sautée",      desc:"Sauts d'intervalles plus larges",          notes:['C4','G4','E4','A4','F4','B4','G4','C5'] },
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
            <div key={ci} style={{padding:'.45rem .75rem',borderRadius:8,background:isActive?`${nc}28`:`${nc}10`,border:`1px solid ${isActive?nc:nc+'40'}`,transition:'all 0.15s',transform:isActive?'scale(1.08)':'scale(1)'}}>
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
              fill={isCur?color:isDone?`${color}30`:'rgba(255,255,255,0.05)'}
              stroke={isCur?color:isDone?`${color}60`:'rgba(255,255,255,0.15)'}
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
          <div key={s.num} style={{padding:'1rem',background:`${s.color}08`,border:`1px solid ${s.color}30`,borderRadius:12}}>
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
              style={{background:progType.id===pt.id?`${pt.color}15`:'rgba(255,255,255,0.03)',border:`1px solid ${progType.id===pt.id?pt.color:'rgba(255,255,255,0.1)'}`,borderRadius:10,padding:'.75rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
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
                        style={{background:sel?`${nc}25`:`${nc}10`,border:`1px solid ${sel?nc:nc+'40'}`,color:nc,padding:'.4rem .1rem',borderRadius:6,cursor:'pointer',fontSize:11,fontFamily:'monospace',fontWeight:sel?'bold':'normal',transition:'all 0.15s'}}>{root}</button>;
                    })}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
                    {Object.entries(CHORD_TYPES).map(([t,{label}])=>{
                      const tc2=CHORD_COLORS[t]||'#C39BD3', sel=uc?.type===t;
                      return <button key={t} onClick={()=>handleUserChord(ci,uc?.root||'',t)}
                        style={{background:sel?`${tc2}22`:`${tc2}08`,border:`1px solid ${sel?tc2:tc2+'30'}`,color:sel?tc2:`${tc2}99`,padding:'.4rem .25rem',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace',transition:'all 0.15s'}}>{label}</button>;
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
              style={{background:song?.id===s.id?`${s.color}15`:'rgba(255,255,255,0.03)',border:`1px solid ${song?.id===s.id?s.color:'rgba(255,255,255,0.1)'}`,borderRadius:10,padding:'.65rem .9rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <span style={{fontSize:13,fontWeight:'bold',color:song?.id===s.id?s.color:'#fff',fontFamily:'Georgia,serif'}}>{s.title}</span>
                <span style={{fontSize:10,opacity:.4,fontFamily:'monospace',marginLeft:8}}>{s.key}</span>
              </div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap',maxWidth:'50%',justifyContent:'flex-end'}}>
                {s.chords.slice(0,4).map((c,ci)=>(
                  <span key={ci} style={{fontSize:9,fontFamily:'monospace',color:NOTE_COLORS[c.n]||'#C39BD3',padding:'1px 5px',background:`${NOTE_COLORS[c.n]||'#C39BD3'}15`,borderRadius:4}}>
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
                style={{background:sel?`${nc}22`:`${nc}10`,border:`1px solid ${sel?nc:nc+'40'}`,color:nc,padding:'.6rem .25rem',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 10px ${nc}40`:'none'}}>
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
                      style={{background:`${nc}10`,border:`1px solid ${nc}40`,color:nc,padding:'.45rem .1rem',borderRadius:6,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background=`${nc}25`;e.currentTarget.style.transform='scale(1.04)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background=`${nc}10`;e.currentTarget.style.transform='scale(1)';}}>
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
    <div style={{ padding: '1rem', background: 'rgba(240,235,224,0.02)', border: `0.5px solid ${color}30`, borderRadius: 4 }}>
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
                  style={{ background: isActive ? `${nc}15` : 'rgba(240,235,224,0.03)', border: `0.5px solid ${isActive ? nc : 'rgba(240,235,224,0.1)'}`, borderRadius: 3, padding: '.75rem .9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
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
            <div style={{padding:'1rem',background:`${selected.color}08`,border:`0.5px solid ${selected.color}30`,borderRadius:4}}>
              <div style={{fontSize:10,color:selected.color,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.5rem'}}>COULEUR ÉMOTIONNELLE</div>
              <p style={{fontSize:13.5,lineHeight:1.65,opacity:.78,margin:0,fontFamily:'Georgia,serif'}}>{selected.emotion}</p>
            </div>

            {/* Chords + play */}
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
                <span style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace'}}>ACCORDS</span>
                <button onClick={()=>playSequence(selected)} disabled={sequencing}
                  style={{background:sequencing?`${selected.color}20`:'transparent',border:`0.5px solid ${sequencing?selected.color:'rgba(240,235,224,0.2)'}`,color:sequencing?selected.color:'rgba(240,235,224,0.55)',padding:'.35rem .85rem',borderRadius:2,cursor:sequencing?'default':'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em',transition:'all 0.2s'}}>
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
                      style={{background:isActive?`${nc}25`:`${nc}10`,border:`0.5px solid ${isActive?nc:nc+'40'}`,borderRadius:3,padding:'.65rem .9rem',cursor:'pointer',transition:'all 0.15s',transform:isActive?'scale(1.06)':'scale(1)',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
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
                onMouseEnter={e=>{e.currentTarget.style.background=`${prog.color}08`;e.currentTarget.style.borderColor=`${prog.color}40`;}}
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
                    <span key={ci} style={{fontSize:10,fontFamily:'monospace',color:NOTE_COLORS[chord.r]||prog.color,padding:'2px 6px',background:`${NOTE_COLORS[chord.r]||prog.color}15`,borderRadius:2}}>
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
                <span style={{fontSize:11,fontFamily:'monospace',color:song.color,padding:'2px 8px',background:`${song.color}15`,border:`0.5px solid ${song.color}40`,borderRadius:2}}>{song.key}</span>
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
                    style={{background:isPlaying?`${noteColor}25`:`${noteColor}10`,border:`0.5px solid ${isPlaying?noteColor:noteColor+'40'}`,borderRadius:3,padding:'.45rem .7rem',cursor:'pointer',transition:'all 0.15s',transform:isPlaying?'scale(1.08)':'scale(1)'}}>
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
function SolfegePage() {
  const [mode, setMode] = useState('reference'); // reference | exercice
  const [exNote, setExNote] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [score, setScore] = useState({correct:0,total:0});

  const genNote = () => {
    const n = SOLFEGE_MAP[Math.floor(Math.random()*SOLFEGE_MAP.length)];
    setExNote(n); setAnswered(false); setUserAnswer(null);
    playNote(n.semi + 4*12, 0);
  };

  useEffect(()=>{ if(mode==='exercice') genNote(); },[mode]);

  const handleAnswer = (note) => {
    if(answered) return;
    setUserAnswer(note.fr); setAnswered(true);
    const ok = note.fr === exNote.fr;
    setScore(s=>({correct:s.correct+(ok?1:0), total:s.total+1}));
    if(ok) playNote(exNote.semi + 4*12, 0);
  };

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Mode tabs */}
      <div style={{display:'flex',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.4)',flexShrink:0}}>
        {[['reference','Référence'],['exercice','Exercice']].map(([id,label])=>(
          <button key={id} onClick={()=>setMode(id)} style={{flex:1,padding:'.6rem',background:'none',border:'none',color:mode===id?'#F7DC6F':'rgba(240,235,224,0.35)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.08em',borderBottom:mode===id?'1.5px solid #F7DC6F':'1.5px solid transparent',transition:'all 0.2s'}}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      {mode === 'reference' && (
        <div style={{flex:1,overflowY:'auto',padding:'1rem'}}>
          <div style={{marginBottom:'1.25rem'}}>
            <h3 style={{fontSize:16,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.01em'}}>Les 7 notes</h3>
            <p style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>SOLFÈGE FRANÇAIS → NOM ANGLAIS</p>
          </div>

          {/* Reference table */}
          <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:'1.5rem'}}>
            {SOLFEGE_MAP.map(n=>(
              <div key={n.fr} onClick={()=>playNote(n.semi+4*12,0)} style={{display:'flex',alignItems:'center',gap:12,background:`${n.color}10`,border:`0.5px solid ${n.color}40`,borderRadius:4,padding:'.75rem 1rem',cursor:'pointer',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${n.color}20`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${n.color}10`;}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:n.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:16,fontWeight:'bold',color:'#0f0e0c',fontFamily:'Georgia,serif'}}>{n.en}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:20,fontWeight:'bold',color:n.color,fontFamily:'Georgia,serif',lineHeight:1}}>{n.fr}</div>
                  <div style={{fontSize:10,opacity:.45,fontFamily:'monospace',marginTop:2}}>Note n°{n.semi+1} de la gamme chromatique</div>
                </div>
                <span style={{fontSize:11,opacity:.35,fontFamily:'monospace'}}>🔊</span>
              </div>
            ))}
          </div>

          {/* Chromatic table */}
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.75rem'}}>GAMME CHROMATIQUE COMPLÈTE</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:5}}>
              {SOLFEGE_CHROM.map(n=>(
                <div key={n.semi} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem .75rem',background:'rgba(240,235,224,0.03)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:3}}>
                  <span style={{fontSize:13,fontWeight:'bold',fontFamily:'monospace',color:'#f0ebe0'}}>{n.fr}</span>
                  <span style={{fontSize:11,opacity:.4,fontFamily:'monospace'}}>{n.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'exercice' && (
        <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
          {/* Score */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.65rem 1rem',background:'rgba(240,235,224,0.03)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:3}}>
            <span style={{fontSize:10,opacity:.4,fontFamily:'monospace'}}>SCORE DE SESSION</span>
            <span style={{fontSize:14,fontWeight:'bold',color:'#F7DC6F',fontFamily:'monospace'}}>{score.correct}/{score.total}</span>
          </div>

          {/* Note display */}
          {exNote && (
            <div style={{textAlign:'center',padding:'1.5rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4}}>
              <p style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1.25rem'}}>QUELLE EST CETTE NOTE EN SOLFÈGE ?</p>
              <div style={{width:72,height:72,borderRadius:'50%',background:exNote.color,margin:'0 auto 1rem',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:'bold',color:'#0f0e0c',fontFamily:'Georgia,serif'}}>
                {exNote.en}
              </div>
              {answered && (
                <div style={{animation:'fadeIn 0.3s ease',marginBottom:'.75rem'}}>
                  <div style={{fontSize:16,fontWeight:'bold',color:userAnswer===exNote.fr?'#82E0AA':'#F1948A',fontFamily:'Georgia,serif',marginBottom:4}}>
                    {userAnswer===exNote.fr?`✓ Oui, c'est ${exNote.fr} !`:`✗ Non — c'est ${exNote.fr}`}
                  </div>
                </div>
              )}
              <button onClick={()=>exNote&&playNote(exNote.semi+4*12,0)} style={{background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.6)',padding:'.4rem .9rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>
                🔊 ÉCOUTER
              </button>
            </div>
          )}

          {/* Solfège answer buttons */}
          <div>
            <div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>CHOISIR</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {SOLFEGE_MAP.map(n=>{
                const isUser = userAnswer === n.fr;
                const isOk = exNote?.fr === n.fr;
                let bg=`${n.color}10`, border=`${n.color}40`, col=n.color;
                if(answered){
                  if(isOk){bg=`${n.color}25`;border=n.color;}
                  else if(isUser){bg='rgba(241,148,138,0.1)';border='#F1948A';col='#F1948A';}
                  else{col=`${n.color}50`;}
                }
                return(
                  <button key={n.fr} onClick={()=>handleAnswer(n)} disabled={answered}
                    style={{background:bg,border:`0.5px solid ${border}`,color:col,padding:'.7rem .25rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',transition:'all 0.2s'}}>
                    {n.fr}
                  </button>
                );
              })}
            </div>
          </div>

          {answered && (
            <button onClick={genNote} style={{width:'100%',padding:'.9rem',background:'rgba(247,220,111,0.1)',border:'1px solid #F7DC6F',color:'#F7DC6F',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>
              NOTE SUIVANTE →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── EXERCICES PAGE (wrapper) ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ── Portée musicale SVG ───────────────────────────────────────────────────────
function MusicStaff({ notes, currentIdx, feedback }) {
  const NOTE_Y = { C4:105,D4:100,E4:95,F4:90,G4:85,A4:80,B4:75,C5:70,D5:65,E5:60,F5:55 };
  const STAFF_LINES = [95,85,75,65,55];
  const spacing = Math.min(52, 280/Math.max(notes.length,1));
  const svgW = 58 + notes.length * spacing + 18;
  const getColor = (i) => {
    if(i < currentIdx) return '#999';
    if(i > currentIdx) return '#ccc';
    if(feedback==='correct') return '#22c55e';
    if(feedback==='wrong')   return '#ef4444';
    return '#4a9eff';
  };
  return (
    <div style={{overflowX:'auto',borderRadius:6,background:'#faf9f4',padding:'6px 0 4px'}}>
      <svg viewBox={`0 0 ${svgW} 125`} style={{minWidth:svgW,height:105,display:'block'}}>
        {STAFF_LINES.map((y,i)=><line key={i} x1={42} y1={y} x2={svgW-5} y2={y} stroke="#2a2620" strokeWidth={0.9}/>)}
        <text x={3} y={105} fontSize={68} fill="#2a2620" fontFamily="'Georgia','Times New Roman',serif" style={{userSelect:'none'}}>𝄞</text>
        {notes.map((note,ni)=>{
          const x=57+ni*spacing, y=NOTE_Y[note]??75, col=getColor(ni), stemUp=y>=75;
          return (<g key={ni}>
            {note==='C4'&&<line x1={x-9} y1={105} x2={x+9} y2={105} stroke={col} strokeWidth={1.2}/>}
            <ellipse cx={x} cy={y} rx={5.5} ry={4} fill={ni<=currentIdx?col:'#ddd'} stroke={ni<=currentIdx?col:'#bbb'} strokeWidth={0.8}/>
            {stemUp?<line x1={x+5.2} y1={y-1} x2={x+5.2} y2={y-26} stroke={col} strokeWidth={1.5}/>:<line x1={x-5.2} y1={y+1} x2={x-5.2} y2={y+26} stroke={col} strokeWidth={1.5}/>}
          </g>);
        })}
        {notes.map((_,ni)=>ni===currentIdx&&(<text key={`a${ni}`} x={57+ni*spacing} y={118} textAnchor="middle" fontSize={8} fill="#4a9eff" fontFamily="monospace">▲</text>))}
      </svg>
    </div>
  );
}

// ── Exercice de lecture de partition ─────────────────────────────────────────
function LectureExercice() {
  const NOTE_SOLFEGE={C4:'Do',D4:'Ré',E4:'Mi',F4:'Fa',G4:'Sol',A4:'La',B4:'Si',C5:'Do',D5:'Ré',E5:'Mi',F5:'Fa'};
  const NOTE_SEMI={C4:0,D4:2,E4:4,F4:5,G4:7,A4:9,B4:11,C5:12,D5:14,E5:16,F5:17};
  const SOLFEGES=['Do','Ré','Mi','Fa','Sol','La','Si'];
  const SOL_COLORS={Do:'#E8A87C',Ré:'#85C1E9',Mi:'#82E0AA',Fa:'#F1948A',Sol:'#C39BD3',La:'#F7DC6F',Si:'#AED6F1'};
  const [melody,setMelody]=useState(null);
  const [noteIdx,setNoteIdx]=useState(0);
  const [feedback,setFeedback]=useState(null);
  const [score,setScore]=useState({correct:0,total:0});
  const [done,setDone]=useState(false);
  const currentNote=melody?melody.notes[noteIdx]:null;
  const correctSolfege=currentNote?NOTE_SOLFEGE[currentNote]:null;
  const handleAnswer=(sol)=>{
    if(feedback)return;
    const ok=sol===correctSolfege;
    setFeedback(ok?'correct':'wrong');
    setScore(s=>({correct:s.correct+(ok?1:0),total:s.total+1}));
    playNote(NOTE_SEMI[currentNote]??0,0,1.2);
    setTimeout(()=>{
      setFeedback(null);
      if(noteIdx>=melody.notes.length-1)setDone(true);
      else setNoteIdx(i=>i+1);
    },900);
  };
  const restart=()=>{setNoteIdx(0);setFeedback(null);setScore({correct:0,total:0});setDone(false);};
  if(!melody)return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{marginBottom:'1.25rem'}}><h3 style={{fontSize:16,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.01em'}}>Lecture de partition</h3><p style={{fontSize:11,opacity:.4,fontFamily:'monospace',letterSpacing:'.08em'}}>CHOISIR UNE MÉLODIE</p></div>
      <div style={{padding:'.75rem',background:'rgba(247,220,111,0.05)',border:'0.5px solid rgba(247,220,111,0.15)',borderRadius:4,marginBottom:'1rem'}}><p style={{fontSize:12,opacity:.55,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>La portée affiche la mélodie complète. Identifie chaque note en solfège au fur et à mesure.</p></div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {LECTURE_MELODIES.map(m=>(<button key={m.id} onClick={()=>{setMelody(m);setNoteIdx(0);setDone(false);setScore({correct:0,total:0});}} style={{background:'rgba(247,220,111,0.05)',border:'0.5px solid rgba(247,220,111,0.2)',borderRadius:4,padding:'1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(247,220,111,0.1)';e.currentTarget.style.borderColor='rgba(247,220,111,0.4)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(247,220,111,0.05)';e.currentTarget.style.borderColor='rgba(247,220,111,0.2)';}}>
          <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:3}}>{m.title}</div>
          <div style={{fontSize:10,opacity:.45,fontFamily:'monospace'}}>{m.desc} — {m.notes.length} NOTES</div>
        </button>))}
      </div>
    </div>
  );
  if(done){
    const pct=Math.round((score.correct/score.total)*100),mc=pct>=90?'#82E0AA':pct>=70?'#85C1E9':pct>=50?'#F7DC6F':'#F1948A';
    const msg=pct>=90?'Excellent ! 🎉':pct>=70?'Très bien ! 👍':pct>=50?'Continue !':'Entraîne-toi encore !';
    return(<div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
      <div style={{textAlign:'center',padding:'1.5rem',background:'rgba(247,220,111,0.05)',border:'0.5px solid rgba(247,220,111,0.2)',borderRadius:4}}>
        <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1rem'}}>RÉSULTATS — {melody.title}</div>
        <div style={{fontSize:64,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score.correct}<span style={{fontSize:28,opacity:.5}}>/{score.total}</span></div>
        <div style={{fontSize:20,color:mc,marginBottom:'.5rem'}}>{pct}%</div>
        <div style={{fontSize:14,opacity:.6,fontFamily:'Georgia,serif'}}>{msg}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        <button onClick={restart} style={{padding:'.9rem',background:'rgba(247,220,111,0.15)',border:'1px solid #F7DC6F',color:'#F7DC6F',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em',fontWeight:'bold'}}>🔄 RECOMMENCER</button>
        <button onClick={()=>{setMelody(null);setDone(false);setScore({correct:0,total:0});}} style={{padding:'.9rem',background:'transparent',border:'0.5px solid rgba(240,235,224,0.2)',color:'rgba(240,235,224,0.5)',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'.15em'}}>CHOISIR UNE AUTRE MÉLODIE</button>
      </div>
    </div>);
  }
  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{padding:'.7rem 1.25rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
      <button onClick={()=>setMelody(null)} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11}}>← Choisir</button>
      <div style={{flex:1,margin:'0 1rem'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:9,fontFamily:'monospace',opacity:.4}}>{noteIdx+1}/{melody.notes.length}</span><span style={{fontSize:9,fontFamily:'monospace',color:'#82E0AA'}}>{score.correct}/{score.total} ✓</span></div><div style={{height:3,background:'rgba(240,235,224,0.08)',borderRadius:2}}><div style={{height:'100%',width:`${(noteIdx/melody.notes.length)*100}%`,background:'#F7DC6F',borderRadius:2,transition:'width 0.3s ease'}}/></div></div>
      <span style={{fontSize:10,fontFamily:'monospace',opacity:.4}}>{melody.title}</span>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{padding:'.75rem',background:'#faf9f4',borderRadius:6,border:'0.5px solid rgba(240,235,224,0.15)'}}><MusicStaff notes={melody.notes} currentIdx={noteIdx} feedback={feedback}/></div>
      <div style={{textAlign:'center',padding:'.75rem'}}>
        <p style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'.75rem'}}>QUELLE EST CETTE NOTE ?</p>
        {feedback?(<div style={{fontSize:17,fontWeight:'bold',fontFamily:'Georgia,serif',color:feedback==='correct'?'#22c55e':'#ef4444',animation:'fadeIn 0.2s ease',marginBottom:'.65rem'}}>{feedback==='correct'?`✓ ${correctSolfege} !`:`✗ C'était ${correctSolfege}`}</div>):(<div style={{marginBottom:'.65rem',height:28}}/>)}
        <button onClick={()=>currentNote&&playNote(NOTE_SEMI[currentNote]??0,0,1.5)} style={{background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.6)',padding:'.4rem .9rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>🔊 ÉCOUTER LA NOTE</button>
      </div>
      <div><div style={{fontSize:10,letterSpacing:'.15em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>RÉPONSE</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7}}>
          {SOLFEGES.map(sol=>{
            const c=SOL_COLORS[sol],isOk=feedback&&sol===correctSolfege,isW=feedback==='wrong'&&sol!==correctSolfege;
            return(<button key={sol} onClick={()=>handleAnswer(sol)} disabled={!!feedback} style={{background:isOk?`${c}25`:`${c}10`,border:`0.5px solid ${isOk?c:isW?'rgba(240,235,224,0.06)':c+'45'}`,color:isOk?c:isW?'rgba(240,235,224,0.18)':c,padding:'.8rem .25rem',borderRadius:3,cursor:feedback?'default':'pointer',fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',transition:'all 0.2s',transform:isOk?'scale(1.05)':'scale(1)'}}>{sol}</button>);
          })}
        </div>
      </div>
    </div>
  </div>);
}

function ExercicesPage() {
  const [sub, setSub] = useState(null);

  const MODS = [
    {id:'solfege',      icon:'🎼', title:'Solfège',              subtitle:'NOTES · GAMMES · SYMBOLES',   color:'#F7DC6F', ok:true},
    {id:'lecture',      icon:'📖', title:'Lecture de partition', subtitle:'IDENTIFIER LES NOTES',         color:'#85C1E9', ok:true},
    {id:'flashcards',   icon:'🎯', title:"Dictée d'accords",     subtitle:'JOUER LES ACCORDS AU PIANO',   color:'#F1948A', ok:true},
    {id:'cycle',        icon:'🔄', title:'Cycle des quintes',    subtitle:'12 TONALITÉS',                 color:'#F7DC6F', ok:true},
    {id:'transposition',icon:'↔', title:'Transposition',        subtitle:'CHANGER DE TONALITÉ',           color:'#85C1E9', ok:true},
    {id:'impro',        icon:'✨', title:'Improvisation guidée', subtitle:'GAMME · STYLE · PROGRESSION',  color:'#A78BFA', ok:true},
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
          {sub==='solfege'      && <SolfegePage/>}
          {sub==='lecture'      && <LectureExercice/>}
          {sub==='flashcards'   && <DicteeAccords/>}
          {sub==='cycle'        && <CycleQuintesExercice/>}
          {sub==='transposition'&& <TranspositionExercice/>}
          {sub==='impro'        && <ImprovisationGuidee/>}
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
            style={{background:`${m.color}08`,border:`1px solid ${m.color}40`,borderRadius:14,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}15`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}08`;e.currentTarget.style.borderColor=`${m.color}40`;e.currentTarget.style.transform='translateY(0)';}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <span style={{fontSize:26}}>{m.icon}</span>
              <span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}50`,padding:'2px 5px',borderRadius:6}}>DISPONIBLE</span>
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
  const [history,   setHistory]   = useState([]); // {root,type,result:'ok'|'hard'}

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
    setCards(c); setIdx(0); setHistory([]); setRunning(true); setPaused(false);
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

  function markAndNext(result) {
    const card = cards[idx];
    if(card) setHistory(h => [...h, { ...card, result }]);
    const next = idx + 1;
    if (!loopMode && next >= cards.length) { stopAll(); setScreen('result'); return; }
    const nextIdx = loopMode ? next % cards.length : next;
    setIdx(nextIdx);
    // Play next chord
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
              style={{background:on?`${t.color}18`:'rgba(255,255,255,0.03)',border:`1.5px solid ${on?t.color:'rgba(255,255,255,0.1)'}`,borderRadius:10,padding:'.65rem .75rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',alignItems:'center',gap:8}}>
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
    const easy = history.filter(h=>h.result==='ok').length;
    const hard = history.filter(h=>h.result==='hard').length;
    const pct  = history.length>0?Math.round((easy/history.length)*100):0;
    const mc   = pct>=70?'#82E0AA':pct>=40?'#F7DC6F':'#F1948A';
    const hardCards = history.filter(h=>h.result==='hard');
    return(
      <div style={{flex:1,padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem',overflowY:'auto'}}>
        <div style={{textAlign:'center',padding:'2rem',background:`${mc}08`,border:`1px solid ${mc}30`,borderRadius:14}}>
          <div style={{fontSize:11,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>SESSION TERMINÉE</div>
          <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:'1rem'}}>
            <div style={{textAlign:'center'}}><div style={{fontSize:40,fontWeight:'bold',color:'#82E0AA',fontFamily:'Georgia,serif'}}>{easy}</div><div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>FACILE</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:40,fontWeight:'bold',color:'#F1948A',fontFamily:'Georgia,serif'}}>{hard}</div><div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>DIFFICILE</div></div>
          </div>
          <div style={{fontSize:14,opacity:.55,fontFamily:'Georgia,serif'}}>{pct>=70?'Excellente maîtrise !':pct>=40?'Continue à pratiquer ces accords':'Reviens demain — la régularité paie !'}</div>
        </div>
        {hardCards.length>0&&(
          <div style={{padding:'1rem',background:'rgba(241,148,138,0.07)',border:'1px solid rgba(241,148,138,0.2)',borderRadius:12}}>
            <div style={{fontSize:10,color:'#F1948A',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.65rem'}}>À RETRAVAILLER</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {hardCards.map((c,i)=><span key={i} style={{fontSize:12,fontFamily:'monospace',color:NOTE_COLORS[c.root]||'#F1948A',padding:'3px 10px',background:`${NOTE_COLORS[c.root]||'#F1948A'}15`,borderRadius:8}}>{c.name}</span>)}
            </div>
          </div>
        )}
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
            <div style={{width:10,height:10,borderRadius:'50%',background:pulse?timerColor:'rgba(255,255,255,0.2)',transition:'background 0.1s',boxShadow:pulse?`0 0 8px ${timerColor}80`:'none'}}/>
            <span style={{fontSize:10,fontFamily:'monospace',opacity:.5}}>{loopMode?'BOUCLE ∞':(`${idx+1}/${cards.length}`)}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:16,fontWeight:'bold',fontFamily:'monospace',color:timerColor,minWidth:20,textAlign:'right'}}>{timeLeft}</span>
            <span style={{fontSize:10,opacity:.4,fontFamily:'monospace'}}>s</span>
          </div>
        </div>
        <div style={{height:5,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${timerPct}%`,background:timerColor,borderRadius:4,transition:'width 1s linear',boxShadow:`0 0 6px ${timerColor}60`}}/>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {/* Card */}
        <div style={{textAlign:'center',padding:'1.75rem',background:`${nc}10`,border:`1.5px solid ${nc}40`,borderRadius:16,position:'relative',overflow:'hidden'}}>
          <div style={{fontSize:10,letterSpacing:'.15em',opacity:.35,fontFamily:'monospace',marginBottom:'1rem'}}>JOUE CET ACCORD SUR TON PIANO</div>
          <div style={{fontSize:62,fontWeight:'bold',color:nc,fontFamily:'Georgia,serif',lineHeight:1,marginBottom:6}}>{card.name}</div>
          <div style={{fontSize:13,opacity:.55,fontFamily:'monospace',marginBottom:'1.25rem'}}>{card.label}</div>
          <button onClick={playCurrentChord}
            style={{background:`${nc}18`,border:`1px solid ${nc}60`,color:nc,padding:'.45rem 1.1rem',borderRadius:8,cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.08em'}}>
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
            return <div key={f} style={{width:40,height:40,borderRadius:'50%',background:`${c}20`,border:`1.5px solid ${c}60`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:'bold',color:c,fontFamily:'monospace'}}>{n}</div>;
          })}
        </div>

        {/* Controls */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          <button onClick={togglePause}
            style={{padding:'.8rem .25rem',background:paused?'rgba(247,220,111,0.15)':'rgba(255,255,255,0.05)',border:`1.5px solid ${paused?'#F7DC6F':'rgba(255,255,255,0.15)'}`,color:paused?'#F7DC6F':'rgba(255,255,255,0.6)',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
            {paused?'▶ REPRENDRE':'⏸ PAUSE'}
          </button>
          <button onClick={()=>markAndNext('hard')}
            style={{padding:'.8rem .25rem',background:'rgba(241,148,138,0.12)',border:'1.5px solid #F1948A',color:'#F1948A',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
            😓 DUR
          </button>
          <button onClick={()=>markAndNext('ok')}
            style={{padding:'.8rem .25rem',background:'rgba(130,224,170,0.12)',border:'1.5px solid #82E0AA',color:'#82E0AA',borderRadius:10,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s'}}>
            ✓ OK
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
      {cNotes&&(<div style={{marginBottom:'1.25rem',animation:'fadeIn 0.4s ease forwards'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>NOTES</div><div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>{inversions[inv].map((note,i)=>(<div key={`n${i}`} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}><div style={{width:46,height:46,borderRadius:'50%',border:`1px solid ${NOTE_COLORS[note]}50`,background:`${NOTE_COLORS[note]}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:'bold',color:NOTE_COLORS[note],fontFamily:'monospace'}}>{note}</div><div style={{fontSize:9,opacity:.3,fontFamily:'monospace'}}>{i===0?'BASSE':i===cNotes.length-1?'AIGU':''}</div></div>))}</div></div>)}
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginBottom:'1.5rem'}}>
        <button onClick={()=>{setModalStep('type');setShowModal(true);}} style={{background:'transparent',border:`1px solid ${cName?color:'rgba(240,235,224,0.2)'}`,color:cName?color:'#f0ebe0',padding:'.75rem 1.5rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}} onMouseEnter={e=>{e.currentTarget.style.background=`${color}14`;e.currentTarget.style.transform='translateY(-1px)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.transform='translateY(0)';}}>
          {cName?"Changer d'accord":'Choisir un accord'}
        </button>
        {cName&&(<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?`${color}18`:'transparent',border:`1px solid ${showPiano?color:'rgba(240,235,224,0.2)'}`,color:showPiano?color:'rgba(240,235,224,0.6)',padding:'.75rem 1.1rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}}>🎹 Clavier</button>)}
        <button onClick={()=>setShowImpro(true)} style={{background:'rgba(247,220,111,0.08)',border:'1px solid rgba(247,220,111,0.35)',color:'#F7DC6F',padding:'.75rem 1.1rem',fontSize:12,letterSpacing:'.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(247,220,111,0.18)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(247,220,111,0.08)'}>🎵 Enchaînements</button>
      </div>
      {showPiano&&cNotes&&(<div style={{marginBottom:'1.5rem',padding:'1.25rem 1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease forwards',overflowX:'auto'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'.75rem'}}>CLAVIER</div><PianoKeyboard activeAbsIndices={aIdx} color={color}/></div>)}
      {inversions&&(<div style={{animation:'fadeIn 0.4s ease 0.15s both'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.3,fontFamily:'monospace',marginBottom:'.65rem'}}>RENVERSEMENTS</div><div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>{inversions.map((iv,i)=>(<button key={`inv${i}`} onClick={()=>setInv(i)} style={{background:inv===i?`${color}18`:'transparent',border:`0.5px solid ${inv===i?color:'rgba(240,235,224,0.15)'}`,color:inv===i?color:'rgba(240,235,224,0.45)',padding:'.5rem .85rem',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:10,transition:'all 0.2s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:3}} onMouseEnter={e=>{if(inv!==i)e.currentTarget.style.borderColor=`${color}60`;}} onMouseLeave={e=>{if(inv!==i)e.currentTarget.style.borderColor='rgba(240,235,224,0.15)';}}>
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
        {modalStep==='root'&&(<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'1.25rem',overflowY:'auto'}}>{ROOT_NOTES.map(root=>{const c=NOTE_COLORS[root]||'#C39BD3',ri=CHROMATIC.indexOf(root),prev=CHORD_TYPES[selType].formula.map(i=>CHROMATIC[(ri+i)%12]),isA=selRoot===root;return(<button key={root} onClick={()=>handleChordSelect(root)} style={{background:isA?`${c}20`:'rgba(240,235,224,0.03)',border:`0.5px solid ${isA?c:'rgba(240,235,224,0.1)'}`,color:isA?c:'rgba(240,235,224,0.8)',padding:'1rem .5rem',borderRadius:2,cursor:'pointer',transition:'all 0.2s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:6}} onMouseEnter={e=>{e.currentTarget.style.background=`${c}18`;e.currentTarget.style.borderColor=`${c}80`;e.currentTarget.style.color=c;}} onMouseLeave={e=>{if(!isA){e.currentTarget.style.background='rgba(240,235,224,0.03)';e.currentTarget.style.borderColor='rgba(240,235,224,0.1)';e.currentTarget.style.color='rgba(240,235,224,0.8)';}}}>
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
          <button key={s} onClick={()=>setStep(s)} style={{flex:1,padding:'.45rem .25rem',background:step===s?`${color}20`:'rgba(255,255,255,0.04)',border:`1px solid ${step===s?color:'rgba(255,255,255,0.1)'}`,borderRadius:10,cursor:'pointer',fontSize:9,fontFamily:'monospace',color:step===s?color:'rgba(255,255,255,0.4)',letterSpacing:'.04em',transition:'all 0.2s',textAlign:'center'}}>
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
                <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'.7rem',background:mode===m?`${color}20`:'rgba(255,255,255,0.04)',border:`1px solid ${mode===m?color:'rgba(255,255,255,0.1)'}`,borderRadius:12,cursor:'pointer',color:mode===m?color:'rgba(255,255,255,0.5)',fontFamily:'monospace',fontSize:12,fontWeight:'bold',letterSpacing:'.06em',transition:'all 0.2s',textTransform:'uppercase'}}>
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
                return <button key={k} onClick={()=>setKey(k)} style={{background:sel?`${nc}25`:`${nc}10`,border:`1.5px solid ${sel?nc:nc+'40'}`,color:nc,padding:'.6rem .25rem',borderRadius:10,cursor:'pointer',fontSize:14,fontWeight:sel?'bold':'normal',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 4px 14px ${nc}40`:'none'}}>{k}</button>;
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
                return(<div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'.5rem .6rem',background:`${d.color}12`,border:`0.5px solid ${d.color}40`,borderRadius:8}}>
                  <span style={{fontSize:9,color:d.color,fontFamily:'monospace',opacity:.7}}>{d.deg}</span>
                  <span style={{fontSize:13,fontWeight:'bold',color:d.color,fontFamily:'monospace'}}>{name}</span>
                  <span style={{fontSize:8,opacity:.4,fontFamily:'monospace'}}>{d.fn}</span>
                </div>);
              })}
            </div>
          </div>
          <button onClick={()=>setStep('emotion')} style={{width:'100%',padding:'.9rem',background:`${color}18`,border:`1.5px solid ${color}`,color,borderRadius:12,cursor:'pointer',fontSize:12,fontFamily:'monospace',letterSpacing:'.12em',fontWeight:'bold',transition:'all 0.2s'}}>
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
              <button key={em.label} onClick={()=>applyEmotion(em)} style={{background:emotion?.label===em.label?`${em.color}20`:'rgba(255,255,255,0.04)',border:`1.5px solid ${emotion?.label===em.label?em.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.9rem 1.1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:14,fontWeight:'bold',color:em.color,fontFamily:'Georgia,serif',marginBottom:3}}>{em.label}</div>
                  <div style={{fontSize:10,opacity:.5,fontFamily:'monospace'}}>{em.desc}</div>
                </div>
                <div style={{display:'flex',gap:5,flexShrink:0,marginLeft:8}}>
                  {em.degs.map((di,i)=>(
                    <span key={i} style={{fontSize:10,fontFamily:'monospace',color:scale[di]?.color,padding:'2px 5px',background:`${scale[di]?.color}15`,borderRadius:5}}>
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
            <div style={{padding:'.75rem',background:`${emotion.color}12`,border:`1px solid ${emotion.color}30`,borderRadius:10,marginBottom:'1.25rem'}}>
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
                return(<div key={i} style={{padding:'.75rem .9rem',background:`${d.color}18`,border:`1.5px solid ${d.color}60`,borderRadius:12,textAlign:'center',minWidth:60}}>
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
                return(<button key={i} onClick={()=>setProg(p=>[...p,i])} style={{background:`${d.color}10`,border:`0.5px solid ${d.color}40`,color:d.color,padding:'.4rem .7rem',borderRadius:8,cursor:'pointer',fontSize:11,fontFamily:'monospace',transition:'all 0.15s'}}>+{name}</button>);
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
          {ROOT_NOTES.map(r=>{const nc=NOTE_COLORS[r]||'#8B5CF6',sel=root===r;return(<button key={r} onClick={()=>{setRoot(r);setActive(new Set());}} style={{background:sel?`${nc}25`:`${nc}10`,border:`1.5px solid ${sel?nc:nc+'30'}`,color:nc,padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 10px ${nc}40`:'none'}}>{r}</button>);} )}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
          {Object.entries(CHORD_TYPES).slice(0,3).map(([t,{label}])=>{
            const tc=CHORD_COLORS[t]||'#8B5CF6',sel=baseType===t;
            return(<button key={t} onClick={()=>{setBaseType(t);setActive(new Set());}} style={{background:sel?`${tc}20`:`${tc}08`,border:`1px solid ${sel?tc:tc+'30'}`,color:sel?tc:`${tc}99`,padding:'.5rem .25rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',transition:'all 0.15s'}}>{label}</button>);
          })}
        </div>
      </div>

      {/* Base chord display */}
      <div style={{textAlign:'center',marginBottom:'1.25rem',padding:'1rem',background:`${color}10`,border:`1px solid ${color}30`,borderRadius:12}}>
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
          {active.size>0&&<button onClick={playFull} style={{background:`${color}18`,border:`1px solid ${color}`,color,padding:'.4rem .9rem',borderRadius:8,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold'}}>🎵 AVEC TENSIONS</button>}
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
            return(<div key={ext.label} style={{background:isOn?`${ext.color}15`:'rgba(255,255,255,0.03)',border:`1px solid ${isOn?ext.color:'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'.85rem',transition:'all 0.2s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:isOn?'.65rem':0}}>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <button onClick={()=>toggleExt(ext.label)} style={{background:isOn?ext.color:'rgba(255,255,255,0.06)',border:`1.5px solid ${ext.color}`,color:isOn?'#0D0B1E':ext.color,padding:'.3rem .6rem',borderRadius:8,cursor:'pointer',fontSize:12,fontFamily:'monospace',fontWeight:'bold',minWidth:56,transition:'all 0.2s',boxShadow:isOn?`0 2px 10px ${ext.color}50`:'none'}}>
                    {ext.label}
                  </button>
                  <div>
                    <div style={{fontSize:12,fontWeight:'bold',color:ext.color,fontFamily:'Georgia,serif'}}>{ext.name}</div>
                    <div style={{fontSize:10,fontStyle:'italic',color:ext.color,opacity:.8}}>"{ext.emotion}"</div>
                  </div>
                </div>
                <button onClick={()=>setShowUse(showUse===ext.label?null:ext.label)} style={{background:'transparent',border:`0.5px solid ${ext.color}40`,color:ext.color,padding:'2px 7px',borderRadius:6,cursor:'pointer',fontSize:9,fontFamily:'monospace',flexShrink:0}}>
                  {showUse===ext.label?'▲':'↗ USE'}
                </button>
              </div>
              {isOn&&<p style={{fontSize:11,opacity:.65,lineHeight:1.6,margin:'0 0 .5rem',fontFamily:'Georgia,serif'}}>{ext.desc}</p>}
              {showUse===ext.label&&(<div style={{padding:'.65rem',background:`${ext.color}10`,borderRadius:8,marginTop:6,animation:'fadeIn 0.2s ease'}}>
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
            <div key={cad.id} style={{background:isA?`${cad.color}12`:'rgba(255,255,255,0.03)',border:`1.5px solid ${isA?cad.color:'rgba(255,255,255,0.08)'}`,borderRadius:14,padding:'1rem',transition:'all 0.3s'}}>
              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem'}}>
                <div>
                  <div style={{fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif',color:isA?cad.color:'#fff',marginBottom:3}}>{cad.name}</div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {cad.chords.map((ch,i)=>(
                      <span key={i} style={{display:'flex',alignItems:'center',gap:4}}>
                        {i>0&&<span style={{opacity:.3,fontSize:12}}>→</span>}
                        <span style={{fontSize:12,fontFamily:'monospace',color:NOTE_COLORS[ch.r]||cad.color,padding:'2px 7px',background:`${NOTE_COLORS[ch.r]||cad.color}15`,borderRadius:6}}>{ch.r}{CHORD_TYPES[ch.t]?.suffix}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={()=>playCadence(cad)} disabled={playing} style={{background:`${cad.color}20`,border:`1px solid ${cad.color}`,color:cad.color,padding:'.45rem .85rem',borderRadius:10,cursor:playing?'default':'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.06em',fontWeight:'bold',flexShrink:0,transition:'all 0.2s',boxShadow:`0 2px 10px ${cad.color}30`}}>
                  {playing&&isA?'▶…':'▶ ÉCOUTER'}
                </button>
              </div>
              {/* Emotion */}
              <div style={{padding:'.65rem .85rem',background:`${cad.color}10`,borderRadius:10,marginBottom:'.65rem'}}>
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
            {ROOT_NOTES.map(k=>{const nc=NOTE_COLORS[k]||'#8B5CF6',sel=fromKey===k;return(<button key={k} onClick={()=>setFromKey(k)} style={{background:sel?`${nc}25`:`${nc}10`,border:`1px solid ${sel?nc:nc+'30'}`,color:nc,padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 8px ${nc}40`:'none'}}>{k}</button>);} )}
          </div>
        </div>
        {/* Arrow */}
        <div style={{textAlign:'center',paddingTop:'2rem',fontSize:22,opacity:.4}}>→</div>
        {/* To */}
        <div>
          <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.6rem',textAlign:'center'}}>ARRIVÉE</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
            {ROOT_NOTES.map(k=>{const nc=NOTE_COLORS[k]||'#8B5CF6',sel=toKey===k;return(<button key={k} onClick={()=>setToKey(k)} style={{background:sel?`${nc}25`:`${nc}10`,border:`1px solid ${sel?nc:nc+'30'}`,color:nc,padding:'.4rem .1rem',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:'bold',fontFamily:'monospace',transition:'all 0.15s',boxShadow:sel?`0 2px 8px ${nc}40`:'none'}}>{k}</button>);} )}
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
                return(<div key={i} style={{padding:'.5rem .75rem',background:`${p.color}15`,border:`1px solid ${p.color}40`,borderRadius:10}}>
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
              return(<button key={mt.id} onClick={()=>setSelType(isA?null:mt.id)} style={{background:isA?`${mt.color}12`:'rgba(255,255,255,0.03)',border:`1.5px solid ${isA?mt.color:'rgba(255,255,255,0.08)'}`,borderRadius:12,padding:'.9rem 1rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:isA?'.65rem':0}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:'bold',color:mt.color,fontFamily:'Georgia,serif'}}>{mt.name}</span>
                    <span style={{fontSize:9,padding:'2px 7px',background:`${mt.color}18`,border:`0.5px solid ${mt.color}40`,borderRadius:6,color:mt.color,fontFamily:'monospace'}}>{mt.diff}</span>
                  </div>
                  <span style={{fontSize:12,opacity:.4}}>{isA?'▲':'▼'}</span>
                </div>
                {isA&&(<div style={{animation:'fadeIn 0.25s ease'}}>
                  <p style={{fontSize:12,opacity:.65,lineHeight:1.65,margin:'0 0 .65rem',fontFamily:'Georgia,serif'}}>{mt.desc}</p>
                  <div style={{padding:'.65rem',background:`${mt.color}10`,borderRadius:8,marginBottom:'.5rem'}}>
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
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.color}18`;e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform='translateY(-3px) scale(1.02)';e.currentTarget.style.boxShadow=`0 10px 28px ${m.color}35`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.color}08`;e.currentTarget.style.borderColor=`${m.color}40`;e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='none';}}
            style={{background:`${m.color}08`,border:`1.5px solid ${m.color}40`,borderRadius:16,padding:'1.1rem',display:'flex',flexDirection:'column',gap:8,cursor:'pointer',textAlign:'left',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <span style={{fontSize:28}}>{m.icon}</span>
              <span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}50`,padding:'2px 6px',borderRadius:8}}>DISPONIBLE</span>
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

function TheoriePage() {
  const CATEGORIES = [
    { title:'Harmonie classique', color:'#C39BD3', icon:'🎼', items:[
      {name:'Gammes et modes',          desc:'Majeur, mineur, modes grecs'},
      {name:'Intervalles',              desc:'Secondes, tierces, quintes...'},
      {name:'Construction des accords', desc:'Triades, accords de 7e'},
      {name:'Fonctions harmoniques',    desc:'Tonique, sous-dominante, dominante'},
      {name:'Cadences',                 desc:'Parfaite, rompue, à la dominante'},
      {name:'Modulation',               desc:'Changer de tonalité'},
    ]},
    { title:'Théorie Jazz', color:'#F7DC6F', icon:'🎷', items:[
      {name:'Extensions d\'accords',    desc:'9e, 11e, 13e et altérations'},
      {name:'Substitutions',            desc:'Triton, sous-dominante mineure'},
      {name:'ii-V-I et variations',     desc:'La progression fondamentale'},
      {name:'Modes appliqués au jazz',  desc:'Dorien, mixolydien, lydien...'},
      {name:'Réharmonisation',          desc:'Enrichir une grille simple'},
    ]},
    { title:'Composition', color:'#85C1E9', icon:'✍', items:[
      {name:'Forme et structure',       desc:'ABA, couplet-refrain, rondo'},
      {name:'Contrepoint',              desc:'Voix indépendantes qui s\'harmonisent'},
      {name:'Orchestration',            desc:'Distribuer les voix et timbres'},
      {name:'Borrowed chords',          desc:'Emprunter des accords d\'autres tonalités'},
    ]},
    { title:'Acoustique musicale', color:'#82E0AA', icon:'🔊', items:[
      {name:'Série harmonique',         desc:'Pourquoi certains accords sonnent bien'},
      {name:'Tempérament égal',         desc:'Comment le piano est accordé'},
      {name:'Résonance et timbre',      desc:'Couleur sonore des instruments'},
    ]},
  ];

  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Théorie Musicale</h2>
        <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>COMPRENDRE LA MUSIQUE EN PROFONDEUR</p>
      </div>

      <div style={{padding:'1rem',background:'rgba(247,220,111,0.05)',border:'0.5px solid rgba(247,220,111,0.2)',borderRadius:4,marginBottom:'1.5rem'}}>
        <div style={{fontSize:10,color:'#F7DC6F',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.35rem'}}>EN COURS DE RÉDACTION</div>
        <p style={{fontSize:12,opacity:.55,margin:0,lineHeight:1.6,fontFamily:'Georgia,serif'}}>Le contenu théorique sera ajouté progressivement. Chaque chapitre sera accompagné d'exemples sonores et visuels interactifs.</p>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {CATEGORIES.map((cat,ci)=>(
          <div key={ci} style={{background:'rgba(240,235,224,0.025)',border:`0.5px solid ${cat.color}30`,borderRadius:4,overflow:'hidden'}}>
            <div style={{padding:'.85rem 1rem',background:`${cat.color}08`,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>{cat.icon}</span>
              <span style={{fontSize:14,fontWeight:'bold',color:cat.color,fontFamily:'Georgia,serif'}}>{cat.title}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              {cat.items.map((item,ii)=>(
                <div key={ii} style={{padding:'.7rem 1rem',borderTop:'0.5px solid rgba(240,235,224,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:13,fontFamily:'Georgia,serif',color:'rgba(240,235,224,0.65)',marginBottom:2}}>{item.name}</div>
                    <div style={{fontSize:10,opacity:.35,fontFamily:'monospace'}}>{item.desc}</div>
                  </div>
                  <span style={{fontSize:8,fontFamily:'monospace',color:'rgba(240,235,224,0.25)',border:'0.5px solid rgba(240,235,224,0.1)',padding:'2px 5px',borderRadius:2,flexShrink:0,marginLeft:8}}>BIENTÔT</span>
                </div>
              ))}
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
  {id:'exercices', icon:'✎',  title:'Technique',   subtitle:'SOLFÈGE · LECTURE · RYTHME',              color:'#82E0AA'},
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
        <button onClick={()=>setShowCatTip(catTipKey)} style={{marginLeft:'auto',background:'transparent',border:`0.5px solid ${info?.color}40`,color:`${info?.color}80`,padding:'3px 8px',borderRadius:2,cursor:'pointer',fontSize:9,fontFamily:'monospace',letterSpacing:'.06em',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color=info?.color} onMouseLeave={e=>e.currentTarget.style.color=`${info?.color}80`}>
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
function CompetencesPage({skills,instrument,setInstrument,stats}){
  const STAT_CARDS=[
    {label:'Temps de jeu', value:formatTime(stats.totalSeconds), icon:'⏱', grad:'linear-gradient(135deg,#8B5CF6,#6D28D9)', glow:'139,92,246'},
    {label:'Exercices',    value:stats.totalExercises||0,         icon:'✓',  grad:'linear-gradient(135deg,#06B6D4,#0284C7)', glow:'6,182,212'},
    {label:'Sessions',     value:stats.sessionsCount||0,          icon:'◈',  grad:'linear-gradient(135deg,#10B981,#047857)', glow:'16,185,129'},
    {label:'Clés',         value:`🗝️ ${stats.keys||0}`,           icon:'🗝️', grad:'linear-gradient(135deg,#F59E0B,#D97706)', glow:'245,158,11'},
  ];
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    {/* Instrument selector */}
    <div style={{marginBottom:'1.5rem'}}>
      <div style={{fontSize:10,letterSpacing:'.2em',opacity:.4,fontFamily:'monospace',marginBottom:'.65rem'}}>INSTRUMENT</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{INSTRUMENTS.map(inst=>{
        const isA=instrument===inst.id;
        return(<button key={inst.id} onClick={()=>inst.available&&setInstrument(inst.id)}
          style={{background:isA?'linear-gradient(135deg,#8B5CF6,#6D28D9)':'rgba(255,255,255,0.05)',
            border:`1.5px solid ${isA?'transparent':isA?'rgba(139,92,246,0.4)':'rgba(255,255,255,0.1)'}`,
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
        {skills.map(s=>(<div key={s.id} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:7,height:7,borderRadius:'50%',background:s.color,boxShadow:`0 0 6px ${s.color}`}}/><span style={{fontSize:9,fontFamily:'monospace',opacity:.5}}>{s.label}</span></div>))}
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
          <div style={{height:'100%',width:`${s.value}%`,background:s.color,borderRadius:6,boxShadow:`0 0 10px ${s.color}80`,transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}/>
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

  const cycleTheme = () => {
    const idx = THEME_IDS.indexOf(themeId);
    const next = THEME_IDS[(idx+1)%THEME_IDS.length];
    setThemeId(next);
    try{ localStorage.setItem('cs_theme',next); }catch{}
  };

  // Register callbacks
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

  return(<div style={{minHeight:'100vh',background:theme.bgGrad,fontFamily:"'Georgia',serif",color:theme.text,display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>

    {/* CSS */}
    <style>{`
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes slideInRight{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
      @keyframes pageIn{from{opacity:0;transform:translateY(12px) scale(0.99)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(12px,-18px) scale(1.04)}}
      *{box-sizing:border-box} button{cursor:pointer}
      ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px}
      ${theme.css||''}
    `}</style>

    {/* Background orbs — décoratifs */}
    <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
      <div style={{position:'absolute',top:'-15%',left:'-10%',width:420,height:420,borderRadius:'50%',background:`radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)`,animation:'orbFloat 12s ease-in-out infinite'}}/>
      <div style={{position:'absolute',bottom:'-10%',right:'-8%',width:380,height:380,borderRadius:'50%',background:`radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)`,animation:'orbFloat 16s ease-in-out infinite reverse'}}/>
      <div style={{position:'absolute',top:'40%',right:'-5%',width:260,height:260,borderRadius:'50%',background:`radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)`,animation:'orbFloat 10s ease-in-out infinite 3s'}}/>
    </div>

    {/* Header */}
    <header style={{position:'fixed',top:0,left:0,right:0,padding:'.8rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${theme.borderMuted}`,zIndex:10,background:theme.headerBg,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)'}}>
      {/* Logo gradient */}
      <span style={{fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif',letterSpacing:'.12em',background:theme.logoGrad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
        CHORD·STUDIO
      </span>
      <div style={{display:'flex',gap:7,alignItems:'center'}}>
        {/* Theme cycle */}
        <button onClick={()=>{
          const idx=THEME_IDS.indexOf(themeId);
          const next=THEME_IDS[(idx+1)%THEME_IDS.length];
          setThemeId(next);
          try{localStorage.setItem('cs_theme',next);}catch{}
        }} title={`Thème : ${theme.label}`}
          style={{background:theme.surface,border:`1px solid ${theme.border}`,color:theme.text,padding:'.3rem .6rem',borderRadius:10,cursor:'pointer',fontSize:14,transition:'all 0.2s',lineHeight:1,boxShadow:`0 2px 8px rgba(0,0,0,0.2)`}}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}>
          {theme.icon}
        </button>
        {/* Défis */}
        <button onClick={()=>setShowDefis(v=>!v)} style={{
          display:'flex',alignItems:'center',gap:5,
          background:showDefis?'rgba(245,158,11,0.2)':theme.surface,
          border:`1px solid ${showDefis?'rgba(245,158,11,0.5)':theme.border}`,
          color:showDefis?'#FBBF24':theme.textMuted,
          padding:'.3rem .8rem',borderRadius:10,cursor:'pointer',fontSize:11,
          fontFamily:'monospace',letterSpacing:'.06em',transition:'all 0.2s',
          boxShadow:showDefis?'0 2px 12px rgba(245,158,11,0.25)':'none'}}>
          <span style={{fontSize:12}}>🗝️</span>
          <span style={{fontWeight:'bold'}}>{keys}</span>
          <span style={{opacity:.65}}>DÉFIS</span>
        </button>
        {/* Conseil */}
        <button onClick={()=>setShowTip(v=>!v)} style={{
          background:showTip?'rgba(245,158,11,0.15)':theme.surface,
          border:`1px solid ${showTip?'rgba(245,158,11,0.4)':theme.border}`,
          color:showTip?'#FBBF24':theme.textMuted,
          padding:'.3rem .75rem',borderRadius:10,cursor:'pointer',fontSize:12,
          transition:'all 0.2s'}}>💡</button>
      </div>
    </header>

    {/* Pages avec transition */}
    <div style={{flex:1,paddingTop:58,paddingBottom:72,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',zIndex:1}}>
      <div key={page+pageKey} style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',animation:'pageIn 0.32s cubic-bezier(0.34,1.20,0.64,1)'}}>
        {page==='competences'&&<CompetencesPage skills={skills} instrument={instrument} setInstrument={setInstrument} stats={stats}/>}
        {page==='apprentissage'&&<ApprentissagePage sub={apprentissageSub} setSub={setApprentiassageSub}/>}
        {page==='partage'&&<PlaceholderPage title="Partage" icon="↗" description="PARTAGE TA PROGRESSION BIENTÔT"/>}
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
  </div>);
}
