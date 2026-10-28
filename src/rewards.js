import {MISSIONS,missionDone,openMission,rewardCount,canChooseGardenTheme,missionStamps} from './model.js';
import {QUESTS} from './inquiry.js';
import {normalizeFieldEvidence} from './field-missions-state.js';
import {assetImage} from './asset-catalog.js';
import {icon} from './art.js';
import {TRAIL_LENGTH,ENTRANCES,trailPoint} from './stage-map.js';

export const REWARDS = [
  {asset:'reward_observatory',name:'표본 온실',title:'표본 온실에 불이 켜졌어!',why:'잎을 살피고 두 기준으로 나눈 기록을 남겼어.',next:'다음에는 겨울을 지낸 식물의 비밀을 찾자.',x:14,y:76},
  {asset:'reward_seasons',name:'계절 꽃돔',title:'계절 꽃돔이 다시 피어났어!',why:'겨울과 다음 봄을 연결한 기록을 남겼어.',next:'꽃길 색도 골라 봐. 다음은 식물이 사는 환경을 알아볼 차례야.',x:25,y:46},
  {asset:'reward_water',name:'물길 실험실',title:'연못에 맑은 물이 돌아왔어!',why:'식물의 특징과 사는 곳을 연결한 기록을 남겼어.',next:'이제 배운 특징을 이용해서 네 정원을 만들어 보자.',x:49,y:27},
  {asset:'reward_garden',name:'나의 연구정원',title:'네가 만든 정원이 생겼어!',why:'환경을 만들고 식물을 배치한 정원을 남겼어.',next:'정원 탐험에 가져갈 가방도 직접 발명해 볼까?',x:80,y:48},
  {asset:'reward_workshop',name:'발명 공방',title:'우리의 탐험 가방이 완성됐어!',why:'식물의 특징을 본뜬 가방과 비교 기록을 남겼어.',next:'완성한 가방을 연구 기록에 남기자. 빛씨앗 5개가 모이면 그린코어를 깨울 수 있어!',x:85,y:13},
];
export function nextMapMission(state){return MISSIONS.findIndex((_,i)=>!missionDone(state,i)&&openMission(state,i));}
export function mapPrerequisite(state,i){return MISSIONS.findIndex((_,n)=>n<i&&!missionDone(state,n));}
// Two stamps of equal standing: both are praise, neither is a grade.
export const STAMPS={direct:{name:'스스로 찾았어',icon:'spark',desc:'기록된 첫 선택을 관찰로 확인했어.'},fixed:{name:'관찰하고 고쳤어',icon:'rotate',desc:'관찰과 시험을 보고 선택을 고쳤어. 재도전도 소중한 탐구야.'},helped:{name:'도움을 받아 찾았어',icon:'book',desc:'힌트를 활용해서 탐구했어. 세 칭찬의 가치는 같아.'},unknown:{name:'확인되지 않음',icon:'book',desc:'이전 저장에는 첫 응답과 도움 기록이 없어.'}};
export const stampBadges=(state,i)=>missionStamps(state,i).map(k=>`<span class="stamp-badge ${k}" title="${STAMPS[k].desc}">${(['direct','fixed'].includes(k)?assetImage('stamp_'+k,'stamp-img'):icon(STAMPS[k].icon,24))}<span>${STAMPS[k].name}</span></span>`).join('');
// Stamp board for ending/journal: each finished mission shows its stamp and a life connection line.
export function stampBoard(state){
  return `<ul class="stamp-board">${REWARDS.map((r,i)=>`<li><strong>${r.name}</strong> ${missionDone(state,i)?`${stampBadges(state,i)}<small class="life-link">${QUESTS[i].life}</small>`:'<small>탐구를 마치면 스탬프가 찍혀.</small>'}</li>`).join('')}</ul>`;
}
export const THEMES={pink:{name:'분홍 꽃길',color:'#df8199',heart:'#f4d36b'},yellow:{name:'노랑 꽃길',color:'#efac2c',heart:'#c2602a'},blue:{name:'하늘 꽃길',color:'#7eaec8',heart:'#f4d36b'}};

export function seedProgress(state){
  return `<div class="seed-progress" aria-label="빛씨앗 ${rewardCount(state)}개, 전체 5개"><div class="seed-dots">${MISSIONS.map((m,i)=>`<span class="seed-dot ${missionDone(state,i)?'lit':''}" title="${m.short}: ${missionDone(state,i)?'씨앗 획득':'탐구 전'}">${icon(missionDone(state,i)?'leaf':'lock',20)}</span>`).join('')}</div><strong>빛씨앗 ${rewardCount(state)} / 5</strong></div>`;
}

export function themePicker(state){
  if(!canChooseGardenTheme(state))return '';
  return `<div class="theme-picker"><span>계절 탐구 선물 · 꽃길 꾸미기</span><div>${Object.entries(THEMES).map(([id,t])=>`<button class="theme-choice ${state.gardenTheme===id?'selected':''}" data-action="garden-theme" data-id="${id}" aria-pressed="${state.gardenTheme===id}" style="--flower-color:${t.color};--flower-heart:${t.heart}"><svg class="flower-swatch" viewBox="-11 -11 22 22" aria-hidden="true">${BLOSSOM}</svg>${t.name}${state.gardenTheme===id?icon('check',15):''}</button>`).join('')}</div><small>원하는 색을 골라도 돼. 탐구 결과에는 영향을 주지 않아.</small></div>`;
}

export function worldMap(state,current=-1,recent=-1,interactive=true){
  const flowers=canChooseGardenTheme(state),theme=THEMES[state.gardenTheme]||THEMES.pink;
  const next=nextMapMission(state);
  return `<div class="island-map ${flowers?'has-flowers':''} ${state.finished?'world-awake':''}" style="--flower-color:${theme.color};--flower-heart:${theme.heart}" aria-label="${rewardCount(state)}개 장소가 깨어난 초록정원">${assetImage('map_trail_v2','island-ground',true)}
    ${REWARDS.map((r,i)=>{
      const done=missionDone(state,i),available=openMission(state,i),stamps=missionStamps(state,i),label=`${i+1}. ${r.name} ${done?'복구 완료':available?'탐구 가능':'아직 잠김'}${stamps.map(k=>' · '+STAMPS[k].name+' 스탬프').join('')}`;
      const body=`${assetImage(r.asset,'world-building')}<span class="world-label"><b>${done?icon('check',15):i+1}</b><span>${r.name}${interactive?`<small>${done?`${icon('spark',12)}복구 완료`:icon(available?'unlock':'lock',12)}</small>`:''}</span>${stamps.map(k=>`<i class="world-stamp ${k}" aria-hidden="true">${(['direct','fixed'].includes(k)?assetImage('stamp_'+k,'stamp-img'):icon(STAMPS[k].icon,24))}</i>`).join('')}</span>${done?`<span class="world-light" aria-hidden="true">${icon('spark',16)}</span>`:''}${interactive&&i===next?'<span class="world-next">여기부터!</span>':''}`;
      const position=interactive?`--stage-x:${r.x}%;--stage-y:${i===REWARDS.length-1?20:r.y}%`:`left:${r.x}%;top:${r.y}%`;
      const attrs=`class="world-node ${done?'restored':'sleeping'} ${available?'available':'locked'} ${i===next?'next-stop':''} ${current===i?'chosen':''} ${recent===i?'just-restored':''}" style="${position}"`;
      return interactive?`<button ${attrs} data-action="map-select" data-id="${i}" ${i===next?'aria-current="step"':''} ${available?'':`aria-disabled="true" data-reason="${REWARDS[mapPrerequisite(state,i)]?.name}을 깨우면 열려."`} aria-label="${label}">${body}</button>`:`<div ${attrs} role="img" aria-label="${label}">${body}</div>`;
    }).join('')}
    <div class="world-core ${rewardCount(state)===5?'charged':''}">${icon('leaf',27)}<span>${state.finished?'깨어난 정원':`${rewardCount(state)} / ${MISSIONS.length}`}</span></div>
    ${flowers?flowerTrail(state,recent):''}
  </div>`;
}

// The flower path follows the walkable trail up to the furthest restored place and spreads as more are restored.
// The stretch opened by the place just restored blooms in; the rest is already in flower.
// Drawn like the map's own wildflowers: small clumps of soft blossoms with leaves at the path edge, a few petals on the path.
const BLOSSOM=[0,72,144,216,288].map(a=>`<ellipse class="petal" rx="3.4" ry="5.2" cy="-4.6" transform="rotate(${a})"/>`).join('')+'<circle class="heart" r="1.9"/>';
const LEAF='<ellipse class="leaf" rx="2.6" ry="6.5"/>';
// Each clump: blossoms (x, y, size) and leaves (x, y, angle) around its root; three shapes so the edge never looks stamped.
const CLUMPS=[
 {b:[[0,0,1],[8,4,.8],[-6,6,.7]],l:[[3,10,20],[-9,1,-35]]},
 {b:[[0,0,.9],[-8,-2,.75]],l:[[6,6,40],[-3,9,-15],[-12,5,-50]]},
 {b:[[0,0,1.05],[7,-5,.7],[9,5,.85],[-5,7,.65]],l:[[-8,2,-30],[2,11,10]]}];
const FLOWER_STEP=40,trailTo=i=>i<0?0:i>=ENTRANCES.length-1?TRAIL_LENGTH:ENTRANCES[i].distance+60;
const r1=n=>((n*9301+49297)%233280)/233280;
function flowerTrail(state,recent){
  const last=MISSIONS.reduce((n,_,i)=>missionDone(state,i)?i:n,-1),end=trailTo(last),before=trailTo(MISSIONS.reduce((n,_,i)=>missionDone(state,i)&&i!==recent?i:n,-1));
  const band=[];for(let d=0;d<end;d+=12){const p=trailPoint(d);band.push(`${p.x.toFixed(0)},${p.y.toFixed(0)}`);}const tail=trailPoint(end);band.push(`${tail.x.toFixed(0)},${tail.y.toFixed(0)}`);
  const blooms=[],petals=[];
  for(let d=FLOWER_STEP/2,n=0;d<end;d+=FLOWER_STEP*(.8+r1(n)*.5),n++){
    const p=trailPoint(d),side=r1(n+7)<.5?1:-1,gap=24+r1(n+3)*10,x=p.x-p.dy*gap*side,y=p.y+p.dx*gap*side,c=CLUMPS[n%3],fresh=recent>=0&&d>before;
    const art=c.l.map(([lx,ly,a])=>`<g transform="translate(${lx} ${ly}) rotate(${a})">${LEAF}</g>`).join('')+c.b.map(([bx,by,k])=>`<g transform="translate(${bx} ${by}) scale(${k}) rotate(${Math.round(r1(n+bx)*72)})">${BLOSSOM}</g>`).join('');
    blooms.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(1.15+r1(n+11)*.3).toFixed(2)})"><g class="trail-flower ${fresh?'fresh':''}" style="--i:${fresh?Math.round((d-before)/FLOWER_STEP):0}">${art}</g></g>`);
    // A petal or two dropped on the path itself.
    if(r1(n+5)<.75){const q=trailPoint(d+FLOWER_STEP/2),o=(r1(n+9)-.5)*14;petals.push(`<ellipse class="fallen" rx="2.2" ry="3.4" cx="${(q.x-q.dy*o).toFixed(1)}" cy="${(q.y+q.dx*o).toFixed(1)}" transform="rotate(${Math.round(r1(n+2)*180)} ${(q.x-q.dy*o).toFixed(1)} ${(q.y+q.dx*o).toFixed(1)})"/>`);}
  }
  return `<svg class="trail-blooms" viewBox="0 0 1536 1024" aria-hidden="true"><defs><radialGradient id="petal-tint" cx=".5" cy=".85" r=".9"><stop offset="0" class="tint light"/><stop offset=".55" class="tint"/><stop offset="1" class="tint deep"/></radialGradient></defs><polyline class="bloom-band" points="${band.join(' ')}"/>${petals.join('')}${blooms.join('')}</svg>`;
}

export function evidenceSummary(state,i){
  const leaves=normalizeFieldEvidence(state.fieldEvidence).leaves,groups={...state.groupsByRule,[state.rule]:state.groups};
  const observed=Object.values(state.observation).flat().length+Object.values(leaves.scans).reduce((n,spots)=>n+spots.length,0);
  const sorted=['edge','narrow'].reduce((n,rule)=>n+Object.keys(leaves[rule]).length+Object.keys(groups[rule]||{}).length,0);
  return [
    `잎의 특징 ${observed}곳을 살피고 ${sorted}개의 분류 기록을 남겼어.`,
    `${state.seasonalRecords.length}장의 계절 기록으로 겨울과 봄을 연결했어.`,
    '공기와 물을 저장하는 특징을 세 식물의 환경과 연결했어.',
    `${Object.keys(state.garden).length}종의 식물이 네가 만든 정원에 자리 잡았어.`,
    `${new Set(state.tests.map(t=>t.key)).size}가지 설계를 실제로 시험하고 비교했어.`,
  ][i];
}
