// ── Contenu de l'application ──────────────────────────────────────────────────
 
export const TIPS = [
  { level:"Débutant", text:"Pour un accord majeur, pose ton pouce sur la tonique, le majeur sur la tierce et l'auriculaire sur la quinte." },
  { level:"Débutant", text:"Commence par maîtriser C, F et G — la base de milliers de chansons." },
  { level:"Débutant", text:"Joue chaque note séparément avant de les plaquer ensemble. La régularité prime sur la vitesse." },
  { level:"Débutant", text:"Garde la main détendue. Imagine tenir une petite balle de tennis dans ta paume." },
  { level:"Intermédiaire", text:"Le 1er renversement crée des transitions fluides entre deux accords proches." },
  { level:"Intermédiaire", text:"Un accord de dominante 7 crée une tension qui appelle à se résoudre sur la tonique." },
  { level:"Intermédiaire", text:"Essaie II-V-I : Dm7 → G7 → Cmaj7. La base de milliers de standards jazz." },
  { level:"Intermédiaire", text:"L'accord mineur majeur 7 crée une atmosphère mystérieuse très utilisée en musique de film." },
];
 
export const INITIAL_SKILLS = [
  {id:'accords',   label:'Accords',   value:35, color:'#C39BD3'},
  {id:'oreille',   label:'Oreille',   value:20, color:'#85C1E9'},
  {id:'rythme',    label:'Rythme',    value:40, color:'#82E0AA'},
  {id:'theorie',   label:'Théorie',   value:25, color:'#F1948A'},
  {id:'technique', label:'Technique', value:30, color:'#F7DC6F'},
  {id:'lecture',   label:'Lecture',   value:15, color:'#AED6F1'},
];
 
export const INSTRUMENTS = [
  {id:'piano',   label:'Piano',   icon:'🎹', available:true},
  {id:'guitare', label:'Guitare', icon:'🎸', available:false},
  {id:'basse',   label:'Basse',   icon:'🎵', available:false},
  {id:'violon',  label:'Violon',  icon:'🎻', available:false},
];
 
// ── Chopin (domaine public — IMSLP) ──────────────────────────────────────────
export const IMSLP_BASE = 'https://imslp.org/wiki/';
export const CHOPIN_WORKS = {
  etudes: [
    {op:'10',no:1,  key:'Do maj.',    nick:'Waterfall',       diff:5, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:3,  key:'Mi maj.',    nick:'Tristesse',       diff:3, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:4,  key:'Do# min.',   nick:'',                diff:5, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:5,  key:'Sol♭ maj.',  nick:'Touches noires',  diff:4, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:9,  key:'Fa min.',    nick:'',                diff:3, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'10',no:12, key:'Do min.',    nick:'Révolutionnaire', diff:5, url:'12_%C3%89tudes,_Op.10_(Chopin)'},
    {op:'25',no:1,  key:'La♭ maj.',  nick:'Harpe éolienne',  diff:4, url:'12_%C3%89tudes,_Op.25_(Chopin)'},
    {op:'25',no:9,  key:'Sol♭ maj.', nick:'Papillon',         diff:4, url:'12_%C3%89tudes,_Op.25_(Chopin)'},
    {op:'25',no:11, key:'La min.',    nick:"Vent d'hiver",    diff:5, url:'12_%C3%89tudes,_Op.25_(Chopin)'},
    {op:'25',no:12, key:'Do min.',    nick:'Océan',           diff:5, url:'12_%C3%89tudes,_Op.25_(Chopin)'},
  ],
  nocturnes: [
    {op:'9',      no:1,  key:'Si♭ min.', nick:'',          diff:3, url:'Nocturnes,_Op.9_(Chopin)'},
    {op:'9',      no:2,  key:'Mi♭ maj.', nick:'',          diff:2, url:'Nocturne_in_E-flat_major,_Op.9_No.2_(Chopin)'},
    {op:'15',     no:1,  key:'Fa maj.',  nick:'',          diff:3, url:'Nocturnes,_Op.15_(Chopin)'},
    {op:'15',     no:2,  key:'Fa# maj.', nick:'',          diff:3, url:'Nocturnes,_Op.15_(Chopin)'},
    {op:'27',     no:2,  key:'Ré♭ maj.', nick:'',          diff:3, url:'Nocturnes,_Op.27_(Chopin)'},
    {op:'32',     no:1,  key:'Si maj.',  nick:'',          diff:3, url:'Nocturnes,_Op.32_(Chopin)'},
    {op:'37',     no:2,  key:'Sol maj.', nick:'',          diff:3, url:'Nocturnes,_Op.37_(Chopin)'},
    {op:'48',     no:1,  key:'Do min.',  nick:'',          diff:4, url:'Nocturnes,_Op.48_(Chopin)'},
    {op:'55',     no:1,  key:'Fa min.',  nick:'',          diff:3, url:'Nocturnes,_Op.55_(Chopin)'},
    {op:'62',     no:1,  key:'Si maj.',  nick:'',          diff:3, url:'Nocturnes,_Op.62_(Chopin)'},
    {op:'72',     no:1,  key:'Mi min.',  nick:'(posthume)',diff:2, url:'Nocturne_in_E_minor,_Op.72,_No.1_(Chopin)'},
    {op:'posth.', no:'', key:'Do# min.', nick:'(posthume)',diff:2, url:'Nocturne_in_C-sharp_minor,_Op.posth._(Chopin)'},
  ],
};
 
// ── Songs Tabs (progressions d'accords — non soumises au droit d'auteur) ──────
export const SONGS_TABS = [
  { id:1,  title:"Canon en Ré",             artist:"Pachelbel",    era:"Baroque ~1680",  key:"Ré",      bpm:100, cat:"classique", color:"#85C1E9",
    chords:[{n:"D",t:"Majeures"},{n:"A",t:"Majeures"},{n:"B",t:"Mineures"},{n:"F#",t:"Mineures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Majeures"}] },
  { id:2,  title:"Prélude en Do",            artist:"J.S. Bach",   era:"Baroque ~1722",  key:"Do",      bpm:80,  cat:"classique", color:"#C39BD3",
    chords:[{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"D",t:"Mineures"},{n:"G",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:3,  title:"Für Elise",                artist:"Beethoven",   era:"Classique 1810", key:"La min.", bpm:76,  cat:"classique", color:"#82E0AA",
    chords:[{n:"A",t:"Mineures"},{n:"E",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"}] },
  { id:4,  title:"Minuet en Sol",            artist:"J.S. Bach",   era:"Baroque ~1725",  key:"Sol",     bpm:126, cat:"classique", color:"#F7DC6F",
    chords:[{n:"G",t:"Majeures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"}] },
  { id:5,  title:"Greensleeves",             artist:"Traditionnel",era:"XVIe siècle",    key:"La min.", bpm:80,  cat:"folk",      color:"#AED6F1",
    chords:[{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"F",t:"Majeures"},{n:"E",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"E",t:"Majeures"}] },
  { id:6,  title:"Scarborough Fair",         artist:"Traditionnel",era:"Folk anglais",   key:"La min.", bpm:90,  cat:"folk",      color:"#82E0AA",
    chords:[{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"D",t:"Majeures"},{n:"A",t:"Mineures"}] },
  { id:7,  title:"Amazing Grace",            artist:"Traditionnel",era:"Hymne ~1779",    key:"Do",      bpm:70,  cat:"folk",      color:"#F1948A",
    chords:[{n:"G",t:"Majeures"},{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"G",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:8,  title:"Hallelujah",               artist:"L. Cohen",    era:"1984",           key:"Do",      bpm:60,  cat:"pop",       color:"#C39BD3",
    chords:[{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"C",t:"Majeures"},{n:"A",t:"Mineures"},{n:"F",t:"Majeures"},{n:"G",t:"Majeures"}] },
  { id:9,  title:"Let It Be",                artist:"The Beatles", era:"1970",           key:"Do",      bpm:76,  cat:"pop",       color:"#85C1E9",
    chords:[{n:"C",t:"Majeures"},{n:"G",t:"Majeures"},{n:"A",t:"Mineures"},{n:"F",t:"Majeures"}] },
  { id:10, title:"Knockin' on Heaven's Door",artist:"B. Dylan",    era:"1973",           key:"Sol",     bpm:68,  cat:"pop",       color:"#82E0AA",
    chords:[{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"A",t:"Mineures"},{n:"G",t:"Majeures"},{n:"D",t:"Majeures"},{n:"C",t:"Majeures"}] },
  { id:11, title:"Stand By Me",              artist:"B.E. King",   era:"1961",           key:"La",      bpm:120, cat:"pop",       color:"#F7DC6F",
    chords:[{n:"A",t:"Majeures"},{n:"F#",t:"Mineures"},{n:"D",t:"Majeures"},{n:"E",t:"Majeures"}] },
  { id:12, title:"La Bamba",                 artist:"Traditionnel",era:"Folk mexicain",  key:"Do",      bpm:170, cat:"folk",      color:"#E8A87C",
    chords:[{n:"C",t:"Majeures"},{n:"F",t:"Majeures"},{n:"G",t:"Majeures"}] },
];
 
// ── Solfège ───────────────────────────────────────────────────────────────────
export const SOLFEGE_MAP = [
  {fr:'Do',  en:'C', semi:0,  color:'#E8A87C'},
  {fr:'Ré',  en:'D', semi:2,  color:'#85C1E9'},
  {fr:'Mi',  en:'E', semi:4,  color:'#82E0AA'},
  {fr:'Fa',  en:'F', semi:5,  color:'#F1948A'},
  {fr:'Sol', en:'G', semi:7,  color:'#C39BD3'},
  {fr:'La',  en:'A', semi:9,  color:'#F7DC6F'},
  {fr:'Si',  en:'B', semi:11, color:'#AED6F1'},
];
 
export const SOLFEGE_CHROM = [
  {fr:'Do',       en:'C',     semi:0},  {fr:'Do#/Réb',   en:'C#/Db', semi:1},
  {fr:'Ré',       en:'D',     semi:2},  {fr:'Ré#/Mi♭',   en:'D#/Eb', semi:3},
  {fr:'Mi',       en:'E',     semi:4},  {fr:'Fa',        en:'F',     semi:5},
  {fr:'Fa#/Sol♭', en:'F#/Gb', semi:6},  {fr:'Sol',       en:'G',     semi:7},
  {fr:'Sol#/La♭', en:'G#/Ab', semi:8},  {fr:'La',        en:'A',     semi:9},
  {fr:'La#/Si♭',  en:'A#/Bb', semi:10}, {fr:'Si',        en:'B',     semi:11},
];
 
// ── Défis journaliers ─────────────────────────────────────────────────────────
export const CHALLENGES_POOL = [
  {id:'c_warmup',    icon:'🎯', title:'Mise en route',     desc:"Compléter une session d'exercices",         req:(s)=>s.todayExercises>=1,  reward:2},
  {id:'c_ten',       icon:'🔥', title:'Assiduité',         desc:'Réaliser 10 exercices aujourd\'hui',        req:(s)=>s.todayExercises>=10, reward:3},
  {id:'c_twenty',    icon:'💪', title:'Marathon',          desc:'Réaliser 20 exercices aujourd\'hui',        req:(s)=>s.todayExercises>=20, reward:5},
  {id:'c_perfect',   icon:'⭐', title:'Session parfaite',  desc:'Terminer une session avec 100% de réussite',req:(s,d)=>s.lastPerfect===d,    reward:5},
  {id:'c_interval',  icon:'🎵', title:'Mélodiste',         desc:"Terminer une session d'intervalles",        req:(s,d)=>s.lastIntervalDay===d,reward:3},
  {id:'c_chord_ear', icon:'🎹', title:'Harmoniste',        desc:"Terminer une session d'accords à l'oreille",req:(s,d)=>s.lastChordEarDay===d,reward:3},
  {id:'c_library',   icon:'♩',  title:'Bibliothécaire',    desc:'Explorer 5 accords dans la bibliothèque',  req:(s)=>s.todayLibViews>=5,   reward:2},
  {id:'c_sections',  icon:'🗺', title:'Explorateur',       desc:'Visiter 3 sections différentes aujourd\'hui',req:(s)=>s.todaySections>=3, reward:4},
];
 
export function getDailyChallenges(dateStr) {
  const seed = dateStr.split('').reduce((a,c) => (a*31+c.charCodeAt(0)) & 0xFFFFFF, 0);
  return CHALLENGES_POOL
    .map((c,i) => [c, (seed*(i+1)*2654435761)>>>0])
    .sort((a,b) => a[1]-b[1])
    .slice(0,3)
    .map(x => x[0]);
}
 
export function isCompleted(id, stats, today) {
  return (stats.completedChallenges||[]).some(c => c.id===id && c.date===today);
}
 
export function checkAndComplete(stats, today, dailyChallenges) {
  let s = {...stats};
  for (const c of dailyChallenges) {
    if (!isCompleted(c.id, s, today) && c.req(s, today)) {
      s = {
        ...s,
        keys: (s.keys||0) + c.reward,
        completedChallenges: [...(s.completedChallenges||[]), {id:c.id, date:today}],
      };
    }
  }
  return s;
}

// ── Progressions d'improvisation ─────────────────────────────────────────────
export const IMPRO_PROGRESSIONS = [
  { id:1, name:"I – V – vi – IV", style:"Pop / Soul",
    emotion:"La progression la plus universelle. Elle évoque l'espoir mêlé de nostalgie — un voyage émotionnel complet en 4 accords. Omniprésente des Beatles à Adele.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"}],
    scales:["Do majeur","Pentatonique majeure"], color:"#85C1E9" },
  { id:2, name:"ii – V – I", style:"Jazz",
    emotion:"La progression phare du jazz. La tension du ii-V se résout naturellement sur le I, créant un sentiment de sophistication et de satisfaction harmonique.",
    chords:[{r:"D",t:"Min. 7",fn:"ii7"},{r:"G",t:"Dom. 7",fn:"V7"},{r:"C",t:"Maj. 7",fn:"Imaj7"}],
    scales:["Do majeur","Bebop dominante"], color:"#F7DC6F" },
  { id:3, name:"i – VII – VI – V", style:"Andalou / Flamenco",
    emotion:"La cadence andalouse. Mystère, passion et intensité dramatique. Très utilisée en flamenco, metal et pop alternative.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"G",t:"Majeures",fn:"VII"},{r:"F",t:"Majeures",fn:"VI"},{r:"E",t:"Majeures",fn:"V"}],
    scales:["Phrygien dominant","La mineur harmonique"], color:"#F1948A" },
  { id:4, name:"I – IV – V – I", style:"Blues / Gospel",
    emotion:"Le fondement du blues et du gospel. Simple, honnête et profond — communique une énergie directe et une satisfaction rythmique universelle.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"F",t:"Majeures",fn:"IV"},{r:"G",t:"Majeures",fn:"V"},{r:"C",t:"Majeures",fn:"I"}],
    scales:["Blues","Pentatonique mineure"], color:"#82E0AA" },
  { id:5, name:"I – vi – IV – V", style:"Doo-Wop / Pop 50s",
    emotion:"La progression des années 50. Nostalgique, romantique et intemporelle — évoque l'innocence et les premières amours.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"},{r:"G",t:"Majeures",fn:"V"}],
    scales:["Do majeur","Pentatonique majeure"], color:"#AED6F1" },
  { id:6, name:"i – iv – V – i", style:"Mineur classique",
    emotion:"Mélancolie profonde et résolution dramatique. Utilisée dans le classique et le métal pour exprimer la douleur et la catharsis.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"D",t:"Mineures",fn:"iv"},{r:"E",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"i"}],
    scales:["La mineur harmonique","Dorien"], color:"#C39BD3" },
  { id:7, name:"I – III – IV – iv", style:"Romanesque / Film",
    emotion:"Le borrowed chord crée une couleur doux-amère unique. Très utilisé dans les bandes originales pour des moments de transition émotionnelle.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"E",t:"Majeures",fn:"III"},{r:"F",t:"Majeures",fn:"IV"},{r:"F",t:"Mineures",fn:"iv"}],
    scales:["Do majeur","Fa mineur"], color:"#E8A87C" },
  { id:8, name:"vi – IV – I – V", style:"Pop contemporaine",
    emotion:"Introspective et mélancolique, elle commence dans l'ombre (vi) pour aboutir à la résolution (V). Omniprésente dans la pop des années 2000.",
    chords:[{r:"A",t:"Mineures",fn:"vi"},{r:"F",t:"Majeures",fn:"IV"},{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"}],
    scales:["Do majeur","Mode éolien"], color:"#82E0AA" },
  { id:9, name:"I – V – vi – iii – IV", style:"Pop baroque",
    emotion:"Dérivée du Canon de Pachelbel, elle crée un sentiment de continuité et de plénitude. La descente de basse canonique est immédiatement reconnaissable.",
    chords:[{r:"C",t:"Majeures",fn:"I"},{r:"G",t:"Majeures",fn:"V"},{r:"A",t:"Mineures",fn:"vi"},{r:"E",t:"Mineures",fn:"iii"},{r:"F",t:"Majeures",fn:"IV"}],
    scales:["Do majeur","Ionien"], color:"#85C1E9" },
  { id:10, name:"i – VI – III – VII", style:"Épique / Metal",
    emotion:"L'enchaînement de puissance. Évoque l'épique et la détermination. Pilier du metal, de la musique de jeux vidéo et des bandes originales cinématographiques.",
    chords:[{r:"A",t:"Mineures",fn:"i"},{r:"F",t:"Majeures",fn:"VI"},{r:"C",t:"Majeures",fn:"III"},{r:"G",t:"Majeures",fn:"VII"}],
    scales:["Mode éolien","Pentatonique mineure"], color:"#F1948A" },
];
 
// ── Mélodies pour la lecture de partition ────────────────────────────────────
export const LECTURE_MELODIES = [
  { id:1, title:"Gamme ascendante",    desc:"Les 8 notes fondamentales en montant",
    notes:['C4','D4','E4','F4','G4','A4','B4','C5'] },
  { id:2, title:"Gamme descendante",   desc:"Les 8 notes fondamentales en descendant",
    notes:['C5','B4','A4','G4','F4','E4','D4','C4'] },
  { id:3, title:"Mélodie conjointe",   desc:"Notes qui se suivent progressivement",
    notes:['E4','F4','G4','A4','G4','F4','E4','D4'] },
  { id:4, title:"Arpège de Do majeur", desc:"Les notes de l'accord de Do — intervalles disjoints",
    notes:['C4','E4','G4','C5','G4','E4','C4'] },
  { id:5, title:"Au clair de la lune", desc:"Mélodie traditionnelle française (domaine public)",
    notes:['C5','C5','C5','D5','E5','D5','C5'] },
  { id:6, title:"Mélodie sautée",      desc:"Sauts d'intervalles plus larges",
    notes:['C4','G4','E4','A4','F4','B4','G4','C5'] },
];

