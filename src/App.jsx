// ── Application principale ───────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { TIPS, INITIAL_SKILLS } from './data/content.js';
import { getDailyChallenges, checkAndComplete } from './data/content.js';
import {
  loadStats, saveStats, formatTime, todayStr, resetDailyIfNeeded,
  setStatsUpdater, setTimeUpdater, commitTime, _sessionStart
} from './utils/stats.js';
import { TipPopup } from './components/ui.jsx';
import { DefisPanel } from './components/DefisPanel.jsx';
import { CompetencesPage } from './pages/Competences.jsx';
import { ApprentissagePage } from './pages/Apprentissage.jsx';
import { PlaceholderPage } from './components/ui.jsx';

export default function ChordApp() {
  const [page, setPage] = useState('competences');
  const [apprentissageSub, setApprentiassageSub] = useState('landing');
  const [skills] = useState(INITIAL_SKILLS);
  const [instrument, setInstrument] = useState('piano');
  const [tipIndex, setTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [showDefis, setShowDefis] = useState(false);
  const [stats, setStats] = useState(() => resetDailyIfNeeded(loadStats()));

  // Enregistrement des callbacks de stats
  setStatsUpdater((fn) => {
    setStats(prev => {
      const today = todayStr();
      let s = resetDailyIfNeeded(prev);
      s = fn(s, today);
      const daily = getDailyChallenges(today);
      s = checkAndComplete(s, today, daily);
      saveStats(s);
      return s;
    });
  });
  setTimeUpdater((secs) => {
    setStats(prev => {
      const n = { ...prev, totalSeconds: (prev.totalSeconds||0)+secs };
      saveStats(n);
      return n;
    });
  });

  // Timer de session
  useEffect(() => {
    const t = setInterval(commitTime, 60000);
    return () => { commitTime(); clearInterval(t); };
  }, []);

  // Conseil automatique sur la page compétences
  useEffect(() => {
    if (page !== 'competences') return;
    const t = setInterval(() => {
      setTipIndex(i => (i+1) % TIPS.length);
      setShowTip(true);
    }, 60000);
    return () => clearInterval(t);
  }, [page]);

  const goTo = (p, sub) => { setPage(p); if (sub) setApprentiassageSub(sub); };
  const keys = stats.keys || 0;

  const NAV = [
    {id:'competences',   label:'Compétences',  icon:'◈'},
    {id:'apprentissage', label:'Apprentissage', icon:'✦'},
    {id:'partage',       label:'Partage',       icon:'↗'},
  ];
  const NC = { competences:'#C39BD3', apprentissage:'#85C1E9', partage:'#82E0AA' };

  return (
    <div style={{minHeight:'100vh',background:'#0f0e0c',fontFamily:"'Georgia',serif",color:'#f0ebe0',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>

      {/* Header */}
      <header style={{position:'fixed',top:0,left:0,right:0,padding:'.85rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'0.5px solid rgba(240,235,224,0.08)',zIndex:10,background:'rgba(15,14,12,0.9)',backdropFilter:'blur(12px)'}}>
        <span style={{fontSize:12,letterSpacing:'.2em',opacity:.5,fontFamily:'monospace'}}>CHORD·STUDIO</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={()=>setShowDefis(v=>!v)} style={{display:'flex',alignItems:'center',gap:6,background:showDefis?'rgba(247,220,111,0.12)':'transparent',border:`0.5px solid ${showDefis?'rgba(247,220,111,0.4)':'rgba(240,235,224,0.15)'}`,color:showDefis?'#F7DC6F':'rgba(240,235,224,0.55)',padding:'.35rem .85rem',borderRadius:2,cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.08em',transition:'all 0.2s'}}>
            <span style={{fontSize:13}}>🗝️</span>
            <span style={{fontWeight:'bold'}}>{keys}</span>
            <span style={{opacity:.6}}>DÉFIS</span>
          </button>
          <button onClick={()=>setShowTip(v=>!v)} style={{background:'transparent',border:`0.5px solid ${showTip?'rgba(247,220,111,0.5)':'rgba(240,235,224,0.15)'}`,color:showTip?'#F7DC6F':'rgba(240,235,224,0.45)',padding:'.35rem .85rem',borderRadius:2,cursor:'pointer',fontSize:11,fontFamily:'monospace',letterSpacing:'.1em',transition:'all 0.2s'}}>💡</button>
        </div>
      </header>

      {/* Pages */}
      <div style={{flex:1,paddingTop:55,paddingBottom:64,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {page==='competences'   && <CompetencesPage skills={skills} instrument={instrument} setInstrument={setInstrument} stats={stats}/>}
        {page==='apprentissage' && <ApprentissagePage sub={apprentissageSub} setSub={setApprentiassageSub}/>}
        {page==='partage'       && <PlaceholderPage title="Partage" icon="↗" description="PARTAGE TA PROGRESSION BIENTÔT"/>}
      </div>

      {/* Navigation bas */}
      <nav style={{position:'fixed',bottom:0,left:0,right:0,display:'flex',borderTop:'0.5px solid rgba(240,235,224,0.08)',background:'rgba(15,14,12,0.92)',backdropFilter:'blur(12px)',zIndex:10}}>
        {NAV.map(({id,label,icon}) => {
          const isA=page===id, ac=NC[id];
          return (
            <button key={id} onClick={()=>setPage(id)} style={{flex:1,padding:'.7rem .25rem',background:'none',border:'none',color:isA?ac:'rgba(240,235,224,0.28)',cursor:'pointer',transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:3,borderTop:isA?`1.5px solid ${ac}`:'1.5px solid transparent'}}>
              <span style={{fontSize:15}}>{icon}</span>
              <span style={{fontSize:8,fontFamily:'monospace',letterSpacing:'.04em'}}>{label.toUpperCase()}</span>
            </button>
          );
        })}
      </nav>

      {showTip   && <TipPopup tip={TIPS[tipIndex]} onClose={()=>setShowTip(false)} onNext={()=>setTipIndex(i=>(i+1)%TIPS.length)}/>}
      {showDefis && <DefisPanel stats={stats} onClose={()=>setShowDefis(false)}/>}

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box} button{cursor:pointer}
      `}</style>
    </div>
  );
}
