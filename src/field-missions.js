import {assetImage} from './asset-catalog.js';
import {icon,plantArt,seasonArt,bagArt} from './art.js';
import {mountGardenHands} from './field-hands-garden.js';
import {FIELD_LEAVES,FIELD_ORDER,FIELD_ZONES,FIELD_ENV,FIELD_PLANTS,normalizeFieldEvidence,fieldSteps,fieldMissionReady,fieldBagPair,fieldBagKey,FIELD_BAG_ROLES,applyFieldAction} from './field-missions-state.js';
import {mountFloatHands} from './field-hands-float.js';
import {mountBagHands} from './field-hands-bag.js';
import {mountLens,mountLeafSwipe} from './field-hands-leaf.js';
export {normalizeFieldEvidence,fieldMissionReady};
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const btn=(label,action,id='',cls='')=>`<button type="button" class="btn mission-tool ${cls}" data-action="${action}" data-id="${esc(id)}">${label}</button>`;
const source=(label,item,u,cls='')=>`<button type="button" class="mission-tool field-token ${u.selected===item?'selected':''} ${cls}" data-action="field-select" data-id="${esc(item)}" data-field-item="${esc(item)}" aria-pressed="${u.selected===item}" draggable="false">${label}</button>`;
const target=(label,id,cls='')=>`<button type="button" class="field-target ${cls}" data-action="field-drop" data-id="${esc(id)}" data-field-drop="${esc(id)}">${label}</button>`;
const envNames={water:'물가',grass:'풀밭',dry:'건조한 곳'};
const plantNames={hyacinth:'부레옥잠',cherry:'벚나무',aloe:'알로에'};
const modelName=id=>id==='air'?'공기 공간 모형':'속을 채운 비교 모형';
const stages=[['돋보기로 찾기','톱니로 나누기','새 기준으로 나누기'],['살아 있는 부분 잇기','나무 시간 잇기','풀 시간 잇기'],['결과 예상하기','같은 수조에서 시험','관찰 결과 연결하기'],['물길 그려 땅 만들기','씨앗 심고 물 주기','구름 모아 비 시험'],['의뢰 가방 조립','부품 하나만 비교','역할 설명하고 완성']];
const objectives=[['돋보기를 끌어 세 잎의 가운데와 가장자리를 살펴봐.','표본 카드를 톱니가 있는 잎과 없는 잎 바구니로 휙 튕겨 봐.','같은 잎을 이번에는 가늘고 긴 모양인지로 다시 나눠 봐.'],['겨울에 살아 있는 부분을 다음 봄의 같은 부분에 이어 줘.','같은 벚나무가 겨울을 지나 다시 자라는 순서로 놓아 줘.','땅속에 뿌리가 남는 씀바귀의 사진 순서를 완성해 줘.'],['두 모형을 들어 무게를 느껴 보고, 물에 넣으면 어떻게 될지 스위치로 예상해 줘.','두 모형을 같은 수조에 넣고, 물속으로 꾹 눌러 버티며 살펴봐.','본 위치를 기록하고, 잎자루 속 공기 방을 찾아 떠 있던 모형과 이어 줘.'],['빗물 단서에 맞게 물길을 그려서 물가·풀밭·건조한 곳을 만들어 줘.','각 식물의 씨앗을 특징이 도움이 되는 자리에 심고 물을 줘서 키워 봐.','구름을 모아 비를 내려 정원 배치를 시험하고 필요하면 고쳐 봐.'],['물방울이 잘 굴러가고 공책과 바깥 주머니가 마를 가방을 조립해 줘.','같은 비로 시험하고 겉면·입구·주머니 중 하나만 바꿔 다시 시험해 줘.','바뀐 부품을 시험 결과에 연결하고 의뢰 조건을 완성해 줘.']];

function leafPicture(id){
 return assetImage('field_leaf_'+id,'field-leaf-picture leaf-'+id,true);
}
const edgeNote=p=>p.edge?'작은 톱니가 이어져 있어':'큰 톱니가 없어';
function lensClue(p,kind,found,fresh){const text=kind==='shape'?`모양 · ${p.shape}`:`가장자리 · ${edgeNote(p)}`;return `<span class="lens-clue ${found?'found':''} ${fresh?'just-found':''}" data-clue="${p.id}:${kind}" data-text="✓ ${text}">${found?'✓ '+text:`? ${kind==='shape'?'잎 가운데를 살펴봐':'가장자리를 살펴봐'}`}</span>`;}
const sortLabel=(rule,answer)=>rule==='edge'?(answer==='yes'?'톱니가 있어':'큰 톱니가 없어'):(answer==='yes'?'가늘고 길어':'가늘고 긴 모양은 아니야');
const leafClue=(e,p,rule)=>e.leaves.scans[p.id].includes(rule==='edge'?'edge':'shape')?(rule==='edge'?edgeNote(p):p.shape):'돋보기로 아직 안 봤어';
// The clue drawer fills one notch per clue and slides open on the last one.
function clueDrawer(e,u){
 const n=FIELD_LEAVES.reduce((sum,p)=>sum+e.leaves.scans[p.id].length,0),all=n===FIELD_LEAVES.length*2,opening=all&&!!u.lastFound&&!u.drawerOpened;if(all)u.drawerOpened=true;
 return `<span class="clue-drawer ${all?'open':''} ${opening?'opening':''}" data-clue-gauge="${n}" role="status" aria-label="찾은 단서 ${n}/6"><span class="drawer-pop" aria-hidden="true">${FIELD_LEAVES.map(p=>leafPicture(p.id)).join('')}</span><span class="drawer-box" aria-hidden="true"><i></i></span><span class="drawer-meter" aria-hidden="true"><b>${all?'서랍이 열렸어!':`단서 ${n}/6`}</b><span class="clue-bar"><i style="width:${n/6*100}%"></i></span></span></span>`;
}
function leaves(e,u,stage){
 if(stage===0){const all=FIELD_LEAVES.every(p=>e.leaves.scans[p.id].length===2);return `<div class="lens-bench" data-lens-bench><p class="lens-hint"><span>${all?'단서를 다 모았어! 서랍에서 나온 잎을 <b>나누러</b> 가 보자.':'돋보기를 끌어서 잎의 <b>가운데</b>와 <b>가장자리</b>에 대고 잠깐 멈춰 봐.'}</span>${clueDrawer(e,u)}</p><div class="field-leaf-tray">${FIELD_LEAVES.map(p=>{const s=e.leaves.scans[p.id];return `<article class="field-specimen"><h3>${p.name}</h3><div class="lens-leaf" data-lens-leaf="${p.id}">${leafPicture(p.id)}${s.map(k=>`<span class="leaf-spark ${u.lastFound===p.id+':'+k?'fresh':''}" data-spark="${p.id}:${k}" aria-hidden="true"></span>`).join('')}</div><div class="lens-clues">${['shape','edge'].map(k=>lensClue(p,k,s.includes(k),u.lastFound===p.id+':'+k)).join('')}</div><div class="lens-fallback">${target('잎 가운데 살펴보기','scan:'+p.id+':shape','field-hotspot')}${target('가장자리 살펴보기','scan:'+p.id+':edge','field-hotspot')}</div></article>`;}).join('')}</div><div class="field-lens" data-lens aria-hidden="true"><div class="field-lens-glass"><img alt=""></div><span class="field-lens-ring"></span></div></div>`;}
 // Stage 2 throws left/right; stage 3 reshuffles the same leaves and throws up/down.
 const rule=stage===1?'edge':'narrow',vertical=stage===2,thrown=u.leafThrown;u.leafThrown='';
 const placed=p=>e.leaves[rule][p.id]===(p[rule]?'yes':'no'),deck=FIELD_LEAVES.filter(p=>!placed(p)),shuffle=vertical&&!u.leafShuffled&&deck.length===3;if(vertical)u.leafShuffled=true;
 const card=(p,i)=>`<div class="swipe-card ${i===0&&thrown===p.id?'bounced':''}" ${i===0?'data-swipe-top':''} data-swipe-card="${p.id}" style="--i:${i}" aria-hidden="true">${leafPicture(p.id)}<strong>${p.name}</strong><small class="leaf-token-clue">${leafClue(e,p,rule)}</small>${vertical&&e.leaves.edge[p.id]?`<span class="swipe-before">아까는 · ${sortLabel('edge',e.leaves.edge[p.id])}</span>`:''}</div>`;
 const bin=answer=>`<div class="swipe-bin bin-${answer}" data-swipe-bin="${answer}"><span class="swipe-arrow" aria-hidden="true"></span><strong>${sortLabel(rule,answer)}</strong><span class="swipe-bin-leaves">${FIELD_LEAVES.filter(p=>placed(p)&&e.leaves[rule][p.id]===answer).map(p=>`<span class="${thrown===p.id?'fresh':''}">${leafPicture(p.id)}${p.name}</span>`).join('')}</span></div>`;
 const empty=vertical?`<div class="swipe-done"><strong>같은 잎도 기준이 바뀌면 다른 바구니로 가!</strong><ul>${FIELD_LEAVES.map(p=>`<li>${leafPicture(p.id)}<b>${p.name}</b><span>${e.leaves.edge[p.id]?sortLabel('edge',e.leaves.edge[p.id]):'-'}</span><span>${sortLabel('narrow',e.leaves.narrow[p.id])}</span></li>`).join('')}</ul></div>`:'<div class="swipe-done"><strong>세 표본을 모두 나눴어!</strong></div>';
 return `<p class="lens-hint season-hint"><span>${vertical?'이번엔 바구니가 <b>위아래</b>에 있어. 카드를 위나 아래로 <b>휙</b> 튕겨 봐.':'가운데 카드를 손가락으로 <b>왼쪽이나 오른쪽</b>으로 <b>휙</b> 튕겨서 바구니에 넣어 봐.'}</span></p><div class="swipe-sort ${vertical?'axis-y':'axis-x'} ${shuffle?'shuffling':''}" data-swipe-sort="${rule}" data-axis="${vertical?'y':'x'}">${bin('yes')}<div class="swipe-deck">${deck.length?deck.slice(0,3).map(card).reverse().join('')+`<span class="swipe-count">남은 표본 <b>${deck.length}</b>장</span><span class="swipe-tip" aria-hidden="true">조금 더 빠르게 휙!</span>${shuffle?'<span class="swipe-shuffle" aria-hidden="true">기준이 바뀌었어 · 다시 섞는 중</span>':''}`:empty}</div>${bin('no')}</div><div class="lens-fallback">${FIELD_LEAVES.map(p=>source(`${p.name} · ${leafClue(e,p,rule)}`,'leaf:'+p.id,u,'field-leaf-token')).join('')}${['yes','no'].map(answer=>target(sortLabel(rule,answer),`sort:${rule}:${answer}`,'field-sort-bin')).join('')}</div>${deck.length?'<p class="microcopy">관찰 그림의 특징으로 나누는 활동이야. 식물 이름이 기준은 아니야.</p>':''}`;
}
function seedlingArt(herb){return assetImage(herb?'sowthistle_bud_spring':'cherry_bud_spring','field-bud-picture',true);}
function frameArt(kind,phase){return phase==='bud'?seedlingArt(kind==='herb'):seasonArt(kind==='tree'?'cherry':'sowthistle',phase==='winter'?3:0,true).replace(/aria-label="[^"]*"/,`aria-label="${phase==='winter'?'잎이 없고 땅속 뿌리와 줄기가 남은 모습':'같은 식물에 잎과 꽃이 자란 모습'}"`);}
const frameName={winter:'겨울 · 살아 있는 부분이 남아 있어',bud:'초봄 · 같은 부분에서 새눈·새싹이 나와',spring:'다음 봄 · 잎과 꽃이 자랐어'};
// Stage-2 picture geometry, as fractions of one atlas cell.
const LINK_HANDLE={tree:[.49,.7],herb:[.49,.68]},LINK_CUT={tree:.42,herb:.58},DIG_TOP=.6,DIG_CELLS=24;
const regrowZone=(kind,x,y)=>kind==='tree'?(y<.6?'branches':'rootbud'):(x>.3&&x<.7&&y>.15&&y<.8?'rootbud':'color');
function seasons(e,u,stage){
 if(stage===0&&!['tree','herb'].every(k=>e.seasons.predictions[k]))return `<div class="field-season-predictions"><p class="direct-hint">도움 없는 첫 예상 · 겨울에 잎이 보이지 않으면 땅속은 어떨까?</p>${['tree','herb'].map(k=>`<section><h3>${k==='tree'?'벚나무':'씀바귀'}</h3><div class="field-predict-picture">${seasonArt(k==='tree'?'cherry':'sowthistle',3,false)}</div>${e.seasons.predictions[k]?'<p>처음 예상을 보관했어.</p>':btn('뿌리가 남아 있을 것 같아','field-season-predict',k+':roots')+btn('아무것도 없을 것 같아','field-season-predict',k+':none')}</section>`).join('')}</div>`;
 if(stage===0)return `<p class="lens-hint season-hint"><span>겨울 그림의 <b>흙을 문질러</b> 걷어 내고, 빛나는 점을 <b>다음 봄의 같은 부분</b>까지 끌어 이어 봐.</span></p><div class="field-season-pairs">${['tree','herb'].map(kind=>{const plant=kind==='tree'?'cherry':'sowthistle',linked=e.seasons.links[kind],dug=linked||u.dug?.[kind],[hx,hy]=LINK_HANDLE[kind];return `<article class="field-season-pair" data-season-pair="${kind}"><h3>${kind==='tree'?'벚나무':'씀바귀'}</h3><div class="field-season-images"><div><div class="season-dig" data-dig="${kind}">${seasonArt(plant,3,true)}${dug?`<span class="link-handle ${linked?'linked':''}" data-link-handle="${kind}" style="left:${hx*100}%;top:${hy*100}%"></span>`:`<div class="dig-cover" style="top:${DIG_TOP*100}%">${'<i></i>'.repeat(DIG_CELLS)}</div>`}</div><p class="season-cap">겨울 · ${linked?'이었어':dug?'점을 끌어 이어 봐':'흙을 문질러 봐'}</p></div><div><div class="link-target" data-link-target="${kind}" style="--cut:${LINK_CUT[kind]*100}%">${seasonArt(plant,0,true)}<span class="link-zone upper ${linked==='leaf'?'picked':''}">새로 나온 잎</span><span class="link-zone lower ${linked&&linked!=='leaf'?'picked':''}">${kind==='tree'?'같은 줄기와 뿌리':'살아 있던 뿌리'}</span></div><p class="season-cap">다음 봄</p></div></div><svg class="link-line" aria-hidden="true"><line/></svg><div class="lens-fallback">${(kind==='tree'?['trunk','leaf']:['root','leaf']).map(part=>target(`${part==='trunk'?'같은 줄기와 뿌리':part==='root'?'살아 있던 뿌리':'새로 나온 잎'}에 잇기`,`link:${kind}:${part}`)).join('')}</div></article>`;}).join('')}</div>`;
 const kind=stage===1?'tree':'herb';
 return `<div class="field-frame-tray">${['spring','winter','bud'].map(phase=>source(`${frameArt(kind,phase)}<span>${e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud')?frameName[phase]:`관찰 사진 ${['spring','winter','bud'].indexOf(phase)+1}`}</span>`,`frame:${kind}:${phase}`,u,'field-frame')).join('')}</div><div class="field-timeline">${[0,1,2].map(i=>target(`<b>${i+1}</b>${e.seasons[kind][i]?`${frameArt(kind,e.seasons[kind][i])}<span>${e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud')?frameName[e.seasons[kind][i]]:'놓은 사진'}</span>`:'사진 놓는 자리'}`,`order:${kind}:${i}`,'field-time-slot')).join('')}</div><div class="regrow-find" data-regrow="${kind}"><div class="regrow-copy"><p>초봄 사진에서 <b>새로 돋은 곳</b>을 찾아 새싹 핀을 꽂아 봐.</p><span class="regrow-pin" data-regrow-pin aria-hidden="true"></span></div><div class="regrow-pic">${frameArt(kind,'bud')}${u.pin?.[kind]&&e.seasons.clues[kind]?`<span class="regrow-mark ${e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud')?'ok':''}" style="left:${u.pin[kind][0]*100}%;top:${u.pin[kind][1]*100}%"></span>`:''}</div><div class="lens-fallback">${btn('같은 가지에서 새눈이 돋았어','field-season-clue',kind+':branches')}${btn('땅속 뿌리에서 새싹이 돋았어','field-season-clue',kind+':rootbud')}${btn('꽃 색깔만 같아','field-season-clue',kind+':color')}</div></div>`;
}
function modelArt(id){return assetImage(id==='air'?'float_model_air':'float_model_solid','field-float-model',true);}
const recName={float:'수면',sink:'바닥'};
// Hands-on stage 1: press a palm to heft a model, then push its switch up (float) or down (sink).
function heftCard(id,f,u){
 const pred=f.predictions[id],lifted=!!u.floatLifted?.[id]||!!pred;
 const label=r=>`<span class="sw-label ${r}" data-heft-pick="${r}">${r==='float'?'뜰 것 같아':'가라앉을 것 같아'}</span>`;
 return `<div class="float-heft ${lifted?'lifted':''}" data-heft="${id}" ${pred?'data-done="1"':''}><div class="heft-palm" data-heft-lift role="img" aria-label="${modelName(id)}을 들어 보는 손바닥"><span class="heft-model">${modelArt(id)}</span><span class="heft-hand" aria-hidden="true"></span></div><div class="heft-side"><strong>${modelName(id)}</strong><span class="heft-meter" aria-hidden="true"><i style="--w:${lifted?(id==='air'?.32:.92):0}"></i></span><span class="heft-word">${pred?'처음 예상을 보관했어':lifted?(id==='air'?'생각보다 가뿐해!':'영차, 묵직해!'):'손바닥을 꾹 눌러 들어 봐'}</span></div><div class="heft-switch ${pred?'set-'+pred:lifted?'':'locked'}" data-heft-switch>${label('float')}<span class="sw-track"><b class="sw-knob" aria-hidden="true"></b></span>${label('sink')}</div></div>`;
}
function floatTank(f,u,stage,extra=''){
 const tag=id=>stage!==2?'':f.reason===id?'<span class="float-tag">공기 방 ✓</span>':f.observed[id]?`<span class="float-tag rec">기록 · ${recName[f.observed[id]]}</span>`:'';
 return `<div class="float-tank" data-float-tank role="group" aria-label="같은 물이 담긴 수조">${f.tested.map(id=>`<div class="float-model in-tank rest-${id}" data-tank-model="${id}" style="--x:${u.floatX?.[id]??(id==='air'?.32:.68)}" role="img" aria-label="${modelName(id)}: ${id==='air'?'수면에 떠 있어':'수조 바닥에 있어'}">${modelArt(id)}${tag(id)}</div>`).join('')}${extra}<span class="float-say" aria-live="polite"></span><span class="float-tank-label">같은 물 수조</span></div>`;
}
const PETIOLE_ROOMS=[[.735,.34],[.69,.43],[.6,.425],[.57,.57],[.66,.51],[.476,.585],[.465,.69]];
function petiole(u,phase){
 const open=phase!=='record'&&(phase!=='cut'||!!u.floatCut),pops=u.floatPops||[];
 return `<div class="float-petiole"><div class="petiole-cut ${open?'open':''} ${phase==='record'?'locked':''}" data-petiole="${phase}">${assetImage('hyacinth_petiole_cutaway','petiole-in',true)}${assetImage('hyacinth_petiole_whole','petiole-skin',true).replace(/alt="[^"]*"/,'alt=""')}<svg class="cut-trail" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><polyline points=""/></svg>${PETIOLE_ROOMS.map(([x,y],i)=>`<span class="air-room ${pops.includes(i)?'popped':''}" data-air-room="${i}" style="left:${x*100}%;top:${y*100}%" aria-hidden="true"></span>`).join('')}</div><p class="petiole-count" aria-live="polite">${phase==='record'?'기록을 마치면 잘라 볼 수 있어':!open?'부레옥잠 잎자루':`공기 방 톡톡 <b>${Math.min(3,pops.length)}</b> / 3`}</p></div>`;
}
const floatPhase=(f,u)=>!(f.observed.air==='float'&&f.observed.solid==='sink')?'record':f.reason?'done':u.floatCut&&(u.floatPops||[]).length>=3?'reason':'cut';
const FLOAT_HINT={record:'수조 속 모형을 <b>톡</b> 누르고, 멈춘 곳 <b>눈금(수면·바닥)</b>을 눌러 기록해 봐.',cut:'손가락으로 잎자루를 따라 <b>쓱 그어</b> 잘라 열어 봐.',reason:'공기 방을 봤지? 같은 원리로 떠 있던 모형을 수조에서 <b>톡</b> 눌러 봐.',done:'잎자루의 공기 방과 떠 있던 모형을 연결했어!'};
function floatLab(e,u,stage){
 const f=e.float;
 const hint=html=>`<p class="lens-hint season-hint float-hint"><span>${html}</span></p>`;
 const keys=(...items)=>`<div class="lens-fallback">${items.join('')}</div>`;
 if(stage===0)return `${hint('손바닥을 <b>꾹 눌러</b> 모형을 들어 보고, 스위치를 <b>위·아래로 밀어</b> 예상을 남겨 봐.')}<div class="float-lab predict">${['air','solid'].map(id=>heftCard(id,f,u)).join('')}</div>${keys(...['air','solid'].filter(id=>!f.predictions[id]).map(id=>source(modelName(id),'model:'+id,u)),...['float','sink'].map(r=>target(r==='float'?'물 위에 뜰 것 같아':'물속으로 내려갈 것 같아',`predict:${r}`)))}<p class="microcopy">겉 크기는 같아. 한 모형은 안에 공기 공간이 있고, 다른 모형은 무겁게 채웠어. 예상이 달라도 괜찮아.</p>`;
 if(stage===1)return `${hint('모형을 <b>톡</b> 눌러 수조에 퐁당 넣고, 물속으로 <b>꾹 눌러 버텨</b> 봐.')}<div class="float-lab test"><div class="float-bench">${['air','solid'].filter(id=>!f.tested.includes(id)).map(id=>`<div class="float-model on-bench" data-float-item="${id}" data-ready="${!!f.predictions[id]}">${modelArt(id)}<span>${modelName(id)}</span></div>`).join('')||'<p class="float-empty">두 모형을 모두 시험했어. 다시 꾹 눌러 봐도 돼.</p>'}</div>${floatTank(f,u,stage,'<span class="float-press" data-press-gauge aria-hidden="true"><i></i><b>손가락 힘</b></span>')}</div>${keys(...['air','solid'].map(id=>source(modelName(id),'model:'+id,u)),target('수조에 넣기','tank'))}<p class="microcopy">두 모형 모두 시험해야 공기 공간의 역할을 견줄 수 있어.</p>`;
 const phase=floatPhase(f,u);
 return `${hint(FLOAT_HINT[phase])}<div class="float-lab record" data-phase="${phase}">${floatTank(f,u,stage,['float','sink'].map(r=>`<button type="button" class="float-band band-${r}" data-float-band="${r}" aria-label="관찰 기록 · ${r==='float'?'수면에 떠 있음':'바닥으로 내려감'}">${recName[r]}</button>`).join(''))}${petiole(u,phase)}</div>${keys(...['air','solid'].map(id=>source(modelName(id),'model:'+id,u)),...['float','sink'].map(r=>target(`관찰 기록 · ${r==='float'?'수면에 떠 있음':'바닥으로 내려감'}`,`observe:${r}`)),source('안에 공기가 차지하는 공간','reason:air-space',u),...['air','solid'].map(m=>target(`${f.reason===m?'✓ ':''}공기 공간 카드를 ${modelName(m)}에 붙이기`,`reason:${m}`)))}`;
}
const flowRule={water:'물길이 끝나 고인 곳',grass:'물길이 지나간 곳',dry:'물길이 안 닿은 곳'};
const gardenHint=['정원 위에 손가락으로 <b>빗물이 흐를 길</b>을 한 번에 그려 봐. 빗물 단서에 맞게!','씨앗 카드를 <b>톡</b>, 땅을 <b>톡</b> 눌러 심고 물뿌리개를 <b>빙그르 기울여</b> 키워 봐.','하늘에 손가락으로 <b>빙글빙글 원</b>을 그려 구름을 모아 봐. 두 바퀴면 비가 와.'];
const wateringCan='<svg viewBox="0 0 100 72" aria-hidden="true"><path d="M40 34 L8 16" stroke="#3f7f9f" stroke-width="7" stroke-linecap="round"/><ellipse cx="7" cy="15" rx="7" ry="5" fill="#3f7f9f" transform="rotate(-30 7 15)"/><path d="M78 26 q20 0 18 18 q-2 14 -18 14" fill="none" stroke="#3f7f9f" stroke-width="6"/><rect x="36" y="22" width="44" height="44" rx="10" fill="#6fb2d4" stroke="#3f7f9f" stroke-width="3"/><rect x="44" y="16" width="26" height="9" rx="4" fill="#3f7f9f"/><path d="M44 36 h26" stroke="#ffffff99" stroke-width="4" stroke-linecap="round"/></svg>';
function garden(e,u,stage){
 const g=e.garden,rained=fieldSteps(e,3)[2],zoneClue={pond:'빗물이 낮은 자리에 오래 고여 있어',meadow:'빗물이 흙에 고르게 배어들어',ridge:'물이 빠르게 빠지고 땅이 말라 있어'};
 const envSources=Object.entries(envNames).map(([id,n])=>source(`${assetImage('habitat_'+id,'field-habitat-picture',true)}<span>${n}</span>`,'environment:'+id,u,'field-env-token')).join('');
 const tools=stage===0?Object.keys(envNames).map(id=>`<div class="garden-rule" aria-hidden="true">${assetImage('habitat_'+id,'field-habitat-picture',true)}<span><small>${flowRule[id]}</small>${envNames[id]}</span></div>`).join('')+`<div class="lens-fallback">${envSources}</div>`:(stage===1?Object.entries(plantNames).map(([id,n])=>`<div class="mission-tool field-token field-plant-token garden-seed" data-garden-seed="${id}" aria-hidden="true">${plantArt(id)}<span>${n}</span></div>`).join(''):'')+`<div class="lens-fallback">${Object.entries(plantNames).map(([id,n])=>source(`${plantArt(id)}<span>${n}</span>`,'plant:'+id,u,'field-plant-token')).join('')}</div>`;
 const zones=FIELD_ZONES.map(z=>{const env=g.environments[z],p=Object.keys(FIELD_PLANTS).find(p=>g.plants[p]===z);return target(`<i class="zone-state" data-zone="${z}" data-env="${env||''}" data-plant="${p||''}" data-fit="${p&&FIELD_ENV[z]===FIELD_PLANTS[p]?'1':''}" hidden></i><span class="zone-ground" aria-hidden="true">${env?assetImage('habitat_'+env,'zone-ground-picture',true):''}</span><span class="zone-water" aria-hidden="true"></span><strong>${zoneClue[z]}</strong><span class="field-zone-name">${envNames[env]||'물길로 땅을 만들어 줘'}</span>${p?plantArt(p)+`<span>${plantNames[p]}</span>`:'<span class="field-plant-space">심을 식물 자리</span>'}`,`${stage===0?'environment':'plant'}:${z}`,`field-garden-zone zone-${z} ${env?'has-env':''} ${rained?'rained':''} ${p&&FIELD_ENV[z]!==FIELD_PLANTS[p]?'plant-misfit':''}`);}).join('');
 const sky=stage===2?`<div class="garden-sky" data-garden-sky aria-hidden="true"${rained?' style="--gather:1"':''}><div class="garden-cloud" data-garden-cloud><span class="cloud-rain"></span></div><span class="sky-meter"><i></i></span><b data-sky-count>${rained?'비 시험 끝!':'0/2바퀴'}</b></div>`:'';
 const can=stage>0?`<div class="garden-can" data-garden-can aria-hidden="true" hidden><span class="can-body">${wateringCan}<span class="can-water"></span></span><span class="can-meter"><i></i></span></div>`:'';
 return `<p class="lens-hint season-hint" data-garden-tip><span>${gardenHint[stage]}</span></p><div class="field-tools">${tools}</div><div class="garden-field stage-${stage}" data-garden-field data-stage="${stage}">${sky}<svg class="garden-flow" data-garden-flow aria-hidden="true"></svg><div class="field-restoration">${zones}</div>${can}</div>${stage===2?`<div class="lens-fallback">${btn(icon('drop')+' 같은 비로 정원 시험','field-garden-rain','','primary')}</div><p class="microcopy">배치를 바꾸면 다시 시험해야 해. 비는 식물을 바로 자라거나 시들게 만드는 장치가 아니라 물이 머무르는 환경을 확인하는 모형이야.</p>`:''}`;
}
const partName={surface:'겉면',cover:'입구 덮개',pocket:'바깥 주머니 덮개'};
const partLabel=(part,value)=>part==='surface'?(value==='lotus'?'연잎을 본뜬 겉면':'기본 천 겉면'):(value==='flap'?'닫힌 덮개':'열린 입구');
// Where each part sits on the bag picture, as fractions of the 3:2 bag image.
const BAG_SPOT={surface:[.2,.6],cover:[.5,.22],pocket:[.56,.68]},partNum={surface:'①',cover:'②',pocket:'③'};
const partValues=part=>part==='surface'?['plain','lotus']:['open','flap'];
const partPic=(part,value)=>part==='cover'?assetImage(value==='flap'?'research_bag_closed':'research_bag_body','bag-part-thumb').replace(/alt="[^"]*"/,'alt=""'):`<span class="bag-part-pic pic-${part}-${value}" aria-hidden="true"></span>`;
function bagTools(u){return `<div class="bag-parts-tray">${Object.keys(partName).map(part=>`<div class="bag-part-group"><strong>${partNum[part]} ${partName[part]}</strong><div>${partValues(part).map(value=>source(`${partPic(part,value)}<span>${partLabel(part,value)}</span>`,`part:${part}:${value}`,u,'bag-part-card')).join('')}</div></div>`).join('')}</div>`;}
// The bag picture with numbered places: drop slots while building, sticker spots while explaining.
function bagStage(b,{slots=false,snap='',stuck='',rain=''}={}){
 const spot=part=>{const [x,y]=BAG_SPOT[part],pos=`left:${x*100}%;top:${y*100}%`,done=b.assembled.includes(part);
  return slots?`<button type="button" class="bag-slot ${done?'filled':''} ${snap===part?'snap':''}" data-action="field-drop" data-id="part:${part}" data-field-drop="part:${part}" style="${pos}"><b>${partNum[part]}</b><span>${done?partLabel(part,b.design[part]):partName[part]+' 자리'}</span></button>`
   :`<span class="bag-hot ${stuck===part?'stuck':''}" data-bag-hot="${part}" style="${pos}"><b>${partNum[part]}</b><span>${stuck===part?'✓ ':''}${partName[part]}</span></span>`;};
 return `<div class="bag-stage ${rain?'with-sky':''}" data-bag-stage ${rain?`data-rain="${rain}"`:''}>${rain?'<span class="bag-cloud" data-bag-cloud aria-hidden="true"><b>끌어서 가방 위로</b></span><span class="rain-count" data-rain-count aria-hidden="true"></span>':''}<div class="bag-canvas" data-bag-canvas>${bagArt(b.design)}${Object.keys(partName).map(spot).join('')}</div></div>`;
}
function trialCard(t,label,changed='',attrs=''){
 const rows=[['surface',`① ${t.surface==='lotus'?'연잎 겉면':'보통 천'}`,t.rolls?'물방울 굴러감':'물방울 남음',t.rolls],['cover',`② 입구 ${t.cover==='flap'?'닫힘':'열림'}`,t.notebookDry?'공책 마름':'공책 젖음',t.notebookDry],['pocket',`③ 주머니 ${t.pocket==='flap'?'닫힘':'열림'}`,t.pocketDry?'주머니 마름':'주머니 젖음',t.pocketDry]];
 return `<article class="field-trial-card" ${attrs}><h4>${label}</h4><p class="trial-rain" aria-label="같은 비 10방울">${'<i></i>'.repeat(10)}<span aria-hidden="true">같은 비 10방울</span></p><ul class="trial-body">${rows.map(([p,a,r,ok])=>`<li class="${changed===p?'changed':''} ${ok?'dry':'wet'}"><span>${a}</span><b>${r}</b></li>`).join('')}</ul></article>`;
}
function invention(e,u,stage){
 const b=e.bag,pair=fieldBagPair(b),seen=u.bagSeen,last=b.tests.at(-1)?.key||'';
 // Render-time diff: the part that just changed clicks into place, the newest rain result pops in.
 const snap=seen?Object.keys(partName).find(p=>b.assembled.includes(p)&&(seen.design[p]!==b.design[p]||!seen.assembled.includes(p)))||'':'',fresh=!!seen&&!!last&&seen.last!==last;
 u.bagSeen={design:{...b.design},assembled:[...b.assembled],last};
 if(stage===0&&!b.prediction)return `<div class="field-bag-predict"><div class="field-predict-picture">${bagArt({surface:'plain',cover:'open'})}</div><div><p class="field-request">도움 없는 첫 예상 · 비가 와도 공책을 지키려면?</p><div class="field-predict-choices">${btn('연잎 겉면만 바꾸면 돼','field-bag-predict','surface')}${btn('입구로 오는 비도 막아야 해','field-bag-predict','cover')}</div></div></div>`;
 if(stage===0)return `<p class="field-request">리피의 의뢰: 바깥의 물방울은 잘 굴러가게, 안쪽 공책과 바깥 주머니는 젖지 않게!</p><div class="bag-bench"><p class="lens-hint bag-hint"><span>부품 카드를 끌어 가방의 <b>같은 번호 자리</b>에 딸깍 끼워 봐.</span></p>${bagStage(b,{slots:true,snap})}${bagTools(u)}</div>`;
 if(stage===1){const shown=b.tests.slice(-2),diff=shown.length===2?Object.keys(partName).filter(k=>shown[0][k]!==shown[1][k]).length:0,ready=b.assembled.length===3&&last!==fieldBagKey(b.design);
  return `<div class="bag-bench rain-bench"><p class="lens-hint bag-hint"><span>구름을 끌어 가방 위에 대면 <b>같은 비 10방울</b>이 내려. 그다음 부품 <b>하나만</b> 바꿔 다시 비를 내려 봐.</span></p>${bagStage(b,{slots:true,snap,rain:ready?'go':'skip'})}${bagTools(u)}<div class="bag-results"><div class="field-trials">${shown.map((t,i)=>trialCard(t,`시험 ${b.tests.length-shown.length+i+1}`,'',i===shown.length-1&&fresh?'data-fresh':'')).join('')||'<p class="trial-empty">첫 가방에 비를 내려 줘. 그다음 부품 하나만 바꿔 다시 시험해.</p>'}</div>${diff>1?'<p class="trial-warn">두 부품 이상 달라서 무엇 때문인지 알 수 없어. 하나만 바꿔 봐.</p>':''}</div><div class="lens-fallback">${btn(icon('drop')+' 같은 비 10방울로 시험','field-bag-test','','primary')}</div></div>`;}
 const ok=!!pair&&b.compared.part===pair.part&&b.compared.before===pair.before.key&&b.compared.after===pair.after.key;
 return `${pair?`<div class="bag-bench explain-bench"><p class="lens-hint bag-hint"><span><b>바꾼 뒤</b> 결과 카드를 끌어서, 두 시험에서 <b>바뀐 부품</b> 자리에 붙여 봐.</span></p>${bagStage(b,{stuck:ok?pair.part:''})}<div class="field-trials">${trialCard(pair.before,'바꾸기 전',ok?pair.part:'')}${trialCard(pair.after,'바꾼 뒤 · 끌어서 붙여 봐',ok?pair.part:'','data-bag-result')}</div><div class="lens-fallback">${source('겉면을 바꿨어','compare:surface',u)}${source('입구 덮개를 바꿨어','compare:cover',u)}${source('주머니 덮개를 바꿨어','compare:pocket',u)}${target('두 시험에서 바뀐 부품을 여기 연결해 줘','compare','field-comparison-slot')}</div></div>`:'<p>먼저 부품 하나만 다른 두 시험을 만들어 줘.</p>'}<div class="bag-finish">${btn('의뢰 조건 확인하고 가방 완성','field-bag-deliver','','primary')}${btn('조립으로 돌아가기','field-stage','0')}${btn('비교 시험하기','field-stage','1')}</div><p class="microcopy">${ok?`이 비교로 확인한 역할: ${FIELD_BAG_ROLES[pair.part]}`:'바뀐 부품 하나의 결과만 설명해 줘.'}</p>`;
}
const DEFAULT_FEEDBACK='도구나 표본을 끌어 옮겨 봐. 하나를 누르고 놓을 자리를 눌러도 똑같이 할 수 있어.';
const stageOf=u=>Number.isInteger(u?.stage)&&u.stage>=0&&u.stage<3?u.stage:0;
export function renderFieldMission(state,ui,page=state.page){
 const mission=Math.floor(page/2);if(mission<0||mission>4)return '';
 const e=normalizeFieldEvidence(state.fieldEvidence),u=ui.fieldMission??={},done=fieldSteps(e,mission);
 if(u.mission!==mission){u.mission=mission;u.stage=Math.max(0,done.findIndex(v=>!v));u.selected='';u.feedback='';}
 const stage=stageOf(u);
 const views=[leaves,seasons,floatLab,garden,invention],ready=done.every(Boolean);
 return `<section class="field-mission mission-${mission}" aria-label="리피와 현장 탐구"><div class="mission-objective ${done[stage]?'step-done':''}"><span><b class="objective-num" aria-hidden="true">${done[stage]?icon('check',18):stage+1}</b>${objectives[mission][stage]}</span>${done[stage]&&stage<2?btn('다음 도전 '+icon('arrow',18),'field-stage',String(stage+1),'primary objective-next'):''}</div>${ready?'<div class="mission-loot" role="status">현장 복구 성공! 발견한 단서를 본 탐구에도 써 보자.</div>':''}<div class="mission-workspace">${views[mission](e,u,stage)}</div>${mission===2?'<p class="microcopy">원리 확인용 모형이야. 식물에서 공기 공간이 차지하는 역할을 살펴보는 실험이며 실제 식물 전체를 재현한 것은 아니야.</p>':''}</section>`;
}
// The step list and Leafy's reply live in the activity's left "오늘의 연구" panel.
export function renderFieldSteps(state,ui,page=state.page){
 const mission=Math.floor(page/2);if(mission<0||mission>4)return '';
 const done=fieldSteps(normalizeFieldEvidence(state.fieldEvidence),mission),stage=stageOf(ui.fieldMission);
 return `<div class="mission-journey today-steps">${stages[mission].map((label,i)=>`<button class="mission-step ${i===stage?'active':''} ${done[i]?'done':''}" data-action="field-stage" data-id="${i}" ${i===stage?'aria-current="step"':''}><b>${done[i]?icon('check',16):i+1}</b><span>${label}</span></button>`).join('')}</div>`;
}
export const fieldFeedback=ui=>({text:ui.fieldMission?.feedback||DEFAULT_FEEDBACK,success:!!ui.fieldMission?.success});
export const FIELD_KEYBOARD_HELP='<details class="field-access-help microcopy"><summary>키보드로 조작하기</summary><p>Tab으로 표본을 찾고 Enter로 선택 → 놓을 자리에서 Enter. Escape로 선택 취소.</p></details>';

function dropAction(item,targetId){
 const [kind,a,b]=String(item).split(':'),[zone,x,y]=String(targetId).split(':');
 if(zone==='scan'&&kind==='lens')return ['field-scan',`${x}:${y}`];
 if(zone==='sort'&&kind==='leaf')return ['field-sort',`${x}:${a}:${y}`];
 if(zone==='link'&&kind==='season'&&a===x)return ['field-season-link',`${x}:${y}`];
 if(zone==='order'&&kind==='frame'&&a===x)return ['field-order',`${x}:${b}:${y}`];
 if(zone==='predict'&&kind==='model')return ['field-predict',`${a}:${x}`];
 if(zone==='tank'&&kind==='model')return ['field-test-model',a];
 if(zone==='observe'&&kind==='model')return ['field-observe-model',`${a}:${x}`];
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

// object-fit:contain leaves blank margins; clue spots are measured on the painted image only.
function drawnRect(img){const r=img.getBoundingClientRect(),nw=img.naturalWidth||1,nh=img.naturalHeight||1,k=(getComputedStyle(img).objectFit==='cover'?Math.max:Math.min)(r.width/nw,r.height/nh),w=nw*k,h=nh*k;return {left:r.left+(r.width-w)/2,top:r.top+(r.height-h)/2,width:w,height:h};}
// Stage 2 by hand: rub the soil away, pull a string to the same part next spring, pin where it regrew.
function mountSeasonHands(root,ui,onAction){
 const offs=[];const on=(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));};
 const local=(el,e)=>{const r=el.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];};
 root.querySelectorAll('.dig-cover').forEach(cover=>{
  const kind=cover.closest('[data-dig]').dataset.dig,cells=[...cover.children];let rubbing=false,done=false;
  const rub=e=>{if(!rubbing||done)return;const r=cover.getBoundingClientRect(),reach=Math.max(r.width/6,26);cells.forEach(c=>{const b=c.getBoundingClientRect();if(Math.hypot(b.left+b.width/2-e.clientX,b.top+b.height/2-e.clientY)<reach)c.classList.add('gone');});
   if(cells.filter(c=>c.classList.contains('gone')).length>=cells.length*.6){done=true;cover.classList.add('cleared');setTimeout(()=>onAction('field-dig',kind),450);}};
  on(cover,'pointerdown',e=>{e.preventDefault();e.stopPropagation();rubbing=true;cover.setPointerCapture?.(e.pointerId);rub(e);});
  on(cover,'pointermove',e=>{e.preventDefault();rub(e);});on(cover,'pointerup',()=>{rubbing=false;});on(cover,'pointercancel',()=>{rubbing=false;});
 });
 root.querySelectorAll('[data-season-pair]').forEach(pair=>{
  const kind=pair.dataset.seasonPair,handle=pair.querySelector('[data-link-handle]'),targetBox=pair.querySelector('[data-link-target]'),svg=pair.querySelector('.link-line'),line=svg?.querySelector('line');if(!handle||!line)return;
  const cut=LINK_CUT[kind],partAt=y=>y>=cut?(kind==='tree'?'trunk':'root'):'leaf';
  const draw=(x,y)=>{const p=pair.getBoundingClientRect(),h=handle.getBoundingClientRect();line.setAttribute('x1',h.left+h.width/2-p.left);line.setAttribute('y1',h.top+h.height/2-p.top);line.setAttribute('x2',x-p.left);line.setAttribute('y2',y-p.top);svg.classList.add('show');};
  const zoneCenter=part=>{const z=targetBox.querySelector(part==='leaf'?'.upper':'.lower').getBoundingClientRect();return [z.left+z.width/2,z.top+z.height/2];};
  const linked=targetBox.querySelector('.link-zone.picked');
  const restore=()=>{if(!linked){svg.classList.remove('show');return;}const [x,y]=zoneCenter(linked.classList.contains('upper')?'leaf':'trunk');draw(x,y);svg.classList.add('fixed');};
  requestAnimationFrame(restore);
  let pulling=false;
  on(handle,'pointerdown',e=>{e.preventDefault();e.stopPropagation();pulling=true;handle.setPointerCapture?.(e.pointerId);pair.classList.add('linking');svg.classList.remove('fixed');draw(e.clientX,e.clientY);});
  on(handle,'pointermove',e=>{if(!pulling)return;e.preventDefault();draw(e.clientX,e.clientY);const t=targetBox.getBoundingClientRect(),inside=e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom;targetBox.querySelectorAll('.link-zone').forEach(z=>z.classList.remove('hover'));if(inside)targetBox.querySelector(partAt((e.clientY-t.top)/t.height)==='leaf'?'.upper':'.lower').classList.add('hover');});
  const end=e=>{if(!pulling)return;pulling=false;pair.classList.remove('linking');targetBox.querySelectorAll('.link-zone').forEach(z=>z.classList.remove('hover'));const t=targetBox.getBoundingClientRect();if(e.type==='pointerup'&&e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom){const part=partAt((e.clientY-t.top)/t.height),[x,y]=zoneCenter(part);draw(x,y);onAction('field-season-link',`${kind}:${part}`);}else restore();};
  on(handle,'pointerup',end);on(handle,'pointercancel',end);
 });
 root.querySelectorAll('[data-regrow]').forEach(box=>{
  const kind=box.dataset.regrow,pin=box.querySelector('[data-regrow-pin]'),pic=box.querySelector('.regrow-pic'),img=pic.querySelector('img');let ghost=null;
  const drop=e=>{const r=drawnRect(img),p=pic.getBoundingClientRect();if(e.clientX<p.left||e.clientX>p.right||e.clientY<p.top||e.clientY>p.bottom)return;const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,u=ui.fieldMission??={};u.pin={...u.pin,[kind]:local(pic,e)};onAction('field-season-clue',`${kind}:${regrowZone(kind,x,y)}`);};
  on(pin,'pointerdown',e=>{e.preventDefault();e.stopPropagation();pin.setPointerCapture?.(e.pointerId);ghost=pin.cloneNode();ghost.classList.add('dragging');document.body.append(ghost);Object.assign(ghost.style,{position:'fixed',left:e.clientX+'px',top:e.clientY+'px'});});
  on(pin,'pointermove',e=>{if(!ghost)return;e.preventDefault();ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';});
  const end=e=>{if(!ghost)return;ghost.remove();ghost=null;if(e.type==='pointerup')drop(e);};on(pin,'pointerup',end);on(pin,'pointercancel',end);
  on(pic,'click',drop);
 });
 return ()=>offs.forEach(off=>off());
}
