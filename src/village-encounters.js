import {mountMapEncounters,normalizeMapHits} from './map-encounters.js';

// This copy ships with its own map so offline play needs no cross-project request.
const STAGES = [
  ["leaf", "label", "잎맥에 가장자리까지 봤어? 뒤집은 표찰이 소용없잖아!", "다음엔 모든 표찰에 ‘수상한 잎’이라고 써야지!", "앗, 내 가짜 표찰이 돌아갔어!", "잎의 특징이 다 보이잖아!", "쳇, 표본 기록은 돌려줄게!"],
  ["season", "dial", "겨울을 나는 방법을 알아냈어? 내 계절 뒤죽박죽 작전 실패야!", "다음 달력은 겨울만 열두 장이다!", "앗, 달력이 넘어갔어!", "내가 숨긴 계절 기록이 펼쳐져!", "흥, 겨울은 한 자리만 차지해도 돼!"],
  ["tag", "flag", "식물마다 사는 곳이 다르다고? 내 화분 바꿔치기 계획이 꼬였네!", "연못 팻말을 사막에 꽂으면 아무도 모르겠지?", "앗, 환경 팻말이 제자리로!", "내가 섞은 화분이 다 들통났어!", "쳇, 식물은 알맞은 곳에 돌려놓을게!"],
  ["seedling", "drop", "빛이랑 물까지 맞춰 정원을 만들었어? 나 몰래 정원사가 된 거야?", "악당 정원엔 내 이름표만 백 개 꽂을 테다!", "앗, 모종 상자가 열렸어!", "내가 가린 물길이 보이잖아!", "흥, 정원 설계도는 너희가 맡아!"],
  ["bag", "file", "식물한테 배운 발명품을 시험까지 했어? 내 엉터리 부품이 들켰네!", "다음엔 내 발명품도 시험 성적표를 속여야지!", "앗, 시험 장치가 다시 돌아!", "잘못 끼운 부품이 튀어나왔어!", "쳇, 부품은 둘게. 난 새 장난을 연구하러 간다!"],
];
const palette = '#9bd866';
const art = {
  left: new URL('../assets/combat/map-villain-left-v2.webp', import.meta.url).href,
  right: new URL('../assets/combat/map-villain-right-v2.webp', import.meta.url).href,
  frames: 6,
};
const reactions = [
  new URL('../assets/combat/map-hero-reaction-v2.webp', import.meta.url).href,
  new URL('../assets/combat/map-ally-reaction-v2.webp', import.meta.url).href,
];
const sizes = [80, 60];

export function normalizeVillageEncounters(value,legacy) {
  // Old releases stored numeric slots; retain valid previous strikes/defeats.
  const previous=Object.fromEntries(STAGES.map(([id],i)=>[id,
    Number.isInteger(legacy?.[i])&&legacy[i]>=1&&legacy[i]<=3?legacy[i]:0]));
  return {...normalizeMapHits(previous,STAGES.map(([id])=>id)),...normalizeMapHits(value,STAGES.map(([id])=>id))};
}

export function mountVillageEncounters({host,stages,progress,onSave,blocked,reduced,tone,actors,clearIndex}) {
  const points=stages.flatMap((stage,i)=>{
    if(!stage||!STAGES[i])return [];
    const [id,prop,first,again,hitOne,hitTwo,finish]=STAGES[i];
    return [{id,prop,lines:[first,again],hit:[hitOne,hitTwo],finish,speaker:"표찰 도둑",...stage}];
  });
  if(!points.some(({id})=>(progress?.[id]||0)<3))return null;
  const runtime=mountMapEncounters({requiredFoes:5,host,stages:points,progress,onSave,blocked,reduced,tone,art,palette,clearStage:()=>STAGES[clearIndex]?.[0],
    reach:95,contact:25});
  const layer=host.querySelector('.map-encounter-layer');
  const poses=reactions.map((src,i)=>{
    const el=document.createElement('span');
    el.className='map-encounter-reaction';el.hidden=true;el.setAttribute('aria-hidden','true');
    el.dataset.actor=i?'ally':'hero';
    const sheet=new Image();sheet.src=src;
    Object.assign(el.style,{position:'absolute',left:'0',top:'0',pointerEvents:'none',backgroundImage:`url("${src}")`,
      backgroundRepeat:'no-repeat',backgroundSize:`${i?400:800}% 100%`,
      filter:'drop-shadow(0 1px 1px #15232870)',zIndex:'1'});
    layer.append(el);return {el,sheet};
  });
  const setOriginal=actors.map(actor=>{
    let previous=true;
    return visible=>{
      if(!actor||visible===previous)return;previous=visible;
      if(typeof actor==='function')actor(visible);else actor.style.opacity=visible?'':'0';
    };
  });
  return {
    update(input){
      const events=runtime.update(input);
      for(const [i,key] of ['hero','ally'].entries()){
        const {el,sheet}=poses[i],state=events[key],point=state&&input[key]&&input.project(input[key]);
        const visible=Boolean(point&&state&&sheet.naturalWidth&&!blocked?.());
        setOriginal[i]?.(!visible);el.hidden=!visible;
        if(!visible){delete el.dataset.pose;continue;}
        el.dataset.pose=state.kind;
        const scale=input.scale??1,size=Math.max(29,Math.min(140,sizes[i]*scale));
        const frame=state.frame+(i===0&&state.kind==='hurt'?4:0);
        Object.assign(el.style,{width:`${size}px`,height:`${size}px`,backgroundPosition:`${frame/(i?3:7)*100}% 50%`,
          transform:`translate(${point.x+state.dx*scale-size/2}px,${point.y-size}px) scaleX(${state.direction===1?-1:1})`});
      }
    },
    destroy(){setOriginal.forEach(show=>show(true));runtime.destroy();},
  };
}
