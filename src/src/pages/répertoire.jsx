// ── Page Répertoire (remplace Bibliotheque.jsx) ───────────────────────────────
// Onglets : Accords | Partitions | Grilles | Impro
import { useState } from "react";
import {
  CHORD_TYPES, ROOT_NOTES, NOTE_COLORS, CHROMATIC,
  INVERSION_NAMES, CHORD_COLORS,
} from '../data/music.js';
import {
  CHOPIN_WORKS, IMSLP_BASE, SONGS_TABS, IMPRO_PROGRESSIONS,
} from '../data/content.js';
import {
  getInversionAbsIndices, playChordArp, playTabChord,
} from '../utils/audio.js';
import { notifyLibraryView } from '../utils/stats.js';
import { PianoKeyboard } from '../components/ui.jsx';

// ── AccordsLibrary ────────────────────────────────────────────────────────────
function AccordsLibrary() {
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('type');
  const [selType, setSelType] = useState(null);
  const [selRoot, setSelRoot] = useState(null);
  const [inv, setInv] = useState(0);
  const [showPiano, setShowPiano] = useState(false);

  const cName = selRoot && selType ? selRoot + CHORD_TYPES[selType].suffix : null;
  const cNotes = selRoot && selType
    ? (() => { const ri = CHROMATIC.indexOf(selRoot); return CHORD_TYPES[selType].formula.map(i => CHROMATIC[(ri + i) % 12]); })()
    : null;
  const inversions = cNotes ? cNotes.map((_, i) => [...cNotes.slice(i), ...cNotes.slice(0, i)]) : null;
  const aIdx = getInversionAbsIndices(inversions ? inversions[inv] : []);
  const color = selRoot ? (NOTE_COLORS[selRoot] || '#C39BD3') : '#C39BD3';

  const handleChordSelect = (root) => {
    setSelRoot(root); setInv(0); setShowModal(false); notifyLibraryView();
  };

  return (
    <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle,${color}12 0%,transparent 70%)`, transition: 'background 0.8s ease', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: cName ? 90 : 60, fontWeight: 'bold', color: cName ? color : 'rgba(240,235,224,0.1)', transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)', lineHeight: 1, marginBottom: '.5rem', minHeight: 95, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {cName || '—'}
        </div>
        <p style={{ fontSize: 11, letterSpacing: '.2em', opacity: .35, marginBottom: '1.25rem', fontFamily: 'monospace', textTransform: 'uppercase' }}>
          {selType ? CHORD_TYPES[selType].label : 'Sélectionnez un accord pour commencer'}
        </p>

        {cNotes && (
          <div style={{ marginBottom: '1.25rem', animation: 'fadeIn 0.4s ease forwards' }}>
            <div style={{ fontSize: 10, letterSpacing: '.2em', opacity: .3, fontFamily: 'monospace', marginBottom: '.65rem' }}>NOTES</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {inversions[inv].map((note, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', border: `1px solid ${NOTE_COLORS[note]}50`, background: `${NOTE_COLORS[note]}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold', color: NOTE_COLORS[note], fontFamily: 'monospace' }}>{note}</div>
                  <div style={{ fontSize: 9, opacity: .3, fontFamily: 'monospace' }}>{i === 0 ? 'BASSE' : i === cNotes.length - 1 ? 'AIGU' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button onClick={() => { setModalStep('type'); setShowModal(true); }}
            style={{ background: 'transparent', border: `1px solid ${cName ? color : 'rgba(240,235,224,0.2)'}`, color: cName ? color : '#f0ebe0', padding: '.75rem 1.5rem', fontSize: 12, letterSpacing: '.15em', cursor: 'pointer', borderRadius: 2, transition: 'all 0.3s ease', fontFamily: 'monospace', textTransform: 'uppercase' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}14`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {cName ? "Changer d'accord" : 'Choisir un accord'}
          </button>
          {cName && (
            <button onClick={() => setShowPiano(v => !v)}
              style={{ background: showPiano ? `${color}18` : 'transparent', border: `1px solid ${showPiano ? color : 'rgba(240,235,224,0.2)'}`, color: showPiano ? color : 'rgba(240,235,224,0.6)', padding: '.75rem 1.1rem', fontSize: 12, letterSpacing: '.15em', cursor: 'pointer', borderRadius: 2, transition: 'all 0.3s ease', fontFamily: 'monospace', textTransform: 'uppercase' }}>
              🎹 Clavier
            </button>
          )}
        </div>

        {showPiano && cNotes && (
          <div style={{ marginBottom: '1.5rem', padding: '1.25rem 1rem', background: 'rgba(240,235,224,0.02)', border: '0.5px solid rgba(240,235,224,0.07)', borderRadius: 4, overflowX: 'auto' }}>
            <div style={{ fontSize: 10, letterSpacing: '.2em', opacity: .3, fontFamily: 'monospace', marginBottom: '.75rem' }}>CLAVIER</div>
            <PianoKeyboard activeAbsIndices={aIdx} color={color} />
          </div>
        )}

        {inversions && (
          <div style={{ animation: 'fadeIn 0.4s ease 0.15s both' }}>
            <div style={{ fontSize: 10, letterSpacing: '.2em', opacity: .3, fontFamily: 'monospace', marginBottom: '.65rem' }}>RENVERSEMENTS</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {inversions.map((iv, i) => (
                <button key={i} onClick={() => setInv(i)}
                  style={{ background: inv === i ? `${color}18` : 'transparent', border: `0.5px solid ${inv === i ? color : 'rgba(240,235,224,0.15)'}`, color: inv === i ? color : 'rgba(240,235,224,0.45)', padding: '.5rem .85rem', borderRadius: 2, cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
                  onMouseEnter={e => { if (inv !== i) e.currentTarget.style.borderColor = `${color}60`; }}
                  onMouseLeave={e => { if (inv !== i) e.currentTarget.style.borderColor = 'rgba(240,235,224,0.15)'; }}>
                  <span>{INVERSION_NAMES[i]}</span>
                  <span style={{ opacity: .5, fontSize: 9 }}>{iv.join(' – ')}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div onClick={e => e.target === e.currentTarget && setShowModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: '#161512', border: '0.5px solid rgba(240,235,224,0.1)', borderRadius: 4, width: 'min(540px,92vw)', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(240,235,224,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {modalStep === 'root' && <button onClick={() => setModalStep('type')} style={{ background: 'none', border: 'none', color: '#f0ebe0', opacity: .4, cursor: 'pointer', fontSize: 18, padding: '0 6px 0 0' }}>←</button>}
                <span style={{ fontSize: 11, letterSpacing: '.2em', opacity: .4, fontFamily: 'monospace' }}>
                  {modalStep === 'type' ? "1 · TYPE D'ACCORD" : `2 · NOTE RACINE — ${CHORD_TYPES[selType].label.toUpperCase()}`}
                </span>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#f0ebe0', opacity: .35, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '2px 4px' }}>×</button>
            </div>
            {modalStep === 'type' && (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                {Object.entries(CHORD_TYPES).map(([type, { label }]) => {
                  const ex = CHORD_TYPES[type].formula.map(i => CHROMATIC[i]);
                  const isA = selType === type;
                  return (
                    <button key={type} onClick={() => { setSelType(type); setSelRoot(null); setModalStep('root'); }}
                      style={{ background: isA ? 'rgba(195,155,211,0.1)' : 'rgba(240,235,224,0.02)', border: `0.5px solid ${isA ? '#C39BD3' : 'rgba(240,235,224,0.1)'}`, borderRadius: 2, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}
                      onMouseEnter={e => { if (!isA) e.currentTarget.style.background = 'rgba(240,235,224,0.05)'; }}
                      onMouseLeave={e => { if (!isA) e.currentTarget.style.background = 'rgba(240,235,224,0.02)'; }}>
                      <div>
                        <div style={{ fontSize: 16, color: isA ? '#C39BD3' : '#f0ebe0', fontFamily: 'Georgia,serif', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 11, opacity: .35, fontFamily: 'monospace' }}>ex. C{CHORD_TYPES[type].suffix} → {ex.join(' – ')}</div>
                      </div>
                      <span style={{ color: isA ? '#C39BD3' : 'rgba(240,235,224,0.2)', fontSize: 18 }}>›</span>
                    </button>
                  );
                })}
              </div>
            )}
            {modalStep === 'root' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: '1.25rem', overflowY: 'auto' }}>
                {ROOT_NOTES.map(root => {
                  const c = NOTE_COLORS[root] || '#C39BD3';
                  const ri = CHROMATIC.indexOf(root);
                  const prev = CHORD_TYPES[selType].formula.map(i => CHROMATIC[(ri + i) % 12]);
                  const isA = selRoot === root;
                  return (
                    <button key={root} onClick={() => handleChordSelect(root)}
                      style={{ background: isA ? `${c}20` : 'rgba(240,235,224,0.03)', border: `0.5px solid ${isA ? c : 'rgba(240,235,224,0.1)'}`, color: isA ? c : 'rgba(240,235,224,0.8)', padding: '1rem .5rem', borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${c}18`; e.currentTarget.style.borderColor = `${c}80`; e.currentTarget.style.color = c; }}
                      onMouseLeave={e => { if (!isA) { e.currentTarget.style.background = 'rgba(240,235,224,0.03)'; e.currentTarget.style.borderColor = 'rgba(240,235,224,0.1)'; e.currentTarget.style.color = 'rgba(240,235,224,0.8)'; } }}>
                      <span style={{ fontSize: 22, fontWeight: 'bold' }}>{root}</span>
                      <span style={{ fontSize: 9, opacity: .45, fontFamily: 'monospace' }}>{prev.join('·')}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ScoreViewer (modal plein écran) ───────────────────────────────────────────
function ScoreViewer({ work, onClose }) {
  const [viewMode, setViewMode] = useState('info');
  const imslpUrl = `https://imslp.org/wiki/${work.url}`;
  const title = `Op.${work.op}${work.no ? ` n°${work.no}` : ''} — ${work.key}${work.nick ? ` "${work.nick}"` : ''}`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: '#0f0e0c', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(240,235,224,0.1)', flexShrink: 0, background: 'rgba(15,14,12,0.95)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', fontFamily: 'Georgia,serif' }}>{title}</div>
          <div style={{ fontSize: 9, opacity: .4, fontFamily: 'monospace', letterSpacing: '.08em' }}>FRÉDÉRIC CHOPIN — DOMAINE PUBLIC</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#f0ebe0', opacity: .5, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(240,235,224,0.08)', flexShrink: 0 }}>
        {[['info', 'Infos'], ['viewer', 'Partition']].map(([id, label]) => (
          <button key={id} onClick={() => setViewMode(id)}
            style={{ flex: 1, padding: '.6rem', background: 'none', border: 'none', color: viewMode === id ? '#C39BD3' : 'rgba(240,235,224,0.35)', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.08em', borderBottom: viewMode === id ? '1.5px solid #C39BD3' : '1.5px solid transparent', transition: 'all 0.2s' }}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>
      {viewMode === 'info' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: '.25rem' }}>
            {[1, 2, 3, 4, 5].map(s => (<div key={s} style={{ width: 10, height: 10, borderRadius: '50%', background: s <= work.diff ? '#C39BD3' : 'rgba(240,235,224,0.12)' }} />))}
            <span style={{ fontSize: 10, opacity: .4, fontFamily: 'monospace', marginLeft: 8 }}>Difficulté {work.diff}/5</span>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(195,155,211,0.05)', border: '0.5px solid rgba(195,155,211,0.15)', borderRadius: 4 }}>
            <p style={{ fontSize: 13, opacity: .65, lineHeight: 1.7, margin: 0, fontFamily: 'Georgia,serif' }}>
              Cette partition est dans le domaine public, disponible gratuitement via IMSLP — la plus grande bibliothèque de partitions au monde.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setViewMode('viewer')}
              style={{ padding: '.9rem', background: 'rgba(195,155,211,0.15)', border: '1px solid #C39BD3', color: '#C39BD3', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontFamily: 'monospace', letterSpacing: '.15em', fontWeight: 'bold' }}>
              📖 VOIR LA PARTITION
            </button>
            <a href={imslpUrl} target="_blank" rel="noopener noreferrer"
              style={{ padding: '.9rem', background: 'transparent', border: '0.5px solid rgba(240,235,224,0.2)', color: 'rgba(240,235,224,0.6)', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontFamily: 'monospace', letterSpacing: '.15em', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
              ↗ OUVRIR SUR IMSLP
            </a>
          </div>
          <div style={{ padding: '.75rem', background: 'rgba(133,193,233,0.05)', border: '0.5px solid rgba(133,193,233,0.15)', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: '#85C1E9', fontFamily: 'monospace', letterSpacing: '.08em', marginBottom: '.35rem' }}>SAUVEGARDER SUR ANDROID</div>
            <p style={{ fontSize: 11, opacity: .5, lineHeight: 1.8, margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-line' }}>{`1. Appuie sur "Voir la partition"\n2. Le PDF s'ouvre dans Chrome\n3. Appuie sur l'icône ↓ pour télécharger`}</p>
          </div>
        </div>
      )}
      {viewMode === 'viewer' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '.5rem 1rem', background: 'rgba(15,14,12,0.8)', borderBottom: '0.5px solid rgba(240,235,224,0.06)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9, opacity: .35, fontFamily: 'monospace' }}>VIA IMSLP.ORG</span>
            <a href={imslpUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: '#C39BD3', fontFamily: 'monospace', letterSpacing: '.08em', textDecoration: 'none' }}>
              OUVRIR EN PLEIN ÉCRAN ↗
            </a>
          </div>
          <iframe src={imslpUrl} style={{ flex: 1, border: 'none', background: '#fff' }} title={title} />
        </div>
      )}
    </div>
  );
}

// ── Partitions ────────────────────────────────────────────────────────────────
function PartitionsPage() {
  const [tab, setTab] = useState('etudes');
  const [selectedWork, setSelectedWork] = useState(null);
  const works = tab === 'etudes' ? CHOPIN_WORKS.etudes : CHOPIN_WORKS.nocturnes;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {selectedWork && <ScoreViewer work={selectedWork} onClose={() => setSelectedWork(null)} />}
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(240,235,224,0.08)', background: 'rgba(15,14,12,0.4)', flexShrink: 0 }}>
        {[['etudes', 'Études'], ['nocturnes', 'Nocturnes']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex: 1, padding: '.6rem', background: 'none', border: 'none', color: tab === id ? '#C39BD3' : 'rgba(240,235,224,0.35)', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.08em', borderBottom: tab === id ? '1.5px solid #C39BD3' : '1.5px solid transparent', transition: 'all 0.2s' }}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <div style={{ marginBottom: '1rem', padding: '.75rem', background: 'rgba(195,155,211,0.05)', border: '0.5px solid rgba(195,155,211,0.15)', borderRadius: 4 }}>
          <div style={{ fontSize: 11, color: '#C39BD3', fontFamily: 'monospace', letterSpacing: '.1em', marginBottom: '.35rem' }}>FRÉDÉRIC CHOPIN — DOMAINE PUBLIC</div>
          <p style={{ fontSize: 12, opacity: .5, margin: 0, lineHeight: 1.5, fontFamily: 'Georgia,serif' }}>Appuie sur une pièce pour l'ouvrir dans l'app et la sauvegarder.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {works.map((w, i) => (
            <button key={i} onClick={() => setSelectedWork(w)}
              style={{ background: 'rgba(240,235,224,0.02)', border: '0.5px solid rgba(240,235,224,0.1)', borderRadius: 4, padding: '.9rem 1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(195,155,211,0.07)'; e.currentTarget.style.borderColor = 'rgba(195,155,211,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,235,224,0.02)'; e.currentTarget.style.borderColor = 'rgba(240,235,224,0.1)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, color: '#C39BD3', fontFamily: 'monospace', opacity: .7 }}>Op.{w.op}{w.no ? ` n°${w.no}` : ''}</span>
                  <span style={{ fontSize: 14, fontWeight: 'bold', color: '#f0ebe0', fontFamily: 'Georgia,serif' }}>{w.key}</span>
                  {w.nick && <span style={{ fontSize: 11, color: 'rgba(240,235,224,0.45)', fontStyle: 'italic' }}>"{w.nick}"</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(s => (<div key={s} style={{ width: 6, height: 6, borderRadius: '50%', background: s <= w.diff ? '#C39BD3' : 'rgba(240,235,224,0.15)' }} />))}</div>
                  <span style={{ fontSize: 11, color: '#C39BD3', opacity: .6 }}>›</span>
                </div>
              </div>
              <div style={{ fontSize: 9, opacity: .3, fontFamily: 'monospace', letterSpacing: '.05em' }}>VOIR ET TÉLÉCHARGER LA PARTITION</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Grilles (anciennement Tabs) ───────────────────────────────────────────────
function GrillesPage() {
  const [filter, setFilter] = useState('tous');
  const [playing, setPlaying] = useState(null);
  const cats = ['tous', 'classique', 'folk', 'pop'];
  const filtered = filter === 'tous' ? SONGS_TABS : SONGS_TABS.filter(s => s.cat === filter);

  const handleChordClick = (songId, ci, chord) => {
    setPlaying(`${songId}-${ci}`);
    playTabChord(chord.n, chord.t);
    setTimeout(() => setPlaying(null), 1200);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 6, padding: '.75rem 1rem', borderBottom: '0.5px solid rgba(240,235,224,0.08)', flexShrink: 0, overflowX: 'auto' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ padding: '.3rem .8rem', background: filter === c ? 'rgba(195,155,211,0.15)' : 'transparent', border: `0.5px solid ${filter === c ? '#C39BD3' : 'rgba(240,235,224,0.15)'}`, color: filter === c ? '#C39BD3' : 'rgba(240,235,224,0.45)', borderRadius: 2, cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', letterSpacing: '.08em', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}>
            {c.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: '.65rem .9rem', background: 'rgba(130,224,170,0.05)', border: '0.5px solid rgba(130,224,170,0.15)', borderRadius: 4, fontSize: 11, color: 'rgba(130,224,170,0.7)', fontFamily: 'monospace' }}>
          🎹 Clique sur un accord pour l'entendre
        </div>
        {filtered.map(song => (
          <div key={song.id} style={{ background: 'rgba(240,235,224,0.025)', border: '0.5px solid rgba(240,235,224,0.1)', borderRadius: 4, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'Georgia,serif', marginBottom: 2 }}>{song.title}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, opacity: .45, fontFamily: 'monospace' }}>{song.artist}</span>
                  <span style={{ fontSize: 9, opacity: .3, fontFamily: 'monospace' }}>{song.era}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: song.color, padding: '2px 8px', background: `${song.color}15`, border: `0.5px solid ${song.color}40`, borderRadius: 2 }}>{song.key}</span>
                <span style={{ fontSize: 9, opacity: .35, fontFamily: 'monospace' }}>{song.bpm} BPM</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {song.chords.map((chord, ci) => {
                const isPlaying = playing === `${song.id}-${ci}`;
                const cInfo = CHORD_TYPES[chord.t];
                const nc = NOTE_COLORS[chord.n] || '#C39BD3';
                return (
                  <button key={ci} onClick={() => handleChordClick(song.id, ci, chord)}
                    style={{ background: isPlaying ? `${nc}25` : `${nc}10`, border: `0.5px solid ${isPlaying ? nc : nc + '40'}`, borderRadius: 3, padding: '.45rem .7rem', cursor: 'pointer', transition: 'all 0.15s', transform: isPlaying ? 'scale(1.08)' : 'scale(1)' }}>
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: nc, fontFamily: 'monospace', lineHeight: 1 }}>{chord.n}{cInfo?.suffix}</div>
                    <div style={{ fontSize: 8, opacity: .45, fontFamily: 'monospace', marginTop: 2 }}>{cInfo?.label.split(' ')[0]}</div>
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

// ── ImproPage ─────────────────────────────────────────────────────────────────
function ImproPage() {
  const [selected, setSelected] = useState(null);
  const [activeChord, setActiveChord] = useState(null);
  const [sequencing, setSequencing] = useState(false);

  function getChordNotes(root, type) {
    const ri = CHROMATIC.indexOf(root);
    if (ri === -1 || !CHORD_TYPES[type]) return [];
    return CHORD_TYPES[type].formula.map(i => ri + i);
  }
  function playChord(root, type, idx) {
    setActiveChord(idx);
    playChordArp(getChordNotes(root, type).map(n => n + 4 * 12));
    setTimeout(() => setActiveChord(null), 1000);
  }
  async function playSequence(prog) {
    if (sequencing) return;
    setSequencing(true);
    for (let i = 0; i < prog.chords.length; i++) {
      setActiveChord(i);
      playChordArp(getChordNotes(prog.chords[i].r, prog.chords[i].t).map(n => n + 4 * 12));
      await new Promise(r => setTimeout(r, 1300));
    }
    setActiveChord(null);
    setSequencing(false);
  }

  const pianoColors = {};
  if (selected && activeChord !== null) {
    const chord = selected.chords[activeChord];
    const c = NOTE_COLORS[chord.r] || selected.color;
    getChordNotes(chord.r, chord.t).forEach(n => { pianoColors[n] = c; pianoColors[n + 12] = c; });
  }

  const fnColors = { I: '#85C1E9', IV: '#82E0AA', V: '#F7DC6F', vi: '#C39BD3', ii: '#F1948A', iii: '#AED6F1', VII: '#E8A87C' };
  const getFnColor = fn => fnColors[fn.replace(/[0-9]/g, '')] || 'rgba(240,235,224,0.4)';

  if (selected) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '.65rem 1rem', borderBottom: '0.5px solid rgba(240,235,224,0.08)', background: 'rgba(15,14,12,0.6)', flexShrink: 0 }}>
          <button onClick={() => { setSelected(null); setActiveChord(null); setSequencing(false); }}
            style={{ background: 'none', border: 'none', color: 'rgba(240,235,224,0.5)', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.05em', padding: '4px 8px', borderRadius: 2 }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0ebe0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.5)'}>
            ← IMPRO
          </button>
          <span style={{ opacity: .2 }}>|</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: selected.color, letterSpacing: '.05em' }}>{selected.style.toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 'bold', fontFamily: 'Georgia,serif', color: selected.color, marginBottom: 4 }}>{selected.name}</div>
            <div style={{ fontSize: 11, opacity: .45, fontFamily: 'monospace', letterSpacing: '.1em' }}>{selected.style.toUpperCase()}</div>
          </div>
          <div style={{ padding: '1rem', background: `${selected.color}08`, border: `0.5px solid ${selected.color}30`, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: selected.color, fontFamily: 'monospace', letterSpacing: '.1em', marginBottom: '.5rem' }}>COULEUR ÉMOTIONNELLE</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, opacity: .78, margin: 0, fontFamily: 'Georgia,serif' }}>{selected.emotion}</p>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
              <span style={{ fontSize: 10, letterSpacing: '.15em', opacity: .3, fontFamily: 'monospace' }}>ACCORDS</span>
              <button onClick={() => playSequence(selected)} disabled={sequencing}
                style={{ background: sequencing ? `${selected.color}20` : 'transparent', border: `0.5px solid ${sequencing ? selected.color : 'rgba(240,235,224,0.2)'}`, color: sequencing ? selected.color : 'rgba(240,235,224,0.55)', padding: '.35rem .85rem', borderRadius: 2, cursor: sequencing ? 'default' : 'pointer', fontSize: 10, fontFamily: 'monospace', letterSpacing: '.08em', transition: 'all 0.2s' }}>
                {sequencing ? '▶ EN COURS…' : '▶ JOUER LA SÉQUENCE'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selected.chords.map((chord, ci) => {
                const isActive = activeChord === ci;
                const nc = NOTE_COLORS[chord.r] || selected.color;
                return (
                  <button key={ci} onClick={() => playChord(chord.r, chord.t, ci)}
                    style={{ background: isActive ? `${nc}25` : `${nc}10`, border: `0.5px solid ${isActive ? nc : nc + '40'}`, borderRadius: 3, padding: '.65rem .9rem', cursor: 'pointer', transition: 'all 0.15s', transform: isActive ? 'scale(1.06)' : 'scale(1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, fontFamily: 'monospace', color: getFnColor(chord.fn), letterSpacing: '.05em' }}>{chord.fn}</span>
                    <span style={{ fontSize: 17, fontWeight: 'bold', color: nc, fontFamily: 'monospace', lineHeight: 1 }}>{chord.r}{CHORD_TYPES[chord.t]?.suffix}</span>
                    <span style={{ fontSize: 8, opacity: .45, fontFamily: 'monospace' }}>{CHORD_TYPES[chord.t]?.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {activeChord !== null && (
            <div style={{ padding: '1rem', background: 'rgba(240,235,224,0.02)', border: '0.5px solid rgba(240,235,224,0.07)', borderRadius: 4, overflowX: 'auto', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ fontSize: 9, opacity: .3, fontFamily: 'monospace', marginBottom: '.75rem', textAlign: 'center' }}>
                TOUCHES À ENFONCER — {selected.chords[activeChord]?.r}{CHORD_TYPES[selected.chords[activeChord]?.t]?.suffix}
              </div>
              <PianoKeyboard colors={pianoColors} />
            </div>
          )}
          <div style={{ padding: '1rem', background: 'rgba(130,224,170,0.04)', border: '0.5px solid rgba(130,224,170,0.15)', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: '#82E0AA', fontFamily: 'monospace', letterSpacing: '.1em', marginBottom: '.65rem' }}>GAMMES COMPATIBLES</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selected.scales.map((s, i) => (
                <span key={i} style={{ fontSize: 11, fontFamily: 'Georgia,serif', color: 'rgba(240,235,224,0.7)', padding: '.3rem .8rem', background: 'rgba(130,224,170,0.08)', border: '0.5px solid rgba(130,224,170,0.2)', borderRadius: 2 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1rem', padding: '.75rem', background: 'rgba(130,224,170,0.04)', border: '0.5px solid rgba(130,224,170,0.15)', borderRadius: 4 }}>
        <div style={{ fontSize: 11, color: '#82E0AA', fontFamily: 'monospace', letterSpacing: '.1em', marginBottom: '.3rem' }}>10 PROGRESSIONS ESSENTIELLES</div>
        <p style={{ fontSize: 12, opacity: .5, margin: 0, lineHeight: 1.5, fontFamily: 'Georgia,serif' }}>Analyse émotionnelle, accords interactifs, séquenceur et gammes compatibles.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {IMPRO_PROGRESSIONS.map(prog => (
          <button key={prog.id} onClick={() => { setSelected(prog); setActiveChord(null); }}
            style={{ background: 'rgba(240,235,224,0.025)', border: '0.5px solid rgba(240,235,224,0.1)', borderRadius: 4, padding: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${prog.color}08`; e.currentTarget.style.borderColor = `${prog.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,235,224,0.025)'; e.currentTarget.style.borderColor = 'rgba(240,235,224,0.1)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'Georgia,serif', color: prog.color, marginBottom: 2 }}>{prog.name}</div>
                <div style={{ fontSize: 10, opacity: .45, fontFamily: 'monospace', letterSpacing: '.06em' }}>{prog.style.toUpperCase()}</div>
              </div>
              <span style={{ fontSize: 14, opacity: .35 }}>›</span>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {prog.chords.map((chord, ci) => (
                <span key={ci} style={{ fontSize: 10, fontFamily: 'monospace', color: NOTE_COLORS[chord.r] || prog.color, padding: '2px 6px', background: `${NOTE_COLORS[chord.r] || prog.color}15`, borderRadius: 2 }}>
                  {chord.r}{CHORD_TYPES[chord.t]?.suffix}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── RepertoirePage — onglets principaux ───────────────────────────────────────
export function RepertoirePage() {
  const [tab, setTab] = useState('accords');
  const TABS = [
    { id: 'accords',    label: 'Accords',    color: '#C39BD3' },
    { id: 'partitions', label: 'Partitions', color: '#85C1E9' },
    { id: 'grilles',    label: 'Grilles',    color: '#82E0AA' },
    { id: 'impro',      label: 'Impro',      color: '#F7DC6F' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(240,235,224,0.08)', background: 'rgba(15,14,12,0.6)', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '.7rem .1rem', background: 'none', border: 'none', color: tab === t.id ? t.color : 'rgba(240,235,224,0.3)', cursor: 'pointer', fontSize: 9, fontFamily: 'monospace', letterSpacing: '.04em', borderBottom: tab === t.id ? `1.5px solid ${t.color}` : '1.5px solid transparent', transition: 'all 0.2s' }}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'accords'    && <AccordsLibrary />}
        {tab === 'partitions' && <PartitionsPage />}
        {tab === 'grilles'    && <GrillesPage />}
        {tab === 'impro'      && <ImproPage />}
      </div>
    </div>
  );
}
