// 3장 실험실·4장 서식지·정원 화면(2026-11-21 코드 구조 정리: learning.js에서 내용 그대로 옮김).
import {HABITAT_PLANTS,HABITATS,HABITAT_COMPARE_PLANT,pageReady,gardenReviewReady,gardenPlants,gardenValid,terrainCount,terrainReady,TERRAIN_MIN,misplacedPlants,misfitNote} from './model.js';
import {plantArt,icon} from './art.js';
import {assetImage} from './asset-catalog.js';
import {HABITAT_FACTS} from './inquiry.js';
import {fieldMissionReady} from './field-missions-state.js';
import {josa} from './josa.js';
import {button,esc,layout,lock,panel,row} from './learning.js';

// Bubbles leave the open air rooms of the cut piece (picture fractions), wobble up and pop at the water surface.
// [x,y,size,delay s,duration s,sideways px]; the surface line is measured from the water after render.
const PETIOLE_BUBBLES=[[.70,.52,22,0,1.7,-10],[.74,.60,16,.05,1.6,12],[.67,.66,26,.12,1.9,-14],[.72,.72,12,.2,1.5,8],[.76,.68,18,.28,1.8,16],[.69,.8,14,.35,1.9,-6],[.73,.47,10,.4,1.3,6],[.71,.62,28,.5,2,-8],[.66,.56,12,.58,1.6,-12],[.75,.78,20,.66,2,10],[.7,.84,16,.75,2.1,-4],[.73,.55,14,.85,1.6,14],[.68,.73,22,.95,1.9,-10],[.76,.5,12,1.05,1.5,8],[.71,.66,18,1.15,1.8,-6],[.67,.48,10,1.25,1.4,-8],[.74,.82,24,1.3,2.1,12],[.72,.58,12,1.45,1.6,4]];
const PETIOLE_POPS=[[.71,1.1],[.68,1.5],[.75,1.9],[.72,2.4],[.69,2.9]];
const petioleBubbles=()=>`<b class="petiole-bubbles" aria-hidden="true"><span>${PETIOLE_BUBBLES.map(([x,y,s,d,t,dx])=>`<i style="--x:${x};--y:${y};--s:${s};--dx:${dx}px;animation-delay:${d}s;animation-duration:${t}s"></i>`).join('')}${PETIOLE_POPS.map(([x,d])=>`<b style="--x:${x};animation-delay:${d}s"></b>`).join('')}</span></b>`;
export function experiment(s,u){
  const n=s.experiment.step,fromField=fieldMissionReady(s,2);
  const scene=`<div data-spatial="lab" class="experiment-stage lab-scene ${n>=3?'submerged':''} ${u.bubbling?'pressed':''}"><button class="specimen-focus ${u.bubbling?'squeezed':''}" data-action="${n>=3?'press-petiole':'asset-view'}" data-id="expedition_petiole_clear_20261023" aria-label="${n>=3?'물속 잎자루 누르기':'부푼 잎자루 크게 보기'}">${assetImage('expedition_petiole_clear_20261023')}<span>${n>=3?'여기를 눌러 봐':'잎을 받치는 잎자루'}</span>${u.bubbling?petioleBubbles():''}</button>${n>=3?'<div class="water-level"><span>물속</span></div>':''}</div>`;
  const predict=`<div class="prediction"><p>물속에서 누르면 어떻게 될까?</p>${button('공기 방울이 나올 것 같아','experiment-predict','bubbles',s.experiment.prediction==='bubbles')}${button('아무것도 안 나올 것 같아','experiment-predict','none',s.experiment.prediction==='none')}</div>`;
  const tools=n===0?button('잎자루 잘라 보기','lab-next','cut'):n<3?button('물속에 넣기','lab-next','water'):button(n>=4?'한 번 더 눌러 보기':'잎자루 눌러 보기','press-petiole');
  // The tank stays large; question, answer and the next tool share one dock below it.
  return layout(scene+`<div class="work-board lab-dock">${n<4?(fromField?'<p class="direct-hint">현장에서 찾은 공기 방을 떠올리며 물속 잎자루를 눌러 봐.</p>':predict):`<p class="rule-result">${s.experiment.prediction==='none'?'예상과 달랐어! ':s.experiment.prediction==='bubbles'?'예상처럼 ':''}누른 잎자루에서 공기 방울이 나왔어.</p>`}<div class="center">${tools}</div>${n>=4?`<div class="reason-cards"><p>${fromField?'잎자루 속에서 나온 공기는 부레옥잠이 물에 뜨는 데 어떤 도움을 줄까?':'물속에서 누르니 공기 방울이 나왔어. 무엇을 알 수 있을까?'}</p>${button(fromField?'잎자루가 물에 뜨는 데 도움을 줘.':'잎자루 속에 공기가 있어요','experiment-answer','air',s.experimentAnswer==='air')}${button(fromField?'잎자루를 무겁게 해서 가라앉게 해.':'잎자루 속에 흙이 있어요','experiment-answer','soil')}</div>`:'<p class="microcopy">잎과 부푼 잎자루는 달라. 공기 공간을 크게 나타낸 모형을 자르고, 돌리고, 물속에서 눌러 봐.</p>'}</div>`,panel('실험에서 찾은 것',`${row(n>=1,'잎자루 안쪽 보기')}${row(n>=4,'물속에서 눌러 보기')}${row(s.experimentAnswer==='air','공기 방울과 잎자루 속 연결하기')}<details><summary>더 해 보기 · 알로에</summary>${assetImage('aloe_leaf_cutaway','optional-image')}<p>알로에는 두꺼운 잎에 물을 저장해.</p></details>`));
}
const PLANT_PICTURE={hyacinth:'water_hyacinth_whole',cherry:'cherry_tree',aloe:'aloe_plant'};
function reasonCards(s,u){
 const p=HABITAT_PLANTS.find(q=>q.id===u.selected)||HABITAT_PLANTS[0];
 return `<div class="reason-cards"><p>이곳에 심은 까닭은?</p>${HABITAT_PLANTS.map(r=>button(r.reason,'garden-answer',r.id,s.gardenReasons.includes(p.id)&&r.id===p.id)).join('')}</div>`;
}
export function habitats(s,u){
 const done=pageReady(s,5),solved=s.habitatCompareAnswer===HABITAT_COMPARE_PLANT;
 const cards=['hyacinth','cherry','aloe'].map(id=>{
  const p=HABITAT_PLANTS.find(p=>p.id===id),fact=HABITAT_FACTS[id];
  const content=`${assetImage(PLANT_PICTURE[id],'habitat-compare-art',true).replace(/alt="[^"]*"/,'alt=""')}<strong>${p.name}</strong><b>${HABITATS[p.habitat]}</b><span>${fact.feature}</span>`;
  return done?`<article class="habitat-compare-card ${solved&&id===HABITAT_COMPARE_PLANT?'is-picked':''}">${content}<small>${fact.life}</small></article>`:
   `<button type="button" class="habitat-compare-card" data-action="habitat-compare-answer" data-id="${id}">${content}</button>`;
 }).join('');
 return layout(`<div class="work-board field-review-board habitat-compare-board">
  <p class="habitat-compare-question">${done?'세 식물이 사는 곳과 특징을 나란히 봐.':'비가 한동안 오지 않아도 두꺼운 잎에 모아 둔 물을 쓸 수 있는 식물은?'}</p>
  <div class="habitat-compare-grid">${cards}</div>
  ${solved?`<p class="field-review-result" role="status" tabindex="-1">${icon('check',20)} 알로에는 잎에 물을 저장해 물이 적은 곳에서도 쓸 수 있어.</p>`:!done&&u.activityFeedback?`<p class="field-review-feedback" role="status">${esc(u.activityFeedback)}</p>`:''}
 </div>`,'');
}
export function fieldGardenReview(s,u){
 const review=s.gardenReview,p=HABITAT_PLANTS.find(p=>p.id===review?.plant),done=gardenReviewReady(s);
 const bed=p=>{
  const picked=p.id===review?.plant,content=`${assetImage('habitat_'+p.habitat,'habitat-picture',true).replace(/alt="[^"]*"/,'alt=""')}${plantArt(p.id).replace(/alt="[^"]*"/,'alt=""')}<span><b>${p.name}</b><small>${HABITATS[p.habitat]}${picked&&done?' · 확인했어':''}</small></span>`;
  return done?`<div class="field-review-bed ${picked?'is-picked':''} ${picked&&review.cell!==review.from?'moved':''}">${content}</div>`:`<button type="button" class="field-review-bed ${picked?'is-picked':''} ${picked&&review.cell!==review.from?'moved':''}" data-action="garden-review-pick" data-id="${p.id}" aria-pressed="${picked}">${content}</button>`;
 };
 return layout(`<div class="work-board field-review-board garden-review-board">
  <p class="field-review-kicker">현장에서 심은 내 정원</p>
  <div class="field-review-beds">${['hyacinth','cherry','aloe'].map(id=>bed(HABITAT_PLANTS.find(p=>p.id===id))).join('')}</div>
  ${done?`<p class="field-review-result" role="status" tabindex="-1">${icon('check',20)} ${review.cell===review.from?'이 자리를 그대로 뒀어.':'같은 구역의 옆자리로 옮겼어.'} <b>${p.reason}.</b></p>`:p?`
   <div class="garden-review-tools"><span>${p.name} · ${review.cell===review.from?'처음 심은 자리':'같은 구역의 옆자리'}</span>${button(review.cell===review.from?'옆자리로 옮기기':'처음 자리로 돌리기','garden-review-move')}</div>
   <p class="garden-review-question">이 자리에서 ${josa(p.name,'이/가')} 잘 살 수 있는 까닭은?</p>
   <div class="field-review-choices">${HABITAT_PLANTS.map(q=>button(q.reason,'garden-review-reason',q.id)).join('')}</div>`:
   '<p class="garden-review-question">세 식물 중 한 자리만 골라 살펴봐.</p>'}
  ${!done&&u.activityFeedback?`<p class="field-review-feedback" role="status">${esc(u.activityFeedback)}</p>`:''}
 </div>`,'');
}
export function garden(s,u,grid,place){
 const planting=place||u.gardenMode==='plant',selected=HABITAT_PLANTS.find(p=>p.id===u.selected)||HABITAT_PLANTS[0];
 // One palette: every land tile and plant can be dragged straight onto the garden, or tapped and then placed with a tap.
 const tiles=place?'':`<p class="palette-label">땅 타일 <small>끌어서 칠하기</small></p><div class="terrain-tools">${Object.entries({...HABITATS,empty:'지우개'}).map(([id,n])=>button(`${HABITATS[id]?assetImage('habitat_'+id,'habitat-picture',true):'<span class="soil-swatch" aria-hidden="true"></span>'}<span>${n}</span>`,'brush',id,!planting&&u.brush===id,`data-drag="terrain:${id}" draggable="false"`)).join('')}</div>`;
 const plants=`<p class="palette-label">식물 <small>끌어서 심기</small></p><div class="garden-plant-tray">${HABITAT_PLANTS.map(p=>{const on=planting&&selected.id===p.id,count=Number.isInteger(s.garden[p.id])?1+s.gardenExtras.filter(x=>x.id===p.id).length:0;return `<button class="garden-plant-pick ${on?'selected':''}" data-action="select-plant" data-id="${p.id}" data-drag="${p.id}" draggable="false" aria-pressed="${on}">${plantArt(p.id)}<span>${p.name}</span><small>${count?`${count}${p.unit} ✓`:'심기 전'}</small></button>`;}).join('')}</div>`;
 const tools=`<div class="garden-palette">${tiles}${plants}${button('되돌리기','undo','','',u.undo.length?'':lock('되돌릴 기록이 아직 없어.'))}</div>`;
 // A plant on ground that does not suit it is named first, so a locked next step never goes unexplained.
 const wrong=misplacedPlants(s),misfit=wrong.find(p=>p.id===selected.id)||wrong[0];
 const hint=!place&&!terrainReady(s)?`물가·들판·건조 구역을 각각 ${TERRAIN_MIN}칸 이상 칠해 봐.`:misfit?misfitNote(s,misfit):!planting?'이제 식물 카드를 어울리는 땅으로 끌어다 심어 봐.':place&&s.terrain[s.garden[selected.id]]===selected.habitat&&!s.gardenReasons.includes(selected.id)?`${josa(selected.name,'을/를')} 심은 까닭을 골라 줘.`:`${josa(selected.name,'을/를')} 골랐어. ${s.terrain[s.garden[selected.id]]===selected.habitat?'어울리는 땅에 더 심어 봐.':Number.isInteger(s.garden[selected.id])?'심은 자리를 살펴보고, 원하면 끌어서 옮겨 봐.':'어울리는 땅에 끌어다 심어 줘.'}`;
 const counts=place?'':`<div class="garden-terrain-status">${Object.entries(HABITATS).map(([id,n])=>`<span class="${terrainCount(s,id)>=TERRAIN_MIN?'done':''}">${n} ${terrainCount(s,id)}/${TERRAIN_MIN}</span>`).join('')}</div>`;
 // Keep-or-change check: the starting garden is allowed, but the student picks one spot and says why it suits the plant.
 const confirm=place&&gardenValid(s)?`<div class="garden-confirm" role="group" aria-label="내 정원 확인"><p><b>내 정원 확인</b> · ${s.gardenPick?'이 정원으로 기록할게. 다시 골라도 돼.':'이대로 좋으면 친구에게 소개할 자리 하나를 골라 줘.'}</p><div class="garden-confirm-picks">${HABITAT_PLANTS.map(p=>button(`<strong>${p.name} · ${HABITATS[p.habitat]}</strong>${s.gardenPick===p.id?`<small>${p.reason}</small>`:''}`,'garden-pick',p.id,s.gardenPick===p.id)).join('')}</div>${button('땅 모양 바꾸기','edit-terrain')}</div>`:'';
 const feedback=`${confirm||`<p class="direct-hint ${misfit?'garden-misfit':''}" role="status">${hint}</p>${place&&Number.isInteger(s.garden[selected.id])?(s.gardenReasons.includes(selected.id)&&s.terrain[s.garden[selected.id]]===selected.habitat?`<p class="garden-reason-saved">${icon('check',18)} ${selected.name} · ${selected.reason}</p><p class="direct-hint">${pageReady(s,7)?'복구 준비 끝! 아래 버튼으로 마치거나 더 꾸며 봐.':gardenValid(s)?'아래 <b>내 정원 확인</b>에서 정해 줘.':'다른 식물도 어울리는 자리에 있는지 살펴봐.'}</p>`:reasonCards(s,u)):`${counts}<div class="garden-placement-progress">${HABITAT_PLANTS.map(p=>row(s.terrain[s.garden[p.id]]===p.habitat,p.name+' · '+(!Number.isInteger(s.garden[p.id])?'아직 심기 전':s.terrain[s.garden[p.id]]===p.habitat?'자리 확인':`${HABITATS[s.terrain[s.garden[p.id]]]||'빈 땅'}에 심음 → ${josa(HABITATS[p.habitat],'으로/로')} 옮겨 줘`))).join('')}</div>`}`}<p class="garden-move-tip">심은 식물은 끌어서 옮기고, 정원 밖에 놓으면 뽑혀.</p>${gardenPlants(s).length?`<div class="garden-photo">${button(`${icon('camera',18)} ${s.gardenPhoto?'다시 찍어 노트에 붙이기':'내 정원 찍어서 연구 노트에 붙이기'}`,'garden-photo')}</div>`:''}`;
 return layout(`<div class="garden-workbench">${tools}<div class="garden-frame" data-spatial="garden" data-drop="garden-board">${grid()}</div><div class="garden-feedback">${feedback}</div>${place&&!confirm?button('땅 모양 바꾸기','edit-terrain'):''}</div>`,panel('내 정원 기록',`<p>식물의 특징과 사는 곳을 이어서 나만의 정원을 만들자.</p>`));
}
