import {assetImage} from './asset-catalog.js';
import {missionDone,terrainCount,inventionEvidence,PLANTS,HABITAT_PLANTS} from './model.js';
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
 return `<main class="report-page tablet-report notebook-overview"><div class="notebook-heading"><span class="notebook-kicker">리피와 함께 쓴 다섯 장의 기록</span><h1>나의 초록정원 연구노트</h1><p>표지를 눌러 그날의 발견을 다시 펼쳐 봐.</p></div><div class="notebook-shelf">${ENTRIES.map((e,i)=>`<button class="notebook-cover note-${e.color}" data-action="note-open" data-id="${i}" aria-label="${i+1}번째 연구노트 · ${e.title}"><span class="note-number">탐험 기록 ${String(i+1).padStart(2,'0')}</span><span class="note-cover-art">${assetImage(e.asset)}</span><strong>${e.title}</strong><span class="note-subtitle">${e.subtitle}</span><p class="note-excerpt">${missionDone(s,i)?'남긴 선택과 관찰 근거를 다시 보자.':'발견을 찾아 탐험하는 중이야.'}</p><span class="note-record">${missionDone(s,i)?entryRecord(s,i):'아직 탐구 중이야'}</span><span class="note-open-label">노트 펼치기 ↗</span></button>`).join('')}</div><div class="notebook-next"><span>작은 발견 다섯 개가 하나의 정원을 만들었어.</span><button class="btn primary" data-action="start-final">새 식물에도 써 보기 →</button></div></main>`;
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

// Handwritten lines are built only from the student's saved choices and observations (no pre-written thoughts).
const LEAF_STICKERS={maple:'field_leaf_maple',pine:'field_leaf_pine',camellia:'field_leaf_camellia',cherry:'cherry_leaf',ginkgo:'ginkgo_leaf',grass:'grass_leaf'};
const plantName=id=>[...FIELD_LEAVES,...PLANTS,...HABITAT_PLANTS].find(p=>p.id===id)?.name||({sowthistle:'씀바귀'})[id]||id;
const leafChip=id=>`<span class="note-leaf-chip">${LEAF_STICKERS[id]?assetImage(LEAF_STICKERS[id],'note-leaf-sticker').replace(/alt="[^"]*"/,'alt=""'):''}${esc(plantName(id))}</span>`;
const shortLabel=label=>String(label).replace(/\s*(예상|관찰)$/,'');
const ZONES={water:'물가',grass:'풀밭',dry:'건조 구역'};
function firstThoughts(responses){
 const preds=responses.filter(r=>r.phase==='prediction'),pool=preds.length?preds:responses;
 // A first choice that was later revised says the most about the child's thinking; long multi-item answers stay in the teacher record.
 const short=pool.filter(r=>r.first.length<=30),picked=[...short.filter(r=>r.first!==r.last),...short.filter(r=>r.first===r.last)];
 return picked.slice(0,3).map(r=>`${esc(shortLabel(r.label))}: ${esc(r.first)}`);
}
function changedThoughts(responses){
 const seen=new Set();
 return responses.filter(r=>(r.changes||r.wrong)&&r.first!==r.last).sort((a,b)=>Number(a.first.length+a.last.length>40)-Number(b.first.length+b.last.length>40))
  .map(r=>`${esc(shortLabel(r.label))}: <span class="note-old">${esc(r.first)}</span> → <strong>${esc(r.last)}</strong>${r.correct?'!':''}`)
  .filter(x=>!seen.has(x)&&seen.add(x));
}
function sawThings(s,i,rows){
 const e=normalizeFieldEvidence(s.fieldEvidence);
 switch(i){
  case 0:{
   const ids=(rule,answer)=>[...FIELD_LEAVES.filter(p=>e.leaves[rule][p.id]===answer),...PLANTS.filter(p=>leafGroups(s)[rule]?.[p.id]===answer)].map(p=>p.id);
   const lines=[['edge','yes','톱니 있음'],['edge','no','톱니 없음'],['narrow','yes','가늘고 긴 잎']].map(([rule,answer,name])=>[name,ids(rule,answer)]).filter(([,list])=>list.length).map(([name,list])=>`<b>${name}</b> ${list.map(leafChip).join('')}`);
   const looked=FIELD_LEAVES.filter(p=>e.leaves.scans[p.id].length).length+Object.values(s.leafEvidence||{}).filter(v=>Object.keys(v).length).length;
   return lines.length<3&&looked?[...lines,`돋보기로 잎 ${looked}장을 살펴봤어`]:lines;
  }
  case 1:{
   const photos={cherry:[],sowthistle:[]},under={};
   for(const key of s.seasonalRecords){const [p,n]=key.split(':');if(!photos[p])continue;photos[p].push(Number(n));if(s.seasonPhotos[key]?.underground)under[p]=true;}
   const lines=Object.entries(photos).filter(([,n])=>n.length).map(([p,n])=>`${plantName(p)}: ${n.sort((a,b)=>(a+1)%4-(b+1)%4).map(k=>['다음 봄','여름','가을','겨울'][k]).join(' → ')} 사진${under[p]?' (땅속까지!)':''}`);
   const buds=[...(s.budsFound?.cherry?.length?[`벚나무 겨울눈 ${s.budsFound.cherry.length}개`]:[]),...(s.budsFound?.sowthistle?.length?['씀바귀 새눈']:[])];
   return buds.length?[...lines,`${buds.join(' · ')} 찾았어`]:lines;
  }
  case 2:return [...e.float.tested.map(id=>id==='air'?'공기 방 모형 → 물 위에 둥둥 떴어':'꽉 찬 모형 → 바닥으로 가라앉았어'),...(s.experiment.step>=4?[s.fieldBridges?.[2]&&e.float.reason==='air'?'잎자루를 열어 보니 공기 공간과 방울이 보였어':'물속에서 잎자루를 누르니 공기 방울이 나왔어']:[])];
  case 3:{
   const made=Object.keys(ZONES).filter(t=>terrainCount(s,t)).map(t=>`${ZONES[t]} ${terrainCount(s,t)}칸`);
   const planted=['hyacinth','cherry','aloe'].filter(id=>Number.isInteger(s.garden?.[id])&&ZONES[s.terrain[s.garden[id]]]).map(id=>`${plantName(id)} → ${ZONES[s.terrain[s.garden[id]]]}`);
   return [...(made.length?[`${made.join(' · ')}을 만들었어`]:[]),...(planted.length?[planted.join(', ')]:[]),...(e.garden.testedKey?['정원에 비를 내려 시험해 봤어']:[])];
  }
  case 4:{
   const trials=[...e.bag.tests.map(t=>({surface:t.surface,cover:t.cover,rolls:t.rolls,dry:t.notebookDry})),...s.tests.map(t=>({surface:t.surface,cover:t.cover,rolls:t.clean,dry:t.dry}))];
   const any=f=>trials.some(f),count=rows.filter(r=>/시험 \d/.test(r)).length;
   const surface=[any(t=>t.surface==='lotus'&&t.rolls)&&'연잎 겉면은 물방울이 굴러갔어',any(t=>t.surface==='plain'&&!t.rolls)&&'보통 천엔 물방울이 남았어'].filter(Boolean);
   const cover=[any(t=>t.cover==='flap'&&t.dry)&&'덮개를 닫으면 공책이 말랐어',any(t=>t.cover==='open'&&!t.dry)&&'열면 젖었어'].filter(Boolean);
   return [...(count?[`가방 시험을 ${count}번 했어`]:[]),...(surface.length?[surface.join(', ')]:[]),...(cover.length?[cover.join(', ')]:[])];
  }
  default:return [];
 }
}
const handBlock=(kind,icon,title,lines,empty)=>`<section class="note-hand-block note-hand-${kind}"><h3><span class="note-hand-icon" aria-hidden="true">${icon}</span>${title}</h3><ul class="note-hand">${lines.length?lines.map(x=>`<li>${x}</li>`).join(''):`<li class="note-hand-empty">${empty}</li>`}</ul></section>`;

export function notebookEntry(s,i){
 const e=ENTRIES[i],q=NOTE_QUIZZES[i],done=missionDone(s,i),record=s.learningRecords?.[i],note=s.notebook?.[i]||{},responses=Object.values(record?.responses||{});
 const known=record?.known===true,rows=observationRecord(s,i);
 // Teacher record: every first choice, observation and revision, unchanged from the integrity review layout.
 const first=responses.map(r=>`${r.label} · ${r.phase==='prediction'?'첫 예상':'첫 선택'}: ${r.first}${r.firstHelp?' (힌트 사용 뒤)':''}`);
 const changed=responses.filter(r=>r.changes||r.wrong).map(r=>`${r.label}: ${r.first} → ${r.last}${r.correct?' (관찰 결과와 맞음)':' (다시 살펴보는 중)'} · 응답 ${r.attempts}회`);
 const quizAnswered=[0,1].includes(note.answer),quizCorrect=note.answer===q.answer;
 const thoughts=firstThoughts(responses),revised=changedThoughts(responses),saw=sawThings(s,i,rows);
 const kept=!known?'바뀐 생각은 기록되지 않았어.':!responses.length?'아직 남긴 기록이 없어.':responses.every(r=>r.correct)?'처음 생각 그대로 맞았어!':'처음 생각 그대로 두었어.';
 const memory=`<div class="note-memory"><figure class="note-photo"><span class="note-tape" aria-hidden="true"></span>${assetImage(e.asset,'note-memory-art',true)}<figcaption>${e.subtitle}</figcaption></figure><span class="note-read-sticker ${note.read?'stuck':''}" aria-hidden="true">읽었어!</span><button class="btn soft" data-action="note-sticker" aria-pressed="${note.read===true}">${note.read?'읽었어 스티커 ✓':'읽었어 스티커 붙이기'}</button><div class="note-quiz"><span class="note-quiz-kicker">기억 퀴즈</span><p>${q.question}</p><div>${q.choices.map((c,n)=>`<button class="btn ${note.answer===n?'selected':'soft'}" data-action="note-check" data-id="${i}:${n}" aria-pressed="${note.answer===n}">${c}</button>`).join('')}</div><p class="note-quiz-feedback ${quizAnswered&&quizCorrect?'correct':''}" role="status">${quizAnswered?(quizCorrect?q.feedback:q.hint):'기억을 떠올리며 골라 봐.'}</p></div></div>`;
 const hand=handBlock('first','✏️','처음 생각',thoughts,known?'아직 남긴 기록이 없어.':'처음 생각은 기록되지 않았어.')
  +handBlock('saw','👀','내가 본 것',saw,'아직 남긴 기록이 없어.')
  +handBlock('changed','💡','바뀐 생각',revised.length>3?[...revised.slice(0,3),`<small>그리고 ${revised.length-3}개 더 고쳤어</small>`]:revised,kept);
 const summary=`<details class="note-content-summary"><summary>📎 리피의 정리 · 탐구 내용 정리</summary><p>${e.found}</p><p><b>생활 속에서는 어디에 쓸까?</b> ${['처음 만난 잎을 같은 기준으로 나누어 보자.','학교 화단의 같은 자리를 겨울과 봄에 살펴보자.','식물마다 몸속에 무엇을 저장하는지 살펴보자.','식물을 기를 때 물과 땅의 조건을 살펴보자.','우산이나 신발에도 이 특징을 쓸 수 있을까?'][i]}</p><small>활동을 설명하기 위해 미리 준비한 정리야. 학생이 직접 남긴 기록은 손글씨 칸과 선생님용 기록에서 확인해.</small></details>`;
 const teacher=`<details class="note-teacher"><summary>선생님용 자세한 기록</summary>${done?`<p class="note-teacher-total">활동 요약 · ${entryRecord(s,i)}</p>`:''}<p class="microcopy">완료 수와 스티커는 활동 기록이야. 이해한 정도는 선택과 근거를 함께 보며 확인해.</p><section class="student-record"><h4>처음 예상 · 첫 선택</h4>${!known?'<p>확인되지 않음 · 이전 저장에는 처음부터의 응답 기록이 없어.</p>':''}${list(first)}</section><section class="student-record"><h4>관찰한 결과</h4>${list(rows)}</section><section class="student-record"><h4>고친 선택</h4>${changed.length?list(changed):`<p>${known?'아직 고친 선택 기록이 없어.':'이전의 수정 여부는 확인되지 않음.'}</p>`}<p>요청한 힌트 ${record?.hints??0}회${known?'':' · 기록을 시작한 뒤부터'}. 재도전 횟수로 점수를 깎지 않아.</p></section>${note.attempts?`<p>기억 퀴즈 처음 선택: ${q.choices[note.firstAnswer]} · 응답 ${note.attempts}회</p>`:''}</details>`;
 return {title:`탐험 기록 ${String(i+1).padStart(2,'0')} · ${e.title}`,body:`<article class="notebook-spread note-${e.color}">${memory}<div class="note-diary">${hand}<div class="note-folds">${summary}${teacher}</div></div></article>`};
}
