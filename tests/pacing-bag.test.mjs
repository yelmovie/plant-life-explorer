import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,testDesign,testValid,designKey} from '../src/model.js';
import {fieldMissionAction} from '../src/field-missions.js';
import {fieldMissionReady} from '../src/field-missions-state.js';
import {carryFieldEvidence} from '../src/field-bridge.js';
import {learningAction} from '../src/learning.js';
import {observationRecord,notebookEntry} from '../src/research-notebook.js';
import {mountBagHands} from '../src/field-hands-bag.js';

function comparedCover(){
 const s=freshState(),u={};s.page=8;
 const act=(action,id='')=>fieldMissionAction(s,u,action,id);
 act('field-bag-predict','cover');act('field-bag-part','surface:lotus');act('field-bag-part','cover:flap');act('field-bag-test');
 act('field-bag-part','cover:open');act('field-bag-test');act('field-bag-compare','cover');act('field-bag-deliver');
 return {s,u,act};
}

test('완성 가방부터 시험해도 한 부품 비교 뒤 같은 시험을 반복하지 않고 기록을 이어 쓴다',()=>{
 const {s,u,act}=comparedCover();
 assert.equal(fieldMissionReady(s,4),true);assert.equal(s.fieldEvidence.bag.tests.length,2);
 assert.equal(s.fieldEvidence.bag.design.cover,'open');assert.doesNotMatch(u.fieldMission.feedback,/가방 완성!/);
 carryFieldEvidence(s,4);assert.equal(s.tests.length,2);assert.equal(testValid(s),false);
 s.design.linked=true;s.design.surface='plain';s.tests.push(testDesign(s.design));
 learningAction(s,u,'test-explain','surface');assert.equal(testValid(s),false,'겉면과 입구 역할을 알아도 젖는 가방은 최종 완성이 아니다');
 s.design={...s.design,surface:'lotus',cover:'flap'};s.activeTestKey=designKey(s.design);
 assert.equal(testValid(s),true);assert.equal(s.tests.length,3,'이미 시험한 완성 설계를 골라 같은 비를 반복하지 않는다');
 act('field-bag-part','cover:flap');act('field-bag-deliver');
 assert.equal(fieldMissionReady(s,4),false,'현재 설계를 시험하지 않은 상태의 비교 전달은 거부한다');
});

test('연구노트는 이어받은 시험과 역할을 한 번만 보이고 실제 추가 시험은 보존한다',()=>{
 const {s,u}=comparedCover();carryFieldEvidence(s,4);
 s.design.surface='plain';s.tests.push(testDesign(s.design));learningAction(s,u,'test-explain','surface');
 let rows=observationRecord(s,4);
 assert.equal(rows.filter(row=>/시험 \d/.test(row)).length,3);assert.equal(rows.filter(row=>/비교한 역할/.test(row)).length,2);
 assert.doesNotMatch(rows.join('\n'),/주머니/);assert.match(rows.join('\n'),/입구 열림.*공책 젖음/);
 s.tests.push(testDesign(s.design));rows=observationRecord(s,4);
 assert.equal(rows.filter(row=>/시험 \d/.test(row)).length,4,'학생이 실제로 다시 한 시험을 복사 기록으로 지우지 않는다');
});

test('잎 관찰 문답을 반복하지 않은 기록도 실제 현장 관찰과 새 표본 분류를 노트에 표시한다',()=>{
 const s=freshState();s.fieldEvidence.leaves.scans.maple=['shape','edge'];
 s.fieldEvidence.leaves.edge={maple:'yes',pine:'no',camellia:'yes'};s.fieldEvidence.leaves.narrow={maple:'no',pine:'yes',camellia:'no'};
 s.rule='edge';s.groups={cherry:'yes',ginkgo:'no',grass:'no'};s.groupsByRule.edge={...s.groups};s.completed[0]=s.completed[1]=true;
 const rows=observationRecord(s,0);
 assert.equal(rows.filter(row=>/관찰 기록/.test(row)).length,2);assert.equal(rows.filter(row=>/분류:/.test(row)).length,9);
 assert.match(notebookEntry(s,0).body,/관찰 2곳 · 분류 9개/);assert.match(rows.join('\n'),/벚나무 · 새 표본 분류/);
 assert.doesNotMatch(rows.join('\n'),/은행나무 · 모양 관찰 기록/,'하지 않은 관찰을 만들어 내지 않는다');
});

test('비 애니메이션 중 화면을 정리하면 늦게 끝난 빗방울도 시험 기록을 만들지 않는다',t=>{
 const pending=new Map(),animations=[],actions=[];let timerId=0;
 t.mock.method(globalThis,'setTimeout',fn=>{pending.set(++timerId,fn);return timerId;});
 t.mock.method(globalThis,'clearTimeout',id=>pending.delete(id));
 const stubGlobal=(name,value)=>{const old=Object.getOwnPropertyDescriptor(globalThis,name);Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});t.after(()=>{if(old)Object.defineProperty(globalThis,name,old);else delete globalThis[name];});};
 const element=()=>({style:{},dataset:{},listeners:new Map(),classList:{add(){},remove(){},contains(){return false;}},append(){},remove(){},
  getBoundingClientRect:()=>({left:0,top:0,width:300,height:200}),
  addEventListener(type,fn){this.listeners.set(type,fn);},removeEventListener(type){this.listeners.delete(type);},
  animate(){const animation={onfinish:null,cancelled:false,cancel(){this.cancelled=true;}};animations.push(animation);return animation;}});
 const cloud=element(),canvas=element(),count=element(),art=element(),stage=element();stage.dataset.rain='go';
 canvas.querySelector=()=>art;stage.querySelector=selector=>({'[data-bag-cloud]':cloud,'[data-bag-canvas]':canvas,'[data-rain-count]':count})[selector];
 const root={querySelector:selector=>selector==='[data-bag-stage][data-rain]'?stage:null,querySelectorAll:()=>[]};
 stubGlobal('matchMedia',()=>({matches:false}));stubGlobal('document',{createElement:element});
 const cleanup=mountBagHands(root,{},(...args)=>actions.push(args));
 cloud.listeners.get('pointerdown')({button:0,preventDefault(){},stopPropagation(){}});
 for(const [id,fn] of [...pending]){pending.delete(id);fn();}
 assert.equal(animations.length,10);const lateFinish=animations.map(animation=>animation.onfinish);
 cleanup();assert.equal(pending.size,0);assert.ok(animations.every(animation=>animation.cancelled&&animation.onfinish===null));
 lateFinish.forEach(finish=>finish());
 assert.equal(pending.size,0,'정리 후 완료 콜백이 새 타이머를 만들지 않는다');assert.deepEqual(actions,[]);
});
