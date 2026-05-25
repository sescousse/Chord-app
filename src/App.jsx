import { useState, useEffect } from "react";

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
  if (!notes||notes.length===0) return [];
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
  {id:'accords',   label:'Accords',   value:35, color:'#C39BD3'},
  {id:'oreille',   label:'Oreille',   value:20, color:'#85C1E9'},
  {id:'rythme',    label:'Rythme',    value:40, color:'#82E0AA'},
  {id:'theorie',   label:'Théorie',   value:25, color:'#F1948A'},
  {id:'technique', label:'Technique', value:30, color:'#F7DC6F'},
  {id:'lecture',   label:'Lecture',   value:15, color:'#AED6F1'},
];
const INSTRUMENTS = [
  {id:'piano',   label:'Piano',   icon:'🎹', available:true},
  {id:'guitare', label:'Guitare', icon:'🎸', available:false},
  {id:'basse',   label:'Basse',   icon:'🎵', available:false},
  {id:'violon',  label:'Violon',  icon:'🎻', available:false},
];

// ── localStorage stats helpers ────────────────────────────────────────────────
const STATS_KEY = 'chord_studio_stats';
function readStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)||'{}'); } catch { return {}; }
}
function saveStats(s) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch { /* Ignore localStorage write errors */ }
}
function addExercises(count) {
  const s=readStats();
  s.totalExercises=(s.totalExercises||0)+count;
  s.totalSessions=(s.totalSessions||0); // don't increment here
  saveStats(s);
}

// ── Audio ─────────────────────────────────────────────────────────────────────
let _audioCtx=null;
function getACtx(){
  if(!_audioCtx)_audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  if(_audioCtx.state==='suspended')_audioCtx.resume();
  return _audioCtx;
}
function playPianoNote(semi,delay=0,dur=1.8){
  try{
    const ctx=getACtx(),freq=261.63*Math.pow(2,semi/12),t=ctx.currentTime+delay;
    [[1,0.45],[2,0.12],[3,0.07],[4,0.03]].forEach(([h,g])=>{
      const o=ctx.createOscillator(),gn=ctx.createGain();
      o.connect(gn);gn.connect(ctx.destination);
      o.frequency.value=freq*h;o.type='sine';
      gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+0.008);gn.gain.exponentialRampToValueAtTime(0.001,t+dur);
      o.start(t);o.stop(t+dur+0.05);
    });
  }catch(e){
    console.warn('Audio playback failed', e);
  }
}
function playSeq(n1,n2){playPianoNote(n1,0);playPianoNote(n2,1.1);}
function playSimul(n1,n2){playPianoNote(n1,0,2.0);playPianoNote(n2,0,2.0);}
function playChordArp(notes){notes.forEach((s,i)=>playPianoNote(s,i*0.1,2.2));}
function playChordSimul(notes){notes.forEach(s=>playPianoNote(s,0,2.5));}

// ── Intervals data ────────────────────────────────────────────────────────────
const INTERVALS_DATA=[
  {semi:1, name:"2nde min.", full:"Seconde mineure",  color:"#E8A87C"},
  {semi:2, name:"2nde maj.", full:"Seconde majeure",  color:"#F7DC6F"},
  {semi:3, name:"3ce min.",  full:"Tierce mineure",   color:"#82E0AA"},
  {semi:4, name:"3ce maj.",  full:"Tierce majeure",   color:"#85C1E9"},
  {semi:5, name:"4te juste", full:"Quarte juste",     color:"#C39BD3"},
  {semi:6, name:"Triton",    full:"Triton",           color:"#F1948A"},
  {semi:7, name:"5te juste", full:"Quinte juste",     color:"#AED6F1"},
  {semi:8, name:"6te min.",  full:"Sixte mineure",    color:"#82E0AA"},
  {semi:9, name:"6te maj.",  full:"Sixte majeure",    color:"#E8A87C"},
  {semi:10,name:"7e min.",   full:"Septième mineure", color:"#C39BD3"},
  {semi:11,name:"7e maj.",   full:"Septième majeure", color:"#F7DC6F"},
  {semi:12,name:"Octave",    full:"Octave",           color:"#AED6F1"},
];
const NOTE_NAMES_12=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
function semiToName(semi){const oct=4+Math.floor(semi/12);return `${NOTE_NAMES_12[semi%12]}${oct}`;}
function genEx(semiArr){
  const note1=Math.floor(Math.random()*12);
  const intSemi=semiArr[Math.floor(Math.random()*semiArr.length)];
  return{note1,note2:note1+intSemi,intSemi};
}
function genChordEx(typeArr){
  const rootSemi=Math.floor(Math.random()*12);
  const type=typeArr[Math.floor(Math.random()*typeArr.length)];
  return{rootSemi,type,notes:CHORD_TYPES[type].formula.map(i=>rootSemi+i)};
}

// ═══════════════════════════════════════════════════════════════════
// ── UI COMPONENTS ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
function RadarChart({skills}){
  const cx=130,cy=130,r=82,n=skills.length,sa=-Math.PI/2,step=(2*Math.PI)/n;
  const pt=(a,r2)=>({x:cx+r2*Math.cos(a),y:cy+r2*Math.sin(a)});
  const axes=skills.map((_,i)=>pt(sa+i*step,r));
  const skillPts=skills.map((s,i)=>pt(sa+i*step,(s.value/100)*r));
  const polygon=skillPts.map(p=>`${p.x},${p.y}`).join(' ');
  const lr=r+28;
  return(
    <div style={{padding:'0 55px 20px'}}>
      <svg viewBox="0 0 260 260" style={{width:'100%',maxWidth:260,display:'block',margin:'0 auto',overflow:'visible'}}>
        {[0.25,0.5,0.75,1].map((lv,gi)=>(
          <polygon key={gi} points={axes.map((_,i)=>{const p=pt(sa+i*step,lv*r);return `${p.x},${p.y}`;}).join(' ')} fill="none" stroke="rgba(240,235,224,0.07)" strokeWidth={1}/>
        ))}
        {axes.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(240,235,224,0.1)" strokeWidth={1}/>)}
        <polygon points={polygon} fill="rgba(195,155,211,0.1)" stroke="#C39BD3" strokeWidth={1.5}/>
        {skillPts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3.5} fill={skills[i].color}/>)}
        {skills.map((s,i)=>{
          const a=sa+i*step,lx=cx+lr*Math.cos(a),ly=cy+lr*Math.sin(a);
          const anchor=lx>cx+5?'start':lx<cx-5?'end':'middle';
          const oy=ly<cy-5?-4:ly>cy+5?13:4;
          return(<g key={s.id}>
            <text x={lx} y={ly+oy} textAnchor={anchor} fontSize={10} fill="rgba(240,235,224,0.52)" fontFamily="monospace" letterSpacing="0.04em">{s.label.toUpperCase()}</text>
            <text x={lx} y={ly+oy+13} textAnchor={anchor} fontSize={9} fill={s.color} fontFamily="monospace">{s.value}%</text>
          </g>);
        })}
        <text x={cx} y={cy+4} textAnchor="middle" fontSize={8} fill="rgba(240,235,224,0.15)" fontFamily="monospace">PIANO</text>
      </svg>
    </div>
  );
}

function PianoKeyboard({activeAbsIndices=[],color,colors={}}){
  const whites=PIANO_KEYS_DATA.filter(k=>k.type==='white');
  const blacks=PIANO_KEYS_DATA.filter(k=>k.type==='black');
  const getC=(ai)=>colors[ai]||(activeAbsIndices.includes(ai)?color:null);
  return(
    <svg viewBox={`0 0 ${14*WW} ${WH+20}`} style={{width:'100%',maxWidth:560,display:'block',margin:'0 auto'}}>
      {whites.map(({absIdx,wi,note})=>{const c=getC(absIdx);return(<g key={`w${absIdx}`}><rect x={wi*WW} y={0} width={WW} height={WH} rx={3} fill={c||'#f3ede0'} stroke="#1a1714" strokeWidth={1.5}/>{c&&<text x={wi*WW+WW/2} y={WH-10} textAnchor="middle" fontSize={10} fill="#1a1714" fontFamily="monospace" fontWeight="bold">{note}</text>}</g>);})}
      {blacks.map(({absIdx,wi,note})=>{const c=getC(absIdx),x=(wi+1)*WW-BW*0.58;return(<g key={`b${absIdx}`}><rect x={x} y={0} width={BW} height={BH} rx={2} fill={c||'#181614'} stroke="#0a0908" strokeWidth={0.8}/>{c&&<text x={x+BW/2} y={BH-8} textAnchor="middle" fontSize={8} fill="#1a1714" fontFamily="monospace" fontWeight="bold">{note}</text>}</g>);})}
      <line x1={7*WW} y1={0} x2={7*WW} y2={WH} stroke="rgba(240,235,224,0.2)" strokeWidth={1} strokeDasharray="4,3"/>
      <text x={3.5*WW} y={WH+15} textAnchor="middle" fontSize={9} fill="rgba(240,235,224,0.22)" fontFamily="monospace">OCT. 1</text>
      <text x={10.5*WW} y={WH+15} textAnchor="middle" fontSize={9} fill="rgba(240,235,224,0.22)" fontFamily="monospace">OCT. 2</text>
    </svg>
  );
}

function Hearts({total,remaining}){
  if(total===0)return<span style={{fontSize:11,fontFamily:'monospace',color:'rgba(240,235,224,0.4)'}}>∞ vies</span>;
  return(<div style={{display:'flex',gap:3}}>{Array.from({length:total}).map((_,i)=>(<div key={i} style={{width:13,height:13,borderRadius:'50%',background:i<remaining?'#F1948A':'rgba(240,235,224,0.1)',transition:'all 0.3s'}}/>))}</div>);
}

function TipPopup({tip,onClose,onNext}){
  return(
    <div style={{position:'fixed',bottom:'5rem',right:'1.5rem',width:'min(300px,calc(100vw - 3rem))',background:'#1c1a16',border:'0.5px solid rgba(240,235,224,0.15)',borderRadius:4,padding:'1.25rem',zIndex:200,animation:'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
        <span style={{fontSize:10,letterSpacing:'0.15em',fontFamily:'monospace',padding:'3px 8px',borderRadius:2,background:tip.level==='Débutant'?'rgba(130,224,170,0.12)':'rgba(133,193,233,0.12)',color:tip.level==='Débutant'?'#82E0AA':'#85C1E9'}}>{tip.level.toUpperCase()}</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#f0ebe0',opacity:0.35,cursor:'pointer',fontSize:18,padding:'0 2px',lineHeight:1}}>×</button>
      </div>
      <p style={{fontSize:13.5,lineHeight:1.65,opacity:0.78,margin:'0 0 1rem',fontFamily:'Georgia,serif'}}>{tip.text}</p>
      <button onClick={onNext} style={{background:'transparent',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.4)',padding:'0.4rem 0.75rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'0.1em'}} onMouseEnter={e=>{e.currentTarget.style.color='rgba(240,235,224,0.7)';e.currentTarget.style.borderColor='rgba(240,235,224,0.3)';}} onMouseLeave={e=>{e.currentTarget.style.color='rgba(240,235,224,0.4)';e.currentTarget.style.borderColor='rgba(240,235,224,0.15)';}}>CONSEIL SUIVANT →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ── COMPÉTENCES PAGE (merged home + stats) ────────────────────────
// ═══════════════════════════════════════════════════════════════════
function CompétencesPage({skills,instrument,setInstrument}){
  const [stats] = useState(()=>readStats());

  const formatTime=(min)=>{
    if(!min||min<1)return'0 min';
    if(min<60)return`${min} min`;
    return`${Math.floor(min/60)}h ${min%60}m`;
  };

  const STAT_CARDS=[
    {value:formatTime(stats.totalMinutes||0), label:'TEMPS DE JEU',    color:'#85C1E9', icon:'⏱'},
    {value:stats.totalExercises||0,           label:'EXERCICES',        color:'#82E0AA', icon:'✓', unit:'faits'},
    {value:stats.streak||0,                   label:'SÉRIE',            color:'#F7DC6F', icon:'🔥', unit:'jours'},
    {value:stats.totalSessions||0,            label:'SESSIONS',         color:'#C39BD3', icon:'◈', unit:'totales'},
  ];

  return(
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>

      {/* Instrument */}
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{fontSize:10,letterSpacing:'0.2em',opacity:0.28,fontFamily:'monospace',marginBottom:'0.65rem'}}>INSTRUMENT</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {INSTRUMENTS.map(inst=>(
            <button key={inst.id} onClick={()=>inst.available&&setInstrument(inst.id)}
              style={{background:instrument===inst.id?'rgba(195,155,211,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${instrument===inst.id?'#C39BD3':'rgba(240,235,224,0.1)'}`,color:!inst.available?'rgba(240,235,224,0.2)':instrument===inst.id?'#C39BD3':'rgba(240,235,224,0.55)',padding:'0.45rem 0.9rem',borderRadius:2,cursor:inst.available?'pointer':'not-allowed',fontFamily:'monospace',fontSize:11,transition:'all 0.2s',display:'flex',alignItems:'center',gap:6}}>
              <span>{inst.icon}</span><span>{inst.label}</span>
              {!inst.available&&<span style={{fontSize:8,opacity:0.35}}>BIENTÔT</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Radar chart */}
      <div style={{marginBottom:'1.5rem',textAlign:'center'}}>
        <div style={{fontSize:10,letterSpacing:'0.2em',opacity:0.28,fontFamily:'monospace',marginBottom:'0.25rem'}}>GRAPHE DE COMPÉTENCES</div>
        <RadarChart skills={skills}/>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginTop:'0.25rem'}}>
          {skills.map(s=>(
            <div key={s.id} style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:s.color}}/>
              <span style={{fontSize:9,fontFamily:'monospace',opacity:0.4}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{fontSize:10,letterSpacing:'0.2em',opacity:0.28,fontFamily:'monospace',marginBottom:'0.75rem'}}>STATISTIQUES DE PRATIQUE</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
          {STAT_CARDS.map((s,i)=>(
            <div key={i} style={{background:'rgba(240,235,224,0.03)',border:`0.5px solid ${s.color}30`,borderRadius:4,padding:'1rem',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:8,right:10,fontSize:18,opacity:0.15}}>{s.icon}</div>
              <div style={{fontSize:26,fontWeight:'bold',color:s.color,fontFamily:'Georgia,serif',lineHeight:1,marginBottom:4}}>{s.value}</div>
              {s.unit&&<div style={{fontSize:9,color:s.color,opacity:0.6,fontFamily:'monospace',marginBottom:2}}>{s.unit}</div>}
              <div style={{fontSize:9,opacity:0.3,fontFamily:'monospace',letterSpacing:'0.1em'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill breakdown bars */}
      <div>
        <div style={{fontSize:10,letterSpacing:'0.2em',opacity:0.28,fontFamily:'monospace',marginBottom:'0.75rem'}}>DÉTAIL PAR COMPÉTENCE</div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {skills.map(s=>(
            <div key={s.id}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:11,fontFamily:'monospace',opacity:0.6}}>{s.label}</span>
                <span style={{fontSize:11,fontFamily:'monospace',color:s.color}}>{s.value}%</span>
              </div>
              <div style={{height:5,background:'rgba(240,235,224,0.07)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${s.value}%`,background:s.color,borderRadius:3,transition:'width 1s ease'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder pour futures stats */}
      <div style={{marginTop:'1.5rem',padding:'1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4}}>
        <div style={{fontSize:10,opacity:0.25,fontFamily:'monospace',letterSpacing:'0.1em',marginBottom:'0.4rem'}}>PROCHAINEMENT</div>
        <p style={{fontSize:12,opacity:0.3,fontFamily:'Georgia,serif',margin:0,lineHeight:1.5}}>Historique de sessions, notes par tonalité, taux de réussite par type d'accord…</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ── SHARED EXERCISE COMPONENTS ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
function SessionConfig({title,items,selected,onToggle,onToggleAll,exCount,setExCount,maxLives,setMaxLives,onStart,onBack,minItems=2}){
  const allSelected=selected.size===items.length,canStart=selected.size>=minItems;
  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontSize:18,padding:'0 4px'}}>←</button>
        <div>
          <h2 style={{fontSize:20,fontWeight:'bold',letterSpacing:'-0.02em',margin:0}}>{title}</h2>
          <p style={{fontSize:11,opacity:0.35,fontFamily:'monospace',margin:'2px 0 0'}}>CONFIGURATION DE SESSION</p>
        </div>
      </div>
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
          <span style={{fontSize:10,letterSpacing:'0.15em',opacity:0.35,fontFamily:'monospace'}}>À TRAVAILLER</span>
          <button onClick={onToggleAll} style={{background:allSelected?'rgba(133,193,233,0.15)':'transparent',border:`0.5px solid ${allSelected?'#85C1E9':'rgba(240,235,224,0.2)'}`,color:allSelected?'#85C1E9':'rgba(240,235,224,0.5)',padding:'3px 8px',borderRadius:2,cursor:'pointer',fontSize:9,fontFamily:'monospace',letterSpacing:'0.1em'}}>
            {allSelected?'DÉSÉLECTIONNER':'TOUT SÉLECTIONNER'}
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          {items.map(item=>{
            const on=selected.has(item.id);
            return(
              <button key={item.id} onClick={()=>onToggle(item.id)} style={{background:on?`${item.color}15`:'rgba(240,235,224,0.02)',border:`0.5px solid ${on?item.color:'rgba(240,235,224,0.1)'}`,borderRadius:3,padding:'0.6rem 0.75rem',cursor:'pointer',display:'flex',alignItems:'center',gap:8,textAlign:'left',transition:'all 0.2s'}}>
                <div style={{width:14,height:14,borderRadius:2,flexShrink:0,background:on?item.color:'rgba(240,235,224,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {on&&<span style={{fontSize:9,color:'#0f0e0c',fontWeight:'bold'}}>✓</span>}
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:'bold',color:on?item.color:'rgba(240,235,224,0.6)',fontFamily:'monospace'}}>{item.name}</div>
                  {item.sub&&<div style={{fontSize:9,opacity:0.4,fontFamily:'monospace'}}>{item.sub}</div>}
                </div>
              </button>
            );
          })}
        </div>
        {!canStart&&<p style={{fontSize:11,color:'#F1948A',fontFamily:'monospace',marginTop:'0.5rem',opacity:0.8}}>⚠ Sélectionne au moins {minItems} éléments</p>}
      </div>
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,letterSpacing:'0.15em',opacity:0.35,fontFamily:'monospace',marginBottom:'0.65rem'}}>EXERCICES PAR SESSION</div>
        <div style={{display:'flex',gap:8}}>
          {[5,10,15,20].map(n=>(<button key={n} onClick={()=>setExCount(n)} style={{flex:1,padding:'0.6rem',background:exCount===n?'rgba(133,193,233,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${exCount===n?'#85C1E9':'rgba(240,235,224,0.1)'}`,color:exCount===n?'#85C1E9':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:14,fontWeight:'bold',transition:'all 0.2s'}}>{n}</button>))}
        </div>
      </div>
      <div style={{marginBottom:'2rem'}}>
        <div style={{fontSize:10,letterSpacing:'0.15em',opacity:0.35,fontFamily:'monospace',marginBottom:'0.65rem'}}>VIES</div>
        <div style={{display:'flex',gap:8}}>
          {[[3,'3 ❤'],[5,'5 ❤'],[0,'∞']].map(([n,label])=>(<button key={n} onClick={()=>setMaxLives(n)} style={{flex:1,padding:'0.6rem',background:maxLives===n?'rgba(241,148,138,0.15)':'rgba(240,235,224,0.03)',border:`0.5px solid ${maxLives===n?'#F1948A':'rgba(240,235,224,0.1)'}`,color:maxLives===n?'#F1948A':'rgba(240,235,224,0.5)',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:13,fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>))}
        </div>
      </div>
      <button onClick={()=>canStart&&onStart()} style={{width:'100%',padding:'1rem',background:canStart?'rgba(133,193,233,0.15)':'rgba(240,235,224,0.03)',border:`1px solid ${canStart?'#85C1E9':'rgba(240,235,224,0.1)'}`,color:canStart?'#85C1E9':'rgba(240,235,224,0.25)',borderRadius:3,cursor:canStart?'pointer':'not-allowed',fontSize:13,fontFamily:'monospace',letterSpacing:'0.15em',fontWeight:'bold',transition:'all 0.3s'}}>
        COMMENCER LA SESSION →
      </button>
    </div>
  );
}

function SessionResults({score,exCount,lives,maxLives,history,categoryData,onRetry,onReconfig}){
  const pct=Math.round((score/exCount)*100);
  const msg=pct>=90?'Excellent ! 🎉':pct>=70?'Très bien ! 👍':pct>=50?'Continue comme ça !':'Entraîne-toi encore !';
  const mc=pct>=90?'#82E0AA':pct>=70?'#85C1E9':pct>=50?'#F7DC6F':'#F1948A';
  const stats={};
  categoryData.forEach(c=>{stats[c.id]={correct:0,total:0,color:c.color,name:c.name};});
  history.forEach(h=>{if(stats[h.catId]){stats[h.catId].total++;if(h.correct)stats[h.catId].correct++;}});
  const used=categoryData.filter(c=>stats[c.id]?.total>0);
  return(
    <div style={{flex:1,overflowY:'auto',padding:'1.25rem'}}>
      <div style={{textAlign:'center',marginBottom:'2rem'}}>
        <div style={{fontSize:11,letterSpacing:'0.2em',opacity:0.3,fontFamily:'monospace',marginBottom:'1.5rem'}}>RÉSULTATS DE SESSION</div>
        <div style={{fontSize:72,fontWeight:'bold',color:mc,fontFamily:'Georgia,serif',lineHeight:1}}>{score}<span style={{fontSize:32,opacity:0.5}}>/{exCount}</span></div>
        <div style={{fontSize:24,color:mc,marginBottom:'0.5rem'}}>{pct}%</div>
        <div style={{fontSize:15,opacity:0.6,fontFamily:'Georgia,serif'}}>{msg}</div>
        {maxLives>0&&<div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,marginTop:'1rem'}}><span style={{fontSize:11,opacity:0.4,fontFamily:'monospace'}}>VIES RESTANTES</span><Hearts total={maxLives} remaining={Math.max(0,lives)}/></div>}
      </div>
      {used.length>0&&(
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{fontSize:10,letterSpacing:'0.15em',opacity:0.3,fontFamily:'monospace',marginBottom:'0.75rem'}}>DÉTAIL</div>
          {used.map(c=>{const st=stats[c.id],p=st.total>0?Math.round((st.correct/st.total)*100):0;return(<div key={c.id} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:11,fontFamily:'monospace',color:c.color}}>{c.name}</span><span style={{fontSize:10,fontFamily:'monospace',opacity:0.5}}>{st.correct}/{st.total}</span></div>
            <div style={{height:5,background:'rgba(240,235,224,0.07)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${p}%`,background:c.color,borderRadius:2,transition:'width 0.8s ease'}}/></div>
          </div>);})}
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <button onClick={onRetry} style={{padding:'0.9rem',background:'rgba(133,193,233,0.15)',border:'1px solid #85C1E9',color:'#85C1E9',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'0.15em',fontWeight:'bold'}}>🔄 REJOUER</button>
        <button onClick={onReconfig} style={{padding:'0.9rem',background:'transparent',border:'0.5px solid rgba(240,235,224,0.2)',color:'rgba(240,235,224,0.5)',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'0.15em'}}>⚙ RECONFIGURER</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ── INTERVALLES ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
function IntervalExercise({config,onFinish,onBack}){
  const{selectedIds,exCount,maxLives}=config;
  const[exercises]=useState(()=>Array.from({length:exCount},()=>genEx(selectedIds)));
  const[idx,setIdx]=useState(0);
  const[lives,setLives]=useState(maxLives||999);
  const[score,setScore]=useState(0);
  const[answered,setAnswered]=useState(false);
  const[userSemi,setUserSemi]=useState(null);
  const[history,setHistory]=useState([]);
  const[showPiano,setShowPiano]=useState(false);
  const ex=exercises[idx],correct=userSemi===ex?.intSemi;
  const ivInfo=INTERVALS_DATA.find(i=>i.semi===ex?.intSemi);
  const selectedIvs=INTERVALS_DATA.filter(i=>selectedIds.includes(i.semi));
  useEffect(()=>{if(!ex)return;const t=setTimeout(()=>playSeq(ex.note1,ex.note2),400);return()=>clearTimeout(t);},[idx, ex]);
  const handleAnswer=(semi)=>{
    if(answered)return;const ok=semi===ex.intSemi;setUserSemi(semi);setAnswered(true);
    const h=[...history,{catId:semi,intSemi:ex.intSemi,correct:ok,userSemi:semi}];setHistory(h);
    if(ok)setScore(s=>s+1);else if(maxLives>0){const nl=lives-1;setLives(nl);if(nl<=0){setTimeout(()=>onFinish({score,lives:0,history:h,exCount}),1800);return;}}
  };
  const handleNext=()=>{
    if(idx>=exCount-1){onFinish({score:score+(correct?1:0),lives,history,exCount});return;}
    setIdx(i=>i+1);setAnswered(false);setUserSemi(null);setShowPiano(false);
  };
  const pianoColors={};
  if(ex&&answered){pianoColors[ex.note1]='#85C1E9';pianoColors[ex.note2]=ivInfo?.color||'#C39BD3';}
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'0.75rem 1.25rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'rgba(15,14,12,0.5)'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(240,235,224,0.4)',cursor:'pointer',fontSize:16}}>←</button>
        <div style={{flex:1,margin:'0 1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:10,fontFamily:'monospace',opacity:0.4}}>{idx+1}/{exCount}</span><span style={{fontSize:10,fontFamily:'monospace',color:'#82E0AA'}}>{score} ✓</span></div>
          <div style={{height:3,background:'rgba(240,235,224,0.08)',borderRadius:2}}><div style={{height:'100%',width:`${((idx+1)/exCount)*100}%`,background:'#85C1E9',borderRadius:2,transition:'width 0.3s ease'}}/></div>
        </div>
        <Hearts total={maxLives} remaining={lives}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4}}>
          <p style={{fontSize:10,letterSpacing:'0.15em',opacity:0.35,fontFamily:'monospace',marginBottom:'1rem'}}>QUEL EST CET INTERVALLE ?</p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'2rem',marginBottom:'1rem'}}>
            <div style={{textAlign:'center'}}><div style={{width:54,height:54,borderRadius:'50%',background:'rgba(133,193,233,0.2)',border:'1px solid #85C1E9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:'bold',color:'#85C1E9',fontFamily:'monospace',margin:'0 auto 5px'}}>{ex?NOTE_NAMES_12[ex.note1%12]:'—'}</div><div style={{fontSize:9,opacity:0.3,fontFamily:'monospace'}}>{ex?semiToName(ex.note1):''}</div></div>
            <div style={{fontSize:20,opacity:0.25}}>→</div>
            <div style={{textAlign:'center'}}><div style={{width:54,height:54,borderRadius:'50%',background:answered?(ivInfo?`${ivInfo.color}22`:'rgba(240,235,224,0.05)'):'rgba(240,235,224,0.05)',border:`1px solid ${answered?(ivInfo?.color||'rgba(240,235,224,0.3)'):'rgba(240,235,224,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:answered?17:22,fontWeight:'bold',color:answered?(ivInfo?.color||'#f0ebe0'):'rgba(240,235,224,0.15)',fontFamily:'monospace',margin:'0 auto 5px',transition:'all 0.3s'}}>{answered?(ex?NOTE_NAMES_12[ex.note2%12]:'—'):'?'}</div><div style={{fontSize:9,opacity:0.3,fontFamily:'monospace'}}>{answered&&ex?semiToName(ex.note2):''}</div></div>
          </div>
          {answered&&(<div style={{animation:'fadeIn 0.3s ease',marginBottom:'0.75rem'}}><div style={{fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',color:correct?'#82E0AA':'#F1948A',marginBottom:4}}>{correct?'✓ Correct !':'✗ Raté'}</div><div style={{fontSize:13,color:ivInfo?.color,fontFamily:'monospace'}}>{ivInfo?.full} ({ex?.intSemi} demi-ton{ex?.intSemi>1?'s':''})</div>{!correct&&<div style={{fontSize:11,opacity:0.4,marginTop:4,fontFamily:'monospace'}}>Tu as répondu : {INTERVALS_DATA.find(i=>i.semi===userSemi)?.full}</div>}</div>)}
          <div style={{display:'flex',gap:7,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>ex&&playSeq(ex.note1,ex.note2)} style={{background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.6)',padding:'0.4rem 0.85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>🔊 SÉQUENTIEL</button>
            <button onClick={()=>ex&&playSimul(ex.note1,ex.note2)} style={{background:'rgba(133,193,233,0.07)',border:'0.5px solid rgba(133,193,233,0.25)',color:'#85C1E9',padding:'0.4rem 0.85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>🎵 SIMULTANÉ</button>
            {answered&&<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?'rgba(133,193,233,0.1)':'rgba(240,235,224,0.05)',border:`0.5px solid ${showPiano?'#85C1E9':'rgba(240,235,224,0.15)'}`,color:showPiano?'#85C1E9':'rgba(240,235,224,0.5)',padding:'0.4rem 0.85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>🎹 CLAVIER</button>}
          </div>
        </div>
        {answered&&showPiano&&ex&&(<div style={{padding:'1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease',overflowX:'auto'}}><div style={{fontSize:9,opacity:0.3,fontFamily:'monospace',marginBottom:'0.75rem',textAlign:'center'}}><span style={{color:'#85C1E9'}}>■</span> Départ &nbsp;<span style={{color:ivInfo?.color}}>■</span> Arrivée</div><PianoKeyboard colors={pianoColors}/></div>)}
        <div>
          <div style={{fontSize:10,letterSpacing:'0.15em',opacity:0.3,fontFamily:'monospace',marginBottom:'0.65rem'}}>{answered?'INTERVALLES':'CHOISIR L\'INTERVALLE'}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
            {selectedIvs.map(iv=>{
              const isUser=userSemi===iv.semi,isOk=iv.semi===ex?.intSemi;
              let bg='rgba(240,235,224,0.03)',border='rgba(240,235,224,0.1)',col='rgba(240,235,224,0.7)';
              if(answered){if(isOk){bg=`${iv.color}20`;border=iv.color;col=iv.color;}else if(isUser){bg='rgba(241,148,138,0.1)';border='#F1948A';col='#F1948A';}else{col='rgba(240,235,224,0.2)';}}
              return(<button key={iv.semi} onClick={()=>handleAnswer(iv.semi)} disabled={answered} style={{background:bg,border:`0.5px solid ${border}`,color:col,padding:'0.65rem 0.25rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:11,fontFamily:'monospace',fontWeight:'bold',transition:'all 0.2s',lineHeight:1.3}}>{iv.name}</button>);
            })}
          </div>
        </div>
        {answered&&(<button onClick={handleNext} style={{width:'100%',padding:'0.9rem',background:correct?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.08)',border:`1px solid ${correct?'#82E0AA':'#F1948A'}`,color:correct?'#82E0AA':'#F1948A',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'0.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>{idx>=exCount-1?'VOIR LES RÉSULTATS →':'EXERCICE SUIVANT →'}</button>)}
      </div>
    </div>
  );
}

function IntervallesSection({onBack}){
  const[screen,setScreen]=useState('config');
  const[config,setConfig]=useState(null);
  const[result,setResult]=useState(null);
  const[selected,setSelected]=useState(new Set([3,4,5,7]));
  const[exCount,setExCount]=useState(10);
  const[maxLives,setMaxLives]=useState(3);
  const items=INTERVALS_DATA.map(iv=>({id:iv.semi,name:iv.name,sub:`${iv.semi} demi-ton${iv.semi>1?'s':''}`,color:iv.color}));
  const toggle=(id)=>setSelected(prev=>{const n=new Set(prev);if(n.has(id)){if(n.size>2)n.delete(id);}else n.add(id);return n;});
  const toggleAll=()=>{if(selected.size===items.length)setSelected(new Set([3,4]));else setSelected(new Set(items.map(i=>i.id)));};
  const handleFinish=(res)=>{
    addExercises(res.exCount);
    setResult(res); setScreen('results');
  };
  if(screen==='config')return<SessionConfig title="Intervalles" items={items} selected={selected} onToggle={toggle} onToggleAll={toggleAll} exCount={exCount} setExCount={setExCount} maxLives={maxLives} setMaxLives={setMaxLives} onStart={()=>{setConfig({selectedIds:Array.from(selected),exCount,maxLives});setScreen('exercise');}} onBack={onBack}/>;
  if(screen==='exercise')return<IntervalExercise config={config} onBack={()=>setScreen('config')} onFinish={handleFinish}/>;
  if(screen==='results')return<SessionResults score={result.score} exCount={result.exCount} lives={result.lives} maxLives={maxLives} history={result.history} categoryData={INTERVALS_DATA.map(iv=>({id:iv.semi,name:iv.name,color:iv.color}))} onRetry={()=>setScreen('exercise')} onReconfig={()=>setScreen('config')}/>;
}

// ═══════════════════════════════════════════════════════════════════
// ── ACCORDS À L'OREILLE ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const TYPE_COLORS={Majeures:'#85C1E9',Mineures:'#82E0AA',"Dom. 7":'#F7DC6F',"Maj. 7":'#C39BD3',"Min. 7":'#F1948A',"MinMaj. 7":'#E8A87C'};

function ChordExercise({config,onFinish,onBack}){
  const{selectedTypes,exCount,maxLives}=config;
  const[exercises]=useState(()=>Array.from({length:exCount},()=>genChordEx(selectedTypes)));
  const[idx,setIdx]=useState(0);
  const[lives,setLives]=useState(maxLives||999);
  const[score,setScore]=useState(0);
  const[answered,setAnswered]=useState(false);
  const[userType,setUserType]=useState(null);
  const[history,setHistory]=useState([]);
  const[showPiano,setShowPiano]=useState(false);
  const ex=exercises[idx],correct=userType===ex?.type;
  const chordInfo=ex?CHORD_TYPES[ex.type]:null;
  const rootName=ex?NOTE_NAMES_12[ex.rootSemi]:'';
  const selectedChordTypes=Object.entries(CHORD_TYPES).filter(([t])=>selectedTypes.includes(t));
  useEffect(()=>{if(!ex)return;const t=setTimeout(()=>playChordArp(ex.notes),400);return()=>clearTimeout(t);},[ex]);
  const handleAnswer=(type)=>{
    if(answered)return;const ok=type===ex.type;setUserType(type);setAnswered(true);
    const h=[...history,{catId:type,type:ex.type,correct:ok,userType:type}];setHistory(h);
    if(ok)setScore(s=>s+1);else if(maxLives>0){const nl=lives-1;setLives(nl);if(nl<=0){setTimeout(()=>onFinish({score,lives:0,history:h,exCount}),1800);return;}}
  };
  const handleNext=()=>{
    if(idx>=exCount-1){onFinish({score:score+(correct?1:0),lives,history,exCount});return;}
    setIdx(i=>i+1);setAnswered(false);setUserType(null);setShowPiano(false);
  };
  const pianoColors={};
  if(ex&&answered){const c=TYPE_COLORS[ex.type]||'#C39BD3';ex.notes.forEach((n,i)=>{pianoColors[n]=i===0?'#85C1E9':c;});}
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'0.75rem 1.25rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'rgba(15,14,12,0.5)'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(240,235,224,0.4)',cursor:'pointer',fontSize:16}}>←</button>
        <div style={{flex:1,margin:'0 1rem'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:10,fontFamily:'monospace',opacity:0.4}}>{idx+1}/{exCount}</span><span style={{fontSize:10,fontFamily:'monospace',color:'#82E0AA'}}>{score} ✓</span></div><div style={{height:3,background:'rgba(240,235,224,0.08)',borderRadius:2}}><div style={{height:'100%',width:`${((idx+1)/exCount)*100}%`,background:'#C39BD3',borderRadius:2,transition:'width 0.3s ease'}}/></div></div>
        <Hearts total={maxLives} remaining={lives}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div style={{textAlign:'center',padding:'1.25rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.08)',borderRadius:4}}>
          <p style={{fontSize:10,letterSpacing:'0.15em',opacity:0.35,fontFamily:'monospace',marginBottom:'1.25rem'}}>QUEL TYPE D'ACCORD ?</p>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:answered?52:48,fontWeight:'bold',fontFamily:'Georgia,serif',color:answered?(TYPE_COLORS[ex.type]||'#C39BD3'):'rgba(240,235,224,0.15)',transition:'all 0.4s',lineHeight:1,marginBottom:6}}>{answered?`${rootName}${chordInfo?.suffix}`:'?'}</div>
            {answered&&<div style={{fontSize:13,color:TYPE_COLORS[ex.type]||'#C39BD3',fontFamily:'monospace'}}>{chordInfo?.label}</div>}
            {answered&&ex&&<div style={{fontSize:11,opacity:0.4,fontFamily:'monospace',marginTop:4}}>{ex.notes.map(n=>NOTE_NAMES_12[n%12]).join(' – ')}</div>}
          </div>
          {answered&&(<div style={{animation:'fadeIn 0.3s ease',marginBottom:'0.75rem'}}><div style={{fontSize:16,fontWeight:'bold',fontFamily:'Georgia,serif',color:correct?'#82E0AA':'#F1948A'}}>{correct?'✓ Correct !':'✗ Raté — c\'était : '+(chordInfo?.label||'')}</div></div>)}
          <div style={{display:'flex',gap:7,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>ex&&playChordArp(ex.notes)} style={{background:'rgba(240,235,224,0.05)',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.6)',padding:'0.4rem 0.85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>🔊 ARPÈGE</button>
            <button onClick={()=>ex&&playChordSimul(ex.notes)} style={{background:'rgba(195,155,211,0.07)',border:'0.5px solid rgba(195,155,211,0.3)',color:'#C39BD3',padding:'0.4rem 0.85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>🎵 SIMULTANÉ</button>
            {answered&&<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?'rgba(195,155,211,0.1)':'rgba(240,235,224,0.05)',border:`0.5px solid ${showPiano?'#C39BD3':'rgba(240,235,224,0.15)'}`,color:showPiano?'#C39BD3':'rgba(240,235,224,0.5)',padding:'0.4rem 0.85rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>🎹 CLAVIER</button>}
          </div>
        </div>
        {answered&&showPiano&&ex&&(<div style={{padding:'1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease',overflowX:'auto'}}><div style={{fontSize:9,opacity:0.3,fontFamily:'monospace',marginBottom:'0.75rem',textAlign:'center'}}><span style={{color:'#85C1E9'}}>■</span> Tonique &nbsp;<span style={{color:TYPE_COLORS[ex.type]}}>■</span> Autres</div><PianoKeyboard colors={pianoColors}/></div>)}
        <div>
          <div style={{fontSize:10,letterSpacing:'0.15em',opacity:0.3,fontFamily:'monospace',marginBottom:'0.65rem'}}>{answered?'TYPES D\'ACCORDS':'CHOISIR LE TYPE'}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
            {selectedChordTypes.map(([type,{label}])=>{
              const isUser=userType===type,isOk=type===ex?.type,tc=TYPE_COLORS[type]||'#C39BD3';
              let bg='rgba(240,235,224,0.03)',border='rgba(240,235,224,0.1)',col='rgba(240,235,224,0.7)';
              if(answered){if(isOk){bg=`${tc}20`;border=tc;col=tc;}else if(isUser){bg='rgba(241,148,138,0.1)';border='#F1948A';col='#F1948A';}else{col='rgba(240,235,224,0.2)';}}
              return(<button key={type} onClick={()=>handleAnswer(type)} disabled={answered} style={{background:bg,border:`0.5px solid ${border}`,color:col,padding:'0.7rem 0.5rem',borderRadius:3,cursor:answered?'default':'pointer',fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',transition:'all 0.2s'}}>{label}</button>);
            })}
          </div>
        </div>
        {answered&&(<button onClick={handleNext} style={{width:'100%',padding:'0.9rem',background:correct?'rgba(130,224,170,0.1)':'rgba(241,148,138,0.08)',border:`1px solid ${correct?'#82E0AA':'#F1948A'}`,color:correct?'#82E0AA':'#F1948A',borderRadius:3,cursor:'pointer',fontSize:13,fontFamily:'monospace',letterSpacing:'0.15em',fontWeight:'bold',animation:'fadeIn 0.3s ease'}}>{idx>=exCount-1?'VOIR LES RÉSULTATS →':'EXERCICE SUIVANT →'}</button>)}
      </div>
    </div>
  );
}

function AccordOreilleSection({onBack}){
  const[screen,setScreen]=useState('config');
  const[config,setConfig]=useState(null);
  const[result,setResult]=useState(null);
  const[selected,setSelected]=useState(new Set(['Majeures','Mineures']));
  const[exCount,setExCount]=useState(10);
  const[maxLives,setMaxLives]=useState(3);
  const items=Object.entries(CHORD_TYPES).map(([t,{label}])=>({id:t,name:label,color:TYPE_COLORS[t]||'#C39BD3'}));
  const toggle=(id)=>setSelected(prev=>{const n=new Set(prev);if(n.has(id)){if(n.size>2)n.delete(id);}else n.add(id);return n;});
  const toggleAll=()=>{if(selected.size===items.length)setSelected(new Set(['Majeures','Mineures']));else setSelected(new Set(items.map(i=>i.id)));};
  const handleFinish=(res)=>{
    const s=readStats();s.totalExercises=(s.totalExercises||0)+res.exCount;saveStats(s);
    setResult(res);setScreen('results');
  };
  if(screen==='config')return<SessionConfig title="Accords" items={items} selected={selected} onToggle={toggle} onToggleAll={toggleAll} exCount={exCount} setExCount={setExCount} maxLives={maxLives} setMaxLives={setMaxLives} onStart={()=>{setConfig({selectedTypes:Array.from(selected),exCount,maxLives});setScreen('exercise');}} onBack={onBack}/>;
  if(screen==='exercise')return<ChordExercise config={config} onBack={()=>setScreen('config')} onFinish={handleFinish}/>;
  if(screen==='results')return<SessionResults score={result.score} exCount={result.exCount} lives={result.lives} maxLives={maxLives} history={result.history.map(h=>({...h,catId:h.type}))} categoryData={items} onRetry={()=>setScreen('exercise')} onReconfig={()=>setScreen('config')}/>;
}

// ═══════════════════════════════════════════════════════════════════
// ── OREILLE PAGE ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
function OreilPage(){
  const[sub,setSub]=useState(null);
  if(sub==='intervalles')return<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><IntervallesSection onBack={()=>setSub(null)}/></div>;
  if(sub==='accords')return<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}><AccordOreilleSection onBack={()=>setSub(null)}/></div>;
  const MODULES=[
    {id:'intervalles',icon:'🎵',title:'Intervalles', subtitle:'IDENTIFIER LES DISTANCES', color:'#85C1E9',available:true},
    {id:'accords',    icon:'🎹',title:'Accords',     subtitle:"IDENTIFIER À L'OREILLE",   color:'#C39BD3',available:true},
    {id:'melodie',    icon:'🎼',title:'Mélodie',     subtitle:'DICTÉE MÉLODIQUE',          color:'#82E0AA',available:false},
    {id:'rythme',     icon:'🥁',title:'Rythme',      subtitle:'DICTÉE RYTHMIQUE',          color:'#F7DC6F',available:false},
  ];
  return(
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{marginBottom:'1.5rem'}}><h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'0.4rem',letterSpacing:'-0.02em'}}>Oreille Musicale</h2><p style={{fontSize:11,opacity:0.35,fontFamily:'monospace',letterSpacing:'0.08em'}}>DÉVELOPPE TON OREILLE PAR L'ÉCOUTE ACTIVE</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {MODULES.map(m=>(<button key={m.id} onClick={()=>m.available&&setSub(m.id)} style={{background:m.available?`${m.color}08`:'rgba(240,235,224,0.02)',border:`0.5px solid ${m.available?m.color+'40':'rgba(240,235,224,0.08)'}`,borderRadius:4,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:m.available?'pointer':'default',textAlign:'left',opacity:m.available?1:0.5,transition:'all 0.2s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><span style={{fontSize:26}}>{m.icon}</span>{m.available?<span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}50`,padding:'2px 5px',borderRadius:2}}>DISPONIBLE</span>:<span style={{fontSize:8,fontFamily:'monospace',color:'rgba(240,235,224,0.25)',border:'0.5px solid rgba(240,235,224,0.1)',padding:'2px 5px',borderRadius:2}}>BIENTÔT</span>}</div>
          <div><div style={{fontSize:14,fontWeight:'bold',marginBottom:3,color:m.available?m.color:`${m.color}99`,fontFamily:'Georgia,serif'}}>{m.title}</div><div style={{fontSize:9,opacity:0.4,fontFamily:'monospace',letterSpacing:'0.04em'}}>{m.subtitle}</div></div>
        </button>))}
      </div>
    </div>
  );
}

// ── AccordsPage ────────────────────────────────────────────────────
function AccordsPage(){
  const[showModal,setShowModal]=useState(false);
  const[modalStep,setModalStep]=useState('type');
  const[selType,setSelType]=useState(null);
  const[selRoot,setSelRoot]=useState(null);
  const[inv,setInv]=useState(0);
  const[showPiano,setShowPiano]=useState(false);
  const chordName=selRoot&&selType?selRoot+CHORD_TYPES[selType].suffix:null;
  const chordNotes=selRoot&&selType?(()=>{const ri=CHROMATIC.indexOf(selRoot);return CHORD_TYPES[selType].formula.map(i=>CHROMATIC[(ri+i)%12]);})():null;
  const inversions=chordNotes?chordNotes.map((_,i)=>[...chordNotes.slice(i),...chordNotes.slice(0,i)]):null;
  const activeNotes=inversions?inversions[inv]:[];
  const activeAbsIndices=getInversionAbsIndices(activeNotes);
  const color=selRoot?(NOTE_COLORS[selRoot]||'#C39BD3'):'#C39BD3';
  const handleTypeSelect=(type)=>{setSelType(type);setSelRoot(null);setModalStep('root');};
  return(
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{position:'fixed',top:'30%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:600,borderRadius:'50%',background:`radial-gradient(circle,${color}12 0%,transparent 70%)`,transition:'background 0.8s ease',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1,textAlign:'center'}}>
        <div style={{fontSize:chordName?90:60,fontWeight:'bold',color:chordName?color:'rgba(240,235,224,0.1)',transition:'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',lineHeight:1,marginBottom:'0.5rem',minHeight:95,display:'flex',alignItems:'center',justifyContent:'center'}}>{chordName||'—'}</div>
        <p style={{fontSize:11,letterSpacing:'0.2em',opacity:0.35,marginBottom:'1.25rem',fontFamily:'monospace',textTransform:'uppercase'}}>{selType?CHORD_TYPES[selType].label:'Sélectionnez un accord pour commencer'}</p>
        {chordNotes&&(<div style={{marginBottom:'1.25rem',animation:'fadeIn 0.4s ease forwards'}}><div style={{fontSize:10,letterSpacing:'0.2em',opacity:0.3,fontFamily:'monospace',marginBottom:'0.65rem'}}>NOTES</div><div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>{inversions[inv].map((note,i)=>(<div key={`n${i}`} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}><div style={{width:46,height:46,borderRadius:'50%',border:`1px solid ${NOTE_COLORS[note]}50`,background:`${NOTE_COLORS[note]}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:'bold',color:NOTE_COLORS[note],fontFamily:'monospace'}}>{note}</div><div style={{fontSize:9,opacity:0.3,fontFamily:'monospace'}}>{i===0?'BASSE':i===chordNotes.length-1?'AIGU':''}</div></div>))}</div></div>)}
        <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginBottom:'1.5rem'}}>
          <button onClick={()=>{setModalStep('type');setShowModal(true);}} style={{background:'transparent',border:`1px solid ${chordName?color:'rgba(240,235,224,0.2)'}`,color:chordName?color:'#f0ebe0',padding:'0.75rem 1.5rem',fontSize:12,letterSpacing:'0.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}} onMouseEnter={e=>{e.currentTarget.style.background=`${color}14`;e.currentTarget.style.transform='translateY(-1px)';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.transform='translateY(0)';}}>
            {chordName?"Changer d'accord":'Choisir un accord'}
          </button>
          {chordName&&<button onClick={()=>setShowPiano(v=>!v)} style={{background:showPiano?`${color}18`:'transparent',border:`1px solid ${showPiano?color:'rgba(240,235,224,0.2)'}`,color:showPiano?color:'rgba(240,235,224,0.6)',padding:'0.75rem 1.1rem',fontSize:12,letterSpacing:'0.15em',cursor:'pointer',borderRadius:2,transition:'all 0.3s ease',fontFamily:'monospace',textTransform:'uppercase'}}>🎹 Clavier</button>}
        </div>
        {showPiano&&chordNotes&&(<div style={{marginBottom:'1.5rem',padding:'1.25rem 1rem',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.07)',borderRadius:4,animation:'fadeIn 0.3s ease forwards',overflowX:'auto'}}><div style={{fontSize:10,letterSpacing:'0.2em',opacity:0.3,fontFamily:'monospace',marginBottom:'0.75rem'}}>CLAVIER</div><PianoKeyboard activeAbsIndices={activeAbsIndices} color={color}/></div>)}
        {inversions&&(<div style={{animation:'fadeIn 0.4s ease 0.15s both'}}><div style={{fontSize:10,letterSpacing:'0.2em',opacity:0.3,fontFamily:'monospace',marginBottom:'0.65rem'}}>RENVERSEMENTS</div><div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>{inversions.map((iv,i)=>(<button key={`inv${i}`} onClick={()=>setInv(i)} style={{background:inv===i?`${color}18`:'transparent',border:`0.5px solid ${inv===i?color:'rgba(240,235,224,0.15)'}`,color:inv===i?color:'rgba(240,235,224,0.45)',padding:'0.5rem 0.85rem',borderRadius:2,cursor:'pointer',fontFamily:'monospace',fontSize:10,transition:'all 0.2s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:3}} onMouseEnter={e=>{if(inv!==i)e.currentTarget.style.borderColor=`${color}60`;}} onMouseLeave={e=>{if(inv!==i)e.currentTarget.style.borderColor='rgba(240,235,224,0.15)';}}>
          <span>{INVERSION_NAMES[i]}</span><span style={{opacity:0.5,fontSize:9}}>{iv.join(' – ')}</span>
        </button>))}</div></div>)}
      </div>
      {showModal&&(<div onClick={e=>e.target===e.currentTarget&&setShowModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,backdropFilter:'blur(10px)'}}>
        <div style={{background:'#161512',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:4,width:'min(540px,92vw)',maxHeight:'85vh',overflow:'hidden',display:'flex',flexDirection:'column',animation:'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
          <div style={{padding:'1.25rem 1.5rem',borderBottom:'0.5px solid rgba(240,235,224,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>{modalStep==='root'&&<button onClick={()=>setModalStep('type')} style={{background:'none',border:'none',color:'#f0ebe0',opacity:0.4,cursor:'pointer',fontSize:18,padding:'0 6px 0 0'}}>←</button>}<span style={{fontSize:11,letterSpacing:'0.2em',opacity:0.4,fontFamily:'monospace'}}>{modalStep==='type'?"1 · TYPE D'ACCORD":`2 · NOTE RACINE — ${CHORD_TYPES[selType].label.toUpperCase()}`}</span></div>
            <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',color:'#f0ebe0',opacity:0.35,cursor:'pointer',fontSize:20,lineHeight:1,padding:'2px 4px'}}>×</button>
          </div>
          {modalStep==='type'&&(<div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:8,overflowY:'auto'}}>{Object.entries(CHORD_TYPES).map(([type,{label}])=>{const ex=CHORD_TYPES[type].formula.map(i=>CHROMATIC[i]),isA=selType===type;return(<button key={type} onClick={()=>handleTypeSelect(type)} style={{background:isA?'rgba(195,155,211,0.1)':'rgba(240,235,224,0.02)',border:`0.5px solid ${isA?'#C39BD3':'rgba(240,235,224,0.1)'}`,borderRadius:2,padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',transition:'all 0.2s ease',textAlign:'left'}} onMouseEnter={e=>{if(!isA)e.currentTarget.style.background='rgba(240,235,224,0.05)';}} onMouseLeave={e=>{if(!isA)e.currentTarget.style.background='rgba(240,235,224,0.02)';}}>
            <div><div style={{fontSize:16,color:isA?'#C39BD3':'#f0ebe0',fontFamily:'Georgia,serif',marginBottom:3}}>{label}</div><div style={{fontSize:11,opacity:0.35,fontFamily:'monospace'}}>ex. C{CHORD_TYPES[type].suffix} → {ex.join(' – ')}</div></div>
            <span style={{color:isA?'#C39BD3':'rgba(240,235,224,0.2)',fontSize:18}}>›</span>
          </button>);})}</div>)}
          {modalStep==='root'&&(<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'1.25rem',overflowY:'auto'}}>{ROOT_NOTES.map(root=>{const c=NOTE_COLORS[root]||'#C39BD3',ri=CHROMATIC.indexOf(root),prev=CHORD_TYPES[selType].formula.map(i=>CHROMATIC[(ri+i)%12]),isA=selRoot===root;return(<button key={root} onClick={()=>{setSelRoot(root);setInv(0);setShowModal(false);}} style={{background:isA?`${c}20`:'rgba(240,235,224,0.03)',border:`0.5px solid ${isA?c:'rgba(240,235,224,0.1)'}`,color:isA?c:'rgba(240,235,224,0.8)',padding:'1rem 0.5rem',borderRadius:2,cursor:'pointer',transition:'all 0.2s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:6}} onMouseEnter={e=>{e.currentTarget.style.background=`${c}18`;e.currentTarget.style.borderColor=`${c}80`;e.currentTarget.style.color=c;}} onMouseLeave={e=>{if(!isA){e.currentTarget.style.background='rgba(240,235,224,0.03)';e.currentTarget.style.borderColor='rgba(240,235,224,0.1)';e.currentTarget.style.color='rgba(240,235,224,0.8)';}}}>
            <span style={{fontSize:22,fontWeight:'bold'}}>{root}</span><span style={{fontSize:9,opacity:0.45,fontFamily:'monospace'}}>{prev.join('·')}</span>
          </button>);})}</div>)}
        </div>
      </div>)}
    </div>
  );
}

// ── ApprentissagePage ──────────────────────────────────────────────
function ApprentissagePage({sub,setSub}){
  const SUBS=[{id:'accords',label:'Accords',color:'#C39BD3'},{id:'oreille',label:'Oreille',color:'#85C1E9'},{id:'exercices',label:'Exercices',color:'#82E0AA'},{id:'defis',label:'Défis',color:'#F7DC6F'}];
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{display:'flex',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.6)',flexShrink:0}}>
        {SUBS.map(s=>(<button key={s.id} onClick={()=>setSub(s.id)} style={{flex:1,padding:'0.7rem 0.25rem',background:'none',border:'none',color:sub===s.id?s.color:'rgba(240,235,224,0.3)',cursor:'pointer',transition:'all 0.2s',fontSize:10,fontFamily:'monospace',letterSpacing:'0.05em',borderBottom:sub===s.id?`1.5px solid ${s.color}`:'1.5px solid transparent'}}>{s.label.toUpperCase()}</button>))}
      </div>
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {sub==='accords'&&<AccordsPage/>}
        {sub==='oreille'&&<OreilPage/>}
        {sub==='exercices'&&<PlaceholderPage title="Exercices" icon="✎" description="DES EXERCICES GUIDÉS ARRIVENT BIENTÔT"/>}
        {sub==='defis'&&<PlaceholderPage title="Défis" icon="★" description="RELEVEZ DES DÉFIS MUSICAUX BIENTÔT"/>}
      </div>
    </div>
  );
}

function PlaceholderPage({title,icon,description}){
  return(<div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',gap:'1.5rem'}}><div style={{fontSize:50,opacity:0.3}}>{icon}</div><div><h2 style={{fontSize:24,fontWeight:'bold',marginBottom:'0.6rem',opacity:0.6,letterSpacing:'-0.02em'}}>{title}</h2><p style={{fontSize:11,opacity:0.28,letterSpacing:'0.12em',fontFamily:'monospace'}}>{description}</p></div><div style={{padding:'0.5rem 1.25rem',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:2,fontSize:10,opacity:0.25,fontFamily:'monospace',letterSpacing:'0.15em'}}>BIENTÔT DISPONIBLE</div></div>);
}

// ═══════════════════════════════════════════════════════════════════
// ── MAIN APP ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
export default function ChordApp(){
  const[page,setPage]=useState('competences');
  const[apprentissageSub,setApprentiassageSub]=useState('accords');
  const[skills]=useState(INITIAL_SKILLS);
  const[instrument,setInstrument]=useState('piano');
  const[tipIndex,setTipIndex]=useState(0);
  const[showTip,setShowTip]=useState(false);

  // Initialise la session au chargement
  useEffect(()=>{
    const s=readStats();
    s.totalSessions=(s.totalSessions||0)+1;
    // Calcul de la série (streak)
    const today=new Date().toDateString();
    const yesterday=new Date(Date.now()-86400000).toDateString();
    if(s.lastPlayDate===yesterday)s.streak=(s.streak||0)+1;
    else if(s.lastPlayDate!==today)s.streak=1;
    s.lastPlayDate=today;
    saveStats(s);
  },[]);

  // Compteur de temps de jeu — +1 minute toutes les 60s
  useEffect(()=>{
    const t=setInterval(()=>{
      const s=readStats();s.totalMinutes=(s.totalMinutes||0)+1;saveStats(s);
    },60000);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    if(page!=='competences')return;
    const t=setInterval(()=>{setTipIndex(i=>(i+1)%TIPS.length);setShowTip(true);},60000);
    return()=>clearInterval(t);
  },[page]);

  // 3 onglets seulement — Compétences remplace home+stats
  const NAV=[
    {id:'competences',  label:'Compétences', icon:'◎'},
    {id:'apprentissage',label:'Apprendre',   icon:'◈'},
    {id:'partage',      label:'Partage',     icon:'↗'},
  ];
  const NC={competences:'#C39BD3',apprentissage:'#85C1E9',partage:'#82E0AA'};

  return(
    <div style={{minHeight:'100vh',background:'#0f0e0c',fontFamily:"'Georgia',serif",color:'#f0ebe0',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
      <header style={{position:'fixed',top:0,left:0,right:0,padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'0.5px solid rgba(240,235,224,0.08)',zIndex:10,background:'rgba(15,14,12,0.9)',backdropFilter:'blur(12px)'}}>
        <span style={{fontSize:13,letterSpacing:'0.2em',opacity:0.5,fontFamily:'monospace'}}>CHORD·STUDIO</span>
        <button onClick={()=>setShowTip(v=>!v)} style={{background:'transparent',border:`0.5px solid ${showTip?'rgba(247,220,111,0.5)':'rgba(240,235,224,0.15)'}`,color:showTip?'#F7DC6F':'rgba(240,235,224,0.45)',padding:'0.35rem 0.85rem',borderRadius:2,cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'0.1em',transition:'all 0.2s'}}>💡 CONSEIL</button>
      </header>
      <div style={{flex:1,paddingTop:57,paddingBottom:64,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {page==='competences'&&<CompétencesPage skills={skills} instrument={instrument} setInstrument={setInstrument}/>}
        {page==='apprentissage'&&<ApprentissagePage sub={apprentissageSub} setSub={setApprentiassageSub}/>}
        {page==='partage'&&<PlaceholderPage title="Partage" icon="↗" description="PARTAGE TA PROGRESSION BIENTÔT"/>}
      </div>
      <nav style={{position:'fixed',bottom:0,left:0,right:0,display:'flex',borderTop:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.92)',backdropFilter:'blur(12px)',zIndex:10}}>
        {NAV.map(({id,label,icon})=>{
          const isA=page===id,ac=NC[id]||'#f0ebe0';
          return(<button key={id} onClick={()=>setPage(id)} style={{flex:1,padding:'0.7rem 0.25rem',background:'none',border:'none',color:isA?ac:'rgba(240,235,224,0.28)',cursor:'pointer',transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:3,borderTop:isA?`1.5px solid ${ac}`:'1.5px solid transparent'}}>
            <span style={{fontSize:15}}>{icon}</span>
            <span style={{fontSize:8,fontFamily:'monospace',letterSpacing:'0.04em'}}>{label.toUpperCase()}</span>
          </button>);
        })}
      </nav>
      {showTip&&<TipPopup tip={TIPS[tipIndex]} onClose={()=>setShowTip(false)} onNext={()=>setTipIndex(i=>(i+1)%TIPS.length)}/>}
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box} button{cursor:pointer}
      `}</style>
    </div>
  );
}
