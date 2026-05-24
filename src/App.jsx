import { useState } from "react";

const CHROMATIC = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const CHORD_TYPES = {
  "Majeures":   { formula: [0, 4, 7],      suffix: "",      label: "Majeure" },
  "Mineures":   { formula: [0, 3, 7],      suffix: "m",     label: "Mineure" },
  "Dom. 7":     { formula: [0, 4, 7, 10],  suffix: "7",     label: "Dominante 7" },
  "Maj. 7":     { formula: [0, 4, 7, 11],  suffix: "maj7",  label: "Majeure 7" },
  "Min. 7":     { formula: [0, 3, 7, 10],  suffix: "m7",    label: "Mineure 7" },
  "MinMaj. 7":  { formula: [0, 3, 7, 11],  suffix: "mMaj7", label: "Min. Maj. 7" },
};

const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_COLORS = {
  C: "#E8A87C", "C#": "#E8A87C", D: "#85C1E9", Eb: "#85C1E9",
  E: "#82E0AA", F: "#F1948A", "F#": "#F1948A", G: "#C39BD3",
  Ab: "#C39BD3", A: "#F7DC6F", Bb: "#F7DC6F", B: "#AED6F1",
};

const INVERSION_NAMES = [
  "Fondamentale", "1er renversement", "2ème renversement", "3ème renversement"
];

function getChordNotes(root, formula) {
  const rootIdx = CHROMATIC.indexOf(root);
  return formula.map(interval => CHROMATIC[(rootIdx + interval) % 12]);
}

function getInversions(notes) {
  return notes.map((_, i) => [...notes.slice(i), ...notes.slice(0, i)]);
}

function getChordName(root, type) {
  return root + CHORD_TYPES[type].suffix;
}

export default function ChordApp() {
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("type"); // "type" | "root"
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [activeInversion, setActiveInversion] = useState(0);

  const chordName = selectedRoot && selectedType ? getChordName(selectedRoot, selectedType) : null;
  const chordNotes = selectedRoot && selectedType
    ? getChordNotes(selectedRoot, CHORD_TYPES[selectedType].formula)
    : null;
  const inversions = chordNotes ? getInversions(chordNotes) : null;
  const color = selectedRoot ? (NOTE_COLORS[selectedRoot] || "#C39BD3") : "#C39BD3";

  const openModal = () => {
    setModalStep("type");
    setShowModal(true);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setModalStep("root");
  };

  const handleRootSelect = (root) => {
    setSelectedRoot(root);
    setActiveInversion(0);
    setShowModal(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0e0c",
      fontFamily: "'Georgia', serif", color: "#f0ebe0",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        transition: "background 0.8s ease", pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0,
        padding: "1.5rem 2.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "0.5px solid rgba(240,235,224,0.08)", zIndex: 10,
      }}>
        <span style={{ fontSize: 13, letterSpacing: "0.2em", opacity: 0.5, fontFamily: "monospace" }}>
          CHORD·STUDIO
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Bibliothèque", "Progressions", "À propos"].map(item => (
            <span key={item} style={{
              fontSize: 13, opacity: 0.35, cursor: "pointer",
              letterSpacing: "0.05em", transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.target.style.opacity = 0.85}
            onMouseLeave={e => e.target.style.opacity = 0.35}
            >{item}</span>
          ))}
        </div>
      </header>

      {/* Main */}
      <main style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem", width: "100%", maxWidth: 700 }}>

        {/* Chord name big display */}
        <div style={{
          fontSize: chordName ? 110 : 80,
          fontWeight: "bold",
          color: chordName ? color : "rgba(240,235,224,0.1)",
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          lineHeight: 1, marginBottom: "0.75rem",
          minHeight: 130, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {chordName || "—"}
        </div>

        {/* Quality label */}
        <p style={{
          fontSize: 13, letterSpacing: "0.2em", opacity: 0.35,
          marginBottom: "2rem", fontFamily: "monospace", textTransform: "uppercase",
        }}>
          {selectedType ? CHORD_TYPES[selectedType].label : "Sélectionnez un accord pour commencer"}
        </p>

        {/* Notes display */}
        {chordNotes && (
          <div style={{
            marginBottom: "2.5rem",
            animation: "fadeIn 0.4s ease forwards",
          }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.35, fontFamily: "monospace", marginBottom: "1rem" }}>
              NOTES
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {(inversions[activeInversion]).map((note, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    border: `1px solid ${NOTE_COLORS[note]}50`,
                    background: `${NOTE_COLORS[note]}14`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: "bold", color: NOTE_COLORS[note],
                    fontFamily: "monospace",
                    transition: "all 0.3s ease",
                  }}>
                    {note}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.3, fontFamily: "monospace" }}>
                    {i === 0 ? "BASSE" : i === chordNotes.length - 1 ? "AIGU" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={openModal}
          style={{
            background: "transparent",
            border: `1px solid ${chordName ? color : "rgba(240,235,224,0.2)"}`,
            color: chordName ? color : "#f0ebe0",
            padding: "0.9rem 2.5rem", fontSize: 13,
            letterSpacing: "0.15em", cursor: "pointer", borderRadius: 2,
            transition: "all 0.3s ease", fontFamily: "monospace",
            textTransform: "uppercase", marginBottom: "3rem",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${color}14`;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {chordName ? "Changer d'accord" : "Choisir un accord"}
        </button>

        {/* Inversions */}
        {inversions && (
          <div style={{ animation: "fadeIn 0.4s ease 0.15s both" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.35, fontFamily: "monospace", marginBottom: "1rem" }}>
              RENVERSEMENTS
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {inversions.map((inv, i) => (
                <button key={i} onClick={() => setActiveInversion(i)} style={{
                  background: activeInversion === i ? `${color}18` : "transparent",
                  border: `0.5px solid ${activeInversion === i ? color : "rgba(240,235,224,0.15)"}`,
                  color: activeInversion === i ? color : "rgba(240,235,224,0.45)",
                  padding: "0.6rem 1rem", borderRadius: 2,
                  cursor: "pointer", fontFamily: "monospace", fontSize: 11,
                  letterSpacing: "0.05em", transition: "all 0.2s ease",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}
                onMouseEnter={e => { if (activeInversion !== i) e.currentTarget.style.borderColor = `${color}60`; }}
                onMouseLeave={e => { if (activeInversion !== i) e.currentTarget.style.borderColor = "rgba(240,235,224,0.15)"; }}
                >
                  <span>{INVERSION_NAMES[i]}</span>
                  <span style={{ opacity: 0.6, fontSize: 10 }}>{inv.join(" – ")}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, backdropFilter: "blur(10px)",
          }}
        >
          <div style={{
            background: "#161512", border: "0.5px solid rgba(240,235,224,0.1)",
            borderRadius: 4, width: "min(540px, 92vw)",
            maxHeight: "85vh", overflow: "hidden",
            display: "flex", flexDirection: "column",
            animation: "slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            {/* Modal header */}
            <div style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "0.5px solid rgba(240,235,224,0.07)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {modalStep === "root" && (
                  <button onClick={() => setModalStep("type")} style={{
                    background: "none", border: "none", color: "#f0ebe0",
                    opacity: 0.4, cursor: "pointer", fontSize: 18, padding: "0 6px 0 0",
                  }}>←</button>
                )}
                <span style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.4, fontFamily: "monospace" }}>
                  {modalStep === "type" ? "1 · TYPE D'ACCORD" : `2 · NOTE RACINE — ${CHORD_TYPES[selectedType].label.toUpperCase()}`}
                </span>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: "none", border: "none", color: "#f0ebe0",
                opacity: 0.35, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "2px 4px",
              }}>×</button>
            </div>

            {/* Step 1 — Type selection */}
            {modalStep === "type" && (
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(CHORD_TYPES).map(([type, { label }]) => {
                  const ex = getChordNotes("C", CHORD_TYPES[type].formula);
                  const isActive = selectedType === type;
                  return (
                    <button key={type} onClick={() => handleTypeSelect(type)} style={{
                      background: isActive ? "rgba(195,155,211,0.1)" : "rgba(240,235,224,0.02)",
                      border: `0.5px solid ${isActive ? "#C39BD3" : "rgba(240,235,224,0.1)"}`,
                      borderRadius: 2, padding: "1rem 1.25rem",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: "pointer", transition: "all 0.2s ease", textAlign: "left",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(240,235,224,0.05)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(240,235,224,0.02)"; }}
                    >
                      <div>
                        <div style={{ fontSize: 16, color: isActive ? "#C39BD3" : "#f0ebe0", fontFamily: "Georgia, serif", marginBottom: 3 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.35, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                          ex. C{CHORD_TYPES[type].suffix} → {ex.join(" – ")}
                        </div>
                      </div>
                      <span style={{ color: isActive ? "#C39BD3" : "rgba(240,235,224,0.2)", fontSize: 18 }}>›</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2 — Root note selection */}
            {modalStep === "root" && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8, padding: "1.25rem", overflowY: "auto",
              }}>
                {ROOT_NOTES.map(root => {
                  const c = NOTE_COLORS[root] || "#C39BD3";
                  const isActive = selectedRoot === root && selectedType === selectedType;
                  const previewNotes = getChordNotes(root, CHORD_TYPES[selectedType].formula);
                  return (
                    <button key={root} onClick={() => handleRootSelect(root)} style={{
                      background: isActive ? `${c}20` : "rgba(240,235,224,0.03)",
                      border: `0.5px solid ${isActive ? c : "rgba(240,235,224,0.1)"}`,
                      color: isActive ? c : "rgba(240,235,224,0.8)",
                      padding: "1rem 0.5rem", borderRadius: 2,
                      cursor: "pointer", transition: "all 0.2s ease",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${c}18`;
                      e.currentTarget.style.borderColor = `${c}80`;
                      e.currentTarget.style.color = c;
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(240,235,224,0.03)";
                        e.currentTarget.style.borderColor = "rgba(240,235,224,0.1)";
                        e.currentTarget.style.color = "rgba(240,235,224,0.8)";
                      }
                    }}
                    >
                      <span style={{ fontSize: 22, fontWeight: "bold" }}>{root}</span>
                      <span style={{ fontSize: 9, opacity: 0.45, fontFamily: "monospace", letterSpacing: "0.02em" }}>
                        {previewNotes.join("·")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
