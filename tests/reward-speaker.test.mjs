import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8');

test('목소리가 실제로 나올 때만 말하는 중이라고 알린다',async()=>{
 const made=[];
 globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;made.push(this);}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}removeAttribute(){}load(){}};
 const {speakTexts,stopVoice}=await import('../src/voice-lines.js');
 const seen=[];
 speakTexts(['녹음이 없는 문장','잎을 살피고 두 기준으로 나눈 기록을 남겼어.','잎이 보이지 않는 겨울에도 식물은 살아 있을까?'],(index,audible)=>seen.push([index,audible]));
 assert.equal(made.length,1);
 assert.deepEqual(seen,[],'재생을 기다리는 동안에는 입이 움직이지 않는다');
 made[0].onplaying();made[0].onwaiting();made[0].onplaying();made[0].onended();
 assert.equal(made.length,2);
 made[1].onplaying();made[1].onended();
 assert.deepEqual(seen,[[1,true],[1,false],[1,true],[2,true],[-1,false]]);
 // 중간에 멈추면 바로 끝났다고 알리고, 늦게 온 재생 신호는 버린다.
 const late=[];
 speakTexts(['잎을 살피고 두 기준으로 나눈 기록을 남겼어.'],(index,audible)=>late.push([index,audible]));
 made[2].onplaying();stopVoice();
 assert.equal(made[2].onplaying,null);
 assert.deepEqual(late,[[0,true],[-1,false]]);
});

test('완료 팝업에 리피가 서서 음성 문장을 말한다',()=>{
 const app=read('src/app.js'),voice=read('src/voice-lines.js'),css=read('src/character-dialogue.css');
 assert.match(app,/class="npc-dialogue-portrait reward-lipi" role="img" aria-label="리피"/);
 assert.match(app,/<div class="reward-say"><b>리피<\/b><p class="reward-why">\$\{r\.why\}<\/p><p class="reward-next">\$\{EXPEDITIONS\[i\]\.next\}<\/p><\/div>/);
 assert.match(voice,/dialog\.dataset\.speaking=String\(audible\);/);
 assert.match(voice,/toggleAttribute\('data-voice-now',i===index\)/);
 assert.match(css,/dialog\.reward-dialog\[data-speaking="true"\] \.reward-lipi \{\s*animation: npc-dialogue-speech 840ms step-end infinite/);
 assert.match(css,/prefers-reduced-motion: reduce\) \{\s*body dialog\.reward-dialog \.reward-lipi, body dialog\.reward-dialog\[data-speaking="true"\] \.reward-lipi \{ animation: none; \}/);
});

test('작업판이 장면 높이에 맞춰 커진다',()=>{
 const css=read('src/frame.css');
 assert.match(css,/\.leaf-partner \.leaf-tile img \{ height: clamp\(64px, calc\(var\(--stage-h\) - 350px\), 300px\); \}/);
 assert.match(css,/\.habitat-compare-board \{ max-width: none; \}/);
 assert.match(css,/#app \.activity-2 \.season-scene \{ max-width: none; \}/);
 assert.match(css,/\.field-bag-predict \.bag-art \{ height: clamp\(220px, calc\(var\(--stage-h\) \* \.66\), 440px\); \}/);
 // 5장 설계는 가로 화면 전체에서, 시험은 글이 줄바꿈되지 않는 넓고 높은 화면에서만 키운다.
 assert.match(css,/\.design-layout \.learning-scene \.picture-parts \.part-card \{ min-height: 88px; \}/);
 assert.match(css,/@media \(min-width: 1200px\) and \(min-height: 780px\) and \(orientation: landscape\) \{\s*#app \.exploration-activity \.test-layout \.learning-scene \.test-record \{/);
});
