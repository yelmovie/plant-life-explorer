import {test} from 'node:test';
import assert from 'node:assert/strict';

let moduleId=0;
async function audioFixture(t,initial={}){
 const originals=Object.fromEntries(['localStorage','window','document'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 t.after(()=>{for(const [key,descriptor] of Object.entries(originals)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
 const storage=new Map(Object.entries(initial)),contexts=[];
 const document=new EventTarget();document.hidden=false;
 class AudioContext{
  constructor(){this.state='running';this.currentTime=4;this.destination={};this.tones=[];this.suspends=0;this.resumes=0;contexts.push(this);}
  createOscillator(){const tone={frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},stops:[],connect(){},start(){},stop(at){this.stops.push(at);},disconnect(){this.disconnected=(this.disconnected||0)+1;}};this.tones.push(tone);return tone;}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
  suspend(){this.suspends++;this.state='suspended';return Promise.resolve();}
  resume(){this.resumes++;this.state='running';return Promise.resolve();}
 }
 Object.defineProperties(globalThis,{
  localStorage:{configurable:true,value:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}},
  window:{configurable:true,value:{AudioContext}},
  document:{configurable:true,value:document},
 });
 const audio=await import(`../src/audio.js?test=${++moduleId}`);
 return {audio,storage,contexts,document};
}

test('저장된 효과음 설정을 이어 쓰고 헤더 음소거는 실제 소리 상태를 따른다',async t=>{
 const {audio,storage,contexts}=await audioFixture(t,{'green-garden-sound':'off','green-garden-music':'on'});
 assert.equal(audio.soundStored(),true);
 assert.equal(audio.isSoundOn(),false);
 assert.equal(audio.isMusicOn(),false);
 assert.equal(audio.hasMusic(),false);
 assert.equal(contexts.length,0,'초기 화면에서는 오디오를 만들지 않는다');
 audio.setSound(true);
 assert.equal(audio.isEffectsOn(),true);
 assert.equal(audio.isSoundOn(),true);
 assert.equal(audio.isMusicOn(),false,'없는 배경 음악을 켰다고 표시하지 않는다');
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
 assert.equal(audio.isSoundOn(),false);
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
