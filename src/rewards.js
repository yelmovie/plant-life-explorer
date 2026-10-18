import {MISSIONS,missionDone,openMission,rewardCount,canChooseGardenTheme} from './model.js';
import {assetImage} from './asset-catalog.js';
import {icon} from './art.js';

export const REWARDS = [
  {asset:'reward_observatory',name:'표본 온실',title:'표본 온실에 불이 켜졌어!',why:'잎을 관찰하고 분류한 덕분에 표본들이 제자리를 찾았어.',next:'다음에는 겨울을 지낸 식물의 비밀을 찾자.',x:14,y:76},
  {asset:'reward_seasons',name:'계절 꽃돔',title:'계절 꽃돔이 다시 피어났어!',why:'겨울과 다음 봄의 기록을 이어 주니 꽃돔이 다시 살아났어.',next:'꽃길 색도 골라 봐. 다음은 식물이 사는 환경을 알아볼 차례야.',x:25,y:46},
  {asset:'reward_water',name:'물길 실험실',title:'연못에 맑은 물이 돌아왔어!',why:'잎자루 속 공기와 두꺼운 잎의 특징을 찾아 실험실을 고쳤어.',next:'이제 배운 특징을 이용해서 네 정원을 만들어 보자.',x:49,y:27},
  {asset:'reward_garden',name:'나의 연구정원',title:'네가 만든 정원이 생겼어!',why:'물가·풀밭·건조 구역에 식물들이 알맞은 집을 찾았어.',next:'정원 탐험에 가져갈 가방도 직접 발명해 볼까?',x:80,y:48},
  {asset:'reward_workshop',name:'발명 공방',title:'우리의 탐험 가방이 완성됐어!',why:'시험 결과를 보고 고쳐서 부품 하나를 바꾸어 하는 일을 알아냈어.',next:'완성한 가방을 연구 기록에 남기자. 빛씨앗 5개가 모이면 그린코어를 깨울 수 있어!',x:85,y:13},
];
export const THEMES={pink:{name:'분홍 꽃길',color:'#df8199'},yellow:{name:'노랑 꽃길',color:'#e3b746'},blue:{name:'하늘 꽃길',color:'#7eaec8'}};

export function seedProgress(state){
  return `<div class="seed-progress" aria-label="빛씨앗 ${rewardCount(state)}개, 전체 5개"><div class="seed-dots">${MISSIONS.map((m,i)=>`<span class="seed-dot ${missionDone(state,i)?'lit':''}" title="${m.short}: ${missionDone(state,i)?'씨앗 획득':'탐구 전'}">${icon(missionDone(state,i)?'leaf':'lock',20)}</span>`).join('')}</div><strong>빛씨앗 ${rewardCount(state)} / 5</strong></div>`;
}

export function themePicker(state){
  if(!canChooseGardenTheme(state))return '';
  return `<div class="theme-picker"><span>계절 탐구 선물 · 꽃길 꾸미기</span><div>${Object.entries(THEMES).map(([id,t])=>`<button class="theme-choice ${state.gardenTheme===id?'selected':''}" data-action="garden-theme" data-id="${id}" aria-pressed="${state.gardenTheme===id}" style="--flower-color:${t.color}"><span class="flower-swatch" aria-hidden="true">✿</span>${t.name}${state.gardenTheme===id?icon('check',15):''}</button>`).join('')}</div><small>원하는 색을 골라도 돼. 탐구 결과에는 영향을 주지 않아.</small></div>`;
}

export function worldMap(state,current=-1,recent=-1,interactive=true){
  const flowers=canChooseGardenTheme(state),theme=THEMES[state.gardenTheme]||THEMES.pink;
  return `<div class="island-map ${flowers?'has-flowers':''} ${state.finished?'world-awake':''}" style="--flower-color:${theme.color}" aria-label="${rewardCount(state)}개 장소가 깨어난 초록정원">${assetImage('map_trail_v2','island-ground',true)}
    ${REWARDS.map((r,i)=>{
      const done=missionDone(state,i),available=openMission(state,i),label=`${i+1}. ${r.name} ${done?'복구 완료':available?'탐구 가능':'아직 잠김'}`;
      const body=`${assetImage(r.asset,'world-building')}<span class="world-label"><b>${done?icon('check',15):available?i+1:icon('lock',14)}</b>${r.name}</span>${done?'<span class="world-light" aria-hidden="true">✦</span>':''}`;
      const attrs=`class="world-node ${done?'restored':'sleeping'} ${current===i?'chosen':''} ${recent===i?'just-restored':''}" style="left:${r.x}%;top:${r.y}%"`;
      return interactive?`<button ${attrs} data-action="map-select" data-id="${i}" ${available?'':'disabled'} aria-label="${label}">${body}</button>`:`<div ${attrs} role="img" aria-label="${label}">${body}</div>`;
    }).join('')}
    ${interactive?`<div class="map-explorer" style="left:${REWARDS[Math.min(4,rewardCount(state))].x-8}%;top:${REWARDS[Math.min(4,rewardCount(state))].y+4}%">${assetImage('mascot_leaf')}<span>여기로 가자!</span></div>`:''}<div class="world-core ${rewardCount(state)===5?'charged':''}">${icon('leaf',27)}<span>${state.finished?'깨어난 정원':`${rewardCount(state)} / 5`}</span></div>
    ${flowers?`<div class="world-flowers" aria-hidden="true">${[[12,57],[18,66],[39,88],[48,83],[85,61],[71,22],[34,21],[54,87]].map(([x,y],i)=>`<span style="left:${x}%;top:${y}%;transform:rotate(${i*23}deg)">✿</span>`).join('')}</div>`:''}
  </div>`;
}

export function evidenceSummary(state,i){
  return [
    `${Object.values(state.observation).flat().length}가지 잎의 특징을 찾았어.`,
    `${state.seasonalRecords.length}장의 계절 기록으로 겨울과 봄을 연결했어.`,
    '공기와 물을 저장하는 특징을 세 식물의 환경과 연결했어.',
    `${Object.keys(state.garden).length}종의 식물이 네가 만든 정원에 자리 잡았어.`,
    `${new Set(state.tests.map(t=>t.key)).size}가지 설계를 실제로 시험하고 비교했어.`,
  ][i];
}
