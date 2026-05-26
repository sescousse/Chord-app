// ── Section Apprentissage ────────────────────────────────────────────────────
import { useEffect } from "react";
import { SectionCard } from '../components/ui.jsx';
import { BibliothequePage } from './Bibliotheque.jsx';
import { OreilPage } from './Oreille.jsx';
import { ExercicesPage } from './Exercices.jsx';
import { notifySectionVisit } from '../utils/stats.js';

export const APPRENTISSAGE_SECTIONS = [
  {id:'accords',    icon:'♩', title:'Bibliothèque', subtitle:'ACCORDS · PARTITIONS · TABS', color:'#C39BD3'},
  {id:'oreille',    icon:'👂', title:'Oreille',      subtitle:'ENTRAÎNEMENT AUDITIF',        color:'#85C1E9'},
  {id:'exercices',  icon:'✎', title:'Exercices',    subtitle:'SOLFÈGE & PRATIQUE',           color:'#82E0AA'},
];

export function ApprentissageLanding({onNavigate}){
  useEffect(()=>{ notifySectionVisit(); },[]);
  return(<div style={{padding:'1.25rem',overflowY:'auto',flex:1}}>
    <div style={{marginBottom:'1.75rem'}}>
      <h2 style={{fontSize:22,fontWeight:'bold',marginBottom:'.4rem',letterSpacing:'-.02em'}}>Apprentissage</h2>
      <p style={{fontSize:11,opacity:.35,fontFamily:'monospace',letterSpacing:'.08em'}}>EXPLORE LES DIFFÉRENTES SECTIONS</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
      {APPRENTISSAGE_SECTIONS.map(s=>(<SectionCard key={s.id} {...s} onClick={()=>!s.lock&&onNavigate(s.id)}/>))}
    </div>
  </div>);
}

export function ApprentissagePage({sub,setSub}){
  if(!sub||sub==='landing') return <ApprentissageLanding onNavigate={setSub}/>;
  const info = APPRENTISSAGE_SECTIONS.find(s=>s.id===sub);
  return(<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    {/* Back bar */}
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'.65rem 1rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.7)',flexShrink:0}}>
      <button onClick={()=>setSub('landing')} style={{background:'none',border:'none',color:'rgba(240,235,224,0.5)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',gap:5,fontFamily:'monospace',letterSpacing:'.05em',padding:'4px 8px',borderRadius:2,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#f0ebe0'} onMouseLeave={e=>e.currentTarget.style.color='rgba(240,235,224,0.5)'}>
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
    </div>
  </div>);
}

