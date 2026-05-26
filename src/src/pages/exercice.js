// ── Exercices & Solfège ───────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { SOLFEGE_MAP, SOLFEGE_CHROM } from '../data/content.js';
import { playNote } from '../utils/audio.js';

export function SolfegePage() {
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
export function ExercicesPage() {
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
function AccordsLibrary(){
