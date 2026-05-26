// ── Bibliothèque (Accords, Partitions, Tabs) ─────────────────────────────────
import { useState } from "react";
import { CHORD_TYPES, ROOT_NOTES, NOTE_COLORS, CHROMATIC, INVERSION_NAMES, CHORD_COLORS } from '../data/music.js';
import { CHOPIN_WORKS, IMSLP_BASE, SONGS_TABS } from '../data/content.js';
import { getInversionAbsIndices, playChordArp, playTabChord } from '../utils/audio.js';
import { notifyLibraryView } from '../utils/stats.js';
import { PianoKeyboard } from '../components/ui.jsx';

export function PartitionsPage() {
  const [tab, setTab] = useState('etudes');
  const works = tab === 'etudes' ? CHOPIN_WORKS.etudes : CHOPIN_WORKS.nocturnes;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Sub tabs */}
      <div style={{display:'flex',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.4)',flexShrink:0}}>
        {[['etudes','Études'],['nocturnes','Nocturnes']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'.6rem',background:'none',border:'none',color:tab===id?'#C39BD3':'rgba(240,235,224,0.35)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.08em',borderBottom:tab===id?'1.5px solid #C39BD3':'1.5px solid transparent',transition:'all 0.2s'}}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'1rem'}}>
        {/* Header */}
        <div style={{marginBottom:'1rem',padding:'.75rem',background:'rgba(195,155,211,0.05)',border:'0.5px solid rgba(195,155,211,0.15)',borderRadius:4}}>
          <div style={{fontSize:11,color:'#C39BD3',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:'.35rem'}}>FRÉDÉRIC CHOPIN — DOMAINE PUBLIC</div>
          <p style={{fontSize:12,opacity:.5,margin:0,lineHeight:1.5,fontFamily:'Georgia,serif'}}>Partitions gratuites via IMSLP. Cliquez sur une pièce pour accéder à la partition en PDF.</p>
        </div>

        {/* Pieces list */}
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          {works.map((w,i)=>(
            <a key={i} href={`${IMSLP_BASE}${w.url}`} target="_blank" rel="noopener noreferrer"
              style={{textDecoration:'none',display:'block',background:'rgba(240,235,224,0.02)',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:4,padding:'.9rem 1rem',transition:'all 0.2s',cursor:'pointer'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(195,155,211,0.07)';e.currentTarget.style.borderColor='rgba(195,155,211,0.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(240,235,224,0.02)';e.currentTarget.style.borderColor='rgba(240,235,224,0.1)';}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
                <div style={{display:'flex',gap:10,alignItems:'baseline'}}>
                  <span style={{fontSize:10,color:'#C39BD3',fontFamily:'monospace',opacity:.7}}>Op.{w.op}{w.no?` n°${w.no}`:''}</span>
                  <span style={{fontSize:14,fontWeight:'bold',color:'#f0ebe0',fontFamily:'Georgia,serif'}}>{w.key}</span>
                  {w.nick&&<span style={{fontSize:11,color:'rgba(240,235,224,0.45)',fontStyle:'italic'}}>"{w.nick}"</span>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  <div style={{display:'flex',gap:2}}>
                    {[1,2,3,4,5].map(s=>(<div key={s} style={{width:6,height:6,borderRadius:'50%',background:s<=w.diff?'#C39BD3':'rgba(240,235,224,0.15)'}}/>))}
                  </div>
                  <span style={{fontSize:10,color:'#C39BD3',opacity:.6,fontFamily:'monospace'}}>↗</span>
                </div>
              </div>
              <div style={{fontSize:9,opacity:.3,fontFamily:'monospace',letterSpacing:'.05em'}}>IMSLP — TÉLÉCHARGEMENT GRATUIT PDF</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TABS PAGE ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export function TabsPage() {
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
export function BibliothequePage() {
  const [tab, setTab] = useState('accords');
  const TABS = [
    {id:'accords',    label:'Accords',    color:'#C39BD3'},
    {id:'partitions', label:'Partitions', color:'#85C1E9'},
    {id:'tabs',       label:'Tabs',       color:'#82E0AA'},
  ];
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{display:'flex',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.6)',flexShrink:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'.7rem .25rem',background:'none',border:'none',color:tab===t.id?t.color:'rgba(240,235,224,0.3)',cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.05em',borderBottom:tab===t.id?`1.5px solid ${t.color}`:'1.5px solid transparent',transition:'all 0.2s'}}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {tab==='accords'    && <AccordsLibrary/>}
        {tab==='partitions' && <PartitionsPage/>}
        {tab==='tabs'       && <TabsPage/>}
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
function ExercicesPage() {
  const [sub, setSub] = useState(null);
  if (sub === 'solfege') return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.7)',flexShrink:0}}>
        <button onClick={()=>setSub(null)} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontFamily:'monospace',fontSize:11,letterSpacing:'.05em',padding:'4px 8px',borderRadius:2}} onMouseEnter={e=>e.currentTarget.style.color='#f0ebe0'} onMouseLeave={e=>e.currentTarget.style.color='rgba(240,235,224,0.5)'}>← EXERCICES</button>
        <span style={{opacity:.2}}>|</span>
        <span style={{fontSize:11,fontFamily:'monospace',color:'#F7DC6F',letterSpacing:'.08em'}}>SOLFÈGE</span>
      </div>
      <SolfegePage/>
    </div>
  );

  const MODS = [
    {id:'solfege',  icon:'🎼', title:'Solfège',     subtitle:'NOTES · RYTHME · LECTURE', color:'#F7DC6F', ok:true},
    {id:'lecture',  icon:'📖', title:'Lecture',     subtitle:'DÉCHIFFRAGE DE PARTITIONS', color:'#85C1E9', ok:false},
    {id:'rythme',   icon:'🥁', title:'Rythme',      subtitle:'DICTÉE RYTHMIQUE',          color:'#82E0AA', ok:false},
    {id:'impro',    icon:'✨', title:'Improvisation',subtitle:'SCALES & MODES',            color:'#F1948A', ok:false},
  ];
  return (
    <div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
      <div style={{marginBottom:'1.5rem'}}><h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Exercices</h2><p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>PRATIQUE GUIDÉE PAS À PAS</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {MODS.map(m=>(
          <button key={m.id} onClick={()=>m.ok&&setSub(m.id)} style={{background:m.ok?`${m.color}08`:'rgba(240,235,224,0.02)',border:`0.5px solid ${m.ok?m.color+'40':'rgba(240,235,224,0.08)'}`,borderRadius:4,padding:'1.1rem',display:'flex',flexDirection:'column',gap:7,cursor:m.ok?'pointer':'default',textAlign:'left',opacity:m.ok?1:.5,transition:'all 0.2s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><span style={{fontSize:26}}>{m.icon}</span>{m.ok?<span style={{fontSize:9,fontFamily:'monospace',color:m.color,border:`0.5px solid ${m.color}50`,padding:'2px 5px',borderRadius:2}}>DISPONIBLE</span>:<span style={{fontSize:8,fontFamily:'monospace',color:'rgba(240,235,224,0.25)',border:'0.5px solid rgba(240,235,224,0.1)',padding:'2px 5px',borderRadius:2}}>BIENTÔT</span>}</div>
            <div><div style={{fontSize:14,fontWeight:'bold',marginBottom:3,color:m.ok?m.color:`${m.color}99`,fontFamily:'Georgia,serif'}}>{m.title}</div><div style={{fontSize:9,opacity:.4,fontFamily:'monospace',letterSpacing:'.04em'}}>{m.subtitle}</div></div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Accords Library ───────────────────────────────────────────────────────────
export function AccordsLibrary(){
  const [showModal,setShowModal]=useState(false);const[modalStep,setModalStep]=useState('type');
  const [selType,setSelType]=useState(null);const[selRoot,setSelRoot]=useState(null);
  const [inv,setInv]=useState(0);const[showPiano,setShowPiano]=useState(false);
  const cName=selRoot&&selType?selRoot+CHORD_TYPES[selType].suffix:null;
  const cNotes=selRoot&&selType?(()=>{const ri=CHROMATIC.indexOf(selRoot);return CHORD_TYPES[selType].formula.map(i=>CHROMATIC[(ri+i)%12]);})():null;
  const inversions=cNotes?cNotes.map((_,i)=>[...cNotes.slice(i),...cNotes.slice(0,i)]):null;
  const aIdx=getInversionAbsIndices(inversions?inversions[inv]:[]);
  const color=selRoot?(NOTE_COLORS[selRoot]||'#C39BD3'):'#C39BD3';
  // Notify library view when chord selected
  const handleChordSelect=(root)=>{setSelRoot(root);setInv(0);setShowModal(false);notifyLibraryView();};
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
const APPRENTISSAGE_SECTIONS = [
  {id:'accords', icon:'♩', title:'Bibliothèque', subtitle:'ACCORDS · PARTITIONS · TABS', color:'#C39BD3'},
  {id:'oreille', icon:'👂', title:'Oreille',      subtitle:'ENTRAÎNEMENT AUDITIF',        color:'#85C1E9'},
  {id:'exercices',icon:'✎',title:'Exercices',    subtitle:'SOLFÈGE & PRATIQUE',           color:'#82E0AA'},
];

