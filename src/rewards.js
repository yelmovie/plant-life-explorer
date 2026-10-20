import {MISSIONS,missionDone,openMission,rewardCount,canChooseGardenTheme,missionStamps} from './model.js';
import {QUESTS} from './inquiry.js';
import {assetImage} from './asset-catalog.js';
import {icon} from './art.js';

export const REWARDS = [
  {asset:'reward_observatory',name:'표본 온실',title:'표본 온실에 불이 켜졌어!',why:'이제 나는 잎의 생김새로 식물을 나눌 수 있어.',next:'다음에는 겨울을 지낸 식물의 비밀을 찾자.',x:14,y:76},
  {asset:'reward_seasons',name:'계절 꽃돔',title:'계절 꽃돔이 다시 피어났어!',why:'이제 나는 겨울을 지낸 식물이 봄에 다시 자라는 모습을 설명할 수 있어.',next:'꽃길 색도 골라 봐. 다음은 식물이 사는 환경을 알아볼 차례야.',x:25,y:46},
  {asset:'reward_water',name:'물길 실험실',title:'연못에 맑은 물이 돌아왔어!',why:'이제 나는 식물의 특징과 사는 곳을 이어서 설명할 수 있어.',next:'이제 배운 특징을 이용해서 네 정원을 만들어 보자.',x:49,y:27},
  {asset:'reward_garden',name:'나의 연구정원',title:'네가 만든 정원이 생겼어!',why:'이제 나는 식물이 사는 환경에 맞게 정원을 꾸밀 수 있어.',next:'정원 탐험에 가져갈 가방도 직접 발명해 볼까?',x:80,y:48},
  {asset:'reward_workshop',name:'발명 공방',title:'우리의 탐험 가방이 완성됐어!',why:'이제 나는 식물의 특징을 본떠 물건을 만들고 시험할 수 있어.',next:'완성한 가방을 연구 기록에 남기자. 빛씨앗 5개가 모이면 그린코어를 깨울 수 있어!',x:85,y:13},
];
export function nextMapMission(state){return MISSIONS.findIndex((_,i)=>!missionDone(state,i)&&openMission(state,i));}
export function mapPrerequisite(state,i){return MISSIONS.findIndex((_,n)=>n<i&&!missionDone(state,n));}
// Two stamps of equal standing: both are praise, neither is a grade.
export const STAMPS={direct:{name:'한 번에 찾았어',icon:'spark',desc:'근거를 보고 바로 찾았어.'},fixed:{name:'고쳐서 찾았어',icon:'rotate',desc:'헛다리를 단서 삼아 스스로 고쳤어.'}};
export const stampBadges=(state,i)=>missionStamps(state,i).map(k=>`<span class="stamp-badge ${k}" title="${STAMPS[k].desc}">${assetImage('stamp_'+k,'stamp-img')}<span>${STAMPS[k].name}</span></span>`).join('');
// Stamp board for ending/journal: each finished mission shows its stamp and a life connection line.
export function stampBoard(state){
  return `<ul class="stamp-board">${REWARDS.map((r,i)=>`<li><strong>${r.name}</strong> ${missionDone(state,i)?`${stampBadges(state,i)}<small class="life-link">${QUESTS[i].life}</small>`:'<small>탐구를 마치면 스탬프가 찍혀.</small>'}</li>`).join('')}</ul>`;
}
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
  const next=nextMapMission(state);
  return `<div class="island-map ${flowers?'has-flowers':''} ${state.finished?'world-awake':''}" style="--flower-color:${theme.color}" aria-label="${rewardCount(state)}개 장소가 깨어난 초록정원">${assetImage('map_trail_v2','island-ground',true)}
    ${REWARDS.map((r,i)=>{
      const done=missionDone(state,i),available=openMission(state,i),stamps=missionStamps(state,i),label=`${i+1}. ${r.name} ${done?'복구 완료':available?'탐구 가능':'아직 잠김'}${stamps.map(k=>' · '+STAMPS[k].name+' 스탬프').join('')}`;
      const body=`${assetImage(r.asset,'world-building')}<span class="world-label"><b>${done?icon('check',15):i+1}</b><span>${r.name}${interactive?`<small>${done?'탐구 완료':!available?icon('lock',12)+' 잠겨 있어':state.adminUnlocked?'미리보기':i===next?'다음 탐구':'다시 탐구'}</small>`:''}</span>${stamps.map(k=>`<i class="world-stamp ${k}" aria-hidden="true">${assetImage('stamp_'+k,'stamp-img')}</i>`).join('')}</span>${done?`<span class="world-light" aria-hidden="true">${icon('spark',16)}</span>`:''}${interactive&&i===next?'<span class="world-next">여기부터!</span>':''}`;
      const position=interactive?`--stage-x:${r.x}%;--stage-y:${i===REWARDS.length-1?20:r.y}%`:`left:${r.x}%;top:${r.y}%`;
      const attrs=`class="world-node ${done?'restored':'sleeping'} ${available?'available':'locked'} ${i===next?'next-stop':''} ${current===i?'chosen':''} ${recent===i?'just-restored':''}" style="${position}"`;
      return interactive?`<button ${attrs} data-action="map-select" data-id="${i}" ${i===next?'aria-current="step"':''} ${available?'':`aria-disabled="true" data-reason="${REWARDS[mapPrerequisite(state,i)]?.name}을 깨우면 열려."`} aria-label="${label}">${body}</button>`:`<div ${attrs} role="img" aria-label="${label}">${body}</div>`;
    }).join('')}
    <div class="world-core ${rewardCount(state)===5?'charged':''}">${icon('leaf',27)}<span>${state.finished?'깨어난 정원':`${rewardCount(state)} / ${MISSIONS.length}`}</span></div>
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
