// ── Page Apprentissage (mise à jour) ─────────────────────────────────────────
// Remplace src/pages/Apprentissage.jsx
import { useState, useEffect } from "react";
import { SectionCard } from '../components/ui.jsx';
import { RepertoirePage } from './Repertoire.jsx';
import { OreilPage }      from './Oreille.jsx';
import { TechniquePage }  from './Technique.jsx';
import { TheoriePage }    from './Theorie.jsx';
import { notifySectionVisit } from '../utils/stats.js';

// Sections mises à jour : Répertoire | Oreille | Technique | Théorie
const APPRENTISSAGE_SECTIONS = [
  { id: 'repertoire', icon: '♩',  title: 'Répertoire', subtitle: 'ACCORDS · PARTITIONS · GRILLES · IMPRO', color: '#C39BD3' },
  { id: 'oreille',    icon: '👂', title: 'Oreille',     subtitle: 'INTERVALLES · ACCORDS · MÉLODIE',        color: '#85C1E9' },
  { id: 'technique',  icon: '✎',  title: 'Technique',   subtitle: 'SOLFÈGE · LECTURE · RYTHME',              color: '#82E0AA' },
  { id: 'theorie',    icon: '📖', title: 'Théorie',      subtitle: 'HARMONIE · JAZZ · COMPOSITION',           color: '#F7DC6F' },
];

function ApprentissageLanding({ onNavigate }) {
  useEffect(() => { notifySectionVisit(); }, []);

  return (
    <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: '.5rem', letterSpacing: '-.02em' }}>Apprentissage</h2>
        {/* Citation */}
        <p style={{ fontSize: 12, lineHeight: 1.65, color: 'rgba(240,235,224,0.45)', fontFamily: 'Georgia,serif', fontStyle: 'italic', margin: 0, paddingLeft: '.75rem', borderLeft: '2px solid rgba(240,235,224,0.15)' }}>
          "Les 4 essentiels à développer pour un pianiste sont son répertoire, sa technique, son oreille et sa connaissance de la théorie."
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        {APPRENTISSAGE_SECTIONS.map(s => (
          <SectionCard key={s.id} {...s} onClick={() => onNavigate(s.id)} />
        ))}
      </div>
    </div>
  );
}

export function ApprentissagePage({ sub, setSub }) {
  if (!sub || sub === 'landing') return <ApprentissageLanding onNavigate={setSub} />;

  const info = APPRENTISSAGE_SECTIONS.find(s => s.id === sub);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Barre de retour */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '.65rem 1rem', borderBottom: '0.5px solid rgba(240,235,224,0.08)', background: 'rgba(15,14,12,0.7)', flexShrink: 0 }}>
        <button onClick={() => setSub('landing')}
          style={{ background: 'none', border: 'none', color: 'rgba(240,235,224,0.5)', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.05em', padding: '4px 8px', borderRadius: 2, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f0ebe0'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.5)'}>
          ← APPRENTISSAGE
        </button>
        {info && <>
          <span style={{ opacity: .2 }}>|</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: info.color, letterSpacing: '.08em' }}>{info.title.toUpperCase()}</span>
        </>}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {sub === 'repertoire' && <RepertoirePage />}
        {sub === 'oreille'    && <OreilPage />}
        {sub === 'technique'  && <TechniquePage />}
        {sub === 'theorie'    && <TheoriePage />}
      </div>
    </div>
  );
}
