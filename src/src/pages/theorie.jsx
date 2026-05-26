// ── Page Théorie Musicale ─────────────────────────────────────────────────────
// Nouveau fichier — aucun remplacement
export function TheoriePage() {
  const CATEGORIES = [
    { title: 'Harmonie classique', color: '#C39BD3', icon: '🎼', items: [
      { name: 'Gammes et modes',           desc: 'Majeur, mineur, modes grecs' },
      { name: 'Intervalles',               desc: 'Secondes, tierces, quintes...' },
      { name: 'Construction des accords',  desc: 'Triades, accords de 7e' },
      { name: 'Fonctions harmoniques',     desc: 'Tonique, sous-dominante, dominante' },
      { name: 'Cadences',                  desc: 'Parfaite, rompue, à la dominante' },
      { name: 'Modulation',               desc: 'Changer de tonalité' },
    ]},
    { title: 'Théorie Jazz', color: '#F7DC6F', icon: '🎷', items: [
      { name: "Extensions d'accords",      desc: '9e, 11e, 13e et altérations' },
      { name: 'Substitutions',             desc: 'Triton, sous-dominante mineure' },
      { name: 'ii-V-I et variations',      desc: 'La progression fondamentale' },
      { name: 'Modes appliqués au jazz',   desc: 'Dorien, mixolydien, lydien...' },
      { name: 'Réharmonisation',           desc: 'Enrichir une grille simple' },
    ]},
    { title: 'Composition', color: '#85C1E9', icon: '✍', items: [
      { name: 'Forme et structure',        desc: 'ABA, couplet-refrain, rondo' },
      { name: 'Contrepoint',               desc: "Voix indépendantes qui s'harmonisent" },
      { name: 'Orchestration',             desc: 'Distribuer les voix et timbres' },
      { name: 'Borrowed chords',           desc: "Emprunter des accords d'autres tonalités" },
    ]},
    { title: 'Acoustique musicale', color: '#82E0AA', icon: '🔊', items: [
      { name: 'Série harmonique',          desc: 'Pourquoi certains accords sonnent bien' },
      { name: 'Tempérament égal',          desc: 'Comment le piano est accordé' },
      { name: 'Résonance et timbre',       desc: 'Couleur sonore des instruments' },
    ]},
  ];

  return (
    <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: '.4rem', letterSpacing: '-.02em' }}>Théorie Musicale</h2>
        <p style={{ fontSize: 11, opacity: .35, fontFamily: 'monospace', letterSpacing: '.08em' }}>COMPRENDRE LA MUSIQUE EN PROFONDEUR</p>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(247,220,111,0.05)', border: '0.5px solid rgba(247,220,111,0.2)', borderRadius: 4, marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 10, color: '#F7DC6F', fontFamily: 'monospace', letterSpacing: '.1em', marginBottom: '.35rem' }}>EN COURS DE RÉDACTION</div>
        <p style={{ fontSize: 12, opacity: .55, margin: 0, lineHeight: 1.6, fontFamily: 'Georgia,serif' }}>
          Le contenu théorique sera ajouté progressivement. Chaque chapitre sera accompagné d'exemples sonores et visuels interactifs.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CATEGORIES.map((cat, ci) => (
          <div key={ci} style={{ background: 'rgba(240,235,224,0.025)', border: `0.5px solid ${cat.color}30`, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '.85rem 1rem', background: `${cat.color}08`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 'bold', color: cat.color, fontFamily: 'Georgia,serif' }}>{cat.title}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cat.items.map((item, ii) => (
                <div key={ii} style={{ padding: '.7rem 1rem', borderTop: '0.5px solid rgba(240,235,224,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontFamily: 'Georgia,serif', color: 'rgba(240,235,224,0.65)', marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 10, opacity: .35, fontFamily: 'monospace' }}>{item.desc}</div>
                  </div>
                  <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(240,235,224,0.25)', border: '0.5px solid rgba(240,235,224,0.1)', padding: '2px 5px', borderRadius: 2, flexShrink: 0, marginLeft: 8 }}>BIENTÔT</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
