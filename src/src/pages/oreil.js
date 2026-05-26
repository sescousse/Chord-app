// ── Section Oreille Musicale ─────────────────────────────────────────────────
import { useState } from "react";
import { IntervallesSection, AccordOreilleSection } from './Exercises.jsx';

export function OreilPage(){
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

// ══════════════════════════════════════════════════════════════════════════════
// ── PARTITIONS PAGE (Chopin) ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function PartitionsPage() {
  return null
}
