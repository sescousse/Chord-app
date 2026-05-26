// ── Moteur audio ──────────────────────────────────────────────────────────────
import { CHROMATIC, CHORD_TYPES } from '../data/music.js';
 
// Données du clavier piano (2 octaves)
export const PIANO_KEYS_DATA = [
  {absIdx:0,type:'white',wi:0,note:'C'},{absIdx:1,type:'black',wi:0,note:'C#'},
  {absIdx:2,type:'white',wi:1,note:'D'},{absIdx:3,type:'black',wi:1,note:'Eb'},
  {absIdx:4,type:'white',wi:2,note:'E'},{absIdx:5,type:'white',wi:3,note:'F'},
  {absIdx:6,type:'black',wi:3,note:'F#'},{absIdx:7,type:'white',wi:4,note:'G'},
  {absIdx:8,type:'black',wi:4,note:'Ab'},{absIdx:9,type:'white',wi:5,note:'A'},
  {absIdx:10,type:'black',wi:5,note:'Bb'},{absIdx:11,type:'white',wi:6,note:'B'},
  {absIdx:12,type:'white',wi:7,note:'C'},{absIdx:13,type:'black',wi:7,note:'C#'},
  {absIdx:14,type:'white',wi:8,note:'D'},{absIdx:15,type:'black',wi:8,note:'Eb'},
  {absIdx:16,type:'white',wi:9,note:'E'},{absIdx:17,type:'white',wi:10,note:'F'},
  {absIdx:18,type:'black',wi:10,note:'F#'},{absIdx:19,type:'white',wi:11,note:'G'},
  {absIdx:20,type:'black',wi:11,note:'Ab'},{absIdx:21,type:'white',wi:12,note:'A'},
  {absIdx:22,type:'black',wi:12,note:'Bb'},{absIdx:23,type:'white',wi:13,note:'B'},
];
export const WW=38, WH=128, BW=24, BH=80;
 
let _audioCtx = null;
export function getACtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}
 
export function playNote(semi, delay=0, dur=1.8) {
  try {
    const ctx=getACtx(), freq=261.63*Math.pow(2,semi/12), t=ctx.currentTime+delay;
    [[1,.45],[2,.12],[3,.07],[4,.03]].forEach(([h,g]) => {
      const o=ctx.createOscillator(), gn=ctx.createGain();
      o.connect(gn); gn.connect(ctx.destination);
      o.frequency.value=freq*h; o.type='sine';
      gn.gain.setValueAtTime(0,t);
      gn.gain.linearRampToValueAtTime(g,t+.008);
      gn.gain.exponentialRampToValueAtTime(.001,t+dur);
      o.start(t); o.stop(t+dur+.05);
    });
  } catch (error) {
    console.error(error);
  }
}
 
export const playSeq      = (n1,n2) => { playNote(n1); playNote(n2,1.1); };
export const playSimul    = (n1,n2) => { playNote(n1,0,2); playNote(n2,0,2); };
export const playChordArp = ns     => ns.forEach((s,i) => playNote(s,i*.1,2.2));
export const playChordSimul = ns   => ns.forEach(s => playNote(s,0,2.5));
 
export function playTabChord(name, type) {
  const root = CHROMATIC.indexOf(name);
  if (root === -1 || !CHORD_TYPES[type]) return;
  playChordArp(CHORD_TYPES[type].formula.map(i => root+i+4));
}
 
export function getInversionAbsIndices(notes) {
  if (!notes || !notes.length) return [];
  let result=[], prevAbs=-1, oct=0;
  for (const note of notes) {
    const idx = CHROMATIC.indexOf(note);
    if (idx === -1) continue;
    let abs = idx+oct*12;
    if (abs <= prevAbs) { oct++; abs = idx+oct*12; }
    result.push(abs); prevAbs=abs;
  }
  return result;
}