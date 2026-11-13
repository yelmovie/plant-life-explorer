import {mountMapEncounters,normalizeMapHits} from './map-encounters.js';

// This copy ships with its own map so offline play needs no cross-project request.
const STAGES = [
  [
    "leaf",
    "label",
    "그 표찰은 어디 갔을까?",
    "나뭇잎 표찰을 뒤집어 볼까?"
  ],
  [
    "season",
    "dial",
    "계절을 뒤집어 버렸지!",
    "이번에는 겨울부터 할까?"
  ],
  [
    "tag",
    "flag",
    "여기 있어야 할 팻말은 아니야!",
    "다른 화분에 꽂아야지!"
  ],
  [
    "seedling",
    "drop",
    "이 모종은 내 거야!",
    "흙까지 몰래 가져갈래!"
  ],
  [
    "bag",
    "file",
    "이 부품은 잠깐 압수!",
    "가방 부품이 어디 있더라?"
  ]
];
const hit = ["잎이 뒤집혔어!", "화분 흙이 쏟아지겠네!"], finish = "표찰을 다시 꽂아 둘게!";
const palette = '#9bd866';
const art = {
  left: new URL('../assets/combat/map-villain-left.webp', import.meta.url).href,
  right: new URL('../assets/combat/map-villain-right.webp', import.meta.url).href,
  frames: 6,
};
const reactions = [
  new URL('../assets/combat/map-hero-reaction.webp', import.meta.url).href,
  new URL('../assets/combat/map-ally-reaction.webp', import.meta.url).href,
];
const sizes = [80, 60];

export function normalizeVillageEncounters(value,legacy) {
  // Old releases stored numeric slots; retain valid previous strikes/defeats.
  const previous=Object.fromEntries(STAGES.map(([id],i)=>[id,
    Number.isInteger(legacy?.[i])&&legacy[i]>=1&&legacy[i]<=3?legacy[i]:0]));
  return {...normalizeMapHits(previous,STAGES.map(([id])=>id)),...normalizeMapHits(value,STAGES.map(([id])=>id))};
}

export function mountVillageEncounters({host,stages,progress,onSave,blocked,reduced,tone,actors}) {
  const points=stages.flatMap((stage,i)=>{
    if(!stage||!STAGES[i])return [];
    const [id,prop,first,again]=STAGES[i];
    return [{id,prop,lines:[first,again],hit,finish,...stage}];
  });
  if(!points.some(({id})=>(progress?.[id]||0)<3))return null;
  const runtime=mountMapEncounters({host,stages:points,progress,onSave,blocked,reduced,tone,art,palette,
    reach:95,contact:25});
  const layer=host.querySelector('.map-encounter-layer');
  const poses=reactions.map((src,i)=>{
    const el=document.createElement('span');
    el.className='map-encounter-reaction';el.hidden=true;el.setAttribute('aria-hidden','true');
    Object.assign(el.style,{position:'absolute',left:'0',top:'0',pointerEvents:'none',backgroundImage:`url("${src}")`,
      backgroundRepeat:'no-repeat',backgroundSize:`${i?400:800}% 100%`,
      filter:'drop-shadow(0 1px 1px #15232870)',zIndex:'1'});
    layer.append(el);return el;
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
        const el=poses[i],state=events[key],point=state&&input[key]&&input.project(input[key]);
        const visible=Boolean(point&&state&&!blocked?.());
        setOriginal[i]?.(!visible);el.hidden=!visible;
        if(!visible)continue;
        const scale=input.scale??1,size=Math.max(29,Math.min(140,sizes[i]*scale));
        const frame=state.frame+(i===0&&state.kind==='hurt'?4:0);
        Object.assign(el.style,{width:`${size}px`,height:`${size}px`,backgroundPosition:`${frame/(i?3:7)*100}% 50%`,
          transform:`translate(${point.x+state.dx*scale-size/2}px,${point.y-size}px) scaleX(${state.direction===1?-1:1})`});
      }
    },
    destroy(){setOriginal.forEach(show=>show(true));runtime.destroy();},
  };
}
