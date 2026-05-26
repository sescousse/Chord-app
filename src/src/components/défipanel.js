// ── Panneau des défis journaliers ─────────────────────────────────────────────
import { getDailyChallenges, isCompleted } from '../data/content.js';
import { todayStr } from '../utils/stats.js';

export function DefisPanel({ stats, onClose }) {
  const today = todayStr();
  const challenges = getDailyChallenges(today);
  const keys = stats.keys || 0;

  function getProgress(c) {
    switch (c.id) {
      case 'c_warmup':   return { cur: Math.min(stats.todayExercises||0,1),  max: 1  };
      case 'c_ten':      return { cur: Math.min(stats.todayExercises||0,10), max: 10 };
      case 'c_twenty':   return { cur: Math.min(stats.todayExercises||0,20), max: 20 };
      case 'c_perfect':  return { cur: stats.lastPerfect===today?1:0,        max: 1  };
      case 'c_interval': return { cur: stats.lastIntervalDay===today?1:0,    max: 1  };
      case 'c_chord_ear':return { cur: stats.lastChordEarDay===today?1:0,    max: 1  };
      case 'c_library':  return { cur: Math.min(stats.todayLibViews||0,5),   max: 5  };
      case 'c_sections': return { cur: Math.min(stats.todaySections||0,3),   max: 3  };
      default: return { cur: 0, max: 1 };
    }
  }

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:150,backdropFilter:'blur(8px)'}}>
      <div style={{background:'#161512',border:'0.5px solid rgba(240,235,224,0.12)',borderRadius:6,width:'min(420px,92vw)',maxHeight:'85vh',overflow:'hidden',display:'flex',flexDirection:'column',animation:'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>

        {/* Header */}
        <div style={{padding:'1.25rem 1.5rem',borderBottom:'0.5px solid rgba(240,235,224,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(247,220,111,0.04)'}}>
          <div>
            <div style={{fontSize:14,fontWeight:'bold',fontFamily:'Georgia,serif',marginBottom:2}}>Défis du Jour</div>
            <div style={{fontSize:10,opacity:.4,fontFamily:'monospace',letterSpacing:'.1em'}}>SE RÉINITIALISENT À MINUIT</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'.4rem .9rem',background:'rgba(247,220,111,0.1)',border:'0.5px solid rgba(247,220,111,0.3)',borderRadius:3}}>
              <span style={{fontSize:16}}>🗝️</span>
              <span style={{fontSize:18,fontWeight:'bold',color:'#F7DC6F',fontFamily:'Georgia,serif'}}>{keys}</span>
              <span style={{fontSize:9,opacity:.5,fontFamily:'monospace'}}>CLÉS</span>
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',color:'#f0ebe0',opacity:.35,cursor:'pointer',fontSize:20,lineHeight:1,padding:'2px 4px'}}>×</button>
          </div>
        </div>

        {/* Challenges list */}
        <div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:10,overflowY:'auto'}}>
          {challenges.map(c => {
            const done = isCompleted(c.id, stats, today);
            const prog = getProgress(c);
            const pct  = prog.max>0 ? Math.round((prog.cur/prog.max)*100) : 0;
            return (
              <div key={c.id} style={{background:done?'rgba(130,224,170,0.05)':'rgba(240,235,224,0.025)',border:`0.5px solid ${done?'rgba(130,224,170,0.3)':'rgba(240,235,224,0.1)'}`,borderRadius:4,padding:'1rem',transition:'all 0.3s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:done?0:'.75rem'}}>
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
                    {done && <span style={{fontSize:9,color:'#82E0AA',fontFamily:'monospace',letterSpacing:'.05em'}}>✓ COMPLÉTÉ</span>}
                  </div>
                </div>
                {!done && (
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

        <div style={{padding:'.75rem 1.5rem',borderTop:'0.5px solid rgba(240,235,224,0.06)',textAlign:'center'}}>
          <p style={{fontSize:10,opacity:.3,fontFamily:'monospace',margin:0}}>Les clés débloqueront du contenu exclusif prochainement 🗝️</p>
        </div>
      </div>
    </div>
  );
}
