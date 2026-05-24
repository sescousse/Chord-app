import { useState } from "react";

const CHORDS = {
  Majeures: ["C", "D", "E", "F", "G", "A", "B"],
  Mineures: ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"],
  "7ème": ["C7", "D7", "E7", "F7", "G7", "A7", "B7"],
  "Maj7": ["Cmaj7", "Dmaj7", "Emaj7", "Fmaj7", "Gmaj7", "Amaj7", "Bmaj7"],
};

const NOTE_COLORS = {
  C: "#E8A87C", D: "#85C1E9", E: "#82E0AA",
  F: "#F1948A", G: "#C39BD3", A: "#F7DC6F", B: "#AED6F1",
};

function getNoteColor(chord) {
  const note = chord.replace(/m|7|maj/gi, "");
  return NOTE_COLORS[note] || "#C39BD3";
}

export default function ChordApp() {
  const [showModal, setShowModal] = useState(false);
  const [selectedChord, setSelectedChord] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Majeures");

  const handleSelect = (chord) => {
    setSelectedChord(chord);
    setShowModal(false);
  };

  const color = selectedChord ? getNoteColor(selectedChord) : "#C39BD3";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0e0c",
      fontFamily: "'Georgia', serif",
      color: "#f0ebe0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Grain texture overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.6, zIndex: 0,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        transition: "background 0.8s ease",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0,
        padding: "1.5rem 2.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "0.5px solid rgba(240,235,224,0.1)",
        zIndex: 10,
      }}>
        <span style={{ fontSize: 13, letterSpacing: "0.2em", opacity: 0.5, fontFamily: "monospace" }}>
          CHORD·STUDIO
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Bibliothèque", "Progressions", "À propos"].map(item => (
            <span key={item} style={{
              fontSize: 13, opacity: 0.45, cursor: "pointer",
              letterSpacing: "0.05em", transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.target.style.opacity = 0.9}
            onMouseLeave={e => e.target.style.opacity = 0.45}
            >{item}</span>
          ))}
        </div>
      </header>

      {/* Main hero */}
      <main style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem" }}>

        {/* Big chord display */}
        <div style={{
          fontSize: selectedChord ? 120 : 80,
          fontWeight: "bold",
          letterSpacing: selectedChord ? "-0.02em" : "0.05em",
          color: selectedChord ? color : "rgba(240,235,224,0.12)",
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          lineHeight: 1,
          marginBottom: "1rem",
          minHeight: 140,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Georgia', serif",
        }}>
          {selectedChord || "—"}
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: 14, letterSpacing: "0.15em", opacity: 0.4,
          marginBottom: "3.5rem", fontFamily: "monospace",
          textTransform: "uppercase",
        }}>
          {selectedChord ? `Accord sélectionné` : "Sélectionnez un accord pour commencer"}
        </p>

        {/* Main CTA button */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "transparent",
            border: `1px solid ${selectedChord ? color : "rgba(240,235,224,0.25)"}`,
            color: selectedChord ? color : "#f0ebe0",
            padding: "1rem 2.5rem",
            fontSize: 14, letterSpacing: "0.15em",
            cursor: "pointer", borderRadius: 2,
            transition: "all 0.3s ease",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = selectedChord ? `${color}18` : "rgba(240,235,224,0.06)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {selectedChord ? "Changer d'accord" : "Choisir un accord"}
        </button>

        {/* Chord properties preview */}
        {selectedChord && (
          <div style={{
            marginTop: "3rem", display: "flex", gap: "2rem", justifyContent: "center",
            opacity: 0, animation: "fadeIn 0.4s ease 0.1s forwards",
          }}>
            {[
              { label: "Note racine", value: selectedChord.replace(/m|7|maj/gi, "") },
              { label: "Qualité", value: selectedChord.includes("maj7") ? "Maj7" : selectedChord.includes("m") ? "Mineure" : selectedChord.includes("7") ? "Dom. 7" : "Majeure" },
              { label: "Intervalle", value: selectedChord.includes("maj7") ? "1-3-5-7" : selectedChord.includes("m") ? "1-♭3-5" : selectedChord.includes("7") ? "1-3-5-♭7" : "1-3-5" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: "0.15em", fontFamily: "monospace", marginBottom: 6 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 16, color, fontFamily: "monospace" }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Chord Selection Modal */}
      {showModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, backdropFilter: "blur(8px)",
          }}
        >
          <div style={{
            background: "#161512", border: "0.5px solid rgba(240,235,224,0.12)",
            borderRadius: 4, width: "min(520px, 90vw)",
            maxHeight: "80vh", overflow: "hidden",
            display: "flex", flexDirection: "column",
            animation: "slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            {/* Modal header */}
            <div style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "0.5px solid rgba(240,235,224,0.08)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, letterSpacing: "0.2em", opacity: 0.5, fontFamily: "monospace" }}>
                SÉLECTION D'ACCORD
              </span>
              <button onClick={() => setShowModal(false)} style={{
                background: "none", border: "none", color: "#f0ebe0",
                opacity: 0.4, cursor: "pointer", fontSize: 18, lineHeight: 1,
                padding: "2px 6px",
              }}>×</button>
            </div>

            {/* Category tabs */}
            <div style={{
              display: "flex", gap: 0,
              borderBottom: "0.5px solid rgba(240,235,224,0.08)",
            }}>
              {Object.keys(CHORDS).map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  flex: 1, padding: "0.75rem",
                  background: "none", border: "none",
                  borderBottom: activeCategory === cat ? "1px solid #C39BD3" : "1px solid transparent",
                  color: activeCategory === cat ? "#C39BD3" : "rgba(240,235,224,0.35)",
                  cursor: "pointer", fontSize: 11,
                  letterSpacing: "0.1em", fontFamily: "monospace",
                  transition: "all 0.2s",
                }}>
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Chord grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8, padding: "1.25rem",
              overflowY: "auto",
            }}>
              {CHORDS[activeCategory].map(chord => {
                const c = getNoteColor(chord);
                const isSelected = selectedChord === chord;
                return (
                  <button key={chord} onClick={() => handleSelect(chord)} style={{
                    background: isSelected ? `${c}22` : "rgba(240,235,224,0.03)",
                    border: `0.5px solid ${isSelected ? c : "rgba(240,235,224,0.1)"}`,
                    color: isSelected ? c : "rgba(240,235,224,0.75)",
                    padding: "1rem 0.5rem",
                    borderRadius: 2, cursor: "pointer",
                    fontSize: 20, fontFamily: "'Georgia', serif",
                    fontWeight: "bold", letterSpacing: "-0.02em",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = `${c}14`;
                      e.currentTarget.style.borderColor = `${c}80`;
                      e.currentTarget.style.color = c;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "rgba(240,235,224,0.03)";
                      e.currentTarget.style.borderColor = "rgba(240,235,224,0.1)";
                      e.currentTarget.style.color = "rgba(240,235,224,0.75)";
                    }
                  }}
                  >
                    {chord}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
