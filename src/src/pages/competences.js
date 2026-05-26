// ── Page Compétences (graphe + statistiques) ─────────────────────────────────
import { RadarChart } from '../components/ui.jsx';
import { INSTRUMENTS } from '../data/content.js';
import { formatTime } from '../utils/stats.js';

export function CompetencesPage({skills,instrument,setInstrument,stats}){
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
