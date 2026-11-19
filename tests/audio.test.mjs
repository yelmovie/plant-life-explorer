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
 for(const [input,expected] of [[-20,0],[120,100],[NaN,25]]){audio.setMusicVolume(input);assert.equal(audio.getMusicVolume(),expected);}
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

test('지도 전투 효과음은 효과음 설정을 따르고 샘플이 없으면 합성음으로 대신한다',async t=>{
 const {audio,contexts,storage}=await audioFixture(t);
 const fetchDescriptor=Object.getOwnPropertyDescriptor(globalThis,'fetch');
 t.after(()=>{if(fetchDescriptor)Object.defineProperty(globalThis,'fetch',fetchDescriptor);else delete globalThis.fetch;});
 const requested=[],sources=[];
 globalThis.fetch=async url=>{requested.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};};
 window.OfflineAudioContext=class {decodeAudioData(){return Promise.resolve({duration:.2});}};
 window.AudioContext.prototype.createBufferSource=function(){const source={connect(){},start(){this.started=true;},stop(){},disconnect(){}};sources.push(source);return source;};
 audio.playMapEncounter('swing',1);
 assert.equal(contexts[0].tones.length,1,'처음 한 번은 합성음으로 바로 반응한다');
 audio.preloadMapSounds();await new Promise(resolve=>setTimeout(resolve,0));
 assert.ok(requested.every(url=>url.startsWith('/assets/audio/sfx/')&&url.endsWith('.mp3')));
 assert.equal(new Set(requested).size,8,'역할마다 한 번만 받는다');
 for(const [kind,hits] of [['swing',1],['hit',1],['hit',2],['finish',3],['exit',3],['appear',0],['contact',0],['victory',3]])audio.playMapEncounter(kind,hits);
 assert.equal(sources.length,8);assert.ok(sources.every(source=>source.started&&source.buffer));
 audio.playMapEncounter('unknown',0);assert.equal(sources.length,8);
 audio.setEffects(false);assert.equal(storage.get(audio.SOUND_KEY),'off');
 audio.playMapEncounter('hit',1);assert.equal(sources.length,8,'효과음을 끄면 지도 전투음도 나지 않는다');
});

const settle=()=>new Promise(resolve=>setTimeout(resolve,300));
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<.002,`${message??'음량'}: ${actual} ≠ ${expected}`);

test('대사 중에는 배경 음악을 멈추지 않고 1/4로 줄이며 모든 대사가 끝나야 되돌린다',async t=>{
 const {audio,media}=await audioFixture(t);audio.unlockMusic();const player=media[0];
 assert.equal(audio.getMusicVolume(),25,'저장된 값이 없으면 25에서 시작한다');
 assert.equal(player.volume,0,'시작은 무음에서 올라온다');await settle();near(player.volume,.25,'평소');
 const pauses=player.pauses,popup=audio.duckMusic(),bubble=audio.duckMusic();
 assert.equal(player.paused,false,'대사 때 멈추지 않는다');assert.ok(player.volume>.0625,'한 번에 뚝 떨어지지 않는다');
 await settle();near(player.volume,.0625,'대사 중');assert.equal(player.pauses,pauses);
 audio.playMusic('main');audio.unlockMusic();near(player.volume,.0625,'화면 갱신이 줄임을 풀지 않는다');
 popup();popup();await settle();near(player.volume,.0625,'다른 대사가 남아 있다');
 audio.setMusicVolume(60);near(player.volume,.15,'줄인 동안 크기를 바꾸면 줄인 크기로');
 bubble();await settle();near(player.volume,.6,'모두 끝나면 평소 크기');
 const late=audio.duckMusic();audio.setMusic(false);assert.equal(player.paused,true);late();
 audio.setMusic(true);await settle();near(player.volume,.6,'꺼진 동안 끝난 대사의 줄임이 남지 않는다');
});

test('영상은 대사 줄임과 별개로 배경 음악을 멈춘다',async t=>{
 const {audio,media}=await audioFixture(t);audio.unlockMusic();const player=media[0];await settle();
 const voice=audio.duckMusic(),film=audio.suspendMusic();assert.equal(player.paused,true);
 voice();assert.equal(player.paused,true,'대사가 끝나도 영상 정지는 남는다');
 film();assert.equal(player.paused,false);await settle();near(player.volume,.25);
});

test('지도 파이널 창이 열려 있는 동안 엔딩 곡, 닫으면 메인 테마',async t=>{
 const {audio,media,document,contexts}=await audioFixture(t);audio.unlockMusic();const player=media[0];player.currentTime=40;
 const finale=open=>document.dispatchEvent(new CustomEvent('map-finale',{detail:{open}}));
 audio.playClick();const jingle=contexts[0].tones[0];
 finale(true);
 assert.equal(player.src,audio.MUSIC_TRACKS.ending);assert.equal(player.currentTime,0);assert.equal(player.loop,false);assert.equal(player.paused,false);
 assert.equal(jingle.disconnected,undefined,'엔딩 곡이 나와도 나던 소리를 끊지 않는다');
 audio.playMusic('main');assert.equal(player.src,audio.MUSIC_TRACKS.ending,'지도 화면 갱신이 곡을 되돌리지 않는다');
 const voice=audio.duckMusic();await settle();near(player.volume,.0625,'파이널 곡도 대사 때 줄인다');voice();
 finale(false);assert.equal(player.src,audio.MUSIC_TRACKS.main);assert.equal(player.loop,true);assert.equal(player.paused,false);assert.equal(media.length,1);
 // 다시 열면 끝까지 들었던 엔딩 곡도 처음부터 다시 나온다.
 finale(true);player.paused=true;player.dispatchEvent(new Event('ended'));finale(false);finale(true);
 assert.equal(player.src,audio.MUSIC_TRACKS.ending);assert.equal(player.paused,false);
 finale(false);
 // 배경 음악이 꺼져 있으면 곡 없이 징글이 남는다.
 audio.setMusic(false);audio.playClick();const kept=contexts[0].tones.at(-1);finale(true);
 assert.equal(player.paused,true);assert.equal(kept.disconnected,undefined);finale(false);
});

test('효과음을 끄면 재생 중인 대사가 멈추도록 알린다',async t=>{
 const {audio,document}=await audioFixture(t);let told=0;
 document.addEventListener('sound-effects-off',()=>told++);
 audio.setEffects(true);assert.equal(told,0);
 audio.setEffects(false);assert.equal(told,1);
 audio.setSound(true);audio.setSound(false);assert.equal(told,2,'헤더 소리 끄기도 같다');
});

test('대사는 줄임 표식을 쓰고 첫 누름·키로 배경 음악을 연다',async()=>{
 const {readFileSync}=await import('node:fs');const read=file=>readFileSync(new URL(`../src/${file}`,import.meta.url),'utf8');
 const voice=read('voice-lines.js'),app=read('app.js'),finale=read('map-finale.js'),talk=read('character-dialogue.js'),story=read('story.js');
 assert.match(voice,/release=duckMusic\(\);/);assert.doesNotMatch(voice,/suspendMusic/);
 assert.match(voice,/document\.addEventListener\('sound-effects-off',stopVoice\);/);
 assert.match(talk,/document\.addEventListener\('sound-effects-off',stop,opt\);/);
 assert.match(app,/hold:\(\)=>\{stopFeedback\(\);return duckMusic\(\);\}/);assert.doesNotMatch(app,/suspendMusic/);
 assert.match(app,/document\.addEventListener\('pointerdown',unlockMusic,true\);document\.addEventListener\('keydown',unlockMusic,true\);/);
 assert.match(story,/const resumeMusic = suspendMusic\(\);/,'영상에는 곡이 섞여 있어 그대로 멈춘다');
 assert.match(finale,/video\.muted=true/);
 assert.match(finale,/new CustomEvent\('map-finale',\{detail:\{open\}\}\)\);announce\(true\);/);
 assert.match(finale,/dialog\.remove\(\);announce\(false\);/);
});

// --- 소리 2차(2026-11-19): 갈래 분리, 지도 발자국, 장소 열림, 정답·다시 소리, 엔딩 곡 뒤 잇기 ---
async function sampleFixture(t,initial){
 const fixture=await audioFixture(t,initial);
 const fetchDescriptor=Object.getOwnPropertyDescriptor(globalThis,'fetch');
 t.after(()=>{if(fetchDescriptor)Object.defineProperty(globalThis,'fetch',fetchDescriptor);else delete globalThis.fetch;});
 const sources=[];
 globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8),url});
 let decoded=0;
 window.OfflineAudioContext=class {decodeAudioData(){return Promise.resolve({duration:.2,id:++decoded});}};
 const context=window.AudioContext.prototype;
 context.createBufferSource=function(){const source={playbackRate:{value:1},stops:[],connect(gain){this.gain=gain;},start(at){this.startedAt=at??this.context.currentTime;},stop(at){this.stops.push(at);},disconnect(){},context:this};sources.push(source);return source;};
 context.createGain=function(){return {gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}},connect(){},disconnect(){}};};
 const {audio}=fixture;
 audio.preloadMapSounds();audio.preloadCardSounds();audio.preloadTrailSounds();audio.preloadAnswerSounds();
 await new Promise(resolve=>setTimeout(resolve,0));
 return {...fixture,sources};
}

test('전투·보상 소리는 겹쳐 나고 화면 조작음과 발자국에 끊기지 않는다',async t=>{
 const {audio,sources,contexts}=await sampleFixture(t);
 audio.playMapEncounter('swing',1);audio.playMapEncounter('hit',1);
 const [swing,hit]=sources;
 assert.deepEqual(swing.stops,[],'휘두르는 소리는 명중음 아래에서 계속 난다');
 audio.playClick();audio.playClick();audio.playDragSound('drop');audio.playAnswer(true);audio.playFootstep();audio.playFootstep();
 assert.deepEqual([swing.stops,hit.stops],[[],[]],'누르기·끌기·정답 소리와 발자국이 타격음을 끊지 않는다');
 audio.playCardSound('whoosh');audio.playCardSound('reveal');audio.playCardSound('slot');
 assert.equal(swing.stops.length,1,'다섯 번째 소리가 오면 가장 오래된 것부터 물러난다');
 assert.deepEqual(hit.stops,[]);
 audio.stopFeedback();assert.deepEqual(hit.stops,[],'대사가 시작돼도 전투·보상 소리는 남는다');
 audio.setEffects(false);
 assert.equal(hit.stops.length,1,'효과음을 끄면 모든 갈래가 멈춘다');
 assert.equal(contexts[0].state,'suspended');
});

test('화면 조작음 갈래는 한 번에 하나: 정답 소리는 누르는 소리를 대신하고 다음 누름에 물러난다',async t=>{
 const {audio,sources,contexts}=await sampleFixture(t);
 audio.playClick();const click=contexts[0].tones[0];
 audio.playAnswer(true);assert.equal(click.disconnected,1);
 const right=sources.at(-1);assert.equal(right.gain.gain.value,.3);
 audio.playAnswer(false);assert.equal(right.stops.length,1);assert.equal(sources.length,2);
 audio.playClick();assert.equal(sources[1].stops.length,1);
 audio.setEffects(false);audio.playAnswer(true);assert.equal(sources.length,2,'효과음을 끄면 나지 않는다');
});

test('카드 완성 징글이 났으면 따로 둔 승리 징글은 내지 않는다',async t=>{
 const {audio,sources}=await sampleFixture(t);
 audio.playMapEncounter('victory',3);assert.equal(sources.length,1,'카드가 없는 경로에서는 승리 징글이 난다');
 audio.playCardSound('complete');assert.equal(sources.length,2);
 audio.playMapEncounter('victory',3);assert.equal(sources.length,2);
 assert.deepEqual(sources[1].stops,[],'카드 완성 징글은 끊기지 않는다');
});

test('지도 발자국은 두 소리를 번갈아 ±6% 속도로 내고 대사 중에는 절반 크기다',async t=>{
 const {audio,sources}=await sampleFixture(t);
 for(let i=0;i<6;i++)audio.playFootstep();
 assert.equal(sources.length,6);
 assert.equal(new Set(sources.map(source=>source.buffer.id)).size,2,'두 파일');
 assert.notEqual(sources[0].buffer.id,sources[1].buffer.id,'번갈아');assert.equal(sources[0].buffer.id,sources[2].buffer.id);
 for(const source of sources){assert.ok(source.playbackRate.value>=.94&&source.playbackRate.value<=1.06);assert.equal(source.gain.gain.value,.15);}
 assert.equal(sources[0].stops.length,1,'발자국끼리는 한 번에 하나');
 const voice=audio.duckMusic();audio.playFootstep();assert.equal(sources.at(-1).gain.gain.value,.075);
 voice();audio.playFootstep();assert.equal(sources.at(-1).gain.gain.value,.15);
 const count=sources.length;
 document.hidden=true;audio.playFootstep();document.hidden=false;
 audio.setEffects(false);audio.playFootstep();
 assert.equal(sources.length,count,'탭을 숨겼거나 효과음을 끄면 나지 않는다');
});

test('장소가 열리면 잠금 풀리는 소리 뒤 0.12초에 반짝 소리가 겹치고 이어지는 대사는 0.3초 기다린다',async t=>{
 const {audio,sources,contexts}=await sampleFixture(t);
 assert.equal(audio.voiceLeadMs(),0);
 audio.playMapEncounter('hit',1);audio.playStageOpen();
 const [hit,latch,bells]=sources;assert.equal(sources.length,3);
 assert.equal(latch.startedAt,contexts[0].currentTime);near(bells.startedAt-latch.startedAt,.12,'반짝 소리 시각');
 assert.deepEqual([latch.gain.gain.value,bells.gain.gain.value],[.5,.4]);
 assert.deepEqual(hit.stops,[],'전투·보상 갈래라 다른 소리를 끊지 않는다');
 assert.ok(audio.voiceLeadMs()>250&&audio.voiceLeadMs()<=300);
 audio.playClick();assert.deepEqual(latch.stops,[],'누르는 소리에 끊기지 않는다');
 audio.setEffects(false);audio.playStageOpen();assert.equal(sources.length,3);
});

test('엔딩 곡이 끝나면 엔딩 화면에 머무는 동안 메인 테마를 0.45배로 잇고 떠나면 평소 크기로 돌아간다',async t=>{
 const {audio,media}=await audioFixture(t);audio.playMusic('ending');audio.unlockMusic();const player=media[0];await settle();near(player.volume,.25);
 player.paused=true;player.dispatchEvent(new Event('ended'));
 assert.equal(player.src,audio.MUSIC_TRACKS.main,'무음으로 두지 않는다');assert.equal(player.loop,true);assert.equal(player.paused,false);
 await settle();near(player.volume,.1125,'평소의 0.45배');
 const plays=player.plays;audio.playMusic('ending');audio.unlockMusic();assert.equal(player.plays,plays,'화면 갱신이 곡을 다시 시작하지 않는다');
 const voice=audio.duckMusic();await settle();near(player.volume,.028125,'대사 중에는 여기서 다시 1/4');voice();
 audio.setMusicVolume(40);near(player.volume,.18);
 player.currentTime=9;audio.playMusic('main');assert.equal(player.currentTime,9,'떠날 때 메인 테마를 처음부터 다시 틀지 않는다');
 await settle();near(player.volume,.4,'평소 크기');
 audio.playMusic('ending',true);assert.equal(player.src,audio.MUSIC_TRACKS.ending,'다시 보기는 엔딩 곡을 처음부터');
});

test('지도 파이널 창: 엔딩 곡이 끝나면 메인 테마 0.45배, 징글이 나는 중이면 곡을 천천히 올린다',async t=>{
 const {audio,media,document,sources}=await sampleFixture(t);audio.unlockMusic();const player=media[0];await settle();
 const finale=open=>document.dispatchEvent(new CustomEvent('map-finale',{detail:{open}}));
 audio.playCardSound('complete');const jingle=sources.at(-1);finale(true);
 assert.equal(player.src,audio.MUSIC_TRACKS.ending);assert.equal(player.volume,0);
 assert.deepEqual(jingle.stops,[],'카드 완성 징글을 끊지 않는다');
 await settle();assert.ok(player.volume>.02&&player.volume<.12,`0.3초 뒤에도 아직 올라오는 중: ${player.volume}`);
 await new Promise(resolve=>setTimeout(resolve,1100));near(player.volume,.25,'1.2초에 걸쳐 평소 크기');
 player.paused=true;player.dispatchEvent(new Event('ended'));
 assert.equal(player.src,audio.MUSIC_TRACKS.main);await settle();near(player.volume,.1125,'창에 머무는 동안');
 finale(false);await settle();near(player.volume,.25,'닫으면 평소 크기');assert.equal(player.src,audio.MUSIC_TRACKS.main);
 jingle.onended();finale(true);assert.equal(player.src,audio.MUSIC_TRACKS.ending,'다시 열면 엔딩 곡을 처음부터');
 await settle();near(player.volume,.25,'징글이 없으면 0.2초 전환');finale(false);
});

test('지도 걷기·장소 열림·정답 소리가 화면 코드에 연결되어 있다',async()=>{
 const {readFileSync}=await import('node:fs');const read=file=>readFileSync(new URL(`../src/${file}`,import.meta.url),'utf8');
 const app=read('app.js'),map=read('stage-map.js'),village=read('village-encounters.js'),css=read('stage-map.css');
 assert.match(map,/const STEP_MS=290;/);assert.match(css,/animation:map-walk \.28s/,'걷는 그림의 한 번 흔들림과 같은 간격');
 assert.match(map,/if\(moved&&now-stepAt>=STEP_MS&&!document\.querySelector\('dialog\[open\]'\)\)\{stepAt=now;encounterOptions\.step\?\.\(\);\}/);
 assert.match(app,/tone:playMapEncounter,step:playFootstep\}\);/);
 assert.match(app,/if\(!open\.some\(\(now,i\)=>now&&!shownOpen\[i\]\)\|\|state\.adminUnlocked\|\|studentState!==null\)\{shownOpen=open;return;\}/,'교사용 미리보기는 소리 없이 연다');
 assert.match(app,/function render\(\)\{playMusic\(state\.screen==='ending'\?'ending':'main'\);soundNewPlaces\(\);soundJudged\(\);/);
 assert.match(app,/r\.phase!=='prediction'&&!key\.includes\('observed'\)/,'예상과 관찰 기록은 판정 소리를 내지 않는다');
 assert.match(village,/voice:speakLine,/);assert.match(village,/const wait=voiceLeadMs\(\);/);
});
