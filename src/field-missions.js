import {assetImage} from './asset-catalog.js';
import {icon,plantArt,seasonArt,bagArt} from './art.js';
import {mountGardenHands} from './field-hands-garden.js';
import {FIELD_LEAVES,FIELD_ORDER,FIELD_ZONES,FIELD_ENV,FIELD_PLANTS,normalizeFieldEvidence,fieldSteps,fieldMissionReady,fieldBagPair,fieldBagKey,FIELD_BAG_ROLES,applyFieldAction} from './field-missions-state.js';
import {mountFloatHands} from './field-hands-float.js';
import {mountBagHands} from './field-hands-bag.js';
import {mountLens,mountLeafSwipe} from './field-hands-leaf.js';
import {mountSeasonHands,timeDial,LINK_HANDLE,LINK_CUT,DIG_TOP,DIG_CELLS} from './field-hands-season.js';
export {normalizeFieldEvidence,fieldMissionReady};
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const btn=(label,action,id='',cls='')=>`<button type="button" class="btn mission-tool ${cls}" data-action="${action}" data-id="${esc(id)}">${label}</button>`;
const source=(label,item,u,cls='')=>`<button type="button" class="mission-tool field-token ${u.selected===item?'selected':''} ${cls}" data-action="field-select" data-id="${esc(item)}" data-field-item="${esc(item)}" aria-pressed="${u.selected===item}" draggable="false">${label}</button>`;
const target=(label,id,cls='')=>`<button type="button" class="field-target ${cls}" data-action="field-drop" data-id="${esc(id)}" data-field-drop="${esc(id)}">${label}</button>`;
const envNames={water:'물가',grass:'풀밭',dry:'건조한 곳'};
const plantNames={hyacinth:'부레옥잠',cherry:'벚나무',aloe:'알로에'};
// Both models copy a water hyacinth leaf stalk: same outside, only the inside differs.
const modelName=id=>id==='air'?'공기 방 모형':'꽉 찬 모형';
const modelInside=id=>id==='air'?'속에 공기 방이 여러 개':'속을 흙으로 꽉 채웠어';
const stages=[['돋보기로 찾기','톱니로 나누기','새 기준으로 나누기'],['살아 있는 부분 잇기','나무 시간 잇기','풀 시간 잇기'],['결과 예상하기','같은 수조에서 시험','관찰 결과 연결하기'],['비 내려 땅 살펴보기','알맞은 땅에 심기','정원에 비 내리기'],['의뢰 가방 조립','부품 하나만 비교','역할 설명하고 완성']];
const objectives=[['단풍나무의 가운데와 가장자리를 돋보기로 살펴봐.','표본 카드를 톱니가 있는 잎과 없는 잎 바구니로 휙 튕겨 봐.','같은 잎을 이번에는 가늘고 긴 모양인지로 다시 나눠 봐.'],['겨울에 살아 있는 부분을 다음 봄의 같은 부분에 이어 줘.','시간 다이얼을 돌려 같은 벚나무가 겨울을 지나 다시 자라는 모습을 지켜봐.','땅속 카메라로 씀바귀가 다시 자라는 모습을 보고 새싹이 돋은 곳을 찾아 줘.'],['두 모형을 물에 넣으면 어떻게 될지 스위치로 예상해 줘.','두 모형을 같은 수조에 넣고, 떠 있는 모형을 물속으로 꾹 눌러 봐.','잎자루를 잘라 공기 방을 보고, 떠 있던 모형과 이어 줘.'],['구름을 눌러 비를 내리고, 빗물이 고이는 곳·스며드는 곳·흘러가는 곳을 살펴봐.','세 식물을 각각 잘 살 수 있는 땅으로 옮겨 심어 줘.','정원에 비를 내려 세 식물이 잘 자라는지 확인해 봐.'],['가방의 ①② 자리를 톡톡 눌러 부품을 골라 조립해 줘.','구름을 눌러 같은 비를 내려 봐. 부품 하나를 바꿔 다시 시험해.','두 시험 가방을 비교해서 바뀐 부품에 손가락으로 동그라미를 쳐 줘.']];

function leafPicture(id){
 return assetImage('field_leaf_'+id,'field-leaf-picture leaf-'+id,true);
}
const edgeNote=p=>p.edge?'작은 톱니가 이어져 있어':'큰 톱니가 없어';
function lensClue(p,kind,found,fresh){const text=kind==='shape'?`모양 · ${p.shape}`:`가장자리 · ${edgeNote(p)}`;return `<span class="lens-clue ${found?'found':''} ${fresh?'just-found':''}" data-clue="${p.id}:${kind}" data-text="✓ ${text}">${found?'✓ '+text:`? ${kind==='shape'?'잎 가운데를 살펴봐':'가장자리를 살펴봐'}`}</span>`;}
const sortLabel=(rule,answer)=>rule==='edge'?(answer==='yes'?'톱니가 있어':'큰 톱니가 없어'):(answer==='yes'?'가늘고 길어':'가늘고 긴 모양은 아니야');
const leafClue=(e,p,rule)=>e.leaves.scans[p.id].includes(rule==='edge'?'edge':'shape')?(rule==='edge'?edgeNote(p):p.shape):'그림에서 직접 살펴봐';
// The clue drawer fills one notch per clue and slides open on the last one.
function clueDrawer(e,u){
 const n=e.leaves.scans.maple.length,all=n===2,opening=all&&!!u.lastFound&&!u.drawerOpened;if(all)u.drawerOpened=true;
 return `<span class="clue-drawer ${all?'open':''} ${opening?'opening':''}" data-clue-gauge="${n}" role="status" aria-label="단풍나무 단서 ${n}/2"><span class="drawer-pop" aria-hidden="true">${FIELD_LEAVES.map(p=>leafPicture(p.id)).join('')}</span><span class="drawer-box" aria-hidden="true"><i></i></span><span class="drawer-meter" aria-hidden="true"><b>${all?'서랍이 열렸어!':`단서 ${n}/2`}</b><span class="clue-bar"><i style="width:${n/2*100}%"></i></span></span></span>`;
}
function leaves(e,u,stage){
 if(stage===0){const all=e.leaves.scans.maple.length===2;return `<div class="lens-bench" data-lens-bench><p class="lens-hint"><span>${all?'단서를 다 모았어! 서랍에서 나온 잎을 <b>나누러</b> 가 보자.':'돋보기를 단풍나무의 <b>가운데</b>와 <b>가장자리</b>에 대고 잠깐 멈춰 봐. 다른 잎도 더 살펴볼 수 있어.'}</span>${clueDrawer(e,u)}</p><div class="field-leaf-tray">${FIELD_LEAVES.map(p=>{const s=e.leaves.scans[p.id];return `<article class="field-specimen"><h3>${p.name}</h3><div class="lens-leaf" data-lens-leaf="${p.id}">${leafPicture(p.id)}${s.map(k=>`<span class="leaf-spark ${u.lastFound===p.id+':'+k?'fresh':''}" data-spark="${p.id}:${k}" aria-hidden="true"></span>`).join('')}</div><div class="lens-clues">${['shape','edge'].map(k=>lensClue(p,k,s.includes(k),u.lastFound===p.id+':'+k)).join('')}</div><div class="lens-fallback">${target('잎 가운데 살펴보기','scan:'+p.id+':shape','field-hotspot')}${target('가장자리 살펴보기','scan:'+p.id+':edge','field-hotspot')}</div></article>`;}).join('')}</div><div class="field-lens" data-lens aria-hidden="true"><div class="field-lens-glass"><img alt=""></div><span class="field-lens-ring"></span></div></div>`;}
 // Stage 2 throws left/right; stage 3 reshuffles the same leaves and throws up/down.
 const rule=stage===1?'edge':'narrow',vertical=stage===2,thrown=u.leafThrown;u.leafThrown='';
 const placed=p=>e.leaves[rule][p.id]===(p[rule]?'yes':'no'),deck=FIELD_LEAVES.filter(p=>!placed(p)),shuffle=vertical&&!u.leafShuffled&&deck.length===3;if(vertical)u.leafShuffled=true;
 const card=(p,i)=>`<div class="swipe-card ${i===0&&thrown===p.id?'bounced':''}" ${i===0?'data-swipe-top':''} data-swipe-card="${p.id}" style="--i:${i}" aria-hidden="true">${leafPicture(p.id)}<strong>${p.name}</strong><small class="leaf-token-clue">${leafClue(e,p,rule)}</small>${vertical&&e.leaves.edge[p.id]?`<span class="swipe-before">아까는 · ${sortLabel('edge',e.leaves.edge[p.id])}</span>`:''}</div>`;
 const bin=answer=>`<div class="swipe-bin bin-${answer}" data-swipe-bin="${answer}"><span class="swipe-arrow" aria-hidden="true"></span><strong>${sortLabel(rule,answer)}</strong><span class="swipe-bin-leaves">${FIELD_LEAVES.filter(p=>placed(p)&&e.leaves[rule][p.id]===answer).map(p=>`<span class="${thrown===p.id?'fresh':''}">${leafPicture(p.id)}${p.name}</span>`).join('')}</span></div>`;
 const empty=vertical?`<div class="swipe-done"><strong>같은 잎도 기준이 바뀌면 다른 바구니로 가!</strong><ul>${FIELD_LEAVES.map(p=>`<li>${leafPicture(p.id)}<b>${p.name}</b><span>${e.leaves.edge[p.id]?sortLabel('edge',e.leaves.edge[p.id]):'-'}</span><span>${sortLabel('narrow',e.leaves.narrow[p.id])}</span></li>`).join('')}</ul></div>`:'<div class="swipe-done"><strong>세 표본을 모두 나눴어!</strong></div>';
 return `<p class="lens-hint season-hint"><span>${vertical?'이번엔 바구니가 <b>위아래</b>에 있어. 카드를 위나 아래로 <b>휙</b> 튕겨 봐.':'가운데 카드를 손가락으로 <b>왼쪽이나 오른쪽</b>으로 <b>휙</b> 튕겨서 바구니에 넣어 봐.'}</span></p><div class="swipe-sort ${vertical?'axis-y':'axis-x'} ${shuffle?'shuffling':''}" data-swipe-sort="${rule}" data-axis="${vertical?'y':'x'}">${bin('yes')}<div class="swipe-deck">${deck.length?deck.slice(0,3).map(card).reverse().join('')+`<span class="swipe-count">남은 표본 <b>${deck.length}</b>장</span><span class="swipe-tip" aria-hidden="true">조금 더 빠르게 휙!</span>${shuffle?'<span class="swipe-shuffle" aria-hidden="true">기준이 바뀌었어 · 다시 섞는 중</span>':''}`:empty}</div>${bin('no')}</div><div class="lens-fallback">${FIELD_LEAVES.map(p=>source(`${p.name} · ${leafClue(e,p,rule)}`,'leaf:'+p.id,u,'field-leaf-token')).join('')}${['yes','no'].map(answer=>target(sortLabel(rule,answer),`sort:${rule}:${answer}`,'field-sort-bin')).join('')}</div>${deck.length?'<p class="microcopy">관찰 그림의 특징으로 나누는 활동이야. 식물 이름이 기준은 아니야.</p>':''}`;
}
function seasons(e,u,stage){
 if(stage===0&&!['tree','herb'].every(k=>e.seasons.predictions[k]))return `<div class="field-season-predictions"><p class="direct-hint">도움 없는 첫 예상 · 겨울에 잎이 보이지 않으면 땅속은 어떨까?</p>${['tree','herb'].map(k=>`<section><h3>${k==='tree'?'벚나무':'씀바귀'}</h3><div class="field-predict-picture">${seasonArt(k==='tree'?'cherry':'sowthistle',3,false)}</div>${e.seasons.predictions[k]?'<p>처음 예상을 보관했어.</p>':btn('뿌리가 남아 있을 것 같아','field-season-predict',k+':roots')+btn('아무것도 없을 것 같아','field-season-predict',k+':none')}</section>`).join('')}</div>`;
 if(stage===0)return `<p class="lens-hint season-hint"><span>겨울 그림의 <b>흙을 문질러</b> 걷어 내고, 빛나는 점을 옆 <b>다음 봄 그림</b>으로 끌어 <b>같은 부분이 있는 칸</b>에 놓아 봐.</span></p><div class="field-season-pairs">${['tree','herb'].map(kind=>{const plant=kind==='tree'?'cherry':'sowthistle',linked=e.seasons.links[kind],dug=linked||u.dug?.[kind],[hx,hy]=LINK_HANDLE[kind],right=linked===(kind==='tree'?'trunk':'root'),awaiting=dug&&!right;return `<article class="field-season-pair ${awaiting?'awaiting':''}" data-season-pair="${kind}"><h3>${kind==='tree'?'벚나무':'씀바귀'}</h3><div class="field-season-images"><div><div class="season-dig" data-dig="${kind}">${seasonArt(plant,3,true)}${dug?`<span class="link-handle ${linked?'linked':''}" data-link-handle="${kind}" style="left:${hx*100}%;top:${hy*100}%"></span>`:`<div class="dig-cover" style="top:${DIG_TOP*100}%">${'<i></i>'.repeat(DIG_CELLS)}</div>`}</div><p class="season-cap">겨울 · ${right?'이었어':linked?'점을 다시 끌어 봐':dug?'점을 옆 그림으로 끌어 봐':'흙을 문질러 봐'}</p></div><div><div class="link-target" data-link-target="${kind}" style="--cut:${LINK_CUT[kind]*100}%">${seasonArt(plant,0,true)}<span class="link-zone upper ${linked==='leaf'?'picked':''}">새로 나온 잎</span><span class="link-zone lower ${linked&&linked!=='leaf'?'picked':''}">${kind==='tree'?'같은 줄기와 뿌리':'살아 있던 뿌리'}</span></div><p class="season-cap">다음 봄${awaiting?' · 같은 부분 칸에 놓기':''}</p></div></div><svg class="link-line" aria-hidden="true"><line/></svg>${awaiting?'<span class="link-ghost" aria-hidden="true"></span>':''}<div class="lens-fallback">${(kind==='tree'?['trunk','leaf']:['root','leaf']).map(part=>target(`${part==='trunk'?'같은 줄기와 뿌리':part==='root'?'살아 있던 뿌리':'새로 나온 잎'}에 잇기`,`link:${kind}:${part}`)).join('')}</div></article>`;}).join('')}</div>`;
 const kind=stage===1?'tree':'herb';
 // Keyboard path: one full turn of the hand, then evidence buttons for where it regrew.
 const keys=btn('바늘 한 바퀴 돌리기','field-season-turn',kind)+btn('같은 가지에서 새눈이 돋았어','field-season-clue',kind+':branches')+btn('땅속 뿌리에서 새싹이 돋았어','field-season-clue',kind+':rootbud')+btn('꽃 색깔만 같아','field-season-clue',kind+':color');
 return timeDial(e,u,kind,keys);
}
function modelArt(id){return assetImage(id==='air'?'float_model_air':'float_model_solid','field-float-model',true);}
const recName={float:'수면',sink:'바닥'};
// Hands-on stage 1: the palm shows how heavy each model is; push its switch up (float) or down (sink).
function heftCard(id,f){
 const pred=f.predictions[id];
 const label=r=>`<span class="sw-label ${r}" data-heft-pick="${r}">${r==='float'?'뜰 것 같아':'가라앉을 것 같아'}</span>`;
 return `<div class="float-heft lifted" data-heft="${id}" ${pred?'data-done="1"':''}><div class="heft-palm" role="img" aria-label="${modelName(id)}을 든 손바닥"><span class="heft-model">${modelArt(id)}</span><span class="heft-hand" aria-hidden="true"></span></div><div class="heft-side"><strong>${modelName(id)}</strong><small class="heft-inside">${modelInside(id)}</small><span class="heft-meter" aria-hidden="true"><i style="--w:${id==='air'?.32:.92}"></i></span><span class="heft-word">${pred?'처음 예상을 보관했어':id==='air'?'들어 보면 가뿐해':'들어 보면 묵직해'}</span></div><div class="heft-switch ${pred?'set-'+pred:''}" data-heft-switch>${label('float')}<span class="sw-track"><b class="sw-knob" aria-hidden="true"></b></span>${label('sink')}</div></div>`;
}
function floatTank(f,u,stage,extra=''){
 const tag=id=>stage!==2?'':f.reason===id?'<span class="float-tag">공기 방 ✓</span>':`<span class="float-tag rec">${recName[f.observed[id]]}</span>`;
 return `<div class="float-tank" data-float-tank role="group" aria-label="같은 물이 담긴 수조">${f.tested.map(id=>`<div class="float-model in-tank rest-${id}" data-tank-model="${id}" style="--x:${u.floatX?.[id]??(id==='air'?.32:.68)}" role="img" aria-label="${modelName(id)}: ${id==='air'?'수면에 떠 있어':'수조 바닥에 있어'}">${modelArt(id)}${tag(id)}</div>`).join('')}${extra}<span class="float-say" aria-live="polite"></span><span class="float-tank-label">같은 물 수조</span></div>`;
}
const PETIOLE_ROOMS=[[.735,.34],[.69,.43],[.6,.425],[.57,.57],[.66,.51],[.476,.585],[.465,.69]];
function petiole(phase){
 const open=phase!=='cut';
 return `<div class="float-petiole"><div class="petiole-cut ${open?'open':''}" data-petiole="${phase}">${assetImage('hyacinth_petiole_cutaway','petiole-in',true)}${assetImage('hyacinth_petiole_whole','petiole-skin',true).replace(/alt="[^"]*"/,'alt=""')}<svg class="cut-trail" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><polyline points=""/></svg>${PETIOLE_ROOMS.map(([x,y],i)=>`<span class="air-room" data-air-room="${i}" style="left:${x*100}%;top:${y*100}%" aria-hidden="true"></span>`).join('')}</div><p class="petiole-count" aria-live="polite">${open?'공기 방이 가득해! 톡 누르면 뽀글':'부레옥잠 잎자루'}</p></div>`;
}
// The cut opens the air rooms and lets their bubbles out by itself, then the floating model is linked.
const floatPhase=(f,u)=>f.reason?'done':u.floatCut?'reason':'cut';
const FLOAT_HINT={cut:'손가락으로 잎자루를 따라 <b>쓱 그어</b> 잘라 열어 봐.',reason:'공기 방을 봤지? 같은 원리로 떠 있던 모형을 수조에서 <b>톡</b> 눌러 봐.',done:'잎자루의 공기 방과 떠 있던 모형을 연결했어!'};
function floatLab(e,u,stage){
 const f=e.float;
 const hint=html=>`<p class="lens-hint season-hint float-hint"><span>${html}</span></p>`;
 const keys=(...items)=>`<div class="lens-fallback">${items.join('')}</div>`;
 if(stage===0)return `<div class="float-origin">${assetImage('hyacinth_petiole_cutaway','float-origin-pic',true)}<p><b>부레옥잠</b>의 볼록한 잎자루를 잘라 보면 속에 작은 <b>공기 방</b>이 가득해. 리피가 이 잎자루를 본떠 <b>겉 크기는 같고 속만 다른</b> 모형 두 개를 만들었어.</p></div>${hint('스위치를 <b>위·아래로 밀어</b> 예상을 남겨 봐.')}<div class="float-lab predict">${['air','solid'].map(id=>heftCard(id,f)).join('')}</div>${keys(...['air','solid'].filter(id=>!f.predictions[id]).map(id=>source(modelName(id),'model:'+id,u)),...['float','sink'].map(r=>target(r==='float'?'물 위에 뜰 것 같아':'물속으로 내려갈 것 같아',`predict:${r}`)))}<p class="microcopy">예상이 달라도 괜찮아. 모형 속과 무게를 보고 골라 봐.</p>`;
 if(stage===1)return `${hint('모형을 <b>톡</b> 눌러 수조에 퐁당 넣고, 떠 있는 모형은 물속으로 <b>꾹 눌러</b> 봐.')}<div class="float-lab test"><div class="float-bench">${['air','solid'].filter(id=>!f.tested.includes(id)).map(id=>`<div class="float-model on-bench" data-float-item="${id}" data-ready="${!!f.predictions[id]}">${modelArt(id)}<span>${modelName(id)}</span></div>`).join('')||'<p class="float-empty">두 모형을 모두 시험했어. 다시 꾹 눌러 봐도 돼.</p>'}</div>${floatTank(f,u,stage,'<span class="float-press" data-press-gauge aria-hidden="true"><i></i><b>손가락 힘</b></span>')}</div>${keys(...['air','solid'].map(id=>source(modelName(id),'model:'+id,u)),target('수조에 넣기','tank'))}<p class="microcopy">두 모형 모두 시험해야 공기 공간의 역할을 견줄 수 있어.</p>`;
 const phase=floatPhase(f,u);
 return `${hint(FLOAT_HINT[phase])}<div class="float-lab record" data-phase="${phase}">${floatTank(f,u,stage)}${petiole(phase)}</div>${keys(source('안에 공기가 차지하는 공간','reason:air-space',u),...['air','solid'].map(m=>target(`${f.reason===m?'✓ ':''}공기 공간 카드를 ${modelName(m)}에 붙이기`,`reason:${m}`)))}`;
}
// Mission 4: one cloud tap shows how rain behaves on three beds and makes their ground; plant cards go onto
// the matching ground (a wrong bed shakes the card back); one more cloud tap rains on the finished garden.
const BED={pond:'움푹 파인 낮은 땅',meadow:'평평한 흙땅',ridge:'높고 모래가 많은 땅'};
const RAINED={water:'빗물이 고여 있어',grass:'빗물이 흙에 스며들었어',dry:'빗물이 흘러가 말라 있어'};
const gardenHint=['구름을 <b>톡</b> 눌러 비를 내려 봐. 빗물이 어디에 <b>고이고</b>, <b>스며들고</b>, <b>흘러가는지</b> 살펴봐.','식물 카드를 알맞은 땅으로 <b>끌어다 놓아</b> 봐. 카드를 톡, 땅을 톡 눌러도 돼.','구름을 <b>톡</b> 눌러 정원에 비를 내려 봐. 세 식물이 잘 자랄까?'];
function garden(e,u,stage){
 const g=e.garden,[grounded,,rained]=fieldSteps(e,3),missed=u.gardenMiss,done=stage===0?grounded:rained;u.gardenMiss='';
 const cloud=stage===1?'':`<button type="button" class="garden-cloud-btn" data-action="${stage===0?'field-garden-ground':'field-garden-rain'}" ${done?'aria-disabled="true" data-reason="벌써 비를 내렸어."':''}><span class="garden-cloud-art" aria-hidden="true"></span><b>${done?'비가 내렸어':stage===0?'구름 톡! 비 내리기':'구름 톡! 정원에 비 내리기'}</b></button>`;
 const cards=stage===1?`<div class="garden-cards">${Object.entries(plantNames).filter(([id])=>!g.plants[id]).map(([id,n])=>source(`${plantArt(id)}<span>${n}</span>`,'plant:'+id,u,'garden-card')).join('')||'<p class="garden-done">세 식물을 모두 심었어!</p>'}</div>`:'';
 const zones=FIELD_ZONES.map(z=>{const env=g.environments[z],p=Object.keys(FIELD_PLANTS).find(p=>g.plants[p]===z);
  const inner=`<i class="zone-state" data-zone="${z}" data-env="${env||''}" data-plant="${p||''}" hidden></i><span class="zone-ground" aria-hidden="true">${env?assetImage('habitat_'+env,'zone-ground-picture',true):''}</span><span class="zone-water" aria-hidden="true"></span><strong>${env?envNames[env]:BED[z]}</strong><small class="field-zone-name">${env?RAINED[env]:'비를 기다리는 땅'}</small>${p?plantArt(p)+`<span>${plantNames[p]}</span>`:stage===1?'<span class="field-plant-space">여기에 심기</span>':''}`;
  const cls=`field-garden-zone zone-${z} ${env?'has-env':'bare'} ${rained?'rained':''} ${missed===z?'missed':''}`;
  return stage===1?target(inner,'plant:'+z,cls):`<div class="${cls}">${inner}</div>`;}).join('');
 return `<p class="lens-hint season-hint" data-garden-tip><span>${gardenHint[stage]}</span></p>${cloud}${cards}<div class="garden-field stage-${stage}" data-garden-field data-stage="${stage}" data-rained="${rained}"><div class="field-restoration">${zones}</div></div>${stage===2?'<p class="microcopy">비는 식물을 바로 자라게 하는 장치가 아니라, 물이 머무르는 환경이 식물과 맞는지 확인하는 모형이야.</p>':''}`;
}
const partName={surface:'겉면',cover:'입구 덮개'};
const partLabel=(part,value)=>part==='surface'?(value==='lotus'?'연잎을 본뜬 겉면':'기본 천 겉면'):(value==='flap'?'닫힌 덮개':'열린 입구');
// Where each part sits on the bag picture, as fractions of the 3:2 bag image.
const BAG_SPOT={surface:[.2,.6],cover:[.5,.22]},partNum={surface:'①',cover:'②'};
const partValues=part=>part==='surface'?['plain','lotus']:['open','flap'];
const spotPos=part=>`left:${BAG_SPOT[part][0]*100}%;top:${BAG_SPOT[part][1]*100}%`;
const spotData=Object.entries(BAG_SPOT).map(([p,[x,y]])=>`${p}:${x}:${y}`).join(',');
// Keyboard/tap fallback: pick a part card, then the numbered place (same field-place action as before).
function bagTools(u){return `<div class="lens-fallback">${Object.keys(partName).map(part=>partValues(part).map(v=>source(`${partNum[part]} ${partLabel(part,v)}`,`part:${part}:${v}`,u)).join('')+target(`${partNum[part]} ${partName[part]} 자리에 끼우기`,'part:'+part)).join('')}</div>`;}
// A tap dial on each numbered place: every tap clicks the next part in.
function bagDial(part,value,snap){const values=partValues(part);return `<button type="button" class="bag-dial ${value?'set':''} ${snap===part?'snap':''}" data-bag-dial="${part}" data-value="${value||''}" data-values="${values.join('|')}" data-labels="${values.map(v=>partLabel(part,v)).join('|')}" style="${spotPos(part)}" aria-label="${partNum[part]} ${partName[part]} 부품 바꾸기"><b>${partNum[part]}</b><span>${value?partLabel(part,value):partName[part]+' · 톡'}</span></button>`;}
function trialCard(t,label,changed='',attrs=''){
 const rows=[['surface',`① ${t.surface==='lotus'?'연잎 겉면':'보통 천'}`,t.rolls?'물방울 굴러감':'물방울 남음',t.rolls],['cover',`② 입구 ${t.cover==='flap'?'닫힘':'열림'}`,t.notebookDry?'공책 마름':'공책 젖음',t.notebookDry]];
 return `<article class="field-trial-card" ${attrs}><h4>${label}</h4><p class="trial-rain" aria-label="같은 비 10방울">${'<i></i>'.repeat(10)}<span aria-hidden="true">같은 비 10방울</span></p><ul class="trial-body">${rows.map(([p,a,r,ok])=>`<li class="${changed===p?'changed':''} ${ok?'dry':'wet'}"><span>${a}</span><b>${r}</b></li>`).join('')}</ul></article>`;
}
const inkPath=pts=>'M'+pts.map(([x,y])=>`${(x*100).toFixed(1)} ${(y*100).toFixed(1)}`).join('L');
const bagHint=html=>`<p class="lens-hint bag-hint"><span>${html}</span></p>`;
function invention(e,u,stage){
 const b=e.bag,pair=fieldBagPair(b),seen=u.bagSeen,last=b.tests.at(-1)?.key||'';
 // Render-time diff: the part that just changed clicks into place, the newest rain result pops in.
 const snap=seen?Object.keys(partName).find(p=>b.assembled.includes(p)&&(seen.design[p]!==b.design[p]||!seen.assembled.includes(p)))||'':'',fresh=!!seen&&!!last&&seen.last!==last;
 u.bagSeen={design:{...b.design},assembled:[...b.assembled],last};
 if(stage!==0)u.bagDial=null;
 if(stage===0&&!b.prediction)return `<div class="field-bag-predict"><div class="field-predict-picture">${bagArt({surface:'plain',cover:'open'})}</div><div><p class="field-request">도움 없는 첫 예상 · 비가 와도 공책을 지키려면?</p><div class="field-predict-choices">${btn('연잎 겉면만 바꾸면 돼','field-bag-predict','surface')}${btn('입구로 오는 비도 막아야 해','field-bag-predict','cover')}</div></div></div>`;
 if(stage===0){
  // Dial choices live in u until both places are chosen; then one field-place per part assembles it.
  const dial={...Object.fromEntries(b.assembled.map(p=>[p,b.design[p]])),...u.bagDial},all=Object.keys(partName).every(p=>dial[p]),sewn=all&&Object.keys(partName).every(p=>b.assembled.includes(p)&&dial[p]===b.design[p]);
  const say=sewn?'✓ 조립 완료! 바꾸고 싶으면 자리를 다시 톡 눌러.':'①② 두 자리를 모두 톡톡 눌러 골라 줘.';
  return `<p class="field-request">리피의 의뢰: 바깥의 물방울은 잘 굴러가게, 안쪽 공책은 젖지 않게!</p><div class="bag-bench dial-bench">${bagHint('가방의 ①② 자리를 <b>톡톡 눌러</b> 부품을 골라 봐. 두 자리를 다 고르면 조립돼.')}<div class="bag-stage" data-bag-stage><div class="bag-stitch-frame ${sewn?'sewn':''}" data-bag-frame><div class="bag-canvas" data-bag-canvas>${bagArt({surface:dial.surface||'plain',cover:dial.cover||'open'})}${Object.keys(partName).map(p=>bagDial(p,dial[p],'')).join('')}</div></div><p class="bag-say" data-bag-say aria-live="polite">${say}</p></div>${bagTools(u)}</div>`;
 }
 if(stage===1){const shown=b.tests.slice(-2),diff=shown.length===2?Object.keys(partName).filter(k=>shown[0][k]!==shown[1][k]).length:0,ready=b.assembled.length===2&&last!==fieldBagKey(b.design);
  const say=ready?'구름을 한 번 눌러 같은 비를 내려 봐.':b.assembled.length<2?'먼저 조립 단계에서 가방을 조립해 줘.':'가방 자리 하나를 톡 눌러 부품 하나만 바꿔 봐.';
  return `<div class="bag-bench rain-bench">${bagHint('구름을 <b>한 번</b> 눌러 같은 비를 내려 봐. 그다음 자리 <b>하나만</b> 톡 바꿔 다시 시험해.')}<div class="bag-stage with-sky" data-bag-stage data-rain="${ready?'go':'skip'}"><span class="bag-cloud" data-bag-cloud aria-hidden="true"><b>비 내리기!</b></span><span class="rain-count" data-rain-count aria-hidden="true"></span><div class="bag-canvas" data-bag-canvas>${bagArt(b.design)}${Object.keys(partName).map(p=>bagDial(p,b.assembled.includes(p)?b.design[p]:'',snap)).join('')}</div><p class="bag-say" data-bag-say aria-live="polite">${say}</p></div><div class="bag-results"><div class="field-trials">${shown.map((t,i)=>trialCard(t,`시험 ${b.tests.length-shown.length+i+1}`,'',i===shown.length-1&&fresh?'data-fresh':'')).join('')||'<p class="trial-empty">첫 가방에 비를 내려 줘. 그다음 부품 하나만 바꿔 다시 시험해.</p>'}</div>${diff>1?'<p class="trial-warn">두 부품 이상 달라서 무엇 때문인지 알 수 없어. 하나만 바꿔 봐.</p>':''}</div><div class="lens-fallback">${btn(icon('drop')+' 같은 비 10방울로 시험','field-bag-test','','primary')}</div>${bagTools(u)}</div>`;}
 const ok=!!pair&&b.compared.part===pair.part&&b.compared.before===pair.before.key&&b.compared.after===pair.after.key;
 const key=pair?pair.before.key+'|'+pair.after.key:'',ring=u.bagCircle?.key===key?u.bagCircle:null;
 const side=(t,name,label)=>`<figure class="diff-side"><figcaption>${label}</figcaption><div class="bag-canvas diff-canvas" data-diff="${name}" data-key="${key}" data-spots="${spotData}">${bagArt(t)}${ok?`<span class="bag-hot stuck" style="${spotPos(pair.part)}"><b>${partNum[pair.part]}</b><span>✓ ${partName[pair.part]}</span></span>`:''}<svg class="diff-ink" data-diff-ink viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${ring?.side===name?`<path class="saved ${ok&&ring.part===pair.part?'ok':'miss'}" d="${inkPath(ring.pts)}"/>`:''}<path class="live" d=""/></svg></div>${trialCard(t,label,ok?pair.part:'')}</figure>`;
 return `${pair?`<div class="bag-bench explain-bench">${bagHint('두 시험에서 <b>달라진 곳</b>을 찾아 손가락으로 <b>동그라미</b>를 그려 봐.')}<div class="spot-diff">${side(pair.before,'before','바꾸기 전')}${side(pair.after,'after','바꾼 뒤')}</div><p class="bag-say" data-bag-say aria-live="polite">${ok?`✓ 찾았어! ${partName[pair.part]}만 달랐어.`:'그림과 결과표를 견줘 보고, 다른 곳 하나를 빙 둘러 그려.'}</p><div class="lens-fallback">${source('겉면을 바꿨어','compare:surface',u)}${source('입구 덮개를 바꿨어','compare:cover',u)}${target('두 시험에서 바뀐 부품을 여기 연결해 줘','compare','field-comparison-slot')}</div></div>`:'<p>먼저 부품 하나만 다른 두 시험을 만들어 줘.</p>'}<div class="bag-finish">${btn('의뢰 조건 확인하고 가방 완성','field-bag-deliver','','primary')}</div><p class="microcopy">${ok?`이 비교로 확인한 역할: ${FIELD_BAG_ROLES[pair.part]}`:'바뀐 부품 하나의 결과만 설명해 줘.'}</p>`;
}
const DEFAULT_FEEDBACK='위의 안내를 보고 손으로 직접 해 봐. 키보드로는 Tab으로 골라서 Enter를 눌러도 돼.';
const stageOf=u=>Number.isInteger(u?.stage)&&u.stage>=0&&u.stage<3?u.stage:0;
export function renderFieldMission(state,ui,page=state.page){
 const mission=Math.floor(page/2);if(mission<0||mission>4)return '';
 const e=normalizeFieldEvidence(state.fieldEvidence),u=ui.fieldMission??={},done=fieldSteps(e,mission);
 if(u.mission!==mission){u.mission=mission;u.stage=Math.max(0,done.findIndex(v=>!v));u.selected='';u.feedback='';}
 const stage=stageOf(u);
 const views=[leaves,seasons,floatLab,garden,invention],ready=done.every(Boolean);
 return `<section class="field-mission mission-${mission}" aria-label="리피와 현장 탐구"><div class="mission-objective ${done[stage]?'step-done':''}"><span><b class="objective-num" aria-hidden="true">${done[stage]?icon('check',18):stage+1}</b>${objectives[mission][stage]}</span>${done[stage]&&stage<2?btn('다음 도전 '+icon('arrow',18),'field-stage',String(stage+1),'primary objective-next'):''}</div>${ready?'<div class="mission-loot" role="status">현장 복구 성공! 발견한 단서를 본 탐구에도 써 보자.</div>':''}<div class="mission-workspace">${views[mission](e,u,stage)}</div>${mission===2?'<p class="microcopy">두 모형은 진짜 식물이 아니라, 부레옥잠 잎자루를 흉내 낸 실험 모형이야.</p>':''}</section>`;
}
// The step list and Leafy's reply live in the activity's left "오늘의 연구" panel.
export function renderFieldSteps(state,ui,page=state.page){
 const mission=Math.floor(page/2);if(mission<0||mission>4)return '';
 const done=fieldSteps(normalizeFieldEvidence(state.fieldEvidence),mission),stage=stageOf(ui.fieldMission);
 return `<div class="mission-journey today-steps">${stages[mission].map((label,i)=>`<button class="mission-step ${i===stage?'active':''} ${done[i]?'done':''}" data-action="field-stage" data-id="${i}" ${i===stage?'aria-current="step"':''}><b>${done[i]?icon('check',16):i+1}</b><span>${label}</span></button>`).join('')}</div>`;
}
export const fieldFeedback=ui=>({text:ui.fieldMission?.feedback||DEFAULT_FEEDBACK,success:!!ui.fieldMission?.success});

function dropAction(item,targetId){
 const [kind,a,b]=String(item).split(':'),[zone,x,y]=String(targetId).split(':');
 if(zone==='scan'&&kind==='lens')return ['field-scan',`${x}:${y}`];
 if(zone==='sort'&&kind==='leaf')return ['field-sort',`${x}:${a}:${y}`];
 if(zone==='link'&&kind==='season'&&a===x)return ['field-season-link',`${x}:${y}`];
 if(zone==='order'&&kind==='frame'&&a===x)return ['field-order',`${x}:${b}:${y}`];
 if(zone==='predict'&&kind==='model')return ['field-predict',`${a}:${x}`];
 if(zone==='tank'&&kind==='model')return ['field-test-model',a];
 if(zone==='reason'&&kind==='reason')return ['field-model-reason',x];
 if(zone==='environment'&&kind==='environment')return ['field-place-environment',`${a}:${x}`];
 if(zone==='plant'&&kind==='plant')return ['field-place-plant',`${a}:${x}`];
 if(zone==='part'&&kind==='part'&&a===x)return ['field-bag-part',`${a}:${b}`];
 if(zone==='compare'&&kind==='compare')return ['field-bag-compare',a];
 return null;
}
export function fieldMissionAction(state,ui,action,id=''){
 if(action==='field-cancel'){if(ui.fieldMission)ui.fieldMission.selected='';return '';}
 if(action==='field-dig'){(ui.fieldMission??={}).dug={...ui.fieldMission.dug,[id]:true};return '';}
 if(action==='field-drop'||action==='field-place'){
  const [picked,targetId]=action==='field-place'?String(id).split('|'):[ui.fieldMission?.selected||'',id];
  // The magnifier is the only tool in the scan step, so tapping a scan spot uses it directly.
  const t=String(targetId),item=picked||(t.startsWith('scan:')?'lens':t.startsWith('link:')?'season:'+t.split(':')[1]:'');
  const mapped=dropAction(item,targetId);if(mapped)return applyFieldAction(state,ui,...mapped);
  const u=ui.fieldMission??={};u.success=false;return u.feedback=item?'리피: 이 도구가 필요한 자리를 찾아 줘.':'먼저 옮길 도구나 표본을 하나 골라 줘.';
 }
 return applyFieldAction(state,ui,action,id);
}

// One pointer implementation covers mouse, pen and touch; native buttons provide
// the equivalent select-then-place operation to touch and keyboard users.
export function mountFieldInteractions(root,state,ui,onAction){
 if(!root)return ()=>{};
 let drag=null,ghost=null,blockedClick=false,blockTimer;
 const clear=()=>{ghost?.remove();ghost=null;root.querySelectorAll('.field-drag-over').forEach(el=>el.classList.remove('field-drag-over'));if(drag?.el?.hasPointerCapture?.(drag.pointer))drag.el.releasePointerCapture(drag.pointer);drag=null;};
 const down=event=>{const el=event.target.closest('[data-field-item]');if(!el||!root.contains(el)||event.button>0)return;drag={el,item:el.dataset.fieldItem,x:event.clientX,y:event.clientY,pointer:event.pointerId,moved:false};el.setPointerCapture?.(event.pointerId);};
 const move=event=>{if(!drag||event.pointerId!==drag.pointer)return;if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<8)return;event.preventDefault();drag.moved=true;if(!ghost){ghost=drag.el.cloneNode(true);ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');ghost.classList.add('field-drag-ghost');ghost.style.cssText='position:fixed;pointer-events:none;z-index:40;width:120px;max-height:140px;overflow:hidden;opacity:.9;transform:translate(-50%,-50%);';document.body.append(ghost);}ghost.style.left=event.clientX+'px';ghost.style.top=event.clientY+'px';const over=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-field-drop]');root.querySelectorAll('.field-drag-over').forEach(el=>el.classList.toggle('field-drag-over',el===over));if(over&&root.contains(over))over.classList.add('field-drag-over');};
 const up=event=>{if(!drag||event.pointerId!==drag.pointer)return;const item=drag.item,moved=drag.moved,target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-field-drop]');clear();if(!moved)return;event.preventDefault();blockedClick=true;clearTimeout(blockTimer);blockTimer=setTimeout(()=>{blockedClick=false;},400);if(target&&root.contains(target))onAction('field-place',`${item}|${target.dataset.fieldDrop}`);};
 const click=event=>{if(blockedClick){event.preventDefault();event.stopImmediatePropagation();blockedClick=false;}};
 const cancel=()=>clear();const key=event=>{if(event.key==='Escape'){clear();onAction('field-cancel','');}};
 const bench=root.querySelector('[data-lens-bench]'),lensCleanup=bench?mountLens(bench,ui,onAction):null,seasonCleanup=mountSeasonHands(root,ui,onAction),floatCleanup=mountFloatHands(root,ui,onAction),gardenCleanup=mountGardenHands(root,ui,onAction),bagCleanup=mountBagHands(root,ui,onAction);
 const swipeCleanup=mountLeafSwipe(root,ui,onAction);
 root.addEventListener('pointerdown',down);root.addEventListener('pointermove',move,{passive:false});root.addEventListener('pointerup',up);root.addEventListener('pointercancel',cancel);root.addEventListener('click',click,true);root.addEventListener('keydown',key);
 return ()=>{lensCleanup?.();swipeCleanup();seasonCleanup();floatCleanup();gardenCleanup();bagCleanup();clear();clearTimeout(blockTimer);root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',up);root.removeEventListener('pointercancel',cancel);root.removeEventListener('click',click,true);root.removeEventListener('keydown',key);};
}

