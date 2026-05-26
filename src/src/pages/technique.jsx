// ── Page Technique (remplace Exercices.jsx) ───────────────────────────────────
// Modules : Solfège | Lecture de partition | Rythme (bientôt) | Improvisation (bientôt)
import { useState, useEffect } from "react";
import { SOLFEGE_MAP, SOLFEGE_CHROM, LECTURE_MELODIES } from '../data/content.js';
import { playNote } from '../utils/audio.js';

// ── Portée musicale (SVG) ─────────────────────────────────────────────────────
function MusicStaff({ notes, currentIdx, feedback }) {
  // Positions Y des notes sur la portée en clé de Sol
  // Portée : ligne du bas y=95, espacement=10
  const NOTE_Y = {
    C4: 105, D4: 100, E4: 95, F4: 90,
    G4: 85,  A4: 80,  B4: 75, C5: 70,
    D5: 65,  E5: 60,  F5: 55,
  };
  const STAFF_LINES = [95, 85, 75, 65, 55]; // bas → haut

  const noteSpacing = Math.min(52, 280 / Math.max(notes.length, 1));
  const svgW = 58 + notes.length * noteSpacing + 18;

  const getColor = (i) => {
    if (i < currentIdx) return '#999';
    if (i > currentIdx) return '#ccc';
    if (feedback === 'correct') return '#22c55e';
    if (feedback === 'wrong')   return '#ef4444';
    return '#4a9eff';
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: 6, background: '#faf9f4', padding: '6px 0 4px' }}>
      <svg viewBox={`0 0 ${svgW} 125`}
        style={{ minWidth: svgW, height: 105, display: 'block' }}>

        {/* Lignes de portée */}
        {STAFF_LINES.map((y, i) => (
          <line key={i} x1={42} y1={y} x2={svgW - 5} y2={y}
            stroke="#2a2620" strokeWidth={0.9} />
        ))}

        {/* Clé de Sol — caractère Unicode */}
        <text x={3} y={105} fontSize={68} fill="#2a2620"
          fontFamily="'Georgia', 'Times New Roman', serif"
          style={{ userSelect: 'none' }}>
          𝄞
        </text>

        {/* Notes */}
        {notes.map((note, ni) => {
          const x   = 57 + ni * noteSpacing;
          const y   = NOTE_Y[note] ?? 75;
          const col = getColor(ni);
          const stemUp = y >= 75; // tiges vers le haut pour notes graves

          return (
            <g key={ni}>
              {/* Ligne de rappel pour C4 (en dessous de la portée) */}
              {note === 'C4' && (
                <line x1={x - 9} y1={105} x2={x + 9} y2={105}
                  stroke={col} strokeWidth={1.2} />
              )}
              {/* Tête de note (ovale) */}
              <ellipse cx={x} cy={y} rx={5.5} ry={4}
                fill={ni <= currentIdx ? col : '#ddd'}
                stroke={ni <= currentIdx ? col : '#bbb'}
                strokeWidth={0.8} />
              {/* Hampe */}
              {stemUp
                ? <line x1={x + 5.2} y1={y - 1} x2={x + 5.2} y2={y - 26} stroke={col} strokeWidth={1.5} />
                : <line x1={x - 5.2} y1={y + 1} x2={x - 5.2} y2={y + 26} stroke={col} strokeWidth={1.5} />
              }
            </g>
          );
        })}

        {/* Numérotation discrète de la note courante */}
        {notes.map((_, ni) => ni === currentIdx && (
          <text key={`n${ni}`} x={57 + ni * noteSpacing} y={118}
            textAnchor="middle" fontSize={8} fill="#4a9eff"
            fontFamily="monospace">▲</text>
        ))}
      </svg>
    </div>
  );
}

// ── Exercice de lecture de partition ─────────────────────────────────────────
function LectureExercice() {
  const NOTE_SOLFEGE = {
    C4: 'Do', D4: 'Ré', E4: 'Mi', F4: 'Fa',
    G4: 'Sol', A4: 'La', B4: 'Si', C5: 'Do',
    D5: 'Ré',  E5: 'Mi', F5: 'Fa',
  };
  const NOTE_SEMI = {
    C4: 0,  D4: 2,  E4: 4,  F4: 5,
    G4: 7,  A4: 9,  B4: 11, C5: 12,
    D5: 14, E5: 16, F5: 17,
  };
  const SOLFEGES = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
  const SOL_COLORS = {
    Do: '#E8A87C', Ré: '#85C1E9', Mi: '#82E0AA', Fa: '#F1948A',
    Sol: '#C39BD3', La: '#F7DC6F', Si: '#AED6F1',
  };

  const [melody,   setMelody]   = useState(null);
  const [noteIdx,  setNoteIdx]  = useState(0);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [score,    setScore]    = useState({ correct: 0, total: 0 });
  const [done,     setDone]     = useState(false);

  const currentNote    = melody ? melody.notes[noteIdx] : null;
  const correctSolfege = currentNote ? NOTE_SOLFEGE[currentNote] : null;

  const handleAnswer = (sol) => {
    if (feedback) return;
    const isCorrect = sol === correctSolfege;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    // Jouer la note pour feedback auditif
    playNote(NOTE_SEMI[currentNote] ?? 0, 0, 1.2);
    setTimeout(() => {
      setFeedback(null);
      if (noteIdx >= melody.notes.length - 1) {
        setDone(true);
      } else {
        setNoteIdx(i => i + 1);
      }
    }, 900);
  };

  const restart = () => {
    setNoteIdx(0); setFeedback(null);
    setScore({ correct: 0, total: 0 }); setDone(false);
  };

  // Écran de sélection de mélodie
  if (!melody) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '.4rem', letterSpacing: '-.01em' }}>Lecture de partition</h3>
          <p style={{ fontSize: 11, opacity: .4, fontFamily: 'monospace', letterSpacing: '.08em' }}>CHOISIR UNE MÉLODIE</p>
        </div>
        <div style={{ padding: '.75rem', background: 'rgba(247,220,111,0.05)', border: '0.5px solid rgba(247,220,111,0.15)', borderRadius: 4, marginBottom: '1rem' }}>
          <p style={{ fontSize: 12, opacity: .55, margin: 0, lineHeight: 1.6, fontFamily: 'Georgia,serif' }}>
            La portée affiche la mélodie complète. Identifie chaque note en solfège au fur et à mesure.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LECTURE_MELODIES.map(m => (
            <button key={m.id}
              onClick={() => { setMelody(m); setNoteIdx(0); setDone(false); setScore({ correct: 0, total: 0 }); }}
              style={{ background: 'rgba(247,220,111,0.05)', border: '0.5px solid rgba(247,220,111,0.2)', borderRadius: 4, padding: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(247,220,111,0.1)'; e.currentTarget.style.borderColor = 'rgba(247,220,111,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(247,220,111,0.05)'; e.currentTarget.style.borderColor = 'rgba(247,220,111,0.2)'; }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', fontFamily: 'Georgia,serif', marginBottom: 3 }}>{m.title}</div>
              <div style={{ fontSize: 10, opacity: .45, fontFamily: 'monospace' }}>{m.desc} — {m.notes.length} NOTES</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Écran de résultats
  if (done) {
    const pct = Math.round((score.correct / score.total) * 100);
    const msg = pct >= 90 ? 'Excellent ! 🎉' : pct >= 70 ? 'Très bien ! 👍' : pct >= 50 ? 'Continue !' : 'Entraîne-toi encore !';
    const mc  = pct >= 90 ? '#82E0AA' : pct >= 70 ? '#85C1E9' : pct >= 50 ? '#F7DC6F' : '#F1948A';
    return (
      <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(247,220,111,0.05)', border: '0.5px solid rgba(247,220,111,0.2)', borderRadius: 4 }}>
          <div style={{ fontSize: 11, letterSpacing: '.2em', opacity: .3, fontFamily: 'monospace', marginBottom: '1rem' }}>RÉSULTATS — {melody.title}</div>
          <div style={{ fontSize: 64, fontWeight: 'bold', color: mc, fontFamily: 'Georgia,serif', lineHeight: 1 }}>
            {score.correct}<span style={{ fontSize: 28, opacity: .5 }}>/{score.total}</span>
          </div>
          <div style={{ fontSize: 20, color: mc, marginBottom: '.5rem' }}>{pct}%</div>
          <div style={{ fontSize: 14, opacity: .6, fontFamily: 'Georgia,serif' }}>{msg}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={restart}
            style={{ padding: '.9rem', background: 'rgba(247,220,111,0.15)', border: '1px solid #F7DC6F', color: '#F7DC6F', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontFamily: 'monospace', letterSpacing: '.15em', fontWeight: 'bold' }}>
            🔄 RECOMMENCER
          </button>
          <button onClick={() => { setMelody(null); setDone(false); setScore({ correct: 0, total: 0 }); }}
            style={{ padding: '.9rem', background: 'transparent', border: '0.5px solid rgba(240,235,224,0.2)', color: 'rgba(240,235,224,0.5)', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontFamily: 'monospace', letterSpacing: '.15em' }}>
            CHOISIR UNE AUTRE MÉLODIE
          </button>
        </div>
      </div>
    );
  }

  // Écran d'exercice principal
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Barre de progression */}
      <div style={{ padding: '.7rem 1.25rem', borderBottom: '0.5px solid rgba(240,235,224,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => setMelody(null)}
          style={{ background: 'none', border: 'none', color: 'rgba(240,235,224,0.5)', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
          ← Choisir
        </button>
        <div style={{ flex: 1, margin: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 9, fontFamily: 'monospace', opacity: .4 }}>{noteIdx + 1}/{melody.notes.length}</span>
            <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#82E0AA' }}>{score.correct}/{score.total} ✓</span>
          </div>
          <div style={{ height: 3, background: 'rgba(240,235,224,0.08)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${((noteIdx) / melody.notes.length) * 100}%`, background: '#F7DC6F', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', opacity: .4 }}>{melody.title}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Portée musicale */}
        <div style={{ padding: '.75rem', background: '#faf9f4', borderRadius: 6, border: '0.5px solid rgba(240,235,224,0.15)' }}>
          <MusicStaff notes={melody.notes} currentIdx={noteIdx} feedback={feedback} />
        </div>

        {/* Question + écouter */}
        <div style={{ textAlign: 'center', padding: '.75rem' }}>
          <p style={{ fontSize: 10, letterSpacing: '.15em', opacity: .35, fontFamily: 'monospace', marginBottom: '.75rem' }}>
            QUELLE EST CETTE NOTE ?
          </p>
          {feedback ? (
            <div style={{ fontSize: 17, fontWeight: 'bold', fontFamily: 'Georgia,serif', color: feedback === 'correct' ? '#22c55e' : '#ef4444', animation: 'fadeIn 0.2s ease', marginBottom: '.65rem' }}>
              {feedback === 'correct'
                ? `✓ ${correctSolfege} !`
                : `✗ C'était ${correctSolfege}`
              }
            </div>
          ) : (
            <div style={{ marginBottom: '.65rem', height: 28 }} /> // placeholder pour éviter le saut de layout
          )}
          <button onClick={() => currentNote && playNote(NOTE_SEMI[currentNote] ?? 0, 0, 1.5)}
            style={{ background: 'rgba(240,235,224,0.05)', border: '0.5px solid rgba(240,235,224,0.15)', color: 'rgba(240,235,224,0.6)', padding: '.4rem .9rem', borderRadius: 2, cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', letterSpacing: '.08em' }}>
            🔊 ÉCOUTER LA NOTE
          </button>
        </div>

        {/* Boutons solfège */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.15em', opacity: .3, fontFamily: 'monospace', marginBottom: '.65rem' }}>RÉPONSE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
            {SOLFEGES.map(sol => {
              const c = SOL_COLORS[sol];
              const isCorrectAnswer = feedback && sol === correctSolfege;
              const isWrongAnswer   = feedback === 'wrong' && sol !== correctSolfege;
              return (
                <button key={sol} onClick={() => handleAnswer(sol)} disabled={!!feedback}
                  style={{
                    background: isCorrectAnswer ? `${c}25` : `${c}10`,
                    border: `0.5px solid ${isCorrectAnswer ? c : isWrongAnswer ? 'rgba(240,235,224,0.06)' : c + '45'}`,
                    color: isCorrectAnswer ? c : isWrongAnswer ? 'rgba(240,235,224,0.18)' : c,
                    padding: '.8rem .25rem',
                    borderRadius: 3,
                    cursor: feedback ? 'default' : 'pointer',
                    fontSize: 16,
                    fontWeight: 'bold',
                    fontFamily: 'Georgia,serif',
                    transition: 'all 0.2s',
                    transform: isCorrectAnswer ? 'scale(1.05)' : 'scale(1)',
                  }}>
                  {sol}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page Solfège ──────────────────────────────────────────────────────────────
function SolfegePage() {
  const [mode, setMode] = useState('reference');
  const [exNote, setExNote] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const genNote = () => {
    const n = SOLFEGE_MAP[Math.floor(Math.random() * SOLFEGE_MAP.length)];
    setExNote(n); setAnswered(false); setUserAnswer(null);
    playNote(n.semi, 0); // n.semi = 0 pour C4, 2 pour D4, etc.
  };
  useEffect(() => { if (mode === 'exercice') genNote(); }, [mode]);

  const handleAnswer = (note) => {
    if (answered) return;
    setUserAnswer(note.fr); setAnswered(true);
    const ok = note.fr === exNote.fr;
    setScore(s => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) playNote(exNote.semi, 0);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(240,235,224,0.08)', background: 'rgba(15,14,12,0.4)', flexShrink: 0 }}>
        {[['reference', 'Référence'], ['exercice', 'Exercice']].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            style={{ flex: 1, padding: '.6rem', background: 'none', border: 'none', color: mode === id ? '#F7DC6F' : 'rgba(240,235,224,0.35)', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.08em', borderBottom: mode === id ? '1.5px solid #F7DC6F' : '1.5px solid transparent', transition: 'all 0.2s' }}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>
      {mode === 'reference' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '.4rem' }}>Les 7 notes</h3>
            <p style={{ fontSize: 11, opacity: .4, fontFamily: 'monospace' }}>SOLFÈGE FRANÇAIS → NOM ANGLAIS</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: '1.5rem' }}>
            {SOLFEGE_MAP.map(n => (
              <div key={n.fr} onClick={() => playNote(n.semi, 0)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: `${n.color}10`, border: `0.5px solid ${n.color}40`, borderRadius: 4, padding: '.75rem 1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${n.color}20`}
                onMouseLeave={e => e.currentTarget.style.background = `${n.color}10`}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 'bold', color: '#0f0e0c', fontFamily: 'Georgia,serif' }}>{n.en}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: n.color, fontFamily: 'Georgia,serif', lineHeight: 1 }}>{n.fr}</div>
                  <div style={{ fontSize: 10, opacity: .45, fontFamily: 'monospace', marginTop: 2 }}>Demi-ton n°{n.semi} de la gamme</div>
                </div>
                <span style={{ fontSize: 11, opacity: .35, fontFamily: 'monospace' }}>🔊</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 10, letterSpacing: '.15em', opacity: .3, fontFamily: 'monospace', marginBottom: '.75rem' }}>GAMME CHROMATIQUE COMPLÈTE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 5 }}>
              {SOLFEGE_CHROM.map(n => (
                <div key={n.semi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem .75rem', background: 'rgba(240,235,224,0.03)', border: '0.5px solid rgba(240,235,224,0.08)', borderRadius: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', color: '#f0ebe0' }}>{n.fr}</span>
                  <span style={{ fontSize: 11, opacity: .4, fontFamily: 'monospace' }}>{n.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {mode === 'exercice' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.65rem 1rem', background: 'rgba(240,235,224,0.03)', border: '0.5px solid rgba(240,235,224,0.08)', borderRadius: 3 }}>
            <span style={{ fontSize: 10, opacity: .4, fontFamily: 'monospace' }}>SCORE DE SESSION</span>
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#F7DC6F', fontFamily: 'monospace' }}>{score.correct}/{score.total}</span>
          </div>
          {exNote && (
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(240,235,224,0.02)', border: '0.5px solid rgba(240,235,224,0.08)', borderRadius: 4 }}>
              <p style={{ fontSize: 10, letterSpacing: '.15em', opacity: .35, fontFamily: 'monospace', marginBottom: '1.25rem' }}>QUELLE EST CETTE NOTE EN SOLFÈGE ?</p>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: exNote.color, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 'bold', color: '#0f0e0c', fontFamily: 'Georgia,serif' }}>
                {exNote.en}
              </div>
              {answered && (
                <div style={{ animation: 'fadeIn 0.3s ease', marginBottom: '.75rem' }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: userAnswer === exNote.fr ? '#82E0AA' : '#F1948A', fontFamily: 'Georgia,serif', marginBottom: 4 }}>
                    {userAnswer === exNote.fr ? `✓ Oui, c'est ${exNote.fr} !` : `✗ Non — c'est ${exNote.fr}`}
                  </div>
                </div>
              )}
              <button onClick={() => playNote(exNote.semi, 0)}
                style={{ background: 'rgba(240,235,224,0.05)', border: '0.5px solid rgba(240,235,224,0.15)', color: 'rgba(240,235,224,0.6)', padding: '.4rem .9rem', borderRadius: 2, cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', letterSpacing: '.08em' }}>
                🔊 ÉCOUTER
              </button>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.15em', opacity: .3, fontFamily: 'monospace', marginBottom: '.65rem' }}>CHOISIR</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {SOLFEGE_MAP.map(n => {
                const isUser = userAnswer === n.fr;
                const isOk   = exNote?.fr === n.fr;
                let bg = `${n.color}10`, border = `${n.color}40`, col = n.color;
                if (answered) {
                  if (isOk)        { bg = `${n.color}25`; border = n.color; }
                  else if (isUser) { bg = 'rgba(241,148,138,0.1)'; border = '#F1948A'; col = '#F1948A'; }
                  else             { col = `${n.color}50`; }
                }
                return (
                  <button key={n.fr} onClick={() => handleAnswer(n)} disabled={answered}
                    style={{ background: bg, border: `0.5px solid ${border}`, color: col, padding: '.7rem .25rem', borderRadius: 3, cursor: answered ? 'default' : 'pointer', fontSize: 16, fontWeight: 'bold', fontFamily: 'Georgia,serif', transition: 'all 0.2s' }}>
                    {n.fr}
                  </button>
                );
              })}
            </div>
          </div>
          {answered && (
            <button onClick={genNote}
              style={{ width: '100%', padding: '.9rem', background: 'rgba(247,220,111,0.1)', border: '1px solid #F7DC6F', color: '#F7DC6F', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontFamily: 'monospace', letterSpacing: '.15em', fontWeight: 'bold', animation: 'fadeIn 0.3s ease' }}>
              NOTE SUIVANTE →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── TechniquePage — wrapper avec sous-menus ───────────────────────────────────
export function TechniquePage() {
  const [sub, setSub] = useState(null);

  const MODS = [
    { id: 'solfege',  icon: '🎼', title: 'Solfège',              subtitle: 'NOTES · GAMMES · LECTURE', color: '#F7DC6F', ok: true },
    { id: 'lecture',  icon: '📖', title: 'Lecture de partition', subtitle: 'IDENTIFIER LES NOTES',     color: '#85C1E9', ok: true },
    { id: 'rythme',   icon: '🥁', title: 'Rythme',               subtitle: 'DICTÉE RYTHMIQUE',         color: '#82E0AA', ok: false },
    { id: 'impro',    icon: '✨', title: 'Improvisation',         subtitle: 'SCALES & MODES',           color: '#F1948A', ok: false },
  ];

  if (sub) {
    const info = MODS.find(m => m.id === sub);
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '.65rem 1rem', borderBottom: '0.5px solid rgba(240,235,224,0.08)', background: 'rgba(15,14,12,0.7)', flexShrink: 0 }}>
          <button onClick={() => setSub(null)}
            style={{ background: 'none', border: 'none', color: 'rgba(240,235,224,0.5)', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.05em', padding: '4px 8px', borderRadius: 2, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0ebe0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.5)'}>
            ← TECHNIQUE
          </button>
          {info && <>
            <span style={{ opacity: .2 }}>|</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: info.color, letterSpacing: '.08em' }}>{info.title.toUpperCase()}</span>
          </>}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {sub === 'solfege'  && <SolfegePage />}
          {sub === 'lecture'  && <LectureExercice />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: '.4rem', letterSpacing: '-.02em' }}>Technique</h2>
        <p style={{ fontSize: 11, opacity: .35, fontFamily: 'monospace', letterSpacing: '.08em' }}>FONDATIONS MUSICALES ESSENTIELLES</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        {MODS.map(m => (
          <button key={m.id} onClick={() => m.ok && setSub(m.id)}
            style={{ background: m.ok ? `${m.color}08` : 'rgba(240,235,224,0.02)', border: `0.5px solid ${m.ok ? m.color + '40' : 'rgba(240,235,224,0.08)'}`, borderRadius: 4, padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: 7, cursor: m.ok ? 'pointer' : 'default', textAlign: 'left', opacity: m.ok ? 1 : .5, transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 26 }}>{m.icon}</span>
              {m.ok
                ? <span style={{ fontSize: 9, fontFamily: 'monospace', color: m.color, border: `0.5px solid ${m.color}50`, padding: '2px 5px', borderRadius: 2 }}>DISPONIBLE</span>
                : <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(240,235,224,0.25)', border: '0.5px solid rgba(240,235,224,0.1)', padding: '2px 5px', borderRadius: 2 }}>BIENTÔT</span>
              }
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 3, color: m.ok ? m.color : `${m.color}99`, fontFamily: 'Georgia,serif' }}>{m.title}</div>
              <div style={{ fontSize: 9, opacity: .4, fontFamily: 'monospace', letterSpacing: '.04em' }}>{m.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
