// Only short interface feedback is used here; this activity has no music track.
// Sound preferences are separate from research records and survive a record reset.
export const SOUND_KEY='green-garden-sound';
const MUSIC_KEY='green-garden-music',VOLUME_KEY='green-garden-music-volume';
const saved=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{/* keep in memory only */}};
const volumeValue=value=>Number.isFinite(Number(value))?Math.round(Math.min(100,Math.max(0,Number(value)))/5)*5:30;
let context,currentClick,effectsEnabled=saved(SOUND_KEY)!=='off';
let musicEnabled=saved(MUSIC_KEY)==='on',musicVolume=volumeValue(saved(VOLUME_KEY)??30);
export const hasMusic=()=>false;
export const soundStored=()=>saved(SOUND_KEY)!==null;
export const isEffectsOn=()=>effectsEnabled;
export const isMusicOn=()=>hasMusic()&&musicEnabled;
export const isSoundOn=()=>isEffectsOn()||isMusicOn();
export const getMusicVolume=()=>musicVolume;
export function setMusic(on){musicEnabled=hasMusic()&&Boolean(on);save(MUSIC_KEY,musicEnabled?'on':'off');}
export function setMusicVolume(value){musicVolume=volumeValue(value);save(VOLUME_KEY,String(musicVolume));}
function stopClick(){
  if(!currentClick)return;
  const {tone,volume}=currentClick;currentClick=null;
  tone.onended=null;
  try{tone.stop();}catch{/* It may already have finished. */}
  tone.disconnect();volume.disconnect();
}
export function setEffects(on){
  effectsEnabled=Boolean(on);save(SOUND_KEY,effectsEnabled?'on':'off');
  if(!effectsEnabled){stopClick();if(context?.state==='running')void context.suspend().catch(()=>{});}
}
// The header speaker controls both channels; the settings switches control one.
export function setSound(on){setMusic(on);setEffects(on);}
export function playClick(){
  if(!effectsEnabled||globalThis.document?.hidden)return;
  const AudioContext=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext;
  if(!AudioContext)return;
  try{
    context ||= new AudioContext();stopClick();
    if(context.state==='suspended')void context.resume().catch(()=>{});
    const tone=context.createOscillator(),volume=context.createGain(),now=context.currentTime;
    currentClick={tone,volume};
    tone.type='sine';tone.frequency.setValueAtTime(620,now);tone.frequency.exponentialRampToValueAtTime(440,now+.065);
    volume.gain.setValueAtTime(0,now);volume.gain.linearRampToValueAtTime(.035,now+.006);volume.gain.exponentialRampToValueAtTime(.0001,now+.075);
    tone.connect(volume);volume.connect(context.destination);tone.start(now);tone.stop(now+.08);
    tone.onended=()=>{tone.disconnect();volume.disconnect();if(currentClick?.tone===tone)currentClick=null;};
  }catch{stopClick();/* Keep controls usable on browsers without audio support. */}
}
// A single first-completion phrase. It shares the click voice so sounds never stack.
export function playReward(){
  if(!effectsEnabled||globalThis.document?.hidden)return;
  const AudioContext=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext;if(!AudioContext)return;
  try{context ||= new AudioContext();stopClick();if(context.state==='suspended')void context.resume().catch(()=>{});
    const tone=context.createOscillator(),volume=context.createGain(),now=context.currentTime;currentClick={tone,volume};tone.type='sine';
    [523.25,659.25,783.99,1046.5].forEach((frequency,i)=>tone.frequency.setValueAtTime(frequency,now+i*.12));
    volume.gain.setValueAtTime(0,now);volume.gain.linearRampToValueAtTime(.045,now+.02);volume.gain.setValueAtTime(.035,now+.4);volume.gain.exponentialRampToValueAtTime(.0001,now+.7);
    tone.connect(volume);volume.connect(context.destination);tone.start(now);tone.stop(now+.72);tone.onended=()=>{tone.disconnect();volume.disconnect();if(currentClick?.tone===tone)currentClick=null;};
  }catch{stopClick();}
}

globalThis.document?.addEventListener('visibilitychange',()=>{
  if(!document.hidden)return;
  stopClick();if(context?.state==='running')void context.suspend().catch(()=>{});
});
