// 3초 규칙(2026-11-17): 한 화면에 지시 한 곳(리피 말풍선), 진행 알약 한 줄, 주 버튼 하나.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {freshState} from '../src/model.js';
import {renderActivity} from '../src/learning.js';
import {renderMissionBrief} from '../src/expedition.js';

const bubble=html=>/<p class="guide-bubble[^"]*"[^>]*>([\s\S]*?)<\/p><\/div>/.exec(html)?.[1]||'';
const field=i=>{const s=Object.assign(freshState(),{screen:'activity',page:2*i});s.journeyRequired[i]=true;return s;};

test('현장 임무의 지시 문장은 리피 말풍선에 한 번만 나오고 장면 안 문장은 숨김 표시된다',()=>{
 const html=renderActivity(field(4),{activityMode:'field'},()=>'');
 assert.match(bubble(html),/무엇을 바꾸면 될까/,'첫 예상 질문이 말풍선에 나온다');
 assert.match(html,/class="activity [^"]*scene-hint-moved/);
 const first=renderActivity(field(0),{activityMode:'field'},()=>'');
 assert.match(bubble(first),/반짝이는 곳.*톡 눌러/,'말풍선이 잎을 직접 누르라고 말한다');
 assert.match(first,/class="leaf-spark leaf-dot" data-spark="maple:shape"/,'누를 곳은 잎 위 점으로 보인다');
 assert.match(first,/<div class="lens-fallback"><button[^>]*data-field-drop="scan:maple:shape"/,'살펴보기 버튼은 키보드·버튼 방식 경로로만 남는다');
 assert.doesNotMatch(first,/leaf-tap-controls|objective-keys|버튼 보이기/);
});

test('제목과 여정 1·2·3은 가운데 위 알약 하나에 있고 주 버튼은 하나다',()=>{
 const html=renderActivity(field(0),{activityMode:'field'},()=>'');
 assert.match(html,/<header class="activity-pill"><h1>[^<]+<\/h1><nav class="mission-journey-root"/);
 assert.doesNotMatch(html,/field-guide|today-panel|인사 듣기/);
 assert.equal((html.match(/class="btn primary/g)||[]).length,1);
});

test('의뢰 편지는 세 줄 요약이고 팝업 배경은 0.3 이하 토큰 하나를 쓴다',async()=>{
 const brief=renderMissionBrief(freshState(),0);
 assert.equal((brief.match(/<p>/g)||[]).length,2);
 assert.doesNotMatch(brief,/letter-to|letter-from/);
 const style=await readFile(new URL('../src/style.css',import.meta.url),'utf8');
 const alpha=Number(/--scrim:rgb\([^/]+\/\s*([\d.]+)\)/.exec(style)?.[1]);
 assert.ok(alpha>0&&alpha<=.3,`scrim alpha ${alpha}`);
 for(const file of ['frame.css','character-dialogue.css']){
  const css=await readFile(new URL(`../src/${file}`,import.meta.url),'utf8');
  for(const rule of css.match(/::backdrop\s*\{[^}]*\}/g)||[])if(/background:/.test(rule))assert.match(rule,/var\(--scrim\)/,file);
 }
});

test('탐구 기록을 마치면 말풍선이 아래 주 버튼 이름을 그대로 부르고 왼쪽 목록은 완료 표시만 한다',()=>{
 const s=Object.assign(freshState(),{screen:'activity',page:0});s.completed[0]=true;
 const html=renderActivity(s,{activityMode:'explore'},()=>'');
 assert.match(html,/btn primary go-now/,'완료 기록으로 주 버튼이 열린다');
 assert.match(bubble(html),/<b>다음 기록을<\/b> 눌러 줘/);
 assert.doesNotMatch(html,/다음으로 가 보자/);
});

test('탐구 기록 중에는 손가락은 표식만 하고 누를 곳 이름은 말풍선이 말한다',async()=>{
 const s=Object.assign(freshState(),{screen:'activity',page:0});
 const html=renderActivity(s,{activityMode:'explore'},()=>'');
 assert.match(bubble(html),/<span class="bubble-next">[^<]*눌러 봐<\/span>/);
 const guide=await readFile(new URL('../src/next-step-guide.js',import.meta.url),'utf8');
 assert.doesNotMatch(guide,/<span class="guide-finger-tip">/);
});
