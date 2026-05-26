// ── Composants d'exercice ────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { INTERVALS_DATA, CHORD_TYPES, CHORD_COLORS, NM, semiToName, genEx, genChordEx } from '../data/music.js';
import { playSeq, playSimul, playChordArp, playChordSimul } from '../utils/audio.js';
import { PianoKeyboard } from './ui.jsx';
import { notifyExerciseDone } from '../utils/stats.js';
import { Hearts } from './ui.jsx';

export function SessionConfig({title,items,selected,onToggle,onToggleAll,exCount,setExCount,maxLives,setMaxLives,onStart,onBack}){
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

export function SessionResults({score,exCount,lives,maxLives,history,categoryData,onRetry,onReconfig}){
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
export function IntervalExercise({config,onFinish,onBack}){
  const {selectedIds,exCount,maxLives}=config;
  const [exercises]=useState(()=>Array.from({length:exCount},()=>genEx(selectedIds)));
  const [idx,setIdx]=useState(0);const[lives,setLives]=useState(maxLives||999);const[score,setScore]=useState(0);
  const [answered,setAnswered]=useState(false);const[userSemi,setUserSemi]=useState(null);
  const [history,setHistory]=useState([]);const[showPiano,setShowPiano]=useState(false);
  const ex=exercises[idx],correct=userSemi===ex?.intSemi,iv=INTERVALS_DATA.find(i=>i.semi===ex?.intSemi);
  const selIvs=INTERVALS_DATA.filter(i=>selectedIds.includes(i.semi));
  useEffect(()=>{if(!ex)return;const t=setTimeout(()=>playSeq(ex.note1,ex.note2),400);return()=>clearTimeout(t);},[ex]);
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

export function IntervallesSection({onBack}){
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
export function ChordExercise({config,onFinish,onBack}){
  const {selectedTypes,exCount,maxLives}=config;
  const [exercises]=useState(()=>Array.from({length:exCount},()=>genChordEx(selectedTypes)));
  const [idx,setIdx]=useState(0);const[lives,setLives]=useState(maxLives||999);const[score,setScore]=useState(0);
  const [answered,setAnswered]=useState(false);const[userType,setUserType]=useState(null);
  const [history,setHistory]=useState([]);const[showPiano,setShowPiano]=useState(false);
  const ex=exercises[idx],correct=userType===ex?.type,ci=ex?CHORD_TYPES[ex.type]:null;
  const selTypes=Object.entries(CHORD_TYPES).filter(([t])=>selectedTypes.includes(t));
  useEffect(()=>{if(!ex)return;const t=setTimeout(()=>playChordArp(ex.notes),400);return()=>clearTimeout(t);},[ex]);
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

export function AccordOreilleSection({onBack}){
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
