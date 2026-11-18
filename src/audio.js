// One music player owns both themes. Hidden tabs suspend it; the story films play over it.
// Sound preferences are separate from research records and survive a record reset.
export const SOUND_KEY='green-garden-sound';
const MUSIC_KEY='green-garden-music',VOLUME_KEY='green-garden-music-volume';
const saved=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{/* keep in memory only */}};
const volumeValue=value=>Number.isFinite(Number(value))?Math.round(Math.min(100,Math.max(0,Number(value)))/5)*5:30;
let context,currentClick,effectsEnabled=saved(SOUND_KEY)!=='off';
let musicEnabled=saved(MUSIC_KEY)!=='off',musicVolume=volumeValue(saved(VOLUME_KEY)??30);
export const MUSIC_TRACKS={main:'/assets/audio/main-theme.mp3',ending:'/assets/audio/ending-theme.mp3'};
export const hasMusic=()=>true;
export const soundStored=()=>saved(SOUND_KEY)!==null;
export const isEffectsOn=()=>effectsEnabled;
export const isMusicOn=()=>hasMusic()&&musicEnabled;
export const isSoundOn=()=>isEffectsOn()||isMusicOn();
export const getMusicVolume=()=>musicVolume;
export function setMusic(on){musicEnabled=Boolean(on);save(MUSIC_KEY,musicEnabled?'on':'off');syncMusic();}
export function setMusicVolume(value){musicVolume=volumeValue(value);save(VOLUME_KEY,String(musicVolume));if(musicPlayer)musicPlayer.volume=musicVolume/100;}
let musicPlayer,selectedTheme='main',loadedTheme=null,endedTheme=null,unlocked=false;
const musicHolds=new Set();
// replay: a theme that already played to its end starts again (the ending theme does not loop).
export function playMusic(theme='main',replay=false){
  if(!Object.hasOwn(MUSIC_TRACKS,theme))return;
  if(selectedTheme!==theme||replay){selectedTheme=theme;endedTheme=null;}
  syncMusic();
}
// Called from a user click, never from the initial render's autoplay attempt.
export function unlockMusic(){unlocked=true;syncMusic();}
export function suspendMusic(){
  const token=Symbol('story');musicHolds.add(token);syncMusic();
  return ()=>{musicHolds.delete(token);syncMusic();};
}
function syncMusic(){
  if(!unlocked||!musicEnabled||musicHolds.size||globalThis.document?.hidden){musicPlayer?.pause();return;}
  if(endedTheme===selectedTheme)return;
  try{
    if(!musicPlayer){
      const Audio=globalThis.Audio||globalThis.window?.Audio;if(!Audio)return;
      musicPlayer=new Audio();musicPlayer.id='background-music';musicPlayer.hidden=true;musicPlayer.preload='none';
      musicPlayer.addEventListener('ended',()=>{endedTheme=loadedTheme;});
      globalThis.document?.body?.append(musicPlayer);
    }
    if(loadedTheme!==selectedTheme){
      musicPlayer.pause();musicPlayer.src=MUSIC_TRACKS[selectedTheme];musicPlayer.currentTime=0;loadedTheme=selectedTheme;
    }
    musicPlayer.loop=selectedTheme==='main';musicPlayer.volume=musicVolume/100;
    if(musicPlayer.paused)void musicPlayer.play()?.catch(()=>{/* A blocked or unavailable track never blocks learning. */});
  }catch{musicPlayer?.pause();}
}
function stopClick(){
  if(!currentClick)return;
  const {tone,volume,sample}=currentClick;currentClick=null;
  tone.onended=null;
  // A sample fades for a few milliseconds so the next strike does not start on a click.
  if(sample&&context){
    const now=context.currentTime;
    try{volume.gain.cancelScheduledValues(now);volume.gain.setTargetAtTime(0,now,.012);tone.stop(now+.06);}catch{/* It may already have finished. */}
    tone.onended=()=>{tone.disconnect();volume.disconnect();};
    return;
  }
  try{tone.stop();}catch{/* It may already have finished. */}
  tone.disconnect();volume.disconnect();
}
export function stopFeedback(){stopClick();}
export function setEffects(on){
  effectsEnabled=Boolean(on);save(SOUND_KEY,effectsEnabled?'on':'off');
  if(!effectsEnabled){stopClick();if(context?.state==='running')void context.suspend().catch(()=>{});}
}
// The header speaker controls both channels; the settings switches control one.
export function setSound(on){setMusic(on);setEffects(on);}
// A soft rising seed-pop suits the garden without a sharp electronic click.
export function playClick(){chirp(480,720,.075,.03,'sine');}
// Card handling: a rising lift, a soft wooden drop into a box, a falling slide back to the tray.
const DRAG_SOUNDS={lift:[420,680,.09,.03,'sine'],drop:[560,240,.14,.05,'triangle'],back:[380,250,.11,.025,'sine']};
// Map combat uses locally hosted CC0 samples (assets/CREDITS.md): a twig swish, seed pops and a leafy retreat.
// They share the one effects voice; only the swing keeps ringing under the strike it leads into.
const MAP_SOUNDS={
  swing:['/assets/audio/sfx/wind-whoosh-02.mp3',0.5],
  hit1:['/assets/audio/sfx/hit-light-03.mp3',0.7],
  hit2:['/assets/audio/sfx/hit-light-02.mp3',0.6],
  finish:['/assets/audio/sfx/hit-heavy-01.mp3',0.65],
  exit:['/assets/audio/sfx/leaf-rustle-03.mp3',0.3],
  appear:['/assets/audio/sfx/leaf-rustle-02.mp3',0.25],
  contact:['/assets/audio/sfx/hurt-bump-01.mp3',0.7],
  victory:['/assets/audio/sfx/victory-jingle-04.mp3',0.4],
};
// Achievement cards (reward-cards.js) share that voice: fly in, reveal (the two rarest use the longer jingle), land in a slot, full set.
const CARD_SOUNDS={
  'card-whoosh':['/assets/audio/sfx/wind-whoosh-03.mp3',0.5],
  'card-reveal':['/assets/audio/sfx/reward-01.mp3',0.5],
  'card-epic':['/assets/audio/sfx/reward-03.mp3',0.5],
  'card-slot':['/assets/audio/sfx/pickup-01.mp3',0.6],
  'card-complete':['/assets/audio/sfx/victory-jingle-01.mp3',0.4],
};
const sampleOf=key=>MAP_SOUNDS[key]??CARD_SOUNDS[key];
const samples=new Map();
const activated=()=>globalThis.navigator?.userActivation?.hasBeenActive!==false;
function loadSample(key){
  if(samples.has(key)||!sampleOf(key))return;
  // An offline context decodes before any tap, so preloading never trips the autoplay policy.
  const Offline=globalThis.window?.OfflineAudioContext||globalThis.window?.webkitOfflineAudioContext;
  if(!Offline||typeof fetch!=='function'){samples.set(key,null);return;}
  samples.set(key,null);
  fetch(sampleOf(key)[0]).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer();})
    .then(data=>new Offline(1,1,44100).decodeAudioData(data)).then(buffer=>{samples.set(key,buffer);})
    .catch(()=>{/* The synthesized fallback keeps the map responsive. */});
}
export function preloadMapSounds(){if(effectsEnabled)for(const key of Object.keys(MAP_SOUNDS))loadSample(key);}
export function preloadCardSounds(){if(effectsEnabled)for(const key of Object.keys(CARD_SOUNDS))loadSample(key);}
const MAP_TONES={swing:[300,520,.08,.03,'sine'],hit1:[390,235,.09,.05,'sine'],hit2:[470,205,.16,.07,'triangle'],finish:[670,310,.28,.05,'sine'],contact:[210,133,.12,.05,'triangle']};
// kind: swing (button pressed), hit (strike lands; hits 1 or 2), finish (third strike), exit, appear, contact, victory.
export function playMapEncounter(kind,hits){
  const key=kind==='hit'?(hits===2?'hit2':'hit1'):kind;
  if(!effectsEnabled||globalThis.document?.hidden||!sampleOf(key)||!activated())return;
  const buffer=samples.get(key);
  if(!buffer){loadSample(key);if(MAP_TONES[key])chirp(...MAP_TONES[key]);return;}
  const AudioContext=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext;if(!AudioContext)return;
  try{
    context ||= new AudioContext();
    if(currentClick?.lead)currentClick=null;else stopClick();
    if(context.state==='suspended')void context.resume().catch(()=>{});
    const tone=context.createBufferSource(),volume=context.createGain();
    tone.buffer=buffer;volume.gain.value=sampleOf(key)[1];
    currentClick={tone,volume,sample:true,lead:key==='swing'};
    tone.connect(volume);volume.connect(context.destination);tone.start();
    tone.onended=()=>{tone.disconnect();volume.disconnect();if(currentClick?.tone===tone)currentClick=null;};
  }catch{stopClick();}
}
// name: whoosh, reveal, epic, slot, complete. The finale jingle ('victory') takes over the voice, so the two never overlap.
export function playCardSound(name){playMapEncounter('card-'+name);}
export function playDragSound(kind){const s=DRAG_SOUNDS[kind];if(s)chirp(...s);}
function chirp(from,to,length,gain,type){
  if(!effectsEnabled||globalThis.document?.hidden)return;
  const AudioContext=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext;
  if(!AudioContext)return;
  try{
    context ||= new AudioContext();stopClick();
    if(context.state==='suspended')void context.resume().catch(()=>{});
    const tone=context.createOscillator(),volume=context.createGain(),now=context.currentTime;
    currentClick={tone,volume};
    tone.type=type;tone.frequency.setValueAtTime(from,now);tone.frequency.exponentialRampToValueAtTime(to,now+length*.87);
    volume.gain.setValueAtTime(0,now);volume.gain.linearRampToValueAtTime(gain,now+.006);volume.gain.exponentialRampToValueAtTime(.0001,now+length);
    tone.connect(volume);volume.connect(context.destination);tone.start(now);tone.stop(now+length+.005);
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
  syncMusic();
  if(document.hidden){stopClick();if(context?.state==='running')void context.suspend().catch(()=>{});}
});
