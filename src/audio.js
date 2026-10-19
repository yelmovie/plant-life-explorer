// Short interface feedback only. Audio starts after a user gesture, never on load.
// The on/off choice has its own storage key so resetting research records keeps it.
export const SOUND_KEY='green-garden-sound';
let context,enabled=true;
try{const saved=localStorage.getItem(SOUND_KEY);if(saved!==null)enabled=saved==='on';}catch{/* storage blocked: default on */}
export const soundStored=()=>{try{return localStorage.getItem(SOUND_KEY)!==null;}catch{return false;}};
export const isSoundOn=()=>enabled;
export function setSound(on){
  enabled=Boolean(on);
  try{localStorage.setItem(SOUND_KEY,enabled?'on':'off');}catch{/* keep in memory only */}
  if(!enabled&&context?.state==='running')void context.suspend().catch(()=>{});
}
export function playClick(){
  if(!enabled)return;
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)return;
  try{
    context ||= new AudioContext();
    if(context.state==='suspended')void context.resume().catch(()=>{});
    const tone=context.createOscillator(),volume=context.createGain(),now=context.currentTime;
    tone.type='sine';tone.frequency.setValueAtTime(620,now);tone.frequency.exponentialRampToValueAtTime(440,now+.065);
    volume.gain.setValueAtTime(0,now);volume.gain.linearRampToValueAtTime(.035,now+.006);volume.gain.exponentialRampToValueAtTime(.0001,now+.075);
    tone.connect(volume);volume.connect(context.destination);tone.start(now);tone.stop(now+.08);
    tone.onended=()=>{tone.disconnect();volume.disconnect();};
  }catch{/* Keep controls usable on browsers without audio support. */}
}
