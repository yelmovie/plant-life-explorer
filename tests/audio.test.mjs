import {test} from 'node:test';
import assert from 'node:assert/strict';

let moduleId=0;
async function audioFixture(t,initial={}){
 const originals=Object.fromEntries(['localStorage','window','document'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 t.after(()=>{for(const [key,descriptor] of Object.entries(originals)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
 const storage=new Map(Object.entries(initial)),contexts=[],media=[];
 const document=new EventTarget();document.hidden=false;
 class Audio extends EventTarget{
  constructor(){super();this.paused=true;this.currentTime=0;this.plays=0;this.pauses=0;media.push(this);}
  play(){this.plays++;this.paused=false;return Promise.resolve();}
  pause(){this.pauses++;this.paused=true;}
 }
 class AudioContext{
  constructor(){this.state='running';this.currentTime=4;this.destination={};this.tones=[];this.suspends=0;this.resumes=0;contexts.push(this);}
  createOscillator(){const tone={frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},stops:[],connect(){},start(){},stop(at){this.stops.push(at);},disconnect(){this.disconnected=(this.disconnected||0)+1;}};this.tones.push(tone);return tone;}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
  suspend(){this.suspends++;this.state='suspended';return Promise.resolve();}
  resume(){this.resumes++;this.state='running';return Promise.resolve();}
 }
 Object.defineProperties(globalThis,{
  localStorage:{configurable:true,value:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}},
  window:{configurable:true,value:{AudioContext,Audio}},
  document:{configurable:true,value:document},
 });
 const audio=await import(`../src/audio.js?test=${++moduleId}`);
 return {audio,storage,contexts,document,media};
}

test('저장된 효과음 설정을 이어 쓰고 헤더 음소거는 실제 소리 상태를 따른다',async t=>{
 const {audio,storage,contexts}=await audioFixture(t,{'green-garden-sound':'off','green-garden-music':'on'});
 assert.equal(audio.soundStored(),true);
 assert.equal(audio.isSoundOn(),true);
 assert.equal(audio.isMusicOn(),true);
 assert.equal(audio.hasMusic(),true);
 assert.equal(contexts.length,0,'초기 화면에서는 오디오를 만들지 않는다');
 audio.setSound(true);
 assert.equal(audio.isEffectsOn(),true);
 assert.equal(audio.isSoundOn(),true);
 assert.equal(audio.isMusicOn(),true,'준비된 배경 음악 설정이 켜진다');
 assert.equal(storage.get(audio.SOUND_KEY),'on');
 audio.setSound(false);
 assert.equal(audio.isSoundOn(),false);
 assert.equal(storage.get(audio.SOUND_KEY),'off');
});

test('배경 음악 음량은 저장되며 효과음 켜짐 상태를 바꾸지 않는다',async t=>{
 const {audio,storage}=await audioFixture(t,{'green-garden-music-volume':'45'});
 assert.equal(audio.getMusicVolume(),45);
 audio.setMusicVolume(73);
 assert.equal(audio.getMusicVolume(),75);
 assert.equal(storage.get('green-garden-music-volume'),'75');
 audio.setEffects(false);audio.setMusicVolume(100);audio.setMusic(true);
 assert.equal(audio.isEffectsOn(),false);
 assert.equal(audio.isSoundOn(),true);
 for(const [input,expected] of [[-20,0],[120,100],[NaN,30]]){audio.setMusicVolume(input);assert.equal(audio.getMusicVolume(),expected);}
});

test('빠르게 여러 번 눌러도 이전 효과음이 겹쳐 남지 않는다',async t=>{
 const {audio,contexts}=await audioFixture(t);
 audio.playClick();audio.playClick();
 assert.equal(contexts.length,1,'오디오 컨텍스트는 재사용한다');
 const [first,second]=contexts[0].tones;
 assert.deepEqual(first.stops,[4.08,undefined]);
 assert.equal(first.disconnected,1);
 assert.equal(first.onended,null);
 assert.deepEqual(second.stops,[4.08]);
 audio.setEffects(false);
 assert.deepEqual(second.stops,[4.08,undefined]);
 audio.playClick();assert.equal(contexts[0].tones.length,2);
});

test('탭을 숨기면 효과음이 정지하고 다시 누르기 전에는 재생하지 않는다',async t=>{
 const {audio,contexts,document}=await audioFixture(t);
 audio.playClick();
 document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));
 assert.equal(contexts[0].state,'suspended');
 assert.deepEqual(contexts[0].tones[0].stops,[4.08,undefined]);
 audio.playClick();assert.equal(contexts[0].tones.length,1);
 document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));
 assert.equal(contexts[0].resumes,0,'화면 복귀만으로 효과음을 다시 틀지 않는다');
 audio.playClick();assert.equal(contexts[0].resumes,1);
 assert.equal(contexts[0].tones.length,2);
});

test('저장소나 오디오가 막혀 있어도 조작을 막지 않는다',async t=>{
 const {audio}=await audioFixture(t);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});
 window.AudioContext=class {constructor(){throw Error('unsupported');}};
 assert.doesNotThrow(()=>{audio.setSound(true);audio.playClick();audio.setMusicVolume(50);audio.setSound(false);});
 assert.equal(audio.soundStored(),false);
 assert.equal(audio.isSoundOn(),false);
});


test('메인·엔딩은 단일 플레이어를 공유하고 반복 렌더에서 곡을 처음부터 틀지 않는다',async t=>{
 const {audio,media}=await audioFixture(t);
 audio.playMusic('main');assert.equal(media.length,0,'첫 화면에서는 자동으로 재생하지 않는다');
 audio.unlockMusic();const player=media[0];assert.equal(media.length,1);assert.equal(player.src,audio.MUSIC_TRACKS.main);assert.equal(player.loop,true);
 player.currentTime=12;const count=player.plays;audio.playMusic('main');assert.equal(player.plays,count);assert.equal(player.currentTime,12);
 audio.playMusic('ending');assert.equal(media.length,1);assert.equal(player.src,audio.MUSIC_TRACKS.ending);assert.equal(player.currentTime,0);assert.equal(player.loop,false);assert.equal(player.paused,false);
 audio.setMusicVolume(65);assert.equal(player.volume,.65);
 audio.playMusic('main');assert.equal(media.length,1);assert.equal(player.loop,true);
});

test('영상이 열려 있는 동안 음소거 해제·화면 이동·중첩 영상 종료가 배경 음악을 켜지 않는다',async t=>{
 const {audio,media}=await audioFixture(t);audio.unlockMusic();const player=media[0];
 const closeIntro=audio.suspendMusic(),closeOutro=audio.suspendMusic();
 audio.playMusic('ending');audio.setSound(true);audio.unlockMusic();assert.equal(player.paused,true);
 closeIntro();assert.equal(player.paused,true,'다른 영상의 정지 요청이 남아 있다');
 closeOutro();assert.equal(player.paused,false);assert.equal(player.src,audio.MUSIC_TRACKS.ending);assert.equal(media.length,1);
});

test('엔딩 곡은 끝난 뒤 반복 렌더로 재시작하지 않으며 메인으로 돌아가면 전환한다',async t=>{
 const {audio,media}=await audioFixture(t);audio.playMusic('ending');audio.unlockMusic();const player=media[0];
 player.paused=true;player.dispatchEvent(new Event('ended'));const count=player.plays;
 audio.playMusic('ending');audio.unlockMusic();assert.equal(player.plays,count);
 audio.playMusic('main');assert.equal(player.paused,false);assert.equal(player.src,audio.MUSIC_TRACKS.main);
});

test('탭을 숨기면 음악이 멈추고 복귀 시 음소거 설정과 영상 정지를 유지한다',async t=>{
 const {audio,media,document}=await audioFixture(t);audio.unlockMusic();const player=media[0];player.currentTime=24;
 document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));assert.equal(player.paused,true);
 document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));assert.equal(player.paused,false);assert.equal(player.currentTime,24);
 audio.setMusic(false);document.dispatchEvent(new Event('visibilitychange'));assert.equal(player.paused,true);
 audio.setMusic(true);const resume=audio.suspendMusic();document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));assert.equal(player.paused,true);resume();assert.equal(player.paused,false);
});
