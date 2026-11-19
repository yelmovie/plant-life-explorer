// 소리 2차 추가 규칙(2026-11-19): 악당 대사와 다른 대사의 차례, 말풍선은 음성이 끝날 때까지, 카드는 퇴장 대사 뒤.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

let moduleId=0;
async function voiceFixture(t){
 const original=Object.getOwnPropertyDescriptor(globalThis,'Audio');
 t.after(()=>{if(original)Object.defineProperty(globalThis,'Audio',original);else delete globalThis.Audio;});
 const made=[];
 class Audio{
  constructor(src){this.src=src;this.paused=true;made.push(this);}
  play(){this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
  removeAttribute(){this.src='';}
  load(){}
 }
 Object.defineProperty(globalThis,'Audio',{configurable:true,value:Audio});
 const voice=await import(`../src/voice-lines.js?turns=${++moduleId}`);
 t.after(()=>voice.stopVoice());
 return {voice,made,guide:'잎을 살펴보고, 같은 특징끼리 모아 줘.',hit:'앗, 내 가짜 표찰이 돌아갔어!',exit:'쳇, 표본 기록은 돌려줄게!'};
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const thiefLine={villain:true};

test('악당의 타격 대사는 타격음 0.3초 뒤에 시작하고 말하는 동안을 알려 준다',async t=>{
 const {voice,made,exit}=await voiceFixture(t);
 const said=voice.speakTexts([exit],undefined,{villain:true,delay:300});
 assert.equal(made.length,0,'바로 시작하지 않는다');
 assert.equal(said(),true,'곧 나올 대사도 말하는 중으로 본다');assert.equal(voice.villainLineOn(),true);
 await pause(340);
 assert.equal(made.length,1);assert.match(made[0].src,/thief-leaf-4\.mp3$/);assert.equal(made[0].paused,false);assert.equal(said(),true);
 made[0].onended();
 assert.equal(said(),false,'음성이 끝나면 말풍선도 제 시간으로');assert.equal(voice.villainLineOn(),false);
 assert.equal(voice.speakTexts(['음성이 없는 말'],undefined,thiefLine)(),false,'음성이 없으면 말풍선은 지금 시간 그대로');
});

test('시작된 악당 대사를 안내 음성이 끊지 않고 끝난 뒤에 이어 말한다(최대 2초)',async t=>{
 const {voice,made,guide,hit}=await voiceFixture(t);
 voice.speakTexts([hit],undefined,thiefLine);const thief=made[0];
 voice.speakTexts([guide]);
 assert.equal(thief.paused,false,'악당 대사를 끊지 않는다');assert.equal(made.length,1);
 await pause(250);assert.equal(made.length,1,'악당 대사가 끝나기를 기다린다');
 thief.onended();await pause(150);
 assert.equal(made.length,2);assert.match(made[1].src,/lipi-0-goal\.mp3$/);assert.equal(made[1].paused,false);
 // 2초가 지나도 안 끝나면 안내 음성이 차례를 가져간다.
 made[1].onended();voice.speakTexts([hit],undefined,thiefLine);const slow=made[2];voice.speakTexts([guide]);
 await pause(1850);assert.equal(slow.paused,false);
 await pause(350);assert.equal(slow.paused,true);assert.equal(made.length,4);
 // 기다리는 동안 창을 닫으면(stopVoice) 미뤄 둔 안내 음성은 나오지 않는다.
 made[3].onended();voice.speakTexts([hit],undefined,thiefLine);voice.speakTexts([guide]);voice.stopVoice();await pause(250);
 assert.equal(made.length,5,'미뤄 둔 음성이 취소된다');
});

test('악당의 짧은 대사는 다른 인물 대사를 끊지 않고 건너뛴다. 악당 대사끼리는 새 대사가 잇는다',async t=>{
 const {voice,made,guide,hit,exit}=await voiceFixture(t);
 voice.speakTexts([guide]);const lipi=made[0];
 const skipped=voice.speakTexts([hit],undefined,thiefLine);
 assert.equal(lipi.paused,false);assert.equal(made.length,1);assert.equal(skipped(),false);assert.equal(voice.villainLineOn(),false);
 lipi.onended();
 const first=voice.speakTexts([hit],undefined,thiefLine);voice.speakTexts([exit],undefined,thiefLine);
 assert.equal(made.length,3);assert.equal(made[1].paused,true);assert.equal(made[2].paused,false);
 assert.equal(first(),false,'지나간 대사의 말풍선은 제 시간으로');
 // 방금 닫힌 창의 대사는 끝난 것으로 본다(닫힘 이벤트는 한 박자 뒤에 온다): 지도에 돌아오자마자 하는 악당 대사가 빠지지 않는다.
 const stubs={document:{hidden:false,addEventListener(){}},window:{addEventListener(){}}},before=Object.fromEntries(Object.keys(stubs).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 for(const [key,value] of Object.entries(stubs))Object.defineProperty(globalThis,key,{configurable:true,value});
 t.after(()=>{for(const [key,descriptor] of Object.entries(before)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
 let closed=()=>{};const popup={open:true,addEventListener(type,fn){if(type==='close')closed=fn;}};voice.installVoiceLines(popup);
 voice.stopVoice();voice.speakTexts([guide]);const reading=made.at(-1);
 assert.equal(voice.speakTexts([hit],undefined,thiefLine)(),false,'창이 열려 있으면 건너뛴다');assert.equal(reading.paused,false);
 popup.open=false;
 const arriving=voice.speakTexts([hit],undefined,{villain:true,delay:300});assert.equal(reading.paused,true);assert.equal(arriving(),true);
 closed();assert.equal(arriving(),true,'뒤늦게 온 창 닫힘이 악당 대사를 지우지 않는다');
 await pause(340);assert.match(made.at(-1).src,/thief-leaf-2\.mp3$/);assert.equal(made.at(-1).paused,false);
 // 창이 닫히면 그 창의 대사와, 악당 대사 뒤를 기다리던 창의 대사는 멈춘다.
 popup.open=true;voice.speakTexts([guide]);const count=made.length;popup.open=false;closed();await pause(250);
 assert.equal(made.length,count,'기다리던 창의 대사는 나오지 않는다');assert.equal(made.at(-1).paused,false,'악당 대사는 끝까지');
 made.at(-1).onended();voice.speakTexts([guide]);closed();assert.equal(made.at(-1).paused,true,'창의 대사는 창과 함께 멈춘다');
 // 아직 시작하지 않은(0.3초 기다리는) 악당 대사는 안내 음성에 차례를 내준다.
 voice.stopVoice();voice.speakTexts([hit],undefined,{villain:true,delay:300});voice.speakTexts([guide]);
 assert.match(made.at(-1).src,/lipi-0-goal\.mp3$/);await pause(340);assert.match(made.at(-1).src,/lipi-0-goal\.mp3$/);
});

test('말풍선은 음성이 끝날 때까지, 카드는 퇴장 대사 뒤, 파이널 창은 카드 뒤',()=>{
 const read=file=>readFileSync(new URL(`../src/${file}`,import.meta.url),'utf8');
 const map=read('map-encounters.js'),cards=read('achievement-cards.js'),app=read('app.js'),stage=read('stage-map.js'),village=read('village-encounters.js');
 assert.match(map,/const VOICE_LEAD=300,VOICE_TAIL=200,VOICE_CAP=6000;/);
 assert.ok(map.includes('if(foe.voiced){if(now<foe.voiceCap&&foe.voiced())foe.saidUntil=Math.max(foe.saidUntil,Math.min(now+VOICE_TAIL,foe.voiceCap));else foe.voiced=null;}'));
 assert.ok(map.includes('time+(n===HITS?2750:1800),VOICE_LEAD);'),'타격 판정과 말풍선 기본 시간은 그대로, 음성만 0.3초 뒤');
 assert.ok(map.includes('const WINDUP=90,EXIT_SOUND=280,APPEAR_SETTLE=700;')&&map.includes('const REPEAT=380;'),'타격 간격·퇴장음 시각은 바꾸지 않는다');
 assert.ok(map.includes('if(finaleAt&&now>=finaleAt&&!stop&&!finaleHold()){finaleAt=0;'));
 assert.ok(cards.includes('if(speaking()&&onMap()){setTimeout(turn,150);return;}'));
 assert.ok(cards.includes('export const rewardCardPending=()=>flying.size>0;'));
 assert.ok(app.includes("()=>!!document.querySelector('dialog[open]'),villainLineOn);},hold:rewardCardDue,finaleHold:rewardCardPending,"));
 assert.ok(stage.includes('finaleHold:encounterOptions.finaleHold,'));
 assert.ok(village.includes('finaleHold,'));
});
