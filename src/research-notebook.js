import {assetImage} from './asset-catalog.js';
import {missionDone,terrainCount,inventionEvidence,PLANTS} from './model.js';
import {normalizeFieldEvidence,FIELD_BAG_ROLES,FIELD_LEAVES} from './field-missions-state.js';
import {BUD_TOTAL,budsFoundCount} from './winter-buds.js';

const ENTRIES = [
 {title:'잎 모양 탐정',subtitle:'작은 잎에서 찾은 다른 점',asset:'cherry_leaf',color:'leaf',saw:'벚나무·은행나무·강아지풀의 잎을 자세히 살펴봤다.',found:'잎은 모양과 가장자리가 서로 달랐다. 같은 기준으로 모으면 식물을 나눌 수 있었다.',try:'새로 만난 잎도 모양과 가장자리로 나눠 보고 싶다.'},
 {title:'겨울을 건너 봄으로',subtitle:'안 보여도 살아 있는 부분',asset:'cherry_seasons_v2',color:'flower',saw:'겨울 사진과 다음 봄 사진을 나란히 놓아 보았다.',found:'겨울에 잎이 없어도 살아 있는 줄기나 뿌리가 남았다. 봄이 되자 그곳에서 다시 자랐다.',try:'우리 학교 화단도 겨울과 봄에 같은 자리에서 찍어 보고 싶다.'},
 {title:'잎자루 속 공기 방',subtitle:'공기 방울이 알려 준 비밀',asset:'expedition_petiole_clear_20261023',color:'water',saw:'부레옥잠 잎자루 속 공간과 공기 방울을 살펴보았다.',found:'공기 방울이 나왔다! 잎자루 속 공기는 부레옥잠이 물에 뜨는 데 도움을 준다.',try:'식물마다 몸속에 무엇을 저장하는지 더 찾아보고 싶다.'},
 {title:'내 손으로 만든 정원',subtitle:'식물마다 어울리는 자리',asset:'reward_garden',color:'garden',saw:'물가·풀밭·건조 구역을 만들고 식물을 놓아 보았다.',found:'부레옥잠은 물가에, 벚나무는 풀밭에, 알로에는 건조 구역에 어울렸다. 식물의 특징을 생각해서 자리를 골랐다.',try:'집이나 학교에서 식물을 기를 때 물과 땅의 조건을 먼저 살펴보겠다.'},
 {title:'자연에서 빌린 가방 아이디어',subtitle:'관찰이 생활 속 발명이 되었어',asset:'bag_lotus_closed',color:'invention',saw:'연잎 위 물방울을 보고 가방 겉면과 입구를 바꾸어 시험했다.',found:'연잎을 본뜬 겉면은 물방울을 굴려 보냈고, 덮개는 입구로 들어오는 비를 막았다. 두 부품이 하는 일이 달랐다.',try:'우산이나 신발에도 식물의 특징을 써 볼 수 있을까?'},
];

export const NOTE_QUIZZES = [
 {question:'잎을 나눌 때 필요한 것은?',choices:['같은 기준','내가 좋아하는 색만'],answer:0,feedback:'맞아! 같은 기준으로 나누면 서로 비교하기 쉬워.',hint:'모양이나 가장자리처럼 모두에게 똑같이 적용할 기준을 떠올려 봐.'},
 {question:'겨울에 잎이 없으면 식물은 모두 죽은 걸까?',choices:['그렇다','줄기나 뿌리가 살아 있을 수 있다'],answer:1,feedback:'맞아! 살아 남은 부분에서 봄에 다시 자라기도 해.',hint:'겨울과 다음 봄 사진에서 같은 줄기와 땅속 뿌리를 찾아봐.'},
 {question:'잎자루에서 관찰한 공기 방울은 무엇의 단서일까?',choices:['잎자루 속 공기의 단서','잎자루 속 흙의 단서'],answer:0,feedback:'맞아! 직접 본 현상이 공기 공간을 설명하는 증거가 돼.',hint:'잎자루 안의 빈 공간과 위로 올라오는 방울을 떠올려 봐.'},
 {question:'알로에가 건조 구역에서 도움이 되는 특징은?',choices:['잎에 물을 저장한다','잎자루 속 공기로 물에 뜬다'],answer:0,feedback:'맞아! 물이 적은 곳에서는 저장한 물이 도움이 돼.',hint:'알로에의 두꺼운 잎 속에는 무엇이 있었지?'},
 {question:'연잎 겉면만 바꾸면 열린 입구도 막아 줄까?',choices:['입구도 저절로 막힌다','입구를 막는 덮개는 따로 필요하다'],answer:1,feedback:'맞아! 자연의 아이디어와 필요한 부품을 함께 써서 생활 문제를 해결했어.',hint:'겉면을 굴러가는 물과 입구로 떨어지는 비는 길이 달라.'},
];

const leafGroups=s=>({...s.groupsByRule,[s.rule]:s.groups});
function leafRecordSummary(s){
 const field=normalizeFieldEvidence(s.fieldEvidence).leaves;
 const observed=Object.values(s.leafEvidence).reduce((n,e)=>n+Number(!!e.shape)+Number(!!e.edge),0)+Object.values(field.scans).reduce((n,scans)=>n+scans.length,0);
 const sorted=['edge','narrow'].reduce((n,rule)=>n+Object.keys(field[rule]).length+Object.keys(leafGroups(s)[rule]||{}).length,0);
 return observed||sorted?`관찰 ${observed}곳 · 분류 ${sorted}개`:'이전에 마친 관찰 기록';
}
const entryRecord=(s,i)=>[
 leafRecordSummary(s),
 `${s.seasonalRecords.length}장의 계절 기록 · 겨울눈 ${budsFoundCount(s)}/${BUD_TOTAL}`,
 s.experimentAnswer==='air'?'공기 방울의 까닭을 찾았어':'식물과 환경을 이어 봤어',
 `물가 ${terrainCount(s,'water')}칸 · 풀밭 ${terrainCount(s,'grass')}칸 · 건조 ${terrainCount(s,'dry')}칸`,
 `${s.tests.length}번의 가방 시험`,
][i];

const COVER_NOTES=['같은 기준으로 잎을 나누었다.','겨울을 지나 다시 자랐다.','잎자루 속 공기를 찾았다.','사는 곳에 맞게 식물을 심었다.','연잎의 비밀을 가방에 담았다.'];

export function renderResearchNotebook(s){
 return `<main class="report-page tablet-report notebook-overview"><div class="notebook-heading"><span class="notebook-kicker">리피와 함께 쓴 다섯 장의 기록</span><h1>나의 초록정원 연구노트</h1><p>표지를 눌러 그날의 발견을 다시 펼쳐 봐.</p></div><div class="notebook-shelf">${ENTRIES.map((e,i)=>`<button class="notebook-cover note-${e.color}" data-action="note-open" data-id="${i}" aria-label="${i+1}번째 연구노트 · ${e.title}"><span class="note-number">탐험 기록 ${String(i+1).padStart(2,'0')}</span><span class="note-cover-art">${assetImage(e.asset)}</span><strong>${e.title}</strong><span class="note-subtitle">${e.subtitle}</span><p class="note-excerpt">${missionDone(s,i)?'남긴 선택과 관찰 근거를 다시 보자.':'발견을 찾아 탐험하는 중이야.'}</p><span class="note-record">${missionDone(s,i)?entryRecord(s,i):'아직 탐구 중이야'}</span><span class="note-open-label">노트 펼치기 ↗</span></button>`).join('')}</div><div class="notebook-next"><span>작은 발견 다섯 개가 하나의 정원을 만들었어.</span><button class="btn primary" data-action="report-tab" data-id="share">내 가방 이야기 나누기 →</button></div></main>`;
}

const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
export function observationRecord(s,i){
 const e=normalizeFieldEvidence(s.fieldEvidence),proof=inventionEvidence(s);
 switch(i){
  case 0:{
   const feature=k=>k==='shape'?'모양':'가장자리',group=(rule,answer)=>rule==='edge'?(answer==='yes'?'톱니 있음':'톱니 없음'):(answer==='yes'?'가늘고 긴 잎':'그 밖의 잎');
   return [...FIELD_LEAVES.flatMap(p=>e.leaves.scans[p.id].map(k=>`${p.name} · ${feature(k)} 관찰 기록`)),...Object.entries(s.leafEvidence).flatMap(([id,v])=>Object.keys(v).map(k=>`${PLANTS.find(p=>p.id===id)?.name||id} · ${feature(k)} 관찰 기록`)),...['edge','narrow'].flatMap(rule=>[...FIELD_LEAVES.filter(p=>e.leaves[rule][p.id]).map(p=>`${p.name} · ${rule==='edge'?'가장자리':'모양'} 기준 분류: ${group(rule,e.leaves[rule][p.id])}`),...PLANTS.filter(p=>leafGroups(s)[rule]?.[p.id]).map(p=>`${p.name} · 새 표본 분류: ${group(rule,leafGroups(s)[rule][p.id])}`)])];
  }
  case 1:return [...s.seasonalRecords.map(key=>{const [p,n]=key.split(':');return `${p==='cherry'?'벚나무':'씀바귀'} ${['다음 봄','여름','가을','겨울'][n]} 사진${s.seasonPhotos[key]?.underground?' · 땅속 포함':''}`;}),...(s.budsFound?.cherry?.length?[`벚나무 가지 끝 겨울눈 ${s.budsFound.cherry.length}개 찾음`]:[]),...(s.budsFound?.sowthistle?.length?['씀바귀 뿌리 머리 새눈 찾음']:[])];
  case 2:return [...e.float.tested.map(id=>`${id==='air'?'공기 방 모형: 수면에 뜸':'꽉 찬 모형: 바닥으로 내려감'}`),...(s.experiment.step>=4?[s.fieldBridges?.[2]&&e.float.reason==='air'?'현장에서 연 잎자루 단면: 공기 공간과 방울 관찰':'물속에서 누른 잎자루: 공기 방울 관찰']:[])];
  case 3:return ['water','grass','dry'].filter(t=>terrainCount(s,t)).map(t=>`${({water:'물가',grass:'풀밭',dry:'건조 구역'})[t]} ${terrainCount(s,t)}칸`).concat(e.garden.testedKey?['현장 정원의 빗물 시험 기록 있음']:[]);
  case 4:{
   // The bridge copies the field trials into the start of the core history; show that shared prefix once.
   const carried=s.fieldBridges?.[4]&&e.bag.delivered&&e.bag.tests.every((t,i)=>s.tests[i]?.key===t.key)?e.bag.tests.length:0;
   const extraProof=Object.keys(proof).filter(k=>proof[k]&&(e.bag.comparisons[k]?.before!==s.inventionExplanations[k]?.before||e.bag.comparisons[k]?.after!==s.inventionExplanations[k]?.key));
   return [...e.bag.tests.map((t,n)=>`현장 시험 ${n+1} · ${t.surface==='lotus'?'연잎 겉면':'보통 천'}, 입구 ${t.cover==='flap'?'닫힘':'열림'} → 물방울 ${t.rolls?'굴러감':'남음'}, 공책 ${t.notebookDry?'마름':'젖음'}`),...Object.keys(e.bag.comparisons).filter(k=>FIELD_BAG_ROLES[k]).map(k=>'현장에서 비교한 역할: '+FIELD_BAG_ROLES[k]),...s.tests.slice(carried).map((t,n)=>`이어 한 시험 ${carried+n+1} · ${t.surface==='lotus'?'연잎 겉면':'보통 천'}, 입구 ${t.cover==='flap'?'닫힘':'열림'} → 물방울 ${t.clean?'굴러감':'남음'}, 수첩 ${t.dry?'마름':'젖음'}`),...extraProof.map(k=>'이어 비교한 역할: '+FIELD_BAG_ROLES[k])];
  }
  default:return [];
 }
}
const list=items=>items.length?`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>아직 남긴 기록이 없어.</p>';
export function notebookEntry(s,i){
 const e=ENTRIES[i],q=NOTE_QUIZZES[i],done=missionDone(s,i),record=s.learningRecords?.[i],note=s.notebook?.[i]||{},responses=Object.values(record?.responses||{});
 const first=responses.map(r=>`${r.label} · ${r.phase==='prediction'?'첫 예상':'첫 선택'}: ${r.first}${r.firstHelp?' (힌트 사용 뒤)':''}`);
 const changed=responses.filter(r=>r.changes||r.wrong).map(r=>`${r.label}: ${r.first} → ${r.last}${r.correct?' (관찰 결과와 맞음)':' (다시 살펴보는 중)'} · 응답 ${r.attempts}회`);
 const known=record?.known===true;
 const quizAnswered=[0,1].includes(note.answer),quizCorrect=note.answer===q.answer;
 return {title:e.title,body:`<article class="notebook-spread note-${e.color}"><div class="note-memory"><span class="note-number">탐험 기록 ${String(i+1).padStart(2,'0')}</span>${assetImage(e.asset,'note-memory-art',true)}<span class="note-tape">${done?entryRecord(s,i):'현재까지 남긴 선택과 관찰 기록'}</span><span class="note-read-sticker ${note.read?'stuck':''}" aria-hidden="true">읽었어!</span><button class="btn soft" data-action="note-sticker" aria-pressed="${note.read===true}">${note.read?'읽었어 스티커 ✓':'읽었어 스티커 붙이기'}</button><p class="microcopy">완료 수와 스티커는 활동 기록이야. 이해한 정도는 선택과 근거를 함께 보며 확인해.</p></div><div class="note-diary"><section class="student-record"><h3>처음 예상 · 첫 선택</h3>${!known?'<p>확인되지 않음 · 이전 저장에는 처음부터의 응답 기록이 없어.</p>':''}${list(first)}</section><section class="student-record"><h3>관찰한 결과</h3>${list(observationRecord(s,i))}</section><section class="student-record"><h3>고친 선택</h3>${changed.length?list(changed):`<p>${known?'아직 고친 선택 기록이 없어.':'이전의 수정 여부는 확인되지 않음.'}</p>`}<p>요청한 힌트 ${record?.hints??0}회${known?'':' · 기록을 시작한 뒤부터'}. 재도전 횟수로 점수를 깎지 않아.</p></section><details class="note-content-summary"><summary>탐구 내용 정리</summary><p>${e.found}</p><small>활동을 설명하기 위해 미리 준비한 정리야. 학생이 직접 남긴 문장은 위의 선택 기록에서 확인해.</small></details><details class="note-next-idea"><summary>생활 속에서는 어디에 쓸까?</summary><p>${['처음 만난 잎을 같은 기준으로 나누어 보자.','학교 화단의 같은 자리를 겨울과 봄에 살펴보자.','식물마다 몸속에 무엇을 저장하는지 살펴보자.','식물을 기를 때 물과 땅의 조건을 살펴보자.','우산이나 신발에도 이 특징을 쓸 수 있을까?'][i]}</p></details><div class="note-quiz"><p>${q.question}</p><div>${q.choices.map((c,n)=>`<button class="btn ${note.answer===n?'selected':'soft'}" data-action="note-check" data-id="${i}:${n}" aria-pressed="${note.answer===n}">${c}</button>`).join('')}</div><p class="note-quiz-feedback ${quizAnswered&&quizCorrect?'correct':''}" role="status">${quizAnswered?(quizCorrect?q.feedback:q.hint):'기억을 떠올리며 골라 봐.'}</p>${note.attempts?`<small>처음 선택: ${q.choices[note.firstAnswer]} · 응답 ${note.attempts}회</small>`:''}</div></div></article>`};
}
