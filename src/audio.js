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
  const {tone,volume}=currentClick;currentClick=null;
  tone.onended=null;
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
export function playClick(){chirp(620,440,.075,.035,'sine');}
// Card handling: a rising lift, a soft wooden drop into a box, a falling slide back to the tray.
const DRAG_SOUNDS={lift:[420,680,.09,.03,'sine'],drop:[560,240,.14,.05,'triangle'],back:[380,250,.11,.025,'sine']};
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
