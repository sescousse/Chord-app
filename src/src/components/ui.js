// ── Composants UI réutilisables ───────────────────────────────────────────────
import { useState } from "react";
import { PIANO_KEYS_DATA, WW, WH, BW, BH } from '../utils/audio.js';

// ── Graphe radar des compétences ──────────────────────────────────────────────
export function RadarChart({ skills }) {
  const cx=130,cy=130,r=82,n=skills.length,sa=-Math.PI/2,step=(2*Math.PI)/n;
  const pt=(a,r2)=>({x:cx+r2*Math.cos(a),y:cy+r2*Math.sin(a)});
  const axes=skills.map((_,i)=>pt(sa+i*step,r));
  const sp=skills.map((s,i)=>pt(sa+i*step,(s.value/100)*r));
  const lr=r+28;
  return (
    <div style={{padding:'0 55px 20px'}}>
      <svg viewBox="0 0 260 260" style={{width:'100%',maxWidth:260,display:'block',margin:'0 auto',overflow:'visible'}}>
        {[.25,.5,.75,1].map((lv,gi)=>(
          <polygon key={gi} points={axes.map((_,i)=>{const p=pt(sa+i*step,lv*r);return`${p.x},${p.y}`;}).join(' ')}
            fill="none" stroke="rgba(240,235,224,0.07)" strokeWidth={1}/>
        ))}
        {axes.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(240,235,224,0.1)" strokeWidth={1}/>)}
        <polygon points={sp.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(195,155,211,0.1)" stroke="#C39BD3" strokeWidth={1.5}/>
        {sp.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3.5} fill={skills[i].color}/>)}
        {skills.map((s,i)=>{
          const a=sa+i*step,lx=cx+lr*Math.cos(a),ly=cy+lr*Math.sin(a);
          const anchor=lx>cx+5?'start':lx<cx-5?'end':'middle',oy=ly<cy-5?-4:ly>cy+5?13:4;
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

// ── Clavier piano (2 octaves) ─────────────────────────────────────────────────
export function PianoKeyboard({ activeAbsIndices=[], color, colors={} }) {
  const whites=PIANO_KEYS_DATA.filter(k=>k.type==='white');
  const blacks=PIANO_KEYS_DATA.filter(k=>k.type==='black');
  const getC=ai=>colors[ai]||(activeAbsIndices.includes(ai)?color:null);
  return (
    <svg viewBox={`0 0 ${14*WW} ${WH+20}`} style={{width:'100%',maxWidth:560,display:'block',margin:'0 auto'}}>
      {whites.map(({absIdx,wi,note})=>{const c=getC(absIdx);return(<g key={`w${absIdx}`}>
        <rect x={wi*WW} y={0} width={WW} height={WH} rx={3} fill={c||'#f3ede0'} stroke="#1a1714" strokeWidth={1.5}/>
        {c&&<text x={wi*WW+WW/2} y={WH-10} textAnchor="middle" fontSize={10} fill="#1a1714" fontFamily="monospace" fontWeight="bold">{note}</text>}
      </g>);})}
      {blacks.map(({absIdx,wi,note})=>{const c=getC(absIdx),x=(wi+1)*WW-BW*.58;return(<g key={`b${absIdx}`}>
        <rect x={x} y={0} width={BW} height={BH} rx={2} fill={c||'#181614'} stroke="#0a0908" strokeWidth={.8}/>
        {c&&<text x={x+BW/2} y={BH-8} textAnchor="middle" fontSize={8} fill="#1a1714" fontFamily="monospace" fontWeight="bold">{note}</text>}
      </g>);})}
      <line x1={7*WW} y1={0} x2={7*WW} y2={WH} stroke="rgba(240,235,224,0.2)" strokeWidth={1} strokeDasharray="4,3"/>
      <text x={3.5*WW} y={WH+15} textAnchor="middle" fontSize={9} fill="rgba(240,235,224,0.22)" fontFamily="monospace">OCT. 1</text>
      <text x={10.5*WW} y={WH+15} textAnchor="middle" fontSize={9} fill="rgba(240,235,224,0.22)" fontFamily="monospace">OCT. 2</text>
    </svg>
  );
}

// ── Cœurs (système de vies) ───────────────────────────────────────────────────
export function Hearts({ total, remaining }) {
  if (total===0) return <span style={{fontSize:11,fontFamily:'monospace',color:'rgba(240,235,224,0.4)'}}>∞</span>;
  return (
    <div style={{display:'flex',gap:3}}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{width:13,height:13,borderRadius:'50%',background:i<remaining?'#F1948A':'rgba(240,235,224,0.1)',border:i<remaining?'none':'0.5px solid rgba(240,235,224,0.15)',transition:'all 0.3s'}}/>
      ))}
    </div>
  );
}

// ── Popup conseil ─────────────────────────────────────────────────────────────
export function TipPopup({ tip, onClose, onNext }) {
  return (
    <div style={{position:'fixed',bottom:'5rem',right:'1.5rem',width:'min(300px,calc(100vw - 3rem))',background:'#1c1a16',border:'0.5px solid rgba(240,235,224,0.15)',borderRadius:4,padding:'1.25rem',zIndex:200,animation:'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
        <span style={{fontSize:10,letterSpacing:'.15em',fontFamily:'monospace',padding:'3px 8px',borderRadius:2,background:tip.level==='Débutant'?'rgba(130,224,170,0.12)':'rgba(133,193,233,0.12)',color:tip.level==='Débutant'?'#82E0AA':'#85C1E9'}}>{tip.level.toUpperCase()}</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.35,cursor:'pointer',fontSize:18,padding:'0 2px',lineHeight:1}}>×</button>
      </div>
      <p style={{fontSize:13.5,lineHeight:1.65,opacity:.78,margin:'0 0 1rem',fontFamily:'Georgia,serif'}}>{tip.text}</p>
      <button onClick={onNext} style={{background:'transparent',border:'0.5px solid rgba(240,235,224,0.15)',color:'rgba(240,235,224,0.4)',padding:'.4rem .75rem',borderRadius:2,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.1em'}}
        onMouseEnter={e=>{e.currentTarget.style.color='rgba(240,235,224,0.7)';e.currentTarget.style.borderColor='rgba(240,235,224,0.3)';}}
        onMouseLeave={e=>{e.currentTarget.style.color='rgba(240,235,224,0.4)';e.currentTarget.style.borderColor='rgba(240,235,224,0.15)';}}>
        CONSEIL SUIVANT →
      </button>
    </div>
  );
}

// ── Carte de section ──────────────────────────────────────────────────────────
export function SectionCard({ icon, title, subtitle, color, onClick, badge, lock }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov&&!lock?`${color}10`:'rgba(240,235,224,0.025)',border:`0.5px solid ${hov&&!lock?color:'rgba(240,235,224,0.1)'}`,borderRadius:4,padding:'1.1rem',cursor:lock?'default':'pointer',textAlign:'left',transition:'all 0.25s ease',display:'flex',flexDirection:'column',gap:7,transform:hov&&!lock?'translateY(-2px)':'translateY(0)',opacity:lock?.5:1}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <span style={{fontSize:26}}>{icon}</span>
        {badge&&<span style={{fontSize:9,fontFamily:'monospace',color:'#82E0AA',background:'rgba(130,224,170,0.1)',padding:'2px 6px',borderRadius:2}}>NOUVEAU</span>}
        {lock&&<span style={{fontSize:9,fontFamily:'monospace',color:'rgba(240,235,224,0.3)',border:'0.5px solid rgba(240,235,224,0.12)',padding:'2px 5px',borderRadius:2}}>BIENTÔT</span>}
      </div>
      <div>
        <div style={{fontSize:15,fontWeight:'bold',color:hov&&!lock?color:'#f0ebe0',marginBottom:3,fontFamily:'Georgia,serif'}}>{title}</div>
        <div style={{fontSize:10,opacity:.38,fontFamily:'monospace',letterSpacing:'.04em'}}>{subtitle}</div>
      </div>
    </button>
  );
}

// ── Page placeholder ──────────────────────────────────────────────────────────
export function PlaceholderPage({ title, icon, description }) {
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',gap:'1.5rem'}}>
      <div style={{fontSize:50,opacity:.3}}>{icon}</div>
      <div>
        <h2 style={{fontSize:24,fontWeight:'bold',marginBottom:'.6rem',opacity:.6,letterSpacing:'-.02em'}}>{title}</h2>
        <p style={{fontSize:11,opacity:.28,letterSpacing:'.12em',fontFamily:'monospace'}}>{description}</p>
      </div>
      <div style={{padding:'.5rem 1.25rem',border:'0.5px solid rgba(240,235,224,0.1)',borderRadius:2,fontSize:10,opacity:.25,fontFamily:'monospace',letterSpacing:'.15em'}}>BIENTÔT DISPONIBLE</div>
    </div>
  );
}
