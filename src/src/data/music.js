// ── Théorie musicale — données pures ─────────────────────────────────────────
 
export const CHROMATIC = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
 
export const CHORD_TYPES = {
  "Majeures":  { formula:[0,4,7],    suffix:"",      label:"Majeure" },
  "Mineures":  { formula:[0,3,7],    suffix:"m",     label:"Mineure" },
  "Dom. 7":    { formula:[0,4,7,10], suffix:"7",     label:"Dominante 7" },
  "Maj. 7":    { formula:[0,4,7,11], suffix:"maj7",  label:"Majeure 7" },
  "Min. 7":    { formula:[0,3,7,10], suffix:"m7",    label:"Mineure 7" },
  "MinMaj. 7": { formula:[0,3,7,11], suffix:"mMaj7", label:"Min. Maj. 7" },
};
 
export const ROOT_NOTES = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
 
export const NOTE_COLORS = {
  C:"#E8A87C","C#":"#E8A87C",D:"#85C1E9",Eb:"#85C1E9",E:"#82E0AA",
  F:"#F1948A","F#":"#F1948A",G:"#C39BD3",Ab:"#C39BD3",A:"#F7DC6F",Bb:"#F7DC6F",B:"#AED6F1",
};
 
export const INVERSION_NAMES = ["Fondamentale","1er renversement","2ème renversement","3ème renversement"];
 
export const INTERVALS_DATA = [
  {semi:1,  name:"2nde min.", full:"Seconde mineure",   color:"#E8A87C"},
  {semi:2,  name:"2nde maj.", full:"Seconde majeure",   color:"#F7DC6F"},
  {semi:3,  name:"3ce min.",  full:"Tierce mineure",    color:"#82E0AA"},
  {semi:4,  name:"3ce maj.",  full:"Tierce majeure",    color:"#85C1E9"},
  {semi:5,  name:"4te juste", full:"Quarte juste",      color:"#C39BD3"},
  {semi:6,  name:"Triton",    full:"Triton",            color:"#F1948A"},
  {semi:7,  name:"5te juste", full:"Quinte juste",      color:"#AED6F1"},
  {semi:8,  name:"6te min.",  full:"Sixte mineure",     color:"#82E0AA"},
  {semi:9,  name:"6te maj.",  full:"Sixte majeure",     color:"#E8A87C"},
  {semi:10, name:"7e min.",   full:"Septième mineure",  color:"#C39BD3"},
  {semi:11, name:"7e maj.",   full:"Septième majeure",  color:"#F7DC6F"},
  {semi:12, name:"Octave",    full:"Octave",            color:"#AED6F1"},
];
 
export const CHORD_COLORS = {
  Majeures:'#85C1E9', Mineures:'#82E0AA', "Dom. 7":'#F7DC6F',
  "Maj. 7":'#C39BD3', "Min. 7":'#F1948A', "MinMaj. 7":'#E8A87C',
};
 
export const NM = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
export const semiToName = s => `${NM[s % 12]}${4 + Math.floor(s / 12)}`;
 
export function genEx(arr) {
  const n = Math.floor(Math.random() * 12);
  const i = arr[Math.floor(Math.random() * arr.length)];
  return { note1: n, note2: n + i, intSemi: i };
}
 
export function genChordEx(arr) {
  const r = Math.floor(Math.random() * 12);
  const t = arr[Math.floor(Math.random() * arr.length)];
  return { rootSemi: r, type: t, notes: CHORD_TYPES[t].formula.map(i => r + i) };
}