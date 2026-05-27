import { useState, useEffect, useCallback } from "react";

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
  C:"#E8A87C","C#":"#E8A87C",D:"#85C1E9",Eb:"#85C1E9",E:"#82E0AA",
  F:"#F1948A","F#":"#F1948A",G:"#C39BD3",Ab:"#C39BD3",A:"#F7DC6F",Bb:"#F7DC6F",B:"#AED6F1",
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

function SectionCard({icon,title,subtitle,color,onClick,badge,lock}){
  const [hov,setHov]=useState(false);
  return(<button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:hov&&!lock?`${color}10`:'rgba(240,235,224,0.025)',border:`0.5px solid ${hov&&!lock?color:'rgba(240,235,224,0.1)'}`,borderRadius:4,padding:'1.1rem',cursor:lock?'default':'pointer',textAlign:'left',transition:'all 0.25s ease',display:'flex',flexDirection:'column',gap:7,transform:hov&&!lock?'translateY(-2px)':'translateY(0)',opacity:lock?.5:1}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <span style={{fontSize:26}}>{icon}</span>
      {badge&&<span style={{fontSize:9,fontFamily:'monospace',color:'#82E0AA',background:'rgba(130,224,170,0.1)',padding:'2px 6px',borderRadius:2}}>NOUVEAU</span>}
      {lock&&<span style={{fontSize:9,fontFamily:'monospace',color:'rgba(240,235,224,0.3)',border:'0.5px solid rgba(240,235,224,0.12)',padding:'2px 5px',borderRadius:2}}>BIENTÔT</span>}
    </div>
    <div><div style={{fontSize:15,fontWeight:'bold',color:hov&&!lock?color:'#f0ebe0',marginBottom:3,fontFamily:'Georgia,serif'}}>{title}</div><div style={{fontSize:10,opacity:.38,fontFamily:'monospace',letterSpacing:'.04em'}}>{subtitle}</div></div>
  </button>);
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

// ── Speed Flashcards ──────────────────────────────────────────────────────────
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
function OreilPage(){
  const [sub,setSub]=useState(null);
  if(sub==='intervalles')return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><IntervallesSection onBack={()=>setSub(null)}/></div>);
  if(sub==='accords')return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><AccordOreilleSection onBack={()=>setSub(null)}/></div>);
  const MODS=[{id:'intervalles',icon:'🎵',title:'Intervalles',subtitle:'IDENTIFIER LES DISTANCES',color:'#85C1E9',ok:true},{id:'accords',icon:'🎹',title:'Accords',subtitle:"IDENTIFIER À L'OREILLE",color:'#C39BD3',ok:true},{id:'melodie',icon:'🎼',title:'Mélodie',subtitle:'DICTÉE MÉLODIQUE',color:'#82E0AA',ok:false},{id:'rythme',icon:'🥁',title:'Rythme',subtitle:'DICTÉE RYTHMIQUE',color:'#F7DC6F',ok:false}];
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    <div style={{marginBottom:'1.5rem'}}><h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Oreille Musicale</h2><p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>DÉVELOPPE TON OREILLE PAR L'ÉCOUTE ACTIVE</p></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
      {MODS.map(m=>(<button key={m.id} onClick={()=>m.ok&&setSub(m.id)} style={{background:m.ok?`${m.color}08`:'rgba(240,235,224,0.02)',border:`0.5px solid ${m.ok?m.color+'40':'rgba(240,235,224,0.08)'}`,borderRadius:4,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:m.ok?'pointer':'default',textAlign:'left',opacity:m.ok?1:.5,transition:'all 0.2s'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><span style={{fontSize:26}}>{m.icon}</span>{m.ok?<span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}50`,padding:'2px 5px',borderRadius:2}}>DISPONIBLE</span>:<span style={{fontSize:8,fontFamily:'monospace',color:'rgba(240,235,224,0.25)',border:'0.5px solid rgba(240,235,224,0.1)',padding:'2px 5px',borderRadius:2}}>BIENTÔT</span>}</div>
        <div><div style={{fontSize:14,fontWeight:'bold',marginBottom:3,color:m.ok?m.color:`${m.color}99`,fontFamily:'Georgia,serif'}}>{m.title}</div><div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.04em'}}>{m.subtitle}</div></div>
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
    {id:'solfege',   icon:'🎼', title:'Solfège',              subtitle:'NOTES · GAMMES · LECTURE', color:'#F7DC6F', ok:true},
    {id:'lecture',   icon:'📖', title:'Lecture de partition', subtitle:'IDENTIFIER LES NOTES',     color:'#85C1E9', ok:true},
    {id:'flashcards',icon:'⚡', title:'Speed Flashcards',     subtitle:'MÉMORISATION RÉFLEXE',      color:'#F1948A', ok:true},
    {id:'rythme',    icon:'🥁', title:'Rythme',               subtitle:'DICTÉE RYTHMIQUE',         color:'#82E0AA', ok:false},
    {id:'impro',   icon:'✨', title:'Improvisation',         subtitle:'SCALES & MODES',           color:'#F1948A', ok:false},
  ];

  if (sub) {
    const info = MODS.find(m=>m.id===sub);
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.7)',flexShrink:0}}>
          <button onClick={()=>setSub(null)} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:2}} onMouseEnter={e=>e.currentTarget.style.color='#f0ebe0'} onMouseLeave={e=>e.currentTarget.style.color='rgba(240,235,224,0.5)'}>← TECHNIQUE</button>
          <span style={{opacity:.2}}>|</span>
          <span style={{fontSize:11,fontFamily:'monospace',color:info?.color,letterSpacing:'.08em'}}>{info?.title.toUpperCase()}</span>
        </div>
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {sub==='solfege'    && <SolfegePage/>}
          {sub==='lecture'    && <LectureExercice/>}
          {sub==='flashcards' && <SpeedFlashcards/>}
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
          <button key={m.id} onClick={()=>m.ok&&setSub(m.id)} style={{background:m.ok?`${m.color}08`:'rgba(240,235,224,0.02)',border:`0.5px solid ${m.ok?m.color+'40':'rgba(240,235,224,0.08)'}`,borderRadius:4,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:m.ok?'pointer':'default',textAlign:'left',opacity:m.ok?1:.5,transition:'all 0.2s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <span style={{fontSize:26}}>{m.icon}</span>
              {m.ok?<span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}50`,padding:'2px 5px',borderRadius:2}}>DISPONIBLE</span>:<span style={{fontSize:8,fontFamily:'monospace',color:'rgba(240,235,224,0.25)',border:'0.5px solid rgba(240,235,224,0.1)',padding:'2px 5px',borderRadius:2}}>BIENTÔT</span>}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:'bold',marginBottom:3,color:m.ok?m.color:`${m.color}99`,fontFamily:'Georgia,serif'}}>{m.title}</div>
              <div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.04em'}}>{m.subtitle}</div>
            </div>
          </button>
        ))}
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
];

function ApprentissageLanding({onNavigate}){
  useEffect(()=>{ notifySectionVisit(); },[]);
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    <div style={{marginBottom:'1.75rem'}}>
      <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.75rem',letterSpacing:'-.02em'}}>Apprentissage</h2>
      <p style={{fontSize:12,lineHeight:1.65,color:'rgba(240,235,224,0.45)',fontFamily:'Georgia,serif',fontStyle:'italic',margin:0,paddingLeft:'.75rem',borderLeft:'2px solid rgba(240,235,224,0.15)'}}>
        "Les 4 essentiels à développer pour un pianiste sont son répertoire, sa technique, son oreille et sa connaissance de la théorie."
      </p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
      {APPRENTISSAGE_SECTIONS.map(s=>(<SectionCard key={s.id} {...s} onClick={()=>!s.lock&&onNavigate(s.id)}/>))}
    </div>
  </div>);
}

function ApprentissagePage({sub,setSub}){
  if(!sub||sub==='landing') return <ApprentissageLanding onNavigate={setSub}/>;
  const info = APPRENTISSAGE_SECTIONS.find(s=>s.id===sub);
  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    {/* Back bar */}
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.7)',flexShrink:0}}>
      <button onClick={()=>setSub('landing')} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',gap:5,fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:2,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#f0ebe0'} onMouseLeave={e=>e.currentTarget.style.color='rgba(240,235,224,0.5)'}>
        ← APPRENTISSAGE
      </button>
      {info&&<>
        <span style={{opacity:.2}}>|</span>
        <span style={{fontSize:11,fontFamily:'monospace',color:info.color,letterSpacing:'.08em'}}>{info.title.toUpperCase()}</span>
      </>}
    </div>
    <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
      {sub==='accords'&&<BibliothequePage/>}
      {sub==='oreille'&&<OreilPage/>}
      {sub==='exercices'&&<ExercicesPage/>}
      {sub==='theorie'&&<TheoriePage/>}
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
  const cards=[{label:'Temps de jeu',value:formatTime(stats.totalSeconds),icon:'⏱'},{label:'Exercices réalisés',value:stats.totalExercises||0,icon:'✓'},{label:'Sessions totales',value:stats.sessionsCount||0,icon:'◈'},{label:'Clés gagnées',value:`🗝️ ${stats.keys||0}`,icon:'🗝️'}];
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    <div style={{marginBottom:'1.25rem'}}>
      <div style={{fontSize:10,letterSpacing:'.2em',opacity:.28,fontFamily:'monospace',marginBottom:'.65rem'}}>INSTRUMENT</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{INSTRUMENTS.map(inst=>(<button key={inst.id} onClick={()=>inst.available&&setInstrument(inst.id)} style={{background:instrument===inst.id?'rgba(195,155,211,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${instrument===inst.id?'#C39BD3':'rgba(240,235,224,0.1)'}`,color:!inst.available?'rgba(240,235,224,0.2)':instrument===inst.id?'#C39BD3':'rgba(240,235,224,0.55)',padding:'.45rem .9rem',borderRadius:2,cursor:inst.available?'pointer':'not-allowed',fontFamily:'monospace',fontSize:11,transition:'all 0.2s',display:'flex',alignItems:'center',gap:6}}><span>{inst.icon}</span><span>{inst.label}</span>{!inst.available&&<span style={{fontSize:8,opacity:.35}}>BIENTÔT</span>}</button>))}</div>
    </div>
    <div style={{marginBottom:'.5rem'}}>
      <div style={{fontSize:10,letterSpacing:'.2em',opacity:.28,fontFamily:'monospace',marginBottom:'.25rem'}}>GRAPHE DE COMPÉTENCES</div>
      <RadarChart skills={skills}/>
      <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginTop:'.25rem'}}>{skills.map(s=>(<div key={s.id} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:6,height:6,borderRadius:'50%',background:s.color}}/><span style={{fontSize:9,fontFamily:'monospace',opacity:.4}}>{s.label}</span></div>))}</div>
    </div>
    <div style={{marginBottom:'1.75rem'}}>{skills.map(s=>(<div key={s.id} style={{marginBottom:9}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:11,fontFamily:'monospace',opacity:.55}}>{s.label}</span><span style={{fontSize:11,fontFamily:'monospace',color:s.color}}>{s.value}%</span></div><div style={{height:4,background:'rgba(240,235,224,0.07)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${s.value}%`,background:s.color,borderRadius:2}}/></div></div>))}</div>
    <div style={{marginBottom:'1rem'}}><div style={{fontSize:10,letterSpacing:'.2em',opacity:.28,fontFamily:'monospace',marginBottom:'.75rem'}}>STATISTIQUES</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
        {cards.map((s,i)=>(<div key={i} style={{background:'rgba(240,235,224,0.03)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4,padding:'1rem .75rem',textAlign:'center'}}><div style={{fontSize:20,fontWeight:'bold',color:'#C39BD3',fontFamily:'Georgia,serif',lineHeight:1,marginBottom:5}}>{s.value}</div><div style={{fontSize:8,opacity:.3,fontFamily:'monospace',letterSpacing:'.05em',lineHeight:1.4}}>{s.label.toUpperCase()}</div></div>))}
      </div>
    </div>
    <div style={{padding:'1rem',background:'rgba(195,155,211,0.04)',border:'0.5px solid rgba(195,155,211,0.1)',borderRadius:4}}><div style={{fontSize:10,color:'#C39BD3',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.4rem'}}>PROCHAINEMENT</div><p style={{fontSize:12,opacity:.4,lineHeight:1.6,fontFamily:'Georgia,serif',margin:0}}>Historique des sessions, accords maîtrisés, intervalles reconnus, progression hebdomadaire...</p></div>
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

  return(<div style={{minHeight:'100vh',background:'#0f0e0c',fontFamily:"'Georgia',serif",color:'#f0ebe0',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>

    {/* Header */}
    <header style={{position:'fixed',top:0,left:0,right:0,padding:'.85rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'0.5px solid rgba(240,235,224,0.08)',zIndex:10,background:'rgba(15,14,12,0.9)',backdropFilter:'blur(12px)'}}>
      <span style={{fontSize:12,letterSpacing:'.2em',opacity:.5,fontFamily:'monospace'}}>CHORD·STUDIO</span>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        {/* Keys display + Défis button */}
        <button onClick={()=>setShowDefis(v=>!v)} style={{display:'flex',alignItems:'center',gap:6,background:showDefis?'rgba(247,220,111,0.12)':'transparent',border:`0.5px solid ${showDefis?'rgba(247,220,111,0.4)':'rgba(240,235,224,0.15)'}`,color:showDefis?'#F7DC6F':'rgba(240,235,224,0.55)',padding:'.35rem .85rem',borderRadius:2,cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.08em',transition:'all 0.2s'}}>
          <span style={{fontSize:13}}>🗝️</span>
          <span style={{fontWeight:'bold'}}>{keys}</span>
          <span style={{opacity:.6}}>DÉFIS</span>
        </button>
        <button onClick={()=>setShowTip(v=>!v)} style={{background:'transparent',border:`0.5px solid ${showTip?'rgba(247,220,111,0.5)':'rgba(240,235,224,0.15)'}`,color:showTip?'#F7DC6F':'rgba(240,235,224,0.45)',padding:'.35rem .85rem',borderRadius:2,cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.1em',transition:'all 0.2s'}}>💡</button>
      </div>
    </header>

    <div style={{flex:1,paddingTop:55,paddingBottom:64,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {page==='competences'&&<CompetencesPage skills={skills} instrument={instrument} setInstrument={setInstrument} stats={stats}/>}
      {page==='apprentissage'&&<ApprentissagePage sub={apprentissageSub} setSub={setApprentiassageSub}/>}
      {page==='partage'&&<PlaceholderPage title="Partage" icon="↗" description="PARTAGE TA PROGRESSION BIENTÔT"/>}
        {page==='journal'&&<JournalPage/>}
    </div>

    <nav style={{position:'fixed',bottom:0,left:0,right:0,display:'flex',borderTop:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.92)',backdropFilter:'blur(12px)',zIndex:10}}>
      {NAV.map(({id,label,icon})=>{const isA=page===id,ac=NC[id];return(<button key={id} onClick={()=>{setPage(id);if(id==='apprentissage'&&apprentissageSub!=='landing'){/* keep sub */}}} style={{flex:1,padding:'.7rem .25rem',background:'none',border:'none',color:isA?ac:'rgba(240,235,224,0.28)',cursor:'pointer',transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:3,borderTop:isA?`1.5px solid ${ac}`:'1.5px solid transparent'}}><span style={{fontSize:15}}>{icon}</span><span style={{fontSize:8,fontFamily:'monospace',letterSpacing:'.04em'}}>{label.toUpperCase()}</span></button>);})}
    </nav>

    {showTip&&<TipPopup tip={TIPS[tipIndex]} onClose={()=>setShowTip(false)} onNext={()=>setTipIndex(i=>(i+1)%TIPS.length)}/>}
    {showDefis&&<DefisPanel stats={stats} onClose={()=>setShowDefis(false)}/>}

    <style>{`
      @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
      *{box-sizing:border-box} button{cursor:pointer}
    `}</style>
  </div>);
}
