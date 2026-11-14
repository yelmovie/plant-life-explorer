import {coreResponse} from './response-tracking.js';
import {BRIDGE_NOTES} from './field-bridge.js';
import {PLANTS,HABITAT_PLANTS,HABITATS,HABITAT_COMPARE_PLANT,PAGES,SEASONS,pageReady,fieldSeasonReview,fieldBagReview,SEASON_REVIEW_ANSWERS,singleFieldRecord,gardenReviewReady,plantAt,BAG_REVIEW_ANSWERS,gardenSnapshot,gardenPlants,missionDone,gardenPlaced,gardenValid,comparisonPair,canFinish,presetTerrain,LEAF_PARTNER,addMiss,awardStamp,terrainCount,terrainReady,TERRAIN_MIN,misplacedPlants,misfitNote} from './model.js';
import {leafArt,plantArt,seasonArt,icon} from './art.js';
import {assetImage} from './asset-catalog.js';

import {seasonEvidenceReady,HABITAT_FACTS} from './inquiry.js';
import {renderDesign,renderTests} from './invention.js';
import {renderFieldMission,renderFieldSteps,fieldFeedback,fieldTodo,fieldNextButton} from './field-missions.js';
import {fieldMissionReady} from './field-missions-state.js';
import {EXPEDITIONS,earnedTools} from './expedition.js';
import {renderResearchNotebook} from './research-notebook.js';
import {josa} from './josa.js';
import {BUD_GOAL,BUD_TOTAL,lookForBud,nextBudSpot,budsFoundCount} from './winter-buds.js';
import {recordHint} from './learning-records.js';
import {nextAutoStep} from './auto-play.js';
import {activityGuide,renderRemaining} from './next-step-guide.js';

export const button=(label,action,id='',selected=false,extra='')=>`<button class="btn ${selected?'selected':'soft'}" data-action="${action}" data-id="${id}" aria-pressed="${selected}" ${extra}>${label}</button>`;
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
// Contract with app.js: locked controls stay clickable and app.js shows data-reason as a toast.
export const lock=reason=>`aria-disabled="true" data-reason="${esc(reason)}"`;
const row=(ok,label)=>`<p class="record-row ${ok?'done':''}"><span>${ok?icon('check',16):'아직'}</span>${label}</p>`;
const panel=(title,body)=>`<aside class="learning-note"><h2>${title}</h2>${body}</aside>`;
const layout=(scene,note)=>`<div class="learning-layout"><section class="learning-scene">${scene}</section>${note}</div>`;
const plantTabs=(plants,action,selected)=>`<div class="learning-tabs">${plants.map(p=>button(p.name,action,p.id,p.id===selected)).join('')}</div>`;
const name=id=>id==='cherry'?'벚나무':'씀바귀';
const seasonName=n=>n===0?'다음 해 봄':SEASONS[n];
const seasonText=(p,n)=>n===4?(p==='cherry'?'겨울눈이 부풀고, 잎과 꽃이 나올 준비를 해.':'살아 있던 뿌리 머리에서 새싹이 돋기 시작해.'):n===3?(p==='cherry'?'잎은 떨어져도 줄기와 뿌리는 살아 있어.':'땅 위가 시들어도 땅속 뿌리가 살아 있어.'):n===0?(p==='cherry'?'같은 나무의 겨울눈에서 새잎과 꽃이 나왔어.':'뿌리가 살아 있어서 땅 위로 새싹이 나왔어.'):n===1?(p==='cherry'?'푸른 잎이 무성하게 자랐어.':'잎과 줄기가 자라고 노란 꽃이 피기도 해.'):(p==='cherry'?'잎이 붉고 노랗게 물들어 떨어지기 시작해.':'잎과 줄기의 모습이 달라져.');
const winterCaption=(p,n=3)=>n===4?'눈이 녹기 시작했어. 땅속은 어떨까?':p==='cherry'?'잎이 다 떨어졌어. 줄기와 가지는 살아 있을까?':'땅 위 잎이 시들었어. 땅속은 어떨까?';
const SEASON_STOPS=[1,2,3,4,0];
const BUD_PICTURE={cherry:'season_cherry_winter_bud',sowthistle:'season_sowthistle_crown_bud'};
// Lens over the winter quadrant (col 0, row 1) of the 200%×200% season atlas, magnified z times.
function lensView(x,y,w,h,z=2.4){const W=w>0?w:600,H=h>0?h:400,d=Math.round(Math.min(170,Math.max(110,W*.22)));return {w:W,h:H,d,bw:Math.round(2*W*z),bh:Math.round(2*H*z),bx:Math.round(d/2-x*W*z),by:Math.round(d/2-(H+y*H)*z)};}
function budLayer(s,u,plant){
 const marks=(s.budsFound[plant]||[]).map(([x,y])=>`<span class="bud-mark" style="--x:${x};--y:${y}" aria-hidden="true">${assetImage(BUD_PICTURE[plant],'',true)}</span>`).join('');
 const l=u.budLook?.plant===plant?u.budLook:null;
 if(!l)return marks;
 return marks+(l.hit?`<span class="bud-lens hit" style="--x:${l.x};--y:${l.y};--d:${l.d}px" aria-hidden="true">${assetImage(BUD_PICTURE[plant],'',true)}</span>`:`<span class="bud-lens" style="--x:${l.x};--y:${l.y};--d:${l.d}px;background-image:url('/assets/generated/${plant}_seasons_v2.webp');background-size:${l.bw}px ${l.bh}px;background-position:${l.bx}px ${l.by}px" aria-hidden="true"></span>`);
}
const seen=(s,p=s.seasonPlant)=>s.undergroundSeen.includes(p);
function leafPicture(p){
 return leafArt(p.id).replace(/alt="[^"]*"/,'alt=""');
}
function leaves(u){
 const zoomed=!!u.leafZoom;
 return layout(`<div class="work-board leaf-compare">
  <p class="leaf-board-intro">잎마다 폭과 길이, 가장자리의 생김새가 어떻게 다를까?</p>
  <div class="leaf-compare-grid ${zoomed?'is-zoomed':''}">${PLANTS.map(p=>`<figure class="leaf-specimen"><div class="leaf-specimen-picture">${leafPicture(p)}</div><figcaption><strong>${p.name}</strong><span>${p.shape}</span></figcaption></figure>`).join('')}</div>
  <div class="leaf-compare-tools">${button(icon('zoom',20)+' 크게 보기','leaf-zoom','large',zoomed)}${button('전체 보기','leaf-zoom','normal',!zoomed)}</div>
 </div>`,'');
}
const LEAF_RULES=[
 ['edge','톱니 기준',['톱니가 있어','톱니가 없어']],
 ['narrow','모양 기준',['가늘고 길쭉해','가늘고 길쭉하지 않아']]
];
const leafTile=p=>`<span class="leaf-tile ${p.id==='ginkgo'?'ginkgo-leaf':''}">${leafPicture(p)}<b>${p.name}</b></span>`;
function leafGrouping([rule,title,labels]){
 return `<section class="leaf-grouping" aria-label="${title}"><h2>${title}</h2><div class="leaf-group-bins">${[true,false].map((match,i)=>`<div class="leaf-group-bin ${PLANTS.find(p=>p.id==='ginkgo')[rule]===match?'ginkgo-team':''}"><h3>${labels[i]}</h3><div>${PLANTS.filter(p=>p[rule]===match).map(leafTile).join('')}</div></div>`).join('')}</div></section>`;
}
function classify(s,u){
 const done=s.completed[1]||s.leafPartner===LEAF_PARTNER;
 return layout(`<div class="work-board leaf-partner ${done?'is-solved':''}">${done?`
  <h2 class="leaf-result-title" tabindex="-1">${icon('check',20)} 은행잎의 짝이 바뀌었어!</h2>
  <div class="leaf-group-compare">${LEAF_RULES.map(leafGrouping).join('')}</div>
  <p class="leaf-board-intro">톱니로 보면 <b>강아지풀</b>과, 모양으로 보면 <b>벚나무</b>와 한 팀이야.</p>`:`
  <div class="leaf-group-compare">${leafGrouping(LEAF_RULES[0])}</div>
  <p class="leaf-partner-question">이번엔 <b>가늘고 길쭉한가</b>를 기준으로 나눠 볼까? 은행잎은 누구와 한 팀이 될까?</p>
  <div class="leaf-partner-choices">${PLANTS.filter(p=>p.id!=='ginkgo').map(p=>button(leafTile(p),'leaf-partner',p.id)).join('')}</div>
  ${u.activityFeedback?`<p class="leaf-partner-hint" role="status">${esc(u.activityFeedback)}</p>`:''}`}</div>`,'');
}
function seasons(s,u={}){
 const plant=s.seasonPlant,n=s.season,winter=n===3,early=n===4,pred=s.seasonPrediction[plant],hidden=(winter||early)&&!seen(s),under=s.underground&&!((winter||early)&&!pred);
 const searching=winter&&seen(s)&&u.budLens===true,found=s.budsFound[plant]||[];
 const predict=!winter?'':!pred?`<div class="prediction"><p>겨울 땅속에는 무엇이 남아 있을까?</p>${button('뿌리가 남아 있을 것 같아','season-predict','roots')}${button('아무것도 없을 것 같아','season-predict','none')}</div>`:!seen(s)?`<p class="rule-result">내 예상: ${pred==='roots'?'뿌리가 남아 있어':'아무것도 없어'} · 땅속 보기로 확인해 봐.</p>`:`<p class="rule-result">${pred==='roots'?'예상처럼':'예상과 달리'} 땅속에 뿌리가 남아 있었어.</p>`;
 // 겨울눈 찾기: optional follow-up once the winter roots are confirmed; never required for completion.
 const budTools=winter&&seen(s)?`<div class="bud-tools"><p class="direct-hint">${found.length>=BUD_GOAL[plant]?(plant==='cherry'?'가지 끝 겨울눈을 모두 찾았어.':'뿌리 머리 새눈을 찾았어.'):plant==='cherry'?`뿌리뿐 아니라 줄기와 가지도 살아 있어. 렌즈로 가지 끝 겨울눈을 찾아봐. (${found.length}/${BUD_GOAL.cherry})`:'뿌리와 땅이 만나는 곳에 봄을 기다리는 눈이 있어. 렌즈로 눌러 봐.'}</p><div>${button(icon('zoom',18)+(searching?' 렌즈 내려놓기':' 관찰 렌즈로 겨울눈 찾기'),'bud-lens','',searching)}${searching&&found.length<BUD_GOAL[plant]?button('렌즈 도움','bud-hint'):''}</div></div>`:'';
 // The label says why: the photo is pinned in the research notebook, where winter and next spring are compared.
 const photo=early?'':button(`${icon('camera',18)} ${s.seasonalRecords.includes(`${plant}:${n}`)?'다시 찍어 노트에 붙이기':'찍어서 연구 노트에 붙이기'}`,'record-season','',false,hidden?lock('땅속 보기로 예상을 확인한 뒤 찍어 줘.'):'title="겨울과 봄 사진을 연구 노트에 나란히 붙여 비교해."');
 const budRows=['cherry','sowthistle'].map(p=>row((s.budsFound[p]||[]).length>=BUD_GOAL[p],`${name(p)} ${p==='cherry'?'가지 끝':'뿌리 머리'} ${(s.budsFound[p]||[]).length}/${BUD_GOAL[p]}`)).join('');
 return layout(`${plantTabs([{id:'cherry',name:'벚나무'},{id:'sowthistle',name:'씀바귀'}],'season-plant',plant)}<div class="season-scene ${searching?'bud-searching':''}"><div id="season-art" data-spatial="season" ${searching?'data-bud-field':''}>${seasonArt(plant,n,under,winter?budLayer(s,u,plant):'',searching?'bud-search':'')}</div><span id="season-label" class="scene-badge">${seasonName(n)}</span>${button(under?'땅속 닫기':missionDone(s,0)?'관찰 렌즈로 땅속 보기':'땅속 보기','underground','',under,(winter||early)&&!pred?lock(early?'먼저 겨울에서 땅속을 예상해 줘.':'먼저 땅속에 무엇이 있을지 예상해 줘.'):'')}</div><div class="timeline"><label for="season-range" class="direct-hint">시간 손잡이를 움직여 같은 식물을 따라가 봐.</label><input id="season-range" type="range" min="0" max="4" step="1" value="${SEASON_STOPS.indexOf(n)}"><div class="season-stops">${SEASON_STOPS.map(k=>button(k===0?'다음 봄':seasonName(k),'season',String(k),n===k,k===0?'aria-label="다음 해 봄"':'')).join('')}</div></div>${predict}<p class="season-caption" id="season-caption">${hidden?winterCaption(plant,n):seasonText(plant,n)}</p>${budTools}${photo}`,panel('끊긴 계절 기록',`${['cherry','sowthistle'].map(p=>`<section><strong>${name(p)}</strong>${[3,0].map(k=>row(!!s.seasonPhotos[`${p}:${k}`],seasonName(k))).join('')}</section>`).join('')}<p>두 식물의 겨울과 다음 봄을 남겨 줘. 겨울엔 땅속을 먼저 예상해 봐.</p><section class="bud-record"><strong>겨울눈 찾기 <small>더 해 보기</small></strong>${budRows}</section>`));
}
function fieldSeasonCompare(s,u){
 const done=s.seasonCompareAnswer==='parts';
 return layout(`<div class="work-board field-review-board season-review-board">
  <p class="field-review-kicker">현장에서 살펴본 겨울과 다음 봄</p>
  <div class="season-review-plants">${['cherry','sowthistle'].map(plant=>`<section><h2>${name(plant)}</h2><div class="season-review-pair">${[3,0].map(n=>`<figure>${seasonArt(plant,n,true)}<figcaption>${n===3?'겨울':'다음 봄'}</figcaption></figure>`).join('')}</div></section>`).join('')}</div>
  ${done?`<p class="field-review-result" role="status" tabindex="-1">${icon('check',20)} ${SEASON_REVIEW_ANSWERS.parts}</p>`:`
    <p class="season-review-question">두 식물은 겨울을 난 뒤 어느 부분에서 다시 자랐을까?</p>
    <div class="field-review-choices">${Object.entries(SEASON_REVIEW_ANSWERS).map(([id,label])=>button(label,'season-review-answer',id)).join('')}</div>
    ${u.activityFeedback?`<p class="field-review-feedback" role="status">${esc(u.activityFeedback)}</p>`:''}`}
 </div>`,'');
}
// Before/after pictures side by side, then one question about what happened between them.
const SEASON_CHOICES={cherry:[['new','죽은 나무 자리에 새 나무를 심었어요'],['growth','같은 나무의 가지에서 새잎과 꽃이 나왔어요'],['gone','겨울에 나무가 모두 죽어 사라졌어요']],sowthistle:[['gone','겨울에 풀이 뿌리까지 모두 사라졌어요'],['new','다른 곳에서 새 풀을 옮겨 심었어요'],['growth','땅속 뿌리가 살아 있어서 땅 위로 새싹이 나왔어요']]};
function seasonsCompare(s){
 const plant=s.seasonPlant,done=s.seasonExplained.includes(plant);
 return layout(`${plantTabs([{id:'cherry',name:'벚나무'},{id:'sowthistle',name:'씀바귀'}],'season-plant',plant)}${done?'<div class="evidence-bridge">겨울에 살아 있던 부분 → 다음 봄 새로 자란 부분</div>':'<p class="direct-hint">겨울과 다음 봄 그림을 견주어 보고, 아래 질문에 답해 줘.</p>'}<div class="season-pair">${[3,0].map(n=>{const key=`${plant}:${n}`,has=!!s.seasonPhotos[key];return `<figure class="evidence-photo"><strong>${seasonName(n)}</strong>${has?seasonArt(plant,n,s.seasonPhotos[key]?.underground===true):'<p>앞 활동에서 이 모습을 남겨 줘.</p>'}</figure>`;}).join('')}</div>${done?`<p class="season-discovery" role="status">${icon('check',20)} ${plant==='cherry'?'살아 있던 같은 나무의 겨울눈에서 새잎과 꽃이 나왔어.':'땅속 뿌리가 살아 있어서 땅 위로 새싹이 나왔어.'}</p><p class="direct-hint">네가 찾은 단서야. 아래 버튼으로 장소를 복구해 줘!</p>`:`<div class="reason-cards season-question"><p>겨울이 지나고 다음 봄, ${name(plant)}에게 무슨 일이 있었을까?</p>${SEASON_CHOICES[plant].map(([id,label])=>button(label,'season-explain',id,false)).join('')}</div>`}`,panel('계절을 이은 증거',`${['cherry','sowthistle'].map(p=>row(s.seasonExplained.includes(p),name(p)+'의 겨울과 다음 봄')).join('')}<p>겨울에 모두 없어진 걸까? 살아 있던 부분에서 다시 자라는지 살펴봐.</p>`));
}
// Bubbles leave the open air rooms of the cut piece (picture fractions), wobble up and pop at the water surface.
// [x,y,size,delay s,duration s,sideways px]; the surface line is measured from the water after render.
const PETIOLE_BUBBLES=[[.70,.52,22,0,1.7,-10],[.74,.60,16,.05,1.6,12],[.67,.66,26,.12,1.9,-14],[.72,.72,12,.2,1.5,8],[.76,.68,18,.28,1.8,16],[.69,.8,14,.35,1.9,-6],[.73,.47,10,.4,1.3,6],[.71,.62,28,.5,2,-8],[.66,.56,12,.58,1.6,-12],[.75,.78,20,.66,2,10],[.7,.84,16,.75,2.1,-4],[.73,.55,14,.85,1.6,14],[.68,.73,22,.95,1.9,-10],[.76,.5,12,1.05,1.5,8],[.71,.66,18,1.15,1.8,-6],[.67,.48,10,1.25,1.4,-8],[.74,.82,24,1.3,2.1,12],[.72,.58,12,1.45,1.6,4]];
const PETIOLE_POPS=[[.71,1.1],[.68,1.5],[.75,1.9],[.72,2.4],[.69,2.9]];
const petioleBubbles=()=>`<b class="petiole-bubbles" aria-hidden="true"><span>${PETIOLE_BUBBLES.map(([x,y,s,d,t,dx])=>`<i style="--x:${x};--y:${y};--s:${s};--dx:${dx}px;animation-delay:${d}s;animation-duration:${t}s"></i>`).join('')}${PETIOLE_POPS.map(([x,d])=>`<b style="--x:${x};animation-delay:${d}s"></b>`).join('')}</span></b>`;
function experiment(s,u){
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
function habitats(s,u){
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
function fieldGardenReview(s,u){
 const review=s.gardenReview,p=HABITAT_PLANTS.find(p=>p.id===review?.plant),done=gardenReviewReady(s);
 const bed=p=>{
  const picked=p.id===review?.plant,content=`${assetImage('habitat_'+p.habitat,'habitat-picture',true).replace(/alt="[^"]*"/,'alt=""')}${plantArt(p.id).replace(/alt="[^"]*"/,'alt=""')}<span><b>${p.name}</b><small>${HABITATS[p.habitat]}${picked&&done?' · 확인했어':''}</small></span>`;
  return done?`<div class="field-review-bed ${picked?'is-picked':''} ${picked&&review.cell!==review.from?'moved':''}">${content}</div>`:`<button type="button" class="field-review-bed ${picked?'is-picked':''} ${picked&&review.cell!==review.from?'moved':''}" data-action="garden-review-pick" data-id="${p.id}" aria-pressed="${picked}">${content}</button>`;
 };
 return layout(`<div class="work-board field-review-board garden-review-board">
  <p class="field-review-kicker">현장에서 심은 내 정원</p>
  <div class="field-review-beds">${['hyacinth','cherry','aloe'].map(id=>bed(HABITAT_PLANTS.find(p=>p.id===id))).join('')}</div>
  ${done?`<p class="field-review-result" role="status" tabindex="-1">${icon('check',20)} ${review.cell===review.from?'이 자리를 그대로 뒀어.':'같은 구역의 옆 자리로 옮겼어.'} <b>${p.reason}.</b></p>`:p?`
   <div class="garden-review-tools"><span>${p.name} · ${review.cell===review.from?'처음 심은 자리':'같은 구역의 옆 자리'}</span>${button(review.cell===review.from?'옆 자리로 옮기기':'처음 자리로 돌리기','garden-review-move')}</div>
   <p class="garden-review-question">이 자리에서 ${josa(p.name,'이/가')} 잘 살 수 있는 까닭은?</p>
   <div class="field-review-choices">${HABITAT_PLANTS.map(q=>button(q.reason,'garden-review-reason',q.id)).join('')}</div>`:
   '<p class="garden-review-question">세 식물 중 한 자리만 골라 살펴봐.</p>'}
  ${!done&&u.activityFeedback?`<p class="field-review-feedback" role="status">${esc(u.activityFeedback)}</p>`:''}
 </div>`,'');
}
function garden(s,u,grid,place){
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

export function nextHint(s,p){if(singleFieldRecord(s,p))return pageReady(s,p)?'발견을 기록했어. 아래 버튼으로 다음에 가자.':p===3?'겨울에 살아 있던 부분과 봄에 새로 자란 부분을 견줘 봐.':p===7?s.gardenReview?'고른 식물과 그 땅을 보고 까닭을 골라 봐.':'현장에서 심은 식물 중 한 자리를 골라 봐.':'현장에서 비를 내린 결과를 보고 두 부품의 역할을 골라 봐.';if((p===6||p===7)&&misplacedPlants(s).length)return misfitNote(s,misplacedPlants(s)[0]);if(p===6&&s.gardenReviewed&&!gardenPlaced(s))return '세 식물을 골라 어울리는 땅에 심어 줘.';if(p%2&&!s.completed[p]&&s.journeyRequired?.[Math.floor(p/2)]&&!fieldMissionReady(s,Math.floor(p/2)))return '현장 임무를 마치면 도구와 빛씨앗을 받을 수 있어. 위의 현장 임무로 가자!';if(pageReady(s,p))return '기록이 준비됐어. 다음으로 가도 좋아!';return [()=> '세 잎을 한꺼번에 크게 보고 모양을 견줘 봐.',()=> '가늘고 길쭉한 잎끼리 묶으면 은행잎의 짝은 어떻게 바뀔까?',()=> '겨울엔 땅속을 예상하고 확인해. 두 식물의 겨울·다음 봄을 찍어 줘.',()=> seasonEvidenceReady(s)?'겨울과 다음 봄 그림을 견주어 보고 두 식물의 질문에 답해 줘.':'앞 활동에서 겨울과 다음 봄 모습을 먼저 남겨 줘.',()=> '잎자루를 눌러 보고 공기 방울의 까닭을 골라 줘.',()=> '세 식물이 사는 곳과 특징을 보고, 잎에 물을 모아 두는 식물을 골라 봐.',()=>s.gardenReviewed?'세 식물을 어울리는 땅에 골라 심어 줘.':`세 환경을 각각 ${TERRAIN_MIN}칸 이상 만들고 식물 심기로 넘어가자.`,()=> gardenValid(s)?'내 정원 확인에서 소개할 자리 하나를 골라 줘. 땅 모양을 바꿔도 돼.':'세 식물의 자리를 살펴보고 각각의 까닭을 골라 줘.',()=> s.design.linked?'시험 전에 어느 가방이 덜 젖을지 예상해 줘.':'연잎에서 가방에 쓸 수 있는 특징을 골라 줘.',()=> '연잎 겉면을 쓰고, 부품 하나를 바꾼 시험과 까닭을 연결해 줘.'][p]();}
let moodMemo={p:-1,m:0};
function guideMood(s,u,p,ready){const m=s.misses[Math.floor(p/2)]||0,same=moodMemo.p===p,mood=ready?'happy':u?.bubbling?'surprise':same&&m>moodMemo.m?'think':'idle';moodMemo={p,m};return mood;}
const missNote=(s,i)=>missionDone(s,i)||!s.misses[i]?'':'<p class="microcopy miss-note">단서를 보고 고쳐 가는 중이야.</p>';
// 자동 진행 sits in the top bar under the sound/settings icons (app.js header).
// The field-results page has no bag test to run. Keep the original auto-play for every hands-on view.
export function activityAutoStep(s,u){
 return u.activityMode!=='field'&&s.page===9&&fieldBagReview(s)?null:nextAutoStep(s,u);
}
export const autoPlayButton=(s,u)=>`${button(icon(u.autoPlaying?'close':'spark')+(u.autoPlaying?' 자동 진행 멈추기':' 자동 진행'),'auto-play','',!!u.autoPlaying,u.autoPlaying||activityAutoStep(s,u)?'title="관찰하는 조작만 차례로 보여 줘. 나누기·예상·답은 직접 해 줘."':lock('이 단계는 학생이 직접 푸는 곳이야. 관찰하는 조작이 나오면 다시 눌러 줘.'))}`;
export function renderActivity(s,u,grid){
 const p=s.page,i=Math.floor(p/2),plan=EXPEDITIONS[i],fieldReady=fieldMissionReady(s,i),ready=pageReady(s,p),single=singleFieldRecord(s,p);
 // Remember the mode once chosen (also after a reload) so finishing the field mission does not silently switch screens.
 const field=(u.activityMode??=(!missionDone(s,i)&&s.journeyRequired?.[i]&&!fieldReady?'field':'explore'))==='field';
 const views=[()=>leaves(u),()=>classify(s,u),()=>seasons(s,u),()=>fieldSeasonReview(s)?fieldSeasonCompare(s,u):seasonsCompare(s),()=>experiment(s,u),()=>habitats(s,u),()=>garden(s,u,grid,false),()=>s.gardenFromField?fieldGardenReview(s,u):garden(s,u,grid,true),()=>renderDesign(s,u),()=>renderTests(s,u)];
 const scene=field?`<div class="learning-layout field-layout"><section class="learning-scene">${renderFieldMission(s,u,p)}</section>${fieldNextButton(s,u,p)}</div>`:views[p]();
 const help=field?plan.goal:nextHint(s,p),title=single?(p===3?'두 식물은 어떻게 봄을 맞았을까?':p===7?'정원 한 자리 살펴보기':'두 부품이 공책을 지킨 까닭'):PAGES[p][0];
 // In the field Leafy says what is left and where to tap, once the current step is finished.
 const todo=field?fieldTodo(s,u,p):null,guide=activityGuide(s,u);
 const reply=!field?{text:u.activityFeedback?esc(u.activityFeedback):help,success:ready}
  :fieldReady?{text:i!==0&&i!==2?'현장 임무 성공! 이제 현장 결과를 살펴보자.':'현장 임무 성공! 아래의 <b>발견을 연구 노트에 담기</b>를 눌러 줘.',success:true}
  :todo?.currentDone?{text:`이 단계는 끝! 이제 <b>${todo.i+1}번 ${todo.label}</b>만 남았어. 반짝이는 버튼을 눌러 가 보자.`,success:true}
  :fieldFeedback(u);
 const mood=ready||fieldReady||reply.success?'happy':field?'think':'idle';
 // Left panel = the sample's "오늘의 연구": today's steps, then Leafy's single reply bubble.
 const records=(single?[p]:[2*i,2*i+1]).map((q,n)=>{
  const done=s.completed[q]||((q<2||single)&&q===p&&ready);
  return `<li class="mission-step ${q===p?'active':''} ${done?'done':''}" ${q===p?'aria-current="step"':''}><b>${done?icon('check',16):n+1}</b><span>${single?title:PAGES[q][0]}</span></li>`;
 }).join('');
 const today=`<section class="today-panel" aria-label="오늘의 연구"><h2>${icon(field?'flag':'book',20)} ${field?'현장 임무':'오늘의 연구'}</h2>${field?renderFieldSteps(s,u,p):`<ol class="mission-journey today-steps">${records}</ol>${(p<2||single)&&ready?'':renderRemaining(guide)}`}${field||p>1&&!single?missNote(s,i):''}${field?'':`<details class="activity-purpose"><summary>이번 탐구는?</summary><p>${BRIDGE_NOTES[i]}</p></details>`}</section>`;
 return `<main class="activity tablet-activity exploration-activity activity-${p} ${field?'field-mission-view':single||p===5?'field-record-view':''}"><nav class="mission-journey-root" aria-label="이번 탐구의 여정"><button class="mission-step ${field?'active':''} ${fieldReady?'done':''}" data-action="journey-mode" data-id="field" aria-pressed="${field}"><b>${fieldReady?icon('check',16):'1'}</b><span>현장 임무</span></button><button class="mission-step ${!field?'active':''} ${missionDone(s,i)?'done':''}" data-action="journey-mode" data-id="explore" aria-pressed="${!field}"><b>2</b><span>탐구하며 기록</span></button>${missionDone(s,i)?`<button class="mission-step done" data-action="journey-reward"><b>${icon('check',16)}</b><span>받은 도구 보기</span></button>`:`<span class="mission-step"><b>3</b><span>${plan.tool} 받기</span></span>`}</nav><aside class="field-guide"><h1>${field?plan.title:title}</h1>${today}<div class="guide-talk"><p class="guide-bubble ${field?'mission-feedback':''} ${reply.success?'success':''}" role="status">${reply.text}</p><button type="button" class="guide-avatar" data-action="journey-help" aria-label="리피를 눌러 힌트 보기"><span class="guide-portrait" data-mood="${mood}" data-guide-scene="${p}:${field?'field':'explore'}"><span class="guide-motion">${assetImage('mood_leaf_'+mood,'guide-mascot',true)}</span></span><span class="guide-partner">리피 · 정원 구조대</span></button></div></aside>${scene}<footer class="learning-footer"><p class="next-condition sr-only">${field?(fieldReady?'현장 단서를 연구 기록에 이어 쓸 준비가 됐어.':'현장 임무를 마치면 다음으로 갈 수 있어.'):help}</p><div>${!field&&!single&&p%2?button(icon('back')+' 앞 활동','previous'):''}<span class="activity-route">${field?'현장 임무':single?'현장 기록 확인':p%2?'연구 기록 2 / 2':'연구 기록 1 / 2'} · 도구 ${earnedTools(s).length} / 5</span>${field?`<button class="btn primary ${fieldReady?'go-now':''}" data-action="journey-mode" data-id="explore" ${fieldReady?'':lock(todo?`${todo.i+1}번 ${josa(todo.label,'이/가')} 남았어. 왼쪽 현장 임무에서 눌러 줘.`:'현장 임무를 먼저 마쳐 줘.')}>${fieldReady&&i!==0&&i!==2?'현장 결과 확인하기':'발견을 연구 노트에 담기'} ${icon('arrow',18)}</button>`:`<button class="btn primary ${ready?'go-now':''}" data-action="complete" ${ready?'':lock(nextHint(s,p))}>${p%2?'장소 복구하고 보상 받기':p===8?'가방 시험하러 가기':'다음 기록'} ${icon('arrow',18)}</button>`}</div></footer></main>`;
}

export function renderFinal(s,grid,u={}){return `<main class="final-page tablet-final"><div class="page-heading"><div><h1>새 식물에도 써 볼까요?</h1><p>물 저장과 사는 곳을 연결해 봐.</p></div></div>${u.finalFeedback?`<p class="final-feedback" role="status">${esc(u.finalFeedback)}</p>`:""}${layout(`<div class="cactus-picture">${assetImage('cactus_plant','',true)}</div><h2>선인장은 두꺼운 줄기에 물을 저장해.</h2><p>어느 곳에서 생활하는 데 도움이 될까?</p><div class="learning-tabs final-habitat-choices">${Object.entries(HABITATS).map(([id,n])=>button(`${assetImage('habitat_'+id,'habitat-picture',true)}${n}`,'final-habitat',id,s.finalChecks.habitat&&id==='dry')).join('')}</div>`,panel('내 결과물도 확인했어',`${row(pageReady(s,7),'식물과 환경이 맞는 정원')}${!pageReady(s,7)?button('정원 살펴보기','repair-garden'):''}${row(pageReady(s,9),'현재 가방의 시험과 설명')}${!pageReady(s,9)?button('가방 살펴보기','repair-test'):''}${row(s.finalChecks.habitat,'새 식물의 특징과 환경 연결')}`))}<div class="center"><button class="btn primary" data-action="power-core" ${canFinish(s)?'':lock('정원·가방·새 식물 확인을 모두 마쳐 줘.')}>초록정원 깨우기</button></div></main>`;}
export function renderEnding(s,grid){return `<main class="ending ending-celebration">${assetImage('expedition_restored_garden_20261020','ending-background',true)}<div class="ending-celebration-title"><span>다섯 번의 발견, 하나의 초록정원</span><h1>우리가 정원을 깨웠어!</h1></div><article class="ending-note" aria-labelledby="ending-diary-title" tabindex="0"><h2 id="ending-diary-title">오늘의 탐험 일기</h2><p>잎을 살피고 식물을 나눴다.</p><p>겨울을 지나 다시 자란 식물도 만났다.</p><p>식물에게 맞는 정원도 꾸몄다.</p><p>연잎의 비밀로 가방까지 만들었다!</p><p>작은 발견이 멋진 발명이 되었다.</p><p><strong>나는 초록정원의 식물 연구원!</strong></p></article><div class="ending-sparkles" aria-hidden="true">${Array.from({length:10},(_,i)=>`<i style="--i:${i}">✦</i>`).join('')}</div><div class="certificate sr-only"><p>탐험 완료 기록이야. 이해한 내용은 연구 노트의 선택과 관찰 근거를 보며 함께 이야기해 봐.</p></div><div class="ending-actions">${button('내 연구 노트 펼치기','report')}${button('엔딩 영상 다시 보기','outro-replay')}${button('정원으로 돌아가기','map')}</div></main>`;}

// Each answer records the student's choice, not an automatic completion click.
// Wrong picks add a 'miss' (헛다리) to the mission and return a clue, never a penalty.
export function learningAction(s,u,a,id){
 const capture=coreResponse(s,u,a,id);
 const result=learningActionCore(s,u,a,id);
 capture?.();
 if(['season-plant','season'].includes(a))u.activityFeedback='';else if(typeof result==='string'&&result)u.activityFeedback=result;
 return result;
}
function learningActionCore(s,u,a,id){
  const p=HABITAT_PLANTS.find(p=>p.id===u.selected);
  switch(a){
    case 'season-review-answer':
      if(s.page!==3||!fieldSeasonReview(s)||s.seasonCompareAnswer||!Object.hasOwn(SEASON_REVIEW_ANSWERS,id))return '';
      if(id!=='parts'){addMiss(s,1);return '잎이 없던 겨울에도 남아 있었던 가지와 땅속을 살펴봐.';}
      s.seasonCompareAnswer=id;u.activityFeedback='';return '';
    case 'garden-review-pick':{
      if(s.page!==7||!s.gardenFromField||gardenReviewReady(s))return '';
      const cell=s.garden[id],current=s.gardenReview;
      if(!Number.isInteger(cell)||current?.plant===id)return '';
      // Switching the plant cancels the previous trial move, so the final review covers one site.
      if(current)s.garden[current.plant]=current.from;
      s.gardenReview={plant:id,from:cell,cell,explained:false};
      u.activityFeedback='';return '';
    }
    case 'garden-review-move':{
      const r=s.gardenReview;if(s.page!==7||!s.gardenFromField||!r||gardenReviewReady(s))return '';
      const next=r.cell!==r.from?r.from:[r.from+1,r.from-1,r.from+6,r.from-6].find(c=>c>=0&&c<24&&Math.abs(c%6-r.from%6)<=1&&s.terrain[c]===s.terrain[r.from]&&!plantAt(s,c));
      if(next===undefined)return '여기서는 지금 자리의 까닭을 살펴봐.';
      r.cell=next;s.garden[r.plant]=next;u.activityFeedback='';return '';
    }
    case 'garden-review-reason':{
      const r=s.gardenReview;if(s.page!==7||!s.gardenFromField||!r||gardenReviewReady(s)||!HABITAT_PLANTS.some(p=>p.id===id))return '';
      const plant=HABITAT_PLANTS.find(p=>p.id===r.plant);
      if(id!==r.plant){addMiss(s,3);return `${plant.name}의 특징이 ${HABITATS[plant.habitat]}에서 어떤 도움을 주는지 다시 봐.`;}
      r.explained=true;s.gardenPhoto=gardenSnapshot(s);u.activityFeedback='';return '';
    }
    case 'bag-review-answer':
      if(s.page!==9||!fieldBagReview(s)||s.bagReviewAnswer||!Object.hasOwn(BAG_REVIEW_ANSWERS,id))return '';
      if(id!=='both'){addMiss(s,4);return id==='surface'?'연잎 겉면만 단 가방을 봐. 입구는 어떻게 되어 있었지?':'덮개만 단 가방을 봐. 보통 천 위의 물방울은 어떻게 됐지?';}
      s.bagReviewAnswer=id;u.activityFeedback='';return '';
    case 'leaf-zoom':
      if(s.page!==0||!['large','normal'].includes(id))return '';
      u.leafZoom=id==='large';if(u.leafZoom)s.leafComparisonSeen=true;return '';
    case 'leaf-partner':
      if(s.page!==1||!pageReady(s,0)||s.completed[1]||s.leafPartner||!['cherry','grass'].includes(id))return '';
      if(id!==LEAF_PARTNER){addMiss(s,0);return '강아지풀처럼 가늘고 길쭉한지, 은행잎의 폭을 다시 살펴봐.';}
      s.leafPartner=id;u.activityFeedback='';return '';
    case 'season-plant':if(s.seasonPlant!==id)s.underground=false;s.seasonPlant=id;u.budLens=false;u.budLook=null;return '';
    case 'season':u.budLens=false;u.budLook=null;if([3,4].includes(Number(id))&&!s.seasonPrediction[s.seasonPlant])s.underground=false;return false;
    case 'bud-lens':if(s.season!==3||!seen(s))return '겨울 땅속을 확인한 뒤에 렌즈로 겨울눈을 찾을 수 있어.';u.budLens=!u.budLens;u.budLook=null;return u.budLens?(s.seasonPlant==='cherry'?'렌즈를 들었어. 겨울눈이 있을 것 같은 곳을 눌러 봐.':'렌즈를 들었어. 봄에 새잎이 나올 곳을 눌러 봐.'):'';
    case 'bud-look':{if(s.season!==3||!seen(s)||!u.budLens)return '';const [x,y,w,h]=String(id).split(',').map(Number),plant=s.seasonPlant,found=s.budsFound[plant],r=lookForBud(plant,x,y,found);if(!r.message)return '';if(r.hit)found.push([+x.toFixed(3),+y.toFixed(3)]);u.budLook={plant,x:+x.toFixed(3),y:+y.toFixed(3),hit:r.hit,...lensView(x,y,w,h)};return r.message+(r.hit&&budsFoundCount(s)===BUD_TOTAL?' 뿌리와 겨울눈, 겨울을 나는 부분을 모두 찾았어!':'');}
    case 'bud-hint':{if(s.season!==3||!seen(s))return '';const spot=nextBudSpot(s.seasonPlant,s.budsFound[s.seasonPlant]);if(!spot)return '이 식물의 겨울눈은 모두 찾았어.';u.budLens=true;recordHint(s,1);const [w,h]=String(id).split(',').map(Number);return learningActionCore(s,u,'bud-look',`${spot[0]},${spot[1]},${w},${h}`);}
    case 'season-predict':if(!['roots','none'].includes(id))return '';if(seen(s)||s.seasonPrediction[s.seasonPlant])return '처음 예상은 보관했어. 관찰한 결과를 사진으로 남기자.';s.seasonPrediction[s.seasonPlant]=id;return '예상을 남겼어. 땅속 보기로 확인해 봐.';
    case 'underground':if([3,4].includes(s.season)&&!s.seasonPrediction[s.seasonPlant])return s.season===4?'먼저 겨울에서 땅속을 예상해 줘.':'먼저 땅속에 무엇이 있을지 예상해 줘.';s.underground=!s.underground;if(s.underground&&[3,4].includes(s.season)&&!seen(s)){s.undergroundSeen.push(s.seasonPlant);return s.seasonPrediction[s.seasonPlant]==='roots'?'예상처럼 땅속에 뿌리가 남아 있어!':'예상과 달라! 땅속에 뿌리가 살아 있어.';}return '';
    case 'garden-photo':{if(!gardenPlants(s).length)return '먼저 식물을 심고 찍어 줘.';s.gardenPhoto=gardenSnapshot(s);return '내 정원을 찍어서 연구 노트에 붙였어!';}
    case 'record-season':{if(s.season===4)return '초봄은 살펴보는 단계야. 사진은 겨울과 다음 봄에 남겨 줘.';const key=`${s.seasonPlant}:${s.season}`;if(!s.seasonalRecords.includes(key))s.seasonalRecords.push(key);s.seasonPhotos[key]={underground:s.underground};return `${seasonName(s.season)} 모습을 찍어서 연구 노트에 붙였어!`;}
    case 'season-explain':if(!['growth','gone','new'].includes(id))return '';if(id!=='growth'){addMiss(s,1);return id==='new'?(s.seasonPlant==='cherry'?'두 그림의 줄기와 뿌리 모양을 견줘 봐. 같은 나무일까?':'두 그림의 땅속 뿌리를 견줘 봐. 같은 뿌리일까?'):s.seasonPlant==='cherry'?'다음 해 봄 사진을 봐. 같은 나무 가지에 무엇이 돋았어?':'겨울 땅속 사진을 다시 봐. 무엇이 남아 있었어?';}if(!seasonEvidenceReady(s))return '앞 활동에서 겨울과 다음 봄 모습을 먼저 남겨 줘.';s.seasonExplanation=s.seasonPlant;if(!s.seasonExplained.includes(s.seasonPlant))s.seasonExplained.push(s.seasonPlant);return '겨울을 지나 다시 자라는 모습을 연결했어.';
    case 'experiment-predict':if(s.experiment.prediction||s.experiment.step>=4)return '처음 예상은 보관했어. 실험 결과와 견줘 보자.';if(['bubbles','none'].includes(id))s.experiment.prediction=id;return '';
    case 'lab-next':if(id==='cut'&&s.experiment.step===0)s.experiment.step=1;else if(id==='water'&&s.experiment.step>=1)s.experiment.step=3;return '';
    case 'experiment-answer':if(s.experiment.step<4)return '먼저 물속 잎자루를 눌러 봐.';if(id!=='air'){addMiss(s,2);return fieldMissionReady(s,2)?'현장에서 두 모형을 물에 넣었을 때, 공기 방이 있던 모형은 어디에 있었지?':'흙은 물속에서 가라앉아. 위로 떠오른 방울은 무엇일까?';}s.experimentAnswer='air';s.experiment.step=5;return fieldMissionReady(s,2)?'잎자루 속 공기는 부레옥잠이 물에 뜨는 데 도움을 줘.':'속에 있던 공기가 방울이 되어 나왔어.';
    case 'habitat-compare-answer':
      if(s.page!==5||!pageReady(s,4)||pageReady(s,5)||!HABITAT_PLANTS.some(p=>p.id===id))return '';
      if(id!==HABITAT_COMPARE_PLANT){addMiss(s,2);return '세 식물 중 어느 식물이 잎에 물을 모아 두는지 다시 찾아봐.';}
      s.habitatCompareAnswer=id;u.activityFeedback='';return '';
    case 'garden-pick':{const q=HABITAT_PLANTS.find(x=>x.id===id);if(!q)return '';const eun=(q.name.charCodeAt(q.name.length-1)-0xAC00)%28?'은':'는';if(s.terrain[s.garden[q.id]]!==q.habitat)return `${q.name}${eun} 아직 어울리는 땅에 없어. 먼저 옮겨 심어 줘.`;s.gardenPick=id;return `내 정원 소개: ${q.name}${eun} ${HABITATS[q.habitat]}에 심었어. ${q.reason}.`;}
    case 'garden-answer':{if(!p)return '';if(!Number.isInteger(s.garden[p.id]))return '먼저 식물을 땅에 심어 줘.';const t=s.terrain[s.garden[p.id]];if(t!==p.habitat){addMiss(s,3);return `지금 심은 곳은 ${josa(HABITATS[t]||'빈 땅','이야/야')}. 앞에서 이은 사는 곳과 같은지 봐.`;}if(id!==p.id){const o=HABITAT_PLANTS.find(x=>x.id===id);addMiss(s,3);return `그건 ${josa(o?o.name:'다른 식물','을/를')} 심는 까닭이야. ${p.name}의 특징을 떠올려 봐.`;}if(!s.gardenReasons.includes(p.id))s.gardenReasons.push(p.id);return '이곳에 심은 까닭을 기록했어.';}
    case 'garden-ready':if(terrainReady(s)){s.gardenReviewed=true;u.gardenMode='plant';u.selected='hyacinth';return '이제 식물을 골라 어울리는 땅에 심어 줘.';}return `물가·들판·건조 구역을 각각 ${TERRAIN_MIN}칸 이상 만들어 줘.`;
    case 'terrain-preset':u.undo.push({terrain:[...s.terrain],garden:{...s.garden},extras:[...s.gardenExtras],reasons:[...s.gardenReasons]});s.terrain=id==='blank'?Array(24).fill('empty'):presetTerrain();s.garden={};s.gardenExtras=[];s.gardenReasons=[];s.gardenReviewed=false;return '';
    case 'design-answer':if(id!=='roll')addMiss(s,4);return false;
    case 'test-predict':if(!['surface','cover'].includes(id))return '';if(s.testPrediction)return '시험을 시작했으니 처음 예상을 그대로 둘게.';s.testPrediction=id;return '예상을 남겼어. 시험해서 확인해 봐.';
    case 'test-explain':{const pair=comparisonPair(s);if(!pair)return '부품 하나만 다른 두 시험이 필요해.';if(id!==pair.part){addMiss(s,4);return pair.part==='surface'?'이번엔 입구는 그대로였어. 바뀐 겉면 결과를 견줘 봐.':'이번엔 겉면은 그대로였어. 수첩이 젖었는지 견줘 봐.';}s.testExplanation={key:pair.last.key,before:pair.before.key,part:pair.part};s.inventionExplanations??={};s.inventionExplanations[pair.part]={...s.testExplanation};return '바꾼 부품이 하는 일을 설명했어.';}
    // Runs before app.js complete(): award the stamp on the mission's last page, then let app.js continue.
    case 'complete':{const p=s.page;if(s.screen==='activity'&&p%2&&pageReady(s,p)&&(s.completed[p-1]||singleFieldRecord(s,p)))awardStamp(s,Math.floor(p/2));return false;}
    case 'highlight':s.highlight=Number(id);return '';
    default:return false;
  }
}

export function renderReport(s,u={}){return renderResearchNotebook(s,u);}
