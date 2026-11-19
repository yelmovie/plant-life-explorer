// One music player owns both themes. Hidden tabs suspend it; the story films (their own score is mixed in) stop it;
// voices only turn it down. The map finale dialog plays the ending theme while it is open.
// Sound preferences are separate from research records and survive a record reset.
export const SOUND_KEY='green-garden-sound';
const MUSIC_KEY='green-garden-music',VOLUME_KEY='green-garden-music-volume';
// Added 2026-11-20: voices have their own switch and the effects their own level (settings).
const VOICE_KEY='green-garden-voice',SFX_VOLUME_KEY='green-garden-sfx-volume';
const saved=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{/* keep in memory only */}};
// 25: with voices at 0.7 the theme sits about a third as loud. Used only when no volume has been saved.
const DEFAULT_VOLUME=25;
// 100: every effect keeps the gain it was tuned to; the level multiplies the whole effects lane (effectsOut).
const DEFAULT_SFX_VOLUME=100;
const volumeValue=(value,fallback=DEFAULT_VOLUME)=>Number.isFinite(Number(value))&&value!==null&&value!==''?Math.round(Math.min(100,Math.max(0,Number(value)))/5)*5:fallback;
let context,currentClick,effectsEnabled=saved(SOUND_KEY)!=='off';
let musicEnabled=saved(MUSIC_KEY)!=='off',musicVolume=volumeValue(saved(VOLUME_KEY)??DEFAULT_VOLUME);
let sfxVolume=volumeValue(saved(SFX_VOLUME_KEY),DEFAULT_SFX_VOLUME);
// Until 2026-11-20 the voices followed the effects switch, so a record without its own voice value keeps that one.
// It is written down at once, so turning the effects off later no longer takes the voices with it. New students: on.
let voiceEnabled=(saved(VOICE_KEY)??saved(SOUND_KEY))!=='off';
if(saved(VOICE_KEY)===null)save(VOICE_KEY,voiceEnabled?'on':'off');
export const MUSIC_TRACKS={main:'/assets/audio/main-theme.mp3',ending:'/assets/audio/ending-theme.mp3'};
export const hasMusic=()=>true;
export const soundStored=()=>saved(SOUND_KEY)!==null;
export const isEffectsOn=()=>effectsEnabled;
export const isMusicOn=()=>hasMusic()&&musicEnabled;
export const isVoiceOn=()=>voiceEnabled;
export const isSoundOn=()=>isEffectsOn()||isMusicOn()||isVoiceOn();
export const getMusicVolume=()=>musicVolume;
export const getSfxVolume=()=>sfxVolume;
export function setMusic(on){musicEnabled=Boolean(on);save(MUSIC_KEY,musicEnabled?'on':'off');syncMusic();}
export function setMusicVolume(value){musicVolume=volumeValue(value);save(VOLUME_KEY,String(musicVolume));levelMusic(false);}
let musicPlayer,selectedTheme='main',loadedTheme=null,endedTheme=null,unlocked=false,finaleOpen=false;
// Two kinds of named holds, each released by its own token: films stop the music, voices turn it down to a quarter.
const musicHolds=new Set(),musicDucks=new Set();
const DUCK=.25,FADE_MS=200;
// The ending theme does not loop. Once it has played out, the main theme carries on underneath at AFTER of its level
// for as long as the ending screen or the map finale stays open. RISE_MS: the theme comes in slowly under a jingle.
const AFTER=.45,RISE_MS=1200;
let fadeTimer=0,fadeTo=-1,afterglow=false,riseMs=FADE_MS;
const musicLevel=()=>musicVolume/100*(musicDucks.size?DUCK:1)*(afterglow?AFTER:1);
const musicBlocked=()=>!unlocked||!musicEnabled||musicHolds.size>0||Boolean(globalThis.document?.hidden);
// glide: move to the level over `ms` so a voice starting or ending never makes the music jump.
function levelMusic(glide=true,ms=FADE_MS){
  if(!musicPlayer)return;
  const to=musicLevel(),from=Number(musicPlayer.volume);
  if(fadeTimer){if(glide&&to===fadeTo)return;clearInterval(fadeTimer);fadeTimer=0;}
  if(!glide||musicPlayer.paused||!(Math.abs(to-from)>.004)){musicPlayer.volume=to;return;}
  const began=Date.now();fadeTo=to;
  fadeTimer=setInterval(()=>{
    const k=Math.min(1,(Date.now()-began)/ms);
    musicPlayer.volume=musicPlayer.paused?to:from+(to-from)*k;
    if(k>=1||musicPlayer.paused){clearInterval(fadeTimer);fadeTimer=0;}
  },20);
}
// replay: a theme that already played to its end starts again (the ending theme does not loop).
export function playMusic(theme='main',replay=false){
  if(!Object.hasOwn(MUSIC_TRACKS,theme))return;
  if(selectedTheme!==theme||replay){selectedTheme=theme;endedTheme=null;}
  syncMusic();
}
// Called from a user press, key or click, never from the initial render's autoplay attempt.
export function unlockMusic(){unlocked=true;syncMusic();}
// Films: the music stops until every film has let go.
export function suspendMusic(){
  const token=Symbol('story');musicHolds.add(token);syncMusic();
  return ()=>{musicHolds.delete(token);syncMusic();};
}
// Voices: the music keeps playing at a quarter until every voice has let go (also when a line stops early or fails).
export function duckMusic(){
  const token=Symbol('voice');musicDucks.add(token);levelMusic();
  return ()=>{if(musicDucks.delete(token))levelMusic();};
}
function syncMusic(){
  let theme=finaleOpen?'ending':selectedTheme;
  afterglow=theme==='ending'&&endedTheme==='ending';
  if(afterglow)theme='main';
  if(musicBlocked()){musicPlayer?.pause();return;}
  try{
    if(!musicPlayer){
      const Audio=globalThis.Audio||globalThis.window?.Audio;if(!Audio)return;
      musicPlayer=new Audio();musicPlayer.id='background-music';musicPlayer.hidden=true;musicPlayer.preload='none';
      musicPlayer.addEventListener('ended',()=>{endedTheme=loadedTheme;syncMusic();});
      globalThis.document?.body?.append(musicPlayer);
    }
    if(loadedTheme!==theme){
      musicPlayer.pause();musicPlayer.src=MUSIC_TRACKS[theme];musicPlayer.currentTime=0;loadedTheme=theme;
    }
    musicPlayer.loop=theme==='main';
    // A start or resume rises from silence, so a press that leads straight into a film never leaves a blip.
    if(musicPlayer.paused){musicPlayer.volume=0;void musicPlayer.play()?.catch(()=>{/* A blocked or unavailable track never blocks learning. */});}
    levelMusic(true,riseMs);
  }catch{musicPlayer?.pause();}
}
// map-finale.js announces its dialog. Its film stays muted: the ending theme plays from the start while the dialog is
// open and the main theme returns when it closes. A jingle that is still ringing is never cut: the theme rises under it.
globalThis.document?.addEventListener('map-finale',event=>{
  finaleOpen=Boolean(event.detail?.open);
  if(finaleOpen){
    endedTheme=null;
    if(loadedTheme==='ending'&&musicPlayer)musicPlayer.currentTime=0;
    if(ringing.length)riseMs=RISE_MS;
  }
  syncMusic();riseMs=FADE_MS;
});
// Effects run in three lanes so one kind never cuts another.
// UI (clicks, card handling, the right / try-again cues): one voice, a new one replaces it (currentClick).
// Combat and rewards (strikes, cards, jingles, a place opening): they ring together, four at most (ringing).
// Footsteps: one voice of their own (stepVoice).
const RING_MAX=4;
let ringing=[],stepVoice=null,stepTurn=0,cardSetRang=false,leadUntil=0,effectsBus=null;
// Every effect goes out through one gain that carries the effects level (settings). At 100 % it is 1.
function effectsOut(){
  if(!effectsBus){effectsBus=context.createGain();effectsBus.gain.value=sfxVolume/100;effectsBus.connect(context.destination);}
  return effectsBus;
}
function stopClick(){
  if(!currentClick)return;
  const voice=currentClick;currentClick=null;hush(voice);
}
function stopEffects(){
  stopClick();
  for(const voice of ringing.splice(0))hush(voice);
  if(stepVoice){hush(stepVoice);stepVoice=null;}
}
function hush({tone,volume,sample}){
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
// A voice or a film is about to start: the UI cue gives way. Strikes, cards and jingles keep ringing.
export function stopFeedback(){stopClick();}
export function setEffects(on){
  effectsEnabled=Boolean(on);save(SOUND_KEY,effectsEnabled?'on':'off');
  if(!effectsEnabled){stopEffects();if(context?.state==='running')void context.suspend().catch(()=>{});}
}
// The effects level (0-100 %, steps of 5) multiplies every effect at once, also one that is ringing now.
export function setSfxVolume(value){
  sfxVolume=volumeValue(value,sfxVolume);save(SFX_VOLUME_KEY,String(sfxVolume));
  if(effectsBus)effectsBus.gain.value=sfxVolume/100;
}
// Voices: character lines, the narration, the thieves' bubbles and the concept captions (voice-lines.js,
// character-dialogue.js). Turning them off stops the line that is being read; the text stays on screen.
export function setVoice(on){
  voiceEnabled=Boolean(on);save(VOICE_KEY,voiceEnabled?'on':'off');
  if(!voiceEnabled)try{globalThis.document?.dispatchEvent?.(new Event('sound-voice-off'));}catch{/* No listeners to tell. */}
}
// The header speaker controls every channel; the settings switches control one each.
export function setSound(on){setMusic(on);setEffects(on);setVoice(on);}
// A soft rising seed-pop suits the garden without a sharp electronic click.
export function playClick(){chirp(480,720,.075,.03,'sine');}
// Card handling: a rising lift, a soft wooden drop into a box, a falling slide back to the tray.
const DRAG_SOUNDS={lift:[420,680,.09,.03,'sine'],drop:[560,240,.14,.05,'triangle'],back:[380,250,.11,.025,'sine']};
// Map combat uses locally hosted CC0 samples (assets/CREDITS.md): a twig swish, seed pops and a leafy retreat.
// They ring in the combat lane, so the swing carries on under the strike and a click never cuts a strike.
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
// Achievement cards (reward-cards.js) ring in the same lane: fly in, reveal (the two rarest use the longer jingle), land in a slot, full set.
const CARD_SOUNDS={
  'card-whoosh':['/assets/audio/sfx/wind-whoosh-03.mp3',0.5],
  'card-reveal':['/assets/audio/sfx/reward-01.mp3',0.5],
  'card-epic':['/assets/audio/sfx/reward-03.mp3',0.5],
  'card-slot':['/assets/audio/sfx/pickup-01.mp3',0.6],
  'card-complete':['/assets/audio/sfx/victory-jingle-01.mp3',0.4],
};
// The map trail (same library, assets/CREDITS.md): two footsteps taken in turn, and a place opening (a soft latch, then small bells).
const TRAIL_SOUNDS={
  step1:['/assets/audio/sfx/step-01.mp3',0.15],
  step2:['/assets/audio/sfx/step-02.mp3',0.15],
  open:['/assets/audio/sfx/open-01.mp3',0.5],
  sparkle:['/assets/audio/sfx/twinkle-03.mp3',0.4],
};
// A judged choice: it fits (a bright chime) or is worth another try (a soft questioning tone). UI lane.
const ANSWER_SOUNDS={
  correct:['/assets/audio/sfx/correct-01.mp3',0.3],
  retry:['/assets/audio/sfx/retry-01.mp3',0.3],
};
const ANSWER_TONES={correct:[620,930,.13,.035,'sine'],retry:[340,270,.15,.03,'triangle']};
const sampleOf=key=>MAP_SOUNDS[key]??CARD_SOUNDS[key]??TRAIL_SOUNDS[key]??ANSWER_SOUNDS[key];
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
export function preloadTrailSounds(){if(effectsEnabled)for(const key of Object.keys(TRAIL_SOUNDS))loadSample(key);}
export function preloadAnswerSounds(){if(effectsEnabled)for(const key of Object.keys(ANSWER_SOUNDS))loadSample(key);}
const audible=()=>effectsEnabled&&!globalThis.document?.hidden&&activated();
// Starts a decoded sample and returns its voice; the caller decides which lane holds it. delay: seconds from now.
function startSample(key,gain,rate=1,delay=0){
  const buffer=samples.get(key),AudioContext=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext;
  if(!buffer||!AudioContext)return null;
  try{
    context ||= new AudioContext();
    if(context.state==='suspended')void context.resume().catch(()=>{});
    const tone=context.createBufferSource(),volume=context.createGain();
    tone.buffer=buffer;volume.gain.value=gain;
    if(rate!==1&&tone.playbackRate)tone.playbackRate.value=rate;
    tone.connect(volume);volume.connect(effectsOut());
    if(delay)tone.start(context.currentTime+delay);else tone.start();
    return {tone,volume,sample:true};
  }catch{return null;}
}
const release=({tone,volume})=>{tone.disconnect();volume.disconnect();};
// Combat lane: the newest four ring together; a fifth lets the oldest go.
function ring(voice){
  ringing.push(voice);
  while(ringing.length>RING_MAX)hush(ringing.shift());
  voice.tone.onended=()=>{release(voice);ringing=ringing.filter(other=>other!==voice);};
}
const MAP_TONES={swing:[300,520,.08,.03,'sine'],hit1:[390,235,.09,.05,'sine'],hit2:[470,205,.16,.07,'triangle'],finish:[670,310,.28,.05,'sine'],contact:[210,133,.12,.05,'triangle']};
// kind: swing (button pressed), hit (strike lands; hits 1 or 2), finish (third strike), exit, appear, contact, victory.
export function playMapEncounter(kind,hits){
  const key=kind==='hit'?(hits===2?'hit2':'hit1'):kind;
  const entry=MAP_SOUNDS[key]??CARD_SOUNDS[key];
  if(!entry||!audible())return;
  // The full-set card jingle already celebrates the last villain, so the separate victory jingle stays out of its way.
  if(key==='victory'&&cardSetRang)return;
  if(!samples.get(key)){loadSample(key);if(MAP_TONES[key])chirp(...MAP_TONES[key]);return;}
  const voice=startSample(key,entry[1]);if(!voice)return;
  if(key==='card-complete')cardSetRang=true;
  ring(voice);
}
// name: whoosh, reveal, epic, slot, complete. 'complete' is the celebration for the last villain as well (see 'victory').
export function playCardSound(name){playMapEncounter('card-'+name);}
// One step of the walk on the map. The two samples take turns at a slightly different speed each time (±6 %),
// half as loud while a voice is speaking. Nothing else is cut by a step and a step is cut by nothing else.
export function playFootstep(){
  if(!audible())return;
  const key=stepTurn++%2?'step2':'step1';
  if(!samples.get(key)){loadSample(key);return;}
  if(stepVoice)hush(stepVoice);
  const voice=stepVoice=startSample(key,sampleOf(key)[1]*(musicDucks.size?.5:1),.94+Math.random()*.12);
  if(voice)voice.tone.onended=()=>{release(voice);if(stepVoice===voice)stepVoice=null;};
}
// A place on the map opens: a soft latch, then small bells 0.12 s later (combat and reward lane).
// A voice that would start with it waits for the latch: voiceLeadMs().
export function playStageOpen(){
  if(!audible())return;
  if(!samples.get('open')){loadSample('open');loadSample('sparkle');return;}
  const latch=startSample('open',sampleOf('open')[1]);if(!latch)return;
  ring(latch);leadUntil=Date.now()+300;
  const bells=startSample('sparkle',sampleOf('sparkle')[1],1,.12);if(bells)ring(bells);
}
export const voiceLeadMs=()=>Math.max(0,leadUntil-Date.now());
// right: the choice fits. Otherwise a gentle cue to look again. It replaces the click that led to it.
export function playAnswer(right){
  const key=right?'correct':'retry';
  if(!audible())return;
  if(!samples.get(key)){loadSample(key);chirp(...ANSWER_TONES[key]);return;}
  stopClick();
  const voice=startSample(key,sampleOf(key)[1]);if(!voice)return;
  currentClick=voice;
  voice.tone.onended=()=>{release(voice);if(currentClick===voice)currentClick=null;};
}
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
    tone.connect(volume);volume.connect(effectsOut());tone.start(now);tone.stop(now+length+.005);
    tone.onended=()=>{tone.disconnect();volume.disconnect();if(currentClick?.tone===tone)currentClick=null;};
  }catch{stopClick();/* Keep controls usable on browsers without audio support. */}
}
// A single first-completion phrase. It replaces the click that led to it and rings in the reward lane,
// so the next button press does not cut it short.
export function playReward(){
  if(!effectsEnabled||globalThis.document?.hidden)return;
  const AudioContext=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext;if(!AudioContext)return;
  try{context ||= new AudioContext();stopClick();if(context.state==='suspended')void context.resume().catch(()=>{});
    const tone=context.createOscillator(),volume=context.createGain(),now=context.currentTime;tone.type='sine';
    [523.25,659.25,783.99,1046.5].forEach((frequency,i)=>tone.frequency.setValueAtTime(frequency,now+i*.12));
    volume.gain.setValueAtTime(0,now);volume.gain.linearRampToValueAtTime(.045,now+.02);volume.gain.setValueAtTime(.035,now+.4);volume.gain.exponentialRampToValueAtTime(.0001,now+.7);
    tone.connect(volume);volume.connect(effectsOut());tone.start(now);tone.stop(now+.72);ring({tone,volume});
  }catch{/* The reward itself never depends on its sound. */}
}

globalThis.document?.addEventListener('visibilitychange',()=>{
  syncMusic();
  if(document.hidden){stopEffects();if(context?.state==='running')void context.suspend().catch(()=>{});}
});
