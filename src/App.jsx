import { useState, useEffect } from "react";

const CHROMATIC = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

const CHORD_TYPES = {
  "Majeures":  { formula:[0,4,7],     suffix:"",      label:"Majeure" },
  "Mineures":  { formula:[0,3,7],     suffix:"m",     label:"Mineure" },
  "Dom. 7":    { formula:[0,4,7,10],  suffix:"7",     label:"Dominante 7" },
  "Maj. 7":    { formula:[0,4,7,11],  suffix:"maj7",  label:"Majeure 7" },
  "Min. 7":    { formula:[0,3,7,10],  suffix:"m7",    label:"Mineure 7" },
  "MinMaj. 7": { formula:[0,3,7,11],  suffix:"mMaj7", label:"Min. Maj. 7" },
};

const ROOT_NOTES = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

const NOTE_COLORS = {
  C:"#E8A87C","C#":"#E8A87C",D:"#85C1E9",Eb:"#85C1E9",
  E:"#82E0AA",F:"#F1948A","F#":"#F1948A",G:"#C39BD3",
  Ab:"#C39BD3",A:"#F7DC6F",Bb:"#F7DC6F",B:"#AED6F1",
};

const INVERSION_NAMES = ["Fondamentale","1er renversement","2ème renversement","3ème renversement"];

const TIPS = [
  { level:"Débutant", text:"Pour un accord majeur, pose ton pouce sur la tonique, le majeur sur la tierce et l'auriculaire sur la quinte." },
  { level:"Débutant", text:"Commence par maîtriser les accords C, F et G — ils sont à la base de milliers de chansons." },
  { level:"Débutant", text:"Entraîne-toi à jouer chaque note séparément avant de les plaquer ensemble. La régularité prime sur la vitesse." },
  { level:"Débutant", text:"Garde la main détendue en jouant. Imagine tenir une petite balle de tennis dans ta paume." },
  { level:"Intermédiaire", text:"Le 1er renversement est idéal pour des transitions fluides entre deux accords dont les notes sont proches." },
  { level:"Intermédiaire", text:"Un accord de dominante 7 crée une tension qui appelle naturellement à se résoudre sur la tonique." },
  { level:"Intermédiaire", text:"Essaie la progression II-V-I : Dm7 → G7 → Cmaj7. C'est la base de milliers de standards jazz." },
  { level:"Intermédiaire", text:"L'accord mineur majeur 7 est très utilisé en musique de film pour créer une atmosphère mystérieuse et tendue." },
  { level:"Débutant", text:"Utilise le métronome dès le début. Mieux vaut jouer lentement et en rythme que vite et approximatif." },
  { level:"Intermédiaire", text:"En position fondamentale, la note la plus grave est la tonique. Les renversements permettent d'alléger la basse." },
];

const WHITE_KEY_NOTES = ['C','D','E','F','G','A','B','C','D','E','F','G','A','B'];
const BLACK_KEYS_DEF = [
  {note:'C#',wi:0},{note:'Eb',wi:1},{note:'F#',wi:3},{note:'Ab',wi:4},{note:'Bb',wi:5},
  {note:'C#',wi:7},{note:'Eb',wi:8},{note:'F#',wi:10},{note:'Ab',wi:11},{note:'Bb',wi:12},
];
const WW=36, WH=110, BW=22, BH=68;

function PianoKeyboard({ activeNotes, color }) {
  return (
    <svg viewBox={`0 0 ${14*WW+2} ${WH+4}`} style={{ width:"100%", maxWidth:520, display:"block", margin:"0 auto" }}>
      {WHITE_KEY_NOTES.map((note,i) => {
        const isActive = activeNotes.includes(note);
        return (
          <g key={i}>
            <rect x={i*WW+1} y={1} width={WW-1} height={WH} rx={2}
              fill={isActive ? color : "#f5f0e8"} stroke="#1a1714" strokeWidth={0.5} />
            {isActive && (
              <text x={i*WW+WW/2} y={WH-10} textAnchor="middle"
                fontSize={9} fill="#1a1714" fontFamily="monospace" fontWeight="bold">{note}</text>
            )}
          </g>
        );
      })}
      {BLACK_KEYS_DEF.map(({note,wi},i) => {
        const isActive = activeNotes.includes(note);
        const x = wi*WW + WW*0.67 - BW/2 + 1;
        return (
          <g key={i}>
            <rect x={x} y={1} width={BW} height={BH} rx={2}
              fill={isActive ? color : "#161412"} stroke="#0a0908" strokeWidth={0.5} />
            {isActive && (
              <text x={x+BW/2} y={BH-8} textAnchor="middle"
                fontSize={8} fill="#1a1714" fontFamily="monospace" fontWeight="bold">{note}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function TipPopup({ tip, onClose, onNext }) {
  return (
    <div style={{
      position:"fixed", bottom:"2rem", right:"2rem",
      width:"min(300px, calc(100vw - 3rem))",
      background:"#1c1a16", border:"0.5px solid rgba(240,235,224,0.15)",
      borderRadius:4, padding:"1.25rem", zIndex:200,
      animation:"slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
        <span style={{
          fontSize:10, letterSpacing:"0.15em", fontFamily:"monospace",
          padding:"3px 8px", borderRadius:2,
          background: tip.level==="Débutant" ? "rgba(130,224,170,0.12)" : "rgba(133,193,233,0.12)",
          color: tip.level==="Débutant" ? "#82E0AA" : "#85C1E9",
        }}>{tip.level.toUpperCase()}</span>
        <button onClick={onClose} style={{
          background:"none", border:"none", color:"#f0ebe0",
          opacity:0.35, cursor:"pointer", fontSize:18, padding:"0 2px", lineHeight:1,
        }}>×</button>
      </div>
      <p style={{ fontSize:13.5, lineHeight:1.65, opacity:0.78, margin:"0 0 1rem", fontFamily:"Georgia,serif" }}>
        {tip.text}
      </p>
      <button onClick={onNext} style={{
        background:"transparent", border:"0.5px solid rgba(240,235,224,0.15)",
        color:"rgba(240,235,224,0.4)", padding:"0.4rem 0.75rem",
        borderRadius:2, cursor:"pointer", fontSize:10,
        fontFamily:"monospace", letterSpacing:"0.1em", transition:"all 0.2s",
      }}
      onMouseEnter={e=>{e.currentTarget.style.color="rgba(240,235,224,0.7)";e.currentTarget.style.borderColor="rgba(240,235,224,0.3)";}}
      onMouseLeave={e=>{e.currentTarget.style.color="rgba(240,235,224,0.4)";e.currentTarget.style.borderColor="rgba(240,235,224,0.15)";}}
      >CONSEIL SUIVANT →</button>
    </div>
  );
}

export default function ChordApp() {
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("type");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [activeInversion, setActiveInversion] = useState(0);
  const [showPiano, setShowPiano] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const chordName = selectedRoot && selectedType ? selectedRoot + CHORD_TYPES[selectedType].suffix : null;
  const chordNotes = selectedRoot && selectedType
    ? (() => { const ri = CHROMATIC.indexOf(selectedRoot); return CHORD_TYPES[selectedType].formula.map(i => CHROMATIC[(ri+i)%12]); })()
    : null;
  const inversions = chordNotes ? chordNotes.map((_,i) => [...chordNotes.slice(i),...chordNotes.slice(0,i)]) : null;
  const activeNotes = inversions ? inversions[activeInversion] : [];
  const color = selectedRoot ? (NOTE_COLORS[selectedRoot]||"#C39BD3") : "#C39BD3";

  // Affiche un conseil 2s après la sélection d'un accord
  useEffect(() => {
    if (!chordName) return;
    const t = setTimeout(() => setShowTip(true), 2000);
    return () => clearTimeout(t);
  }, [chordName]);

  // Nouveau conseil toutes les 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i+1) % TIPS.length);
      setShowTip(true);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const openModal = () => { setModalStep("type"); setShowModal(true); };
  const handleTypeSelect = (type) => { setSelectedType(type); setModalStep("root"); };
  const handleRootSelect = (root) => { setSelectedRoot(root); setActiveInversion(0); setShowModal(false); };

  return (
    <div style={{
      minHeight:"100vh", background:"#0f0e0c",
      fontFamily:"'Georgia', serif", color:"#f0ebe0",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"fixed", top:"30%", left:"50%", transform:"translate(-50%,-50%)",
        width:700, height:700, borderRadius:"50%",
        background:`radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        transition:"background 0.8s ease", pointerEvents:"none", zIndex:0,
      }} />

      <header style={{
        position:"fixed", top:0, left:0, right:0, padding:"1.5rem 2.5rem",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        borderBottom:"0.5px solid rgba(240,235,224,0.08)", zIndex:10,
      }}>
        <span style={{ fontSize:13, letterSpacing:"0.2em", opacity:0.5, fontFamily:"monospace" }}>CHORD·STUDIO</span>
        <div style={{ display:"flex", gap:24 }}>
          {["Bibliothèque","Progressions","À propos"].map(item => (
            <span key={item} style={{ fontSize:13, opacity:0.35, cursor:"pointer", letterSpacing:"0.05em", transition:"opacity 0.2s" }}
              onMouseEnter={e=>e.target.style.opacity=0.85} onMouseLeave={e=>e.target.style.opacity=0.35}>{item}</span>
          ))}
        </div>
      </header>

      <main style={{ position:"relative", zIndex:1, textAlign:"center", padding:"2rem", width:"100%", maxWidth:700 }}>

        <div style={{
          fontSize:chordName?110:80, fontWeight:"bold",
          color:chordName?color:"rgba(240,235,224,0.1)",
          transition:"all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          lineHeight:1, marginBottom:"0.75rem",
          minHeight:130, display:"flex", alignItems:"center", justifyContent:"center",
        }}>{chordName || "—"}</div>

        <p style={{ fontSize:13, letterSpacing:"0.2em", opacity:0.35, marginBottom:"2rem", fontFamily:"monospace", textTransform:"uppercase" }}>
          {selectedType ? CHORD_TYPES[selectedType].label : "Sélectionnez un accord pour commencer"}
        </p>

        {chordNotes && (
          <div style={{ marginBottom:"2rem", animation:"fadeIn 0.4s ease forwards" }}>
            <div style={{ fontSize:11, letterSpacing:"0.2em", opacity:0.3, fontFamily:"monospace", marginBottom:"1rem" }}>NOTES</div>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              {inversions[activeInversion].map((note,i) => (
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{
                    width:52, height:52, borderRadius:"50%",
                    border:`1px solid ${NOTE_COLORS[note]}50`,
                    background:`${NOTE_COLORS[note]}14`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:18, fontWeight:"bold", color:NOTE_COLORS[note], fontFamily:"monospace",
                  }}>{note}</div>
                  <div style={{ fontSize:10, opacity:0.3, fontFamily:"monospace" }}>
                    {i===0?"BASSE":i===chordNotes.length-1?"AIGU":""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:"2.5rem" }}>
          <button onClick={openModal} style={{
            background:"transparent", border:`1px solid ${chordName?color:"rgba(240,235,224,0.2)"}`,
            color:chordName?color:"#f0ebe0", padding:"0.9rem 2rem", fontSize:13,
            letterSpacing:"0.15em", cursor:"pointer", borderRadius:2,
            transition:"all 0.3s ease", fontFamily:"monospace", textTransform:"uppercase",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background=`${color}14`;e.currentTarget.style.transform="translateY(-1px)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.transform="translateY(0)";}}
          >{chordName ? "Changer d'accord" : "Choisir un accord"}</button>

          {chordName && (
            <button onClick={()=>setShowPiano(v=>!v)} style={{
              background:showPiano?`${color}18`:"transparent",
              border:`1px solid ${showPiano?color:"rgba(240,235,224,0.2)"}`,
              color:showPiano?color:"rgba(240,235,224,0.6)",
              padding:"0.9rem 1.5rem", fontSize:13, letterSpacing:"0.15em",
              cursor:"pointer", borderRadius:2, transition:"all 0.3s ease",
              fontFamily:"monospace", textTransform:"uppercase",
            }}
            onMouseEnter={e=>{if(!showPiano){e.currentTarget.style.background="rgba(240,235,224,0.05)";e.currentTarget.style.transform="translateY(-1px)";}}}
            onMouseLeave={e=>{if(!showPiano){e.currentTarget.style.background="transparent";e.currentTarget.style.transform="translateY(0)";}}}
            >🎹 Clavier</button>
          )}
        </div>

        {showPiano && chordNotes && (
          <div style={{
            marginBottom:"2.5rem", padding:"1.5rem",
            background:"rgba(240,235,224,0.02)", border:"0.5px solid rgba(240,235,224,0.07)",
            borderRadius:4, animation:"fadeIn 0.3s ease forwards",
          }}>
            <div style={{ fontSize:11, letterSpacing:"0.2em", opacity:0.3, fontFamily:"monospace", marginBottom:"1rem" }}>
              CLAVIER — TOUCHES EN SURBRILLANCE
            </div>
            <PianoKeyboard activeNotes={activeNotes} color={color} />
          </div>
        )}

        {inversions && (
          <div style={{ animation:"fadeIn 0.4s ease 0.15s both" }}>
            <div style={{ fontSize:11, letterSpacing:"0.2em", opacity:0.3, fontFamily:"monospace", marginBottom:"1rem" }}>RENVERSEMENTS</div>
            <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
              {inversions.map((inv,i) => (
                <button key={i} onClick={()=>setActiveInversion(i)} style={{
                  background:activeInversion===i?`${color}18`:"transparent",
                  border:`0.5px solid ${activeInversion===i?color:"rgba(240,235,224,0.15)"}`,
                  color:activeInversion===i?color:"rgba(240,235,224,0.45)",
                  padding:"0.6rem 1rem", borderRadius:2, cursor:"pointer",
                  fontFamily:"monospace", fontSize:11, letterSpacing:"0.05em",
                  transition:"all 0.2s ease", display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                }}
                onMouseEnter={e=>{if(activeInversion!==i)e.currentTarget.style.borderColor=`${color}60`;}}
                onMouseLeave={e=>{if(activeInversion!==i)e.currentTarget.style.borderColor="rgba(240,235,224,0.15)";}}
                >
                  <span>{INVERSION_NAMES[i]}</span>
                  <span style={{ opacity:0.5, fontSize:10 }}>{inv.join(" – ")}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div onClick={e=>e.target===e.currentTarget&&setShowModal(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.8)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:100, backdropFilter:"blur(10px)",
        }}>
          <div style={{
            background:"#161512", border:"0.5px solid rgba(240,235,224,0.1)",
            borderRadius:4, width:"min(540px,92vw)", maxHeight:"85vh",
            overflow:"hidden", display:"flex", flexDirection:"column",
            animation:"slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <div style={{
              padding:"1.25rem 1.5rem", borderBottom:"0.5px solid rgba(240,235,224,0.07)",
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                {modalStep==="root" && (
                  <button onClick={()=>setModalStep("type")} style={{
                    background:"none", border:"none", color:"#f0ebe0",
                    opacity:0.4, cursor:"pointer", fontSize:18, padding:"0 6px 0 0",
                  }}>←</button>
                )}
                <span style={{ fontSize:11, letterSpacing:"0.2em", opacity:0.4, fontFamily:"monospace" }}>
                  {modalStep==="type" ? "1 · TYPE D'ACCORD" : `2 · NOTE RACINE — ${CHORD_TYPES[selectedType].label.toUpperCase()}`}
                </span>
              </div>
              <button onClick={()=>setShowModal(false)} style={{
                background:"none", border:"none", color:"#f0ebe0",
                opacity:0.35, cursor:"pointer", fontSize:20, lineHeight:1, padding:"2px 4px",
              }}>×</button>
            </div>

            {modalStep==="type" && (
              <div style={{ padding:"1.25rem", display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
                {Object.entries(CHORD_TYPES).map(([type,{label}]) => {
                  const ri = CHROMATIC.indexOf("C");
                  const ex = CHORD_TYPES[type].formula.map(i=>CHROMATIC[(ri+i)%12]);
                  const isActive = selectedType===type;
                  return (
                    <button key={type} onClick={()=>handleTypeSelect(type)} style={{
                      background:isActive?"rgba(195,155,211,0.1)":"rgba(240,235,224,0.02)",
                      border:`0.5px solid ${isActive?"#C39BD3":"rgba(240,235,224,0.1)"}`,
                      borderRadius:2, padding:"1rem 1.25rem",
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      cursor:"pointer", transition:"all 0.2s ease", textAlign:"left",
                    }}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="rgba(240,235,224,0.05)";}}
                    onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="rgba(240,235,224,0.02)";}}
                    >
                      <div>
                        <div style={{ fontSize:16, color:isActive?"#C39BD3":"#f0ebe0", fontFamily:"Georgia,serif", marginBottom:3 }}>{label}</div>
                        <div style={{ fontSize:11, opacity:0.35, fontFamily:"monospace" }}>ex. C{CHORD_TYPES[type].suffix} → {ex.join(" – ")}</div>
                      </div>
                      <span style={{ color:isActive?"#C39BD3":"rgba(240,235,224,0.2)", fontSize:18 }}>›</span>
                    </button>
                  );
                })}
              </div>
            )}

            {modalStep==="root" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, padding:"1.25rem", overflowY:"auto" }}>
                {ROOT_NOTES.map(root => {
                  const c = NOTE_COLORS[root]||"#C39BD3";
                  const ri = CHROMATIC.indexOf(root);
                  const previewNotes = CHORD_TYPES[selectedType].formula.map(i=>CHROMATIC[(ri+i)%12]);
                  const isActive = selectedRoot===root;
                  return (
                    <button key={root} onClick={()=>handleRootSelect(root)} style={{
                      background:isActive?`${c}20`:"rgba(240,235,224,0.03)",
                      border:`0.5px solid ${isActive?c:"rgba(240,235,224,0.1)"}`,
                      color:isActive?c:"rgba(240,235,224,0.8)",
                      padding:"1rem 0.5rem", borderRadius:2, cursor:"pointer",
                      transition:"all 0.2s ease", display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${c}18`;e.currentTarget.style.borderColor=`${c}80`;e.currentTarget.style.color=c;}}
                    onMouseLeave={e=>{if(!isActive){e.currentTarget.style.background="rgba(240,235,224,0.03)";e.currentTarget.style.borderColor="rgba(240,235,224,0.1)";e.currentTarget.style.color="rgba(240,235,224,0.8)";}}}
                    >
                      <span style={{ fontSize:22, fontWeight:"bold" }}>{root}</span>
                      <span style={{ fontSize:9, opacity:0.45, fontFamily:"monospace" }}>{previewNotes.join("·")}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showTip && (
        <TipPopup
          tip={TIPS[tipIndex]}
          onClose={()=>setShowTip(false)}
          onNext={()=>setTipIndex(i=>(i+1)%TIPS.length)}
        />
      )}

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
    </div>
  );
}
